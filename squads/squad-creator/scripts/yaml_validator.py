#!/usr/bin/env python3
"""
Script: yaml_validator.py
Purpose: Validate YAML structure in agent/task/workflow files
Operations: 25+ deterministic checks

Usage:
    python scripts/yaml_validator.py squads/squad-creator/agents/expert.md --type agent
    python scripts/yaml_validator.py squads/squad-creator/tasks/main-task.md --type task
    python scripts/yaml_validator.py squads/squad-creator/ --type squad  # Validate all files
"""

import os
import sys
import re
import json
import yaml
import argparse
from pathlib import Path
from typing import Dict, List, Any, Optional, Tuple
from dataclasses import dataclass, asdict, field


# Required keys for each component type
AGENT_REQUIRED_KEYS = {
    "blocking": [
        "agent",
        "agent.name",
        "agent.id",
        "persona",
        "commands",
    ],
    "warning": [
        "activation-instructions",
        "agent.title",
        "agent.icon",
        "agent.whenToUse",
        "persona.role",
        "persona.style",
        "persona.identity",
        "persona.focus",
        "core_principles",
        "voice_dna",
        "voice_dna.vocabulary",
        "voice_dna.vocabulary.always_use",
        "voice_dna.vocabulary.never_use",
        "output_examples",
        "objection_algorithms",
        "anti_patterns",
        "anti_patterns.never_do",
        "anti_patterns.always_do",
        "completion_criteria",
        "handoff_to",
        "dependencies",
    ]
}

TASK_REQUIRED_KEYS = {
    "blocking": [
        # Task metadata is in markdown headers, not YAML
    ],
    "warning": []
}

WORKFLOW_REQUIRED_KEYS = {
    "blocking": [],
    "warning": []
}


@dataclass
class ValidationIssue:
    """Single validation issue"""
    severity: str  # BLOCKING, WARNING
    check_id: str
    message: str
    location: Optional[str] = None
    line: Optional[int] = None


@dataclass
class YamlValidationResult:
    """Result of YAML validation"""
    file_path: str
    file_type: str  # agent, task, workflow
    valid_syntax: bool
    parse_error: Optional[str]

    # Keys analysis
    present_keys: List[str]
    missing_blocking_keys: List[str]
    missing_warning_keys: List[str]

    # Counts (for quality gates)
    counts: Dict[str, int]

    # Line count
    total_lines: int

    # Issues
    issues: List[ValidationIssue]

    # Pass/fail
    passed: bool


def extract_yaml_block(content: str) -> Tuple[Optional[str], Optional[int]]:
    """Extract YAML block from markdown file"""
    # Look for ```yaml block
    pattern = r'```yaml\s*\n(.*?)```'
    match = re.search(pattern, content, re.DOTALL)

    if match:
        yaml_content = match.group(1)
        # Find line number of yaml block start
        start_pos = match.start()
        line_num = content[:start_pos].count('\n') + 1
        return yaml_content, line_num

    return None, None


def get_nested_keys(data: Dict, prefix: str = "") -> List[str]:
    """Get all nested keys from a dictionary"""
    keys = []

    if not isinstance(data, dict):
        return keys

    for key, value in data.items():
        full_key = f"{prefix}.{key}" if prefix else key
        keys.append(full_key)

        if isinstance(value, dict):
            keys.extend(get_nested_keys(value, full_key))

    return keys


def get_nested_value(data: Dict, key_path: str) -> Any:
    """Get value at nested key path (e.g., 'voice_dna.vocabulary.always_use')"""
    keys = key_path.split('.')
    current = data

    for key in keys:
        if not isinstance(current, dict):
            return None
        if key not in current:
            return None
        current = current[key]

    return current


def count_items(data: Dict, key_path: str) -> int:
    """Count items at key path (for arrays/lists)"""
    value = get_nested_value(data, key_path)

    if value is None:
        return 0
    if isinstance(value, list):
        return len(value)
    if isinstance(value, dict):
        return len(value)
    if isinstance(value, str):
        # Count items if it's a YAML-style list in string
        return len([l for l in value.split('\n') if l.strip().startswith('-')])

    return 0


