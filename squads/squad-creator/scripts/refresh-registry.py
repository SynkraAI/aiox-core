#!/usr/bin/env python3
"""
Squad Registry Refresh Script

Deterministic operations for updating squad-registry.yaml:
- Scan squads/ directory
- Count components (agents, tasks, workflows, etc.)
- Read config.yaml metadata
- Update registry with factual data

LLM handles (non-deterministic):
- Extract keywords from README
- Infer domain category
- Generate highlights
- Generate example_use

Usage:
    python scripts/refresh-registry.py [--output json|yaml] [--squads-path PATH]
"""

import os
import sys
import yaml
import json
import glob
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Any, Optional


def get_squads_path() -> Path:
    """Get the squads directory path"""
    # Try to find squads/ relative to script location
    script_dir = Path(__file__).parent.parent.parent  # squads/squad-creator/scripts -> squads
    if (script_dir / "squad-creator").exists():
        return script_dir

    # Fallback to current directory
    cwd = Path.cwd()
    if (cwd / "squads").exists():
        return cwd / "squads"
    elif cwd.name == "squads":
        return cwd

    raise FileNotFoundError("Could not find squads/ directory")


def count_files(directory: Path, patterns: List[str]) -> int:
    """Count files matching patterns in directory"""
    count = 0
    for pattern in patterns:
        count += len(list(directory.glob(pattern)))
    return count


def read_config_yaml(squad_path: Path) -> Optional[Dict]:
    """Read and parse config.yaml from squad"""
    config_file = squad_path / "config.yaml"
    if not config_file.exists():
        return None

    try:
        with open(config_file, 'r', encoding='utf-8') as f:
            return yaml.safe_load(f)
    except Exception as e:
        print(f"Warning: Could not parse {config_file}: {e}", file=sys.stderr)
        return None


def list_agents(squad_path: Path) -> List[str]:
    """List all agent names in a squad"""
    agents_dir = squad_path / "agents"
    if not agents_dir.exists():
        return []

    agents = []
    for f in agents_dir.glob("*.md"):
        # Skip templates and READMEs
        if f.name.lower() in ['readme.md', 'template.md']:
            continue
        agents.append(f.stem)
    return agents


def scan_squad(squad_path: Path) -> Dict[str, Any]:
    """Scan a single squad and extract deterministic data"""
    squad_name = squad_path.name

    # Read config.yaml
    config = read_config_yaml(squad_path)

    # Count components
    counts = {
        "agents": count_files(squad_path / "agents", ["*.md"]) if (squad_path / "agents").exists() else 0,
        "tasks": count_files(squad_path / "tasks", ["*.md"]) if (squad_path / "tasks").exists() else 0,
        "workflows": count_files(squad_path / "workflows", ["*.md", "*.yaml"]) if (squad_path / "workflows").exists() else 0,
        "templates": count_files(squad_path / "templates", ["*.md", "*.yaml"]) if (squad_path / "templates").exists() else 0,
        "checklists": count_files(squad_path / "checklists", ["*.md"]) if (squad_path / "checklists").exists() else 0,
        "data_files": count_files(squad_path / "data", ["*.md", "*.yaml"]) if (squad_path / "data").exists() else 0,
    }

    # List agent names
    agent_names = list_agents(squad_path)

    # Check for key files
    has_readme = (squad_path / "README.md").exists()
    has_changelog = (squad_path / "CHANGELOG.md").exists()

    # Build result
    result = {
        "name": squad_name,
        "path": f"squads/{squad_name}/",
        "has_config": config is not None,
        "config": {
            "name": config.get("name", squad_name) if config else squad_name,
            "version": config.get("version", "unknown") if config else "unknown",
            "short_title": config.get("short-title", "") if config else "",
            "description": config.get("description", "") if config else "",
            "slashPrefix": config.get("slashPrefix", "") if config else "",
        },
        "counts": counts,
        "agent_names": agent_names,
        "has_readme": has_readme,
        "has_changelog": has_changelog,
        "total_components": sum(counts.values()),
    }

    return result


