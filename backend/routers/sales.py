from typing import List

from fastapi import APIRouter, HTTPException

from backend.db import get_connection
from backend.domain import get_commission_pct, get_single_active_owner, resolve_side
from backend.schemas import SaleCreate, SaleOut
from backend.splits import calculate_split

router = APIRouter(prefix="/api/sales", tags=["sales"])


def _row_to_sale(row) -> dict:
    data = dict(row)
    return {
        "id": data["id"],
        "item_id": data["item_id"],
        "sku": data["sku"],
        "sale_price": data["sale_price"],
        "sale_date": data["sale_date"],
        "split": {
            "owner_a": data["owner_a_amount"],
            "owner_b": data["owner_b_amount"],
            "supplier": data["supplier_amount"],
        },
    }


SALE_SELECT = """
    SELECT sales.id, sales.item_id, sales.sale_price, sales.sale_date,
           items.sku,
           splits.owner_a_amount, splits.owner_b_amount, splits.supplier_amount
    FROM sales
    JOIN items ON items.id = sales.item_id
    JOIN splits ON splits.sale_id = sales.id
"""


@router.post("", response_model=SaleOut)
def create_sale(payload: SaleCreate):
    if payload.sale_price <= 0:
        raise HTTPException(400, "o preço de venda deve ser maior que zero")

    conn = get_connection()
    try:
        item = conn.execute("SELECT * FROM items WHERE id = ?", (payload.item_id,)).fetchone()
        if item is None:
            raise HTTPException(404, "peça não encontrada")
        if item["status"] != "in_stock":
            raise HTTPException(400, "esta peça não está disponível para venda")

        side = resolve_side(conn, item["owner_id"], item["supplier_id"])
        commission_pct = get_commission_pct(conn, item)
        single_owner = get_single_active_owner(conn)
        split = calculate_split(
            side=side, sale_price=payload.sale_price, commission_pct=commission_pct, single_owner=single_owner
        )

        cur = conn.execute(
            "INSERT INTO sales (item_id, sale_price) VALUES (?, ?)",
            (payload.item_id, payload.sale_price),
        )
        sale_id = cur.lastrowid
        conn.execute(
            """
            INSERT INTO splits (sale_id, owner_a_amount, owner_b_amount, supplier_id, supplier_amount)
            VALUES (?, ?, ?, ?, ?)
            """,
            (sale_id, split["owner_a"], split["owner_b"], item["supplier_id"], split["supplier"]),
        )
        conn.execute("UPDATE items SET status = 'sold' WHERE id = ?", (payload.item_id,))
        conn.commit()

        row = conn.execute(SALE_SELECT + " WHERE sales.id = ?", (sale_id,)).fetchone()
        return _row_to_sale(row)
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
