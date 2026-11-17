import uuid
from typing import List, Optional
from sqlalchemy import Boolean, Numeric, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base, GUID, TimestampMixin, TenantMixin, JSONType


class Insurer(Base, TimestampMixin, TenantMixin):
    """Authorised partner life insurance company (e.g. HDFC Life, ICICI Pru, SBI Life, LIC)."""
    __tablename__ = "insurers"

    id: Mapped[uuid.UUID] = mapped_column(GUID(), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    code: Mapped[str] = mapped_column(String(50), index=True, nullable=False)
    irdai_registration_no: Mapped[str] = mapped_column(String(100), nullable=False)
    claim_settlement_ratio: Mapped[float] = mapped_column(Numeric(5, 2), default=98.0, nullable=False) # e.g. 99.50%
    integration_type: Mapped[str] = mapped_column(String(50), default="DEMO_FEED", nullable=False) # REST_API, SFTP, DEMO_FEED
    api_base_url: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    logo_url: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    metadata_json: Mapped[Optional[dict]] = mapped_column(JSONType(), nullable=True)

    __table_args__ = (
        UniqueConstraint("organization_id", "code", name="uq_org_insurer_code"),
    )

    # Relationships
    organization: Mapped["Organization"] = relationship("Organization", back_populates="insurers")
    products: Mapped[List["Product"]] = relationship("Product", back_populates="insurer", cascade="all, delete-orphan")
    applications: Mapped[List["Application"]] = relationship("Application", back_populates="insurer")
