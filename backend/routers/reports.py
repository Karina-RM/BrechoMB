from typing import List, Optional

from fastapi import APIRouter, HTTPException

from backend.db import get_connection
from backend.money import to_reais
from backend.schemas import CategoryReportRow, ReportSummaryOut, SupplierReportRow, TimelineRow

router = APIRouter(prefix="/api/reports", tags=["reports"])


def _report_filters(
    start_date: Optional[str],
    end_date: Optional[str],
    department: Optional[str],
    owner_id: Optional[int],
    supplier_id: Optional[int],
) -> tuple[str, list]:
    """Shared WHERE fragment for every report query below — every endpoint accepts the
    same date-range/department/owner/supplier slice, so this is built once instead of
    four times. Callers must join `items` (on `items.id = sales.item_id`) for the
    department/owner/supplier clauses to resolve."""
    clauses = ["sales.voided_at IS NULL"]
    params: list = []
    if start_date:
        clauses.append("date(sales.sale_date) >= date(?)")
        params.append(start_date)
    if end_date:
        clauses.append("date(sales.sale_date) <= date(?)")
        params.append(end_date)
    if department:
        clauses.append("items.department = ?")
        params.append(department)
    if supplier_id:
        clauses.append("items.supplier_id = ?")
        params.append(supplier_id)
    if owner_id:
        # Which side the piece belongs to: garimpada peça owned directly, or a
        # supplier-consigned peça whose supplier is affiliated with that owner.
        clauses.append(
            "(items.owner_id = ? OR EXISTS ("
            "SELECT 1 FROM suppliers WHERE suppliers.id = items.supplier_id AND suppliers.owner_id = ?"
            "))"
        )
        params.extend([owner_id, owner_id])
    return " AND ".join(clauses), params


@router.get("/summary", response_model=ReportSummaryOut)
def summary(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    department: Optional[str] = None,
    owner_id: Optional[int] = None,
    supplier_id: Optional[int] = None,
):
    conn = get_connection()
    try:
        owners = {r["is_cut_owner"]: r["name"] for r in conn.execute("SELECT name, is_cut_owner FROM owners")}
        where, params = _report_filters(start_date, end_date, department, owner_id, supplier_id)
        totals = conn.execute(
            f"""
            SELECT COUNT(*) AS total_sales,
                   COALESCE(SUM(sales.sale_price), 0) AS total_revenue,
                   COALESCE(SUM(splits.owner_a_amount), 0) AS owner_a_earnings,
                   COALESCE(SUM(splits.owner_b_amount), 0) AS owner_b_earnings,
                   COALESCE(SUM(CASE WHEN splits.owner_a_paid_at IS NOT NULL THEN splits.owner_a_amount ELSE 0 END), 0)
                       AS owner_a_paid,
                   COALESCE(SUM(CASE WHEN splits.owner_b_paid_at IS NOT NULL THEN splits.owner_b_amount ELSE 0 END), 0)
                       AS owner_b_paid,
                   COALESCE(SUM(splits.supplier_amount), 0) AS supplier_commission_total,
                   COALESCE(SUM(CASE WHEN splits.paid_at IS NOT NULL THEN splits.supplier_amount ELSE 0 END), 0)
                       AS supplier_commission_paid
            FROM sales
            JOIN splits ON splits.sale_id = sales.id
            JOIN items ON items.id = sales.item_id
            WHERE {where}
            """,
            params,
        ).fetchone()

        # Summed in cents (COALESCE/SUM above), converted to reais once here — AUDIT.md
        # §0.1. owner_payout_total/paid are combined across both donas — deliberately not
        # split by identity, so this figure stays safe for the shop-wide Relatórios
        # landing page (see frontend loadReportSummary). Per-owner breakdown lives in
        # Proprietárias.
        owner_a_earnings = to_reais(totals["owner_a_earnings"])
        owner_b_earnings = to_reais(totals["owner_b_earnings"])
        owner_payout_paid = to_reais(totals["owner_a_paid"] + totals["owner_b_paid"])
        supplier_commission_total = to_reais(totals["supplier_commission_total"])
        supplier_commission_paid = to_reais(totals["supplier_commission_paid"])
        owner_payout_total = round(owner_a_earnings + owner_b_earnings, 2)

        return {
            "total_sales": totals["total_sales"],
            "total_revenue": to_reais(totals["total_revenue"]),
            "owner_a_name": owners.get(1, "Dona A"),
            "owner_a_earnings": owner_a_earnings,
            "owner_b_name": owners.get(0, "Dona B"),
            "owner_b_earnings": owner_b_earnings,
            "owner_payout_total": owner_payout_total,
            "owner_payout_paid": owner_payout_paid,
            "owner_payout_pending": round(owner_payout_total - owner_payout_paid, 2),
            "supplier_commission_total": supplier_commission_total,
            "supplier_commission_paid": supplier_commission_paid,
            "supplier_commission_pending": round(supplier_commission_total - supplier_commission_paid, 2),
        }
    finally:
        conn.close()


