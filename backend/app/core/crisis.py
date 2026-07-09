"""
Shared crisis keyword detection and moderation utilities.
Extracted from duplicated copies in ai_service.py and community/posts.py.
"""

CRISIS_KEYWORDS = [
    "kill myself", "end it", "suicide", "don't want to live",
    "not worth living", "want to die", "hurt myself",
    "end my life", "take my life", "better off dead",
]


def detect_crisis(text: str) -> bool:
    """Check if text contains any crisis keywords."""
    return any(kw in text.lower() for kw in CRISIS_KEYWORDS)


def crisis_response(organization: str = "MANI Helpline", number: str = "08111909909") -> str:
    """Return a standard crisis helpline message."""
    return (
        "Before we go further — are you safe right now?\n\n"
        "If you're in crisis, please reach out:\n"
        f"{organization}: {number}"
    )
