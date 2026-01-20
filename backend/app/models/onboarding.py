from typing import TYPE_CHECKING
from uuid import UUID
from sqlalchemy import Integer, ForeignKey, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID as PGUUID

from app.config.db import Base
from app.utils.model import UUIDPrimaryKeyMixin, CreatedUpdatedFieldsMixin

if TYPE_CHECKING:
    from app.models.users import UserModel


class OnboardingModel(Base, UUIDPrimaryKeyMixin, CreatedUpdatedFieldsMixin):
    __tablename__ = "onboarding"

    user_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
        index=True,
    )

    current_step: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    is_completed: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)

    user: Mapped["UserModel"] = relationship("UserModel", back_populates="onboarding")
