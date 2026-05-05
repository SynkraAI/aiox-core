import json
import logging
import os
from typing import TypedDict

import anthropic

logger = logging.getLogger(__name__)
client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

SYSTEM_PROMPT = (
    "Você é um personal trainer especializado em prescrição de treinos.\n"
    "Gere um plano de treino de 4 semanas baseado nos scores de composição corporal.\n\n"
    "Estrutura JSON obrigatória:\n"
    '{ "weeks": [ { "week_number": 1, "sessions": [ WorkoutSession ] } ] }\n\n'
    "WorkoutSession:\n"
    '{ "day": <"Segunda"|"Terça"|"Quarta"|"Quinta"|"Sexta"|"Sábado">,\n'
    '  "focus": <nome do treino, ex: "Peito + Tríceps">,\n'
    '  "muscle_groups": <string[]>,\n'
    '  "exercises": <Exercise[]> }\n\n'
    "Exercise:\n"
    '{ "name": <string>, "muscle_group": <string>, "sets": <number>, "reps": <string>, "rest_seconds": <number>, "note": <string|null> }\n\n'
    "Regras:\n"
    "- 5 sessões por semana: Segunda, Terça, Quarta, Quinta e Sexta\n"
    "- 5 a 6 exercícios por sessão\n"
    "- Use splits: Segunda='Peito + Tríceps' | Terça='Bíceps + Costas' | Quarta='Pernas' | Quinta='Ombros + Trapézio'\n"
    "- Sexta: dedique ao grupo muscular com MENOR score na análise (ex: se glúteos=28, Sexta='Glúteos + Posterior'). Use o score mais baixo dos fornecidos para decidir.\n"
    "- Semana 1: volume moderado | Semanas 2-3: volume crescente | Semana 4: deload\n"
    "- Variação obrigatória: troque pelo menos 2 exercícios por sessão a cada semana (ex: Semana 1 usa Supino reto, Semana 2 substitui por Supino inclinado). Nunca repita a lista idêntica de exercícios entre semanas.\n"
    "- Priorize grupos com scores mais baixos\n"
    "- Responda SOMENTE com JSON válido, sem markdown."
)


class WorkoutPlan(TypedDict):
    weeks: list


def _validate_plan(data: dict) -> WorkoutPlan:
    if "weeks" not in data or not isinstance(data["weeks"], list) or not data["weeks"]:
        raise ValueError("WorkoutPlan missing or empty weeks array")
    for week in data["weeks"]:
        if "week_number" not in week or "sessions" not in week:
            raise ValueError("WorkoutWeek missing week_number or sessions")
    return WorkoutPlan(weeks=data["weeks"])


