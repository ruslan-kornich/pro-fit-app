from datetime import date
from uuid import UUID

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.config.db import get_db
from app.config.jwt import get_current_user_id
from app.schemas.weight import (
    WeightEntryCreate,
    WeightEntryResponse,
    WeightHistoryResponse,
)
from app.services.weight_service import WeightService

router = APIRouter(prefix="/weight", tags=["Weight"])


@router.post("/entries", response_model=WeightEntryResponse)
async def create_weight_entry(
    entry: WeightEntryCreate,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    service = WeightService(db)
    return await service.create_entry(UUID(user_id), entry)


@router.get("/entries", response_model=WeightHistoryResponse)
async def get_weight_history(
    start_date: date | None = Query(None),
    end_date: date | None = Query(None),
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    service = WeightService(db)
    return await service.get_history(UUID(user_id), start_date, end_date)


@router.delete("/entries/{entry_id}")
async def delete_weight_entry(
    entry_id: UUID,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    service = WeightService(db)
    await service.delete_entry(UUID(user_id), entry_id)
    return {"message": "Weight entry deleted successfully"}
