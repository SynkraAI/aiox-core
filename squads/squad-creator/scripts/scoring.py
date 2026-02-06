#!/usr/bin/env python3
"""
Script: scoring.py
Purpose: Calculate weighted quality scores for squads
Operations: 10+ deterministic calculations

Scoring Dimensions (weights sum to 1.0):
- Structure & Config: 0.15
- Agent Quality: 0.25
- Task Quality: 0.20
- Documentation: 0.15
- Integration: 0.10
- Naming & Standards: 0.15

Usage:
    python scripts/scoring.py squads/squad-creator/
    python scripts/scoring.py squads/squad-creator/ --output json
    python scripts/scoring.py squads/squad-creator/ --detailed
"""

import argparse
import json
import os
import subprocess
import sys
from pathlib import Path
from typing import Dict, Any, Tuple


# Scoring weights
WEIGHTS = {
    "structure": 0.15,
    "agents": 0.25,
    "tasks": 0.20,
    "documentation": 0.15,
    "integration": 0.10,
    "naming": 0.15
}


def run_script(script_name: str, squad_path: str) -> Dict:
    """Run a validation script and return JSON results."""
    script_path = os.path.join(os.path.dirname(__file__), script_name)
    try:
        result = subprocess.run(
            ["python3", script_path, squad_path, "--output", "json"],
            capture_output=True,
            text=True,
            timeout=30
        )
        return json.loads(result.stdout)
    except Exception as e:
        return {"error": str(e)}


def score_structure(squad_path: str) -> Tuple[float, Dict]:
    """Score structure and configuration (0-10)."""
    score = 10.0
    details = {"deductions": [], "checks": {}}

    # Check config.yaml exists
    config_exists = os.path.exists(os.path.join(squad_path, "config.yaml"))
    details["checks"]["config_yaml"] = config_exists
    if not config_exists:
        score -= 3.0
        details["deductions"].append({"reason": "Missing config.yaml", "points": -3.0})

    # Check README.md exists
    readme_exists = os.path.exists(os.path.join(squad_path, "README.md"))
    details["checks"]["readme"] = readme_exists
    if not readme_exists:
        score -= 2.0
        details["deductions"].append({"reason": "Missing README.md", "points": -2.0})

    # Check CHANGELOG.md exists
    changelog_exists = os.path.exists(os.path.join(squad_path, "CHANGELOG.md"))
    details["checks"]["changelog"] = changelog_exists
    if not changelog_exists:
        score -= 0.5
        details["deductions"].append({"reason": "Missing CHANGELOG.md", "points": -0.5})

    # Check required directories
    required_dirs = ["agents", "tasks"]
    for dir_name in required_dirs:
        exists = os.path.exists(os.path.join(squad_path, dir_name))
        details["checks"][f"dir_{dir_name}"] = exists
        if not exists:
            score -= 2.0
            details["deductions"].append({"reason": f"Missing {dir_name}/", "points": -2.0})

    # Check optional directories
    optional_dirs = ["templates", "checklists", "data", "workflows"]
    opt_count = sum(1 for d in optional_dirs if os.path.exists(os.path.join(squad_path, d)))
    details["checks"]["optional_dirs_count"] = opt_count
    if opt_count < 2:
        score -= 0.5
        details["deductions"].append({"reason": f"Only {opt_count} optional dirs", "points": -0.5})

    return max(0, score), details


def score_agents(squad_path: str) -> Tuple[float, Dict]:
    """Score agent quality (0-10)."""
    score = 10.0
    details = {"deductions": [], "checks": {}}

    agents_dir = os.path.join(squad_path, "agents")
    if not os.path.exists(agents_dir):
        return 0.0, {"error": "No agents directory"}

    agents = [f for f in os.listdir(agents_dir) if f.endswith('.md')]
    details["checks"]["agent_count"] = len(agents)

    if len(agents) == 0:
        return 0.0, {"error": "No agents found"}

    # Check agent line counts
    low_line_agents = 0
    for agent_file in agents:
        file_path = os.path.join(agents_dir, agent_file)
        with open(file_path, 'r', encoding='utf-8') as f:
            lines = sum(1 for _ in f)
        if lines < 300:
            low_line_agents += 1

    details["checks"]["low_line_agents"] = low_line_agents
    if low_line_agents > 0:
        penalty = min(3.0, low_line_agents * 0.5)
        score -= penalty
        details["deductions"].append({
            "reason": f"{low_line_agents} agents under 300 lines",
            "points": -penalty
        })

    return max(0, score), details


