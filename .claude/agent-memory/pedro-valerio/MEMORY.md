# @pedro-valerio Memory - Process Absolutist

## Quick Stats
- Workflows auditados: 2 (deep-research v1.0, v1.1)
- Clones auditados: 2 (renner-silva v1.1=8.5, v1.2=9.0)
- Veto conditions criadas: 18 (deep-research checkpoints.yaml)
- Gaps identificados: 8 workflow (4 critical→FIXED) + 8 clone (1 major + 7 minor)

---

## Princípio Core
> "Se executor CONSEGUE fazer errado → processo está errado"

---

## Workflows Auditados
<!-- Formato: [DATA] workflow-name: PASS/FAIL (issues) -->

### [2026-03-08] deep-research v1.0: VETO (62/100)
- 4 CRITICAL issues: C1-C4
- Veto conditions: 3/10
- Checkpoints: 4/10 (Phase 4 sem quality gate)
- Stopping criteria: 5/10 (sem edge cases)
- Zero wrong paths: 5/10 (integrity_score < 70% passa)

### [2026-03-08] deep-research v1.1: APROVAR (91/100)
- Todos os 4 CRITICAL resolvidos
- Veto conditions: 9/10 (+6 pontos)
- Checkpoints: 10/10 (+6 pontos)
- Stopping criteria: 10/10 (+5 pontos, edge cases completos)
- Zero wrong paths: 9/10 (+4 pontos, integrity_score agora BLOQUEIA < 60%)
- Gaps remanescentes: 4 minor (LOW severity, não bloqueantes)

---

## Veto Conditions Criadas
<!-- Condições de bloqueio que funcionam -->

### Checkpoints Efetivos (deep-research v1.1)
- V0.1-V0.2: Auto-detection com blocking (research_type unknown → HALT)
- V1.1-V1.4: Decomposition com blocking (< 5 queries → HALT, < 10 chars → HALT)
- V2.1-V2.3: Prompt generation (unfilled vars → HALT, < 200 tokens → HALT)
- V3.1-V3.3: Dispatch (< 3 subagents AND < 5 sources → HALT)
- V3.5.1-V3.5.3: Evaluate (plateau → FORCE STOP, timeout → FORCE STOP)
- V4.1-V4.4: Synthesis (< 500 tokens → HALT, < 3 sources → HALT, empty sections → HALT)
- V4.5.1-V4.5.2: Verify (integrity < 60% → HALT, 60-70% → FLAG REVIEW)
- V5.1: Document (overwrite protection)

### Patterns Efetivos
- CP com blocking: true sempre (18 veto conditions com blocking)
- Quality gate em TODAS as fases (Phase 0-5, 8 quality gates)
- Integrity score com HARD BLOCK (< 60% → pipeline PARA)
- Edge cases coverage (plateau, timeout, regression, query exhaustion)
- Global safeguards (max_waves: 3, timeout: 600s, plateau_threshold: 3)

### Anti-Patterns Detectados
- ❌ Checkpoint sem veto condition → FIXED v1.1 (todas fases agora têm veto)
- ❌ Fluxo que permite voltar → OK (pipeline é unidirecional)
- ❌ Handoff sem validação → PARTIAL (handoffs implícitos, sem structured format)
- ❌ Quality gate sem enforcement → FIXED v1.1 (veto conditions enforçam quality gates)
- ❌ Stopping criteria sem edge cases → FIXED v1.1 (plateau, timeout, regression)

---

## Gaps de Processo Identificados
<!-- Problemas encontrados em workflows -->

### CRITICAL (v1.0) — TODOS RESOLVIDOS v1.1
- C1: Faltam veto conditions em 5 de 6 fases → FIXED (18 veto conditions)
- C2: Stopping criteria sem edge cases → FIXED (plateau, timeout, regression, query exhaustion)
- C3: Phase 4 sem quality gate → FIXED (V4.1-V4.4 com >= 500 tokens, >= 3 sources)
- C4: Integrity score < 70% passa → FIXED (< 60% BLOQUEIA, 60-70% FLAGS)

