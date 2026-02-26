# Story NOG-8: Squad Creator with Codebase Awareness

## Metadata
- **Story ID:** NOG-8
- **Epic:** Code Intelligence Integration (Provider-Agnostic)
- **Status:** Done
- **Priority:** P3 - Low
- **Points:** 3
- **Agent:** @dev (Dex)
- **Blocked By:** NOG-1, NOG-2
- **Created:** 2026-02-15
- **Updated:** 2026-02-21 (v5.0 — Implementation complete)

---

## Executor Assignment

```yaml
executor: "@dev"
quality_gate: "@architect"
quality_gate_tools:
  - code-review
  - pattern-compliance
  - template-integration-review
```

---

## Story

**As a** squad-creator agent (and any agent creating new artefacts),
**I want** code intelligence integrated into artefact creation templates (agents, tasks) and entity auto-registration,
**so that** newly created artefacts are aligned with existing codebase patterns, duplicates are detected before creation, and entity registry entries are pre-populated with real dependency data — all with graceful fallback when no provider is available.

---

## Description

Enriquecer o squad-creator e as tasks de criacao de agentes, tasks e workflows com awareness do codebase, para que novos artefatos criados ja estejam alinhados com patterns, convencoes e estrutura existente.

### Tasks Impactadas

| Task/Template | Capabilities Usadas | Integracao |
|--------------|---------------------|-----------|
| `agent-template.md` | describeProject, getConventions | Novo agente alinhado com patterns |
| `task-template.md` | findReferences, detectDuplicates | Nova task nao duplica existente |
| Entity registration | findReferences, analyzeDependencies | Auto-preencher usedBy/dependencies |

### Contexto do Helper Pattern

Esta story segue o pattern estabelecido por NOG-3 (dev-helper), NOG-4 (qa-helper), NOG-6 (story-helper) e NOG-7 (devops-helper): criar um helper especifico (`creation-helper.js`) que consome a API do `code-intel` module via `getEnricher()` / `getClient()` / `isCodeIntelAvailable()`. Todas as funcoes retornam `null` gracefully quando provider indisponivel. Adicionalmente, cria um template de integracao (`code-intel-integration-pattern.md`) que padroniza como qualquer dev futuro integra code intelligence em novas tasks.

---

## Acceptance Criteria

### AC1: Agent Creation com Codebase Context
- [x] **Given** squad-creator cria novo agente
- [x] **When** provider disponivel
- [x] **Then** agente criado inclui awareness do codebase (project structure, patterns, conventions)

### AC2: Task Creation com Duplicate Check
- [x] **Given** nova task sendo criada
- [x] **When** provider disponivel e `detectDuplicates` encontra task similar
- [x] **Then** aviso: "Similar task exists: {task-name}. Consider extending instead of creating"

### AC3: Auto-Registration com Enrichment
- [x] **Given** novo artefato criado (agente, task, workflow)
- [x] **When** registrado no Entity Registry
- [x] **Then** se provider disponivel, `usedBy` e `dependencies` pre-populados automaticamente

### AC4: Integration Pattern Template
- [x] **Given** template `code-intel-integration-pattern.md` existe
- [x] **When** qualquer dev integra code intelligence em nova task
- [x] **Then** segue pattern padronizado: import → isCodeIntelAvailable → enrich → fallback

### AC5: Fallback em Todas as Integracoes
- [x] **Given** NENHUM provider disponivel
- [x] **When** qualquer artefato criado
- [x] **Then** criacao funciona 100% como hoje, sem erros

---

## Tasks / Subtasks

