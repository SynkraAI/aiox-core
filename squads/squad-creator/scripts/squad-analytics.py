#!/usr/bin/env python3
"""
Squad Analytics Script

Generates detailed analytics report for all squads in the ecosystem.
Shows: agents, tasks, workflows, templates, checklists, data files, scripts.

Usage:
    python scripts/squad-analytics.py [--format table|json] [--sort-by agents|tasks|total]

Note: Uses only standard library (no external dependencies)
"""

import os
import sys
import json
import re
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Any, Optional


def get_squads_path() -> Path:
    """Get the squads directory path"""
    script_dir = Path(__file__).parent.parent.parent
    if (script_dir / "squad-creator").exists():
        return script_dir

    cwd = Path.cwd()
    if (cwd / "squads").exists():
        return cwd / "squads"
    elif cwd.name == "squads":
        return cwd

    raise FileNotFoundError("Could not find squads/ directory")


def count_files_by_extension(directory: Path, extensions: List[str]) -> int:
    """Count files with specific extensions in directory"""
    if not directory.exists():
        return 0

    count = 0
    for ext in extensions:
        count += len(list(directory.glob(f"*{ext}")))
    return count


def count_md_files(directory: Path) -> int:
    """Count markdown files excluding README"""
    if not directory.exists():
        return 0

    count = 0
    for f in directory.glob("*.md"):
        if f.name.lower() not in ['readme.md', 'template.md', '_template.md']:
            count += 1
    return count


def list_files(directory: Path, extensions: List[str], exclude: List[str] = None) -> List[str]:
    """List files with specific extensions"""
    if not directory.exists():
        return []

    exclude = exclude or ['readme.md', 'template.md', '_template.md']
    files = []
    for ext in extensions:
        for f in directory.glob(f"*{ext}"):
            if f.name.lower() not in exclude:
                files.append(f.stem)
    return sorted(files)


def simple_yaml_parse(content: str) -> Dict[str, str]:
    """Simple YAML parser for basic key: value pairs (no nested structures)"""
    result = {}
    for line in content.split('\n'):
        line = line.strip()
        if not line or line.startswith('#'):
            continue
        if ':' in line:
            key, _, value = line.partition(':')
            key = key.strip()
            value = value.strip().strip('"').strip("'")
            if key and not key.startswith('-'):
                result[key] = value
    return result


def read_config(squad_path: Path) -> Optional[Dict]:
    """Read squad config.yaml (simple parsing)"""
    config_file = squad_path / "config.yaml"
    if not config_file.exists():
        return None

    try:
        with open(config_file, 'r', encoding='utf-8') as f:
            return simple_yaml_parse(f.read())
    except:
        return None


def analyze_squad(squad_path: Path) -> Dict[str, Any]:
    """Analyze a single squad in detail"""
    name = squad_path.name
    config = read_config(squad_path)

    # Count all component types
    counts = {
        "agents": count_md_files(squad_path / "agents"),
        "tasks": count_md_files(squad_path / "tasks"),
        "workflows": count_md_files(squad_path / "workflows") + count_files_by_extension(squad_path / "workflows", [".yaml", ".yml"]),
        "templates": count_md_files(squad_path / "templates") + count_files_by_extension(squad_path / "templates", [".yaml", ".yml"]),
        "checklists": count_md_files(squad_path / "checklists"),
        "data": count_md_files(squad_path / "data") + count_files_by_extension(squad_path / "data", [".yaml", ".yml", ".json"]),
        "scripts": count_files_by_extension(squad_path / "scripts", [".py", ".js", ".ts", ".sh"]),
    }

    # List components (for detailed view)
    components = {
        "agents": list_files(squad_path / "agents", [".md"]),
        "tasks": list_files(squad_path / "tasks", [".md"]),
        "workflows": list_files(squad_path / "workflows", [".md", ".yaml", ".yml"]),
        "templates": list_files(squad_path / "templates", [".md", ".yaml", ".yml"]),
        "checklists": list_files(squad_path / "checklists", [".md"]),
        "data": list_files(squad_path / "data", [".md", ".yaml", ".yml", ".json"]),
        "scripts": list_files(squad_path / "scripts", [".py", ".js", ".ts", ".sh"]),
    }

    # Check documentation
    has_readme = (squad_path / "README.md").exists()
    has_changelog = (squad_path / "CHANGELOG.md").exists()
    has_config = config is not None

    # Calculate totals
    total = sum(counts.values())

    # Get metadata from config
    domain = ""
    description = ""
    version = "unknown"

    if config:
        domain = config.get("domain", config.get("short-title", ""))
        description = config.get("description", "")
        version = config.get("version", "unknown")

    return {
        "name": name,
        "domain": domain,
        "description": description,
        "version": version,
        "counts": counts,
        "components": components,
        "total": total,
        "has_readme": has_readme,
        "has_changelog": has_changelog,
        "has_config": has_config,
        "quality_score": calculate_quality_score(counts, has_readme, has_config),
    }


def calculate_quality_score(counts: Dict, has_readme: bool, has_config: bool) -> str:
    """Calculate a simple quality indicator"""
    score = 0

    # Base points for having components
    if counts["agents"] > 0: score += 2
    if counts["tasks"] > 0: score += 2
    if counts["workflows"] > 0: score += 1
    if counts["templates"] > 0: score += 1
    if counts["checklists"] > 0: score += 1
    if counts["data"] > 0: score += 1

    # Bonus for documentation
    if has_readme: score += 1
    if has_config: score += 1

    # Rating
    if score >= 9: return "⭐⭐⭐"
    if score >= 6: return "⭐⭐"
    if score >= 3: return "⭐"
    return "🔨"  # Work in progress


