from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class TaskCreate(BaseModel):
    title: str
    description: str
    column_id: int
    priority: str
    board_id: int
    assigned_to: Optional[int] = None
    status: Optional[str] = "TODO"
    due_date: Optional[datetime] = None

class TaskUpdate(BaseModel):
    title: str
    description: str
    priority: str
    assigned_to: Optional[int] = None
    status: Optional[str] = "TODO"
    due_date: Optional[datetime] = None

class MoveTask(BaseModel):
    column_id: int