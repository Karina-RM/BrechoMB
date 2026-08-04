from typing import List

from fastapi import APIRouter, HTTPException

from backend.db import get_connection
from backend.schemas import OwnerOut, OwnerUpdate, PinVerify

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
