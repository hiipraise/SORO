from typing import Optional
from fastapi import APIRouter, Depends
from pydantic import BaseModel, ConfigDict

from app.models.checkin import CheckIn
from app.models.reflection import Reflection
from app.services.ai_service import get_reflection
from app.api.deps import get_current_user_id

router = APIRouter(prefix="/reflect", tags=["reflect"])


class ReflectRequest(BaseModel):
    mood_state: str
    vent_text: Optional[str] = None


class ReflectResponse(BaseModel):
    model_config = ConfigDict(protected_namespaces=())

    reflection: str
    model_used: str


@router.post("/", response_model=ReflectResponse)
async def create_reflection(
    req: ReflectRequest,
    user_id: str = Depends(get_current_user_id),
):
    """Generate an AI reflection for the given mood and optional vent text."""
    response_text, model_used = await get_reflection(req.mood_state, req.vent_text or "")

    # Save reflection if we have a check-in context
    # (We don't have a checkin_id here, but we store it anyway)
    reflection = Reflection(
        checkin_id="",  # Will be linked in subsequent calls
        user_id=user_id,
        ai_response=response_text,
        model_used=model_used,
    )
    await reflection.insert()

    return ReflectResponse(reflection=response_text, model_used=model_used)
