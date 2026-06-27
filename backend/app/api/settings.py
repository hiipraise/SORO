from typing import Optional
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel

from app.models.user import User
from app.api.deps import get_current_user_id

router = APIRouter(tags=["settings"])


class UpdateSettingsRequest(BaseModel):
    email: Optional[str] = None
    notification_anchor: Optional[bool] = None
    notification_reminder: Optional[bool] = None


@router.get("/settings")
async def get_settings(user_id: str = Depends(get_current_user_id)):
    """Get user settings."""
    user = await User.get(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return {
        "id": str(user.id),
        "email": user.email,
        "is_anonymous": user.is_anonymous,
        "created_at": user.created_at.isoformat(),
    }


@router.patch("/settings")
async def update_settings(
    req: UpdateSettingsRequest,
    user_id: str = Depends(get_current_user_id),
):
    """Update user settings."""
    user = await User.get(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if req.email:
        user.email = req.email
    await user.save()

    return {"message": "Settings updated"}


@router.delete("/account")
async def delete_account(user_id: str = Depends(get_current_user_id)):
    """Delete user account and all associated data."""
    user = await User.get(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Delete all user data
    from app.models.checkin import CheckIn
    from app.models.reflection import Reflection
    from app.models.journal_entry import JournalEntry

    await CheckIn.find(CheckIn.user_id == user_id).delete()
    await Reflection.find(Reflection.user_id == user_id).delete()
    await JournalEntry.find(JournalEntry.user_id == user_id).delete()

    # Delete user
    await user.delete()

    return {"message": "Account deleted permanently"}
