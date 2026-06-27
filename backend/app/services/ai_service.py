import httpx
from app.core.config import get_settings

settings = get_settings()

SYSTEM_PROMPT = """You are SORO's reflection companion for young Nigerians aged 18-28
carrying real pain — grief, debt, family stress, loneliness, identity.
Never diagnose. Never use clinical terms.
Speak warmly. Nigerian-English code-switching is valid and encouraged.
Acknowledge before advising.
End with ONE question or ONE grounding thought — never both.
If any hint of self-harm or crisis:
  Say: "Before we go further — are you safe right now?"
  Then provide: MANI helpline 08111909909
You are a witness, not a therapist.
Max response: 150 words."""

CRISIS_KEYWORDS = [
    "kill myself", "end it", "suicide", "don't want to live",
    "not worth living", "want to die", "hurt myself",
    "end my life", "take my life", "better off dead",
]


def _detect_crisis(text: str) -> bool:
    return any(kw in text.lower() for kw in CRISIS_KEYWORDS)


def _crisis_response() -> str:
    return (
        "Before we go further — are you safe right now?\n\n"
        "If you're in crisis, please reach out:\n"
        f"{settings.crisis_organization}: {settings.crisis_number}"
    )


def _fallback_response(mood: str, vent: str) -> str:
    """Local fallback when Groq is unavailable."""
    if _detect_crisis(vent):
        return _crisis_response()

    fallbacks = {
        "at_limit": (
            "Thank you for showing up. That takes real courage. "
            "Take a breath. You're not alone in this — and just "
            "acknowledging it is a step. Sending strength your way.\n\n"
            "What would one tiny act of kindness toward yourself look like right now?"
        ),
        "managing": (
            "I hear you. Getting by is honest work. Some days that's enough.\n\n"
            "What's one small thing that could make today a tiny bit lighter?"
        ),
        "mixed": (
            "Mixed is valid. Life doesn't fit into neat boxes. "
            "It's okay to feel a few things at once.\n\n"
            "Which feeling is sitting heaviest right now?"
        ),
        "okay": (
            "Okay is a good place to be. Not great, not terrible — just okay. "
            "That's allowed.\n\n"
            "What's one thing that helped you get to okay today?"
        ),
        "good": (
            "That's good to hear. It's important to catch the good days too.\n\n"
            "What's going right? Let that sink in for a moment."
        ),
    }

    return fallbacks.get(
        mood,
        "Thank you for checking in. Your feelings are valid and matter.\n\n"
        "What do you need right now?"
    )


async def get_reflection(mood: str, vent: str = "") -> tuple[str, str]:
    """
    Generate AI reflection. Returns (response_text, model_used).
    Falls back to local responses if Groq is unavailable.
    """
    full_text = f"{mood} {vent}".strip()

    if _detect_crisis(full_text):
        return _crisis_response(), "crisis-detection"

    if not settings.groq_api_key:
        return _fallback_response(mood, vent), "fallback"

    try:
        async with httpx.AsyncClient() as client:
            user_content = f"Mood: {mood}\n\n{vent}" if vent else f"Mood: {mood}"

            res = await client.post(
                settings.groq_url,
                headers={"Authorization": f"Bearer {settings.groq_api_key}"},
                json={
                    "model": settings.groq_model,
                    "messages": [
                        {"role": "system", "content": SYSTEM_PROMPT},
                        {"role": "user", "content": user_content},
                    ],
                    "max_tokens": settings.groq_max_tokens,
                    "temperature": settings.groq_temperature,
                },
                timeout=15.0,
            )

            if res.status_code == 200:
                data = res.json()
                response = data["choices"][0]["message"]["content"]
                return response, settings.groq_model
            else:
                # Groq rate limit or error — fall back
                return _fallback_response(mood, vent), "fallback"

    except (httpx.TimeoutException, httpx.RequestError, Exception):
        return _fallback_response(mood, vent), "fallback"
