# Story INS-4.6: Entity Registry Bootstrap on Install (Nao Incremental)

**Epic:** Installation Health & Environment Sync (INS-4)
**Wave:** 3 — Runtime Health & Upgrade Safety (P2)
**Points:** 2
**Agents:** @dev
**Status:** Ready for Review
**Blocked By:** —
**Created:** 2026-02-23

**Executor Assignment:**
- **executor:** @dev
- **quality_gate:** @qa
- **quality_gate_tools:** [aios doctor entity-registry check, entity count validation, npm test]

---

## Story

**As a** new user who just installed AIOS,
**I want** the entity registry to be bootstrapped automatically during installation,
**so that** `aios doctor` shows a populated registry immediately without requiring a manual git push to trigger the pre-push hook.

### Context

`.aios-core/development/scripts/populate-entity-registry.js` (~650 lines) generates `entity-registry.yaml` by scanning the codebase. It is NOT called by the installer. The `.husky/pre-push` hook already calls `ids-pre-push.js` for **incremental** registry updates on every push.

**The Gap:** On fresh install, `entity-registry.yaml` may be empty, stale, or absent. The pre-push hook handles incremental updates after the first push, but there is no bootstrap on install.

**Scope (Codex Finding A1):** This story is ONLY about bootstrapping on install. The pre-push incremental sync already works. Do NOT re-implement incremental logic. Do NOT hardcode entity count thresholds that assume a specific project size.

**Codex Warning:** The script takes an unknown amount of time. If it exceeds 30 seconds, it degrades UX. This story must measure runtime and decide on async vs sync execution.

---

## Acceptance Criteria

### AC1: Bootstrap Called During Install
- [ ] Installer calls `populate-entity-registry.js` after `.aios-core/` copy is complete
- [ ] Registry population happens before post-install validation so `aios doctor` can check it
- [ ] If script takes > 15 seconds, installer runs it in background (non-blocking) and notifies user
- [ ] If script fails, installer logs warning and continues (NOT abort)

### AC2: Sanity Check (Relative, Not Fixed Threshold)
- [ ] After bootstrap, `aios doctor entity-registry` check validates: registry file exists AND has at least 1 entity
- [ ] Do NOT use fixed threshold (e.g., >= 500) — use relative check (file exists + non-empty)
- [ ] Registry `updatedAt` timestamp is recent (within last 5 minutes) after install

### AC3: No Duplication with Pre-Push Hook
- [ ] Bootstrap script (install-time) and incremental script (pre-push) are distinct code paths
- [ ] Bootstrap calls `populate-entity-registry.js` once for full scan
- [ ] Pre-push hook behavior unchanged — still calls `ids-pre-push.js` for incremental update
- [ ] No new hooks installed that duplicate the existing `.husky/pre-push` behavior

### AC4: Performance Guard
- [ ] Measure actual runtime of `populate-entity-registry.js` on aios-core codebase
- [ ] If runtime > 15s: run async (non-blocking) with completion notification
- [ ] If runtime <= 15s: run synchronously in install flow
- [ ] Document measured runtime in Dev Notes

### AC5: Regression Test Coverage
- [ ] Unit test: verify `populate-entity-registry.js` called during install flow
- [ ] Unit test: script failure → warning logged → install continues
- [ ] Unit test: registry file exists after bootstrap → `aios doctor` entity-registry check passes
- [ ] `npm test` passes with zero new failures

---

## Tasks / Subtasks

### Task 1: Measure Script Performance (AC4)
- [x] 1.1 Run `time node .aios-core/development/scripts/populate-entity-registry.js` on this codebase
- [x] 1.2 Record actual runtime — document in Dev Notes
- [x] 1.3 Determine execution mode: sync (< 15s) or async (>= 15s)
- [x] 1.4 Verify script is idempotent: run twice, check `entity-registry.yaml` is same content

### Task 2: Understand Existing Hooks (AC3)
- [x] 2.1 Read `.husky/pre-push` — confirm it calls `ids-pre-push.js` for incremental updates
- [x] 2.2 Read `.aios-core/hooks/ids-pre-push.js` — understand incremental vs full scan
- [x] 2.3 Confirm: installer should NOT re-install the pre-push hook (already present)
- [x] 2.4 Confirm: bootstrap uses `populate-entity-registry.js` (full scan), pre-push uses `ids-pre-push.js` (incremental)

