#!/usr/bin/env python3
"""
Script: naming_validator.py
Purpose: Validate naming conventions across squad files
Operations: 8+ deterministic checks

Conventions:
- File names: kebab-case (e.g., gary-halbert.md)
- Directory names: kebab-case (e.g., squad-creator)
- YAML keys: snake_case (e.g., voice_dna)
- slashPrefix: camelCase (e.g., squadCreator)
- Agent IDs: kebab-case (e.g., gary-halbert)

Usage:
    python scripts/naming_validator.py squads/squad-creator/
    python scripts/naming_validator.py squads/squad-creator/ --output json
"""

import argparse
import json
import os
import re
import sys
from pathlib import Path
from typing import Dict, List, Any


def is_kebab_case(s: str) -> bool:
    """Check if string is kebab-case."""
    # Remove extension if present
    name = s.rsplit('.', 1)[0] if '.' in s else s
    return bool(re.match(r'^[a-z0-9]+(-[a-z0-9]+)*$', name))


def is_snake_case(s: str) -> bool:
    """Check if string is snake_case."""
    return bool(re.match(r'^[a-z0-9]+(_[a-z0-9]+)*$', s))


def is_camel_case(s: str) -> bool:
    """Check if string is camelCase."""
    return bool(re.match(r'^[a-z][a-zA-Z0-9]*$', s))


def is_pascal_case(s: str) -> bool:
    """Check if string is PascalCase."""
    return bool(re.match(r'^[A-Z][a-zA-Z0-9]*$', s))


def validate_file_names(squad_path: str) -> List[Dict]:
    """Validate file naming conventions."""
    issues = []

    dirs_to_check = ["agents", "tasks", "templates", "checklists", "workflows", "data"]

    for dir_name in dirs_to_check:
        dir_path = os.path.join(squad_path, dir_name)
        if not os.path.exists(dir_path):
            continue

        for file in os.listdir(dir_path):
            if file.startswith('.'):
                continue

            # Skip certain patterns
            if file in ['__init__.py', 'README.md', 'CHANGELOG.md']:
                continue

            name = file.rsplit('.', 1)[0]

            if not is_kebab_case(name):
                issues.append({
                    "type": "NAMING",
                    "code": "NAM-FILE-001",
                    "severity": "warning",
                    "file": os.path.join(dir_name, file),
                    "expected": "kebab-case",
                    "actual": name,
                    "suggestion": name.lower().replace('_', '-').replace(' ', '-'),
                    "message": f"File name should be kebab-case: {file}"
                })

    return issues


def validate_directory_name(squad_path: str) -> List[Dict]:
    """Validate squad directory name."""
    issues = []
    squad_name = os.path.basename(squad_path.rstrip('/'))

    if not is_kebab_case(squad_name):
        issues.append({
            "type": "NAMING",
            "code": "NAM-DIR-001",
            "severity": "error",
            "file": squad_name,
            "expected": "kebab-case",
            "actual": squad_name,
            "suggestion": squad_name.lower().replace('_', '-').replace(' ', '-'),
            "message": f"Squad directory should be kebab-case: {squad_name}"
        })

    return issues


def validate_config_naming(squad_path: str) -> List[Dict]:
    """Validate naming in config.yaml."""
    issues = []
    config_path = os.path.join(squad_path, "config.yaml")

    if not os.path.exists(config_path):
        return issues

    try:
        import yaml
        with open(config_path, 'r') as f:
            content = f.read()
            config = yaml.safe_load(content)
    except Exception:
        return issues

    if config is None:
        return issues

    # Check slashPrefix (should be camelCase)
    slash_prefix = None
    if isinstance(config, dict):
        slash_prefix = config.get('slashPrefix') or config.get('slash_prefix')
        if 'pack' in config and isinstance(config['pack'], dict):
            slash_prefix = slash_prefix or config['pack'].get('slash_prefix')

    if slash_prefix:
        if not is_camel_case(slash_prefix) and not is_pascal_case(slash_prefix):
            issues.append({
                "type": "NAMING",
                "code": "NAM-CONFIG-001",
                "severity": "warning",
                "file": "config.yaml",
                "key": "slashPrefix",
                "expected": "camelCase or PascalCase",
                "actual": slash_prefix,
                "message": f"slashPrefix should be camelCase: {slash_prefix}"
            })

    # Check name matches directory
    squad_name = os.path.basename(squad_path.rstrip('/'))
    config_name = None
    if isinstance(config, dict):
        config_name = config.get('name')
        if 'pack' in config and isinstance(config['pack'], dict):
            config_name = config_name or config['pack'].get('name')

    if config_name and config_name != squad_name:
        issues.append({
            "type": "NAMING",
            "code": "NAM-CONFIG-002",
            "severity": "error",
            "file": "config.yaml",
            "key": "name",
            "expected": squad_name,
            "actual": config_name,
            "message": f"config.yaml name '{config_name}' doesn't match directory '{squad_name}'"
        })

    return issues


