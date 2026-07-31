from backend.splits import calculate_split


def test_owner_b_supplier_piece():
    # roadmap.md worked example: supplier piece on Owner B's side, P=100, commission=30%
    result = calculate_split(side="B", sale_price=100, commission_pct=30)
    assert result == {"owner_a": 20.0, "owner_b": 50.0, "supplier": 30.0}


def test_owner_b_own_garimpada():
    # roadmap.md worked example: Owner B's own garimpada piece, P=100
    result = calculate_split(side="B", sale_price=100, commission_pct=0)
    assert result == {"owner_a": 20.0, "owner_b": 80.0, "supplier": 0.0}


def test_owner_a_own_garimpada():
    # roadmap.md worked example: Owner A's own garimpada piece, P=100
    result = calculate_split(side="A", sale_price=100, commission_pct=0)
    assert result == {"owner_a": 100.0, "owner_b": 0.0, "supplier": 0.0}


def test_owner_a_supplier_piece():
    # roadmap.md resolved decision: no 20% cut on Owner A's own supplier pieces
    result = calculate_split(side="A", sale_price=100, commission_pct=25)
    assert result == {"owner_a": 75.0, "owner_b": 0.0, "supplier": 25.0}


def test_rejects_invalid_side():
    try:
        calculate_split(side="C", sale_price=100)
    except ValueError:
        return
    assert False, "expected ValueError for invalid side"


def test_rejects_negative_commission():
    try:
        calculate_split(side="A", sale_price=100, commission_pct=-5)
    except ValueError:
        return
    assert False, "expected ValueError for negative commission_pct"


def test_single_owner_a_gets_full_remainder_regardless_of_side():
    # Owner B has left: even a nominally Owner-B-side garimpada piece pays Owner A in full.
    result = calculate_split(side="B", sale_price=100, commission_pct=0, single_owner="A")
    assert result == {"owner_a": 100.0, "owner_b": 0.0, "supplier": 0.0}


def test_single_owner_a_still_pays_supplier_commission():
    # Supplier deals are unaffected by the ownership change — commission still comes off the top.
    result = calculate_split(side="B", sale_price=100, commission_pct=30, single_owner="A")
    assert result == {"owner_a": 70.0, "owner_b": 0.0, "supplier": 30.0}


def test_single_owner_b_gets_full_remainder():
    # Symmetric case, in case it's ever Owner A who departs instead.
    result = calculate_split(side="A", sale_price=100, commission_pct=10, single_owner="B")
    assert result == {"owner_a": 0.0, "owner_b": 90.0, "supplier": 10.0}


def test_rejects_invalid_single_owner():
    try:
        calculate_split(side="A", sale_price=100, single_owner="C")
    except ValueError:
        return
    assert False, "expected ValueError for invalid single_owner"
