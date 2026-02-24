from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from app.db.base import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(length=100), nullable=False)
    phone = Column(String(10), nullable = False) 
    email = Column(String(length=100), unique=True, nullable=False, index=True)
    password_hash = Column(String(length=255), nullable=False)
    user_type = Column(String(length=50), default="student")
    created_at = Column(DateTime(timezone=True), server_default=func.now())


