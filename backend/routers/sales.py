from typing import List, Optional

from fastapi import APIRouter, HTTPException

from backend.db import get_connection
from backend.domain import get_commission_pct, get_single_active_owner, resolve_side
from backend.money import to_cents
from backend.queries import SALE_SELECT, _payments_by_receipt, _row_to_sale
from backend.schemas import CheckoutCreate, SaleOut
from backend.splits import calculate_split

router = APIRouter(prefix="/api/sales", tags=["sales"])


@router.post("", response_model=List[SaleOut])
def checkout(payload: CheckoutCreate):
    if not payload.items:
        raise HTTPException(400, "informe ao menos uma peça")
    for entry in payload.items:
        if entry.sale_price <= 0:
            raise HTTPException(400, "o preço de venda deve ser maior que zero")

    if not payload.payments:
        raise HTTPException(400, "informe ao menos uma forma de pagamento")
    for payment in payload.payments:
        if payment.amount <= 0:
            raise HTTPException(400, "o valor de cada pagamento deve ser maior que zero")
    # Compared in cents, not the >0.01 float tolerance this used to need — AUDIT.md §0.1.
    items_total_cents = sum(to_cents(entry.sale_price) for entry in payload.items)
    payments_total_cents = sum(to_cents(payment.amount) for payment in payload.payments)
    if items_total_cents != payments_total_cents:
        raise HTTPException(400, "a soma das formas de pagamento deve ser igual ao total da venda")

    conn = get_connection()
    try:
        seller = conn.execute("SELECT id FROM owners WHERE id = ?", (payload.sold_by_owner_id,)).fetchone()
        if seller is None:
            raise HTTPException(400, "proprietária que registrou a venda não encontrada")

        receipt_cur = conn.execute(
            "INSERT INTO receipts (sold_by_owner_id) VALUES (?)",
            (payload.sold_by_owner_id,),
        )
        receipt_id = receipt_cur.lastrowid
        for payment in payload.payments:
            conn.execute(
                "INSERT INTO receipt_payments (receipt_id, payment_method, amount) VALUES (?, ?, ?)",
                (receipt_id, payment.payment_method, to_cents(payment.amount)),
            )

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
            sale_cents = to_cents(entry.sale_price)
            split = calculate_split(
                side=side, sale_cents=sale_cents, commission_pct=commission_pct, single_owner=single_owner
            )

            cur = conn.execute(
                """
                INSERT INTO sales (item_id, sale_price, catalog_price, discount_reason, receipt_id)
                VALUES (?, ?, ?, ?, ?)
                """,
                (entry.item_id, sale_cents, item["price"], entry.discount_reason, receipt_id),
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
        payments_by_receipt = _payments_by_receipt(conn, (r["receipt_id"] for r in rows_by_id.values()))
        return [_row_to_sale(rows_by_id[sid], payments_by_receipt) for sid in sale_ids]
    finally:
        conn.close()


@router.get("", response_model=List[SaleOut])
def list_sales(start_date: Optional[str] = None, end_date: Optional[str] = None):
    conn = get_connection()
    try:
        clauses = []
        params: list = []
        if start_date:
            clauses.append("date(sales.sale_date) >= date(?)")
            params.append(start_date)
        if end_date:
            clauses.append("date(sales.sale_date) <= date(?)")
            params.append(end_date)
        where = f"WHERE {' AND '.join(clauses)}" if clauses else ""

        rows = conn.execute(SALE_SELECT + f" {where} ORDER BY sales.sale_date DESC", params).fetchall()
        payments_by_receipt = _payments_by_receipt(conn, (r["receipt_id"] for r in rows))
        return [_row_to_sale(r, payments_by_receipt) for r in rows]
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

        # AUDIT.md §1.4: reports filter voided_at IS NULL, so a paid split on a voided
        # sale would simply vanish from every total instead of appearing as something to
        # reconcile. Conservative fix: block the void until the payout is unmarked —
        # reversible via the existing mark-unpaid endpoints, no clawback flow needed.
        split = conn.execute("SELECT * FROM splits WHERE sale_id = ?", (sale_id,)).fetchone()
        if split and (split["paid_at"] or split["owner_a_paid_at"] or split["owner_b_paid_at"]):
            raise HTTPException(
                400, "esta venda tem repasse já pago — desmarque o pagamento antes de estornar"
            )

        conn.execute("UPDATE sales SET voided_at = CURRENT_TIMESTAMP WHERE id = ?", (sale_id,))
        conn.execute("UPDATE items SET status = 'in_stock' WHERE id = ?", (sale["item_id"],))
        conn.commit()

        row = conn.execute(SALE_SELECT + " WHERE sales.id = ?", (sale_id,)).fetchone()
        payments_by_receipt = _payments_by_receipt(conn, [row["receipt_id"]])
        return _row_to_sale(row, payments_by_receipt)
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
        payments_by_receipt = _payments_by_receipt(conn, [row["receipt_id"]])
        return _row_to_sale(row, payments_by_receipt)
    finally:
        conn.close()


@router.post("/{sale_id}/payout/mark-paid", response_model=SaleOut)
def mark_payout_paid(sale_id: int):
    return _set_payout_paid(sale_id, True)


@router.post("/{sale_id}/payout/mark-unpaid", response_model=SaleOut)
def mark_payout_unpaid(sale_id: int):
    return _set_payout_paid(sale_id, False)


def _set_owner_payout_paid(sale_id: int, side: str, paid: bool) -> dict:
    conn = get_connection()
    try:
        split = conn.execute("SELECT * FROM splits WHERE sale_id = ?", (sale_id,)).fetchone()
        if split is None:
            raise HTTPException(404, "venda não encontrada")
        if split[f"owner_{side}_amount"] <= 0:
            raise HTTPException(400, "esta venda não tem valor a repassar para essa dona")

        if paid:
            conn.execute(f"UPDATE splits SET owner_{side}_paid_at = CURRENT_TIMESTAMP WHERE sale_id = ?", (sale_id,))
        else:
            conn.execute(f"UPDATE splits SET owner_{side}_paid_at = NULL WHERE sale_id = ?", (sale_id,))
        conn.commit()

        row = conn.execute(SALE_SELECT + " WHERE sales.id = ?", (sale_id,)).fetchone()
        payments_by_receipt = _payments_by_receipt(conn, [row["receipt_id"]])
        return _row_to_sale(row, payments_by_receipt)
    finally:
        conn.close()


@router.post("/{sale_id}/owner-payout/{side}/mark-paid", response_model=SaleOut)
def mark_owner_payout_paid(sale_id: int, side: str):
    if side not in ("a", "b"):
        raise HTTPException(400, "lado inválido")
    return _set_owner_payout_paid(sale_id, side, True)


@router.post("/{sale_id}/owner-payout/{side}/mark-unpaid", response_model=SaleOut)
def mark_owner_payout_unpaid(sale_id: int, side: str):
    if side not in ("a", "b"):
        raise HTTPException(400, "lado inválido")
    return _set_owner_payout_paid(sale_id, side, False)
