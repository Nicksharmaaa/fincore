from datetime import datetime, timezone
import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import RoleChecker, get_current_user, get_db
from app.models.auth import User
from app.models.task import Task
from app.schemas.task import TaskCreate, TaskResponse, TaskUpdate
from app.services.audit_service import record_audit_log

router = APIRouter(prefix="/tasks", tags=["Tasks"])


@router.get("/", response_model=List[TaskResponse])
async def list_tasks(
    status_filter: Optional[str] = None,
    current_user: User = Depends(RoleChecker(["sales", "manager", "admin", "operations"])),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve operational task queue for the current agent."""
    stmt = select(Task).where(Task.organization_id == current_user.organization_id)

    # Sales agents see their assigned tasks
    user_roles = [r.code.lower() for r in current_user.roles]
    if "sales" in user_roles and "manager" not in user_roles and "admin" not in user_roles:
        stmt = stmt.where(Task.assigned_to_user_id == current_user.id)

    if status_filter:
        stmt = stmt.where(Task.status == status_filter)

    stmt = stmt.order_by(Task.due_date.asc())
    res = await db.execute(stmt)
    return res.scalars().all()


@router.post("/", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
async def create_task(
    task_in: TaskCreate,
    current_user: User = Depends(RoleChecker(["sales", "manager", "admin", "operations"])),
    db: AsyncSession = Depends(get_db)
):
    """Create a new follow-up or operational task."""
    task = Task(
        organization_id=current_user.organization_id,
        lead_id=task_in.lead_id,
        assigned_to_user_id=task_in.assigned_to_user_id,
        title=task_in.title,
        description=task_in.description,
        priority=task_in.priority,
        status="Pending",
        due_date=task_in.due_date
    )
    db.add(task)
    await db.flush()

    return task


@router.patch("/{task_id}", response_model=TaskResponse)
async def update_task(
    task_id: uuid.UUID,
    task_in: TaskUpdate,
    current_user: User = Depends(RoleChecker(["sales", "manager", "admin", "operations"])),
    db: AsyncSession = Depends(get_db)
):
    """Update task completion status or details."""
    stmt = select(Task).where(
        Task.id == task_id,
        Task.organization_id == current_user.organization_id
    )
    res = await db.execute(stmt)
    task = res.scalar_one_or_none()
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")

    if task_in.status:
        task.status = task_in.status
        if task_in.status == "Completed":
            task.completed_at = datetime.now(timezone.utc)
    if task_in.title:
        task.title = task_in.title
    if task_in.description is not None:
        task.description = task_in.description
    if task_in.priority:
        task.priority = task_in.priority

    await db.flush()
    return task

