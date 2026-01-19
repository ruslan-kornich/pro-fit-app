from decimal import Decimal
from typing import Optional, List, TYPE_CHECKING
from sqlalchemy import String, Integer, Numeric
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.config.db import Base
from app.utils.model import UUIDPrimaryKeyMixin, CreatedUpdatedFieldsMixin

if TYPE_CHECKING:
    from app.models.food_entries import FoodEntryModel


class UserModel(Base, UUIDPrimaryKeyMixin, CreatedUpdatedFieldsMixin):
    __tablename__ = "users"

    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)

    name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    height: Mapped[Optional[Decimal]] = mapped_column(Numeric(10, 2), nullable=True)
    weight: Mapped[Optional[Decimal]] = mapped_column(Numeric(10, 2), nullable=True)
    age: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    gender: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    activity_level: Mapped[Optional[Decimal]] = mapped_column(Numeric(10, 2), nullable=True, default=1.2)
    daily_calorie_norm: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)

    food_entries: Mapped[List["FoodEntryModel"]] = relationship(
        "FoodEntryModel",
        back_populates="user",
        cascade="all, delete-orphan",
    )
