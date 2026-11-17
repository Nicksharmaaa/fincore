import uuid
from datetime import datetime
from typing import Optional
from sqlalchemy import Boolean, DateTime, ForeignKey, Index, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base, GUID, TimestampMixin, TenantMixin


class Task(Base, TimestampMixin, TenantMixin):
    """Actionable agent CRM tasks (follow-up calls, medical appointment scheduling, ITR collection)."""
    __tablename__ = "tasks"

    id: Mapped[uuid.UUID] = mapped_column(GUID(), primary_key=True, default=uuid.uuid4)
    lead_id: Mapped[Optional[uuid.UUID]] = mapped_column(GUID(), ForeignKey("leads.id", ondelete="CASCADE"), nullable=True, index=True)
    assigned_to_user_id: Mapped[uuid.UUID] = mapped_column(GUID(), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text(), nullable=True)
    priority: Mapped[str] = mapped_column(String(20), default="Normal", nullable=False) # Urgent, Medium, Normal
    status: Mapped[str] = mapped_column(String(20), default="Pending", index=True, nullable=False) # Pending, Completed, Cancelled
    due_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, index=True)
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    __table_args__ = (
        Index("ix_tasks_assigned_status", "assigned_to_user_id", "status"),
    )

    lead: Mapped[Optional["Lead"]] = relationship("Lead", back_populates="tasks")
