#!/usr/bin/env python3
"""
Validate Design Squad Structure

Validates that all agents follow the canonical structure defined in agent-template.yaml.
Checks for:
- Required metadata fields (version, tier, created)
- Required agent fields (name, id, title, icon, tier, whenToUse)
- Tier consistency between metadata and agent sections
- Alignment with config.yaml tier_system

Usage:
    python scripts/validate-design-squad.py
    python scripts/validate-design-squad.py --output json
    python scripts/validate-design-squad.py --verbose

Exit codes:
    0 = All validations passed
    1 = Validation failures found
    2 = Error (file not found, etc.)
"""

import os
import sys
import yaml
import json
import re
import argparse
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Any, Optional


# ============================================================================
# CONFIGURATION
# ============================================================================

# Required fields per section
REQUIRED_METADATA = ["version", "tier", "created"]
REQUIRED_AGENT = ["name", "id", "title", "icon", "tier", "whenToUse"]
OPTIONAL_AGENT = ["era", "influence_score", "legacy_impact", "customization"]

# Valid tier values
VALID_TIERS = [0, 1, 2, "orchestrator"]

# Expected tier assignments from config.yaml
EXPECTED_TIERS = {
    "dave-malouf": 0,       # Foundation
    "dan-mall": 1,          # Master
    "brad-frost": 2,        # Specialist
    "design-chief": "orchestrator",
}


# ============================================================================
# UTILITIES
# ============================================================================

def find_squad_root() -> Path:
    """Find the design squad directory"""
    # Try relative to script
    script_dir = Path(__file__).parent.parent  # scripts -> design
    if (script_dir / "config.yaml").exists():
        return script_dir

    # Try from cwd
    cwd = Path.cwd()
    if (cwd / "squads" / "design").exists():
        return cwd / "squads" / "design"
    if cwd.name == "design" and (cwd / "config.yaml").exists():
        return cwd

    raise FileNotFoundError("Could not find design squad directory")


def extract_yaml_from_md(file_path: Path) -> Optional[Dict]:
    """Extract YAML block from markdown file"""
    content = file_path.read_text(encoding='utf-8', errors='ignore')

    # Find ```yaml ... ``` block - handle large blocks
    match = re.search(r'```yaml\s*\n(.*?)\n```', content, re.DOTALL)
    if not match:
        return None

    yaml_content = match.group(1)

    # Parse just the parts we need (metadata and agent sections)
    # The full YAML may have invalid structures for pyyaml
    result = {}

    # Extract metadata section
    meta_match = re.search(r'^metadata:\s*\n((?:[ \t]+[^\n]*\n)*)', yaml_content, re.MULTILINE)
    if meta_match:
        try:
            meta_yaml = "metadata:\n" + meta_match.group(1)
            meta_data = yaml.safe_load(meta_yaml)
            if meta_data:
                result["metadata"] = meta_data.get("metadata", {})
        except yaml.YAMLError:
            pass

    # Extract agent section
    agent_match = re.search(r'^agent:\s*\n((?:[ \t]+[^\n]*\n)*)', yaml_content, re.MULTILINE)
    if agent_match:
        try:
            agent_yaml = "agent:\n" + agent_match.group(1)
            agent_data = yaml.safe_load(agent_yaml)
            if agent_data:
                result["agent"] = agent_data.get("agent", {})
        except yaml.YAMLError:
            pass

    return result if result else None


