from typing import List

from fastapi import APIRouter, HTTPException

from backend.db import get_connection
from backend.schemas import CategoryReportRow, ReportSummaryOut, SupplierReportRow, TimelineRow

router = APIRouter(prefix="/api/reports", tags=["reports"])


@router.get("/summary", response_model=ReportSummaryOut)
def summary():
    conn = get_connection()
    try:
        owners = {r["is_cut_owner"]: r["name"] for r in conn.execute("SELECT name, is_cut_owner FROM owners")}
        totals = conn.execute(
            """
            SELECT COUNT(*) AS total_sales,
                   COALESCE(SUM(sales.sale_price), 0) AS total_revenue,
                   COALESCE(SUM(splits.owner_a_amount), 0) AS owner_a_earnings,
                   COALESCE(SUM(splits.owner_b_amount), 0) AS owner_b_earnings,
                   COALESCE(SUM(splits.supplier_amount), 0) AS supplier_payouts
            FROM sales JOIN splits ON splits.sale_id = sales.id
            """
        ).fetchone()

        return {
            "total_sales": totals["total_sales"],
            "total_revenue": round(totals["total_revenue"], 2),
            "owner_a_name": owners.get(1, "Dona A"),
            "owner_a_earnings": round(totals["owner_a_earnings"], 2),
            "owner_b_name": owners.get(0, "Dona B"),
            "owner_b_earnings": round(totals["owner_b_earnings"], 2),
            "supplier_payouts": round(totals["supplier_payouts"], 2),
        }
    finally:
        conn.close()


@router.get("/by-category", response_model=List[CategoryReportRow])
def by_category():
    conn = get_connection()
    try:
        rows = conn.execute(
            """
            SELECT items.category AS category, COUNT(*) AS count, SUM(sales.sale_price) AS total_revenue
            FROM sales JOIN items ON items.id = sales.item_id
            GROUP BY items.category
            ORDER BY total_revenue DESC
            """
        ).fetchall()
        return [dict(r) for r in rows]
    finally:
        conn.close()


@router.get("/by-supplier", response_model=List[SupplierReportRow])
def by_supplier():
    conn = get_connection()
    try:
        rows = conn.execute(
            """
            SELECT suppliers.id AS supplier_id, suppliers.name AS supplier_name, owners.name AS owner_name,
                   COUNT(*) AS count, SUM(sales.sale_price) AS total_revenue,
                   SUM(splits.supplier_amount) AS total_commission
            FROM splits
            JOIN sales ON sales.id = splits.sale_id
            JOIN suppliers ON suppliers.id = splits.supplier_id
            JOIN owners ON owners.id = suppliers.owner_id
            GROUP BY suppliers.id
            ORDER BY total_revenue DESC
            """
        ).fetchall()
        return [dict(r) for r in rows]
    finally:
        conn.close()


@router.get("/timeline", response_model=List[TimelineRow])
def timeline(granularity: str = "month"):
    if granularity not in ("day", "month"):
        raise HTTPException(400, "granularity deve ser 'day' ou 'month'")
    date_format = "%Y-%m-%d" if granularity == "day" else "%Y-%m"

    conn = get_connection()
    try:
        rows = conn.execute(
            f"""
            SELECT strftime('{date_format}', sale_date) AS period,
                   COUNT(*) AS count, SUM(sale_price) AS total_revenue
            FROM sales
            GROUP BY period
            ORDER BY period
            """
        ).fetchall()
        return [dict(r) for r in rows]
    finally:
        conn.close()