@router.get("/by-category", response_model=List[CategoryReportRow])
def by_category(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    department: Optional[str] = None,
    owner_id: Optional[int] = None,
    supplier_id: Optional[int] = None,
):
    conn = get_connection()
    try:
        where, params = _report_filters(start_date, end_date, department, owner_id, supplier_id)
        rows = conn.execute(
            f"""
            SELECT items.category AS category, COUNT(*) AS count, SUM(sales.sale_price) AS total_revenue
            FROM sales
            JOIN items ON items.id = sales.item_id
            WHERE {where}
            GROUP BY items.category
            ORDER BY total_revenue DESC
            """,
            params,
        ).fetchall()
        return [{**dict(r), "total_revenue": to_reais(r["total_revenue"])} for r in rows]
    finally:
        conn.close()


@router.get("/by-supplier", response_model=List[SupplierReportRow])
def by_supplier(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    department: Optional[str] = None,
    owner_id: Optional[int] = None,
    supplier_id: Optional[int] = None,
):
    conn = get_connection()
    try:
        where, params = _report_filters(start_date, end_date, department, owner_id, supplier_id)
        rows = conn.execute(
            f"""
            SELECT suppliers.id AS supplier_id, suppliers.name AS supplier_name, owners.name AS owner_name,
                   COUNT(*) AS count, SUM(sales.sale_price) AS total_revenue,
                   SUM(splits.supplier_amount) AS total_commission
            FROM splits
            JOIN sales ON sales.id = splits.sale_id
            JOIN items ON items.id = sales.item_id
            JOIN suppliers ON suppliers.id = splits.supplier_id
            JOIN owners ON owners.id = suppliers.owner_id
            WHERE {where}
            GROUP BY suppliers.id
            ORDER BY total_revenue DESC
            """,
            params,
        ).fetchall()
        return [
            {**dict(r), "total_revenue": to_reais(r["total_revenue"]), "total_commission": to_reais(r["total_commission"])}
            for r in rows
        ]
    finally:
        conn.close()


@router.get("/timeline", response_model=List[TimelineRow])
def timeline(
    granularity: str = "month",
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    department: Optional[str] = None,
    owner_id: Optional[int] = None,
    supplier_id: Optional[int] = None,
):
    if granularity not in ("day", "month"):
        raise HTTPException(400, "granularity deve ser 'day' ou 'month'")
    date_format = "%Y-%m-%d" if granularity == "day" else "%Y-%m"

    conn = get_connection()
    try:
        where, params = _report_filters(start_date, end_date, department, owner_id, supplier_id)
        rows = conn.execute(
            f"""
            SELECT strftime('{date_format}', sales.sale_date) AS period,
                   COUNT(*) AS count, SUM(sales.sale_price) AS total_revenue
            FROM sales
            JOIN items ON items.id = sales.item_id
            WHERE {where}
            GROUP BY period
            ORDER BY period
            """,
            params,
        ).fetchall()
        return [{**dict(r), "total_revenue": to_reais(r["total_revenue"])} for r in rows]
    finally:
        conn.close()
