# Stress Test Report — code-review-ping-pong (Scope System)

- **Date:** 2026-04-08
- **Fixture:** `/tmp/stress-test-ping-pong-1775664781/`
- **Script:** `~/aios-core/skills/code-review-ping-pong/scripts/orchestrate.cjs`
- **Scenarios:** S-001 through S-020 (20 total)

---

## Results

### Tier 1 — Happy Path

| ID | Scenario | Verdict | Notes |
|----|----------|---------|-------|
| S-001 | Scope creation | PASS | (ran previously) |
| S-002 | Dry-run with scope | PASS | (ran previously) |
| S-003 | Backward compat — no scope | WARN | Works and runs dry-run, but exits code 2 due to scope warning. Rounds go to root dir as expected. |
| S-004 | --no-critica flag | PASS | Dry-run completes. No critica prompt in PERFECT block. |
| S-005 | Scope warning when scopes exist | PASS | Warning: "Scopes ativos: forge. Use --scope <name>" |

### Tier 2 — Variations

| ID | Scenario | Verdict | Notes |
|----|----------|---------|-------|
| S-006 | Multiple scopes coexist | PASS | Quest scope alongside forge. Banner shows "Scope: quest". |
| S-007 | --scope + --session combo | PASS | Banner shows session-engine.md + Scope: forge. |
| S-008 | parseArgs handles new flags | PASS | scope=forge, noCritica=true. Empty = undefined. |
| S-009 | getScopedDir with null scope | PASS | null/undefined/empty all return ppDir. |
| S-010 | getScopedDir creates nested dirs | PASS | Created scopes/deep-test/, exists=true. |

### Tier 3 — Edge Cases

| ID | Scenario | Verdict | Notes |
|----|----------|---------|-------|
| S-011 | Scope with special characters | WARN | Creates dir with spaces. No crash, but downstream shell issues likely. |
| S-012 | validate.cjs from scoped workDir | PASS | Returns false for missing file. No crash. |
| S-013 | archiveRounds in rootPpDir | PASS | Archive at archive/forge-2026-04-08/. Centralized. |
| S-014 | checkCriticaVerdict missing file | PASS | {"verdict":"MISSING","issues":0}. No crash. |
| S-015 | checkCriticaVerdict APPROVED | PASS | {"verdict":"APPROVED","issues":0}. Correct. |
| S-016 | checkCriticaVerdict NEEDS_WORK | PASS | {"verdict":"NEEDS_WORK","issues":3}. Correct. |

### Tier 4 — Stress

| ID | Scenario | Verdict | Notes |
|----|----------|---------|-------|
| S-017 | --pipeline ignores scopes | PASS | Only alpha/beta (root). Gamma excluded. Known limitation. |
| S-018 | buildCriticaPrompt valid prompt | PASS | 1531 chars. Contains Pontos Cegos, Red Team, critica.md, round files. |
| S-019 | getLatestRound per scope | PASS | quest=3, forge=1, root=0. Independent. |

### Tier 5 — Chaos

| ID | Scenario | Verdict | Notes |
|----|----------|---------|-------|
| S-020 | Empty scope name | PASS | Returns ppDir. No crash. |

---

## Summary

| Verdict | Count |
|---------|-------|
| PASS | 18 |
| WARN | 2 |
| FAIL | 0 |
| CRITICAL | 0 |

**Overall: ROBUST**

---

## Issues Found

### WARN-1: Exit code 2 on backward compat with scopes present (S-003)
When scopes exist but --scope not passed, exits code 2. Dry-run still runs but non-zero exit may break CI.
**Recommendation:** Exit 0 with warning to stderr, or only exit 2 when no root session.md exists.

### WARN-2: No input sanitization on scope names (S-011)
Spaces and special chars accepted. Downstream shell commands may break.
**Recommendation:** Regex check `/^[a-z0-9][a-z0-9-]*$/` to reject invalid names early.
