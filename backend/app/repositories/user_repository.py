from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.users import UserModel
from app.utils.repository import BaseRepository


class UserRepository(BaseRepository[UserModel]):
    def __init__(self, session: AsyncSession):
        super().__init__(UserModel, session)

    async def get_by_id(self, entity_id: UUID) -> UserModel | None:
        result = await self.session.execute(
            select(UserModel).options(selectinload(UserModel.profile)).where(UserModel.id == entity_id)
        )
        return result.scalar_one_or_none()

    async def get_by_email(self, email: str) -> UserModel | None:
        result = await self.session.execute(
            select(UserModel).options(selectinload(UserModel.profile)).where(UserModel.email == email)
        )
        return result.scalar_one_or_none()

    async def email_exists(self, email: str) -> bool:
        user = await self.get_by_email(email)
        return user is not None
