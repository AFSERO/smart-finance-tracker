from __future__ import annotations

import enum
from datetime import datetime
from typing import List, Optional
from uuid import uuid4

from sqlalchemy import (
    JSON,
    Boolean,
    Column,
    DateTime,
    Enum,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .database import Base


def _uuid() -> str:
    return str(uuid4())


class TransactionType(str, enum.Enum):
    INCOME = "INCOME"
    EXPENSE = "EXPENSE"


class TransactionSource(str, enum.Enum):
    MANUAL = "MANUAL"
    PDF_UPLOAD = "PDF_UPLOAD"
    API_IMPORT = "API_IMPORT"


class CategoryType(str, enum.Enum):
    INCOME = "INCOME"
    EXPENSE = "EXPENSE"


class AssetType(str, enum.Enum):
    GOLD = "GOLD"
    STOCK = "STOCK"
    CRYPTO = "CRYPTO"
    REAL_ESTATE = "REAL_ESTATE"
    CUSTOM = "CUSTOM"


class GoalType(str, enum.Enum):
    MONTHLY_INCOME = "MONTHLY_INCOME"
    SAVINGS = "SAVINGS"
    INVESTMENT = "INVESTMENT"
    DEBT_PAYOFF = "DEBT_PAYOFF"
    CUSTOM = "CUSTOM"


class GoalStatus(str, enum.Enum):
    ACTIVE = "ACTIVE"
    COMPLETED = "COMPLETED"
    PAUSED = "PAUSED"
    CANCELLED = "CANCELLED"


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    name: Mapped[Optional[str]] = mapped_column(String(255))
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    password_hash: Mapped[Optional[str]] = mapped_column(String(255))
    currency: Mapped[str] = mapped_column(String(3), default="USD", nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    transactions: Mapped[List["Transaction"]] = relationship("Transaction", back_populates="user", cascade="all, delete-orphan")
    categories: Mapped[List["Category"]] = relationship("Category", back_populates="user", cascade="all, delete-orphan")
    assets: Mapped[List["Asset"]] = relationship("Asset", back_populates="user", cascade="all, delete-orphan")
    goals: Mapped[List["Goal"]] = relationship("Goal", back_populates="user", cascade="all, delete-orphan")


class Transaction(Base):
    __tablename__ = "transactions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    amount: Mapped[float] = mapped_column(Float, nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    date: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, nullable=False, index=True)
    type: Mapped[TransactionType] = mapped_column(Enum(TransactionType), nullable=False, index=True)
    category_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("categories.id"))
    subcategory: Mapped[Optional[str]] = mapped_column(String(255))
    merchant: Mapped[Optional[str]] = mapped_column(String(255))
    source: Mapped[TransactionSource] = mapped_column(Enum(TransactionSource), default=TransactionSource.MANUAL, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    user: Mapped[User] = relationship("User", back_populates="transactions")
    category: Mapped[Optional["Category"]] = relationship("Category", back_populates="transactions")


class Category(Base):
    __tablename__ = "categories"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    type: Mapped[CategoryType] = mapped_column(Enum(CategoryType), nullable=False, index=True)
    icon: Mapped[Optional[str]] = mapped_column(String(32))
    color: Mapped[Optional[str]] = mapped_column(String(16))
    parent_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("categories.id"))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    user: Mapped[User] = relationship("User", back_populates="categories")
    parent: Mapped[Optional["Category"]] = relationship("Category", remote_side="Category.id", back_populates="children")
    children: Mapped[List["Category"]] = relationship("Category", back_populates="parent", cascade="all, delete")
    transactions: Mapped[List[Transaction]] = relationship("Transaction", back_populates="category")


class Asset(Base):
    __tablename__ = "assets"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    type: Mapped[AssetType] = mapped_column(Enum(AssetType), nullable=False, index=True)
    quantity: Mapped[float] = mapped_column(Float, nullable=False)
    current_value: Mapped[float] = mapped_column(Float, nullable=False)
    purchase_price: Mapped[Optional[float]] = mapped_column(Float)
    purchase_date: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    asset_data: Mapped[Optional[dict]] = mapped_column(JSON)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    user: Mapped[User] = relationship("User", back_populates="assets")


class Goal(Base):
    __tablename__ = "goals"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    type: Mapped[GoalType] = mapped_column(Enum(GoalType), nullable=False, index=True)
    target_amount: Mapped[float] = mapped_column(Float, nullable=False)
    current_amount: Mapped[float] = mapped_column(Float, default=0, nullable=False)
    deadline: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    status: Mapped[GoalStatus] = mapped_column(Enum(GoalStatus), default=GoalStatus.ACTIVE, nullable=False, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    user: Mapped[User] = relationship("User", back_populates="goals")


__all__ = [
    "User",
    "Transaction",
    "Category",
    "Asset",
    "Goal",
    "TransactionType",
    "TransactionSource",
    "CategoryType",
    "AssetType",
    "GoalType",
    "GoalStatus",
]
