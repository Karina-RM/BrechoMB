from typing import List

from fastapi import APIRouter, HTTPException

from backend.db import get_connection
from backend.domain import get_commission_pct, get_single_active_owner, resolve_side
from backend.schemas import CheckoutCreate, SaleOut
from backend.splits import calculate_split

router = APIRouter(prefix="/api/sales", tags=["sales"])


def _row_to_sale(row) -> dict:
    data = dict(row)
    return {
        "id": data["id"],
        "item_id": data["item_id"],
        "sku": data["sku"],
        "sale_price": data["sale_price"],
        "catalog_price": data["catalog_price"],
        "discount_reason": data["discount_reason"],
        "receipt_id": data["receipt_id"],
        "payment_method": data["payment_method"],
        "sold_by_owner_name": data["sold_by_owner_name"],
        "sale_date": data["sale_date"],
        "voided_at": data["voided_at"],
        "split": {
            "owner_a": data["owner_a_amount"],
            "owner_b": data["owner_b_amount"],
            "supplier": data["supplier_amount"],
        },
    }


SALE_SELECT = """
    SELECT sales.id, sales.item_id, sales.sale_price, sales.catalog_price, sales.discount_reason,
           sales.receipt_id, sales.sale_date, sales.voided_at,
           items.sku,
           receipts.payment_method,
           sold_by.name AS sold_by_owner_name,
           splits.owner_a_amount, splits.owner_b_amount, splits.supplier_amount
    FROM sales
    JOIN items ON items.id = sales.item_id
    JOIN splits ON splits.sale_id = sales.id
    JOIN receipts ON receipts.id = sales.receipt_id
    LEFT JOIN owners AS sold_by ON sold_by.id = receipts.sold_by_owner_id
"""


@router.post("", response_model=List[SaleOut])
def checkout(payload: CheckoutCreate):
    if not payload.items:
        raise HTTPException(400, "informe ao menos uma peça")
    for entry in payload.items:
        if entry.sale_price <= 0:
            raise HTTPException(400, "o preço de venda deve ser maior que zero")

    conn = get_connection()
    try:
        seller = conn.execute("SELECT id FROM owners WHERE id = ?", (payload.sold_by_owner_id,)).fetchone()
        if seller is None:
            raise HTTPException(400, "proprietária que registrou a venda não encontrada")

        receipt_cur = conn.execute(
            "INSERT INTO receipts (payment_method, sold_by_owner_id) VALUES (?, ?)",
            (payload.payment_method, payload.sold_by_owner_id),
        )
        receipt_id = receipt_cur.lastrowid

        sale_ids = []
        for entry in payload.items:
            item = conn.execute("SELECT * FROM items WHERE id = ?", (entry.item_id,)).fetchone()
            if item is None:
                raise HTTPException(404, f"peça {entry.item_id} não encontrada")

            # Claim the item atomically. A plain read-then-write leaves a window where two
            # near-simultaneous sales can both see status='in_stock' and both proceed;
            # SQLite serializes writers, so this UPDATE...WHERE only ever succeeds once —
            # and since nothing commits until every item in the cart has claimed
            # successfully, one unavailable item rolls back the whole checkout.
            claim = conn.execute(
                "UPDATE items SET status = 'sold' WHERE id = ? AND status = 'in_stock'",
                (entry.item_id,),
            )
            if claim.rowcount == 0:
                raise HTTPException(400, f"a peça {item['sku']} não está disponível para venda")

            side = resolve_side(conn, item["owner_id"], item["supplier_id"])
            commission_pct = get_commission_pct(conn, item)
            single_owner = get_single_active_owner(conn)
            split = calculate_split(
                side=side, sale_price=entry.sale_price, commission_pct=commission_pct, single_owner=single_owner
            )

            cur = conn.execute(
                """
                INSERT INTO sales (item_id, sale_price, catalog_price, discount_reason, receipt_id)
                VALUES (?, ?, ?, ?, ?)
                """,
                (entry.item_id, entry.sale_price, item["price"], entry.discount_reason, receipt_id),
            )
            sale_id = cur.lastrowid
            conn.execute(
                """
                INSERT INTO splits (sale_id, owner_a_amount, owner_b_amount, supplier_id, supplier_amount)
                VALUES (?, ?, ?, ?, ?)
                """,
                (sale_id, split["owner_a"], split["owner_b"], item["supplier_id"], split["supplier"]),
            )
            sale_ids.append(sale_id)

        conn.commit()

        rows_by_id = {
            r["id"]: r
            for r in conn.execute(
                SALE_SELECT + f" WHERE sales.id IN ({','.join('?' * len(sale_ids))})", sale_ids
            ).fetchall()
        }
        return [_row_to_sale(rows_by_id[sid]) for sid in sale_ids]
    finally:
        conn.close()


@router.get("", response_model=List[SaleOut])
def list_sales():
    conn = get_connection()
    try:
        rows = conn.execute(SALE_SELECT + " ORDER BY sales.sale_date DESC").fetchall()
        return [_row_to_sale(r) for r in rows]
    finally:
        conn.close()


@router.post("/{sale_id}/void", response_model=SaleOut)
def void_sale(sale_id: int):
    conn = get_connection()
    try:
        sale = conn.execute("SELECT * FROM sales WHERE id = ?", (sale_id,)).fetchone()
        if sale is None:
            raise HTTPException(404, "venda não encontrada")
        if sale["voided_at"] is not None:
            raise HTTPException(400, "esta venda já foi estornada")

        conn.execute("UPDATE sales SET voided_at = CURRENT_TIMESTAMP WHERE id = ?", (sale_id,))
        conn.execute("UPDATE items SET status = 'in_stock' WHERE id = ?", (sale["item_id"],))
        conn.commit()

        row = conn.execute(SALE_SELECT + " WHERE sales.id = ?", (sale_id,)).fetchone()
        return _row_to_sale(row)
    finally:
        conn.close()


def _set_payout_paid(sale_id: int, paid: bool) -> dict:
    conn = get_connection()
    try:
        split = conn.execute("SELECT * FROM splits WHERE sale_id = ?", (sale_id,)).fetchone()
        if split is None:
            raise HTTPException(404, "venda não encontrada")
        if split["supplier_id"] is None:
            raise HTTPException(400, "esta venda não é de uma peça de fornecedora")

        if paid:
            conn.execute("UPDATE splits SET paid_at = CURRENT_TIMESTAMP WHERE sale_id = ?", (sale_id,))
        else:
            conn.execute("UPDATE splits SET paid_at = NULL WHERE sale_id = ?", (sale_id,))
        conn.commit()

        row = conn.execute(SALE_SELECT + " WHERE sales.id = ?", (sale_id,)).fetchone()
        return _row_to_sale(row)
    finally:
        conn.close()


@router.post("/{sale_id}/payout/mark-paid", response_model=SaleOut)
def mark_payout_paid(sale_id: int):
    return _set_payout_paid(sale_id, True)


@router.post("/{sale_id}/payout/mark-unpaid", response_model=SaleOut)
def mark_payout_unpaid(sale_id: int):
    return _set_payout_paid(sale_id, False)
