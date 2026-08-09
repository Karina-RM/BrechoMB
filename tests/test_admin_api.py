def test_admin_endpoint_requires_auth_cookie(client):
    res = client.get("/api/admin/tables")
    assert res.status_code == 401


def test_admin_login_with_wrong_password_rejected(client, admin_password):
    res = client.post("/api/admin/login", json={"password": "senha errada"})
    assert res.status_code == 401


def test_admin_rejects_table_outside_allow_list(client, admin_password):
    login = client.post("/api/admin/login", json={"password": admin_password})
    assert login.status_code == 200

    # admin_auth itself is the one table deliberately excluded from ADMIN_TABLES —
    # its own CRUD must never be able to read/edit/delete the admin credential.
    res = client.get("/api/admin/tables/admin_auth/rows")
    assert res.status_code == 404
