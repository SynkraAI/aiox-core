import logging
from typing import TypedDict

logger = logging.getLogger(__name__)

MUSCLE_LABELS: dict[str, str] = {
    "quadriceps": "Quadríceps",
    "glutes": "Glúteos",
    "calves": "Panturrilhas",
    "biceps": "Bíceps",
    "triceps": "Tríceps",
    "chest": "Peitoral",
    "abs": "Abdômen",
    "traps": "Trapézio",
    "lats": "Dorsal",
    "shoulders": "Ombros",
}


class ReportSection(TypedDict):
    muscle_group: str
    title: str
    description: str
    score: int


class Report(TypedDict):
    highlights: list
    development_areas: list


def generate_report(scores: dict, body_composition: dict, profile: dict) -> Report:
    """Constrói highlights e development_areas direto dos muscle_scores do Vision."""
    muscle_scores = body_composition.get("muscle_scores", {})

    scored = sorted(
        [
            (k, v)
            for k, v in muscle_scores.items()
            if isinstance(v, dict) and "score" in v and k in MUSCLE_LABELS
        ],
        key=lambda x: x[1]["score"],
        reverse=True,
    )

    highlights: list[ReportSection] = [
        ReportSection(
            muscle_group=k,
            title=f"{MUSCLE_LABELS[k]} em destaque",
            description=str(v.get("note", "")),
            score=int(v["score"]),
        )
        for k, v in scored[:3]
    ]

    development_areas: list[ReportSection] = [
        ReportSection(
            muscle_group=k,
            title=f"{MUSCLE_LABELS[k]} com potencial",
            description=str(v.get("note", "")),
            score=int(v["score"]),
        )
        for k, v in scored[-3:][::-1]
    ]

    return Report(highlights=highlights, development_areas=development_areas)
