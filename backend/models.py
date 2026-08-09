import sqlite3

SCHEMA = """
CREATE TABLE IF NOT EXISTS owners (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    is_cut_owner INTEGER NOT NULL DEFAULT 0,
    active INTEGER NOT NULL DEFAULT 1,
    pin TEXT
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
    deleted_at TEXT,
    CHECK ((owner_id IS NULL) != (supplier_id IS NULL)),
    CHECK (status IN ('in_stock', 'sold', 'withdrawn', 'deleted'))
);

CREATE TABLE IF NOT EXISTS receipts (
    id INTEGER PRIMARY KEY,
    sold_by_owner_id INTEGER REFERENCES owners(id),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- A receipt's total can be split across 2-3 payment methods (e.g. part cash, part
-- card, part Pix) — one row per method actually used, instead of a single scalar
-- payment_method column on receipts.
CREATE TABLE IF NOT EXISTS receipt_payments (
    id INTEGER PRIMARY KEY,
    receipt_id INTEGER NOT NULL REFERENCES receipts(id),
    payment_method TEXT NOT NULL,
    amount REAL NOT NULL
);

CREATE TABLE IF NOT EXISTS sales (
    id INTEGER PRIMARY KEY,
    item_id INTEGER NOT NULL REFERENCES items(id),
    sale_price REAL NOT NULL,
    catalog_price REAL NOT NULL,
    discount_reason TEXT,
    receipt_id INTEGER NOT NULL REFERENCES receipts(id),
    sale_date TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    voided_at TEXT
);

CREATE TABLE IF NOT EXISTS splits (
    id INTEGER PRIMARY KEY,
    sale_id INTEGER NOT NULL UNIQUE REFERENCES sales(id),
    owner_a_amount REAL NOT NULL,
    owner_b_amount REAL NOT NULL,
    supplier_id INTEGER REFERENCES suppliers(id),
    supplier_amount REAL NOT NULL DEFAULT 0,
    paid_at TEXT,
    owner_a_paid_at TEXT,
    owner_b_paid_at TEXT
);

CREATE TABLE IF NOT EXISTS withdrawals (
    id INTEGER PRIMARY KEY,
    item_id INTEGER NOT NULL REFERENCES items(id),
    withdrawn_date TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS item_edits (
    id INTEGER PRIMARY KEY,
    item_id INTEGER NOT NULL REFERENCES items(id),
    field TEXT NOT NULL,
    old_value TEXT,
    new_value TEXT,
    edited_by_owner_id INTEGER REFERENCES owners(id),
    edited_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Single-row table holding the admin panel's password hash. Never exposed through the
-- admin panel's own generic CRUD (backend/routers/admin.py hardcodes it out of the
-- table allow-list) — set only via `python -m backend.set_admin_password`.
CREATE TABLE IF NOT EXISTS admin_auth (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    password_hash TEXT NOT NULL,
    salt TEXT NOT NULL
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

    # A "delete" item action used to be a real DELETE, which crashed once an item had
    # any item_edits rows (no ON DELETE CASCADE on that FK). Turning delete into a soft
    # delete (a 4th status value) needs the status CHECK constraint widened, which
    # SQLite can't ALTER — same rename/recreate/copy/drop rebuild already used for
    # `sales` below. The copy below names every column explicitly on both sides
    # (never `SELECT *`) — a live check of this database showed its actual physical
    # column order no longer matches the order columns appear in SCHEMA above, since
    # department/brand/color/material/observations were each added by their own
    # ALTER TABLE ADD COLUMN at different points in this file's history. `SELECT *`
    # copies by position, so on a table like that it silently shifts every value into
    # the wrong column instead of failing loudly — explicit names side-step the
    # mismatch entirely regardless of physical order on either side.
    existing_items_now = {row["name"] for row in conn.execute("PRAGMA table_info(items)")}
    if "deleted_at" not in existing_items_now:
        conn.execute("PRAGMA foreign_keys = OFF")
        conn.execute("ALTER TABLE items RENAME TO items_old")
        conn.execute(
            """
            CREATE TABLE items (
                id INTEGER PRIMARY KEY,
                sku TEXT NOT NULL UNIQUE,
                owner_id INTEGER REFERENCES owners(id),
                supplier_id INTEGER REFERENCES suppliers(id),
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
                deleted_at TEXT,
                CHECK ((owner_id IS NULL) != (supplier_id IS NULL)),
                CHECK (status IN ('in_stock', 'sold', 'withdrawn', 'deleted'))
            )
            """
        )
        conn.execute(
            """
            INSERT INTO items (
                id, sku, owner_id, supplier_id, photo_paths,
                size, condition, department, category, brand, color, material,
                observations, price, status, intake_date, deleted_at
            )
            SELECT
                id, sku, owner_id, supplier_id, photo_paths,
                size, condition, department, category, brand, color, material,
                observations, price, status, intake_date, NULL
            FROM items_old
            """
        )
        conn.execute("DROP TABLE items_old")
        conn.execute("PRAGMA foreign_keys = ON")

    # Per-item commission overrides are gone — the supplier's own commission_pct is now
    # the single source of truth (see backend/domain.py get_commission_pct). Dropping a
    # column needs the same rebuild SQLite forces everywhere else in this function.
    existing_items_now = {row["name"] for row in conn.execute("PRAGMA table_info(items)")}
    if "commission_pct_override" in existing_items_now:
        conn.execute("PRAGMA foreign_keys = OFF")
        conn.execute("ALTER TABLE items RENAME TO items_old")
        conn.execute(
            """
            CREATE TABLE items (
                id INTEGER PRIMARY KEY,
                sku TEXT NOT NULL UNIQUE,
                owner_id INTEGER REFERENCES owners(id),
                supplier_id INTEGER REFERENCES suppliers(id),
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
                deleted_at TEXT,
                CHECK ((owner_id IS NULL) != (supplier_id IS NULL)),
                CHECK (status IN ('in_stock', 'sold', 'withdrawn', 'deleted'))
            )
            """
        )
        conn.execute(
            """
            INSERT INTO items (
                id, sku, owner_id, supplier_id, photo_paths,
                size, condition, department, category, brand, color, material,
                observations, price, status, intake_date, deleted_at
            )
            SELECT
                id, sku, owner_id, supplier_id, photo_paths,
                size, condition, department, category, brand, color, material,
                observations, price, status, intake_date, deleted_at
            FROM items_old
            """
        )
        conn.execute("DROP TABLE items_old")
        conn.execute("PRAGMA foreign_keys = ON")

    existing_owners = {row["name"] for row in conn.execute("PRAGMA table_info(owners)")}
    if "pin" not in existing_owners:
        conn.execute("ALTER TABLE owners ADD COLUMN pin TEXT")

    existing_splits = {row["name"] for row in conn.execute("PRAGMA table_info(splits)")}
    if "paid_at" not in existing_splits:
        conn.execute("ALTER TABLE splits ADD COLUMN paid_at TEXT")

    # Owner payouts (repasses às donas) mirror the supplier payout column above — each
    # owner's cut of a sale can be marked paid independently of the other's, since a
    # single side-B sale splits proceeds between both owners at once (see splits.py).
    existing_splits_now = {row["name"] for row in conn.execute("PRAGMA table_info(splits)")}
    if "owner_a_paid_at" not in existing_splits_now:
        conn.execute("ALTER TABLE splits ADD COLUMN owner_a_paid_at TEXT")
    if "owner_b_paid_at" not in existing_splits_now:
        conn.execute("ALTER TABLE splits ADD COLUMN owner_b_paid_at TEXT")

    # sales.item_id used to be a plain UNIQUE column — refunds need it relaxed to "at
    # most one active sale per item" (see the partial index below), which SQLite can't
    # express via ALTER TABLE, so existing databases get a one-time table rebuild here.
    existing_sales = {row["name"] for row in conn.execute("PRAGMA table_info(sales)")}
    if "catalog_price" not in existing_sales:
        conn.execute("PRAGMA foreign_keys = OFF")
        conn.execute("ALTER TABLE sales RENAME TO sales_old")
        conn.execute(
            """
            CREATE TABLE sales (
                id INTEGER PRIMARY KEY,
                item_id INTEGER NOT NULL REFERENCES items(id),
                sale_price REAL NOT NULL,
                catalog_price REAL NOT NULL,
                discount_reason TEXT,
                payment_method TEXT,
                sold_by_owner_id INTEGER REFERENCES owners(id),
                sale_date TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                voided_at TEXT
            )
            """
        )
        conn.execute(
            """
            INSERT INTO sales (id, item_id, sale_price, catalog_price, sale_date)
            SELECT id, item_id, sale_price, sale_price, sale_date FROM sales_old
            """
        )
        conn.execute("DROP TABLE sales_old")
        conn.execute("PRAGMA foreign_keys = ON")

    # A cart checkout (multiple items, one payment/seller) needs payment_method and
    # sold_by_owner_id to live on a shared receipt rather than repeated per sale row —
    # re-check the table shape fresh here since the rebuild above may have just run.
    existing_sales_now = {row["name"] for row in conn.execute("PRAGMA table_info(sales)")}
    if "receipt_id" not in existing_sales_now:
        old_sales = conn.execute("SELECT id, payment_method, sold_by_owner_id, sale_date FROM sales").fetchall()
        receipt_id_by_sale_id = {}
        for row in old_sales:
            cur = conn.execute(
                "INSERT INTO receipts (payment_method, sold_by_owner_id, created_at) VALUES (?, ?, ?)",
                (row["payment_method"], row["sold_by_owner_id"], row["sale_date"]),
            )
            receipt_id_by_sale_id[row["id"]] = cur.lastrowid

        conn.execute("PRAGMA foreign_keys = OFF")
        conn.execute("ALTER TABLE sales RENAME TO sales_old")
        conn.execute(
            """
            CREATE TABLE sales (
                id INTEGER PRIMARY KEY,
                item_id INTEGER NOT NULL REFERENCES items(id),
                sale_price REAL NOT NULL,
                catalog_price REAL NOT NULL,
                discount_reason TEXT,
                receipt_id INTEGER NOT NULL REFERENCES receipts(id),
                sale_date TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                voided_at TEXT
            )
            """
        )
        for row in conn.execute("SELECT * FROM sales_old").fetchall():
            conn.execute(
                """
                INSERT INTO sales (id, item_id, sale_price, catalog_price, discount_reason, receipt_id, sale_date, voided_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    row["id"],
                    row["item_id"],
                    row["sale_price"],
                    row["catalog_price"],
                    row["discount_reason"],
                    receipt_id_by_sale_id[row["id"]],
                    row["sale_date"],
                    row["voided_at"],
                ),
            )
        conn.execute("DROP TABLE sales_old")
        conn.execute("PRAGMA foreign_keys = ON")

    # A receipt's total can now be split across multiple payment methods, stored as
    # rows in receipt_payments instead of a single scalar column on receipts — same
    # rebuild SQLite forces for any column drop. Existing receipts get backfilled into
    # one receipt_payments row apiece (amount = their sales' total) before the column
    # is dropped, so historical sales keep showing what was actually paid.
    existing_receipts = {row["name"] for row in conn.execute("PRAGMA table_info(receipts)")}
    if "payment_method" in existing_receipts:
        for row in conn.execute("SELECT id, payment_method FROM receipts").fetchall():
            if row["payment_method"] is None:
                continue
            total = conn.execute(
                "SELECT COALESCE(SUM(sale_price), 0) AS total FROM sales WHERE receipt_id = ?", (row["id"],)
            ).fetchone()["total"]
            conn.execute(
                "INSERT INTO receipt_payments (receipt_id, payment_method, amount) VALUES (?, ?, ?)",
                (row["id"], row["payment_method"], total),
            )

        # foreign_keys can only be toggled outside a transaction — the backfill INSERTs
        # above opened an implicit one, so this commit is required or the OFF below
        # silently no-ops and the DROP TABLE later fails on receipt_payments' FK.
        conn.commit()
        conn.execute("PRAGMA foreign_keys = OFF")
        conn.execute("ALTER TABLE receipts RENAME TO receipts_old")
        conn.execute(
            """
            CREATE TABLE receipts (
                id INTEGER PRIMARY KEY,
                sold_by_owner_id INTEGER REFERENCES owners(id),
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
            """
        )
        conn.execute(
            """
            INSERT INTO receipts (id, sold_by_owner_id, created_at)
            SELECT id, sold_by_owner_id, created_at FROM receipts_old
            """
        )
        conn.execute("DROP TABLE receipts_old")
        conn.execute("PRAGMA foreign_keys = ON")

    # Created here rather than in SCHEMA: on an existing (not-yet-rebuilt) database,
    # create_schema() runs before this function and would fail referencing voided_at on
    # the still-old table shape. By this point sales always has the new columns, whether
    # freshly created above or rebuilt just above.
    conn.execute("CREATE UNIQUE INDEX IF NOT EXISTS idx_sales_active_item ON sales(item_id) WHERE voided_at IS NULL")

    conn.commit()


def seed_owners(conn: sqlite3.Connection) -> None:
    if conn.execute("SELECT COUNT(*) FROM owners").fetchone()[0]:
        return
    conn.execute("INSERT INTO owners (name, is_cut_owner) VALUES ('Dona A', 1)")
    conn.execute("INSERT INTO owners (name, is_cut_owner) VALUES ('Dona B', 0)")
    conn.commit()