_EXERCISES_BY_GROUP: dict[str, list[list[dict]]] = {
    "shoulders": [
        [{"name": "Desenvolvimento com halteres", "muscle_group": "shoulders", "sets": 4, "reps": "10-12", "rest_seconds": 90, "note": None},
         {"name": "Elevação lateral", "muscle_group": "shoulders", "sets": 3, "reps": "12-15", "rest_seconds": 60, "note": None}],
        [{"name": "Desenvolvimento na máquina", "muscle_group": "shoulders", "sets": 4, "reps": "10-12", "rest_seconds": 90, "note": None},
         {"name": "Elevação frontal", "muscle_group": "shoulders", "sets": 3, "reps": "12-15", "rest_seconds": 60, "note": None}],
        [{"name": "Desenvolvimento Arnold", "muscle_group": "shoulders", "sets": 4, "reps": "10-12", "rest_seconds": 90, "note": None},
         {"name": "Remada alta", "muscle_group": "shoulders", "sets": 3, "reps": "12-15", "rest_seconds": 60, "note": None}],
        [{"name": "Desenvolvimento com barra", "muscle_group": "shoulders", "sets": 4, "reps": "8-10", "rest_seconds": 90, "note": None},
         {"name": "Elevação lateral inclinada", "muscle_group": "shoulders", "sets": 3, "reps": "15", "rest_seconds": 60, "note": None}],
    ],
    "chest": [
        [{"name": "Supino reto", "muscle_group": "chest", "sets": 4, "reps": "8-10", "rest_seconds": 120, "note": None},
         {"name": "Crucifixo", "muscle_group": "chest", "sets": 3, "reps": "12-15", "rest_seconds": 60, "note": None}],
        [{"name": "Supino inclinado", "muscle_group": "chest", "sets": 4, "reps": "8-10", "rest_seconds": 120, "note": None},
         {"name": "Crossover", "muscle_group": "chest", "sets": 3, "reps": "12-15", "rest_seconds": 60, "note": None}],
        [{"name": "Supino declinado", "muscle_group": "chest", "sets": 4, "reps": "8-10", "rest_seconds": 120, "note": None},
         {"name": "Pullover", "muscle_group": "chest", "sets": 3, "reps": "12", "rest_seconds": 60, "note": None}],
        [{"name": "Supino com halteres", "muscle_group": "chest", "sets": 4, "reps": "10-12", "rest_seconds": 90, "note": None},
         {"name": "Crucifixo inclinado", "muscle_group": "chest", "sets": 3, "reps": "12-15", "rest_seconds": 60, "note": None}],
    ],
    "back": [
        [{"name": "Remada curvada", "muscle_group": "lats", "sets": 4, "reps": "8-10", "rest_seconds": 120, "note": None},
         {"name": "Puxada na frente", "muscle_group": "lats", "sets": 3, "reps": "10-12", "rest_seconds": 90, "note": None}],
        [{"name": "Remada unilateral", "muscle_group": "lats", "sets": 4, "reps": "10-12", "rest_seconds": 90, "note": None},
         {"name": "Puxada atrás", "muscle_group": "lats", "sets": 3, "reps": "10-12", "rest_seconds": 90, "note": None}],
        [{"name": "Remada na máquina", "muscle_group": "lats", "sets": 4, "reps": "10-12", "rest_seconds": 90, "note": None},
         {"name": "Puxada com triângulo", "muscle_group": "lats", "sets": 3, "reps": "12", "rest_seconds": 90, "note": None}],
        [{"name": "Levantamento terra", "muscle_group": "lats", "sets": 4, "reps": "6-8", "rest_seconds": 150, "note": None},
         {"name": "Puxada na frente", "muscle_group": "lats", "sets": 3, "reps": "10-12", "rest_seconds": 90, "note": None}],
    ],
    "arms": [
        [{"name": "Rosca direta", "muscle_group": "biceps", "sets": 3, "reps": "12-15", "rest_seconds": 60, "note": None},
         {"name": "Tríceps testa", "muscle_group": "triceps", "sets": 3, "reps": "12-15", "rest_seconds": 60, "note": None}],
        [{"name": "Rosca martelo", "muscle_group": "biceps", "sets": 3, "reps": "12-15", "rest_seconds": 60, "note": None},
         {"name": "Tríceps corda", "muscle_group": "triceps", "sets": 3, "reps": "12-15", "rest_seconds": 60, "note": None}],
        [{"name": "Rosca concentrada", "muscle_group": "biceps", "sets": 3, "reps": "12-15", "rest_seconds": 60, "note": None},
         {"name": "Tríceps francês", "muscle_group": "triceps", "sets": 3, "reps": "12-15", "rest_seconds": 60, "note": None}],
        [{"name": "Rosca 21", "muscle_group": "biceps", "sets": 3, "reps": "21", "rest_seconds": 75, "note": None},
         {"name": "Mergulho no banco", "muscle_group": "triceps", "sets": 3, "reps": "15", "rest_seconds": 60, "note": None}],
    ],
    "core": [
        [{"name": "Prancha abdominal", "muscle_group": "abs", "sets": 3, "reps": "40s", "rest_seconds": 45, "note": None},
         {"name": "Abdominal infra", "muscle_group": "abs", "sets": 3, "reps": "15", "rest_seconds": 45, "note": None}],
        [{"name": "Abdominal crunch", "muscle_group": "abs", "sets": 3, "reps": "20", "rest_seconds": 45, "note": None},
         {"name": "Prancha lateral", "muscle_group": "abs", "sets": 3, "reps": "30s", "rest_seconds": 45, "note": None}],
        [{"name": "Elevação de pernas", "muscle_group": "abs", "sets": 3, "reps": "15", "rest_seconds": 45, "note": None},
         {"name": "Abdominal oblíquo", "muscle_group": "abs", "sets": 3, "reps": "20", "rest_seconds": 45, "note": None}],
        [{"name": "Abdominal na roda", "muscle_group": "abs", "sets": 3, "reps": "12", "rest_seconds": 60, "note": None},
         {"name": "Mountain climber", "muscle_group": "abs", "sets": 3, "reps": "30s", "rest_seconds": 45, "note": None}],
    ],
    "legs": [
        [{"name": "Agachamento livre", "muscle_group": "quadriceps", "sets": 4, "reps": "10-12", "rest_seconds": 120, "note": None},
         {"name": "Leg press", "muscle_group": "quadriceps", "sets": 3, "reps": "12-15", "rest_seconds": 90, "note": None},
         {"name": "Cadeira extensora", "muscle_group": "quadriceps", "sets": 3, "reps": "15", "rest_seconds": 60, "note": None}],
        [{"name": "Agachamento sumô", "muscle_group": "glutes", "sets": 4, "reps": "12", "rest_seconds": 120, "note": None},
         {"name": "Cadeira abdutora", "muscle_group": "glutes", "sets": 3, "reps": "15", "rest_seconds": 60, "note": None},
         {"name": "Panturrilha em pé", "muscle_group": "calves", "sets": 4, "reps": "15-20", "rest_seconds": 60, "note": None}],
        [{"name": "Hack squat", "muscle_group": "quadriceps", "sets": 4, "reps": "10-12", "rest_seconds": 120, "note": None},
         {"name": "Stiff", "muscle_group": "glutes", "sets": 3, "reps": "12", "rest_seconds": 90, "note": None},
         {"name": "Panturrilha sentado", "muscle_group": "calves", "sets": 4, "reps": "15-20", "rest_seconds": 60, "note": None}],
        [{"name": "Avanço", "muscle_group": "quadriceps", "sets": 3, "reps": "12 cada", "rest_seconds": 90, "note": None},
         {"name": "Cadeira flexora", "muscle_group": "glutes", "sets": 3, "reps": "15", "rest_seconds": 60, "note": None},
         {"name": "Leg press 45°", "muscle_group": "quadriceps", "sets": 3, "reps": "15", "rest_seconds": 90, "note": None}],
    ],
    "posterior": [
        [{"name": "Stiff com barra", "muscle_group": "glutes", "sets": 4, "reps": "10-12", "rest_seconds": 120, "note": None},
         {"name": "Cadeira flexora", "muscle_group": "glutes", "sets": 3, "reps": "12-15", "rest_seconds": 90, "note": None},
         {"name": "Glúteo no cabo", "muscle_group": "glutes", "sets": 3, "reps": "15 cada", "rest_seconds": 60, "note": None},
         {"name": "Panturrilha em pé", "muscle_group": "calves", "sets": 4, "reps": "15-20", "rest_seconds": 60, "note": None}],
        [{"name": "Levantamento terra romeno", "muscle_group": "glutes", "sets": 4, "reps": "10-12", "rest_seconds": 120, "note": None},
         {"name": "Agachamento búlgaro", "muscle_group": "glutes", "sets": 3, "reps": "12 cada", "rest_seconds": 90, "note": None},
         {"name": "Abdução no cabo", "muscle_group": "glutes", "sets": 3, "reps": "15 cada", "rest_seconds": 60, "note": None},
         {"name": "Panturrilha sentado", "muscle_group": "calves", "sets": 4, "reps": "15-20", "rest_seconds": 60, "note": None}],
        [{"name": "Hip thrust", "muscle_group": "glutes", "sets": 4, "reps": "12", "rest_seconds": 90, "note": None},
         {"name": "Stiff unilateral", "muscle_group": "glutes", "sets": 3, "reps": "12 cada", "rest_seconds": 90, "note": None},
         {"name": "Cadeira abdutora", "muscle_group": "glutes", "sets": 3, "reps": "15", "rest_seconds": 60, "note": None},
         {"name": "Panturrilha no leg press", "muscle_group": "calves", "sets": 4, "reps": "20", "rest_seconds": 60, "note": None}],
        [{"name": "Agachamento sumô com halter", "muscle_group": "glutes", "sets": 4, "reps": "12", "rest_seconds": 90, "note": None},
         {"name": "Mesa flexora", "muscle_group": "glutes", "sets": 3, "reps": "12-15", "rest_seconds": 90, "note": None},
         {"name": "Glúteo quatro apoios", "muscle_group": "glutes", "sets": 3, "reps": "15 cada", "rest_seconds": 60, "note": None},
         {"name": "Panturrilha em pé", "muscle_group": "calves", "sets": 4, "reps": "15-20", "rest_seconds": 60, "note": None}],
    ],
}