### Task 3: Implement Bootstrap Call (AC1)
- [x] 3.1 Find correct injection point in `packages/installer/src/wizard/index.js` — after `.aios-core/` copy
- [x] 3.2 Add bootstrap call: `node populate-entity-registry.js targetRoot` (or programmatic require)
- [x] 3.3 Implement async guard: if estimated runtime > 15s (based on Task 1 measurement), use `child_process.fork()` with non-blocking callback
- [x] 3.4 Wrap in try/catch: log warning on error, continue install

### Task 4: Update Post-Install Validation (AC2)
- [x] 4.1 Verify `aios doctor` `entity-registry` check (from INS-4.1) uses relative threshold (file exists + non-empty)
- [x] 4.2 If INS-4.1 not yet merged, document that this check will be enabled when INS-4.1 is ready

### Task 5: Install Summary Update (AC1)
- [x] 5.1 Add entity registry status to install summary: `entity-registry: populated (N entities)` or `entity-registry: populating in background...` or `entity-registry: failed (see warning)`

### Task 6: Tests (AC5)
- [x] 6.1 Unit test: `populate-entity-registry.js` invoked during install flow
- [x] 6.2 Unit test: script failure → warning → install continues
- [x] 6.3 Unit test: async mode (if applicable) — verify non-blocking execution
- [x] 6.4 `npm test` regression check

---

## Dev Notes

### Key Files (Read These First)

| File | Lines | Purpose |
|------|-------|---------|
| `.aios-core/development/scripts/populate-entity-registry.js` | ~650 | Bootstrap script to call — READ to understand args, output, and idempotency |
| `.husky/pre-push` | 5 | Existing incremental hook — do NOT modify, just understand |
| `.aios-core/hooks/ids-pre-push.js` | — | Incremental registry updater (pre-push) — different from full bootstrap |
| `.aios-core/core/ids/registry-updater.js` | ~139 | Incremental `processChanges` — ALREADY WORKS via pre-push |
| `packages/installer/src/wizard/index.js` | full (861) | Injection point |

### Scope Clarification (Codex Finding A1)

Codex confirmed:
- `.husky/pre-push:5` already calls `ids-pre-push.js` for incremental sync
- `RegistryUpdater.processChanges` (line 139) processes incremental changes
- This is NOT a gap — it already works post-first-push

**This story's scope:** Bootstrap ONLY. One-time full scan on install. The incremental path is untouched.

### Fixed Threshold Warning (Codex Finding)

Do NOT use `>= 500 entities` as threshold. The handoff mentioned this but Codex correctly notes it is invalid for all project types. A new project may have < 100 entities legitimately. Use:
- `entity-registry.yaml` exists: YES/NO
- Entity count > 0: YES/NO
- `updatedAt` within last 5 minutes: YES/NO

### Performance Decision Matrix

| Measured Runtime | Strategy | User Experience |
|-----------------|----------|-----------------|
| <= 5s | Synchronous in install flow | "entity-registry: populated (N entities)" |
| 5-15s | Synchronous with progress indicator | "Scanning codebase for entities... done (N entities)" |
| > 15s | Async (background) | "entity-registry: populating in background — check status with `aios doctor`" |

Measure in Task 1 before deciding.

### Testing

**Test Location:** `packages/installer/tests/unit/`

**Key Scenarios:**
1. Bootstrap script called once during install
2. Script failure: warning + install continues
3. Registry file exists and non-empty after bootstrap
4. Pre-push hook behavior unchanged (integration test: push after install still triggers incremental)

---

## CodeRabbit Integration

**Story Type:** Integration (bootstrap wiring)
**Complexity:** Low (2 pts — single script call + error handling + async guard)

**Quality Gates:**
- [ ] Pre-Commit (@dev): Run before marking story complete
- [ ] Pre-PR (@qa): Entity count validation, install flow regression

**Self-Healing Configuration:**
- **Mode:** light
- **Max Iterations:** 2
- **Timeout:** 15 minutes
- **Severity Filter:** CRITICAL only

**Predicted Behavior:**
- CRITICAL issues: auto_fix (up to 2 iterations)
- HIGH issues: document_only

