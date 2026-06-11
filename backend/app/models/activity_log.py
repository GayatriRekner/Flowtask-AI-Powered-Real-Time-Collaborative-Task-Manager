from sqlalchemy import Column, Integer, String, DateTime, func
from app.core.database import Base

class ActivityLog(Base):
    __tablename__ = "activity_logs"

    id      = Column(Integer, primary_key=True, index=True)
    action  = Column(String(255))
    user_id = Column(Integer)
    task_id = Column(Integer)
    details = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=func.now())