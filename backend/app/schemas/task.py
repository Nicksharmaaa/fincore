import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class TaskCreate(BaseModel):
    lead_id: Optional[uuid.UUID] = None
    assigned_to_user_id: uuid.UUID
    title: str
    description: Optional[str] = None
    priority: str = "Normal" # Urgent, Medium, Normal
    due_date: datetime


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    priority: Optional[str] = None
    status: Optional[str] = None # Pending, Completed, Cancelled


class TaskResponse(BaseModel):
    id: uuid.UUID
    lead_id: Optional[uuid.UUID] = None
    assigned_to_user_id: uuid.UUID
    title: str
    description: Optional[str] = None
    priority: str
    status: str
    due_date: datetime
    completed_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True
