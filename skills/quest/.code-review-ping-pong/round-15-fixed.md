---
protocol: code-review-ping-pong
type: fix
round: 15
date: "2026-03-31"
fixer: "Claude Opus 4.6"
review_file: round-15.md
commit_sha_before: "96296463a41b0280fd10a7cc8afebcac064828e1"
commit_sha_after: "e33294d7e"
branch: chore/devops-10-improvements
issues_fixed: 3
issues_skipped: 0
issues_total: 3
git_diff_stat: "3 files changed, 14 insertions(+), 3 deletions(-)"
quality_checks:
  lint: skipped
  typecheck: skipped
  tests: skipped
fixes:
  - id: "15.1"
    status: FIXED
    file: "SKILL.md"
    description: "Restructured FIRST INSTRUCTION into Step A (Command Routing) and Step B (Quest-log Detection). Commands like check/skip/unused/sub/scan/status now route BEFORE the resumption branch, so they work regardless of quest-log existence."
    deviation: "none"
  - id: "15.2"
    status: FIXED
    file: "engine/guide.md"
    description: "Replaced step 4 single-exit with two-branch logic: (a) if pending items exist in locked phases, show blocked-at-gate message; (b) only declare quest complete when NO pending items exist in ANY phase (locked or unlocked). Consistent with edge case §8 line 702."
    deviation: "none"
  - id: "15.3"
    status: FIXED
    file: "engine/checklist.md"
    description: "Pack mismatch transition (§3 step 2, scanner choice) now explicitly clears integration_results to {} before rebuilding items. Prevents stale gate results from a prior pack from satisfying the new pack's phase unlock predicates."
    deviation: "none"
preserved:
  - "engine/scanner.md — no issues found, not modified"
  - "engine/xp-system.md — no issues found, not modified"
  - "engine/ceremony.md — no issues found, not modified"
---

# Code Ping-Pong — Round 15 Fix Report

## Summary

All 3 issues from round 15 were fixed. No skips.

**Anti-whack-a-mole analysis:**
- **15.1 pattern** (resumption bypassing command routing): Only SKILL.md has the resumption branch logic — no other file duplicates this entry point. The Command Routing table (SKILL.md lines 110-121) was already correct; only the execution order was wrong. Fixed by restructuring the FIRST INSTRUCTION section.
- **15.2 pattern** (quest-complete declared with locked phases remaining): Only `engine/guide.md` line 56 had this logic. Edge case §8 (line 702) already described the correct behavior for this scenario — the algorithm step 4 just wasn't implementing it. Fixed by splitting step 4 into explicit branches that check ALL phases.
- **15.3 pattern** (`integration_results` reuse across pack transitions): The pack mismatch flow exists only in `checklist.md §3` step 2. No other file performs pack transitions. The `integration_results` map is written by `guide.md` (log_integration_result) and read by `checklist.md` (is_phase_unlocked_persisted) and `guide.md` (is_phase_unlocked, status rendering) — all consumers use `str(phase_index)` as key, so clearing the map to `{}` is safe.

---

### Fix for Issue 15.1

**HIGH — Command routing bypassed by resumption branch**

**Problem:** SKILL.md line 22 instructed "go DIRECTLY to RESUMPTION, do NOT read any other sections" when quest-log exists. The Command Routing table (lines 106-117) defining `check`, `skip`, `unused`, `sub`, `scan`, and `status` lived AFTER the resumption branch. A faithful implementation would ignore all commands in sessions with an existing quest-log.

**Fix:** Restructured FIRST INSTRUCTION into two explicit steps:
- **Step A — Command Routing:** Runs FIRST, always. If the user provided a known command argument, route immediately and stop.
- **Step B — Quest-log Detection:** Only runs when no command argument was provided. Then branches to RESUMPTION or FIRST INVOCATION as before.

**Result:** Commands now work in every session state. The resumption fast-path is preserved for bare `/quest` invocations without arguments.

---

### Fix for Issue 15.2

**HIGH — Next mission algorithm could declare quest complete with locked phases pending**

**Problem:** Step 4 of the Next Mission Selection algorithm said "If no pending items exist in any unlocked phase → quest is complete." This ignored locked phases that might still have `pending` items — for example, when the Integration Gate hasn't been approved. The algorithm would prematurely declare victory instead of showing the user they're blocked at a gate.

**Fix:** Replaced the single-exit step 4 with a two-branch check:
- **4a:** After finding no pending items in unlocked phases, scan ALL phases (including locked ones) for `pending` items in `resolved_items`.
- **4b:** If pending items exist in locked phases → show blocked-at-gate message directing user to check the Integration Gate.
- **4c:** Only declare quest complete when NO pending items exist in ANY phase, locked or unlocked.

**Result:** Consistent with edge case §8 (line 702) which already described this behavior. The algorithm now implements what the edge case documented.

---

### Fix for Issue 15.3

**MEDIUM — Pack transition reuses stale integration_results**

**Problem:** When switching packs via the mismatch flow in `checklist.md §3`, `meta.pack` and items were updated but `integration_results` was left intact. Since integration results are keyed by `str(phase_index)` (not namespaced by pack), a result like `integration_results["2"]` from the old pack could satisfy the new pack's phase 2 unlock predicate without the new pack's integration checks ever running.

**Fix:** Added explicit `integration_results = {}` clearing in the pack mismatch transition flow (checklist.md §3 step 2, scanner choice). The clearing happens BEFORE rebuilding items, ensuring no stale gate results persist.

**Result:** After a pack switch, all Integration Gates must be passed fresh for the new pack. Previously completed phases from the old pack retain their item statuses but their gate results are invalidated — the new pack's gates will run when the user progresses through those phases.
