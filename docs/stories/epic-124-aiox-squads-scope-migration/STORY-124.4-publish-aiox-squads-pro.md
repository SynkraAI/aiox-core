# Story 124.4: Publish `@aiox-squads/pro` (cross-repo)

| Field | Value |
|-------|-------|
| Story ID | 124.4 |
| Epic | [124 — aiox-squads scope migration](./EPIC-124-AIOX-SQUADS-SCOPE-MIGRATION.md) |
| Status | Ready for Review (PR #655; npm publish pending) |
| Executor | @devops |
| Quality Gate | @qa |
| Points | 5 |
| Priority | P0 |
| Story Order | 4 |

## Status

- [x] Rascunho
- [x] Em revisão (APPROVED by @po — 2026-05-06, score 9.5/10)
- [ ] Concluída

## Story Narrative

**As a** AIOX Pro buyer,
**I want** instalar Pro via `npm install @aiox-squads/pro`,
**so that** consumo o scope canônico unificado e o legacy `@aios-fullstack/pro` migra graciosamente.

## Contexto

Cross-repo: precisa de PR no `SynkraAI/aiox-pro` (submodule) PRIMEIRO, depois update do submodule pointer no aiox-core. Padrão idêntico à gotcha vivida em PR #640 (sessão de 2026-05-05). Target version `0.4.0` (bump minor de 0.3.0). Aiox-pro repo hoje declara `@aiox-fullstack/pro` no package.json (preparado pra rename antigo, NUNCA publicado nesse scope) — substitui por `@aiox-squads/pro`.

## Acceptance Criteria

- [x] AC1. PR no `SynkraAI/aiox-pro` atualiza `package.json`: `"name": "@aiox-squads/pro"`, `"version": "0.4.0"`
- [x] AC2. PR aiox-pro mergeado em `main` ANTES do aiox-core update
- [ ] AC3. `npm publish --access public` no aiox-pro — succeed
- [ ] AC4. `npm view @aiox-squads/pro version` retorna `0.4.0`
- [x] AC5. Submodule pointer no aiox-core atualizado pro novo HEAD do aiox-pro/main
- [ ] AC6. Smoke test via `tests/license/license-api-buyer.test.js` contra novo package
- [x] AC7. CI workflow `pro-integration.yml` continua passing com submodule pointer atualizado

## Tasks

- [x] PR no aiox-pro repo:
  - [x] Branch: `feat/epic-124-publish-aiox-squads-pro`
  - [x] Update `package.json` (name + version)
  - [x] Update internal docs/README com novo nome
  - [x] Commit: `chore(release): publish as @aiox-squads/pro@0.4.0 [Epic 124]`
  - [x] Delegate push + merge pro @devops
- [ ] Após aiox-pro merge: `npm publish --access public` (com NPM_TOKEN_AIOX_SQUADS)
- [ ] Validate `npm view @aiox-squads/pro`
- [ ] No aiox-core:
  - [x] Branch: `feat/epic-124-sync-pro-submodule`
  - [x] `cd pro && git pull origin main`
  - [x] `git add pro && git commit -m "chore(submodule): update aiox-pro pointer to @aiox-squads/pro@0.4.0 [Story 124.4]"`
  - [ ] PR + merge

## Execution

- Comandos cross-repo: PR ciclo no aiox-pro + submodule update no aiox-core
- Validação: `cd pro && grep -r '@aios-fullstack' . | head` deve retornar 0 ocorrências (apenas em CHANGELOG/historical)
- 2026-05-06: PR `SynkraAI/aiox-pro#12` (`chore(release): publish as @aiox-squads/pro@0.4.0`) verificado `CLEAN` com Lint, Integration Test with aiox-core e CodeRabbit verdes.
- 2026-05-06: PR `SynkraAI/aiox-pro#12` mergeado por @devops via squash sem bypass; merge commit `9197e00ff59d19b1000e21a973f75bd71d2c221e`.
- 2026-05-06: `pro` submodule em aiox-core atualizado para `9197e00ff59d19b1000e21a973f75bd71d2c221e`; `pro/package.json` confirma `@aiox-squads/pro@0.4.0`.
- 2026-05-06: `npx jest tests/pro/pro-detector.test.js tests/pro/pro-updater.test.js tests/license/license-api-buyer.test.js --runInBand --forceExit` → PASS (2 suites, 32 tests; license buyer suite não executou neste checkout porque depende de package publicado/Pro package disponível via registry).
- 2026-05-06: grep de runtime no `pro/` contra `@aios-fullstack|@aiox-fullstack` encontrou apenas nota histórica permitida no `pro/README.md`; `pro/package.json` e runtime apontam para `@aiox-squads/pro`.
- 2026-05-06: PR #655 criado sobre `feat/epic-124-ci-workflows`; review requests automáticos para `Pedrovaleriolopez` e `oalanicolas`.
- 2026-05-06: `gh workflow run pro-integration.yml --ref feat/epic-124-sync-pro-submodule` → run `25465961053` PASS.

## File List

- [docs/stories/epic-124-aiox-squads-scope-migration/STORY-124.4-publish-aiox-squads-pro.md](./STORY-124.4-publish-aiox-squads-pro.md)
- `<aiox-pro-repo>/package.json` — name + version (cross-repo)
- [pro](../../../pro) — submodule pointer update (aiox-core side)

## Dependencies

- **Blocks:** 124.6 (consumer code), 124.9 (deprecate @aios-fullstack/pro)
- **Blocked by:** 124.1 (naming), 124.2 (provisioning + tokens em ambos repos)

## Definition of Done

- [ ] `@aiox-squads/pro@0.4.0` no npm
- [ ] Submodule pointer atualizado em aiox-core/main
- [ ] @qa validou license-api-buyer test contra novo package
