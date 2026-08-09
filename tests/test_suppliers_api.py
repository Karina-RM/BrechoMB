from datetime import datetime, timedelta

import backend.db as db
from tests.conftest import checkout, create_item


def _backdate(conn, table, id_column, item_id, date_column, days_ago):
    conn.execute(
        f"UPDATE {table} SET {date_column} = ? WHERE {id_column} = ?",
        ((datetime.now() - timedelta(days=days_ago)).strftime("%Y-%m-%d %H:%M:%S"), item_id),
    )


def test_supplier_reliability_classifies_pieces_by_the_one_week_window(client):
    # AUDIT.md §3.4c, user-confirmed rule: a piece is "bad" if not sold within a week
    # of intake. Five pieces, one in each bucket the endpoint should classify:
    supplier = client.post(
        "/api/suppliers", json={"name": "Fornecedora Teste", "owner_id": 1, "commission_pct": 10}
    ).json()

    sold_fast = create_item(client, supplier_id=supplier["id"])  # sold 3 days after intake
    sold_late = create_item(client, supplier_id=supplier["id"])  # sold 10 days after intake
    withdrawn = create_item(client, supplier_id=supplier["id"])  # never sold, withdrawn
    overdue_in_stock = create_item(client, supplier_id=supplier["id"])  # still in stock, 10 days old
    too_soon_in_stock = create_item(client, supplier_id=supplier["id"])  # still in stock, 2 days old

    conn = db.get_connection()
    _backdate(conn, "items", "id", sold_fast["id"], "intake_date", 10)
    _backdate(conn, "items", "id", sold_late["id"], "intake_date", 20)
    _backdate(conn, "items", "id", withdrawn["id"], "intake_date", 15)
    _backdate(conn, "items", "id", overdue_in_stock["id"], "intake_date", 10)
    _backdate(conn, "items", "id", too_soon_in_stock["id"], "intake_date", 2)
    conn.commit()
    conn.close()

    checkout(client, sold_fast["id"])
    checkout(client, sold_late["id"])
    assert client.post(f"/api/items/{withdrawn['id']}/withdraw").status_code == 200

    conn = db.get_connection()
    _backdate(conn, "sales", "item_id", sold_fast["id"], "sale_date", 7)  # 10 - 7 = 3 days
    _backdate(conn, "sales", "item_id", sold_late["id"], "sale_date", 10)  # 20 - 10 = 10 days
    conn.commit()
    conn.close()

    reliability = client.get(f"/api/suppliers/{supplier['id']}").json()["reliability"]
    assert reliability == {
        "window_days": 7,
        "sold_within_window": 1,
        "sold_late": 1,
        "withdrawn_unsold": 1,
        "pending_overdue": 1,
        "judged_total": 4,
        "reliability_pct": 25.0,
    }


def test_supplier_reliability_is_null_with_no_judged_pieces_yet(client):
    supplier = client.post(
        "/api/suppliers", json={"name": "Fornecedora Nova", "owner_id": 1, "commission_pct": 10}
    ).json()
    create_item(client, supplier_id=supplier["id"])  # freshly intaken, still within the window

    reliability = client.get(f"/api/suppliers/{supplier['id']}").json()["reliability"]
    assert reliability["judged_total"] == 0
    assert reliability["reliability_pct"] is None
