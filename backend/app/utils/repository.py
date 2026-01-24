from typing import Generic, TypeVar
from uuid import UUID

from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config.db import Base

ModelType = TypeVar("ModelType", bound=Base)


class BaseRepository(Generic[ModelType]):
    def __init__(self, model: type[ModelType], session: AsyncSession):
        self.model = model
        self.session = session

    async def create(self, **kwargs) -> ModelType:
        instance = self.model(**kwargs)
        self.session.add(instance)
        await self.session.commit()
        await self.session.refresh(instance)
        return instance

    async def get_by_id(self, entity_id: UUID) -> ModelType | None:
        result = await self.session.execute(select(self.model).where(self.model.id == entity_id))
        return result.scalar_one_or_none()

    async def get_all(self, skip: int = 0, limit: int = 100) -> list[ModelType]:
        result = await self.session.execute(select(self.model).offset(skip).limit(limit))
        return list(result.scalars().all())

    async def update(self, entity_id: UUID, **kwargs) -> ModelType | None:
        instance = await self.get_by_id(entity_id)
        if not instance:
            return None
        for key, value in kwargs.items():
            if hasattr(instance, key) and value is not None:
                setattr(instance, key, value)
        await self.session.commit()
        await self.session.refresh(instance)
        return instance

    async def delete(self, entity_id: UUID) -> bool:
        result = await self.session.execute(delete(self.model).where(self.model.id == entity_id))
        await self.session.commit()
        return result.rowcount > 0
