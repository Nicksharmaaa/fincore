import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class DocumentCreate(BaseModel):
    file_name: str
    storage_path: str
    mime_type: str = "application/pdf"
    file_size_bytes: int = 0
    doc_type: str = "KYC_PAN"
    customer_id: Optional[uuid.UUID] = None
    application_id: Optional[uuid.UUID] = None


class DocumentResponse(BaseModel):
    id: uuid.UUID
    doc_number: str
    file_name: str
    storage_path: str
    mime_type: str
    doc_type: str
    verification_status: str
    created_at: datetime

    class Config:
        from_attributes = True


class CommissionScheduleResponse(BaseModel):
    id: uuid.UUID
    insurer_id: uuid.UUID
    product_category: str
    first_year_rate_pct: float
    renewal_rate_pct: float
    irdai_cap_rate_pct: float
    is_active: bool

    class Config:
        from_attributes = True


class CommissionAccrualResponse(BaseModel):
    id: uuid.UUID
    application_id: uuid.UUID
    insurer_id: uuid.UUID
    gross_premium_collected: float
    commission_rate_applied_pct: float
    accrued_commission_amount: float
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


class AnalyticsSummary(BaseModel):
    total_leads: int
    active_proposals: int
    total_sum_assured: float
    conversion_rate_pct: float
    pipeline_commission_accrued: float
