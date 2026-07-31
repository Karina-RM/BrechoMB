from typing import List, Optional

from pydantic import BaseModel


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


class ItemOut(BaseModel):
    id: int
    sku: str
    owner_id: Optional[int]
    supplier_id: Optional[int]
    commission_pct_override: Optional[float]
    photo_paths: List[str]
    size: Optional[str]
    condition: Optional[str]
    category: Optional[str]
    price: float
    status: str
    intake_date: str


class ItemUpdate(BaseModel):
    size: Optional[str] = None
    condition: Optional[str] = None
    category: Optional[str] = None
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
