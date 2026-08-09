from datetime import datetime
from typing import List

from fastapi import APIRouter, HTTPException

from backend.db import get_connection
from backend.money import to_reais
from backend.schemas import PayoutRequest, SupplierCreate, SupplierDetailOut, SupplierOut, SupplierUpdate

router = APIRouter(prefix="/api/suppliers", tags=["suppliers"])

# roadmap.md §7 / AUDIT.md §3.4c — user-confirmed rule: a piece is "bad" if it isn't
# sold within a week of intake. Reliability is the % of a supplier's judged pieces
# (sold, withdrawn unsold, or still unsold past the window) that sold within it —
# pieces still in stock inside the window aren't judged yet either way.
RELIABILITY_WINDOW_DAYS = 7


def _validate_commission(pct: float) -> None:
    if pct < 0 or pct > 100:
        raise HTTPException(400, "a comissão deve estar entre 0 e 100")


def _supplier_reliability(conn, supplier_id: int) -> dict:
    rows = conn.execute(
        """
        SELECT items.intake_date, sales.sale_date, withdrawals.withdrawn_date
        FROM items
        LEFT JOIN sales ON sales.item_id = items.id AND sales.voided_at IS NULL
        LEFT JOIN withdrawals ON withdrawals.item_id = items.id
        WHERE items.supplier_id = ? AND items.status != 'deleted'
        """,
        (supplier_id,),
    ).fetchall()

    now = datetime.now()
    sold_within_window = sold_late = withdrawn_unsold = pending_overdue = 0
    for row in rows:
        intake = datetime.fromisoformat(row["intake_date"])
        if row["sale_date"]:
            days_to_sale = (datetime.fromisoformat(row["sale_date"]) - intake).days
            if days_to_sale <= RELIABILITY_WINDOW_DAYS:
                sold_within_window += 1
            else:
                sold_late += 1
        elif row["withdrawn_date"]:
            withdrawn_unsold += 1
        elif (now - intake).days > RELIABILITY_WINDOW_DAYS:
            pending_overdue += 1
        # else: still in stock and within the window — too soon to judge, excluded.

    judged_total = sold_within_window + sold_late + withdrawn_unsold + pending_overdue
    reliability_pct = round(100 * sold_within_window / judged_total, 1) if judged_total else None

    return {
        "window_days": RELIABILITY_WINDOW_DAYS,
        "sold_within_window": sold_within_window,
        "sold_late": sold_late,
        "withdrawn_unsold": withdrawn_unsold,
        "pending_overdue": pending_overdue,
        "judged_total": judged_total,
        "reliability_pct": reliability_pct,
    }


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
            SELECT sales.id AS sale_id, items.id AS item_id, items.sku, sales.sale_date, sales.sale_price,
                   splits.supplier_amount, splits.paid_at
            FROM splits
            JOIN sales ON sales.id = splits.sale_id
            JOIN items ON items.id = sales.item_id
            WHERE splits.supplier_id = ? AND sales.voided_at IS NULL
            ORDER BY sales.sale_date DESC
            """,
            (supplier_id,),
        ).fetchall()
        # Summed in cents, then converted once — AUDIT.md §0.1.
        total_owed = to_reais(sum(r["supplier_amount"] for r in payout_rows if r["paid_at"] is None))
        total_paid = to_reais(sum(r["supplier_amount"] for r in payout_rows if r["paid_at"] is not None))
        payout_sales = [
            {**dict(r), "sale_price": to_reais(r["sale_price"]), "supplier_amount": to_reais(r["supplier_amount"])}
            for r in payout_rows
        ]

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
            "items": [{**dict(r), "price": to_reais(r["price"])} for r in items],
            "total_owed": total_owed,
            "total_paid": total_paid,
            "payout_sales": payout_sales,
            "withdrawals": withdrawals,
            "reliability": _supplier_reliability(conn, supplier_id),
        }
    finally:
        conn.close()


@router.post("/{supplier_id}/payouts", response_model=SupplierDetailOut)
def register_payout(supplier_id: int, payload: PayoutRequest = PayoutRequest()):
    conn = get_connection()
    try:
        supplier = conn.execute("SELECT * FROM suppliers WHERE id = ?", (supplier_id,)).fetchone()
        if supplier is None:
            raise HTTPException(404, "fornecedora não encontrada")

        if payload.sale_ids:
            placeholders = ",".join("?" * len(payload.sale_ids))
            conn.execute(
                f"""
                UPDATE splits SET paid_at = CURRENT_TIMESTAMP
                WHERE supplier_id = ? AND paid_at IS NULL
                  AND sale_id IN ({placeholders})
                  AND sale_id IN (SELECT id FROM sales WHERE voided_at IS NULL)
                """,
                (supplier_id, *payload.sale_ids),
            )
        else:
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
