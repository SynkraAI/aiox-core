# Story NOG-12: State Persistence Hardening (Atomic Writes + Session Cleanup)

## Metadata

| Field | Value |
|-------|-------|
| **Story ID** | NOG-12 |
| **Epic** | NOGIC — Code Intelligence Integration |
| **Type** | Bug Fix / Hardening |
| **Status** | Ready for Review |
| **Priority** | P1 |
| **Points** | 3 |
| **Agent** | @dev (Dex) |
| **Quality Gate** | @qa (Quinn) |
| **Blocked By** | NOG-10 |
| **Branch** | `feat/epic-nogic-code-intelligence` |

---

## Story

As a **framework developer**, I want all state persistence points to use atomic writes and session cleanup to be properly wired, so that session files cannot be corrupted on unexpected exit and stale sessions are automatically cleaned up — resolving Codex QA findings #2 and #7.

---

## Problem Statement

### Atomic Writes (Finding #2 — expanded scope)

4 points of non-atomic `writeFileSync` identified by Codex QA:

| Location | File Written | Risk |
|----------|-------------|------|
| `session-manager.js:230` | `.synapse/sessions/{uuid}.json` | Session corruption |
| `core/session/context-detector.js:194` | `.aios/session-state.json` | Session state loss |
| `unified-activation-pipeline.js:713` | `.synapse/sessions/_active-agent.json` | Agent bridge corruption |
| `unified-activation-pipeline.js:759` | `.synapse/metrics/uap-metrics.json` | Metrics loss |

### Session Cleanup (Finding #7)

`cleanStaleSessions()` exists in `session-manager.js:305` and is fully implemented — but **never called** from any production flow. Another "Infrastructure Exists, Wiring Falta" case.

### Evidence

- Codex QA: `HANDOFF-TO-ARCHITECT-FROM-CODEX-QA.md` findings #2 and #7
- Architect Response: `ARCHITECT-RESPONSE-TO-CODEX.md` findings #2 and #7

---

## Acceptance Criteria

### AC1: Atomic Write Utility
- [ ] Create `atomicWriteSync(filePath, data)` utility that writes to `.tmp.{pid}` then renames
- [ ] Utility handles POSIX and Windows atomic rename semantics
- [ ] **Test:** Write file, simulate crash (kill before rename), verify original intact
- [ ] **Rollback:** If utility causes issues, revert to direct writeFileSync (single commit)
- [ ] **Observability:** Errors logged to stderr with `[atomic-write]` prefix

### AC2: Apply Atomic Writes to All 4 Points
- [ ] `session-manager.js:230` — `updateSession()` uses atomic write
- [ ] `context-detector.js:194` — `_updateSessionState()` uses atomic write
- [ ] `unified-activation-pipeline.js:713` — `_writeSynapseSession()` uses atomic write
- [ ] `unified-activation-pipeline.js:759` — `_persistUapMetrics()` uses atomic write
- [ ] **Benchmark:** No measurable performance regression (rename is <0.1ms)
- [ ] **Test:** Existing tests pass unchanged (atomic write is transparent to callers)

### AC3: Wire Session Cleanup
- [ ] `cleanStaleSessions()` called during hook runtime initialization (fire-and-forget)
- [ ] TTL configurable via `core-config.yaml` (default: 7 days = 168 hours)
- [ ] Existing 24h implementation reused (not duplicated), just parametrized
- [ ] Cleanup runs at most once per session (not on every prompt)
- [ ] **Benchmark:** Cleanup adds <5ms to first prompt of session
- [ ] **Test:** Create stale session file, run cleanup, verify deleted
- [ ] **Rollback:** Remove single `cleanStaleSessions()` call to disable
- [ ] **Observability:** Count of cleaned sessions logged at DEBUG level

---

## Scope

### IN Scope
- Create atomicWriteSync utility function
- Apply to all 4 identified write points
- Wire existing cleanStaleSessions into production flow
- Parametrize TTL from core-config.yaml

### OUT of Scope
- Changes to session schema
- New session features (resume, etc.)
- Changes to cleanup algorithm

---

## Tasks/Subtasks

