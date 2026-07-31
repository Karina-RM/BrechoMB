from typing import List

from fastapi import APIRouter, HTTPException

from backend.db import get_connection
from backend.schemas import OwnerOut, OwnerUpdate

router = APIRouter(prefix="/api/owners", tags=["owners"])

# Deliberately not exposed as a shop-facing UI control — deactivating an owner (the
# "second owner leaves the business" scenario) is a rare back-office action, called
# directly rather than offered as a button either owner could click.


@router.get("", response_model=List[OwnerOut])
def list_owners():
    conn = get_connection()
    try:
        rows = conn.execute("SELECT * FROM owners ORDER BY id").fetchall()
        return [dict(r) for r in rows]
    finally:
        conn.close()


@router.patch("/{owner_id}", response_model=OwnerOut)
def update_owner(owner_id: int, payload: OwnerUpdate):
    conn = get_connection()
    try:
        row = conn.execute("SELECT * FROM owners WHERE id = ?", (owner_id,)).fetchone()
        if row is None:
            raise HTTPException(404, "proprietária não encontrada")

        if not payload.active:
            active_count = conn.execute("SELECT COUNT(*) FROM owners WHERE active = 1").fetchone()[0]
            if active_count <= 1:
                raise HTTPException(400, "não é possível desativar a única proprietária ativa")

        conn.execute("UPDATE owners SET active = ? WHERE id = ?", (int(payload.active), owner_id))
        conn.commit()
        row = conn.execute("SELECT * FROM owners WHERE id = ?", (owner_id,)).fetchone()
        return dict(row)
    finally:
        conn.close()
