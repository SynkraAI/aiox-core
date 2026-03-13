#!/usr/bin/env python3
"""
create-agent-preflight.py - Deterministic preflight checks for create-agent task

Purpose: Execute all deterministic validations BEFORE LLM engagement
Usage: python3 create-agent-preflight.py --squad <squad_name> --specialist <slug> [--sources <path>]

Output: JSON with validation results

Deterministic checks (no LLM needed):
1. Squad exists at squads/{squad_name}/
2. Squad has config.yaml
3. Squad has agents/ directory
4. If specialist: check local sources exist
5. Count source files and lines
6. Validate naming conventions
"""

import argparse
import json
import os
import sys
from pathlib import Path
from datetime import datetime


def count_lines(file_path: Path) -> int:
    """Count lines in a file."""
    try:
        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
            return sum(1 for _ in f)
    except Exception:
        return 0


def validate_squad(squad_name: str, squads_path: str = "squads") -> dict:
    """Validate squad exists and has required structure."""
    squad_path = Path(squads_path) / squad_name

    result = {
        "squad_name": squad_name,
        "squad_path": str(squad_path),
        "exists": squad_path.exists(),
        "has_config": (squad_path / "config.yaml").exists(),
        "has_agents_dir": (squad_path / "agents").exists(),
        "has_readme": (squad_path / "README.md").exists(),
        "agent_count": 0,
        "existing_agents": []
    }

    if result["has_agents_dir"]:
        agents = list((squad_path / "agents").glob("*.md"))
        result["agent_count"] = len(agents)
        result["existing_agents"] = [a.stem for a in agents]

    return result


def check_local_sources(specialist_slug: str, sources_path: str = None) -> dict:
    """Check local knowledge sources for a specialist."""

    # Default paths to search
    search_paths = [
        f"squads/mind-cloning/minds/{specialist_slug}/sources",
        f"squads/mind-cloning/minds/{specialist_slug}/analysis",
        f"squads/*/minds/{specialist_slug}",
    ]

    if sources_path:
        search_paths.insert(0, sources_path)

    result = {
        "specialist_slug": specialist_slug,
        "sources_found": False,
        "total_files": 0,
        "total_lines": 0,
        "coverage_estimate": 0,
        "paths_checked": [],
        "files": []
    }

    for search_pattern in search_paths:
        # Handle glob patterns
        if "*" in search_pattern:
            from glob import glob
            matches = glob(search_pattern)
            paths_to_check = [Path(m) for m in matches]
        else:
            paths_to_check = [Path(search_pattern)]

        for path in paths_to_check:
            result["paths_checked"].append(str(path))

            if path.exists() and path.is_dir():
                result["sources_found"] = True

                for ext in ["*.md", "*.txt", "*.yaml", "*.json"]:
                    for file in path.rglob(ext):
                        lines = count_lines(file)
                        result["files"].append({
                            "path": str(file),
                            "lines": lines
                        })
                        result["total_files"] += 1
                        result["total_lines"] += lines

    # Estimate coverage based on lines
    if result["total_lines"] >= 5000:
        result["coverage_estimate"] = 90
    elif result["total_lines"] >= 2000:
        result["coverage_estimate"] = 70
    elif result["total_lines"] >= 500:
        result["coverage_estimate"] = 40
    elif result["total_lines"] > 0:
        result["coverage_estimate"] = 20

    return result


def validate_agent_name(name: str) -> dict:
    """Validate agent naming conventions."""
    import re

    # kebab-case pattern
    kebab_pattern = r'^[a-z][a-z0-9]*(-[a-z0-9]+)*$'
    # snake_case pattern
    snake_pattern = r'^[a-z][a-z0-9]*(_[a-z0-9]+)*$'

    result = {
        "name": name,
        "is_kebab_case": bool(re.match(kebab_pattern, name)),
        "is_snake_case": bool(re.match(snake_pattern, name)),
        "valid": False,
        "suggested": None
    }

    result["valid"] = result["is_kebab_case"] or result["is_snake_case"]

    if not result["valid"]:
        # Try to generate a valid name
        suggested = name.lower()
        suggested = re.sub(r'[^a-z0-9]+', '-', suggested)
        suggested = re.sub(r'^-|-$', '', suggested)
        result["suggested"] = suggested

    return result


