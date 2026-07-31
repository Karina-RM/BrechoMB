import json
import sqlite3
from pathlib import Path
from typing import List, Optional

from fastapi import APIRouter, File, Form, HTTPException, UploadFile

from backend.db import PHOTOS_DIR, get_connection
from backend.schemas import ItemOut, ItemUpdate

router = APIRouter(prefix="/api/items", tags=["items"])


def _row_to_item(row: sqlite3.Row) -> dict:
    data = dict(row)
    data["photo_paths"] = json.loads(data["photo_paths"])
    return data


def _resolve_side(conn: sqlite3.Connection, owner_id: Optional[int], supplier_id: Optional[int]) -> str:
    """Which owner's side an item belongs to: 'A' (cut-owner) or 'B' — used for the SKU prefix."""
    if owner_id is not None:
        row = conn.execute("SELECT is_cut_owner FROM owners WHERE id = ?", (owner_id,)).fetchone()
        if row is None:
            raise HTTPException(400, f"owner_id {owner_id} does not exist")
        return "A" if row["is_cut_owner"] else "B"

    row = conn.execute(
        "SELECT o.is_cut_owner FROM suppliers s JOIN owners o ON o.id = s.owner_id WHERE s.id = ?",
        (supplier_id,),
    ).fetchone()
    if row is None:
        raise HTTPException(400, f"supplier_id {supplier_id} does not exist")
    return "A" if row["is_cut_owner"] else "B"


def _generate_sku(conn: sqlite3.Connection, side: str) -> str:
    count = conn.execute("SELECT COUNT(*) FROM items WHERE sku LIKE ?", (f"{side}-%",)).fetchone()[0]
    return f"{side}-{count + 1:04d}"


def _save_photos(sku: str, photos: List[UploadFile]) -> List[str]:
    if not photos:
        return []
    photo_dir = PHOTOS_DIR / sku
    photo_dir.mkdir(parents=True, exist_ok=True)
    saved = []
    for i, photo in enumerate(photos, start=1):
        if not photo.filename:
            continue
        suffix = Path(photo.filename).suffix or ".jpg"
        dest = photo_dir / f"{i}{suffix}"
        dest.write_bytes(photo.file.read())
        saved.append(f"/photos/{sku}/{dest.name}")
    return saved


@router.post("", response_model=ItemOut)
def create_item(
    owner_id: Optional[int] = Form(None),
    supplier_id: Optional[int] = Form(None),
    commission_pct_override: Optional[float] = Form(None),
    size: Optional[str] = Form(None),
    condition: Optional[str] = Form(None),
    category: Optional[str] = Form(None),
    price: float = Form(...),
    photos: List[UploadFile] = File(default=[]),
):
    if (owner_id is None) == (supplier_id is None):
        raise HTTPException(400, "exactly one of owner_id or supplier_id is required")
    if price <= 0:
        raise HTTPException(400, "price must be positive")

    conn = get_connection()
    try:
        side = _resolve_side(conn, owner_id, supplier_id)
        sku = _generate_sku(conn, side)
        photo_paths = _save_photos(sku, photos)

        cur = conn.execute(
            """
            INSERT INTO items
                (sku, owner_id, supplier_id, commission_pct_override, photo_paths,
                 size, condition, category, price, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'in_stock')
            """,
            (
                sku, owner_id, supplier_id, commission_pct_override, json.dumps(photo_paths),
                size, condition, category, price,
            ),
        )
        conn.commit()
        row = conn.execute("SELECT * FROM items WHERE id = ?", (cur.lastrowid,)).fetchone()
        return _row_to_item(row)
    finally:
        conn.close()


@router.get("", response_model=List[ItemOut])
def list_items(status: Optional[str] = None):
    conn = get_connection()
    try:
        if status:
            rows = conn.execute(
                "SELECT * FROM items WHERE status = ? ORDER BY intake_date DESC", (status,)
            ).fetchall()
        else:
            rows = conn.execute("SELECT * FROM items ORDER BY intake_date DESC").fetchall()
        return [_row_to_item(r) for r in rows]
    finally:
        conn.close()


@router.get("/{item_id}", response_model=ItemOut)
def get_item(item_id: int):
    conn = get_connection()
    try:
        row = conn.execute("SELECT * FROM items WHERE id = ?", (item_id,)).fetchone()
        if row is None:
            raise HTTPException(404, "item not found")
        return _row_to_item(row)
    finally:
        conn.close()


@router.patch("/{item_id}", response_model=ItemOut)
def update_item(item_id: int, payload: ItemUpdate):
    conn = get_connection()
    try:
        row = conn.execute("SELECT * FROM items WHERE id = ?", (item_id,)).fetchone()
        if row is None:
            raise HTTPException(404, "item not found")

        updates = payload.model_dump(exclude_unset=True)
        if updates:
            set_clause = ", ".join(f"{k} = ?" for k in updates)
            conn.execute(
                f"UPDATE items SET {set_clause} WHERE id = ?",
                (*updates.values(), item_id),
            )
            conn.commit()
            row = conn.execute("SELECT * FROM items WHERE id = ?", (item_id,)).fetchone()
        return _row_to_item(row)
    finally:
        conn.close()
