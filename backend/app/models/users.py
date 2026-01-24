from typing import TYPE_CHECKING, Optional

from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.config.db import Base
from app.utils.model import CreatedUpdatedFieldsMixin, UUIDPrimaryKeyMixin

if TYPE_CHECKING:
    from app.models.food_entries import FoodEntryModel
    from app.models.onboarding import OnboardingModel
    from app.models.profiles import ProfileModel
    from app.models.weight_entries import WeightEntryModel


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

    food_entries: Mapped[list["FoodEntryModel"]] = relationship(
        "FoodEntryModel",
        back_populates="user",
        cascade="all, delete-orphan",
    )

    onboarding: Mapped[Optional["OnboardingModel"]] = relationship(
        "OnboardingModel",
        back_populates="user",
        uselist=False,
        cascade="all, delete-orphan",
        lazy="joined",
    )

    weight_entries: Mapped[list["WeightEntryModel"]] = relationship(
        "WeightEntryModel",
        back_populates="user",
        cascade="all, delete-orphan",
    )
