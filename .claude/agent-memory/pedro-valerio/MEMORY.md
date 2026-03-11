# @pedro-valerio Memory - Process Absolutist

## Quick Stats
- Workflows auditados: 7 (deep-research v1.0→v1.1; BRE extract v1.0→v1.1, formalize v1.0→v1.1; Mind Cloning v1.1)
- Clones auditados: 2 (renner-silva v1.1=8.5, v1.2=9.0)
- Veto conditions criadas: 18 (deep-research) + 24 (BRE v1.1)
- Detalhes completos: `audit-history.md`

---

## Principio Core
> "Se executor CONSEGUE fazer errado -> processo esta errado"

---

## Score Board (todos workflows)

| Workflow | Score | Veredicto |
|----------|-------|-----------|
| deep-research v1.0 | 62 | VETO |
| deep-research v1.1 | 91 | APROVAR |
| BRE wf-extract v1.0 | 62 | VETO |
| BRE wf-extract v1.1 | 85 | APROVAR |
| BRE wf-formalize v1.0 | 54 | VETO |
| BRE wf-formalize v1.1 | 83 | APROVAR |
| Mind Cloning v1.1 | 78 | APROVAR c/ ressalvas |

---

## Padroes de Validacao (8 criterios, 10 pts cada)
1. Veto Conditions: TODAS as fases tem blocking conditions?
2. Fluxo Unidirecional: Pipeline forward-only?
3. Checkpoints: Quality gates + veto em TODAS as fases?
4. Zero Wrong Paths: Executor CONSEGUE fazer errado?
5. Handoffs: Transferencias com format validation?
6. Stopping Criteria: Edge cases cobertos (plateau, timeout)?
7. Fallback Chains: Graceful degradation?
8. Decision Tree: Ambiguidade tratada?

### Scoring
- 90-100: APROVAR (production-ready)
- 70-89: APROVAR com ressalvas
- 50-69: VETO (fixes obrigatorios)
- < 50: VETO (retrabalho completo)

### Em Agents: 300+ lines? Voice DNA? Output examples? Quality gates?

---

## Anti-Patterns Recorrentes
- Checkpoint sem veto condition (deep-research v1.0, Mind Cloning v1.1)
- Quality gate sem enforcement (BRE v1.0, Mind Cloning v1.1)
- Veto sem blocking explicito (BRE v1.0)
- Handoff sem input_validation (todos workflows)
- Dois arquivos descrevendo mesmo fluxo (Mind Cloning: clone-mind.md + workflow YAML)
- Sem timeout protection (Mind Cloning v1.1)

## Patterns Efetivos
- Enforcement global: `enforcement: { checkpoint_policy, veto_behavior, max_retries }`
- Input validation: `input_validation: [ { field, required, min_length, type } ]`
- Fallback: `fallback: { on_veto, on_timeout }` com graceful degradation
- Checkpoint types: auto, human_review, quality_gate
- Global safeguards: max_duration, max_tokens, max_waves, plateau_threshold
- Quality Gate Enforcement: gate define CRITERIA, veto ENFORCA (blocking: true)

---

## Aprendizados Chave
- Edge cases SEMPRE verificar: plateau, timeout, regression, query exhaustion, partial failure, disambiguation
- Conteudo rico NAO compensa workflow fraco (Mind Cloning: tasks 9/10, workflow 6/10)
- Duplicacao de fluxo (task + workflow YAML) e GAP CRITICAL - single source of truth
- CONDITIONAL paths precisam de tracking/propagacao entre fases

---

## Notas Recentes
- [2026-03-11] Mind Cloning v1.1 APROVADO c/ RESSALVAS (78/100) — 3C, 5M, 7m. Gap: workflow YAML sem gates em 3/5 fases
- [2026-03-11] BRE v1.1 APROVADO — extract 85, formalize 83
- [2026-03-09] renner-silva v1.2 APROVADO (9.0/10)
- [2026-03-08] deep-research v1.1 APROVADO (91/100)