def validate_agent_yaml(yaml_data: Dict, file_path: str) -> YamlValidationResult:
    """Validate agent YAML structure"""
    issues = []
    present_keys = get_nested_keys(yaml_data)

    # Check blocking keys
    missing_blocking = []
    for key in AGENT_REQUIRED_KEYS["blocking"]:
        if key not in present_keys:
            missing_blocking.append(key)
            issues.append(ValidationIssue(
                severity="BLOCKING",
                check_id=f"AGT-STRUCT-{key.upper().replace('.', '_')}",
                message=f"Missing required key: {key}"
            ))

    # Check warning keys
    missing_warning = []
    for key in AGENT_REQUIRED_KEYS["warning"]:
        if key not in present_keys:
            missing_warning.append(key)
            issues.append(ValidationIssue(
                severity="WARNING",
                check_id=f"AGT-STRUCT-{key.upper().replace('.', '_')}",
                message=f"Missing recommended key: {key}"
            ))

    # Count important items
    counts = {
        "vocabulary_always_use": count_items(yaml_data, "voice_dna.vocabulary.always_use"),
        "vocabulary_never_use": count_items(yaml_data, "voice_dna.vocabulary.never_use"),
        "output_examples": count_items(yaml_data, "output_examples"),
        "objection_algorithms": count_items(yaml_data, "objection_algorithms"),
        "anti_patterns_never_do": count_items(yaml_data, "anti_patterns.never_do"),
        "anti_patterns_always_do": count_items(yaml_data, "anti_patterns.always_do"),
        "commands": count_items(yaml_data, "commands"),
        "core_principles": count_items(yaml_data, "core_principles"),
        "handoff_to": count_items(yaml_data, "handoff_to"),
    }

    # Check commands include *help and *exit
    commands = get_nested_value(yaml_data, "commands")
    if commands:
        commands_str = str(commands).lower()
        if "*help" not in commands_str:
            issues.append(ValidationIssue(
                severity="WARNING",
                check_id="AGT-CMD-HELP",
                message="Commands should include *help"
            ))
        if "*exit" not in commands_str:
            issues.append(ValidationIssue(
                severity="WARNING",
                check_id="AGT-CMD-EXIT",
                message="Commands should include *exit"
            ))

    passed = len(missing_blocking) == 0

    return YamlValidationResult(
        file_path=file_path,
        file_type="agent",
        valid_syntax=True,
        parse_error=None,
        present_keys=present_keys,
        missing_blocking_keys=missing_blocking,
        missing_warning_keys=missing_warning,
        counts=counts,
        total_lines=0,  # Set later
        issues=[asdict(i) for i in issues],
        passed=passed
    )


def validate_file(file_path: Path, file_type: str) -> YamlValidationResult:
    """Validate a single file"""

    # Read file
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        return YamlValidationResult(
            file_path=str(file_path),
            file_type=file_type,
            valid_syntax=False,
            parse_error=f"Could not read file: {e}",
            present_keys=[],
            missing_blocking_keys=[],
            missing_warning_keys=[],
            counts={},
            total_lines=0,
            issues=[asdict(ValidationIssue(
                severity="BLOCKING",
                check_id="FILE-READ",
                message=f"Could not read file: {e}"
            ))],
            passed=False
        )

    total_lines = len(content.splitlines())

    # Extract YAML block
    yaml_content, yaml_line = extract_yaml_block(content)

    if not yaml_content:
        return YamlValidationResult(
            file_path=str(file_path),
            file_type=file_type,
            valid_syntax=False,
            parse_error="No YAML block found (```yaml ... ```)",
            present_keys=[],
            missing_blocking_keys=[],
            missing_warning_keys=[],
            counts={},
            total_lines=total_lines,
            issues=[asdict(ValidationIssue(
                severity="BLOCKING",
                check_id="YAML-BLOCK",
                message="No YAML block found in file"
            ))],
            passed=False
        )

    # Parse YAML
    try:
        yaml_data = yaml.safe_load(yaml_content)
    except yaml.YAMLError as e:
        return YamlValidationResult(
            file_path=str(file_path),
            file_type=file_type,
            valid_syntax=False,
            parse_error=str(e),
            present_keys=[],
            missing_blocking_keys=[],
            missing_warning_keys=[],
            counts={},
            total_lines=total_lines,
            issues=[asdict(ValidationIssue(
                severity="BLOCKING",
                check_id="YAML-SYNTAX",
                message=f"YAML syntax error: {e}"
            ))],
            passed=False
        )

    if not isinstance(yaml_data, dict):
        return YamlValidationResult(
            file_path=str(file_path),
            file_type=file_type,
            valid_syntax=False,
            parse_error="YAML block is not a dictionary",
            present_keys=[],
            missing_blocking_keys=[],
            missing_warning_keys=[],
            counts={},
            total_lines=total_lines,
            issues=[asdict(ValidationIssue(
                severity="BLOCKING",
                check_id="YAML-STRUCTURE",
                message="YAML block must be a dictionary/object"
            ))],
            passed=False
        )

    # Validate based on type
    if file_type == "agent":
        result = validate_agent_yaml(yaml_data, str(file_path))
        result.total_lines = total_lines
        return result
    else:
        # For task/workflow, just check syntax for now
        return YamlValidationResult(
            file_path=str(file_path),
            file_type=file_type,
            valid_syntax=True,
            parse_error=None,
            present_keys=get_nested_keys(yaml_data),
            missing_blocking_keys=[],
            missing_warning_keys=[],
            counts={},
            total_lines=total_lines,
            issues=[],
            passed=True
        )


