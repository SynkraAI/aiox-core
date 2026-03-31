---
protocol: code-review-ping-pong
type: fix
round: 8
date: "2026-03-31"
fixer: "Claude Opus 4.6"
review_file: round-8.md
commit_sha_before: "5f6528c30331894dec623479ac71ccfebc615c64"
commit_sha_after: "b8593ee5a6348b25e39e824474acfa9bf39b18c7"
branch: chore/devops-10-improvements
issues_fixed: 2
issues_skipped: 0
issues_total: 2
git_diff_stat: "2 files changed, 6 insertions(+), 5 deletions(-)"
quality_checks:
  lint: skipped
  typecheck: skipped
  tests: skipped
fixes:
  - id: "8.1"
    status: FIXED
    file: "engine/guide.md"
    description: "Aligned edge case bullets with current contracts: locked phases now mention Integration Gate (§2.5) as possible cause; Final Victory now triggers on no pending items in resolved_items (including sub-items), explicitly stating skipped/unused do not block."
    deviation: "none"
  - id: "8.2"
    status: FIXED
    file: "engine/scanner.md"
    description: "Added unary NOT to the boolean grammar section title, examples, and evaluation rules with explicit precedence (NOT > AND > OR). The matched_rule example at line 283 is now consistent with the documented grammar."
    deviation: "none"
preserved:
  - "SKILL.md — not affected by round-8 issues"
  - "engine/ceremony.md — not affected by round-8 issues"
  - "engine/checklist.md — not affected by round-8 issues"
  - "engine/xp-system.md — not affected by round-8 issues"
---

# Code Ping-Pong — Round 8 Fix Report

## Fixed Issues

### Fix for Issue 8.1

**Edge cases do status/final victory ainda descrevem regras antigas** (MEDIUM)

**Problem:** Two edge case bullets in §8 of `engine/guide.md` used outdated semantics — referring to "missões obrigatórias pendentes" without mentioning the Integration Gate as a lock cause, and using "All items done" instead of the `resolved_items`-based contract from §4.5.

**Fix applied:**

1. **Locked phases bullet:** Updated message to explain that the next world may still be locked because required items are pending OR the Integration Gate (§2.5) has not been approved — matching the unlock logic in `is_phase_unlocked()` at line 561.

2. **Final Victory bullet:** Replaced "All items done" with "No pending items in `resolved_items` across all phases (including valid sub-items)" and explicitly noted that `skipped`/`unused` statuses do NOT block victory — matching the §4.5 contract at line 389.

**Anti-whack-a-mole check:** Searched all scope files for "All items done" and "missões obrigatórias pendentes". Only occurrences outside `guide.md` are in previous round files (`.code-review-ping-pong/round-4.md`, `round-7.md`, `round-8.md`) which are review artifacts, not normative docs. No additional files needed fixing.

### Fix for Issue 8.2

**Scanner usa `NOT` em exemplo normativo sem definir o operador** (LOW)

**Problem:** The boolean grammar section (§4.1) only documented `AND` and `OR`, but line 283 used `NOT` in a `matched_rule` example. This left ambiguity about whether `NOT` is part of the language.

**Fix applied:**

1. **Section title:** Changed from `AND` / `OR` to `AND` / `OR` / `NOT`.
2. **Description:** Added `NOT` as a supported unary operator.
3. **Examples:** Added a third example showing `NOT` usage: `"has_file('package.json') AND NOT has_file('.aios/quest-log.yaml')"`.
4. **Evaluation rules:** Extended precedence documentation: `NOT` > `AND` > `OR`. Clarified that `NOT` applies to the immediately following sub-expression only.

The existing `matched_rule` example at line 283 is now fully consistent with the documented grammar.

**Anti-whack-a-mole check:** Searched all occurrences of `NOT` in `scanner.md`. Other uses (lines 115, 366, 374, 393) are natural language ("do NOT evaluate", "do NOT hardcode") — not boolean operator references. No additional fixes needed.

## Skipped Issues

None.
