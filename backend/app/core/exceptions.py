from typing import Any, Dict, Optional
from fastapi import HTTPException, status


class FincoreException(HTTPException):
    def __init__(
        self,
        status_code: int,
        detail: str,
        code: str = "ERROR",
        headers: Optional[Dict[str, Any]] = None
    ):
        super().__init__(status_code=status_code, detail={"message": detail, "code": code}, headers=headers)


class AuthenticationError(FincoreException):
    def __init__(self, detail: str = "Invalid credentials"):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=detail,
            code="AUTHENTICATION_FAILED",
            headers={"WWW-Authenticate": "Bearer"}
        )


class PermissionDeniedError(FincoreException):
    def __init__(self, detail: str = "Insufficient permissions to perform this operation"):
        super().__init__(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=detail,
            code="PERMISSION_DENIED"
        )


class NotFoundError(FincoreException):
    def __init__(self, resource: str = "Resource"):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"{resource} not found",
            code="NOT_FOUND"
        )


class ConflictError(FincoreException):
    def __init__(self, detail: str):
        super().__init__(
            status_code=status.HTTP_409_CONFLICT,
            detail=detail,
            code="RESOURCE_CONFLICT"
        )


AppException = FincoreException