def validate_squad(squad_path: Path) -> Dict[str, List[YamlValidationResult]]:
    """Validate all files in a squad"""
    results = {
        "agents": [],
        "tasks": [],
        "workflows": [],
        "summary": {
            "total_files": 0,
            "passed": 0,
            "failed": 0,
            "blocking_issues": 0,
            "warning_issues": 0
        }
    }

    # Validate agents
    agents_dir = squad_path / "agents"
    if agents_dir.exists():
        for f in sorted(agents_dir.glob("*.md")):
            result = validate_file(f, "agent")
            results["agents"].append(asdict(result))
            results["summary"]["total_files"] += 1
            if result.passed:
                results["summary"]["passed"] += 1
            else:
                results["summary"]["failed"] += 1

            for issue in result.issues:
                if issue["severity"] == "BLOCKING":
                    results["summary"]["blocking_issues"] += 1
                else:
                    results["summary"]["warning_issues"] += 1

    # Validate tasks (basic for now)
    tasks_dir = squad_path / "tasks"
    if tasks_dir.exists():
        for f in sorted(tasks_dir.glob("*.md")):
            # Just count lines for tasks (no YAML validation yet)
            try:
                with open(f, 'r') as file:
                    lines = len(file.readlines())
                results["tasks"].append({
                    "file_path": str(f),
                    "total_lines": lines,
                    "passed": True
                })
                results["summary"]["total_files"] += 1
                results["summary"]["passed"] += 1
            except Exception:
                pass

    # Validate workflows (basic for now)
    workflows_dir = squad_path / "workflows"
    if workflows_dir.exists():
        for f in sorted(workflows_dir.glob("*.md")) + sorted(workflows_dir.glob("*.yaml")):
            try:
                with open(f, 'r') as file:
                    lines = len(file.readlines())
                results["workflows"].append({
                    "file_path": str(f),
                    "total_lines": lines,
                    "passed": True
                })
                results["summary"]["total_files"] += 1
                results["summary"]["passed"] += 1
            except Exception:
                pass

    return results


def format_output(result: Any, format: str) -> str:
    """Format result for output"""
    if format == "json":
        if isinstance(result, dict):
            return json.dumps(result, indent=2, ensure_ascii=False)
        return json.dumps(asdict(result), indent=2, ensure_ascii=False)
    elif format == "yaml":
        if isinstance(result, dict):
            return yaml.dump(result, allow_unicode=True, default_flow_style=False)
        return yaml.dump(asdict(result), allow_unicode=True, default_flow_style=False)
    else:  # summary
        if isinstance(result, dict) and "summary" in result:
            # Squad validation summary
            s = result["summary"]
            lines = [
                "YAML Validation Summary",
                "=" * 50,
                f"Total files:      {s['total_files']}",
                f"Passed:           {s['passed']}",
                f"Failed:           {s['failed']}",
                f"Blocking issues:  {s['blocking_issues']}",
                f"Warning issues:   {s['warning_issues']}",
                "",
                "Agents:",
            ]
            for a in result.get("agents", []):
                status = "✓" if a.get("passed") else "✗"
                lines.append(f"  {status} {Path(a['file_path']).name}: {a.get('total_lines', 0)} lines")
                if not a.get("passed"):
                    for issue in a.get("issues", [])[:3]:
                        lines.append(f"      [{issue['severity']}] {issue['message']}")

            return "\n".join(lines)
        else:
            # Single file result
            r = result if isinstance(result, dict) else asdict(result)
            status = "✓ PASSED" if r.get("passed") else "✗ FAILED"
            lines = [
                f"YAML Validation: {Path(r['file_path']).name}",
                "=" * 50,
                f"Status: {status}",
                f"Type: {r.get('file_type', 'unknown')}",
                f"Syntax Valid: {r.get('valid_syntax', False)}",
                f"Total Lines: {r.get('total_lines', 0)}",
                "",
            ]

            if r.get("counts"):
                lines.append("Counts:")
                for k, v in r["counts"].items():
                    lines.append(f"  {k}: {v}")
                lines.append("")

            if r.get("issues"):
                lines.append("Issues:")
                for issue in r["issues"]:
                    icon = "🚫" if issue["severity"] == "BLOCKING" else "⚠️"
                    lines.append(f"  {icon} [{issue['check_id']}] {issue['message']}")

            return "\n".join(lines)


def main():
    parser = argparse.ArgumentParser(
        description="Validate YAML structure in squad files"
    )
    parser.add_argument(
        "path",
        type=Path,
        help="Path to file or squad directory"
    )
    parser.add_argument(
        "--type", "-t",
        choices=["agent", "task", "workflow", "squad"],
        default="agent",
        help="Type of validation"
    )
    parser.add_argument(
        "--output", "-o",
        choices=["json", "yaml", "summary"],
        default="summary",
        help="Output format"
    )

    args = parser.parse_args()

    if args.type == "squad":
        result = validate_squad(args.path)
        blocking = result["summary"]["blocking_issues"]
    else:
        result = validate_file(args.path, args.type)
        blocking = 0 if result.passed else 1

    print(format_output(result, args.output))
    sys.exit(1 if blocking > 0 else 0)


if __name__ == "__main__":
    main()
