from sqlalchemy import Column, Integer, String, ForeignKey

from app.core.database import Base

class WorkspaceMember(Base):

    __tablename__ = "workspace_members"

    id = Column(Integer, primary_key=True, index=True)

    workspace_id = Column(
        Integer,
        ForeignKey("workspaces.id")
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id")
    )

    role = Column(String(100), default="MEMBER")