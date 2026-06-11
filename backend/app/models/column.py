from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship

from app.core.database import Base

class BoardColumn(Base):

    __tablename__ = "columns"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String(255), nullable=False)

    board_id = Column(
        Integer,
        ForeignKey("boards.id")
    )

    board = relationship("Board")