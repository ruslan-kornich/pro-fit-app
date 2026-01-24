from datetime import date, datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, Field


class WeightEntryCreate(BaseModel):
    weight: float = Field(..., gt=0, le=500)
    recorded_date: date
    note: str | None = Field(None, max_length=500)


class WeightEntryUpdate(BaseModel):
    weight: float | None = Field(None, gt=0, le=500)
    note: str | None = Field(None, max_length=500)


class WeightEntryResponse(BaseModel):
    id: UUID
    user_id: UUID
    weight: float
    recorded_date: date
    note: str | None = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class WeightHistoryResponse(BaseModel):
    entries: list[WeightEntryResponse]
    total: int
    start_weight: float | None = None
    current_weight: float | None = None
    weight_change: float | None = None
