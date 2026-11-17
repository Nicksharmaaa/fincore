import uuid
from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field


class CustomerCreate(BaseModel):
    full_name: str
    email: EmailStr
    phone: str
    pan_number: Optional[str] = None
    dob: Optional[date] = None
    gender: Optional[str] = None
    city: str = "Mumbai"
    state: str = "Maharashtra"
    annual_income: Optional[float] = None
    occupation: Optional[str] = None
    smoker_status: bool = False


class CustomerUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    pan_number: Optional[str] = None
    annual_income: Optional[float] = None
    kyc_status: Optional[str] = None
    city: Optional[str] = None


class CustomerResponse(BaseModel):
    id: uuid.UUID
    organization_id: uuid.UUID
    full_name: str
    email: EmailStr
    phone: str
    pan_number: Optional[str] = None
    dob: Optional[date] = None
    city: str
    annual_income: Optional[float] = None
    smoker_status: bool
    kyc_status: str
    segment: str
    created_at: datetime

    class Config:
        from_attributes = True


class AssessmentCreate(BaseModel):
    customer_id: uuid.UUID
    annual_income: float = Field(..., gt=0)
    dependents_count: int = Field(default=1, ge=0)
    outstanding_liabilities: float = Field(default=0.0, ge=0)
    existing_cover: float = Field(default=0.0, ge=0)
    education_fund_target: float = Field(default=0.0, ge=0)


class AssessmentResponse(BaseModel):
    id: uuid.UUID
    customer_id: uuid.UUID
    annual_income: float
    dependents_count: int
    outstanding_liabilities: float
    existing_cover: float
    education_fund_target: float
    calculated_hlv: float
    coverage_gap: float
    recommendation_notes: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class QuickCalculationRequest(BaseModel):
    annual_income: float = Field(..., gt=0)
    dependents_count: int = Field(default=1, ge=0)
    outstanding_liabilities: float = Field(default=0.0, ge=0)
    existing_cover: float = Field(default=0.0, ge=0)
    education_fund_target: float = Field(default=0.0, ge=0)
    occupation: Optional[str] = "Salaried"
    is_smoker: bool = False
    preferred_coverage_age: Optional[int] = 75


class QuickCalculationResponse(BaseModel):
    income_protection_needed: float
    liabilities_protection: float
    family_goals_protection: float
    calculated_hlv: float
    existing_cover: float
    coverage_gap: float
    income_multiplier: int = 12
    recommendation_notes: str
    recommended_category: str
    disclaimer: str = "This is an educational estimate, not underwriting advice."


class Customer360Response(BaseModel):
    customer: CustomerResponse
    assessments: list[dict] = []
    leads: list[dict] = []
    applications: list[dict] = []
    documents: list[dict] = []
    consents: list[dict] = []
    tasks: list[dict] = []
    interaction_history: list[dict] = []

