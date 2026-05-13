# Story 483.1: Semantic Handshake Contract and Pre-Execution Gate

## Metadata

| Campo | Valor |
|-------|-------|
| Story ID | 483.1 |
| Epic | [483 - Semantic Handshake](./EPIC-483-SEMANTIC-HANDSHAKE.md) |
| Status | Ready for Review |
| Executor | @dev |
| Quality Gate | @architect |
| quality_gate_tools | npm test focused, npm run lint, npm run typecheck, npm run validate:manifest |
| Points | 8 |
| Priority | P2 |
| Story Order | 1 |
| Source Issue | #483 |
| Issue URL | https://github.com/SynkraAI/aiox-core/issues/483 |
| Implementation Repository | SynkraAI/aiox-core |
| Start Gate | Confirmar que #447 cobre contexto, mas não cobre restrições executáveis. |

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
domain: "synapse-context"
deploy_type: "none"
```

## Community Origin

**Discussion URL**: https://github.com/SynkraAI/aiox-core/issues/483
**Author**: GitHub issue author
**Approved Date**: 2026-05-09
**Approved By**: AIOX triage via live issue queue

## Story

**As a** framework maintainer,
**I want** a Semantic Handshake engine and pre-execution gate,
**so that** hard planning constraints survive context compression and block code that contradicts the approved architecture.

## Contexto

Issue #483 requests a middleware layer that treats architectural decisions as executable contracts. Current `main` has the Hierarchical Context Manager from #447, which keeps context available, but it does not convert constraints into validators.

Evidence checked before implementation:

- PR #706 / Story 447.1 is merged and covers hierarchical context compaction only.
- PRs #564 and #565 are closed without merge, so Decision Memory and Agent Reflection are not available on `main`.
- `G4DevContextGate` is intentionally non-blocking and only recommends reuse/adapt opportunities.
- The issue attachment is a TypeScript prototype; implementation must be repository-native CommonJS and deterministic.

## Acceptance Criteria

- [x] AC1: A canonical `SemanticHandshakeEngine` exists under the SYNAPSE context runtime and is exported from `.aiox-core/core/synapse/context`.
- [x] AC2: The engine supports `registerConstraints()`, `addConstraint()`, `validateExecutionIntent()`, `generateComplianceReport()` and `toContextMessage()` without live LLM calls.
- [x] AC3: Constraint extraction deterministically recognizes at least PostgreSQL, serverless local-state, absolute-import and no-eval planning rules.
- [x] AC4: Validation distinguishes `BLOCKER` from `WARNING`; blockers make the result fail, warnings appear in the report without blocking.
- [x] AC5: Validation accepts proposed code as a string or file list and returns verified constraints, violations, blocking violations and a correction prompt.
- [x] AC6: A `G5SemanticHandshakeGate` exists in IDS, uses the engine, and marks the gate blocking only when blocker violations are present.
- [x] AC7: The engine can emit an LLM-ready system context message with AIOX metadata so future dev loops can inject the handshake result.
- [x] AC8: Focused tests cover extraction, violation detection, warning behavior, compliance report generation, context message output and gate blocking semantics.
- [x] AC9: Documentation/story File List and Dev Agent Record are updated with implemented files and validation evidence.

## CodeRabbit Integration

### Story Type Analysis

**Primary Type**: Core runtime governance feature
**Secondary Type(s)**: Context management, IDS gate, architecture compliance
**Complexity**: High

### Specialized Agent Assignment

**Primary Agents**:
- @dev
- @architect

**Supporting Agents**:
- @qa
- @po

### Quality Gate Tasks

- [x] Pre-Commit (@dev): Run focused Semantic Handshake engine and gate tests.
- [x] Pre-PR (@devops): Confirm additive exports and manifest update.
- [ ] Architecture Review (@architect): Confirm this complements #447 instead of duplicating context management.

## Tasks / Subtasks

- [x] T1: Implement `SemanticHandshakeEngine` with deterministic extraction and structured constraint validation.
- [x] T2: Export the engine from SYNAPSE context runtime.
- [x] T3: Implement `G5SemanticHandshakeGate` as an IDS pre-execution gate.
- [x] T4: Export the gate from IDS runtime.
- [x] T5: Add focused tests for engine behavior and gate behavior.
- [x] T6: Update manifest if package files change.
- [x] T7: Run focused tests, lint/typecheck where feasible, and manifest validation.

## Dev Notes

- Keep the implementation additive.
- Do not add an LLM dependency.
- Do not treat every architectural mismatch as a blocker by default; only constraints marked `BLOCKER` should block.
- Prefer plain CommonJS modules matching the current runtime style.

## Testing

Required focused validation:

```bash
npm test -- --runTestsByPath tests/synapse/semantic-handshake-engine.test.js tests/core/ids/semantic-handshake-gate.test.js
npm run validate:manifest
npm run lint
npm run typecheck
```

## Dependencies

- **Depends on:** Story 447.1 context runtime export surface.
- **Blocks:** future dev-loop automatic injection of Semantic Handshake reports.
- **Related:** Issue #482, because persistence/evolution can later consume handshake violations as learning events.

## Definition of Ready

- [x] Current code reality checked.
- [x] Source issue and attachment reviewed.
- [x] Acceptance criteria are testable without external services.

## Definition of Done

- [x] All ACs complete.
- [x] Focused tests pass.
- [x] Manifest validation passes.
- [x] Story File List and Dev Agent Record are updated.

## Dev Agent Record

### Debug Log

- Draft created from issue #483 and current repo inspection on 2026-05-09.
- Confirmed #447 is complete but does not enforce executable constraints.
- Confirmed PRs #564/#565 are closed without merge and are not available in current `main`.
- Reviewed attached `Semantic.Handshake.js` prototype and mapped it to repo-native CommonJS surfaces.
- Implemented `SemanticHandshakeEngine` with deterministic extraction for PostgreSQL, serverless local-state, absolute imports and no-eval constraints.
- Implemented `G5SemanticHandshakeGate` as a blocking IDS gate for `BLOCKER` violations.
- Updated SYNAPSE context and IDS barrel exports.
- Documented Semantic Handshake usage in the SYNAPSE context runtime README.
- Regenerated install manifest to include the new runtime files.
- Validation completed:
  - `npm test -- --runTestsByPath tests/synapse/semantic-handshake-engine.test.js tests/core/ids/semantic-handshake-gate.test.js`
  - `npm test -- --runTestsByPath tests/synapse/hierarchical-context-manager.test.js tests/core/ids/verification-gates.test.js tests/synapse/semantic-handshake-engine.test.js tests/core/ids/semantic-handshake-gate.test.js`
  - `npx eslint .aiox-core/core/synapse/context/semantic-handshake-engine.js .aiox-core/core/ids/gates/g5-semantic-handshake.js tests/synapse/semantic-handshake-engine.test.js tests/core/ids/semantic-handshake-gate.test.js`
  - `npm run validate:manifest`
  - `npm run lint`
  - `npm run typecheck`
- CodeRabbit review fixes completed:
  - `G5SemanticHandshakeGate` now verifies against a scoped engine clone so context constraints do not leak between gate runs.
  - `SemanticHandshakeEngine.addConstraint()` now rejects constraints whose normalized id is empty.
  - Custom validator exceptions now become deterministic blocker violations with validator-error metadata.
  - SYNAPSE context exports now use `path.resolve()` for the Semantic Handshake export surface.
- Post-review validation completed:
  - `npm test -- --runTestsByPath tests/synapse/semantic-handshake-engine.test.js tests/core/ids/semantic-handshake-gate.test.js`
  - `npx eslint .aiox-core/core/synapse/context/semantic-handshake-engine.js .aiox-core/core/ids/gates/g5-semantic-handshake.js .aiox-core/core/synapse/context/index.js tests/synapse/semantic-handshake-engine.test.js tests/core/ids/semantic-handshake-gate.test.js`
  - `npm run generate:manifest && npm run validate:manifest`
  - `npm run typecheck`
  - `npm run lint`

### Agent Model Used

- GPT-5 Codex

### Completion Notes

- Semantic Handshake now has a deterministic contract engine and a blocking pre-execution IDS gate.
- The engine is additive, offline-safe and returns both compliance reports and LLM-ready system context messages for future dev-loop injection.
- Gate behavior is conservative: missing proposed code warns and proceeds, `WARNING` violations report without blocking, and only `BLOCKER` violations make the gate blocking.
- Post-review hardening prevents cross-run constraint leakage, empty normalized IDs and thrown custom validators from creating nondeterministic gate behavior.

### File List

| File | Action |
|------|--------|
| `docs/stories/epic-483-semantic-handshake/EPIC-483-SEMANTIC-HANDSHAKE.md` | Created |
| `docs/stories/epic-483-semantic-handshake/STORY-483.1-SEMANTIC-HANDSHAKE-CONTRACT-GATE.md` | Created |
| `.aiox-core/core/synapse/context/semantic-handshake-engine.js` | Created |
| `.aiox-core/core/synapse/context/index.js` | Updated |
| `.aiox-core/core/synapse/context/README.md` | Updated |
| `.aiox-core/core/ids/gates/g5-semantic-handshake.js` | Created |
| `.aiox-core/core/ids/index.js` | Updated |
| `tests/synapse/semantic-handshake-engine.test.js` | Created |
| `tests/core/ids/semantic-handshake-gate.test.js` | Created |
| `.aiox-core/install-manifest.yaml` | Updated |

## Change Log

| Data | Agente | Mudança |
|------|--------|---------|
| 2026-05-09 | @sm / Codex | Epic e story criados a partir do issue #483, do issue attachment e da leitura da implementação atual. |
| 2026-05-09 | @dev (Dex) | Implementados engine, gate, exports, testes focados e manifesto para o Semantic Handshake. |
| 2026-05-09 | @dev (Dex) | Aplicados ajustes de CodeRabbit para isolamento do gate, validação de IDs e erro determinístico de validators. |
