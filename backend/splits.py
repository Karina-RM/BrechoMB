from typing import Optional

OWNER_A_CUT_PCT = 20


def calculate_split(
    *, side: str, sale_cents: int, commission_pct: float = 0.0, single_owner: Optional[str] = None
) -> dict:
    """Split a sale's proceeds (in integer cents) between Owner A, Owner B, and the
    supplier (if any). Returns integer cents for all three — never floats, so the
    three parts always sum to exactly `sale_cents` with no rounding drift.

    `side` is whose side the item belongs to ('A' or 'B'), regardless of whether
    it's a garimpada piece (commission_pct=0) or a consigned supplier piece.

    `single_owner`, if set, means the other owner has left the business: whichever
    owner it names gets the full remainder (sale price minus supplier commission),
    regardless of `side` — suppliers still get paid their commission as usual.

    Rounding policy: the supplier's commission and Owner A's 20% cut are each
    floor-divided in cents (commission via basis points, to avoid float error from
    commission_pct itself); whatever's left after that always goes to the owner on
    the item's own side (or the sole remaining owner) — never split further or
    independently rounded, which is what guarantees the exact-sum invariant.
    """
    if side not in ("A", "B"):
        raise ValueError(f"side must be 'A' or 'B', got {side!r}")
    if single_owner is not None and single_owner not in ("A", "B"):
        raise ValueError(f"single_owner must be 'A', 'B', or None, got {single_owner!r}")
    if commission_pct < 0:
        raise ValueError("commission_pct cannot be negative")

    commission_bp = round(commission_pct * 100)
    supplier_amount = (sale_cents * commission_bp) // 10_000

    if single_owner is not None:
        remainder = sale_cents - supplier_amount
        owner_a = remainder if single_owner == "A" else 0
        owner_b = remainder if single_owner == "B" else 0
    elif side == "A":
        owner_a = sale_cents - supplier_amount
        owner_b = 0
    else:
        owner_a = (sale_cents * OWNER_A_CUT_PCT) // 100
        owner_b = sale_cents - owner_a - supplier_amount

    return {"owner_a": owner_a, "owner_b": owner_b, "supplier": supplier_amount}
