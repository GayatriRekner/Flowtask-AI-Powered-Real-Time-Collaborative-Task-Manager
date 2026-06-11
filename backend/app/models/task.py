from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.core.database import Base

class Task(Base):
    __tablename__ = "tasks"

    id          = Column(Integer, primary_key=True, index=True)
    title       = Column(String(255), nullable=False)
    description = Column(String(500))
    priority    = Column(String(100), default="MEDIUM")
    status      = Column(String(50), default="TODO")        # NEW
    due_date    = Column(DateTime, nullable=True)            # NEW
    board_id    = Column(Integer, ForeignKey("boards.id"))
    column_id   = Column(Integer, ForeignKey("columns.id"))
    assigned_to = Column(Integer, ForeignKey("users.id"), nullable=True)

    board  = relationship("Board")
    column = relationship("BoardColumn")