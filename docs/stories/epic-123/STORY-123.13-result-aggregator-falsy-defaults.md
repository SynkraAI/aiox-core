# STORY-123.13: Preservar valores falsy válidos no ResultAggregator

## Status

Done

## Story

Como operador do executor paralelo, quero que o ResultAggregator preserve valores válidos como `waveIndex: 0`, `duration: 0`, `filesModified: 0` e strings vazias intencionais, para que relatórios, histórico e markdown não tratem dados reais como ausentes.

## Acceptance Criteria

- [x] AC1. `waveIndex: 0` é preservado durante `aggregate()` e no nome padrão do relatório.
- [x] AC2. Defaults usam fallback apenas para `null`/`undefined` quando valores falsy são válidos.
- [x] AC3. `filesModified` continua seguro: valores não-array não quebram a agregação e caem para extração por output.
- [x] AC4. Markdown renderiza métricas zero em vez de trocar para valores alternativos ou `N/A`.
- [x] AC5. Há regressões automatizadas cobrindo o comportamento.

## Tasks

- [x] Atualizar defaults falsy-safe em `.aiox-core/core/execution/result-aggregator.js`.
- [x] Adicionar regressões focadas em `tests/core/result-aggregator.test.js`.
- [x] Bump de patch para `@aiox-squads/core@5.1.9`.
- [x] Regenerar manifest antes do PR.

## Dev Notes

- Esta story substitui o escopo útil do PR histórico #611 sem reaproveitar o branch antigo, que estava com CI/manifest obsoleto e review pendente.
- O ajuste evita uma troca mecânica cega de `||` por `??`: campos que precisam ser array continuam normalizados antes do uso.

## Validation

- `node -c .aiox-core/core/execution/result-aggregator.js` -> PASS.
- `npm test -- tests/core/result-aggregator.test.js --runInBand` -> PASS, 1 suite / 36 tests.
- `npm test -- tests/core/result-aggregator.test.js tests/core/wave-executor.test.js tests/core/build-state-manager.test.js --runInBand --forceExit` -> PASS, 3 suites / 117 tests.
- `npm run validate:manifest` -> PASS.
- `npm run validate:publish` -> PASS.
- `npm run lint -- --quiet` -> PASS.
- `npm run typecheck` -> PASS.
- `git diff --check` -> PASS.
- `npm run test:ci` -> PASS, 315 suites / 7.846 tests, 149 skipped.

## File List

- `.aiox-core/core/execution/result-aggregator.js`
- `tests/core/result-aggregator.test.js`
- `docs/stories/epic-123/STORY-123.13-result-aggregator-falsy-defaults.md`
- `package.json`
- `package-lock.json`
- `.aiox-core/install-manifest.yaml`
- `.aiox-core/data/entity-registry.yaml`
