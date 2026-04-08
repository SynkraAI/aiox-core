---
protocol: code-review-ping-pong
type: review
round: 5
date: "2026-03-28"
reviewer: "Codex"
commit_sha: "a2de26ad3"
branch: "chore/devops-10-improvements"
based_on_fix: null
files_in_scope:
  - "skills/quest/SKILL.md"
  - "skills/quest/engine/guide.md"
  - "skills/quest/engine/xp-system.md"
  - "skills/quest/engine/ceremony.md"
  - "skills/quest/engine/checklist.md"
  - "skills/quest/engine/scanner.md"
  - "skills/quest/dashboard/server.js"
  - "skills/quest/packs/app-development.yaml"
  - "skills/quest/packs/squad-upgrade.yaml"
  - "skills/quest/packs/design-system-forge.yaml"
  - "tests/quest/quest-contracts.test.js"
  - "docs/stories/active/quest-contract-tests.story.md"
score: 8
verdict: "CONTINUE"
issues:
  - id: "5.1"
    severity: "HIGH"
    title: "Manual check/skip flow bypasses the Integration Gate"
    file: "skills/quest/engine/checklist.md"
    line: 184
    suggestion: "Make the phase lock guard delegate to the same unlock predicate as guide.md, including Integration Gate failure."
  - id: "5.2"
    severity: "HIGH"
    title: "Detected items have no executable promotion path after a phase unlocks"
    file: "skills/quest/engine/guide.md"
    line: 45
    suggestion: "Promote unlocked `detected` items to `done` before next-mission selection and stats recomputation, or treat them as actionable until promotion happens."
  - id: "5.3"
    severity: "MEDIUM"
    title: "Registry watcher is re-registered on every change without closing the previous one"
    file: "skills/quest/dashboard/server.js"
    line: 425
    suggestion: "Keep a single registry watcher handle and close or reuse it before calling `watchRegistry()` again."
---

# Code Ping-Pong — Round 5 Review

## Score: 8/10 — CONTINUE

## Issues

### HIGH

#### Issue 5.1 — Manual check/skip flow bypasses the Integration Gate
- **File:** `skills/quest/engine/checklist.md`
- **Line:** 184
- **Code:** `If that phase is LOCKED (i.e., the previous phase still has required: true items with status pending)`
- **Problem:** The contract in `guide.md` says a phase unlock requires both completed required items and a successful Integration Gate check. The `check` and `skip` flows redefine "locked" as only "previous required items still pending", which means a user can manually mark items in the next phase as `done` or `skipped` even when `verify_phase_integration()` would still return `false`. That undermines the whole anti-bypass purpose of section 2.5.
- **Suggestion:** Reuse `guide.md`'s `is_phase_unlocked()` logic for `check` and `skip`, or inline the Integration Gate requirement so later-phase manual actions stay blocked until integration actually passes.

#### Issue 5.2 — Detected items have no executable promotion path after a phase unlocks
- **File:** `skills/quest/engine/guide.md`
- **Line:** 45
- **Code:** `In the first unlocked phase that has pending items:`
- **Problem:** `checklist.md` introduces a third state, `detected`, and promises those items are "automatically promoted" to `done` once the phase unlocks. But the live flow never says where that promotion actually happens, and the next-mission algorithm only looks for `pending` items. After a scan pre-detects work in a locked phase, those missions can fall out of the mission picker, remain excluded from XP/progress, and leave the quest in a contradictory state where work exists but is neither actionable nor counted.
- **Suggestion:** Add an explicit promotion step in the unlock/resumption flow before mission selection and stat recomputation, or update the selection/stat contracts so `detected` is handled consistently until promotion occurs.

### MEDIUM

#### Issue 5.3 — Registry watcher is re-registered on every change without closing the previous one
- **File:** `skills/quest/dashboard/server.js`
- **Line:** 425
- **Code:** `fs.watch(REGISTRY_DIR, { recursive: false }, ... watchRegistry(); )`
- **Problem:** `watchRegistry()` installs an `fs.watch()` listener, and inside that listener it calls `watchRegistry()` again after reloading the registry. The previous registry watcher is never stored or closed, so every registry update adds another listener. Over time this causes duplicate reload/broadcast work and can exhaust file-watcher resources.
- **Suggestion:** Store the registry watcher in a module-level variable and close or reuse it during reloads instead of recursively creating a new watcher each time.

## Regressions
- None from `round-3-fixed.md`. The prior documentation fixes are still present and the contract test suite still passes. The issues above are residual gaps that the current tests do not cover.

## What Is Good
- The quest resumption contract is still coherent across `SKILL.md`, `checklist.md`, `ceremony.md`, and `guide.md`.
- The pack boundary is materially stronger than in earlier rounds: prerequisites, expansion gating, and item schema expectations now line up with the YAML packs.
- `xp-system.md` still documents the correct ordering for `base_item_xp`, `streak`, achievement evaluation, and final `total_xp`.
- `tests/quest/quest-contracts.test.js` is still a useful regression net and passes cleanly on the reviewed tree.

## Summary
- Total: 3, CRITICAL: 0, HIGH: 2, MEDIUM: 1, LOW: 0
- Regressions: none
