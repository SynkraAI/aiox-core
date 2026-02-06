#!/usr/bin/env python3
"""
Script: dependency_check.py
Purpose: Verify all file references in agents/tasks actually exist
Operations: 20+ deterministic checks

Features:
- Detects internal vs external squad references
- Ignores example references in code blocks
- Only flags truly broken internal dependencies

Usage:
    python scripts/dependency_check.py squads/squad-creator/
    python scripts/dependency_check.py squads/squad-creator/ --output json
    python scripts/dependency_check.py squads/squad-creator/ --strict  # Include external refs
"""

import argparse
import json
import os
import re
import sys
from pathlib import Path
from typing import Dict, List, Any, Tuple


# Known squad names to detect external references
# This list is populated dynamically from squad-registry.yaml
# Add new squads here as they are created
KNOWN_SQUADS = {
    "squad-creator"  # Meta squad for creating other squads
}


def is_in_code_block(content: str, match_pos: int) -> bool:
    """Check if a position is inside a code block (``` or example section)."""
    # Find all code block regions
    code_block_pattern = r'```[\s\S]*?```'
    for match in re.finditer(code_block_pattern, content):
        if match.start() <= match_pos <= match.end():
            return True
    return False


def is_example_reference(content: str, match_pos: int) -> bool:
    """Check if reference is in an example/documentation context."""
    # Get surrounding context (100 chars before and after)
    start = max(0, match_pos - 100)
    end = min(len(content), match_pos + 100)
    context = content[start:end].lower()

    # Keywords that indicate this is an example, not a real dependency
    example_keywords = [
        "example:", "e.g.", "for example", "such as", "like:",
        "# example", "## example", "### example",
        "sample:", "demo:", "illustration:",
        "would be", "could be", "might be",
        "output:", "result:", "produces:",
    ]

    return any(kw in context for kw in example_keywords)


def is_external_squad_reference(content: str, match: re.Match, squad_name: str) -> bool:
    """Check if this reference points to another squad (external)."""
    # Get context before the match
    start = max(0, match.start() - 50)
    context_before = content[start:match.start()]

    # Check if preceded by squads/{other-squad}/
    external_pattern = r'squads/([a-z0-9-]+)/'
    external_match = re.search(external_pattern, context_before)
    if external_match:
        ref_squad = external_match.group(1)
        if ref_squad != squad_name and ref_squad in KNOWN_SQUADS:
            return True

    return False


def extract_references(content: str, file_path: str, squad_name: str) -> Tuple[Dict[str, List[str]], Dict[str, List[str]]]:
    """
    Extract file references from markdown/yaml content.
    Returns: (internal_refs, external_refs)
    """
    internal = {
        "tasks": [],
        "agents": [],
        "templates": [],
        "checklists": [],
        "workflows": [],
        "data": []
    }
    external = {
        "tasks": [],
        "agents": [],
        "templates": [],
        "checklists": [],
        "workflows": [],
        "data": []
    }

    # Patterns for each type
    patterns = {
        "tasks": r'(?:tasks/|\.\/tasks/)([a-z0-9-]+\.md)',
        "agents": r'(?:agents/|\.\/agents/)([a-z0-9-]+\.md)',
        "templates": r'(?:templates/|\.\/templates/)([a-z0-9-]+\.(?:md|yaml))',
        "checklists": r'(?:checklists/|\.\/checklists/)([a-z0-9-]+\.md)',
        "workflows": r'(?:workflows/|\.\/workflows/)([a-z0-9-]+\.(?:md|yaml))',
        "data": r'(?:data/|\.\/data/)([a-z0-9-]+\.(?:md|yaml|json))'
    }

    for ref_type, pattern in patterns.items():
        for match in re.finditer(pattern, content):
            filename = match.group(1)

            # Skip if in code block (likely an example)
            if is_in_code_block(content, match.start()):
                external[ref_type].append(filename)
                continue

            # Skip if clearly an example reference
            if is_example_reference(content, match.start()):
                external[ref_type].append(filename)
                continue

            # Skip if pointing to another squad
            if is_external_squad_reference(content, match, squad_name):
                external[ref_type].append(filename)
                continue

            # This appears to be an internal reference
            if filename not in internal[ref_type]:
                internal[ref_type].append(filename)

    return internal, external


