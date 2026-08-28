#!/usr/bin/env bash
# Boots nginx + FastAPI inside a single container.
set -euo pipefail

PORT="${PORT:-8080}"
BACKEND_PORT="${BACKEND_PORT:-8000}"
UPLOAD_MAX_SIZE_MB="${UPLOAD_MAX_SIZE_MB:-25}"
UPLOAD_DIR="${UPLOAD_DIR:-/data/uploads}"
UVICORN_WORKERS="${UVICORN_WORKERS:-2}"
RUN_MIGRATIONS="${RUN_MIGRATIONS:-true}"
DB_WAIT_TIMEOUT="${DB_WAIT_TIMEOUT:-180}"
DB_WAIT_INTERVAL="${DB_WAIT_INTERVAL:-3}"
MIGRATION_ATTEMPTS="${MIGRATION_ATTEMPTS:-3}"

# The platform supplies a single connection string; the app reads
# ASYNC_DATABASE_URL, so accept either name.
RAW_DATABASE_URL="${DATABASE_URL:-${ASYNC_DATABASE_URL:-}}"

if [[ -z "$RAW_DATABASE_URL" ]]; then
    echo "FATAL: DATABASE_URL is not set" >&2
    exit 1
fi

# Managed Postgres providers hand out libpq-style URLs; SQLAlchemy needs an
# explicit async driver, and asyncpg spells the TLS flag "ssl", not "sslmode".
normalize_async_url() {
    local url="$1"
    url="${url/#postgres:\/\//postgresql://}"
    if [[ "$url" != postgresql+* ]]; then
        url="${url/#postgresql:\/\//postgresql+asyncpg://}"
    fi
    url="${url//sslmode=require/ssl=require}"
    url="${url//sslmode=prefer/ssl=prefer}"
    url="${url//sslmode=disable/ssl=disable}"
    # asyncpg rejects libpq-only parameters that some providers append.
    url="$(printf '%s' "$url" | sed -E 's/[?&]channel_binding=[^&]*//g; s/[?&]options=[^&]*//g')"
    printf '%s' "$url"
}

ASYNC_DATABASE_URL="$(normalize_async_url "$RAW_DATABASE_URL")"
export ASYNC_DATABASE_URL
export UPLOAD_DIR

mkdir -p "$UPLOAD_DIR"

export PORT BACKEND_PORT UPLOAD_MAX_SIZE_MB

envsubst '${PORT} ${BACKEND_PORT} ${UPLOAD_MAX_SIZE_MB}' \
    < /etc/nginx/templates/profit.conf.template \
    > /etc/nginx/conf.d/profit.conf

nginx -t

cd /app/backend

# The database is a separate service and is not guaranteed to accept
# connections the moment this container starts: on a rolling deploy Postgres
# may still be booting, and connecting straight away kills the container with
# "Connection refused", which the platform reports as CrashLoopBackOff.
wait_for_database() {
    local deadline=$((SECONDS + DB_WAIT_TIMEOUT))
    local attempt=0

    while true; do
        attempt=$((attempt + 1))
        if python - <<'PY'
import asyncio
import os
import sys

from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy.pool import NullPool


async def probe() -> None:
    engine = create_async_engine(os.environ["ASYNC_DATABASE_URL"], poolclass=NullPool)
    try:
        async with engine.connect() as connection:
            await connection.execute(text("SELECT 1"))
    finally:
        await engine.dispose()


async def main() -> None:
    await asyncio.wait_for(probe(), timeout=10)


try:
    asyncio.run(main())
except Exception as error:
    print(error, file=sys.stderr)
    sys.exit(1)
PY
        then
            echo "==> Database is reachable (attempt ${attempt})"
            return 0
        fi

        if (( SECONDS >= deadline )); then
            echo "FATAL: database unreachable after ${DB_WAIT_TIMEOUT}s" >&2
            return 1
        fi

        echo "==> Database not ready (attempt ${attempt}), retrying in ${DB_WAIT_INTERVAL}s"
        sleep "$DB_WAIT_INTERVAL"
    done
}

wait_for_database

if [[ "$RUN_MIGRATIONS" == "true" ]]; then
    echo "==> Applying database migrations"
    for attempt in $(seq 1 "$MIGRATION_ATTEMPTS"); do
        if alembic upgrade head; then
            break
        fi
        if (( attempt == MIGRATION_ATTEMPTS )); then
            echo "FATAL: migrations failed after ${MIGRATION_ATTEMPTS} attempts" >&2
            exit 1
        fi
        echo "==> Migration attempt ${attempt} failed, retrying in ${DB_WAIT_INTERVAL}s" >&2
        sleep "$DB_WAIT_INTERVAL"
    done
fi

declare -a child_pids=()

terminate() {
    trap - TERM INT
    for pid in "${child_pids[@]}"; do
        kill -TERM "$pid" 2>/dev/null || true
    done
    wait
}
trap terminate TERM INT

echo "==> Starting FastAPI on 127.0.0.1:${BACKEND_PORT}"
uvicorn app.main:app \
    --host 127.0.0.1 \
    --port "$BACKEND_PORT" \
    --workers "$UVICORN_WORKERS" \
    --proxy-headers \
    --forwarded-allow-ips '*' &
child_pids+=("$!")

echo "==> Starting nginx on 0.0.0.0:${PORT}"
nginx -g 'daemon off;' &
child_pids+=("$!")

# Exit as soon as one of the services dies so the platform restarts the container.
wait -n "${child_pids[@]}"
exit_code=$?
echo "==> A child process exited with code ${exit_code}; shutting down" >&2
terminate
exit "$exit_code"
