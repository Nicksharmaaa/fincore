import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.deps import RoleChecker, get_current_user, get_db
from app.core.security import get_password_hash
from app.models.auth import Role, User, UserRole
from app.schemas.user import UserCreate, UserResponse
from app.services.audit_service import record_audit_log

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/", response_model=List[UserResponse])
async def list_users(
    current_user: User = Depends(RoleChecker(["admin", "manager"])),
    db: AsyncSession = Depends(get_db)
):
    """List all users within the organization (Admin / Manager only)."""
    stmt = (
        select(User)
        .where(User.organization_id == current_user.organization_id)
        .options(selectinload(User.roles).selectinload(Role.permissions))
        .order_by(User.created_at.desc())
    )
    res = await db.execute(stmt)
    return res.scalars().all()


@router.post("/", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(
    user_in: UserCreate,
    current_user: User = Depends(RoleChecker(["admin", "manager"])),
    db: AsyncSession = Depends(get_db)
):
    """Create a new employee user account and assign specified role."""
    # Check if email exists
    stmt = select(User).where(User.email == user_in.email.lower())
    res = await db.execute(stmt)
    if res.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A user with this email address already exists"
        )

    # Resolve role
    role_stmt = select(Role).where(
        Role.organization_id == current_user.organization_id,
        Role.code == user_in.role_code.lower()
    )
    role_res = await db.execute(role_stmt)
    role = role_res.scalar_one_or_none()

    new_user = User(
        organization_id=current_user.organization_id,
        email=user_in.email.lower(),
        hashed_password=get_password_hash(user_in.password),
        full_name=user_in.full_name,
        phone=user_in.phone,
        is_active=True,
        is_verified=True
    )
    db.add(new_user)
    await db.flush()

    if role:
        db.add(UserRole(user_id=new_user.id, role_id=role.id))
        await db.flush()

    # Re-fetch with loaded roles
    fetch_stmt = (
        select(User)
        .where(User.id == new_user.id)
        .options(selectinload(User.roles).selectinload(Role.permissions))
    )
    fetch_res = await db.execute(fetch_stmt)
    created = fetch_res.scalar_one()

    await record_audit_log(
        db=db,
        organization_id=current_user.organization_id,
        actor_email=current_user.email,
        action="CREATE_USER",
        entity_name="User",
        entity_id=str(created.id),
        actor_user_id=current_user.id,
        changes_json={"email": created.email, "role": user_in.role_code}
    )

    return created

