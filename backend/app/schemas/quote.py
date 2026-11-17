import uuid
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel


class QuoteItemCreate(BaseModel):
    insurer_id: uuid.UUID
    product_version_id: uuid.UUID
    sum_assured: float
    policy_term_years: int = 30
    indicative_premium_monthly: float
    indicative_premium_annual: float
    is_demo_data: bool = True
    data_origin_tag: str = "DEMO_RATE_CARD"


class QuoteItemResponse(BaseModel):
    id: uuid.UUID
    insurer_id: uuid.UUID
    product_version_id: uuid.UUID
    sum_assured: float
    policy_term_years: int
    indicative_premium_monthly: float
    indicative_premium_annual: float
    is_demo_data: bool
    data_origin_tag: str
    is_selected_by_customer: bool

    class Config:
        from_attributes = True


class QuoteCreate(BaseModel):
    lead_id: uuid.UUID
    notes: Optional[str] = None
    items: List[QuoteItemCreate] = []


class QuoteResponse(BaseModel):
    id: uuid.UUID
    quote_number: str
    lead_id: uuid.UUID
    created_by_user_id: uuid.UUID
    status: str
    valid_until: datetime
    notes: Optional[str] = None
    items: List[QuoteItemResponse] = []
    created_at: datetime

    class Config:
        from_attributes = True
