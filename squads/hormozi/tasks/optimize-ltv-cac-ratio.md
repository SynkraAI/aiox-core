# optimize-ltv-cac-ratio

## Metadata
```yaml
task_id: HZ_MOD_006
agent: hormozi-retention
type: optimization
complexity: high
estimated_time: 2-3 hours
source: "$100M Retention Playbook - Crazy 8"
```

## Purpose

Otimizar o ratio LTV:CAC usando o framework "Crazy 8" do Hormozi - 8 métodos sistemáticos para aumentar LTV e reduzir CAC, priorizando por impacto e facilidade de implementação.

> "LTV can only go infinitely up. Costs can only go to zero. A 10% profit business with 20% price increase = 3x profit (not 20%)." — Alex Hormozi

---

## Input Required

```yaml
ltv_optimization_input:
  current_metrics:
    ltv: 0
    cac: 0
    ltv_cac_ratio: 0
    gross_margin_percent: 0
    churn_rate: 0

  current_pricing:
    core_offer_price: 0
    avg_upsell_revenue: 0
    has_continuity: true | false

  operational:
    team_size: 0
    capacity_utilization: 0 # %
    main_cost_drivers: []
```

---

## The Crazy 8 Framework

### Overview
```
LTV só pode ir INFINITAMENTE para cima.
Custos só podem ir ATÉ ZERO.

Portanto: Foque em aumentar LTV primeiro.
```

### Os 8 Métodos
| # | Método | Impacto | Esforço |
|---|--------|---------|---------|
| 1 | Aumentar Preços | ALTO | BAIXO |
| 2 | Diminuir Custos | MÉDIO | MÉDIO |
| 3 | Aumentar # de Compras | ALTO | MÉDIO |
| 4 | Cross-Sell | MÉDIO | MÉDIO |
| 5 | Upsell Quantity | MÉDIO | BAIXO |
| 6 | Upsell Quality | ALTO | MÉDIO |
| 7 | Downsell Quantity | BAIXO | BAIXO |
| 8 | Downsell Quality | BAIXO | BAIXO |

---

## Method #1: Aumentar Preços (MAIOR IMPACTO)

### Por Que É Mais Poderoso
```
Negócio de 10% profit margin:
+ 20% aumento de preço
= 3x profit (não 20%!)

Matemática:
Receita: $100 → $120
Custo: $90 (fixo)
Profit: $10 → $30 = 3x
```

### Processo de Teste
```yaml
price_testing_process:
  step_1:
    action: "Calcular optimal price"
    formula: "Sales conversion × Lifetime GP = Optimal"

  step_2:
    action: "Testar a cada quarter"
    frequency: "3 meses"

  step_3:
    action: "Incrementar gradualmente"
    method: "Subir 20% a cada 10 vendas até queda dramática"

  step_4:
    action: "Voltar ao sweet spot"
    trigger: "Conversão cai >30%"
```

### Fórmula de Breakeven
```
Breakeven Conv Rate = Old Revenue / New Price

Exemplo:
Preço atual: $1,000 com 10% conversão = $100/lead
Novo preço: $1,200
Breakeven: $100 / $1,200 = 8.3% conversão

SE nova conversão > 8.3% = FAZER
```

### Decision Rule
```yaml
price_increase_decision:
  if:
    - "New conv rate > breakeven"
    - "AND revenue per lead increases"
  then: "FAZER o aumento"

  example:
    old: "$1000 × 10% = $100/lead"
    new: "$1200 × 9% = $108/lead"
    verdict: "FAZER (+8%)"
```

---

## Method #2: Diminuir Custos

### Táticas para Serviços
```yaml
cost_reduction_tactics:
  increase_ratio:
    before: "5 clientes por rep"
    after: "10 clientes por rep"
    saving: "50% custo de pessoal"

  offshore_talent:
    saving: "80%+ em custos"
    roles: ["Support", "Admin", "Junior work"]

  productize_delivery:
    method: "Templates, automação, sistemas"
    benefit: "Menos tempo por cliente"

  dfy_to_dwy:
    before: "Done For You ($$$)"
    after: "Done With You ($$)"
    saving: "50%+ entrega"

  cap_usage:
    method: "Limitar revisões, cobrar por uso extra"
    example: "3 revisões incluídas, $X por adicional"

  lifetime_to_annual:
    before: "Acesso lifetime"
    after: "Acesso 12 meses, renovação"
    benefit: "Receita recorrente + custo limitado"

  in_person_to_remote:
    saving: "Travel, venue, time"

  cut_meeting_times:
    method: "Deletar recorrentes, só necessário"

  bulk_prepay:
    saving: "10-20% em fornecedores"
```

