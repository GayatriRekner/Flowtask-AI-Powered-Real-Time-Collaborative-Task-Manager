from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.schemas.board_schema import BoardCreate
from app.models.board import Board

from app.core.database import SessionLocal
from app.core.deps import get_current_user
from app.models.task import Task
from app.models.column import BoardColumn
from fastapi import APIRouter


router = APIRouter()

# DB Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/board")
def create_board(
    board: BoardCreate,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    new_board = Board(
        name=board.name,
        workspace_id=board.workspace_id
    )

    db.add(new_board)

    db.commit()

    db.refresh(new_board)

    return {
        "message": "Board created",
        "board": {
            "id": new_board.id,
            "name": new_board.name
        }
    }
@router.get("/boards/{workspace_id}")
def get_boards(
    workspace_id: int,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    boards = db.query(Board).filter(
        Board.workspace_id == workspace_id
    ).all()

    return {
        "boards": boards
    }

@router.delete("/boards/{board_id}")
def delete_board(
    board_id: int,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    board = db.query(Board).filter(
        Board.id == board_id
    ).first()

    if not board:
        return {
            "error": "Board not found"
        }

    # Delete tasks first
    tasks = db.query(Task).filter(
        Task.board_id == board_id
    ).all()

    for task in tasks:
        db.delete(task)

    # Delete columns
    columns = db.query(BoardColumn).filter(
        BoardColumn.board_id == board_id
    ).all()

    for column in columns:
        db.delete(column)

    # Delete board
    db.delete(board)

    db.commit()

    return {
        "message": "Board deleted successfully"
    }