---
protocol: code-review-ping-pong
type: review
round: 7
date: "2026-03-29"
reviewer: "Codex"
commit_sha: "55f5b9e16"
branch: "chore/devops-10-improvements"
based_on_fix: "round-6-fixed.md"
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
  - id: "7.1"
    severity: "HIGH"
    title: "Read flow still does not save after promoting detected items"
    file: "skills/quest/engine/checklist.md"
    line: "107-110"
    suggestion: "After promotion and xp recomputation in Read Quest-log, explicitly save the quest-log before ceremony/guide rendering whenever any item or achievement changed."
  - id: "7.2"
    severity: "MEDIUM"
    title: "Scan counter contract now disagrees with the XP definition of auto-detected items"
    file: "skills/quest/engine/checklist.md"
    line: 265
    suggestion: "Either count only unlocked discoveries for `scan_detected_count`, or update xp-system.md to state clearly that locked `detected` items also contribute to `scan_found` achievements."
  - id: "7.3"
    severity: "MEDIUM"
    title: "Checklist scan-rule function list omits functions used by shipped packs"
    file: "skills/quest/engine/checklist.md"
    line: "272-279"
    suggestion: "Document `has_content_matching()` and `command_exists()` in the scan function table, or delegate the authoritative function list to scanner.md instead of maintaining a stale subset."
---

# Code Ping-Pong — Round 7 Review

## 🎯 Score: 8/10 — CONTINUE

---

## Issues

### 🟠 HIGH

> Issues that cause incorrect behavior or significant quality problems.

#### Issue 7.1 — Read flow still does not save after promoting detected items
- **File:** `skills/quest/engine/checklist.md`
- **Line:** 107-110
- **Code:**
  ```md
  3. **Pack version check:** ...
  4. **Promote detected items (BEFORE stats):** ...
  5. **Always recalculate stats** via xp-system...
  6. Update `meta.last_updated` to current datetime.
  ```
- **Problem:** Round 6 moved the promotion into `Read Quest-log`, but the read contract still never says to write the updated quest-log back to disk. `SKILL.md` step 3 hands directly from this read flow to the banner and mission rendering, so the claimed persistence from `round-6-fixed.md` still does not exist in the actual spec. As written, a compliant implementation can promote items, unlock achievements, bump stats, and update `last_updated` only in memory, then discard everything at the end of resumption. That reintroduces the same session-to-session churn the previous round was trying to eliminate.
- **Suggestion:**
  ```md
  In checklist.md §3, state that if promotion, migration, pack switching, stat
  recalculation, or achievement evaluation changes the quest-log, Save Rules §8
  must run before ceremony.md §7 or guide.md §2 use the data.
  ```

### 🟡 MEDIUM

> Code style, readability, maintainability, or minor performance issues.

#### Issue 7.2 — Scan counter contract now disagrees with the XP definition of auto-detected items
- **File:** `skills/quest/engine/checklist.md`
- **Line:** 265
- **Code:**
  ```md
  Recalculate stats via xp-system, passing `scan_detected_count: discovery_count + detection_count`
  ```
- **Problem:** `xp-system.md` defines `auto_detected >= N` / `scan_found >= N` as "how many items were auto-detected as done", but the new caller passes `discovery_count + detection_count`. `detection_count` includes locked-phase items that are explicitly *not* marked done yet; they remain `status: detected` until a future unlock. That means a scan can unlock `scan_found` achievements even when none of those locked items have become completed work, which contradicts the XP module's current condition semantics.
- **Suggestion:**
  ```md
  Choose one contract and align both sides:
  - either pass only unlocked discoveries as `scan_detected_count`, or
  - update xp-system.md to define `scan_found` as all scan hits, including locked
    `detected` items, and make that wording explicit.
  ```

#### Issue 7.3 — Checklist scan-rule function list omits functions used by shipped packs
- **File:** `skills/quest/engine/checklist.md`
- **Line:** 272-279
- **Code:**
  ```md
  | `has_file('path')` | ...
  | `has_dir('path')` | ...
  | `has_file_matching('glob')` | ...
  | `has_remote('name')` | ...
  | `has_content('file', 'regex')` | ...
  | `file_count('glob') > N` | ...
  ```
- **Problem:** The Quest ships `design-system-forge.yaml` scan rules that depend on `command_exists('dembrandt')` and `has_content_matching(...)`, and `scanner.md` documents both functions. But `checklist.md` tells the scan flow to evaluate rules using "scanner functions (see table below)" and then provides a subset that omits those two functions. A literal implementation of checklist.md would reject or ignore valid scan rules already present in the packs.
- **Suggestion:**
  ```md
  Expand the checklist scan-function table to include `command_exists()` and
  `has_content_matching()`, or replace the table with a direct reference to the
  authoritative function catalog in scanner.md §4.1.
  ```

---

## Regressions

> Issues introduced by fixes from the previous round. Leave empty if first round or no regressions.

- Round 6 improved the location of detected-item promotion, but the promised persistence still is not part of the actual read contract, so the fix remains incomplete.
- Round 6 also introduced a new semantic mismatch by counting locked `detected` items toward `scan_detected_count` while xp-system still describes the metric as detected-as-done only.

---

## ✅ What Is Good

> Explicitly list things that are well-implemented. The fixer must NOT change these.

- `skills/quest/engine/guide.md` is cleaner now that next-mission selection no longer mutates quest state directly.
- `skills/quest/engine/checklist.md` now at least places detected-item promotion ahead of stat recomputation, which is the right direction for consistency with the resumption banner.
- `tests/quest/quest-contracts.test.js` still passes (`30/30`) and continues to protect the previously fixed pack-selection and migration behavior.

---

## 📊 Summary

- **Total issues:** 3
- **By severity:** 🔴 0 CRITICAL, 🟠 1 HIGH, 🟡 2 MEDIUM, 🟢 0 LOW
- **Regressions from previous round:** 2
- **Next action:** Fix issues and request new review
