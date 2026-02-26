# Story NOG-4: QA Gate Enhancement (Blast Radius + Coverage)

## Metadata
- **Story ID:** NOG-4
- **Epic:** Code Intelligence Integration (Provider-Agnostic)
- **Status:** Done
- **Priority:** P1 - High
- **Points:** 3
- **Agent:** @qa (Quinn)
- **Blocked By:** NOG-1
- **Created:** 2026-02-15
- **Updated:** 2026-02-20 (v3.0 — PO validation auto-fix)

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

**As a** @qa agent,
**I want** code intelligence integrated into my QA gate and review workflows (blast radius analysis, test coverage assessment, reference impact mapping),
**so that** I can make more informed PASS/CONCERNS/FAIL decisions based on real codebase impact data — all with graceful fallback when no provider is available.

---

## Description

Enriquecer o QA Gate e review workflow do @qa com blast radius analysis (via `assessImpact`), test coverage por funcao (via `findTests`), e reference mapping (via `findReferences`). O helper segue o mesmo pattern do `dev-helper.js` (NOG-3): funcoes que retornam null gracefully sem provider, zero throws.

### Tasks Impactadas

| Task | Capabilities Usadas | Integracao |
|------|---------------------|-----------|
| `qa-gate.md` | assessImpact, findTests | Blast radius e test coverage na decisao PASS/CONCERNS/FAIL |
| `qa-review-story.md` | findReferences, assessImpact | Review com visao de impacto e consumers afetados |

> **Nota PO:** `qa-trace-requirements.md` e `qa-generate-tests.md` foram removidas do MVP para manter escopo controlado. Podem ser adicionadas em story futura (NOG-4B).

---

## Acceptance Criteria

### AC1: Blast Radius no QA Gate
- [ ] **Given** @qa executa `*gate {story}`
- [ ] **When** provider disponivel
- [ ] **Then** gate report inclui secao "Blast Radius" com numero de arquivos/funcoes afetados e risk level (LOW/MEDIUM/HIGH)

### AC2: Test Coverage Assessment
- [ ] **Given** @qa executa `*gate {story}`
- [ ] **When** provider disponivel
- [ ] **Then** gate report inclui secao "Test Coverage" com status por funcao modificada (NO_TESTS/INDIRECT/MINIMAL/GOOD)

### AC3: Reference Impact no Review
- [ ] **Given** @qa executa `*review {story}`
- [ ] **When** provider disponivel
- [ ] **Then** review inclui lista de consumers afetados por cada mudanca

### AC4: Gate Decision Influence
- [ ] **Given** blast radius indica HIGH risk
- [ ] **When** @qa decide gate verdict
- [ ] **Then** sugere automaticamente "CONCERNS" com recomendacao de review adicional

### AC5: Fallback sem Provider
- [ ] **Given** NENHUM provider disponivel
- [ ] **When** @qa executa qualquer task
- [ ] **Then** QA gate e review funcionam exatamente como hoje, sem secoes de code intelligence

---

## Tasks / Subtasks

