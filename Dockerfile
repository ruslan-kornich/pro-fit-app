# syntax=docker/dockerfile:1
#
# Single-container image for ProFit:
#   nginx (public port ${PORT})
#     /api/*      -> FastAPI backend (127.0.0.1:8000)
#     /uploads/*  -> FastAPI backend (user meal photos)
#     /           -> React PWA (static files built by Vite)
#
# The database is external and supplied through DATABASE_URL.

# ---------------------------------------------------------------------------
# 1. Frontend (Vite + React PWA) -> static files
# ---------------------------------------------------------------------------
FROM node:20-bookworm-slim AS frontend-builder

WORKDIR /build/frontend

COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci

COPY frontend/ ./

# The API client uses relative URLs, so nothing host-specific is baked in.
ENV NODE_ENV=production
RUN npm run build

# ---------------------------------------------------------------------------
# 2. Backend dependencies -> virtualenv
# ---------------------------------------------------------------------------
FROM python:3.11-slim-bookworm AS backend-builder

RUN apt-get update \
    && apt-get install -y --no-install-recommends gcc libc6-dev \
    && rm -rf /var/lib/apt/lists/*

ENV PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:${PATH}"

COPY backend/requirements.txt /tmp/requirements.txt
RUN pip install --upgrade pip \
    && pip install -r /tmp/requirements.txt

# ---------------------------------------------------------------------------
# 3. Runtime
# ---------------------------------------------------------------------------
FROM python:3.11-slim-bookworm AS runtime

RUN apt-get update \
    && apt-get install -y --no-install-recommends nginx gettext-base curl ca-certificates \
    && rm -rf /var/lib/apt/lists/* \
    && rm -f /etc/nginx/sites-enabled/default \
    && ln -sf /dev/stdout /var/log/nginx/access.log \
    && ln -sf /dev/stderr /var/log/nginx/error.log

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PATH="/opt/venv/bin:${PATH}"

# Backend: virtualenv + application code
COPY --from=backend-builder /opt/venv /opt/venv
COPY backend/ /app/backend/

# Frontend: static bundle served directly by nginx
COPY --from=frontend-builder /build/frontend/dist /srv/www

COPY deploy/nginx.conf.template /etc/nginx/templates/profit.conf.template
COPY deploy/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

# Meal photos live outside the image so a persistent volume can be mounted here.
RUN mkdir -p /data/uploads

# Internal ports (only nginx is exposed publicly).
ENV BACKEND_PORT=8000 \
    PORT=8080 \
    UPLOAD_DIR=/data/uploads \
    UPLOAD_MAX_SIZE_MB=25

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
    CMD curl -fsS "http://127.0.0.1:${PORT}/health" || exit 1

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