---

## Method #3: Aumentar # de Compras

### 3 Sub-Métodos

#### a) Adicionar Recorrência
```yaml
add_recurring:
  service_example:
    before: "Plumbing one-time"
    after: "Plumbing membership"

  product_example:
    before: "Canecas avulsas"
    after: "Caneca do mês club"

  digital_example:
    before: "Curso one-time"
    after: "Calls de accountability recorrentes"
```

#### b) Diminuir Churn
```
Impacto:
Churn 10% → 5% = 2x LTV

Táticas:
→ Seguir 9-Step Churn Checklist
→ Implementar 5 Horsemen
→ Create engagement scoring
```

#### c) Follow Up
```yaml
follow_up_strategy:
  promos_trimestrais:
    frequency: "A cada 90 dias"
    content: "Oferta especial para base"

  value_between_asks:
    rule: "3:1 ratio valor:pedido"
    content: "Conteúdo útil, dicas, cases"

  top_of_mind:
    channels: ["Email", "SMS", "Community"]
    frequency: "Semanal mínimo"
```

---

## Method #4: Cross-Sell (Algo Diferente)

### Definição
```
Vender outro produto que COMPLEMENTA o primeiro.
(Diferente de upsell que é MAIS do mesmo)
```

### Fórmula
```
New LTV = Original LTV + (Conv Rate × GP do Cross-Sell)

Exemplo:
LTV original: $100
Cross-sell: $100 com 20% conversão
New LTV: $100 + ($100 × 20%) = $120
```

### Exemplos
| Core Product | Cross-Sell |
|--------------|------------|
| Lawn care | Snow blowing no inverno |
| Burgers | Fries e refrigerante |
| Curso | Comunidade |
| Software | Consultoria |
| Produto | Serviço de manutenção |

### Regra
```
NÃO quebrar o negócio por trocados.
Cross-sell deve ser FÁCIL de adicionar
com infraestrutura existente.
```

---

## Method #5: Upsell Quantity (Mais do Mesmo)

### 3 Formas
| Tipo | Descrição | Multiplicador |
|------|-----------|---------------|
| Bulk | Pré-pagar por um ano | 12x |
| More Often | Mensal → a cada 3 semanas | 1.33x |
| Bigger | 1 hora → 3 horas | 3x |

### Tática
```
Oferecer primeiro a quantidade maior.
Depois downsell para oferta padrão se recusar.
```

---

## Method #6: Upsell Quality (Melhor)

### 14 Quality Levers
| Lever | Standard → Premium |
|-------|-------------------|
| Response time | Horas → Minutos |
| Availability | 9-5 → 24hrs |
| Days | Mon/Wed/Fri → Todos |
| Time per session | 15min → 60min |
| Locations | 1 → Todas |
| Cancellation | Taxas → Free |
| Service ratio | 1-to-many → 1-on-1 |
| Communication | Chat → Video call |
| Provider | Junior → Expert/Owner |
| Live vs Recorded | Gravado → Ao vivo |
| Remote vs In-person | Remoto → Presencial |
| DIY/DWY/DFY | DIY → DFY |
| Expirations | Limitado → Forever |
| Personalization | Genérico → Custom |

### Para Produtos Físicos
```
- Melhores ingredientes (sirloin vs ground chuck)
- Materiais melhores (steel vs iron)
- Mais durável
- Mais leve
- Mais bonito
```

---

## Method #7: Downsell Quantity (Menos ao Invés de Nada)

### Lógica
```
Se é isso ou nada, isso vence nada.
Capturar algo é melhor que capturar zero.
```

