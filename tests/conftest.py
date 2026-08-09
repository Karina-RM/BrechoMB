import secrets

import pytest
from fastapi.testclient import TestClient

import backend.db as db
from backend.admin_auth import hash_password


@pytest.fixture()
def client(tmp_path, monkeypatch):
    """Isolated backend for one test: DB_PATH points at a throwaway file under
    pytest's tmp_path, never the real data/brecho.db. Each test gets a fresh database
    (schema created, Dona A / Dona B seeded) via the app's own startup event."""
    monkeypatch.setattr(db, "DB_PATH", tmp_path / "test.db")
    from backend.main import app

    with TestClient(app) as test_client:
        yield test_client


@pytest.fixture()
def admin_password(client):
    """Seeds an admin_auth row directly — bypassing the interactive
    set_admin_password.py CLI — and returns the plaintext password to log in with."""
    password = "test-admin-password"
    salt = secrets.token_hex(16)
    conn = db.get_connection()
    try:
        conn.execute(
            "INSERT OR REPLACE INTO admin_auth (id, password_hash, salt) VALUES (1, ?, ?)",
            (hash_password(password, salt), salt),
        )
        conn.commit()
    finally:
        conn.close()
    return password


def create_item(client, **overrides):
    """Minimal valid item via the multipart /api/items endpoint, owned directly by
    Dona A (id=1, side A) by default. Pass supplier_id=<id> for a supplier-consigned
    piece instead (owner_id is dropped automatically in that case)."""
    payload = {"owner_id": 1, "department": "Roupas e Acessórios", "price": 100.0}
    payload.update(overrides)
    if "supplier_id" in overrides:
        payload.pop("owner_id", None)
    payload = {k: str(v) for k, v in payload.items() if v is not None}
    res = client.post("/api/items", data=payload)
    assert res.status_code == 200, res.text
    return res.json()


def checkout(client, item_id, sale_price=100.0, sold_by_owner_id=1, payment_method="Pix"):
    res = client.post(
        "/api/sales",
        json={
            "items": [{"item_id": item_id, "sale_price": sale_price}],
            "payments": [{"payment_method": payment_method, "amount": sale_price}],
            "sold_by_owner_id": sold_by_owner_id,
        },
    )
    assert res.status_code == 200, res.text
    return res.json()[0]
