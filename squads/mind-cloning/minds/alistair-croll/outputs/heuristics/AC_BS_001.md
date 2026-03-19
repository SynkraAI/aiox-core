# AC_BS_001 — Business Stage Detection

**Type:** Decision Heuristic
**Phase:** 0 (Stage Identification)
**Agent:** @kaizen:alistair-croll
**Pattern:** AC-CORE-002 (Business Stages)

## Purpose

Diagnostico para determinar em qual dos 5 estagios do Lean Analytics um negocio, produto ou squad se encontra. A maioria se autoavalia 1-2 estagios a frente da realidade. Este heuristico forca honestidade brutal: se nao cumpriu os criterios de saida de um estagio, nao avancou — independente do que o ego diz.

## Configuration

```yaml
AC_BS_001:
  name: "Business Stage Detection"
  phase: 0
  pattern_reference: "AC-CORE-002"

  weights:
    exit_criteria_rigor: 0.95       # criterios de saida sao inegociaveis
    honesty_over_optimism: 0.9      # preferir subavaliacao a superavaliacao
    evidence_over_intuition: 0.85   # dados > "eu acho que ja passamos dessa fase"
    stage_specific_focus: 0.9       # so otimizar metricas do estagio atual

  thresholds:
    empathy_exit_interviews: 20         # minimo 20 entrevistas qualitativas
    stickiness_exit_retention_d30: 0.20 # 20%+ retencao em 30 dias
    virality_exit_coefficient: 0.5      # K-factor > 0.5 (1.0 ideal)
    revenue_exit_ltv_cac_ratio: 3.0     # LTV/CAC > 3x
    scale_efficiency_ratio: 0.5         # $0.50+ de receita por $1 investido em growth

  veto_conditions:
    - condition: "claiming_revenue_stage_without_stickiness"
      action: "VETO — Se retencao D30 < 20%, voce esta no estagio Stickiness, nao Revenue. Volte e corrija retencao."
    - condition: "investing_in_virality_before_sticky_product"
      action: "VETO — Viralizar produto que nao retém e encher balde furado. Stickiness primeiro."
    - condition: "scaling_without_positive_unit_economics"
      action: "VETO — Escalar unit economics negativa e escalar prejuizo. Revenue stage primeiro."
    - condition: "skipping_empathy_stage"
      action: "VETO — Construir sem validar problema e a causa #1 de falha. Volte para entrevistas."
    - condition: "self_assessing_2_stages_ahead"
      action: "VETO — A maioria se coloca 1-2 estagios a frente. Valide criterios de saida com dados, nao intuicao."

  decision_tree:
    - IF no_problem_validation THEN stage = EMPATHY
    - IF problem_validated AND retention_d30 < 0.20 THEN stage = STICKINESS
    - IF retention_stable AND viral_coefficient < 0.5 THEN stage = VIRALITY
    - IF organic_growth AND ltv_cac < 3.0 THEN stage = REVENUE
    - IF unit_economics_positive AND growth_efficient THEN stage = SCALE
    - IF unsure THEN assume_one_stage_earlier_than_you_think
    - TERMINATION: stage_confirmed_with_data_evidence

  output:
    type: "stage identification + exit criteria checklist"
    values: ["EMPATHY", "STICKINESS", "VIRALITY", "REVENUE", "SCALE"]
```

## Os 5 Estagios em Detalhe

