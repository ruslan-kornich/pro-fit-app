from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field


class OnboardingResponse(BaseModel):
    id: UUID
    current_step: int
    is_completed: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class OnboardingStepUpdateRequest(BaseModel):
    step: int = Field(..., ge=1, le=6)
