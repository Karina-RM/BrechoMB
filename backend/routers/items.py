import json
import sqlite3
from pathlib import Path
from typing import List, Optional

from fastapi import APIRouter, File, Form, HTTPException, UploadFile

from backend.db import PHOTOS_DIR, get_connection
from backend.domain import resolve_side
from backend.schemas import ItemOut, ItemUpdate

router = APIRouter(prefix="/api/items", tags=["items"])


def _row_to_item(row: sqlite3.Row) -> dict:
    data = dict(row)
    data["photo_paths"] = json.loads(data["photo_paths"])
    return data


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
        raise HTTPException(400, "informe a proprietária ou a fornecedora da peça, mas não as duas")
    if price <= 0:
        raise HTTPException(400, "o preço deve ser maior que zero")

    conn = get_connection()
    try:
        side = resolve_side(conn, owner_id, supplier_id)
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
            raise HTTPException(404, "peça não encontrada")
        return _row_to_item(row)
    finally:
        conn.close()


@router.patch("/{item_id}", response_model=ItemOut)
def update_item(item_id: int, payload: ItemUpdate):
    conn = get_connection()
    try:
        row = conn.execute("SELECT * FROM items WHERE id = ?", (item_id,)).fetchone()
        if row is None:
            raise HTTPException(404, "peça não encontrada")

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


@router.post("/{item_id}/withdraw", response_model=ItemOut)
def withdraw_item(item_id: int):
    conn = get_connection()
    try:
        row = conn.execute("SELECT * FROM items WHERE id = ?", (item_id,)).fetchone()
        if row is None:
            raise HTTPException(404, "peça não encontrada")
        if row["supplier_id"] is None:
            raise HTTPException(400, "apenas peças de fornecedoras podem ser retiradas")
        if row["status"] != "in_stock":
            raise HTTPException(400, "esta peça não está disponível para retirada")

        conn.execute("UPDATE items SET status = 'withdrawn' WHERE id = ?", (item_id,))
        conn.execute("INSERT INTO withdrawals (item_id) VALUES (?)", (item_id,))
        conn.commit()

        row = conn.execute("SELECT * FROM items WHERE id = ?", (item_id,)).fetchone()
        return _row_to_item(row)
    finally:
        conn.close()
