import logging
import os

import httpx
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.pipeline.mediapipe_processor import process_image
from app.pipeline.plan_generator import generate_workout_plan
from app.pipeline.report_generator import generate_report
from app.pipeline.score_calculator import calculate_scores, neutral_scores
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
            "height_cm": analysis.get("height_cm"),
            "weight_kg": analysis.get("weight_kg"),
        }

        # 2. Download photos
        front_bytes = download_photo(front_url)
        back_bytes = download_photo(back_url)

        # 3. MediaPipe pose landmarks (com fallback silencioso)
        try:
            landmarks_front = process_image(front_bytes)
            landmarks_back = process_image(back_bytes)
            pose_ok = True
        except ValueError:
            logger.warning("[ai-engine] Pose not detected for %s — using neutral scores", analysis_id)
            landmarks_front = {}
            landmarks_back = {}
            pose_ok = False

        # 4. Claude Vision — análise visual de composição corporal
        #    Executado ANTES de deletar as fotos
        logger.info("[ai-engine] Running Claude Vision analysis for %s", analysis_id)
        body_composition = analyze_body_vision(front_bytes, back_bytes, profile)

        # 5. Geometric score calculation (agora com dados do perfil)
        scores = calculate_scores(landmarks_front, landmarks_back, profile) if pose_ok else neutral_scores(profile)
        scores_dict = scores.to_dict()

        # 6. LGPD: deletar fotos ANTES de persistir resultado
        delete_all_photos(front_url, back_url)
        mark_photos_deleted(analysis_id)

        # 7. Gerar relatório e plano de treino com dados combinados
        report = generate_report(scores_dict, body_composition, profile)
        workout_plan = generate_workout_plan(scores_dict, body_composition, profile)

        # 8. Callback ao API Gateway
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
