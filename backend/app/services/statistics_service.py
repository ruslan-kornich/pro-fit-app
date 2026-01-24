from datetime import UTC, date, datetime, time, timedelta
from uuid import UUID

from sqlalchemy import and_, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.food_entries import FoodEntryModel
from app.models.weight_entries import WeightEntryModel
from app.repositories.user_repository import UserRepository
from app.repositories.weight_entry_repository import WeightEntryRepository
from app.schemas.statistics import (
    DailyStatsSummary,
    MacroAverages,
    StatisticsResponse,
    WeightDataPoint,
)


class StatisticsService:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.user_repository = UserRepository(session)
        self.weight_repository = WeightEntryRepository(session)

    async def get_statistics(
        self,
        user_id: UUID,
        start_date: date,
        end_date: date,
    ) -> StatisticsResponse:
        user = await self.user_repository.get_by_id(user_id)
        calorie_goal = user.profile.daily_calorie_norm if user and user.profile else None

        daily_stats = await self._get_daily_food_stats(
            user_id, start_date, end_date, calorie_goal
        )

        weight_entries = await self.weight_repository.get_user_entries(
            user_id, start_date, end_date
        )
        weight_data = [
            WeightDataPoint(date=e.recorded_date, weight=float(e.weight))
            for e in reversed(weight_entries)
        ]

        averages = self._calculate_averages(daily_stats)
        days_with_entries = sum(1 for d in daily_stats if d.entries_count > 0)
        total_entries = sum(d.entries_count for d in daily_stats)

        return StatisticsResponse(
            period_start=start_date,
            period_end=end_date,
            daily_stats=daily_stats,
            weight_data=weight_data,
            averages=averages,
            total_entries=total_entries,
            days_with_entries=days_with_entries,
        )

    async def _get_daily_food_stats(
        self,
        user_id: UUID,
        start_date: date,
        end_date: date,
        calorie_goal: int | None,
    ) -> list[DailyStatsSummary]:
        start_datetime = datetime.combine(start_date, time.min, tzinfo=UTC)
        end_datetime = datetime.combine(end_date, time.max, tzinfo=UTC)

        query = (
            select(
                func.date(FoodEntryModel.created_at).label("entry_date"),
                func.coalesce(func.sum(FoodEntryModel.calories), 0).label("calories"),
                func.coalesce(func.sum(FoodEntryModel.protein), 0).label("protein"),
                func.coalesce(func.sum(FoodEntryModel.fat), 0).label("fat"),
                func.coalesce(func.sum(FoodEntryModel.carbs), 0).label("carbs"),
                func.count(FoodEntryModel.id).label("entries_count"),
            )
            .where(
                and_(
                    FoodEntryModel.user_id == user_id,
                    FoodEntryModel.parent_id.is_(None),
                    FoodEntryModel.created_at >= start_datetime,
                    FoodEntryModel.created_at <= end_datetime,
                )
            )
            .group_by(func.date(FoodEntryModel.created_at))
        )

        result = await self.session.execute(query)
        rows = result.all()

        stats_by_date = {
            row.entry_date: DailyStatsSummary(
                date=row.entry_date,
                calories=int(row.calories),
                protein=float(row.protein),
                fat=float(row.fat),
                carbs=float(row.carbs),
                goal=calorie_goal,
                entries_count=int(row.entries_count),
            )
            for row in rows
        }

        all_dates = []
        current = start_date
        while current <= end_date:
            if current in stats_by_date:
                all_dates.append(stats_by_date[current])
            else:
                all_dates.append(
                    DailyStatsSummary(
                        date=current,
                        calories=0,
                        protein=0.0,
                        fat=0.0,
                        carbs=0.0,
                        goal=calorie_goal,
                        entries_count=0,
                    )
                )
            current += timedelta(days=1)

        return all_dates

    def _calculate_averages(self, daily_stats: list[DailyStatsSummary]) -> MacroAverages:
        days_with_data = [d for d in daily_stats if d.entries_count > 0]
        if not days_with_data:
            return MacroAverages(calories=0, protein=0, fat=0, carbs=0)

        count = len(days_with_data)
        return MacroAverages(
            calories=round(sum(d.calories for d in days_with_data) / count, 1),
            protein=round(sum(d.protein for d in days_with_data) / count, 1),
            fat=round(sum(d.fat for d in days_with_data) / count, 1),
            carbs=round(sum(d.carbs for d in days_with_data) / count, 1),
        )
