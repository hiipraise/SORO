from datetime import datetime, timezone
from typing import Optional
from beanie import Document
from pydantic import Field, EmailStr
from pymongo import IndexModel, ASCENDING


class User(Document):
    email: Optional[str] = None
    password_hash: Optional[str] = None
    is_anonymous: bool = False
    session_token: Optional[str] = None
    display_name: Optional[str] = None  # For personalized emails/digests
    blocked_user_ids: list[str] = Field(default_factory=list)  # P2.12: Users this user has blocked
    notification_anchor: bool = True
    notification_reminder: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "users"
        indexes = [
            IndexModel(
                [("email", ASCENDING)],
                unique=True,
                name="email_unique_idx",
                partialFilterExpression={"email": {"$type": "string"}},
            ),
            "session_token",
        ]

    def __repr__(self):
        return f"<User {self.id}>"
