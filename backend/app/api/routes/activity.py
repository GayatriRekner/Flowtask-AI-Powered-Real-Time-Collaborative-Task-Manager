from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.models.activity_log import ActivityLog
from app.models.user import User
from app.models.task import Task
from app.core.database import SessionLocal
from app.core.deps import get_current_user

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/activities/{workspace_id}")
def get_activities(
    workspace_id: int,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    from app.models.board import Board
    from app.models.task import Task

    # get all task_ids in this workspace
    board_ids = [b.id for b in db.query(Board).filter(Board.workspace_id == workspace_id).all()]
    task_ids  = [t.id for t in db.query(Task).filter(Task.board_id.in_(board_ids)).all()]

    logs = (
        db.query(ActivityLog)
        .filter(ActivityLog.task_id.in_(task_ids))
        .order_by(ActivityLog.created_at.desc())
        .limit(50)
        .all()
    )

    result = []
    for log in logs:
        user = db.query(User).filter(User.id == log.user_id).first()
        task = db.query(Task).filter(Task.id == log.task_id).first()
        result.append({
            "id":         log.id,
            "action":     log.action,
            "details":    log.details,
            "user_name":  user.name if user else "Unknown",
            "task_title": task.title if task else "Deleted task",
            "created_at": log.created_at.isoformat() if log.created_at else None,
        })

    return {"activities": result}