**Focus Areas (Primary):**
- No duplication of pre-push incremental hook
- Async mode safety: non-blocking, no dangling processes

**Focus Areas (Secondary):**
- Relative threshold (not fixed >= 500)
- Performance measurement documented

---

## Dev Agent Record

### Agent Model Used
Claude Opus 4.6

### Debug Log References
- Initial regex used `totalEntities` but YAML field is `entityCount` — fixed in both wizard and test
- Measured runtime: 0.67s (first run), 0.31s (cached/subsequent) — well under 15s, sync mode chosen
- Idempotency verified: two consecutive runs produce identical output (only timestamps differ)

### Completion Notes
- Bootstrap call injected in wizard after IDE sync, before environment config (line ~571)
- Uses `execSync` with 30s timeout for process isolation (avoids `__dirname` path issues with `require()`)
- Three status outcomes: `populated` (success), `skipped` (script not found), `failed` (error with warning)
- Entity count extracted from `entityCount` field in `entity-registry.yaml` metadata
- No async mode needed — runtime is 0.31-0.67s on aios-core (734 entities)
- `aios doctor` entity-registry check already uses relative validation (INS-4.1, commit 337213dc)
- Pre-push hook (`ids-pre-push.js`) untouched — distinct incremental code path
- 19 unit tests covering all 5 ACs, 0 new test failures

### File List
| File | Action | Purpose |
|------|--------|---------|
| `packages/installer/src/wizard/index.js` | Modified | Added entity registry bootstrap call after .aios-core/ copy |
| `packages/installer/tests/unit/entity-registry-bootstrap.test.js` | Created | 19 tests covering AC1-AC5 |
| `docs/stories/epics/epic-installation-health/story-INS-4.6-entity-registry-on-install.md` | Modified | Task checkboxes, Dev Agent Record, status |

---

## QA Results

**Reviewer:** @qa (Quinn) | **Date:** 2026-02-23 | **Model:** Claude Opus 4.6

### Gate Decision: PASS

**Score:** 17/17 AC items verified — all traceable to implementation and tests.

### Evidence

| Check | Result |
|-------|--------|
| Tests executed | 19/19 PASS (entity-registry-bootstrap.test.js) |
| Regression | 0 new failures (26 pre-existing, unrelated) |
| AC1 (bootstrap call) | Verified: wizard/index.js:572-607, execSync + try/catch + 30s timeout |
| AC2 (relative threshold) | Verified: doctor check uses lineCount + mtime, no fixed >= 500 |
| AC3 (no duplication) | Verified: wizard calls populate-entity-registry.js, pre-push calls ids-pre-push.js, cross-negative tests confirm |
| AC4 (performance) | Verified: 0.86s measured runtime, sync mode correct |
| AC5 (test coverage) | Verified: 19 tests across 5 AC groups, doctor integration test passes |
| Scope | No incremental logic added, no hooks modified, no threshold hardcoded |

### Concerns (LOW, non-blocking)

1. `require('child_process')` inside try block (L578) — cosmetic, could be at module top
2. AC5.3 mtime test depends on AC4 timing test running first (generates fresh file) — add comment noting ordering dependency to prevent CI flakiness

---

## Change Log

| Date | Author | Change |
|------|--------|--------|
| 2026-02-23 | @sm (River) | Story drafted from Epic INS-4 handoff secao 3.6 + Codex Finding A1 (pre-push JA faz incremental, reescopar para bootstrap only, remover threshold fixo, sizing 3→2 pts) |
| 2026-02-23 | @po (Pax) | [Validation] Score: 10/10, GO. Todos os paths verificados contra codebase real: `populate-entity-registry.js` confirmado (673 linhas, `module.exports` L646 com `populate` exportado), `.husky/pre-push` chama `ids-pre-push.js`, `registry-updater.js` existe. CONCERN-1 (LOW): `populate()` signature nao documentada — @dev resolve na T3.2. CONCERN-2 (INFO): AC2 depende INS-4.1 — ja Done (commit 337213dc). Status: Draft → Approved. |
| 2026-02-23 | @dev (Dex) | [Implementation] All 6 tasks complete. Bootstrap call added to wizard (sync mode, 0.67s measured). 19 unit tests created (all pass). No new test failures. Entity count regex fixed: `entityCount` (not `totalEntities`). Status: Approved → Ready for Review. |
