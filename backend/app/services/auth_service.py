from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from app.config.jwt import create_access_token, create_refresh_token, decode_token
from app.repositories.user_repository import UserRepository
from app.schemas.auth import LoginRequest, RefreshRequest, RegisterRequest, TokenResponse
from app.services.profile_service import ProfileService
from app.utils.auth import hash_password, verify_password
from app.utils.exceptions import ConflictException, UnauthorizedException


class AuthService:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.user_repository = UserRepository(session)
        self.profile_service = ProfileService(session)

    async def register(self, request: RegisterRequest) -> TokenResponse:
        if await self.user_repository.email_exists(request.email):
            raise ConflictException("Email already registered")

        hashed_password = hash_password(request.password)

        user = await self.user_repository.create(
            email=request.email,
            hashed_password=hashed_password,
        )

        await self.profile_service.create_profile(user.id)

        access_token = create_access_token({"sub": str(user.id)})
        refresh_token = create_refresh_token({"sub": str(user.id)})

        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
        )

    async def login(self, request: LoginRequest) -> TokenResponse:
        user = await self.user_repository.get_by_email(request.email)

        if not user:
            raise UnauthorizedException("Invalid email or password")

        if not verify_password(request.password, user.hashed_password):
            raise UnauthorizedException("Invalid email or password")

        access_token = create_access_token({"sub": str(user.id)})
        refresh_token = create_refresh_token({"sub": str(user.id)})

        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
        )

    async def refresh(self, request: RefreshRequest) -> TokenResponse:
        payload = decode_token(request.refresh_token)

        if payload.get("type") != "refresh":
            raise UnauthorizedException("Invalid token type")

        user_id = payload.get("sub")
        if not user_id:
            raise UnauthorizedException("Invalid token payload")

        user = await self.user_repository.get_by_id(UUID(user_id))
        if not user:
            raise UnauthorizedException("User not found")

        access_token = create_access_token({"sub": str(user.id)})
        refresh_token = create_refresh_token({"sub": str(user.id)})

        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
        )
