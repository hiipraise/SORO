import httpx
from typing import Optional
from app.core.config import get_settings

settings = get_settings()


async def send_email(
    to: str,
    subject: str,
    template_key: str,
    variables: Optional[dict] = None,
    send_mode: str = "single",
    batch_size: Optional[int] = None,
    batch_interval_minutes: Optional[int] = None,
) -> bool:
    """Send an email via Sendhiiv API."""
    if not settings.sendhiiv_api_key:
        # Silent fail if not configured
        return False

    payload = {
        "to": to,
        "subject": subject,
        "template_key": template_key,
        "variables": variables or {},
    }

    if send_mode == "drip":
        payload["send_mode"] = "drip"
        if batch_size:
            payload["batch_size"] = batch_size
        if batch_interval_minutes:
            payload["batch_interval_minutes"] = batch_interval_minutes
    else:
        payload["send_mode"] = "single"

    try:
        async with httpx.AsyncClient() as client:
            res = await client.post(
                settings.sendhiiv_url,
                headers={
                    "Authorization": f"Bearer {settings.sendhiiv_api_key}",
                    "Content-Type": "application/json",
                },
                json=payload,
                timeout=10.0,
            )
            return res.status_code in (200, 201)
    except Exception:
        return False


async def send_welcome_email(email: str, first_name: str = "there") -> bool:
    """Send welcome email after signup."""
    return await send_email(
        to=email,
        subject="Welcome to SORO — Speak it. Face it. Rise.",
        template_key="soro-welcome",
        variables={"firstName": first_name},
    )


async def send_password_reset(email: str, reset_link: str) -> bool:
    """Send password reset email."""
    return await send_email(
        to=email,
        subject="Reset your SORO password",
        template_key="soro-reset",
        variables={"resetLink": reset_link},
    )


async def send_weekly_digest(emails: list[str]) -> bool:
    """Send weekly digest via drip batch."""
    if not emails:
        return False
    return await send_email(
        to=",".join(emails),
        subject="Your week on SORO",
        template_key="soro-digest",
        send_mode="drip",
        batch_size=50,
        batch_interval_minutes=15,
    )


async def send_personalized_digest(
    email: str,
    first_name: str,
    checkins_this_week: int,
) -> bool:
    """Send a personalized weekly digest to a single user."""
    return await send_email(
        to=email,
        subject="Your week on SORO",
        template_key="soro-digest",
        variables={
            "firstName": first_name,
            "checkinsThisWeek": str(checkins_this_week),
        },
        send_mode="single",
    )


async def send_checkin_reminder(email: str, first_name: str = "there") -> bool:
    """Send check-in reminder after 3 days of inactivity."""
    return await send_email(
        to=email,
        subject="We haven't seen you on SORO",
        template_key="soro-reminder",
        variables={"firstName": first_name},
    )


async def send_goal_celebration(email: str, goal_title: str) -> bool:
    """Send celebration email when a goal is achieved."""
    return await send_email(
        to=email,
        subject="You did that! E don clear!",
        template_key="soro-celebrate",
        variables={"goalTitle": goal_title},
    )
