from datetime import date
from uuid import UUID

from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

from app.config.db import get_db
from app.config.jwt import get_current_user_id
from app.schemas.food import (
    AnalyzePhotoDetailedResponse,
    DailyStatsResponse,
    FoodAnalysisResponse,
    FoodEntriesListResponse,
    FoodEntryCreate,
    FoodEntryResponse,
    FoodEntryWithIngredientsCreate,
    RecommendationResponse,
)
from app.schemas.nutrition_search import NutritionSearchResponse
from app.services.food_service import FoodService
from app.services.nutrition_search_service import NutritionSearchError, nutrition_search_service

router = APIRouter(prefix="/food", tags=["Food"])


@router.get("/search", response_model=NutritionSearchResponse)
async def search_food_nutrition(
    query: str = Query(..., min_length=1, max_length=100),
    user_id: str = Depends(get_current_user_id),
):
    try:
        return await nutrition_search_service.search(query)
    except NutritionSearchError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error


class AnalyzePhotoResponse(FoodAnalysisResponse):
    photo_url: str


@router.post("/analyze-photo", response_model=AnalyzePhotoResponse)
async def analyze_photo(
    file: UploadFile = File(...),
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    service = FoodService(db)
    analysis, photo_url = await service.analyze_photo(file, user_id=UUID(user_id))
    return AnalyzePhotoResponse(
        name=analysis.name,
        calories=analysis.calories,
        protein=analysis.protein,
        fat=analysis.fat,
        carbs=analysis.carbs,
        grams=analysis.grams,
        confidence=analysis.confidence,
        photo_url=photo_url,
    )


@router.post("/analyze-photo-detailed", response_model=AnalyzePhotoDetailedResponse)
async def analyze_photo_detailed(
    file: UploadFile = File(...),
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """
    Analyze food photo with detailed breakdown:
    - Main dish name + total calories/grams/macros
    - List of individual ingredients with calories each
    """
    service = FoodService(db)
    analysis, photo_url = await service.analyze_photo_detailed(file, user_id=UUID(user_id))
    return AnalyzePhotoDetailedResponse(
        dish_name=analysis.dish_name,
        total_calories=analysis.total_calories,
        total_grams=analysis.total_grams,
        total_protein=analysis.total_protein,
        total_fat=analysis.total_fat,
        total_carbs=analysis.total_carbs,
        items=analysis.items,
        confidence=analysis.confidence,
        photo_url=photo_url,
    )


@router.post("/entries", response_model=FoodEntryResponse)
async def create_entry(
    entry: FoodEntryCreate,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    service = FoodService(db)
    created_entry = await service.create_entry(UUID(user_id), entry)
    return FoodEntryResponse.model_validate(created_entry)


@router.post("/entries-with-ingredients", response_model=FoodEntryResponse)
async def create_entry_with_ingredients(
    entry: FoodEntryWithIngredientsCreate,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    service = FoodService(db)
    created_entry = await service.create_entry_with_ingredients(UUID(user_id), entry)
    return FoodEntryResponse.model_validate(created_entry)


@router.get("/entries", response_model=FoodEntriesListResponse)
async def get_entries(
    start_date: date | None = Query(None),
    end_date: date | None = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    service = FoodService(db)
    return await service.get_entries(
        UUID(user_id),
        start_date=start_date,
        end_date=end_date,
        page=page,
        page_size=page_size,
    )


@router.delete("/entries/{entry_id}")
async def delete_entry(
    entry_id: UUID,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    service = FoodService(db)
    await service.delete_entry(UUID(user_id), entry_id)
    return {"message": "Entry deleted successfully"}


@router.get("/daily-stats", response_model=DailyStatsResponse)
async def get_daily_stats(
    target_date: date | None = Query(None),
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    service = FoodService(db)
    return await service.get_daily_stats(UUID(user_id), target_date)


@router.get("/ai-recommendations", response_model=RecommendationResponse)
async def get_ai_recommendations(
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    service = FoodService(db)
    return await service.get_recommendations(UUID(user_id))
