# Story NOG-2: Entity Registry Live Enrichment

## Metadata
- **Story ID:** NOG-2
- **Epic:** Code Intelligence Integration (Provider-Agnostic)
- **Status:** Done
- **Priority:** P0 - Blocker
- **Points:** 5
- **Agent:** @dev (Dex) + @aios-master
- **Blocked By:** NOG-0, NOG-1
- **Blocks:** NOG-8
- **Created:** 2026-02-15
- **Updated:** 2026-02-16 (v3.0 — PO validation auto-fix)

---

## Executor Assignment

```yaml
executor: "@dev"
quality_gate: "@architect"
quality_gate_tools:
  - code-review
  - pattern-compliance
  - data-integrity-review
```

---

## Story

**As a** AIOS framework maintainer,
**I want** the Entity Registry automatically enriched with real `usedBy`, `dependencies`, and `codeIntelMetadata` from code intelligence providers,
**so that** the IDS gates (especially G4) can suggest reuse based on actual code relationships instead of empty arrays.

---

## Description

Enriquecer o Entity Registry (496 entidades) com dados reais de relacionamento via code intelligence. Atualmente quase todas as entidades tem `usedBy: []` — os providers podem preencher isso automaticamente via `findReferences` e `analyzeDependencies`.

### Problem

O Entity Registry tem 496 entidades mas os campos `usedBy` e `dependencies` estao majoritariamente vazios. O IDS (REUSE > ADAPT > CREATE) depende desses dados para funcionar — sem eles, o gate G4 nao consegue sugerir reuso.

### Solution

1. Criar task `*sync-registry-intel` no @aios-master que enriquece o registry
2. Enriquecer campos `usedBy`, `dependencies`, `keywords` usando code intelligence
3. Adicionar novo campo `codeIntelMetadata` com dados extras (importance, callers, role)
4. Executar como operacao batch + incremental (sob demanda)

---

## Acceptance Criteria

### AC1: Registry Sync Command
- [ ] **Given** @aios-master tem comando `*sync-registry-intel`
- [ ] **When** executado
- [ ] **Then** itera sobre entidades do registry, consulta code intelligence para cada uma, atualiza usedBy/dependencies/keywords

### AC2: usedBy Population
- [ ] **Given** entidade "dev-develop-story" no registry
- [ ] **When** sync executado
- [ ] **Then** campo `usedBy` contem lista de entities que referenciam este arquivo (via findReferences)

### AC3: Dependencies Population
- [ ] **Given** entidade com modulo JS no registry
- [ ] **When** sync executado
- [ ] **Then** campo `dependencies` contem lista de imports/requires reais (via analyzeDependencies)

### AC4: Code Intel Metadata
- [ ] **Given** entidade enriquecida
- [ ] **When** consultada
- [ ] **Then** campo `codeIntelMetadata` contem: `{ callerCount, role, lastSynced, provider }`

### AC5: Fallback sem Provider
- [ ] **Given** NENHUM provider de code intelligence disponivel
- [ ] **When** `*sync-registry-intel` e executado
- [ ] **Then** exibe mensagem "No code intelligence provider available, skipping enrichment" e NAO modifica o registry

### AC6: Incremental Sync
- [ ] **Given** registry ja foi sincronizado anteriormente
- [ ] **When** sync executado novamente (sem flag `--full`)
- [ ] **Then** apenas entidades cujo arquivo de origem tem mtime mais recente que `codeIntelMetadata.lastSynced` sao re-processadas (mtime obtido via `fs.statSync()`)
- [ ] **AND** entidades sem `lastSynced` sao tratadas como novas (processadas)
- [ ] **AND** flag `--full` forca reprocessamento de todas as entidades

### AC7: Full Resync
- [ ] **Given** comando `*sync-registry-intel --full` executado
- [ ] **When** provider disponivel
- [ ] **Then** todas as 496+ entidades sao re-processadas independente de lastSynced

