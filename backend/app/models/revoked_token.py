from datetime import datetime, timezone
from beanie import Document
from pydantic import Field
from pymongo import IndexModel, ASCENDING


class RevokedToken(Document):
    """
    Tracks revoked JWT tokens by their unique jti (JWT ID).

    The document _id is the JTI string itself.
    Uses a TTL index on `exp` so MongoDB automatically cleans up
    old entries once the token would have expired anyway.
    """

    id: str  # The JWT's jti (unique identifier), stored as MongoDB _id
    exp: datetime  # When the token originally expires — used for TTL index
    revoked_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "revoked_tokens"
        indexes = [
            IndexModel(
                [("exp", ASCENDING)],
                expireAfterSeconds=0,  # TTL: auto-delete when exp passes
                name="revoked_tokens_ttl_idx",
            ),
        ]

    def __repr__(self):
        return f"<RevokedToken {self.id[:12]}>"
