from decimal import Decimal
from typing import TYPE_CHECKING
from uuid import UUID

from sqlalchemy import Boolean, ForeignKey, Integer, Numeric, String
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.config.db import Base
from app.utils.model import CreatedUpdatedFieldsMixin, UUIDPrimaryKeyMixin

if TYPE_CHECKING:
    from app.models.users import UserModel


class ProfileModel(Base, UUIDPrimaryKeyMixin, CreatedUpdatedFieldsMixin):
    __tablename__ = "profiles"

    user_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
        index=True,
    )

    name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    height: Mapped[Decimal | None] = mapped_column(Numeric(10, 2), nullable=True)
    weight: Mapped[Decimal | None] = mapped_column(Numeric(10, 2), nullable=True)
    age: Mapped[int | None] = mapped_column(Integer, nullable=True)
    gender: Mapped[str | None] = mapped_column(String(20), nullable=True)
    activity_level: Mapped[Decimal | None] = mapped_column(Numeric(10, 2), nullable=True, default=1.2)
    language: Mapped[str] = mapped_column(String(10), nullable=False, default="uk")
    goal: Mapped[str] = mapped_column(String(20), nullable=False, default="maintain")
    daily_calorie_norm: Mapped[int | None] = mapped_column(Integer, nullable=True)
    is_calorie_goal_manual: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)

    user: Mapped["UserModel"] = relationship("UserModel", back_populates="profile")
