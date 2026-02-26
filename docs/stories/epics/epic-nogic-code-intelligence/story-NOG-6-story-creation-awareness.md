# Story NOG-6: Story Creation with Code Awareness

## Metadata
- **Story ID:** NOG-6
- **Epic:** Code Intelligence Integration (Provider-Agnostic)
- **Status:** Done
- **Priority:** P2 - Medium
- **Points:** 2
- **Agent:** @sm (River) + @po (Pax)
- **Blocked By:** NOG-1
- **Created:** 2026-02-15
- **Updated:** 2026-02-21 (v3.0 — PO validation auto-fix)

---

## Executor Assignment

```yaml
executor: "@dev"
quality_gate: "@qa"
quality_gate_tools:
  - code-review
  - pattern-compliance
  - task-integration-review
```

---

## Story

**As a** @sm or @po agent,
**I want** code intelligence integrated into story creation and validation workflows,
**so that** new stories are created with awareness of existing code (duplicate detection, relevant file suggestions) and validated against real codebase references — all with graceful fallback when no provider is available.

---

## Description

Enriquecer a criacao e validacao de stories com awareness do codigo existente, para que stories ja nascem com referencia precisa a arquivos, modulos e patterns relevantes. O helper segue o mesmo pattern do `dev-helper.js` (NOG-3), `qa-helper.js` (NOG-4) e `planning-helper.js` (NOG-5): funcoes que retornam null gracefully sem provider, zero throws.

### Tasks Impactadas

| Task | Capabilities Usadas | Integracao |
|------|---------------------|-----------|
| `create-next-story.md` | detectDuplicates, getConventions, findReferences, analyzeCodebase | Detectar stories/codigo duplicado, sugerir arquivos relevantes, naming conventions |
| `validate-next-story.md` | detectDuplicates, findReferences | Validar que story nao duplica funcionalidade existente, check automatico |

---

## Acceptance Criteria

### AC1: Duplicate Story Detection
- [x] **Given** @sm cria nova story
- [x] **When** provider disponivel e `detectDuplicates` encontra match similar
- [x] **Then** aviso mostrado: "Funcionalidade similar ja existe em [file]. Considere ADAPT em vez de CREATE"

### AC2: File Reference Suggestion
- [x] **Given** @sm cria nova story com descricao
- [x] **When** provider disponivel
- [x] **Then** secao "Suggested Files" pre-populada com arquivos relevantes identificados via findReferences + analyzeCodebase

### AC3: Validation Enhancement
- [x] **Given** @po valida story draft
- [x] **When** provider disponivel
- [x] **Then** checklist de validacao inclui item "No duplicate functionality" verificado automaticamente

### AC4: Fallback
- [x] **Given** NENHUM provider disponivel
- [x] **When** story criada/validada
- [x] **Then** funciona exatamente como hoje, sem secoes de code intelligence

---

## Tasks / Subtasks

