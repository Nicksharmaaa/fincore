import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_active_employee, get_current_user
from app.db.session import get_db
from app.models.auth import User
from app.models.document import Document, DocumentLink
from app.schemas.document import DocumentCreate, DocumentResponse
from app.services.audit_service import record_audit_log

router = APIRouter(prefix="/documents", tags=["Documents"])


class DocumentVerifyPayload(BaseModel):
    status: str  # Verified, Rejected
    rejection_reason: Optional[str] = None


@router.get("", response_model=List[DocumentResponse])
async def list_documents(
    doc_type: Optional[str] = None,
    verification_status: Optional[str] = None,
    customer_id: Optional[uuid.UUID] = None,
    application_id: Optional[uuid.UUID] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_employee),
):
    """List documents with optional metadata filtering."""
    stmt = select(Document).where(Document.organization_id == current_user.organization_id).order_by(Document.created_at.desc())

    if doc_type:
        stmt = stmt.where(Document.doc_type == doc_type)
    if verification_status:
        stmt = stmt.where(Document.verification_status == verification_status)

    if customer_id or application_id:
        target_id = customer_id or application_id
        target_type = "customer" if customer_id else "application"
        stmt = (
            stmt.join(DocumentLink, Document.id == DocumentLink.document_id)
            .where(DocumentLink.entity_type == target_type, DocumentLink.entity_id == target_id)
        )

    res = await db.execute(stmt)
    return res.scalars().all()


@router.post("", response_model=DocumentResponse, status_code=status.HTTP_201_CREATED)
async def create_document(
    payload: DocumentCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Register document metadata referencing secure object storage."""
    doc_number = f"DOC-{uuid.uuid4().hex[:6].upper()}"

    doc = Document(
        organization_id=current_user.organization_id,
        doc_number=doc_number,
        file_name=payload.file_name,
        storage_path=payload.storage_path,
        mime_type=payload.mime_type,
        file_size_bytes=payload.file_size_bytes,
        doc_type=payload.doc_type,
        verification_status="Pending",
    )
    db.add(doc)
    await db.flush()

    # Link to customer if provided
    if payload.customer_id:
        link_cust = DocumentLink(
            document_id=doc.id,
            entity_type="customer",
            entity_id=payload.customer_id,
        )
        db.add(link_cust)

    # Link to application if provided
    if payload.application_id:
        link_app = DocumentLink(
            document_id=doc.id,
            entity_type="application",
            entity_id=payload.application_id,
        )
        db.add(link_app)

    await record_audit_log(
        db,
        current_user,
        action="DOCUMENT_UPLOADED",
        entity_name="Document",
        entity_id=str(doc.id),
        changes={"doc_number": doc_number, "doc_type": payload.doc_type},
    )
    await db.commit()
    await db.refresh(doc)
    return doc


@router.get("/{document_id}", response_model=DocumentResponse)
async def get_document(
    document_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Retrieve document metadata."""
    stmt = select(Document).where(
        Document.id == document_id,
        Document.organization_id == current_user.organization_id,
    )
    res = await db.execute(stmt)
    doc = res.scalar_one_or_none()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return doc


@router.patch("/{document_id}/verify", response_model=DocumentResponse)
async def verify_document(
    document_id: uuid.UUID,
    payload: DocumentVerifyPayload,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_employee),
):
    """Verify or reject a customer verification document."""
    if payload.status not in ["Verified", "Rejected"]:
        raise HTTPException(status_code=400, detail="Status must be 'Verified' or 'Rejected'")

    stmt = select(Document).where(
        Document.id == document_id,
        Document.organization_id == current_user.organization_id,
    )
    res = await db.execute(stmt)
    doc = res.scalar_one_or_none()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    doc.verification_status = payload.status
    doc.verified_by_user_id = current_user.id
    if payload.status == "Rejected":
        doc.rejection_reason = payload.rejection_reason or "Document does not satisfy compliance requirements."
    else:
        doc.rejection_reason = None

    await record_audit_log(
        db,
        current_user,
        action=f"DOCUMENT_{payload.status.upper()}",
        entity_name="Document",
        entity_id=str(doc.id),
        changes={"verification_status": payload.status, "reason": doc.rejection_reason},
    )
    await db.commit()
    await db.refresh(doc)
    return doc
