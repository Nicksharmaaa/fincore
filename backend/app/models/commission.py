import uuid
from datetime import date
from typing import Optional
from sqlalchemy import Boolean, Date, ForeignKey, Index, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base, GUID, TimestampMixin, TenantMixin


class CommissionSchedule(Base, TimestampMixin, TenantMixin):
    """Regulated broker commission slabs governed by IRDAI Commission Regulations 2023."""
    __tablename__ = "commission_schedules"

    id: Mapped[uuid.UUID] = mapped_column(GUID(), primary_key=True, default=uuid.uuid4)
    insurer_id: Mapped[uuid.UUID] = mapped_column(GUID(), ForeignKey("insurers.id", ondelete="CASCADE"), nullable=False, index=True)
    product_category: Mapped[str] = mapped_column(String(50), nullable=False) # TERM, TROP, ULIP, SAVINGS
    first_year_rate_pct: Mapped[float] = mapped_column(Numeric(5, 2), nullable=False) # e.g. 15.00%
    renewal_rate_pct: Mapped[float] = mapped_column(Numeric(5, 2), default=5.00, nullable=False)
    irdai_cap_rate_pct: Mapped[float] = mapped_column(Numeric(5, 2), default=20.00, nullable=False)
    effective_from: Mapped[date] = mapped_column(Date, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    insurer: Mapped["Insurer"] = relationship("Insurer")


class CommissionAccrual(Base, TimestampMixin, TenantMixin):
    """Pipeline commission receivables accrued on issued insurance policies."""
    __tablename__ = "commission_accruals"

    id: Mapped[uuid.UUID] = mapped_column(GUID(), primary_key=True, default=uuid.uuid4)
    application_id: Mapped[uuid.UUID] = mapped_column(GUID(), ForeignKey("applications.id", ondelete="CASCADE"), nullable=False, index=True)
    insurer_id: Mapped[uuid.UUID] = mapped_column(GUID(), ForeignKey("insurers.id", ondelete="CASCADE"), nullable=False, index=True)
    gross_premium_collected: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)
    commission_rate_applied_pct: Mapped[float] = mapped_column(Numeric(5, 2), nullable=False)
    accrued_commission_amount: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)
    status: Mapped[str] = mapped_column(
        String(50),
        default="Accrued",
        index=True,
        nullable=False
    ) # Accrued, Invoiced, Settled by Insurer
    settlement_reference: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)

    application: Mapped["Application"] = relationship("Application")
    insurer: Mapped["Insurer"] = relationship("Insurer")
