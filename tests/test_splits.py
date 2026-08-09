import pytest

from backend.splits import calculate_split


def test_owner_b_supplier_piece():
    # roadmap.md worked example: supplier piece on Owner B's side, P=R$100, commission=30%
    result = calculate_split(side="B", sale_cents=10_000, commission_pct=30)
    assert result == {"owner_a": 2_000, "owner_b": 5_000, "supplier": 3_000}


def test_owner_b_own_garimpada():
    # roadmap.md worked example: Owner B's own garimpada piece, P=R$100
    result = calculate_split(side="B", sale_cents=10_000, commission_pct=0)
    assert result == {"owner_a": 2_000, "owner_b": 8_000, "supplier": 0}


def test_owner_a_own_garimpada():
    # roadmap.md worked example: Owner A's own garimpada piece, P=R$100
    result = calculate_split(side="A", sale_cents=10_000, commission_pct=0)
    assert result == {"owner_a": 10_000, "owner_b": 0, "supplier": 0}


def test_owner_a_supplier_piece():
    # roadmap.md resolved decision: no 20% cut on Owner A's own supplier pieces
    result = calculate_split(side="A", sale_cents=10_000, commission_pct=25)
    assert result == {"owner_a": 7_500, "owner_b": 0, "supplier": 2_500}


def test_rejects_invalid_side():
    with pytest.raises(ValueError):
        calculate_split(side="C", sale_cents=10_000)


def test_rejects_negative_commission():
    with pytest.raises(ValueError):
        calculate_split(side="A", sale_cents=10_000, commission_pct=-5)


def test_single_owner_a_gets_full_remainder_regardless_of_side():
    # Owner B has left: even a nominally Owner-B-side garimpada piece pays Owner A in full.
    result = calculate_split(side="B", sale_cents=10_000, commission_pct=0, single_owner="A")
    assert result == {"owner_a": 10_000, "owner_b": 0, "supplier": 0}


def test_single_owner_a_still_pays_supplier_commission():
    # Supplier deals are unaffected by the ownership change — commission still comes off the top.
    result = calculate_split(side="B", sale_cents=10_000, commission_pct=30, single_owner="A")
    assert result == {"owner_a": 7_000, "owner_b": 0, "supplier": 3_000}


def test_single_owner_b_gets_full_remainder():
    # Symmetric case, in case it's ever Owner A who departs instead.
    result = calculate_split(side="A", sale_cents=10_000, commission_pct=10, single_owner="B")
    assert result == {"owner_a": 0, "owner_b": 9_000, "supplier": 1_000}


def test_rejects_invalid_single_owner():
    with pytest.raises(ValueError):
        calculate_split(side="A", sale_cents=10_000, single_owner="C")


def test_sum_is_always_exact_with_odd_cents_and_fractional_commission():
    # AUDIT.md §0.1: sale_price=R$9,99 (999 cents), commission=33.33% — a case picked
    # specifically because independent per-part rounding would NOT sum back to 999.
    result = calculate_split(side="B", sale_cents=999, commission_pct=33.33)
    assert result["owner_a"] + result["owner_b"] + result["supplier"] == 999


@pytest.mark.parametrize("commission_pct", [0, 10, 25, 33.33, 100])
@pytest.mark.parametrize("side", ["A", "B"])
def test_sum_is_exact_across_a_wide_sweep_of_amounts(side, commission_pct):
    # AUDIT.md §0.2 acceptance: exact-sum invariant swept across a wide cent range,
    # not just a handful of hand-picked examples.
    for sale_cents in range(1, 10_001):
        result = calculate_split(side=side, sale_cents=sale_cents, commission_pct=commission_pct)
        assert result["owner_a"] + result["owner_b"] + result["supplier"] == sale_cents
