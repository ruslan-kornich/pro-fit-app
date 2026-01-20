from typing import Optional, List, TYPE_CHECKING
from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.config.db import Base
from app.utils.model import UUIDPrimaryKeyMixin, CreatedUpdatedFieldsMixin

if TYPE_CHECKING:
    from app.models.food_entries import FoodEntryModel
    from app.models.profiles import ProfileModel


class UserModel(Base, UUIDPrimaryKeyMixin, CreatedUpdatedFieldsMixin):
    __tablename__ = "users"

    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)

    profile: Mapped[Optional["ProfileModel"]] = relationship(
        "ProfileModel",
        back_populates="user",
        uselist=False,
        cascade="all, delete-orphan",
        lazy="joined",
    )

    food_entries: Mapped[List["FoodEntryModel"]] = relationship(
        "FoodEntryModel",
        back_populates="user",
        cascade="all, delete-orphan",
    )
