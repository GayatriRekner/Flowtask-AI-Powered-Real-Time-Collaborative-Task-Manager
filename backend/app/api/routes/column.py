from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.schemas.column_schema import ColumnCreate
from app.models.column import BoardColumn

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

@router.post("/column")
def create_column(
    column: ColumnCreate,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    new_column = BoardColumn(
        name=column.name,
        board_id=column.board_id
    )

    db.add(new_column)

    db.commit()

    db.refresh(new_column)

    return {
        "message": "Column created",
        "column": {
            "id": new_column.id,
            "name": new_column.name
        }
    }
@router.get("/columns/{board_id}")
def get_columns(
    board_id: int,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    columns = db.query(BoardColumn).filter(
        BoardColumn.board_id == board_id
    ).all()

    return {
        "columns": columns
    }