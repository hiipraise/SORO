from datetime import datetime, timezone
from typing import Optional
from beanie import Document
from pydantic import Field


class CheckIn(Document):
    user_id: str
    mood_state: str  # "at_limit" | "managing" | "mixed" | "okay" | "good"
    vent_text: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "checkins"
        indexes = [
            "user_id",
            [("user_id", 1), ("created_at", -1)],
        ]

    def __repr__(self):
        return f"<CheckIn {self.mood_state} by {self.user_id}>"