---

## Tasks / Subtasks

- [x] 1. Criar script `.aios-core/core/code-intel/registry-syncer.js` (AC: #1)
  - [x] 1.1 Importar `getClient()` de code-intel/index.js e `RegistryLoader` de ids/registry-loader.js
  - [x] 1.2 Classe `RegistrySyncer` com metodos `sync(options)` e `syncEntity(entity)`
- [x] 2. Implementar batch enrichment — iterar entidades do registry (AC: #1, #7)
  - [x] 2.1 Carregar registry via `RegistryLoader.load()`
  - [x] 2.2 Iterar `Object.entries(registry.entities)` com progress logging
  - [x] 2.3 Salvar registry atualizado via YAML dump atomico (write temp + rename)
- [x] 3. Implementar `usedBy` population via `findReferences` (AC: #2)
  - [x] 3.1 Para cada entidade com `source`, chamar `client.findReferences(entityName)`
  - [x] 3.2 Mapear resultados para lista de entity IDs (cross-reference com registry)
- [x] 4. Implementar `dependencies` population via `analyzeDependencies` (AC: #3)
  - [x] 4.1 Para entidades JS/TS, chamar `client.analyzeDependencies(sourcePath)`
  - [x] 4.2 Filtrar apenas dependencias internas ao projeto
- [x] 5. Implementar campo `codeIntelMetadata` no schema do registry (AC: #4)
  - [x] 5.1 Adicionar `codeIntelMetadata: { callerCount, role, lastSynced, provider }` por entidade
  - [x] 5.2 `role` inferido de: task/template/agent/workflow/script baseado no path
- [x] 6. Implementar incremental sync (AC: #6)
  - [x] 6.1 Obter mtime do arquivo via `fs.statSync(source).mtimeMs`
  - [x] 6.2 Comparar com `codeIntelMetadata.lastSynced` — skip se arquivo nao mudou
  - [x] 6.3 Entidades sem `lastSynced` sempre processadas
- [x] 7. Implementar flag `--full` para forcar full resync (AC: #7)
- [x] 8. Implementar fallback — detectar provider via `isCodeIntelAvailable()` antes de iniciar (AC: #5)
- [x] 9. Adicionar comando `*sync-registry-intel` ao @aios-master (AC: #1)
- [x] 10. Escrever testes unitarios (AC: #1-#7)
  - [x] 10.1 Teste batch com mock provider (happy path)
  - [x] 10.2 Teste usedBy population com mock findReferences
  - [x] 10.3 Teste dependencies population com mock analyzeDependencies
  - [x] 10.4 Teste incremental sync (skip entidade nao modificada)
  - [x] 10.5 Teste full resync (processa todas)
  - [x] 10.6 Teste fallback sem provider (nenhuma modificacao)
  - [x] 10.7 Teste codeIntelMetadata schema
- [x] 11. Adaptar `RegistryLoader` para expor/consumir `codeIntelMetadata` em queries (AC: #4)
  - [x] 11.1 Metodo `getEntityWithIntel(id)` retorna entidade + codeIntelMetadata
  - [x] 11.2 `findByKeyword()` considera `codeIntelMetadata.role` como filtro opcional
- [x] 12. Registrar novas entidades no entity-registry.yaml (registry-syncer)

---

## Scope

**IN:**
- Registry syncer script
- usedBy, dependencies enrichment
- codeIntelMetadata field
- Incremental sync (mtime-based)
- Full resync (`--full` flag)
- @aios-master command
- RegistryLoader adaptations
- Testes unitarios

**OUT:**
- Alteracao do schema base do entity-registry (apenas adicionar campos)
- Dashboard de visualizacao
- Sync automatico (sempre sob demanda)
- Novos providers (usa os existentes de NOG-1)

---

## Risks

| Risco | Prob. | Impacto | Mitigacao |
|-------|-------|---------|-----------|
| Registry corruption em falha no meio do batch | Media | Alto | Write atomico: dump para temp file + rename. Backup do registry antes do sync |
| Performance ao iterar 496+ entidades com provider call por entidade | Media | Medio | Batch com throttle; session cache do code-intel-client evita re-queries; incremental sync reduz volume |
| Provider timeout em operacoes em massa (findReferences x 496) | Baixa | Medio | Circuit breaker do code-intel-client ja protege; log warning e skip entidade com timeout |
| Stale data se arquivo de origem for movido/renomeado | Baixa | Baixo | `fs.statSync` com try/catch — se arquivo nao existe, limpar codeIntelMetadata da entidade |
| Registry YAML grow excessivo com codeIntelMetadata | Baixa | Baixo | Manter apenas campos essenciais (callerCount, role, lastSynced, provider); nao guardar raw results |

---

## Definition of Done

- [x] `registry-syncer.js` criado com sync batch e incremental
- [x] `usedBy` populado via `findReferences` para entidades com source
- [x] `dependencies` populado via `analyzeDependencies` para modulos JS/TS
- [x] `codeIntelMetadata` adicionado por entidade enriquecida
- [x] Incremental sync funcional (mtime vs lastSynced comparison)
- [x] Full resync via `--full` flag funcional
- [x] Fallback graceful: 0 modificacoes quando nenhum provider disponivel
- [x] Comando `*sync-registry-intel` registrado no @aios-master
- [x] `RegistryLoader` adaptado para consumir codeIntelMetadata
- [x] Testes unitarios passando (>80% coverage no registry-syncer.js)
- [x] Entidade `registry-syncer` registrada no entity-registry.yaml
- [x] Write atomico implementado (temp + rename, sem corrupcao parcial)

---

## Dev Notes

### Source Tree Relevante

```
aios-core/
├── .aios-core/
│   ├── core/
│   │   ├── code-intel/
│   │   │   ├── index.js                # IMPORT — getClient(), isCodeIntelAvailable()
│   │   │   ├── code-intel-client.js     # IMPORT — findReferences(), analyzeDependencies()
│   │   │   └── registry-syncer.js       # CREATE — modulo principal desta story
│   │   └── ids/
│   │       └── registry-loader.js       # MODIFY — consumir codeIntelMetadata
│   └── data/
│       └── entity-registry.yaml         # MODIFY — enrichment dos campos por entidade
├── .aios-core/development/
│   └── agents/
│       └── aios-master.md               # MODIFY — adicionar comando *sync-registry-intel
└── tests/
    └── code-intel/
        └── registry-syncer.test.js      # CREATE — testes do modulo
```

### Contexto de NOG-1 (Predecessor — Done)

- **code-intel-client.js** expoe 8 capabilities primitivas via `getClient()`
- **Capabilities usadas nesta story:**
  - `findReferences(symbol, options)` — retorna array de locations ou null (fallback)
  - `analyzeDependencies(path, options)` — retorna dependency graph ou null (fallback)
- **isCodeIntelAvailable()** — retorna boolean; usar para fallback check antes de iniciar sync
- **Session cache** built-in (TTL 5min) — queries repetidas nao batem no provider
- **Circuit breaker** built-in (threshold 3, reset 60s) — protege contra cascade failures
- **CommonJS**: Usar `require()` / `module.exports` (padrao do projeto)

### Contexto do Registry Loader

- **Classe:** `RegistryLoader` em `.aios-core/core/ids/registry-loader.js`
- **Metodo principal:** `load()` — retorna `{ metadata, entities, categories }`
- **Entities:** `Map<string, EntityObject>` — key = entity ID
- **Path:** `DEFAULT_REGISTRY_PATH = .aios-core/data/entity-registry.yaml`
- **Parser:** `js-yaml` (YAML → JS objects)

### Padrao de Import

```javascript
// Code Intel Client
const { getClient, isCodeIntelAvailable } = require('../code-intel');

// Registry Loader
const { RegistryLoader } = require('../ids/registry-loader');
```

### Nota sobre sourceMtime

O campo `sourceMtime` NAO existe no registry atual. O incremental sync deve calcular o mtime on-the-fly via `fs.statSync(entity.source).mtimeMs` e comparar com `codeIntelMetadata.lastSynced` (timestamp ISO armazenado por entidade). Se a entidade nao tem `source` ou o arquivo nao existe, skip silencioso com warning no log.

### Testing

**Framework:** Jest (padrao do projeto)
**Location:** `tests/code-intel/`
**Naming:** `registry-syncer.test.js`

**Cenarios de teste:**

| # | Cenario | Tipo | AC Ref | Esperado |
|---|---------|------|--------|----------|
| T1 | Sync batch com mock provider | Unit | AC1 | Todas entidades processadas, usedBy/deps preenchidos |
| T2 | usedBy population via findReferences | Unit | AC2 | Campo usedBy populado com entity IDs |
| T3 | Dependencies population via analyzeDependencies | Unit | AC3 | Campo dependencies populado com imports |
| T4 | codeIntelMetadata schema correto | Unit | AC4 | { callerCount, role, lastSynced, provider } |
| T5 | Fallback sem provider — 0 modificacoes | Unit | AC5 | Registry inalterado, mensagem exibida |
| T6 | Incremental sync — skip entidade nao modificada | Unit | AC6 | Entidade com lastSynced > mtime nao processada |
| T7 | Incremental sync — processa entidade sem lastSynced | Unit | AC6 | Entidade nova processada |
| T8 | Full resync — processa todas independente de mtime | Unit | AC7 | Todas 496+ processadas |
| T9 | Write atomico — temp file + rename | Unit | — | Sem corrupcao em falha simulada |
| T10 | Entidade sem source — skip com warning | Unit | AC6 | Warning logged, entidade nao processada |

**Mocking:** Mock code-intel-client e registry-loader. Nao depender de Code Graph MCP real nos testes.

---

## Technical Notes

### codeIntelMetadata Schema

```yaml
# Adicionado por entidade apos enrichment
codeIntelMetadata:
  callerCount: 5          # Numero de callers/references encontrados
  role: "task"            # Inferido do path: task|template|agent|workflow|script|module|config
  lastSynced: "2026-02-16T10:30:00Z"  # ISO timestamp do ultimo sync
  provider: "code-graph"  # Provider usado no sync
```

### Role Inference Map

```javascript
// Order matters: more specific patterns first (e.g., /data/ before /core/)
const ROLE_MAP = [
  ['tasks/', 'task'],
  ['templates/', 'template'],
  ['agents/', 'agent'],
  ['workflows/', 'workflow'],
  ['scripts/', 'script'],
  ['/data/', 'config'],
  ['/core/', 'module'],
];
```

### Write Atomico Pattern

```javascript
// Previne corrupcao em caso de falha no meio do write
const tmpPath = registryPath + '.tmp';
fs.writeFileSync(tmpPath, yaml.dump(registry));
fs.renameSync(tmpPath, registryPath);  // Atomico no mesmo filesystem
```

---

## CodeRabbit Integration

### Story Type Analysis

**Primary Type**: Code/Features/Logic
**Secondary Type(s)**: Data Processing (registry enrichment batch)
**Complexity**: Medium

### Specialized Agent Assignment

**Primary Agents**:
- @dev: Implementation of registry-syncer, tests, and registry-loader adaptations

**Supporting Agents**:
- @architect: Quality gate review (data integrity, pattern compliance)

### Quality Gate Tasks

- [ ] Pre-Commit (@dev): Run before marking story complete
- [ ] Pre-PR (@devops): Run before creating pull request

### Self-Healing Configuration

**Expected Self-Healing**:
- Primary Agent: @dev (light mode)
- Max Iterations: 2
- Timeout: 15 minutes
- Severity Filter: CRITICAL only

**Predicted Behavior**:
- CRITICAL issues: auto_fix (2 iterations max)
- HIGH issues: document_as_debt

### CodeRabbit Focus Areas

**Primary Focus**:
- Data integrity during batch enrichment (atomic writes, no partial corruption)
- Incremental sync correctness (mtime comparison logic)
- Fallback behavior (zero modifications without provider)

**Secondary Focus**:
- Registry YAML size growth management
- Error handling in entity iteration (skip failures, continue batch)

---

## File List

| File | Action |
|------|--------|
| `.aios-core/core/code-intel/registry-syncer.js` | Create |
| `.aios-core/core/ids/registry-loader.js` | Modify (consume codeIntelMetadata) |
| `.aios-core/data/entity-registry.yaml` | Modify (enrichment) |
| `.aios-core/development/agents/aios-master.md` | Modify (add command) |
| `tests/code-intel/registry-syncer.test.js` | Create |

---

## Dev Agent Record

_Populated by @dev during implementation._

### Agent Model Used
Claude Opus 4.6

### Debug Log References
- No debug issues encountered

### Completion Notes List
- All 12 tasks implemented and tested (20/20 tests passing)
- ROLE_MAP changed from Object to ordered Array to fix path matching precedence (`/data/` vs `core/` in `.aios-core`)
- RegistryLoader extended with `getEntityWithIntel(id)` and `findByKeyword(keywords, options)` — additive changes only
- Atomic write pattern implemented (temp + rename) for registry corruption prevention
- 92/92 total code-intel tests passing (no regressions)

### File List (Implementation)

| File | Action | Description |
|------|--------|-------------|
| `.aios-core/core/code-intel/registry-syncer.js` | Created | Main module: RegistrySyncer class with sync/syncEntity/atomic write |
| `.aios-core/core/ids/registry-loader.js` | Modified | Added getEntityWithIntel() and findByKeyword() methods |
| `.aios-core/data/entity-registry.yaml` | Modified | Added registry-syncer entity in modules section |
| `.aios-core/development/agents/aios-master.md` | Modified | Added *sync-registry-intel command and task dependency |
| `.aios-core/development/tasks/sync-registry-intel.md` | Created | Task definition for the sync command |
| `tests/code-intel/registry-syncer.test.js` | Created | 20 unit tests covering all ACs (T1-T10) |

---

## QA Results

**Reviewer:** Quinn (@qa) | **Date:** 2026-02-16 | **Model:** Claude Opus 4.6

### Gate Decision: CONCERNS

**Score: 6/7 checks passed** — Aprovado com observacoes documentadas.

### Acceptance Criteria Verification

| AC | Status | Evidence |
|----|--------|----------|
| AC1: Registry Sync Command | PASS | `RegistrySyncer.sync()` iterates all entities, `*sync-registry-intel` registered in aios-master.md with task dependency |
| AC2: usedBy Population | PASS | `_findUsedBy()` calls `client.findReferences()`, cross-references with registry, deduplicates via `Set`. Tests T2 verify. |
| AC3: Dependencies Population | PASS | `_findDependencies()` calls `client.analyzeDependencies()` for JS/TS files only, filters internal deps. Tests T3 verify. |
| AC4: Code Intel Metadata | PASS | `codeIntelMetadata: { callerCount, role, lastSynced, provider }` set per entity. Tests T4 verify schema. |
| AC5: Fallback sem Provider | PASS | `_isProviderAvailable()` check before sync, returns `{ aborted: true }`, zero writes. Test T5 verifies. |
| AC6: Incremental Sync | PASS | `_shouldSkipIncremental()` compares `fs.statSync().mtimeMs` vs `lastSynced`. Entities without `lastSynced` always processed. Tests T6/T7. |
| AC7: Full Resync | PASS | `isFull` flag bypasses incremental check, all entities processed. Test T8 verifies. |

### Test Results

- **20/20 tests passing** (`tests/code-intel/registry-syncer.test.js`)
- **92/92 code-intel suite passing** (no regressions)
- Covers: T1-T10 + inferRole + getStats

### Code Quality Analysis

| Check | Status | Notes |
|-------|--------|-------|
| Code review | PASS | Clean, well-documented, follows project CommonJS patterns |
| Unit tests | PASS | 20 tests, all ACs covered with mock injection |
| Acceptance criteria | PASS | All 7 ACs met |
| No regressions | PASS | 92/92 code-intel tests, no breakage |
| Performance | PASS | Incremental sync + session cache mitigate batch overhead |
| Security | PASS | No user input, no injection vectors, atomic writes |
| Documentation | CONCERNS | Minor doc mismatch (see below) |

### Issues Found

| # | Severity | Category | Description | Recommendation |
|---|----------|----------|-------------|----------------|
| 1 | LOW | code | `client._activeProvider` (line 172) accesses private member of CodeIntelClient for provider name | Consider exposing a public `getProviderName()` method on CodeIntelClient. Not blocking — current usage is read-only. |
| 2 | LOW | code | `_findEntityByPath()` uses `normalized.includes(entityData.path)` substring match which could theoretically false-match (e.g., `tasks/dev.md` matching `tasks/dev.md.bak`) | Low risk given registry paths are specific. Consider exact suffix match in future. |
| 3 | LOW | docs | Story Technical Notes section shows `ROLE_MAP` as Object but implementation correctly uses ordered Array of tuples | Update story docs to reflect actual implementation. Non-blocking. |
| 4 | LOW | data | New `registry-syncer` entity in entity-registry.yaml missing `checksum` field (other entities have it) | Generate and add `checksum: sha256:...` for consistency. Non-blocking. |

### Verdict Rationale

Implementacao solida que atende todos os 7 ACs com cobertura de testes adequada. As 4 observacoes sao LOW severity e nao bloqueiam merge. O padrao de atomic write esta bem implementado e protege contra corrupcao. A correcao do ROLE_MAP de Object para Array ordenado foi uma decisao acertada para resolver precedencia de path matching.

— Quinn, guardiao da qualidade

---

## Change Log

| Date | Author | Change |
|------|--------|--------|
| 2026-02-15 | @devops | Story created (v1.0 — Nogic-specific) |
| 2026-02-15 | @architect | Rewrite v2.0 — provider-agnostic |
| 2026-02-15 | @po | v2.1 — Specified incremental sync criteria (sourceMtime vs lastSynced), added --full flag, AC7 |
| 2026-02-16 | @po (Pax) | v3.0 — Auto-fix: Executor Assignment, Story format, Risks, Definition of Done, Dev Notes (Source Tree, NOG-1 context, Registry Loader context, Testing cenarios), CodeRabbit Integration, Task-AC mapping with subtasks, Dev Agent Record/QA Results placeholders, sourceMtime clarification (fs.statSync on-the-fly), Task 10→11 refactored to concrete RegistryLoader adaptations |
| 2026-02-16 | @po (Pax) | Status: Draft → Ready (validation GO 10/10, 8 issues auto-fixed) |
| 2026-02-16 | @dev (Dex) | Implementation complete: all 12 tasks done, 20/20 tests passing, 92/92 code-intel suite passing. Status → Ready for Review |
| 2026-02-16 | @qa (Quinn) | QA Review: CONCERNS (approved). 7/7 ACs passed. 4 LOW severity observations documented. |
| 2026-02-16 | @devops (Gage) | PR #171 created, CodeRabbit 7 issues fixed, CI green. Merged to main (squash, commit c4b68ccf). |
| 2026-02-16 | @po (Pax) | Story closed: Status → Done. Epic index updated. |