### 3 Formas
| Tipo | Exemplo |
|------|---------|
| Quantity | Pré-pagar 3 meses ao invés de 12 |
| Less Often | Uma visita a cada 2 meses ao invés de mensal |
| Smaller | 30 minutos ao invés de 1 hora |

### Regra Crítica
```
NUNCA downsell para um comprador QUALIFICADO.
Apenas para quem NÃO qualifica para oferta principal.
```

---

## Method #8: Downsell Quality (Pior ao Invés de Nada)

### Inverter a Lista de Quality
```
- Response time mais lento
- Menos disponibilidade
- Menos locais
- Menos dias por semana
- Horários mais limitados
- Menos flexibilidade
- Employees mais junior
- Ratio maior cliente:employee
- Métodos menos convenientes
- Mais gravado, menos live
- Mais remoto, menos presencial
- DFY → DWY → DIY
- Menos personalização
- Sem garantia
```

---

## Prioritization Framework

### Matrix Impacto × Esforço
```
             BAIXO ESFORÇO    ALTO ESFORÇO
ALTO         ┌─────────────┬─────────────┐
IMPACTO      │ 1. PREÇOS   │ 3. COMPRAS  │
             │ 5. UPSELL Q │ 6. UPSELL   │
             │             │    QUALITY  │
             ├─────────────┼─────────────┤
BAIXO        │ 7. DOWN Q   │ 2. CUSTOS   │
IMPACTO      │ 8. DOWN Q   │ 4. CROSS    │
             └─────────────┴─────────────┘
```

### Ordem Recomendada
```
1. Aumentar Preços (quick win, maior impacto)
2. Upsell Quantity (fácil de oferecer)
3. Upsell Quality (criar versão premium)
4. Aumentar # de Compras (adicionar recorrência)
5. Cross-Sell (se tiver algo complementar)
6. Downsells (capturar os "nãos")
7. Diminuir Custos (último, mais trabalhoso)
```

---

## Output: LTV Optimization Plan

```yaml
ltv_optimization_plan:
  timestamp: ""
  business: ""

  current_state:
    ltv: 0
    cac: 0
    ratio: 0
    health: "" # critical | alert | healthy

  method_analysis:
    method_1_prices:
      current_price: 0
      recommended_test: 0
      breakeven_conversion: 0
      potential_impact: ""
      priority: 0

    method_2_costs:
      main_cost_drivers: []
      reduction_opportunities: []
      potential_savings: 0
      priority: 0

    method_3_purchases:
      current_frequency: ""
      opportunities: []
      potential_impact: ""
      priority: 0

    method_4_crosssell:
      possible_products: []
      estimated_conversion: 0
      potential_impact: ""
      priority: 0

    method_5_upsell_quantity:
      bulk_option: ""
      frequency_option: ""
      bigger_option: ""
      priority: 0

    method_6_upsell_quality:
      premium_levers: []
      price_premium: 0
      priority: 0

    method_7_downsell_quantity:
      options: []
      priority: 0

    method_8_downsell_quality:
      options: []
      priority: 0

  implementation_roadmap:
    week_1_2:
      - method: ""
        action: ""
    week_3_4:
      - method: ""
        action: ""
    month_2:
      - method: ""
        action: ""

  projected_results:
    new_ltv: 0
    improvement: 0
    new_ratio: 0
```

---

## Quality Gate

```yaml
ltv_optimization_quality:
  - [ ] Todos 8 métodos analisados
  - [ ] Preço testável definido com breakeven
  - [ ] Pelo menos 3 métodos priorizados
  - [ ] Roadmap de implementação criado
  - [ ] Projeções baseadas em dados
  - [ ] Quick wins identificados (baixo esforço, alto impacto)
  - [ ] Regra de "nunca downsell comprador qualificado" clara
  - [ ] Métricas de sucesso definidas
```

## Handoff

After completion:
- → `design-money-model.md` para integrar otimizações
- → `create-upsell-sequence.md` para implementar upsells
- → `diagnose-churn-rate.md` para verificar impacto

---
*Task: HZ_MOD_006 | Agent: hormozi-retention | Version: 1.0*
*Source: $100M Retention Playbook - Crazy 8*



<\!-- Criado com Squad Creator do AIOSPRO por @oalanicolas e @pedrovalerio | 2026-02-10 -->
