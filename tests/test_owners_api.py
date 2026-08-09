from tests.conftest import checkout, create_item


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
