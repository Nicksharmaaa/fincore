import uuid
from datetime import datetime
from typing import List, Optional
from sqlalchemy import DateTime, ForeignKey, Index, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base, GUID, TimestampMixin, TenantMixin, JSONType


class Application(Base, TimestampMixin, TenantMixin):
    """Insurer proposal application tracking lifecycle up to external policy issuance."""
    __tablename__ = "applications"

    id: Mapped[uuid.UUID] = mapped_column(GUID(), primary_key=True, default=uuid.uuid4)
    application_number: Mapped[str] = mapped_column(String(50), index=True, nullable=False) # e.g. "APP-9081"
    customer_id: Mapped[uuid.UUID] = mapped_column(GUID(), ForeignKey("customers.id", ondelete="CASCADE"), nullable=False, index=True)
    insurer_id: Mapped[uuid.UUID] = mapped_column(GUID(), ForeignKey("insurers.id", ondelete="CASCADE"), nullable=False, index=True)
    product_version_id: Mapped[uuid.UUID] = mapped_column(GUID(), ForeignKey("product_versions.id", ondelete="CASCADE"), nullable=False, index=True)
    quote_item_id: Mapped[Optional[uuid.UUID]] = mapped_column(GUID(), ForeignKey("quote_items.id", ondelete="SET NULL"), nullable=True)
    external_insurer_proposal_no: Mapped[Optional[str]] = mapped_column(String(100), index=True, nullable=True) # Official carrier reference
    policy_number: Mapped[Optional[str]] = mapped_column(String(100), index=True, nullable=True) # Assigned only upon carrier policy issuance
    sum_assured: Mapped[float] = mapped_column(Numeric(14, 2), nullable=False)
    annual_premium: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)
    status: Mapped[str] = mapped_column(
        String(50),
        default="Proposal Drafted",
        index=True,
        nullable=False
    ) # Proposal Drafted, KYC Submitted, Tele-Medical Scheduled, Insurer Underwriting Review, Policy Issued, Declined by Insurer
    underwriting_notes: Mapped[Optional[str]] = mapped_column(Text(), nullable=True)
    proposal_payload_json: Mapped[Optional[dict]] = mapped_column(JSONType(), nullable=True)

    __table_args__ = (
        Index("ix_apps_org_status", "organization_id", "status"),
    )

    # Relationships
    customer: Mapped["Customer"] = relationship("Customer", back_populates="applications")
    insurer: Mapped["Insurer"] = relationship("Insurer", back_populates="applications")
    product_version: Mapped["ProductVersion"] = relationship("ProductVersion")
    events: Mapped[List["ApplicationEvent"]] = relationship("ApplicationEvent", back_populates="application", cascade="all, delete-orphan")


class ApplicationEvent(Base, TimestampMixin, TenantMixin):
    """Historical timeline event in the insurer proposal underwriting workflow."""
    __tablename__ = "application_events"

    id: Mapped[uuid.UUID] = mapped_column(GUID(), primary_key=True, default=uuid.uuid4)
    application_id: Mapped[uuid.UUID] = mapped_column(GUID(), ForeignKey("applications.id", ondelete="CASCADE"), nullable=False, index=True)
    event_type: Mapped[str] = mapped_column(String(50), nullable=False) # STATUS_CHANGE, TELE_MED_BOOKED, MEDICAL_RECEIVED, INSURER_SYNC
    from_status: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    to_status: Mapped[str] = mapped_column(String(50), nullable=False)
    notes: Mapped[Optional[str]] = mapped_column(Text(), nullable=True)
    external_reference: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    actor_user_id: Mapped[Optional[uuid.UUID]] = mapped_column(GUID(), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)

    application: Mapped["Application"] = relationship("Application", back_populates="events")
