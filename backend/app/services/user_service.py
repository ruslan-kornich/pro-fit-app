from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.user_repository import UserRepository
from app.models.users import UserModel
from app.schemas.users import UserUpdateRequest
from app.utils.exceptions import NotFoundException
from app.utils.calorie_calculator import calculate_daily_calorie_norm


class UserService:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.user_repository = UserRepository(session)

    async def get_user(self, user_id: UUID) -> UserModel:
        user = await self.user_repository.get_by_id(user_id)
        if not user:
            raise NotFoundException("User not found")
        return user

    async def update_user(self, user_id: UUID, request: UserUpdateRequest) -> UserModel:
        user = await self.get_user(user_id)

        update_data = request.model_dump(exclude_unset=True)

        weight = update_data.get("weight", user.weight)
        height = update_data.get("height", user.height)
        age = update_data.get("age", user.age)
        gender = update_data.get("gender", user.gender)
        activity_level = update_data.get("activity_level", user.activity_level)

        daily_calorie_norm = calculate_daily_calorie_norm(
            weight_kg=weight,
            height_cm=height,
            age_years=age,
            gender=gender,
            activity_level=activity_level,
        )

        updated_user = await self.user_repository.update_profile(
            user_id=user_id,
            name=update_data.get("name"),
            height=height,
            weight=weight,
            age=age,
            gender=gender,
            activity_level=activity_level,
            daily_calorie_norm=daily_calorie_norm,
        )

        if not updated_user:
            raise NotFoundException("User not found")

        return updated_user
