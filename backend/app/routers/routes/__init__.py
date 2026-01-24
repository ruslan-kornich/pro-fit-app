from app.routers.routes.auth import router as auth_router
from app.routers.routes.food import router as food_router
from app.routers.routes.onboarding import router as onboarding_router
from app.routers.routes.users import router as users_router

__all__ = ["auth_router", "users_router", "food_router", "onboarding_router"]
