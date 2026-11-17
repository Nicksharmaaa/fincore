import uuid
from typing import AsyncGenerator, Callable, List, Optional
from fastapi import Depends, Header, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.config import settings
from app.core.exceptions import AuthenticationError, PermissionDeniedError
from app.core.security import decode_token
from app.db.session import get_db
from app.models.auth import User, Role, Permission
from app.schemas.auth import TokenPayload

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_STR}/auth/login"
)
oauth2_scheme_optional = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_STR}/auth/login",
    auto_error=False
)


async def get_current_user_optional(
    token: Optional[str] = Depends(oauth2_scheme_optional),
    db: AsyncSession = Depends(get_db)
) -> Optional[User]:
    """Optionally validate access token if present, otherwise return None without error."""
    if not token:
        return None
    try:
        payload = decode_token(token)
        if payload.get("type") != "access":
            return None
        user_id_str = payload.get("sub")
        if not user_id_str:
            return None
        user_id = uuid.UUID(user_id_str)
    except Exception:
        return None

    stmt = (
        select(User)
        .where(User.id == user_id)
        .options(
            selectinload(User.roles).selectinload(Role.permissions)
        )
    )
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()
    return user if user and user.is_active else None


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db)
) -> User:
    """Validate access token and return the authenticated User model."""
    try:
        payload = decode_token(token)
        if payload.get("type") != "access":
            raise AuthenticationError("Invalid token type")
        user_id_str = payload.get("sub")
        if not user_id_str:
            raise AuthenticationError("Could not validate credentials")
        user_id = uuid.UUID(user_id_str)
    except Exception:
        raise AuthenticationError("Could not validate authentication credentials")

    # Fetch user from DB with roles and permissions eager-loaded
    stmt = (
        select(User)
        .where(User.id == user_id)
        .options(
            selectinload(User.roles).selectinload(Role.permissions)
        )
    )
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()

    if not user:
        raise AuthenticationError("User associated with token does not exist")
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is deactivated"
        )
    return user


async def get_current_active_employee(
    current_user: User = Depends(get_current_user)
) -> User:
    """Enforce that customers can NEVER access internal employee routes."""
    user_roles = [r.code.lower() for r in current_user.roles]
    if "customer" in user_roles and len(user_roles) == 1:
        raise PermissionDeniedError(
            "Access Restricted: Customer accounts are strictly prohibited from internal broker CRM routes."
        )
    return current_user


class RoleChecker:
    """Callable dependency validating that user possesses one of the allowed role codes."""
    def __init__(self, allowed_roles: List[str]):
        self.allowed_roles = [r.lower() for r in allowed_roles]

    async def __call__(self, user: User = Depends(get_current_user)) -> User:
        user_roles = [r.code.lower() for r in user.roles]
        
        # Admin has superuser override on all operational routes
        if "admin" in user_roles:
            return user

        if not any(role in self.allowed_roles for role in user_roles):
            raise PermissionDeniedError(
                f"Operation requires one of the following roles: {', '.join(self.allowed_roles)}"
            )
        return user


class PermissionChecker:
    """Callable dependency validating that user possesses specific granular permission."""
    def __init__(self, required_permission: str):
        self.required_permission = required_permission

    async def __call__(self, user: User = Depends(get_current_user)) -> User:
        user_roles = [r.code.lower() for r in user.roles]
        if "admin" in user_roles:
            return user

        user_permissions = set()
        for role in user.roles:
            for perm in role.permissions:
                user_permissions.add(perm.code)

        if self.required_permission not in user_permissions:
            raise PermissionDeniedError(
                f"Missing required permission: '{self.required_permission}'"
            )
        return user