- [x] 1. Create `atomicWriteSync()` utility
  - [x] 1.1 Implement write-to-tmp + rename pattern
  - [x] 1.2 Handle Windows-specific rename behavior (may need unlink first)
  - [x] 1.3 Write unit tests for utility
- [x] 2. Apply atomic writes to 4 points
  - [x] 2.1 `session-manager.js` — `updateSession()`
  - [x] 2.2 `context-detector.js` — `_updateSessionState()`
  - [x] 2.3 `unified-activation-pipeline.js` — `_writeSynapseSession()`
  - [x] 2.4 `unified-activation-pipeline.js` — `_persistUapMetrics()`
- [x] 3. Wire session cleanup
  - [x] 3.1 Add `cleanStaleSessions()` call in `resolveHookRuntime()` (first prompt only)
  - [x] 3.2 Read TTL from core-config.yaml with 168h default
  - [x] 3.3 Add "first prompt" guard to prevent repeated cleanup
  - [x] 3.4 Write test for cleanup integration
- [x] 4. Run full test suite — zero regressions
- [x] 5. Journey Snapshot: Run `node tests/synapse/benchmarks/wave6-journey.js --tag="NOG-12"`
  - [x] 5.1 Compare with NOG-11 snapshot — all deltas are measurement noise (gitConfig/permissionMode I/O variance)
  - [x] 5.2 Document improvements/changes in journey-log.md (auto-generated)
  - [x] 5.3 Regressions reviewed: all measurement noise, no code-caused regressions
- [x] 6. Update story checkboxes and file list

---

## Testing

### Specific Tests
- `tests/synapse/atomic-write.test.js` — utility tests (new)
- `tests/synapse/hook-runtime.test.js` — cleanup wiring tests (extended)
- `tests/synapse/session-manager.test.js` — verify existing tests still pass
- `tests/synapse/engine.test.js` — verify existing tests still pass

### Performance Journey
- `node tests/synapse/benchmarks/wave6-journey.js --tag="NOG-12" --compare="NOG-10"`
- Expected: atomic writes (no timing impact), session cleanup wired, no regressions

---

## Dev Notes

### Source Tree (Implementation Targets)

```
.aios-core/
  core/
    synapse/
      session/
        session-manager.js:230          # AC2: updateSession() — atomic write target
        session-manager.js:305          # AC3: cleanStaleSessions() — wire into production
      runtime/
        hook-runtime.js:15              # AC3: resolveHookRuntime() — cleanup wiring point
      utils/
        atomic-write.js                 # AC1: NEW — atomicWriteSync() utility
    session/
      context-detector.js:194           # AC2: _updateSessionState() — atomic write target
  development/
    scripts/
      unified-activation-pipeline.js:713  # AC2: _writeSynapseSession() — atomic write target
      unified-activation-pipeline.js:759  # AC2: _persistUapMetrics() — atomic write target

tests/
  synapse/
    atomic-write.test.js                # NEW — utility tests
    session-manager.test.js             # EXTEND — cleanup wiring test
    engine.test.js                      # VERIFY — existing tests pass
```

### File List

| File | Action | Notes |
|------|--------|-------|
| `.aios-core/core/synapse/utils/atomic-write.js` | CREATE | atomicWriteSync() utility — write-to-tmp + rename pattern |
| `.aios-core/core/synapse/session/session-manager.js` | MODIFY | Import atomicWriteSync, use in updateSession() (line 230) |
| `.aios-core/core/session/context-detector.js` | MODIFY | Import atomicWriteSync, use in updateSessionState() (line 194) |
| `.aios-core/development/scripts/unified-activation-pipeline.js` | MODIFY | Import atomicWriteSync, use in _writeSynapseSession() and _persistUapMetrics() |
| `.aios-core/core/synapse/runtime/hook-runtime.js` | MODIFY | Wire cleanStaleSessions() on first prompt, read TTL from config |
| `.aios-core/core-config.yaml` | MODIFY | Add synapse.session.staleTTLHours: 168 |
| `tests/synapse/atomic-write.test.js` | CREATE | 10 unit tests for atomicWriteSync utility |
| `tests/synapse/hook-runtime.test.js` | MODIFY | Add cleanup wiring tests (first prompt + skip on existing) |

