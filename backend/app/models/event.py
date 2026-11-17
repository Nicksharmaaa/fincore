import uuid
from typing import Optional
from sqlalchemy import Boolean, ForeignKey, Index, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column
from app.db.base import Base, GUID, TimestampMixin, TenantMixin, JSONType


class AnalyticsEvent(Base, TimestampMixin, TenantMixin):
    """Customer portal and CRM business funnel telemetry event."""
    __tablename__ = "analytics_events"

    id: Mapped[uuid.UUID] = mapped_column(GUID(), primary_key=True, default=uuid.uuid4)
    event_name: Mapped[str] = mapped_column(String(100), index=True, nullable=False) # e.g. "needs_assessment_completed", "plan_compared"
    actor_type: Mapped[str] = mapped_column(String(50), default="CUSTOMER", nullable=False) # CUSTOMER, AGENT, SYSTEM
    actor_id: Mapped[Optional[str]] = mapped_column(String(100), index=True, nullable=True)
    session_id: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    properties_json: Mapped[Optional[dict]] = mapped_column(JSONType(), nullable=True)

    __table_args__ = (
        Index("ix_analytics_org_event", "organization_id", "event_name"),
    )


class IntegrationEvent(Base, TimestampMixin, TenantMixin):
    """Carrier API integration telemetry, webhook callbacks, and SFTP sync logs."""
    __tablename__ = "integration_events"

    id: Mapped[uuid.UUID] = mapped_column(GUID(), primary_key=True, default=uuid.uuid4)
    insurer_id: Mapped[Optional[uuid.UUID]] = mapped_column(GUID(), ForeignKey("insurers.id", ondelete="SET NULL"), nullable=True, index=True)
    event_type: Mapped[str] = mapped_column(String(100), index=True, nullable=False) # PROPOSAL_FORWARD, STATUS_CALLBACK, RATE_SYNC
    direction: Mapped[str] = mapped_column(String(20), default="OUTBOUND", nullable=False) # INBOUND, OUTBOUND
    status: Mapped[str] = mapped_column(String(50), default="SUCCESS", index=True, nullable=False) # SUCCESS, FAILED, RETRY
    request_payload_json: Mapped[Optional[dict]] = mapped_column(JSONType(), nullable=True)
    response_payload_json: Mapped[Optional[dict]] = mapped_column(JSONType(), nullable=True)
    error_message: Mapped[Optional[str]] = mapped_column(Text(), nullable=True)
    retry_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
