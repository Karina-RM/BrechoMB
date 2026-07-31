from typing import Optional

OWNER_A_CUT_PCT = 20


def calculate_split(
    *, side: str, sale_price: float, commission_pct: float = 0.0, single_owner: Optional[str] = None
) -> dict:
    """Split a sale's proceeds between Owner A, Owner B, and the supplier (if any).

    `side` is whose side the item belongs to ('A' or 'B'), regardless of whether
    it's a garimpada piece (commission_pct=0) or a consigned supplier piece.

    `single_owner`, if set, means the other owner has left the business: whichever
    owner it names gets the full remainder (sale price minus supplier commission),
    regardless of `side` — suppliers still get paid their commission as usual.
    """
    if side not in ("A", "B"):
        raise ValueError(f"side must be 'A' or 'B', got {side!r}")
    if single_owner is not None and single_owner not in ("A", "B"):
        raise ValueError(f"single_owner must be 'A', 'B', or None, got {single_owner!r}")
    if commission_pct < 0:
        raise ValueError("commission_pct cannot be negative")

    supplier_amount = round(sale_price * commission_pct / 100, 2)

    if single_owner is not None:
        remainder = round(sale_price - supplier_amount, 2)
        owner_a = remainder if single_owner == "A" else 0.0
        owner_b = remainder if single_owner == "B" else 0.0
    elif side == "A":
        owner_a = round(sale_price - supplier_amount, 2)
        owner_b = 0.0
    else:
        owner_a = round(sale_price * OWNER_A_CUT_PCT / 100, 2)
        owner_b = round(sale_price - owner_a - supplier_amount, 2)

    return {"owner_a": owner_a, "owner_b": owner_b, "supplier": supplier_amount}
