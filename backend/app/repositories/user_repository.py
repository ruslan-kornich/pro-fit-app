from typing import Optional
from uuid import UUID
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.users import UserModel
from app.utils.repository import BaseRepository


class UserRepository(BaseRepository[UserModel]):
    def __init__(self, session: AsyncSession):
        super().__init__(UserModel, session)

    async def get_by_email(self, email: str) -> Optional[UserModel]:
        result = await self.session.execute(
            select(UserModel).where(UserModel.email == email)
        )
        return result.scalar_one_or_none()

    async def email_exists(self, email: str) -> bool:
        user = await self.get_by_email(email)
        return user is not None

    async def update_profile(
        self,
        user_id: UUID,
        name: Optional[str] = None,
        height: Optional[float] = None,
        weight: Optional[float] = None,
        age: Optional[int] = None,
        gender: Optional[str] = None,
        activity_level: Optional[float] = None,
        daily_calorie_norm: Optional[int] = None,
    ) -> Optional[UserModel]:
        return await self.update(
            user_id,
            name=name,
            height=height,
            weight=weight,
            age=age,
            gender=gender,
            activity_level=activity_level,
            daily_calorie_norm=daily_calorie_norm,
        )
