from uuid import UUID
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.config.db import get_db
from app.config.jwt import get_current_user_id
from app.services.user_service import UserService
from app.services.profile_service import ProfileService
from app.schemas.users import UserResponse, UserUpdateRequest
from app.schemas.profiles import AICalorieRecommendationResponse


router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/me", response_model=UserResponse)
async def get_current_user(
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    service = UserService(db)
    user = await service.get_user(UUID(user_id))
    return UserResponse.model_validate(user)


@router.patch("/me", response_model=UserResponse)
async def update_current_user(
    request: UserUpdateRequest,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    service = UserService(db)
    user = await service.update_user(UUID(user_id), request)
    return UserResponse.model_validate(user)


@router.get("/me/ai-calorie-recommendation", response_model=AICalorieRecommendationResponse)
async def get_ai_calorie_recommendation(
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    service = ProfileService(db)
    return await service.get_ai_calorie_recommendation(UUID(user_id))
