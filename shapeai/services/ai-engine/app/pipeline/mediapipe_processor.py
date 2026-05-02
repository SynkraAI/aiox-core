import io
import os
import urllib.request
import mediapipe as mp
from mediapipe.tasks import python as mp_python
from mediapipe.tasks.python import vision
import numpy as np
from PIL import Image

MODEL_PATH = os.path.join(os.path.dirname(__file__), "pose_landmarker.task")
MODEL_URL = (
    "https://storage.googleapis.com/mediapipe-models/pose_landmarker/"
    "pose_landmarker_heavy/float16/latest/pose_landmarker_heavy.task"
)

LANDMARK_NAMES = [
    "nose", "left_eye_inner", "left_eye", "left_eye_outer",
    "right_eye_inner", "right_eye", "right_eye_outer",
    "left_ear", "right_ear", "mouth_left", "mouth_right",
    "left_shoulder", "right_shoulder", "left_elbow", "right_elbow",
    "left_wrist", "right_wrist", "left_pinky", "right_pinky",
    "left_index", "right_index", "left_thumb", "right_thumb",
    "left_hip", "right_hip", "left_knee", "right_knee",
    "left_ankle", "right_ankle", "left_heel", "right_heel",
    "left_foot_index", "right_foot_index",
]


def _ensure_model() -> None:
    if not os.path.exists(MODEL_PATH):
        print("[mediapipe] Baixando modelo pose_landmarker (~29MB)...")
        urllib.request.urlretrieve(MODEL_URL, MODEL_PATH)
        print("[mediapipe] Modelo baixado ✅")


def process_image(image_bytes: bytes) -> dict:
    """Process image bytes with MediaPipe Pose Tasks API; return normalized landmarks dict."""
    _ensure_model()

    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    image_np = np.array(image)
    mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=image_np)

    base_options = mp_python.BaseOptions(model_asset_path=MODEL_PATH)
    options = vision.PoseLandmarkerOptions(
        base_options=base_options,
        running_mode=vision.RunningMode.IMAGE,
    )

    with vision.PoseLandmarker.create_from_options(options) as detector:
        result = detector.detect(mp_image)

    if not result.pose_landmarks:
        raise ValueError("No pose detected in image")

    landmarks: dict = {}
    for idx, lm in enumerate(result.pose_landmarks[0]):
        name = LANDMARK_NAMES[idx] if idx < len(LANDMARK_NAMES) else f"landmark_{idx}"
        landmarks[name] = {
            "x": lm.x,
            "y": lm.y,
            "z": lm.z,
            "visibility": lm.visibility,
        }

    return landmarks