def score_tasks(squad_path: str) -> Tuple[float, Dict]:
    """Score task quality (0-10)."""
    score = 10.0
    details = {"deductions": [], "checks": {}}

    tasks_dir = os.path.join(squad_path, "tasks")
    if not os.path.exists(tasks_dir):
        return 0.0, {"error": "No tasks directory"}

    tasks = [f for f in os.listdir(tasks_dir) if f.endswith('.md')]
    details["checks"]["task_count"] = len(tasks)

    if len(tasks) == 0:
        return 0.0, {"error": "No tasks found"}

    # Check task line counts
    low_line_tasks = 0
    for task_file in tasks:
        file_path = os.path.join(tasks_dir, task_file)
        with open(file_path, 'r', encoding='utf-8') as f:
            lines = sum(1 for _ in f)
        if lines < 100:
            low_line_tasks += 1

    details["checks"]["low_line_tasks"] = low_line_tasks
    if low_line_tasks > 0:
        penalty = min(3.0, low_line_tasks * 0.3)
        score -= penalty
        details["deductions"].append({
            "reason": f"{low_line_tasks} tasks under 100 lines",
            "points": -penalty
        })

    return max(0, score), details


def score_documentation(squad_path: str) -> Tuple[float, Dict]:
    """Score documentation quality (0-10)."""
    score = 10.0
    details = {"deductions": [], "checks": {}}

    # Check README length
    readme_path = os.path.join(squad_path, "README.md")
    if os.path.exists(readme_path):
        with open(readme_path, 'r', encoding='utf-8') as f:
            readme_lines = sum(1 for _ in f)
        details["checks"]["readme_lines"] = readme_lines
        if readme_lines < 50:
            score -= 2.0
            details["deductions"].append({"reason": "README under 50 lines", "points": -2.0})
        elif readme_lines < 100:
            score -= 1.0
            details["deductions"].append({"reason": "README under 100 lines", "points": -1.0})
    else:
        score -= 3.0
        details["checks"]["readme_lines"] = 0
        details["deductions"].append({"reason": "No README.md", "points": -3.0})

    # Check for docs directory
    docs_dir = os.path.join(squad_path, "docs")
    has_docs = os.path.exists(docs_dir)
    details["checks"]["has_docs_dir"] = has_docs
    if not has_docs:
        score -= 1.0
        details["deductions"].append({"reason": "No docs/ directory", "points": -1.0})

    return max(0, score), details


def score_integration(squad_path: str) -> Tuple[float, Dict]:
    """Score integration completeness (0-10)."""
    score = 10.0
    details = {"deductions": [], "checks": {}}

    # Check for workflows
    workflows_dir = os.path.join(squad_path, "workflows")
    if os.path.exists(workflows_dir):
        workflows = [f for f in os.listdir(workflows_dir) if f.endswith(('.md', '.yaml'))]
        details["checks"]["workflow_count"] = len(workflows)
        if len(workflows) == 0:
            score -= 1.0
            details["deductions"].append({"reason": "Empty workflows/", "points": -1.0})
    else:
        details["checks"]["workflow_count"] = 0
        score -= 1.5
        details["deductions"].append({"reason": "No workflows/", "points": -1.5})

    # Check for checklists
    checklists_dir = os.path.join(squad_path, "checklists")
    if os.path.exists(checklists_dir):
        checklists = [f for f in os.listdir(checklists_dir) if f.endswith('.md')]
        details["checks"]["checklist_count"] = len(checklists)
        if len(checklists) == 0:
            score -= 0.5
            details["deductions"].append({"reason": "Empty checklists/", "points": -0.5})
    else:
        details["checks"]["checklist_count"] = 0
        score -= 1.0
        details["deductions"].append({"reason": "No checklists/", "points": -1.0})

    # Check for templates
    templates_dir = os.path.join(squad_path, "templates")
    if os.path.exists(templates_dir):
        templates = [f for f in os.listdir(templates_dir) if f.endswith(('.md', '.yaml'))]
        details["checks"]["template_count"] = len(templates)
    else:
        details["checks"]["template_count"] = 0
        score -= 1.0
        details["deductions"].append({"reason": "No templates/", "points": -1.0})

    return max(0, score), details


