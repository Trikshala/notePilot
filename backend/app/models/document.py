from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.session import Base

class Document(Base):
    
    __tablename__ = "documents"
    
    id = Column(Integer, primary_key= True)
    chapter_id = Column(Integer, ForeignKey("chapters.id"), nullable = False, index=True)
    file_name = Column(String(255), nullable=False )
    source_type = Column(String(20), nullable=False)
    file_path = Column(String(255), nullable=True)
    raw_text = Column(Text, nullable = False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    chapter = relationship("Chapter", back_populates="documents")
    
    