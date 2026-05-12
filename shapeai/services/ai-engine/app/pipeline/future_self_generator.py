import base64
import io
import logging
import os

from PIL import Image

logger = logging.getLogger(__name__)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

def _describe_body_goal(goal: str, fat_pct: float, sex: str) -> str:  # unused — kept for reference only
    """
    Returns contextual transformation description based on current body composition + goal.
    All transformations reflect the natural body recomposition process:
    fat reduction AND muscle development always happen together, just in different proportions.
    """
    is_male = sex == "male"

    if is_male:
        fat_level = "very_high" if fat_pct >= 35 else "high" if fat_pct >= 25 else "moderate" if fat_pct >= 17 else "low"
    else:
        fat_level = "very_high" if fat_pct >= 42 else "high" if fat_pct >= 33 else "moderate" if fat_pct >= 25 else "low"

    descriptions = {
        # ── MALE ──────────────────────────────────────────────────────────────
        # Lógica: gordo → magro primeiro (sonho é ser lean); magro → maior e equilibrado.
        # O objetivo (hypertrophy/fat_loss/conditioning) calibra a ênfase, não o destino.

        # VERY HIGH fat (male ≥35%)
        # Sonho: ser magro e atlético. Não é bodybuilder — é "aquele cara fitness".
        ("very_high", "hypertrophy", "male"): (
            "the dream physique for this body: lose the vast majority of fat first — "
            "stomach goes from very large to completely flat, face and neck become lean and sharp, "
            "arms and torso slim down dramatically. Then, solid athletic muscle emerges underneath: "
            "developed chest, broader shoulders, defined arms, stronger back. "
            "LEGS: thighs and calves slim down from heavy and shapeless to lean and muscular — "
            "visible quad shape, defined hamstrings, athletic calves. "
            "The result is not a bodybuilder — it is the lean, athletic and muscular physique "
            "this person has always imagined: no excess fat, real visible muscles, confident silhouette."
        ),
        ("very_high", "fat_loss", "male"): (
            "radical fat loss — the entire body sheds a massive amount of fat: "
            "stomach becomes very flat with visible abs, face and neck lean and defined, "
            "arms go from heavy to slim and toned. "
            "LEGS: thighs dramatically slimmer, calves lean — "
            "legs go from bulky to lean and athletic with visible muscle shape. "
            "The full silhouette is transformed: from obese to lean, fit and confident."
        ),
        ("very_high", "conditioning", "male"): (
            "radical transformation — fat loss is the priority, revealing a lean and athletic body: "
            "very flat stomach, lean defined torso with a clear V-taper, developed shoulders. "
            "LEGS: completely transformed — from heavy and shapeless to lean and muscular: "
            "defined quads and hamstrings, lean calves, powerful and athletic. "
            "The body looks completely rebuilt: lean, strong and athletic — "
            "the high-performance physique this person dreams of."
        ),

        # HIGH fat (male 25-35%)
        # Sonho: ainda é lean first — mas agora músculos emergem com mais equilíbrio.
        ("high", "hypertrophy", "male"): (
            "the dream physique: significantly leaner with solid muscle mass built throughout — "
            "very flat stomach, defined chest, broad powerful shoulders, "
            "thick arms with clear bicep and tricep definition, wide muscular back. "
            "LEGS: major transformation — quads become defined and powerful, hamstrings thick, "
            "calves muscular and prominent. Lean thighs with no excess fat — all muscle. "
            "Lean AND muscular in equal measure — the athletic body where every muscle is visible "
            "without any excess fat covering it."
        ),
        ("high", "fat_loss", "male"): (
            "dramatically leaner — major fat reduction revealing a completely transformed silhouette: "
            "very flat stomach with visible abs, lean and defined arms, sharp jawline. "
            "LEGS: thighs become lean and toned with visible quad and hamstring definition, "
            "calves slim and athletic — the natural muscle underneath fully exposed. "
            "Fit, lean and energetic from head to toe."
        ),
        ("high", "conditioning", "male"): (
            "completely transformed athletic physique: significant fat loss combined with strong muscle — "
            "flat defined stomach, V-taper silhouette, powerful shoulders and arms. "
            "LEGS: strong athletic legs — developed quads and hamstrings, defined calves, "
            "lean thighs with clear muscle shape. A serious, well-rounded athlete."
        ),

        # MODERATE fat (male 17-25%)
        # Sonho: mais definido + maior em tudo, equilibrado. Não é magro, não é obeso — quer os dois.
        ("moderate", "hypertrophy", "male"): (
            "the dream physique: leaner AND bigger everywhere simultaneously — "
            "flat defined midsection with visible abs, larger chest with clear pec definition, "
            "broader more powerful shoulders, thicker arms with sharp bicep and tricep separation, "
            "wider developed back. "
            "LEGS: significantly bigger and more defined — large quads with visible separation, "
            "thick hamstrings, prominent muscular calves. "
            "Every muscle group is bigger AND more defined — the balanced muscular physique "
            "where nothing is lagging and everything is developed."
        ),
        ("moderate", "fat_loss", "male"): (
            "lean and sharply defined — fat loss revealing athletic muscles throughout: "
            "visible six-pack abs, defined arms with clear muscle separation, sharp V-taper. "
            "LEGS: lean and defined — visible quad separation, defined hamstrings, "
            "athletic calves. Competition-ready from top to bottom."
        ),
        ("moderate", "conditioning", "male"): (
            "elite balanced athletic physique: lean with sharp muscle definition everywhere — "
            "strong V-taper, developed chest and shoulders, defined arms, visible abs. "
            "LEGS: powerful and defined — clear quads and hamstrings, muscular calves, "
            "lean thighs. The complete well-rounded athlete in peak condition."
        ),

        # LOW fat (male <17%)
        # Sonho: ser maior. Já está lean — o objetivo é crescer equilibrado em tudo.
        ("low", "hypertrophy", "male"): (
            "the dream physique: already lean so the entire focus is growing every muscle group larger — "
            "much larger chest, extremely broad and powerful shoulders, thick veiny arms, "
            "wide thick back, sharp striated abs. "
            "LEGS: grow as large as possible — enormous quads with deep muscle separation, "
            "thick hamstrings, diamond-shaped prominent calves. "
            "Every muscle group pushed to its maximum size — bigger everywhere, balanced, "
            "nothing lagging — the powerful and complete muscular physique."
        ),
        ("low", "fat_loss", "male"): (
            "ultra-lean and razor-sharp definition — every muscle fully visible: "
            "striated abs, defined shoulders and arms. "
            "LEGS: shredded — every quad muscle fiber visible, clear hamstring separation, "
            "striated calves. Competition-level definition from head to toe."
        ),
        ("low", "conditioning", "male"): (
            "world-class athletic physique: extremely lean with exceptional muscle definition and symmetry — "
            "powerful V-taper, very broad shoulders, striated muscles throughout. "
            "LEGS: elite athlete legs — powerful defined quads and hamstrings, muscular calves — "
            "strength and aesthetics at their absolute peak."
        ),

        # ── FEMALE ────────────────────────────────────────────────────────────
        # Lógica: o DESTINO é sempre o mesmo — glúteos grandes e redondos, pernas cheias,
        # cintura fina, braços definidos (não enormes). O objetivo e fat_level só calibram
        # o quanto de transformação é necessária e como se descreve o caminho.

        # VERY HIGH fat (female ≥42%)
        ("very_high", "hypertrophy", "female"): (
            "radical transformation into the dream feminine physique: "
            "massive fat loss reshapes the entire body — stomach becomes flat, "
            "waist becomes slim and defined, arms toned and feminine. "
            "GLUTES AND LEGS — the absolute priority: glutes transform from flat and heavy "
            "to very round, full and prominently lifted — a shapely peach that fills out the silhouette. "
            "Thighs become toned and defined with visible muscle shape, losing all excess fat. "
            "Hamstrings developed. Calves lean and athletic. "
            "The complete dream: slim waist, big round glutes, strong shapely legs."
        ),
        ("very_high", "fat_loss", "female"): (
            "radical fat loss revealing the dream feminine silhouette: "
            "stomach becomes flat, face and neck lean, arms slim and toned, waist narrows. "
            "GLUTES AND LEGS — the absolute priority: thighs dramatically slimmer and toned — "
            "excess fat disappears revealing defined leg muscle shape. "
            "Glutes lift and define as surrounding fat is lost. Calves slim and athletic. "
            "Silhouette transformed from heavy to slim, shapely and feminine."
        ),
        ("very_high", "conditioning", "female"): (
            "radical recomposition into a feminine athletic dream physique: "
            "slim defined waist, flat toned stomach, athletic and toned arms. "
            "GLUTES AND LEGS — the absolute priority: glutes become round, lifted and prominent — "
            "full shapely peach with great muscle tone. "
            "Thighs toned and defined, hamstrings developed, calves lean and athletic. "
            "From heavy and shapeless to strong, feminine and athletic."
        ),

        # HIGH fat (female 33-42%)
        ("high", "hypertrophy", "female"): (
            "dramatically transformed into the dream feminine physique: "
            "significant fat loss plus muscle building — slim defined waist, flat toned stomach, "
            "toned and defined arms and shoulders (feminine, not bulky). "
            "GLUTES AND LEGS — the absolute priority: glutes grow round, full and very lifted — "
            "a prominent shapely peach with clear muscle definition. "
            "Thighs toned and defined with quad shape visible, no excess fat. "
            "Hamstrings developed. Calves muscular and defined. "
            "Lean, strong and feminine — the fitness influencer physique."
        ),
        ("high", "fat_loss", "female"): (
            "dramatically leaner and shapelier: major fat loss reveals the feminine silhouette — "
            "flat stomach, slim narrow waist, lean and toned arms. "
            "GLUTES AND LEGS — the absolute priority: thighs become significantly slimmer and toned — "
            "visible muscle definition, lean calves. "
            "Glutes lift and define as surrounding fat disappears. "
            "Athletic, slim and feminine from head to toe."
        ),
        ("high", "conditioning", "female"): (
            "transformed into a feminine athletic physique: fat loss plus muscle development — "
            "slim waist, flat defined stomach, toned arms and shoulders. "
            "GLUTES AND LEGS — the absolute priority: glutes round, lifted and prominent. "
            "Thighs lean and toned with visible muscle definition. "
            "Hamstrings developed. Calves defined. "
            "Strong, lean and athletic — the complete feminine athlete."
        ),

        # MODERATE fat (female 25-33%)
        ("moderate", "hypertrophy", "female"): (
            "the dream feminine athletic physique: leaner with visible muscle tone throughout — "
            "slim defined waist, flat stomach with visible abs, "
            "toned defined arms and shoulders (athletic, not bulky). "
            "GLUTES AND LEGS — the absolute priority: glutes very round, full and prominently lifted — "
            "a shapely peach with deep muscle definition and great volume. "
            "Quads toned and defined with visible separation. "
            "Hamstrings developed and prominent. Calves muscular and defined. "
            "Strong shapely legs — the fitness model aesthetic."
        ),
        ("moderate", "fat_loss", "female"): (
            "lean and defined feminine physique: fat loss reveals the dream silhouette — "
            "visible flat abs, slim defined waist, toned arms. "
            "GLUTES AND LEGS — the absolute priority: lean and defined — "
            "visible quad separation, firm and lifted glutes, defined hamstrings, lean athletic calves. "
            "Athletic, lean and shapely."
        ),
        ("moderate", "conditioning", "female"): (
            "feminine athletic physique: lean with muscle definition everywhere — "
            "slim defined waist, visible abs, toned athletic arms and shoulders. "
            "GLUTES AND LEGS — the absolute priority: round full glutes with impressive lift and definition, "
            "powerful toned thighs, hamstrings visible, muscular calves. "
            "Strong, shapely and complete — the ultimate feminine athletic look."
        ),

        # LOW fat (female <25%)
        # Já está lean — foco total em crescer glúteos e pernas.
        ("low", "hypertrophy", "female"): (
            "the dream feminine physique: already lean so the entire focus is "
            "growing glutes and legs as much as possible — "
            "ultra-slim defined waist, sharp visible abs, "
            "defined athletic shoulders and arms (toned and feminine). "
            "GLUTES AND LEGS — the absolute priority and sole focus: "
            "glutes grown to maximum size — very round, very full, very prominently lifted, "
            "with deep muscle definition — elite fitness competitor glutes. "
            "Quads significantly larger and defined with clear muscle separation. "
            "Hamstrings thick and prominent. Diamond-shaped muscular calves. "
            "The complete dream: an impossibly shapely lower body, slim waist, feminine and powerful."
        ),
        ("low", "fat_loss", "female"): (
            "ultra-lean and sharply defined feminine physique: "
            "visible abs with clear separation, very slim defined waist, striated athletic shoulders. "
            "GLUTES AND LEGS — the absolute priority: very defined and lean — "
            "glute muscle definition clearly visible, lean quad separation, "
            "defined hamstrings, athletic calves — competition-level physique."
        ),
        ("low", "conditioning", "female"): (
            "world-class feminine athletic physique: extremely lean with exceptional definition — "
            "very slim waist, visible abs, athletic toned shoulders and arms. "
            "GLUTES AND LEGS — the absolute priority: elite round full glutes with sharp definition, "
            "powerful defined quads and hamstrings, muscular calves — "
            "the complete feminine athletic package at the absolute peak."
        ),

        # ── MAINTENANCE (shared) ──────────────────────────────────────────────
        ("very_high", "maintenance"): (
            "major transformation: significant fat reduction across the entire body — "
            "much flatter stomach, leaner face and neck, slimmer arms. "
            "LEGS: thighs noticeably slimmer and more toned — "
            "natural muscle shape starts to show as fat reduces. "
            "Overall silhouette goes from obese to fit and healthy."
        ),
        ("high", "maintenance"): (
            "fit and well-defined: noticeably leaner with good muscle tone revealed throughout. "
            "Flat stomach, defined arms and shoulders. "
            "LEGS: toned and athletic — visible muscle shape in thighs and calves, "
            "no excess fat — healthy, energetic and fit."
        ),
        ("moderate", "maintenance"): (
            "toned and defined: good muscle definition, flat stomach with ab outline visible, "
            "defined arms and shoulders. "
            "LEGS: lean and toned with visible muscle definition — "
            "athletic calves, defined thighs — fit and energetic appearance."
        ),
        ("low", "maintenance"): (
            "well-defined and fit: sharp muscle tone throughout, visible abs, defined arms and shoulders. "
            "LEGS: lean and defined — visible quad and hamstring tone, athletic calves — "
            "healthy athletic peak condition."
        ),
    }

    return ""  # replaced by _build_prompt


