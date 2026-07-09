from typing import Optional
from fastapi import APIRouter, Depends, Request
from pydantic import BaseModel, ConfigDict

from app.models.reflection import Reflection
from app.services.ai_service import get_reflection
from app.api.deps import get_current_user_id
from app.core.rate_limit import limiter

router = APIRouter(prefix="/reflect", tags=["reflect"])


class ReflectRequest(BaseModel):
    mood_state: str
    vent_text: Optional[str] = None


class ReflectResponse(BaseModel):
    model_config = ConfigDict(protected_namespaces=())

    reflection: str
    model_used: str


@router.get("/")
async def list_reflections(user_id: str = Depends(get_current_user_id)):
    """Get recent reflections for the current user, most recent first."""
    reflections = (
        await Reflection.find(Reflection.user_id == user_id)
        .sort(-Reflection.created_at)
        .limit(10)
        .to_list()
    )

    return [
        {
            "id": str(r.id),
            "content": r.ai_response[:300] + ("..." if len(r.ai_response) > 300 else ""),
            "model_used": r.model_used,
            "created_at": r.created_at.isoformat(),
        }
        for r in reflections
    ]


@router.post("/", response_model=ReflectResponse)
@limiter.limit("3/minute")
async def create_reflection(
    req: ReflectRequest,
    request: Request,
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
