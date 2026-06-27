from fastapi import APIRouter

from app.models.anchor import Anchor

router = APIRouter(prefix="/anchor", tags=["anchor"])

# Seed anchors for the 7-day cadence
SEED_ANCHORS = [
    {
        "content": "The only way out is through. One step today. That's all you need.",
        "source": "SORO",
        "type": "prompt",
        "publish_date": "Monday",
    },
    {
        "content": "What is one thing you're carrying that isn't yours to carry?",
        "source": "Reflection prompt",
        "type": "prompt",
        "publish_date": "Tuesday",
    },
    {
        "content": "Your current situation is not your final destination.",
        "source": "Nigerian proverb",
        "type": "quote",
        "publish_date": "Wednesday",
    },
    {
        "content": "Debt does not define your destiny. It is a chapter, not the whole book.",
        "source": "SORO Finance",
        "type": "quote",
        "publish_date": "Thursday",
    },
    {
        "content": "I lost everything at 22. By 25, I had built something from nothing. The secret? I showed up every single day.",
        "source": "Chidi, 27",
        "type": "story",
        "publish_date": "Friday",
    },
    {
        "content": "Rest is not a reward for finishing. It is fuel for continuing.",
        "source": "SORO",
        "type": "prompt",
        "publish_date": "Saturday",
    },
    {
        "content": "What went well this week? What are you grateful for — even if it's small?",
        "source": "Gratitude prompt",
        "type": "prompt",
        "publish_date": "Sunday",
    },
]


async def seed_anchors():
    """Seed anchors if database is empty."""
    existing = await Anchor.find_all().limit(1).to_list()
    if not existing:
        for a in SEED_ANCHORS:
            anchor = Anchor(**a)
            await anchor.insert()


@router.get("/today")
async def get_today_anchor():
    """Get today's anchor."""
    from datetime import datetime

    today_name = datetime.now().strftime("%A")

    # Try to get from DB first
    anchor = await Anchor.find_one({"publish_date": today_name})
    if anchor:
        return {
            "id": str(anchor.id),
            "content": anchor.content,
            "source": anchor.source,
            "type": anchor.type,
            "publish_date": anchor.publish_date,
        }

    # Fall back to seed data
    for a in SEED_ANCHORS:
        if a["publish_date"] == today_name:
            return a

    # Default fallback
    return {
        "content": "You showed up today. That's already enough.",
        "source": "SORO",
        "type": "prompt",
        "publish_date": today_name,
    }


@router.get("/archive")
async def get_anchor_archive():
    """Get all anchors sorted by day order."""
    DAY_ORDER = {
        "Monday": 1, "Tuesday": 2, "Wednesday": 3, "Thursday": 4,
        "Friday": 5, "Saturday": 6, "Sunday": 7,
    }

    anchors = await Anchor.find_all().to_list()

    if anchors:
        anchors.sort(key=lambda a: DAY_ORDER.get(a.publish_date, 0))
        return [
            {
                "id": str(a.id),
                "content": a.content,
                "source": a.source,
                "type": a.type,
                "publish_date": a.publish_date,
            }
            for a in anchors
        ]

    # Return seed data as fallback, sorted by day order
    return sorted(SEED_ANCHORS, key=lambda a: DAY_ORDER.get(a["publish_date"], 0))
