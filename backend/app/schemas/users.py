from typing import Optional, Literal
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, EmailStr

from app.schemas.profiles import ProfileResponse


class UserResponse(BaseModel):
    id: UUID
    email: EmailStr
    profile: Optional[ProfileResponse] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class UserUpdateRequest(BaseModel):
    name: Optional[str] = None
    height: Optional[float] = None
    weight: Optional[float] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    activity_level: Optional[float] = None
    language: Optional[Literal["uk", "en"]] = None
    goal: Optional[Literal["lose", "maintain", "gain"]] = None
