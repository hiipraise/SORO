from datetime import datetime, timezone
from typing import Optional
from beanie import Document
from pydantic import Field, EmailStr


class User(Document):
    email: Optional[str] = None
    password_hash: Optional[str] = None
    is_anonymous: bool = False
    session_token: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "users"
        indexes = [
            "email",
            "session_token",
        ]

    def __repr__(self):
        return f"<User {self.id}>"
