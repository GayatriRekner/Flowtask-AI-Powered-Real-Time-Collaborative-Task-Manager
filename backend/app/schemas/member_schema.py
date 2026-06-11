from pydantic import BaseModel

class AddMember(BaseModel):

    workspace_id: int

    user_id: int

    role: str