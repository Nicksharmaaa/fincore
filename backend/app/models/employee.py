import uuid
from typing import Optional
from sqlalchemy import Boolean, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base, GUID, TimestampMixin, TenantMixin


class EmployeeProfile(Base, TimestampMixin, TenantMixin):
    """Extended profile for broker employees (Agents, Sales Managers, Operations, Compliance)."""
    __tablename__ = "employee_profiles"

    id: Mapped[uuid.UUID] = mapped_column(GUID(), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(GUID(), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    employee_code: Mapped[str] = mapped_column(String(50), index=True, nullable=False)
    designation: Mapped[str] = mapped_column(String(100), nullable=False)
    department: Mapped[str] = mapped_column(String(100), nullable=False)
    branch: Mapped[str] = mapped_column(String(100), default="Mumbai - BKC", nullable=False)
    irdai_agent_license: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    is_posp: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    monthly_target_gwp: Mapped[int] = mapped_column(Integer, default=500000, nullable=False)

    # Relationship
    user: Mapped["User"] = relationship("User", back_populates="employee_profile")
