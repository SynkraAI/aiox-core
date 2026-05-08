# Story 184.1: OpenAI-Compatible Kimi Provider Contract

## Metadata

| Campo | Valor |
|-------|-------|
| Story ID | 184.1 |
| Epic | [184 - Kimi K2.5 Provider Support](./EPIC-184-KIMI-K2-5-PROVIDER.md) |
| Status | Draft |
| Executor | @dev |
| Quality Gate | @architect |
| quality_gate_tools | npm test focused, npm run lint, npm run typecheck, npm run validate:manifest |
| Points | 8 |
| Priority | P4 |
| Story Order | 1 |
| Source Issue | #184 |
| Issue URL | https://github.com/SynkraAI/aiox-core/issues/184 |
| Implementation Repository | SynkraAI/aiox-core |
| Start Gate | PO/architect validation must confirm provider scope and no overlap with Kimi IDE sync work. |

## Status

- [x] Draft
- [ ] PO validated
- [ ] Ready for implementation
- [ ] Ready for Review
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
domain: "*"
deploy_type: "none"
```

## Community Origin

**Discussion URL**: https://github.com/SynkraAI/aiox-core/issues/184
**Author**: GitHub issue author
**Approved Date**: 2026-03-11
**Approved By**: AIOX triage via `status: confirmed`

## Story

**As a** framework maintainer,
**I want** Kimi K2.5 to be available through a generic OpenAI-compatible provider in the AIOX provider factory,
**so that** agents can use Moonshot/OpenRouter-compatible model endpoints without replacing the existing Claude/Gemini provider contract.

## Contexto

Issue #184 asks for native Kimi K2.5 support as an alternative to OpenAI or Claude. The current implementation already has an `AIProvider` base class, `ClaudeProvider`, `GeminiProvider` and a factory that loads `.aiox-ai-config.yaml`, but the factory only knows `claude` and `gemini`.

Official Kimi documentation confirms the API is OpenAI-compatible and uses:

- `base_url`: `https://api.moonshot.ai/v1`
- chat completions endpoint relative to that base URL: `/chat/completions`

The correct implementation path is a reusable `OpenAICompatibleProvider` plus a Kimi preset/alias. A Kimi-specific hardcoded provider would solve less and create avoidable duplication.

## Acceptance Criteria

- [ ] AC1: A new `OpenAICompatibleProvider` exists under `.aiox-core/infrastructure/integrations/ai-providers/` and extends the existing `AIProvider` contract.
- [ ] AC2: The provider supports `baseURL`/`baseUrl`, `apiKey`, `apiKeyEnv`, `model`, `timeout`, optional default headers and Chat Completions-compatible request payloads.
- [ ] AC3: The provider never logs raw API keys and returns the existing `AIResponse` shape with provider/model/duration metadata.
- [ ] AC4: `ai-provider-factory.js` registers `openai-compatible` and `kimi` aliases without changing the default `claude` primary and `gemini` fallback.
- [ ] AC5: Kimi default config uses Moonshot's OpenAI-compatible base URL and a Kimi K2.5 model identifier only as a configurable preset, not as a hard dependency.
- [ ] AC6: `getAvailableProviders()` and `getProvidersStatus()` include configured providers without hardcoding only `claude` and `gemini`.
- [ ] AC7: Tests mock HTTP/fetch and cover success, API error, missing key, timeout or network failure, JSON response parsing and factory alias registration.
- [ ] AC8: Documentation shows `.aiox-ai-config.yaml` examples for Moonshot/Kimi and OpenRouter-style overrides without committing secrets.
- [ ] AC9: Existing Claude/Gemini provider tests continue to pass unchanged in behavior.
- [ ] AC10: The story does not merge or depend on the stale Kimi IDE sync worktree; IDE sync can become a separate future story if still desired.

## CodeRabbit Integration

### Story Type Analysis

**Primary Type**: Core runtime feature
**Secondary Type(s)**: Provider abstraction, configuration, documentation
**Complexity**: Medium-high

### Specialized Agent Assignment

**Primary Agents**:
- @dev
- @architect

**Supporting Agents**:
- @qa
- @po
- @devops

