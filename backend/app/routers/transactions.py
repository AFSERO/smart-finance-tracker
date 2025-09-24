from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session, aliased, joinedload

from .. import schemas
from ..dependencies import get_current_user
from ..database import get_db
from ..models import Category, Transaction, TransactionSource, TransactionType, User

router = APIRouter(prefix="/transactions", tags=["transactions"])


def _apply_filters(
    query,
    user_id: str,
    txn_type: Optional[TransactionType],
    category_id: Optional[str],
    start_date: Optional[datetime],
    end_date: Optional[datetime],
):
    query = query.filter(Transaction.user_id == user_id)
    if txn_type:
        query = query.filter(Transaction.type == txn_type)
    if category_id:
        query = query.filter(Transaction.category_id == category_id)
    if start_date:
        query = query.filter(Transaction.date >= start_date)
    if end_date:
        query = query.filter(Transaction.date <= end_date)
    return query


@router.get("", response_model=schemas.PaginatedTransactions)
def list_transactions(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    type: Optional[TransactionType] = Query(None, alias="type"),
    category_id: Optional[str] = Query(None),
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    base_query = db.query(Transaction).options(joinedload(Transaction.category)).order_by(Transaction.date.desc())
    filtered_query = _apply_filters(base_query, current_user.id, type, category_id, start_date, end_date)

    total = filtered_query.count()
    transactions: List[Transaction] = (
        filtered_query.offset((page - 1) * limit).limit(limit).all()
    )

    items = [schemas.TransactionRead.model_validate(txn, from_attributes=True) for txn in transactions]
    pagination = {
        "page": page,
        "limit": limit,
        "total": total,
        "pages": (total + limit - 1) // limit,
    }
    return schemas.PaginatedTransactions(transactions=items, pagination=pagination)


@router.post("", response_model=schemas.TransactionRead, status_code=status.HTTP_201_CREATED)
def create_transaction(
    payload: schemas.TransactionCategorizeRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    transaction = Transaction(
        user_id=current_user.id,
        amount=payload.amount,
        description=payload.description,
        date=payload.date or datetime.utcnow(),
        type=payload.type,
        category_id=payload.category_id,
        subcategory=payload.subcategory,
        merchant=payload.merchant,
        source=payload.source or TransactionSource.MANUAL,
    )
    db.add(transaction)
    db.commit()
    db.refresh(transaction)
    return schemas.TransactionRead.model_validate(transaction, from_attributes=True)


@router.get("/{transaction_id}", response_model=schemas.TransactionRead)
def get_transaction(
    transaction_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    transaction = (
        db.query(Transaction)
        .options(joinedload(Transaction.category))
        .filter(Transaction.id == transaction_id, Transaction.user_id == current_user.id)
        .first()
    )
    if not transaction:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Transaction not found")
    return schemas.TransactionRead.model_validate(transaction, from_attributes=True)


@router.put("/{transaction_id}", response_model=schemas.TransactionRead)
def update_transaction(
    transaction_id: str,
    payload: schemas.TransactionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    transaction = db.query(Transaction).filter(Transaction.id == transaction_id, Transaction.user_id == current_user.id).first()
    if not transaction:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Transaction not found")

    if payload.amount is not None:
        transaction.amount = payload.amount
    if payload.description is not None:
        transaction.description = payload.description
    if payload.date is not None:
        transaction.date = payload.date
    if payload.type is not None:
        transaction.type = payload.type
    if payload.category_id is not None:
        transaction.category_id = payload.category_id
    if payload.subcategory is not None:
        transaction.subcategory = payload.subcategory
    if payload.merchant is not None:
        transaction.merchant = payload.merchant

    transaction.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(transaction)
    return schemas.TransactionRead.model_validate(transaction, from_attributes=True)


@router.delete("/{transaction_id}", response_model=schemas.Message)
def delete_transaction(
    transaction_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    transaction = db.query(Transaction).filter(Transaction.id == transaction_id, Transaction.user_id == current_user.id).first()
    if not transaction:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Transaction not found")

    db.delete(transaction)
    db.commit()
    return schemas.Message(message="Transaction deleted successfully")


@router.post("/categorize", response_model=schemas.CategorizeResponse)
def categorize_transaction(
    payload: schemas.TransactionCategorizeRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    description = payload.description.lower()
    amount = payload.amount

    def pick(expense_category: str, subcategory: str, merchant: str) -> schemas.CategorizeResponse:
        category = (
            db.query(Category)
            .filter(Category.user_id == current_user.id, Category.name.ilike(expense_category))
            .first()
        )
        return schemas.CategorizeResponse(
            category=expense_category,
            subcategory=subcategory,
            merchant=merchant,
            category_id=category.id if category else None,
            confidence=0.85,
        )

    keywords = description
    if any(term in keywords for term in ["starbucks", "coffee", "restaurant", "food"]):
        return pick("Food & Dining", "Restaurants", "Restaurant")
    if any(term in keywords for term in ["grocery", "supermarket", "walmart", "target"]):
        return pick("Food & Dining", "Groceries", "Grocery Store")
    if any(term in keywords for term in ["gas", "fuel", "uber", "lyft", "taxi"]):
        return pick("Transportation", "Gas & Fuel", "Transportation")
    if any(term in keywords for term in ["rent", "mortgage", "apartment", "housing"]):
        return pick("Housing", "Rent/Mortgage", "Housing")
    if any(term in keywords for term in ["electric", "water", "internet", "phone", "utility"]):
        return pick("Utilities", "Bills", "Utility Company")
    if any(term in keywords for term in ["doctor", "hospital", "pharmacy", "medical"]):
        return pick("Healthcare", "Medical", "Healthcare")
    if any(term in keywords for term in ["netflix", "spotify", "movie", "entertainment"]):
        return pick("Entertainment", "Streaming", "Entertainment")
    if any(term in keywords for term in ["amazon", "shopping", "store", "retail"]):
        return pick("Personal", "Shopping", "Retail Store")

    if amount > 0:
        if any(term in keywords for term in ["salary", "payroll", "wage"]):
            return pick("Salary", "Employment", "Employer")
        if any(term in keywords for term in ["freelance", "contract", "gig"]):
            return pick("Freelance", "Work", "Client")
        if any(term in keywords for term in ["investment", "dividend", "interest"]):
            return pick("Investment", "Returns", "Investment")
        return pick("Income", "Other", "Unknown")

    return pick("Personal", "Other", "Unknown")
