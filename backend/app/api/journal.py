from typing import Optional
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel

from app.models.journal_entry import JournalEntry
from app.api.deps import get_current_user_id

router = APIRouter(prefix="/journal", tags=["journal"])


class CreateJournalEntryRequest(BaseModel):
    title: str = "Untitled"
    content: str = ""
    mood_tag: Optional[str] = None


class UpdateJournalEntryRequest(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    mood_tag: Optional[str] = None
    is_locked: Optional[bool] = None


@router.get("/")
async def list_journal_entries(user_id: str = Depends(get_current_user_id)):
    """Get all journal entries for the current user."""
    entries = (
        await JournalEntry.find(JournalEntry.user_id == user_id)
        .sort(-JournalEntry.created_at)
        .to_list()
    )

    return [
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


@router.get("/{entry_id}")
async def get_journal_entry(
    entry_id: str,
    user_id: str = Depends(get_current_user_id),
):
    """Get a single journal entry."""
    entry = await JournalEntry.get(entry_id)
    if not entry or entry.user_id != user_id:
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
    }


@router.patch("/{entry_id}")
async def update_journal_entry(
    entry_id: str,
    req: UpdateJournalEntryRequest,
    user_id: str = Depends(get_current_user_id),
):
    """Update a journal entry."""
    entry = await JournalEntry.get(entry_id)
    if not entry or entry.user_id != user_id:
        raise HTTPException(status_code=404, detail="Journal entry not found")

    from datetime import datetime, timezone

    update_data = req.model_dump(exclude_none=True)
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
    }


@router.delete("/{entry_id}")
async def delete_journal_entry(
    entry_id: str,
    user_id: str = Depends(get_current_user_id),
):
    """Delete a journal entry."""
    entry = await JournalEntry.get(entry_id)
    if not entry or entry.user_id != user_id:
        raise HTTPException(status_code=404, detail="Journal entry not found")

    await entry.delete()
    return {"message": "Entry deleted"}
