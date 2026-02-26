# Story NOG-13: Git fsmonitor Experimental Rollout (Opt-in)

## Metadata

| Field | Value |
|-------|-------|
| **Story ID** | NOG-13 |
| **Epic** | NOGIC — Code Intelligence Integration |
| **Type** | Enhancement / Documentation |
| **Status** | Draft |
| **Priority** | P2 |
| **Points** | 1 |
| **Agent** | @dev (Dex) |
| **Quality Gate** | @qa (Quinn) |
| **Blocked By** | NOG-10 |
| **Branch** | `feat/epic-nogic-code-intelligence` |

---

## Story

As a **developer using AIOS**, I want `aios doctor` to detect when git fsmonitor is not enabled and suggest it as an opt-in optimization, so that I can reduce ProjectStatus loader timeout rates (currently ~60%) on my machine if my environment supports it.

---

## Problem Statement

NOG-9 research (A7) identified that `core.fsmonitor` can reduce `git status` from 50-200ms to <10ms. Codex QA (finding #4) correctly flagged that enabling it as a default is risky — it depends on Git version (2.37+), OS support, and filesystem type.

**Decision:** Opt-in only, with detection and suggestion via `aios doctor`.

---

## Acceptance Criteria

### AC1: Detection in aios doctor
- [ ] `aios doctor` checks `git config core.fsmonitor` and reports status
- [ ] If not enabled and Git >= 2.37, suggest with command: `git config core.fsmonitor true`
- [ ] If not enabled and Git < 2.37, report as "not available (Git 2.37+ required)"
- [ ] If already enabled, report as "enabled" with green status
- [ ] **Test:** Mock git version + config scenarios, verify correct suggestion
- [ ] **Rollback:** Revert doctor check (no production impact, advisory only)
- [ ] **Observability:** Doctor output shows fsmonitor status clearly

### AC2: Documentation
- [ ] Add fsmonitor section to project documentation (performance tips)
- [ ] Document requirements: Git 2.37+, local filesystem (not NFS/CIFS)
- [ ] Document how to disable if issues: `git config --unset core.fsmonitor`
- [ ] Include in `*session-info` output when ProjectStatus is slow (>100ms)

---

## Scope

### IN Scope
- fsmonitor detection in `aios doctor`
- Opt-in suggestion with requirements check
- Documentation of feature and limitations

### OUT of Scope
- Automatic enablement of fsmonitor
- Changes to ProjectStatus loader
- fsmonitor daemon management

---

## Tasks/Subtasks

- [ ] 1. Add fsmonitor check to `aios doctor`
  - [ ] 1.1 Check `git config core.fsmonitor` value
  - [ ] 1.2 Check git version for >= 2.37
  - [ ] 1.3 Display appropriate message based on state
- [ ] 2. Add slow-ProjectStatus hint to `*session-info`
  - [ ] 2.1 If `uap-metrics.json` shows projectStatus duration > 100ms, suggest fsmonitor
- [ ] 3. Write documentation
- [ ] 4. Write tests for detection logic
- [ ] 5. Run full test suite — zero regressions
- [ ] 6. Journey Snapshot: Run `node tests/synapse/benchmarks/wave6-journey.js --tag="NOG-13"`
  - [ ] 6.1 Compare with NOG-12 snapshot — zero regressions in unrelated metrics
  - [ ] 6.2 Document improvements/changes in journey-log.md
  - [ ] 6.3 If regression detected: fix before push or document as accepted trade-off

---

## Testing

- `tests/cli/doctor.test.js` — fsmonitor detection scenarios (new or extended)

### Performance Journey
- `node tests/synapse/benchmarks/wave6-journey.js --tag="NOG-13" --compare="NOG-12"`
- Expected: gitConfig.duration improvement (if fsmonitor enabled), no regressions

---

## CodeRabbit Integration

Standard self-healing (dev phase): max 2 iterations, CRITICAL/HIGH auto-fix.

---

## Change Log

| Date | Author | Change |
|------|--------|--------|
| 2026-02-21 | @sm (River) | Story created — Draft. Reclassified from MED-6 per Codex QA finding #4. |
