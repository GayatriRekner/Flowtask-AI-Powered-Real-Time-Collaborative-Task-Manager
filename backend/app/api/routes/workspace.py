from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.schemas.workspace_schema import WorkspaceCreate
from app.models.workspace import Workspace

from app.core.database import SessionLocal
from app.core.deps import get_current_user
from app.models.board import Board
from app.models.column import BoardColumn
from app.models.task import Task
from app.models.workspace_member import WorkspaceMember
from app.models.user import User
from app.schemas.workspace_member_schema import InviteMember

router = APIRouter()

# DB Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/workspace")
def create_workspace(
    workspace: WorkspaceCreate,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    new_workspace = Workspace(
        name=workspace.name,
        owner_id=current_user["user_id"]
    )

    db.add(new_workspace)

    db.commit()

    db.refresh(new_workspace)

    owner_member = WorkspaceMember(
        workspace_id=new_workspace.id,
        user_id=current_user["user_id"],
        role="OWNER"
    )

    db.add(owner_member)

    db.commit()

    return {
        "message": "Workspace created",
        "workspace": {
            "id": new_workspace.id,
            "name": new_workspace.name
        }
    }
@router.get("/workspaces")
def get_workspaces(
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # get all workspace_ids this user is a member of (includes owned + invited)
    memberships = db.query(WorkspaceMember).filter(
        WorkspaceMember.user_id == current_user["user_id"]
    ).all()

    workspace_ids = [m.workspace_id for m in memberships]

    workspaces = db.query(Workspace).filter(
        Workspace.id.in_(workspace_ids)
    ).all()

    return {
        "workspaces": [
            {
                "id": w.id,
                "name": w.name,
                "owner_id": w.owner_id
            }
            for w in workspaces
        ]
    }
@router.delete("/workspace/{workspace_id}")
def delete_workspace(
    workspace_id: int,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    workspace = db.query(Workspace).filter(
        Workspace.id == workspace_id
    ).first()
 
    if not workspace:
        return {"error": "Workspace not found"}
 
    # ── Step 1: Delete tasks + columns inside every board ──
    boards = db.query(Board).filter(
        Board.workspace_id == workspace_id
    ).all()
 
    for board in boards:
        tasks = db.query(Task).filter(Task.board_id == board.id).all()
        for task in tasks:
            db.delete(task)
 
        columns = db.query(BoardColumn).filter(
            BoardColumn.board_id == board.id
        ).all()
        for column in columns:
            db.delete(column)
 
        db.delete(board)
 
    # ── Step 2: Flush tasks/columns/boards FIRST ──────────
    # This sends the DELETEs to MySQL before we touch the workspace,
    # so no child rows are left pointing at it.
    db.flush()
 
    # ── Step 3: Delete workspace members ──────────────────
    members = db.query(WorkspaceMember).filter(
        WorkspaceMember.workspace_id == workspace_id
    ).all()
    for member in members:
        db.delete(member)
 
    db.flush()  # flush members before deleting workspace
 
    # ── Step 4: Delete the workspace itself ───────────────
    db.delete(workspace)
 
    db.commit()
 
    return {"message": "Workspace deleted successfully"}
@router.delete("/column/{column_id}")
def delete_column(
    column_id: int,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    column = db.query(BoardColumn).filter(
        BoardColumn.id == column_id
    ).first()

    if not column:

        return {
            "error": "Column not found"
        }

    tasks = db.query(Task).filter(
        Task.column_id == column_id
    ).all()

    for task in tasks:
        db.delete(task)

    db.delete(column)

    db.commit()

    return {
        "message": "Column deleted successfully"
    }

@router.post("/workspace/{workspace_id}/invite")
def invite_member(
    workspace_id: int,
    invite: InviteMember,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    workspace = db.query(Workspace).filter(
        Workspace.id == workspace_id
    ).first()

    if not workspace:
        return {
            "error": "Workspace not found"
        }

    if workspace.owner_id != current_user["user_id"]:
        return {
            "error": "Only owner can invite members"
        }

    user = db.query(User).filter(
        User.email == invite.email
    ).first()

    if not user:
        return {
            "error": "User not found"
        }

    existing_member = db.query(WorkspaceMember).filter(
        WorkspaceMember.workspace_id == workspace_id,
        WorkspaceMember.user_id == user.id
    ).first()

    if existing_member:
        return {
            "error": "User already a member"
        }

    member = WorkspaceMember(
        workspace_id=workspace_id,
        user_id=user.id,
        role="MEMBER"
    )

    db.add(member)
    db.commit()

    return {
        "message": "Member invited successfully"
    }
@router.get("/workspace/{workspace_id}/members")
def get_workspace_members(
    workspace_id: int,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    members = db.query(
        WorkspaceMember
    ).filter(
        WorkspaceMember.workspace_id == workspace_id
    ).all()

    result = []

    for member in members:

        user = db.query(User).filter(
            User.id == member.user_id
        ).first()

        if user:

            result.append({
                "id": user.id,
                "name": user.name,
                "email": user.email,
                "role": member.role
            })

    return {
        "members": result
    }
@router.get("/workspace/{workspace_id}/tasks")
def get_workspace_tasks(
    workspace_id: int,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    boards = db.query(Board).filter(
        Board.workspace_id == workspace_id
    ).all()

    board_ids = [board.id for board in boards]

    tasks = db.query(Task).filter(
        Task.board_id.in_(board_ids)
    ).all()

    return {
        "tasks": tasks
    }