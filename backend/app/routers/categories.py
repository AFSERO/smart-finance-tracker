from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session, joinedload

from .. import schemas
from ..database import get_db
from ..dependencies import get_current_user
from ..models import Category, CategoryType, User

router = APIRouter(prefix="/categories", tags=["categories"])


def _serialize_category(category: Category) -> schemas.CategoryRead:
    children = [
        {
            "id": child.id,
            "name": child.name,
            "icon": child.icon,
            "color": child.color,
        }
        for child in category.children
    ]
    payload = {
        "id": category.id,
        "name": category.name,
        "type": category.type,
        "icon": category.icon,
        "color": category.color,
        "parent_id": category.parent_id,
        "created_at": category.created_at,
        "updated_at": category.updated_at,
        "children": children,
        "transactions_count": len(category.transactions),
    }
    return schemas.CategoryRead.model_validate(payload)


@router.get("", response_model=list[schemas.CategoryRead])
def list_categories(
    type: CategoryType | None = Query(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = (
        db.query(Category)
        .options(joinedload(Category.children), joinedload(Category.transactions))
        .filter(Category.user_id == current_user.id)
        .order_by(Category.name.asc())
    )
    if type:
        query = query.filter(Category.type == type)

    categories = query.all()
    return [_serialize_category(category) for category in categories]


@router.post("", response_model=schemas.CategoryRead, status_code=status.HTTP_201_CREATED)
def create_category(
    payload: schemas.CategoryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    parent_id = payload.parent_id
    if parent_id:
        exists = (
            db.query(Category)
            .filter(Category.id == parent_id, Category.user_id == current_user.id)
            .first()
        )
        if not exists:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid parent category")

    category = Category(
        user_id=current_user.id,
        name=payload.name,
        type=payload.type,
        icon=payload.icon,
        color=payload.color,
        parent_id=payload.parent_id,
    )
    db.add(category)
    db.commit()
    db.refresh(category)

    return _serialize_category(category)