_SPLITS_BASE = [
    {"day": "Segunda", "focus": "Peito + Tríceps",   "groups": ["chest", "arms"]},
    {"day": "Terça",   "focus": "Bíceps + Costas",   "groups": ["arms", "back"]},
    {"day": "Quarta",  "focus": "Pernas",             "groups": ["legs"]},
    {"day": "Quinta",  "focus": "Ombros + Trapézio", "groups": ["shoulders"]},
]

_WEAK_GROUP_MAP = {
    "quadriceps": {"focus": "Pernas (Foco Quadríceps)",  "groups": ["legs"]},
    "glutes":     {"focus": "Glúteos + Posterior",       "groups": ["posterior"]},
    "calves":     {"focus": "Pernas (Foco Panturrilha)", "groups": ["legs"]},
    "biceps":     {"focus": "Bíceps + Costas",           "groups": ["arms", "back"]},
    "triceps":    {"focus": "Peito + Tríceps",           "groups": ["chest", "arms"]},
    "chest":      {"focus": "Peito + Tríceps",           "groups": ["chest", "arms"]},
    "abs":        {"focus": "Abdômen + Core",            "groups": ["core"]},
    "traps":      {"focus": "Ombros + Trapézio",         "groups": ["shoulders"]},
    "lats":       {"focus": "Bíceps + Costas",           "groups": ["arms", "back"]},
    "shoulders":  {"focus": "Ombros + Trapézio",         "groups": ["shoulders"]},
}


