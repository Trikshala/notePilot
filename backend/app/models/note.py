from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.session import Base

class Note(Base):
    __tablename__ = "notes"
    
    id = Column(Integer, primary_key= True)
    chapter_id = Column(Integer, ForeignKey("chapters.id"), nullable = False, index=True)
    content = Column(Text, nullable = False)
    style =  Column(String(20), nullable=False)
    length =  Column(String(20), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    chapter = relationship("Chapter", back_populates="notes")