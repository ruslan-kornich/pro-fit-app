from datetime import date
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.profiles import ProfileModel
from app.repositories.profile_repository import ProfileRepository
from app.repositories.weight_entry_repository import WeightEntryRepository
from app.schemas.profiles import AICalorieRecommendationResponse, ProfileUpdateRequest
from app.services.openai_service import openai_service
from app.utils.calorie_calculator import calculate_daily_calorie_norm
from app.utils.exceptions import NotFoundException


class ProfileService:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.profile_repository = ProfileRepository(session)
        self.weight_repository = WeightEntryRepository(session)

    async def get_profile(self, user_id: UUID) -> ProfileModel:
        profile = await self.profile_repository.get_by_user_id(user_id)
        if not profile:
            raise NotFoundException("Profile not found")
        return profile

    async def create_profile(self, user_id: UUID) -> ProfileModel:
        return await self.profile_repository.create_for_user(user_id)

    async def update_profile(self, user_id: UUID, request: ProfileUpdateRequest) -> ProfileModel:
        profile = await self.get_profile(user_id)

        update_data = request.model_dump(exclude_unset=True)

        old_weight = profile.weight
        weight = update_data.get("weight", profile.weight)
        height = update_data.get("height", profile.height)
        age = update_data.get("age", profile.age)
        gender = update_data.get("gender", profile.gender)
        activity_level = update_data.get("activity_level", profile.activity_level)
        goal = update_data.get("goal", profile.goal)

        is_calorie_goal_manual = update_data.get("is_calorie_goal_manual")
        provided_calorie_norm = update_data.get("daily_calorie_norm")

        if provided_calorie_norm is not None:
            daily_calorie_norm = provided_calorie_norm
            is_calorie_goal_manual = True
        elif is_calorie_goal_manual is False:
            daily_calorie_norm = calculate_daily_calorie_norm(
                weight_kg=weight,
                height_cm=height,
                age_years=age,
                gender=gender,
                activity_level=activity_level,
                goal=goal,
            )
            is_calorie_goal_manual = False
        elif profile.is_calorie_goal_manual:
            daily_calorie_norm = profile.daily_calorie_norm
        else:
            daily_calorie_norm = calculate_daily_calorie_norm(
                weight_kg=weight,
                height_cm=height,
                age_years=age,
                gender=gender,
                activity_level=activity_level,
                goal=goal,
            )
            is_calorie_goal_manual = False

        updated_profile = await self.profile_repository.update_profile(
            profile_id=profile.id,
            name=update_data.get("name"),
            height=height,
            weight=weight,
            age=age,
            gender=gender,
            activity_level=activity_level,
            language=update_data.get("language"),
            goal=update_data.get("goal"),
            daily_calorie_norm=daily_calorie_norm,
            is_calorie_goal_manual=is_calorie_goal_manual,
        )

        if not updated_profile:
            raise NotFoundException("Profile not found")

        if weight is not None and old_weight is None:
            existing_entries = await self.weight_repository.get_user_entries(user_id)
            if not existing_entries:
                await self.weight_repository.create(
                    user_id=user_id,
                    weight=weight,
                    recorded_date=date.today(),
                    note="Initial weight from profile",
                )

        return updated_profile

    async def get_ai_calorie_recommendation(self, user_id: UUID) -> AICalorieRecommendationResponse:
        profile = await self.get_profile(user_id)

        return await openai_service.get_calorie_recommendation(
            weight_kg=float(profile.weight) if profile.weight else None,
            height_cm=float(profile.height) if profile.height else None,
            age_years=profile.age,
            gender=profile.gender,
            activity_level=float(profile.activity_level) if profile.activity_level else None,
            goal=profile.goal,
            current_calorie_norm=profile.daily_calorie_norm,
            language=profile.language,
        )