### MINOR (v1.1) — NÃO BLOQUEANTES
- Phase 5 veto incomplete (só overwrite, não valida 4 files output)
- Handoff format não estruturado (context/files sem validation)
- Decomposition uniqueness não enforçada (queries podem duplicar)
- Subagent partial failure não documentado (skipped sub-queries não aparecem no report)

---

## Padrões de Validação
<!-- O que sempre verificar -->

### Em Workflows (8 critérios, peso igual)
1. **Veto Conditions** (10 pts): TODAS as fases têm blocking conditions?
2. **Fluxo Unidirecional** (10 pts): Pipeline forward-only, sem voltar?
3. **Checkpoints** (10 pts): Quality gates + veto conditions em TODAS as fases?
4. **Zero Wrong Paths** (10 pts): Executor CONSEGUE fazer errado? → processo ESTÁ errado
5. **Handoffs** (10 pts): Transferências entre fases com format validation?
6. **Stopping Criteria** (10 pts): Edge cases cobertos (plateau, timeout, regression)?
7. **Fallback Chains** (10 pts): Graceful degradation, não fail entire pipeline?
8. **Decision Tree** (10 pts): Ambiguidade, multi-type, negative queries tratados?

### Scoring
- 90-100: APROVAR — Production-ready
- 70-89: APROVAR com ressalvas
- 50-69: VETO — Fixes obrigatórios
- < 50: VETO — Retrabalho completo

### Em Agents
- [ ] 300+ lines?
- [ ] Voice DNA presente?
- [ ] Output examples?
- [ ] Quality gates definidos?

---

## Aprendizados Chave

### Edge Cases que SEMPRE verificar
- **Plateau detection**: coverage_delta < 3% entre waves → FORCE STOP
- **Timeout protection**: absolute pipeline timeout (ex: 600s)
- **Coverage regression**: wave N < wave N-1 → FORCE STOP
- **Query exhaustion**: gap queries retornam 0 results → FORCE STOP
- **Partial failure**: alguns subagents falham → graceful degradation, não fail entire
- **Disambiguation**: multi-type queries com score_diff < threshold → ASK USER

### Global Safeguards Pattern
```yaml
global:
  max_pipeline_duration_seconds: {N}  # absolute timeout
  max_total_tokens: {N}               # cost protection
  max_waves: {N}                      # hard cap (override config)
  plateau_threshold: {N}              # delta abaixo = plateau
```

### Quality Gate Enforcement Pattern
- Quality gate define CRITERIA
- Veto condition ENFORÇA criteria (blocking: true)
- Se gate existe mas veto não → executor CONSEGUE ignorar → processo ESTÁ errado

### Integrity Score Pattern (deep-research v1.1)
- < 60%: HALT (blocking: true)
- 60-70%: FLAG "REVIEW REQUIRED" (blocking: false)
- >= 70%: PASS
- >= 80%: HIGH QUALITY

---

## Clone Audits
### [2026-03-09] renner-silva v1.2: APROVADO (9.0/10)
- +2 KBs novos (KB18 Frameworks Negocio, KB19 Metodo Palestra) — completos
- +3 KBs atualizados (KB01 v1.4, KB02 v1.3 +15 fingerprints, KB04 v1.3 +13 memorias)
- 1 MAJOR: escopo agent nao inclui vendas/pricing explicitamente
- 7 MINOR: README desatualizado (17→19 KBs, ME-40→ME-29), cross-refs erradas
- Pattern: mind clone audits focam em SOURCE ATTRIBUTION + CROSS-REF INTEGRITY

### [2026-03-08] renner-silva v1.1: APROVADO (8.5/10)
- Baseline score antes de KB18/KB19

---

## Notas Recentes
- [2026-03-09] renner-silva v1.2 APROVADO (9.0/10) — gap principal: escopo vendas
- [2026-03-08] deep-research v1.1 APROVADO (91/100) — todos 4 CRITICAL resolvidos
- [2026-03-08] deep-research v1.0 VETADO (62/100) — 4 CRITICAL issues
- [2026-02-05] Agent Memory implementado - Epic AAA