def _build_prompt(scores: dict) -> str:
    fat_pct = float(scores.get("body_fat_estimate_pct", 20.0))

    return (
        f"Edit this photograph to show this person's ultimate dream physique transformation.\n\n"
        f"STEP 1 — ASSESS the body in this photo:\n"
        f"Look at the person and determine: their sex, their current body fat level, and their current muscle development in every visible area. "
        f"Calculate exactly how much transformation is needed. "
        f"Someone with a lot of fat needs a massive transformation. "
        f"Someone already lean needs maximum muscle development. "
        f"Someone in between needs both — leaner AND bigger at the same time. "
        f"Let the starting point determine the magnitude.\n\n"
        f"STEP 2 — APPLY the transformation to reach the dream physique for this person:\n"
        f"If male: lean, dry and muscular (\"seco e volumoso\") — around 12% body fat: completely flat stomach with sharp visible abs, "
        f"zero softness anywhere. Maximum lean muscle mass — large powerful chest, very broad shoulders, thick arms with visible veins, "
        f"wide muscular back with strong V-taper, powerful legs with large defined quads, thick hamstrings and prominent calves. "
        f"Every muscle group fully developed, defined and visible.\n"
        f"If female: lean, sculpted and shapely — around 15% body fat: completely flat stomach with visible abs, "
        f"ultra slim defined waist with sharp hourglass shape. Glutes: very round, very full and prominently lifted — the absolute priority. "
        f"Legs: powerful and sculpted — large defined quads, thick hamstrings, muscular calves. "
        f"Shoulders: round and defined — athletic, not bony. Arms: toned and shapely. Back: developed and defined.\n\n"
        f"EMPHASIS: Get as lean AND as muscular as possible simultaneously — eliminate all fat AND push every visible muscle to its maximum size.\n\n"
        f"BALANCE — non-negotiable:\n"
        f"Only transform what is actually visible in the photo — never invent body parts that are not shown. "
        f"If legs are visible: transform them with the same intensity as the upper body, never leave them behind. "
        f"If the photo is waist-up: focus entirely on what is visible, do NOT generate or modify legs.\n\n"
        f"MAGNITUDE — non-negotiable:\n"
        f"This transformation must be LARGE and VISIBLE. Never subtle, never small. "
        f"If there is fat — remove ALL of it. "
        f"If there are muscles to build — build them to their MAXIMUM size. "
        f"The before and after must look like two completely different bodies. "
        f"The person must look at this and be genuinely shocked: 'I cannot believe that could be me.'\n\n"
        f"DO NOT INVENT — non-negotiable:\n"
        f"Never add anything that does not exist in the original photo. "
        f"No tattoos, no scars, no jewelry, no accessories, no new clothing, no changes to hairstyle. "
        f"If the person has a tattoo — keep it exactly. If they have none — add none. "
        f"Only the body composition changes — everything else is identical to the original.\n\n"
        f"KEEP EXACTLY:\n"
        f"- Same background, same environment, same room\n"
        f"- Same lighting direction and mood\n"
        f"- Same skeletal frame — height, bone structure, limb length\n"
        f"- Same skin tone\n"
        f"- Same pose and body angle\n"
        f"- Same clothing — shirtless stays shirtless, shorts stay shorts, leggings stay leggings\n\n"
        f"FACE: soft circular Gaussian blur over the face only — everything else sharp.\n\n"
        f"STYLE: photorealistic — real photograph quality, ultra high detail, not CGI or illustration.\n\n"
        f"Starting point: approximately {fat_pct:.0f}% body fat. Same frame and proportions — transformed physique."
    )



