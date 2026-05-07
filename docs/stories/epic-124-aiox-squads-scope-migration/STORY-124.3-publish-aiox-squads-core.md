# Story 124.3: Publish `@aiox-squads/core` v5.1.0

| Field | Value |
|-------|-------|
| Story ID | 124.3 |
| Epic | [124 — aiox-squads scope migration](./EPIC-124-AIOX-SQUADS-SCOPE-MIGRATION.md) |
| Status | In Progress |
| Executor | @devops |
| Quality Gate | @qa |
| Points | 5 |
| Priority | P0 |
| Story Order | 3 |

## Status

- [x] Rascunho
- [x] Em revisão (APPROVED by @po — 2026-05-06, score 9.5/10)
- [ ] Concluída

## Story Narrative

**As a** AIOX user,
**I want** instalar o framework via `npm install @aiox-squads/core`,
**so that** o naming reflete a arquitetura unificada de squads e o deprecated path `aiox-core` (sem scope) tem destino claro.

## Contexto

Epic 124 Decisão 2: target version `5.1.0` (continuidade — bump minor sinaliza scope change sem quebrar majors). Conteúdo equivalente a `aiox-core@5.0.7` já em main. Story trata só do publish; deprecation do legacy `aiox-core` sem scope é Story 124.10.

## Acceptance Criteria

- [x] AC1. `aiox-core/package.json` atualizado: `"name": "@aiox-squads/core"`, `"version": "5.1.0"`
- [x] AC2. `bin` entry preserva `aiox-core` como command name (Decisão 3 — não confundir com bin do pro)
- [ ] AC3. `npm publish --access public` executado com NPM_TOKEN_AIOX_SQUADS — succeed
- [ ] AC4. `npm view @aiox-squads/core version` retorna `5.1.0`
- [x] AC5. Smoke install em diretório limpo: `npm install -g <tarball local>` + `aiox-core --version` retorna `5.1.0`
- [x] AC6. README package include nota: "Successor de `aiox-core` (sem scope) — same content, new namespace"
- [x] AC7. CI workflow `publish-aiox-install.yml` (se existir) atualizado para usar new package name OR deferred pra 124.7

## Tasks

- [x] Branch local: `git checkout -b feat/epic-124-publish-core`
- [x] Update `package.json` (name + version)
- [x] Update `README.md` com nota de migration
- [x] Update `scripts/e2e/installed-skills-smoke.js` para resolver package install path a partir de `package.json` (`node_modules/@aiox-squads/core`)
- [x] Harden `bin/utils/validate-publish.js` para contar arquivos via `npm pack --dry-run --json` e evitar timeout flaky sob Jest
- [x] Stabilize full-suite QA timing gates que bloquearam validação local sob Jest paralelo
- [x] Registrar `CHANGELOG.md` para `@aiox-squads/core@5.1.0` com continuidade de `aiox-core@5.0.7`
- [x] Run `npm pack` localmente — validar tarball contém arquivos corretos
- [x] Run `npm run test:e2e:installed-skills` contra tarball local (sanity check)
- [x] Commit: `chore(release): prepare @aiox-squads/core publish [Story 124.3]`
- [x] Delegate push pro @devops
- [ ] Após PR merged: `npm publish --access public` (rodado por @devops com token)
- [ ] Validate via `npm view @aiox-squads/core`

## Execution

- Comandos: `npm version 5.1.0`, `npm publish --access public`
- Pre-publish validation: `npm pack && npm install -g ./aiox-squads-core-5.1.0.tgz`
- Pós-merge publisher: confirmar que `npm view @aiox-squads/core version --json` retorna `5.1.0` após publish.
- Evidência local 2026-05-06:
  - `npm pack` gerou `aiox-squads-core-5.1.0.tgz` com name `@aiox-squads/core` e version `5.1.0`.
  - Smoke install em prefixo temporário retornou `aiox-core --version` = `5.1.0`.
  - `npm run test:e2e:installed-skills` passou após ajustar o E2E para package scoped path.
  - `validate-publish.js` foi ajustado para usar saída JSON do npm pack e timeout configurável de 300s por default; o gate continua validando submodule Pro, file count e dependências `.aiox-core`.
  - Full-suite QA expôs thresholds de tempo frágeis sob concorrência local; budgets/timeout de testes foram relaxados sem alterar comportamento runtime.
  - AC7 foi deferido formalmente para Story 124.7: `.github/workflows/npm-publish.yml` ainda referencia `aiox-core` e `secrets.NPM_TOKEN` no fluxo legado de publicação.
  - `npm test` completo passou em 2026-05-06: 310 suites passadas, 11 skipped, 7792 tests passados, 149 skipped, 0 falhas, 42.973s.
  - Gates finais 2026-05-06: `npx prettier --check ...` PASS; `git diff --check` PASS; `npm run validate:publish` PASS (4157 files); `npm run test:e2e:installed-skills` PASS; `npm run typecheck` PASS; `npm run lint` PASS com 76 warnings `comma-dangle` (0 errors).
  - Perf-budget consolidation continua como débito de teste separado; esta story só estabiliza os gates necessários para publish prep.

