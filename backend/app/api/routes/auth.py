from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.schemas.user_schema import UserCreate
from app.models.user import User
from app.core.database import SessionLocal
from app.core.security import hash_password
from app.schemas.user_schema import UserLogin
from app.core.security import verify_password
from app.core.security import create_access_token
from app.core.deps import get_current_user

router = APIRouter()

# DB Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/register")
def register(
    user: UserCreate,
    db: Session = Depends(get_db)
):

    hashed_pw = hash_password(user.password)

    new_user = User(
        name=user.name,
        email=user.email,
        password=hashed_pw
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "message": "User registered successfully"
    }
from fastapi.security import OAuth2PasswordRequestForm
from fastapi import Depends

@router.post("/login")
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(
        User.email == form_data.username
    ).first()

    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if not verify_password(form_data.password, user.password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    access_token = create_access_token(
        data={"user_id": user.id}
    )

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }

@router.get("/profile")
def profile(
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.id == current_user["user_id"]).first()
    return {
        "message": "Protected route working",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email
        }
    }
@router.get("/users")
def get_users(

    current_user = Depends(get_current_user),

    db: Session = Depends(get_db)

):

    users = db.query(User).all()

    return {
        "users": users
    }