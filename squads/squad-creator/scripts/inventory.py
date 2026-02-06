#!/usr/bin/env python3
"""
Script: inventory.py
Purpose: Scan squad directory and return structured inventory
Operations: 30+ deterministic checks

Usage:
    python scripts/inventory.py squads/squad-creator/
    python scripts/inventory.py squads/squad-creator/ --output json
    python scripts/inventory.py squads/squad-creator/ --output yaml
"""

import os
import sys
import json
import yaml
import argparse
from pathlib import Path
from typing import Dict, List, Any, Optional
from dataclasses import dataclass, asdict
from datetime import datetime


@dataclass
class ComponentInventory:
    """Inventory for a single component type"""
    count: int
    files: List[str]


@dataclass
class SquadInventory:
    """Complete inventory of a squad"""
    squad_name: str
    squad_path: str
    exists: bool
    scan_date: str

    # Component counts
    agents: ComponentInventory
    tasks: ComponentInventory
    workflows: ComponentInventory
    templates: ComponentInventory
    checklists: ComponentInventory
    data_files: ComponentInventory
    docs: ComponentInventory

    # Required files
    has_config_yaml: bool
    has_readme: bool
    has_changelog: bool

    # Config metadata (if exists)
    config_name: Optional[str]
    config_version: Optional[str]
    config_description: Optional[str]
    config_slash_prefix: Optional[str]

    # Totals
    total_components: int

    # Issues found
    issues: List[Dict[str, str]]


def list_files(directory: Path, patterns: List[str]) -> List[str]:
    """List files matching patterns in directory"""
    if not directory.exists():
        return []

    files = []
    for pattern in patterns:
        for f in directory.glob(pattern):
            if f.is_file() and not f.name.startswith('.'):
                files.append(f.name)

    return sorted(set(files))


def read_config_yaml(squad_path: Path) -> Optional[Dict]:
    """Read and parse config.yaml"""
    config_file = squad_path / "config.yaml"
    if not config_file.exists():
        return None

    try:
        with open(config_file, 'r', encoding='utf-8') as f:
            return yaml.safe_load(f)
    except Exception:
        return None


def scan_squad(squad_path: Path) -> SquadInventory:
    """Scan a squad directory and return inventory"""

    issues = []

    # Check if squad exists
    if not squad_path.exists():
        return SquadInventory(
            squad_name=squad_path.name,
            squad_path=str(squad_path),
            exists=False,
            scan_date=datetime.now().isoformat(),
            agents=ComponentInventory(0, []),
            tasks=ComponentInventory(0, []),
            workflows=ComponentInventory(0, []),
            templates=ComponentInventory(0, []),
            checklists=ComponentInventory(0, []),
            data_files=ComponentInventory(0, []),
            docs=ComponentInventory(0, []),
            has_config_yaml=False,
            has_readme=False,
            has_changelog=False,
            config_name=None,
            config_version=None,
            config_description=None,
            config_slash_prefix=None,
            total_components=0,
            issues=[{"type": "BLOCKING", "message": f"Squad directory does not exist: {squad_path}"}]
        )

    # Scan each component directory
    agents_files = list_files(squad_path / "agents", ["*.md"])
    tasks_files = list_files(squad_path / "tasks", ["*.md"])
    workflows_files = list_files(squad_path / "workflows", ["*.md", "*.yaml"])
    templates_files = list_files(squad_path / "templates", ["*.md", "*.yaml"])
    checklists_files = list_files(squad_path / "checklists", ["*.md"])
    data_files = list_files(squad_path / "data", ["*.md", "*.yaml"])
    docs_files = list_files(squad_path / "docs", ["*.md"])

    # Check required files
    has_config = (squad_path / "config.yaml").exists()
    has_readme = (squad_path / "README.md").exists()
    has_changelog = (squad_path / "CHANGELOG.md").exists()

    # Track issues
    if not has_config:
        issues.append({"type": "BLOCKING", "message": "Missing config.yaml"})
    if not has_readme:
        issues.append({"type": "WARNING", "message": "Missing README.md"})
    if len(agents_files) == 0:
        issues.append({"type": "WARNING", "message": "No agents found in agents/"})

    # Read config metadata
    config = read_config_yaml(squad_path)
    config_name = config.get("name") if config else None
    config_version = config.get("version") if config else None
    config_description = config.get("description") if config else None
    config_slash_prefix = config.get("slashPrefix") if config else None

    # Check config name matches folder
    if config_name and config_name != squad_path.name:
        issues.append({
            "type": "WARNING",
            "message": f"config.yaml name '{config_name}' doesn't match folder '{squad_path.name}'"
        })

    # Calculate totals
    total = (
        len(agents_files) +
        len(tasks_files) +
        len(workflows_files) +
        len(templates_files) +
        len(checklists_files) +
        len(data_files)
    )

    return SquadInventory(
        squad_name=squad_path.name,
        squad_path=str(squad_path),
        exists=True,
        scan_date=datetime.now().isoformat(),
        agents=ComponentInventory(len(agents_files), agents_files),
        tasks=ComponentInventory(len(tasks_files), tasks_files),
        workflows=ComponentInventory(len(workflows_files), workflows_files),
        templates=ComponentInventory(len(templates_files), templates_files),
        checklists=ComponentInventory(len(checklists_files), checklists_files),
        data_files=ComponentInventory(len(data_files), data_files),
        docs=ComponentInventory(len(docs_files), docs_files),
        has_config_yaml=has_config,
        has_readme=has_readme,
        has_changelog=has_changelog,
        config_name=config_name,
        config_version=config_version,
        config_description=config_description,
        config_slash_prefix=config_slash_prefix,
        total_components=total,
        issues=issues
    )


