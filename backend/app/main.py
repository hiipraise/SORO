from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_settings
from app.core.database import init_db
from app.api import auth, checkins, reflect, journal, anchor, insights
from app.api import settings as settings_router
from app.api import finance
from app.api import community
from app.api import circles
from app.api.anchor import seed_anchors
from app.services.scheduler import start_scheduler, stop_scheduler

cfg = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan — initialize DB and scheduler on startup."""
    await init_db()
    await seed_anchors()
    await start_scheduler()
    yield
    await stop_scheduler()


app = FastAPI(
    title=cfg.app_name,
    version=cfg.app_version,
    lifespan=lifespan,
)

# CORS
origins = [o.strip() for o in cfg.cors_origins.split(",")]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers — all under /api prefix to match frontend proxy
app.include_router(auth.router, prefix="/api")
app.include_router(checkins.router, prefix="/api")
app.include_router(reflect.router, prefix="/api")
app.include_router(journal.router, prefix="/api")
app.include_router(anchor.router, prefix="/api")
app.include_router(insights.router, prefix="/api")
app.include_router(settings_router.router, prefix="/api")
app.include_router(finance.router, prefix="/api")
app.include_router(community.router, prefix="/api")
app.include_router(circles.router, prefix="/api")


@app.get("/health")
async def health_check():
    return {"status": "ok", "version": cfg.app_version}
