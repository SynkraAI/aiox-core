---
protocol: code-review-ping-pong
type: review
round: 1
date: "2026-03-28"
reviewer: "Claude Code"
commit_sha: "d4ee0facb"
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
score: 7
verdict: CONTINUE
issues:
  - id: "1.1"
    severity: HIGH
    title: "Scanner function command_exists not defined"
    file: "skills/quest/engine/scanner.md"
    line: "108-166"
    suggestion: "Add command_exists to Scanner Functions table or remove from pack scan_rules"
  - id: "1.2"
    severity: HIGH
    title: "Scanner function has_content_matching not defined"
    file: "skills/quest/engine/scanner.md"
    line: "108-166"
    suggestion: "Add has_content_matching to Scanner Functions or replace with has_content in pack"
  - id: "1.3"
    severity: HIGH
    title: "has_content takes single file path but packs use glob patterns"
    file: "skills/quest/engine/scanner.md"
    line: "148-152"
    suggestion: "Either update has_content to accept globs or add has_content_matching function"
  - id: "1.4"
    severity: HIGH
    title: "Duplicate step numbers in checklist check and skip sections"
    file: "skills/quest/engine/checklist.md"
    line: "183-214"
    suggestion: "Renumber steps sequentially without duplicates"
  - id: "1.5"
    severity: MEDIUM
    title: "var instead of const for validThemes in server.js"
    file: "skills/quest/dashboard/server.js"
    line: "475"
    suggestion: "Change var to const"
  - id: "1.6"
    severity: MEDIUM
    title: "Celebration templates duplicated between xp-system and guide"
    file: "skills/quest/engine/xp-system.md"
    line: "286-345"
    suggestion: "Remove templates from xp-system.md and add pointer to guide.md"
  - id: "1.7"
    severity: MEDIUM
    title: "endpoint integration check type documented but not implemented"
    file: "skills/quest/engine/guide.md"
    line: "127-133"
    suggestion: "Add implementation details or mark as P1 future"
  - id: "1.8"
    severity: MEDIUM
    title: "Duplicate items between phases 5 and 6 in app-development pack"
    file: "skills/quest/packs/app-development.yaml"
    line: "535-617"
    suggestion: "Remove duplicates 6.6 and 6.7 or differentiate their purpose"
  - id: "1.9"
    severity: MEDIUM
    title: "sub_quests key in squad-upgrade not in pack schema"
    file: "skills/quest/packs/squad-upgrade.yaml"
    line: "303-307"
    suggestion: "Document sub_quests in scanner.md schema or remove from pack"
  - id: "1.10"
    severity: MEDIUM
    title: "pt-BR quality violations in checklist.md messages"
    file: "skills/quest/engine/checklist.md"
    line: "185-211"
    suggestion: "Fix accents: nao to nao, ja esta to ja esta"
  - id: "1.11"
    severity: LOW
    title: "argument-hint lists start but no routing for it"
    file: "skills/quest/SKILL.md"
    line: "5"
    suggestion: "Remove start from argument-hint or add routing entry"
  - id: "1.12"
    severity: LOW
    title: "requires field in design-system-forge not in schema"
    file: "skills/quest/packs/design-system-forge.yaml"
    line: "16"
    suggestion: "Remove requires field or document it in scanner.md"
---

# Code Ping-Pong — Round 1 Review

## Score: 7/10 — CONTINUE

---

## Issues

### HIGH

> Issues that cause incorrect behavior or significant quality problems.

#### Issue 1.1 — Scanner function `command_exists` not defined

- **File:** `skills/quest/engine/scanner.md`
- **Line:** 108-166 (Scanner Functions section)
- **Code:**
  ```yaml
  # In design-system-forge.yaml, item 0.3:
  scan_rule: "command_exists('dembrandt')"
  ```
- **Problem:** The `design-system-forge.yaml` pack uses `command_exists('dembrandt')` as a scan_rule, but `scanner.md` does not define this function in its Scanner Functions table. When the engine tries to evaluate this scan_rule, it will fail or produce undefined behavior because there's no implementation instruction for the LLM.
- **Suggestion:**
  Add to scanner.md's Scanner Functions table:
  ```markdown
  #### `command_exists('name')`
  Check if a command is available in PATH.
  ```
  ```
  Bash("command -v {name} && echo EXISTS || echo NO")
  ```

#### Issue 1.2 — Scanner function `has_content_matching` not defined

- **File:** `skills/quest/engine/scanner.md`
- **Line:** 108-166 (Scanner Functions section)
- **Code:**
  ```yaml
  # In design-system-forge.yaml, items 4.3, 4.5, 4.6, 4.7:
  scan_rule: "has_content_matching('**/components/**', 'transition')"
  scan_rule: "has_content_matching('**/components/**', 'md:')"
  scan_rule: "has_content_matching('**/components/**', 'dark:')"
  scan_rule: "has_content_matching('**/components/**', 'aria-')"
  ```
