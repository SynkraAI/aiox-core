# Story 124.5: Migrate 3 monorepo packages para `@aiox-squads/*`

| Field | Value |
|-------|-------|
| Story ID | 124.5 |
| Epic | [124 — aiox-squads scope migration](./EPIC-124-AIOX-SQUADS-SCOPE-MIGRATION.md) |
| Status | In Progress — local prep complete; publish/remote CI pending |
| Executor | @dev → @devops |
| Quality Gate | @qa |
| Points | 5 |
| Priority | P1 |
| Story Order | 5 |

## Status

- [x] Rascunho
- [x] Em revisão (APPROVED by @po — 2026-05-06, score 9.5/10)
- [x] Em execução
- [ ] Concluída

## Story Narrative

**As a** AIOX maintainer,
**I want** os 3 packages do monorepo (`installer`, `aiox-pro-cli`, `aiox-install`) renomeados para `@aiox-squads/*`,
**so that** todo o footprint npm da Synkra tem namespace consistente e os scopes inválidos (`@aiox`) são eliminados.

## Contexto

Epic 124 lista 3 packages do `aiox-core/packages/` que precisam migrar:
- `aiox-install/` → atualmente `@synkra/aiox-install`
- `aiox-pro-cli/` → atualmente `aiox-pro` (sem scope; mantém bin command `aiox-pro` — Decisão 3)
- `installer/` → atualmente `@aiox/installer` (scope inválido)

`gemini-aiox-extension/` não é npm package (out-of-scope). Nomes finais virão de Story 124.1 decision matrix.

## Acceptance Criteria

- [x] AC1. `packages/aiox-install/package.json` renomeado para `@aiox-squads/aiox-install` (nome final per Story 124.1)
- [x] AC2. `packages/aiox-pro-cli/package.json` renomeado para `@aiox-squads/aiox-pro-cli` — bin name preserva `aiox-pro`
- [x] AC3. `packages/installer/package.json` renomeado para `@aiox-squads/installer`
- [x] AC4. Internal references entre packages do monorepo atualizadas (qualquer `require`/import que use o old name)
- [ ] AC5. `npm publish --access public` executado para cada um — todos succeed
- [ ] AC6. `npm view @aiox-squads/<each>` retorna versão publicada
- [ ] AC7. CI `validate:packages` (workflow gate) passa com novos nomes
- [x] AC8. Lint + typecheck + tests do monorepo verdes pós-rename

## Tasks

- [x] Branch: `feat/epic-124-monorepo-rename`
- [x] Para cada package (3x):
  - [x] Update `package.json` name (per Story 124.1 decision)
  - [x] Bump version (sugerir patch ou minor, conforme convention do package)
  - [x] Grep refs no monorepo: `grep -r "@synkra/aiox-install\|aiox-pro\|@aiox/installer" --include="*.{js,json}"`
  - [x] Update internal refs encontradas
- [x] Run `npm run lint && npm run typecheck && npm test`
- [ ] Commit: `chore(monorepo): rename 3 packages to @aiox-squads/* [Story 124.5]`
- [ ] Delegate push pro @devops
- [ ] Após PR merged: publish 3x via `npm publish --workspace=<each> --access public`
- [ ] Validate: `npm view @aiox-squads/<each>`

## Execution