def main():
    parser = argparse.ArgumentParser(description="Preflight checks for create-agent")
    parser.add_argument("--squad", help="Target squad name")
    parser.add_argument("--pack", dest="legacy_pack", help="Legacy alias for --squad")
    parser.add_argument("--specialist", help="Specialist slug (optional)")
    parser.add_argument("--sources", help="Custom sources path")
    parser.add_argument("--agent-name", help="Proposed agent name to validate")
    parser.add_argument("--squads-path", default="squads", help="Path to squads directory")
    parser.add_argument("--format", choices=["json", "text"], default="json")

    args = parser.parse_args()
    squad_name = args.squad or args.legacy_pack
    if not squad_name:
        parser.error("Missing required argument: --squad (or legacy --pack)")

    # Run validations
    result = {
        "timestamp": datetime.now().isoformat(),
        "squad_validation": validate_squad(squad_name, args.squads_path),
        "pack_validation": None,  # legacy key, filled below for compatibility
        "sources_validation": None,
        "name_validation": None,
        "overall_status": "READY",
        "blockers": [],
        "warnings": [],
        "recommendations": []
    }

    # Backward-compatible payload alias
    result["pack_validation"] = result["squad_validation"]

    # Check squad
    if not result["squad_validation"]["exists"]:
        result["blockers"].append(f"Squad '{squad_name}' does not exist at squads/{squad_name}/")
        result["overall_status"] = "BLOCKED"
    elif not result["squad_validation"]["has_config"]:
        result["warnings"].append("Squad missing config.yaml")

    # Check sources if specialist provided
    if args.specialist:
        result["sources_validation"] = check_local_sources(args.specialist, args.sources)

        if not result["sources_validation"]["sources_found"]:
            result["warnings"].append(f"No local sources found for '{args.specialist}'")
            result["recommendations"].append("Run *auto-acquire-sources or provide sources manually")
        elif result["sources_validation"]["coverage_estimate"] < 50:
            result["warnings"].append(f"Low source coverage ({result['sources_validation']['coverage_estimate']}%)")
            result["recommendations"].append("Consider gathering more sources before extraction")

    # Validate agent name if provided
    if args.agent_name:
        result["name_validation"] = validate_agent_name(args.agent_name)

        if not result["name_validation"]["valid"]:
            result["warnings"].append(f"Agent name '{args.agent_name}' doesn't follow conventions")
            result["recommendations"].append(f"Suggested name: {result['name_validation']['suggested']}")

    # Output
    if args.format == "json":
        print(json.dumps(result, indent=2))
    else:
        print(f"=== CREATE-AGENT PREFLIGHT ===")
        print(f"Status: {result['overall_status']}")
        print(f"\nSquad: {squad_name}")
        print(f"  Exists: {'Yes' if result['squad_validation']['exists'] else 'No'}")
        print(f"  Agents: {result['squad_validation']['agent_count']}")

        if result["sources_validation"]:
            print(f"\nSources for {args.specialist}:")
            print(f"  Found: {'Yes' if result['sources_validation']['sources_found'] else 'No'}")
            print(f"  Files: {result['sources_validation']['total_files']}")
            print(f"  Lines: {result['sources_validation']['total_lines']}")
            print(f"  Coverage: {result['sources_validation']['coverage_estimate']}%")

        if result["blockers"]:
            print(f"\nBLOCKERS:")
            for b in result["blockers"]:
                print(f"  - {b}")

        if result["warnings"]:
            print(f"\nWARNINGS:")
            for w in result["warnings"]:
                print(f"  - {w}")

        if result["recommendations"]:
            print(f"\nRECOMMENDATIONS:")
            for r in result["recommendations"]:
                print(f"  - {r}")

    # Exit code based on status
    sys.exit(0 if result["overall_status"] == "READY" else 1)


if __name__ == "__main__":
    main()