- [x] 1. Criar helper `.aios-core/core/code-intel/helpers/story-helper.js` (AC: #1, #2, #3, #4)
  - [x] 1.1 Implementar `detectDuplicateStory(description)` — chama enricher.detectDuplicates, retorna { matches, warning } ou null (AC: #1)
  - [x] 1.2 Implementar `suggestRelevantFiles(description)` — chama client.findReferences + client.analyzeCodebase, retorna { files, codebaseContext } ou null (AC: #2)
  - [x] 1.3 Implementar `validateNoDuplicates(description)` — chama enricher.detectDuplicates, retorna { hasDuplicates, matches, suggestion } ou null (AC: #3)
  - [x] 1.4 Todas as funcoes retornam null gracefully se provider indisponivel (AC: #4)
  - [x] 1.5 Exportar private helpers para testability (_formatDuplicateWarning)
- [x] 2. Modificar `create-next-story.md` — integrar deteccao de duplicacao e sugestao de arquivos (AC: #1, #2, #4)
  - [x] 2.1 Adicionar step "Code Intelligence: Duplicate Detection & File Suggestions" com detectDuplicateStory + suggestRelevantFiles
  - [x] 2.2 Garantir que step e skipped silenciosamente se `isCodeIntelAvailable()` retorna false
- [x] 3. Modificar `validate-next-story.md` — adicionar check de duplicacao automatico (AC: #3, #4)
  - [x] 3.1 Adicionar step "Code Intelligence: No Duplicate Functionality" com validateNoDuplicates
  - [x] 3.2 Garantir fallback graceful (validacao funciona normalmente sem provider)
- [x] 4. Escrever testes unitarios para story-helper.js (AC: #1, #2, #3, #4)
  - [x] 4.1 Testes com provider mockado (happy path para cada funcao)
  - [x] 4.2 Testes sem provider (fallback graceful — retorna null)
  - [x] 4.3 Testes de detectDuplicateStory com matches encontrados vs nenhum match
  - [x] 4.4 Testes de suggestRelevantFiles com resultados parciais (findReferences ok, analyzeCodebase falha)
  - [x] 4.5 Teste de integracao: todas as funcoes fallback simultaneamente
  - [x] 4.6 Teste de input validation: null/empty para cada funcao
- [x] 5. Registrar entidade story-helper no entity-registry.yaml (AC: N/A — IDS compliance)
  - [x] 5.1 Adicionar entry com path, type, purpose, keywords, usedBy, dependencies

---

## Scope

**IN:**
- Helper `story-helper.js` com funcoes de code intelligence para @sm/@po
- Modificacao de `create-next-story.md` — deteccao de duplicacao + sugestao de arquivos
- Modificacao de `validate-next-story.md` — check de duplicacao automatico
- Testes unitarios para story-helper.js
- Fallback graceful em todas as integracoes
- Registro no entity-registry.yaml

**OUT:**
- Outros helpers (devops-helper, creation-helper) — stories NOG-7, NOG-8
- Modificacao de tasks de outros agentes (@dev, @qa, @architect, etc.)
- Novos providers de code intelligence
- Modificacao do code-intel-client ou enricher (consumo apenas)
- UI/Dashboard para code intelligence
- Naming convention enforcement (getConventions mencionada na tabela Tasks Impactadas mas nao implementada — pode ser adicionada em story futura)

---

## Risks

| Risco | Prob. | Impacto | Mitigacao |
|-------|-------|---------|-----------|
| detectDuplicates pode retornar falsos positivos em codebases grandes | Media | Medio | warning e advisory apenas, nunca bloqueia criacao; usuario decide |
| analyzeCodebase pode ser lento para sugestao de arquivos | Baixa | Baixo | Timeout herdado do client (5s); skip se provider indisponivel |
| Integracao em create-next-story.md pode interferir no flow de criacao | Baixa | Medio | Step condicional com auto-skip; nao altera steps existentes |
| validate-next-story.md ja tem muitos checks — adicionar mais pode confundir | Baixa | Baixo | Adicionar como item opcional no checklist, nao como blocker |

---

## Definition of Done

- [x] `story-helper.js` criado com 3 funcoes (detectDuplicateStory, suggestRelevantFiles, validateNoDuplicates)
- [x] Todas as funcoes retornam null gracefully sem provider (0 throws)
- [x] `create-next-story.md` tem step de Duplicate Detection + File Suggestions opcional
- [x] `validate-next-story.md` inclui check de No Duplicate Functionality quando provider disponivel
- [x] Testes unitarios passando (>80% coverage no story-helper.js)
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
│   │       │   Primitives used: findReferences, analyzeCodebase
│   │       ├── code-intel-enricher.js      # 5 composite capabilities
│   │       │   Composites used: detectDuplicates, getConventions
│   │       ├── providers/
│   │       │   ├── provider-interface.js   # Abstract contract
│   │       │   └── code-graph-provider.js  # Code Graph MCP adapter
│   │       └── helpers/
│   │           ├── dev-helper.js           # Existente (NOG-3) — REFERENCE PATTERN
│   │           ├── qa-helper.js            # Existente (NOG-4)
│   │           ├── planning-helper.js      # Existente (NOG-5)
│   │           └── story-helper.js         # Create — helper para @sm/@po tasks
│   └── development/
│       └── tasks/
│           ├── create-next-story.md        # Modify — adicionar Duplicate Detection + File Suggestions
│           └── validate-next-story.md      # Modify — adicionar No Duplicate Functionality check
└── tests/
    └── code-intel/
        ├── code-intel-client.test.js       # Existente (NOG-1)
        ├── code-intel-enricher.test.js     # Existente (NOG-1)
        ├── dev-helper.test.js              # Existente (NOG-3)
        ├── qa-helper.test.js               # Existente (NOG-4)
        ├── planning-helper.test.js         # Existente (NOG-5)
        └── story-helper.test.js            # Create — testes do helper
```

### Contexto de NOG-1 (Infrastructure — Done)

O modulo `code-intel` esta completo e funcional (197/197 testes, 8 suites):

**API principal para consumo nesta story:**

```javascript
// Importar via index.js
const { getEnricher, getClient, isCodeIntelAvailable } = require('.aios-core/core/code-intel');

// Verificar disponibilidade (OBRIGATORIO antes de chamar)
if (isCodeIntelAvailable()) {
  const enricher = getEnricher();
  const client = getClient();

  // Composite capabilities (usadas no story-helper)
  const dupes = await enricher.detectDuplicates('description', { path: '.' });
  // → { matches: [...], codebaseOverview: { ... } } ou null

  // Primitive capabilities (usadas diretamente no story-helper)
  const refs = await client.findReferences('search term');
  // → [{ file: '...', line: N, context: '...' }] ou null

  const codebase = await client.analyzeCodebase('.');
  // → { patterns: [...], ... } ou null
}
```

**Garantias do modulo:**
- Nunca lanca excecao (try/catch em todas as capabilities)
- Circuit breaker: abre apos 3 falhas consecutivas, reseta em 60s
- Session cache: TTL 5min, evita re-queries identicas
- `isCodeIntelAvailable()` retorna false se nenhum provider configurado

### Contexto de NOG-3/NOG-4/NOG-5 (Helpers — Done, REFERENCE PATTERN)

O `dev-helper.js`, `qa-helper.js` e `planning-helper.js` sao os patterns de referencia para criar o `story-helper.js`:

```javascript
// Pattern a seguir (de dev-helper.js/qa-helper.js/planning-helper.js):
'use strict';
const { getEnricher, getClient, isCodeIntelAvailable } = require('../index');

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

module.exports = { myFunction };
```

### Funcoes do story-helper — Detalhamento

| Funcao | Capabilities | Input | Output |
|--------|-------------|-------|--------|
| `detectDuplicateStory(description)` | enricher.detectDuplicates | string (description) | `{ matches, warning }` ou null |
| `suggestRelevantFiles(description)` | client.findReferences + client.analyzeCodebase | string (description) | `{ files, codebaseContext }` ou null |
| `validateNoDuplicates(description)` | enricher.detectDuplicates | string (description) | `{ hasDuplicates, matches, suggestion }` ou null |

**Nota sobre `detectDuplicateStory` vs `validateNoDuplicates`:**
- `detectDuplicateStory` e para uso em **criacao** (@sm) — retorna warning advisory
- `validateNoDuplicates` e para uso em **validacao** (@po) — retorna boolean hasDuplicates para checklist

### Contexto Tecnico

- **CommonJS:** Usar `require()` / `module.exports` (padrao do projeto)
- **Diretorio helpers/:** Ja existe (criado no NOG-3)
- **Pattern de integracao em tasks:** Adicionar steps markdown que instruem o agente a chamar o helper; usar linguagem condicional ("se code intelligence disponivel, executar...")
- **Advisory only:** Deteccao de duplicatas NUNCA bloqueia criacao/validacao — apenas avisa

### Testing

**Framework:** Jest (padrao do projeto)
**Location:** `tests/code-intel/story-helper.test.js`

| # | Cenario | Tipo | AC Ref | Esperado |
|---|---------|------|--------|----------|
| T1 | detectDuplicateStory com provider — matches encontrados | Unit | AC1 | Retorna { matches: [...], warning: "..." } |
| T2 | detectDuplicateStory com provider — nenhum match | Unit | AC1 | Retorna null (nenhuma duplicata) |
| T3 | detectDuplicateStory sem provider | Unit | AC4 | Retorna null, sem throw |
| T4 | suggestRelevantFiles com provider | Unit | AC2 | Retorna { files: [...], codebaseContext: {...} } |
| T5 | suggestRelevantFiles com resultado parcial (findReferences ok, analyzeCodebase falha) | Unit | AC2 | Retorna resultado parcial (files sem codebaseContext) |
| T6 | suggestRelevantFiles sem provider | Unit | AC4 | Retorna null, sem throw |
| T7 | validateNoDuplicates com provider — duplicatas encontradas | Unit | AC3 | Retorna { hasDuplicates: true, matches: [...], suggestion: "ADAPT" } |
| T8 | validateNoDuplicates com provider — sem duplicatas | Unit | AC3 | Retorna { hasDuplicates: false, matches: [], suggestion: null } |
| T9 | validateNoDuplicates sem provider | Unit | AC4 | Retorna null, sem throw |
| T10 | Todas as funcoes fallback (provider indisponivel) | Integration | AC4 | 3/3 retornam null |
| T11 | Input validation: null/empty para cada funcao | Unit | ALL | Retorna null sem throw |

**Mocking:** Mock do `getEnricher()`, `getClient()` e `isCodeIntelAvailable()` de `.aios-core/core/code-intel/index.js` (mesmo pattern do dev-helper.test.js, qa-helper.test.js e planning-helper.test.js).

---

## CodeRabbit Integration

### Story Type Analysis

**Primary Type:** Code/Features/Logic (helper module + task modifications)
**Secondary Type(s):** Process Integration (story creation/validation workflow enhancement)
**Complexity:** Low-Medium

### Specialized Agent Assignment

**Primary Agents:**
- @dev: Implementation of story-helper.js, task modifications, and tests

**Supporting Agents:**
- @qa: Quality gate review (pattern compliance, task integration correctness)

### Quality Gate Tasks

- [x] Pre-Commit (@dev): Run before marking story complete
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
- Fallback graceful em todas as funcoes do story-helper (zero throws sem provider)
- Integracao correta com enricher/client API (parametros, return types)
- Task modifications nao quebram workflows existentes de story creation/validation
- Advisory-only behavior (deteccao nunca bloqueia)

**Secondary Focus:**
- _formatDuplicateWarning message clarity
- detectDuplicateStory vs validateNoDuplicates separation of concerns

---

## File List

| File | Action |
|------|--------|
| `.aios-core/core/code-intel/helpers/story-helper.js` | Create |
| `.aios-core/development/tasks/create-next-story.md` | Modify |
| `.aios-core/development/tasks/validate-next-story.md` | Modify |
| `tests/code-intel/story-helper.test.js` | Create |
| `.aios-core/data/entity-registry.yaml` | Modify (add story-helper entity) |

---

## Dev Agent Record

### Agent Model Used
Claude Opus 4.6

### Debug Log References
- No debug issues encountered during implementation.

### Completion Notes List
- story-helper.js follows exact same pattern as dev-helper.js, qa-helper.js, planning-helper.js
- detectDuplicateStory vs validateNoDuplicates: same enricher call but different return shapes (advisory warning vs boolean checklist)
- suggestRelevantFiles uses per-capability try/catch for partial result acceptance (findReferences can succeed while analyzeCodebase fails)
- _formatDuplicateWarning limits file list to 5 items max
- Both task modifications are conditional steps that auto-skip when provider unavailable
- 24 tests covering all 11 scenarios (T1-T11) plus edge cases
- Full regression: 256 suites passed, 6367 tests, 0 failures

### File List (Implementation)
| File | Action |
|------|--------|
| `.aios-core/core/code-intel/helpers/story-helper.js` | Created |
| `.aios-core/development/tasks/create-next-story.md` | Modified (added step 1.2) |
| `.aios-core/development/tasks/validate-next-story.md` | Modified (added step 8.1) |
| `tests/code-intel/story-helper.test.js` | Created |
| `.aios-core/data/entity-registry.yaml` | Modified (added story-helper entity) |

---

## QA Results

### Review Date: 2026-02-21
### Reviewer: @qa (Quinn)
### Gate Decision: **PASS**

---

### 1. AC Traceability

| AC | Status | Evidence |
|----|--------|----------|
| AC1: Duplicate Story Detection | MET | `detectDuplicateStory()` calls `enricher.detectDuplicates`, returns `{ matches, warning }` with formatted advisory message. Tests T1-T2 verify both match/no-match paths. Task `create-next-story.md` step 1.2 integrates the call. |
| AC2: File Reference Suggestion | MET | `suggestRelevantFiles()` composes `client.findReferences` + `client.analyzeCodebase`, returns `{ files, codebaseContext }`. Per-capability try/catch allows partial results (T5). Task `create-next-story.md` step 1.2 pre-populates "Suggested Files" in Dev Notes. |
| AC3: Validation Enhancement | MET | `validateNoDuplicates()` returns `{ hasDuplicates, matches, suggestion }` boolean for @po checklist. Tests T7-T8 verify both duplicate/no-duplicate paths. Task `validate-next-story.md` step 8.1 adds the check. |
| AC4: Fallback | MET | All 3 functions return null when `isCodeIntelAvailable()` is false. Tests T3, T6, T9 verify per-function. T10 verifies all 3 simultaneously. T11 verifies null/empty input. Both task modifications specify "Auto-skip if unavailable". |

**AC Coverage: 4/4 MET**

---

### 2. Test Coverage Analysis

| Metric | Value |
|--------|-------|
| Total tests | 24 |
| Passing | 24/24 |
| Story scenarios covered | T1-T11 (all 11) |
| Statement coverage | 98% |
| Branch coverage | 97.61% |
| Function coverage | 100% |
| Line coverage | 97.56% |
| Uncovered | Line 84 (outer catch safety net in suggestRelevantFiles) |

**Assessment:** Exceeds >80% DoD threshold. All story-defined scenarios (T1-T11) implemented plus 13 additional edge case tests.

---

### 3. Code Quality Analysis

**Pattern Compliance:**
- Follows exact same pattern as dev-helper.js (NOG-3), qa-helper.js (NOG-4), planning-helper.js (NOG-5)
- `'use strict'` + CommonJS imports + input validation + `isCodeIntelAvailable()` guard + try/catch returning null
- JSDoc on all exported functions
- Private helper exposed with `_` prefix convention for testability

**Separation of Concerns:**
- `detectDuplicateStory` (creation/@sm) vs `validateNoDuplicates` (validation/@po) — same enricher call, different return shapes. Clean separation appropriate for different consumer contexts.

**Advisory-Only Behavior:**
- Both task modifications explicitly state "advisory only" and "does NOT block"
- No throws in any code path — verified by tests

**Partial Result Acceptance:**
- `suggestRelevantFiles` per-capability try/catch allows `findReferences` to succeed while `analyzeCodebase` fails (and vice-versa). Consistent with `qa-helper.js` pattern.

**Task Integration:**
- `create-next-story.md`: Step 1.2 added between step 1 (Identify Story) and step 2 (Gather Requirements) — logical placement
- `validate-next-story.md`: Step 8.1 added between CodeRabbit Validation (step 8) and Anti-Hallucination (step 9) — logical placement
- Both steps are fully conditional and do not modify existing steps

---

### 4. Regression Analysis

| Check | Result |
|-------|--------|
| Full test suite | 6367/6367 passed (256 suites) |
| Existing helpers | No changes to dev-helper, qa-helper, planning-helper |
| Existing tasks | create-next-story.md and validate-next-story.md existing steps unmodified |
| Entity registry | story-helper added, no existing entries modified |

---

### 5. Issues Found

**None.** Implementation is clean, follows established patterns precisely, all ACs met, tests comprehensive.

---

### 6. Verdict

**PASS** — Story NOG-6 meets all acceptance criteria, follows established code-intel helper patterns, has comprehensive test coverage (98%+ across all metrics), and introduces zero regressions. Ready for commit and push.

— Quinn, guardiao da qualidade 🛡️

---

## Change Log

| Date | Author | Change |
|------|--------|--------|
| 2026-02-15 | @devops | Story created (v1.0 — Nogic-specific) |
| 2026-02-15 | @architect | Rewrite v2.0 — provider-agnostic, reduced from 3 to 2 points |
| 2026-02-21 | @po (Pax) | v3.0 — Auto-fix: Executor Assignment, Story format, Scope (IN/OUT), Risks, DoD, Dev Notes (Source Tree, Testing, NOG-1/NOG-3/NOG-4/NOG-5 context, function mapping, API reference), CodeRabbit Integration, Tasks with subtasks + AC mapping, entity-registry task, Dev Agent Record/QA Results placeholders. 3 helper functions mapped to capabilities. 11 test scenarios defined. |
| 2026-02-21 | @dev (Dex) | v4.0 — Implementation complete: story-helper.js (3 functions + _formatDuplicateWarning), create-next-story.md (step 1.2), validate-next-story.md (step 8.1), 24 tests passing, entity registered. Full regression: 6367/6367 passed. |
| 2026-02-21 | @po (Pax) | v5.0 — Story closed. QA PASS. Commit ef403342. Status: Done. |
