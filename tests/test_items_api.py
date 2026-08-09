from tests.conftest import checkout, create_item


def test_create_item_requires_exactly_one_of_owner_or_supplier(client):
    res = client.post("/api/items", data={"department": "Roupas e Acessórios", "price": "50.0"})
    assert res.status_code == 400

    supplier = client.post(
        "/api/suppliers", json={"name": "Fornecedora Teste", "owner_id": 1, "commission_pct": 10}
    ).json()
    res = client.post(
        "/api/items",
        data={
            "owner_id": "1",
            "supplier_id": str(supplier["id"]),
            "department": "Roupas e Acessórios",
            "price": "50.0",
        },
    )
    assert res.status_code == 400


def test_update_item_on_sold_item_rejected(client):
    item = create_item(client)
    checkout(client, item["id"])

    res = client.patch(f"/api/items/{item['id']}", json={"price": 200.0, "edited_by_owner_id": 1})
    assert res.status_code == 400


def test_update_item_records_edit_history_with_old_and_new_values(client):
    item = create_item(client, brand="Marca X")

    res = client.patch(f"/api/items/{item['id']}", json={"brand": "Marca Y", "edited_by_owner_id": 1})
    assert res.status_code == 200

    detail = client.get(f"/api/items/{item['id']}").json()
    edit = detail["edits"][0]
    assert edit["field"] == "brand"
    assert edit["old_value"] == "Marca X"
    assert edit["new_value"] == "Marca Y"
    assert edit["edited_by_owner_name"] == "Dona A"


def test_update_item_rejects_department_change_incompatible_with_current_category(client):
    item = create_item(client, department="Roupas e Acessórios", category="Vestido")

    res = client.patch(
        f"/api/items/{item['id']}",
        json={"department": "Livros e Mídia", "edited_by_owner_id": 1},
    )
    assert res.status_code == 400


def test_sku_generation_does_not_collide_after_admin_hard_delete(client, admin_password):
    # AUDIT.md §1.3: SKU used to be COUNT(*)-based, which undercounts after a hard
    # delete and collides with the UNIQUE constraint on the next create.
    item1 = create_item(client)
    item2 = create_item(client)
    item3 = create_item(client)
    assert [item1["sku"], item2["sku"], item3["sku"]] == ["A-0001", "A-0002", "A-0003"]

    client.post("/api/admin/login", json={"password": admin_password})
    res = client.delete(f"/api/admin/tables/items/rows/{item2['id']}")
    assert res.status_code == 200

    item4 = create_item(client)
    assert item4["sku"] == "A-0004"
