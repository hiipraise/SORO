from fastapi import APIRouter
from . import posts

router = APIRouter(prefix="/community", tags=["community"])
router.include_router(posts.router)
