# calculate-30-day-profit

## Metadata
```yaml
task_id: HZ_MOD_005
agent: hormozi-models
type: calculation
complexity: medium
estimated_time: 30-45 min
source: "$100M Money Models - Pilar 1"
```

## Purpose

Calcular o Lucro em 30 Dias (L30) usando a fórmula completa do Hormozi, determinando se o negócio pode usar cartão de crédito como capital infinito e identificando gargalos na sequência de ofertas.

> "82% of businesses die from lack of cash flow, not lack of customers. If you can make money in 30 days, you can use your credit card as infinite working capital." — Alex Hormozi

---

## Input Required

```yaml
l30_calculation_input:
  # Oferta Inicial
  initial_offer:
    name: ""
    price: 0
    conversion_rate: 0 # Ex: 0.10 para 10%
    cogs: 0 # Custo de entrega

  # Custos de Aquisição
  acquisition:
    cac: 0 # Custo por cliente adquirido
    marketing_spend_30_days: 0 # Opcional

  # Upsells (adicionar quantos tiver)
  upsells:
    - name: ""
      price: 0
      conversion_rate: 0 # % dos compradores iniciais
      cogs: 0
    # ...

  # Downsells (para quem não compra inicial)
  downsells:
    - name: ""
      price: 0
      conversion_rate: 0 # % dos que rejeitaram
      cogs: 0
    # ...

  # Continuidade (se aplicável)
  continuity:
    enabled: true | false
    monthly_price: 0
    signup_rate: 0 # % que assina
    month_1_churn: 0
```

---

## Why L30 Matters

### O Ciclo do Capital Infinito
```
DIA 1: Você gasta $X em marketing (no cartão)
DIA 1-30: Clientes compram, pagam, usam
DIA 30: Cartão cobra $X
DIA 30: Você tem $Y em receita

SE Y > X: Ciclo se auto-sustenta
SE Y < X: Você está sangrando
```

### Consequência de L30 Negativo
```
L30 < 0
→ Cada cliente custa mais do que gera
→ Marketing consome caixa
→ Caixa acaba
→ Publicidade para
→ Negócio morre

Isso acontece com 82% dos negócios que morrem.
```

---

## The L30 Formula

### Fórmula Completa
```
L30 = (P1 × C1) + Σ(Un × Cn) + (Dm × Cm × Rn) + (Cont × Cs × (1-Ch)) - CAC - COGS

Onde:
L30   = Lucro em 30 dias
P1    = Preço oferta inicial
C1    = Taxa conversão inicial
Un    = Preço upsell n
Cn    = Taxa conversão upsell n
Dm    = Preço downsell m
Cm    = Taxa conversão downsell m
Rn    = % que rejeita oferta inicial
Cont  = Preço continuidade mensal
Cs    = % que assina continuidade
Ch    = Churn mês 1
CAC   = Custo de aquisição
COGS  = Custo de entrega (todos os itens)
```

### Fórmula Simplificada
```
L30 = Revenue Total 30 dias - CAC - COGS Total

Onde:
Revenue Total = Inicial + Upsells + Downsells + Continuidade
COGS Total = Soma de todos os custos de entrega
```

---

## Step-by-Step Calculation

### Step 1: Calcular Revenue da Oferta Inicial
```yaml
initial_revenue:
  formula: "P1 × C1"
  example:
    price: 1000
    conversion: 0.10
    revenue: 100 # $1000 × 10% = $100 por lead
```

### Step 2: Calcular Revenue de Upsells
```yaml
upsell_revenue:
  formula: "Σ(Un × Cn)"
  example:
    upsell_1:
      price: 500
      conversion: 0.30 # 30% dos compradores
      contribution: 150 # $500 × 30% = $150
    upsell_2:
      price: 200
      conversion: 0.50
      contribution: 100
    total_upsell_revenue: 250 # Por comprador inicial
```

### Step 3: Calcular Revenue de Downsells
```yaml
downsell_revenue:
  formula: "Dm × Cm × Rn"
  example:
    downsell:
      price: 300
      conversion: 0.20 # 20% dos que rejeitam
      rejection_rate: 0.90 # 90% rejeita inicial
    contribution: 54 # $300 × 20% × 90% = $54 por lead
```

### Step 4: Calcular Revenue de Continuidade (Mês 1)
```yaml
continuity_revenue:
  formula: "Cont × Cs × (1-Ch)"
  example:
    monthly: 100
    signup_rate: 0.40 # 40% assinam
    month_1_churn: 0.10
    contribution: 36 # $100 × 40% × (1-10%) = $36 por lead
```

### Step 5: Somar Custos
```yaml
total_costs:
  cac: 0
  cogs_initial: 0
  cogs_upsells: 0
  cogs_downsells: 0
  cogs_continuity: 0
  total: 0
```

### Step 6: Calcular L30
```yaml
l30_result:
  total_revenue: 0 # Step 1 + 2 + 3 + 4
  total_costs: 0 # Step 5
  l30: 0 # Revenue - Costs
```

---

## Calculator Template

