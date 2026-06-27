from datetime import datetime, timezone
from typing import Optional
from beanie import Document
from pydantic import BaseModel, Field


class CircleMember(BaseModel):
    """Embedded model for circle membership."""
    user_id: str
    display_name: str  # e.g. "Voice 4", "Voice 11"
    joined_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class PeerCircle(Document):
    name: str
    topic: Optional[str] = None
    max_members: int = 20
    members: list[dict] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "peer_circles"
        indexes = [
            "topic",
            [("created_at", -1)],
        ]

    @property
    def member_count(self) -> int:
        return len(self.members)

    @property
    def is_full(self) -> bool:
        return len(self.members) >= self.max_members

    def __repr__(self):
        return f"<PeerCircle {self.name} ({self.member_count}/{self.max_members})>"