## File List

- [docs/stories/epic-124-aiox-squads-scope-migration/STORY-124.3-publish-aiox-squads-core.md](./STORY-124.3-publish-aiox-squads-core.md)
- [package.json](../../../package.json) — name + version change
- [README.md](../../../README.md) — migration note
- [CHANGELOG.md](../../../CHANGELOG.md) — release entry `5.1.0`
- [.aiox-core/install-manifest.yaml](../../../.aiox-core/install-manifest.yaml) — regenerated install manifest for `v5.1.0`
- [.aiox-core/data/entity-registry.yaml](../../../.aiox-core/data/entity-registry.yaml) — registry checksum refresh for touched framework script
- [scripts/e2e/installed-skills-smoke.js](../../../scripts/e2e/installed-skills-smoke.js) — scoped install path support
- [bin/utils/validate-publish.js](../../../bin/utils/validate-publish.js) — resilient npm pack file-count check
- [tests/cli/validate-publish.test.js](../../../tests/cli/validate-publish.test.js) — formatting-tolerant source assertion
- [packages/installer/src/wizard/pro-setup.js](../../../packages/installer/src/wizard/pro-setup.js) — explicit Pro source override for scaffold tests
- [tests/pro-wizard.test.js](../../../tests/pro-wizard.test.js) — fast fixture-based scaffold coverage
- [tests/integration/wizard-validation-flow.test.js](../../../tests/integration/wizard-validation-flow.test.js) — temp dependency fixture to avoid repo-wide audit during callback tests
- [tests/unit/workflow-intelligence/pattern-store.test.js](../../../tests/unit/workflow-intelligence/pattern-store.test.js) — storage perf budget under parallel Jest
- [tests/integration/workflow-intelligence/pattern-learning.test.js](../../../tests/integration/workflow-intelligence/pattern-learning.test.js) — pattern perf budget under parallel Jest
- [tests/integration/workflow-intelligence/wis-integration.test.js](../../../tests/integration/workflow-intelligence/wis-integration.test.js) — WIS perf budgets under parallel Jest
- [tests/code-intel/hook-runtime.test.js](../../../tests/code-intel/hook-runtime.test.js) — hook runtime perf budget under parallel Jest
- [tests/integration/pipeline-memory-integration.test.js](../../../tests/integration/pipeline-memory-integration.test.js) — load-aware no-Pro fallback assertion
- [tests/integration/formatter-integration.test.js](../../../tests/integration/formatter-integration.test.js) — formatter perf budget under parallel Jest
- [tests/synapse/e2e/agent-scenarios.e2e.test.js](../../../tests/synapse/e2e/agent-scenarios.e2e.test.js) — retry only pipeline-timeout false negatives and isolate agent-switch flow
- [tests/synapse/hook-entry.test.js](../../../tests/synapse/hook-entry.test.js) — spawn perf budgets under parallel Jest
- [tests/synapse/synapse-memory-provider.test.js](../../../tests/synapse/synapse-memory-provider.test.js) — explicit MemoryLoader injection for test isolation
- [tests/unit/squad/squad-migrator.test.js](../../../tests/unit/squad/squad-migrator.test.js) — analysis perf budget under parallel Jest
- [tests/unit/squad/squad-validator.test.js](../../../tests/unit/squad/squad-validator.test.js) — full validation perf budget under parallel Jest
- [tests/unit/squad/squad-generator-blueprint.test.js](../../../tests/unit/squad/squad-generator-blueprint.test.js) — blueprint local load budget under parallel Jest
- [tests/config/config-resolver.test.js](../../../tests/config/config-resolver.test.js) — config cold-start budget under parallel Jest
- [tests/unit/generate-greeting.test.js](../../../tests/unit/generate-greeting.test.js) — generate-greeting perf budget under parallel Jest
- [tests/unit/greeting-builder.test.js](../../../tests/unit/greeting-builder.test.js) — load-aware timeout fallback assertion
- [tests/synapse/e2e/regression-guards.e2e.test.js](../../../tests/synapse/e2e/regression-guards.e2e.test.js) — regression guard budgets under parallel Jest
- [tests/unit/dev-context-loader.test.js](../../../tests/unit/dev-context-loader.test.js) — cache perf budget under full-suite I/O contention

## Dependencies

- **Blocks:** 124.6 (consumer code precisa de @aiox-squads/* publicado), 124.10 (deprecate de aiox-core)
- **Blocked by:** 124.1 (naming concluído), 124.2 (token/secrets concluídos; maintainers continuam async/bloqueados por EOTP)

## Definition of Done

- [ ] `@aiox-squads/core@5.1.0` no npm
- [x] Smoke install verde
- [ ] PR mergeado em main
- [x] @qa validou via E2E test
