#!/usr/bin/env python3
"""
Apply STT (speech-to-text) corrections to mining output files.
Reads correction patterns from stt-corrections.yaml and applies them.

Auto-corrections are applied directly (simple find/replace).
Contextual corrections are flagged for manual review.

Usage:
    python squads/curator/scripts/apply_stt_corrections.py <input_file> <corrections_yaml> [--dry-run]

Example:
    python squads/curator/scripts/apply_stt_corrections.py output/curated/my-source/momentos.md squads/curator/data/stt-corrections.yaml
    python squads/curator/scripts/apply_stt_corrections.py output/curated/my-source/momentos.md squads/curator/data/stt-corrections.yaml --dry-run
"""

import sys
import os
import re
import yaml


def load_corrections(yaml_path: str) -> dict:
    """Load correction patterns from YAML file."""
    with open(yaml_path, "r", encoding="utf-8") as f:
        return yaml.safe_load(f)


def apply_auto_corrections(content: str, corrections: list) -> tuple[str, list]:
    """Apply automatic corrections. Returns (new_content, list_of_changes)."""
    changes = []
    for entry in corrections:
        wrong = entry["wrong"]
        correct = entry["correct"]
        # Use word boundary matching to avoid partial replacements
        # But allow for case variations
        pattern = re.compile(r'\b' + re.escape(wrong) + r'\b')
        matches = pattern.findall(content)
        if matches:
            content = pattern.sub(correct, content)
            changes.append({
                "wrong": wrong,
                "correct": correct,
                "count": len(matches)
            })
    return content, changes


def find_contextual_matches(content: str, contextual: list) -> list:
    """Find contextual matches that need manual review."""
    flagged = []
    for entry in contextual:
        wrong = entry["wrong"]
        pattern = re.compile(r'\b' + re.escape(wrong) + r'\b', re.IGNORECASE)
        for match in pattern.finditer(content):
            # Get surrounding context (50 chars each side)
            start = max(0, match.start() - 50)
            end = min(len(content), match.end() + 50)
            context_snippet = content[start:end].replace('\n', ' ')
            flagged.append({
                "wrong": wrong,
                "correct": entry["correct"],
                "context_rule": entry.get("context", ""),
                "found_context": f"...{context_snippet}...",
                "position": match.start()
            })
    return flagged


def main():
    if len(sys.argv) < 3:
        print("Usage: python squads/curator/scripts/apply_stt_corrections.py <input_file> <corrections_yaml> [--dry-run]")
        sys.exit(1)

    input_file = sys.argv[1]
    corrections_yaml = sys.argv[2]
    dry_run = "--dry-run" in sys.argv

    if not os.path.isfile(input_file):
        print(f"ERROR: Input file not found: {input_file}")
        sys.exit(1)

    if not os.path.isfile(corrections_yaml):
        print(f"ERROR: Corrections file not found: {corrections_yaml}")
        sys.exit(1)

    # Load
    data = load_corrections(corrections_yaml)
    with open(input_file, "r", encoding="utf-8") as f:
        original_content = f.read()

    original_word_count = len(original_content.split())

    # Apply auto corrections
    corrected_content, auto_changes = apply_auto_corrections(
        original_content,
        data.get("corrections", [])
    )

    # Find contextual matches
    contextual_flags = find_contextual_matches(
        corrected_content,
        data.get("contextual", [])
    )

    # Report
    print(f"{'[DRY RUN] ' if dry_run else ''}STT Correction Report")
    print(f"{'=' * 50}")
    print(f"File: {input_file}")
    print(f"Corrections file: {corrections_yaml}")
    print()

    if auto_changes:
        print(f"AUTO-CORRECTED ({sum(c['count'] for c in auto_changes)} replacements):")
        for change in auto_changes:
            print(f"  '{change['wrong']}' -> '{change['correct']}' ({change['count']}x)")
    else:
        print("AUTO-CORRECTED: (none)")

    print()

    if contextual_flags:
        print(f"FLAGGED FOR REVIEW ({len(contextual_flags)} matches):")
        for flag in contextual_flags:
            print(f"  '{flag['wrong']}' -> '{flag['correct']}' (rule: {flag['context_rule']})")
            print(f"    Context: {flag['found_context']}")
    else:
        print("FLAGGED FOR REVIEW: (none)")

    # Validate word count preservation
    new_word_count = len(corrected_content.split())
    word_diff = abs(new_word_count - original_word_count)
    print(f"\nWord count: {original_word_count} -> {new_word_count} (diff: {word_diff})")

    if word_diff > len(auto_changes) * 2:
        print("WARNING: Word count changed more than expected. Review corrections.")

    # Write if not dry run
    if not dry_run and auto_changes:
        with open(input_file, "w", encoding="utf-8") as f:
            f.write(corrected_content)
        print(f"\nCorrections applied to {input_file}")
    elif dry_run:
        print(f"\n[DRY RUN] No changes written. Remove --dry-run to apply.")
    else:
        print(f"\nNo corrections needed.")


if __name__ == "__main__":
    main()
