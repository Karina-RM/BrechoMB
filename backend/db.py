import sqlite3
from pathlib import Path

from backend.models import create_schema, seed_owners

DATA_DIR = Path(__file__).resolve().parent.parent / "data"
DB_PATH = DATA_DIR / "brecho.db"
PHOTOS_DIR = DATA_DIR / "photos"


def get_connection() -> sqlite3.Connection:
    DB_PATH.parent.mkdir(exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def init_db() -> None:
    conn = get_connection()
    try:
        create_schema(conn)
        seed_owners(conn)
    finally:
        conn.close()
