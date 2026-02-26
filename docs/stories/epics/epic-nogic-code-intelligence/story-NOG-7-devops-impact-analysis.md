# Story NOG-7: DevOps Pre-Push Impact Analysis

## Metadata
- **Story ID:** NOG-7
- **Epic:** Code Intelligence Integration (Provider-Agnostic)
- **Status:** Done
- **Priority:** P2 - Medium
- **Points:** 2
- **Agent:** @devops (Gage)
- **Blocked By:** NOG-1, NOG-4
- **Created:** 2026-02-15
- **Updated:** 2026-02-21 (v3.0 — SM full expansion)

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

**As a** @devops agent (Gage),
**I want** code intelligence integrated into the pre-push quality gate and PR automation workflows,
**so that** push operations include blast radius analysis (files affected, risk level, test coverage) and PR descriptions are enriched with impact summaries — all with graceful fallback when no provider is available.

---

## Description

Integrar `assessImpact` no `*pre-push` quality gate do @devops para adicionar blast radius analysis antes de push. Complementa os quality gates existentes (lint, test, typecheck, build, CodeRabbit) com code intelligence. Tambem enriquecer PR descriptions com impact summary automatico.

O helper segue o mesmo pattern do `dev-helper.js` (NOG-3), `qa-helper.js` (NOG-4), `planning-helper.js` (NOG-5) e `story-helper.js` (NOG-6): funcoes que retornam null gracefully sem provider, zero throws.

### Tasks Impactadas

| Task | Capabilities Usadas | Integracao |
|------|---------------------|-----------|
| `github-devops-pre-push-quality-gate.md` | assessImpact, analyzeDependencies | Blast radius como gate adicional (advisory) |
| `github-devops-github-pr-automation.md` | assessImpact, findTests | PR description com impact summary |

---

## Scope

### IN Scope

- Criar `devops-helper.js` com 3 funcoes de code intelligence para @devops
- Modificar `github-devops-pre-push-quality-gate.md` com step de Impact Analysis (advisory)
- Modificar `github-devops-github-pr-automation.md` com PR description enrichment
- Testes unitarios para devops-helper.js
- Registrar entidade no Entity Registry

### OUT of Scope

- Modificar o fluxo de push existente (lint, test, typecheck, build, CodeRabbit permanecem inalterados)
- Implementar blocking behavior — impact analysis e advisory only, nunca bloqueia push
- CI/CD pipeline changes
- Novos providers de code intelligence
- Version management integration (removido na v2.0)

---

## Acceptance Criteria

### AC1: Pre-Push Blast Radius
- [ ] **Given** @devops executa `*pre-push`
- [ ] **When** provider disponivel
- [ ] **Then** report inclui secao "Impact Analysis" com: arquivos afetados, risk level, e test coverage das funcoes modificadas

### AC2: PR Description Enrichment
- [ ] **Given** @devops cria PR
- [ ] **When** provider disponivel
- [ ] **Then** PR description inclui secao "Impact Analysis" com blast radius summary

### AC3: High Risk Warning
- [ ] **Given** blast radius indica HIGH risk
- [ ] **When** @devops vai executar push
- [ ] **Then** aviso adicional: "HIGH RISK: {N} files affected. Confirm push?"

### AC4: Fallback
- [ ] **Given** NENHUM provider disponivel
- [ ] **When** `*pre-push` executado
- [ ] **Then** quality gates funcionam exatamente como hoje (zero impact analysis, zero warnings, zero changes)

---

## Risks

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| Impact analysis adds latency to pre-push | Medium | Low | Advisory only, timeout 2s with circuit breaker fallback |
| assessImpact returns false positives (too many files) | Low | Low | Blast radius cap at top 10 files, clear "advisory" label |
| PR description too long with impact section | Low | Low | Summary format with max 10 files listed |

---

## Definition of Done

- [x] `devops-helper.js` created with 3 functions following helper pattern
- [x] `github-devops-pre-push-quality-gate.md` modified with Impact Analysis step
- [x] `github-devops-github-pr-automation.md` modified with PR enrichment step
- [x] All tests passing (unit + regression)
- [x] Test coverage >= 80% for devops-helper.js (100% stmts, 82.69% branches, 100% fns, 100% lines)
- [x] Entity registered in entity-registry.yaml
- [x] Story DoD checklist executed
- [x] Story status set to "Ready for Review"

