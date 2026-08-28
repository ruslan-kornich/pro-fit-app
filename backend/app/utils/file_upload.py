import uuid
from pathlib import PurePosixPath

from fastapi import UploadFile

from app.config.settings import settings
from app.utils.storage import get_storage

ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif", "webp"}

# Public prefix of the upload route in app.main. It is independent of the
# storage backend so stored URLs survive a move between disk and a bucket.
UPLOAD_URL_PREFIX = "/uploads"


def get_file_extension(filename: str) -> str:
    return filename.rsplit(".", 1)[-1].lower() if "." in filename else ""


def is_allowed_file(filename: str) -> bool:
    return get_file_extension(filename) in ALLOWED_EXTENSIONS


def build_upload_url(key: str) -> str:
    return f"{UPLOAD_URL_PREFIX}/{key}"


def url_to_key(upload_url: str) -> str:
    """Map a public upload URL back to its storage key."""
    return upload_url.removeprefix(UPLOAD_URL_PREFIX).lstrip("/")


def is_safe_key(key: str) -> bool:
    """Reject keys that could escape the storage root."""
    return bool(key) and ".." not in PurePosixPath(key).parts and not key.startswith("/")


async def save_upload_file(file: UploadFile, subfolder: str = "") -> str:
    """
    Save uploaded file and return its public URL.
    """
    if not file.filename:
        raise ValueError("No filename provided")

    if not is_allowed_file(file.filename):
        raise ValueError(f"File type not allowed. Allowed types: {ALLOWED_EXTENSIONS}")

    content = await file.read()
    if len(content) > settings.MAX_UPLOAD_SIZE:
        raise ValueError(f"File too large. Max size: {settings.MAX_UPLOAD_SIZE / 1024 / 1024}MB")

    extension = get_file_extension(file.filename)
    unique_filename = f"{uuid.uuid4()}.{extension}"
    key = f"{subfolder}/{unique_filename}" if subfolder else unique_filename

    await get_storage().save(key, content)

    return build_upload_url(key)


async def delete_upload_file(upload_url: str) -> bool:
    """Delete an uploaded file addressed by its public URL."""
    key = url_to_key(upload_url)
    if not is_safe_key(key):
        return False
    return await get_storage().delete(key)
