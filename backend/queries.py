from backend.money import to_reais

# Shared between routers/sales.py (checkout, list, void, payouts) and routers/items.py
# (item detail's embedded sale) — AUDIT.md §2.3: items.py used to reach into sales.py's
# own private helpers for these instead of a shared module.

SALE_SELECT = """
    SELECT sales.id, sales.item_id, sales.sale_price, sales.catalog_price, sales.discount_reason,
           sales.receipt_id, sales.sale_date, sales.voided_at,
           items.sku,
           sold_by.name AS sold_by_owner_name,
           splits.owner_a_amount, splits.owner_b_amount, splits.supplier_amount
    FROM sales
    JOIN items ON items.id = sales.item_id
    JOIN splits ON splits.sale_id = sales.id
    JOIN receipts ON receipts.id = sales.receipt_id
    LEFT JOIN owners AS sold_by ON sold_by.id = receipts.sold_by_owner_id
"""


def _payments_by_receipt(conn, receipt_ids) -> dict:
    """One row per sale's receipt can carry several payment methods — fetched
    separately (rather than joined into SALE_SELECT) so a 3-way split doesn't
    multiply that sale into 3 rows."""
    receipt_ids = list({r for r in receipt_ids})
    if not receipt_ids:
        return {}
    rows = conn.execute(
        f"""
        SELECT receipt_id, payment_method, amount FROM receipt_payments
        WHERE receipt_id IN ({','.join('?' * len(receipt_ids))})
        ORDER BY id
        """,
        receipt_ids,
    ).fetchall()
    result: dict = {}
    for r in rows:
        result.setdefault(r["receipt_id"], []).append(
            {"payment_method": r["payment_method"], "amount": to_reais(r["amount"])}
        )
    return result


def _row_to_sale(row, payments_by_receipt) -> dict:
    data = dict(row)
    return {
        "id": data["id"],
        "item_id": data["item_id"],
        "sku": data["sku"],
        "sale_price": to_reais(data["sale_price"]),
        "catalog_price": to_reais(data["catalog_price"]),
        "discount_reason": data["discount_reason"],
        "receipt_id": data["receipt_id"],
        "payment_methods": payments_by_receipt.get(data["receipt_id"], []),
        "sold_by_owner_name": data["sold_by_owner_name"],
        "sale_date": data["sale_date"],
        "voided_at": data["voided_at"],
        "split": {
            "owner_a": to_reais(data["owner_a_amount"]),
            "owner_b": to_reais(data["owner_b_amount"]),
            "supplier": to_reais(data["supplier_amount"]),
        },
    }