- **Problem:** The `design-system-forge.yaml` pack uses `has_content_matching(glob, regex)` in 4 scan_rules, but scanner.md only defines `has_content('file', 'regex')` which takes a single file path. These scan rules will fail because the LLM has no instruction on how to evaluate this function.
- **Suggestion:**
  Add to scanner.md's Scanner Functions table:
  ```markdown
  #### `has_content_matching('glob', 'regex')`
  Check if any file matching the glob contains content matching the regex.
  ```
  ```
  Grep(pattern="{regex}", glob="{glob}")  →  result.length > 0
  ```

#### Issue 1.3 — `has_content()` takes single file path but packs use glob patterns

- **File:** `skills/quest/engine/scanner.md`
- **Line:** 148-152
- **Code:**
  ```yaml
  # In app-development.yaml, item 3.2:
  scan_rule: "has_content('docs/stories/*.md', 'Status: Ready')"
  # In squad-upgrade.yaml, items 1.1-1.3:
  scan_rule: "has_content('agents/*.md', 'voice_dna')"
  ```
- **Problem:** `has_content('file', 'regex')` is defined as reading a single file and checking regex. But multiple pack items pass glob patterns (e.g., `docs/stories/*.md`, `agents/*.md`) as the first argument. The scanner function definition says "Read the file" — a glob is not a file path. This creates ambiguity: does the LLM expand the glob first? Use Grep with a glob? The behavior is undefined.
- **Suggestion:**
  Update `has_content` definition to explicitly support globs:
  ```markdown
  #### `has_content('file_or_glob', 'regex')`
  If the path contains wildcards (`*`, `**`), use Grep with glob parameter.
  If the path is a literal file, use Read + regex check.
  ```

#### Issue 1.4 — Duplicate step numbers in checklist check/skip sections

- **File:** `skills/quest/engine/checklist.md`
- **Line:** 183-214
- **Code:**
  ```markdown
  ### check {id}
  1. Validate...
  2. Phase lock guard...
  3. Set items[{id}].status to done.     ← first step 3
  3. Set items[{id}].completed_at...      ← second step 3
  4. Update meta.last_updated.
  ...

  ### skip {id}
  1. Validate...
  2. Phase lock guard...
  3. Ask for a reason...                  ← first step 3
  3. Set items[{id}].status to skipped.   ← second step 3
  4. Set items[{id}].note...
  ...
  ```
- **Problem:** Both the `check` and `skip` sections have duplicate step 3's. For an LLM following numbered instructions, this creates ambiguity about execution order. A model might skip one of the duplicated steps or execute them out of order.
- **Suggestion:** Renumber sequentially: steps should go 1, 2, 3, 4, 5, 6, 7, 8 in `check` and 1, 2, 3, 4, 5, 6, 7, 8, 9 in `skip`.

### MEDIUM

> Code style, readability, maintainability, or minor issues.

#### Issue 1.5 — `var` instead of `const` for validThemes

- **File:** `skills/quest/dashboard/server.js`
- **Line:** 475
- **Code:**
  ```javascript
  var validThemes = ['cyberpunk','fantasy','ember','gold','violet','crimson','phosphor','neon','vapor','cozy','paper','sakura','mint','sand'];
  ```
- **Problem:** Uses `var` while the rest of the file uses `const`/`let` consistently. `var` has function scope instead of block scope.
- **Suggestion:**
  ```javascript
  const validThemes = ['cyberpunk','fantasy','ember','gold','violet','crimson','phosphor','neon','vapor','cozy','paper','sakura','mint','sand'];
  ```

#### Issue 1.6 — Celebration templates duplicated between modules

- **File:** `skills/quest/engine/xp-system.md`
- **Line:** 286-345
- **Problem:** Both `xp-system.md` section 8 and `guide.md` section 4 define celebration templates (Mission Complete, World Complete, Level Up, Achievement Unlock). While `guide.md` section 4 states it takes precedence, having two competing template sources is confusing. An LLM might pick the wrong one depending on which module it reads first.
- **Suggestion:** Remove section 8 from `xp-system.md` entirely and add a pointer: "Celebration templates are defined in `guide.md` section 4. This module provides data only — rendering is guide.md's responsibility."

#### Issue 1.7 — `endpoint` integration check type documented but not implemented

