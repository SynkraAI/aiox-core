# AC_LA_001 — Lean Analytics Stage Diagnosis

**Type:** Decision Heuristic
**Phase:** 1 (Diagnóstico de Estágio de Negócio)
**Agent:** @kaizen:alistair-croll
**Pattern:** AC-LA-001 (Lean Analytics Stage Assessment)

## Purpose

Diagnostica em qual dos 5 estágios Lean Analytics o negócio está: Empathy, Stickiness, Virality, Revenue ou Scale. Previne medir métricas do estágio errado (ex: otimizar revenue antes de validar retenção = trabalho inútil). Cada estágio tem perguntas, métricas e armadilhas específicas.

## Configuration

```yaml
AC_LA_001:
  name: "Lean Analytics Stage Diagnosis"
  phase: 1

  weights:
    product_market_fit_evidence: 0.95
    retention_metrics: 0.9
    organic_growth: 0.85
    monetization_proof: 0.85
    unit_economics: 0.8

  stage_transitions:
    empathy_to_stickiness: "10+ pessoas dispostas a pagar validadas"
    stickiness_to_virality: "DAU/MAU > 20%, retention curve flatten após semana 4"
    virality_to_revenue: "k-factor > 0.5 ou growth orgânico sustentável"
    revenue_to_scale: "LTV > 3x CAC, modelo de monetização validado"

  veto_conditions:
    - condition: "Tentando crescer (Virality/Scale) antes de reter (Stickiness)"
      action: "VETO — Leaky bucket. Conserte retenção antes de escalar."
    - condition: "Otimizando pricing (Revenue) antes de provar valor (Stickiness)"
      action: "VETO — Ninguém paga por produto que não usa."
    - condition: "Medindo revenue em Empathy stage"
      action: "REVIEW — Revenue prematuro. Valide problema primeiro."
    - condition: "Investindo em scale sem unit economics positiva"
      action: "VETO — Escalando prejuízo. CAC payback > 12 meses é insustentável."

  decision_tree: |
    IF produto não existe OU < 10 pagadores validados → Empathy
    IF produto existe MAS retention < 20% DAU/MAU → Stickiness
    IF retention OK MAS growth orgânico baixo → Virality
    IF growth OK MAS monetização incerta → Revenue
    IF revenue OK MAS CAC/LTV ou margin insustentável → Scale
    TERMINATION: Pular estágios (ex: Empathy direto para Scale)
```

## Application

**Input:** Estado atual do produto + métricas disponíveis + histórico de validação
**Process:** Avaliar evidências de cada estágio → identificar estágio atual → mapear gaps para próximo estágio → definir OMTM do estágio
**Output:** Diagnóstico de estágio + OMTM específico + critério de transição para próximo estágio

## Decision Tree

```text
STEP 1: AVALIAR Empathy (Problem/Solution Fit)

IF (Produto ainda não existe OU MVP inicial apenas)
  AND (< 10 pessoas dispostas a pagar validadas)
  THEN Estágio = EMPATHY
  OMTM: # de problem interviews, # de early adopters comprometidos
  Próximo estágio: quando 10+ pessoas dizem "EU PAGARIA por isso"
ELSE
  AVANÇAR para STEP 2

STEP 2: AVALIAR Stickiness (Product Retention)

IF (Produto existe e tem usuários)
  AND (DAU/MAU < 20% OU retention cohorts decaindo > 50% na semana 4)
  THEN Estágio = STICKINESS
  OMTM: DAU/MAU ratio, retention cohorts D7/D30, feature engagement
  Anti-pattern: "Crescer usuários sem reter = leaky bucket"
  Próximo estágio: DAU/MAU > 20% E retention curve flatten após semana 4
ELSE
  AVANÇAR para STEP 3

STEP 3: AVALIAR Virality (Organic Growth)

IF (Retention OK mas growth depende 100% de paid acquisition)
  AND (k-factor < 0.5 OU viral loops inexistentes)
  THEN Estágio = VIRALITY
  OMTM: viral coefficient (k-factor), invite acceptance rate, cycle time
  Anti-pattern: "Comprar usuários antes de product-market fit = queimar dinheiro"
  Próximo estágio: k-factor > 0.5 OU mix de paid + organic sustentável
ELSE
  AVANÇAR para STEP 4

STEP 4: AVALIAR Revenue (Monetization)

IF (Growth funciona mas modelo de pricing/monetização incerto)
  AND (LTV indefinido OU conversão free→paid < benchmark)
  THEN Estágio = REVENUE
  OMTM: LTV, ARPU, conversion rate, churn rate por segmento
  Anti-pattern: "Otimizar pricing antes de provar valor = cart before horse"
  Próximo estágio: LTV > 3x CAC E modelo de monetização replicável
ELSE
  AVANÇAR para STEP 5

STEP 5: AVALIAR Scale (Sustainable Growth)

IF (Revenue funciona mas CAC/LTV insustentável OU gross margin < 70% SaaS)
  THEN Estágio = SCALE
  OMTM: CAC payback period, LTV/CAC ratio, gross margin, customer acquisition efficiency
  Anti-pattern: "Escalar antes de unit economics positiva = acelerar para o precipício"
  Próximo estágio: CAC payback < 12 meses E gross margin saudável

TERMINATION: Pular estágios (ex: Empathy → Scale direto)
FALLBACK: Se incerto entre dois estágios, escolha o anterior (melhor consolidar antes de avançar)
```