def analyze_all_squads(squads_path: Path) -> Dict[str, Any]:
    """Analyze all squads"""
    skip_dirs = {'.DS_Store', '__pycache__', 'node_modules', '.git', 'artifacts'}

    results = {
        "metadata": {
            "scan_date": datetime.now().isoformat(),
            "generated_by": "squad-analytics.py",
        },
        "squads": [],
        "totals": {
            "squads": 0,
            "agents": 0,
            "tasks": 0,
            "workflows": 0,
            "templates": 0,
            "checklists": 0,
            "data": 0,
            "scripts": 0,
            "total_components": 0,
        }
    }

    for item in sorted(squads_path.iterdir()):
        if not item.is_dir():
            continue
        if item.name in skip_dirs or item.name.startswith('.'):
            continue

        # Check if it's a valid squad
        has_config = (item / "config.yaml").exists()
        has_agents = (item / "agents").exists()

        if not (has_config or has_agents):
            continue

        squad_data = analyze_squad(item)
        results["squads"].append(squad_data)

        # Update totals
        results["totals"]["squads"] += 1
        for key in ["agents", "tasks", "workflows", "templates", "checklists", "data", "scripts"]:
            results["totals"][key] += squad_data["counts"][key]
        results["totals"]["total_components"] += squad_data["total"]

    return results


def format_table(results: Dict, detailed: bool = False) -> str:
    """Format results as ASCII table"""
    lines = []

    # Header
    lines.append("=" * 100)
    lines.append("📊 AIOS SQUAD ANALYTICS")
    lines.append(f"Generated: {results['metadata']['scan_date'][:10]}")
    lines.append("=" * 100)
    lines.append("")

    # Summary
    t = results["totals"]
    lines.append(f"📈 ECOSYSTEM SUMMARY")
    lines.append(f"   Squads: {t['squads']} | Agents: {t['agents']} | Tasks: {t['tasks']} | Workflows: {t['workflows']}")
    lines.append(f"   Templates: {t['templates']} | Checklists: {t['checklists']} | Data: {t['data']} | Scripts: {t['scripts']}")
    lines.append(f"   Total Components: {t['total_components']}")
    lines.append("")

    # Table header
    lines.append("-" * 100)
    header = f"{'Squad':<20} {'Agents':>7} {'Tasks':>7} {'WFs':>5} {'Tmpls':>6} {'Checks':>7} {'Data':>6} {'Scripts':>8} {'Total':>6} {'Quality'}"
    lines.append(header)
    lines.append("-" * 100)

    # Sort by total components (descending)
    sorted_squads = sorted(results["squads"], key=lambda x: x["total"], reverse=True)

    for squad in sorted_squads:
        c = squad["counts"]
        row = f"{squad['name']:<20} {c['agents']:>7} {c['tasks']:>7} {c['workflows']:>5} {c['templates']:>6} {c['checklists']:>7} {c['data']:>6} {c['scripts']:>8} {squad['total']:>6} {squad['quality_score']}"
        lines.append(row)

        # Detailed view: show component names
        if detailed and squad["total"] > 0:
            for comp_type, comp_list in squad["components"].items():
                if comp_list:
                    lines.append(f"   └─ {comp_type}: {', '.join(comp_list[:5])}" +
                               (f" (+{len(comp_list)-5} more)" if len(comp_list) > 5 else ""))
            lines.append("")

    lines.append("-" * 100)

    # Top squads by category
    lines.append("")
    lines.append("🏆 TOP SQUADS BY CATEGORY")
    lines.append("")

    categories = [
        ("agents", "Most Agents"),
        ("tasks", "Most Tasks"),
        ("workflows", "Most Workflows"),
        ("checklists", "Most Checklists"),
    ]

    for cat, label in categories:
        top = sorted(results["squads"], key=lambda x: x["counts"][cat], reverse=True)[:3]
        if top and top[0]["counts"][cat] > 0:
            top_str = ", ".join([f"{s['name']} ({s['counts'][cat]})" for s in top if s["counts"][cat] > 0])
            lines.append(f"   {label}: {top_str}")

    lines.append("")
    lines.append("=" * 100)

    return "\n".join(lines)


def main():
    import argparse

    parser = argparse.ArgumentParser(description="Generate squad analytics report")
    parser.add_argument("--format", choices=["table", "json"], default="table",
                        help="Output format")
    parser.add_argument("--detailed", "-d", action="store_true",
                        help="Show detailed component lists")
    parser.add_argument("--sort-by", choices=["name", "agents", "tasks", "total"], default="total",
                        help="Sort squads by field")
    parser.add_argument("--squads-path", type=Path, default=None,
                        help="Path to squads/ directory")

    args = parser.parse_args()

    try:
        squads_path = args.squads_path or get_squads_path()
    except FileNotFoundError as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)

    results = analyze_all_squads(squads_path)

    # Sort if needed
    if args.sort_by == "name":
        results["squads"].sort(key=lambda x: x["name"])
    elif args.sort_by in ["agents", "tasks"]:
        results["squads"].sort(key=lambda x: x["counts"][args.sort_by], reverse=True)
    else:  # total
        results["squads"].sort(key=lambda x: x["total"], reverse=True)

    # Output
    if args.format == "json":
        print(json.dumps(results, indent=2, ensure_ascii=False))
    else:
        print(format_table(results, detailed=args.detailed))


if __name__ == "__main__":
    main()
