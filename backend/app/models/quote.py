import uuid
from datetime import datetime
from typing import List, Optional
from sqlalchemy import Boolean, DateTime, ForeignKey, Index, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base, GUID, TimestampMixin, TenantMixin, JSONType


class Quote(Base, TimestampMixin, TenantMixin):
    """Multi-insurer quotation dossier prepared for a lead or client."""
    __tablename__ = "quotes"

    id: Mapped[uuid.UUID] = mapped_column(GUID(), primary_key=True, default=uuid.uuid4)
    quote_number: Mapped[str] = mapped_column(String(50), index=True, nullable=False) # e.g. "QT-9011"
    lead_id: Mapped[uuid.UUID] = mapped_column(GUID(), ForeignKey("leads.id", ondelete="CASCADE"), nullable=False, index=True)
    created_by_user_id: Mapped[uuid.UUID] = mapped_column(GUID(), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    status: Mapped[str] = mapped_column(String(50), default="Draft", index=True, nullable=False) # Draft, Sent to Client, Accepted, Expired
    valid_until: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    notes: Mapped[Optional[str]] = mapped_column(Text(), nullable=True)

    # Relationships
    lead: Mapped["Lead"] = relationship("Lead", back_populates="quotes")
    items: Mapped[List["QuoteItem"]] = relationship("QuoteItem", back_populates="quote", cascade="all, delete-orphan")


class QuoteItem(Base, TimestampMixin):
    """Specific insurer product quotation alternative within a comparison dossier."""
    __tablename__ = "quote_items"

    id: Mapped[uuid.UUID] = mapped_column(GUID(), primary_key=True, default=uuid.uuid4)
    quote_id: Mapped[uuid.UUID] = mapped_column(GUID(), ForeignKey("quotes.id", ondelete="CASCADE"), nullable=False, index=True)
    insurer_id: Mapped[uuid.UUID] = mapped_column(GUID(), ForeignKey("insurers.id", ondelete="CASCADE"), nullable=False, index=True)
    product_version_id: Mapped[uuid.UUID] = mapped_column(GUID(), ForeignKey("product_versions.id", ondelete="CASCADE"), nullable=False, index=True)
    sum_assured: Mapped[float] = mapped_column(Numeric(14, 2), nullable=False)
    policy_term_years: Mapped[int] = mapped_column(nullable=False, default=30)
    premium_payment_term_years: Mapped[int] = mapped_column(nullable=False, default=30)
    indicative_premium_monthly: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)
    indicative_premium_annual: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)
    is_demo_data: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    data_origin_tag: Mapped[str] = mapped_column(String(100), default="DEMO_RATE_CARD", nullable=False)
    selected_riders_json: Mapped[Optional[dict]] = mapped_column(JSONType(), nullable=True)
    is_selected_by_customer: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    quote: Mapped["Quote"] = relationship("Quote", back_populates="items")
    insurer: Mapped["Insurer"] = relationship("Insurer")
    product_version: Mapped["ProductVersion"] = relationship("ProductVersion")