---

## Tasks / Subtasks

- [x] 1. Criar `devops-helper.js` (AC: 1, 2, 3, 4)
  - [x] 1.1 Criar arquivo `.aios-core/core/code-intel/helpers/devops-helper.js`
  - [x] 1.2 Implementar `assessPrePushImpact(files)` — chama enricher.assessImpact, formata blast radius report
  - [x] 1.3 Implementar `generateImpactSummary(files)` — chama enricher.assessImpact + enricher.findTests, formata resumo para PR description
  - [x] 1.4 Implementar `classifyRiskLevel(blastRadius)` — classifica risk como LOW/MEDIUM/HIGH baseado no blast radius count
  - [x] 1.5 Implementar `_formatImpactReport(impact, riskLevel)` — formata report legivel para pre-push output (private helper)

- [x] 2. Modificar `github-devops-pre-push-quality-gate.md` (AC: 1, 3)
  - [x] 2.1 Adicionar step "Impact Analysis" apos step 9 (Security Scan) e antes do Summary Report
  - [x] 2.2 Step chama `assessPrePushImpact(changedFiles)` e adiciona resultado ao summary
  - [x] 2.3 Se riskLevel === 'HIGH', adicionar warning extra no summary: "HIGH RISK: {N} files affected. Confirm push?"
  - [x] 2.4 Step e condicional: "Auto-skip if code intelligence unavailable"

- [x] 3. Modificar `github-devops-github-pr-automation.md` (AC: 2)
  - [x] 3.1 Adicionar step apos "Generate PR Description" (Step 5) para enriquecer description
  - [x] 3.2 Step chama `generateImpactSummary(changedFiles)` e adiciona secao "Impact Analysis" ao PR body
  - [x] 3.3 Step e condicional: "Auto-skip if code intelligence unavailable"

- [x] 4. Escrever testes (AC: 1, 2, 3, 4)
  - [x] 4.1 Criar `tests/code-intel/devops-helper.test.js`
  - [x] 4.2 Implementar testes T1-T11 conforme Testing section
  - [x] 4.3 Validar cobertura >= 80%

- [x] 5. Registrar entidade no Entity Registry (IDS)
  - [x] 5.1 Adicionar `devops-helper` em `.aios-core/data/entity-registry.yaml`
  - [x] 5.2 Definir `usedBy`, `dependencies`, `keywords`

---

## Dev Notes

### Relevant Source Tree

```
.aios-core/core/code-intel/
  index.js                          # Public exports: getClient(), getEnricher(), isCodeIntelAvailable()
  code-intel-client.js              # Provider abstraction (8 primitives)
  code-intel-enricher.js            # Composite capabilities (assessImpact, findTests, etc.)
  helpers/
    dev-helper.js                   # @dev (NOG-3) — REFERENCE PATTERN
    qa-helper.js                    # @qa (NOG-4)
    planning-helper.js              # @pm/@architect (NOG-5)
    story-helper.js                 # @sm/@po (NOG-6)
    devops-helper.js                # @devops (THIS STORY — CREATE)

.aios-core/development/tasks/
  github-devops-pre-push-quality-gate.md   # MODIFY — add Impact Analysis step
  github-devops-github-pr-automation.md    # MODIFY — add PR enrichment step

tests/code-intel/
  devops-helper.test.js             # CREATE
```

### Contexto de NOG-3/NOG-4/NOG-5/NOG-6 (Helpers — Done, REFERENCE PATTERN)

O `dev-helper.js`, `qa-helper.js`, `planning-helper.js` e `story-helper.js` sao os patterns de referencia para criar o `devops-helper.js`:

```javascript
// Pattern a seguir (de dev-helper.js/qa-helper.js/planning-helper.js/story-helper.js):
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

### Code Intelligence API Reference (de NOG-1)

```javascript
// index.js — Public API
const { isCodeIntelAvailable } = require('.aios-core/core/code-intel');
const { getEnricher } = require('.aios-core/core/code-intel');
const { getClient } = require('.aios-core/core/code-intel');

