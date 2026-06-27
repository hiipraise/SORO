from datetime import datetime, timezone
from typing import Optional
from beanie import Document
from pydantic import Field


class Anchor(Document):
    content: str
    source: Optional[str] = None
    type: str  # "verse" | "quote" | "prompt" | "story"
    publish_date: str  # "Monday" | "Tuesday" | etc.
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "anchors"
        indexes = [
            "publish_date",
            "type",
        ]

    def __repr__(self):
        return f"<Anchor {self.type} for {self.publish_date}>"
