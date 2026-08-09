from tests.conftest import checkout, create_item


def test_checkout_rolls_back_entire_cart_if_any_item_unavailable(client):
    item1 = create_item(client)
    item2 = create_item(client)
    # Sell item2 ahead of time so the cart below hits it as already unavailable.
    checkout(client, item2["id"])

    res = client.post(
        "/api/sales",
        json={
            "items": [
                {"item_id": item1["id"], "sale_price": 100.0},
                {"item_id": item2["id"], "sale_price": 100.0},
            ],
            "payments": [{"payment_method": "Pix", "amount": 200.0}],
            "sold_by_owner_id": 1,
        },
    )
    assert res.status_code == 400

    item1_after = client.get(f"/api/items/{item1['id']}").json()
    assert item1_after["status"] == "in_stock"


def test_checkout_freezes_supplier_commission_at_sale_time(client):
    supplier = client.post(
        "/api/suppliers", json={"name": "Fornecedora Teste", "owner_id": 1, "commission_pct": 25}
    ).json()
    item = create_item(client, supplier_id=supplier["id"])

    sale = checkout(client, item["id"], sale_price=100.0)
    assert sale["split"]["supplier"] == 25.0

    client.patch(f"/api/suppliers/{supplier['id']}", json={"commission_pct": 90})

    sales = client.get("/api/sales").json()
    resold = next(s for s in sales if s["id"] == sale["id"])
    assert resold["split"]["supplier"] == 25.0


def test_void_reopens_item_and_allows_resale(client):
    item = create_item(client)
    sale = checkout(client, item["id"])

    res = client.post(f"/api/sales/{sale['id']}/void")
    assert res.status_code == 200

    item_after = client.get(f"/api/items/{item['id']}").json()
    assert item_after["status"] == "in_stock"

    second_sale = checkout(client, item["id"])
    assert second_sale["id"] != sale["id"]