- Comandos: `npm publish --workspace`, grep para ref discovery
- Validação: lint + typecheck + jest + manual `aiox-pro --version` (bin preservation)
- 2026-05-06 local prep:
  - `packages/aiox-install`: `@synkra/aiox-install@1.0.0` → `@aiox-squads/aiox-install@1.1.0`; bins `aiox-install` and `edmcp` preserved.
  - `packages/aiox-pro-cli`: `aiox-pro@0.1.0` → `@aiox-squads/aiox-pro-cli@0.2.0`; bin `aiox-pro` preserved; install target changed to `@aiox-squads/pro`; legacy Pro scopes kept as read-only brownfield detection fallbacks.
  - `packages/installer`: `@aiox/installer@3.2.1` → `@aiox-squads/installer@3.3.0`; `aiox-installer` bin and package exports added.
  - `npm pack --workspace=@aiox-squads/aiox-install --dry-run --json` → `aiox-squads-aiox-install-1.1.0.tgz`, 8 entries.
  - `npm pack --workspace=@aiox-squads/aiox-pro-cli --dry-run --json` → `aiox-squads-aiox-pro-cli-0.2.0.tgz`, 3 entries.
  - `npm pack --workspace=@aiox-squads/installer --dry-run --json` → `aiox-squads-installer-3.3.0.tgz`, 60 entries.
  - `node packages/aiox-pro-cli/bin/aiox-pro.js --version` → `aiox-pro v0.2.0`.
  - `node packages/installer/src/index.js --help` → usage output without loading the interactive wizard.
  - `npm run typecheck` → pass.
  - `npm run lint` → pass with existing comma-dangle warnings only; 0 errors.
  - `npm test` → pass: 310 suites passed, 11 skipped; 7,798 tests passed, 149 skipped.
  - `npm test --workspace=@aiox-squads/aiox-install -- --runInBand` → pass: 6 suites passed; 104 tests passed, 2 skipped.
  - `npx jest tests/pro-wizard.test.js tests/installer/pro-setup-auth.test.js --runInBand` → pass: 2 suites, 62 tests.
  - `npx prettier --check ...` and `git diff --check` → pass.
  - `npm run validate:packages` → unavailable locally (`Missing script: "validate:packages"`); AC7 remains pending for the remote workflow gate/PR check.

## File List

- [docs/stories/epic-124-aiox-squads-scope-migration/STORY-124.5-migrate-monorepo-packages.md](./STORY-124.5-migrate-monorepo-packages.md)
- [package-lock.json](../../../package-lock.json)
- [packages/aiox-install/CHANGELOG.md](../../../packages/aiox-install/CHANGELOG.md)
- [packages/aiox-install/README.md](../../../packages/aiox-install/README.md)
- [packages/aiox-install/bin/aiox-install.js](../../../packages/aiox-install/bin/aiox-install.js)
- [packages/aiox-install/bin/edmcp.js](../../../packages/aiox-install/bin/edmcp.js)
- [packages/aiox-install/jest.config.js](../../../packages/aiox-install/jest.config.js)
- [packages/aiox-install/package.json](../../../packages/aiox-install/package.json)
- [packages/aiox-pro-cli/bin/aiox-pro.js](../../../packages/aiox-pro-cli/bin/aiox-pro.js)
- [packages/aiox-pro-cli/package.json](../../../packages/aiox-pro-cli/package.json)
- [packages/installer/package.json](../../../packages/installer/package.json)
- [packages/installer/src/index.js](../../../packages/installer/src/index.js)
- [packages/installer/src/pro/pro-scaffolder.js](../../../packages/installer/src/pro/pro-scaffolder.js)
- [packages/installer/src/wizard/pro-setup.js](../../../packages/installer/src/wizard/pro-setup.js)
- [tests/installer/pro-setup-auth.test.js](../../../tests/installer/pro-setup-auth.test.js)
- [tests/packages/aiox-install/integration.test.js](../../../tests/packages/aiox-install/integration.test.js)
- [tests/pro-wizard.test.js](../../../tests/pro-wizard.test.js)

## Dependencies

- **Blocks:** 124.6 (consumer code), 124.7 (CI updates)
- **Blocked by:** 124.1 (naming decisions), 124.2 (provisioning + token)

## Definition of Done

- [ ] 3 packages publicados em `@aiox-squads/*`
- [ ] Bin command `aiox-pro` continua funcional pós-rename
- [ ] CI `validate:packages` verde
- [ ] @qa validou via smoke install + bin invocation
