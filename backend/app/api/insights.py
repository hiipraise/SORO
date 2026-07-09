from fastapi import APIRouter, Depends

from app.models.checkin import CheckIn
from app.api.deps import get_current_user_id

router = APIRouter(prefix="/insights", tags=["insights"])


@router.get("/mood")
async def get_mood_insights(user_id: str = Depends(get_current_user_id)):
    """Get mood data for charts and insights."""
    checkins = (
        await CheckIn.find(CheckIn.user_id == user_id)
        .sort(-CheckIn.created_at)
        .limit(30)
        .to_list()
    )

    mood_scores = {
        "at_limit": 1,
        "managing": 2,
        "mixed": 3,
        "okay": 4,
        "good": 5,
    }

    data = [
        {
            "date": c.created_at.isoformat(),
            "mood_state": c.mood_state,
            "score": mood_scores.get(c.mood_state, 3),
        }
        for c in reversed(checkins)  # chronological order
    ]

    # Calculate stats
    total = len(data)
    average_score = round(sum(d["score"] for d in data) / total, 1) if total > 0 else 0

    # Streak calculation — count consecutive days from most recent check-in
    streak = 0
    if data:
        from datetime import datetime, timezone, timedelta

        # Get unique check-in dates in reverse chronological order
        seen_dates = set()
        checkin_dates = []
        for d in reversed(data):
            date = datetime.fromisoformat(d["date"]).date()
            if date not in seen_dates:
                seen_dates.add(date)
                checkin_dates.append(date)

        # Count consecutive days from most recent
        if checkin_dates:
            today = datetime.now(timezone.utc).date()
            latest = checkin_dates[0]
            if latest == today or latest == today - timedelta(days=1):
                streak = 1
                for i in range(1, len(checkin_dates)):
                    if (checkin_dates[i - 1] - checkin_dates[i]).days == 1:
                        streak += 1
                    else:
                        break

    return {
        "data": data,
        "stats": {
            "total_checkins": total,
            "average_score": average_score,
            "streak": streak,
        },
    }


@router.get("/finance")
async def get_finance_insights(user_id: str = Depends(get_current_user_id)):
    """Get financial insights: debt reduction curve + mood correlation."""
    from app.models.debt import Debt
    from app.models.checkin import CheckIn

    # Get all debts
    debts = await Debt.find(Debt.user_id == user_id).to_list()

    # Debt stats
    total_debt = sum(d.amount for d in debts)
    total_paid = sum(d.amount_paid for d in debts)
    cleared_count = sum(1 for d in debts if d.status == "cleared")
    active_count = sum(1 for d in debts if d.status in ("unpaid", "partial"))

    # Mood correlation — find checkins near debt entries
    checkins = (
        await CheckIn.find(CheckIn.user_id == user_id)
        .sort(-CheckIn.created_at)
        .limit(90)
        .to_list()
    )

    mood_scores = {
        "at_limit": 1, "managing": 2, "mixed": 3, "okay": 4, "good": 5,
    }

    # Separate checkins into: those with financial vent text, and those without
    financial_keywords = ["money", "debt", "school fees", "rent", "bank", "salary",
                         "pay", "loan", "broke", "financial", "cash", "bill",
                         "tuition", "income", "save", "cost", "expensive", "owe"]

    finance_moods = []
    other_moods = []

    for c in checkins:
        score = mood_scores.get(c.mood_state, 3)
        entry = {
            "date": c.created_at.isoformat(),
            "score": score,
            "mood_state": c.mood_state,
        }
        if c.vent_text and any(kw in c.vent_text.lower() for kw in financial_keywords):
            finance_moods.append(entry)
        else:
            other_moods.append(entry)

    correlation = {}
    if finance_moods and other_moods:
        avg_finance = round(sum(m["score"] for m in finance_moods) / len(finance_moods), 2)
        avg_other = round(sum(m["score"] for m in other_moods) / len(other_moods), 2)
        correlation = {
            "avg_mood_with_financial_stress": avg_finance,
            "avg_mood_without_financial_stress": avg_other,
            "gap": round(avg_other - avg_finance, 2),
            "financial_checkin_count": len(finance_moods),
            "total_checkin_count": len(checkins),
        }

    return {

        "debt_stats": {
            "total_debt": total_debt,
            "total_paid": total_paid,
            "remaining": total_debt - total_paid,
            "cleared_count": cleared_count,
            "active_count": active_count,
        },
        "mood_correlation": correlation,
    }
