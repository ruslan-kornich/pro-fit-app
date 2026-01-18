from typing import Optional, TYPE_CHECKING
from uuid import UUID
from sqlalchemy import String, Float, Integer, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID as PG_UUID

from app.config.db import Base
from app.utils.model import UUIDPrimaryKeyMixin, CreatedUpdatedFieldsMixin

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

    name: Mapped[str] = mapped_column(String(255), nullable=False)
    calories: Mapped[int] = mapped_column(Integer, nullable=False)
    protein: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    fat: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    carbs: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    grams: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    photo_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)

    user: Mapped["UserModel"] = relationship("UserModel", back_populates="food_entries")
