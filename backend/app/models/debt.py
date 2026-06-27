from datetime import datetime, timezone
from typing import Optional
from beanie import Document
from pydantic import Field


class Debt(Document):
    user_id: str
    label: str
    amount: float
    amount_paid: float = 0.0
    due_date: Optional[str] = None
    status: str = "unpaid"  # "unpaid" | "partial" | "cleared"
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "debts"
        indexes = [
            "user_id",
            "status",
        ]

    def __repr__(self):
        return f"<Debt {self.label} ₦{self.amount}>"