## Stage Characteristics Matrix

| Estágio | Pergunta-Chave | OMTM Típico | Success Threshold | Anti-Pattern |
|---------|----------------|-------------|-------------------|--------------|
| **Empathy** | Problema existe e vale a pena resolver? | # early adopters validados | 10+ dispostos a pagar | Construir antes de validar |
| **Stickiness** | Produto retém? Cria hábito? | DAU/MAU, retention cohorts | DAU/MAU > 20% | Crescer antes de reter |
| **Virality** | Cresce organicamente? | k-factor, viral coefficient | k > 0.5 | Paid acquisition sem PMF |
| **Revenue** | Modelo de monetização funciona? | LTV, ARPU, conversion | LTV > 3x CAC | Otimizar preço sem valor |
| **Scale** | Crescimento é sustentável? | CAC payback, gross margin | Payback < 12m, margin > 70% | Escalar prejuízo |

## Examples

### APPROVE: Diagnóstico Correto — SaaS em Stickiness

**Situação:** Produto lançado há 3 meses, 500 usuários, DAU/MAU = 15%, retention semana 4 = 40%
**Diagnóstico:** Estágio = STICKINESS
**OMTM:** DAU/MAU ratio
**Ação:** Melhorar onboarding, aumentar engajamento em core feature, reduzir time-to-value
**Croll diz:** "Correto. Você tem usuários, mas não retém. Esqueça growth por enquanto. Conserte o leaky bucket primeiro."

### VETO: Pular Estágio — Empathy direto para Scale

**Situação:** MVP com 5 usuários beta, founder quer "escalar para 10k usuários em 6 meses"
**Diagnóstico proposto:** Scale
**Diagnóstico real:** Empathy
**Croll diz:** "Você tem 5 usuários e quer escalar? Primeiro prove que 10 pessoas PAGARIAM pelo produto. Depois que reterem. Depois que crescer organicamente. ENTÃO escale. Pular estágios é receita para falência rápida."

### REVIEW: Métrica Errada para o Estágio — Revenue em Stickiness

**Situação:** SaaS B2B, DAU/MAU = 12%, churn mensal = 15%, founder otimizando pricing
**Diagnóstico:** Stickiness (retention ruim)
**Métrica atual:** Revenue growth, pricing experiments
**Croll diz:** "Revenue agora é perda de tempo. Com 15% de churn mensal, você perde metade dos clientes a cada 5 meses. Esqueça pricing. Conserte retenção. Revenue vem DEPOIS de stickiness."

### APPROVE: Transição de Estágio — Stickiness → Virality

**Situação:** DAU/MAU subiu de 15% para 25%, retention D30 = 60%, cohorts estáveis
**Diagnóstico:** Transição para VIRALITY
**Novo OMTM:** k-factor (quantos usuários cada usuário traz)
**Ação:** Implementar referral loops, incentivos para convites, reduzir friction em onboarding de convidados
**Croll diz:** "Agora sim. Retention consolidada. Hora de crescer organicamente. Meça k-factor e cycle time. Se k > 1, crescimento exponencial."

## Core Quotes

- "A métrica que importa AGORA nem sempre é a que importará daqui 3 meses."
- "Medir revenue antes de stickiness é medir o que NÃO importa ainda."
- "Cada business stage é um capítulo — não leia à frente, termine o que você está."
- "Pular estágios é como pular escadas — você cai mais rápido."

---

**Pattern Compliance:** AC-LA-001 (Lean Analytics Stage Diagnosis)
**Source:** AC Mind DNA — Lean Analytics Stages Framework
