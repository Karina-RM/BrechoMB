import json
import shutil
import sqlite3
from pathlib import Path
from typing import List, Optional

from fastapi import APIRouter, File, Form, HTTPException, UploadFile

from backend.db import PHOTOS_DIR, get_connection
from backend.domain import resolve_side
from backend.enums import (
    DEPARTMENT_CATEGORIES,
    SHOE_SIZE_CATEGORIES,
    SIZELESS_CATEGORIES,
    ItemCategory,
    ItemCondition,
    ItemDepartment,
    ItemSize,
    ShoeSize,
)
from backend.routers.sales import SALE_SELECT, _row_to_sale
from backend.schemas import ItemDetailOut, ItemOut, ItemUpdate

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
    condition: Optional[ItemCondition] = Form(None),
    department: Optional[ItemDepartment] = Form(None),
    category: Optional[ItemCategory] = Form(None),
    brand: Optional[str] = Form(None),
    color: Optional[str] = Form(None),
    material: Optional[str] = Form(None),
    observations: Optional[str] = Form(None),
    price: float = Form(...),
    photos: List[UploadFile] = File(default=[]),
):
    if (owner_id is None) == (supplier_id is None):
        raise HTTPException(400, "informe a proprietária ou a fornecedora da peça, mas não as duas")
    if price <= 0:
        raise HTTPException(400, "o preço deve ser maior que zero")
    if category is not None and department is not None and category not in DEPARTMENT_CATEGORIES[department]:
        raise HTTPException(400, f"categoria '{category.value}' não pertence ao departamento '{department.value}'")
    if size is not None:
        if category in SIZELESS_CATEGORIES:
            raise HTTPException(400, f"a categoria '{category.value}' não usa tamanho")
        allowed_sizes = ShoeSize if category in SHOE_SIZE_CATEGORIES else ItemSize
        if size not in {s.value for s in allowed_sizes}:
            raise HTTPException(400, f"tamanho inválido: '{size}'")

    conn = get_connection()
    try:
        side = resolve_side(conn, owner_id, supplier_id)
        sku = _generate_sku(conn, side)
        photo_paths = _save_photos(sku, photos)

        cur = conn.execute(
            """
            INSERT INTO items
                (sku, owner_id, supplier_id, commission_pct_override, photo_paths,
                 size, condition, department, category, brand, color, material, observations, price, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'in_stock')
            """,
            (
                sku, owner_id, supplier_id, commission_pct_override, json.dumps(photo_paths),
                size, condition, department, category, brand, color, material, observations, price,
            ),
        )
        conn.commit()
        row = conn.execute("SELECT * FROM items WHERE id = ?", (cur.lastrowid,)).fetchone()
        return _row_to_item(row)
    finally:
        conn.close()


@router.get("", response_model=List[ItemOut])
def list_items(status: Optional[str] = None, department: Optional[str] = None):
    conn = get_connection()
    try:
        clauses = []
        params: list = []
        if status:
            clauses.append("status = ?")
            params.append(status)
        if department:
            clauses.append("department = ?")
            params.append(department)
        where = f"WHERE {' AND '.join(clauses)}" if clauses else ""
        rows = conn.execute(f"SELECT * FROM items {where} ORDER BY intake_date DESC", params).fetchall()
        return [_row_to_item(r) for r in rows]
    finally:
        conn.close()


@router.get("/{item_id}", response_model=ItemDetailOut)
def get_item(item_id: int):
    conn = get_connection()
    try:
        row = conn.execute("SELECT * FROM items WHERE id = ?", (item_id,)).fetchone()
        if row is None:
            raise HTTPException(404, "peça não encontrada")
        detail = _row_to_item(row)

        sale_row = conn.execute(SALE_SELECT + " WHERE sales.item_id = ?", (item_id,)).fetchone()
        detail["sale"] = _row_to_sale(sale_row) if sale_row else None

        withdrawal_row = conn.execute(
            "SELECT withdrawn_date FROM withdrawals WHERE item_id = ? ORDER BY withdrawn_date DESC LIMIT 1",
            (item_id,),
        ).fetchone()
        detail["withdrawn_date"] = withdrawal_row["withdrawn_date"] if withdrawal_row else None

        return detail
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


@router.delete("/{item_id}", status_code=204)
def delete_item(item_id: int):
    # Only ever offered for a data-entry mistake, not a real removal — restricted to
    # items with no history yet (never sold, never withdrawn), so there's nothing
    # elsewhere (a sale, a split, a withdrawal record) that a delete could orphan.
    conn = get_connection()
    try:
        row = conn.execute("SELECT * FROM items WHERE id = ?", (item_id,)).fetchone()
        if row is None:
            raise HTTPException(404, "peça não encontrada")
        if row["status"] != "in_stock":
            raise HTTPException(400, "só é possível excluir peças que ainda estão em estoque")

        conn.execute("DELETE FROM items WHERE id = ?", (item_id,))
        conn.commit()

        photo_dir = PHOTOS_DIR / row["sku"]
        if photo_dir.exists():
            shutil.rmtree(photo_dir)
    finally:
        conn.close()
