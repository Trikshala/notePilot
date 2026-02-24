from app.models.user import User
from app.core.security import verify_password, hash_password
from app.schemas.user_schema import UserCreate


def get_user_by_email(db, email):
    return db.query(User).filter(User.email == email).first()

def authenticate_user(db, email, password):
    user = get_user_by_email(db, email)
    if not user:
        return False
    if verify_password(password, user.password_hash):
        return user
    return False

def register_user(db, user : UserCreate):
    hashed_password = hash_password(user.password)
    db_user = User(name = user.name, phone = user.phone, email = user.email, password_hash = hashed_password, user_type = user.user_type)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user
