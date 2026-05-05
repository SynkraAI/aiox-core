import asyncio
import logging
import os
from functools import partial

import httpx
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.pipeline.plan_generator import generate_workout_plan
from app.pipeline.report_generator import generate_report
from app.pipeline.vision_analyzer import analyze_body_vision
from app.services.db_service import get_analysis, mark_failed, mark_photos_deleted
from app.services.s3_service import delete_all_photos, download_photo

logger = logging.getLogger(__name__)
router = APIRouter()

API_GATEWAY_URL = os.getenv("API_GATEWAY_URL", "http://localhost:3000")
INTERNAL_SECRET = os.getenv("INTERNAL_SECRET", "")


class AnalyzeRequest(BaseModel):
    analysis_id: str
    user_id: str


def _build_scores(body_composition: dict) -> dict:
    """Extrai scores numéricos de muscle_scores + métricas globais."""
    muscle_scores = body_composition.get("muscle_scores", {})
    scores: dict = {}
    for group, data in muscle_scores.items():
        if isinstance(data, dict) and "score" in data:
            scores[group] = int(data["score"])
    scores["overall_score"] = int(body_composition.get("overall_score", 50))
    scores["body_fat_estimate_pct"] = float(body_composition.get("body_fat_estimate", 0.0))
    return scores


@router.post("/analyze")
async def analyze(request: AnalyzeRequest):
    analysis_id = request.analysis_id

    try:
        # 1. Fetch analysis + user profile
        analysis = get_analysis(analysis_id)
        if not analysis:
            raise ValueError(f"Analysis {analysis_id} not found")

        front_url: str = analysis["photo_front_url"]
        back_url: str = analysis["photo_back_url"]
        if not front_url or not back_url:
            raise ValueError("Missing photo URLs")

        profile = {
            "sex": analysis.get("sex"),
            "goal": analysis.get("goal"),
            "height_cm": float(analysis["height_cm"]) if analysis.get("height_cm") is not None else None,
            "weight_kg": float(analysis["weight_kg"]) if analysis.get("weight_kg") is not None else None,
        }

        # 2. Download photos em paralelo
        loop = asyncio.get_event_loop()
        front_bytes, back_bytes = await asyncio.gather(
            loop.run_in_executor(None, download_photo, front_url),
            loop.run_in_executor(None, download_photo, back_url),
        )

        # 3. Claude Vision — análise completa com scores musculares
        logger.info("[ai-engine] Running Claude Vision analysis for %s", analysis_id)
        body_composition = await loop.run_in_executor(
            None, analyze_body_vision, front_bytes, back_bytes, profile
        )

        # 4. Build scores dict from vision output
        scores_dict = _build_scores(dict(body_composition))

        # 5. LGPD: deletar fotos + gerar relatório e plano em paralelo
        bc_dict = dict(body_composition)
        report, workout_plan, _ = await asyncio.gather(
            loop.run_in_executor(None, partial(generate_report, scores_dict, bc_dict, profile)),
            loop.run_in_executor(None, partial(generate_workout_plan, scores_dict, bc_dict, profile)),
            loop.run_in_executor(None, delete_all_photos, front_url, back_url),
        )
        mark_photos_deleted(analysis_id)

        # 7. Callback ao API Gateway
        async with httpx.AsyncClient(timeout=30) as http:
            resp = await http.post(
                f"{API_GATEWAY_URL}/internal/analyses/{analysis_id}/complete",
                json={
                    "scores": scores_dict,
                    "report": dict(report),
                    "workout_plan": dict(workout_plan),
                    "body_composition": dict(body_composition),
                },
                headers={"x-internal-secret": INTERNAL_SECRET},
            )
            resp.raise_for_status()

        return {"status": "completed", "analysis_id": analysis_id}

    except Exception as exc:
        logger.error("[ai-engine] Pipeline failed for %s: %s", analysis_id, exc, exc_info=True)
        try:
            mark_failed(analysis_id)
        except Exception as db_err:
            logger.error("[ai-engine] Failed to mark %s as failed: %s", analysis_id, db_err)
        raise HTTPException(status_code=500, detail=str(exc))
