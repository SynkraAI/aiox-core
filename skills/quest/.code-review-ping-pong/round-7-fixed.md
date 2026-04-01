---
protocol: code-review-ping-pong
type: fix
round: 7
date: "2026-04-01"
fixer: "Claude Opus 4.6"
review_file: round-7.md
commit_sha_before: "71a2fae5ac9242832794976924e0e1cbae627349"
commit_sha_after: "b039bd4ff0a5ea615e532a1e5335335f9feabe5f"
branch: chore/devops-10-improvements
issues_fixed: 3
issues_skipped: 1
issues_total: 4
git_diff_stat: "2 files changed, 12 insertions(+), 3 deletions(-)"
quality_checks:
  lint: skipped
  typecheck: skipped
  tests: skipped
fixes:
  - id: "7.1"
    status: FIXED
    file: "engine/ceremony.md"
    description: "Added explicit hero_name fallback contract cross-reference in §1.5 (Storage) and §7 (Resumption Banner hero_name field source). Both now reference SKILL.md and guide.md §1 as co-owners of the contract."
    deviation: "none"
  - id: "7.2"
    status: SKIPPED
    file: "engine/ceremony.md"
    description: "The progress bar visual consistency contract already exists at ceremony.md §7 lines 491-498, including the prohibition of U+2593. The reviewer referenced lines 275-290 which are in the World Map section (§3), not the Resumption Banner. No change needed."
    deviation: "none"
  - id: "7.3"
    status: FIXED
    file: "engine/guide.md"
    description: "Added fallback note in guide.md §2 Next Mission Selection: when condition field is missing, malformed, or empty, item is treated as unconditional (always applicable) per checklist.md §1. Propagation check: checklist.md §5 (scan) and §2 (create) already handle condition_state correctly."
    deviation: "none"
  - id: "7.4"
    status: FIXED
    file: "engine/guide.md"
    description: "Expanded the unused exclusion comment in guide.md §2 Phase Unlock Check to cross-reference checklist.md §1, xp-system.md §5, and xp-system.md §7. Propagation check: all other modules that handle unused (xp-system §4 streak, §5 counters, §7 achievements) already document the exclusion correctly."
    deviation: "none"
preserved:
  - "engine/ceremony.md — existing progress bar contract at §7 lines 491-498 preserved (issue 7.2 already addressed)"
  - "engine/checklist.md — no changes needed, already defines condition_state and unused correctly"
  - "engine/xp-system.md — no changes needed, already handles unused exclusion in §4, §5, §7, §10"
  - "SKILL.md — no changes needed, already has hero_name fallback contract at line 14"
---

# Code Review Ping-Pong — Round 7 Fix Report

## Summary

Applied 3 fixes, skipped 1 (already addressed in current code). All fixes add cross-module contract references to prevent silent drift between ceremony.md, guide.md, checklist.md, xp-system.md, and SKILL.md.

## Anti-Whack-a-Mole Analysis

For each issue, searched all files in the quest engine scope for the same pattern:

- **hero_name fallback (7.1):** Grep for "Aventureiro" across all engine files. Found in SKILL.md (line 14), guide.md §1 (line 13), ceremony.md §1.5 (line 124), ceremony.md §7 (line 470). SKILL.md and guide.md already had cross-references. Ceremony.md §1.5 and §7 were missing them — both fixed.
- **Progress bar contract (7.2):** Grep for "progress bar" and "U+2593" across all engine files. Found in ceremony.md §2 (line 165), ceremony.md §7 (lines 491-498), guide.md §5 and §6. All locations already have the contract documented. No gap found.
- **Condition fallback (7.3):** Grep for "condition_state" across engine files. Found in checklist.md §1 (definition), guide.md §2 (consumption), checklist.md §5 (scan evaluation), checklist.md §2 (creation). Only guide.md §2 was missing the fallback cross-reference — fixed.
- **Unused in phase unlock (7.4):** Grep for "unused" across engine files. Found in checklist.md §1 (status definition), xp-system.md §4 (streak), §5 (counters), §7 (achievements), §10 (edge cases), guide.md §2 (phase unlock). Only guide.md §2 was missing cross-references to the other modules — fixed.

## Semantic Propagation Analysis

- **7.1 contract:** The hero_name fallback is a 3-location contract (SKILL.md, guide.md §1, ceremony.md). All three now explicitly reference each other.
- **7.3 contract:** The condition evaluation chain is checklist.md §1 (defines) → checklist.md §2/§5 (sets condition_state) → guide.md §2 (reads condition_state). Guide now references the source of truth (checklist.md §1) for fallback behavior.
- **7.4 contract:** The unused exclusion is a cross-cutting concern across 5 modules. All now document the exclusion with cross-references to the canonical definitions.

## Fixed Issues

### Fix for Issue 7.1

**Ambiguous fallback contract propagation for hero_name**

Added explicit cross-reference in ceremony.md §1.5 (Storage section) documenting that the "Aventureiro" fallback is shared with SKILL.md and guide.md §1, and that all three locations must be updated together.

Updated ceremony.md §7 (Resumption Banner) hero_name field source to include inline cross-reference to the shared contract in SKILL.md and guide.md §1.

**Files changed:** `engine/ceremony.md` (2 locations: §1.5 Storage, §7 Field Sources table)

### Fix for Issue 7.3

**Condition fallback handling not cross-referenced in guide.md**

Added a fallback note in guide.md §2 (Next Mission Selection) clarifying that items with missing, malformed, or empty `condition` fields are treated as unconditional (always `applicable`) per checklist.md §1. This ensures future edits don't accidentally prompt or block on items that should be unconditional.

**Files changed:** `engine/guide.md` (§2 algorithm, condition handling block)

### Fix for Issue 7.4

**Edge case for unused items in phase unlock not re-stated**

Expanded the inline comment in guide.md §2 `is_phase_unlocked()` function to cross-reference checklist.md §1 (unused status definition), xp-system.md §5 (unused excluded from counters), and xp-system.md §7 (unused excluded from achievement conditions). This makes the exclusion contract explicit and traceable.

**Files changed:** `engine/guide.md` (§2 Phase Unlock Check, `is_phase_unlocked()` function)

## Skipped Issues

**Issue 7.2** — The progress bar visual consistency contract already exists at ceremony.md §7 (lines 491-498 in the current version), including the explicit prohibition of `▓` (U+2593) and cross-references to all four locations (ceremony.md §2, guide.md §5, guide.md §6). The reviewer's line reference (275-290) points to the World Map section (§3), not the Resumption Banner (§7). No change needed.
