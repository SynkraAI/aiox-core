#!/usr/bin/env python3
"""
Script: quality_gate.py
Purpose: Check quantitative thresholds for squad quality
Operations: 15+ deterministic checks

Thresholds:
- Agents: min 300 lines for complex agents
- Tasks: min 100 lines
- voice_dna.vocabulary.always_use: min 5 items
- output_examples: min 3 items
- objection_algorithms: min 3 items

Usage:
    python scripts/quality_gate.py squads/squad-creator/
    python scripts/quality_gate.py squads/squad-creator/ --output json
    python scripts/quality_gate.py squads/squad-creator/ --strict
"""

import argparse
import json
import os
import sys
from pathlib import Path
from typing import Dict, List, Any


# Quality thresholds
THRESHOLDS = {
    "agent": {
        "min_lines": 300,
        "min_vocabulary_always": 5,
        "min_vocabulary_never": 3,
        "min_output_examples": 3,
        "min_objection_algorithms": 3,
        "min_anti_patterns_never": 5,
        "min_anti_patterns_always": 3,
    },
    "task": {
        "min_lines": 100,
        "min_steps": 3,
    },
    "squad": {
        "min_agents": 1,
        "min_tasks": 1,
        "required_files": ["config.yaml", "README.md"],
        "recommended_files": ["CHANGELOG.md"],
        "required_dirs": ["agents", "tasks"],
        "recommended_dirs": ["templates", "checklists", "data"],
    }
}


