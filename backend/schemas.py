import re
from typing import List, Optional

from pydantic import BaseModel, field_validator

from backend.enums import ItemCategory, ItemCondition, ItemDepartment, PaymentMethod

PIN_PATTERN = re.compile(r"^\d{4,6}$")


class OwnerOut(BaseModel):
    id: int
    name: str
    is_cut_owner: bool
    active: bool
    has_pin: bool


class OwnerUpdate(BaseModel):
    active: Optional[bool] = None
    pin: Optional[str] = None

    @field_validator("pin")
    @classmethod
    def validate_pin(cls, value: Optional[str]) -> Optional[str]:
        if value is not None and not PIN_PATTERN.match(value):
            raise ValueError("o PIN deve ter de 4 a 6 dígitos numéricos")
        return value


class PinVerify(BaseModel):
    pin: str


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
    sale_id: int
    sku: str
    sale_date: str
    sale_price: float
    supplier_amount: float
    paid_at: Optional[str]


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
    total_paid: float
    payout_sales: List[SupplierPayoutSaleOut]
    withdrawals: List[SupplierWithdrawalOut]


class ItemOut(BaseModel):
    id: int
    sku: str
    owner_id: Optional[int]
    supplier_id: Optional[int]
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
    edited_by_owner_id: int


class ItemEditOut(BaseModel):
    field: str
    old_value: Optional[str]
    new_value: Optional[str]
    edited_by_owner_name: Optional[str]
    edited_at: str


class CheckoutItem(BaseModel):
    item_id: int
    sale_price: float
    discount_reason: Optional[str] = None


class CheckoutCreate(BaseModel):
    items: List[CheckoutItem]
    payment_method: PaymentMethod
    sold_by_owner_id: int


class SplitOut(BaseModel):
    owner_a: float
    owner_b: float
    supplier: float


class SaleOut(BaseModel):
    id: int
    item_id: int
    sku: str
    sale_price: float
    catalog_price: float
    discount_reason: Optional[str]
    receipt_id: int
    payment_method: Optional[str]
    sold_by_owner_name: Optional[str]
    sale_date: str
    voided_at: Optional[str]
    split: SplitOut


class ItemDetailOut(ItemOut):
    # Populated only when the item has actually sold or been withdrawn — the drill-in
    # view for a plain in-stock item just omits these.
    sale: Optional[SaleOut] = None
    withdrawn_date: Optional[str] = None
    edits: List[ItemEditOut] = []


class ReportSummaryOut(BaseModel):
    total_sales: int
    total_revenue: float
    owner_a_name: str
    owner_a_earnings: float
    owner_b_name: str
    owner_b_earnings: float
    supplier_commission_total: float
    supplier_commission_paid: float
    supplier_commission_pending: float


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
