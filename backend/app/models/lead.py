import uuid
from datetime import datetime
from typing import List, Optional
from sqlalchemy import DateTime, ForeignKey, Index, Integer, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base, GUID, TimestampMixin, TenantMixin, JSONType


class Lead(Base, TimestampMixin, TenantMixin):
    """Prospective insurance sale lead associated with a customer and assigned agent."""
    __tablename__ = "leads"

    id: Mapped[uuid.UUID] = mapped_column(GUID(), primary_key=True, default=uuid.uuid4)
    lead_number: Mapped[str] = mapped_column(String(50), index=True, nullable=False) # e.g. "LD-1092"
    customer_id: Mapped[uuid.UUID] = mapped_column(GUID(), ForeignKey("customers.id", ondelete="CASCADE"), nullable=False, index=True)
    product_interest: Mapped[str] = mapped_column(String(255), nullable=False)
    target_insurer_id: Mapped[Optional[uuid.UUID]] = mapped_column(GUID(), ForeignKey("insurers.id", ondelete="SET NULL"), nullable=True)
    desired_sum_assured: Mapped[float] = mapped_column(Numeric(14, 2), default=10000000.0, nullable=False)
    source: Mapped[str] = mapped_column(String(50), default="WEBSITE_ASSESSMENT", nullable=False) # WEBSITE_ASSESSMENT, DIRECT, PARTNER, REFERRAL
    status: Mapped[str] = mapped_column(String(50), default="New", index=True, nullable=False) # New, Contacted, Quoting, Converted, Lost
    assigned_user_id: Mapped[Optional[uuid.UUID]] = mapped_column(GUID(), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    current_ml_score: Mapped[int] = mapped_column(Integer, default=70, index=True, nullable=False) # 0 - 100
    lost_reason: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    risk_profile_json: Mapped[Optional[dict]] = mapped_column(JSONType(), nullable=True)

    __table_args__ = (
        Index("ix_leads_org_status", "organization_id", "status"),
        Index("ix_leads_assigned_status", "assigned_user_id", "status"),
    )

    # Relationships
    organization: Mapped["Organization"] = relationship("Organization", back_populates="leads")
    customer: Mapped["Customer"] = relationship("Customer", back_populates="leads")
    assignments: Mapped[List["LeadAssignment"]] = relationship("LeadAssignment", back_populates="lead", cascade="all, delete-orphan")
    activities: Mapped[List["LeadActivity"]] = relationship("LeadActivity", back_populates="lead", cascade="all, delete-orphan")
    tasks: Mapped[List["Task"]] = relationship("Task", back_populates="lead", cascade="all, delete-orphan")
    quotes: Mapped[List["Quote"]] = relationship("Quote", back_populates="lead", cascade="all, delete-orphan")
    model_scores: Mapped[List["ModelScore"]] = relationship("ModelScore", back_populates="lead", cascade="all, delete-orphan")


class LeadAssignment(Base, TimestampMixin, TenantMixin):
    """Historical assignment record of a lead to an agent / broker manager."""
    __tablename__ = "lead_assignments"

    id: Mapped[uuid.UUID] = mapped_column(GUID(), primary_key=True, default=uuid.uuid4)
    lead_id: Mapped[uuid.UUID] = mapped_column(GUID(), ForeignKey("leads.id", ondelete="CASCADE"), nullable=False, index=True)
    assigned_to_user_id: Mapped[uuid.UUID] = mapped_column(GUID(), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    assigned_by_user_id: Mapped[Optional[uuid.UUID]] = mapped_column(GUID(), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    assignment_reason: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    lead: Mapped["Lead"] = relationship("Lead", back_populates="assignments")


class LeadActivity(Base, TimestampMixin, TenantMixin):
    """Interaction activity history (calls, meetings, WhatsApp notes, proposal delivery)."""
    __tablename__ = "lead_activities"

    id: Mapped[uuid.UUID] = mapped_column(GUID(), primary_key=True, default=uuid.uuid4)
    lead_id: Mapped[uuid.UUID] = mapped_column(GUID(), ForeignKey("leads.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id: Mapped[uuid.UUID] = mapped_column(GUID(), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    activity_type: Mapped[str] = mapped_column(String(50), nullable=False) # CALL, EMAIL, MEETING, NOTE, QUOTE_SENT
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    notes: Mapped[Optional[str]] = mapped_column(Text(), nullable=True)
    occurred_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)

    lead: Mapped["Lead"] = relationship("Lead", back_populates="activities")