- **File:** `skills/quest/engine/guide.md`
- **Line:** 127-133
- **Code:**
  ```markdown
  | `endpoint` | Starts app, hits URL, checks response | `http://localhost:3000/api/health` | 30s default |
  ```
- **Problem:** The `endpoint` type is listed in the supported types table but has zero implementation details. Unlike `command` and `file_exists`, there's no description of how to start the app, how to hit the URL, what constitutes a successful response, or how to clean up after.
- **Suggestion:** Either add full implementation details or mark as `P1 — not yet implemented` and add a guard that shows "endpoint checks not yet supported" if encountered.

#### Issue 1.8 — Duplicate items between phases 5 and 6

- **File:** `skills/quest/packs/app-development.yaml`
- **Line:** 535-617
- **Problem:** Items 5.3 ("Auditoria de seguranca") and 6.6 are identical. Items 5.4 ("Refactoring") and 6.7 are identical. Same command, same who, same condition. This gives the user XP for doing the exact same thing twice with no differentiation.
- **Suggestion:** Remove 6.6 and 6.7 as duplicates, OR differentiate them (e.g., 5.3 = "pre-review security scan", 6.6 = "final security certification").

#### Issue 1.9 — `sub_quests` key not in pack schema

- **File:** `skills/quest/packs/squad-upgrade.yaml`
- **Line:** 303-307
- **Code:**
  ```yaml
  sub_quests:  # P1
    - pack: mind-cloning
      trigger: "agent precisa de mind clone"
      optional: true
  ```
- **Problem:** The `sub_quests` key is not documented in `scanner.md` section 3.2 pack schema validation. It's silently ignored.
- **Suggestion:** Add `sub_quests` to the schema (optional, array) or add a comment `# P1 — not yet implemented, ignored by engine`.

#### Issue 1.10 — pt-BR quality violations in checklist.md

- **File:** `skills/quest/engine/checklist.md`
- **Line:** 185-211
- **Code:**
  ```markdown
  "Item '{id}' nao existe neste pack."
  "Item '{id}' ja esta completo."
  "Item '{id}' ja foi pulado."
  ```
- **Problem:** Missing accents violate the pt-BR quality rule (Constitution Article VII). These are user-facing messages.
- **Suggestion:**
  ```markdown
  "Item '{id}' não existe neste pack."
  "Item '{id}' já está completo."
  "Item '{id}' já foi pulado."
  ```

### LOW

> Nitpicks and nice-to-haves.

#### Issue 1.11 — `argument-hint` lists `start` but no routing exists

- **File:** `skills/quest/SKILL.md`
- **Line:** 5
- **Code:**
  ```yaml
  argument-hint: "[start] | check <id> | skip <id> | scan | status"
  ```
- **Problem:** The `[start]` argument is listed but the Command Routing table only handles `check`, `skip`, `scan`, and `status`.
- **Suggestion:** Remove `[start]` from the hint or add a routing entry.

#### Issue 1.12 — `requires` field in design-system-forge not in schema

- **File:** `skills/quest/packs/design-system-forge.yaml`
- **Line:** 16
- **Code:**
  ```yaml
  requires: aios
  ```
- **Problem:** The `requires` field is never referenced by the engine. Dead metadata.
- **Suggestion:** Remove or document in scanner.md.

---

## Regressions

> First round — no previous fixes to regress from.

- None

---

## What Is Good

> Explicitly list things that are well-implemented. The fixer must NOT change these.

- **Modular architecture:** The engine is cleanly split into 5 modules (guide.md, xp-system.md, ceremony.md, checklist.md, scanner.md) with clear responsibilities and a thin orchestrator (SKILL.md). Each module owns its domain.
- **Integration Gate (guide.md section 2.5):** Excellent design — prevents the "built separately, never tested together" problem. The `detected` vs `done` distinction for locked phases is clever and well-thought-out.
- **XP System execution order (xp-system.md section 9):** The 10-step execution order prevents circular dependencies (base_item_xp before achievements, total_xp after). This is a common pitfall that was handled correctly.
- **Pack Version Migration (checklist.md section 3.5):** Handles pack updates gracefully — new items added as pending, orphaned items kept for history.
- **Dashboard server.js port check:** The `checkPortAndStart()` function elegantly handles the case where the dashboard is already running — exits gracefully.
- **Scanner parallel evaluation strategy (scanner.md section 4.2):** Deduplicating scanner function calls across packs and batching by tool type is a smart performance optimization.
- **Expansion Pack Gate (scanner.md section 6.5.2):** The model of single quest-log with pack transition is clean and well-documented.
- **YAML Parse Guard (checklist.md section 3):** Handles corrupted quest-log files with backup recovery — production-quality resilience.
- **Pack YAML quality:** All three packs are well-structured with consistent formatting, meaningful labels, and appropriate XP distribution.

---

## Summary

- **Total issues:** 12
- **By severity:** 0 CRITICAL, 4 HIGH, 6 MEDIUM, 2 LOW
- **Regressions from previous round:** none
- **Next action:** Fix issues and request new review
