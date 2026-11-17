import uuid
from datetime import date, datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.deps import RoleChecker, get_current_active_employee
from app.db.session import get_db
from app.models.audit import AuditLog
from app.models.auth import Role, User
from app.models.commission import CommissionAccrual
from app.models.customer import Customer
from app.models.insurer import Insurer
from app.models.organization import Organization
from app.models.product import Product

router = APIRouter(prefix="/admin", tags=["Admin"], dependencies=[Depends(RoleChecker(["admin"]))])


class AuditLogResponse(BaseModel):
    id: uuid.UUID
    actor_email: str
    action: str
    entity_name: str
    entity_id: Optional[str] = None
    changes_json: Optional[dict] = None
    created_at: str

    class Config:
        from_attributes = True


class RoleDetailResponse(BaseModel):
    id: uuid.UUID
    name: str
    description: Optional[str] = None
    permissions: List[str] = []


@router.get("/audit-logs")
async def list_audit_logs(
    action: Optional[str] = None,
    actor_email: Optional[str] = None,
    entity_name: Optional[str] = None,
    limit: int = Query(50, le=200),
    offset: int = 0,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_employee),
):
    """Query immutable IRDAI-compliant audit trails."""
    stmt = (
        select(AuditLog)
        .where(AuditLog.organization_id == current_user.organization_id)
        .order_by(AuditLog.created_at.desc())
        .limit(limit)
        .offset(offset)
    )
    if action:
        stmt = stmt.where(AuditLog.action == action)
    if actor_email:
        stmt = stmt.where(AuditLog.actor_email.ilike(f"%{actor_email}%"))
    if entity_name:
        stmt = stmt.where(AuditLog.entity_name == entity_name)

    res = await db.execute(stmt)
    logs = res.scalars().all()
    return [
        {
            "id": str(log.id),
            "actor_email": log.actor_email,
            "action": log.action,
            "entity_name": log.entity_name,
            "entity_id": log.entity_id,
            "changes_json": log.changes_json,
            "created_at": log.created_at.isoformat() if log.created_at else None,
        }
        for log in logs
    ]


@router.get("/roles", response_model=List[RoleDetailResponse])
async def list_role_matrix(
    db: AsyncSession = Depends(get_db),
):
    """Retrieve full RBAC role and permission matrix."""
    stmt = select(Role).options(selectinload(Role.permissions))
    res = await db.execute(stmt)
    roles = res.scalars().all()
    return [
        RoleDetailResponse(
            id=role.id,
            name=role.name,
            description=role.description,
            permissions=[p.name for p in role.permissions],
        )
        for role in roles
    ]


@router.get("/tenant-info")
async def get_tenant_info(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_employee),
):
    """Fetch current organization brokerage entity information."""
    stmt = select(Organization).where(Organization.id == current_user.organization_id)
    res = await db.execute(stmt)
    org = res.scalar_one_or_none()
    if not org:
        return {"id": str(current_user.organization_id), "status": "unknown"}
    return {
        "id": str(org.id),
        "name": org.name,
        "code": org.code,
        "irdai_registration_no": org.irdai_registration_no,
        "is_active": org.is_active,
    }


# ---------------------------------------------------------------------------
# Dashboard Stats
# ---------------------------------------------------------------------------

@router.get("/dashboard-stats")
async def get_dashboard_stats(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_employee),
):
    """High-level platform stats for the admin dashboard."""
    org_id = current_user.organization_id

    total_users_res = await db.execute(
        select(func.count(User.id)).where(User.organization_id == org_id)
    )
    total_users = total_users_res.scalar_one() or 0

    active_users_res = await db.execute(
        select(func.count(User.id)).where(User.organization_id == org_id, User.is_active == True)
    )
    active_users = active_users_res.scalar_one() or 0

    customers_res = await db.execute(
        select(func.count(Customer.id)).where(Customer.organization_id == org_id)
    )
    total_customers = customers_res.scalar_one() or 0

    insurers_res = await db.execute(
        select(func.count(Insurer.id)).where(Insurer.organization_id == org_id)
    )
    total_insurers = insurers_res.scalar_one() or 0

    products_res = await db.execute(
        select(func.count(Product.id)).where(Product.organization_id == org_id)
    )
    total_products = products_res.scalar_one() or 0

    audit_res = await db.execute(
        select(func.count(AuditLog.id)).where(AuditLog.organization_id == org_id)
    )
    total_audit_events = audit_res.scalar_one() or 0

    return {
        "total_users": total_users,
        "active_users": active_users,
        "total_customers": total_customers,
        "total_insurers": total_insurers,
        "total_products": total_products,
        "total_audit_events": total_audit_events,
    }


# ---------------------------------------------------------------------------
# Commission Records
# ---------------------------------------------------------------------------

@router.get("/commission-records")
async def list_commission_records(
    status: Optional[str] = Query(None, description="PENDING/ACCRUED/PAID/DISPUTED"),
    insurer_id: Optional[uuid.UUID] = Query(None),
    date_from: Optional[date] = Query(None),
    date_to: Optional[date] = Query(None),
    limit: int = Query(50, le=200),
    offset: int = 0,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(RoleChecker(["admin", "finance"])),
):
    """List commission accrual records with insurer and application references."""
    org_id = current_user.organization_id

    stmt = (
        select(CommissionAccrual)
        .where(CommissionAccrual.organization_id == org_id)
        .order_by(CommissionAccrual.created_at.desc())
        .limit(limit)
        .offset(offset)
    )

    if status:
        # Normalize: PAID → Settled by Insurer, ACCRUED → Accrued, etc.
        status_map = {
            "PAID": "Settled by Insurer",
            "ACCRUED": "Accrued",
            "PENDING": "Accrued",
            "DISPUTED": "Invoiced",
        }
        db_status = status_map.get(status.upper(), status)
        stmt = stmt.where(CommissionAccrual.status == db_status)

    if insurer_id:
        stmt = stmt.where(CommissionAccrual.insurer_id == insurer_id)

    if date_from:
        stmt = stmt.where(
            CommissionAccrual.created_at >= datetime.combine(date_from, datetime.min.time())
        )
    if date_to:
        stmt = stmt.where(
            CommissionAccrual.created_at <= datetime.combine(date_to, datetime.max.time())
        )

    res = await db.execute(stmt)
    records = res.scalars().all()

    result = []
    for rec in records:
        # Fetch insurer name
        ins_res = await db.execute(select(Insurer).where(Insurer.id == rec.insurer_id))
        insurer = ins_res.scalar_one_or_none()
        insurer_name = insurer.name if insurer else "Unknown"

        result.append({
            "id": str(rec.id),
            "application_id": str(rec.application_id),
            "insurer_id": str(rec.insurer_id),
            "insurer_name": insurer_name,
            "gross_premium_collected": float(rec.gross_premium_collected),
            "commission_rate_applied_pct": float(rec.commission_rate_applied_pct),
            "accrued_commission_amount": float(rec.accrued_commission_amount),
            "status": rec.status,
            "settlement_reference": rec.settlement_reference,
            "created_at": rec.created_at.isoformat() if rec.created_at else None,
        })

    return result
