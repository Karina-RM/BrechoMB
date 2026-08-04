from datetime import datetime
from typing import List

from fastapi import APIRouter, HTTPException

from backend.db import get_connection
from backend.schemas import SupplierCreate, SupplierDetailOut, SupplierOut, SupplierUpdate

router = APIRouter(prefix="/api/suppliers", tags=["suppliers"])


def _validate_commission(pct: float) -> None:
    if pct < 0 or pct > 100:
        raise HTTPException(400, "a comissão deve estar entre 0 e 100")


@router.get("", response_model=List[SupplierOut])
def list_suppliers():
    conn = get_connection()
    try:
        rows = conn.execute("SELECT * FROM suppliers ORDER BY name").fetchall()
        return [dict(r) for r in rows]
    finally:
        conn.close()


@router.post("", response_model=SupplierOut)
def create_supplier(payload: SupplierCreate):
    _validate_commission(payload.commission_pct)
    conn = get_connection()
    try:
        owner = conn.execute("SELECT id FROM owners WHERE id = ?", (payload.owner_id,)).fetchone()
        if owner is None:
            raise HTTPException(400, f"proprietária {payload.owner_id} não encontrada")

        cur = conn.execute(
            "INSERT INTO suppliers (name, owner_id, commission_pct) VALUES (?, ?, ?)",
            (payload.name, payload.owner_id, payload.commission_pct),
        )
        conn.commit()
        row = conn.execute("SELECT * FROM suppliers WHERE id = ?", (cur.lastrowid,)).fetchone()
        return dict(row)
    finally:
        conn.close()


@router.patch("/{supplier_id}", response_model=SupplierOut)
def update_supplier(supplier_id: int, payload: SupplierUpdate):
    conn = get_connection()
    try:
        row = conn.execute("SELECT * FROM suppliers WHERE id = ?", (supplier_id,)).fetchone()
        if row is None:
            raise HTTPException(404, "fornecedora não encontrada")

        updates = payload.model_dump(exclude_unset=True)
        if "commission_pct" in updates:
            _validate_commission(updates["commission_pct"])

        if updates:
            set_clause = ", ".join(f"{k} = ?" for k in updates)
            conn.execute(
                f"UPDATE suppliers SET {set_clause} WHERE id = ?",
                (*updates.values(), supplier_id),
            )
            conn.commit()
            row = conn.execute("SELECT * FROM suppliers WHERE id = ?", (supplier_id,)).fetchone()
        return dict(row)
    finally:
        conn.close()


@router.get("/{supplier_id}", response_model=SupplierDetailOut)
def get_supplier(supplier_id: int):
    conn = get_connection()
    try:
        supplier = conn.execute("SELECT * FROM suppliers WHERE id = ?", (supplier_id,)).fetchone()
        if supplier is None:
            raise HTTPException(404, "fornecedora não encontrada")

        items = conn.execute(
            """
            SELECT id, sku, category, price, status, intake_date
            FROM items WHERE supplier_id = ? ORDER BY intake_date DESC
            """,
            (supplier_id,),
        ).fetchall()

        payout_rows = conn.execute(
            """
            SELECT sales.id AS sale_id, items.sku, sales.sale_date, sales.sale_price,
                   splits.supplier_amount, splits.paid_at
            FROM splits
            JOIN sales ON sales.id = splits.sale_id
            JOIN items ON items.id = sales.item_id
            WHERE splits.supplier_id = ? AND sales.voided_at IS NULL
            ORDER BY sales.sale_date DESC
            """,
            (supplier_id,),
        ).fetchall()
        total_owed = round(sum(r["supplier_amount"] for r in payout_rows if r["paid_at"] is None), 2)
        total_paid = round(sum(r["supplier_amount"] for r in payout_rows if r["paid_at"] is not None), 2)

        withdrawal_rows = conn.execute(
            """
            SELECT items.sku, items.intake_date, withdrawals.withdrawn_date
            FROM withdrawals
            JOIN items ON items.id = withdrawals.item_id
            WHERE items.supplier_id = ?
            ORDER BY withdrawals.withdrawn_date DESC
            """,
            (supplier_id,),
        ).fetchall()
        withdrawals = [
            {
                "sku": r["sku"],
                "intake_date": r["intake_date"],
                "withdrawn_date": r["withdrawn_date"],
                "days_in_store": (
                    datetime.fromisoformat(r["withdrawn_date"]) - datetime.fromisoformat(r["intake_date"])
                ).days,
            }
            for r in withdrawal_rows
        ]

        return {
            "id": supplier["id"],
            "name": supplier["name"],
            "owner_id": supplier["owner_id"],
            "commission_pct": supplier["commission_pct"],
            "items": [dict(r) for r in items],
            "total_owed": total_owed,
            "total_paid": total_paid,
            "payout_sales": [dict(r) for r in payout_rows],
            "withdrawals": withdrawals,
        }
    finally:
        conn.close()


@router.post("/{supplier_id}/payouts", response_model=SupplierDetailOut)
def register_payout(supplier_id: int):
    conn = get_connection()
    try:
        supplier = conn.execute("SELECT * FROM suppliers WHERE id = ?", (supplier_id,)).fetchone()
        if supplier is None:
            raise HTTPException(404, "fornecedora não encontrada")

        conn.execute(
            """
            UPDATE splits SET paid_at = CURRENT_TIMESTAMP
            WHERE supplier_id = ? AND paid_at IS NULL
              AND sale_id IN (SELECT id FROM sales WHERE voided_at IS NULL)
            """,
            (supplier_id,),
        )
        conn.commit()
    finally:
        conn.close()
    return get_supplier(supplier_id)
