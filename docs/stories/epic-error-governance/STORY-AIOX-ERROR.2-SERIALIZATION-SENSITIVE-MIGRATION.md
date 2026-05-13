# Story AIOX-ERROR.2: Serialization-Sensitive Migration

## Metadata

| Campo | Valor |
|-------|-------|
| Story ID | AIOX-ERROR.2 |
| Epic | AIOX-ERROR-GOVERNANCE |
| Status | Done |
| Executor | @dev |
| Quality Gate | @qa |
| Points | 5 |
| Prioridade | P1 |
| Source Issue | #621 |

## Objetivo

Migrar os primeiros pontos sensíveis de serialização para o contrato canônico de
Error Governance, preservando compatibilidade com consumidores existentes.

## Acceptance Criteria

- [x] AC1: `BuildStateManager` usa a serialização canônica para logs e detalhes
  de falha sem alterar o campo legado `error` como mensagem.
- [x] AC2: `BuildStateManager.recordFailure()` preserva metadata estruturada em
  `errorDetails`, incluindo stack redigido por padrão, `cause`, propriedades
  próprias e contexto de story/subtask.
- [x] AC3: `PipelineMetrics.errorLayer()` preserva o campo legado `error` como
  mensagem e adiciona `errorDetails` canônico para falhas de camada Synapse.
- [x] AC4: A mudança não altera políticas silenciosas de hooks, saída CLI ou
  exit codes existentes.
- [x] AC5: Testes focados de build-state, synapse e errors passam.

## Tasks

- [x] T1: Validar estado vivo de `main`, PRs e issues antes de implementar.
- [x] T2: Migrar logs/falhas do `BuildStateManager` para serializer canônico.
- [x] T3: Migrar métricas de erro do `SynapseEngine` para detalhes canônicos.
- [x] T4: Atualizar testes focados de compatibilidade.
- [x] T5: Rodar gates focados e atualizar registros gerados.

## Dev Agent Record

### Debug Log

- Checkpoint vivo: `main` alinhada com `origin/main` em `7f22246b`, sem PRs
  abertos, #701 fechado, #621 aberto.
- Branch: `feature/issue-621-error-normalizer-migration`.
- Testes focados: `npm test -- --runTestsByPath tests/core/build-state-manager.test.js tests/synapse/engine.test.js tests/core/errors/aiox-error.test.js tests/core/errors/serializer.test.js --runInBand` passou com 112 testes.
- Lint focado: `npx eslint .aiox-core/core/execution/build-state-manager.js .aiox-core/core/synapse/engine.js tests/core/build-state-manager.test.js tests/synapse/engine.test.js --no-warn-ignored` passou sem erros.
- Manifesto: `npm run generate:manifest` e `npm run validate:manifest` passaram.
- Typecheck: `npm run typecheck` passou.
- Lint completo: `npm run lint` passou com 0 erros e 114 warnings preexistentes de `comma-dangle`.
- Testes completos: `npm test -- --runInBand --forceExit --silent` passou com 334 suites, 8.374 testes passados e 149 skipped.
- CodeRabbit PR #703: corrigido registry incremental para resolver imports de diretórios
  `index.js` como IDs escopados, evitando dependência órfã `errors`, e para reconciliar campos padrão em entidades já existentes.
- Testes focados pós-CodeRabbit: `npm test -- --runTestsByPath tests/core/build-state-manager.test.js tests/synapse/engine.test.js tests/core/errors/aiox-error.test.js tests/core/errors/serializer.test.js tests/core/ids/populate-entity-registry.test.js --runInBand` passou com 186 testes.
- Segunda revisão CodeRabbit PR #703: `findScanConfigForPath()` passou a respeitar boundaries de diretório e o updater passou a recalcular `externalDeps`, `plannedDeps` e `lifecycle` após refresh de dependências. Testes focados passaram com 187 testes.
- Ajuste de CI PR #703: recomputação do `RegistryUpdater` tornou-se idempotente preservando `dependencies`, `externalDeps` e `plannedDeps`; teste alinhado à classificação de dependências não resolvidas em `plannedDeps`.
- Revalidação local pós-ajuste CI: `npm run typecheck` passou; `npm test -- --runInBand --forceExit --silent` passou com 334 suites, 8.376 testes passados e 149 skipped.

### Completion Notes

- `BuildStateManager` preserva o campo legado `error` como mensagem e adiciona `errorDetails` canônico em falhas persistidas e logs.
- `PipelineMetrics.errorLayer()` preserva `error` como mensagem e adiciona `errorDetails` canônico para falhas de camada Synapse.
- Registros IDS e install manifest foram atualizados e validados, incluindo correção para dependências `errors-index`.

### File List

| File | Action |
|------|--------|
| `docs/stories/epic-error-governance/EPIC-AIOX-ERROR-GOVERNANCE.md` | Updated |
| `docs/stories/epic-error-governance/STORY-AIOX-ERROR.2-SERIALIZATION-SENSITIVE-MIGRATION.md` | Created |
| `.aiox-core/core/execution/build-state-manager.js` | Updated |
| `.aiox-core/core/synapse/engine.js` | Updated |
| `.aiox-core/core/ids/registry-updater.js` | Updated |
| `.aiox-core/development/scripts/populate-entity-registry.js` | Updated |
| `.aiox-core/data/entity-registry.yaml` | Updated |
| `.aiox-core/install-manifest.yaml` | Updated |
| `tests/core/build-state-manager.test.js` | Updated |
| `tests/synapse/engine.test.js` | Updated |
| `tests/core/ids/populate-entity-registry.test.js` | Updated |

### Change Log

| Data | Agente | Mudança |
|------|--------|---------|
| 2026-05-08 | Codex | Story criada e primeira migração sensível de serialização iniciada. |
| 2026-05-08 | Codex | `BuildStateManager` e `PipelineMetrics` migrados para detalhes de erro canônicos com testes focados verdes. |
| 2026-05-08 | Codex | Gates completos executados e story marcada como Done. |
| 2026-05-08 | Codex | Comentários do CodeRabbit no PR #703 corrigidos no registry updater/extractor. |
| 2026-05-08 | Codex | Segunda rodada CodeRabbit corrigida com recomputação de campos derivados do registry. |
| 2026-05-08 | Codex | Falha Node 22 do CI corrigida preservando `plannedDeps` em refresh repetido e ajustando teste de dependência ainda não registrada. |
| 2026-05-08 | Codex | Revalidação local completa executada após ajuste de CI. |
