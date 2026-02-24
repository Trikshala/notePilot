from pydantic import BaseModel, EmailStr

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