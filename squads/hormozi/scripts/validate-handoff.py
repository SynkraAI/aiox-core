#!/usr/bin/env python3
"""
Hormozi Squad — Handoff Validator
Validates handoff context template before specialist-to-specialist transfer.

Usage:
  python validate-handoff.py <handoff_file.yaml>

Returns:
  PASS - All mandatory fields present
  FAIL - Missing fields listed

Exit codes:
  0 = PASS
  1 = FAIL
"""

import sys
import yaml
from pathlib import Path

MANDATORY_FIELDS = [
    ("transfer.source_agent", "Agent de origem"),
    ("transfer.target_agent", "Agent de destino"),
    ("transfer.current_phase", "Fase atual"),
    ("mvn_status.completeness", "Status MVN (X/7)"),
    ("context_for_target.primary_objective", "Objetivo para o target agent"),
    ("veto_check.all_phase_vetos_passed", "Vetos passaram?"),
]

CONDITIONAL_FIELDS = [
    {
        "field": "value_equation.scored",
        "condition": lambda data: get_nested(data, "transfer.current_phase", "").upper() in ["PHASE-1", "PHASE-2", "PHASE-3", "PHASE-4"],
        "description": "Value Equation scored (obrigatorio apos PHASE-0)",
    },
    {
        "field": "value_equation.weakest_link",
        "condition": lambda data: get_nested(data, "value_equation.scored", False) == True,
        "description": "Elo mais fraco identificado (obrigatorio se VE scored)",
    },
]


def get_nested(data: dict, path: str, default=None):
    """Get nested value from dict using dot notation."""
    keys = path.split(".")
    value = data
    for key in keys:
        if isinstance(value, dict) and key in value:
            value = value[key]
        else:
            return default
    return value


def is_filled(value) -> bool:
    """Check if value is meaningfully filled (not empty, not placeholder)."""
    if value is None:
        return False
    if isinstance(value, str):
        stripped = value.strip().lower()
        return stripped != "" and stripped not in ["", "missing", "n/a", "none", "null"]
    if isinstance(value, bool):
        return True  # Booleans are always "filled"
    if isinstance(value, (int, float)):
        return True
    if isinstance(value, list):
        return len(value) > 0
    return True


def validate_handoff(data: dict) -> tuple[bool, list[str], list[str]]:
    """
    Validate handoff data against required fields.

    Returns:
        (is_valid, present_fields, missing_fields)
    """
    present = []
    missing = []

    # Check mandatory fields
    for field_path, description in MANDATORY_FIELDS:
        value = get_nested(data, field_path)
        if is_filled(value):
            present.append(f"{description}: {value}")
        else:
            missing.append(f"{description} ({field_path})")

    # Check conditional fields
    for cond in CONDITIONAL_FIELDS:
        if cond["condition"](data):
            value = get_nested(data, cond["field"])
            if is_filled(value):
                present.append(f"{cond['description']}: {value}")
            else:
                missing.append(f"{cond['description']} ({cond['field']})")

    is_valid = len(missing) == 0
    return is_valid, present, missing


def main():
    if len(sys.argv) < 2:
        print("Usage: python validate-handoff.py <handoff_file.yaml>")
        sys.exit(1)

    filepath = sys.argv[1]
    if not Path(filepath).exists():
        print(f"Error: File not found: {filepath}")
        sys.exit(1)

    with open(filepath, "r") as f:
        data = yaml.safe_load(f)

    # Handle nested 'handoff' key if present
    if "handoff" in data:
        data = data["handoff"]

    # Validate
    is_valid, present, missing = validate_handoff(data)

    # Output
    print("=" * 60)
    print("HANDOFF VALIDATION REPORT")
    print("=" * 60)
    print()
    print(f"Status: {'PASS' if is_valid else 'FAIL'}")
    print()

    source = get_nested(data, "transfer.source_agent", "?")
    target = get_nested(data, "transfer.target_agent", "?")
    print(f"Transfer: {source} --> {target}")
    print()

    if present:
        print("Present fields:")
        for field in present:
            print(f"  [x] {field}")

    if missing:
        print()
        print("Missing fields (REQUIRED for handoff):")
        for field in missing:
            print(f"  [ ] {field}")

    print()
    print("=" * 60)

    if is_valid:
        print("RESULT: PASS - Handoff context complete. Transfer allowed.")
    else:
        print("RESULT: FAIL - Complete missing fields before transferring.")
        print()
        print("Veto VT3-001: Handoff sem contexto bloqueado.")

    print("=" * 60)

    sys.exit(0 if is_valid else 1)


if __name__ == "__main__":
    main()

# Criado com Squad Creator do AIOSPRO por @oalanicolas e @pedrovalerio | 2026-02-10
