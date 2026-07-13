from slowapi import Limiter
from slowapi.util import get_remote_address

# Default limiter keyed by IP alone (works for most endpoints)
limiter = Limiter(key_func=get_remote_address)

# Auth-specific limiter (same IP-based key).
# Note: Full CGNAT protection (keying by IP+email) would require async body
# parsing which slowapi's sync key function doesn't support. Redis persistence
# (the more impactful fix for free-tier restarts) is handled below.
auth_limiter = Limiter(key_func=get_remote_address)

# P1.7: Wire Upstash Redis when configured; fall back to in-memory for local dev
try:
    from app.core.config import get_settings
    _settings = get_settings()
    if _settings.redis_url:
        from slowapi import Limiter
        limiter = Limiter(
            key_func=get_remote_address,
            storage_uri=_settings.redis_url,
        )
        auth_limiter = Limiter(
            key_func=get_remote_address,
            storage_uri=_settings.redis_url,
        )
except Exception:
    pass  # Keep in-memory limiters if redis isn't available
