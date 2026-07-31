import sqlite3

SCHEMA = """
CREATE TABLE IF NOT EXISTS owners (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    is_cut_owner INTEGER NOT NULL DEFAULT 0,
    active INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS suppliers (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    owner_id INTEGER NOT NULL REFERENCES owners(id),
    commission_pct REAL NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS items (
    id INTEGER PRIMARY KEY,
    sku TEXT NOT NULL UNIQUE,
    owner_id INTEGER REFERENCES owners(id),
    supplier_id INTEGER REFERENCES suppliers(id),
    commission_pct_override REAL,
    photo_paths TEXT NOT NULL DEFAULT '[]',
    size TEXT,
    condition TEXT,
    department TEXT,
    category TEXT,
    brand TEXT,
    color TEXT,
    material TEXT,
    observations TEXT,
    price REAL NOT NULL,
    status TEXT NOT NULL DEFAULT 'in_stock',
    intake_date TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CHECK ((owner_id IS NULL) != (supplier_id IS NULL)),
    CHECK (status IN ('in_stock', 'sold', 'withdrawn'))
);

CREATE TABLE IF NOT EXISTS sales (
    id INTEGER PRIMARY KEY,
    item_id INTEGER NOT NULL UNIQUE REFERENCES items(id),
    sale_price REAL NOT NULL,
    sale_date TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS splits (
    id INTEGER PRIMARY KEY,
    sale_id INTEGER NOT NULL UNIQUE REFERENCES sales(id),
    owner_a_amount REAL NOT NULL,
    owner_b_amount REAL NOT NULL,
    supplier_id INTEGER REFERENCES suppliers(id),
    supplier_amount REAL NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS withdrawals (
    id INTEGER PRIMARY KEY,
    item_id INTEGER NOT NULL REFERENCES items(id),
    withdrawn_date TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
"""


def create_schema(conn: sqlite3.Connection) -> None:
    conn.executescript(SCHEMA)
    conn.commit()


def migrate_schema(conn: sqlite3.Connection) -> None:
    """Add columns introduced after a database's initial creation. CREATE TABLE IF NOT
    EXISTS above only applies to brand-new databases, so existing ones need explicit,
    idempotent ALTER TABLE steps here."""
    existing = {row["name"] for row in conn.execute("PRAGMA table_info(items)")}
    if "department" not in existing:
        conn.execute("ALTER TABLE items ADD COLUMN department TEXT")
    if "brand" not in existing:
        conn.execute("ALTER TABLE items ADD COLUMN brand TEXT")
    if "color" not in existing:
        conn.execute("ALTER TABLE items ADD COLUMN color TEXT")
    if "material" not in existing:
        conn.execute("ALTER TABLE items ADD COLUMN material TEXT")
    if "observations" not in existing:
        conn.execute("ALTER TABLE items ADD COLUMN observations TEXT")
    conn.commit()


def seed_owners(conn: sqlite3.Connection) -> None:
    if conn.execute("SELECT COUNT(*) FROM owners").fetchone()[0]:
        return
    conn.execute("INSERT INTO owners (name, is_cut_owner) VALUES ('Dona A', 1)")
    conn.execute("INSERT INTO owners (name, is_cut_owner) VALUES ('Dona B', 0)")
    conn.commit()
