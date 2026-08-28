from functools import lru_cache

from pydantic_settings import BaseSettings


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

    # Uploads go to an S3-compatible bucket when S3_BUCKET is set, otherwise
    # to UPLOAD_DIR on the local filesystem.
    S3_BUCKET: str = ""
    S3_ENDPOINT_URL: str = ""
    S3_ACCESS_KEY_ID: str = ""
    S3_SECRET_ACCESS_KEY: str = ""
    S3_REGION: str = "us-east-1"
    S3_ADDRESSING_STYLE: str = "path"
    # Set for a public bucket to serve stable, cacheable URLs; when empty the
    # app hands out short-lived presigned URLs instead.
    S3_PUBLIC_BASE_URL: str = ""
    S3_PRESIGNED_URL_TTL: int = 3600

    class Config:
        env_file = ".env"
        extra = "ignore"


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
