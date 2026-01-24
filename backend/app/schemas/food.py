from datetime import date, datetime
from uuid import UUID

from pydantic import BaseModel


class FoodAnalysisResponse(BaseModel):
    name: str
    calories: int
    protein: float | None = None
    fat: float | None = None
    carbs: float | None = None
    grams: float | None = None
    confidence: float | None = None


class FoodEntryCreate(BaseModel):
    name: str
    calories: int
    protein: float | None = None
    fat: float | None = None
    carbs: float | None = None
    grams: float | None = None
    photo_url: str | None = None


class IngredientCreate(BaseModel):
    name: str
    calories: int
    protein: float | None = None
    fat: float | None = None
    carbs: float | None = None
    grams: float | None = None


class FoodEntryWithIngredientsCreate(BaseModel):
    name: str
    calories: int
    protein: float | None = None
    fat: float | None = None
    carbs: float | None = None
    grams: float | None = None
    photo_url: str | None = None
    ingredients: list[IngredientCreate] = []


class IngredientResponse(BaseModel):
    id: UUID
    name: str
    calories: int
    protein: float | None = None
    fat: float | None = None
    carbs: float | None = None
    grams: float | None = None

    class Config:
        from_attributes = True


class FoodEntryResponse(BaseModel):
    id: UUID
    user_id: UUID
    parent_id: UUID | None = None
    name: str
    calories: int
    protein: float | None = None
    fat: float | None = None
    carbs: float | None = None
    grams: float | None = None
    photo_url: str | None = None
    created_at: datetime
    updated_at: datetime
    ingredients: list[IngredientResponse] = []

    class Config:
        from_attributes = True


class DailyStatsResponse(BaseModel):
    date: date
    total_calories: int
    total_protein: float
    total_fat: float
    total_carbs: float
    remaining_calories: int | None = None
    calorie_goal: int | None = None
    entries_count: int


class RecommendationResponse(BaseModel):
    recommendations: list[str]
    insights: str
    protein_status: str
    balance_score: int


class FoodEntriesListResponse(BaseModel):
    entries: list[FoodEntryResponse]
    total: int
    page: int
    page_size: int


class FoodItemAnalysis(BaseModel):
    """Single ingredient/product detected in the dish"""

    name: str
    calories: int
    protein: float | None = None
    fat: float | None = None
    carbs: float | None = None
    grams: float | None = None


class DishAnalysisResponse(BaseModel):
    """Full dish analysis with ingredient breakdown"""

    dish_name: str
    total_calories: int
    total_grams: float
    total_protein: float
    total_fat: float
    total_carbs: float
    items: list[FoodItemAnalysis]
    confidence: float | None = None


class AnalyzePhotoDetailedResponse(DishAnalysisResponse):
    """API response with photo URL"""

    photo_url: str