- [x] 1. Criar helper `.aios-core/core/code-intel/helpers/qa-helper.js` (AC: #1, #2, #3)
  - [x] 1.1 Implementar `getBlastRadius(files)` — chama enricher.assessImpact, retorna { blastRadius, riskLevel, references }
  - [x] 1.2 Implementar `getTestCoverage(symbols)` — chama enricher.findTests por symbol, retorna status por funcao (NO_TESTS/INDIRECT/MINIMAL/GOOD)
  - [x] 1.3 Implementar `getReferenceImpact(files)` — chama client.findReferences por file, retorna consumers afetados
  - [x] 1.4 Implementar `suggestGateInfluence(blastRadius)` — retorna advisory se HIGH risk (AC: #4)
  - [x] 1.5 Todas as funcoes retornam null gracefully se provider indisponivel (AC: #5)
  - [x] 1.6 Exportar constantes COVERAGE_THRESHOLDS e RISK_THRESHOLDS (reusar de dev-helper ou definir consistentes)
- [x] 2. Modificar `qa-gate.md` — adicionar secoes Blast Radius + Test Coverage opcionais (AC: #1, #2, #4, #5)
  - [x] 2.1 Adicionar step "Code Intelligence: Blast Radius" apos analise manual
  - [x] 2.2 Adicionar step "Code Intelligence: Test Coverage" para funcoes modificadas
  - [x] 2.3 Se blast radius HIGH, adicionar advisory "CONCERNS recommended" na decisao
  - [x] 2.4 Garantir que steps sao skipped silenciosamente se `isCodeIntelAvailable()` retorna false
- [x] 3. Modificar `qa-review-story.md` — adicionar reference impact (AC: #3, #5)
  - [x] 3.1 Adicionar step "Code Intelligence: Reference Impact" na secao de review
  - [x] 3.2 Listar consumers afetados por arquivo modificado (se provider disponivel)
  - [x] 3.3 Garantir fallback graceful (review funciona normalmente sem provider)
- [x] 4. Escrever testes unitarios para qa-helper.js (AC: #1, #2, #3, #4, #5)
  - [x] 4.1 Testes com provider mockado (happy path para cada funcao)
  - [x] 4.2 Testes sem provider (fallback graceful — retorna null)
  - [x] 4.3 Testes de boundary: coverage thresholds (NO_TESTS/INDIRECT/MINIMAL/GOOD)
  - [x] 4.4 Teste de integracao: todas as funcoes fallback simultaneamente
  - [x] 4.5 Teste de gate influence: HIGH blast radius sugere CONCERNS
- [x] 5. Registrar entidade qa-helper no entity-registry.yaml (AC: N/A — IDS compliance)
  - [x] 5.1 Adicionar entry com path, type, purpose, keywords, usedBy, dependencies

---

## Scope

**IN:**
- Helper `qa-helper.js` com funcoes de code intelligence para @qa
- Modificacao de `qa-gate.md` — secoes Blast Radius + Test Coverage opcionais
- Modificacao de `qa-review-story.md` — reference impact em reviews
- Testes unitarios para qa-helper.js
- Fallback graceful em todas as integracoes
- Registro no entity-registry.yaml

**OUT:**
- Outros helpers (planning-helper, story-helper, devops-helper) — stories NOG-5 a NOG-8
- Modificacao de tasks de outros agentes (@dev, @sm, @po, etc.)
- Novos providers de code intelligence
- Modificacao do code-intel-client ou enricher (consumo apenas)
- `qa-trace-requirements.md` e `qa-generate-tests.md` (deferred para NOG-4B)
- UI/Dashboard para code intelligence

---

## Risks

| Risco | Prob. | Impacto | Mitigacao |
|-------|-------|---------|-----------|
| Modificacao de qa-gate.md quebra workflow QA existente | Media | Alto | Fallback graceful obrigatorio; steps condicionais; testar gate sem provider |
| `getTestCoverage()` retorna falsos negativos (files nao detectados como testes) | Media | Medio | Filtro por keywords (test/spec/__tests__) consistente com enricher.findTests; exibir como advisory |
| Blast radius HIGH auto-sugere CONCERNS desnecessariamente | Baixa | Medio | Advisory apenas (nao muda gate automaticamente); @qa decide final |
| Latencia adicional no QA gate com provider calls | Baixa | Baixo | Timeout 5s (herdado do client); skip se provider indisponivel; calls concorrentes via Promise.all |

---

## Definition of Done

- [x] `qa-helper.js` criado com 4+ funcoes (getBlastRadius, getTestCoverage, getReferenceImpact, suggestGateInfluence)
- [x] Todas as funcoes retornam null gracefully sem provider (0 throws)
- [x] `qa-gate.md` tem secoes Blast Radius + Test Coverage opcionais
- [x] `qa-review-story.md` inclui reference impact quando provider disponivel
- [x] Gate decision influence: HIGH blast radius sugere CONCERNS (advisory only)
- [x] Testes unitarios passando (>80% coverage no qa-helper.js)
- [x] Nenhuma regressao nas 2 tasks modificadas (funcionam identicamente sem provider)
- [x] Entidade registrada no entity-registry.yaml

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
│   │       ├── code-intel-enricher.js      # 5 composite capabilities (assessImpact, findTests, etc.)
│   │       ├── providers/
│   │       │   ├── provider-interface.js   # Abstract contract
│   │       │   └── code-graph-provider.js  # Code Graph MCP adapter
│   │       └── helpers/
│   │           ├── dev-helper.js           # Existente (NOG-3) — REFERENCE PATTERN
│   │           └── qa-helper.js            # Create — helper para @qa tasks
│   └── development/
│       └── tasks/
│           ├── qa-gate.md                  # Modify — adicionar Blast Radius + Test Coverage
│           └── qa-review-story.md          # Modify — adicionar reference impact
└── tests/
    └── code-intel/
        ├── code-intel-client.test.js       # Existente (NOG-1)
        ├── code-intel-enricher.test.js     # Existente (NOG-1)
        ├── dev-helper.test.js              # Existente (NOG-3)
        └── qa-helper.test.js              # Create — testes do helper
```

### Contexto de NOG-1 (Infrastructure — Done)

O modulo `code-intel` esta completo e funcional (123/123 testes, 6 suites):

**API principal para consumo nesta story:**

```javascript
// Importar via index.js
const { getEnricher, getClient, isCodeIntelAvailable } = require('.aios-core/core/code-intel');

// Verificar disponibilidade (OBRIGATORIO antes de chamar)
if (isCodeIntelAvailable()) {
  const enricher = getEnricher();
  const client = getClient();

  // Composite capabilities (usadas no qa-helper)
  const impact = await enricher.assessImpact(['file1.js', 'file2.js']);
  // → { references: [...], complexity: { average, perFile }, blastRadius: N } ou null

  const tests = await enricher.findTests('functionName');
  // → [{ file: 'tests/foo.test.js', line: 42, context: '...' }] ou null (filtered: test/spec/__tests__)

  // Primitive capability (usada para reference impact)
  const refs = await client.findReferences('file.js');
  // → [{ file: '...', line: N, context: '...' }] ou null
}
```

**Garantias do modulo:**
- Nunca lanca excecao (try/catch em todas as capabilities)
- Circuit breaker: abre apos 3 falhas consecutivas, reseta em 60s
- Session cache: TTL 5min, evita re-queries identicas
- `isCodeIntelAvailable()` retorna false se nenhum provider configurado

### Contexto de NOG-3 (Dev Helper — Done, REFERENCE PATTERN)

O `dev-helper.js` e o pattern de referencia para criar o `qa-helper.js`:

```javascript
// Pattern a seguir (de dev-helper.js):
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

### Coverage Status Mapping

Para `getTestCoverage`, definir status por funcao baseado no resultado de `findTests`:

| Status | Criterio | Descricao |
|--------|----------|-----------|
| NO_TESTS | 0 test refs encontrados | Funcao sem nenhum teste |
| INDIRECT | 1-2 test refs, nenhum direto | Testado indiretamente |
| MINIMAL | 3-5 test refs | Cobertura basica |
| GOOD | >5 test refs | Cobertura adequada |

### Contexto Tecnico

- **CommonJS:** Usar `require()` / `module.exports` (padrao do projeto)
- **Diretorio helpers/:** Ja existe (criado no NOG-3)
- **Pattern de integracao em tasks:** Adicionar steps markdown que instruem o agente a chamar o helper; usar linguagem condicional ("se code intelligence disponivel, executar...")
- **Risk Level mapping:** Reusar RISK_THRESHOLDS do dev-helper — LOW (<=4 refs), MEDIUM (5-15 refs), HIGH (>15 refs)
- **Gate influence:** Advisory only — nunca muda verdict automaticamente, apenas sugere

### Testing

**Framework:** Jest (padrao do projeto)
**Location:** `tests/code-intel/qa-helper.test.js`

| # | Cenario | Tipo | AC Ref | Esperado |
|---|---------|------|--------|----------|
| T1 | getBlastRadius com provider (HIGH blast) | Unit | AC1 | Retorna { blastRadius: 20, riskLevel: 'HIGH' } |
| T2 | getBlastRadius com provider (LOW blast) | Unit | AC1 | Retorna { blastRadius: 2, riskLevel: 'LOW' } |
| T3 | getBlastRadius sem provider | Unit | AC5 | Retorna null, sem throw |
| T4 | getTestCoverage com provider (funcao testada) | Unit | AC2 | Retorna { status: 'GOOD', testCount: N } |
| T5 | getTestCoverage com provider (funcao sem testes) | Unit | AC2 | Retorna { status: 'NO_TESTS', testCount: 0 } |
| T6 | getTestCoverage sem provider | Unit | AC5 | Retorna null, sem throw |
| T7 | getReferenceImpact com provider (consumers encontrados) | Unit | AC3 | Retorna array de consumers |
| T8 | getReferenceImpact sem provider | Unit | AC5 | Retorna null, sem throw |
| T9 | suggestGateInfluence com HIGH risk | Unit | AC4 | Retorna advisory 'CONCERNS recommended' |
| T10 | suggestGateInfluence com LOW risk | Unit | AC4 | Retorna null (sem advisory) |
| T11 | Todas as funcoes fallback (provider indisponivel) | Integration | AC5 | 4/4 retornam null |

**Mocking:** Mock do `getEnricher()`, `getClient()` e `isCodeIntelAvailable()` de `.aios-core/core/code-intel/index.js` (mesmo pattern do dev-helper.test.js).

---

## CodeRabbit Integration

### Story Type Analysis

**Primary Type:** Code/Features/Logic (helper module + task modifications)
**Secondary Type(s):** Process Integration (QA workflow enhancement)
**Complexity:** Medium

### Specialized Agent Assignment

**Primary Agents:**
- @dev: Implementation of qa-helper.js, task modifications, and tests

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
- Fallback graceful em todas as funcoes do qa-helper (zero throws sem provider)
- Integracao correta com enricher API (parametros, return types)
- Task modifications nao quebram fluxo QA existente
- Coverage status mapping consistency (NO_TESTS/INDIRECT/MINIMAL/GOOD thresholds)

**Secondary Focus:**
- Risk level calculation consistency com dev-helper.js
- Gate influence advisory formatting

---

## File List

| File | Action |
|------|--------|
| `.aios-core/core/code-intel/helpers/qa-helper.js` | Create |
| `.aios-core/development/tasks/qa-gate.md` | Modify |
| `.aios-core/development/tasks/qa-review-story.md` | Modify |
| `tests/code-intel/qa-helper.test.js` | Create |
| `.aios-core/data/entity-registry.yaml` | Modify (add qa-helper entity) |

---

## Dev Agent Record

_Populated by @dev during implementation._

### Agent Model Used
Claude Opus 4.6

### Debug Log References
- 40/40 qa-helper.test.js tests passing
- 156/156 full code-intel suite (7 suites, 0 regressions)

### Completion Notes List
- qa-helper.js follows exact same pattern as dev-helper.js (NOG-3 reference)
- RISK_THRESHOLDS consistent with dev-helper.js (LOW_MAX: 4, MEDIUM_MAX: 15)
- COVERAGE_THRESHOLDS: NO_TESTS (0), INDIRECT (1-2), MINIMAL (3-5), GOOD (>5)
- suggestGateInfluence is sync (no provider dependency) — advisory only for HIGH risk
- getReferenceImpact uses per-file try/catch so individual file failures don't break entire result
- qa-gate.md: Added "Code Intelligence Enhancement" section with Blast Radius, Test Coverage, Gate Influence steps (all conditional on isCodeIntelAvailable)
- qa-review-story.md: Added step "0b. Code Intelligence: Reference Impact" between CodeRabbit and Risk Assessment (conditional)
- Entity registered in entity-registry.yaml under modules.qa-helper

### File List (Implementation)
| File | Action |
|------|--------|
| `.aios-core/core/code-intel/helpers/qa-helper.js` | Created |
| `.aios-core/development/tasks/qa-gate.md` | Modified |
| `.aios-core/development/tasks/qa-review-story.md` | Modified |
| `tests/code-intel/qa-helper.test.js` | Created |
| `.aios-core/data/entity-registry.yaml` | Modified |

---

## QA Results

### Review Date: 2026-02-20

### Reviewed By: Quinn (Test Architect)

### Code Quality Assessment

Implementacao de alta qualidade. `qa-helper.js` segue exatamente o pattern estabelecido por `dev-helper.js` (NOG-3): guard `isCodeIntelAvailable()`, input validation, try/catch com return null, JSDoc completo, constantes exportadas. RISK_THRESHOLDS identicos entre os dois helpers. COVERAGE_THRESHOLDS novo e bem definido com boundaries claras.

Design robusto: `getTestCoverage` e `getReferenceImpact` usam per-item try/catch dentro do `Promise.all`, garantindo que falha em um symbol/file nao compromete os demais resultados.

### Compliance Check

- Coding Standards: OK — CommonJS, 'use strict', kebab-case filename, JSDoc
- Project Structure: OK — helpers/ directory, tests/code-intel/ location
- Testing Strategy: OK — 40 tests, T1-T11 spec coverage, boundary tests, edge cases
- All ACs Met: OK — AC1 (T1,T2), AC2 (T4,T5), AC3 (T7), AC4 (T9,T10), AC5 (T3,T6,T8,T11)

### Test Evidence

- qa-helper.test.js: **40/40 PASS**
- Full code-intel suite: **156/156 PASS** (7 suites, 0 regressions)
- Coverage: 94.91% stmts, 97.61% branches, 100% functions, 93.47% lines
- Uncovered lines 79, 91, 127 are inner catch blocks in `.map()` callbacks — acceptable

### Pattern Compliance (qa-helper vs dev-helper)

| Aspecto | Consistente |
|---------|-------------|
| Import pattern (`../index`) | OK |
| `isCodeIntelAvailable()` guard | OK |
| Input validation (null/empty) | OK (improved — checks `.length`) |
| Error handling (catch return null) | OK |
| RISK_THRESHOLDS values | OK (identical) |
| JSDoc complete | OK |
| Private helpers `_` prefix | OK |
| Constants exported for testing | OK |

### Task Modifications Review

- **qa-gate.md**: "Code Intelligence Enhancement" section correctly placed before "Gate Decision Criteria". Three subsections (Blast Radius, Test Coverage, Gate Influence) with clear conditional language and fallback guarantee.
- **qa-review-story.md**: Step "0b" correctly inserted between CodeRabbit (Step 0) and Risk Assessment (Step 1). Conditional execution, fallback guarantee documented.
- Both tasks function identically without provider — verified by AC5 tests.

### Security Review

No security concerns. Helper only consumes internal enricher/client APIs with no external input processing.

### Performance Considerations

Concurrent calls via `Promise.all` in `getTestCoverage` and `getReferenceImpact`. Inherited 5s timeout from client circuit breaker. Provider unavailability results in immediate null return (no latency).

### Gate Status

Gate: PASS → docs/qa/gates/nog-4-qa-gate-enhancement.yml

### Recommended Status

Ready for Done

---

## Change Log

| Date | Author | Change |
|------|--------|--------|
| 2026-02-15 | @devops | Story created (v1.0 — Nogic-specific) |
| 2026-02-15 | @architect | Rewrite v2.0 — provider-agnostic, reduced from 5 to 3 points |
| 2026-02-15 | @po | v2.1 — Reduced Tasks Impactadas from 4 to 2 (qa-trace/qa-generate deferred to NOG-4B) |
| 2026-02-20 | @po (Pax) | v3.0 — Auto-fix: Executor Assignment, Story format, Scope (IN/OUT), Risks, DoD, Dev Notes (Source Tree, Testing, NOG-1/NOG-3 context, Coverage mapping), CodeRabbit Integration, Tasks with subtasks + AC mapping, entity-registry task, Dev Agent Record/QA Results placeholders |
| 2026-02-20 | @dev (Dex) | v3.1 — Implementation complete: qa-helper.js (4 functions), qa-gate.md + qa-review-story.md modified, 40/40 tests, 156/156 suite, entity registered. Status → Ready for Review |
| 2026-02-20 | @qa (Quinn) | v3.2 — QA Review PASS (100/100). Gate: docs/qa/gates/nog-4-qa-gate-enhancement.yml |
| 2026-02-21 | @devops (Gage) | v3.3 — Committed (8334b4c7) and pushed to feat/epic-nogic-code-intelligence |
| 2026-02-21 | @po (Pax) | v4.0 — Story closed. Status → Done |
