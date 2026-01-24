import os
import uuid
from pathlib import Path

import aiofiles
from fastapi import UploadFile

from app.config.settings import settings

ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif", "webp"}


def get_file_extension(filename: str) -> str:
    return filename.rsplit(".", 1)[-1].lower() if "." in filename else ""


def is_allowed_file(filename: str) -> bool:
    return get_file_extension(filename) in ALLOWED_EXTENSIONS


async def save_upload_file(file: UploadFile, subfolder: str = "") -> str:
    """
    Save uploaded file and return the relative path.
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

    relative_path = "/" + str(file_path)
    return relative_path


async def delete_upload_file(file_path: str) -> bool:
    """Delete an uploaded file."""
    try:
        if os.path.exists(file_path):
            os.remove(file_path)
            return True
    except Exception:
        pass
    return False
