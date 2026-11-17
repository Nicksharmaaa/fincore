import uuid
from datetime import date, datetime
from typing import List, Optional
from sqlalchemy import Boolean, Date, DateTime, ForeignKey, Index, Numeric, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base, GUID, TimestampMixin, TenantMixin, JSONType


class Customer(Base, TimestampMixin, TenantMixin):
    """Customer entity with deduplication rules (PAN / phone) and KYC profile."""
    __tablename__ = "customers"

    id: Mapped[uuid.UUID] = mapped_column(GUID(), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[Optional[uuid.UUID]] = mapped_column(GUID(), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    full_name: Mapped[str] = mapped_column(String(255), index=True, nullable=False)
    email: Mapped[str] = mapped_column(String(255), index=True, nullable=False)
    phone: Mapped[str] = mapped_column(String(50), index=True, nullable=False)
    pan_number: Mapped[Optional[str]] = mapped_column(String(20), index=True, nullable=True)
    dob: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    gender: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    address_line: Mapped[Optional[str]] = mapped_column(Text(), nullable=True)
    city: Mapped[str] = mapped_column(String(100), default="Mumbai", nullable=False)
    state: Mapped[str] = mapped_column(String(100), default="Maharashtra", nullable=False)
    pincode: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    annual_income: Mapped[Optional[float]] = mapped_column(Numeric(14, 2), nullable=True)
    occupation: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    smoker_status: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    kyc_status: Mapped[str] = mapped_column(String(50), default="Pending", index=True, nullable=False)
    segment: Mapped[str] = mapped_column(String(50), default="Salaried Retail", nullable=False)
    metadata_json: Mapped[Optional[dict]] = mapped_column(JSONType(), nullable=True)

    __table_args__ = (
        UniqueConstraint("organization_id", "email", name="uq_org_customer_email"),
        Index("ix_customers_pan_org", "organization_id", "pan_number"),
    )

    # Relationships
    organization: Mapped["Organization"] = relationship("Organization", back_populates="customers")
    consents: Mapped[List["CustomerConsent"]] = relationship("CustomerConsent", back_populates="customer", cascade="all, delete-orphan")
    assessments: Mapped[List["CustomerAssessment"]] = relationship("CustomerAssessment", back_populates="customer", cascade="all, delete-orphan")
    leads: Mapped[List["Lead"]] = relationship("Lead", back_populates="customer")
    applications: Mapped[List["Application"]] = relationship("Application", back_populates="customer")


class CustomerConsent(Base, TimestampMixin, TenantMixin):
    """Statutory consent record (IRDAI & Digital Personal Data Protection Act DPDP)."""
    __tablename__ = "customer_consents"

    id: Mapped[uuid.UUID] = mapped_column(GUID(), primary_key=True, default=uuid.uuid4)
    customer_id: Mapped[uuid.UUID] = mapped_column(GUID(), ForeignKey("customers.id", ondelete="CASCADE"), nullable=False, index=True)
    consent_type: Mapped[str] = mapped_column(String(100), nullable=False) # e.g. broker_advisory, medical_disclosure, cibil_check
    ip_address: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    user_agent: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    consented_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    customer: Mapped["Customer"] = relationship("Customer", back_populates="consents")


class CustomerAssessment(Base, TimestampMixin, TenantMixin):
    """Calculated life insurance needs assessment (Human Life Value & Coverage Gap)."""
    __tablename__ = "customer_assessments"

    id: Mapped[uuid.UUID] = mapped_column(GUID(), primary_key=True, default=uuid.uuid4)
    customer_id: Mapped[uuid.UUID] = mapped_column(GUID(), ForeignKey("customers.id", ondelete="CASCADE"), nullable=False, index=True)
    annual_income: Mapped[float] = mapped_column(Numeric(14, 2), nullable=False)
    dependents_count: Mapped[int] = mapped_column(nullable=False, default=1)
    outstanding_liabilities: Mapped[float] = mapped_column(Numeric(14, 2), default=0.0, nullable=False)
    existing_cover: Mapped[float] = mapped_column(Numeric(14, 2), default=0.0, nullable=False)
    education_fund_target: Mapped[float] = mapped_column(Numeric(14, 2), default=0.0, nullable=False)
    calculated_hlv: Mapped[float] = mapped_column(Numeric(14, 2), nullable=False)
    coverage_gap: Mapped[float] = mapped_column(Numeric(14, 2), nullable=False)
    recommendation_notes: Mapped[Optional[str]] = mapped_column(Text(), nullable=True)
    raw_inputs_json: Mapped[Optional[dict]] = mapped_column(JSONType(), nullable=True)

    customer: Mapped["Customer"] = relationship("Customer", back_populates="assessments")
