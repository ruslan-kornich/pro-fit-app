from typing import Optional, List
from uuid import UUID
from datetime import datetime, date
from pydantic import BaseModel


class FoodAnalysisResponse(BaseModel):
    name: str
    calories: int
    protein: Optional[float] = None
    fat: Optional[float] = None
    carbs: Optional[float] = None
    grams: Optional[float] = None
    confidence: Optional[float] = None


class FoodEntryCreate(BaseModel):
    name: str
    calories: int
    protein: Optional[float] = None
    fat: Optional[float] = None
    carbs: Optional[float] = None
    grams: Optional[float] = None
    photo_url: Optional[str] = None


class FoodEntryResponse(BaseModel):
    id: UUID
    user_id: UUID
    name: str
    calories: int
    protein: Optional[float] = None
    fat: Optional[float] = None
    carbs: Optional[float] = None
    grams: Optional[float] = None
    photo_url: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class DailyStatsResponse(BaseModel):
    date: date
    total_calories: int
    total_protein: float
    total_fat: float
    total_carbs: float
    remaining_calories: Optional[int] = None
    calorie_goal: Optional[int] = None
    entries_count: int


class RecommendationResponse(BaseModel):
    recommendations: List[str]
    insights: str
    protein_status: str
    balance_score: int


class FoodEntriesListResponse(BaseModel):
    entries: List[FoodEntryResponse]
    total: int
    page: int
    page_size: int


class FoodItemAnalysis(BaseModel):
    """Single ingredient/product detected in the dish"""
    name: str
    calories: int
    protein: Optional[float] = None
    fat: Optional[float] = None
    carbs: Optional[float] = None
    grams: Optional[float] = None


class DishAnalysisResponse(BaseModel):
    """Full dish analysis with ingredient breakdown"""
    dish_name: str
    total_calories: int
    total_grams: float
    total_protein: float
    total_fat: float
    total_carbs: float
    items: List[FoodItemAnalysis]
    confidence: Optional[float] = None


class AnalyzePhotoDetailedResponse(DishAnalysisResponse):
    """API response with photo URL"""
    photo_url: str
