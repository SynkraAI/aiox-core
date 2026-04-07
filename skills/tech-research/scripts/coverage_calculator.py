#!/usr/bin/env python3
"""Coverage score calculation and stopping decision for tech-research pipeline.

Worker atoms: atm_calc_coverage, atm_calc_newinfo, atm_stopping_decision
Deterministic: weighted math + threshold rules, no LLM needed.

Usage:
    echo '{"fundamentals":0.9,"implementation":0.7,...}' | python coverage_calculator.py coverage
    python coverage_calculator.py newinfo --new 12 --total 20
    echo '{"coverage":72,"newinfo":0.3,"wave":1,"high_sources":5}' | python coverage_calculator.py stop
"""

import sys
import json

DIMENSION_WEIGHTS = {
    "fundamentals": 0.20,
    "implementation": 0.25,
    "comparison": 0.15,
    "best_practices": 0.20,
    "real_world": 0.10,
    "current_state": 0.10,
}


def calculate_coverage_score(dimension_scores: dict) -> dict:
    """Calculate weighted coverage score with breakdown."""
    total = 0.0
    breakdown = {}

    for dimension, weight in DIMENSION_WEIGHTS.items():
        score = dimension_scores.get(dimension, 0.0)
        if isinstance(score, (int, float)):
            if score > 1.0:
                score = score / 100.0
            weighted = score * weight
            total += weighted
            breakdown[dimension] = round(score * 100, 1)

    coverage_score = round(total * 100, 1)

    return {
        "coverage_score": coverage_score,
        "coverage_breakdown": breakdown,
        "weights": DIMENSION_WEIGHTS,
    }


def calculate_new_info_ratio(new_facts: int, total_facts: int) -> dict:
    """Calculate ratio of new unique information."""
    if total_facts == 0:
        ratio = 1.0
    else:
        ratio = round(new_facts / total_facts, 3)

    return {
        "new_info_ratio": ratio,
        "new_facts": new_facts,
        "total_facts": total_facts,
    }


def should_stop(
    coverage_score: float,
    new_info_ratio: float,
    wave: int,
    high_sources: int,
    consecutive_low_ratios: int = 0,
) -> dict:
    """Determine if research should stop."""
    if wave >= 3:
        return {
            "decision": "STOP",
            "reason": "Max iterations reached (wave >= 3)",
            "rule": "HARD_STOP",
        }

    if coverage_score >= 85 and high_sources >= 3:
        return {
            "decision": "STOP",
            "reason": f"Sufficient quality coverage ({coverage_score}%, {high_sources} HIGH sources)",
            "rule": "HARD_STOP",
        }

    if new_info_ratio < 0.10 and consecutive_low_ratios >= 2:
        return {
            "decision": "STOP",
            "reason": f"Diminishing returns confirmed (ratio {new_info_ratio} for {consecutive_low_ratios} waves)",
            "rule": "HARD_STOP",
        }

    if coverage_score < 50 and wave == 1:
        return {
            "decision": "CONTINUE",
            "reason": f"Insufficient first wave ({coverage_score}%)",
            "rule": "MUST_CONTINUE",
        }

    if coverage_score >= 70 and wave >= 2:
        return {
            "decision": "STOP",
            "reason": f"Acceptable coverage achieved ({coverage_score}%, wave {wave})",
            "rule": "SOFT_STOP",
        }

    if coverage_score >= 80:
        return {
            "decision": "STOP",
            "reason": f"Coverage threshold met ({coverage_score}%)",
            "rule": "SOFT_STOP",
        }

    return {
        "decision": "CONTINUE",
        "reason": f"Coverage {coverage_score}% below threshold, wave {wave}",
        "rule": "CONTINUE",
    }


def main():
    if len(sys.argv) < 2:
        print("Usage: coverage_calculator.py <coverage|newinfo|stop> [args]", file=sys.stderr)
        sys.exit(1)

    command = sys.argv[1]

    if command == "coverage":
        data = json.loads(sys.stdin.read())
        result = calculate_coverage_score(data)
        print(json.dumps(result, indent=2))

    elif command == "newinfo":
        if "--new" in sys.argv and "--total" in sys.argv:
            new_idx = sys.argv.index("--new") + 1
            total_idx = sys.argv.index("--total") + 1
            result = calculate_new_info_ratio(int(sys.argv[new_idx]), int(sys.argv[total_idx]))
        else:
            data = json.loads(sys.stdin.read())
            result = calculate_new_info_ratio(data["new_facts"], data["total_facts"])
        print(json.dumps(result, indent=2))

    elif command == "stop":
        data = json.loads(sys.stdin.read())
        result = should_stop(
            coverage_score=data.get("coverage", data.get("coverage_score", 0)),
            new_info_ratio=data.get("newinfo", data.get("new_info_ratio", 1.0)),
            wave=data.get("wave", 1),
            high_sources=data.get("high_sources", 0),
            consecutive_low_ratios=data.get("consecutive_low_ratios", 0),
        )
        print(json.dumps(result, indent=2))

    else:
        print(f"Unknown command: {command}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
