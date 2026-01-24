from datetime import date
from uuid import UUID

from sqlalchemy import and_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.weight_entries import WeightEntryModel
from app.utils.repository import BaseRepository


class WeightEntryRepository(BaseRepository[WeightEntryModel]):
    def __init__(self, session: AsyncSession):
        super().__init__(WeightEntryModel, session)

    async def get_user_entries(
        self,
        user_id: UUID,
        start_date: date | None = None,
        end_date: date | None = None,
    ) -> list[WeightEntryModel]:
        query = select(WeightEntryModel).where(WeightEntryModel.user_id == user_id)

        if start_date:
            query = query.where(WeightEntryModel.recorded_date >= start_date)

        if end_date:
            query = query.where(WeightEntryModel.recorded_date <= end_date)

        query = query.order_by(WeightEntryModel.recorded_date.desc())

        result = await self.session.execute(query)
        return list(result.scalars().all())

    async def get_by_date(self, user_id: UUID, recorded_date: date) -> WeightEntryModel | None:
        query = select(WeightEntryModel).where(
            and_(
                WeightEntryModel.user_id == user_id,
                WeightEntryModel.recorded_date == recorded_date,
            )
        )
        result = await self.session.execute(query)
        return result.scalar_one_or_none()

    async def get_latest(self, user_id: UUID) -> WeightEntryModel | None:
        query = (
            select(WeightEntryModel)
            .where(WeightEntryModel.user_id == user_id)
            .order_by(WeightEntryModel.recorded_date.desc())
            .limit(1)
        )
        result = await self.session.execute(query)
        return result.scalar_one_or_none()

    async def delete_user_entry(self, user_id: UUID, entry_id: UUID) -> bool:
        entry = await self.get_by_id(entry_id)
        if entry and entry.user_id == user_id:
            return await self.delete(entry_id)
        return False
