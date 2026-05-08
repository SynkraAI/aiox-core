# Story 447.1: Hierarchical Context Manager Contract

## Metadata

| Campo | Valor |
|-------|-------|
| Story ID | 447.1 |
| Epic | [447 - Hierarchical Context Management](./EPIC-447-HIERARCHICAL-CONTEXT-MANAGEMENT.md) |
| Status | Ready for Review |
| Executor | @dev |
| Quality Gate | @architect |
| quality_gate_tools | npm test focused, npm run lint, npm run typecheck, npm run validate:manifest |
| Points | 8 |
| Priority | P3 |
| Story Order | 1 |
| Source Issue | #447 |
| Issue URL | https://github.com/SynkraAI/aiox-core/issues/447 |
| Implementation Repository | SynkraAI/aiox-core |
| Start Gate | PO validation must confirm code reality and no duplication with existing SYNAPSE context modules. |

## Status

- [x] Draft
- [x] PO validated
- [x] Ready for implementation
- [x] Ready for Review

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
domain: "*"
deploy_type: "none"
```

## Community Origin

**Discussion URL**: https://github.com/SynkraAI/aiox-core/issues/447
**Author**: GitHub issue author
**Approved Date**: 2026-03-11
**Approved By**: AIOX triage via `status: confirmed`

## Story

**As a** framework maintainer,
**I want** a hierarchical context manager that compacts long-running agent history into short-term and long-term context buffers,
**so that** autonomous agents can keep executing without hitting model context limits or losing the semantic meaning of earlier decisions.

## Contexto

Issue #447 proposes a `HierarchicalContextManager` with `addMessage()` and `getContext()` APIs, threshold-based summarization and memory swapping. The current codebase already has partial context primitives, so this story must extend the existing runtime instead of creating an unrelated subsystem.

Existing surfaces to reuse or preserve:

- `.aiox-core/core/synapse/context/context-tracker.js` for context brackets and token budget behavior.
- `.aiox-core/core/synapse/utils/tokens.js` for current default token estimation.
- `.aiox-core/core/synapse/memory/memory-bridge.js` for memory hints retrieval semantics.
- `.aiox-core/core/orchestration/context-manager.js` for workflow-state persistence only; do not confuse it with LLM context-window management.

## Acceptance Criteria

- [ ] AC1: A new canonical `HierarchicalContextManager` API exists under the SYNAPSE/context runtime and is exported from the appropriate module surface.
- [ ] AC2: The API supports at minimum `addMessage(message)`, `getContext()`, `getStats()` and `clear()` without requiring a live LLM provider.
- [ ] AC3: Configuration supports `maxTokens`, `summarizationThreshold`, injected `tokenizer`, injected `summarizer`, and a safe fallback to the existing `estimateTokens()` utility.
- [ ] AC4: When the active context crosses the configured threshold, older messages are summarized into a long-term buffer while recent messages remain available in short-term context.
- [ ] AC5: `getContext()` returns a context payload that stays within `maxTokens` under deterministic tests, including cases with repeated long messages.
- [ ] AC6: Swap events are observable through a minimal event interface or callback hooks, including success and failure paths, without crashing the agent loop on summarization failure.
- [ ] AC7: The implementation preserves message role/content/metadata shape and never silently drops unsummarized content unless the configured summarizer explicitly returns a summary.
- [ ] AC8: The story does not alter existing `context-tracker`, `MemoryBridge`, or orchestration behavior except through additive exports or optional integration points.
- [ ] AC9: Documentation includes a usage example matching the issue intent and explains how to inject tokenizer/summarizer dependencies.
- [ ] AC10: Focused tests cover threshold behavior, token accounting, summary insertion, failure fallback, metadata preservation and max-token enforcement.

## CodeRabbit Integration

### Story Type Analysis

**Primary Type**: Core runtime feature
**Secondary Type(s)**: Architecture, memory/context management, resilience
**Complexity**: High

### Specialized Agent Assignment

**Primary Agents**:
- @dev
- @architect

**Supporting Agents**:
- @qa
- @po

### Quality Gate Tasks

- [ ] Pre-Commit (@dev): Run focused unit tests and verify no existing SYNAPSE context behavior regressed.
- [ ] Pre-PR (@devops): Confirm additive API surface and package manifest updates if new files are exported.
- [ ] Architecture Review (@architect): Confirm the implementation extends existing context/memory primitives instead of duplicating them.

### Self-Healing Configuration

- CRITICAL: report and stop for architecture/API conflicts.
- HIGH: fix test failures inside the new manager and adjacent exports.
- MEDIUM: fix docs and examples in the same branch.

## Tasks / Subtasks

- [x] T1: Confirm target module path and export surface for the new manager before implementation.
- [x] T2: Implement `HierarchicalContextManager` with configurable tokenizer, summarizer, threshold and max-token behavior.
- [x] T3: Add deterministic unit tests for message addition, threshold crossing, summary compaction, metadata preservation and failure fallback.
- [x] T4: Add integration-safe tests proving existing `context-tracker` and `MemoryBridge` behavior remains unchanged.
- [x] T5: Update docs or README with a usage example and dependency-injection guidance.
- [x] T6: Update manifest/entity registry only if required by existing packaging gates.
- [x] T7: Run focused tests, lint, typecheck and manifest validation.

## Dev Notes

- Do not introduce `js-tiktoken` as a hard dependency in the first pass unless the implementation includes fallback behavior and dependency rationale. The repo currently has `estimateTokens()` as the safe default.
- Keep summarization injected. The manager should not import OpenAI, Anthropic, Claude, Gemini, Kimi or OpenRouter directly.
- Treat `.aiox-core/core/orchestration/context-manager.js` as workflow-state persistence, not as the target class to overload.
- Prefer additive exports. Existing consumers should continue working without configuration changes.
- Issue #447 includes an external attachment, but this story should be implemented from repo contracts and issue requirements, not by blindly importing attached code.

## Testing

Required focused validation:

```bash
npm test -- --runTestsByPath tests/synapse/context-tracker.test.js tests/synapse/memory-bridge.test.js tests/core/orchestration/context-manager.test.js
npm test -- --runTestsByPath tests/synapse/hierarchical-context-manager.test.js
npm run lint
npm run typecheck
npm run validate:manifest
```

If `tests/synapse/hierarchical-context-manager.test.js` lands under a different path, update this section and the File List during implementation.

## Dependencies

- **Blocked by:** none.
- **Blocks:** future long-running agent loop integration stories.
- **Related:** SYNAPSE context tracker and MemoryBridge surfaces.

## Definition of Ready

- [x] PO validation completed with no unresolved blocker.
- [x] Target file paths confirmed against current code reality.
- [x] Acceptance criteria are testable without live LLM calls.

## Definition of Done

- [ ] All ACs complete.
- [ ] Focused tests pass.
- [ ] Lint and typecheck pass.
- [ ] Manifest validation passes if new package files are added.
- [ ] File List and Dev Agent Record are updated.

## Dev Agent Record

### Debug Log

- Draft created from issue #447 and current repo inspection on 2026-05-08.
- Fast-forwarded `main` from `origin/main` before implementation to include PRs #704 and #705.
- Confirmed target implementation surface under `.aiox-core/core/synapse/context/` and additive export path through `context/index.js`.
- Implemented deterministic `HierarchicalContextManager` without live LLM dependency; summarization and tokenization remain injected with safe fallbacks.
- Removed full-suite generated `entity-registry.yaml` timestamp churn and kept the scoped registry update for the new SYNAPSE context modules.
- Validation completed: focused hierarchical test suite passed, adjacent SYNAPSE/orchestration suites passed, manifest validation passed, ESLint scoped check passed, repository lint passed with pre-existing warnings only, typecheck passed and full Jest suite passed.
- Story DoD self-assessment completed. Build command is N/A because `package.json` does not define `npm run build`. CodeRabbit PR loop is deferred until a PR exists; no local CodeRabbit script is defined in `package.json`.
- CodeRabbit follow-up addressed on PR #706: serialized concurrent `addMessage()` mutations, collapsed long-term summaries before hard-limit truncation, strengthened event/error tests and switched the test import to the configured absolute module alias.

### Agent Model Used

- GPT-5 Codex

### Completion Notes

- Implemented the canonical hierarchical context manager contract for Story 447.1.
- Long-running context compaction now maintains short-term messages plus long-term summaries, emits/calls swap observability hooks and falls back safely on summarization failure.
- Concurrent message additions are serialized through an internal mutation queue so summarization swaps cannot interleave and corrupt context state.
- Hard-limit truncation now compacts all long-term summaries before truncating the combined result, preserving source-message lineage.
- Documentation includes dependency-injection usage for tokenizer and summarizer.
- Story is ready for architecture/QA review.

### File List

| File | Action |
|------|--------|
| `docs/stories/epic-447-hierarchical-context-management/EPIC-447-HIERARCHICAL-CONTEXT-MANAGEMENT.md` | Created |
| `docs/stories/epic-447-hierarchical-context-management/STORY-447.1-HIERARCHICAL-CONTEXT-MANAGER-CONTRACT.md` | Created |
| `.aiox-core/core/synapse/context/hierarchical-context-manager.js` | Created |
| `.aiox-core/core/synapse/context/index.js` | Created |
| `.aiox-core/core/synapse/context/README.md` | Created |
| `tests/synapse/hierarchical-context-manager.test.js` | Created |
| `.aiox-core/install-manifest.yaml` | Updated |
| `.aiox-core/data/entity-registry.yaml` | Updated |

## Change Log

| Data | Agente | Mudança |
|------|--------|---------|
| 2026-05-08 | @sm / Codex | Story draft criada a partir do issue #447 e da leitura das superfícies atuais de contexto/memória. |
| 2026-05-08 | @po (Pax) | Validation auto-fix: seção de status, executor assignment, accountable, deploy_type e headings canônicos adicionados. |
| 2026-05-08 | @po (Pax) | Validated 9.2/10 [GO with Auto-Fix]. Context: Epic 447, Wave 1. 0 stories anteriores analisadas. D10: 0 divergências, 5 ajustes. Condições: nenhuma. |
| 2026-05-08 | @dev (Dex) | Implementado `HierarchicalContextManager`, export aditivo, documentação, testes determinísticos, manifest e registry atualizados. |
| 2026-05-08 | @dev (Dex) | Ajustados apontamentos do CodeRabbit no PR #706: concorrência, preservação de summaries e assertions de eventos/erros. |
