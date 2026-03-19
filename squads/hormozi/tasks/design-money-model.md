# design-money-model

## Metadata
```yaml
task_id: HZ_MOD_001
agent: hormozi-models
type: strategy
complexity: high
estimated_time: 2-3 hours
source: "$100M Money Models - Framework GMMM"
```

## Purpose

Desenhar a arquitetura completa do Money Model usando o framework GMMM (Get Money, More Money, Max Money), criando uma sequência de ofertas que recupera CAC em 30 dias e atinge LTV:CAC de 3:1 ou superior.

> "You can shear a sheep for a lifetime, but you can only skin it once." — John, mentor de Alex Hormozi

---

## Input Required

```yaml
money_model_input:
  business_type: "" # saas | service | coaching | product

  current_metrics:
    cac: 0
    avg_first_sale: 0
    conversion_rate: 0 # %
    cogs_per_sale: 0
    gross_margin_percent: 0
    current_ltv: 0
    churn_rate: 0 # % mensal

  existing_offers:
    core_offer: ""
    upsells: []
    downsells: []
    continuity: ""
```

---

## Framework GMMM

### Visão Geral
```
┌───────────────────────────────────────────────────────────┐
│ ESTÁGIO 1: GET MONEY (Ofertas de Atração)                 │
│ Objetivo: Transformar estranhos em clientes               │
│ Meta: Cobrir CAC + COGs                                   │
│ KPI: Lucro de 30 dias > $0                                │
├───────────────────────────────────────────────────────────┤
│ ESTÁGIO 2: MORE MONEY (Upsells + Downsells)               │
│ Objetivo: Maximizar lucro por cliente                     │
│ Meta: 3-5x valor inicial                                  │
│ KPI: LTV de 30 dias > 3x CAC                              │
├───────────────────────────────────────────────────────────┤
│ ESTÁGIO 3: MAX MONEY (Continuidade)                       │
│ Objetivo: Receita recorrente previsível                   │
│ Meta: 80%+ em continuidade                                │
│ KPI: Churn < 5% mensal                                    │
└───────────────────────────────────────────────────────────┘
```

---

## Matriz de Ofertas 4x3

### Estrutura
```
             │ Quantidade  │ Qualidade  │ Diferente    │
─────────────┼─────────────┼────────────┼──────────────┤
Atração      │ Mais        │ Premium    │ Novo         │
─────────────┼─────────────┼────────────┼──────────────┤
Upsell       │ Dobro       │ Melhor     │ Complementar │
─────────────┼─────────────┼────────────┼──────────────┤
Downsell     │ Menos       │ Inferior   │ Alternativa  │
─────────────┼─────────────┼────────────┼──────────────┤
Continuidade │ Ilimitado   │ Mantida    │ Recorrente   │
```

### Como Usar
```
Para cada tipo de oferta (Atração, Upsell, Downsell, Continuidade):
- Pergunte: Posso oferecer MAIS quantidade?
- Pergunte: Posso oferecer MELHOR qualidade?
- Pergunte: Posso oferecer algo DIFERENTE/complementar?
```

---

## Os 4 Pilares do LTV

### Pilar 1: Lucro em 30 Dias

#### Por Que É Essencial
```
Permite usar cartão de crédito como capital de giro infinito.
- Você gasta no dia 1
- Você recebe no dia 30
- Cartão cobra no dia 30
- Se L30 > 0, ciclo se auto-sustenta
```

#### Consequência de Ignorar
```
Ficar sem caixa → Parar publicidade → Morrer lentamente
82% dos negócios morrem por falta de cash flow, não de clientes.
```

#### Formula
```
L30 = (P1 × C1) + Σ(Un × Cn × Vn) - CAC - COGS

Onde:
L30  = Lucro em 30 dias
P1   = Preço oferta inicial
C1   = Taxa conversão inicial
Un   = Preço upsell n
Cn   = Taxa conversão upsell n
Vn   = Volume ofertas upsell n
CAC  = Custo de aquisição
COGS = Custo de entrega
```

#### Calculator Template
```yaml
30_day_profit_calculator:
  inputs:
    initial_offer_price: 0
    initial_conversion_rate: 0 # Ex: 0.10 para 10%
    cac: 0
    cogs: 0

  upsells:
    - name: ""
      price: 0
      conversion_rate: 0

  calculation:
    revenue_initial: 0 # price × conversion
    revenue_upsells: 0 # sum of each
    total_revenue: 0
    total_costs: 0 # CAC + COGS
    L30: 0 # Total revenue - total costs
```

---

### Pilar 2: Sequência Problema-Solução

#### Conceito
```
Toda solução cria um novo problema que requer outra solução.
Isso cria oportunidades NATURAIS de upsell sem parecer forçado.
```

#### Exemplos
| Compra Inicial | Problema Criado | Upsell Natural |
|----------------|-----------------|----------------|
| Carro alugado | Precisa seguro | Seguro do carro |
| Desafio fitness | Precisa nutrição | Suplementos |
| Software | Precisa aprender | Treinamento |
| Curso | Precisa aplicar | Coaching |
| Produto | Precisa manter | Consumíveis |

