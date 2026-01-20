from typing import Optional
from uuid import UUID
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.profiles import ProfileModel
from app.utils.repository import BaseRepository


class ProfileRepository(BaseRepository[ProfileModel]):
    def __init__(self, session: AsyncSession):
        super().__init__(ProfileModel, session)

    async def get_by_user_id(self, user_id: UUID) -> Optional[ProfileModel]:
        result = await self.session.execute(
            select(ProfileModel).where(ProfileModel.user_id == user_id)
        )
        return result.scalar_one_or_none()

    async def create_for_user(self, user_id: UUID, **kwargs) -> ProfileModel:
        return await self.create(user_id=user_id, **kwargs)

    async def update_profile(
        self,
        profile_id: UUID,
        name: Optional[str] = None,
        height: Optional[float] = None,
        weight: Optional[float] = None,
        age: Optional[int] = None,
        gender: Optional[str] = None,
        activity_level: Optional[float] = None,
        language: Optional[str] = None,
        goal: Optional[str] = None,
        daily_calorie_norm: Optional[int] = None,
    ) -> Optional[ProfileModel]:
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
        )
