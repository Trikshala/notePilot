from pydantic import BaseModel, EmailStr
from datetime import datetime

class LoginRequest(BaseModel):
    email : EmailStr
    password : str
    
class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    
class UserCreate(BaseModel):
    name : str
    phone : str
    email : EmailStr
    password : str
    user_type: str
    
class UserResponse(BaseModel):
    id: int  
    name: str  
    phone: str  
    email: str  
    user_type: str  
    created_at: datetime