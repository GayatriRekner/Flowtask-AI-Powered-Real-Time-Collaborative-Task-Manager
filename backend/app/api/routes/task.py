from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
 
from app.schemas.task_schema import TaskCreate
from app.models.task import Task
 
from app.core.database import SessionLocal
from app.core.deps import get_current_user
from app.schemas.task_schema import TaskUpdate
from app.schemas.task_schema import MoveTask
from app.models.activity_log import ActivityLog
from app.ws.manager import manager
from app.api.routes.notifications import notify_user
 
router = APIRouter()
 
# DB Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
 
@router.post("/task")
async def create_task(
    task: TaskCreate,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    new_task = Task(
        title=task.title,
        description=task.description,
        priority=task.priority,
        status=task.status or "TODO",
        due_date=task.due_date,
        board_id=task.board_id,
        column_id=task.column_id,
        assigned_to=task.assigned_to
    )
 
    db.add(new_task)
    db.commit()
    db.refresh(new_task)
 
    if new_task.assigned_to:
        await notify_user(
            db=db,
            user_id=new_task.assigned_to,
            message=f"You were assigned a new task: '{new_task.title}'",
            link=f"/workspace/{new_task.board_id}"
        )
 
    activity = ActivityLog(
        action="Task Created",
        user_id=current_user["user_id"],
        task_id=new_task.id,
        details=f"Created '{new_task.title}'"
    )
    db.add(activity)
    db.commit()
 
    return {
        "message": "Task created",
        "task": {
            "id": new_task.id,
            "title": new_task.title,
            "priority": new_task.priority
        }
    }
 
@router.get("/tasks/count")
def get_task_count(
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    total_tasks = db.query(Task).filter(
        Task.status != "DONE"
    ).count()
    return {"count": total_tasks}
 
@router.get("/my-tasks")
def get_my_tasks(
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    tasks = db.query(Task).filter(
        Task.assigned_to == current_user["user_id"]
    ).all()
 
    return {
        "tasks": [
            {
                "id": t.id,
                "title": t.title,
                "description": t.description,
                "priority": t.priority,
                "status": t.status,
                "due_date": t.due_date.isoformat() if t.due_date else None,
                "board_id": t.board_id,
                "column_id": t.column_id,
                "assigned_to": t.assigned_to
            }
            for t in tasks
        ]
    }
 
@router.get("/tasks/{board_id}")
def get_tasks(
    board_id: int,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    tasks = db.query(Task).filter(
        Task.board_id == board_id
    ).all()
 
    return {
        "tasks": [
            {
                "id": t.id,
                "title": t.title,
                "description": t.description,
                "priority": t.priority,
                "status": t.status,
                "due_date": t.due_date.isoformat() if t.due_date else None,
                "board_id": t.board_id,
                "column_id": t.column_id,
                "assigned_to": t.assigned_to
            }
            for t in tasks
        ]
    }
 
@router.put("/task/{task_id}")
async def update_task(
    task_id: int,
    updated_task: TaskUpdate,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    task = db.query(Task).filter(Task.id == task_id).first()
 
    if not task:
        return {"error": "Task not found"}
 
    old_assignee = task.assigned_to
 
    task.title       = updated_task.title
    task.description = updated_task.description
    task.priority    = updated_task.priority
    task.status      = updated_task.status or "TODO"
    task.due_date    = updated_task.due_date
    task.assigned_to = updated_task.assigned_to
 
    db.commit()
    db.refresh(task)
 
    if updated_task.assigned_to and updated_task.assigned_to != old_assignee:
        await notify_user(
            db=db,
            user_id=updated_task.assigned_to,
            message=f"Task '{task.title}' was assigned to you",
            link=f"/workspace/{task.board_id}"
        )
 
    # log activity
    activity = ActivityLog(
        action="Task Updated",
        user_id=current_user["user_id"],
        task_id=task_id,
        details=f"Updated '{task.title}'"
    )
    db.add(activity)
    db.commit()
 
    return {
        "message": "Task updated",
        "task": task
    }
 
@router.put("/task/{task_id}/move")
async def move_task(
    task_id: int,
    move_data: MoveTask,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    task = db.query(Task).filter(Task.id == task_id).first()
 
    if not task:
        return {"error": "Task not found"}
 
    task.column_id = move_data.column_id
 
    db.commit()
    db.refresh(task)
 
    if task.assigned_to:
        await notify_user(
            db=db,
            user_id=task.assigned_to,
            message=f"Task '{task.title}' was moved",
            link=f"/workspace/{task.board_id}"
        )
 
    await manager.broadcast(
        {"type": "task_moved", "task_id": task.id, "column_id": task.column_id}
    )
 
    # log activity
    activity = ActivityLog(
        action="Task Moved",
        user_id=current_user["user_id"],
        task_id=task_id,
        details=f"Moved '{task.title}' to a new column"
    )
    db.add(activity)
    db.commit()
 
    return {
        "message": "Task moved successfully",
        "task": task
    }
 
@router.delete("/task/{task_id}")
def delete_task(
    task_id: int,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    task = db.query(Task).filter(Task.id == task_id).first()
 
    if not task:
        return {"error": "Task not found"}
 
    db.delete(task)
    db.commit()
 
    return {"message": "Task deleted successfully"}
 