from typing import Optional
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel

from app.models.checkin import CheckIn
from app.api.deps import get_current_user_id

router = APIRouter(prefix="/checkins", tags=["checkins"])


class CreateCheckinRequest(BaseModel):
    mood_state: str  # "at_limit" | "managing" | "mixed" | "okay" | "good"
    vent_text: Optional[str] = None


@router.get("/")
async def list_checkins(user_id: str = Depends(get_current_user_id)):
    """Get all check-ins for the current user."""
    checkins = (
        await CheckIn.find(CheckIn.user_id == user_id)
        .sort(-CheckIn.created_at)
        .to_list()
    )

    return [
        {
            "id": str(c.id),
            "mood_state": c.mood_state,
            "vent_text": c.vent_text,
            "created_at": c.created_at.isoformat(),
        }
        for c in checkins
    ]


@router.get("/{checkin_id}")
async def get_checkin(checkin_id: str, user_id: str = Depends(get_current_user_id)):
    """Get a single check-in."""
    checkin = await CheckIn.get(checkin_id)
    if not checkin or checkin.user_id != user_id:
        raise HTTPException(status_code=404, detail="Check-in not found")

    return {
        "id": str(checkin.id),
        "mood_state": checkin.mood_state,
        "vent_text": checkin.vent_text,
        "created_at": checkin.created_at.isoformat(),
    }


@router.post("/")
async def create_checkin(
    req: CreateCheckinRequest,
    user_id: str = Depends(get_current_user_id),
):
    """Create a new check-in."""
    valid_moods = {"at_limit", "managing", "mixed", "okay", "good"}
    if req.mood_state not in valid_moods:
        raise HTTPException(status_code=400, detail=f"Invalid mood state. Must be one of: {', '.join(valid_moods)}")

    checkin = CheckIn(
        user_id=user_id,
        mood_state=req.mood_state,
        vent_text=req.vent_text,
    )
    await checkin.insert()

    return {
        "id": str(checkin.id),
        "mood_state": checkin.mood_state,
        "vent_text": checkin.vent_text,
        "created_at": checkin.created_at.isoformat(),
    }
