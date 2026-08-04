import json
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
    department: ItemDepartment = Form(...),
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
    if commission_pct_override is not None and (commission_pct_override < 0 or commission_pct_override > 100):
        raise HTTPException(400, "a comissão deve estar entre 0 e 100")
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
def list_items(status: Optional[str] = None, department: Optional[str] = None, category: Optional[str] = None):
    conn = get_connection()
    try:
        # Soft-deleted items are fully hidden from the app, not just excluded by
        # default — this clause is unconditional, so even an explicit ?status=deleted
        # request returns nothing (only the admin panel can still see them).
        clauses = ["status != 'deleted'"]
        params: list = []
        if status:
            clauses.append("status = ?")
            params.append(status)
        if department:
            clauses.append("department = ?")
            params.append(department)
        if category:
            clauses.append("category = ?")
            params.append(category)
        where = f"WHERE {' AND '.join(clauses)}"
        # Estoque view groups by status first — in_stock (still sellable) before sold
        # before withdrawn — then newest intake within each group.
        order_by = """
            ORDER BY CASE status
                WHEN 'in_stock' THEN 0
                WHEN 'sold' THEN 1
                WHEN 'withdrawn' THEN 2
                ELSE 3
            END, intake_date DESC
        """
        rows = conn.execute(f"SELECT * FROM items {where}{order_by}", params).fetchall()
        return [_row_to_item(r) for r in rows]
    finally:
        conn.close()


@router.get("/{item_id}", response_model=ItemDetailOut)
def get_item(item_id: int):
    conn = get_connection()
    try:
        row = conn.execute("SELECT * FROM items WHERE id = ?", (item_id,)).fetchone()
        if row is None or row["status"] == "deleted":
            raise HTTPException(404, "peça não encontrada")
        detail = _row_to_item(row)

        sale_row = conn.execute(
            SALE_SELECT + " WHERE sales.item_id = ? ORDER BY sales.id DESC LIMIT 1", (item_id,)
        ).fetchone()
        detail["sale"] = _row_to_sale(sale_row) if sale_row else None

        withdrawal_row = conn.execute(
            "SELECT withdrawn_date FROM withdrawals WHERE item_id = ? ORDER BY withdrawn_date DESC LIMIT 1",
            (item_id,),
        ).fetchone()
        detail["withdrawn_date"] = withdrawal_row["withdrawn_date"] if withdrawal_row else None

        edit_rows = conn.execute(
            """
            SELECT item_edits.field, item_edits.old_value, item_edits.new_value, item_edits.edited_at,
                   owners.name AS edited_by_owner_name
            FROM item_edits
            LEFT JOIN owners ON owners.id = item_edits.edited_by_owner_id
            WHERE item_edits.item_id = ?
            ORDER BY item_edits.id DESC
            """,
            (item_id,),
        ).fetchall()
        detail["edits"] = [dict(r) for r in edit_rows]

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

        editor = conn.execute("SELECT id FROM owners WHERE id = ?", (payload.edited_by_owner_id,)).fetchone()
        if editor is None:
            raise HTTPException(400, "proprietária que fez a edição não encontrada")

        updates = payload.model_dump(exclude_unset=True, exclude={"edited_by_owner_id"})

        # Once a piece leaves in_stock its data is frozen into the sale/split that used
        # it — further edits here would drift the item page away from what was actually
        # sold. From this point on, corrections go through the admin panel instead.
        if row["status"] != "in_stock" and any(updates[k] != row[k] for k in updates):
            raise HTTPException(400, "peça fora do estoque só pode ser editada pelo painel administrativo")

        if "price" in updates and (updates["price"] is None or updates["price"] <= 0):
            raise HTTPException(400, "o preço deve ser maior que zero")
        if "commission_pct_override" in updates and updates["commission_pct_override"] is not None:
            pct = updates["commission_pct_override"]
            if pct < 0 or pct > 100:
                raise HTTPException(400, "a comissão deve estar entre 0 e 100")

        # Mirror create_item's department/category/size cross-validation, checked
        # against the *effective* resulting state (whichever of these three fields
        # isn't part of this update keeps its current row value) — an edit that only
        # touches, say, price must not silently leave category/size mismatched with
        # department, and a department/category change must not produce a nonsense
        # combination either.
        effective_department = updates.get("department", row["department"])
        effective_category = updates.get("category", row["category"])
        effective_size = updates.get("size", row["size"])
        if effective_department is None:
            raise HTTPException(400, "departamento é obrigatório")
        if (
            effective_category is not None
            and effective_department is not None
            and effective_category not in DEPARTMENT_CATEGORIES.get(effective_department, [])
        ):
            raise HTTPException(
                400, f"categoria '{effective_category}' não pertence ao departamento '{effective_department}'"
            )
        if effective_size is not None:
            if effective_category in SIZELESS_CATEGORIES:
                raise HTTPException(400, f"a categoria '{effective_category}' não usa tamanho")
            allowed_sizes = ShoeSize if effective_category in SHOE_SIZE_CATEGORIES else ItemSize
            if effective_size not in {s.value for s in allowed_sizes}:
                raise HTTPException(400, f"tamanho inválido: '{effective_size}'")

        changed = {k: v for k, v in updates.items() if v != row[k]}
        if changed:
            set_clause = ", ".join(f"{k} = ?" for k in changed)
            conn.execute(
                f"UPDATE items SET {set_clause} WHERE id = ?",
                (*changed.values(), item_id),
            )
            for field, new_value in changed.items():
                conn.execute(
                    """
                    INSERT INTO item_edits (item_id, field, old_value, new_value, edited_by_owner_id)
                    VALUES (?, ?, ?, ?, ?)
                    """,
                    (item_id, field, row[field], new_value, payload.edited_by_owner_id),
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
    # A soft delete, not a real removal — the row (and its item_edits history) stays,
    # only status/deleted_at change, so this never touches the item_edits FK. Still
    # restricted to in-stock items: a sold/withdrawn item's history must stay intact
    # and browsable, and this same check doubles as blocking deleting an
    # already-deleted item. Deleted items are then fully hidden by list_items/get_item
    # — only reachable again through the admin panel.
    conn = get_connection()
    try:
        row = conn.execute("SELECT * FROM items WHERE id = ?", (item_id,)).fetchone()
        if row is None:
            raise HTTPException(404, "peça não encontrada")
        if row["status"] != "in_stock":
            raise HTTPException(400, "só é possível excluir peças que ainda estão em estoque")

        conn.execute(
            "UPDATE items SET status = 'deleted', deleted_at = CURRENT_TIMESTAMP WHERE id = ?", (item_id,)
        )
        conn.commit()
    finally:
        conn.close()
