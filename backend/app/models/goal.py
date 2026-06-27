from datetime import datetime, timezone
from typing import Optional
from beanie import Document
from pydantic import Field


class Goal(Document):
    user_id: str
    title: str
    target_amount: float
    current_amount: float = 0.0
    deadline: Optional[str] = None
    priority: str = "eventually"  # "urgent" | "soon" | "eventually"
    status: str = "active"  # "active" | "completed"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "goals"
        indexes = [
            "user_id",
            "status",
            "priority",
        ]

    def __repr__(self):
        return f"<Goal {self.title} ₦{self.target_amount}>"
