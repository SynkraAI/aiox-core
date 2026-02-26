# Story NOG-5: Brownfield & PRD with Code Graph

## Metadata
- **Story ID:** NOG-5
- **Epic:** Code Intelligence Integration (Provider-Agnostic)
- **Status:** Done
- **Priority:** P1 - High
- **Points:** 3
- **Agent:** @pm (Morgan) + @architect (Aria)
- **Blocked By:** NOG-1
- **Created:** 2026-02-15
- **Updated:** 2026-02-21 (v3.0 — PO validation auto-fix)

---

## Executor Assignment

```yaml
executor: "@dev"
quality_gate: "@architect"
quality_gate_tools:
  - code-review
  - pattern-compliance
  - task-integration-review
```

---

## Story

**As a** @pm or @architect agent,
**I want** code intelligence integrated into my brownfield discovery, PRD creation, project analysis, and implementation planning workflows,
**so that** I can generate PRDs/Epics/Plans with real codebase references (dependency graphs, complexity metrics, project overview) instead of manual guesses — all with graceful fallback when no provider is available.

---

## Description

Enriquecer o Brownfield Discovery workflow e a criacao de PRDs/Epics com dados reais do code graph, para que PRDs, epics e stories ja referenciem exatamente os arquivos, modulos e relacionamentos existentes no codebase. O helper segue o mesmo pattern do `dev-helper.js` (NOG-3) e `qa-helper.js` (NOG-4): funcoes que retornam null gracefully sem provider, zero throws.

### Tasks Impactadas

| Task | Capabilities Usadas | Integracao |
|------|---------------------|-----------|
| `brownfield-create-epic.md` | describeProject, analyzeDependencies | Epic com visao real da arquitetura |
| `create-doc.md` (PRD) | describeProject, analyzeDependencies | PRD com mapa arquitetural real |
| `analyze-project-structure.md` | analyzeDependencies, analyzeComplexity | Analise com grafo de dependencias |
| `plan-create-context.md` | findDefinition, analyzeDependencies, findReferences | Contexto preciso para implementacao |
| `plan-create-implementation.md` | assessImpact, findTests | Plano com blast radius |

---

## Acceptance Criteria

### AC1: Brownfield Epic com Code Graph
- [ ] **Given** @pm executa `*create-brownfield-prd` ou `*create-epic`
- [ ] **When** provider disponivel
- [ ] **Then** PRD/Epic inclui secao "Codebase Intelligence" com: project overview, file groups, dependency graph summary

### AC2: Architecture Analysis Enriched
- [ ] **Given** @architect executa `*analyze-project-structure`
- [ ] **When** provider disponivel
- [ ] **Then** analise inclui: dependency graph, complexity metrics, e project statistics

### AC3: Implementation Context
- [ ] **Given** @architect executa `*create-context` (plan-create-context.md)
- [ ] **When** provider disponivel
- [ ] **Then** contexto inclui: file structure com symbols, call dependencies, e related test files

### AC4: Implementation Plan com Impact
- [ ] **Given** @architect executa `*create-plan` (plan-create-implementation.md)
- [ ] **When** provider disponivel
- [ ] **Then** plano inclui blast radius por subtask e risk assessment

### AC5: Fallback
- [ ] **Given** NENHUM provider disponivel
- [ ] **When** qualquer task e executada
- [ ] **Then** funciona exatamente como hoje, sem secoes de code intelligence

---

## Tasks / Subtasks

