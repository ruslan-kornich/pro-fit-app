from datetime import datetime
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, Field, field_validator


class ProfileResponse(BaseModel):
    id: UUID
    name: str | None = None
    height: float | None = None
    weight: float | None = None
    age: int | None = None
    gender: str | None = None
    activity_level: float | None = None
    language: str
    goal: str
    daily_calorie_norm: int | None = None
    is_calorie_goal_manual: bool = False
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ProfileUpdateRequest(BaseModel):
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

    @field_validator("language", mode="before")
    @classmethod
    def validate_language(cls, value):
        if value is not None and value not in ("uk", "en"):
            raise ValueError("Language must be 'uk' or 'en'")
        return value

    @field_validator("goal", mode="before")
    @classmethod
    def validate_goal(cls, value):
        if value is not None and value not in ("lose", "maintain", "gain"):
            raise ValueError("Goal must be 'lose', 'maintain', or 'gain'")
        return value


class AICalorieRecommendationResponse(BaseModel):
    recommended_calories_min: int
    recommended_calories_max: int
    recommended_calories_optimal: int
    explanation: str
    personalized_tips: list[str]
    factors_considered: list[str]
