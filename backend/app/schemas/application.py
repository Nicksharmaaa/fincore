import uuid
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel


class ApplicationCreate(BaseModel):
    customer_id: uuid.UUID
    insurer_id: uuid.UUID
    product_version_id: uuid.UUID
    quote_item_id: Optional[uuid.UUID] = None
    sum_assured: float
    annual_premium: float
    underwriting_notes: Optional[str] = None


class ApplicationUpdate(BaseModel):
    status: Optional[str] = None
    external_insurer_proposal_no: Optional[str] = None
    policy_number: Optional[str] = None
    underwriting_notes: Optional[str] = None


class ApplicationEventResponse(BaseModel):
    id: uuid.UUID
    event_type: str
    from_status: Optional[str] = None
    to_status: str
    notes: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class ApplicationResponse(BaseModel):
    id: uuid.UUID
    application_number: str
    customer_id: uuid.UUID
    insurer_id: uuid.UUID
    product_version_id: uuid.UUID
    external_insurer_proposal_no: Optional[str] = None
    policy_number: Optional[str] = None
    sum_assured: float
    annual_premium: float
    status: str
    underwriting_notes: Optional[str] = None
    created_at: datetime
    events: List[ApplicationEventResponse] = []

    class Config:
        from_attributes = True
