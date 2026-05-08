# Story 184.1: OpenAI-Compatible Kimi Provider Contract

## Metadata

| Campo | Valor |
|-------|-------|
| Story ID | 184.1 |
| Epic | [184 - Kimi K2.5 Provider Support](./EPIC-184-KIMI-K2-5-PROVIDER.md) |
| Status | Ready for Review |
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
- [x] PO validated
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

- [x] AC1: A new `OpenAICompatibleProvider` exists under `.aiox-core/infrastructure/integrations/ai-providers/` and extends the existing `AIProvider` contract.
- [x] AC2: The provider supports `baseURL`/`baseUrl`, `apiKey`, `apiKeyEnv`, `model`, `timeout`, optional default headers and Chat Completions-compatible request payloads.
- [x] AC3: The provider never logs raw API keys and returns the existing `AIResponse` shape with provider/model/duration metadata.
- [x] AC4: `ai-provider-factory.js` registers `openai-compatible` and `kimi` aliases without changing the default `claude` primary and `gemini` fallback.
- [x] AC5: Kimi default config uses Moonshot's OpenAI-compatible base URL and a Kimi K2.5 model identifier only as a configurable preset, not as a hard dependency.
- [x] AC6: `getAvailableProviders()` and `getProvidersStatus()` include configured providers without hardcoding only `claude` and `gemini`.
- [x] AC7: Tests mock HTTP/fetch and cover success, API error, missing key, timeout or network failure, JSON response parsing and factory alias registration.
- [x] AC8: Documentation shows `.aiox-ai-config.yaml` examples for Moonshot/Kimi and OpenRouter-style overrides without committing secrets.
- [x] AC9: Existing Claude/Gemini provider tests continue to pass unchanged in behavior.
- [x] AC10: The story does not merge or depend on the stale Kimi IDE sync worktree; IDE sync can become a separate future story if still desired.
- [x] AC11: `.aiox-core/infrastructure/integrations/ai-providers/index.js`, provider README and `.aiox-core/product/templates/aiox-ai-config.yaml` expose the new provider without changing current Claude/Gemini defaults.
- [x] AC12: `subagent-dispatcher.js` continues to work when the selected provider is `kimi` or `openai-compatible`, including fallback selection from configuration rather than hardcoding only Claude/Gemini.

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

- [x] Pre-Commit (@dev): Run provider factory tests and the new OpenAI-compatible provider tests.
- [ ] Pre-PR (@devops): Confirm no secrets are committed and manifest updates match package files.
- [ ] Architecture Review (@architect): Confirm the design is generic OpenAI-compatible provider plus Kimi preset, not a one-off Kimi-only fork.

## Tasks / Subtasks

- [x] T1: Confirm exact provider file paths and exports from current `ai-providers` module.
- [x] T2: Implement `OpenAICompatibleProvider` using native fetch or an existing local HTTP primitive, with graceful fallback for unsupported runtimes if needed.
- [x] T3: Add `kimi` and `openai-compatible` factory registration, config merging and provider status discovery.
- [x] T4: Add deterministic tests with mocked HTTP responses and no external network calls.
- [x] T5: Update docs with Kimi/Moonshot and OpenRouter configuration examples.
- [x] T6: Update manifest/entity registry only if required by existing packaging gates.
- [x] T7: Run focused tests, lint, typecheck and manifest validation.
- [x] T8: Export `OpenAICompatibleProvider` from the provider module index and factory exports.
- [x] T9: Update `subagent-dispatcher.js` fallback logic so configured non-CLI providers do not fall back through a hardcoded Claude/Gemini toggle.

## Dev Notes

