from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel

from app.models.user import User
from app.api.deps import get_current_user_id, get_or_404
from app.core.config import get_settings

cfg = get_settings()

router = APIRouter(tags=["settings"])


class UpdateSettingsRequest(BaseModel):
    email: Optional[str] = None
    notification_anchor: Optional[bool] = None
    notification_reminder: Optional[bool] = None


@router.get("/crisis-info")
async def get_crisis_info():
    """Return crisis helpline info from backend config (no auth required)."""
    return {
        "number": cfg.crisis_number,
        "organization": cfg.crisis_organization,
    }


@router.get("/settings")
async def get_settings(user_id: str = Depends(get_current_user_id)):
    """Get user settings."""
    user = await get_or_404(User, user_id, "User not found")

    return {
        "id": str(user.id),
        "email": user.email,
        "is_anonymous": user.is_anonymous,
        "notification_anchor": user.notification_anchor,
        "notification_reminder": user.notification_reminder,
        "created_at": user.created_at.isoformat(),
    }


@router.patch("/settings")
async def update_settings(
    req: UpdateSettingsRequest,
    user_id: str = Depends(get_current_user_id),
):
    """Update user settings."""
    user = await get_or_404(User, user_id, "User not found")

    if req.email is not None and req.email != user.email:
        existing = await User.find_one({"email": req.email})
        if existing:
            raise HTTPException(status_code=409, detail="Email already in use")
        user.email = req.email
    if req.notification_anchor is not None:
        user.notification_anchor = req.notification_anchor
    if req.notification_reminder is not None:
        user.notification_reminder = req.notification_reminder
    await user.save()

    return {"message": "Settings updated"}


@router.get("/account/export")
async def export_account_data(user_id: str = Depends(get_current_user_id)):
    """Export all user data as JSON."""
    user = await get_or_404(User, user_id, "User not found")

    from app.models.checkin import CheckIn
    from app.models.journal_entry import JournalEntry
    from app.models.reflection import Reflection

    checkins = await CheckIn.find(CheckIn.user_id == user_id).to_list()
    journals = await JournalEntry.find(JournalEntry.user_id == user_id).to_list()
    reflections = await Reflection.find(Reflection.user_id == user_id).to_list()

    return {
        "exported_at": datetime.now(timezone.utc).isoformat(),
        "user": {
            "id": str(user.id),
            "email": user.email,
            "is_anonymous": user.is_anonymous,
            "created_at": user.created_at.isoformat(),
        },
        "checkins": [
            {
                "id": str(c.id),
                "mood_state": c.mood_state,
                "vent_text": c.vent_text,
                "created_at": c.created_at.isoformat(),
            }
            for c in checkins
        ],
        "journal_entries": [
            {
                "id": str(j.id),
                "title": j.title,
                "content": j.content,
                "mood_tag": j.mood_tag,
                "created_at": j.created_at.isoformat(),
                "updated_at": j.updated_at.isoformat(),
            }
            for j in journals
        ],
        "reflections": [
            {
                "id": str(r.id),
                "content": r.ai_response[:500],
                "created_at": r.created_at.isoformat(),
            }
            for r in reflections
        ],
    }


@router.delete("/account")
async def delete_account(user_id: str = Depends(get_current_user_id)):
    """Delete user account and all associated data."""
    user = await get_or_404(User, user_id, "User not found")

    # Delete all user-owned data
    from app.models.checkin import CheckIn
    from app.models.reflection import Reflection
    from app.models.journal_entry import JournalEntry
    from app.models.debt import Debt
    from app.models.goal import Goal
    await CheckIn.find(CheckIn.user_id == user_id).delete()
    await Reflection.find(Reflection.user_id == user_id).delete()
    await JournalEntry.find(JournalEntry.user_id == user_id).delete()
    await Debt.find(Debt.user_id == user_id).delete()
    await Goal.find(Goal.user_id == user_id).delete()

    # Delete user
    await user.delete()

    return {"message": "Account deleted permanently"}
