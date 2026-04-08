---
protocol: code-review-ping-pong
type: review
round: 6
date: "2026-03-29"
reviewer: "Codex"
commit_sha: "fbadac432"
branch: "chore/devops-10-improvements"
based_on_fix: "round-5-fixed.md"
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
score: 8
verdict: "CONTINUE"
issues:
  - id: "6.1"
    severity: "HIGH"
    title: "Detected-item promotion runs after the banner and is never persisted"
    file: "skills/quest/SKILL.md"
    line: "42-45"
    suggestion: "Move detected-item promotion into the checklist read/save flow, persist the updated quest-log before rendering the banner, and only then call ceremony/guide."
  - id: "6.2"
    severity: "MEDIUM"
    title: "Scan achievements have no input contract from the scan flow"
    file: "skills/quest/engine/checklist.md"
    line: 264
    suggestion: "Pass the scan discovery count into xp-system explicitly during `/quest scan`, and add a regression test that covers `scan_found >= N` unlocking."
---

# Code Ping-Pong — Round 6 Review

## 🎯 Score: 8/10 — CONTINUE

---

## Issues

### 🟠 HIGH

> Issues that cause incorrect behavior or significant quality problems.

#### Issue 6.1 — Detected-item promotion runs after the banner and is never persisted
- **File:** `skills/quest/SKILL.md`
- **Line:** 42-45
- **Code:**
  ```md
  3. Read `engine/checklist.md` §3 (Read Quest-log) — this recalculates stats via xp-system...
  4. Read `engine/ceremony.md` §7 — output the Resumption Banner.
  5. Find next mission via `engine/guide.md` §2 ...
  ```
- **Problem:** Round 5 moved the `detected -> done` promotion into `guide.md` §2, but the resumption flow still renders the banner before the guide runs and never saves the promoted quest-log afterward. In practice this means the user sees stale `items_done` / `percent` numbers in the banner, and the promoted items are volatile state only: on the next session they are still `detected`, get "promoted" again, and receive a fresh `completed_at` every time. That breaks the contract in `checklist.md` §8/§9 that unlock-time promotion updates stats and is written back to disk.
- **Suggestion:**
  ```md
  Move the promotion step into checklist.md §3 (or another persisted write path),
  recalculate stats + achievements there, save the quest-log, and only then render
  ceremony.md §7 and guide.md §2 using the persisted state.
  ```

### 🟡 MEDIUM

> Code style, readability, maintainability, or minor performance issues.

#### Issue 6.2 — Scan achievements have no input contract from the scan flow
- **File:** `skills/quest/engine/checklist.md`
- **Line:** 264
- **Code:**
  ```md
  - Recalculate stats via xp-system. Detect achievements. Save quest-log.
  ```
- **Problem:** `xp-system.md` defines `auto_detected >= N` / `scan_found >= N` using `scan_detected_count`, and `app-development.yaml` actually ships an achievement with `condition: "scan_found >= 3"`. But the `/quest scan` contract never says to pass `discovery_count`, `detection_count`, or any other scan context into the XP system. The XP system execution order mentions "scan context", yet the only caller spec here invokes it with no such input. That leaves the scanner achievement either permanently locked or implementation-defined, depending on whether a future implementation guesses the count from somewhere else.
- **Suggestion:**
  ```md
  Extend checklist.md §5 so `/quest scan` calls xp-system with an explicit
  `scan_detected_count` (or equivalent) derived from the current scan result,
  and cover it in quest-contracts.test.js with a pack achievement that must
  unlock after N scan discoveries.
  ```

---

## Regressions

> Issues introduced by fixes from the previous round. Leave empty if first round or no regressions.

- Round 5 fixed the lock guard and registry watcher leak correctly, but the new detected-item promotion path was attached to `guide.md` without a persisted write path, creating a new resumption-state regression.

---

## ✅ What Is Good

> Explicitly list things that are well-implemented. The fixer must NOT change these.

- `skills/quest/engine/checklist.md` now correctly delegates manual phase access to `is_phase_unlocked(...)`, so the Integration Gate can no longer be bypassed by `/quest check` or `/quest skip`.
- `skills/quest/dashboard/server.js` now keeps a single `registryWatcher` handle and closes it before re-registering, which removes the listener accumulation bug from round 5.
- `tests/quest/quest-contracts.test.js` still passes cleanly (`30/30`) and continues to guard the earlier pack-selection and migration contracts.

---

## 📊 Summary

- **Total issues:** 2
- **By severity:** 🔴 0 CRITICAL, 🟠 1 HIGH, 🟡 1 MEDIUM, 🟢 0 LOW
- **Regressions from previous round:** 1
- **Next action:** Fix issues and request new review
