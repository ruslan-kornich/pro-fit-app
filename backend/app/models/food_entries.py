from decimal import Decimal
from typing import TYPE_CHECKING, Optional
from uuid import UUID

from sqlalchemy import ForeignKey, Integer, Numeric, String
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.config.db import Base
from app.utils.model import CreatedUpdatedFieldsMixin, UUIDPrimaryKeyMixin

if TYPE_CHECKING:
    from app.models.users import UserModel


class FoodEntryModel(Base, UUIDPrimaryKeyMixin, CreatedUpdatedFieldsMixin):
    __tablename__ = "food_entries"

    user_id: Mapped[UUID] = mapped_column(
        PG_UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    parent_id: Mapped[UUID | None] = mapped_column(
        PG_UUID(as_uuid=True),
        ForeignKey("food_entries.id", ondelete="CASCADE"),
        nullable=True,
        index=True,
    )

    name: Mapped[str] = mapped_column(String(255), nullable=False)
    calories: Mapped[int] = mapped_column(Integer, nullable=False)
    protein: Mapped[Decimal | None] = mapped_column(Numeric(10, 2), nullable=True)
    fat: Mapped[Decimal | None] = mapped_column(Numeric(10, 2), nullable=True)
    carbs: Mapped[Decimal | None] = mapped_column(Numeric(10, 2), nullable=True)
    grams: Mapped[Decimal | None] = mapped_column(Numeric(10, 2), nullable=True)
    photo_url: Mapped[str | None] = mapped_column(String(500), nullable=True)

    user: Mapped["UserModel"] = relationship("UserModel", back_populates="food_entries")

    ingredients: Mapped[list["FoodEntryModel"]] = relationship(
        "FoodEntryModel",
        back_populates="parent",
        cascade="all, delete-orphan",
        lazy="raise",
    )

    parent: Mapped[Optional["FoodEntryModel"]] = relationship(
        "FoodEntryModel",
        back_populates="ingredients",
        remote_side="FoodEntryModel.id",
    )
