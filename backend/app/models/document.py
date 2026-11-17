import uuid
from typing import List, Optional
from sqlalchemy import Boolean, ForeignKey, Index, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base, GUID, TimestampMixin, TenantMixin


class Document(Base, TimestampMixin, TenantMixin):
    """Metadata record for files stored on secure object storage (never stores raw binary in DB)."""
    __tablename__ = "documents"

    id: Mapped[uuid.UUID] = mapped_column(GUID(), primary_key=True, default=uuid.uuid4)
    doc_number: Mapped[str] = mapped_column(String(50), index=True, nullable=False) # e.g. "DOC-1102"
    file_name: Mapped[str] = mapped_column(String(255), nullable=False)
    storage_path: Mapped[str] = mapped_column(String(500), nullable=False) # S3/blob path key e.g. 'org/2026/kyc/pan_1102.pdf'
    mime_type: Mapped[str] = mapped_column(String(100), default="application/pdf", nullable=False)
    file_size_bytes: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    sha256_checksum: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    doc_type: Mapped[str] = mapped_column(
        String(50),
        default="KYC_PAN",
        index=True,
        nullable=False
    ) # KYC_PAN, KYC_AADHAAR, INCOME_PROOF, MEDICAL_REPORT, SIGNED_PROPOSAL, POLICY_BOND
    verification_status: Mapped[str] = mapped_column(
        String(50),
        default="Pending",
        index=True,
        nullable=False
    ) # Pending, Verified, Rejected
    verified_by_user_id: Mapped[Optional[uuid.UUID]] = mapped_column(GUID(), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    rejection_reason: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    links: Mapped[List["DocumentLink"]] = relationship("DocumentLink", back_populates="document", cascade="all, delete-orphan")


class DocumentLink(Base, TimestampMixin):
    """Associates a document with customers, applications, leads or policies."""
    __tablename__ = "document_links"

    id: Mapped[uuid.UUID] = mapped_column(GUID(), primary_key=True, default=uuid.uuid4)
    document_id: Mapped[uuid.UUID] = mapped_column(GUID(), ForeignKey("documents.id", ondelete="CASCADE"), nullable=False, index=True)
    entity_type: Mapped[str] = mapped_column(String(50), index=True, nullable=False) # customer, application, lead
    entity_id: Mapped[uuid.UUID] = mapped_column(GUID(), index=True, nullable=False)

    __table_args__ = (
        Index("ix_doc_entity_link", "entity_type", "entity_id"),
    )

    document: Mapped["Document"] = relationship("Document", back_populates="links")
