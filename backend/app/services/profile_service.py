from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.profile_repository import ProfileRepository
from app.models.profiles import ProfileModel
from app.schemas.profiles import ProfileUpdateRequest
from app.utils.exceptions import NotFoundException
from app.utils.calorie_calculator import calculate_daily_calorie_norm


class ProfileService:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.profile_repository = ProfileRepository(session)

    async def get_profile(self, user_id: UUID) -> ProfileModel:
        profile = await self.profile_repository.get_by_user_id(user_id)
        if not profile:
            raise NotFoundException("Profile not found")
        return profile

    async def create_profile(self, user_id: UUID) -> ProfileModel:
        return await self.profile_repository.create_for_user(user_id)

    async def update_profile(
        self, user_id: UUID, request: ProfileUpdateRequest
    ) -> ProfileModel:
        profile = await self.get_profile(user_id)

        update_data = request.model_dump(exclude_unset=True)

        weight = update_data.get("weight", profile.weight)
        height = update_data.get("height", profile.height)
        age = update_data.get("age", profile.age)
        gender = update_data.get("gender", profile.gender)
        activity_level = update_data.get("activity_level", profile.activity_level)
        goal = update_data.get("goal", profile.goal)

        daily_calorie_norm = calculate_daily_calorie_norm(
            weight_kg=weight,
            height_cm=height,
            age_years=age,
            gender=gender,
            activity_level=activity_level,
            goal=goal,
        )

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
        )

        if not updated_profile:
            raise NotFoundException("Profile not found")

        return updated_profile
