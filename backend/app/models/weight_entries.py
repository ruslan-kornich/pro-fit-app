from datetime import date
from decimal import Decimal
from typing import TYPE_CHECKING
from uuid import UUID

from sqlalchemy import Date, ForeignKey, Index, Numeric, String
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.config.db import Base
from app.utils.model import CreatedUpdatedFieldsMixin, UUIDPrimaryKeyMixin

if TYPE_CHECKING:
    from app.models.users import UserModel


class WeightEntryModel(Base, UUIDPrimaryKeyMixin, CreatedUpdatedFieldsMixin):
    __tablename__ = "weight_entries"

    user_id: Mapped[UUID] = mapped_column(
        PG_UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    weight: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    recorded_date: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    note: Mapped[str | None] = mapped_column(String(500), nullable=True)

    user: Mapped["UserModel"] = relationship("UserModel", back_populates="weight_entries")

    __table_args__ = (
        Index("ix_weight_entries_user_date", "user_id", "recorded_date", unique=True),
    )
