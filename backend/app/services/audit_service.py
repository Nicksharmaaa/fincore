import uuid
from typing import Any, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.audit import AuditLog


async def record_audit_log(
    db: AsyncSession,
    organization_id: Optional[Any] = None,
    actor_email: Optional[str] = None,
    action: str = "UNKNOWN_ACTION",
    entity_name: str = "Unknown",
    entity_id: Optional[str] = None,
    actor_user_id: Optional[uuid.UUID] = None,
    ip_address: Optional[str] = None,
    changes_json: Optional[dict] = None,
    changes: Optional[dict] = None,
    **kwargs: Any
) -> AuditLog:
    """Create an immutable statutory audit log entry."""
    # Handle user object passed as second argument
    if organization_id is not None and hasattr(organization_id, "organization_id"):
        user = organization_id
        org_id = user.organization_id
        user_email = actor_email or getattr(user, "email", "system@fincore.in")
        user_id = actor_user_id or getattr(user, "id", None)
    else:
        org_id = organization_id
        user_email = actor_email or "system@fincore.in"
        user_id = actor_user_id

    final_changes = changes if changes is not None else changes_json

    audit_entry = AuditLog(
        organization_id=org_id,
        actor_user_id=user_id,
        actor_email=user_email,
        action=action,
        entity_name=entity_name,
        entity_id=entity_id,
        ip_address=ip_address,
        changes_json=final_changes
    )
    db.add(audit_entry)
    await db.flush()
    return audit_entry

