# Story 124.7: Update CI workflows para `@aiox-squads`

| Field | Value |
|-------|-------|
| Story ID | 124.7 |
| Epic | [124 — aiox-squads scope migration](./EPIC-124-AIOX-SQUADS-SCOPE-MIGRATION.md) |
| Status | Ready for Review (PR #653, CI manual green) |
| Executor | @devops |
| Quality Gate | @qa |
| Points | 3 |
| Priority | P1 |
| Story Order | 7 |

## Status

- [x] Rascunho
- [x] Em revisão (APPROVED by @po — 2026-05-06, score 9.5/10)
- [x] Em execução
- [ ] Concluída

## Story Narrative

**As a** @devops engineer,
**I want** os CI workflows do aiox-core atualizados para publicar/sincronizar via `@aiox-squads/*`,
**so that** future releases não precisam de bypass manual e o pipeline está alinhado com o novo namespace.

## Contexto

Workflows existentes que referenciam scopes antigos:
- `.github/workflows/publish-pro.yml` — orquestra publish do Pro
- `.github/workflows/sync-pro-submodule.yml` — sync do aiox-pro submodule (adicionado em PR #625)
- `.github/workflows/ci.yml` — `pro-integration` job depende do submodule
- (Possível) `.github/workflows/publish-aiox-install.yml` — herança de monorepo packages
- `.github/workflows/pro-integration.yml` — separate test workflow para Pro tests

## Acceptance Criteria

- [x] AC1. `publish-pro.yml` usa `NPM_TOKEN_AIOX_SQUADS` e publica em `@aiox-squads/pro`
- [x] AC2. `sync-pro-submodule.yml` continua funcionando com new submodule pointer
- [x] AC3. `pro-integration.yml` (Pro tests) usa novo package name nos requires
- [x] AC4. CI `validate:packages` (gate) passa com 3 monorepo packages renomeados
- [x] AC5. Workflow runs em PR fresh são green (não red)
- [x] AC6. README badges (se houver) atualizadas pra apontar pro novo scope

## Tasks

- [x] Branch: `feat/epic-124-ci-workflows`
- [x] Inventário: `ls .github/workflows/*.yml` + grep por `@aios-fullstack`, `@aiox-fullstack`, `@synkra`, `@aiox/`
- [x] Update cada workflow encontrado:
  - [x] env vars: `NPM_TOKEN` → `NPM_TOKEN_AIOX_SQUADS` onde apropriado
  - [x] `npm publish` invocations: target package name correto
  - [x] Cache keys/package gates alinhados com package name
- [x] Local dry-run via `act` (se instalado) ou manual review
- [x] Commit: `ci: update workflows for @aiox-squads scope [Story 124.7]`
- [x] Push + verify CI green em PR test
- [x] Update README badges (npm version, downloads, etc) → apontar `@aiox-squads/core`

## Execution

- Validação: PR fresh deve ter todos workflows green; `gh run watch` confirma
- 2026-05-06: branch `feat/epic-124-ci-workflows` criada sobre `feat/epic-124-drop-tri-scope`.
- 2026-05-06: inventário via `rg --files .github/workflows` + grep de scopes antigos identificou referências publicáveis em `publish-pro.yml` e `npm-publish.yml`; `sync-pro-submodule.yml` não dependia de package npm diretamente.
- 2026-05-06: `publish-pro.yml` atualizado para `@aiox-squads/pro`, `NPM_TOKEN_AIOX_SQUADS`, checkout do submodule via `PRO_SUBMODULE_TOKEN`, metadata guard antes de publish e verify/install pós-publish contra o novo scope.
- 2026-05-06: `npm-publish.yml` atualizado para publicar `@aiox-squads/core` + matrix dos 3 workspace packages (`aiox-install`, `aiox-pro-cli`, `installer`) com token `NPM_TOKEN_AIOX_SQUADS`.
- 2026-05-06: `ci.yml` agora trata `.github/workflows/**` como config e adiciona gate `Package Name Validation` para os 4 package manifests `@aiox-squads/*`.
- 2026-05-06: `pro-integration.yml` cobre paths de Pro consumer code e emite warning se o submodule ainda não estiver no scope `@aiox-squads/pro` antes da Story 124.4 landar.
- 2026-05-06: `act` não está instalado; dry-run substituído por parse YAML com `js-yaml`, Prettier, `git diff --check` e validação local do script de package names.
- 2026-05-06: validações locais: `npx prettier --check .github/workflows/ci.yml .github/workflows/publish-pro.yml .github/workflows/npm-publish.yml .github/workflows/pro-integration.yml .github/workflows/sync-pro-submodule.yml README.md` → PASS; `js-yaml` parse dos workflows → PASS; package-name validation local → PASS; `git diff --check` → PASS; grep de scopes antigos/token antigo nos workflows editados → 0 matches.
- 2026-05-06: PR #653 criado sobre `feat/epic-124-drop-tri-scope`; review requests automáticos para `Pedrovaleriolopez` e `oalanicolas`.
- 2026-05-06: `gh workflow run ci.yml --ref feat/epic-124-ci-workflows` → run `25465312471` PASS, incluindo `Package Name Validation`, ESLint, TypeScript, Jest Node 18/20/22/24/25, Brownfield Install Test e Validation Summary.
- 2026-05-06: `gh workflow run pro-integration.yml --ref feat/epic-124-ci-workflows` → run `25465312481` PASS.

## File List

- [docs/stories/epic-124-aiox-squads-scope-migration/STORY-124.7-update-ci-workflows.md](./STORY-124.7-update-ci-workflows.md)
- [.github/workflows/publish-pro.yml](../../../.github/workflows/publish-pro.yml)
- [.github/workflows/npm-publish.yml](../../../.github/workflows/npm-publish.yml)
- [.github/workflows/sync-pro-submodule.yml](../../../.github/workflows/sync-pro-submodule.yml)
- [.github/workflows/ci.yml](../../../.github/workflows/ci.yml)
- [.github/workflows/pro-integration.yml](../../../.github/workflows/pro-integration.yml)
- [README.md](../../../README.md) — badges

## Dependencies

- **Blocks:** 124.11 (E2E verify), 124.12 (changelog)
- **Blocked by:** 124.5, 124.6 (consumer code já atualizado), 124.2 (token disponível)

## Definition of Done

- [ ] Workflows mergeados em main
- [x] 1 dry-run PR com todos workflows green
- [x] README badges atualizadas