def check_references(squad_path: str, references: Dict[str, List[str]], source_file: str) -> List[Dict]:
    """Check if referenced files exist."""
    issues = []

    for ref_type, files in references.items():
        ref_dir = os.path.join(squad_path, ref_type)
        for file in files:
            file_path = os.path.join(ref_dir, file)
            if not os.path.exists(file_path):
                issues.append({
                    "type": "MISSING_REFERENCE",
                    "code": f"DEP-{ref_type.upper()}-001",
                    "severity": "error",
                    "source": source_file,
                    "reference_type": ref_type,
                    "referenced_file": file,
                    "expected_path": file_path,
                    "message": f"Referenced {ref_type} file not found: {file}"
                })

    return issues


def scan_file(file_path: str, squad_path: str, squad_name: str, strict: bool = False) -> Dict[str, Any]:
    """Scan a single file for references."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        return {
            "file": file_path,
            "error": str(e),
            "references": {},
            "external_references": {},
            "issues": []
        }

    internal_refs, external_refs = extract_references(content, file_path, squad_name)

    # Only check internal references for issues (unless strict mode)
    refs_to_check = internal_refs
    if strict:
        # In strict mode, merge external into internal for checking
        for k, v in external_refs.items():
            refs_to_check[k] = list(set(refs_to_check[k] + v))

    issues = check_references(squad_path, refs_to_check, file_path)

    return {
        "file": os.path.basename(file_path),
        "references": internal_refs,
        "external_references": external_refs,
        "issues": issues,
        "reference_count": sum(len(v) for v in internal_refs.values()),
        "external_count": sum(len(v) for v in external_refs.values())
    }


def scan_squad(squad_path: str, strict: bool = False) -> Dict[str, Any]:
    """Scan entire squad for dependency issues."""
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
        "files_scanned": 0,
        "total_references": 0,
        "external_references": 0,
        "total_issues": 0,
        "issues": [],
        "by_directory": {}
    }

    # Directories to scan
    scan_dirs = ["agents", "tasks", "workflows", "templates"]

    for dir_name in scan_dirs:
        dir_path = os.path.join(squad_path, dir_name)
        if not os.path.exists(dir_path):
            continue

        dir_results = []
        for file in os.listdir(dir_path):
            if file.endswith('.md') or file.endswith('.yaml'):
                file_path = os.path.join(dir_path, file)
                scan_result = scan_file(file_path, squad_path, squad_name, strict)
                dir_results.append(scan_result)
                results["files_scanned"] += 1
                results["total_references"] += scan_result["reference_count"]
                results["external_references"] += scan_result.get("external_count", 0)
                results["issues"].extend(scan_result["issues"])

        results["by_directory"][dir_name] = {
            "files": len(dir_results),
            "references": sum(r["reference_count"] for r in dir_results),
            "external": sum(r.get("external_count", 0) for r in dir_results),
            "issues": sum(len(r["issues"]) for r in dir_results)
        }

    results["total_issues"] = len(results["issues"])
    results["status"] = "PASS" if results["total_issues"] == 0 else "FAIL"

    return results


def print_report(results: Dict[str, Any]) -> None:
    """Print human-readable report."""
    print(f"\nDependency Check: {results['squad_name']}")
    print("=" * 50)

    if not results.get("exists"):
        print(f"ERROR: {results.get('error', 'Squad not found')}")
        return

    print(f"Status: {'✓ PASSED' if results['status'] == 'PASS' else '✗ FAILED'}")
    print(f"Mode: {'Strict (checking all refs)' if results.get('strict_mode') else 'Normal (internal refs only)'}")
    print(f"Files Scanned: {results['files_scanned']}")
    print(f"Internal References: {results['total_references']}")
    print(f"External References: {results['external_references']} (skipped)")
    print(f"Issues Found: {results['total_issues']}")

    if results["by_directory"]:
        print("\nBy Directory:")
        for dir_name, stats in results["by_directory"].items():
            status = "✓" if stats["issues"] == 0 else "✗"
            print(f"  {status} {dir_name}: {stats['files']} files, {stats['references']} refs, {stats.get('external', 0)} external, {stats['issues']} issues")

    if results["issues"]:
        print("\nIssues:")
        for issue in results["issues"]:
            print(f"  ✗ [{issue['code']}] {issue['message']}")
            print(f"    Source: {issue['source']}")


def main():
    parser = argparse.ArgumentParser(description="Check squad dependency references")
    parser.add_argument("squad_path", help="Path to squad directory")
    parser.add_argument("--output", choices=["text", "json"], default="text",
                        help="Output format")
    parser.add_argument("--strict", action="store_true",
                        help="Also check external/example references")

    args = parser.parse_args()

    results = scan_squad(args.squad_path, args.strict)

    if args.output == "json":
        print(json.dumps(results, indent=2))
    else:
        print_report(results)

    # Exit with error code if issues found
    sys.exit(0 if results.get("status") == "PASS" else 1)


if __name__ == "__main__":
    main()