- [x] 1. Criar helper `.aios-core/core/code-intel/helpers/creation-helper.js` (AC: #1, #2, #3)
  - [x] 1.1 Implementar `getCodebaseContext()` — chama `describeProject()` + `getConventions()`, retorna project structure/patterns para enriquecer agent creation
  - [x] 1.2 Implementar `checkDuplicateArtefact(name, description)` — chama `detectDuplicates()` + `findReferences()`, retorna warning se artefato similar existe
  - [x] 1.3 Implementar `enrichRegistryEntry(entityName, entityPath)` — chama `findReferences()` + `analyzeDependencies()`, retorna `{ usedBy, dependencies }` pre-populados
  - [x] 1.4 Todas as funcoes retornam null gracefully se provider indisponivel (AC: #5)
- [x] 2. Criar template `.aios-core/development/templates/code-intel-integration-pattern.md` (AC: #4)
  - [x] 2.1 Documentar pattern padrao: import → isCodeIntelAvailable guard → enrich → fallback
  - [x] 2.2 Incluir exemplo completo baseado nos helpers existentes (dev-helper, qa-helper, story-helper, devops-helper)
  - [x] 2.3 Incluir secao de testing pattern (mock strategy, fallback tests)
- [x] 3. Modificar `agent-template.md` — secao Code Intelligence Context opcional (AC: #1, #5)
  - [x] 3.1 Adicionar secao opcional `## Code Intelligence Context` com placeholder para codebase awareness
  - [x] 3.2 Incluir instrucao condicional: "Se code intelligence disponivel, pre-popular com project patterns e conventions"
  - [x] 3.3 Garantir template funciona identicamente sem a secao (fallback graceful)
- [x] 4. Modificar `task-template.md` — secao Code Intelligence Check opcional (AC: #2, #5)
  - [x] 4.1 Adicionar step opcional `## Code Intelligence Duplicate Check` no inicio da task
  - [x] 4.2 Incluir instrucao condicional: "Se code intelligence disponivel, verificar se task similar existe"
  - [x] 4.3 Garantir template funciona identicamente sem o step (fallback graceful)
- [x] 5. Implementar auto-registration com enrichment no entity-registry (AC: #3, #5)
  - [x] 5.1 Identificar ponto de integracao: squad-creator agent registration flow (`.aios-core/development/agents/squad-creator.md` → entity-registry write in `.aios-core/data/entity-registry.yaml`) e/ou `registry-syncer` se existir
  - [x] 5.2 Chamar `enrichRegistryEntry()` durante registro de novos artefatos
  - [x] 5.3 Pre-popular `usedBy` e `dependencies` no YAML de registro quando dados disponiveis
  - [x] 5.4 Fallback: registro continua normalmente com campos vazios se provider indisponivel
- [x] 6. Escrever testes unitarios para creation-helper.js (AC: #1, #2, #3, #4, #5)
  - [x] 6.1 Testes com provider mockado (happy path — 3 funcoes com dados retornados)
  - [x] 6.2 Testes sem provider (fallback graceful — retorna null para todas as funcoes)
  - [x] 6.3 Testes de edge cases: input vazio, provider error, partial results
  - [x] 6.4 Teste de integracao: enrichRegistryEntry com dados reais vs sem provider

---

## Scope

**IN:**
- Helper `creation-helper.js` com funcoes de code intelligence para squad-creator
- Template `code-intel-integration-pattern.md` com pattern padronizado
- Modificacao de `agent-template.md` — secao Code Intelligence Context opcional
- Modificacao de `task-template.md` — secao Code Intelligence Duplicate Check opcional
- Integracao de auto-enrichment no fluxo de registro de entidades
- Testes unitarios para creation-helper.js
- Fallback graceful em todas as integracoes

**OUT:**
- Modificacao de outros helpers (dev-helper, qa-helper, etc.) — stories NOG-3 a NOG-7
- Modificacao de tasks de outros agentes (@dev, @qa, @sm, etc.)
- Novos providers de code intelligence
- UI/Dashboard para code intelligence
- Modificacao do code-intel-client ou enricher (consumo apenas)
- Workflow templates (workflow-template.yaml) — pode ser adicionado em sprint futuro
- Checklist/data/script templates — fora do escopo do MVP

---

## Risks

| Risco | Prob. | Impacto | Mitigacao |
|-------|-------|---------|-----------|
| Modificacao de templates quebra squad-creator existente | Media | Alto | Secoes code intel sao OPCIONAIS (condicionais); templates funcionam identicamente sem elas |
| Auto-enrichment adiciona latencia ao registro de entidades | Baixa | Medio | Timeout 5s (herdado do client); skip se provider indisponivel |
| Pattern template fica desatualizado conforme helpers evoluem | Media | Baixo | Template referencia helpers reais; atualizado em sprints futuros se necessario |
| `checkDuplicateArtefact` gera falsos positivos | Media | Medio | Exibir como warning advisory (nao blocker); incluir link para artefato similar |

---

## Definition of Done

- [x] `creation-helper.js` criado com 3 funcoes (getCodebaseContext, checkDuplicateArtefact, enrichRegistryEntry)
- [x] Todas as funcoes retornam null gracefully sem provider (0 throws)
- [x] `code-intel-integration-pattern.md` criado com pattern documentado e exemplos
- [x] `agent-template.md` tem secao Code Intelligence Context opcional e funcional
- [x] `task-template.md` tem secao Code Intelligence Duplicate Check opcional e funcional
- [x] Auto-registration enrichment funcional quando provider disponivel
- [x] Testes unitarios passando (>80% coverage no creation-helper.js)
- [x] Nenhuma regressao nos templates modificados (funcionam identicamente sem provider)
- [x] Entidades registradas no entity-registry.yaml

---

## Dev Notes

### Source Tree Relevante

```
aios-core/
├── .aios-core/
│   ├── core/
│   │   └── code-intel/
│   │       ├── index.js                    # Public API (getEnricher, getClient, isCodeIntelAvailable)
│   │       ├── code-intel-client.js        # 8 primitive capabilities + circuit breaker + cache
│   │       ├── code-intel-enricher.js      # 5 composite capabilities (detectDuplicates, assessImpact, etc.)
│   │       ├── providers/
│   │       │   ├── provider-interface.js   # Abstract contract
│   │       │   └── code-graph-provider.js  # Code Graph MCP adapter
│   │       └── helpers/
│   │           ├── dev-helper.js           # Reference pattern (NOG-3)
│   │           ├── qa-helper.js            # NOG-4
│   │           ├── planning-helper.js      # NOG-5
│   │           ├── story-helper.js         # NOG-6
│   │           ├── devops-helper.js        # NOG-7
│   │           └── creation-helper.js      # Create — THIS STORY
│   ├── data/
│   │   └── entity-registry.yaml           # Modify — add creation-helper entity
│   └── development/
│       └── templates/
│           ├── code-intel-integration-pattern.md  # Create — pattern template
│           └── squad/
│               ├── agent-template.md       # Modify — add Code Intelligence Context section
│               └── task-template.md        # Modify — add Code Intelligence Duplicate Check
└── tests/
    └── code-intel/
        ├── dev-helper.test.js             # Reference test pattern (NOG-3)
        ├── story-helper.test.js           # Reference test pattern (NOG-6)
        ├── devops-helper.test.js          # Reference test pattern (NOG-7)
        └── creation-helper.test.js        # Create — testes do helper
```

### Contexto de NOG-1 (Infrastructure — Done)

O modulo `code-intel` esta completo e funcional. API principal para consumo nesta story:

```javascript
// Importar via index.js
const { getEnricher, getClient, isCodeIntelAvailable } = require('.aios-core/core/code-intel');

// Verificar disponibilidade (OBRIGATORIO antes de chamar)
if (isCodeIntelAvailable()) {
  const enricher = getEnricher();

  // Composite capabilities usadas nesta story
  const project = await enricher.describeProject('.');
  // → { codebase: {...}, stats: {...} } ou null

  const conventions = await enricher.getConventions('.');
  // → { patterns: [...], stats: {...} } ou null

  const dupes = await enricher.detectDuplicates(description, { path: '.' });
  // → { matches: [...], codebaseOverview: {...} } ou null

  const client = getClient();
  const refs = await client.findReferences(symbol);
  // → [{ file, line, context }] ou null

  const deps = await client.analyzeDependencies(path);
  // → { nodes, edges } ou null
}
```

**Garantias do modulo:**
- Nunca lanca excecao (try/catch em todas as capabilities)
- Circuit breaker: abre apos 3 falhas consecutivas, reseta em 60s
- Session cache: TTL 5min, evita re-queries identicas
- `isCodeIntelAvailable()` retorna false se nenhum provider configurado

### Helper Pattern (Referencia: dev-helper.js, story-helper.js)

```javascript
'use strict';

const { getEnricher, getClient, isCodeIntelAvailable } = require('../index');

/**
 * Module JSDoc header — describe helper purpose.
 * All functions return null gracefully when no provider is available.
 * Never throws — safe to call unconditionally in task workflows.
 */

async function myFunction(param) {
  if (!param) return null;               // Input validation
  if (!isCodeIntelAvailable()) return null; // Provider guard

  try {
    const enricher = getEnricher();       // or getClient() for primitives
    const result = await enricher.someCapability(param);
    if (!result) return null;
    return { /* formatted result */ };
  } catch {
    return null;                          // Never throw
  }
}

module.exports = { myFunction };
```

### Template Modification Pattern

Secoes de code intelligence em templates devem ser **opcionais** e **condicionais**:

```markdown
{{#IF CODE_INTEL_AVAILABLE}}
## Code Intelligence Context

> Auto-populated when code intelligence provider is available.
> This section can be safely removed if not needed.

- **Project Structure:** {{PROJECT_STRUCTURE}}
- **Conventions:** {{CONVENTIONS}}
{{/IF}}
```

### Testing

**Framework:** Jest (padrao do projeto)
**Location:** `tests/code-intel/creation-helper.test.js`

| # | Cenario | Tipo | AC Ref | Esperado |
|---|---------|------|--------|----------|
| T1 | getCodebaseContext com provider | Unit | AC1 | Retorna { project, conventions } |
| T2 | getCodebaseContext sem provider | Unit | AC5 | Retorna null, sem throw |
| T3 | checkDuplicateArtefact com match | Unit | AC2 | Retorna { duplicates, warning } |
| T4 | checkDuplicateArtefact sem match | Unit | AC2 | Retorna null |
| T5 | checkDuplicateArtefact sem provider | Unit | AC5 | Retorna null, sem throw |
| T6 | enrichRegistryEntry com provider | Unit | AC3 | Retorna { usedBy, dependencies } |
| T7 | enrichRegistryEntry sem provider | Unit | AC5 | Retorna null, sem throw |
| T8 | enrichRegistryEntry com partial data | Unit | AC3 | Retorna dados parciais (usedBy ou dependencies) |
| T9 | Todas as funcoes fallback (provider indisponivel) | Integration | AC5 | 3/3 retornam null |
| T10 | Input vazio/null em todas as funcoes | Edge | AC5 | Retornam null sem throw |

**Mocking:** Mock do `getEnricher()`, `getClient()` e `isCodeIntelAvailable()` de `.aios-core/core/code-intel/index.js`.

---

## CodeRabbit Integration

### Story Type Analysis

**Primary Type:** Code/Features/Logic (helper module + template modifications)
**Secondary Type(s):** Documentation (integration pattern template)
**Complexity:** Medium

### Specialized Agent Assignment

**Primary Agents:**
- @dev: Implementation of creation-helper.js, template modifications, integration pattern, and tests

**Supporting Agents:**
- @qa: Quality gate review (pattern compliance, template integration correctness)

### Quality Gate Tasks

- [ ] Pre-Commit (@dev): Run before marking story complete
- [ ] Pre-PR (@devops): Run before creating pull request

### Self-Healing Configuration

**Expected Self-Healing:**
- Primary Agent: @dev (light mode)
- Max Iterations: 2
- Timeout: 15 minutes
- Severity Filter: CRITICAL only

**Predicted Behavior:**
- CRITICAL issues: auto_fix (2 iterations max)
- HIGH issues: document_as_debt

### CodeRabbit Focus Areas

**Primary Focus:**
- Fallback graceful em todas as funcoes do creation-helper (zero throws sem provider)
- Integracao correta com enricher API (parametros, return types)
- Template modifications nao quebram squad-creator existente
- Integration pattern template e consistente com helpers reais

**Secondary Focus:**
- Auto-registration enrichment nao adiciona side effects ao fluxo existente
- Duplicate warning formatting (advisory, nao blocker)

---

## File List

| File | Action |
|------|--------|
| `.aios-core/core/code-intel/helpers/creation-helper.js` | Created |
| `.aios-core/development/templates/code-intel-integration-pattern.md` | Created |
| `.aios-core/development/templates/squad/agent-template.md` | Modified |
| `.aios-core/development/templates/squad/task-template.md` | Modified |
| `.aios-core/core/ids/registry-updater.js` | Modified (NOG-8 enrichment integration) |
| `tests/code-intel/creation-helper.test.js` | Created |

---

## Dev Agent Record

### Agent Model Used
Claude Opus 4.6

### Debug Log References
- No debug issues encountered during implementation

### Completion Notes List
- creation-helper.js: 3 public functions + 1 private helper, follows dev-helper/story-helper pattern exactly
- Per-capability try/catch for partial results (same pattern as story-helper.js)
- Template modifications use Handlebars `{{#IF CODE_INTEL_AVAILABLE}}` conditional — zero impact when provider unavailable
- Task 5 integration: `enrichRegistryEntry` called in `registry-updater.js._handleFileCreate` → enrichment is async, advisory-only, never blocks
- 29 tests (T1-T10 mapped + edge cases), all passing
- 0 regressions: 275/275 code-intel tests pass, 39/39 registry-updater tests pass, 6421/6421 full suite pass

### File List (Implementation)
| File | Action | Lines |
|------|--------|-------|
| `.aios-core/core/code-intel/helpers/creation-helper.js` | Created | 153 |
| `.aios-core/development/templates/code-intel-integration-pattern.md` | Created | 173 |
| `.aios-core/development/templates/squad/agent-template.md` | Modified | +11 lines (Code Intelligence Context section) |
| `.aios-core/development/templates/squad/task-template.md` | Modified | +17 lines (Code Intelligence Duplicate Check section) |
| `.aios-core/core/ids/registry-updater.js` | Modified | +35 lines (enrichment integration) |
| `tests/code-intel/creation-helper.test.js` | Created | 302 |

---

## QA Results

### Review Date: 2026-02-21
### Reviewer: @qa (Quinn) — Claude Opus 4.6
### Risk Level: LOW (8/25)

### Requirements Traceability

| AC | Verdict | Notes |
|----|---------|-------|
| AC1: Agent creation com context | PASS | `getCodebaseContext()` + `{{#IF CODE_INTEL_AVAILABLE}}` in agent-template.md. Tests T1, T2 + partial results. |
| AC2: Task creation com duplicate check | PASS | `checkDuplicateArtefact()` + `{{#IF CODE_INTEL_AVAILABLE}}` in task-template.md. Tests T3-T5. |
| AC3: Auto-registration enrichment | PASS | `enrichRegistryEntry()` integrated in registry-updater.js. Enrichment now runs AFTER `_resolveAllUsedBy` so code-intel usedBy data merges on top of static graph. CONCERN-1 fixed. |
| AC4: Integration pattern template | PASS | `code-intel-integration-pattern.md` documenta pattern completo: import > guard > enrich > fallback. Consistente com helpers reais. |
| AC5: Fallback em todas integracoes | PASS | Todas 3 funcoes retornam null sem provider. Templates usam `{{#IF}}` condicional. Enrichment falha silenciosamente (catch vazio). Tests T9, T10. |

### Code Quality Assessment

| Dimension | Score | Notes |
|-----------|-------|-------|
| Pattern Compliance | 5/5 | Segue exatamente dev-helper/story-helper pattern |
| Error Handling | 5/5 | Per-capability try/catch, outer try/catch, never throws |
| Test Coverage | 5/5 | 29 tests, T1-T10 mapeados + edge cases, 100% passing |
| Documentation | 5/5 | JSDoc completo, integration pattern template, Dev Notes |
| Regression Safety | 5/5 | 0 regressions: 275/275 code-intel, 39/39 registry-updater, 6421/6421 full suite |
| Template Safety | 5/5 | Handlebars conditionals, zero impact sem provider |

### Issues

#### CONCERN-1: usedBy enrichment overwritten by _resolveAllUsedBy — FIXED

**Location:** `.aios-core/core/ids/registry-updater.js` lines 280-285
**Original Issue:** `_applyCodeIntelEnrichments` ran BEFORE `_resolveAllUsedBy`, which cleared all usedBy and rebuilt from static graph — effectively overwriting code-intel data.
**Fix Applied:** Reordered execution: `_resolveAllUsedBy` runs first (static graph), then `_applyCodeIntelEnrichments` merges code-intel usedBy on top. 68/68 tests pass, 0 regressions.
**Status:** RESOLVED

### Gate Decision

**Verdict: PASS**

**Rationale:** Implementation is solid, well-tested (29/29 creation-helper + 39/39 registry-updater pass, 0 regressions in 6421 full suite), follows established patterns perfectly, and all 5 ACs fully met. CONCERN-1 (usedBy enrichment ordering) was identified and fixed during review. Template modifications are safe via Handlebars conditionals. Code quality is exemplary.

**Action:** Approved for merge.

---

## Change Log

| Date | Author | Change |
|------|--------|--------|
| 2026-02-15 | @devops | Story created (v1.0 — Nogic-specific) |
| 2026-02-15 | @architect | Rewrite v2.0 — provider-agnostic, removed audit script (premature) |
| 2026-02-21 | @sm (River) | v3.0 — Full expansion: Executor Assignment, Story format, Scope (IN/OUT), Risks, DoD, Dev Notes (Source Tree, NOG-1 context, Helper Pattern, Template Pattern, Testing), CodeRabbit Integration, Tasks expanded with subtasks and AC mapping, Dev Agent Record/QA Results placeholders |
| 2026-02-21 | @po (Pax) | v4.0 — PO Validation: GO (10/10). Auto-fix: quality_gate @qa → @architect (consistency with NOG-3), Task 5.1 integration point specified (squad-creator → entity-registry.yaml). Status: Draft → Ready |
| 2026-02-21 | @dev (Dex) | v5.0 — Implementation complete. All 6 tasks/20 subtasks done. creation-helper.js (3 functions), code-intel-integration-pattern.md, agent/task template modifications, registry-updater.js enrichment integration, 29 tests passing. 0 regressions (6421/6421 full suite). Status: InProgress → Ready for Review |
| 2026-02-23 | @po (Pax) | Story closed. All 5 ACs met, QA PASS, 29/29 tests, 0 regressions. Status: Ready for Review → Done. |
