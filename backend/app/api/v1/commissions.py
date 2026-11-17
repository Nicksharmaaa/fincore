import uuid
from datetime import date
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import RoleChecker, get_current_active_employee
from app.db.session import get_db
from app.models.auth import User
from app.models.commission import CommissionAccrual, CommissionSchedule
from app.schemas.document import CommissionAccrualResponse, CommissionScheduleResponse
from app.services.audit_service import record_audit_log

router = APIRouter(prefix="/commissions", tags=["Commissions"])


class CommissionScheduleCreate(BaseModel):
    insurer_id: uuid.UUID
    product_category: str
    first_year_rate_pct: float
    renewal_rate_pct: float = 5.0
    irdai_cap_rate_pct: float = 20.0
    effective_from: date = date.today()
    is_active: bool = True


@router.get("/schedules", response_model=List[CommissionScheduleResponse])
async def list_commission_schedules(
    insurer_id: Optional[uuid.UUID] = None,
    product_category: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_employee),
):
    """List regulated broker commission slabs."""
    stmt = select(CommissionSchedule).where(
        CommissionSchedule.organization_id == current_user.organization_id
    )
    if insurer_id:
        stmt = stmt.where(CommissionSchedule.insurer_id == insurer_id)
    if product_category:
        stmt = stmt.where(CommissionSchedule.product_category == product_category)

    res = await db.execute(stmt)
    return res.scalars().all()


@router.post(
    "/schedules",
    response_model=CommissionScheduleResponse,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(RoleChecker(["admin", "manager", "finance"]))],
)
async def create_commission_schedule(
    payload: CommissionScheduleCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_employee),
):
    """Define a commission schedule slab conforming to IRDAI guidelines."""
    if payload.first_year_rate_pct > payload.irdai_cap_rate_pct:
        raise HTTPException(
            status_code=400,
            detail=f"Commission rate {payload.first_year_rate_pct}% exceeds IRDAI regulatory cap of {payload.irdai_cap_rate_pct}%",
        )

    sched = CommissionSchedule(
        organization_id=current_user.organization_id,
        insurer_id=payload.insurer_id,
        product_category=payload.product_category,
        first_year_rate_pct=payload.first_year_rate_pct,
        renewal_rate_pct=payload.renewal_rate_pct,
        irdai_cap_rate_pct=payload.irdai_cap_rate_pct,
        effective_from=payload.effective_from,
        is_active=payload.is_active,
    )
    db.add(sched)
    await record_audit_log(
        db,
        current_user,
        action="COMMISSION_SCHEDULE_CREATED",
        entity_name="CommissionSchedule",
        changes={"category": payload.product_category, "rate": payload.first_year_rate_pct},
    )
    await db.commit()
    await db.refresh(sched)
    return sched


@router.get("/accruals", response_model=List[CommissionAccrualResponse])
async def list_commission_accruals(
    insurer_id: Optional[uuid.UUID] = None,
    accrual_status: Optional[str] = Query(None, alias="status"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_employee),
):
    """List commission receivables and settlement statuses."""
    stmt = (
        select(CommissionAccrual)
        .where(CommissionAccrual.organization_id == current_user.organization_id)
        .order_by(CommissionAccrual.created_at.desc())
    )
    if insurer_id:
        stmt = stmt.where(CommissionAccrual.insurer_id == insurer_id)
    if accrual_status:
        stmt = stmt.where(CommissionAccrual.status == accrual_status)

    res = await db.execute(stmt)
    return res.scalars().all()
