from typing import List

from fastapi import APIRouter

from backend.db import get_connection
from backend.schemas import SupplierOut

router = APIRouter(prefix="/api/suppliers", tags=["suppliers"])

# Read-only for now, just enough to populate the item-intake assignment dropdown.
# Create/edit (with anytime-editable commission %) lands in Phase 4.


@router.get("", response_model=List[SupplierOut])
def list_suppliers():
    conn = get_connection()
    try:
        rows = conn.execute("SELECT * FROM suppliers ORDER BY name").fetchall()
        return [dict(r) for r in rows]
    finally:
        conn.close()
