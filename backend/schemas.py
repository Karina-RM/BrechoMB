from typing import List, Optional

from pydantic import BaseModel

from backend.enums import ItemCategory, ItemCondition, ItemDepartment


class OwnerOut(BaseModel):
    id: int
    name: str
    is_cut_owner: bool
    active: bool


class OwnerUpdate(BaseModel):
    active: bool


class SupplierOut(BaseModel):
    id: int
    name: str
    owner_id: int
    commission_pct: float


class SupplierCreate(BaseModel):
    name: str
    owner_id: int
    commission_pct: float


class SupplierUpdate(BaseModel):
    # owner_id deliberately excluded — supplier-owner affiliation is immutable (roadmap.md §1)
    name: Optional[str] = None
    commission_pct: Optional[float] = None


class SupplierItemOut(BaseModel):
    id: int
    sku: str
    category: Optional[str]
    price: float
    status: str
    intake_date: str


class SupplierPayoutSaleOut(BaseModel):
    sku: str
    sale_date: str
    sale_price: float
    supplier_amount: float


class SupplierWithdrawalOut(BaseModel):
    sku: str
    intake_date: str
    withdrawn_date: str
    days_in_store: int


class SupplierDetailOut(BaseModel):
    id: int
    name: str
    owner_id: int
    commission_pct: float
    items: List[SupplierItemOut]
    total_owed: float
    payout_sales: List[SupplierPayoutSaleOut]
    withdrawals: List[SupplierWithdrawalOut]


class ItemOut(BaseModel):
    id: int
    sku: str
    owner_id: Optional[int]
    supplier_id: Optional[int]
    commission_pct_override: Optional[float]
    photo_paths: List[str]
    size: Optional[str]
    condition: Optional[str]
    department: Optional[str]
    category: Optional[str]
    brand: Optional[str]
    color: Optional[str]
    material: Optional[str]
    observations: Optional[str]
    price: float
    status: str
    intake_date: str


class ItemUpdate(BaseModel):
    size: Optional[str] = None
    condition: Optional[ItemCondition] = None
    department: Optional[ItemDepartment] = None
    category: Optional[ItemCategory] = None
    brand: Optional[str] = None
    color: Optional[str] = None
    material: Optional[str] = None
    observations: Optional[str] = None
    price: Optional[float] = None
    commission_pct_override: Optional[float] = None


class SaleCreate(BaseModel):
    item_id: int
    sale_price: float


class SplitOut(BaseModel):
    owner_a: float
    owner_b: float
    supplier: float


class SaleOut(BaseModel):
    id: int
    item_id: int
    sku: str
    sale_price: float
    sale_date: str
    split: SplitOut


class ItemDetailOut(ItemOut):
    # Populated only when the item has actually sold or been withdrawn — the drill-in
    # view for a plain in-stock item just omits these.
    sale: Optional[SaleOut] = None
    withdrawn_date: Optional[str] = None


class ReportSummaryOut(BaseModel):
    total_sales: int
    total_revenue: float
    owner_a_name: str
    owner_a_earnings: float
    owner_b_name: str
    owner_b_earnings: float
    supplier_payouts: float


class CategoryReportRow(BaseModel):
    category: Optional[str]
    count: int
    total_revenue: float


class SupplierReportRow(BaseModel):
    supplier_id: int
    supplier_name: str
    owner_name: str
    count: int
    total_revenue: float
    total_commission: float


class TimelineRow(BaseModel):
    period: str
    count: int
    total_revenue: float
