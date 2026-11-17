import uuid
from typing import Optional
from sqlalchemy import ForeignKey, Index, Integer, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base, GUID, TimestampMixin, TenantMixin, JSONType


class ModelScore(Base, TimestampMixin, TenantMixin):
    """Historical ML model inference scores for lead prioritisation & customer propensity."""
    __tablename__ = "model_scores"

    id: Mapped[uuid.UUID] = mapped_column(GUID(), primary_key=True, default=uuid.uuid4)
    lead_id: Mapped[uuid.UUID] = mapped_column(GUID(), ForeignKey("leads.id", ondelete="CASCADE"), nullable=False, index=True)
    model_name: Mapped[str] = mapped_column(String(100), default="XGBoost_Lead_Scorer", nullable=False)
    model_version: Mapped[str] = mapped_column(String(50), default="v1.2", nullable=False)
    conversion_probability: Mapped[float] = mapped_column(Numeric(5, 4), nullable=False) # e.g. 0.8845
    priority_score: Mapped[int] = mapped_column(Integer, nullable=False) # 0 - 100
    features_snapshot_json: Mapped[Optional[dict]] = mapped_column(JSONType(), nullable=True)

    __table_args__ = (
        Index("ix_ml_lead_score", "lead_id", "priority_score"),
    )

    lead: Mapped["Lead"] = relationship("Lead", back_populates="model_scores")