def validate_agent_ids(squad_path: str) -> List[Dict]:
    """Validate agent IDs are kebab-case."""
    issues = []
    agents_dir = os.path.join(squad_path, "agents")

    if not os.path.exists(agents_dir):
        return issues

    try:
        import yaml
    except ImportError:
        return issues

    for file in os.listdir(agents_dir):
        if not file.endswith('.md'):
            continue

        file_path = os.path.join(agents_dir, file)
        try:
            with open(file_path, 'r') as f:
                content = f.read()

            # Try to extract YAML frontmatter
            if content.startswith('---'):
                yaml_match = re.match(r'^---\n(.*?)\n---', content, re.DOTALL)
                if yaml_match:
                    frontmatter = yaml.safe_load(yaml_match.group(1))
                    if frontmatter and 'id' in frontmatter:
                        agent_id = frontmatter['id']
                        if not is_kebab_case(agent_id):
                            issues.append({
                                "type": "NAMING",
                                "code": "NAM-AGENT-001",
                                "severity": "warning",
                                "file": f"agents/{file}",
                                "key": "id",
                                "expected": "kebab-case",
                                "actual": agent_id,
                                "message": f"Agent ID should be kebab-case: {agent_id}"
                            })
        except Exception:
            continue

    return issues


def scan_squad(squad_path: str) -> Dict[str, Any]:
    """Run all naming validations."""
    squad_path = squad_path.rstrip('/')
    squad_name = os.path.basename(squad_path)

    if not os.path.exists(squad_path):
        return {
            "squad_name": squad_name,
            "exists": False,
            "error": f"Squad path not found: {squad_path}"
        }

    all_issues = []

    # Run all validators
    all_issues.extend(validate_directory_name(squad_path))
    all_issues.extend(validate_file_names(squad_path))
    all_issues.extend(validate_config_naming(squad_path))
    all_issues.extend(validate_agent_ids(squad_path))

    # Categorize issues
    errors = [i for i in all_issues if i["severity"] == "error"]
    warnings = [i for i in all_issues if i["severity"] == "warning"]

    return {
        "squad_name": squad_name,
        "squad_path": squad_path,
        "exists": True,
        "status": "PASS" if len(errors) == 0 else "FAIL",
        "total_issues": len(all_issues),
        "errors": len(errors),
        "warnings": len(warnings),
        "issues": all_issues,
        "conventions": {
            "files": "kebab-case (e.g., gary-halbert.md)",
            "directories": "kebab-case (e.g., squad-creator)",
            "yaml_keys": "snake_case (e.g., voice_dna)",
            "slashPrefix": "camelCase (e.g., squadCreator)",
            "agent_ids": "kebab-case (e.g., gary-halbert)"
        }
    }


def print_report(results: Dict[str, Any]) -> None:
    """Print human-readable report."""
    print(f"\nNaming Validation: {results['squad_name']}")
    print("=" * 50)

    if not results.get("exists"):
        print(f"ERROR: {results.get('error', 'Squad not found')}")
        return

    print(f"Status: {'✓ PASSED' if results['status'] == 'PASS' else '✗ FAILED'}")
    print(f"Errors: {results['errors']}")
    print(f"Warnings: {results['warnings']}")

    if results["issues"]:
        print("\nIssues:")
        for issue in results["issues"]:
            icon = "✗" if issue["severity"] == "error" else "⚠️"
            print(f"  {icon} [{issue['code']}] {issue['message']}")
            if "suggestion" in issue:
                print(f"    Suggestion: {issue['suggestion']}")


def main():
    parser = argparse.ArgumentParser(description="Validate squad naming conventions")
    parser.add_argument("squad_path", help="Path to squad directory")
    parser.add_argument("--output", choices=["text", "json"], default="text",
                        help="Output format")

    args = parser.parse_args()

    results = scan_squad(args.squad_path)

    if args.output == "json":
        print(json.dumps(results, indent=2))
    else:
        print_report(results)

    # Exit with error code if blocking errors found
    sys.exit(0 if results.get("status") == "PASS" else 1)


if __name__ == "__main__":
    main()
