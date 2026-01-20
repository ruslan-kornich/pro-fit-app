from typing import Optional, Literal
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, field_validator


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
