#!/usr/bin/env python3
"""
Hormozi Squad — MVN Validator
Validates Minimum Viable Numbers before calculations.

Usage:
  python validate-mvn.py <mvn_file.yaml>
  python validate-mvn.py --inline "ticket:2997,cac:150,ltv:8000,conversao:5%,churn:15%,leads:500,margem:65%"

Returns:
  PASS - All 7 MVN_CORE items present
  FAIL - Missing items listed

Exit codes:
  0 = PASS
  1 = FAIL
"""

import sys
import yaml
import re
from pathlib import Path

MVN_CORE_ITEMS = [
    "ticket",      # Ticket/Preco atual
    "cac",         # Custo de Aquisicao
    "ltv",         # Lifetime Value
    "conversao",   # Taxa de conversao
    "churn",       # Churn/Retencao
    "leads",       # Volume de leads
    "margem",      # Margem de lucro
]

MVN_ALIASES = {
    "ticket": ["ticket", "preco", "price", "ticket_atual", "preco_atual"],
    "cac": ["cac", "custo_aquisicao", "acquisition_cost"],
    "ltv": ["ltv", "lifetime_value", "valor_vida"],
    "conversao": ["conversao", "taxa_conversao", "conversion", "conversion_rate"],
    "churn": ["churn", "retencao", "retention", "churn_rate"],
    "leads": ["leads", "volume_leads", "leads_mes", "monthly_leads"],
    "margem": ["margem", "margem_lucro", "margin", "profit_margin"],
}


def normalize_key(key: str) -> str | None:
    """Map any alias to canonical MVN key."""
    key_lower = key.lower().strip()
    for canonical, aliases in MVN_ALIASES.items():
        if key_lower in aliases:
            return canonical
    return None


def parse_inline(inline: str) -> dict:
    """Parse inline format: 'ticket:2997,cac:150,...'"""
    result = {}
    pairs = inline.split(",")
    for pair in pairs:
        if ":" in pair:
            key, value = pair.split(":", 1)
            canonical = normalize_key(key)
            if canonical:
                result[canonical] = value.strip()
    return result


def parse_yaml_file(filepath: str) -> dict:
    """Parse YAML file and extract MVN items."""
    with open(filepath, "r") as f:
        data = yaml.safe_load(f)

    result = {}

    # Handle nested structures
    def extract_mvn(obj, prefix=""):
        if isinstance(obj, dict):
            for key, value in obj.items():
                canonical = normalize_key(key)
                if canonical and value is not None:
                    # Skip if value is "MISSING" or empty
                    str_value = str(value).strip().upper()
                    if str_value and str_value != "MISSING":
                        result[canonical] = value
                # Recurse into nested dicts
                if isinstance(value, dict):
                    extract_mvn(value, f"{prefix}{key}.")

    extract_mvn(data)
    return result


def validate_mvn(mvn_data: dict) -> tuple[bool, list[str], list[str]]:
    """
    Validate MVN data against required items.

    Returns:
        (is_valid, present_items, missing_items)
    """
    present = []
    missing = []

    for item in MVN_CORE_ITEMS:
        if item in mvn_data and mvn_data[item]:
            present.append(item)
        else:
            missing.append(item)

    is_valid = len(missing) == 0
    return is_valid, present, missing


def format_item_name(item: str) -> str:
    """Human-readable item name."""
    names = {
        "ticket": "Ticket/Preco atual",
        "cac": "Custo de Aquisicao (CAC)",
        "ltv": "Lifetime Value (LTV)",
        "conversao": "Taxa de conversao",
        "churn": "Churn/Retencao",
        "leads": "Volume de leads mensal",
        "margem": "Margem de lucro",
    }
    return names.get(item, item)


def main():
    if len(sys.argv) < 2:
        print("Usage: python validate-mvn.py <mvn_file.yaml>")
        print("       python validate-mvn.py --inline 'ticket:2997,cac:150,...'")
        sys.exit(1)

    # Parse input
    if sys.argv[1] == "--inline":
        if len(sys.argv) < 3:
            print("Error: --inline requires data string")
            sys.exit(1)
        mvn_data = parse_inline(sys.argv[2])
    else:
        filepath = sys.argv[1]
        if not Path(filepath).exists():
            print(f"Error: File not found: {filepath}")
            sys.exit(1)
        mvn_data = parse_yaml_file(filepath)

    # Validate
    is_valid, present, missing = validate_mvn(mvn_data)

    # Output
    print("=" * 60)
    print("MVN VALIDATION REPORT")
    print("=" * 60)
    print()
    print(f"Status: {'PASS' if is_valid else 'FAIL'}")
    print(f"Completeness: {len(present)}/7")
    print()

    if present:
        print("Present items:")
        for item in present:
            value = mvn_data.get(item, "")
            print(f"  [x] {format_item_name(item)}: {value}")

    if missing:
        print()
        print("Missing items (REQUIRED before calculations):")
        for item in missing:
            print(f"  [ ] {format_item_name(item)}")

    print()
    print("=" * 60)

    if is_valid:
        print("RESULT: PASS - All MVN items present. Calculations allowed.")
    else:
        print("RESULT: FAIL - Collect missing items before calculating.")
        print()
        print("Questions to ask:")
        for item in missing:
            questions = {
                "ticket": "Qual o preco/ticket medio atual? (moeda)",
                "cac": "Quanto custa adquirir um cliente? (R$ ou CPC/CPM)",
                "ltv": "Quanto um cliente vale ao longo do tempo? (R$)",
                "conversao": "De 100 leads, quantos compram? (%)",
                "churn": "Qual a taxa de churn/retencao? (%)",
                "leads": "Quantos leads entram por mes?",
                "margem": "Qual a margem de lucro atual? (%)",
            }
            print(f"  - {questions.get(item, item)}")

    print("=" * 60)

    sys.exit(0 if is_valid else 1)


if __name__ == "__main__":
    main()

# Criado com Squad Creator do AIOSPRO por @oalanicolas e @pedrovalerio | 2026-02-10
