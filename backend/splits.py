OWNER_A_CUT_PCT = 20


def calculate_split(*, side: str, sale_price: float, commission_pct: float = 0.0) -> dict:
    """Split a sale's proceeds between Owner A, Owner B, and the supplier (if any).

    `side` is whose side the item belongs to ('A' or 'B'), regardless of whether
    it's a garimpada piece (commission_pct=0) or a consigned supplier piece.
    """
    if side not in ("A", "B"):
        raise ValueError(f"side must be 'A' or 'B', got {side!r}")
    if commission_pct < 0:
        raise ValueError("commission_pct cannot be negative")

    supplier_amount = round(sale_price * commission_pct / 100, 2)

    if side == "A":
        owner_a = round(sale_price - supplier_amount, 2)
        owner_b = 0.0
    else:
        owner_a = round(sale_price * OWNER_A_CUT_PCT / 100, 2)
        owner_b = round(sale_price - owner_a - supplier_amount, 2)

    return {"owner_a": owner_a, "owner_b": owner_b, "supplier": supplier_amount}