def score_naming(squad_path: str) -> Tuple[float, Dict]:
    """Score naming conventions (0-10)."""
    score = 10.0
    details = {"deductions": [], "checks": {}}

    # Try running naming_validator
    try:
        naming_result = run_script("naming_validator.py", squad_path)
        if "error" not in naming_result:
            errors = naming_result.get("errors", 0)
            warnings = naming_result.get("warnings", 0)
            details["checks"]["naming_errors"] = errors
            details["checks"]["naming_warnings"] = warnings

            score -= errors * 1.0
            score -= warnings * 0.3
            if errors > 0:
                details["deductions"].append({"reason": f"{errors} naming errors", "points": -errors})
            if warnings > 0:
                details["deductions"].append({"reason": f"{warnings} naming warnings", "points": -warnings * 0.3})
    except Exception as e:
        details["checks"]["naming_check_error"] = str(e)

    return max(0, score), details


def calculate_score(squad_path: str) -> Dict[str, Any]:
    """Calculate overall weighted score."""
    squad_path = squad_path.rstrip('/')
    squad_name = os.path.basename(squad_path)

    if not os.path.exists(squad_path):
        return {
            "squad_name": squad_name,
            "exists": False,
            "error": f"Squad path not found: {squad_path}"
        }

    results = {
        "squad_name": squad_name,
        "squad_path": squad_path,
        "exists": True,
        "weights": WEIGHTS,
        "dimensions": {},
        "weighted_scores": {},
        "total_score": 0.0,
        "grade": ""
    }

    # Calculate each dimension
    dimensions = {
        "structure": score_structure(squad_path),
        "agents": score_agents(squad_path),
        "tasks": score_tasks(squad_path),
        "documentation": score_documentation(squad_path),
        "integration": score_integration(squad_path),
        "naming": score_naming(squad_path)
    }

    total_weighted = 0.0
    for dim_name, (score, details) in dimensions.items():
        weight = WEIGHTS[dim_name]
        weighted = score * weight
        results["dimensions"][dim_name] = {
            "score": round(score, 2),
            "weight": weight,
            "weighted": round(weighted, 2),
            "details": details
        }
        results["weighted_scores"][dim_name] = round(weighted, 2)
        total_weighted += weighted

    results["total_score"] = round(total_weighted, 2)

    # Assign grade
    if total_weighted >= 9.0:
        results["grade"] = "A+"
    elif total_weighted >= 8.0:
        results["grade"] = "A"
    elif total_weighted >= 7.0:
        results["grade"] = "B"
    elif total_weighted >= 6.0:
        results["grade"] = "C"
    elif total_weighted >= 5.0:
        results["grade"] = "D"
    else:
        results["grade"] = "F"

    return results


def print_report(results: Dict[str, Any], detailed: bool = False) -> None:
    """Print human-readable report."""
    print(f"\nScoring Report: {results['squad_name']}")
    print("=" * 50)

    if not results.get("exists"):
        print(f"ERROR: {results.get('error', 'Squad not found')}")
        return

    print(f"\nTotal Score: {results['total_score']}/10 (Grade: {results['grade']})")
    print("\nDimension Scores:")
    print("-" * 50)
    print(f"{'Dimension':<20} {'Score':<8} {'Weight':<8} {'Weighted':<8}")
    print("-" * 50)

    for dim_name, dim_data in results["dimensions"].items():
        print(f"{dim_name:<20} {dim_data['score']:<8.1f} {dim_data['weight']:<8.2f} {dim_data['weighted']:<8.2f}")

    print("-" * 50)
    print(f"{'TOTAL':<20} {'':<8} {'':<8} {results['total_score']:<8.2f}")

    if detailed:
        print("\nDetails:")
        for dim_name, dim_data in results["dimensions"].items():
            if dim_data["details"].get("deductions"):
                print(f"\n  {dim_name}:")
                for ded in dim_data["details"]["deductions"]:
                    print(f"    - {ded['reason']} ({ded['points']:+.1f})")


def main():
    parser = argparse.ArgumentParser(description="Calculate squad quality score")
    parser.add_argument("squad_path", help="Path to squad directory")
    parser.add_argument("--output", choices=["text", "json"], default="text",
                        help="Output format")
    parser.add_argument("--detailed", action="store_true",
                        help="Show detailed deductions")

    args = parser.parse_args()

    results = calculate_score(args.squad_path)

    if args.output == "json":
        print(json.dumps(results, indent=2))
    else:
        print_report(results, args.detailed)

    # Exit with grade-based code
    grade = results.get("grade", "F")
    sys.exit(0 if grade in ["A+", "A", "B"] else 1)


if __name__ == "__main__":
    main()