- [x] 1. Criar helper `.aios-core/core/code-intel/helpers/planning-helper.js` (AC: #1, #2, #3, #4)
  - [x] 1.1 Implementar `getCodebaseOverview(path)` — chama enricher.describeProject, retorna { codebase, stats } (AC: #1)
  - [x] 1.2 Implementar `getDependencyGraph(path)` — chama client.analyzeDependencies, retorna dependency graph summary (AC: #1, #2)
  - [x] 1.3 Implementar `getComplexityAnalysis(files)` — chama client.analyzeComplexity por file, retorna { perFile, average } (AC: #2)
  - [x] 1.4 Implementar `getImplementationContext(symbols)` — chama client.findDefinition + client.analyzeDependencies + enricher.findTests, retorna { definitions, dependencies, relatedTests } (AC: #3)
  - [x] 1.5 Implementar `getImplementationImpact(files)` — chama enricher.assessImpact, retorna { blastRadius, riskLevel, references } (AC: #4)
  - [x] 1.6 Todas as funcoes retornam null gracefully se provider indisponivel (AC: #5)
  - [x] 1.7 Exportar constantes RISK_THRESHOLDS (reusar valores identicos de dev-helper/qa-helper)
- [x] 2. Modificar `brownfield-create-epic.md` — adicionar secao Codebase Intelligence opcional (AC: #1, #5)
  - [x] 2.1 Adicionar step "Code Intelligence: Codebase Overview" com project description e dependency graph
  - [x] 2.2 Garantir que step e skipped silenciosamente se `isCodeIntelAvailable()` retorna false
- [x] 3. Modificar `analyze-project-structure.md` — dependency graph + complexity (AC: #2, #5)
  - [x] 3.1 Adicionar step "Code Intelligence: Dependency & Complexity" com grafo e metricas
  - [x] 3.2 Garantir fallback graceful (analise funciona normalmente sem provider)
- [x] 4. Modificar `plan-create-context.md` — file structure com symbols (AC: #3, #5)
  - [x] 4.1 Adicionar step "Code Intelligence: Implementation Context" com definitions, dependencies, related tests
  - [x] 4.2 Garantir fallback graceful
- [x] 5. Modificar `plan-create-implementation.md` — blast radius por subtask + risk assessment (AC: #4, #5)
  - [x] 5.1 Adicionar step "Code Intelligence: Impact Analysis" com blast radius e risk level
  - [x] 5.2 Se blast radius HIGH, adicionar nota de risco no plano
  - [x] 5.3 Garantir fallback graceful
- [x] 6. Modificar `create-doc.md` — secao Codebase Intelligence opcional em PRDs gerados (AC: #1, #5)
  - [x] 6.1 Adicionar secao opcional "Codebase Intelligence" com project overview e dependency summary
  - [x] 6.2 Garantir fallback graceful (PRD gerado normalmente sem provider)
- [x] 7. Escrever testes unitarios para planning-helper.js (AC: #1, #2, #3, #4, #5)
  - [x] 7.1 Testes com provider mockado (happy path para cada funcao)
  - [x] 7.2 Testes sem provider (fallback graceful — retorna null)
  - [x] 7.3 Testes de boundary: risk thresholds
  - [x] 7.4 Teste de integracao: todas as funcoes fallback simultaneamente
  - [x] 7.5 Teste de getImplementationContext com resultados parciais (findDefinition retorna, analyzeDependencies falha)
- [x] 8. Registrar entidade planning-helper no entity-registry.yaml (AC: N/A — IDS compliance)
  - [x] 8.1 Adicionar entry com path, type, purpose, keywords, usedBy, dependencies

---

## Scope

**IN:**
- Helper `planning-helper.js` com funcoes de code intelligence para @pm/@architect
- Modificacao de `brownfield-create-epic.md` — secao Codebase Intelligence opcional
- Modificacao de `analyze-project-structure.md` — dependency graph + complexity
- Modificacao de `plan-create-context.md` — implementation context com symbols
- Modificacao de `plan-create-implementation.md` — blast radius por subtask
- Modificacao de `create-doc.md` — secao Codebase Intelligence opcional em PRDs
- Testes unitarios para planning-helper.js
- Fallback graceful em todas as integracoes
- Registro no entity-registry.yaml

**OUT:**
- Outros helpers (story-helper, devops-helper, creation-helper) — stories NOG-6 a NOG-8
- Modificacao de tasks de outros agentes (@dev, @qa, @sm, etc.)
- Novos providers de code intelligence
- Modificacao do code-intel-client ou enricher (consumo apenas)
- UI/Dashboard para code intelligence

---

## Risks

| Risco | Prob. | Impacto | Mitigacao |
|-------|-------|---------|-----------|
| 5 tasks markdown a modificar — escopo significativo | Media | Alto | Cada task recebe step condicional minimo; seguir pattern de NOG-3/NOG-4 |
| Tasks referenciadas podem ter estrutura diferente entre si | Media | Medio | Ler cada task antes de modificar; adaptar step ao formato existente |
| `getImplementationContext()` compoe 3 capabilities — complexidade | Media | Medio | Per-item try/catch; resultado parcial aceito (definitions sem dependencies e valido) |
| Latencia adicional em workflows de PRD/brownfield | Baixa | Baixo | Timeout 5s (herdado do client); skip se provider indisponivel; calls concorrentes via Promise.all |
| `analyzeDependencies` pode retornar grafos muito grandes | Baixa | Medio | Limitar depth do grafo no helper; retornar summary em vez de grafo completo |

---

## Definition of Done

- [ ] `planning-helper.js` criado com 5 funcoes (getCodebaseOverview, getDependencyGraph, getComplexityAnalysis, getImplementationContext, getImplementationImpact)
- [ ] Todas as funcoes retornam null gracefully sem provider (0 throws)
- [ ] `brownfield-create-epic.md` tem secao Codebase Intelligence opcional
- [ ] `analyze-project-structure.md` inclui dependency graph + complexity quando provider disponivel
- [ ] `plan-create-context.md` inclui implementation context com symbols e dependencies
- [ ] `plan-create-implementation.md` inclui blast radius e risk assessment
- [ ] `create-doc.md` tem secao Codebase Intelligence opcional para PRDs
- [ ] Testes unitarios passando (>80% coverage no planning-helper.js)
- [ ] Nenhuma regressao nas 5 tasks modificadas (funcionam identicamente sem provider)
- [ ] Entidade registrada no entity-registry.yaml

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
│   │       │   Primitives used: findDefinition, findReferences, analyzeDependencies,
│   │       │                    analyzeComplexity, analyzeCodebase, getProjectStats
│   │       ├── code-intel-enricher.js      # 5 composite capabilities
│   │       │   Composites used: assessImpact, describeProject, findTests
│   │       ├── providers/
│   │       │   ├── provider-interface.js   # Abstract contract
│   │       │   └── code-graph-provider.js  # Code Graph MCP adapter
│   │       └── helpers/
│   │           ├── dev-helper.js           # Existente (NOG-3) — REFERENCE PATTERN
│   │           ├── qa-helper.js            # Existente (NOG-4)
│   │           └── planning-helper.js      # Create — helper para @pm/@architect tasks
│   └── development/
│       └── tasks/
│           ├── brownfield-create-epic.md   # Modify — adicionar Codebase Intelligence
│           ├── analyze-project-structure.md # Modify — dependency graph + complexity
│           ├── plan-create-context.md       # Modify — implementation context
│           ├── plan-create-implementation.md # Modify — blast radius por subtask
│           └── create-doc.md               # Modify — Codebase Intelligence em PRDs
└── tests/
    └── code-intel/
        ├── code-intel-client.test.js       # Existente (NOG-1)
        ├── code-intel-enricher.test.js     # Existente (NOG-1)
        ├── dev-helper.test.js              # Existente (NOG-3)
        ├── qa-helper.test.js               # Existente (NOG-4)
        └── planning-helper.test.js         # Create — testes do helper
```

### Contexto de NOG-1 (Infrastructure — Done)

O modulo `code-intel` esta completo e funcional (156/156 testes, 7 suites):

**API principal para consumo nesta story:**

```javascript
// Importar via index.js
const { getEnricher, getClient, isCodeIntelAvailable } = require('.aios-core/core/code-intel');

// Verificar disponibilidade (OBRIGATORIO antes de chamar)
if (isCodeIntelAvailable()) {
  const enricher = getEnricher();
  const client = getClient();

  // Composite capabilities (usadas no planning-helper)
  const project = await enricher.describeProject('.');
  // → { codebase: { patterns, ... }, stats: { files, lines, ... } } ou null

  const impact = await enricher.assessImpact(['file1.js', 'file2.js']);
  // → { references: [...], complexity: { average, perFile }, blastRadius: N } ou null

  const tests = await enricher.findTests('functionName');
  // → [{ file: 'tests/foo.test.js', line: 42, context: '...' }] ou null

  // Primitive capabilities (usadas diretamente no planning-helper)
  const deps = await client.analyzeDependencies('src/');
  // → dependency graph ou null

  const complexity = await client.analyzeComplexity('file.js');
  // → { score: N, ... } ou null

  const definition = await client.findDefinition('MyClass');
  // → { file: '...', line: N, context: '...' } ou null

  const refs = await client.findReferences('file.js');
  // → [{ file: '...', line: N, context: '...' }] ou null
}
```

**Garantias do modulo:**
- Nunca lanca excecao (try/catch em todas as capabilities)
- Circuit breaker: abre apos 3 falhas consecutivas, reseta em 60s
- Session cache: TTL 5min, evita re-queries identicas
- `isCodeIntelAvailable()` retorna false se nenhum provider configurado

### Contexto de NOG-3/NOG-4 (Helpers — Done, REFERENCE PATTERN)

O `dev-helper.js` e `qa-helper.js` sao os patterns de referencia para criar o `planning-helper.js`:

```javascript
// Pattern a seguir (de dev-helper.js/qa-helper.js):
'use strict';
const { getEnricher, getClient, isCodeIntelAvailable } = require('../index');

// Constantes exportadas para testability
const RISK_THRESHOLDS = { LOW_MAX: 4, MEDIUM_MAX: 15 };

// Cada funcao:
// 1. Valida input (retorna null se invalido)
// 2. Checa isCodeIntelAvailable() (retorna null se false)
// 3. try/catch com return null no catch
// 4. JSDoc completo
async function myFunction(param) {
  if (!param) return null;
  if (!isCodeIntelAvailable()) return null;
  try {
    const enricher = getEnricher();
    // ... logic ...
    return result;
  } catch {
    return null;
  }
}

module.exports = { myFunction, RISK_THRESHOLDS };
```

### Funcoes do planning-helper — Detalhamento

| Funcao | Capabilities | Input | Output |
|--------|-------------|-------|--------|
| `getCodebaseOverview(path)` | enricher.describeProject | string (path) | `{ codebase, stats }` ou null |
| `getDependencyGraph(path)` | client.analyzeDependencies | string (path) | `{ dependencies, summary }` ou null |
| `getComplexityAnalysis(files)` | client.analyzeComplexity | string[] (files) | `{ perFile, average }` ou null |
| `getImplementationContext(symbols)` | client.findDefinition + client.analyzeDependencies + enricher.findTests | string[] (symbols) | `{ definitions, dependencies, relatedTests }` ou null |
| `getImplementationImpact(files)` | enricher.assessImpact | string[] (files) | `{ blastRadius, riskLevel, references }` ou null |

### Contexto Tecnico

- **CommonJS:** Usar `require()` / `module.exports` (padrao do projeto)
- **Diretorio helpers/:** Ja existe (criado no NOG-3)
- **Pattern de integracao em tasks:** Adicionar steps markdown que instruem o agente a chamar o helper; usar linguagem condicional ("se code intelligence disponivel, executar...")
- **Risk Level mapping:** Reusar RISK_THRESHOLDS do dev-helper/qa-helper — LOW (<=4 refs), MEDIUM (5-15 refs), HIGH (>15 refs)
- **Per-item try/catch:** Para funcoes que operam sobre arrays (getComplexityAnalysis, getImplementationContext), usar per-item try/catch dentro de Promise.all para que falha em um item nao comprometa os demais

### Testing

**Framework:** Jest (padrao do projeto)
**Location:** `tests/code-intel/planning-helper.test.js`

| # | Cenario | Tipo | AC Ref | Esperado |
|---|---------|------|--------|----------|
| T1 | getCodebaseOverview com provider | Unit | AC1 | Retorna { codebase, stats } |
| T2 | getCodebaseOverview sem provider | Unit | AC5 | Retorna null, sem throw |
| T3 | getDependencyGraph com provider | Unit | AC1,AC2 | Retorna { dependencies, summary } |
| T4 | getDependencyGraph sem provider | Unit | AC5 | Retorna null, sem throw |
| T5 | getComplexityAnalysis com provider (multi-file) | Unit | AC2 | Retorna { perFile: [...], average: N } |
| T6 | getComplexityAnalysis sem provider | Unit | AC5 | Retorna null, sem throw |
| T7 | getComplexityAnalysis com falha parcial (1 file ok, 1 fail) | Unit | AC2 | Retorna resultado parcial |
| T8 | getImplementationContext com provider (definitions + deps + tests) | Unit | AC3 | Retorna { definitions, dependencies, relatedTests } |
| T9 | getImplementationContext com resultado parcial | Unit | AC3 | Retorna resultado parcial (definitions sem deps) |
| T10 | getImplementationContext sem provider | Unit | AC5 | Retorna null, sem throw |
| T11 | getImplementationImpact com provider (HIGH blast) | Unit | AC4 | Retorna { blastRadius: 20, riskLevel: 'HIGH' } |
| T12 | getImplementationImpact com provider (LOW blast) | Unit | AC4 | Retorna { blastRadius: 2, riskLevel: 'LOW' } |
| T13 | getImplementationImpact sem provider | Unit | AC5 | Retorna null, sem throw |
| T14 | Todas as funcoes fallback (provider indisponivel) | Integration | AC5 | 5/5 retornam null |
| T15 | Input validation: null/empty para cada funcao | Unit | ALL | Retorna null sem throw |

**Mocking:** Mock do `getEnricher()`, `getClient()` e `isCodeIntelAvailable()` de `.aios-core/core/code-intel/index.js` (mesmo pattern do dev-helper.test.js e qa-helper.test.js).

---

## CodeRabbit Integration

### Story Type Analysis

**Primary Type:** Code/Features/Logic (helper module + task modifications)
**Secondary Type(s):** Process Integration (brownfield/PRD workflow enhancement)
**Complexity:** Medium

### Specialized Agent Assignment

**Primary Agents:**
- @dev: Implementation of planning-helper.js, task modifications, and tests

**Supporting Agents:**
- @architect: Quality gate review (pattern compliance, task integration correctness)

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
- Fallback graceful em todas as funcoes do planning-helper (zero throws sem provider)
- Integracao correta com enricher/client API (parametros, return types)
- Task modifications nao quebram workflows existentes de PRD/brownfield
- Per-item error handling em funcoes que operam sobre arrays

**Secondary Focus:**
- Risk level calculation consistency com dev-helper.js e qa-helper.js
- getImplementationContext composicao de 3 capabilities
- Dependency graph summary (nao expor grafo raw completo)

---

## File List

| File | Action |
|------|--------|
| `.aios-core/core/code-intel/helpers/planning-helper.js` | Create |
| `.aios-core/development/tasks/brownfield-create-epic.md` | Modify |
| `.aios-core/development/tasks/analyze-project-structure.md` | Modify |
| `.aios-core/development/tasks/plan-create-context.md` | Modify |
| `.aios-core/development/tasks/plan-create-implementation.md` | Modify |
| `.aios-core/development/tasks/create-doc.md` | Modify |
| `tests/code-intel/planning-helper.test.js` | Create |
| `.aios-core/data/entity-registry.yaml` | Modify (add planning-helper entity) |

---

## Dev Agent Record

### Agent Model Used
Claude Opus 4.6

### Debug Log References
- 197/197 code-intel tests passing (8 suites, 0 regressions)
- 41/41 planning-helper tests passing (T1-T15 all covered)

### Completion Notes List
- Created `planning-helper.js` with 5 functions + 2 private helpers following dev-helper/qa-helper pattern
- All functions return null gracefully when no provider (zero throws)
- `getImplementationContext` composes 3 capabilities with per-item try/catch for partial result acceptance
- `_buildDependencySummary` handles array, object-with-deps, and plain-object dependency shapes
- RISK_THRESHOLDS consistent with dev-helper.js and qa-helper.js (LOW_MAX: 4, MEDIUM_MAX: 15)
- 5 task markdown files modified with conditional Code Intelligence steps (auto-skip if unavailable)
- Entity registered in entity-registry.yaml with usedBy references to all 5 consuming tasks

### File List (Implementation)
| File | Action |
|------|--------|
| `.aios-core/core/code-intel/helpers/planning-helper.js` | Created |
| `.aios-core/development/tasks/brownfield-create-epic.md` | Modified (Step 0: Codebase Overview) |
| `.aios-core/development/tasks/analyze-project-structure.md` | Modified (Step 5.5: Dependency & Complexity) |
| `.aios-core/development/tasks/plan-create-context.md` | Modified (Step 3.5: Implementation Context) |
| `.aios-core/development/tasks/plan-create-implementation.md` | Modified (Step 6.5: Impact Analysis) |
| `.aios-core/development/tasks/create-doc.md` | Modified (Codebase Intelligence section) |
| `tests/code-intel/planning-helper.test.js` | Created |
| `.aios-core/data/entity-registry.yaml` | Modified (planning-helper entity added) |

---

## QA Results

**Reviewer:** @qa (Quinn) | **Date:** 2026-02-21 | **Model:** Claude Opus 4.6

### Gate Decision: PASS

### AC Traceability

| AC | Status | Evidence |
|----|--------|----------|
| AC1 | MET | `brownfield-create-epic.md:58` Step 0 + `create-doc.md:253` Codebase Intelligence section |
| AC2 | MET | `analyze-project-structure.md:559` Step 5.5 with dep graph + complexity tables |
| AC3 | MET | `plan-create-context.md:275` Step 3.5 with definitions, dependencies, relatedTests |
| AC4 | MET | `plan-create-implementation.md:441` Step 6.5 with blastRadius, riskLevel, HIGH warning |
| AC5 | MET | All 5 functions return null gracefully; all tasks use `isCodeIntelAvailable()` guard |

### Test Coverage

- 41/41 planning-helper tests passing (T1-T15 all covered)
- 197/197 code-intel suite (8 suites, 0 regressions)
- Additional tests: boundary thresholds, partial failures, private helpers, enricher throws

### Code Quality

- Pattern compliance with dev-helper.js/qa-helper.js: FULL
- RISK_THRESHOLDS consistent (LOW_MAX: 4, MEDIUM_MAX: 15)
- Per-item try/catch in getImplementationContext for partial result acceptance
- `_buildDependencySummary` handles 3 dependency data shapes robustly
- Entity registered in entity-registry.yaml with correct usedBy references

### Issues Found

None.

### DoD Verification

10/10 items verified and passing.

— Quinn, guardiao da qualidade

---

## Change Log

| Date | Author | Change |
|------|--------|--------|
| 2026-02-15 | @devops | Story created (v1.0 — Nogic-specific) |
| 2026-02-15 | @architect | Rewrite v2.0 — provider-agnostic, reduced from 5 to 3 points |
| 2026-02-15 | @po | v2.1 — Added create-doc.md and plan-create-implementation.md to tasks/file list |
| 2026-02-21 | @po (Pax) | v3.0 — Auto-fix: Executor Assignment, Story format, Scope (IN/OUT), Risks, DoD, Dev Notes (Source Tree, Testing, NOG-1/NOG-3/NOG-4 context, function mapping), CodeRabbit Integration, Tasks with subtasks + AC mapping, entity-registry task, Dev Agent Record/QA Results placeholders. 5 helper functions mapped to capabilities. 15 test scenarios defined. |
| 2026-02-21 | @po (Pax) | v4.0 — Story closed. Commit `dcd3e1f5` pushed to `feat/epic-nogic-code-intelligence`. QA PASS (Quinn). All 8 tasks + 22 subtasks complete. 41/41 tests, 0 regressions. |
