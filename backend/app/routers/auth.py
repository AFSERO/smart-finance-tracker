from datetime import datetime
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from .. import schemas
from ..core.security import create_access_token, get_password_hash, verify_password
from ..database import get_db
from ..dependencies import get_current_user
from ..models import Category, CategoryType, Goal, GoalStatus, GoalType, User

router = APIRouter(prefix="/auth", tags=["auth"])

DEFAULT_CATEGORIES: List[dict] = [
    {"name": "Housing", "type": CategoryType.EXPENSE, "icon": "🏠", "color": "#3B82F6"},
    {"name": "Transportation", "type": CategoryType.EXPENSE, "icon": "🚗", "color": "#10B981"},
    {"name": "Food & Dining", "type": CategoryType.EXPENSE, "icon": "🍽️", "color": "#F59E0B"},
    {"name": "Entertainment", "type": CategoryType.EXPENSE, "icon": "🎬", "color": "#8B5CF6"},
    {"name": "Utilities", "type": CategoryType.EXPENSE, "icon": "⚡", "color": "#EF4444"},
    {"name": "Healthcare", "type": CategoryType.EXPENSE, "icon": "🏥", "color": "#06B6D4"},
    {"name": "Personal", "type": CategoryType.EXPENSE, "icon": "👤", "color": "#84CC16"},
    {"name": "Salary", "type": CategoryType.INCOME, "icon": "💰", "color": "#22C55E"},
    {"name": "Freelance", "type": CategoryType.INCOME, "icon": "💼", "color": "#22C55E"},
    {"name": "Investment", "type": CategoryType.INCOME, "icon": "📈", "color": "#22C55E"},
]


def _bootstrap_user_defaults(db: Session, user: User) -> None:
    categories = [
        Category(
            user_id=user.id,
            name=entry["name"],
            type=entry["type"],
            icon=entry.get("icon"),
            color=entry.get("color"),
        )
        for entry in DEFAULT_CATEGORIES
    ]
    db.add_all(categories)
    db.add(
        Goal(
            user_id=user.id,
            name="Monthly Income Goal",
            type=GoalType.MONTHLY_INCOME,
            target_amount=5000,
            current_amount=0,
            status=GoalStatus.ACTIVE,
        )
    )


@router.post("/register", response_model=schemas.UserRead, status_code=status.HTTP_201_CREATED)
def register_user(payload: schemas.UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User already exists")

    user = User(
        email=payload.email,
        name=payload.name,
        password_hash=get_password_hash(payload.password),
        created_at=datetime.utcnow(),
    )
    db.add(user)
    db.flush()  # ensures user.id is available for defaults

    _bootstrap_user_defaults(db, user)
    db.commit()
    db.refresh(user)
    return user


@router.post("/login", response_model=schemas.Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not user.password_hash:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Incorrect email or password")

    if not verify_password(form_data.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Incorrect email or password")

    token = create_access_token(subject=user.id, extra_claims={"email": user.email})
    return schemas.Token(access_token=token)


@router.get("/me", response_model=schemas.UserRead)
def read_current_user(current_user: User = Depends(get_current_user)):
    return current_user
