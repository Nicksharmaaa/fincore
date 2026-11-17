import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.deps import RoleChecker, get_current_user, get_db
from app.models.auth import User
from app.models.customer import Customer, CustomerAssessment, CustomerConsent
from app.models.lead import Lead, LeadActivity
from app.models.application import Application
from app.models.task import Task
from app.models.document import Document, DocumentLink
from app.schemas.customer import Customer360Response, CustomerCreate, CustomerResponse, CustomerUpdate
from app.services.audit_service import record_audit_log

router = APIRouter(prefix="/customers", tags=["Customers"])


@router.get("/", response_model=List[CustomerResponse])
async def list_customers(
    q: Optional[str] = None,
    kyc_status: Optional[str] = None,
    current_user: User = Depends(RoleChecker(["sales", "manager", "admin", "operations", "compliance"])),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve customer registry with optional search by name, PAN, phone or email."""
    stmt = select(Customer).where(Customer.organization_id == current_user.organization_id)

    if q:
        search_term = f"%{q.strip().lower()}%"
        stmt = stmt.where(
            or_(
                Customer.full_name.ilike(search_term),
                Customer.email.ilike(search_term),
                Customer.phone.ilike(search_term),
                Customer.pan_number.ilike(search_term),
            )
        )
    if kyc_status:
        stmt = stmt.where(Customer.kyc_status == kyc_status)

    stmt = stmt.order_by(Customer.created_at.desc())
    res = await db.execute(stmt)
    return res.scalars().all()


@router.post("/", response_model=CustomerResponse, status_code=status.HTTP_201_CREATED)
async def create_customer(
    customer_in: CustomerCreate,
    current_user: User = Depends(RoleChecker(["sales", "manager", "admin", "operations"])),
    db: AsyncSession = Depends(get_db)
):
    """Create a new customer profile with deduplication guard on PAN and email."""
    # Deduplication check on email
    stmt = select(Customer).where(
        Customer.organization_id == current_user.organization_id,
        Customer.email == customer_in.email.lower()
    )
    res = await db.execute(stmt)
    existing_by_email = res.scalar_one_or_none()
    if existing_by_email:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Customer with email {customer_in.email} already exists (ID: {existing_by_email.id})"
        )

    # Deduplication check on PAN if provided
    if customer_in.pan_number:
        pan_stmt = select(Customer).where(
            Customer.organization_id == current_user.organization_id,
            Customer.pan_number == customer_in.pan_number.strip().upper()
        )
        pan_res = await db.execute(pan_stmt)
        existing_by_pan = pan_res.scalar_one_or_none()
        if existing_by_pan:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Customer with PAN {customer_in.pan_number} already registered (ID: {existing_by_pan.id})"
            )

    customer = Customer(
        organization_id=current_user.organization_id,
        full_name=customer_in.full_name,
        email=customer_in.email.lower(),
        phone=customer_in.phone,
        pan_number=customer_in.pan_number.strip().upper() if customer_in.pan_number else None,
        dob=customer_in.dob,
        gender=customer_in.gender,
        city=customer_in.city,
        state=customer_in.state,
        annual_income=customer_in.annual_income,
        occupation=customer_in.occupation,
        smoker_status=customer_in.smoker_status,
        kyc_status="Pending",
        segment="HNW" if (customer_in.annual_income or 0) >= 2500000 else "Salaried Retail"
    )
    db.add(customer)
    await db.flush()

    await record_audit_log(
        db=db,
        organization_id=current_user.organization_id,
        actor_email=current_user.email,
        action="CREATE_CUSTOMER",
        entity_name="Customer",
        entity_id=str(customer.id),
        actor_user_id=current_user.id,
        changes_json={"name": customer.full_name, "email": customer.email}
    )

    return customer


@router.get("/{customer_id}", response_model=CustomerResponse)
async def get_customer(
    customer_id: uuid.UUID,
    current_user: User = Depends(RoleChecker(["sales", "manager", "admin", "operations", "compliance"])),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve basic customer profile."""
    stmt = select(Customer).where(
        Customer.id == customer_id,
        Customer.organization_id == current_user.organization_id
    )
    res = await db.execute(stmt)
    customer = res.scalar_one_or_none()
    if not customer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Customer not found")
    return customer


@router.get("/{customer_id}/360", response_model=Customer360Response)
async def get_customer_360(
    customer_id: uuid.UUID,
    current_user: User = Depends(RoleChecker(["sales", "manager", "admin", "operations", "compliance"])),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve comprehensive Customer 360° profile with full lifecycle relationship records."""
    stmt = select(Customer).where(
        Customer.id == customer_id,
        Customer.organization_id == current_user.organization_id
    )
    res = await db.execute(stmt)
    customer = res.scalar_one_or_none()
    if not customer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Customer not found")

    # 1. Assessments
    as_stmt = select(CustomerAssessment).where(
        CustomerAssessment.customer_id == customer_id
    ).order_by(CustomerAssessment.created_at.desc())
    as_res = await db.execute(as_stmt)
    assessments = [
        {
            "id": str(a.id),
            "annual_income": float(a.annual_income),
            "dependents_count": a.dependents_count,
            "outstanding_liabilities": float(a.outstanding_liabilities),
            "existing_cover": float(a.existing_cover),
            "education_fund_target": float(a.education_fund_target),
            "calculated_hlv": float(a.calculated_hlv),
            "coverage_gap": float(a.coverage_gap),
            "recommendation_notes": a.recommendation_notes,
            "created_at": a.created_at.isoformat() if a.created_at else None,
        }
        for a in as_res.scalars().all()
    ]

    # 2. Leads
    lead_stmt = select(Lead).where(
        Lead.customer_id == customer_id
    ).order_by(Lead.created_at.desc())
    lead_res = await db.execute(lead_stmt)
    leads_list = lead_res.scalars().all()
    lead_ids = [l.id for l in leads_list]

    leads_data = [
        {
            "id": str(l.id),
            "lead_number": l.lead_number,
            "product_interest": l.product_interest,
            "desired_sum_assured": float(l.desired_sum_assured),
            "source": l.source,
            "status": l.status,
            "current_ml_score": l.current_ml_score,
            "assigned_user_id": str(l.assigned_user_id) if l.assigned_user_id else None,
            "created_at": l.created_at.isoformat() if l.created_at else None,
        }
        for l in leads_list
    ]

    # 3. Applications
    app_stmt = select(Application).where(
        Application.customer_id == customer_id
    ).options(selectinload(Application.insurer)).order_by(Application.created_at.desc())
    app_res = await db.execute(app_stmt)
    apps_data = [
        {
            "id": str(ap.id),
            "application_number": ap.application_number,
            "insurer_name": ap.insurer.name if ap.insurer else "Partner Insurer",
            "external_insurer_proposal_no": ap.external_insurer_proposal_no,
            "policy_number": ap.policy_number,
            "sum_assured": float(ap.sum_assured),
            "annual_premium": float(ap.annual_premium),
            "status": ap.status,
            "underwriting_notes": ap.underwriting_notes,
            "created_at": ap.created_at.isoformat() if ap.created_at else None,
        }
        for ap in app_res.scalars().all()
    ]

    # 4. Documents linked
    doc_stmt = (
        select(Document)
        .join(DocumentLink, DocumentLink.document_id == Document.id)
        .where(
            DocumentLink.entity_type == "customer",
            DocumentLink.entity_id == customer_id
        )
    )
    doc_res = await db.execute(doc_stmt)
    docs_data = [
        {
            "id": str(d.id),
            "doc_number": d.doc_number,
            "file_name": d.file_name,
            "doc_type": d.doc_type,
            "verification_status": d.verification_status,
            "mime_type": d.mime_type,
            "created_at": d.created_at.isoformat() if d.created_at else None,
        }
        for d in doc_res.scalars().all()
    ]

    # 5. Consents
    con_stmt = select(CustomerConsent).where(
        CustomerConsent.customer_id == customer_id
    ).order_by(CustomerConsent.consented_at.desc())
    con_res = await db.execute(con_stmt)
    cons_data = [
        {
            "id": str(c.id),
            "consent_type": c.consent_type,
            "is_active": c.is_active,
            "consented_at": c.consented_at.isoformat() if c.consented_at else None,
        }
        for c in con_res.scalars().all()
    ]

    # 6. Tasks (linked to customer's leads)
    tasks_data = []
    if lead_ids:
        task_stmt = select(Task).where(
            Task.lead_id.in_(lead_ids)
        ).order_by(Task.due_date.asc())
        task_res = await db.execute(task_stmt)
        tasks_data = [
            {
                "id": str(t.id),
                "title": t.title,
                "description": t.description,
                "priority": t.priority,
                "status": t.status,
                "due_date": t.due_date.isoformat() if t.due_date else None,
                "completed_at": t.completed_at.isoformat() if t.completed_at else None,
            }
            for t in task_res.scalars().all()
        ]

    # 7. Interaction history
    interactions_data = []
    if lead_ids:
        act_stmt = select(LeadActivity).where(
            LeadActivity.lead_id.in_(lead_ids)
        ).order_by(LeadActivity.occurred_at.desc())
        act_res = await db.execute(act_stmt)
        interactions_data = [
            {
                "id": str(act.id),
                "lead_id": str(act.lead_id),
                "activity_type": act.activity_type,
                "title": act.title,
                "notes": act.notes,
                "occurred_at": act.occurred_at.isoformat() if act.occurred_at else None,
            }
            for act in act_res.scalars().all()
        ]

    return Customer360Response(
        customer=customer,
        assessments=assessments,
        leads=leads_data,
        applications=apps_data,
        documents=docs_data,
        consents=cons_data,
        tasks=tasks_data,
        interaction_history=interactions_data,
    )



@router.put("/{customer_id}", response_model=CustomerResponse)
async def update_customer(
    customer_id: uuid.UUID,
    update_in: CustomerUpdate,
    current_user: User = Depends(RoleChecker(["sales", "manager", "admin", "operations"])),
    db: AsyncSession = Depends(get_db)
):
    """Update customer contact info or KYC status."""
    stmt = select(Customer).where(
        Customer.id == customer_id,
        Customer.organization_id == current_user.organization_id
    )
    res = await db.execute(stmt)
    customer = res.scalar_one_or_none()
    if not customer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Customer not found")

    if update_in.full_name is not None:
        customer.full_name = update_in.full_name
    if update_in.phone is not None:
        customer.phone = update_in.phone
    if update_in.pan_number is not None:
        customer.pan_number = update_in.pan_number.strip().upper()
    if update_in.annual_income is not None:
        customer.annual_income = update_in.annual_income
    if update_in.kyc_status is not None:
        customer.kyc_status = update_in.kyc_status
    if update_in.city is not None:
        customer.city = update_in.city

    await db.flush()

    await record_audit_log(
        db=db,
        organization_id=current_user.organization_id,
        actor_email=current_user.email,
        action="UPDATE_CUSTOMER",
        entity_name="Customer",
        entity_id=str(customer.id),
        actor_user_id=current_user.id
    )

    return customer