def _fallback_plan(scores: dict) -> WorkoutPlan:
    """Rule-based 4-week plan with exercise variation and weakest-group Friday."""
    # Detecta grupo mais fraco excluindo métricas não musculares
    _SKIP = {"overall_score", "body_fat_estimate_pct"}
    muscle_scores = {k: v for k, v in scores.items() if k not in _SKIP and isinstance(v, (int, float))}
    weakest = min(muscle_scores, key=lambda k: muscle_scores[k]) if muscle_scores else "glutes"
    friday = _WEAK_GROUP_MAP.get(weakest, {"focus": "Glúteos + Posterior", "groups": ["posterior"]})

    splits = _SPLITS_BASE + [{"day": "Sexta", **friday}]

    def session(split: dict, week_idx: int) -> dict:
        exercises: list[dict] = []
        for g in split["groups"]:
            pool = _EXERCISES_BY_GROUP.get(g, [])
            if not pool:
                continue
            exercises.extend(pool[week_idx % len(pool)])
            if len(exercises) < 5:
                exercises.extend(pool[(week_idx + 1) % len(pool)])
        return {
            "day": split["day"],
            "focus": split["focus"],
            "muscle_groups": split["groups"],
            "exercises": exercises[:6],
        }

    weeks = [
        {"week_number": w, "sessions": [session(s, w - 1) for s in splits]}
        for w in range(1, 5)
    ]
    return WorkoutPlan(weeks=weeks)


def generate_workout_plan(scores: dict, body_composition: dict, profile: dict) -> WorkoutPlan:
    """Generate 4-week workout plan via Claude with system-prompt caching."""
    fat_pct = body_composition.get("body_fat_estimate", 0)
    fat_areas = ", ".join(body_composition.get("fat_areas", [])) or "não identificadas"
    weaknesses = body_composition.get("weaknesses_summary", "")

    # Build muscle score summary for the plan (groups sorted by score ascending = priority)
    muscle_scores = body_composition.get("muscle_scores", {})
    priority_groups = sorted(
        [(k, v["score"]) for k, v in muscle_scores.items() if isinstance(v, dict) and "score" in v],
        key=lambda x: x[1]
    )
    priority_str = ", ".join(f"{k}={s}" for k, s in priority_groups) or "não disponível"

    user_prompt = (
        f"Scores musculares (menor = mais prioritário):\n{priority_str}\n\n"
        f"Gordura corporal: {fat_pct}%, gordura localizada: {fat_areas}\n"
        f"Pontos a desenvolver: {weaknesses}\n\n"
        f"Perfil: {profile.get('sex', '?')}, objetivo: {profile.get('goal', 'fitness geral')}, "
        f"altura: {profile.get('height_cm','?')}cm, peso: {profile.get('weight_kg','?')}kg\n\n"
        "Gere o plano de 4 semanas priorizando: (1) grupos musculares com scores mais baixos, "
        "(2) redução de gordura localizada se aplicável, (3) equilíbrio proporcional do físico."
    )

    try:
        response = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=8192,
            system=[{"type": "text", "text": SYSTEM_PROMPT, "cache_control": {"type": "ephemeral"}}],
            messages=[{"role": "user", "content": user_prompt}],
        )
        if response.stop_reason == "max_tokens":
            logger.warning("[plan_generator] Response truncated (max_tokens), using fallback")
            return _fallback_plan(scores)
        raw = response.content[0].text.strip()
        raw = raw.removeprefix("```json").removeprefix("```").removesuffix("```").strip()
        data = json.loads(raw)
        return _validate_plan(data)
    except (anthropic.APIError, json.JSONDecodeError, Exception) as exc:
        logger.warning("[plan_generator] Claude unavailable (%s: %s), using rule-based fallback",
                       type(exc).__name__, exc)
        return _fallback_plan(scores)
