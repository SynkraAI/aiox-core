# Story 482.1: Autopsy and Reincarnation Foundation

## Metadata

| Campo | Valor |
|-------|-------|
| Story ID | 482.1 |
| Epic | [482 - Agent Immortality Protocol](./EPIC-482-AGENT-IMMORTALITY.md) |
| Status | Ready for Review |
| Executor | @dev |
| Quality Gate | @architect |
| quality_gate_tools | npm test focused, npm run lint, npm run typecheck, npm run validate:manifest |
| Points | 8 |
| Priority | P2 |
| Source Issue | #482 |
| Issue URL | https://github.com/SynkraAI/aiox-core/issues/482 |
| Implementation Repository | SynkraAI/aiox-core |

## Status

- [x] Draft
- [x] Ready for implementation
- [x] Ready for Review
- [ ] Done

## Executor Assignment

```yaml
executor: "@dev"
quality_gate: "@architect"
quality_gate_tools:
  - npm test focused
  - npm run lint
  - npm run typecheck
  - npm run validate:manifest
accountable: "pedro-valerio"
domain: "core-resilience"
deploy_type: "none"
```

## Story

**As a** framework maintainer,  
**I want** fatal agent failures to produce compact autopsy reports, reincarnation context and persistent learning events,  
**so that** the next execution can resume with prevention directives instead of repeating the same failure mode.

## Contexto

Issue #482 requests a full Agent Immortality Protocol. The current `main` has foundational resilience pieces (`CircuitBreaker`, `GotchasMemory`) but no merged Autopsy Engine or Reincarnation Queue. The historical PR #590 is closed without merge, so it cannot be treated as delivered.

This story implements the smallest complete runtime slice that produces durable recovery artifacts without starting background heartbeat loops.

## Acceptance Criteria

- [x] AC1: A canonical `AgentImmortalityProtocol` exists under `.aiox-core/core/resilience/` and is exported from the resilience surface.
- [x] AC2: `AutopsyEngine.recordDeath()` diagnoses cause of death for context overflow, tool failures, recursive loops, external API failures and unknown errors.
- [x] AC3: Autopsy reports include compact legacy summaries that keep only bounded memory tail and omit full failed context.
- [x] AC4: Autopsy reports include prevention directives and an immunity token with forbidden action and suggested pivot.
- [x] AC5: `ReincarnationQueue` persists queued recovery contexts and supports deterministic claim of the next queued item.
- [x] AC6: `StateCommitLog` persists delta commits with previous-id linkage per agent.
- [x] AC7: `EvolutionLog` records repeated failure patterns and toxic actions.
- [x] AC8: `AgentImmortalityProtocol.captureFailure()` coordinates autopsy, queue, state commit, evolution and optional GotchasMemory tracking.
- [x] AC9: Focused tests cover exports, autopsy compression, immunity token, state commits, queue claim, evolution and gotchas integration.
- [x] AC10: Manifest and story Dev Agent Record are updated.

## CodeRabbit Integration

### Story Type Analysis

**Primary Type**: Core runtime resilience feature  
**Secondary Type(s)**: Persistence, memory, recovery orchestration  
**Complexity**: High

### Specialized Agent Assignment

**Primary Agents**:
- @dev
- @architect

**Supporting Agents**:
- @qa
- @po

### Quality Gate Tasks

- [x] Pre-Commit (@dev): Run focused resilience tests.
- [x] Pre-PR (@devops): Confirm additive package surface and manifest update.
- [ ] Architecture Review (@architect): Confirm Phase 1 is intentionally narrower than closed PR #590.

## Tasks / Subtasks

- [x] T1: Triage issue #482, attachment and historical PRs #576/#590 against current `main`.
- [x] T2: Implement `AutopsyEngine` with deterministic cause diagnosis and compact legacy summary.
- [x] T3: Implement `ReincarnationQueue`.
- [x] T4: Implement `StateCommitLog`.
- [x] T5: Implement `EvolutionLog`.
- [x] T6: Implement `AgentImmortalityProtocol.captureFailure()` orchestration.
- [x] T7: Add focused tests.
- [x] T8: Update docs/story/manifest and run validation.

