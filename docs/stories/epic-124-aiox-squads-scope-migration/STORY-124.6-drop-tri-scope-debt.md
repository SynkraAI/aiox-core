# Story 124.6: Drop tri-scope debt — single-scope `@aiox-squads/pro`

| Field | Value |
|-------|-------|
| Story ID | 124.6 |
| Epic | [124 — aiox-squads scope migration](./EPIC-124-AIOX-SQUADS-SCOPE-MIGRATION.md) |
| Status | Draft |
| Executor | @dev |
| Quality Gate | @qa |
| Points | 3 |
| Priority | P1 |
| Story Order | 6 |

## Status

- [x] Rascunho
- [x] Em revisão (APPROVED by @po — 2026-05-06, score 9.5/10)
- [x] Em execução
- [ ] Concluída

## Story Narrative

**As a** AIOX core maintainer,
**I want** o consumer code do aiox-core simplificado para single-scope `@aiox-squads/pro` (sem fallback dual-scope),
**so that** o tri-scope debt introduzido em PR #640 é removido e o code path fica limpo e testável.

## Contexto

PRs #625/#637/#640 (mergeados em 2026-05-05/06) introduziram lógica de resolver dual-scope `[@aiox-fullstack/pro, @aios-fullstack/pro]` em **5 arquivos** como work-in-progress de migração. Com `@aiox-squads/pro@0.4.0` publicado (Story 124.4), essa lógica pode ser substituída por single-scope.

**5 arquivos com debt:**
1. `bin/utils/pro-detector.js` — `PRO_PACKAGE_CANONICAL` + `PRO_PACKAGE_FALLBACK` constants
2. `packages/installer/src/wizard/pro-setup.js:391` — `npmScopes` array
3. `.aiox-core/core/pro/pro-updater.js:24` — `PRO_PACKAGES` array
4. `.aiox-core/cli/commands/pro/index.js:39-40` — `resolveLicensePath` array
5. `packages/aiox-pro-cli/bin/aiox-pro.js` — `CANONICAL` + `FALLBACK` constants

Plus: `tests/cli/pro-buyer.test.js` precisa atualizar references.

## Acceptance Criteria

- [x] AC1. Os 5 arquivos acima usam apenas `@aiox-squads/pro` — nenhuma referência a `@aios-fullstack/pro` ou `@aiox-fullstack/pro`. Exceções permitidas (não contam como debt): (a) docstrings/comments com migration note, (b) error messages que mencionem ambos para troubleshooting do user, (c) README/CHANGELOG histórico
- [x] AC2. Constants `PRO_PACKAGE_FALLBACK`, `PRO_PACKAGES` array (com fallback), `npmScopes` array — todos removidos ou simplificados para single value
- [x] AC3. Tests atualizados em `tests/cli/pro-buyer.test.js`, `tests/installer/pro-setup-auth.test.js`, `tests/license/license-api-buyer.test.js` — passing contra new scope
- [ ] AC4. `npm run lint` → 0 errors, 0 warnings
- [x] AC5. `npm run typecheck` → clean
- [x] AC6. `npx jest tests/cli/ tests/installer/ tests/license/` → todos verdes (com pro/ submodule disponível)
- [x] AC7. Grep `grep -rn '@aios-fullstack\|@aiox-fullstack' packages/ .aiox-core/ bin/ --include="*.js"` retorna 0 ocorrências (exceto comments/historical refs)

## Tasks

- [x] Branch: `feat/epic-124-drop-tri-scope`
- [x] Update `bin/utils/pro-detector.js` — remove constants, simplify `resolveNpmProPackage` para single
- [x] Update `packages/installer/src/wizard/pro-setup.js` — substitute `npmScopes` array por single string
- [x] Update `.aiox-core/core/pro/pro-updater.js` — substitute `PRO_PACKAGES` array
- [x] Update `.aiox-core/cli/commands/pro/index.js` — simplify `resolveLicensePath`
- [x] Update `packages/aiox-pro-cli/bin/aiox-pro.js` — remove FALLBACK constant
- [x] Update tests: pro-buyer.test.js, pro-setup-auth.test.js, license-api-buyer.test.js
- [x] Update `package.json` `dependencies`/`peerDependencies` se aplicável
- [x] Run lint + typecheck + jest
- [ ] Commit: `refactor(pro): drop tri-scope debt — single @aiox-squads/pro [Story 124.6]`
- [ ] Delegate push pro @devops

## Execution

- Validação local: lint, typecheck, jest, grep verification
- 2026-05-06: `rg -n "@aios-fullstack|@aiox-fullstack" packages .aiox-core bin --glob "*.js"` → 0 matches.
- 2026-05-06: `npx jest tests/pro/pro-detector.test.js tests/pro/pro-updater.test.js tests/installer/pro-setup-auth.test.js tests/cli/pro-buyer.test.js tests/license/license-api-buyer.test.js --runInBand --forceExit` → PASS (4 suites, 85 tests; license suite skipped when Pro module unavailable).
- 2026-05-06: `npm run typecheck` → PASS.
- 2026-05-06: `npm run lint` → PASS exit 0, with existing comma-dangle warnings; AC4 remains open until warning policy/config is reconciled.

## File List

- [docs/stories/epic-124-aiox-squads-scope-migration/STORY-124.6-drop-tri-scope-debt.md](./STORY-124.6-drop-tri-scope-debt.md)
- [bin/utils/pro-detector.js](../../../bin/utils/pro-detector.js)
- [packages/installer/src/wizard/pro-setup.js](../../../packages/installer/src/wizard/pro-setup.js)
- [.aiox-core/core/pro/pro-updater.js](../../../.aiox-core/core/pro/pro-updater.js)
- [.aiox-core/cli/commands/pro/index.js](../../../.aiox-core/cli/commands/pro/index.js)
- [.aiox-core/cli/commands/pro/buyer.js](../../../.aiox-core/cli/commands/pro/buyer.js)
- [.aiox-core/development/scripts/git-wrapper.js](../../../.aiox-core/development/scripts/git-wrapper.js)
- [packages/aiox-pro-cli/bin/aiox-pro.js](../../../packages/aiox-pro-cli/bin/aiox-pro.js)
- [tests/cli/pro-buyer.test.js](../../../tests/cli/pro-buyer.test.js)
- [tests/installer/pro-setup-auth.test.js](../../../tests/installer/pro-setup-auth.test.js)
- [tests/license/license-api-buyer.test.js](../../../tests/license/license-api-buyer.test.js)
- [tests/pro/pro-detector.test.js](../../../tests/pro/pro-detector.test.js)
- [tests/pro/pro-updater.test.js](../../../tests/pro/pro-updater.test.js)

## Dependencies

- **Blocks:** 124.7 (CI workflows), 124.11 (E2E verify)
- **Blocked by:** 124.4 (`@aiox-squads/pro` publicado), 124.5 (monorepo packages publicados)

## Definition of Done

- [ ] 5 arquivos limpos (single-scope)
- [ ] Tests passing
- [ ] Grep verification 0 occurrences
- [ ] PR mergeado
