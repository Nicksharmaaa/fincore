from datetime import datetime, timezone
import random
import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.deps import RoleChecker, get_current_user, get_current_user_optional, get_db
from app.models.auth import Role, User
from app.models.customer import Customer, CustomerAssessment, CustomerConsent
from app.models.lead import Lead, LeadActivity, LeadAssignment
from app.models.ml import ModelScore
from app.models.notification import Notification
from app.models.organization import Organization
from app.models.task import Task
from app.models.quote import Quote
from app.schemas.lead import (
    CustomerEnquiryCreate,
    CustomerEnquiryResponse,
    LeadActivityCreate,
    LeadActivityResponse,
    LeadCreate,
    LeadDetailResponse,
    LeadResponse,
    LeadUpdate,
)
from app.services.audit_service import record_audit_log

router = APIRouter(prefix="/leads", tags=["Leads"])


@router.post("/enquiry", response_model=CustomerEnquiryResponse, status_code=status.HTTP_201_CREATED)
async def submit_customer_enquiry(
    payload: CustomerEnquiryCreate,
    request: Request,
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: AsyncSession = Depends(get_db)
):
    """Public customer enquiry and lead capture intake endpoint.

    Fulfills statutory DPDP Act consent, deduplicates/creates customer record,
    persists multi-step assessment data, automatically assigns an active sales advisor,
    creates lead with activity history, and triggers operational employee notifications.
    """
    if current_user:
        org_id = current_user.organization_id
    else:
        org_res = await db.execute(select(Organization).limit(1))
        org = org_res.scalar_one_or_none()
        if not org:
            raise HTTPException(status_code=500, detail="Broker organization not configured")
        org_id = org.id

    # 1. Deduplicate or create customer
    clean_email = payload.customer_email.lower().strip()
    clean_phone = payload.customer_phone.strip()

    stmt = select(Customer).where(
        Customer.organization_id == org_id,
        or_(Customer.email == clean_email, Customer.phone == clean_phone)
    )
    res = await db.execute(stmt)
    customer = res.scalar_one_or_none()

    annual_inc = None
    occ = None
    smoker = False
    if payload.assessment_data:
        annual_inc = float(payload.assessment_data.get("annual_income", 1500000))
        occ = payload.assessment_data.get("occupation", "Salaried")
        smoker = bool(payload.assessment_data.get("is_smoker", False))

    if not customer:
        customer = Customer(
            organization_id=org_id,
            full_name=payload.customer_name.strip(),
            email=clean_email,
            phone=clean_phone,
            city=payload.city or "Mumbai",
            annual_income=annual_inc,
            occupation=occ,
            smoker_status=smoker,
            kyc_status="Pending",
            segment="Salaried Retail"
        )
        db.add(customer)
        await db.flush()
    else:
        # Update missing fields
        if annual_inc and not customer.annual_income:
            customer.annual_income = annual_inc
        if occ and not customer.occupation:
            customer.occupation = occ
        if payload.city and not customer.city:
            customer.city = payload.city
        await db.flush()

    # 2. Record statutory DPDP consent
    client_ip = request.client.host if request.client else "127.0.0.1"
    user_agent = request.headers.get("user-agent", "Mozilla/5.0")
    consent = CustomerConsent(
        organization_id=org_id,
        customer_id=customer.id,
        consent_type=f"dpdp_{payload.enquiry_type.lower()}",
        ip_address=client_ip,
        user_agent=user_agent[:255] if user_agent else None,
        consented_at=datetime.now(timezone.utc),
        is_active=True
    )
    db.add(consent)

    # 3. If assessment data provided, compute and persist CustomerAssessment
    assessment_record = None
    calculated_gap = None
    if payload.assessment_data:
        income = float(payload.assessment_data.get("annual_income", 1500000))
        dependents = int(payload.assessment_data.get("dependents_count", 2))
        liabilities = float(payload.assessment_data.get("outstanding_liabilities", 0))
        existing = float(payload.assessment_data.get("existing_cover", 0))
        education = float(payload.assessment_data.get("education_fund_target", 0))

        hlv = (income * 12) + liabilities + (education * min(dependents, 2))
        calculated_gap = max(0.0, hlv - existing)

        notes = (
            f"Assessed HLV Requirement: ₹{hlv:,.0f}. "
            f"Formula: 12x Annual Income (₹{income*12:,.0f}) + "
            f"Debt Clearance (₹{liabilities:,.0f}) + "
            f"Education Goal (₹{education*min(dependents, 2):,.0f}) minus "
            f"Existing Cover (₹{existing:,.0f}). Uninsured gap: ₹{calculated_gap:,.0f}."
        )

        assessment_record = CustomerAssessment(
            organization_id=org_id,
            customer_id=customer.id,
            annual_income=income,
            dependents_count=dependents,
            outstanding_liabilities=liabilities,
            existing_cover=existing,
            education_fund_target=education,
            calculated_hlv=hlv,
            coverage_gap=calculated_gap,
            recommendation_notes=notes,
            raw_inputs_json=payload.assessment_data
        )
        db.add(assessment_record)
        await db.flush()

    # 4. Automatically assign to an active sales advisor
    advisor_stmt = (
        select(User)
        .join(User.roles)
        .where(
            User.organization_id == org_id,
            User.is_active == True,
            Role.code.in_(["sales", "advisor"])
        )
        .options(selectinload(User.roles))
    )
    advisor_res = await db.execute(advisor_stmt)
    advisors = advisor_res.scalars().all()
    assigned_advisor = advisors[0] if advisors else None

    if not assigned_advisor:
        fallback_stmt = select(User).where(User.organization_id == org_id, User.is_active == True)
        fallback_res = await db.execute(fallback_stmt)
        assigned_advisor = fallback_res.scalars().first()

    # 5. Create Lead
    lead_num = f"LD-{random.randint(1000, 9999)}"
    sum_assured = payload.desired_sum_assured or (calculated_gap if calculated_gap and calculated_gap > 0 else 10000000.0)

    lead = Lead(
        organization_id=org_id,
        lead_number=lead_num,
        customer_id=customer.id,
        product_interest=payload.product_interest or "Term Life Insurance",
        desired_sum_assured=sum_assured,
        source=payload.lead_source,
        status="New",
        assigned_user_id=assigned_advisor.id if assigned_advisor else None,
        current_ml_score=85,
        risk_profile_json={
            "enquiry_type": payload.enquiry_type,
            "message": payload.message,
            "product_id": str(payload.product_id) if payload.product_id else None,
            "product_ids": [str(p) for p in payload.product_ids] if payload.product_ids else [],
            "assessment_id": str(assessment_record.id) if assessment_record else None
        }
    )
    db.add(lead)
    await db.flush()

    # 6. Record LeadAssignment
    if assigned_advisor:
        assign = LeadAssignment(
            organization_id=org_id,
            lead_id=lead.id,
            assigned_to_user_id=assigned_advisor.id,
            assignment_reason=f"Automated inbound enquiry routing ({payload.enquiry_type})"
        )
        db.add(assign)

    # 7. Record LeadActivity
    activity = LeadActivity(
        organization_id=org_id,
        lead_id=lead.id,
        user_id=assigned_advisor.id if assigned_advisor else customer.id,
        activity_type="ENQUIRY_RECEIVED",
        title=f"Inbound {payload.enquiry_type.replace('_', ' ').title()}",
        notes=(
            f"Customer message: {payload.message or 'N/A'}. "
            f"Product: {payload.product_interest}. "
            f"Desired Sum Assured: ₹{sum_assured:,.0f}."
        )
    )
    db.add(activity)

    # 8. Trigger employee notification
    if assigned_advisor:
        notif_msg = (
            f"New customer enquiry from {customer.full_name} ({customer.phone}) for {payload.product_interest}. "
            f"Type: {payload.enquiry_type.replace('_', ' ')}."
        )
        if calculated_gap:
            notif_msg += f" Coverage Gap: ₹{calculated_gap:,.0f}."

        notif = Notification(
            organization_id=org_id,
            user_id=assigned_advisor.id,
            title=f"New Lead Assigned: {lead.lead_number}",
            message=notif_msg,
            notification_type="LEAD_ASSIGNED",
            link_url=f"/app/leads/{lead.id}"
        )
        db.add(notif)

    # 9. Audit log
    await record_audit_log(
        db=db,
        organization_id=org_id,
        actor_email=clean_email,
        action="CUSTOMER_ENQUIRY_RECEIVED",
        entity_name="Lead",
        entity_id=str(lead.id),
        changes_json={"lead_number": lead.lead_number, "enquiry_type": payload.enquiry_type}
    )

    await db.commit()

    advisor_name = assigned_advisor.full_name if assigned_advisor else "FINCORE Insurance Advisors"
    advisor_email = assigned_advisor.email if assigned_advisor else "contact@fincore.in"

    return CustomerEnquiryResponse(
        status="success",
        lead_number=lead.lead_number,
        lead_id=lead.id,
        customer_id=customer.id,
        assessment_id=assessment_record.id if assessment_record else None,
        assigned_advisor={"name": advisor_name, "email": advisor_email},
        calculated_gap=calculated_gap,
        message="Your enquiry has been successfully registered. A licensed insurance advisor will contact you within 2 business hours."
    )


