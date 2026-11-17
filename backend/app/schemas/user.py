import uuid
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, EmailStr


class PermissionResponse(BaseModel):
    id: uuid.UUID
    code: str
    name: str
    category: str

    class Config:
        from_attributes = True


class RoleResponse(BaseModel):
    id: uuid.UUID
    code: str
    name: str
    description: Optional[str] = None
    permissions: List[PermissionResponse] = []

    class Config:
        from_attributes = True


class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    phone: Optional[str] = None
    role_code: str = "sales"
    organization_id: Optional[uuid.UUID] = None


class UserResponse(BaseModel):
    id: uuid.UUID
    email: EmailStr
    full_name: str
    phone: Optional[str] = None
    is_active: bool
    is_verified: bool
    organization_id: uuid.UUID
    created_at: datetime
    roles: List[RoleResponse] = []

    class Config:
        from_attributes = True
