from typing import Optional
from uuid import UUID
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.onboarding import OnboardingModel
from app.utils.repository import BaseRepository


class OnboardingRepository(BaseRepository[OnboardingModel]):
    def __init__(self, session: AsyncSession):
        super().__init__(OnboardingModel, session)

    async def get_by_user_id(self, user_id: UUID) -> Optional[OnboardingModel]:
        result = await self.session.execute(
            select(OnboardingModel).where(OnboardingModel.user_id == user_id)
        )
        return result.scalar_one_or_none()

    async def create_for_user(self, user_id: UUID) -> OnboardingModel:
        return await self.create(user_id=user_id, current_step=1)

    async def update_step(self, onboarding_id: UUID, step: int) -> Optional[OnboardingModel]:
        return await self.update(onboarding_id, current_step=step)

    async def complete(self, onboarding_id: UUID) -> Optional[OnboardingModel]:
        return await self.update(onboarding_id, is_completed=True)