```yaml
l30_calculator:
  # ===== INPUTS =====
  leads_per_month: 100 # Para exemplo

  initial_offer:
    price: 1000
    conversion: 0.10
    cogs: 200

  upsells:
    - name: "Premium Add-on"
      price: 500
      conversion: 0.30 # dos compradores
      cogs: 50

    - name: "Extended Support"
      price: 200
      conversion: 0.50
      cogs: 20

  downsells:
    - name: "Starter Package"
      price: 300
      conversion: 0.20 # dos rejeitados
      cogs: 100

  continuity:
    monthly: 100
    signup_rate: 0.40
    month_1_churn: 0.10
    cogs: 10

  cac: 100

  # ===== CALCULATIONS =====
  per_lead:
    initial_revenue: 100 # $1000 × 10%
    upsell_revenue: 25 # ($500 × 30% + $200 × 50%) × 10%
    downsell_revenue: 54 # $300 × 20% × 90%
    continuity_revenue: 36 # $100 × 40% × 90%
    total_revenue: 215

    initial_cogs: 20 # $200 × 10%
    upsell_cogs: 2.5 # Proporcionalmente
    downsell_cogs: 18 # $100 × 20% × 90%
    continuity_cogs: 4 # $10 × 40%
    total_cogs: 44.5

    cac: 100

  l30: 70.5 # $215 - $44.5 - $100

  # ===== ANALYSIS =====
  l30_per_cac: 0.705 # L30/CAC
  health: "MÉDIO" # <1 = preocupante, 1-2 = ok, 2+ = saudável
```

---

## Health Check

### Benchmarks
| L30 vs CAC | Status | Ação |
|------------|--------|------|
| L30 < 0 | CRÍTICO | PARE marketing, conserte ofertas |
| L30 = 0-1x CAC | MÉDIO | Adicione upsells/downsells |
| L30 = 1-2x CAC | BOM | Otimize, pode escalar |
| L30 > 2x CAC | EXCELENTE | Escale agressivamente |

### Diagnóstico de Problemas
```yaml
if_l30_negative:
  check:
    - "Preço inicial muito baixo?"
    - "Conversão muito baixa?"
    - "CAC muito alto?"
    - "Sem upsells?"
    - "COGS muito alto?"

  prioritize:
    1: "Adicionar upsells (maior impacto)"
    2: "Aumentar preços"
    3: "Reduzir CAC"
    4: "Reduzir COGS"
```

---

## Optimization Levers

### Por Ordem de Impacto
```
1. ADICIONAR UPSELLS
   Típico: +50-200% em revenue por cliente
   Esforço: Médio

2. AUMENTAR PREÇOS
   10% mais preço = 30%+ mais profit (se margem 30%)
   Esforço: Baixo

3. ADICIONAR DOWNSELLS
   Recupera ~20% dos "nãos"
   Esforço: Médio

4. ADICIONAR CONTINUIDADE
   Receita previsível + múltiplos meses
   Esforço: Alto

5. REDUZIR COGS
   Productizar, automatizar, offshore
   Esforço: Alto

6. REDUZIR CAC
   Melhorar ads, ofertas, copy
   Esforço: Alto
```

---

## Output: L30 Calculation Report

```yaml
l30_calculation_report:
  timestamp: ""
  business: ""

  inputs_summary:
    initial_offer_price: 0
    initial_conversion: 0
    num_upsells: 0
    num_downsells: 0
    has_continuity: true | false
    cac: 0

  revenue_breakdown:
    per_lead:
      initial: 0
      upsells: 0
      downsells: 0
      continuity: 0
      total: 0

  cost_breakdown:
    per_lead:
      cac: 0
      cogs_total: 0
      total: 0

  l30_result:
    value: 0
    vs_cac_ratio: 0
    health: "" # critical | medium | good | excellent

  diagnosis:
    primary_issue: ""
    secondary_issues: []

  recommendations:
    immediate: []
    short_term: []
    long_term: []

  projections:
    if_add_upsell:
      new_l30: 0
      improvement: 0
    if_increase_price_20:
      new_l30: 0
      improvement: 0
```

---

## Quality Gate

```yaml
l30_calculation_quality:
  - [ ] Todos os componentes de revenue incluídos
  - [ ] Conversões são realistas (não assumidas)
  - [ ] COGS calculado para cada item
  - [ ] CAC baseado em dados reais
  - [ ] Continuidade inclui churn do mês 1
  - [ ] Health check interpretado corretamente
  - [ ] Recomendações priorizadas por impacto
  - [ ] Projeções de otimização calculadas
```

## Handoff

After completion:
- **L30 < 0** → `design-money-model.md` para redesenhar sequência
- **L30 = 0-1x** → `create-upsell-sequence.md` para adicionar upsells
- **L30 > 1x** → `optimize-ltv-cac-ratio.md` para otimização avançada

---
*Task: HZ_MOD_005 | Agent: hormozi-models | Version: 1.0*
*Source: $100M Money Models - Pilar 1*



<\!-- Criado com Squad Creator do AIOSPRO por @oalanicolas e @pedrovalerio | 2026-02-10 -->