@router.get("/", response_model=List[LeadResponse])
async def list_leads(
    status_filter: Optional[str] = None,
    assigned_to_me: bool = False,
    current_user: User = Depends(RoleChecker(["sales", "manager", "admin"])),
    db: AsyncSession = Depends(get_db)
):
    """List sales leads with optional pipeline stage filter."""
    stmt = select(Lead).where(Lead.organization_id == current_user.organization_id)

    if status_filter and status_filter.lower() != "all":
        stmt = stmt.where(Lead.status.ilike(status_filter))

    # Agents by default see their assigned leads unless manager/admin
    user_roles = [r.code.lower() for r in current_user.roles]
    if assigned_to_me or ("sales" in user_roles and "manager" not in user_roles and "admin" not in user_roles):
        stmt = stmt.where(Lead.assigned_user_id == current_user.id)

    stmt = stmt.order_by(Lead.created_at.desc())
    res = await db.execute(stmt)
    return res.scalars().all()


@router.post("/", response_model=LeadResponse, status_code=status.HTTP_201_CREATED)
async def create_lead(
    lead_in: LeadCreate,
    current_user: User = Depends(RoleChecker(["sales", "manager", "admin"])),
    db: AsyncSession = Depends(get_db)
):
    """Record a new prospective lead intake."""
    customer_id = lead_in.customer_id

    # If customer does not exist, auto-create customer record
    if not customer_id:
        if not lead_in.customer_name or not lead_in.customer_phone:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Either customer_id or customer_name & customer_phone are required"
            )
        new_customer = Customer(
            organization_id=current_user.organization_id,
            full_name=lead_in.customer_name,
            phone=lead_in.customer_phone,
            email=lead_in.customer_email or f"lead_{uuid.uuid4().hex[:6]}@demo.fincore.in",
            kyc_status="Pending",
            segment="Salaried Retail"
        )
        db.add(new_customer)
        await db.flush()
        customer_id = new_customer.id

    lead_number = f"LD-{1000 + (hash(str(uuid.uuid4())) % 9000)}"

    lead = Lead(
        organization_id=current_user.organization_id,
        lead_number=lead_number,
        customer_id=customer_id,
        product_interest=lead_in.product_interest,
        target_insurer_id=lead_in.target_insurer_id,
        desired_sum_assured=lead_in.desired_sum_assured,
        source=lead_in.source,
        status="New",
        assigned_user_id=current_user.id,
        current_ml_score=75 # Default initial score
    )
    db.add(lead)
    await db.flush()

    # Create initial activity
    activity = LeadActivity(
        organization_id=current_user.organization_id,
        lead_id=lead.id,
        user_id=current_user.id,
        activity_type="NOTE",
        title="Lead Intake Recorded",
        notes=f"Lead recorded via {lead_in.source} for {lead_in.product_interest}."
    )
    db.add(activity)

    # Initial ML score record
    score_entry = ModelScore(
        organization_id=current_user.organization_id,
        lead_id=lead.id,
        model_name="Heuristic_Priority_Scorer",
        model_version="v1.0",
        conversion_probability=0.75,
        priority_score=75
    )
    db.add(score_entry)
    await db.flush()

    await record_audit_log(
        db=db,
        organization_id=current_user.organization_id,
        actor_email=current_user.email,
        action="CREATE_LEAD",
        entity_name="Lead",
        entity_id=str(lead.id),
        actor_user_id=current_user.id
    )

    return lead


