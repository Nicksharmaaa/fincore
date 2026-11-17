import uuid
from typing import Optional
from sqlalchemy import Boolean, ForeignKey, Index, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base, GUID, TimestampMixin, TenantMixin


class Notification(Base, TimestampMixin, TenantMixin):
    """Broker employee operational notifications and follow-up alerts."""
    __tablename__ = "notifications"

    id: Mapped[uuid.UUID] = mapped_column(GUID(), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(GUID(), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    message: Mapped[str] = mapped_column(Text(), nullable=False)
    notification_type: Mapped[str] = mapped_column(
        String(50),
        default="GENERAL",
        index=True,
        nullable=False
    ) # LEAD_ASSIGNED, DOC_VERIFIED, TASK_DUE, COMPLIANCE_ALERT, PROPOSAL_SYNC
    link_url: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    is_read: Mapped[bool] = mapped_column(Boolean, default=False, index=True, nullable=False)

    __table_args__ = (
        Index("ix_notif_user_unread", "user_id", "is_read"),
    )

    user: Mapped["User"] = relationship("User")
