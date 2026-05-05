import base64
import io
import json
import logging
import os
from typing import TypedDict

import anthropic
from PIL import Image

logger = logging.getLogger(__name__)
client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

MAX_IMAGE_PX = 1024


VISION_PROMPT = """\
Você é um avaliador físico especialista com 20 anos de experiência em musculação e fisiculturismo.
Analise estas duas fotos corporais (frente e costas) e retorne SOMENTE um JSON válido, sem markdown.

Estrutura obrigatória:
{
  "body_fat_estimate": <float: percentual estimado de gordura, ex: 18.5>,
  "body_fat_category": <"muito_magro"|"magro"|"atlético"|"médio"|"acima_media"|"obeso">,
  "fat_distribution": <"uniforme"|"abdominal"|"membros_inferiores"|"flancos"|"generalizada">,
  "fat_areas": [<regiões com gordura localizada visível, ex: "abdomen", "flancos", "coxas", "glúteos">],
  "body_type": <"ectomorfo"|"mesomorfo"|"endomorfo"|"misto">,
  "muscle_scores": {
    "quadriceps": { "score": <int 0-100>, "note": <string: 1-2 frases específicas sobre este grupo> },
    "glutes":     { "score": <int 0-100>, "note": <string> },
    "calves":     { "score": <int 0-100>, "note": <string> },
    "biceps":     { "score": <int 0-100>, "note": <string> },
    "triceps":    { "score": <int 0-100>, "note": <string> },
    "chest":      { "score": <int 0-100>, "note": <string> },
    "abs":        { "score": <int 0-100>, "note": <string> },
    "traps":      { "score": <int 0-100>, "note": <string> },
    "lats":       { "score": <int 0-100>, "note": <string> },
    "shoulders":  { "score": <int 0-100>, "note": <string> }
  },
  "overall_score": <int 0-100: média ponderada de todos os grupos>,
  "strengths_summary": <string: 2-3 frases sobre os pontos mais fortes do físico>,
  "weaknesses_summary": <string: 2-3 frases sobre as principais áreas a desenvolver>,
  "overall_assessment": <string: avaliação direta em 2 frases curtas, linguagem simples para leigo, sem jargão técnico, tom de coach acessível>
}

Critérios de score muscular (0-100):
- 0-30: pouco desenvolvido, sem volume ou definição visível
- 31-50: abaixo da média, desenvolvimento inicial
- 51-70: desenvolvimento moderado, dentro da média
- 71-85: bem desenvolvido, boa volumetria e definição
- 86-100: excelente, nível avançado/atlético

Regras de distribuição dos scores — CRÍTICO:
- Use a escala completa. Scores clustered entre 50-65 para todos os grupos indicam avaliação imprecisa.
- Sempre haverá grupos mais fortes e mais fracos — reflita isso nos números.
- O grupo mais forte do físico deve receber score ≥ 70. O mais fraco deve receber score ≤ 45.
- A diferença entre o maior e o menor score deve ser de no mínimo 25 pontos.
- Se o físico for genuinamente equilibrado, ainda assim diferencie: o melhor grupo fica mais próximo de 75, o pior mais próximo de 45.

Regras para as notas:
- Seja específico: mencione volumetria, definição, inserções visíveis, cobertura de gordura quando relevante
- Compare o grupo com o restante do físico (ex: "bíceps bem desenvolvidos em contraste com tríceps menos volumosos")
- Foco no que é visível — não invente o que não pode ver
- Todas as notas em português brasileiro"""


class MuscleScore(TypedDict):
    score: int
    note: str


class MuscleScores(TypedDict):
    quadriceps: MuscleScore
    glutes: MuscleScore
    calves: MuscleScore
    biceps: MuscleScore
    triceps: MuscleScore
    chest: MuscleScore
    abs: MuscleScore
    traps: MuscleScore
    lats: MuscleScore
    shoulders: MuscleScore


class BodyComposition(TypedDict):
    body_fat_estimate: float
    body_fat_category: str
    fat_distribution: str
    fat_areas: list
    body_type: str
    muscle_scores: MuscleScores
    overall_score: int
    strengths_summary: str
    weaknesses_summary: str
    overall_assessment: str
    vision_analyzed: bool


_NEUTRAL_MUSCLE: MuscleScore = {"score": 50, "note": "Análise visual não disponível para este grupo."}

_MUSCLE_KEYS = ("quadriceps", "glutes", "calves", "biceps", "triceps", "chest", "abs", "traps", "lats", "shoulders")


