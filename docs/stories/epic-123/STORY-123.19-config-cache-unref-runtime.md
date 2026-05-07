# STORY-123.19: Liberar timers globais do config cache

## Status

Done

## Story

Como mantenedor do AIOX Core, quero que os timers globais de limpeza do config cache usem `.unref()`, para que ativações e comandos curtos do CLI não mantenham o processo Node vivo depois que o trabalho real terminou.

## Acceptance Criteria

- [x] AC1. O config cache canônico em `.aiox-core/core/config/config-cache.js` mantém limpeza automática, mas não prende o event loop.
- [x] AC2. A cópia de infraestrutura em `.aiox-core/infrastructure/scripts/config-cache.js` preserva o mesmo comportamento para superfícies que ainda importam esse módulo.
- [x] AC3. Teste regressional prova que os timers de limpeza chamam `.unref()`.
- [x] AC4. Versão, lockfile e manifest de instalação são atualizados para publicação patch.

## Tasks

- [x] Confrontar o PR antigo #378 contra `main` e identificar o caminho legado `.aios-core`.
- [x] Localizar o resíduo funcional nos caminhos atuais `.aiox-core`.
- [x] Implementar `.unref()` nos timers globais do config cache.
- [x] Adicionar teste regressional focado.
- [x] Atualizar versão e manifest.
- [x] Rodar validações locais antes de PR.

## Dev Notes

- O PR #378 alterava `.aios-core/core/config/config-cache.js`, caminho legado que não resolve a superfície publicada atual.
- O bug permanece relevante em `.aiox-core/core/config/config-cache.js` e na cópia de infraestrutura, ambas com `setInterval` de limpeza a cada 60 segundos.
- A correção deve ser defensiva para ambientes de teste/mocks: chamar `.unref()` apenas quando a função existir.

## Validation

- `node -c .aiox-core/core/config/config-cache.js` -> PASS.
- `node -c .aiox-core/infrastructure/scripts/config-cache.js` -> PASS.
- `node -c tests/core/config-cache-unref.test.js` -> PASS.
- `node -e "require('./.aiox-core/core/config/config-cache'); console.log('core_config_cache_exited')"` -> PASS.
- `node -e "require('./.aiox-core/infrastructure/scripts/config-cache'); console.log('infra_config_cache_exited')"` -> PASS.
- `npm test -- tests/core/config-cache-unref.test.js --runInBand --forceExit` -> PASS, 1 suite / 2 tests.
- `npm test -- tests/core/config-cache-unref.test.js tests/config/config-cli.test.js tests/config/config-resolver.test.js tests/core/config/config-resolver.test.js tests/core/unified-activation-pipeline.test.js --runInBand --forceExit` -> PASS, 5 suites / 192 tests.
- `git diff --check` -> PASS.
- `npm run validate:manifest` -> PASS.
- `npm run validate:semantic-lint` -> PASS.
- `npm run validate:publish` -> PASS.
- `npm run lint -- --quiet` -> PASS.
- `npm run typecheck` -> PASS.
- `npm run test:ci` -> PASS, 317 suites / 7.855 tests / 149 skipped.

## Post-Merge Operations

- Fechar o PR antigo #378 como superseded depois do merge e publicação da correção atual.

## File List

- `.aiox-core/core/config/config-cache.js`
- `.aiox-core/infrastructure/scripts/config-cache.js`
- `tests/core/config-cache-unref.test.js`
- `.aiox-core/install-manifest.yaml`
- `package.json`
- `package-lock.json`
- `docs/stories/epic-123/STORY-123.19-config-cache-unref-runtime.md`
