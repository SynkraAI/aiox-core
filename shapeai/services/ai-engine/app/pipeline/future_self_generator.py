import base64
import io
import logging
import os

from PIL import Image

logger = logging.getLogger(__name__)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

_GOAL_CONTEXT = {
    "hypertrophy": "significantly increased muscle mass, broader shoulders, more developed chest and arms, athletic muscular physique",
    "fat_loss": "significantly reduced body fat, leaner and more defined physique, visible muscle definition throughout",
    "conditioning": "improved athletic build, balanced muscle development, reduced body fat, athletic and toned",
    "maintenance": "slightly more defined and athletic physique, improved overall muscle tone",
}

_DEFAULT_GOAL = "improved athletic physique, better muscle definition and tone"


def _build_prompt(scores: dict, profile: dict, period_days: int) -> str:
    goal = profile.get("goal", "conditioning")
    sex = "male" if profile.get("sex", "M") == "M" else "female"
    fat_pct = float(scores.get("body_fat_estimate_pct", 20.0))
    goal_desc = _GOAL_CONTEXT.get(goal, _DEFAULT_GOAL)

    return (
        f"Generate a photorealistic fitness transformation image of the same {sex} person "
        f"from the reference photo, showing their predicted physique after {period_days} days "
        f"of consistent training and healthy nutrition.\n\n"
        f"CRITICAL RULES:\n"
        f"- Keep the EXACT SAME face, facial features, skin tone, hair, and identity\n"
        f"- Same height and body proportions framework\n"
        f"- Similar pose and camera angle as the reference photo\n"
        f"- Natural photorealistic result, not illustrated or cartoonish\n\n"
        f"Physical changes to show: {goal_desc}\n"
        f"Current estimated body fat: {fat_pct:.1f}%\n"
        f"Transformation should look natural and achievable, not extreme.\n\n"
        f"Style: photorealistic, fitness photography, clean neutral background, good lighting"
    )


def _resize(image_bytes: bytes, max_px: int = 768) -> bytes:
    img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    w, h = img.size
    if max(w, h) > max_px:
        ratio = max_px / max(w, h)
        img = img.resize((int(w * ratio), int(h * ratio)), Image.LANCZOS)
    buf = io.BytesIO()
    img.save(buf, format="JPEG", quality=85)
    return buf.getvalue()


def generate_future_self(
    front_bytes: bytes,
    scores: dict,
    profile: dict,
    period_days: int = 90,
) -> bytes | None:
    """Generate future-self image via Gemini. Returns JPEG bytes or None on failure."""
    if not GEMINI_API_KEY:
        logger.warning("[future_self] GEMINI_API_KEY not set — skipping")
        return None

    try:
        from google import genai as google_genai
        from google.genai import types as genai_types

        client = google_genai.Client(api_key=GEMINI_API_KEY)

        prompt = _build_prompt(scores, profile, period_days)
        resized = _resize(front_bytes)

        response = client.models.generate_content(
            model="gemini-2.5-flash-image",
            contents=[
                genai_types.Part.from_bytes(data=resized, mime_type="image/jpeg"),
                genai_types.Part.from_text(text=prompt),
            ],
            config=genai_types.GenerateContentConfig(
                response_modalities=["IMAGE", "TEXT"],
                temperature=1.0,
            ),
        )

        for candidate in response.candidates or []:
            for part in candidate.content.parts or []:
                if part.inline_data and part.inline_data.data:
                    raw = part.inline_data.data
                    # SDK may return bytes or base64 string
                    return raw if isinstance(raw, bytes) else base64.b64decode(raw)

        logger.warning("[future_self] Gemini returned no image in response")
        return None

    except Exception as exc:
        logger.error("[future_self] Generation failed (%s): %s", type(exc).__name__, exc)
        return None
