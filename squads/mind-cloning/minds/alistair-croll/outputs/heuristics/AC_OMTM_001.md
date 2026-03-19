# AC_OMTM_001 — OMTM Selection

**Type:** Decision Heuristic
**Phase:** 1 (Metric Definition)
**Agent:** @kaizen:alistair-croll
**Pattern:** AC-CORE-001 (One Metric That Matters)

## Purpose

Processo estruturado para identificar a One Metric That Matters no estagio atual de um negocio, produto ou squad. A maioria das organizacoes mede demais e decide de menos. Este heuristico forca foco radical: UMA metrica que, se melhorar, move o negocio para frente. Todas as outras sao monitoradas, nao otimizadas.

## Configuration

```yaml
AC_OMTM_001:
  name: "OMTM Selection"
  phase: 1
  pattern_reference: "AC-CORE-001"

  weights:
    behavior_changing_power: 0.95    # a metrica muda o que fazemos?
    comparability: 0.8               # permite comparar periodos/cohorts?
    understandability: 0.85          # toda a equipe entende?
    ratio_preference: 0.7            # ratios > numeros absolutos
    leading_over_lagging: 0.75       # preferir indicadores preditivos

  thresholds:
    max_metrics_to_optimize: 1             # OMTM = 1, nao 3, nao 5
    max_metrics_to_monitor: 5              # monitorar no maximo 5 adicionais
    experiment_cycle_max_days: 14          # maximo 2 semanas por experimento
    baseline_measurement_days: 7           # minimo 7 dias de baseline antes de otimizar
    statistical_significance: 0.95         # 95% confianca antes de declarar resultado

  veto_conditions:
    - condition: "optimizing_multiple_metrics_simultaneously"
      action: "VETO — Escolha UMA metrica. Se esta otimizando 3 ao mesmo tempo, nao esta otimizando nenhuma."
    - condition: "vanity_metric_as_omtm"
      action: "VETO — Total de usuarios, page views, followers sao metricas vaidade. Mude para rate, ratio ou retention."
    - condition: "metric_without_hypothesis"
      action: "VETO — Medicao sem hipotese e coleta de dados sem proposito. Formule a hipotese primeiro."
    - condition: "no_baseline_before_experiment"
      action: "VETO — Sem baseline, nao ha como medir melhoria. Meça 7 dias antes de mudar qualquer coisa."
    - condition: "metric_nobody_understands"
      action: "VETO — Se a equipe nao entende a metrica, nao vai mudar comportamento. Simplifique."

  decision_tree:
    - IF stage_unknown THEN run_business_stage_detection_first (AC_BS_001)
    - IF stage_identified THEN list_3_to_5_metric_candidates_for_stage
    - IF candidates_listed THEN score_each_on_behavior_change_power
    - IF top_candidate_identified THEN validate_with_team (todos entendem?)
    - IF validated THEN establish_7_day_baseline
    - IF baseline_established THEN OMTM_is_active
    - IF OMTM_not_improving_after_3_experiments THEN reevaluate_metric_selection
    - TERMINATION: OMTM_improving_consistently_OR_stage_transition

  output:
    type: "single metric + monitoring set"
    values: ["OMTM SELECTED", "BASELINE NEEDED", "WRONG METRIC", "STAGE TRANSITION"]
```

## Processo de Selecao do OMTM

```text
STEP 1: IDENTIFIQUE O ESTAGIO
  - Em qual dos 5 estagios voce esta? (Empathy, Stickiness, Virality, Revenue, Scale)
  - Seja BRUTALMENTE honesto — a maioria se coloca 1-2 estagios a frente
  - Se nao tem certeza, voce esta no estagio anterior ao que pensa

STEP 2: LISTE CANDIDATOS
  - 3-5 metricas candidatas para o estagio atual
  - Empathy: qualitative insights, problem validation rate
  - Stickiness: retention D7/D30, core action completion rate
  - Virality: viral coefficient, organic referral rate
  - Revenue: LTV/CAC ratio, revenue per user, MRR
  - Scale: CAC payback period, growth efficiency ratio

STEP 3: SCORE CADA CANDIDATO
  Para cada metrica, pergunte:
  [  ] E comparativa? (permite comparar periodos, cohorts, segmentos)
  [  ] E compreensivel? (toda a equipe entende sem explicacao)
  [  ] E ratio ou rate? (nao numero absoluto)
  [  ] Muda comportamento? (se melhorar, mudamos o que fazemos?)
  Score: soma de checks = 0-4

STEP 4: SELECIONE E VALIDE
  - Maior score = OMTM candidato
  - Valide com a equipe: "se esta metrica melhorar 20%, nosso negocio melhora?"
  - Se SIM unanime = OMTM confirmado
  - Se duvidas = candidate nao e forte o suficiente, volte ao Step 3

STEP 5: ESTABELECA BASELINE
  - Meça 7 dias sem mudar nada
  - Esse e o baseline contra o qual tudo sera comparado
  - Sem baseline, nao existe "melhoria"

STEP 6: OTIMIZE COM DISCIPLINA
  - Um experimento por vez (isole variaveis)
  - Ciclos de 7-14 dias por experimento
  - Registre: hipotese, metrica, resultado, aprendizado
  - Se 3 experimentos sem melhoria, reavaliar selecao do OMTM
```

## Application

**Input:** Descricao do negocio, produto ou squad + metricas atuais.

**Process:**
1. Identifique o estagio do negocio (use AC_BS_001 se necessario)
2. Liste as metricas que a equipe atualmente acompanha
3. Classifique: vanity vs. actionable, leading vs. lagging
4. Score candidatos no framework de 4 criterios
5. Selecione OMTM + set de monitoria (max 5)

## Examples

### Squad de AI agents (estagio: Stickiness)

- **Metricas atuais:** total users (vanity), features shipped (vanity), uptime (reporting)
- **Candidatos OMTM:** retention D7, core action completion rate, session frequency
- **Score:**
  - Retention D7: comparativa=YES, understandable=YES, ratio=YES, behavior-changing=YES → 4/4
  - Core action: comparativa=YES, understandable=YES, ratio=YES, behavior-changing=YES → 4/4
  - Session frequency: comparativa=YES, understandable=YES, ratio=NO, behavior-changing=PARTIAL → 2.5/4
- **OMTM selecionado:** Retention D7 (mais direto e universal)
- **Monitoring set:** Core action rate, session frequency, NPS, error rate

### SaaS B2B (estagio: Revenue)

- **Metricas atuais:** MRR, total customers, NPS, churn rate, leads
- **Candidatos OMTM:** LTV/CAC ratio, MRR growth rate, net revenue retention
- **OMTM selecionado:** Net Revenue Retention (combina churn + expansion em um ratio)
- **Monitoring set:** MRR, churn rate, expansion revenue, CAC

## Diagnostic Questions

1. "Qual e a UMA metrica que, se melhorar, seu negocio melhora?"
2. "Essa metrica muda o que voce faz no dia a dia?"
3. "Toda sua equipe entende essa metrica sem explicacao?"
4. "Voce tem baseline para comparar?"
5. "Quantas metricas voce esta tentando otimizar ao mesmo tempo? (se > 1, problema)"

---

**Pattern Compliance:** AC-CORE-001 (OMTM) OK
**Source:** AC Mind DNA - One Metric That Matters Framework
