def to_cents(reais: float) -> int:
    """Converts a reais amount (as accepted/returned by the API) to integer cents (as
    stored in the database). AUDIT.md §0.1 — money is never stored as float."""
    return round(reais * 100)


def to_reais(cents: int) -> float:
    """Converts integer cents (as stored in the database) back to reais for the API
    boundary. AUDIT.md §0.1."""
    return round(cents / 100, 2)
