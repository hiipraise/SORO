from datetime import datetime, timezone
from typing import Optional
from beanie import Document
from pydantic import Field, ConfigDict


class Reflection(Document):
    model_config = ConfigDict(protected_namespaces=())

    checkin_id: str
    user_id: str
    ai_response: str
    model_used: str = "llama-3.3-70b-versatile"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "reflections"
        indexes = [
            "user_id",
            "checkin_id",
        ]

    def __repr__(self):
        return f"<Reflection for {self.user_id}>"
