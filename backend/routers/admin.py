import secrets
import sqlite3
from typing import Any, Optional

from fastapi import APIRouter, Body, Cookie, Depends, HTTPException, Response
from pydantic import BaseModel

from backend.admin_auth import verify_password
from backend.db import get_connection

router = APIRouter(prefix="/api/admin", tags=["admin"])

SESSION_COOKIE = "admin_session"

# In-memory on purpose: this is a local single-user desktop app, not a server with
# multiple concurrent admins, so a server restart simply requiring a fresh login is an
# acceptable trade for not needing persistent session storage.
_sessions: set[str] = set()

# Mirrors backend/models.py's SCHEMA minus admin_auth, which must never be reachable
# through its own generic CRUD (no read, no edit, no delete of the admin credential).
ADMIN_TABLES = {"owners", "suppliers", "items", "receipts", "sales", "splits", "withdrawals", "item_edits"}


class LoginPayload(BaseModel):
    password: str


def _table_columns(conn: sqlite3.Connection, table: str) -> list[dict]:
    return [dict(row) for row in conn.execute(f"PRAGMA table_info({table})")]


def _require_known_table(table: str) -> None:
    # Table/column identifiers can't be parameterized in sqlite3, so every endpoint
    # below checks membership in this fixed allow-list before ever interpolating a
    # table name into SQL.
    if table not in ADMIN_TABLES:
        raise HTTPException(404, "tabela não encontrada")


def require_admin(admin_session: Optional[str] = Cookie(default=None)) -> None:
    if admin_session is None or admin_session not in _sessions:
        raise HTTPException(401, "não autenticado")


@router.post("/login")
def login(payload: LoginPayload, response: Response):
    conn = get_connection()
    try:
        row = conn.execute("SELECT * FROM admin_auth WHERE id = 1").fetchone()
        if row is None or not verify_password(payload.password, row["password_hash"], row["salt"]):
            raise HTTPException(401, "senha incorreta")
        token = secrets.token_urlsafe(32)
        _sessions.add(token)
        response.set_cookie(SESSION_COOKIE, token, httponly=True, samesite="strict")
        return {"ok": True}
    finally:
        conn.close()


@router.post("/logout")
def logout(response: Response, admin_session: Optional[str] = Cookie(default=None)):
    _sessions.discard(admin_session)
    response.delete_cookie(SESSION_COOKIE)
    return {"ok": True}


@router.get("/tables", dependencies=[Depends(require_admin)])
def list_tables():
    conn = get_connection()
    try:
        return {table: _table_columns(conn, table) for table in sorted(ADMIN_TABLES)}
    finally:
        conn.close()


@router.get("/tables/{table}/rows", dependencies=[Depends(require_admin)])
def list_rows(table: str):
    _require_known_table(table)
    conn = get_connection()
    try:
        rows = conn.execute(f"SELECT * FROM {table} ORDER BY id DESC").fetchall()
        return [dict(r) for r in rows]
    finally:
        conn.close()


@router.post("/tables/{table}/rows", dependencies=[Depends(require_admin)])
def create_row(table: str, payload: dict[str, Any] = Body(...)):
    _require_known_table(table)
    conn = get_connection()
    try:
        columns = {c["name"] for c in _table_columns(conn, table)}
        fields = {k: v for k, v in payload.items() if k in columns and k != "id"}
        if not fields:
            raise HTTPException(400, "nenhum campo válido informado")
        try:
            cur = conn.execute(
                f"INSERT INTO {table} ({', '.join(fields)}) VALUES ({', '.join('?' for _ in fields)})",
                list(fields.values()),
            )
            conn.commit()
        except sqlite3.IntegrityError as e:
            raise HTTPException(400, str(e))
        row = conn.execute(f"SELECT * FROM {table} WHERE id = ?", (cur.lastrowid,)).fetchone()
        return dict(row)
    finally:
        conn.close()


@router.patch("/tables/{table}/rows/{row_id}", dependencies=[Depends(require_admin)])
def update_row(table: str, row_id: int, payload: dict[str, Any] = Body(...)):
    _require_known_table(table)
    conn = get_connection()
    try:
        columns = {c["name"] for c in _table_columns(conn, table)}
        fields = {k: v for k, v in payload.items() if k in columns and k != "id"}
        if not fields:
            raise HTTPException(400, "nenhum campo válido informado")
        set_clause = ", ".join(f"{k} = ?" for k in fields)
        try:
            cur = conn.execute(f"UPDATE {table} SET {set_clause} WHERE id = ?", (*fields.values(), row_id))
            conn.commit()
        except sqlite3.IntegrityError as e:
            raise HTTPException(400, str(e))
        if cur.rowcount == 0:
            raise HTTPException(404, "linha não encontrada")
        row = conn.execute(f"SELECT * FROM {table} WHERE id = ?", (row_id,)).fetchone()
        return dict(row)
    finally:
        conn.close()


@router.delete("/tables/{table}/rows/{row_id}", dependencies=[Depends(require_admin)])
def delete_row(table: str, row_id: int):
    _require_known_table(table)
    conn = get_connection()
    try:
        try:
            cur = conn.execute(f"DELETE FROM {table} WHERE id = ?", (row_id,))
            conn.commit()
        except sqlite3.IntegrityError as e:
            raise HTTPException(400, str(e))
        if cur.rowcount == 0:
            raise HTTPException(404, "linha não encontrada")
        return {"ok": True}
    finally:
        conn.close()