def format_output(inventory: SquadInventory, format: str) -> str:
    """Format inventory for output"""
    data = asdict(inventory)

    if format == "json":
        return json.dumps(data, indent=2, ensure_ascii=False)
    elif format == "yaml":
        return yaml.dump(data, allow_unicode=True, default_flow_style=False, sort_keys=False)
    else:  # summary
        lines = [
            f"Squad Inventory: {inventory.squad_name}",
            "=" * 50,
            f"Path: {inventory.squad_path}",
            f"Exists: {inventory.exists}",
            f"Scan Date: {inventory.scan_date}",
            "",
            "Components:",
            f"  Agents:     {inventory.agents.count:3d}  {inventory.agents.files[:3]}{'...' if len(inventory.agents.files) > 3 else ''}",
            f"  Tasks:      {inventory.tasks.count:3d}  {inventory.tasks.files[:3]}{'...' if len(inventory.tasks.files) > 3 else ''}",
            f"  Workflows:  {inventory.workflows.count:3d}  {inventory.workflows.files[:3]}{'...' if len(inventory.workflows.files) > 3 else ''}",
            f"  Templates:  {inventory.templates.count:3d}",
            f"  Checklists: {inventory.checklists.count:3d}",
            f"  Data:       {inventory.data_files.count:3d}",
            f"  Docs:       {inventory.docs.count:3d}",
            f"  TOTAL:      {inventory.total_components:3d}",
            "",
            "Required Files:",
            f"  config.yaml:  {'✓' if inventory.has_config_yaml else '✗ MISSING'}",
            f"  README.md:    {'✓' if inventory.has_readme else '✗ MISSING'}",
            f"  CHANGELOG.md: {'✓' if inventory.has_changelog else '○ Optional'}",
            "",
            "Config Metadata:",
            f"  Name:        {inventory.config_name or 'N/A'}",
            f"  Version:     {inventory.config_version or 'N/A'}",
            f"  slashPrefix: {inventory.config_slash_prefix or 'N/A'}",
        ]

        if inventory.issues:
            lines.extend(["", "Issues Found:"])
            for issue in inventory.issues:
                icon = "🚫" if issue["type"] == "BLOCKING" else "⚠️"
                lines.append(f"  {icon} [{issue['type']}] {issue['message']}")

        return "\n".join(lines)


def main():
    parser = argparse.ArgumentParser(
        description="Scan squad directory and return inventory"
    )
    parser.add_argument(
        "squad_path",
        type=Path,
        help="Path to squad directory (e.g., squads/squad-creator/)"
    )
    parser.add_argument(
        "--output", "-o",
        choices=["json", "yaml", "summary"],
        default="summary",
        help="Output format"
    )

    args = parser.parse_args()

    # Scan squad
    inventory = scan_squad(args.squad_path)

    # Output
    print(format_output(inventory, args.output))

    # Exit code based on blocking issues
    blocking = [i for i in inventory.issues if i["type"] == "BLOCKING"]
    sys.exit(1 if blocking else 0)


if __name__ == "__main__":
    main()