def scan_all_squads(squads_path: Path) -> Dict[str, Any]:
    """Scan all squads in the squads/ directory"""
    results = {
        "metadata": {
            "scan_date": datetime.now().isoformat(),
            "squads_path": str(squads_path),
            "total_squads": 0,
        },
        "squads": {},
        "summary": {
            "total_agents": 0,
            "total_tasks": 0,
            "total_workflows": 0,
            "total_templates": 0,
            "total_checklists": 0,
            "total_data_files": 0,
        }
    }

    # Directories to skip
    skip_dirs = {'.DS_Store', '__pycache__', 'node_modules', '.git', 'artifacts'}

    # Scan each directory in squads/
    for item in sorted(squads_path.iterdir()):
        if not item.is_dir():
            continue
        if item.name in skip_dirs:
            continue
        if item.name.startswith('.'):
            continue

        # Check if it's a valid squad (has config.yaml or agents/)
        has_config = (item / "config.yaml").exists()
        has_agents = (item / "agents").exists()

        if not (has_config or has_agents):
            continue

        # Scan the squad
        squad_data = scan_squad(item)
        results["squads"][item.name] = squad_data

        # Update summary
        results["summary"]["total_agents"] += squad_data["counts"]["agents"]
        results["summary"]["total_tasks"] += squad_data["counts"]["tasks"]
        results["summary"]["total_workflows"] += squad_data["counts"]["workflows"]
        results["summary"]["total_templates"] += squad_data["counts"]["templates"]
        results["summary"]["total_checklists"] += squad_data["counts"]["checklists"]
        results["summary"]["total_data_files"] += squad_data["counts"]["data_files"]

    results["metadata"]["total_squads"] = len(results["squads"])

    return results


def format_for_registry(scan_results: Dict) -> Dict:
    """Format scan results for squad-registry.yaml structure"""
    registry = {
        "metadata": {
            "version": "1.0.0",
            "last_updated": datetime.now().strftime("%Y-%m-%d"),
            "total_squads": scan_results["metadata"]["total_squads"],
            "maintainer": "squad-creator",
            "generated_by": "scripts/refresh-registry.py",
        },
        "squads": {},
        "summary": scan_results["summary"],
    }

    for name, data in scan_results["squads"].items():
        registry["squads"][name] = {
            "path": data["path"],
            "version": data["config"]["version"],
            "description": data["config"]["description"],
            "slashPrefix": data["config"]["slashPrefix"],
            "counts": data["counts"],
            "agent_names": data["agent_names"],
            "has_readme": data["has_readme"],
            "has_changelog": data["has_changelog"],
            # These fields need LLM to populate:
            "domain": "_TO_BE_INFERRED_",
            "keywords": [],
            "highlights": [],
            "example_use": "",
        }

    return registry


def main():
    import argparse

    parser = argparse.ArgumentParser(description="Scan squads and generate registry data")
    parser.add_argument("--output", choices=["json", "yaml", "summary"], default="yaml",
                        help="Output format")
    parser.add_argument("--squads-path", type=Path, default=None,
                        help="Path to squads/ directory")
    parser.add_argument("--registry-format", action="store_true",
                        help="Output in squad-registry.yaml format")

    args = parser.parse_args()

    # Find squads path
    try:
        squads_path = args.squads_path or get_squads_path()
    except FileNotFoundError as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)

    # Scan all squads
    results = scan_all_squads(squads_path)

    # Format output
    if args.registry_format:
        results = format_for_registry(results)

    # Output
    if args.output == "json":
        print(json.dumps(results, indent=2, ensure_ascii=False))
    elif args.output == "yaml":
        print(yaml.dump(results, allow_unicode=True, default_flow_style=False, sort_keys=False))
    elif args.output == "summary":
        print(f"Squad Registry Scan Results")
        print(f"===========================")
        print(f"Scan Date: {results['metadata']['scan_date']}")
        print(f"Total Squads: {results['metadata']['total_squads']}")
        print()
        print(f"Component Totals:")
        for key, value in results['summary'].items():
            print(f"  {key}: {value}")
        print()
        print(f"Squads Found:")
        for name, data in sorted(results['squads'].items()):
            agents = data['counts']['agents']
            tasks = data['counts']['tasks']
            print(f"  {name}: {agents} agents, {tasks} tasks")


if __name__ == "__main__":
    main()
