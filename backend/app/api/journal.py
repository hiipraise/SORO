from typing import Optional
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field

from app.models.journal_entry import JournalEntry
from app.api.deps import get_current_user_id, get_or_404
from app.core.crisis import detect_crisis, crisis_response
from app.core.config import get_settings

router = APIRouter(prefix="/journal", tags=["journal"])


class CreateJournalEntryRequest(BaseModel):
    title: str = "Untitled"
    content: str = Field(default="", max_length=10000)
    mood_tag: Optional[str] = None


class UpdateJournalEntryRequest(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = Field(default=None, max_length=10000)
    mood_tag: Optional[str] = None
    is_locked: Optional[bool] = None


@router.get("/")
async def list_journal_entries(
    user_id: str = Depends(get_current_user_id),
    skip: int = 0,
    limit: int = 20,
):
    """Get journal entries for the current user with pagination."""
    limit = min(limit, 50)  # Cap at 50

    total = await JournalEntry.find(JournalEntry.user_id == user_id).count()

    entries = (
        await JournalEntry.find(JournalEntry.user_id == user_id)
        .sort(-JournalEntry.created_at)
        .skip(skip)
        .limit(limit)
        .to_list()
    )

    items = [
        {
            "id": str(e.id),
            "title": e.title,
            "content": e.content[:200] + ("..." if len(e.content) > 200 else ""),
            "mood_tag": e.mood_tag,
            "is_locked": e.is_locked,
            "created_at": e.created_at.isoformat(),
            "updated_at": e.updated_at.isoformat(),
        }
        for e in entries
    ]

    return {
        "items": items,
        "total": total,
        "skip": skip,
        "limit": limit,
        "has_more": (skip + limit) < total,
    }


@router.get("/{entry_id}")
async def get_journal_entry(
    entry_id: str,
    user_id: str = Depends(get_current_user_id),
):
    """Get a single journal entry."""
    entry = await get_or_404(JournalEntry, entry_id, "Journal entry not found")
    if entry.user_id != user_id:
        raise HTTPException(status_code=404, detail="Journal entry not found")

    return {
        "id": str(entry.id),
        "title": entry.title,
        "content": entry.content,
        "mood_tag": entry.mood_tag,
        "is_locked": entry.is_locked,
        "created_at": entry.created_at.isoformat(),
        "updated_at": entry.updated_at.isoformat(),
    }


@router.post("/")
async def create_journal_entry(
    req: CreateJournalEntryRequest,
    user_id: str = Depends(get_current_user_id),
):
    """Create a new journal entry."""
    # Crisis check — flag but never block
    crisis_flag = False
    crisis_msg = None
    if detect_crisis(req.content):
        crisis_flag = True
        settings_crisis = get_settings()
        crisis_msg = crisis_response(settings_crisis.crisis_organization, settings_crisis.crisis_number)

    entry = JournalEntry(
        user_id=user_id,
        title=req.title,
        content=req.content,
        mood_tag=req.mood_tag,
    )
    await entry.insert()

    return {
        "id": str(entry.id),
        "title": entry.title,
        "content": entry.content,
        "mood_tag": entry.mood_tag,
        "is_locked": entry.is_locked,
        "created_at": entry.created_at.isoformat(),
        "updated_at": entry.updated_at.isoformat(),
        "crisis_flag": crisis_flag,
        "crisis_message": crisis_msg,
    }


@router.patch("/{entry_id}")
async def update_journal_entry(
    entry_id: str,
    req: UpdateJournalEntryRequest,
    user_id: str = Depends(get_current_user_id),
):
    """Update a journal entry."""
    entry = await get_or_404(JournalEntry, entry_id, "Journal entry not found")
    if entry.user_id != user_id:
        raise HTTPException(status_code=404, detail="Journal entry not found")

    from datetime import datetime, timezone

    update_data = req.model_dump(exclude_none=True)

    # Crisis check on content update — flag but never block
    crisis_flag = False
    crisis_msg = None
    if "content" in update_data and detect_crisis(update_data["content"]):
        crisis_flag = True
        settings_crisis = get_settings()
        crisis_msg = crisis_response(settings_crisis.crisis_organization, settings_crisis.crisis_number)

    for field, value in update_data.items():
        setattr(entry, field, value)
    entry.updated_at = datetime.now(timezone.utc)

    await entry.save()

    return {
        "id": str(entry.id),
        "title": entry.title,
        "content": entry.content,
        "mood_tag": entry.mood_tag,
        "is_locked": entry.is_locked,
        "created_at": entry.created_at.isoformat(),
        "updated_at": entry.updated_at.isoformat(),
        "crisis_flag": crisis_flag,
        "crisis_message": crisis_msg,
    }


@router.delete("/{entry_id}")
async def delete_journal_entry(
    entry_id: str,
    user_id: str = Depends(get_current_user_id),
):
    """Delete a journal entry."""
    entry = await get_or_404(JournalEntry, entry_id, "Journal entry not found")
    if entry.user_id != user_id:
        raise HTTPException(status_code=404, detail="Journal entry not found")

    await entry.delete()
    return {"message": "Entry deleted"}
