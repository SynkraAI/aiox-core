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
    print(f"[future_self] called — img={len(front_bytes) if front_bytes else 0}B key_set={bool(GEMINI_API_KEY)}", flush=True)
    if not GEMINI_API_KEY:
        logger.warning("[future_self] GEMINI_API_KEY not set — skipping")
        print("[future_self] GEMINI_API_KEY not set — skipping", flush=True)
        return None

    try:
        from google import genai as google_genai
        from google.genai import types as genai_types

        client = google_genai.Client(api_key=GEMINI_API_KEY)

        prompt = _build_prompt(scores, profile, period_days)
        print(f"[future_self] resizing image ({len(front_bytes)}B)...", flush=True)
        resized = _resize(front_bytes)
        print(f"[future_self] resized to {len(resized)}B, calling Gemini...", flush=True)

        response = client.models.generate_content(
            model="gemini-2.5-flash-image",
            contents=[
                genai_types.Part.from_bytes(data=resized, mime_type="image/jpeg"),
                genai_types.Part.from_text(text=prompt),
            ],
            config=genai_types.GenerateContentConfig(
                response_modalities=["IMAGE", "TEXT"],
                temperature=1.0,
                safety_settings=[
                    genai_types.SafetySetting(
                        category="HARM_CATEGORY_HARASSMENT",
                        threshold="BLOCK_ONLY_HIGH",
                    ),
                    genai_types.SafetySetting(
                        category="HARM_CATEGORY_SEXUALLY_EXPLICIT",
                        threshold="BLOCK_ONLY_HIGH",
                    ),
                ],
            ),
        )

        num_candidates = len(response.candidates) if response.candidates else 0
        print(f"[future_self] Gemini responded — {num_candidates} candidate(s)", flush=True)
        for candidate in response.candidates or []:
            finish = getattr(candidate, "finish_reason", None)
            num_parts = len(candidate.content.parts) if candidate.content and candidate.content.parts else 0
            print(f"[future_self] candidate finish={finish} parts={num_parts}", flush=True)
            for part in candidate.content.parts or []:
                if part.inline_data and part.inline_data.data:
                    raw = part.inline_data.data
                    size = len(raw) if isinstance(raw, bytes) else "b64"
                    logger.info("[future_self] Image generated successfully (%s bytes)", size)
                    print(f"[future_self] Image generated successfully ({size} bytes)", flush=True)
                    return raw if isinstance(raw, bytes) else base64.b64decode(raw)
            logger.warning("[future_self] Candidate had no image — finish_reason=%s", finish)
            print(f"[future_self] Candidate had no image — finish_reason={finish}", flush=True)

        logger.warning("[future_self] Gemini returned no image in response")
        print("[future_self] Gemini returned no image in response", flush=True)
        return None

    except Exception as exc:
        logger.error("[future_self] Generation failed (%s): %s", type(exc).__name__, exc)
        print(f"[future_self] Generation FAILED ({type(exc).__name__}): {exc}", flush=True)
        return None