def _resize_image(image_bytes: bytes, max_px: int = MAX_IMAGE_PX) -> bytes:
    img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    w, h = img.size
    if max(w, h) > max_px:
        ratio = max_px / max(w, h)
        img = img.resize((int(w * ratio), int(h * ratio)), Image.LANCZOS)
    buf = io.BytesIO()
    img.save(buf, format="JPEG", quality=85)
    return buf.getvalue()


def _to_base64(image_bytes: bytes) -> str:
    return base64.standard_b64encode(image_bytes).decode("utf-8")


def _fallback_composition(profile: dict) -> BodyComposition:
    sex = profile.get("sex", "M")
    height = float(profile.get("height_cm") or 170)
    weight = float(profile.get("weight_kg") or 75)
    bmi = weight / ((height / 100) ** 2)

    if sex == "F":
        fat = max(10.0, min(45.0, bmi * 0.8 + 7.0))
    else:
        fat = max(5.0, min(40.0, bmi * 0.7 - 3.0))

    if fat < 12:
        category = "muito_magro"
    elif fat < 17:
        category = "magro"
    elif fat < 22:
        category = "atlético"
    elif fat < 27:
        category = "médio"
    elif fat < 32:
        category = "acima_media"
    else:
        category = "obeso"

    neutral_scores: MuscleScores = {k: dict(_NEUTRAL_MUSCLE) for k in _MUSCLE_KEYS}  # type: ignore[assignment]

    return BodyComposition(
        body_fat_estimate=round(fat, 1),
        body_fat_category=category,
        fat_distribution="uniforme",
        fat_areas=[],
        body_type="misto",
        muscle_scores=neutral_scores,
        overall_score=50,
        strengths_summary="Análise visual não disponível. Dados baseados no perfil.",
        weaknesses_summary="Para uma análise completa, envie novas fotos com boa iluminação e fundo neutro.",
        overall_assessment="Continue focado no seu objetivo. Com dados visuais limitados, mantenha consistência e progressão.",
        vision_analyzed=False,
    )


def analyze_body_vision(
    front_bytes: bytes, back_bytes: bytes, profile: dict
) -> BodyComposition:
    """Analisa composição corporal e pontuação muscular usando Claude Vision."""
    try:
        front_resized = _resize_image(front_bytes)
        back_resized = _resize_image(back_bytes)

        profile_context = (
            f"Perfil: sexo={profile.get('sex','?')}, "
            f"altura={profile.get('height_cm','?')}cm, "
            f"peso={profile.get('weight_kg','?')}kg, "
            f"objetivo={profile.get('goal','geral')}"
        )

        response = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=2048,
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "image",
                            "source": {
                                "type": "base64",
                                "media_type": "image/jpeg",
                                "data": _to_base64(front_resized),
                            },
                        },
                        {
                            "type": "image",
                            "source": {
                                "type": "base64",
                                "media_type": "image/jpeg",
                                "data": _to_base64(back_resized),
                            },
                        },
                        {
                            "type": "text",
                            "text": f"{VISION_PROMPT}\n\n{profile_context}",
                        },
                    ],
                }
            ],
        )

        raw = response.content[0].text.strip()
        raw = raw.removeprefix("```json").removeprefix("```").removesuffix("```").strip()
        data = json.loads(raw)

        raw_scores = data.get("muscle_scores", {})
        muscle_scores: MuscleScores = {
            k: MuscleScore(
                score=int(raw_scores.get(k, {}).get("score", 50)),
                note=str(raw_scores.get(k, {}).get("note", "")),
            )
            for k in _MUSCLE_KEYS  # type: ignore[misc]
        }

        return BodyComposition(
            body_fat_estimate=float(data.get("body_fat_estimate", 20.0)),
            body_fat_category=str(data.get("body_fat_category", "médio")),
            fat_distribution=str(data.get("fat_distribution", "uniforme")),
            fat_areas=list(data.get("fat_areas", [])),
            body_type=str(data.get("body_type", "misto")),
            muscle_scores=muscle_scores,
            overall_score=int(data.get("overall_score", 50)),
            strengths_summary=str(data.get("strengths_summary", "")),
            weaknesses_summary=str(data.get("weaknesses_summary", "")),
            overall_assessment=str(data.get("overall_assessment", "")),
            vision_analyzed=True,
        )

    except (anthropic.APIError, json.JSONDecodeError, Exception) as exc:
        logger.error("[vision_analyzer] Vision failed (%s: %s), propagating",
                     type(exc).__name__, exc)
        raise
