import uuid
from typing import List, Optional
from pydantic import BaseModel


class InsurerResponse(BaseModel):
    id: uuid.UUID
    name: str
    code: str
    irdai_registration_no: str
    claim_settlement_ratio: float
    integration_type: str
    is_active: bool
    logo_url: Optional[str] = None

    class Config:
        from_attributes = True


class ProductBenefitResponse(BaseModel):
    id: uuid.UUID
    title: str
    description: Optional[str] = None
    is_rider: bool

    class Config:
        from_attributes = True


class ProductExclusionResponse(BaseModel):
    id: uuid.UUID
    title: str
    clause_reference: Optional[str] = None
    details: Optional[str] = None

    class Config:
        from_attributes = True


class ProductVersionResponse(BaseModel):
    id: uuid.UUID
    product_id: uuid.UUID
    version_tag: str
    uin_number: str
    min_entry_age: int
    max_entry_age: int
    min_sum_assured: float
    starting_premium_monthly: float
    is_current: bool
    benefits: List[ProductBenefitResponse] = []
    exclusions: List[ProductExclusionResponse] = []

    class Config:
        from_attributes = True


class ProductResponse(BaseModel):
    id: uuid.UUID
    insurer_id: uuid.UUID
    code: str
    name: str
    category: str
    tagline: Optional[str] = None
    description: Optional[str] = None
    is_active: bool
    insurer: Optional[InsurerResponse] = None
    versions: List[ProductVersionResponse] = []

    class Config:
        from_attributes = True
