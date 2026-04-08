---
protocol: code-review-ping-pong
type: review
round: 8
date: "2026-03-29"
reviewer: "Codex"
commit_sha: "815ee46ac"
branch: "chore/devops-10-improvements"
based_on_fix: "round-7-fixed.md"
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
score: 9
verdict: "CONTINUE"
issues:
  - id: "8.1"
    severity: "HIGH"
    title: "Resumption reads now rewrite the quest log on every invocation"
    file: "skills/quest/engine/checklist.md"
    line: "110-111"
    suggestion: "Only update and save `last_updated` when a semantic state change occurred, or introduce a separate read-only access timestamp instead of turning every read into a write."
  - id: "8.2"
    severity: "MEDIUM"
    title: "Dashboard fallback YAML parser cannot read the registry format it writes"
    file: "skills/quest/dashboard/server.js"
    line: "75-103"
    suggestion: "Either remove the unsupported fallback path and require `js-yaml`, or fix `parseYamlSimple()` to parse multi-line arrays of objects like the `projects:` registry entries emitted by `writeRegistry()`."
---

# Code Ping-Pong — Round 8 Review

## 🎯 Score: 9/10 — CONTINUE

---

## Issues

### 🟠 HIGH

> Issues that cause incorrect behavior or significant quality problems.

#### Issue 8.1 — Resumption reads now rewrite the quest log on every invocation
- **File:** `skills/quest/engine/checklist.md`
- **Line:** 110-111
- **Code:**
  ```md
  6. Update `meta.last_updated` to current datetime.
  7. **Save if changed:** If ANY of the above steps modified the quest-log ...
  ```
- **Problem:** `meta.last_updated` is defined earlier in the same file as a field "updated on every write", but round 7 now updates it during the read flow and then treats that mutation as a reason to save. In effect, every plain resumption or `/quest status` style read becomes a write: the quest log and backup file are rewritten even when no mission state, stats, achievements, or pack data changed. That creates unnecessary disk churn, dirties repos that track `.aios/quest-log.yaml`, and breaks the intended "show a quick status" semantics of the resumption path.
- **Suggestion:**
  ```md
  Keep `last_updated` tied to real writes only. During Read Quest-log, save only when
  promotion/migration/pack-switch/stats/achievements changed semantic state, or split
  the concept into `last_updated` (writes) and a separate non-persisted/optional
  `last_accessed` if read tracking is needed.
  ```

### 🟡 MEDIUM

> Code style, readability, maintainability, or minor performance issues.

#### Issue 8.2 — Dashboard fallback YAML parser cannot read the registry format it writes
- **File:** `skills/quest/dashboard/server.js`
- **Line:** 75-103
- **Code:**
  ```js
  if (content.startsWith('- ')) {
    const itemContent = content.slice(2).trim();
    if (itemContent.includes(': ')) {
      const obj = {};
      ...
      if (lastKey && parent[lastKey] === null) {
        parent[lastKey] = [obj];
        currentArrayKey = lastKey;
      }
    }
  }
  ```
- **Problem:** The script advertises `parseYamlSimple()` as a fallback for `quest-registry.yaml`, but it cannot parse the multi-line array-of-objects structure that `writeRegistry()` emits:
  ```yaml
  projects:
    - path: /tmp/demo
      pack: app-development
      project_name: demo
  ```
  Reproducing the parser with that exact shape yields `projects` as a plain object containing only the follow-up keys, not an array entry with all fields. If `js-yaml` is unavailable, the dashboard will misread or corrupt the registry instead of gracefully handling the subset it claims to support.
- **Suggestion:**
  ```js
  Either make `js-yaml` a hard requirement for the dashboard runtime, or teach the
  fallback parser to keep subsequent indented keys attached to the current array
  object for `projects:` style YAML emitted by `writeRegistry()`.
  ```

---

## Regressions

> Issues introduced by fixes from the previous round. Leave empty if first round or no regressions.

- Round 7 fixed the persistence gap, but it did so by turning the resumption read path into an unconditional write path through `last_updated`, which is a new behavior regression.

---

## ✅ What Is Good

> Explicitly list things that are well-implemented. The fixer must NOT change these.

- `skills/quest/engine/checklist.md` now correctly saves post-promotion state before ceremony and mission rendering, so the earlier volatile `detected` promotion bug is materially improved.
- `skills/quest/engine/checklist.md` now aligns scan achievement counting with the XP definition by counting only unlocked discoveries.
- `tests/quest/quest-contracts.test.js` still passes cleanly (`30/30`) and the reviewed pack-achievement conditions remain within the condition set documented by `xp-system.md`.

---

## 📊 Summary

- **Total issues:** 2
- **By severity:** 🔴 0 CRITICAL, 🟠 1 HIGH, 🟡 1 MEDIUM, 🟢 0 LOW
- **Regressions from previous round:** 1
- **Next action:** Fix issues and request new review
