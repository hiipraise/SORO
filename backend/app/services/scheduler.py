"""
SORO Scheduler Service
Uses APScheduler to run recurring jobs:
- Weekly Sunday digest emails to active users
"""

import logging
from datetime import datetime, timezone, timedelta

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger

from app.core.config import get_settings
from app.models.user import User
from app.models.checkin import CheckIn
from app.services.email_service import send_personalized_digest

logger = logging.getLogger("soro.scheduler")

scheduler = AsyncIOScheduler()
settings = get_settings()


async def weekly_digest_job():
    """
    Send personalized weekly digest emails to all non-anonymous users
    who have checked in at least once in the past week.
    Runs every Sunday at the configured hour/minute.
    """
    logger.info("Starting weekly digest job...")

    # Get all non-anonymous users with email addresses
    users = await User.find(
        User.is_anonymous == False,
        User.email != None,
    ).to_list()

    if not users:
        logger.info("No users with email found — skipping digest")
        return

    # Calculate the start of the past week (7 days ago)
    week_ago = datetime.now(timezone.utc) - timedelta(days=7)

    sent_count = 0
    skipped_count = 0

    for user in users:
        if not user.email:
            skipped_count += 1
            continue

        try:
            # Count check-ins for this user in the past week
            checkin_count = await CheckIn.find(
                CheckIn.user_id == str(user.id),
                CheckIn.created_at >= week_ago,
            ).count()

            # Only send digest if they've checked in this week
            if checkin_count == 0:
                skipped_count += 1
                continue

            # Get user's first name from email (before @)
            first_name = user.email.split("@")[0].capitalize()

            success = await send_personalized_digest(
                email=user.email,
                first_name=first_name,
                checkins_this_week=checkin_count,
            )

            if success:
                sent_count += 1
                logger.debug(f"Digest sent to {user.email} ({checkin_count} check-ins)")
            else:
                skipped_count += 1
                logger.warning(f"Failed to send digest to {user.email}")

        except Exception as e:
            skipped_count += 1
            logger.error(f"Error sending digest to {user.email}: {e}")

    logger.info(
        f"Weekly digest complete: {sent_count} sent, {skipped_count} skipped"
    )


async def start_scheduler():
    """Start the APScheduler if enabled in config."""
    if not settings.scheduler_enabled:
        logger.info("Scheduler is disabled — skipping startup")
        return

    # Map day name to cron day-of-week number (0=Monday, 6=Sunday)
    day_map = {
        "monday": 0, "tuesday": 1, "wednesday": 2, "thursday": 3,
        "friday": 4, "saturday": 5, "sunday": 6,
    }
    day_num = day_map.get(settings.digest_day.lower(), 6)  # Default Sunday

    # Add weekly digest job
    scheduler.add_job(
        weekly_digest_job,
        CronTrigger(
            day_of_week=day_num,
            hour=settings.digest_hour,
            minute=settings.digest_minute,
            timezone="Africa/Lagos",
        ),
        id="weekly_digest",
        name="Weekly digest email",
        replace_existing=True,
        misfire_grace_time=3600,  # 1 hour grace period
    )

    logger.info(
        f"Scheduler started — weekly digest scheduled for "
        f"{settings.digest_day}s at {settings.digest_hour}:{settings.digest_minute:02d} WAT"
    )

    # Run the first digest immediately if in debug mode for testing
    if settings.debug:
        logger.info("Debug mode — running initial digest immediately")
        scheduler.add_job(
            weekly_digest_job,
            id="initial_digest",
            name="Initial test digest",
            misfire_grace_time=None,
        )

    scheduler.start()


async def stop_scheduler():
    """Gracefully shut down the scheduler."""
    if scheduler.running:
        scheduler.shutdown(wait=False)
        logger.info("Scheduler shut down")
