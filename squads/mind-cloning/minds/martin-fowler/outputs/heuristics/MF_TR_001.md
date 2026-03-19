# MF_TR_001 — Technology Ring Assignment

**Type:** Decision Heuristic
**Phase:** 1 (Technology Assessment)
**Agent:** @kaizen:martin-fowler
**Pattern:** MF-CORE-001 (Technology Radar Ring Assignment)

## Purpose

Heuristica principal para determinar em qual anel do Technology Radar uma tecnologia deve ser posicionada: Adopt, Trial, Assess ou Hold. Cada posicionamento requer evidencia de campo — nao opiniao, nao marketing, nao hype.

## Configuration

```yaml
MF_TR_001:
  name: "Technology Ring Assignment"
  phase: 1
  pattern_reference: "MF-CORE-001"

  weights:
    field_evidence_breadth: 0.9
    community_maturity: 0.7
    trade_off_clarity: 0.8
    problem_fit: 0.9
    migration_cost: 0.7
    alternative_simplicity: 0.8

  thresholds:
    adopt_minimum_contexts: 5        # testada com sucesso em pelo menos 5 contextos distintos
    trial_minimum_contexts: 2        # testada em pelo menos 2 contextos com resultados positivos
    assess_minimum_signals: 3        # pelo menos 3 sinais de potencial (talks, papers, early adopters)
    hold_requires_justification: true # sempre explicar POR QUE esta em Hold

  veto_conditions:
    - condition: "no_field_evidence"
      action: "VETO — Sem evidencia de campo, maximo e Assess. Nunca Trial ou Adopt sem experiencia real."
    - condition: "single_context_success"
      action: "VETO — Sucesso em 1 contexto nao justifica Adopt. Mantenha em Trial."
    - condition: "hype_without_substance"
      action: "VETO — Hype de conferencia sem projetos reais = Assess no maximo."
    - condition: "simpler_alternative_exists"
      action: "VETO — Se existe alternativa mais simples que resolve o mesmo problema, Hold ou rebaixar."
    - condition: "vendor_lock_in_unaddressed"
      action: "VETO — Lock-in nao avaliado impede movimento para Adopt."

  decision_tree:
    - IF new_technology THEN start_at_assess
    - IF assess_and_positive_experiments THEN consider_trial
    - IF trial_and_multi_context_success THEN consider_adopt
    - IF adopt_and_problems_emerging THEN consider_hold
    - IF simpler_alternative_proven THEN move_to_hold_with_explanation
    - IF insufficient_evidence THEN stay_current_ring_or_demote
    - TERMINATION: ring_assigned_with_written_justification

  output:
    type: "ring assignment + justificativa"
    values: ["ADOPT", "TRIAL", "ASSESS", "HOLD"]
```

## Application

**Input:** Tecnologia, ferramenta, pratica ou framework a ser avaliada.

**Process:**

```text
STEP 1: Identificar o Quadrante
  - "E uma tecnica, ferramenta, plataforma ou linguagem/framework?"
  - IF ambiguous THEN choose the quadrant where it has most impact

STEP 2: Levantar Evidencia de Campo
  - "Quantos projetos reais (nao demos) usaram essa tecnologia?"
  - IF zero real projects THEN maximum = Assess
  - IF 1-2 projects THEN maximum = Trial
  - IF 5+ diverse projects THEN eligible for Adopt

STEP 3: Avaliar Trade-offs Conhecidos
  - "Quais sao os trade-offs documentados?"
  - IF trade-offs unknown THEN stay in Assess until clarified
  - IF trade-offs acceptable THEN proceed
  - IF trade-offs severe THEN Hold with explanation

STEP 4: Verificar Alternativas
  - "Existe algo mais simples que resolve o mesmo problema?"
  - IF simpler alternative exists AND works THEN Hold the complex one
  - IF no simpler alternative THEN proceed

STEP 5: Avaliar Lock-in e Custo de Saida
  - "Qual o custo de abandonar essa tecnologia depois?"
  - IF high lock-in AND not proven THEN maximum = Trial
  - IF low lock-in THEN risk is manageable

STEP 6: Atribuir Anel com Justificativa
  - "Qual anel e suportado pela evidencia?"
  - MUST include written justification with evidence references
```

## Examples

### TypeScript para Backend (Assess -> Trial -> Adopt)

- **2015 (Assess):** Potencial interessante, poucos projetos reais em backend
- **2018 (Trial):** Multiplos projetos bem-sucedidos, ecossistema Node maduro
- **2020 (Adopt):** Evidencia ampla, comunidade enorme, trade-offs bem conhecidos
- **Justificativa Adopt:** Type safety melhora manutenibilidade, ecossistema vasto, custo de adocao baixo

### Microservices para Startups (Trial -> Hold)

- **Posicao:** Hold para startups early-stage
- **Justificativa:** Complexidade operacional desproporcional ao beneficio. Monolito modular e mais simples e resolve o mesmo problema ate escala significativa.
- **Evidencia:** Multiplos relatos de startups que reverteram microservices para monolito

## Diagnostic Questions

1. "Qual problema real essa tecnologia resolve no SEU contexto?"
2. "Quantas equipes diferentes testaram isso com sucesso?"
3. "Quais sao os trade-offs que ninguem menciona no keynote?"
4. "Existe uma solucao mais simples que voce esta ignorando?"
5. "Se voce adotar isso e der errado, qual o custo de reverter?"
6. "A evidencia vem de campo ou de marketing?"

---

**Pattern Compliance:** MF-CORE-001 (Technology Radar Ring Assignment) ok
**Source:** MF Mind DNA - Technology Radar Framework
