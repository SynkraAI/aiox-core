# Story 1.1a: Pre-flight validation scripts

**Status:** ✅ SHIPPED 2026-05-11
**Story ID:** 1.1a
**Sprint:** HYDRA Resilience
**Owner:** @dev (implemented by @dev in parallel with PRD validation per user directive)
**Estimated LOC:** 7 files × < 50 LOC each ≈ ~350 LOC + tests
**Dependencies:** none (foundational gating script for all migrations)
**Date:** 2026-05-12
**Sourced from PRD §5 Story 1.1a (lines 492-511)**

---

## User Story

**As a** HYDRA operator,
**I want** a formalized pre-flight validation suite that runs before any migration,
**so that** I never run a destructive operation with missing backups, an unhealthy DB, or an active lock.

## Acceptance Criteria

1. `scripts/preflight/` directory contains 7 files: 6 numbered individual checks (`00-disk-space.mjs`, `01-validate-heap.mjs`, `02-backup-verify.mjs`, `03-sqlite-health.mjs`, `04-no-active-lock.mjs`, `05-env-validate.mjs`) plus orchestrator `all.mjs` — 6 checks + 1 orchestrator = 7 files total
2. Each script < 50 LOC, no new dependencies, exits 0 on success / ≠ 0 with actionable error message
3. `preflight/all.mjs` runs all 6 checks sequentially, halts on first failure with the failing check's exit code
4. Unit tests added for each pre-flight script under `tests/preflight/`
5. `hydra migrate vector-store` and `hydra migrate semantic-dedup` MUST invoke `preflight/all.mjs` first and refuse to run on any non-zero exit (wiring deferred to Stories 1.2/1.3 — Story 1.1a only delivers the scripts + tests)

## Integration Verification

- **IV1:** Pre-flight scripts do not modify any state — pure read-only verification (no writes to `hydra-data/`, no file creation outside `tests/preflight/` test output)
- **IV2:** Running `node scripts/preflight/all.mjs` on a healthy install exits 0 in < 5s
- **IV3:** Each failure mode (no disk space, no backup, lock held, missing env var, corrupted DB) is reproducible via test fixture and produces the documented exit code

## Architecture References

- Architecture §3.1 Phase 0 (Preflight Infrastructure) — `03-architecture/sharded/01-migration-strategy.md`
- Architecture §8.1 — preflight test file locations
- ADR-001: Streaming pattern (preflight is the gating control before migration)
- PRD §3.4 Pre-flight Test Scripts table (lines 387-406)

## Dev Notes

Per PRD §3.4: each pre-flight script is `< 50 LOC, no external deps, fails loud with actionable error message`. This is non-negotiable — added per user directive 2026-05-11 to prevent the "user forgets backup" risk class (R11).

**Pre-flight Test Scripts Table (PRD §3.4):**

| Script | Purpose | Exit code 0 means |
|--------|---------|-------------------|
| `preflight/00-disk-space.mjs` | Check ≥500MB free in `hydra-data/` | Disk OK |
| `preflight/01-validate-heap.mjs` | Wraps existing `validate-heap.mjs` — confirms current JSON sizes match expected (~37MB total) | Files exist + parseable |
| `preflight/02-backup-verify.mjs` | Verifies `*.backup.json` exists for both vector-index and fingerprints, byte-equals source | Backups present + valid |
| `preflight/03-sqlite-health.mjs` | Runs `PRAGMA integrity_check` on `hydra.db` | DB consistent |
| `preflight/04-no-active-lock.mjs` | Confirms no scheduler/pipeline holding `hydra-data/state/scheduler.lock` | Safe to migrate |
| `preflight/05-env-validate.mjs` | All required env vars present (`DEEPSEEK_API_KEY`, `TELEGRAM_*`) | Env complete |
| `preflight/all.mjs` | Runs all above sequentially, halts on first failure | Ready to migrate |

**Wired into commands (deferred to Stories 1.2/1.3):**
- `hydra migrate vector-store` MUST invoke `preflight/all.mjs` first. Refuses to run on any exit ≠ 0.
- `hydra migrate semantic-dedup` same gate.
- Post-migration: `scripts/postflight/01-row-count-match.mjs` confirms SQLite row count == JSON entry count before declaring success.

## Implementation Report

**Shipped:** 2026-05-11 by @dev (parallel with PRD validation per user directive).

**Commit:** baseline (see git log for `feat(hydra): preflight validation suite`)

**File List (actual files created):**
- `D:/AIOS/tools/hydra/scripts/preflight/00-disk-space.mjs`
- `D:/AIOS/tools/hydra/scripts/preflight/01-validate-heap.mjs`
- `D:/AIOS/tools/hydra/scripts/preflight/02-backup-verify.mjs`
- `D:/AIOS/tools/hydra/scripts/preflight/03-sqlite-health.mjs`
- `D:/AIOS/tools/hydra/scripts/preflight/04-no-active-lock.mjs`
- `D:/AIOS/tools/hydra/scripts/preflight/05-env-validate.mjs`
- `D:/AIOS/tools/hydra/scripts/preflight/all.mjs`
- `D:/AIOS/tools/hydra/tests/preflight/*.test.js` (one test per script)

**Note for @sm:** Story is closed — already shipped. Wiring of `preflight/all.mjs` into `hydra migrate vector-store` / `hydra migrate semantic-dedup` belongs to Stories 1.2 and 1.3 respectively (their AC #3 calls out the integration).
