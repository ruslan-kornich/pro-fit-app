"""File storage backends for user uploads.

The container filesystem is ephemeral, so production stores uploads in an
S3-compatible bucket. Local development keeps writing to a directory.
"""

import logging
import mimetypes
from abc import ABC, abstractmethod
from functools import lru_cache
from pathlib import Path

import boto3
from botocore.config import Config
from botocore.exceptions import ClientError
from starlette.concurrency import run_in_threadpool

from app.config.settings import settings

logger = logging.getLogger(__name__)


def guess_content_type(key: str) -> str:
    return mimetypes.guess_type(key)[0] or "application/octet-stream"


class FileStorage(ABC):
    @abstractmethod
    async def save(self, key: str, content: bytes) -> None: ...

    @abstractmethod
    async def delete(self, key: str) -> bool: ...

    @abstractmethod
    def url_for(self, key: str) -> str | None:
        """Absolute URL of the object, or None when it has to be streamed by the app."""

    def local_path(self, key: str) -> Path | None:  # noqa: ARG002
        return None


class LocalFileStorage(FileStorage):
    def __init__(self, root: str) -> None:
        self.root = Path(root)

    async def save(self, key: str, content: bytes) -> None:
        path = self.root / key
        path.parent.mkdir(parents=True, exist_ok=True)
        await run_in_threadpool(path.write_bytes, content)

    async def delete(self, key: str) -> bool:
        path = self.root / key
        if not path.is_file():
            return False
        await run_in_threadpool(path.unlink)
        return True

    def url_for(self, key: str) -> str | None:  # noqa: ARG002
        return None

    def local_path(self, key: str) -> Path | None:
        return self.root / key


class S3FileStorage(FileStorage):
    def __init__(self) -> None:
        self.bucket = settings.S3_BUCKET
        self.public_base_url = settings.S3_PUBLIC_BASE_URL.rstrip("/")
        self.client = boto3.client(
            "s3",
            endpoint_url=settings.S3_ENDPOINT_URL or None,
            aws_access_key_id=settings.S3_ACCESS_KEY_ID or None,
            aws_secret_access_key=settings.S3_SECRET_ACCESS_KEY or None,
            region_name=settings.S3_REGION,
            config=Config(
                s3={"addressing_style": settings.S3_ADDRESSING_STYLE},
                # S3-compatible providers reject botocore's default aws-chunked
                # streaming checksums with "MissingContentLength".
                request_checksum_calculation="when_required",
                response_checksum_validation="when_required",
            ),
        )

    async def save(self, key: str, content: bytes) -> None:
        await run_in_threadpool(
            lambda: self.client.put_object(
                Bucket=self.bucket,
                Key=key,
                Body=content,
                ContentType=guess_content_type(key),
                CacheControl="public, max-age=31536000, immutable",
            )
        )

    async def delete(self, key: str) -> bool:
        try:
            await run_in_threadpool(lambda: self.client.delete_object(Bucket=self.bucket, Key=key))
        except ClientError as error:
            logger.warning("Failed to delete %s from bucket %s: %s", key, self.bucket, error)
            return False
        return True

    def url_for(self, key: str) -> str:
        if self.public_base_url:
            return f"{self.public_base_url}/{key}"
        return self.client.generate_presigned_url(
            "get_object",
            Params={"Bucket": self.bucket, "Key": key},
            ExpiresIn=settings.S3_PRESIGNED_URL_TTL,
        )


@lru_cache
def get_storage() -> FileStorage:
    if settings.S3_BUCKET:
        return S3FileStorage()
    return LocalFileStorage(settings.UPLOAD_DIR)