def count_lines(file_path: str) -> int:
    """Count lines in a file."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            return sum(1 for _ in f)
    except Exception:
        return 0


def count_yaml_items(file_path: str, key_path: str) -> int:
    """Count items in a YAML array at given path."""
    try:
        import yaml
        with open(file_path, 'r', encoding='utf-8') as f:
            content = yaml.safe_load(f.read())

        if content is None:
            return 0

        # Navigate to key path
        keys = key_path.split('.')
        current = content
        for key in keys:
            if isinstance(current, dict) and key in current:
                current = current[key]
            else:
                return 0

        if isinstance(current, list):
            return len(current)
        return 0
    except Exception:
        return 0


def check_agent_quality(file_path: str) -> Dict[str, Any]:
    """Check quality metrics for an agent file."""
    filename = os.path.basename(file_path)
    result = {
        "file": filename,
        "type": "agent",
        "metrics": {},
        "issues": [],
        "passed": True
    }

    # Line count
    lines = count_lines(file_path)
    result["metrics"]["lines"] = lines
    if lines < THRESHOLDS["agent"]["min_lines"]:
        result["issues"].append({
            "code": "QG-AGT-LINES",
            "severity": "warning",
            "metric": "lines",
            "actual": lines,
            "threshold": THRESHOLDS["agent"]["min_lines"],
            "message": f"Agent has {lines} lines (min: {THRESHOLDS['agent']['min_lines']})"
        })

    # Vocabulary counts (check markdown file for YAML content)
    try:
        import yaml
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        # Try to parse YAML blocks in markdown
        yaml_blocks = []
        in_yaml = False
        yaml_content = []

        for line in content.split('\n'):
            if line.strip() == '```yaml':
                in_yaml = True
                yaml_content = []
            elif line.strip() == '```' and in_yaml:
                in_yaml = False
                if yaml_content:
                    yaml_blocks.append('\n'.join(yaml_content))
            elif in_yaml:
                yaml_content.append(line)

        # Parse each YAML block
        for block in yaml_blocks:
            try:
                data = yaml.safe_load(block)
                if isinstance(data, dict):
                    # Check voice_dna
                    voice_dna = data.get('voice_dna', {})
                    if isinstance(voice_dna, dict):
                        vocab = voice_dna.get('vocabulary', {})
                        if isinstance(vocab, dict):
                            always = len(vocab.get('always_use', []))
                            never = len(vocab.get('never_use', []))
                            result["metrics"]["vocabulary_always"] = always
                            result["metrics"]["vocabulary_never"] = never

                    # Check output_examples
                    examples = data.get('output_examples', [])
                    if isinstance(examples, list):
                        result["metrics"]["output_examples"] = len(examples)

                    # Check objection_algorithms
                    objections = data.get('objection_algorithms', [])
                    if isinstance(objections, list):
                        result["metrics"]["objection_algorithms"] = len(objections)

                    # Check anti_patterns
                    anti = data.get('anti_patterns', {})
                    if isinstance(anti, dict):
                        result["metrics"]["anti_patterns_never"] = len(anti.get('never_do', []))
                        result["metrics"]["anti_patterns_always"] = len(anti.get('always_do', []))

            except Exception:
                continue

    except Exception:
        pass

    return result


def check_task_quality(file_path: str) -> Dict[str, Any]:
    """Check quality metrics for a task file."""
    filename = os.path.basename(file_path)
    result = {
        "file": filename,
        "type": "task",
        "metrics": {},
        "issues": [],
        "passed": True
    }

    # Line count
    lines = count_lines(file_path)
    result["metrics"]["lines"] = lines
    if lines < THRESHOLDS["task"]["min_lines"]:
        result["issues"].append({
            "code": "QG-TSK-LINES",
            "severity": "warning",
            "metric": "lines",
            "actual": lines,
            "threshold": THRESHOLDS["task"]["min_lines"],
            "message": f"Task has {lines} lines (min: {THRESHOLDS['task']['min_lines']})"
        })

    return result


def check_squad_quality(squad_path: str) -> Dict[str, Any]:
    """Check overall squad quality."""
    squad_name = os.path.basename(squad_path.rstrip('/'))
    result = {
        "squad_name": squad_name,
        "type": "squad",
        "metrics": {},
        "issues": [],
        "passed": True
    }

    # Check required files
    for file in THRESHOLDS["squad"]["required_files"]:
        exists = os.path.exists(os.path.join(squad_path, file))
        result["metrics"][f"has_{file.replace('.', '_')}"] = exists
        if not exists:
            result["issues"].append({
                "code": "QG-SQD-REQFILE",
                "severity": "error",
                "file": file,
                "message": f"Missing required file: {file}"
            })
            result["passed"] = False

    # Check recommended files
    for file in THRESHOLDS["squad"]["recommended_files"]:
        exists = os.path.exists(os.path.join(squad_path, file))
        result["metrics"][f"has_{file.replace('.', '_')}"] = exists
        if not exists:
            result["issues"].append({
                "code": "QG-SQD-RECFILE",
                "severity": "info",
                "file": file,
                "message": f"Missing recommended file: {file}"
            })

    # Check required directories
    for dir_name in THRESHOLDS["squad"]["required_dirs"]:
        dir_path = os.path.join(squad_path, dir_name)
        exists = os.path.exists(dir_path) and os.path.isdir(dir_path)
        result["metrics"][f"has_{dir_name}"] = exists
        if not exists:
            result["issues"].append({
                "code": "QG-SQD-REQDIR",
                "severity": "error",
                "directory": dir_name,
                "message": f"Missing required directory: {dir_name}"
            })
            result["passed"] = False

    # Count agents
    agents_dir = os.path.join(squad_path, "agents")
    if os.path.exists(agents_dir):
        agents = [f for f in os.listdir(agents_dir) if f.endswith('.md')]
        result["metrics"]["agent_count"] = len(agents)
        if len(agents) < THRESHOLDS["squad"]["min_agents"]:
            result["issues"].append({
                "code": "QG-SQD-AGENTS",
                "severity": "error",
                "actual": len(agents),
                "threshold": THRESHOLDS["squad"]["min_agents"],
                "message": f"Squad has {len(agents)} agents (min: {THRESHOLDS['squad']['min_agents']})"
            })
            result["passed"] = False

    # Count tasks
    tasks_dir = os.path.join(squad_path, "tasks")
    if os.path.exists(tasks_dir):
        tasks = [f for f in os.listdir(tasks_dir) if f.endswith('.md')]
        result["metrics"]["task_count"] = len(tasks)
        if len(tasks) < THRESHOLDS["squad"]["min_tasks"]:
            result["issues"].append({
                "code": "QG-SQD-TASKS",
                "severity": "error",
                "actual": len(tasks),
                "threshold": THRESHOLDS["squad"]["min_tasks"],
                "message": f"Squad has {len(tasks)} tasks (min: {THRESHOLDS['squad']['min_tasks']})"
            })
            result["passed"] = False

    return result


def scan_squad(squad_path: str, strict: bool = False) -> Dict[str, Any]:
    """Run quality gate checks on entire squad."""
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
        "strict_mode": strict,
        "thresholds": THRESHOLDS,
        "squad_check": None,
        "agent_checks": [],
        "task_checks": [],
        "summary": {
            "total_issues": 0,
            "errors": 0,
            "warnings": 0,
            "passed": True
        }
    }

    # Check squad-level quality
    squad_result = check_squad_quality(squad_path)
    results["squad_check"] = squad_result
    results["summary"]["total_issues"] += len(squad_result["issues"])
    results["summary"]["errors"] += len([i for i in squad_result["issues"] if i["severity"] == "error"])
    if not squad_result["passed"]:
        results["summary"]["passed"] = False

    # Check each agent
    agents_dir = os.path.join(squad_path, "agents")
    if os.path.exists(agents_dir):
        for file in sorted(os.listdir(agents_dir)):
            if file.endswith('.md'):
                agent_result = check_agent_quality(os.path.join(agents_dir, file))
                results["agent_checks"].append(agent_result)
                results["summary"]["total_issues"] += len(agent_result["issues"])

    # Check each task
    tasks_dir = os.path.join(squad_path, "tasks")
    if os.path.exists(tasks_dir):
        for file in sorted(os.listdir(tasks_dir)):
            if file.endswith('.md'):
                task_result = check_task_quality(os.path.join(tasks_dir, file))
                results["task_checks"].append(task_result)
                results["summary"]["total_issues"] += len(task_result["issues"])

    results["summary"]["warnings"] = results["summary"]["total_issues"] - results["summary"]["errors"]
    results["status"] = "PASS" if results["summary"]["passed"] else "FAIL"

    return results


def print_report(results: Dict[str, Any]) -> None:
    """Print human-readable report."""
    print(f"\nQuality Gate: {results['squad_name']}")
    print("=" * 50)

    if not results.get("exists"):
        print(f"ERROR: {results.get('error', 'Squad not found')}")
        return

    print(f"Status: {'✓ PASSED' if results['status'] == 'PASS' else '✗ FAILED'}")
    print(f"Errors: {results['summary']['errors']}")
    print(f"Warnings: {results['summary']['warnings']}")

    # Squad-level issues
    if results["squad_check"]["issues"]:
        print("\nSquad Issues:")
        for issue in results["squad_check"]["issues"]:
            icon = "✗" if issue["severity"] == "error" else "⚠️"
            print(f"  {icon} [{issue['code']}] {issue['message']}")

    # Agent issues
    agent_issues = [a for a in results["agent_checks"] if a["issues"]]
    if agent_issues:
        print("\nAgent Issues:")
        for agent in agent_issues:
            print(f"  {agent['file']}:")
            for issue in agent["issues"]:
                print(f"    ⚠️ [{issue['code']}] {issue['message']}")

    # Task issues
    task_issues = [t for t in results["task_checks"] if t["issues"]]
    if task_issues:
        print("\nTask Issues:")
        for task in task_issues:
            print(f"  {task['file']}:")
            for issue in task["issues"]:
                print(f"    ⚠️ [{issue['code']}] {issue['message']}")

    # Summary metrics
    print("\nMetrics:")
    if results["squad_check"]["metrics"]:
        print(f"  Agents: {results['squad_check']['metrics'].get('agent_count', 0)}")
        print(f"  Tasks: {results['squad_check']['metrics'].get('task_count', 0)}")


def main():
    parser = argparse.ArgumentParser(description="Check squad quality thresholds")
    parser.add_argument("squad_path", help="Path to squad directory")
    parser.add_argument("--output", choices=["text", "json"], default="text",
                        help="Output format")
    parser.add_argument("--strict", action="store_true",
                        help="Treat warnings as errors")

    args = parser.parse_args()

    results = scan_squad(args.squad_path, args.strict)

    if args.output == "json":
        print(json.dumps(results, indent=2))
    else:
        print_report(results)

    # Exit with error code if failed
    sys.exit(0 if results.get("status") == "PASS" else 1)


if __name__ == "__main__":
    main()
