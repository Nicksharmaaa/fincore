import uuid
from typing import Optional
from sqlalchemy import ForeignKey, Index, String, Text
from sqlalchemy.orm import Mapped, mapped_column
from app.db.base import Base, GUID, TimestampMixin, TenantMixin, JSONType


class AuditLog(Base, TimestampMixin, TenantMixin):
    """Immutable audit trail of sensitive business operations mandated by IRDAI regulations."""
    __tablename__ = "audit_logs"

    id: Mapped[uuid.UUID] = mapped_column(GUID(), primary_key=True, default=uuid.uuid4)
    actor_user_id: Mapped[Optional[uuid.UUID]] = mapped_column(GUID(), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    actor_email: Mapped[str] = mapped_column(String(255), nullable=False)
    action: Mapped[str] = mapped_column(String(100), index=True, nullable=False) # e.g. "QUOTE_GENERATED", "KYC_VERIFIED"
    entity_name: Mapped[str] = mapped_column(String(100), index=True, nullable=False) # Lead, Customer, Application, User
    entity_id: Mapped[Optional[str]] = mapped_column(String(100), index=True, nullable=True)
    ip_address: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    user_agent: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    changes_json: Mapped[Optional[dict]] = mapped_column(JSONType(), nullable=True)

    __table_args__ = (
        Index("ix_audit_org_action", "organization_id", "action"),
    )