#### Como Mapear
```yaml
problem_solution_mapping:
  core_offer: ""

  problems_created:
    - problem_1:
        description: ""
        urgency: "" # high | medium | low
        natural_solution: ""
        price_range: ""

    - problem_2:
        # ...
```

---

### Pilar 3: Ancoragem de Valor

#### Conceito
```
Apresentar primeiro a opção mais cara
para fazer outras parecerem baratas.
```

#### Caso Real - Loja de Ternos
```
Cliente entra com orçamento de $500.

SEM ANCHOR:
→ Mostra terno de $500
→ Cliente compra $500

COM ANCHOR:
→ Mostra primeiro terno de $16,000 (engasgo)
→ "Você se importa muito com [feature premium]?"
→ Mostra terno de $2,200
→ Cliente compra $2,200 + $300 acessórios = $2,500

Resultado: 5x o orçamento original
```

#### Regra Crítica
```
Trate a âncora como oferta REAL.
Se falsa, perdem confiança.
Alguns VÃO comprar a âncora.
```

---

### Pilar 4: Fricção Zero

#### Conceito
```
Remover toda barreira entre decisão e pagamento.
50% das vendas morrem na fricção do pagamento.
```

#### Técnica: Cartão em Arquivo
```
❌ ERRADO: "Você quer comprar?"
✅ CERTO: "Qual cartão você quer usar?"
✅ MELHOR: "Usar o cartão em arquivo?" (se já tem)

Aumento de conversão: 40%
```

---

## Benchmarks de Performance

| Nível | L30 vs CAC | Status |
|-------|------------|--------|
| RUIM | L30 < 0 | Perdendo dinheiro por cliente |
| MÉDIO | L30 = 1x CAC | Break-even em 30 dias |
| BOM | L30 = 2x CAC | Saudável |
| EXCELENTE | L30 = 3x+ CAC | Escalar agressivamente |

---

## LTGP:CAC Health Check

| Ratio | Status | Ação |
|-------|--------|------|
| > 3:1 | Saudável | Escalar agressivamente |
| 2-3:1 | Alerta | Otimizar (adicionar ofertas) |
| < 2:1 | Crítico | PARAR e consertar |

---

## Cash First Hierarchy

### Ordem de Prioridade
```
1. CONSERTE ATRAÇÃO (se CAC > 30-day revenue)
   → Perdendo dinheiro por cliente. Nada mais importa.

2. ADICIONE UPSELLS (se cobriu mas margens baixas)
   → Clássico primeiro → Menu → Anchor → Rollover

3. ADICIONE DOWNSELLS (se conversão < 20%)
   → Plano Pagamento → Trial com Penalidade → Recursos

4. ADICIONE CONTINUIDADE (se 1-3 funcionam)
   → Bonus primeiro → Taxa Dispensada → Desconto
```

---

## Output: Money Model Architecture

```yaml
money_model_architecture:
  timestamp: ""
  business: ""

  current_state:
    cac: 0
    l30: 0
    ltv: 0
    ltv_cac_ratio: 0
    health: "" # critical | alert | healthy | excellent

  stage_1_get_money:
    attraction_offer:
      name: ""
      price: 0
      conversion_target: 0
      cogs: 0
      gross_margin: 0

    recovery_timeline: "" # days to recover CAC

  stage_2_more_money:
    upsells:
      - name: ""
        price: 0
        timing: ""
        conversion_target: 0
        rationale: "" # problema que resolve

    downsells:
      - name: ""
        price: 0
        trigger: ""
        conversion_target: 0

    target_multiplier: "" # Ex: 3-5x initial

  stage_3_max_money:
    continuity_offer:
      name: ""
      price: 0
      type: "" # bonus | discount | waived_fee
      churn_target: 0

    percentage_in_continuity: 0

  projections:
    new_l30: 0
    new_ltv: 0
    new_ltv_cac_ratio: 0
    expected_health: ""

  implementation_priority:
    1: ""
    2: ""
    3: ""
```

---

## Quality Gate

```yaml
money_model_quality:
  - [ ] 4 pilares endereçados (L30, problema-solução, anchor, fricção)
  - [ ] L30 calculado com fórmula completa
  - [ ] Pelo menos 2 upsells mapeados
  - [ ] Pelo menos 1 downsell definido
  - [ ] Continuity offer desenhada
  - [ ] LTGP:CAC projetado > 3:1
  - [ ] Cash First Hierarchy seguida
  - [ ] Prioridades de implementação definidas
```

## Handoff

After completion:
- → `create-upsell-sequence.md` para detalhar ofertas de upsell
- → `create-downsell-sequence.md` para ofertas de downsell
- → `design-continuity-offer.md` para oferta de recorrência
- → `calculate-30-day-profit.md` para cálculo detalhado

---
*Task: HZ_MOD_001 | Agent: hormozi-models | Version: 1.0*
*Source: $100M Money Models - Framework GMMM*



<\!-- Criado com Squad Creator do AIOSPRO por @oalanicolas e @pedrovalerio | 2026-02-10 -->
