from datetime import datetime, timezone
from typing import Optional
from beanie import Document
from pydantic import Field


class JournalEntry(Document):
    user_id: str
    title: str = "Untitled"
    content: str = ""
    mood_tag: Optional[str] = None
    is_locked: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "journal_entries"
        indexes = [
            "user_id",
            [("user_id", 1), ("created_at", -1)],
        ]

    def __repr__(self):
        return f"<JournalEntry {self.title[:30]} by {self.user_id}>"
