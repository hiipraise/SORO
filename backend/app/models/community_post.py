from datetime import datetime, timedelta, timezone
from typing import Optional
from beanie import Document
from pydantic import Field


class CommunityPost(Document):
    user_id: str
    content: str
    topic_tag: Optional[str] = None  # "Money" | "Family" | "School" | "Grief" | "Relationships" | "Faith"
    is_approved: bool = False
    reactions: dict = Field(
        default_factory=lambda: {"feel_this": 0, "you_go_make_am": 0, "dey_with_you": 0}
    )
    expires_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc) + timedelta(days=7)
    )
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "community_posts"
        indexes = [
            "user_id",
            "topic_tag",
            "is_approved",
            [("is_approved", 1), ("created_at", -1)],
        ]

    def __repr__(self):
        return f"<CommunityPost by {self.user_id[:8]}>"
