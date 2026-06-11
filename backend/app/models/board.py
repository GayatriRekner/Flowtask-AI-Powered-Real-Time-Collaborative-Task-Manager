from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship

from app.core.database import Base

class Board(Base):

    __tablename__ = "boards"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String(255), nullable=False)

    workspace_id = Column(
        Integer,
        ForeignKey("workspaces.id")
    )

    workspace = relationship("Workspace")