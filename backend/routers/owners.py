from typing import List

from fastapi import APIRouter

from backend.db import get_connection
from backend.schemas import OwnerOut

router = APIRouter(prefix="/api/owners", tags=["owners"])


@router.get("", response_model=List[OwnerOut])
def list_owners():
    conn = get_connection()
    try:
        rows = conn.execute("SELECT * FROM owners ORDER BY id").fetchall()
        return [dict(r) for r in rows]
    finally:
        conn.close()
