from __future__ import annotations

from datetime import datetime
from typing import Dict, List, Optional

from pydantic import AliasChoices, BaseModel, EmailStr, Field

from .models import (
    AssetType,
    CategoryType,
    GoalStatus,
    GoalType,
    TransactionSource,
    TransactionType,
)


class ConfigMixin:
    model_config = {
        "populate_by_name": True,
        "from_attributes": True,
    }


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenPayload(BaseModel):
    sub: str
    exp: int


class UserBase(BaseModel):
    email: EmailStr
    name: Optional[str] = None


class UserCreate(UserBase):
    password: str


class UserRead(UserBase, ConfigMixin):
    id: str
    currency: str


class CategoryBase(BaseModel):
    name: str
    type: CategoryType
    icon: Optional[str] = None
    color: Optional[str] = None
    parent_id: Optional[str] = Field(
        default=None,
        serialization_alias="parentId",
        validation_alias=AliasChoices("parentId", "parent_id"),
    )


class CategoryCreate(CategoryBase):
    pass


class CategoryRead(CategoryBase, ConfigMixin):
    id: str
    created_at: datetime = Field(serialization_alias="createdAt")
    updated_at: datetime = Field(serialization_alias="updatedAt")
    children: List[Dict[str, str]] | None = None
    transactions_count: Optional[int] = Field(default=None, serialization_alias="transactionsCount")


class TransactionBase(BaseModel):
    amount: float
    description: str
    date: Optional[datetime] = None
    type: TransactionType
    category_id: Optional[str] = Field(
        default=None,
        serialization_alias="categoryId",
        validation_alias=AliasChoices("categoryId", "category_id"),
    )
    subcategory: Optional[str] = None
    merchant: Optional[str] = None
    source: TransactionSource = TransactionSource.MANUAL


class TransactionCreate(TransactionBase):
    pass


class TransactionCategorizeRequest(BaseModel):
    description: str
    amount: float


class TransactionUpdate(BaseModel):
    amount: Optional[float] = None
    description: Optional[str] = None
    date: Optional[datetime] = None
    type: Optional[TransactionType] = None
    category_id: Optional[str] = Field(
        default=None,
        serialization_alias="categoryId",
        validation_alias=AliasChoices("categoryId", "category_id"),
    )
    subcategory: Optional[str] = None
    merchant: Optional[str] = None


class CategorySummary(BaseModel):
    id: Optional[str]
    name: Optional[str]
    icon: Optional[str]
    color: Optional[str]


class TransactionRead(TransactionBase, ConfigMixin):
    id: str
    created_at: datetime = Field(serialization_alias="createdAt")
    updated_at: datetime = Field(serialization_alias="updatedAt")
    category: Optional[CategorySummary] = None


class AssetBase(BaseModel):
    name: str
    type: AssetType
    quantity: float
    current_value: float = Field(
        default=0.0,
        serialization_alias="currentValue",
        validation_alias=AliasChoices("currentValue", "current_value"),
    )
    purchase_price: Optional[float] = Field(
        default=None,
        serialization_alias="purchasePrice",
        validation_alias=AliasChoices("purchasePrice", "purchase_price"),
    )
    purchase_date: Optional[datetime] = Field(
        default=None,
        serialization_alias="purchaseDate",
        validation_alias=AliasChoices("purchaseDate", "purchase_date"),
    )
    asset_data: Optional[dict] = Field(
        default=None,
        serialization_alias="assetData",
        validation_alias=AliasChoices("assetData", "asset_data"),
    )


class AssetCreate(AssetBase):
    pass


class AssetRead(AssetBase, ConfigMixin):
    id: str
    created_at: datetime = Field(serialization_alias="createdAt")
    updated_at: datetime = Field(serialization_alias="updatedAt")


class GoalBase(BaseModel):
    name: str
    type: GoalType
    target_amount: float = Field(
        serialization_alias="targetAmount",
        validation_alias=AliasChoices("targetAmount", "target_amount"),
    )
    current_amount: float = Field(
        default=0,
        serialization_alias="currentAmount",
        validation_alias=AliasChoices("currentAmount", "current_amount"),
    )
    deadline: Optional[datetime] = None
    status: GoalStatus = GoalStatus.ACTIVE


class GoalCreate(GoalBase):
    pass


class GoalRead(GoalBase, ConfigMixin):
    id: str
    created_at: datetime = Field(serialization_alias="createdAt")
    updated_at: datetime = Field(serialization_alias="updatedAt")


class PaginatedTransactions(BaseModel):
    transactions: List[TransactionRead]
    pagination: Dict[str, int]


class CategorizeResponse(BaseModel):
    category: str
    subcategory: str
    merchant: str
    category_id: Optional[str] = Field(
        default=None,
        serialization_alias="categoryId",
        validation_alias=AliasChoices("categoryId", "category_id"),
    )
    confidence: float


class Message(BaseModel):
    message: str


class UploadResponse(BaseModel):
    message: str
    transactions_count: int = Field(serialization_alias="transactionsCount")
    transactions: List[TransactionRead]
