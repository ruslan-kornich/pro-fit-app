from datetime import date, timedelta
from uuid import UUID

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.config.db import get_db
from app.config.jwt import get_current_user_id
from app.schemas.statistics import StatisticsResponse
from app.services.statistics_service import StatisticsService

router = APIRouter(prefix="/statistics", tags=["Statistics"])


@router.get("", response_model=StatisticsResponse)
async def get_statistics(
    period: str | None = Query(None, regex="^(week|month)$"),
    start_date: date | None = Query(None),
    end_date: date | None = Query(None),
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    service = StatisticsService(db)

    if start_date and end_date:
        return await service.get_statistics(UUID(user_id), start_date, end_date)

    end = date.today()
    if period == "month":
        start = end - timedelta(days=29)
    else:
        start = end - timedelta(days=6)

    return await service.get_statistics(UUID(user_id), start, end)