def read_yaml(file_path: Path) -> Optional[Dict]:
    """Read and parse YAML file"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            return yaml.safe_load(f)
    except Exception:
        return None


# ============================================================================
# VALIDATION FUNCTIONS
# ============================================================================

def validate_agent_file(agent_path: Path, expected_tier: Any) -> Dict[str, Any]:
    """Validate a single agent file"""
    result = {
        "file": agent_path.name,
        "passed": True,
        "checks": [],
        "errors": [],
        "warnings": []
    }

    # Extract YAML from markdown
    data = extract_yaml_from_md(agent_path)
    if not data:
        # Some agents are runtime wrappers without embedded YAML contracts.
        # Keep validation non-blocking for those files.
        result["warnings"].append("No embedded YAML block found; structural validation skipped")
        return result

    # Check metadata section
    metadata = data.get("metadata", {})
    if not metadata:
        result["passed"] = False
        result["errors"].append("Missing 'metadata' section")
    else:
        # Check required metadata fields
        for field in REQUIRED_METADATA:
            if field in metadata:
                result["checks"].append(f"metadata.{field}: present")
            else:
                result["passed"] = False
                result["errors"].append(f"Missing metadata.{field}")

        # Check metadata.tier value
        if "tier" in metadata:
            meta_tier = metadata["tier"]
            if meta_tier not in VALID_TIERS:
                result["passed"] = False
                result["errors"].append(f"Invalid metadata.tier: {meta_tier} (expected one of {VALID_TIERS})")

    # Check agent section
    agent = data.get("agent", {})
    if not agent:
        result["passed"] = False
        result["errors"].append("Missing 'agent' section")
    else:
        # Check required agent fields
        for field in REQUIRED_AGENT:
            if field in agent:
                result["checks"].append(f"agent.{field}: present")
            else:
                result["passed"] = False
                result["errors"].append(f"Missing agent.{field}")

        # Check agent.tier value
        if "tier" in agent:
            agent_tier = agent["tier"]
            # Normalize tier (handle string numbers)
            if isinstance(agent_tier, str) and agent_tier.isdigit():
                agent_tier = int(agent_tier)

            if agent_tier not in VALID_TIERS:
                result["passed"] = False
                result["errors"].append(f"Invalid agent.tier: {agent_tier}")

    # Check tier consistency
    if metadata and agent:
        meta_tier = metadata.get("tier")
        agent_tier = agent.get("tier")

        # Normalize both for comparison
        if isinstance(agent_tier, str) and agent_tier.isdigit():
            agent_tier = int(agent_tier)
        if isinstance(meta_tier, str) and meta_tier.isdigit():
            meta_tier = int(meta_tier)

        if meta_tier != agent_tier:
            result["passed"] = False
            result["errors"].append(f"Tier mismatch: metadata.tier={meta_tier}, agent.tier={agent_tier}")
        else:
            result["checks"].append("tier consistency: metadata.tier == agent.tier")

        # Check against expected tier from config
        if expected_tier is not None:
            if meta_tier != expected_tier:
                result["passed"] = False
                result["errors"].append(f"Tier mismatch with config.yaml: got {meta_tier}, expected {expected_tier}")
            else:
                result["checks"].append(f"tier alignment: matches config.yaml ({expected_tier})")

    return result


def validate_config(config_path: Path) -> Dict[str, Any]:
    """Validate config.yaml"""
    result = {
        "file": "config.yaml",
        "passed": True,
        "checks": [],
        "errors": [],
        "warnings": []
    }

    config = read_yaml(config_path)
    if not config:
        result["passed"] = False
        result["errors"].append("Could not parse config.yaml")
        return result

    # Check required fields
    required = ["name", "version", "entry_agent", "agents", "tier_system"]
    for field in required:
        if field in config:
            result["checks"].append(f"{field}: present")
        else:
            result["passed"] = False
            result["errors"].append(f"Missing required field: {field}")

    # Check tier_system structure
    tier_system = config.get("tier_system", {})
    expected_tiers = ["tier_0_foundation", "tier_1_masters", "tier_2_specialists", "orchestrator"]
    for tier in expected_tiers:
        if tier in tier_system:
            result["checks"].append(f"tier_system.{tier}: present")
        else:
            result["warnings"].append(f"Missing tier_system.{tier}")

    # Check agents list matches agent files
    agents = config.get("agents", [])
    result["checks"].append(f"agents list: {len(agents)} agents")

    return result


def validate_templates(templates_dir: Path) -> Dict[str, Any]:
    """Validate agent-template exists"""
    result = {
        "file": "templates/",
        "passed": True,
        "checks": [],
        "errors": [],
        "warnings": []
    }

    template_file = templates_dir / "agent-template.yaml"
    if template_file.exists():
        result["checks"].append("agent-template.yaml: present")
    else:
        result["passed"] = False
        result["errors"].append("Missing agent-template.yaml")

    return result


# ============================================================================
# MAIN VALIDATION
# ============================================================================

def validate_design_squad(verbose: bool = False) -> Dict[str, Any]:
    """Run full validation"""
    try:
        squad_root = find_squad_root()
    except FileNotFoundError as e:
        return {"error": str(e)}

    results = {
        "squad_name": "design",
        "squad_path": str(squad_root),
        "timestamp": datetime.now().isoformat(),
        "validator": "validate-design-squad.py",
        "validations": [],
        "summary": {
            "total_checks": 0,
            "passed": 0,
            "failed": 0,
            "warnings": 0
        }
    }

    # 1. Validate config.yaml
    config_result = validate_config(squad_root / "config.yaml")
    results["validations"].append(config_result)

    # 2. Validate templates
    templates_result = validate_templates(squad_root / "templates")
    results["validations"].append(templates_result)

    # 3. Validate each agent
    agents_dir = squad_root / "agents"
    if agents_dir.exists():
        for agent_file in sorted(agents_dir.glob("*.md")):
            agent_id = agent_file.stem
            expected_tier = EXPECTED_TIERS.get(agent_id)
            agent_result = validate_agent_file(agent_file, expected_tier)
            results["validations"].append(agent_result)
    else:
        results["validations"].append({
            "file": "agents/",
            "passed": False,
            "errors": ["agents/ directory not found"]
        })

    # Calculate summary
    all_passed = True
    for v in results["validations"]:
        results["summary"]["total_checks"] += len(v.get("checks", []))
        if v.get("passed", True):
            results["summary"]["passed"] += 1
        else:
            results["summary"]["failed"] += 1
            all_passed = False
        results["summary"]["warnings"] += len(v.get("warnings", []))

    results["summary"]["all_passed"] = all_passed

    return results


def print_report(results: Dict[str, Any]) -> None:
    """Print human-readable report"""
    if "error" in results:
        print(f"ERROR: {results['error']}")
        return

    print("\n" + "=" * 60)
    print(f"DESIGN SQUAD VALIDATION REPORT")
    print("=" * 60)
    print(f"Path: {results['squad_path']}")
    print(f"Time: {results['timestamp']}")
    print()

    for v in results["validations"]:
        status = "✓" if v.get("passed", True) else "✗"
        print(f"{status} {v['file']}")

        for check in v.get("checks", []):
            print(f"    ✓ {check}")

        for error in v.get("errors", []):
            print(f"    ✗ ERROR: {error}")

        for warning in v.get("warnings", []):
            print(f"    ⚠ WARNING: {warning}")

        print()

    # Summary
    summary = results["summary"]
    final_status = "✓ ALL PASSED" if summary["all_passed"] else "✗ FAILURES FOUND"
    print("=" * 60)
    print(f"SUMMARY: {final_status}")
    print(f"  Validations: {summary['passed']} passed, {summary['failed']} failed")
    print(f"  Total checks: {summary['total_checks']}")
    print(f"  Warnings: {summary['warnings']}")
    print("=" * 60)


def main():
    parser = argparse.ArgumentParser(
        description="Validate Design Squad structure and agents"
    )
    parser.add_argument("--output", "-o", choices=["text", "json"], default="text")
    parser.add_argument("--verbose", "-v", action="store_true")

    args = parser.parse_args()

    results = validate_design_squad(args.verbose)

    if args.output == "json":
        print(json.dumps(results, indent=2))
    else:
        print_report(results)

    # Exit code
    if "error" in results:
        sys.exit(2)
    elif not results["summary"]["all_passed"]:
        sys.exit(1)
    else:
        sys.exit(0)


if __name__ == "__main__":
    main()