- Do not add a live Moonshot/OpenRouter integration test in CI.
- Do not introduce a new SDK dependency unless native fetch is insufficient and the dependency is justified in the PR.
- Prefer `apiKeyEnv` defaults such as `MOONSHOT_API_KEY` for Kimi and allow explicit override.
- Treat `baseURL` and `baseUrl` as equivalent input names for compatibility with common OpenAI-style config.
- Preserve current default provider behavior: `primary: claude`, `fallback: gemini`.
- The stale `aiox-core-kimi` branch/worktree is scoped to IDE sync and should not be replayed into this story without a separate decision.
- `ai-provider.js` currently describes the base class as CLI-focused; implementation should update wording/contracts only as needed so HTTP providers are first-class while preserving the existing `AIResponse` shape.
- `ai-provider-factory.js` currently merges only `claude` and `gemini` config keys; implementation must merge configured OpenAI-compatible provider keys without dropping unknown provider configs.
- `getAvailableProviders()` and `getProvidersStatus()` currently hardcode `claude` and `gemini`; implementation should derive the provider set from defaults plus configured providers and aliases.
- Existing factory tests currently do not `await` async provider status functions; new or updated tests should make async assertions deterministic.

## Testing

Required focused validation:

```bash
npm test -- --runTestsByPath tests/infrastructure/ai-providers/openai-compatible-provider.test.js tests/infrastructure/ai-providers/ai-provider-factory.test.js tests/core/subagent-dispatcher.test.js --runInBand
npm run lint
npm run typecheck
npm run validate:manifest
```

If the provider test lands under a different path, update this section and the File List during implementation.

## Dependencies

- **Blocked by:** None after PO validation on 2026-05-08.
- **Blocks:** issue #184 closure.
- **Related:** issue #137; existing LLM routing docs; Kimi IDE sync branch is adjacent but not in scope.

## Definition of Ready

- [x] PO validation completed with no unresolved blocker.
- [x] Target provider surfaces confirmed against current code reality.
- [x] Acceptance criteria are testable without live API calls.

## PO Validation Report

### Phase 0: Epic Context

- Epic context loaded from `docs/stories/epic-184-kimi-provider/EPIC-184-KIMI-K2-5-PROVIDER.md`.
- Stories analyzed: 0 Done, 0 InReview, 1 Draft/Ready.
- Findings from prior stories: none. This is the first and only story in Epic 184.
- Filesystem conflicts: none. `OpenAICompatibleProvider` does not exist yet.
- Dependency status: all met after publishing the Epic/Story plan in PR #710.

### D10 Incremental Analysis

- No previous completed story exists in Epic 184, so there is no executor, schema, endpoint or IDS divergence from earlier work.
- Adjacent stale `aiox-core-kimi` branch/worktree remains out of scope because it targets IDE sync rather than runtime LLM provider support.

### Code Reality Check

- `ai-provider-factory.js` still registers only `claude` and `gemini`, and `getAvailableProviders()`/`getProvidersStatus()` are hardcoded to those providers.
- `index.js` exports only `AIProvider`, `ClaudeProvider`, `GeminiProvider` and factory helpers, so the new provider must be exported there as part of the implementation.
- `subagent-dispatcher.js` obtains providers through the factory but fallback logic currently toggles between Claude and Gemini; this must be generalized for Kimi/OpenAI-compatible providers.
- `.aiox-core/product/templates/aiox-ai-config.yaml` and provider README currently document only Claude/Gemini configuration.
- Existing `ai-provider-factory.test.js` covers the current factory surface but should be updated with deterministic async assertions for status/availability checks.

### Verdict

- PASS for implementation readiness.
- No blocker remains for `@dev` to implement Story 184.1.
- Required adjustment: keep #184 open until runtime implementation, tests and validation are merged.

## Definition of Done

- [x] All ACs complete.
- [x] Focused tests pass.
- [x] Lint and typecheck pass.
- [x] Manifest validation passes if package files are added.
- [x] File List and Dev Agent Record are updated.
- [ ] Issue #184 has implementation evidence and can be closed or explicitly moved to follow-up scope.

## Dev Agent Record

### Debug Log

