from datetime import date

from pydantic import BaseModel


class DailyStatsSummary(BaseModel):
    date: date
    calories: int
    protein: float
    fat: float
    carbs: float
    goal: int | None = None
    entries_count: int


class WeightDataPoint(BaseModel):
    date: date
    weight: float


class MacroAverages(BaseModel):
    calories: float
    protein: float
    fat: float
    carbs: float


class StatisticsResponse(BaseModel):
    period_start: date
    period_end: date
    daily_stats: list[DailyStatsSummary]
    weight_data: list[WeightDataPoint]
    averages: MacroAverages
    total_entries: int
    days_with_entries: int
