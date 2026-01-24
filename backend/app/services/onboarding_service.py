from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.onboarding import OnboardingModel
from app.repositories.onboarding_repository import OnboardingRepository
from app.schemas.onboarding import OnboardingStepUpdateRequest
from app.utils.exceptions import BadRequestException, NotFoundException


class OnboardingService:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.onboarding_repository = OnboardingRepository(session)

    async def get_or_create_onboarding(self, user_id: UUID) -> OnboardingModel:
        onboarding = await self.onboarding_repository.get_by_user_id(user_id)
        if not onboarding:
            onboarding = await self.onboarding_repository.create_for_user(user_id)
        return onboarding

    async def update_step(self, user_id: UUID, request: OnboardingStepUpdateRequest) -> OnboardingModel:
        onboarding = await self.get_or_create_onboarding(user_id)

        if onboarding.is_completed:
            raise BadRequestException("Onboarding already completed")

        updated_onboarding = await self.onboarding_repository.update_step(
            onboarding_id=onboarding.id,
            step=request.step,
        )

        if not updated_onboarding:
            raise NotFoundException("Onboarding not found")

        return updated_onboarding

    async def complete_onboarding(self, user_id: UUID) -> OnboardingModel:
        onboarding = await self.get_or_create_onboarding(user_id)

        if onboarding.is_completed:
            raise BadRequestException("Onboarding already completed")

        completed_onboarding = await self.onboarding_repository.complete(onboarding.id)
        if not completed_onboarding:
            raise NotFoundException("Onboarding not found")

        return completed_onboarding