### Quality Gate Tasks

- [ ] Pre-Commit (@dev): Run provider factory tests and the new OpenAI-compatible provider tests.
- [ ] Pre-PR (@devops): Confirm no secrets are committed and manifest updates match package files.
- [ ] Architecture Review (@architect): Confirm the design is generic OpenAI-compatible provider plus Kimi preset, not a one-off Kimi-only fork.

## Tasks / Subtasks

- [ ] T1: Confirm exact provider file paths and exports from current `ai-providers` module.
- [ ] T2: Implement `OpenAICompatibleProvider` using native fetch or an existing local HTTP primitive, with graceful fallback for unsupported runtimes if needed.
- [ ] T3: Add `kimi` and `openai-compatible` factory registration, config merging and provider status discovery.
- [ ] T4: Add deterministic tests with mocked HTTP responses and no external network calls.
- [ ] T5: Update docs with Kimi/Moonshot and OpenRouter configuration examples.
- [ ] T6: Update manifest/entity registry only if required by existing packaging gates.
- [ ] T7: Run focused tests, lint, typecheck and manifest validation.

## Dev Notes

- Do not add a live Moonshot/OpenRouter integration test in CI.
- Do not introduce a new SDK dependency unless native fetch is insufficient and the dependency is justified in the PR.
- Prefer `apiKeyEnv` defaults such as `MOONSHOT_API_KEY` for Kimi and allow explicit override.
- Treat `baseURL` and `baseUrl` as equivalent input names for compatibility with common OpenAI-style config.
- Preserve current default provider behavior: `primary: claude`, `fallback: gemini`.
- The stale `aiox-core-kimi` branch/worktree is scoped to IDE sync and should not be replayed into this story without a separate decision.

## Testing

Required focused validation:

```bash
npm test -- --runTestsByPath tests/infrastructure/ai-providers/ai-provider-factory.test.js
npm test -- --runTestsByPath tests/infrastructure/ai-providers/openai-compatible-provider.test.js
npm run lint
npm run typecheck
npm run validate:manifest
```

If the provider test lands under a different path, update this section and the File List during implementation.

## Dependencies

- **Blocked by:** PO/architect validation of this draft.
- **Blocks:** issue #184 closure.
- **Related:** issue #137; existing LLM routing docs; Kimi IDE sync branch is adjacent but not in scope.

## Definition of Ready

- [ ] PO validation completed with no unresolved blocker.
- [x] Target provider surfaces confirmed against current code reality.
- [x] Acceptance criteria are testable without live API calls.

## Definition of Done

- [ ] All ACs complete.
- [ ] Focused tests pass.
- [ ] Lint and typecheck pass.
- [ ] Manifest validation passes if package files are added.
- [ ] File List and Dev Agent Record are updated.
- [ ] Issue #184 has implementation evidence and can be closed or explicitly moved to follow-up scope.

## Dev Agent Record

### Debug Log

- Draft created from issue #184 and current repo inspection on 2026-05-08.
- Confirmed no open PR currently targets Kimi/Moonshot/provider support.
- Identified stale `aiox-core-kimi` branch/worktree as IDE sync scope, not provider LLM scope.
- Confirmed current provider factory registers `claude` and `gemini` only.
- Verified current Kimi API docs: OpenAI-compatible base URL is `https://api.moonshot.ai/v1`, and the chat completions endpoint relative to that base URL is `/chat/completions`.

### Agent Model Used

- GPT-5 Codex

### Completion Notes

- Draft only. No runtime implementation has been made in this story yet.

### File List

| File | Action |
|------|--------|
| `docs/stories/epic-184-kimi-provider/EPIC-184-KIMI-K2-5-PROVIDER.md` | Created |
| `docs/stories/epic-184-kimi-provider/STORY-184.1-OPENAI-COMPATIBLE-KIMI-PROVIDER.md` | Created |

## Change Log

| Data | Agente | Mudança |
|------|--------|---------|
| 2026-05-08 | @sm / Codex | Epic/story draft criados a partir do issue #184, leitura do provider factory atual e documentação oficial Kimi API. |