@router.get("/{lead_id}", response_model=LeadResponse)
async def get_lead(
    lead_id: uuid.UUID,
    current_user: User = Depends(RoleChecker(["sales", "manager", "admin"])),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve details for a specific lead."""
    stmt = select(Lead).where(
        Lead.id == lead_id,
        Lead.organization_id == current_user.organization_id
    )
    res = await db.execute(stmt)
    lead = res.scalar_one_or_none()
    if not lead:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lead not found")
    return lead


@router.get("/{lead_id}/detail", response_model=LeadDetailResponse)
async def get_lead_detail(
    lead_id: uuid.UUID,
    current_user: User = Depends(RoleChecker(["sales", "manager", "admin"])),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve comprehensive 360° lead dossier with customer profile, activity logs, and assignments."""
    stmt = (
        select(Lead)
        .where(Lead.id == lead_id, Lead.organization_id == current_user.organization_id)
        .options(
            selectinload(Lead.customer),
            selectinload(Lead.activities),
            selectinload(Lead.assignments),
            selectinload(Lead.tasks),
            selectinload(Lead.quotes),
        )
    )
    res = await db.execute(stmt)
    lead = res.scalar_one_or_none()
    if not lead:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lead not found")

    # Resolve assigned advisor name
    assigned_name = None
    if lead.assigned_user_id:
        u_stmt = select(User).where(User.id == lead.assigned_user_id)
        u_res = await db.execute(u_stmt)
        assigned_user = u_res.scalar_one_or_none()
        if assigned_user:
            assigned_name = assigned_user.full_name

    # Customer snapshot
    customer_dict = None
    if lead.customer:
        c = lead.customer
        customer_dict = {
            "id": str(c.id),
            "full_name": c.full_name,
            "email": c.email,
            "phone": c.phone,
            "city": c.city,
            "state": c.state,
            "pan_number": c.pan_number,
            "annual_income": float(c.annual_income) if c.annual_income else None,
            "occupation": c.occupation,
            "smoker_status": c.smoker_status,
            "kyc_status": c.kyc_status,
            "segment": c.segment,
        }

    # Fetch latest assessment
    as_stmt = select(CustomerAssessment).where(
        CustomerAssessment.customer_id == lead.customer_id
    ).order_by(CustomerAssessment.created_at.desc())
    as_res = await db.execute(as_stmt)
    assessment = as_res.scalars().first()
    assessment_dict = None
    if assessment:
        assessment_dict = {
            "id": str(assessment.id),
            "annual_income": float(assessment.annual_income),
            "dependents_count": assessment.dependents_count,
            "outstanding_liabilities": float(assessment.outstanding_liabilities),
            "existing_cover": float(assessment.existing_cover),
            "education_fund_target": float(assessment.education_fund_target),
            "calculated_hlv": float(assessment.calculated_hlv),
            "coverage_gap": float(assessment.coverage_gap),
            "recommendation_notes": assessment.recommendation_notes,
            "created_at": assessment.created_at.isoformat() if assessment.created_at else None,
        }

    # Assignments with actor names
    assign_list = []
    for a in lead.assignments:
        assign_list.append({
            "id": str(a.id),
            "assigned_to_user_id": str(a.assigned_to_user_id),
            "assigned_by_user_id": str(a.assigned_by_user_id) if a.assigned_by_user_id else None,
            "assignment_reason": a.assignment_reason,
            "created_at": a.created_at.isoformat() if a.created_at else None,
        })

    # Tasks
    tasks_list = [
        {
            "id": str(t.id),
            "title": t.title,
            "description": t.description,
            "priority": t.priority,
            "status": t.status,
            "due_date": t.due_date.isoformat() if t.due_date else None,
            "completed_at": t.completed_at.isoformat() if t.completed_at else None,
        }
        for t in lead.tasks
    ]

    # Quotes
    quotes_list = [
        {
            "id": str(q.id),
            "quote_number": q.quote_number,
            "status": q.status,
            "valid_until": q.valid_until.isoformat() if q.valid_until else None,
            "created_at": q.created_at.isoformat() if q.created_at else None,
        }
        for q in lead.quotes
    ]

    return LeadDetailResponse(
        id=lead.id,
        lead_number=lead.lead_number,
        customer_id=lead.customer_id,
        product_interest=lead.product_interest,
        desired_sum_assured=float(lead.desired_sum_assured),
        source=lead.source,
        status=lead.status,
        assigned_user_id=lead.assigned_user_id,
        assigned_user_name=assigned_name,
        current_ml_score=lead.current_ml_score,
        lost_reason=lead.lost_reason,
        created_at=lead.created_at,
        customer=customer_dict,
        assessment=assessment_dict,
        activities=lead.activities,
        assignments=assign_list,
        tasks=tasks_list,
        quotes=quotes_list,
    )



@router.patch("/{lead_id}", response_model=LeadResponse)
async def update_lead(
    lead_id: uuid.UUID,
    lead_in: LeadUpdate,
    current_user: User = Depends(RoleChecker(["sales", "manager", "admin"])),
    db: AsyncSession = Depends(get_db)
):
    """Update lead pipeline stage status or assigned agent."""
    stmt = select(Lead).where(
        Lead.id == lead_id,
        Lead.organization_id == current_user.organization_id
    )
    res = await db.execute(stmt)
    lead = res.scalar_one_or_none()
    if not lead:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lead not found")

    old_status = lead.status
    if lead_in.status is not None:
        lead.status = lead_in.status
    if lead_in.assigned_user_id is not None:
        lead.assigned_user_id = lead_in.assigned_user_id
    if lead_in.desired_sum_assured is not None:
        lead.desired_sum_assured = lead_in.desired_sum_assured
    if lead_in.lost_reason is not None:
        lead.lost_reason = lead_in.lost_reason

    # If status changed, log activity
    if lead_in.status and lead_in.status != old_status:
        activity = LeadActivity(
            organization_id=current_user.organization_id,
            lead_id=lead.id,
            user_id=current_user.id,
            activity_type="STATUS_CHANGE",
            title=f"Pipeline Stage Changed to {lead.status}",
            notes=f"Stage transition from {old_status} to {lead.status}."
        )
        db.add(activity)

    await db.flush()

    await record_audit_log(
        db=db,
        organization_id=current_user.organization_id,
        actor_email=current_user.email,
        action="UPDATE_LEAD",
        entity_name="Lead",
        entity_id=str(lead.id),
        actor_user_id=current_user.id,
        changes_json={"status": lead.status, "assigned_to": str(lead.assigned_user_id)}
    )

    return lead


@router.post("/{lead_id}/activities", response_model=LeadActivityResponse, status_code=status.HTTP_201_CREATED)
async def log_lead_activity(
    lead_id: uuid.UUID,
    activity_in: LeadActivityCreate,
    current_user: User = Depends(RoleChecker(["sales", "manager", "admin"])),
    db: AsyncSession = Depends(get_db)
):
    """Record an interaction activity note or follow-up call outcome."""
    stmt = select(Lead).where(
        Lead.id == lead_id,
        Lead.organization_id == current_user.organization_id
    )
    res = await db.execute(stmt)
    lead = res.scalar_one_or_none()
    if not lead:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lead not found")

    activity = LeadActivity(
        organization_id=current_user.organization_id,
        lead_id=lead.id,
        user_id=current_user.id,
        activity_type=activity_in.activity_type,
        title=activity_in.title,
        notes=activity_in.notes
    )
    db.add(activity)
    await db.flush()
    return activity

