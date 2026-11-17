import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.deps import get_current_active_employee, get_current_user
from app.db.session import get_db
from app.models.application import Application, ApplicationEvent
from app.models.commission import CommissionAccrual, CommissionSchedule
from app.models.auth import User
from app.schemas.application import ApplicationCreate, ApplicationResponse, ApplicationUpdate
from app.services.audit_service import record_audit_log

router = APIRouter(prefix="/applications", tags=["Applications"])


@router.get("", response_model=List[ApplicationResponse])
async def list_applications(
    status_filter: Optional[str] = Query(None, alias="status"),
    customer_id: Optional[uuid.UUID] = None,
    insurer_id: Optional[uuid.UUID] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_employee),
):
    """List applications with optional filters (Employee/Manager access)."""
    stmt = (
        select(Application)
        .where(Application.organization_id == current_user.organization_id)
        .options(selectinload(Application.events))
        .order_by(Application.created_at.desc())
    )
    if status_filter:
        stmt = stmt.where(Application.status == status_filter)
    if customer_id:
        stmt = stmt.where(Application.customer_id == customer_id)
    if insurer_id:
        stmt = stmt.where(Application.insurer_id == insurer_id)

    res = await db.execute(stmt)
    return res.scalars().all()


@router.post("", response_model=ApplicationResponse, status_code=status.HTTP_201_CREATED)
async def create_application(
    payload: ApplicationCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_employee),
):
    """Create a new life insurance proposal application."""
    app_num = f"APP-{uuid.uuid4().hex[:6].upper()}"

    app_obj = Application(
        organization_id=current_user.organization_id,
        application_number=app_num,
        customer_id=payload.customer_id,
        insurer_id=payload.insurer_id,
        product_version_id=payload.product_version_id,
        quote_item_id=payload.quote_item_id,
        sum_assured=payload.sum_assured,
        annual_premium=payload.annual_premium,
        status="Proposal Drafted",
        underwriting_notes=payload.underwriting_notes,
    )
    db.add(app_obj)
    await db.flush()

    # Create initial event
    init_event = ApplicationEvent(
        organization_id=current_user.organization_id,
        application_id=app_obj.id,
        event_type="STATUS_CHANGE",
        from_status=None,
        to_status="Proposal Drafted",
        notes="Application proposal drafted in FINCORE CRM.",
        actor_user_id=current_user.id,
    )
    db.add(init_event)

    await record_audit_log(
        db,
        current_user,
        action="APPLICATION_CREATED",
        entity_name="Application",
        entity_id=str(app_obj.id),
        changes={"application_number": app_num, "status": "Proposal Drafted"},
    )
    await db.commit()

    # Reload with events
    stmt = select(Application).where(Application.id == app_obj.id).options(selectinload(Application.events))
    res = await db.execute(stmt)
    return res.scalar_one()


@router.get("/{application_id}", response_model=ApplicationResponse)
async def get_application(
    application_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get single application proposal details."""
    stmt = (
        select(Application)
        .where(Application.id == application_id, Application.organization_id == current_user.organization_id)
        .options(selectinload(Application.events))
    )
    res = await db.execute(stmt)
    app_obj = res.scalar_one_or_none()
    if not app_obj:
        raise HTTPException(status_code=404, detail="Application not found")
    return app_obj


@router.patch("/{application_id}", response_model=ApplicationResponse)
async def update_application(
    application_id: uuid.UUID,
    payload: ApplicationUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_employee),
):
    """Update application underwriting status, policy number, or notes."""
    stmt = (
        select(Application)
        .where(Application.id == application_id, Application.organization_id == current_user.organization_id)
        .options(selectinload(Application.events))
    )
    res = await db.execute(stmt)
    app_obj = res.scalar_one_or_none()
    if not app_obj:
        raise HTTPException(status_code=404, detail="Application not found")

    old_status = app_obj.status
    if payload.status and payload.status != old_status:
        app_obj.status = payload.status
        # Record timeline event
        event = ApplicationEvent(
            organization_id=current_user.organization_id,
            application_id=app_obj.id,
            event_type="STATUS_CHANGE",
            from_status=old_status,
            to_status=payload.status,
            notes=payload.underwriting_notes or f"Status transitioned to {payload.status}",
            actor_user_id=current_user.id,
        )
        db.add(event)

        # If policy is issued, trigger commission accrual calculation
        if payload.status == "Policy Issued":
            # Lookup commission schedule for insurer
            sched_stmt = select(CommissionSchedule).where(
                CommissionSchedule.organization_id == current_user.organization_id,
                CommissionSchedule.insurer_id == app_obj.insurer_id,
                CommissionSchedule.is_active == True,
            )
            sched_res = await db.execute(sched_stmt)
            schedule = sched_res.scalars().first()
            rate = schedule.first_year_rate_pct if schedule else 15.00
            accrual_amount = float(app_obj.annual_premium) * (float(rate) / 100.0)

            accrual = CommissionAccrual(
                organization_id=current_user.organization_id,
                application_id=app_obj.id,
                insurer_id=app_obj.insurer_id,
                gross_premium_collected=app_obj.annual_premium,
                commission_rate_applied_pct=rate,
                accrued_commission_amount=round(accrual_amount, 2),
                status="Accrued",
            )
            db.add(accrual)

    if payload.external_insurer_proposal_no:
        app_obj.external_insurer_proposal_no = payload.external_insurer_proposal_no
    if payload.policy_number:
        app_obj.policy_number = payload.policy_number
    if payload.underwriting_notes:
        app_obj.underwriting_notes = payload.underwriting_notes

    await record_audit_log(
        db,
        current_user,
        action="APPLICATION_UPDATED",
        entity_name="Application",
        entity_id=str(app_obj.id),
        changes={"from_status": old_status, "to_status": app_obj.status},
    )
    await db.commit()

    # Re-fetch
    stmt = select(Application).where(Application.id == app_obj.id).options(selectinload(Application.events))
    res = await db.execute(stmt)
    return res.scalar_one()
