from pydantic import BaseModel

class ColumnCreate(BaseModel):

    name: str

    board_id: int