# STORY-123.18: Corrigir cluster runtime de resiliência

## Status

Done

## Story

Como mantenedor do AIOX Core, quero fechar o cluster de bugs de resiliência dos PRs antigos #584, #470, #474 e #477, para que ideação, condições de workflow, circuit breaker e memória de gotchas operem com comportamento fail-safe e sem regressões silenciosas.

## Acceptance Criteria

- [x] AC1. `IdeationEngine` usa a API existente `listGotchas()` e registra falhas de filtro com contexto.
- [x] AC2. `ConditionEvaluator` retorna `false` para condições desconhecidas e preserva condições runtime conhecidas com overrides explícitos.
- [x] AC3. `CircuitBreaker` preserva o timeout de recuperação quando novas falhas chegam no estado `OPEN`.
- [x] AC4. `GotchasMemory` aplica `errorWindowMs` como janela de contagem e ordena severidade `critical` antes de `warning` e `info`.
- [x] AC5. Testes regressivos cobrem o cluster e o manifest do core é regenerado.

## Tasks

- [x] Confrontar PRs antigos contra `main`.
- [x] Implementar apenas os resíduos ainda presentes no runtime.
- [x] Adicionar regressões focadas para o cluster.
- [x] Atualizar versão e manifest de instalação.
- [x] Rodar validações locais antes de PR.

## Dev Notes

- #470 já estava implementado no `main`, mas ganhou teste regressivo para permitir fechar o PR antigo com evidência.
- #517 já tinha o import nomeado corrigido em PR anterior, mas o fluxo ainda chamava `getAll()`, API inexistente em `GotchasMemory`.
- #584 continua dirty e carrega `entity-registry`/manifest antigo; esta story substitui o PR por uma correção atual e mínima.

## Validation

- `node -c .aiox-core/core/ideation/ideation-engine.js` -> PASS.
- `node -c .aiox-core/core/orchestration/condition-evaluator.js` -> PASS.
- `node -c .aiox-core/core/memory/gotchas-memory.js` -> PASS.
- `node -c tests/core/resilience-regressions.test.js` -> PASS.
- `npm test -- tests/core/resilience-regressions.test.js --runInBand --forceExit` -> PASS, 1 suite / 6 tests.
- `git diff --check` -> PASS.
- `npm run validate:manifest` -> PASS.
- `npm run validate:semantic-lint` -> PASS.
- `npm run validate:publish` -> PASS.
- `npm run lint -- --quiet` -> PASS.
- `npm run typecheck` -> PASS.
- `npm test -- tests/core/resilience-regressions.test.js tests/core/gotchas-memory-imports.test.js --runInBand --forceExit` -> PASS, 2 suites / 11 tests.
- `npm run test:ci` -> PASS, 316 suites / 7.853 tests.

## File List

- `.aiox-core/core/ideation/ideation-engine.js`
- `.aiox-core/core/orchestration/condition-evaluator.js`
- `.aiox-core/core/memory/gotchas-memory.js`
- `.aiox-core/install-manifest.yaml`
- `tests/core/resilience-regressions.test.js`
- `package.json`
- `package-lock.json`
- `docs/stories/epic-123/STORY-123.18-resilience-runtime-cluster.md`
