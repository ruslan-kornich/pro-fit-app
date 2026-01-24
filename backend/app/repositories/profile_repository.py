from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.profiles import ProfileModel
from app.utils.repository import BaseRepository


class ProfileRepository(BaseRepository[ProfileModel]):
    def __init__(self, session: AsyncSession):
        super().__init__(ProfileModel, session)

    async def get_by_user_id(self, user_id: UUID) -> ProfileModel | None:
        result = await self.session.execute(select(ProfileModel).where(ProfileModel.user_id == user_id))
        return result.scalar_one_or_none()

    async def create_for_user(self, user_id: UUID, **kwargs) -> ProfileModel:
        return await self.create(user_id=user_id, **kwargs)

    async def update_profile(
        self,
        profile_id: UUID,
        name: str | None = None,
        height: float | None = None,
        weight: float | None = None,
        age: int | None = None,
        gender: str | None = None,
        activity_level: float | None = None,
        language: str | None = None,
        goal: str | None = None,
        daily_calorie_norm: int | None = None,
        is_calorie_goal_manual: bool | None = None,
    ) -> ProfileModel | None:
        return await self.update(
            profile_id,
            name=name,
            height=height,
            weight=weight,
            age=age,
            gender=gender,
            activity_level=activity_level,
            language=language,
            goal=goal,
            daily_calorie_norm=daily_calorie_norm,
            is_calorie_goal_manual=is_calorie_goal_manual,
        )
