from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship

from app.core.database import Base

class Workspace(Base):

    __tablename__ = "workspaces"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String(255), nullable=False)

    owner_id = Column(
        Integer,
        ForeignKey("users.id")
    )

    owner = relationship("User")