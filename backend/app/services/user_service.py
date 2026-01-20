from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.user_repository import UserRepository
from app.services.profile_service import ProfileService
from app.models.users import UserModel
from app.schemas.users import UserUpdateRequest
from app.schemas.profiles import ProfileUpdateRequest
from app.utils.exceptions import NotFoundException


class UserService:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.user_repository = UserRepository(session)
        self.profile_service = ProfileService(session)

    async def get_user(self, user_id: UUID) -> UserModel:
        user = await self.user_repository.get_by_id(user_id)
        if not user:
            raise NotFoundException("User not found")
        return user

    async def update_user(self, user_id: UUID, request: UserUpdateRequest) -> UserModel:
        user = await self.get_user(user_id)

        profile_update = ProfileUpdateRequest(
            name=request.name,
            height=request.height,
            weight=request.weight,
            age=request.age,
            gender=request.gender,
            activity_level=request.activity_level,
            language=request.language,
            goal=request.goal,
            daily_calorie_norm=request.daily_calorie_norm,
            is_calorie_goal_manual=request.is_calorie_goal_manual,
        )

        await self.profile_service.update_profile(user_id, profile_update)

        return await self.get_user(user_id)
