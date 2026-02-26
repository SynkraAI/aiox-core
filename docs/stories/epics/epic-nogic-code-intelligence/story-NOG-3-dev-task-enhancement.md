# Story NOG-3: Dev Task Enhancement (IDS G4 + Conventions)

## Metadata
- **Story ID:** NOG-3
- **Epic:** Code Intelligence Integration (Provider-Agnostic)
- **Status:** Ready for Review
- **Priority:** P1 - High
- **Points:** 3
- **Agent:** @dev (Dex)
- **Blocked By:** NOG-1
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
  - task-integration-review
```

---

## Story

**As a** @dev agent,
**I want** code intelligence integrated into my development tasks (IDS G4 automatic, conventions check, duplicate detection),
**so that** I can automatically detect duplication before creating code, follow existing naming conventions, and get blast radius information for refactoring — all with graceful fallback when no provider is available.

---

## Description

Integrar code intelligence nas tasks de desenvolvimento do @dev para automatizar o IDS Gate G4 (antes de criar codigo) e enriquecer o fluxo de desenvolvimento com visao semantica do codebase.

### Tasks Impactadas

| Task | Capabilities Usadas | Integracao |
|------|---------------------|-----------|
| `dev-develop-story.md` | findReferences, getConventions, findDefinition | Antes de cada novo arquivo/funcao, verificar duplicacao e naming |
| `create-service.md` | detectDuplicates, analyzeCodebase | Antes de scaffoldar, verificar se service similar existe |
| `dev-suggest-refactoring.md` | findReferences, assessImpact | Sugestoes baseadas em blast radius real |
| `build-autonomous.md` | detectDuplicates, getConventions | IDS G4 automatico no loop autonomo |

---

## Acceptance Criteria

### AC1: IDS Gate G4 Automatico
- [ ] **Given** @dev esta no modo YOLO ou Interactive
- [ ] **When** vai criar um novo arquivo ou funcao
- [ ] **Then** `detectDuplicates` e chamado automaticamente, resultado mostrado como "Code Intelligence Suggestion" (se provider disponivel)

### AC2: Duplicate Detection
- [ ] **Given** @dev vai criar novo modulo/servico
- [ ] **When** `findReferences` detecta entidade similar existente
- [ ] **Then** mostra aviso com link para codigo existente e sugere REUSE ou ADAPT

### AC3: Refactoring Intelligence
- [ ] **Given** @dev executa `*suggest-refactoring`
- [ ] **When** provider disponivel
- [ ] **Then** sugestoes incluem blast radius (arquivos afetados) e risk level (LOW/MEDIUM/HIGH)

### AC4: Fallback sem Provider
- [ ] **Given** NENHUM provider disponivel
- [ ] **When** @dev executa qualquer task
- [ ] **Then** tasks funcionam exatamente como antes, sem nenhuma diferenca visivel

---

## Tasks / Subtasks

- [x] 1. Criar helper `.aios-core/core/code-intel/helpers/dev-helper.js` (AC: #1, #2)
  - [x] 1.1 Implementar `checkBeforeWriting(fileName, description)` — chama detectDuplicates + findReferences
  - [x] 1.2 Implementar `suggestReuse(symbol)` — chama findReferences + findDefinition, formata sugestao REUSE/ADAPT
  - [x] 1.3 Implementar `getConventionsForPath(path)` — chama getConventions, retorna naming patterns
  - [x] 1.4 Implementar `assessRefactoringImpact(files)` — chama assessImpact, retorna blast radius + risk level
  - [x] 1.5 Todas as funcoes retornam null gracefully se provider indisponivel
- [x] 2. Modificar `dev-develop-story.md` — adicionar checkpoint code intelligence antes de criar arquivo (AC: #1, #4)
  - [x] 2.1 Adicionar step "Code Intelligence Check" antes de criar novos arquivos
  - [x] 2.2 Importar dev-helper, chamar `checkBeforeWriting()`, exibir resultado como "Code Intelligence Suggestion"
  - [x] 2.3 Garantir que step e skipped silenciosamente se `isCodeIntelAvailable()` retorna false
- [x] 3. Modificar `create-service.md` — verificar duplicacao antes de scaffold (AC: #2, #4)
  - [x] 3.1 Adicionar step pre-scaffold que chama `checkBeforeWriting()` com nome do service
  - [x] 3.2 Se matches encontrados, exibir aviso e sugerir REUSE/ADAPT antes de prosseguir
  - [x] 3.3 Garantir fallback graceful (scaffold continua normalmente sem provider)
- [x] 4. Modificar `dev-suggest-refactoring.md` — adicionar blast radius (AC: #3, #4)
  - [x] 4.1 Adicionar step que chama `assessRefactoringImpact()` para cada arquivo candidato
  - [x] 4.2 Incluir blast radius e risk level (LOW: <5 refs, MEDIUM: 5-15, HIGH: >15) no output
  - [x] 4.3 Garantir fallback graceful (sugestoes funcionam sem blast radius se provider indisponivel)
- [x] 5. Modificar `build-autonomous.md` — IDS G4 automatico no loop autonomo (AC: #1, #4)
  - [x] 5.1 Adicionar checkpoint code intelligence no loop de criacao de arquivos
  - [x] 5.2 Chamar `checkBeforeWriting()` antes de cada write operation
  - [x] 5.3 Logar resultado em decision-log se duplicacao detectada
- [x] 6. Escrever testes unitarios para dev-helper.js (AC: #1, #2, #3, #4)
  - [x] 6.1 Testes com provider mockado (happy path)
  - [x] 6.2 Testes sem provider (fallback graceful — retorna null)
  - [x] 6.3 Teste de integracao: checkBeforeWriting com match real vs sem match

---

## Scope

**IN:**
- Helper `dev-helper.js` com funcoes de code intelligence para @dev
- Modificacao de `dev-develop-story.md` — checkpoint pre-criacao de arquivo
- Modificacao de `create-service.md` — verificacao pre-scaffold
- Modificacao de `dev-suggest-refactoring.md` — blast radius em sugestoes
- Modificacao de `build-autonomous.md` — IDS G4 no loop autonomo
- Testes unitarios para dev-helper.js
- Fallback graceful em todas as integracoes

**OUT:**
- Outros helpers (qa-helper, planning-helper, story-helper) — stories NOG-4 a NOG-8
- Modificacao de tasks de outros agentes (@qa, @sm, @po, etc.)
- Novos providers de code intelligence
- UI/Dashboard para code intelligence
- Modificacao do code-intel-client ou enricher (consumo apenas)

---

## Risks

| Risco | Prob. | Impacto | Mitigacao |
|-------|-------|---------|-----------|
| Modificacao de tasks quebra comportamento existente | Media | Alto | Testes de regressao antes/depois; fallback graceful obrigatorio |
| `checkBeforeWriting()` adiciona latencia ao fluxo de dev | Baixa | Medio | Timeout 5s (herdado do client); skip se provider indisponivel |
| Falsos positivos de duplicacao confundem @dev | Media | Medio | Exibir como "Suggestion" (nao blocker); incluir link para codigo similar |
| Task markdown injection causa efeitos colaterais | Baixa | Medio | Adicionar steps como blocos isolados; testar tasks modificadas manualmente |

---

## Definition of Done

- [x] `dev-helper.js` criado com 4+ funcoes (checkBeforeWriting, suggestReuse, getConventionsForPath, assessRefactoringImpact)
- [x] Todas as funcoes retornam null gracefully sem provider (0 throws)
- [x] `dev-develop-story.md` tem checkpoint code intelligence funcional
- [x] `create-service.md` verifica duplicacao antes de scaffold
- [x] `dev-suggest-refactoring.md` inclui blast radius quando provider disponivel
- [x] `build-autonomous.md` tem IDS G4 no loop autonomo
- [x] Testes unitarios passando (>80% coverage no dev-helper.js)
- [x] Nenhuma regressao nas 4 tasks modificadas (funcionam identicamente sem provider)
- [x] Entidades registradas no entity-registry.yaml

---

## Dev Notes

### Source Tree Relevante

```
aios-core/
├── .aios-core/
│   ├── core/
│   │   └── code-intel/
│   │       ├── index.js                    # Public API (getEnricher, enrichWithCodeIntel, isCodeIntelAvailable)
│   │       ├── code-intel-client.js        # 8 primitive capabilities + circuit breaker + cache
│   │       ├── code-intel-enricher.js      # 5 composite capabilities (detectDuplicates, assessImpact, etc.)
│   │       ├── providers/
│   │       │   ├── provider-interface.js   # Abstract contract
│   │       │   └── code-graph-provider.js  # Code Graph MCP adapter
│   │       └── helpers/                    # NOVO — criado nesta story
│   │           └── dev-helper.js           # Create — helper para @dev tasks
│   └── development/
│       └── tasks/
│           ├── dev-develop-story.md        # Modify — adicionar checkpoint code intel
│           ├── create-service.md           # Modify — verificar duplicacao pre-scaffold
│           ├── dev-suggest-refactoring.md  # Modify — adicionar blast radius
│           └── build-autonomous.md         # Modify — IDS G4 no loop autonomo
└── tests/
    └── code-intel/
        ├── code-intel-client.test.js       # Existente (NOG-1)
        ├── code-intel-enricher.test.js     # Existente (NOG-1)
        └── dev-helper.test.js              # Create — testes do helper
