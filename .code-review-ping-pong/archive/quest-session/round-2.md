---
protocol: code-review-ping-pong
type: review
round: 2
date: "2026-03-28"
reviewer: "Codex"
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
score: 8
verdict: "CONTINUE"
issues:
  - id: "2.1"
    severity: "HIGH"
    title: "Pack missions route to unsupported @ux shortcut"
    file: "skills/quest/packs/design-system-forge.yaml"
    line: 245
    suggestion: "Replace @ux with @ux-design-expert across quest packs or add an explicit @ux shortcut alias."
  - id: "2.2"
    severity: "MEDIUM"
    title: "App-development pack grants XP twice for the same audit and refactor missions"
    file: "skills/quest/packs/app-development.yaml"
    line: 531
    suggestion: "Merge or differentiate items 5.3/6.6 and 5.4/6.7 so each mission represents distinct work."
  - id: "2.3"
    severity: "MEDIUM"
    title: "sub_quests remains outside the documented pack schema"
    file: "skills/quest/packs/squad-upgrade.yaml"
    line: 304
    suggestion: "Document sub_quests in scanner.md schema validation or remove it until the engine supports it."
  - id: "2.4"
    severity: "LOW"
    title: "Expansion-pack requires metadata is still undocumented"
    file: "skills/quest/packs/design-system-forge.yaml"
    line: 15
    suggestion: "Document the requires field in scanner.md or remove the unused metadata to avoid drift."
  - id: "2.5"
    severity: "LOW"
    title: "User-facing pt-BR copy still has missing accents"
    file: "skills/quest/engine/checklist.md"
    line: 299
    suggestion: "Fix remaining strings like \"Nao se aplica\" and \"SE NAO SE APLICA\" to fully accented pt-BR."
---

# Code Ping-Pong — Round 2 Review

## Score: 8/10 — CONTINUE

## Issues

### HIGH

#### Issue 2.1 — Pack missions route to unsupported `@ux` shortcut
- **File:** `skills/quest/packs/design-system-forge.yaml`
- **Line:** 245
- **Code:**
  ```yaml
  command: "@ux → Playwright captura full-page desktop (1440px) + mobile (390px)"
  who: "@ux"
  ```
- **Problem:** The quest packs instruct the user to invoke `@ux` in multiple missions (`design-system-forge.yaml` and `app-development.yaml`), but the repository shortcut contract only documents `@ux-design-expert` in `AGENTS.md`. There is no matching `.aiox-core/development/agents/ux.md`, only `ux-design-expert.md`. A player following the mission literally can hit an unrecognized shortcut and get blocked mid-quest.
- **Suggestion:** Standardize the pack commands to `@ux-design-expert` everywhere, or add an explicit `@ux` alias to the agent shortcut contract and backing file.

### MEDIUM

#### Issue 2.2 — App-development pack grants XP twice for the same audit and refactor missions
- **File:** `skills/quest/packs/app-development.yaml`
- **Line:** 531
- **Code:**
  ```yaml
  - id: "5.3"
    label: "Auditoria de segurança"
    command: "/vulnerability-scanner"

  - id: "6.6"
    label: "Auditoria de segurança"
    command: "/vulnerability-scanner"
  ```
- **Problem:** The pack still duplicates the same security audit mission in worlds 5 and 6, and does the same for refactoring (`5.4` and `6.7`). Because the labels, commands, XP, and conditions are the same, the player can collect XP twice for a single piece of work with no new requirement introduced. That weakens progression integrity and makes world completion less meaningful.
- **Suggestion:** Remove the duplicates, or rewrite the later missions so they validate a different artifact or milestone than the earlier ones.

#### Issue 2.3 — `sub_quests` remains outside the documented pack schema
- **File:** `skills/quest/packs/squad-upgrade.yaml`
- **Line:** 304
- **Code:**
  ```yaml
  sub_quests:  # P1
    - pack: mind-cloning
      trigger: "agent precisa de mind clone"
  ```
- **Problem:** `scanner.md` now documents the required pack schema, but `sub_quests` is still absent from that contract. That leaves the field in a gray zone: pack authors see it in a real pack, while the engine contract never says whether it is legal, ignored, or expected to drive behavior later.
- **Suggestion:** Add `sub_quests` as an explicit optional top-level field with current semantics, or delete it until the quest engine actually consumes it.

### LOW

#### Issue 2.4 — Expansion-pack `requires` metadata is still undocumented
- **File:** `skills/quest/packs/design-system-forge.yaml`
- **Line:** 15
- **Code:**
  ```yaml
  requires: aios
  ```
- **Problem:** The expansion pack keeps a `requires` field, but the pack schema in `scanner.md` never mentions it and no engine module refers to it. That makes it look normative even though it currently behaves like dead metadata.
- **Suggestion:** Either document `requires` as optional metadata in the schema, or remove it to keep pack files aligned with the actual contract.

#### Issue 2.5 — User-facing pt-BR copy still has missing accents
- **File:** `skills/quest/engine/checklist.md`
- **Line:** 299
- **Code:**
  ```markdown
  - `n` (no): mark as `skipped` with `note: "Nao se aplica: {condition}"`.
  ```
- **Problem:** There are still user-facing strings without full pt-BR accentuation. `checklist.md` persists `"Nao se aplica"` in the note field, and `guide.md` still renders `"SE NAO SE APLICA"` in the mission card. That violates the repository constitution's pt-BR rule and creates visible copy drift in the quest UX.
- **Suggestion:** Normalize the remaining strings to `"Não se aplica"` and `"SE NÃO SE APLICA"` so all rendered text stays compliant.

## Regressions
- None. Round-1 fixes that were visible in the current tree held up: scanner function coverage, glob handling, checklist numbering, `var` removal in `server.js`, and the contract test suite all look consistent.

## What Is Good
- The contract hardening from the previous round is real, not cosmetic. `scanner.md`, `checklist.md`, `guide.md`, and `xp-system.md` are aligned on pack switching, migration, prerequisites, and XP calculation order.
- `tests/quest/quest-contracts.test.js` is valuable and passing. It gives the quest engine a concrete regression net instead of relying on manual inspection.
- `guide.md` now correctly marks `endpoint` integration checks as P1 with a fallback warning, which resolves the ambiguity from the first review.
- `server.js` is cleaner and consistent with the rest of the file after replacing the stray `var`.

## Summary
- Total: 5, CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 2
- Regressions: none
