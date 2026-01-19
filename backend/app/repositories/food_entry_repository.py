from typing import List, Optional
from uuid import UUID
from datetime import date, datetime, time, timezone, timedelta
from sqlalchemy import select, func, and_
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.food_entries import FoodEntryModel
from app.utils.repository import BaseRepository


class FoodEntryRepository(BaseRepository[FoodEntryModel]):
    def __init__(self, session: AsyncSession):
        super().__init__(FoodEntryModel, session)

    async def get_by_id_with_ingredients(self, entry_id: UUID) -> Optional[FoodEntryModel]:
        query = (
            select(FoodEntryModel)
            .options(selectinload(FoodEntryModel.ingredients))
            .where(FoodEntryModel.id == entry_id)
        )
        result = await self.session.execute(query)
        return result.scalar_one_or_none()

    async def get_user_entries(
        self,
        user_id: UUID,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
        skip: int = 0,
        limit: int = 50,
    ) -> List[FoodEntryModel]:
        query = (
            select(FoodEntryModel)
            .options(selectinload(FoodEntryModel.ingredients))
            .where(
                and_(
                    FoodEntryModel.user_id == user_id,
                    FoodEntryModel.parent_id.is_(None),
                )
            )
        )

        if start_date:
            start_datetime = datetime.combine(start_date, time.min, tzinfo=timezone.utc)
            query = query.where(FoodEntryModel.created_at >= start_datetime)

        if end_date:
            end_datetime = datetime.combine(end_date, time.max, tzinfo=timezone.utc)
            query = query.where(FoodEntryModel.created_at <= end_datetime)

        query = query.order_by(FoodEntryModel.created_at.desc()).offset(skip).limit(limit)

        result = await self.session.execute(query)
        return list(result.scalars().unique().all())

    async def count_user_entries(
        self,
        user_id: UUID,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
    ) -> int:
        query = select(func.count(FoodEntryModel.id)).where(
            and_(
                FoodEntryModel.user_id == user_id,
                FoodEntryModel.parent_id.is_(None),
            )
        )

        if start_date:
            start_datetime = datetime.combine(start_date, time.min, tzinfo=timezone.utc)
            query = query.where(FoodEntryModel.created_at >= start_datetime)

        if end_date:
            end_datetime = datetime.combine(end_date, time.max, tzinfo=timezone.utc)
            query = query.where(FoodEntryModel.created_at <= end_datetime)

        result = await self.session.execute(query)
        return result.scalar_one() or 0

    async def get_daily_totals(
        self,
        user_id: UUID,
        target_date: date,
    ) -> dict:
        start_datetime = datetime.combine(target_date, time.min, tzinfo=timezone.utc)
        end_datetime = datetime.combine(target_date, time.max, tzinfo=timezone.utc)

        query = select(
            func.coalesce(func.sum(FoodEntryModel.calories), 0).label("total_calories"),
            func.coalesce(func.sum(FoodEntryModel.protein), 0).label("total_protein"),
            func.coalesce(func.sum(FoodEntryModel.fat), 0).label("total_fat"),
            func.coalesce(func.sum(FoodEntryModel.carbs), 0).label("total_carbs"),
            func.count(FoodEntryModel.id).label("entries_count"),
        ).where(
            and_(
                FoodEntryModel.user_id == user_id,
                FoodEntryModel.parent_id.is_(None),
                FoodEntryModel.created_at >= start_datetime,
                FoodEntryModel.created_at <= end_datetime,
            )
        )

        result = await self.session.execute(query)
        row = result.one()

        return {
            "total_calories": int(row.total_calories),
            "total_protein": float(row.total_protein),
            "total_fat": float(row.total_fat),
            "total_carbs": float(row.total_carbs),
            "entries_count": int(row.entries_count),
        }

    async def get_recent_entries(
        self,
        user_id: UUID,
        days: int = 7,
        limit: int = 50,
    ) -> List[FoodEntryModel]:
        cutoff_date = datetime.now(timezone.utc) - timedelta(days=days)

        query = (
            select(FoodEntryModel)
            .where(
                and_(
                    FoodEntryModel.user_id == user_id,
                    FoodEntryModel.created_at >= cutoff_date,
                )
            )
            .order_by(FoodEntryModel.created_at.desc())
            .limit(limit)
        )

        result = await self.session.execute(query)
        return list(result.scalars().all())

    async def delete_user_entry(self, user_id: UUID, entry_id: UUID) -> bool:
        entry = await self.get_by_id(entry_id)
        if entry and entry.user_id == user_id:
            return await self.delete(entry_id)
        return False
