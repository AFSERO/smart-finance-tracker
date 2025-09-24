from datetime import datetime
from typing import List

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from .. import schemas
from ..database import get_db
from ..dependencies import get_current_user
from ..models import Transaction, TransactionSource, TransactionType, User

router = APIRouter(prefix="/upload", tags=["upload"])


@router.post("/pdf", response_model=schemas.UploadResponse)
def upload_pdf(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Only PDF files are supported")

    # Simulated PDF parsing results
    mock_transactions: List[Transaction] = [
        Transaction(
            user_id=current_user.id,
            amount=-45.67,
            description="STARBUCKS COFFEE #1234",
            date=datetime.utcnow(),
            type=TransactionType.EXPENSE,
            subcategory="Food & Drinks",
            merchant="Starbucks",
            source=TransactionSource.PDF_UPLOAD,
        ),
        Transaction(
            user_id=current_user.id,
            amount=-1200.00,
            description="RENT PAYMENT - APARTMENT",
            date=datetime.utcnow(),
            type=TransactionType.EXPENSE,
            subcategory="Housing",
            merchant="Landlord",
            source=TransactionSource.PDF_UPLOAD,
        ),
        Transaction(
            user_id=current_user.id,
            amount=3500.00,
            description="SALARY DEPOSIT",
            date=datetime.utcnow(),
            type=TransactionType.INCOME,
            subcategory="Salary",
            merchant="Employer",
            source=TransactionSource.PDF_UPLOAD,
        ),
        Transaction(
            user_id=current_user.id,
            amount=-89.99,
            description="AMAZON.COM PURCHASE",
            date=datetime.utcnow(),
            type=TransactionType.EXPENSE,
            subcategory="Shopping",
            merchant="Amazon",
            source=TransactionSource.PDF_UPLOAD,
        ),
    ]

    db.add_all(mock_transactions)
    db.commit()

    for txn in mock_transactions:
        db.refresh(txn)

    serialized = [
        schemas.TransactionRead.model_validate(txn, from_attributes=True)
        for txn in mock_transactions
    ]

    return schemas.UploadResponse(
        message="PDF processed successfully",
        transactions_count=len(serialized),
        transactions=serialized,
    )
