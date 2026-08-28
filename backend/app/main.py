import logging
import os
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, RedirectResponse

from app.config.settings import settings
from app.utils.file_upload import is_safe_key
from app.utils.storage import get_storage

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
from app.routers import (  # noqa: E402
    auth_router,
    food_router,
    onboarding_router,
    statistics_router,
    users_router,
    weight_router,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    if not settings.S3_BUCKET:
        os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    yield


app = FastAPI(
    title=settings.PROJECT_NAME,
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix=settings.API_PREFIX)
app.include_router(users_router, prefix=settings.API_PREFIX)
app.include_router(food_router, prefix=settings.API_PREFIX)
app.include_router(onboarding_router, prefix=settings.API_PREFIX)
app.include_router(weight_router, prefix=settings.API_PREFIX)
app.include_router(statistics_router, prefix=settings.API_PREFIX)


@app.get("/uploads/{key:path}", name="uploads")
async def serve_upload(key: str):
    """Serve an upload from whichever backend stored it.

    Entries keep an app-relative photo_url, so rows written before the move to
    object storage still resolve after it.
    """
    if not is_safe_key(key):
        raise HTTPException(status_code=404, detail="Not found")

    storage = get_storage()

    url = storage.url_for(key)
    if url:
        return RedirectResponse(url, status_code=307)

    path = storage.local_path(key)
    if path is None or not path.is_file():
        raise HTTPException(status_code=404, detail="Not found")
    return FileResponse(path)


@app.get("/health")
async def health_check():
    return {"status": "healthy"}
