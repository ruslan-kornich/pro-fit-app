from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    PROJECT_NAME: str = "ProFit API"
    API_PREFIX: str = "/api"

    ASYNC_DATABASE_URL: str = "postgresql+asyncpg://admin:admin@localhost:5432/profit"

    JWT_SECRET: str = "your-secret-key-change-in-production"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    OPENAI_API_KEY: str = ""
    OPENAI_VISION_MODEL: str = "gpt-4o"
    OPENAI_CHAT_MODEL: str = "gpt-4o-mini"

    USDA_API_KEY: str = "GD3XPe1zDwgG3pq9q3KaQXYjYnQwsqUA5LhXIh7E"
    USDA_API_URL: str = "https://api.nal.usda.gov/fdc/v1/foods/search"

    UPLOAD_DIR: str = "uploads"
    MAX_UPLOAD_SIZE: int = 10 * 1024 * 1024  # 10MB

    class Config:
        env_file = ".env"
        extra = "ignore"


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
