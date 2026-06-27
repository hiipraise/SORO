from datetime import datetime, timezone
from beanie import Document
from pydantic import Field


class CircleMessage(Document):
    circle_id: str
    user_id: str
    display_name: str  # Anonymous display name of sender
    content: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "circle_messages"
        indexes = [
            "circle_id",
            [("circle_id", 1), ("created_at", 1)],
        ]

    def __repr__(self):
        return f"<CircleMessage in {self.circle_id[:8]} by {self.display_name}>"