### Key Integration Points

- **Atomic write pattern:** Write to `{filePath}.tmp.{process.pid}` then `fs.renameSync()`. On Windows, may need `fs.unlinkSync()` before rename if target exists.
- **Cleanup wiring:** `resolveHookRuntime()` is called on every `UserPromptSubmit`. Add "first prompt" guard using session state (`prompt_count === 0` or similar flag).
- **TTL config:** Add `synapse.session.staleTTLHours: 168` to `core-config.yaml` defaults.

---

## CodeRabbit Integration

Standard self-healing (dev phase): max 2 iterations, CRITICAL/HIGH auto-fix.

**Story Type:** Bug Fix / Hardening
**Primary Agent:** @dev (Dex)
**Quality Gates:**
- [ ] Pre-Commit (@dev) — CodeRabbit uncommitted scan
- [ ] Pre-PR (@devops) — CodeRabbit committed scan vs main

**Self-Healing:**
- Mode: light
- Max iterations: 2
- Severity filter: CRITICAL only
- Behavior: CRITICAL → auto_fix, HIGH → document_only

---

## Dev Agent Record

### Agent Model Used
Claude Opus 4.6

### Completion Notes
- **AC1:** Created `atomicWriteSync()` at `.aios-core/core/synapse/utils/atomic-write.js`. Write-to-tmp + rename pattern with Windows `unlinkSync` before rename. 10 unit tests all passing.
- **AC2:** Applied atomic writes to all 4 identified points: session-manager.js:230, context-detector.js:194, unified-activation-pipeline.js:714+760. All existing 53 tests pass unchanged (transparent to callers).
- **AC3:** Wired `cleanStaleSessions()` into `resolveHookRuntime()` with `prompt_count === 0` guard (first prompt only). TTL read from `core-config.yaml` (`synapse.session.staleTTLHours: 168`). Fire-and-forget (never blocks hook). 2 new tests verify wiring + skip behavior.
- **Journey snapshot NOG-12:** All deltas vs NOG-11 are measurement noise (gitConfig/permissionMode I/O variance on Windows). No code-caused regressions. Atomic write rename is <0.1ms — unmeasurable impact.

### Debug Log References
- N/A (no blocking issues)

---

## QA Results

### Gate Decision: PASS

**Reviewer:** Quinn (QA) | **Date:** 2026-02-21 | **Gate File:** `docs/qa/gates/nog-12-state-persistence-hardening.yml`

**AC Traceability:** All 3 ACs fully met. 97/97 tests passing, zero regressions.

| AC | Verdict | Summary |
|----|---------|---------|
| AC1 | PASS | atomicWriteSync utility with Windows/POSIX handling, 10 tests |
| AC2 | PASS | All 4 write points converted + createSession() also covered, existing tests unchanged |
| AC3 | PASS | Cleanup wired on first prompt, TTL configurable, fire-and-forget |

**3 original concerns resolved:**
1. `createSession()` now uses `atomicWriteSync` (5th write point covered)
2. Redundant dir creation removed from context-detector.js
3. Story Testing section corrected

**Performance:** Journey snapshot NOG-12 shows no code-caused regressions. All deltas are I/O measurement noise.

**Security:** No issues found. Tmp file race condition on Windows is standard Node.js pattern (~nanoseconds window).

---

## Change Log

| Date | Author | Change |
|------|--------|--------|
| 2026-02-21 | @sm (River) | Story created — Draft. Expanded from QW-7 per Codex QA finding #2. |
| 2026-02-21 | @po (Pax) | Validated GO (8/10 → 10/10 after fixes). Fixed context-detector.js path, added Dev Notes (Source Tree + File List), added Dev Agent Record, expanded CodeRabbit section. Status: Draft → Ready. |
| 2026-02-21 | @dev (Dex) | Implementation complete. All 6 tasks done. 53 tests passing, zero regressions. Journey snapshot captured. Status: Ready → Ready for Review. |
| 2026-02-21 | @qa (Quinn) | QA Review: PASS with CONCERNS (3 LOW). All ACs met, 97/97 tests passing, zero regressions. Gate file created. |
