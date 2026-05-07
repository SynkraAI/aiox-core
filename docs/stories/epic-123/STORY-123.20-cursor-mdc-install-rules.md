# STORY-123.20: Gerar regras Cursor em formato MDC no install

## Status

Done

## Story

Como mantenedor do AIOX Core, quero que a instalação e o sync do Cursor gerem regras em `.cursor/rules/*.mdc` com front matter válido, para que projetos recém-instalados recebam regras globais e agentes carregáveis pelo Cursor atual.

## Acceptance Criteria

- [x] AC1. O instalador modular grava a regra global do Cursor em `.cursor/rules/aiox-global.mdc`.
- [x] AC2. Os agentes do Cursor são gerados como `.mdc` em `.cursor/rules/agents/`, com `description` e `alwaysApply: false`.
- [x] AC3. O sync de IDE gera agentes e redirects Cursor em `.mdc`, e a validação reconhece `.mdc` sem marcar redirects como órfãos.
- [x] AC4. O instalador legado e o helper de env config não apontam mais para `.cursorrules` ou `.cursor/rules.md`.
- [x] AC5. Versão, lockfile e manifest de instalação são atualizados para publicação patch.
- [x] AC6. Validações locais antes de PR são concluídas.

## Tasks

- [x] Confrontar o PR antigo #465 contra `main` e descartar caminhos legados `.aios`/`.cursorrules`.
- [x] Atualizar metadados do instalador Cursor para `.cursor/rules/aiox-global.mdc` e `.cursor/rules/agents`.
- [x] Adicionar front matter Cursor MDC ao template global.
- [x] Transformar agentes Cursor em `.mdc` no instalador modular e legado.
- [x] Fazer o sync e redirects Cursor emitirem `.mdc`.
- [x] Migrar a projeção versionada `.cursor/rules/agents/*.md` para `.mdc`.
- [x] Ajustar o validador para escanear `.md` e `.mdc`.
- [x] Registrar `.mdc` na estratégia de merge markdown para instalações brownfield.
- [x] Corrigir feedback CodeRabbit para escaping, fallback MDC, merge brownfield, paths legados e sanitização de redirects.
- [x] Atualizar testes unitários e de integração.
- [x] Atualizar versão, lockfile e manifest.
- [x] Rodar bateria completa de validação antes de PR.

## Dev Notes

- O PR #465 propunha alterações em caminhos antigos (`.aios-core`, `aios`, `.cursorrules`), então não podia ser mergeado diretamente.
- A documentação atual do Cursor usa Project Rules em `.cursor/rules/*.mdc`; a correção preserva AIOX naming e remove o resíduo funcional legado.
- O sync canônico já apontava para `.cursor/rules/agents`, mas o transformer ainda devolvia `.md` e sem front matter MDC.

## Validation

- `node -c packages/installer/src/config/ide-configs.js` -> PASS.
- `node -c packages/installer/src/wizard/ide-config-generator.js` -> PASS.
- `node -c .aiox-core/infrastructure/scripts/ide-sync/transformers/cursor.js` -> PASS.
- `node -c .aiox-core/infrastructure/scripts/ide-sync/redirect-generator.js` -> PASS.
- `node -c .aiox-core/infrastructure/scripts/ide-sync/validator.js` -> PASS.
- `node -c bin/aiox-init.js` -> PASS.
- `node -c packages/installer/src/merger/index.js` -> PASS.
- `node -c packages/installer/src/merger/strategies/index.js` -> PASS.
- `npm test -- tests/ide-sync/transformers.test.js tests/ide-sync/validator.test.js tests/unit/config/ide-configs.test.js tests/unit/wizard/ide-config-generator.test.js tests/integration/wizard-ide-flow.test.js --runInBand --forceExit` -> PASS, 5 suites / 110 tests.
- `npm test -- packages/installer/tests/unit/merger/strategies.test.js tests/unit/wizard/ide-config-generator.test.js tests/integration/wizard-ide-flow.test.js --runInBand --forceExit` -> PASS, 3 suites / 66 tests.
- `npm test -- tests/ide-sync/transformers.test.js packages/installer/tests/unit/merger/strategies.test.js tests/unit/wizard/ide-config-generator.test.js tests/integration/wizard-ide-flow.test.js --runInBand --forceExit` -> PASS, 4 suites / 94 tests.
- `npm test -- tests/ide-sync/transformers.test.js --runInBand --forceExit` -> PASS, 1 suite / 27 tests.
- `npm version 5.1.15 --no-git-tag-version` -> PASS.
- `npm run generate:manifest` -> PASS, 1.103 files, manifest v5.1.15.
- `npm run sync:ide:cursor -- --dry-run --verbose` -> PASS, 12 Cursor agent files would be written to `.cursor/rules/agents`.
- `npm run sync:ide` -> PASS, 97 files + 0 redirects.
- `npm run sync:ide:check` -> PASS, 97 synced / 0 missing / 0 drift / 0 orphaned.
- `npm run validate:parity` -> PASS, cursor-sync restored.
- `git diff --check` -> PASS.
- `npm run validate:manifest` -> PASS.
- `npm run validate:semantic-lint` -> PASS.
- `npm run validate:publish` -> PASS.
- `npm run lint -- --quiet` -> PASS.
- `npm run typecheck` -> PASS.
- `npm run test:ci` -> PASS, 317 suites / 7.867 tests / 149 skipped.

## Post-Merge Operations

- Fechar o PR antigo #465 como superseded depois do merge e publicação da correção atual.

## File List

- `.aiox-core/infrastructure/scripts/ide-sync/README.md`
- `.aiox-core/infrastructure/scripts/ide-sync/index.js`
- `.aiox-core/infrastructure/scripts/ide-sync/redirect-generator.js`
- `.aiox-core/infrastructure/scripts/ide-sync/transformers/cursor.js`
- `.aiox-core/infrastructure/scripts/ide-sync/validator.js`
- `.aiox-core/product/templates/ide-rules/cursor-rules.md`
- `bin/aiox-init.js`
- `bin/modules/env-config.js`
- `.cursor/rules/agents/*.mdc`
- `.aiox-core/install-manifest.yaml`
- `package.json`
- `package-lock.json`
- `packages/installer/src/merger/index.js`
- `packages/installer/src/merger/strategies/index.js`
- `packages/installer/src/merger/strategies/markdown-merger.js`
- `packages/installer/src/config/ide-configs.js`
- `packages/installer/src/wizard/ide-config-generator.js`
- `packages/installer/tests/unit/merger/strategies.test.js`
- `tests/ide-sync/transformers.test.js`
- `tests/ide-sync/validator.test.js`
- `tests/integration/wizard-ide-flow.test.js`
- `tests/unit/config/ide-configs.test.js`
- `tests/unit/wizard/ide-config-generator.test.js`
- `docs/stories/epic-123/STORY-123.20-cursor-mdc-install-rules.md`
