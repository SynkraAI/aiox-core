# Story AIOX-ERROR.1: Core Error Contract

## Metadata

| Campo | Valor |
|-------|-------|
| Story ID | AIOX-ERROR.1 |
| Epic | AIOX-ERROR-GOVERNANCE |
| Status | Ready for Review |
| Executor | @dev |
| Quality Gate | @qa |
| Points | 5 |
| Prioridade | P1 |
| Source Issue | #701 |

## Objetivo

Implementar a primeira superfície canônica de Error Governance do `aiox-core`,
com contrato tipado e serialização segura, sem migrar call-sites existentes em
massa.

## Acceptance Criteria

- [x] AC1: ADR define `AIOXError`, `ErrorRegistry`, categorias, metadata,
  serialização e regras de compatibilidade.
- [x] AC2: `.aiox-core/core/errors/` exporta `AIOXError`, `ErrorRegistry`,
  registry padrão, constantes de categoria/severidade, normalização e
  serialização.
- [x] AC3: `AIOXError` preserva compatibilidade com `Error`, `message`, `name`,
  `cause`, `code`, `category`, `severity`, `retryable`, `exitCode` e
  `metadata`.
- [x] AC4: `ErrorRegistry` valida códigos únicos, expõe lookup seguro e mantém
  fallback para códigos desconhecidos.
- [x] AC5: Serialização é JSON-safe, preserva metadata e propriedades próprias
  de erros, trata circular refs, BigInt, function, symbol, Date, RegExp, Map e
  Set, e redige stack por padrão.
- [x] AC6: Normalização encapsula erros genéricos sem perder `cause`,
  propriedades próprias ou overrides de metadata.
- [x] AC7: Nenhuma política silenciosa de hook, saída CLI ou exit code existente
  é alterada nesta story.
- [x] AC8: Testes focados passam.

## Tasks

- [x] T1: Criar ADR e story/epic locais.
- [x] T2: Implementar constantes, registry, classe de erro, serialização e
  normalização.
- [x] T3: Criar testes unitários focados.
- [x] T4: Rodar suíte focada e gates disponíveis.
- [x] T5: Atualizar Dev Agent Record e preparar PR.

## Dev Agent Record

### Debug Log

- Branch: `feature/issue-701-error-governance-contract`.
- Base: `origin/main` em `be760026`.
- Issue fonte: #701.
- `npm test -- --runTestsByPath tests/core/errors/error-registry.test.js tests/core/errors/aiox-error.test.js tests/core/errors/serializer.test.js` passou com 14 testes.
- `npx eslint .aiox-core/core/errors tests/core/errors` passou sem erros.
- `npm run typecheck` passou.
- `npm run lint` passou com 0 erros e 114 warnings preexistentes de trailing comma fora do escopo.
- `npm test -- --runInBand` executou a suíte completa: 328 suites passaram, 6 falharam, 11 foram skipped; 8357 testes passaram, 9 falharam, 149 foram skipped. Falhas observadas fora do novo módulo de errors: timeouts em testes de installer/wizard/squad generator, threshold de performance `105ms < 100ms`, e `entity-registry.yaml updatedAt` com mtime antigo.
- Após emitir o resumo, o Jest ficou preso por handles abertos; o processo foi encerrado manualmente para não deixar sessão ativa.
- O hook de commit regenerou `.aiox-core/install-manifest.yaml` e incluiu os seis novos arquivos de core no manifest.
- O hook IDS também gerou uma alteração local em `.aiox-core/data/entity-registry.yaml`, mas ela foi descartada por colidir a chave `index` do registro existente com o novo `core/errors/index.js`; essa correção do gerador deve ser tratada separadamente antes de registrar o novo módulo no entity registry.
- O gerador IDS foi corrigido para preservar IDs de basename existentes e criar IDs escopados por path apenas em colisões; `.aiox-core/core/errors/index.js` passou a registrar como `errors-index`, preservando `.aiox-core/core/index.js` como `index`.
- `node .aiox-core/core/ids/registry-updater.js --files ...` processou 8 updates e registrou o módulo de errors no entity registry incrementalmente.
- `npm test -- --runTestsByPath tests/core/ids/populate-entity-registry.test.js tests/core/ids/registry-updater.test.js tests/core/errors/error-registry.test.js tests/core/errors/aiox-error.test.js tests/core/errors/serializer.test.js --runInBand` passou com 128 testes.
- `npm run validate:manifest` passou.
- Os failures anteriores foram reexecutados isoladamente e passaram: `entity-registry-bootstrap`, `squad-generator`, `aiox-install integration`, `wizard-ide-flow`, `squad-generator-integration` e `ide-config-generator`.
- `npm test -- --runInBand` passou: 334 suites passaram, 11 skipped; 8372 testes passaram, 149 skipped. Após o resumo verde, o Jest ainda manteve handles abertos e o processo foi encerrado manualmente para não deixar sessão ativa.
- O primeiro comando `npm test -- tests/core/errors` não encontrou testes por interpretação de pattern do Jest; a validação correta foi refeita com `--runTestsByPath`.
- O primeiro patch foi aplicado no cwd da sessão (`sinkra-hub`) por engano; os arquivos foram movidos para `aiox-core` e os leftovers criados no `sinkra-hub` foram removidos.

### Completion Notes

- Implementação inicial concluiu o contrato canônico sem migrar call-sites existentes.
- `AIOXError` e `ErrorRegistry` nasceram em `.aiox-core/core/errors/` com helpers de serialização, normalização e metadata JSON-safe.
- Não houve alteração de hooks, CLI output ou exit codes existentes.
- `entity-registry.yaml` agora referencia o novo barrel como `errors-index` sem sobrescrever o registro existente de `.aiox-core/core/index.js`.
- Gates locais estão verdes; publicação/merge ainda não foi executada nesta etapa.

### File List

| File | Action |
|------|--------|
| `docs/architecture/adr/ADR-ERROR-GOVERNANCE-CONTRACT.md` | Created |
| `docs/stories/epic-error-governance/EPIC-AIOX-ERROR-GOVERNANCE.md` | Created |
| `docs/stories/epic-error-governance/STORY-AIOX-ERROR.1-CORE-CONTRACT.md` | Created |
| `.aiox-core/core/errors/constants.js` | Created |
| `.aiox-core/core/errors/utils.js` | Created |
| `.aiox-core/core/errors/error-registry.js` | Created |
| `.aiox-core/core/errors/serializer.js` | Created |
| `.aiox-core/core/errors/aiox-error.js` | Created |
| `.aiox-core/core/errors/index.js` | Created |
| `.aiox-core/core/ids/registry-updater.js` | Updated |
| `.aiox-core/development/scripts/populate-entity-registry.js` | Updated |
| `.aiox-core/data/entity-registry.yaml` | Updated |
| `.aiox-core/install-manifest.yaml` | Updated |
| `tests/core/errors/error-registry.test.js` | Created |
| `tests/core/errors/aiox-error.test.js` | Created |
| `tests/core/errors/serializer.test.js` | Created |
| `tests/core/ids/populate-entity-registry.test.js` | Updated |
| `tests/core/ids/registry-updater.test.js` | Updated |

### Change Log

| Data | Agente | Mudança |
|------|--------|---------|
| 2026-05-08 | Codex | Story criada para implementação inicial do contrato de Error Governance de #701. |
| 2026-05-08 | Codex | Contrato `AIOXError`/`ErrorRegistry` implementado com testes focados e lint de escopo verde. |
| 2026-05-08 | Codex | Corrigida colisão de ID do entity registry e suíte completa validada verde. |
