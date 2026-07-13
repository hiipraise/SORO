import logging
import httpx
from app.core.config import get_settings
from app.core.crisis import detect_crisis, crisis_response

logger = logging.getLogger("soro.ai")

settings = get_settings()

MODERATION_SYSTEM_PROMPT = """You are a content moderation system for a mental wellness app.
Analyze the following text and respond with exactly one word: SAFE or UNSAFE.

SAFE: Normal, supportive, or emotionally vulnerable content. Includes expressions of sadness,
  stress, grief, anxiety, loneliness, financial worry, relationship issues — all of which
  are welcome here. Also includes crisis keywords that are handled by a separate system.

UNSAFE: Content that is harassment, hate speech, explicit sexual content, targeted abuse,
  spam, or promotion of violence. Do NOT flag crisis content as UNSAFE.

Respond with exactly one word: SAFE or UNSAFE."""


async def moderate_content(text: str) -> bool:
    """
    Use Groq to moderate content for harassment, hate speech, explicit sexual content,
    or targeted abuse. Returns True if content is safe, False if it should be flagged.
    Crisis content is explicitly treated as SAFE — that's handled by detect_crisis().
    Falls back to True (approved) if the API is unavailable.
    """
    if not settings.groq_api_key:
        return True  # No moderation available — approve

    try:
        async with httpx.AsyncClient() as client:
            res = await client.post(
                settings.groq_url,
                headers={"Authorization": f"Bearer {settings.groq_api_key}"},
                json={
                    "model": settings.groq_model,
                    "messages": [
                        {"role": "system", "content": MODERATION_SYSTEM_PROMPT},
                        {"role": "user", "content": text[:1000]},  # Limit input length
                    ],
                    "max_tokens": 5,
                    "temperature": 0.0,
                },
                timeout=10.0,
            )

            if res.status_code == 200:
                response = res.json()["choices"][0]["message"]["content"].strip().upper()
                return response == "SAFE"
            else:
                logger.warning(f"Moderation API returned {res.status_code} — approving by default")
                return True

    except Exception as e:
        logger.warning(f"Moderation API error: {e} — approving by default")
        return True


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


def _crisis_response_local() -> str:
    return crisis_response(settings.crisis_organization, settings.crisis_number)


def _fallback_response(mood: str, vent: str) -> str:
    """Local fallback when Groq is unavailable."""
    if detect_crisis(vent):
        return _crisis_response_local()

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


async def _call_gemini(mood: str, vent: str) -> str | None:
    """
    Try Gemini as fallback if configured.
    Uses the generateContent REST endpoint.
    Returns response text or None on failure.
    """
    if not settings.gemini_api_key:
        return None

    try:
        gemini_url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={settings.gemini_api_key}"
        user_content = f"Mood: {mood}\n\n{vent}" if vent else f"Mood: {mood}"

        async with httpx.AsyncClient() as client:
            res = await client.post(
                gemini_url,
                json={
                    "contents": [
                        {
                            "role": "user",
                            "parts": [{"text": f"{SYSTEM_PROMPT}\n\nUser says: {user_content}"}],
                        }
                    ],
                    "generationConfig": {
                        "maxOutputTokens": settings.groq_max_tokens,
                        "temperature": settings.groq_temperature,
                    },
                },
                timeout=15.0,
            )

            if res.status_code == 200:
                data = res.json()
                candidates = data.get("candidates", [])
                if candidates:
                    return candidates[0].get("content", {}).get("parts", [{}])[0].get("text", "")

            logger.warning(f"Gemini returned {res.status_code} — falling through to local fallback")
            return None

    except Exception as e:
        logger.warning(f"Gemini API error: {e} — falling through to local fallback")
        return None


async def get_reflection(mood: str, vent: str = "") -> tuple[str, str]:
    """
    Generate AI reflection. Returns (response_text, model_used).
    Tries: Groq -> Gemini (fallback) -> local fallback.
    model_used is one of: "crisis-detection", "groq", "gemini", "fallback".
    """
    full_text = f"{mood} {vent}".strip()

    if detect_crisis(full_text):
        return _crisis_response_local(), "crisis-detection"

    if not settings.groq_api_key and not settings.gemini_api_key:
        return _fallback_response(mood, vent), "fallback"

    # Try Groq first
    if settings.groq_api_key:
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
                    return response, "groq"
                else:
                    logger.warning(
                        f"Groq returned {res.status_code} — trying Gemini fallback"
                    )

        except Exception as e:
            logger.warning(f"Groq API error: {e} — trying Gemini fallback")

    # Try Gemini fallback
    gemini_response = await _call_gemini(mood, vent)
    if gemini_response:
        return gemini_response, "gemini"

    # Both failed — use local fallback
    logger.warning("Both Groq and Gemini failed — using local fallback response")
    return _fallback_response(mood, vent), "fallback"
