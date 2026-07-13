from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from .config import get_settings

from app.models.user import User
from app.models.checkin import CheckIn
from app.models.reflection import Reflection
from app.models.journal_entry import JournalEntry
from app.models.anchor import Anchor
from app.models.debt import Debt
from app.models.goal import Goal

from app.models.revoked_token import RevokedToken
from app.services.scheduler import JobLock

settings = get_settings()

# Document models to register with Beanie
DOCUMENT_MODELS = [
    User,
    CheckIn,
    Reflection,
    JournalEntry,
    Anchor,
    Debt,
    Goal,
    
    RevokedToken,
    JobLock,
]


async def init_db():
    client = AsyncIOMotorClient(settings.mongo_uri)
    database = client.get_database(settings.database_name)

    await init_beanie(
        database=database,
        document_models=DOCUMENT_MODELS,
    )

    return database
