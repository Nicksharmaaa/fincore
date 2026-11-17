from datetime import datetime, timedelta, timezone
import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.deps import get_current_user, get_current_user_optional, get_db
from app.core.config import settings
from app.core.exceptions import AuthenticationError
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    get_password_hash,
    verify_password,
)
from app.models.auth import RefreshToken, Role, User
from app.schemas.auth import LoginRequest, RefreshRequest, Token
from app.schemas.user import UserResponse
from app.services.audit_service import record_audit_log

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/login", response_model=Token)
async def login(
    credentials: LoginRequest,
    db: AsyncSession = Depends(get_db)
):
    """Authenticate with email and password, returning signed access and refresh tokens."""
    stmt = (
        select(User)
        .where(User.email == credentials.email.lower())
        .options(selectinload(User.roles).selectinload(Role.permissions))
    )
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()

    if not user or not verify_password(credentials.password, user.hashed_password):
        raise AuthenticationError("Incorrect email or password")

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account has been suspended or deactivated"
        )

    # Determine primary role
    primary_role = user.roles[0].code.lower() if user.roles else "customer"
    permissions = []
    for r in user.roles:
        for p in r.permissions:
            permissions.append(p.code)

    access_token = create_access_token(
        subject=user.id,
        role=primary_role,
        organization_id=str(user.organization_id),
        permissions=permissions
    )
    refresh_token_str = create_refresh_token(subject=user.id)

    # Store refresh token record
    rf_entry = RefreshToken(
        user_id=user.id,
        token=refresh_token_str,
        expires_at=datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    )
    db.add(rf_entry)

    # Update last login
    user.last_login_at = datetime.now(timezone.utc)

    # Log audit
    await record_audit_log(
        db=db,
        organization_id=user.organization_id,
        actor_email=user.email,
        action="USER_LOGIN",
        entity_name="User",
        entity_id=str(user.id),
        actor_user_id=user.id,
    )

    user_data = {
        "id": str(user.id),
        "email": user.email,
        "full_name": user.full_name,
        "roles": [r.code.lower() for r in user.roles],
        "organization_id": str(user.organization_id),
    }

    return Token(
        access_token=access_token,
        refresh_token=refresh_token_str,
        token_type="bearer",
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user_id=user.id,
        role=primary_role,
        email=user.email,
        full_name=user.full_name,
        organization_id=user.organization_id,
        user=user_data
    )


@router.post("/refresh", response_model=Token)
async def refresh_token(
    payload: RefreshRequest,
    db: AsyncSession = Depends(get_db)
):
    """Rotate and refresh an expired access token using a valid refresh token."""
    try:
        decoded = decode_token(payload.refresh_token)
        if decoded.get("type") != "refresh":
            raise AuthenticationError("Invalid token type")
        user_id = uuid.UUID(decoded["sub"])
    except Exception:
        raise AuthenticationError("Invalid or expired refresh token")

    # Check refresh token validity in DB
    stmt = (
        select(RefreshToken)
        .where(
            RefreshToken.token == payload.refresh_token,
            RefreshToken.revoked == False
        )
    )
    res = await db.execute(stmt)
    db_token = res.scalar_one_or_none()

    if not db_token:
        raise AuthenticationError("Refresh token has been revoked or is invalid")

    # Fetch user
    user_stmt = (
        select(User)
        .where(User.id == user_id)
        .options(selectinload(User.roles).selectinload(Role.permissions))
    )
    user_res = await db.execute(user_stmt)
    user = user_res.scalar_one_or_none()

    if not user or not user.is_active:
        raise AuthenticationError("User is no longer active")

    primary_role = user.roles[0].code.lower() if user.roles else "customer"
    permissions = [p.code for r in user.roles for p in r.permissions]

    new_access_token = create_access_token(
        subject=user.id,
        role=primary_role,
        organization_id=str(user.organization_id),
        permissions=permissions
    )
    new_refresh_token_str = create_refresh_token(subject=user.id)

    # Invalidate previous token (Refresh Token Rotation)
    db_token.revoked = True
    db_token.replaced_by_token = new_refresh_token_str

    new_rf_entry = RefreshToken(
        user_id=user.id,
        token=new_refresh_token_str,
        expires_at=datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    )
    db.add(new_rf_entry)

    user_data = {
        "id": str(user.id),
        "email": user.email,
        "full_name": user.full_name,
        "roles": [r.code.lower() for r in user.roles],
        "organization_id": str(user.organization_id),
    }

    return Token(
        access_token=new_access_token,
        refresh_token=new_refresh_token_str,
        token_type="bearer",
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user_id=user.id,
        role=primary_role,
        email=user.email,
        full_name=user.full_name,
        organization_id=user.organization_id,
        user=user_data
    )


class LogoutRequest(BaseModel):
    refresh_token: Optional[str] = None


@router.post("/logout")
async def logout(
    payload: Optional[LogoutRequest] = None,
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: AsyncSession = Depends(get_db)
):
    """Revoke all active refresh tokens for the current user or revoke specified refresh token."""
    if payload and payload.refresh_token:
        stmt = (
            select(RefreshToken)
            .where(RefreshToken.token == payload.refresh_token)
        )
        res = await db.execute(stmt)
        token = res.scalar_one_or_none()
        if token:
            token.revoked = True

    if current_user:
        stmt = (
            select(RefreshToken)
            .where(RefreshToken.user_id == current_user.id, RefreshToken.revoked == False)
        )
        res = await db.execute(stmt)
        tokens = res.scalars().all()
        for t in tokens:
            t.revoked = True

        await record_audit_log(
            db=db,
            organization_id=current_user.organization_id,
            actor_email=current_user.email,
            action="USER_LOGOUT",
            entity_name="User",
            entity_id=str(current_user.id),
            actor_user_id=current_user.id,
        )

    return {"status": "logged_out", "message": "Successfully logged out and session revoked."}


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    """Retrieve the currently authenticated user's profile and roles."""
    return current_user

