from passlib.context import CryptContext
from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from app.db.base import Base


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(length=100), nullable=False)
    email = Column(String(length=100), unique=True, nullable=False, index=True)
    password_hash = Column(String(length=255), nullable=False)
    user_type = Column(String(length=50), default="student")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    @staticmethod
    def hash_password(password: str) -> str:
        return pwd_context.hash(password[:72])

    def verify_password(self, password: str) -> bool:
        return pwd_context.verify(password[:72], self.password_hash)
