from datetime import date
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.profile_repository import ProfileRepository
from app.repositories.weight_entry_repository import WeightEntryRepository
from app.schemas.weight import (
    WeightEntryCreate,
    WeightEntryResponse,
    WeightHistoryResponse,
)
from app.utils.exceptions import BadRequestException, NotFoundException


class WeightService:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.weight_repository = WeightEntryRepository(session)
        self.profile_repository = ProfileRepository(session)

    async def create_entry(
        self,
        user_id: UUID,
        entry_data: WeightEntryCreate,
    ) -> WeightEntryResponse:
        existing = await self.weight_repository.get_by_date(user_id, entry_data.recorded_date)
        if existing:
            raise BadRequestException(f"Weight entry already exists for {entry_data.recorded_date}")

        entry = await self.weight_repository.create(
            user_id=user_id,
            weight=entry_data.weight,
            recorded_date=entry_data.recorded_date,
            note=entry_data.note,
        )

        latest = await self.weight_repository.get_latest(user_id)
        if latest and latest.id == entry.id:
            await self.profile_repository.update_by_user_id(user_id, weight=entry_data.weight)

        return WeightEntryResponse.model_validate(entry)

    async def get_history(
        self,
        user_id: UUID,
        start_date: date | None = None,
        end_date: date | None = None,
    ) -> WeightHistoryResponse:
        entries = await self.weight_repository.get_user_entries(user_id, start_date, end_date)

        start_weight = None
        current_weight = None
        weight_change = None

        if entries:
            current_weight = float(entries[0].weight)
            start_weight = float(entries[-1].weight)
            weight_change = round(current_weight - start_weight, 2)

        return WeightHistoryResponse(
            entries=[WeightEntryResponse.model_validate(e) for e in entries],
            total=len(entries),
            start_weight=start_weight,
            current_weight=current_weight,
            weight_change=weight_change,
        )

    async def delete_entry(self, user_id: UUID, entry_id: UUID) -> bool:
        deleted = await self.weight_repository.delete_user_entry(user_id, entry_id)
        if not deleted:
            raise NotFoundException("Weight entry not found")
        return True
