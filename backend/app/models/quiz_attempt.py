from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.session import Base
 
class QuizAttempt(Base):
 
    __tablename__ = "quiz_attempts"
 
    id = Column(Integer, primary_key=True)
    chapter_id = Column(Integer, ForeignKey("chapters.id"), nullable=False, index=True)
    difficulty = Column(String(20), nullable=False)
    score = Column(Integer, nullable=False)           
    total_questions = Column(Integer, nullable=False)  
    results = Column(JSON, nullable=False)            
    created_at = Column(DateTime(timezone=True), server_default=func.now())
 
    chapter = relationship("Chapter", back_populates="quiz_attempts") 