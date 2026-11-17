import uuid
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, EmailStr


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class RefreshRequest(BaseModel):
    refresh_token: str


class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int
    user_id: uuid.UUID
    role: str
    email: str
    full_name: str
    organization_id: uuid.UUID
    user: Optional[Dict[str, Any]] = None


class TokenPayload(BaseModel):
    sub: Optional[str] = None
    role: Optional[str] = None
    org_id: Optional[str] = None
    permissions: List[str] = []
    exp: Optional[int] = None
    type: Optional[str] = None

