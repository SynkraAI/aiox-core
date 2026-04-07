#!/usr/bin/env python3
"""Pipeline metrics collection and state persistence.

Worker atoms: atm_compute_metrics, atm_save_state
Deterministic: aggregation + file I/O, no LLM needed.

Usage:
    echo '{"start_time":"...","end_time":"...","sources":[],...}' | python metrics_collector.py compute
    echo '{"pipeline_id":"...","state":{...}}' | python metrics_collector.py save --dir /path/to/output
"""

import sys
import json
import os
from datetime import datetime

try:
    import yaml
    HAS_YAML = True
except ImportError:
    HAS_YAML = False


def compute_metrics(data: dict) -> dict:
    """Compute pipeline execution metrics."""
    start = data.get("start_time")
    end = data.get("end_time")

    duration_seconds = None
    if start and end:
        try:
            t_start = datetime.fromisoformat(start)
            t_end = datetime.fromisoformat(end)
            duration_seconds = round((t_end - t_start).total_seconds(), 1)
        except (ValueError, TypeError):
            pass

    sources = data.get("sources", [])
    high = sum(1 for s in sources if s.get("credibility") == "HIGH")
    medium = sum(1 for s in sources if s.get("credibility") == "MEDIUM")
    low = sum(1 for s in sources if s.get("credibility") == "LOW")
    with_dates = sum(1 for s in sources if s.get("pub_date") and s.get("pub_date") != "date_unknown")
    total = len(sources)
    freshness_ratio = round(with_dates / max(total, 1) * 100, 1)

    return {
        "pipeline_id": data.get("pipeline_id", "unknown"),
        "date": data.get("date", datetime.now().strftime("%Y-%m-%d")),
        "duration_seconds": duration_seconds,
        "coverage_score": data.get("coverage_score"),
        "coverage_breakdown": data.get("coverage_breakdown", {}),
        "integrity_score": data.get("integrity_score"),
        "waves": data.get("waves", 1),
        "sources": {
            "total": total,
            "high_credibility": high,
            "medium_credibility": medium,
            "low_credibility": low,
            "with_dates": with_dates,
            "freshness_ratio": freshness_ratio,
        },
        "claims": data.get("claims", {}),
    }


def save_state(state: dict, output_dir: str) -> dict:
    """Save pipeline state and metrics to files."""
    os.makedirs(output_dir, exist_ok=True)

    metrics_path = os.path.join(output_dir, "metrics.yaml")
    state_path = os.path.join(output_dir, "pipeline-state.yaml")

    metrics = state.get("metrics", state)
    pipeline_state = state.get("state", {
        "pipeline_id": state.get("pipeline_id", "unknown"),
        "status": "completed",
        "current_organism": "org_documentation",
        "wave_number": state.get("waves", 1),
        "coverage_score": state.get("coverage_score"),
        "completed_at": datetime.now().isoformat(),
    })

    if HAS_YAML:
        with open(metrics_path, "w") as f:
            yaml.dump(metrics, f, default_flow_style=False, allow_unicode=True)
        with open(state_path, "w") as f:
            yaml.dump(pipeline_state, f, default_flow_style=False, allow_unicode=True)
    else:
        with open(metrics_path, "w") as f:
            json.dump(metrics, f, indent=2)
        with open(state_path, "w") as f:
            json.dump(pipeline_state, f, indent=2)

    return {
        "metrics_file": metrics_path,
        "state_file": state_path,
        "format": "yaml" if HAS_YAML else "json",
    }


def main():
    if len(sys.argv) < 2:
        print("Usage: metrics_collector.py <compute|save> [--dir <path>]", file=sys.stderr)
        sys.exit(1)

    command = sys.argv[1]

    if command == "compute":
        data = json.loads(sys.stdin.read())
        result = compute_metrics(data)
        print(json.dumps(result, indent=2))

    elif command == "save":
        output_dir = "."
        if "--dir" in sys.argv:
            dir_idx = sys.argv.index("--dir") + 1
            output_dir = sys.argv[dir_idx]

        data = json.loads(sys.stdin.read())
        result = save_state(data, output_dir)
        print(json.dumps(result, indent=2))

    else:
        print(f"Unknown command: {command}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
