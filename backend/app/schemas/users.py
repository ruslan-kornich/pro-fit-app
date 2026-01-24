from datetime import datetime
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field

from app.schemas.onboarding import OnboardingResponse
from app.schemas.profiles import ProfileResponse


class UserResponse(BaseModel):
    id: UUID
    email: EmailStr
    profile: ProfileResponse | None = None
    onboarding: OnboardingResponse | None = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class UserUpdateRequest(BaseModel):
    name: str | None = None
    height: float | None = None
    weight: float | None = None
    age: int | None = None
    gender: str | None = None
    activity_level: float | None = None
    language: Literal["uk", "en"] | None = None
    goal: Literal["lose", "maintain", "gain"] | None = None
    daily_calorie_norm: int | None = Field(None, ge=500, le=10000)
    is_calorie_goal_manual: bool | None = None
