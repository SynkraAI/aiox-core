# Unified Handoff System -- Design Document

**Story:** AIOX-HO-1
**Version:** 1.0
**Author:** @dev (Dex)
**Date:** 2026-03-25

## Problem

The original AIOX handoff system had 6 critical gaps: unreliable context bracket triggers, agent handoff artifacts that were never actually persisted, unbounded session handoff files (430+ lines), siloed agent/session handoff systems, soft enforcement dependent on LLM compliance, and no recovery validation.

## Solution: 3-Tier Architecture

### Tier 1: Micro-Handoff (Agent Switch)

- **File:** `.aiox/current-session/micro-handoff.json`
- **Trigger:** UserPromptSubmit hook detects `@agent` in prompt
- **Content:** From/to agent, story context, decisions (max 5), files (max 10), blockers (max 3)
- **Rotation:** Max 3 unconsumed handoffs; oldest auto-discarded
- **Module:** `.claude/lib/handoff/micro-handoff.js`

### Tier 2: Session State (In-Session Timeline)

- **File:** `.aiox/current-session/state.yaml`
- **Trigger:** Every 5 prompts (periodic) + milestone events
- **Events:** agent_switch, story_start, story_complete, qa_gate, commit, periodic
- **Pattern:** Append-only YAML (no rewrite, preserves timeline)
- **Module:** `.claude/lib/handoff/session-state.js`

### Tier 3: Cross-Session Handoff

- **File:** `docs/session-handoff-{project}.md`
- **Trigger:** PreCompact hook (before `/compact`)
- **Size limit:** ~200 lines (auto-trimmed)
- **Archive:** `.aiox/session-history/{project}/archive-{timestamp}.md`
- **Recovery:** Validates handoff vs `git status --short`, warns if >20% drift
- **Module:** `.claude/lib/handoff/cross-session-handoff.js`

## Hook Integration

### UserPromptSubmit: `handoff-auto.cjs`

Second entry in the UserPromptSubmit hooks array (does NOT modify synapse-wrapper.cjs).

1. Reads stdin JSON from Claude Code hook protocol
2. Extracts user prompt text
3. Detects `@agent` pattern -> saves Tier 1 + Tier 2 agent_switch event
4. Increments prompt counter -> every 5th prompt triggers Tier 2 periodic snapshot
5. All errors caught silently (never blocks SYNAPSE)

### PreCompact: `handoff-saver.cjs` (chained by `precompact-wrapper.cjs`)

1. Wrapper calls handoff-saver BEFORE session-digest
2. handoff-saver discovers all `docs/session-handoff-*.md` files
3. Trims any that exceed ~200 lines, archiving excess
4. 5000ms timeout, silent failure (never blocks PreCompact)

## File Map

```
.claude/rules/unified-handoff.md          # Unified rule (replaces 2 deprecated rules)
.claude/hooks/handoff-auto.cjs            # UserPromptSubmit hook (Tier 1+2 triggers)
.claude/hooks/handoff-saver.cjs           # PreCompact hook component (Tier 3 trigger)
.claude/hooks/precompact-wrapper.cjs      # Modified to chain handoff-saver
.claude/settings.json                     # Updated with handoff-auto hook entry

.claude/lib/handoff/micro-handoff.js       # Tier 1 module
.claude/lib/handoff/session-state.js      # Tier 2 module
.claude/lib/handoff/cross-session-handoff.js # Tier 3 module
.claude/lib/handoff/migrate-handoffs.js   # Migration script

.aiox/current-session/                    # Runtime (gitignored)
  micro-handoff.json                      # Tier 1 artifact
  state.yaml                             # Tier 2 artifact
  .prompt-count                          # Prompt counter
  README.md                              # Documentation

.aiox/session-history/{project}/          # Archives (gitignored)
  archive-{timestamp}.md                 # Archived handoff content

tests/handoff/
  micro-handoff.test.js                  # 18 tests
  session-state.test.js                  # 17 tests
  cross-session-handoff.test.js          # 24 tests
  integration.test.js                    # 12 tests
```

## Test Summary

- **micro-handoff.test.js**: 18 tests (save, read, consume, rotate, schema validation)
- **session-state.test.js**: 17 tests (init, update, events, reset, roundtrip, event types)
- **cross-session-handoff.test.js**: 24 tests (save, trim, archive, validate, drift, parse, extract)
- **integration.test.js**: 12 tests (agent flow, milestones, trimming, recovery, hooks, manual)
- **Total: 71 tests, all passing**

## Constraints

- Node.js stdlib only (fs, path, os, child_process)
- CommonJS (require/module.exports)
- ES2022 features allowed
- Zero changes to `.aiox-core/` (L1/L2 protected)
- Handoff save errors never block other hooks
- 5000ms timeout on all handoff save operations

## Deprecated Rules

- `.claude/rules/agent-handoff.md` -- Superseded by Tier 1 (micro-handoff)
- `.claude/rules/auto-session-handoff.md` -- Superseded by Tier 3 (cross-session)

Both files have deprecation banners pointing to `.claude/rules/unified-handoff.md`.
