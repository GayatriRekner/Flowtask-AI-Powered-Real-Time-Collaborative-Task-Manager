from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.schemas.member_schema import AddMember
from app.models.workspace_member import WorkspaceMember

from app.core.database import SessionLocal
from app.core.deps import get_current_user

router = APIRouter()

# DB Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/workspace/member")
def add_member(
    member: AddMember,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    new_member = WorkspaceMember(
        workspace_id=member.workspace_id,
        user_id=member.user_id,
        role=member.role
    )

    db.add(new_member)

    db.commit()

    db.refresh(new_member)

    return {
        "message": "Member added successfully"
    }