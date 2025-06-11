from fastapi import APIRouter

from app.api.routes.property import router as properties_router
from app.api.routes.user import router as user_router
from app.api.routes.wishlist import router as wishlist_router
from app.api.routes.review import router as review_router
from app.api.routes.viewing import router as viewing_router
from app.api.routes.admin import router as admin_router

api_router = APIRouter()

api_router.include_router(properties_router, tags=["Properties"])
api_router.include_router(user_router, tags=["Users"])
api_router.include_router(wishlist_router, tags=["Wishlist"])
api_router.include_router(review_router, tags=["Reviews"])
api_router.include_router(viewing_router, tags=["Viewing Requests"])
api_router.include_router(admin_router, tags=["Admin"])
