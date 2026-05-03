from dataclasses import dataclass, asdict


@dataclass
class BodyScores:
    shoulders: int
    chest: int
    back: int
    arms: int
    core: int
    legs: int
    posture_score: int
    symmetry_score: int
    v_taper_score: int
    proportion_balance: int
    body_fat_estimate: int  # percentual * 10 para preservar decimal como int (185 = 18.5%)

    def to_dict(self) -> dict:
        d = asdict(self)
        d["body_fat_estimate_pct"] = d.pop("body_fat_estimate") / 10.0
        return d


def _clamp(value: float) -> int:
    return max(0, min(100, int(value)))


def _x(lm: dict, key: str) -> float:
    return lm.get(key, {}).get("x", 0.5)


def _y(lm: dict, key: str) -> float:
    return lm.get(key, {}).get("y", 0.5)


def _bmi_body_fat(profile: dict) -> float:
    """Estimativa de gordura via fórmula de Deurenberg (BMI + sexo)."""
    height = profile.get("height_cm") or 170
    weight = profile.get("weight_kg") or 75
    sex = profile.get("sex", "M")
    bmi = weight / ((height / 100) ** 2)
    # Deurenberg: BF% = 1.20×BMI + 0.23×age − 10.8×sex − 5.4  (sex: 1=M, 0=F)
    sex_factor = 1 if sex == "M" else 0
    bf = 1.20 * bmi + 0.23 * 25 - 10.8 * sex_factor - 5.4  # age 25 default
    return max(5.0, min(45.0, bf))


def neutral_scores(profile: dict | None = None) -> BodyScores:
    """Scores neutros (50) quando pose não é detectada. Body fat ainda vem do BMI."""
    profile = profile or {}
    bf_pct = _bmi_body_fat(profile)
    return BodyScores(
        shoulders=50, chest=50, back=50, arms=50, core=50, legs=50,
        posture_score=50, symmetry_score=50,
        v_taper_score=50, proportion_balance=50,
        body_fat_estimate=int(bf_pct * 10),
    )


def calculate_scores(landmarks_front: dict, landmarks_back: dict, profile: dict | None = None) -> BodyScores:
    """Derive BodyScores from MediaPipe landmark dicts + optional profile data."""
    profile = profile or {}

    # --- Shoulder metrics ---
    ls_x = _x(landmarks_front, "left_shoulder")
    rs_x = _x(landmarks_front, "right_shoulder")
    lh_x = _x(landmarks_front, "left_hip")
    rh_x = _x(landmarks_front, "right_hip")
    hip_w = max(abs(rh_x - lh_x), 0.01)
    shoulder_w = abs(rs_x - ls_x)

    # Shoulders: shoulder/hip ratio vs golden target ~1.3
    shoulders = _clamp((shoulder_w / hip_w / 1.3) * 75 + 10)

    # Chest: correlated with shoulder development (geometric proxy)
    chest = _clamp(shoulders * 0.85 + 10)

    # Back: back-view shoulder width
    bls_x = _x(landmarks_back, "left_shoulder")
    brs_x = _x(landmarks_back, "right_shoulder")
    back_w = abs(brs_x - bls_x)
    back = _clamp((back_w / 0.35) * 60 + 20)

    # Arms: wrist-elbow horizontal spread proxy
    lw_x = _x(landmarks_front, "left_wrist")
    le_x = _x(landmarks_front, "left_elbow")
    arms = _clamp(abs(lw_x - le_x) * 300 + 40)

    # Core: horizontal deviation hip-center from shoulder-center
    shoulder_cx = (ls_x + rs_x) / 2
    hip_cx = (lh_x + rh_x) / 2
    core = _clamp((1 - abs(shoulder_cx - hip_cx) * 5) * 70 + 15)

    # Legs: knee width vs hip width
    lk_x = _x(landmarks_front, "left_knee")
    rk_x = _x(landmarks_front, "right_knee")
    knee_w = abs(rk_x - lk_x)
    legs = _clamp((knee_w / hip_w) * 80 + 20)

    # Posture: vertical alignment nose → shoulder center → hip center
    nose_x = _x(landmarks_front, "nose")
    deviation = abs(nose_x - shoulder_cx) + abs(shoulder_cx - hip_cx)
    posture = _clamp((1 - deviation * 4) * 100)

    # Symmetry: average L/R y-coordinate difference for 4 joint pairs
    pairs = [
        ("left_shoulder", "right_shoulder"),
        ("left_hip", "right_hip"),
        ("left_knee", "right_knee"),
        ("left_wrist", "right_wrist"),
    ]
    diffs = [abs(_y(landmarks_front, l) - _y(landmarks_front, r)) for l, r in pairs]
    symmetry = _clamp((1 - sum(diffs) / len(diffs) * 15) * 100)

    # --- V-taper score: shoulder/hip ratio vs ideal 1.618 (golden ratio) ---
    vtaper_ratio = shoulder_w / hip_w
    v_taper_score = _clamp((vtaper_ratio / 1.618) * 80 + 5)

    # --- Proportion balance: how evenly developed upper vs lower body is ---
    upper_avg = (shoulders + chest + back + arms) / 4
    lower_avg = (legs + core) / 2
    balance_diff = abs(upper_avg - lower_avg)
    proportion_balance = _clamp(100 - balance_diff * 1.2)

    # --- Body fat estimate from BMI + profile ---
    bf_pct = _bmi_body_fat(profile)
    body_fat_int = int(bf_pct * 10)  # 18.5% → 185

    return BodyScores(
        shoulders=shoulders,
        chest=chest,
        back=back,
        arms=arms,
        core=core,
        legs=legs,
        posture_score=posture,
        symmetry_score=symmetry,
        v_taper_score=v_taper_score,
        proportion_balance=proportion_balance,
        body_fat_estimate=body_fat_int,
    )