def _resize(image_bytes: bytes, max_px: int = 1024) -> bytes:
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

        prompt = _build_prompt(scores)
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
                        threshold="BLOCK_NONE",
                    ),
                    genai_types.SafetySetting(
                        category="HARM_CATEGORY_SEXUALLY_EXPLICIT",
                        threshold="BLOCK_NONE",
                    ),
                    genai_types.SafetySetting(
                        category="HARM_CATEGORY_HATE_SPEECH",
                        threshold="BLOCK_NONE",
                    ),
                    genai_types.SafetySetting(
                        category="HARM_CATEGORY_DANGEROUS_CONTENT",
                        threshold="BLOCK_NONE",
                    ),
                ],
            ),
        )

        num_candidates = len(response.candidates) if response.candidates else 0
        print(f"[future_self] Gemini responded — {num_candidates} candidate(s)", flush=True)
        for candidate in response.candidates or []:
            finish = getattr(candidate, "finish_reason", None)
            has_content = candidate.content is not None and candidate.content.parts is not None
            num_parts = len(candidate.content.parts) if has_content else 0
            print(f"[future_self] candidate finish={finish} parts={num_parts}", flush=True)
            if not has_content:
                logger.warning("[future_self] Candidate blocked — finish_reason=%s", finish)
                print(f"[future_self] Candidate blocked by safety filter — finish_reason={finish}", flush=True)
                continue
            for part in candidate.content.parts:
                if part.inline_data and part.inline_data.data:
                    raw = part.inline_data.data
                    image_bytes = raw if isinstance(raw, bytes) else base64.b64decode(raw)
                    logger.info("[future_self] Image generated successfully (%s bytes)", len(image_bytes))
                    print(f"[future_self] Image generated successfully ({len(image_bytes)} bytes)", flush=True)
                    return image_bytes
            logger.warning("[future_self] Candidate had no image — finish_reason=%s", finish)
            print(f"[future_self] Candidate had no image — finish_reason={finish}", flush=True)

        logger.warning("[future_self] Gemini returned no image in response")
        print("[future_self] Gemini returned no image in response", flush=True)
        return None

    except Exception as exc:
        logger.error("[future_self] Generation failed (%s): %s", type(exc).__name__, exc)
        print(f"[future_self] Generation FAILED ({type(exc).__name__}): {exc}", flush=True)
        return None