```text
ESTAGIO 1: EMPATHY
  Pergunta central: "O problema existe e e doloroso o suficiente?"

  O que fazer:
    - Entrevistas qualitativas (minimo 20)
    - Observacao de comportamento real (nao declarado)
    - Validacao de willingness-to-pay
    - NENHUM codigo, NENHUM produto ainda

  Criterios de saida:
    [  ] 20+ entrevistas com evidencia qualitativa de dor real
    [  ] Pelo menos 5 pessoas dizem "eu pagaria por isso"
    [  ] Padroes claros emergindo das entrevistas
    [  ] Problema articulavel em 1 frase

  OMTM: Qualitative problem validation rate
  Anti-pattern: Construir produto antes de validar problema

ESTAGIO 2: STICKINESS
  Pergunta central: "As pessoas usam e VOLTAM?"

  O que fazer:
    - Construir MVP focado na funcao core
    - Medir retencao (D1, D7, D30)
    - Identificar "aha moment" (acao que prediz retencao)
    - Iterar ate retencao estabilizar ou crescer

  Criterios de saida:
    [  ] Retencao D30 >= 20% (varia por categoria)
    [  ] Core action completion rate estavel ou crescente
    [  ] "Aha moment" identificado e replicavel
    [  ] Churn estabilizado (nao crescente)

  OMTM: Retention rate (D7 ou D30 dependendo do produto)
  Anti-pattern: Investir em aquisicao antes de retencao

ESTAGIO 3: VIRALITY
  Pergunta central: "Usuarios trazem outros usuarios?"

  O que fazer:
    - Implementar mecanismos de referral naturais
    - Medir viral coefficient (K-factor)
    - Otimizar ciclo viral (tempo + conversao)
    - Testar diferentes triggers de compartilhamento

  Criterios de saida:
    [  ] Viral coefficient > 0.5 (idealmente > 1.0)
    [  ] Growth organico sustentavel sem paid acquisition
    [  ] NPS > 50 (indicador de propensao a recomendar)
    [  ] Referral channel entre top 3 fontes de aquisicao

  OMTM: Viral coefficient ou organic referral rate
  Anti-pattern: Forcar viralidade com incentivos em produto nao-sticky

ESTAGIO 4: REVENUE
  Pergunta central: "A conta fecha? Unit economics funciona?"

  O que fazer:
    - Otimizar monetizacao (pricing, packaging, upsell)
    - Medir LTV, CAC e LTV/CAC ratio
    - Testar pricing strategies
    - Reduzir churn revenue (expansion > contraction)

  Criterios de saida:
    [  ] LTV/CAC ratio > 3x
    [  ] CAC payback period < 12 meses
    [  ] Net Revenue Retention > 100%
    [  ] Receita previsivel e crescente

  OMTM: LTV/CAC ratio ou Net Revenue Retention
  Anti-pattern: Crescer receita topline sem unit economics positiva

ESTAGIO 5: SCALE
  Pergunta central: "Crescemos eficientemente?"

  O que fazer:
    - Escalar canais de aquisicao provados
    - Otimizar eficiencia operacional
    - Expandir para segmentos adjacentes
    - Construir moats competitivos

  Criterios de saida:
    [  ] Growth efficiency ratio > 0.5
    [  ] Market share crescente no segmento
    [  ] Operacoes escalando sem proporcao linear de custo
    [  ] Novos segmentos/mercados sendo testados

  OMTM: Growth efficiency ratio ou CAC payback period
  Anti-pattern: Escalar antes de ter PMF e unit economics
```

## Application

**Input:** Descricao do negocio/produto/squad + metricas disponiveis.

**Process:**
1. Liste as metricas atuais e comportamentos do usuario
2. Avalie criterios de saida de cada estagio de baixo para cima
3. O estagio atual e o primeiro cujos criterios de saida NAO estao cumpridos
4. Se na duvida, assuma um estagio anterior
5. Defina OMTM para o estagio identificado

## Examples

### Squad de AI agents — 3 meses de operacao

- **Dados:** 50 usuarios, 8 ativos semanais, 0 revenue, sem referral
- **Avaliacao:**
  - Empathy: problema validado? SIM (usuarios existem e usam) → EXIT OK
  - Stickiness: retencao? 8/50 = 16% semanal → NAO CUMPRIU (< 20% D30)
- **Estagio:** STICKINESS
- **OMTM:** Retention rate semanal (target: 30%+)
- **Acao:** Identificar aha moment, iterar core feature ate retencao subir

### SaaS B2B — 18 meses, $50K MRR

- **Dados:** 200 clientes, 5% churn mensal, CAC $2000, LTV $8000, referrals: 10%
- **Avaliacao:**
  - Empathy: OK (produto no mercado)
  - Stickiness: 95% retencao mensal → EXIT OK
  - Virality: 10% referrals, K < 0.5 → PARCIAL mas avancando
  - Revenue: LTV/CAC = 4x → EXIT OK
  - Scale: growth efficiency? $50K MRR, precisa avaliar eficiencia
- **Estagio:** SCALE (com atencao em virality como booster)
- **OMTM:** Growth efficiency ratio
- **Acao:** Escalar canais provados, otimizar CAC payback

### Projeto interno (novo dashboard)

- **Dados:** Ideia, 3 conversas com stakeholders, nenhum prototipo
- **Avaliacao:**
  - Empathy: 3 entrevistas < 20 → NAO CUMPRIU
- **Estagio:** EMPATHY
- **OMTM:** Qualitative problem validation (entrevistas)
- **Acao:** Completar 20 entrevistas antes de escrever qualquer codigo

## Diagnostic Questions

1. "Voce validou que o problema existe com pelo menos 20 entrevistas?"
2. "Usuarios voltam apos o primeiro uso? Qual a retencao D7/D30?"
3. "Usuarios recomendam espontaneamente? Qual o viral coefficient?"
4. "A conta fecha? LTV/CAC > 3x?"
5. "Se eu te pedisse para ser honesto: qual estagio voce REALMENTE esta?"

---

**Pattern Compliance:** AC-CORE-002 (Business Stages) OK
**Source:** AC Mind DNA - Lean Analytics Business Stages
