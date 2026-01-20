from typing import Optional, Literal, List
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, Field, field_validator


class ProfileResponse(BaseModel):
    id: UUID
    name: Optional[str] = None
    height: Optional[float] = None
    weight: Optional[float] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    activity_level: Optional[float] = None
    language: str
    goal: str
    daily_calorie_norm: Optional[int] = None
    is_calorie_goal_manual: bool = False
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ProfileUpdateRequest(BaseModel):
    name: Optional[str] = None
    height: Optional[float] = None
    weight: Optional[float] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    activity_level: Optional[float] = None
    language: Optional[Literal["uk", "en"]] = None
    goal: Optional[Literal["lose", "maintain", "gain"]] = None
    daily_calorie_norm: Optional[int] = Field(None, ge=500, le=10000)
    is_calorie_goal_manual: Optional[bool] = None

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
    personalized_tips: List[str]
    factors_considered: List[str]
