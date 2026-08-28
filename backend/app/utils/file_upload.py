import os
import uuid
from pathlib import Path

import aiofiles
from fastapi import UploadFile

from app.config.settings import settings

ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif", "webp"}

# Public prefix of the StaticFiles mount in app.main; it is independent of
# UPLOAD_DIR, which may point at any directory such as a mounted volume.
UPLOAD_URL_PREFIX = "/uploads"


def get_file_extension(filename: str) -> str:
    return filename.rsplit(".", 1)[-1].lower() if "." in filename else ""


def is_allowed_file(filename: str) -> bool:
    return get_file_extension(filename) in ALLOWED_EXTENSIONS


def build_upload_url(unique_filename: str, subfolder: str = "") -> str:
    parts = [UPLOAD_URL_PREFIX, subfolder, unique_filename] if subfolder else [UPLOAD_URL_PREFIX, unique_filename]
    return "/".join(parts)


def resolve_upload_path(upload_url: str) -> Path:
    """Map a public upload URL back to its location on disk."""
    relative = upload_url.removeprefix(UPLOAD_URL_PREFIX).lstrip("/")
    return Path(settings.UPLOAD_DIR) / relative


async def save_upload_file(file: UploadFile, subfolder: str = "") -> str:
    """
    Save uploaded file and return its public URL.
    """
    if not file.filename:
        raise ValueError("No filename provided")

    if not is_allowed_file(file.filename):
        raise ValueError(f"File type not allowed. Allowed types: {ALLOWED_EXTENSIONS}")

    extension = get_file_extension(file.filename)
    unique_filename = f"{uuid.uuid4()}.{extension}"

    upload_dir = Path(settings.UPLOAD_DIR)
    if subfolder:
        upload_dir = upload_dir / subfolder

    upload_dir.mkdir(parents=True, exist_ok=True)

    file_path = upload_dir / unique_filename

    async with aiofiles.open(file_path, "wb") as buffer:
        content = await file.read()
        if len(content) > settings.MAX_UPLOAD_SIZE:
            raise ValueError(f"File too large. Max size: {settings.MAX_UPLOAD_SIZE / 1024 / 1024}MB")
        await buffer.write(content)

    return build_upload_url(unique_filename, subfolder)


async def delete_upload_file(upload_url: str) -> bool:
    """Delete an uploaded file addressed by its public URL."""
    try:
        file_path = resolve_upload_path(upload_url)
        if os.path.exists(file_path):
            os.remove(file_path)
            return True
    except Exception:
        pass
    return False