- Draft created from issue #184 and current repo inspection on 2026-05-08.
- Confirmed no open PR currently targets Kimi/Moonshot/provider support.
- Identified stale `aiox-core-kimi` branch/worktree as IDE sync scope, not provider LLM scope.
- Confirmed current provider factory registers `claude` and `gemini` only.
- Verified current Kimi API docs: OpenAI-compatible base URL is `https://api.moonshot.ai/v1`, and the chat completions endpoint relative to that base URL is `/chat/completions`.
- PO validation completed on 2026-05-08 after PR #710 was merged to `main`; #184 was reopened because planning alone does not close implementation.
- Implemented `OpenAICompatibleProvider` with fetch injection, no-network availability checks, secret redaction, timeout handling and OpenAI Chat Completions response parsing.
- Added factory aliases/presets for `openai-compatible`, `openai_compatible`, `openai`, `kimi` and `moonshot`, preserving `claude` primary and `gemini` fallback defaults.
- Generalized provider status discovery and `subagent-dispatcher` fallback behavior for configured non-CLI providers.
- Regenerated `.aiox-core/install-manifest.yaml` after adding the new provider file.
- Addressed CodeRabbit review feedback for secret-safe provider options/cache keys, async JSON parsing, generic OpenAI-compatible template placeholders and configured fallback test coverage.

### Agent Model Used

- GPT-5 Codex

### Completion Notes

- Runtime implementation is complete and ready for review.
- Kimi uses the official Moonshot base URL `https://api.moonshot.ai/v1`, endpoint `/chat/completions`, API key env `MOONSHOT_API_KEY` and model `kimi-k2.5`.
- No live Moonshot/OpenRouter calls were added to tests.
- Local `npm run lint` passed with existing repo-wide warnings; touched JS files were also linted directly with no warnings after `eslint --fix`.

### Validation Evidence

- `npm test -- --runTestsByPath tests/infrastructure/ai-providers/openai-compatible-provider.test.js tests/infrastructure/ai-providers/ai-provider-factory.test.js tests/core/subagent-dispatcher.test.js --runInBand` passed: 3 suites, 58 tests.
- `npm run test:ci` passed: 338 suites passed, 12 skipped; 8399 tests passed, 170 skipped.
- `npm run validate:manifest` passed.
- `npm run lint` passed with 0 errors and existing repo-wide warnings.
- `npm run typecheck` passed.
- `node .aiox-core/utils/aiox-validator.js stories` passed.
- `node scripts/semantic-lint.js docs/stories/epic-184-kimi-provider/EPIC-184-KIMI-K2-5-PROVIDER.md docs/stories/epic-184-kimi-provider/STORY-184.1-OPENAI-COMPATIBLE-KIMI-PROVIDER.md` passed.
- `git diff --check` passed.

### File List

| File | Action |
|------|--------|
| `.aiox-core/infrastructure/integrations/ai-providers/openai-compatible-provider.js` | Created |
| `.aiox-core/infrastructure/integrations/ai-providers/ai-provider-factory.js` | Modified |
| `.aiox-core/infrastructure/integrations/ai-providers/ai-provider.js` | Modified |
| `.aiox-core/infrastructure/integrations/ai-providers/index.js` | Modified |
| `.aiox-core/infrastructure/integrations/ai-providers/README.md` | Modified |
| `.aiox-core/core/execution/subagent-dispatcher.js` | Modified |
| `.aiox-core/product/templates/aiox-ai-config.yaml` | Modified |
| `.aiox-core/install-manifest.yaml` | Modified |
| `tests/infrastructure/ai-providers/openai-compatible-provider.test.js` | Created |
| `tests/infrastructure/ai-providers/ai-provider-factory.test.js` | Modified |
| `tests/core/subagent-dispatcher.test.js` | Modified |
| `docs/stories/epic-184-kimi-provider/EPIC-184-KIMI-K2-5-PROVIDER.md` | Created earlier |
| `docs/stories/epic-184-kimi-provider/STORY-184.1-OPENAI-COMPATIBLE-KIMI-PROVIDER.md` | Updated |

## Change Log

| Data | Agente | Mudança |
|------|--------|---------|
| 2026-05-08 | @sm / Codex | Epic/story draft criados a partir do issue #184, leitura do provider factory atual e documentação oficial Kimi API. |
| 2026-05-08 | @po / Codex | Story validada contra `origin/main`, ajustes técnicos adicionados e status movido para Ready. |
| 2026-05-08 | @dev / Codex | Provider OpenAI-compatible/Kimi implementado, testes adicionados, docs/config atualizados e manifest regenerado. |
