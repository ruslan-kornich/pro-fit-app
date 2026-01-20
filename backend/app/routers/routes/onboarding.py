from uuid import UUID
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.config.db import get_db
from app.config.jwt import get_current_user_id
from app.services.onboarding_service import OnboardingService
from app.schemas.onboarding import OnboardingResponse, OnboardingStepUpdateRequest


router = APIRouter(prefix="/onboarding", tags=["Onboarding"])


@router.get("", response_model=OnboardingResponse)
async def get_onboarding(
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    service = OnboardingService(db)
    onboarding = await service.get_or_create_onboarding(UUID(user_id))
    return OnboardingResponse.model_validate(onboarding)


@router.patch("/step", response_model=OnboardingResponse)
async def update_onboarding_step(
    request: OnboardingStepUpdateRequest,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    service = OnboardingService(db)
    onboarding = await service.update_step(UUID(user_id), request)
    return OnboardingResponse.model_validate(onboarding)


@router.post("/complete", response_model=OnboardingResponse)
async def complete_onboarding(
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    service = OnboardingService(db)
    onboarding = await service.complete_onboarding(UUID(user_id))
    return OnboardingResponse.model_validate(onboarding)
