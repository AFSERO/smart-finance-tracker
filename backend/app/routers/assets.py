from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from .. import schemas
from ..database import get_db
from ..dependencies import get_current_user
from ..models import Asset, AssetType, User
from ..services.price_fetcher import price_fetcher

router = APIRouter(prefix="/assets", tags=["assets"])


def _serialize(asset: Asset) -> schemas.AssetRead:
    payload = {
        "id": asset.id,
        "name": asset.name,
        "type": asset.type,
        "quantity": asset.quantity,
        "current_value": asset.current_value,
        "purchase_price": asset.purchase_price,
        "purchase_date": asset.purchase_date,
        "asset_data": asset.asset_data,
        "created_at": asset.created_at,
        "updated_at": asset.updated_at,
    }
    return schemas.AssetRead.model_validate(payload)


@router.get("", response_model=list[schemas.AssetRead])
def list_assets(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    assets = (
        db.query(Asset)
        .filter(Asset.user_id == current_user.id)
        .order_by(Asset.created_at.desc())
        .all()
    )
    return [_serialize(asset) for asset in assets]


def _resolve_current_value(asset_type: AssetType, quantity: float, manual_value: Optional[float], purchase_price: Optional[float]) -> float:
    if manual_value is not None and manual_value > 0:
        return manual_value
    if asset_type == AssetType.GOLD:
        try:
            return price_fetcher.calculate_gold_value(quantity)
        except Exception:
            if purchase_price is not None:
                return purchase_price
            return 0.0
    return purchase_price or 0.0


@router.post("", response_model=schemas.AssetRead, status_code=status.HTTP_201_CREATED)
def create_asset(
    payload: schemas.AssetCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    current_value = _resolve_current_value(
        payload.type,
        payload.quantity,
        payload.current_value,
        payload.purchase_price,
    )

    asset = Asset(
        user_id=current_user.id,
        name=payload.name,
        type=payload.type,
        quantity=payload.quantity,
        current_value=current_value,
        purchase_price=payload.purchase_price,
        purchase_date=payload.purchase_date,
        asset_data=payload.asset_data,
    )
    db.add(asset)
    db.commit()
    db.refresh(asset)
    return _serialize(asset)


@router.get("/{asset_id}", response_model=schemas.AssetRead)
def get_asset(asset_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    asset = db.query(Asset).filter(Asset.id == asset_id, Asset.user_id == current_user.id).first()
    if not asset:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Asset not found")
    return _serialize(asset)


@router.put("/{asset_id}", response_model=schemas.AssetRead)
def update_asset(
    asset_id: str,
    payload: schemas.AssetCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    asset = db.query(Asset).filter(Asset.id == asset_id, Asset.user_id == current_user.id).first()
    if not asset:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Asset not found")

    asset.name = payload.name
    asset.type = payload.type
    asset.quantity = payload.quantity
    asset.purchase_price = payload.purchase_price
    asset.purchase_date = payload.purchase_date
    asset.asset_data = payload.asset_data
    asset.current_value = _resolve_current_value(payload.type, payload.quantity, payload.current_value, payload.purchase_price)
    asset.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(asset)
    return _serialize(asset)


@router.delete("/{asset_id}", response_model=schemas.Message)
def delete_asset(asset_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    asset = db.query(Asset).filter(Asset.id == asset_id, Asset.user_id == current_user.id).first()
    if not asset:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Asset not found")

    db.delete(asset)
    db.commit()
    return schemas.Message(message="Asset deleted successfully")