## Dev Notes

- Keep the implementation additive.
- Do not start background timers in this story.
- Do not copy closed PR #590 wholesale; reuse its intent only where it matches current `main`.
- Keep reincarnation context compact enough to avoid re-triggering context overflow.
- Use project-local `.aiox/immortality/` storage by default.

## Testing

Required focused validation:

```bash
npm test -- --runTestsByPath tests/core/resilience/agent-immortality.test.js tests/core/resilience-regressions.test.js
npm run validate:manifest
npm run lint
npm run typecheck
```

## Dependencies

- **Uses:** `GotchasMemory` as an optional integration.
- **Complements:** `CircuitBreaker` and IDS resilience primitives.
- **Follows:** Issue #483 / Semantic Handshake can later feed violations into the Evolution Log.

## Definition of Ready

- [x] Current issue status checked live.
- [x] Historical PRs checked and confirmed unmerged.
- [x] Prototype attachment reviewed.
- [x] Acceptance criteria are testable without external services.

## Definition of Done

- [x] All ACs complete.
- [x] Focused tests pass.
- [x] Manifest validation passes.
- [x] Story File List and Dev Agent Record are updated.

## Dev Agent Record

### Debug Log

- Draft created from issue #482, issue attachment and live repo inspection on 2026-05-09.
- Confirmed #576 and #590 are closed without merge.
- Reviewed `Autopsy.Engine.js` attachment and mapped it to repo-native CommonJS.
- Implemented `AgentImmortalityProtocol`, `AutopsyEngine`, `ReincarnationQueue`, `StateCommitLog` and `EvolutionLog`.
- Added compact reincarnation context that avoids injecting full failed context.
- Added optional GotchasMemory tracking from `captureFailure()`.
- Added focused tests for the Phase 1 resilience foundation.
- Addressed CodeRabbit review with corrupt JSON quarantine, file-backed RMW locks, collision-resistant IDs, optional Gotchas isolation and public resilience package export.
- Validation completed:
  - `npm test -- --runTestsByPath tests/core/resilience/agent-immortality.test.js tests/core/resilience-regressions.test.js`
  - `npx eslint .aiox-core/core/resilience/agent-immortality.js .aiox-core/core/resilience/index.js tests/core/resilience/agent-immortality.test.js`
  - `npm run generate:manifest && npm run validate:manifest`
  - `npm run typecheck`
  - `npm run lint`
  - `npm run validate:publish`

### Agent Model Used

- GPT-5 Codex

### Completion Notes

- Phase 1 now turns fatal failures into durable autopsy reports, queued reincarnation contexts, delta state commits and evolution events.
- The implementation deliberately excludes heartbeat timers and automatic process revival to keep this slice deterministic, reviewable and safe.

### File List

| File | Action |
|------|--------|
| `docs/stories/epic-482-agent-immortality/EPIC-482-AGENT-IMMORTALITY.md` | Created |
| `docs/stories/epic-482-agent-immortality/STORY-482.1-AUTOPSY-REINCARNATION-FOUNDATION.md` | Created |
| `.aiox-core/core/resilience/agent-immortality.js` | Created |
| `.aiox-core/core/resilience/index.js` | Created |
| `.aiox-core/core/resilience/README.md` | Created |
| `.aiox-core/core/index.js` | Updated |
| `tests/core/resilience/agent-immortality.test.js` | Created |
| `.aiox-core/install-manifest.yaml` | Updated |
| `.aiox-core/data/entity-registry.yaml` | Updated |
| `package.json` | Updated |

## Change Log

| Data | Agente | Mudança |
|------|--------|---------|
| 2026-05-09 | @sm / Codex | Epic e story criados a partir do issue #482, attachment e PRs históricos fechados. |
| 2026-05-09 | @dev (Dex) | Implementada fundação Phase 1 do Agent Immortality Protocol com testes focados. |
| 2026-05-09 | @dev (Dex) | Ajustes pós-review: locks de persistência, quarentena de JSON corrompido, IDs únicos e export público de resilience. |
