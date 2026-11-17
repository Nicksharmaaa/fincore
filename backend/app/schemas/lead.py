import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, EmailStr


class CustomerEnquiryCreate(BaseModel):
    customer_name: str
    customer_email: EmailStr
    customer_phone: str
    city: Optional[str] = "Mumbai"
    enquiry_type: str = "QUOTE_REQUEST" # QUOTE_REQUEST, CALLBACK_REQUEST, SAVE_COMPARISON, QUESTION, ASSESSMENT_SUBMISSION
    product_id: Optional[uuid.UUID] = None
    product_ids: Optional[List[uuid.UUID]] = None
    product_interest: Optional[str] = "Term Life Insurance"
    desired_sum_assured: Optional[float] = 10000000.0
    message: Optional[str] = None
    consent_given: bool = True
    lead_source: str = "WEBSITE_ENQUIRY"
    assessment_data: Optional[Dict[str, Any]] = None


class AssignedAdvisorInfo(BaseModel):
    name: str
    email: str


class CustomerEnquiryResponse(BaseModel):
    status: str = "success"
    lead_number: str
    lead_id: uuid.UUID
    customer_id: uuid.UUID
    assessment_id: Optional[uuid.UUID] = None
    assigned_advisor: AssignedAdvisorInfo
    calculated_gap: Optional[float] = None
    message: str


class LeadCreate(BaseModel):
    customer_id: Optional[uuid.UUID] = None
    # If customer does not exist yet, intake info
    customer_name: Optional[str] = None
    customer_phone: Optional[str] = None
    customer_email: Optional[EmailStr] = None
    product_interest: str
    target_insurer_id: Optional[uuid.UUID] = None
    desired_sum_assured: float = 10000000.0
    source: str = "WEBSITE_ASSESSMENT"


class LeadUpdate(BaseModel):
    status: Optional[str] = None
    assigned_user_id: Optional[uuid.UUID] = None
    desired_sum_assured: Optional[float] = None
    lost_reason: Optional[str] = None


class LeadActivityCreate(BaseModel):
    activity_type: str # CALL, EMAIL, NOTE, QUOTE_SENT
    title: str
    notes: Optional[str] = None


class LeadActivityResponse(BaseModel):
    id: uuid.UUID
    lead_id: uuid.UUID
    user_id: uuid.UUID
    activity_type: str
    title: str
    notes: Optional[str] = None
    occurred_at: datetime

    class Config:
        from_attributes = True


class LeadResponse(BaseModel):
    id: uuid.UUID
    lead_number: str
    customer_id: uuid.UUID
    product_interest: str
    desired_sum_assured: float
    source: str
    status: str
    assigned_user_id: Optional[uuid.UUID] = None
    current_ml_score: int
    lost_reason: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class LeadDetailResponse(BaseModel):
    id: uuid.UUID
    lead_number: str
    customer_id: uuid.UUID
    product_interest: str
    desired_sum_assured: float
    source: str
    status: str
    assigned_user_id: Optional[uuid.UUID] = None
    assigned_user_name: Optional[str] = None
    current_ml_score: int
    lost_reason: Optional[str] = None
    created_at: datetime
    customer: Optional[Dict[str, Any]] = None
    assessment: Optional[Dict[str, Any]] = None
    activities: List[LeadActivityResponse] = []
    assignments: List[Dict[str, Any]] = []
    tasks: List[Dict[str, Any]] = []
    quotes: List[Dict[str, Any]] = []

