from fastapi import APIRouter
from . import debts, goals

router = APIRouter(prefix="/finance", tags=["finance"])
router.include_router(debts.router)
router.include_router(goals.router)
