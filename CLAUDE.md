# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ProFit is a calorie tracking app with AI-powered food photo analysis. Users can photograph meals to automatically identify foods and log nutritional information.

## Tech Stack

- **Backend**: FastAPI + SQLAlchemy (async) + PostgreSQL + Alembic
- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **AI**: OpenAI GPT-4o-mini for food photo analysis and recommendations
- **Auth**: JWT with access/refresh tokens

## Development Commands

### Backend (from `/backend`)
```bash
# Activate venv and run server
source ../venv/bin/activate
uvicorn app.main:app --reload --port 8000

# Run migrations
alembic upgrade head

# Create new migration
alembic revision --autogenerate -m "description"
```

### Frontend (from `/frontend`)
```bash
npm run dev      # Dev server on port 3000 (proxies /api to backend)
npm run build    # TypeScript check + production build
```

### Docker
```bash
docker-compose up -d   # Starts postgres, backend, frontend
```

## Architecture

### Backend Structure
- `app/routers/routes/` - API endpoints (auth, users, food)
- `app/services/` - Business logic layer (AuthService, UserService, FoodService, OpenAIService)
- `app/repositories/` - Database access layer extending `BaseRepository`
- `app/models/` - SQLAlchemy models (UserModel, FoodEntryModel)
- `app/schemas/` - Pydantic request/response schemas
- `app/config/` - Settings (from `.env`), DB connection, JWT config
- `app/utils/` - Shared utilities (BaseRepository, auth helpers, calorie calculator)

The backend follows a layered architecture: Router → Service → Repository → Model.

### Frontend Structure
- `src/pages/` - Route components (Dashboard, AddFood, History, Profile, Recommendations)
- `src/features/` - Feature modules with components and context (auth, dashboard)
- `src/components/` - Reusable UI components
- `src/api/` - API client with axios interceptors for JWT refresh
- `src/layouts/` - Page layouts (AuthLayout, MainLayout)

### Key Patterns
- Repository pattern with generic `BaseRepository<ModelType>` for CRUD operations
- Dependency injection via FastAPI's `Depends()` for DB sessions and auth
- React Context for auth state management
- Automatic token refresh on 401 responses in axios interceptor

## API Endpoints

All API routes are prefixed with `/api`:
- `/api/auth/*` - Login, register, token refresh
- `/api/users/*` - User profile, calorie goals
- `/api/food/*` - Food entries, photo analysis, recommendations

## Environment Variables

Copy `.env.example` to `.env` in project root (for docker-compose) and `backend/.env` (for local dev):
- `JWT_SECRET` - Secret key for JWT tokens
- `OPENAI_API_KEY` - Required for food photo analysis
- `ASYNC_DATABASE_URL` - PostgreSQL connection string
