import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user_optional, get_db
from app.models.auth import User
from app.models.insurer import Insurer
from app.models.organization import Organization
from app.schemas.product import InsurerResponse

router = APIRouter(prefix="/insurers", tags=["Insurers"])


@router.get("/", response_model=List[InsurerResponse])
async def list_insurers(
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: AsyncSession = Depends(get_db)
):
    """List all authorised life insurance partner carriers."""
    if current_user:
        org_id = current_user.organization_id
    else:
        org_res = await db.execute(select(Organization).limit(1))
        org = org_res.scalar_one_or_none()
        org_id = org.id if org else None

    stmt = select(Insurer).where(Insurer.is_active == True)
    if org_id:
        stmt = stmt.where(Insurer.organization_id == org_id)

    stmt = stmt.order_by(Insurer.name)
    res = await db.execute(stmt)
    return res.scalars().all()


@router.get("/{insurer_id}", response_model=InsurerResponse)
async def get_insurer(
    insurer_id: uuid.UUID,
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve details for a specific insurer partner."""
    if current_user:
        org_id = current_user.organization_id
    else:
        org_res = await db.execute(select(Organization).limit(1))
        org = org_res.scalar_one_or_none()
        org_id = org.id if org else None

    stmt = select(Insurer).where(Insurer.id == insurer_id)
    if org_id:
        stmt = stmt.where(Insurer.organization_id == org_id)

    res = await db.execute(stmt)
    ins = res.scalar_one_or_none()
    if not ins:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Insurer not found")
    return ins

