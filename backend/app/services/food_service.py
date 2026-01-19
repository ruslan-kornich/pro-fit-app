import logging
from typing import Optional, List
from uuid import UUID
from datetime import date, timezone, datetime
from fastapi import UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

logger = logging.getLogger(__name__)

from app.repositories.food_entry_repository import FoodEntryRepository
from app.repositories.user_repository import UserRepository
from app.models.food_entries import FoodEntryModel
from app.schemas.food import (
    FoodAnalysisResponse,
    FoodEntryCreate,
    FoodEntryWithIngredientsCreate,
    FoodEntryResponse,
    DailyStatsResponse,
    RecommendationResponse,
    FoodEntriesListResponse,
    DishAnalysisResponse,
)
from app.services.openai_service import openai_service
from app.utils.file_upload import save_upload_file
from app.utils.exceptions import NotFoundException, BadRequestException


class FoodService:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.food_repository = FoodEntryRepository(session)
        self.user_repository = UserRepository(session)

    async def analyze_photo(self, file: UploadFile) -> tuple[FoodAnalysisResponse, str]:
        if not file.content_type or not file.content_type.startswith("image/"):
            raise BadRequestException("File must be an image")

        content = await file.read()
        await file.seek(0)

        photo_url = await save_upload_file(file, subfolder="food")

        analysis = await openai_service.analyze_food_photo(
            image_data=content,
            mime_type=file.content_type,
        )

        return analysis, photo_url

    async def analyze_photo_detailed(self, file: UploadFile) -> tuple[DishAnalysisResponse, str]:
        logger.info(f"analyze_photo_detailed called with file: {file.filename}, content_type: {file.content_type}")

        if not file.content_type or not file.content_type.startswith("image/"):
            raise BadRequestException("File must be an image")

        content = await file.read()
        logger.info(f"File read, size: {len(content)} bytes")
        await file.seek(0)

        photo_url = await save_upload_file(file, subfolder="food")
        logger.info(f"File saved, photo_url: {photo_url}")

        logger.info("Calling openai_service.analyze_food_photo_detailed...")
        analysis = await openai_service.analyze_food_photo_detailed(
            image_data=content,
            mime_type=file.content_type,
        )
        logger.info(f"Analysis received: dish_name={analysis.dish_name}, total_calories={analysis.total_calories}, items_count={len(analysis.items)}")

        return analysis, photo_url

    async def create_entry(
        self,
        user_id: UUID,
        entry_data: FoodEntryCreate,
    ) -> FoodEntryModel:
        entry = await self.food_repository.create(
            user_id=user_id,
            name=entry_data.name,
            calories=entry_data.calories,
            protein=entry_data.protein,
            fat=entry_data.fat,
            carbs=entry_data.carbs,
            grams=entry_data.grams,
            photo_url=entry_data.photo_url,
        )
        return await self.food_repository.get_by_id_with_ingredients(entry.id)

    async def create_entry_with_ingredients(
        self,
        user_id: UUID,
        entry_data: FoodEntryWithIngredientsCreate,
    ) -> FoodEntryModel:
        parent_entry = await self.food_repository.create(
            user_id=user_id,
            name=entry_data.name,
            calories=entry_data.calories,
            protein=entry_data.protein,
            fat=entry_data.fat,
            carbs=entry_data.carbs,
            grams=entry_data.grams,
            photo_url=entry_data.photo_url,
        )

        for ingredient in entry_data.ingredients:
            await self.food_repository.create(
                user_id=user_id,
                parent_id=parent_entry.id,
                name=ingredient.name,
                calories=ingredient.calories,
                protein=ingredient.protein,
                fat=ingredient.fat,
                carbs=ingredient.carbs,
                grams=ingredient.grams,
            )

        return await self.food_repository.get_by_id_with_ingredients(parent_entry.id)

    async def get_entries(
        self,
        user_id: UUID,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
        page: int = 1,
        page_size: int = 20,
    ) -> FoodEntriesListResponse:
        skip = (page - 1) * page_size

        entries = await self.food_repository.get_user_entries(
            user_id=user_id,
            start_date=start_date,
            end_date=end_date,
            skip=skip,
            limit=page_size,
        )

        total = await self.food_repository.count_user_entries(
            user_id=user_id,
            start_date=start_date,
            end_date=end_date,
        )

        return FoodEntriesListResponse(
            entries=[FoodEntryResponse.model_validate(e) for e in entries],
            total=total,
            page=page,
            page_size=page_size,
        )

    async def delete_entry(self, user_id: UUID, entry_id: UUID) -> bool:
        deleted = await self.food_repository.delete_user_entry(user_id, entry_id)
        if not deleted:
            raise NotFoundException("Food entry not found")
        return True

    async def get_daily_stats(
        self,
        user_id: UUID,
        target_date: Optional[date] = None,
    ) -> DailyStatsResponse:
        if not target_date:
            target_date = datetime.now(timezone.utc).date()

        totals = await self.food_repository.get_daily_totals(user_id, target_date)

        user = await self.user_repository.get_by_id(user_id)
        calorie_goal = user.daily_calorie_norm if user else None

        remaining = None
        if calorie_goal:
            remaining = calorie_goal - totals["total_calories"]

        return DailyStatsResponse(
            date=target_date,
            total_calories=totals["total_calories"],
            total_protein=totals["total_protein"],
            total_fat=totals["total_fat"],
            total_carbs=totals["total_carbs"],
            remaining_calories=remaining,
            calorie_goal=calorie_goal,
            entries_count=totals["entries_count"],
        )

    async def get_recommendations(self, user_id: UUID) -> RecommendationResponse:
        stats = await self.get_daily_stats(user_id)

        recent_entries = await self.food_repository.get_recent_entries(user_id, days=7)
        recent_foods = [entry.name for entry in recent_entries]

        user = await self.user_repository.get_by_id(user_id)
        calorie_goal = user.daily_calorie_norm if user else None

        recommendations = await openai_service.get_recommendations(
            daily_calories=stats.total_calories,
            daily_protein=stats.total_protein,
            daily_fat=stats.total_fat,
            daily_carbs=stats.total_carbs,
            calorie_goal=calorie_goal,
            recent_foods=recent_foods,
        )

        return recommendations
