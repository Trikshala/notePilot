from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from app.core.security import create_access_token, verify_token
from app.crud.user_crud import authenticate_user, get_user_by_email, register_user
from app.schemas.user_schema import LoginRequest, TokenResponse, UserCreate
from app.db.session import get_db
from sqlalchemy.orm import Session


router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

@router.post("/login", response_model=TokenResponse)
def login(user : LoginRequest, db : Session = Depends(get_db)):
    db_user = authenticate_user(db, user.email, user.password)
    if not db_user:
        raise HTTPException(
            status_code = status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Credentials"
        )
    access_token = create_access_token(data={"user": db_user.email})
    return {"access_token": access_token, "token_type": "bearer"}    

def get_current_user(token : str = Depends(oauth2_scheme), db : Session = Depends(get_db)):
    email = verify_token(token)
    user = get_user_by_email(db, email)
    if not user:
        raise HTTPException(
            status_code = status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Credentials"
        )
    return user

@router.get("/me")
def read_me(current_user = Depends(get_current_user)):
    return current_user

@router.post("/register")
def register(user : UserCreate, db : Session = Depends(get_db)):
    
    existing_user = get_user_by_email(db, user.email)
    
    if(existing_user):
           raise HTTPException(
            status_code = status.HTTP_400_BAD_REQUEST,
            detail="Email already exists"
        ) 
    
    new_user = register_user(db, user)
    
    access_token = create_access_token(data={"user": new_user.email})
    
    return {
        "access_token" : access_token,
        "token_type" : "bearer",
        "user" : {
        "id" : new_user.id,
        "name" : new_user.name,
        "phone" : new_user.phone,
        "email" : new_user.email,
        "user_type": new_user.user_type,
        "created_at": new_user.created_at
        }  
    }
    
