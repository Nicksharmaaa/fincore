import uuid
from datetime import date
from typing import List, Optional
from sqlalchemy import Boolean, Date, ForeignKey, Index, Integer, Numeric, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base, GUID, TimestampMixin, TenantMixin, JSONType


class Product(Base, TimestampMixin, TenantMixin):
    """Insurance product umbrella entity belonging to an insurer."""
    __tablename__ = "products"

    id: Mapped[uuid.UUID] = mapped_column(GUID(), primary_key=True, default=uuid.uuid4)
    insurer_id: Mapped[uuid.UUID] = mapped_column(GUID(), ForeignKey("insurers.id", ondelete="CASCADE"), nullable=False, index=True)
    code: Mapped[str] = mapped_column(String(100), index=True, nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    category: Mapped[str] = mapped_column(String(50), default="TERM", index=True, nullable=False) # TERM, TROP, ULIP, SAVINGS, ANNUITY
    tagline: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    description: Mapped[Optional[str]] = mapped_column(Text(), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    __table_args__ = (
        UniqueConstraint("insurer_id", "code", name="uq_insurer_product_code"),
    )

    # Relationships
    insurer: Mapped["Insurer"] = relationship("Insurer", back_populates="products")
    versions: Mapped[List["ProductVersion"]] = relationship("ProductVersion", back_populates="product", cascade="all, delete-orphan")


class ProductVersion(Base, TimestampMixin, TenantMixin):
    """Historical versioned product terms, rate cards and IRDAI UIN filings."""
    __tablename__ = "product_versions"

    id: Mapped[uuid.UUID] = mapped_column(GUID(), primary_key=True, default=uuid.uuid4)
    product_id: Mapped[uuid.UUID] = mapped_column(GUID(), ForeignKey("products.id", ondelete="CASCADE"), nullable=False, index=True)
    version_tag: Mapped[str] = mapped_column(String(50), nullable=False) # e.g. "v4.2-2025"
    uin_number: Mapped[str] = mapped_column(String(100), nullable=False) # IRDAI Unique Identification Number
    effective_from: Mapped[date] = mapped_column(Date, nullable=False)
    effective_to: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    min_entry_age: Mapped[int] = mapped_column(Integer, default=18, nullable=False)
    max_entry_age: Mapped[int] = mapped_column(Integer, default=65, nullable=False)
    min_sum_assured: Mapped[float] = mapped_column(Numeric(14, 2), default=2500000.0, nullable=False)
    max_sum_assured: Mapped[Optional[float]] = mapped_column(Numeric(14, 2), nullable=True)
    starting_premium_monthly: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    is_current: Mapped[bool] = mapped_column(Boolean, default=True, index=True, nullable=False)
    rate_table_json: Mapped[Optional[dict]] = mapped_column(JSONType(), nullable=True)

    __table_args__ = (
        UniqueConstraint("product_id", "version_tag", name="uq_product_version"),
    )

    # Relationships
    product: Mapped["Product"] = relationship("Product", back_populates="versions")
    benefits: Mapped[List["ProductBenefit"]] = relationship("ProductBenefit", back_populates="product_version", cascade="all, delete-orphan")
    exclusions: Mapped[List["ProductExclusion"]] = relationship("ProductExclusion", back_populates="product_version", cascade="all, delete-orphan")


class ProductBenefit(Base, TimestampMixin):
    """Structured policy benefit (e.g. terminal illness, smart exit, accidental death)."""
    __tablename__ = "product_benefits"

    id: Mapped[uuid.UUID] = mapped_column(GUID(), primary_key=True, default=uuid.uuid4)
    product_version_id: Mapped[uuid.UUID] = mapped_column(GUID(), ForeignKey("product_versions.id", ondelete="CASCADE"), nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text(), nullable=True)
    is_rider: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False) # Inbuilt vs optional add-on

    product_version: Mapped["ProductVersion"] = relationship("ProductVersion", back_populates="benefits")


class ProductExclusion(Base, TimestampMixin):
    """Crucial statutory exclusion (e.g., suicide 12m clause, hazardous sports, undeclared illness)."""
    __tablename__ = "product_exclusions"

    id: Mapped[uuid.UUID] = mapped_column(GUID(), primary_key=True, default=uuid.uuid4)
    product_version_id: Mapped[uuid.UUID] = mapped_column(GUID(), ForeignKey("product_versions.id", ondelete="CASCADE"), nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    clause_reference: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    details: Mapped[Optional[str]] = mapped_column(Text(), nullable=True)

    product_version: Mapped["ProductVersion"] = relationship("ProductVersion", back_populates="exclusions")