```

### Contexto de NOG-1 (Predecessor — Done)

O modulo `code-intel` esta completo e funcional (66/66 testes):

**API principal para consumo nesta story:**

```javascript
// Importar via index.js
const { getEnricher, isCodeIntelAvailable, enrichWithCodeIntel } = require('.aios-core/core/code-intel');

// Verificar disponibilidade (OBRIGATORIO antes de chamar)
if (isCodeIntelAvailable()) {
  const enricher = getEnricher();

  // Composite capabilities (usadas no dev-helper)
  const dupes = await enricher.detectDuplicates(description, { path: '.' });
  // → { matches: [...], codebaseOverview: {...} } ou null

  const impact = await enricher.assessImpact(['file1.js', 'file2.js']);
  // → { references: [...], complexity: {...}, blastRadius: N } ou null

  const conventions = await enricher.getConventions('src/');
  // → { patterns: [...], stats: {...} } ou null
}

// Ou via enrichWithCodeIntel (fallback automatico)
const result = await enrichWithCodeIntel(baseResult, {
  capabilities: ['detectDuplicates', 'assessImpact'],
  timeout: 5000,
  fallbackBehavior: 'warn-and-continue'
});
// → { ...baseResult, _codeIntel: { detectDuplicates: {...}, assessImpact: {...} } }
```

**Garantias do modulo:**
- Nunca lanca excecao (try/catch em todas as capabilities)
- Circuit breaker: abre apos 3 falhas consecutivas, reseta em 60s
- Session cache: TTL 5min, evita re-queries identicas
- `isCodeIntelAvailable()` retorna false se nenhum provider configurado

### Contexto Tecnico

- **CommonJS:** Usar `require()` / `module.exports` (padrao do projeto)
- **Diretorio helpers/:** Nao existe ainda — criar `helpers/` dentro de `.aios-core/core/code-intel/`
- **Pattern de integracao em tasks:** Adicionar steps markdown que instruem o agente a chamar o helper; usar linguagem condicional ("se code intelligence disponivel, executar...")
- **Risk Level mapping:** LOW (<5 refs), MEDIUM (5-15 refs), HIGH (>15 refs) — baseado em blastRadius

### Testing

**Framework:** Jest (padrao do projeto)
**Location:** `tests/code-intel/dev-helper.test.js`

| # | Cenario | Tipo | AC Ref | Esperado |
|---|---------|------|--------|----------|
| T1 | checkBeforeWriting com provider (match encontrado) | Unit | AC1 | Retorna { duplicates, suggestion } |
| T2 | checkBeforeWriting com provider (sem match) | Unit | AC1 | Retorna null ou resultado vazio |
| T3 | checkBeforeWriting sem provider | Unit | AC4 | Retorna null, sem throw |
| T4 | suggestReuse encontra definicao existente | Unit | AC2 | Retorna { file, line, suggestion: 'REUSE' } |
| T5 | suggestReuse sem match | Unit | AC2 | Retorna null |
| T6 | assessRefactoringImpact com blast radius | Unit | AC3 | Retorna { blastRadius, riskLevel } |
| T7 | assessRefactoringImpact sem provider | Unit | AC4 | Retorna null |
| T8 | getConventionsForPath retorna patterns | Unit | AC1 | Retorna { patterns, stats } |
| T9 | Todas as funcoes fallback (provider indisponivel) | Integration | AC4 | 4/4 retornam null |

**Mocking:** Mock do `getEnricher()` e `isCodeIntelAvailable()` de `.aios-core/core/code-intel/index.js`.

---

## CodeRabbit Integration

### Story Type Analysis

**Primary Type:** Code/Features/Logic (helper module + task modifications)
**Secondary Type(s):** Process Integration (task workflow enhancement)
**Complexity:** Medium

### Specialized Agent Assignment

**Primary Agents:**
- @dev: Implementation of dev-helper.js, task modifications, and tests

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
- Fallback graceful em todas as funcoes do dev-helper (zero throws sem provider)
- Integracao correta com enricher API (parametros, return types)
- Task modifications nao quebram fluxo existente

**Secondary Focus:**
- Risk level calculation consistency
- Suggestion formatting (REUSE vs ADAPT decision)

---

## File List

| File | Action |
|------|--------|
| `.aios-core/core/code-intel/helpers/dev-helper.js` | Create |
| `.aios-core/development/tasks/dev-develop-story.md` | Modify |
| `.aios-core/development/tasks/create-service.md` | Modify |
| `.aios-core/development/tasks/dev-suggest-refactoring.md` | Modify |
| `.aios-core/development/tasks/build-autonomous.md` | Modify |
| `tests/code-intel/dev-helper.test.js` | Create |
| `.aios-core/data/entity-registry.yaml` | Modify (add dev-helper entity) |

---

## Dev Agent Record

_Populated by @dev during implementation._

### Agent Model Used
Claude Opus 4.6

### Debug Log References
- Nenhum debug necessario — 24/24 testes passaram na primeira execucao

### Completion Notes List
- `dev-helper.js` criado com 4 funcoes publicas + 2 helpers privados + constantes RISK_THRESHOLDS
- Todas as funcoes implementam fallback graceful (retornam null sem provider, sem throw)
- 4 tasks modificadas com checkpoints code intelligence (todos condicionais/advisory)
- 24 testes unitarios cobrindo cenarios T1-T9 da story + edge cases
- Pattern de integracao: steps markdown condicionais ("se code intelligence disponivel...")
- Risk level mapping: LOW (<=4 refs), MEDIUM (5-15 refs), HIGH (>15 refs)

### File List (Implementation)
| File | Action | Details |
|------|--------|---------|
| `.aios-core/core/code-intel/helpers/dev-helper.js` | Created | 4 public functions, 2 private helpers, RISK_THRESHOLDS |
| `tests/code-intel/dev-helper.test.js` | Created | 24 tests (T1-T9 + edge cases), all PASS |
| `.aios-core/development/tasks/dev-develop-story.md` | Modified | Added step 2 "Code Intelligence Check (IDS G4)" |
| `.aios-core/development/tasks/create-service.md` | Modified | Added Step 0: Code Intelligence Duplicate Check |
| `.aios-core/development/tasks/dev-suggest-refactoring.md` | Modified | Added step 6 "Code Intelligence Blast Radius" in Analysis Phase |
| `.aios-core/development/tasks/build-autonomous.md` | Modified | Added step 2 "Code Intelligence IDS G4 Check" in Build Loop |
| `.aios-core/data/entity-registry.yaml` | Modified | Added dev-helper entity |

---

## QA Results

### Review Date: 2026-02-17

### Reviewed By: Quinn (Test Architect)

### Risk Assessment

- Auth/payment/security files touched: No
- Tests added: Yes (24 tests)
- Diff size: ~350 lines (moderate)
- Previous gate: N/A (first review)
- Acceptance criteria count: 4 (low risk)
- **Risk Level: LOW** — standard review depth applied

### Code Quality Assessment

Implementation quality is solid. The `dev-helper.js` module follows established patterns from the code-intel module (NOG-1), uses `'use strict'`, CommonJS, consistent error handling, and proper JSDoc documentation.

**Strengths:**
- Consistent defensive pattern: every function guards with `isCodeIntelAvailable()` before any provider call
- All provider calls wrapped in try/catch, returning null on error (zero-throw guarantee)
- Clean separation: 4 public functions, 2 private helpers, exported constants
- `RISK_THRESHOLDS` exported as constants for testability and future configuration
- `Promise.all` used for concurrent provider calls in `checkBeforeWriting` and `suggestReuse`

**Observations (non-blocking):**
- `dev-helper.js:36` — `enricher.findTests ? null : null` is dead code (always evaluates to null regardless of condition). This placeholder adds no value and slightly obscures the `Promise.all` intent. Recommend removing in a future cleanup pass.
- `suggestReuse` threshold for REUSE vs ADAPT is `>2 refs` (hardcoded at line 85). Consider extracting to `RISK_THRESHOLDS` or a named constant for consistency with the blast radius thresholds pattern.

### Requirements Traceability

| AC | Test Coverage | Validation |
|----|--------------|------------|
| AC1: IDS Gate G4 Automatico | T1, T2, T3 (checkBeforeWriting) + dev-develop-story.md step 2, build-autonomous.md step 2 | Covered |
| AC2: Duplicate Detection | T4, T5 (suggestReuse) + create-service.md Step 0 | Covered |
| AC3: Refactoring Intelligence | T6, T7 (assessRefactoringImpact) + dev-suggest-refactoring.md step 6 | Covered |
| AC4: Fallback sem Provider | T3, T5, T7, T9 (all 4 functions return null) | Covered |

All 4 ACs have direct test coverage and task-level integration.

### Test Architecture Assessment

- **Test count:** 24 tests across 7 describe blocks
- **Coverage:** All 4 public functions + 2 private helpers covered
- **Mock strategy:** Correct — mocks `isCodeIntelAvailable`, `getEnricher`, `getClient` at module level
- **Edge cases:** Provider errors (rejected promise), null results, empty arrays, boundary values for risk thresholds
- **Boundary testing:** `_calculateRiskLevel` tests cover 0, LOW_MAX, LOW_MAX+1, MEDIUM_MAX, MEDIUM_MAX+1
- **T9 integration test:** Validates all 4 functions simultaneously with provider unavailable
- **Result:** 24/24 PASS, 116/116 total code-intel tests PASS

### Compliance Check

- Coding Standards: PASS — `'use strict'`, CommonJS, kebab-case filename, JSDoc
- Project Structure: PASS — `helpers/` inside `code-intel/`, tests in `tests/code-intel/`
- Testing Strategy: PASS — Unit tests with mocked MCP, boundary coverage, integration scenario (T9)
- All ACs Met: PASS — AC1-AC4 all covered by tests and task modifications

### Improvements Checklist

- [x] All 4 public functions implement graceful fallback
- [x] Task modifications use conditional language (non-blocking advisory)
- [x] Entity registered in entity-registry.yaml
- [x] Risk thresholds exported as testable constants
- [x] Remove dead code at `dev-helper.js:36` (`enricher.findTests ? null : null` placeholder) — resolved during review
- [x] Extract REUSE/ADAPT threshold to named constant `REUSE_MIN_REFS` — resolved during review

### Security Review

No security concerns. The module only reads from code-intel providers (no writes, no user input, no file system mutations). All external calls are wrapped in try/catch. No credentials or secrets handled.

### Performance Considerations

- `checkBeforeWriting` makes 2 concurrent calls via `Promise.all` (detectDuplicates + findReferences) — efficient
- All functions respect the upstream circuit breaker (3 failures = open) and session cache (5min TTL)
- Timeout inherited from code-intel-client (5s default) — acceptable for advisory checks
- No performance concerns identified

### Files Modified During Review

| File | Change | Why |
|------|--------|-----|
| `.aios-core/core/code-intel/helpers/dev-helper.js` | Removed dead code placeholder (line 36), extracted `REUSE_MIN_REFS` constant | Dead code cleanup and consistency with `RISK_THRESHOLDS` pattern |

### Gate Status

Gate: **PASS** -> docs/qa/gates/nog-3-dev-task-enhancement.yml

### Recommended Status

PASS — Ready for Done. All acceptance criteria met, 24/24 tests passing, 116/116 code-intel suite passing, no regressions, graceful fallback verified. Two minor observations identified and resolved during review.

---

### Review Date: 2026-02-20 (Re-review)

### Reviewed By: Quinn (Test Architect)

### Risk Assessment

- Auth/payment/security files touched: No
- Tests added: Yes (31 tests — expanded from initial 24)
- Diff size: ~350 lines (moderate)
- Previous gate: PASS (2026-02-17)
- Acceptance criteria count: 4 (low risk)
- **Risk Level: LOW** — standard review depth, re-confirmation pass

### Code Quality Assessment

Re-review confirms previous assessment. Code quality remains solid after CodeRabbit feedback fixes (commit `755df6fb`). The `REUSE_MIN_REFS` constant extraction and dead code removal improved consistency.

### Requirements Traceability (Re-confirmed)

| AC | Test Coverage | Validation |
|----|--------------|------------|
| AC1: IDS Gate G4 Automatico | T1, T2, T3 + dev-develop-story step 2, build-autonomous step 2 | PASS |
| AC2: Duplicate Detection | T4, T5 + create-service Step 0 | PASS |
| AC3: Refactoring Intelligence | T6, T7 + dev-suggest-refactoring step 6 | PASS |
| AC4: Fallback sem Provider | T3, T5, T7, T9 (all 4 functions return null) | PASS |

### Test Architecture Assessment (Updated)

- **Test count:** 31 tests across 7 describe blocks (increased from 24 after CodeRabbit feedback)
- **Full code-intel suite:** 123/123 PASS (6 suites) — zero regressions
- **Mock strategy:** Correct — mocks `isCodeIntelAvailable`, `getEnricher`, `getClient` at module level
- **Boundary/edge coverage:** `_calculateRiskLevel` boundary tests, null/undefined/empty/NaN inputs, rejected promises

### Observations (non-blocking)

1. Story Dev Agent Record still references "24/24 testes" — actual count is now 31 after CodeRabbit fixes. Cosmetic only.
2. Entity registry `dev-helper` entry has `checksum: ''` — other entries have sha256 hashes. Low priority.

### Gate Status

Gate: **PASS** (re-confirmed) -> docs/qa/gates/nog-3-dev-task-enhancement.yml

### Recommended Status

PASS — Ready for Done. Re-review confirms all acceptance criteria met. 31/31 dev-helper tests passing, 123/123 full code-intel suite passing, no regressions. Two non-blocking cosmetic observations noted.

---

## Change Log

| Date | Author | Change |
|------|--------|--------|
| 2026-02-15 | @devops | Story created (v1.0 — Nogic-specific) |
| 2026-02-15 | @architect | Rewrite v2.0 — provider-agnostic, reduced from 5 to 3 points |
| 2026-02-16 | @po (Pax) | v3.0 — Auto-fix: Executor Assignment, Story format, Scope (IN/OUT), Risks, DoD, Dev Notes (Source Tree, Testing, NOG-1 context), CodeRabbit Integration, build-autonomous.md added to Tasks/File List, Task-AC mapping with subtasks, Dev Agent Record/QA Results placeholders |
| 2026-02-16 | @dev (Dex) | v4.0 — Implementation complete: dev-helper.js (4 functions), 4 task modifications, 24/24 tests passing, all tasks [x] |
