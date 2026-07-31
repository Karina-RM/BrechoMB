import sqlite3
from typing import Optional

from fastapi import HTTPException


def resolve_side(conn: sqlite3.Connection, owner_id: Optional[int], supplier_id: Optional[int]) -> str:
    """Which owner's side an item belongs to: 'A' (cut-owner) or 'B'."""
    if owner_id is not None:
        row = conn.execute("SELECT is_cut_owner FROM owners WHERE id = ?", (owner_id,)).fetchone()
        if row is None:
            raise HTTPException(400, f"proprietária {owner_id} não encontrada")
        return "A" if row["is_cut_owner"] else "B"

    row = conn.execute(
        "SELECT o.is_cut_owner FROM suppliers s JOIN owners o ON o.id = s.owner_id WHERE s.id = ?",
        (supplier_id,),
    ).fetchone()
    if row is None:
        raise HTTPException(400, f"fornecedora {supplier_id} não encontrada")
    return "A" if row["is_cut_owner"] else "B"


def get_single_active_owner(conn: sqlite3.Connection) -> Optional[str]:
    """'A' or 'B' if exactly one owner is active (the other has left the business),
    else None for the normal two-owner case. Used to route full sale proceeds to
    whichever owner remains, regardless of an item's nominal side."""
    rows = conn.execute("SELECT is_cut_owner, active FROM owners").fetchall()
    active_rows = [r for r in rows if r["active"]]
    if len(active_rows) == 1:
        return "A" if active_rows[0]["is_cut_owner"] else "B"
    return None


def get_commission_pct(conn: sqlite3.Connection, item: sqlite3.Row) -> float:
    """The commission % that applies to an item right now: its own override, else the
    supplier's current default, else 0 for a garimpada piece — always read live, since
    commission % is editable at any time."""
    if item["commission_pct_override"] is not None:
        return item["commission_pct_override"]
    if item["supplier_id"] is None:
        return 0.0
    row = conn.execute(
        "SELECT commission_pct FROM suppliers WHERE id = ?", (item["supplier_id"],)
    ).fetchone()
    return row["commission_pct"] if row else 0.0
