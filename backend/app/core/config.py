from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # App
    app_name: str = "SORO API"
    app_version: str = "0.1.0"
    debug: bool = False
    cors_origins: str = "http://localhost:3000,http://localhost:5173,https://soro.pxxl.click,https://soro.axiomcv.site"

    # MongoDB
    mongo_uri: str = "mongodb://localhost:27017/soro"
    database_name: str = "soro"

    # JWT
    jwt_secret: str = "change-me-in-production-soro-2024"
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 60 * 24 * 7  # 7 days

    # Redis (Upstash)
    redis_url: str = ""

    # Groq AI
    groq_api_key: str = ""
    groq_model: str = "llama-3.3-70b-versatile"
    groq_url: str = "https://api.groq.com/openai/v1/chat/completions"
    groq_max_tokens: int = 200
    groq_temperature: float = 0.7

    # Gemini (fallback)
    gemini_api_key: str = ""

    # Sendhiiv
    sendhiiv_api_key: str = ""
    sendhiiv_url: str = "https://api.sendhiiv.com/api/v1/messages"

    # Scheduler
    scheduler_enabled: bool = False
    digest_day: str = "Sunday"
    digest_hour: int = 8
    digest_minute: int = 0

    # Crisis helpline
    crisis_number: str = "08111909909"
    crisis_organization: str = "MANI Helpline"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
