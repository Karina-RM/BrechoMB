import time

import backend.routers.owners as owners_router
from tests.conftest import checkout, create_item


def test_pin_is_hashed_and_verified_correctly(client):
    res = client.patch("/api/owners/1", json={"pin": "1234"})
    assert res.status_code == 200
    assert res.json()["has_pin"] is True
    assert "pin" not in res.json()
    assert "pin_hash" not in res.json()

    assert client.post("/api/owners/1/verify-pin", json={"pin": "1234"}).status_code == 200
    assert client.post("/api/owners/1/verify-pin", json={"pin": "0000"}).status_code == 401


def test_pin_lockout_after_five_wrong_attempts(client, monkeypatch):
    # AUDIT.md §2.2 acceptance: 6th attempt (even with the right PIN) -> 429; after the
    # lockout window passes, the right PIN succeeds. Lockout shortened for the test.
    owners_router._pin_state.clear()
    monkeypatch.setattr(owners_router, "PIN_LOCKOUT_SECONDS", 0.05)
    client.patch("/api/owners/1", json={"pin": "1234"})

    for _ in range(owners_router.PIN_MAX_ATTEMPTS):
        assert client.post("/api/owners/1/verify-pin", json={"pin": "0000"}).status_code == 401

    res = client.post("/api/owners/1/verify-pin", json={"pin": "1234"})
    assert res.status_code == 429

    time.sleep(0.06)
    res = client.post("/api/owners/1/verify-pin", json={"pin": "1234"})
    assert res.status_code == 200


def test_admin_panel_never_exposes_pin_hash_or_salt(client, admin_password):
    client.patch("/api/owners/1", json={"pin": "1234"})
    client.post("/api/admin/login", json={"password": admin_password})

    rows = client.get("/api/admin/tables/owners/rows").json()
    owner = next(r for r in rows if r["id"] == 1)
    assert owner["pin_hash"] == "***"
    assert owner["pin_salt"] == "***"


def test_single_owner_scenario_gives_full_split_to_remaining_owner(client):
    # Deactivate Dona B (id=2, side B) — Dona A (id=1) must get the full sale price
    # even for an item nominally on Dona B's own side.
    res = client.patch("/api/owners/2", json={"active": False})
    assert res.status_code == 200

    item = create_item(client, owner_id=2)
    sale = checkout(client, item["id"], sale_price=100.0)
    assert sale["split"] == {"owner_a": 100.0, "owner_b": 0.0, "supplier": 0.0}


def test_cannot_deactivate_the_only_active_owner(client):
    client.patch("/api/owners/2", json={"active": False})

    res = client.patch("/api/owners/1", json={"active": False})
    assert res.status_code == 400