// Enricher — Composite Capabilities (usadas nesta story)
const enricher = getEnricher();

const impact = await enricher.assessImpact(files);
// → { references: Array, complexity: { average, perFile }, blastRadius: number } ou null
// files: string[] — array de paths dos arquivos alterados

const tests = await enricher.findTests(symbol);
// → [{ file: '...', line: N, context: '...' }] ou null (filtrado para *test*/*spec*/__tests__)

// Client — Primitive Capabilities (se necessario)
const client = getClient();

const deps = await client.analyzeDependencies(path, options);
// → dependency graph do path, ou null
```

**Garantias do modulo:**
- Nunca lanca excecao (try/catch em todas as capabilities)
- Circuit breaker: abre apos 3 falhas consecutivas, reseta em 60s
- Session cache: TTL 5min, evita re-queries identicas
- `isCodeIntelAvailable()` retorna false se nenhum provider configurado

### Funcoes do devops-helper — Detalhamento

| Funcao | Capabilities | Input | Output |
|--------|-------------|-------|--------|
| `assessPrePushImpact(files)` | enricher.assessImpact | string[] (changed files) | `{ impact, riskLevel, report }` ou null |
| `generateImpactSummary(files)` | enricher.assessImpact + enricher.findTests | string[] (changed files) | `{ summary, testCoverage }` ou null |
| `classifyRiskLevel(blastRadius)` | none (pure logic) | number (blast radius count) | `'LOW'` / `'MEDIUM'` / `'HIGH'` |
| `_formatImpactReport(impact, riskLevel)` | none (pure formatting) | impact object + risk string | formatted string |

**Nota sobre `assessPrePushImpact` vs `generateImpactSummary`:**
- `assessPrePushImpact` e para uso no **pre-push gate** (@devops `*pre-push`) — retorna blast radius + risk level + formatted report
- `generateImpactSummary` e para uso na **PR automation** (@devops `*create-pr`) — retorna summary texto para PR description + test coverage info

**Risk Level Classification:**
- `LOW`: blastRadius <= 5 files
- `MEDIUM`: blastRadius 6-15 files
- `HIGH`: blastRadius > 15 files

### Pre-Push Task Integration Context

O `github-devops-pre-push-quality-gate.md` tem 10 steps atuais:
1. Repository Context Detection
2. Check Uncommitted Changes
3. Check Merge Conflicts
4. Run npm run lint
5. Run npm test
6. Run npm run typecheck
7. Run npm run build
8. Run CodeRabbit CLI Review
9. Run Security Scan
10. Verify Story Status

**O novo step "Impact Analysis" sera adicionado como step 9.1** (entre Security Scan e Story Status), seguindo o pattern condicional: "Auto-skip if code intelligence unavailable".

O step NÃO bloqueia push — apenas adiciona informacao ao Summary Report. Se riskLevel === 'HIGH', adiciona warning extra que requer confirmacao adicional do usuario.

### PR Automation Task Integration Context

O `github-devops-github-pr-automation.md` tem 8 steps:
1. Detect Repository Context
2. Get Current Branch
3. Extract Story Information
4. Generate PR Title
5. Generate PR Description
6. Determine Base Branch
7. Create PR via GitHub CLI
8. Assign Reviewers

**O novo step sera adicionado como step 5.1** (entre "Generate PR Description" e "Determine Base Branch"), enriquecendo o description com uma secao "Impact Analysis".

### Contexto Tecnico

- **CommonJS:** Usar `require()` / `module.exports` (padrao do projeto)
- **Diretorio helpers/:** Ja existe (criado no NOG-3)
- **Pattern de integracao em tasks:** Adicionar steps markdown que instruem o agente a chamar o helper; usar linguagem condicional ("se code intelligence disponivel, executar...")
- **Advisory only:** Impact analysis NUNCA bloqueia push — apenas informa e, em caso HIGH, pede confirmacao extra
- **Changed files:** Obter via `git diff --name-only HEAD~1` ou `git diff --cached --name-only` dependendo do contexto

### Testing

**Framework:** Jest (padrao do projeto)
**Location:** `tests/code-intel/devops-helper.test.js`

| # | Cenario | Tipo | AC Ref | Esperado |
|---|---------|------|--------|----------|
| T1 | assessPrePushImpact com provider — impact encontrado | Unit | AC1 | Retorna { impact, riskLevel, report } com blast radius |
| T2 | assessPrePushImpact com provider — nenhum impact | Unit | AC1 | Retorna { impact: null, riskLevel: 'LOW', report: '...' } ou null |
| T3 | assessPrePushImpact sem provider | Unit | AC4 | Retorna null, sem throw |
| T4 | generateImpactSummary com provider — com test coverage | Unit | AC2 | Retorna { summary, testCoverage } |
| T5 | generateImpactSummary com provider — sem test coverage (findTests retorna null) | Unit | AC2 | Retorna resultado parcial { summary, testCoverage: null } |
| T6 | generateImpactSummary sem provider | Unit | AC4 | Retorna null, sem throw |
| T7 | classifyRiskLevel — LOW (<=5) | Unit | AC3 | Retorna 'LOW' |
| T8 | classifyRiskLevel — MEDIUM (6-15) | Unit | AC3 | Retorna 'MEDIUM' |
| T9 | classifyRiskLevel — HIGH (>15) | Unit | AC3 | Retorna 'HIGH' |
| T10 | Todas as funcoes fallback (provider indisponivel) | Integration | AC4 | assessPrePushImpact + generateImpactSummary retornam null |
| T11 | Input validation: null/empty para assessPrePushImpact e generateImpactSummary | Unit | ALL | Retorna null sem throw |

**Mocking:** Mock do `getEnricher()`, `getClient()` e `isCodeIntelAvailable()` de `.aios-core/core/code-intel/index.js` (mesmo pattern do dev-helper.test.js, qa-helper.test.js, planning-helper.test.js e story-helper.test.js).

---

## CodeRabbit Integration

### Story Type Analysis

**Primary Type:** Code/Features/Logic (helper module + task modifications)
**Secondary Type(s):** Deployment (pre-push quality gate enhancement)
**Complexity:** Low-Medium

### Specialized Agent Assignment

**Primary Agents:**
- @dev: Implementation of devops-helper.js, task modifications, and tests

**Supporting Agents:**
- @qa: Quality gate review (pattern compliance, task integration correctness)

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
- Fallback graceful em todas as funcoes do devops-helper (zero throws sem provider)
- Integracao correta com enricher API (assessImpact, findTests — parametros, return types)
- Task modifications nao quebram workflows existentes de pre-push e PR automation
- Advisory-only behavior (impact analysis nunca bloqueia push)

**Secondary Focus:**
- Risk level classification thresholds (LOW/MEDIUM/HIGH)
- _formatImpactReport message clarity e format consistency
- assessPrePushImpact vs generateImpactSummary separation of concerns

---

## File List

| File | Action |
|------|--------|
| `.aios-core/core/code-intel/helpers/devops-helper.js` | Create |
| `.aios-core/development/tasks/github-devops-pre-push-quality-gate.md` | Modify |
| `.aios-core/development/tasks/github-devops-github-pr-automation.md` | Modify |
| `tests/code-intel/devops-helper.test.js` | Create |
| `.aios-core/data/entity-registry.yaml` | Modify (add devops-helper entity) |

---

## Dev Agent Record

### Agent Model Used
Claude Opus 4.6

### Debug Log References
N/A — zero errors during implementation

### Completion Notes List
- devops-helper.js follows exact pattern of story-helper.js (NOG-6 reference)
- 25 tests covering T1-T11 + edge cases, all passing
- Coverage: 100% stmts, 82.69% branches, 100% fns, 100% lines
- Pre-push task: Step 9.1 added (advisory only, auto-skip, HIGH risk warning)
- PR automation task: Step 5.1 added (auto-skip, impact section appended)
- Entity registered in entity-registry.yaml with usedBy, dependencies, keywords
- 2 pre-existing test failures in synapse/engine.test.js (unrelated to NOG-7)

### File List (Implementation)
| File | Action |
|------|--------|
| `.aios-core/core/code-intel/helpers/devops-helper.js` | Created |
| `.aios-core/development/tasks/github-devops-pre-push-quality-gate.md` | Modified (added Step 9.1 + summary section) |
| `.aios-core/development/tasks/github-devops-github-pr-automation.md` | Modified (added Step 5.1) |
| `tests/code-intel/devops-helper.test.js` | Created |
| `.aios-core/data/entity-registry.yaml` | Modified (added devops-helper entity) |

---

## QA Results

### Review Date: 2026-02-21

### Reviewed By: Quinn (Test Architect)

### Code Quality Assessment

Implementation follows the established helper pattern (story-helper.js reference) with high fidelity. All 4 functions are well-structured with consistent input validation, provider guards, and graceful error handling. Separation of concerns between pre-push (assessPrePushImpact) and PR enrichment (generateImpactSummary) is clean. Advisory-only behavior is correctly enforced — impact analysis never blocks push.

### Refactoring Performed

None required. Code quality is solid.

### Compliance Check

- Coding Standards: PASS — CommonJS, 'use strict', JSDoc, consistent formatting
- Pattern Compliance: PASS — Follows story-helper.js pattern exactly (input validation, isCodeIntelAvailable guard, try/catch null return)
- Testing Strategy: PASS — 25 tests, 100% stmts, 82.69% branches, 100% fns, 100% lines
- All ACs Met: PASS — 4/4 ACs mapped to test coverage (AC1: T1-T2, AC2: T4-T5, AC3: T9+HIGH format, AC4: T3/T6/T10/T11)

### Improvements Checklist

- [x] All helper functions follow zero-throw pattern
- [x] Per-capability try/catch in generateImpactSummary (partial results)
- [x] Task integration is additive (existing steps unchanged)
- [x] Entity registry entry complete with usedBy, dependencies, keywords
- [x] 25 tests covering all T1-T11 scenarios + edge cases

### Security Review

No security concerns. Helper functions only read data from enricher (no writes, no external calls, no user input processing).

### Performance Considerations

No performance issues. Functions are async with existing circuit breaker from code-intel module. _formatImpactReport limits output to 10 files to avoid report bloat.

### Files Modified During Review

None.

### Gate Status

Gate: PASS
Quality Score: 100/100

### Recommended Status

Ready for Done

---

## Change Log

| Date | Author | Change |
|------|--------|--------|
| 2026-02-15 | @devops | Story created (v1.0 — Nogic-specific) |
| 2026-02-15 | @architect | Rewrite v2.0 — provider-agnostic, reduced from 3 to 2 points, removed version-management scope |
| 2026-02-21 | @sm (River) | v3.0 — Full expansion: Story format, Executor Assignment, Scope (IN/OUT), Risks, DoD, Dev Notes (Source Tree, Testing, NOG-3/4/5/6 context, function mapping, API reference, task integration context), CodeRabbit Integration, Tasks with subtasks + AC mapping, entity-registry task, Dev Agent Record/QA Results placeholders. 4 helper functions mapped to capabilities. 11 test scenarios defined. |
| 2026-02-21 | @po (Pax) | v3.1 — PO Validation: GO. Score 9/10. Status Draft → Ready. All 4 ACs verified, 16/16 sections present, all claims anti-hallucination verified against source code. |
| 2026-02-21 | @dev (Dex) | v4.0 — Implementation complete. devops-helper.js created (4 functions), pre-push task Step 9.1 added, PR automation Step 5.1 added, 25/25 tests passing, coverage 100/82.69/100/100%, entity registered. Status Ready → Ready for Review. |
| 2026-02-21 | @qa (Quinn) | v4.1 — QA Review: PASS (100/100). 4/4 ACs covered, pattern compliance verified, 25/25 tests, zero regression (246/246 code-intel). Gate file created. |
| 2026-02-21 | @po (Pax) | v5.0 — Story closed. Pushed as commit f8a46624. QA gate PASS. Epic INDEX updated. Status Ready for Review → Done. |
