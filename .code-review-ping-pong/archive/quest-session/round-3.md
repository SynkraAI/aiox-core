---
protocol: code-review-ping-pong
type: review
round: 3
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
score: 9
verdict: "CONTINUE"
issues:
  - id: "3.1"
    severity: "HIGH"
    title: "Mission card fallback points to phase.tagline that no pack defines"
    file: "skills/quest/engine/guide.md"
    line: 264
    suggestion: "Change the fallback to a field that exists (`phase.description` or `pack.tagline`), or add `phase.tagline` to every pack and schema."
  - id: "3.2"
    severity: "MEDIUM"
    title: "Scanner schema still does not validate required fields for phase items"
    file: "skills/quest/engine/scanner.md"
    line: 61
    suggestion: "Document and validate required item fields such as `id`, `label`, `command`, `who`, `required`, and `xp` before evaluating packs."
  - id: "3.3"
    severity: "LOW"
    title: "Guide documentation for item.who does not match values used by packs"
    file: "skills/quest/engine/guide.md"
    line: 282
    suggestion: "Update the contract to include `skill`, `squad`, and `agente`, or normalize `who` before rendering the mission card."
---

# Code Ping-Pong — Round 3 Review

## Score: 9/10 — CONTINUE

## Issues

### HIGH

#### Issue 3.1 — Mission card fallback points to `phase.tagline` that no pack defines
- **File:** `skills/quest/engine/guide.md`
- **Line:** 264
- **Code:**
  ```markdown
  DICA: {item.tip || phase.tagline}
  ```
- **Problem:** The mission card relies on `phase.tagline` whenever an item has no `tip`, but none of the quest packs define `tagline` at phase level. All three packs only define `pack.tagline`. A quick scan of the current YAMLs shows zero `tip:` entries and zero `phase.tagline` fields, so this fallback path is broken for effectively every mission card and can render `undefined` or an empty hint right in the main UX.
- **Suggestion:** Use an existing field as the fallback, such as `phase.description` or `pack.tagline`, or add `phase.tagline` to every phase and document it in the pack schema.

### MEDIUM

#### Issue 3.2 — Scanner schema still does not validate required fields for phase items
- **File:** `skills/quest/engine/scanner.md`
- **Line:** 61
- **Code:**
  ```yaml
  phases: {}           # REQUIRED (map keyed by phase index: 0, 1, 2, ...)
    # Each phase (keyed by index) supports:
    #   ...
    #   items: [] (REQUIRED — array of item objects within the phase)
  ```
- **Problem:** The schema validation stops at “items is an array” and never defines what each item must contain. That leaves the engine open to accepting a pack where an item is missing `command`, `who`, `xp`, or even `id`, even though `guide.md`, `checklist.md`, and `xp-system.md` all assume those fields exist. The current packs happen to be well-formed, but the validator contract is still underspecified at the exact boundary that protects the modular engine from bad pack data.
- **Suggestion:** Extend section 3.2 so item objects explicitly require `id`, `label`, `command`, `who`, `required`, and `xp`, with optional fields like `tip`, `condition`, and `scan_rule`.

### LOW

#### Issue 3.3 — Guide documentation for `item.who` does not match values used by packs
- **File:** `skills/quest/engine/guide.md`
- **Line:** 282
- **Code:**
  ```markdown
  | `item.who` | Pack item who — "user", "@agent-name", or "skill-name" |
  ```
- **Problem:** The guide says `item.who` is either `"user"`, `"@agent-name"`, or `"skill-name"`, but the actual packs also use raw values like `"skill"`, `"squad"`, and `"agente"`. The mission card prints `{item.who}` directly, so this is not just internal metadata drift; it is a user-facing contract that no longer matches the data being rendered.
- **Suggestion:** Update the documented allowed values to match the current packs, or introduce a normalization layer so the UI shows consistent labels instead of raw internal categories.

## Regressions
- None. The round-2 findings were addressed in the current tree: `@ux-design-expert` is now used consistently, `sub_quests` is documented in the schema, the pt-BR copy fixes are in place, and the differentiated world-6 audit/refactor missions remain intact.

## What Is Good
- The quest contract suite is still passing end to end. `tests/quest/quest-contracts.test.js` remains a useful regression net and passed cleanly on the current tree.
- The scanner, checklist, and XP modules are much more coherent than in round 1. The earlier fixes for glob-aware scanning, pack switching, migration flow, and XP ordering held up.
- The `design-system-forge` and `app-development` packs are in better shape after the last fixes. The previous shortcut mismatch and duplicated missions are no longer present.

## Summary
- Total: 3, CRITICAL: 0, HIGH: 1, MEDIUM: 1, LOW: 1
- Regressions: none
