from pydantic import BaseModel

class BoardCreate(BaseModel):
    name: str
    workspace_id: int