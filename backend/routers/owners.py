from typing import List

from fastapi import APIRouter, HTTPException

from backend.db import get_connection
from backend.money import to_reais
from backend.schemas import OwnerOut, OwnerPayoutSaleOut, OwnerUpdate, PayoutRequest, PinVerify

router = APIRouter(prefix="/api/owners", tags=["owners"])

# Deliberately not exposed as a shop-facing UI control — deactivating an owner (the
# "second owner leaves the business" scenario) is a rare back-office action, called
# directly rather than offered as a button either owner could click.


def _row_to_owner(row) -> dict:
    data = dict(row)
    data["has_pin"] = data["pin"] is not None
    del data["pin"]
    return data


@router.get("", response_model=List[OwnerOut])
def list_owners():
    conn = get_connection()
    try:
        rows = conn.execute("SELECT * FROM owners ORDER BY id").fetchall()
        return [_row_to_owner(r) for r in rows]
    finally:
        conn.close()


@router.patch("/{owner_id}", response_model=OwnerOut)
def update_owner(owner_id: int, payload: OwnerUpdate):
    conn = get_connection()
    try:
        row = conn.execute("SELECT * FROM owners WHERE id = ?", (owner_id,)).fetchone()
        if row is None:
            raise HTTPException(404, "proprietária não encontrada")

        updates = payload.model_dump(exclude_unset=True)
        if "active" in updates and not updates["active"]:
            active_count = conn.execute("SELECT COUNT(*) FROM owners WHERE active = 1").fetchone()[0]
            if active_count <= 1:
                raise HTTPException(400, "não é possível desativar a única proprietária ativa")

        if updates:
            set_clause = ", ".join(f"{k} = ?" for k in updates)
            conn.execute(
                f"UPDATE owners SET {set_clause} WHERE id = ?",
                (*updates.values(), owner_id),
            )
            conn.commit()
            row = conn.execute("SELECT * FROM owners WHERE id = ?", (owner_id,)).fetchone()
        return _row_to_owner(row)
    finally:
        conn.close()


@router.post("/{owner_id}/verify-pin")
def verify_pin(owner_id: int, payload: PinVerify):
    conn = get_connection()
    try:
        row = conn.execute("SELECT * FROM owners WHERE id = ?", (owner_id,)).fetchone()
        if row is None or not row["active"]:
            raise HTTPException(404, "proprietária não encontrada")
        if row["pin"] is None:
            raise HTTPException(400, "esta proprietária ainda não tem um PIN cadastrado")
        if payload.pin != row["pin"]:
            raise HTTPException(401, "PIN incorreto")
        return {"ok": True}
    finally:
        conn.close()


def _owner_side(conn, owner_id: int) -> str:
    owner = conn.execute("SELECT is_cut_owner FROM owners WHERE id = ?", (owner_id,)).fetchone()
    if owner is None:
        raise HTTPException(404, "proprietária não encontrada")
    return "a" if owner["is_cut_owner"] else "b"


def _list_owner_payouts(conn, owner_id: int) -> list:
    side = _owner_side(conn, owner_id)
    rows = conn.execute(
        f"""
        SELECT sales.id AS sale_id, items.id AS item_id, items.sku, sales.sale_date,
               splits.owner_{side}_amount AS amount, splits.owner_{side}_paid_at AS paid_at
        FROM splits
        JOIN sales ON sales.id = splits.sale_id
        JOIN items ON items.id = sales.item_id
        WHERE sales.voided_at IS NULL AND splits.owner_{side}_amount > 0
        ORDER BY sales.sale_date DESC
        """
    ).fetchall()
    return [{**dict(r), "amount": to_reais(r["amount"])} for r in rows]


@router.get("/{owner_id}/payouts", response_model=List[OwnerPayoutSaleOut])
def list_owner_payouts(owner_id: int):
    conn = get_connection()
    try:
        return _list_owner_payouts(conn, owner_id)
    finally:
        conn.close()


@router.post("/{owner_id}/payouts", response_model=List[OwnerPayoutSaleOut])
def register_owner_payout(owner_id: int, payload: PayoutRequest = PayoutRequest()):
    conn = get_connection()
    try:
        side = _owner_side(conn, owner_id)

        if payload.sale_ids:
            placeholders = ",".join("?" * len(payload.sale_ids))
            conn.execute(
                f"""
                UPDATE splits SET owner_{side}_paid_at = CURRENT_TIMESTAMP
                WHERE owner_{side}_paid_at IS NULL AND owner_{side}_amount > 0
                  AND sale_id IN ({placeholders})
                  AND sale_id IN (SELECT id FROM sales WHERE voided_at IS NULL)
                """,
                payload.sale_ids,
            )
        else:
            conn.execute(
                f"""
                UPDATE splits SET owner_{side}_paid_at = CURRENT_TIMESTAMP
                WHERE owner_{side}_paid_at IS NULL AND owner_{side}_amount > 0
                  AND sale_id IN (SELECT id FROM sales WHERE voided_at IS NULL)
                """
            )
        conn.commit()
        return _list_owner_payouts(conn, owner_id)
    finally:
        conn.close()
