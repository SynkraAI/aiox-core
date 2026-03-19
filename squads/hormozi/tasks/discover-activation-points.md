# discover-activation-points

## Metadata
```yaml
task_id: HZ_RET_003
agent: hormozi-retention
type: analysis
complexity: high
estimated_time: 2-4 hours
source: "$100M Retention Playbook - Step 1 Churn Checklist"
```

## Purpose

Identificar os activation points do negócio - as ações ou resultados que, quando atingidos pelos clientes, fazem com que fiquem significativamente mais tempo.

> "Every customer that does (X thing) or gets (Y result) stays for longer. Gym Launch went from 8% churn to 3% in 6 months by creating 'The Fast Cash Play' focused on recovering investment in 30 days." — Alex Hormozi

---

## Input Required

```yaml
activation_discovery_input:
  business_type: "" # saas | membership | coaching | service | product

  customer_data:
    total_customers: 0
    churned_customers_3plus_months: [] # Clientes que ficaram 3+ meses antes de sair
    top_20_percent_by_revenue: [] # Top spenders

  available_data:
    demographics: true | false
    psychographics: true | false
    usage_data: true | false
    feature_adoption: true | false
    milestones_achieved: true | false
```

---

## Definition

### O Que É Activation Point
```
"Todo cliente que faz (X coisa) ou obtém (Y resultado)
fica mais tempo que clientes que não fazem."

É o momento AHA! onde o cliente:
- Percebe o valor real do produto
- Tem uma primeira vitória tangível
- Se compromete emocionalmente
```

### Exemplos por Vertical
| Vertical | Activation Point | Por que Funciona |
|----------|------------------|------------------|
| B2B Service | Primeira vez que conseguem leads | ROI tangível |
| Software | Primeiro login no dashboard | Engajamento inicial |
| Produto Físico | Primeira vez que usam consumível | Hábito formado |
| Gym Launch | Recuperar investimento em 30 dias | Dinheiro de volta |
| Curso Online | Completar primeiro módulo | Momentum |
| Comunidade | Primeira conexão significativa | Relacionamento |

---

## Process: 8 Steps to Discover

### Step 1: Encontrar Churned que Ficaram 3+ Meses
```
Por que 3+ meses:
- Eliminam "bad fits" que saíram rápido
- Esses clientes TINHAM algo que os manteve
- O que os manteve = pista do activation point
```

### Step 2: Ordenar por Quem Gastou Mais (Top 20%)
```
Por que top 20%:
- Clientes que pagam mais = mais engajados
- Mais dados de comportamento
- Padrões mais claros

FILTRO: Top 20% em lifetime revenue
```

### Step 3: Aprender Tudo Sobre Eles
```yaml
data_to_collect:
  demographics:
    - age_range
    - location
    - profession
    - company_size

  psychographics:
    - goals_when_joined
    - pain_points
    - values
    - buying_triggers

  usage_patterns:
    - first_action_taken
    - most_used_features
    - time_to_first_result
    - engagement_frequency

  milestones:
    - first_win
    - biggest_win
    - features_adopted
    - referrals_made
```

### Step 4: Encontrar Fatores Comuns
```
PERGUNTA CHAVE: "O que TODOS esses clientes têm em comum?"

Métodos:
1. Análise de dados quantitativa
2. Entrevistas qualitativas
3. Surveys direcionados

BUSCAR:
- Ações específicas que tomaram
- Resultados específicos que atingiram
- Timeline de quando atingiram
- Features que mais usaram
```

### Step 5: Reduzir para 5 Candidatos
```
Critérios de seleção:
1. CORRELAÇÃO: Alta correlação com retenção
2. ALCANÇÁVEL: Possível para maioria dos clientes
3. MENSURÁVEL: Consegue trackear se atingiu
4. CONTROLÁVEL: Consegue influenciar via produto/serviço
5. RÁPIDO: Atingível em tempo razoável (30-90 dias ideal)
```

### Step 6: Testar
```
Para cada candidato:
1. Definir hipótese: "Se cliente faz X, churn reduz Y%"
2. Criar experimento: Grupo A (direcionado) vs B (controle)
3. Medir por 30-60 dias
4. Validar ou invalidar
```

### Step 7: Atualizar Messaging
```
Uma vez validado:
- Atrair clientes que PODEM atingir o activation point
- Qualificar leads com base em likelihood de atingir
- Setar expectativa correta no processo de venda
```

### Step 8: Atualizar Onboarding
```
Redesenhar onboarding para:
- Direcionar ao activation point IMEDIATAMENTE
- Remover fricções no caminho
- Celebrar quando atingir
- Medir % que atinge e time-to-activation
```

### Retestar
```
Frequência: A cada 6-12 meses
Por que:
- Produto evolui
- Mercado muda
- Clientes mudam
- Activation point pode mudar
```

---

## Case Study: Gym Launch

### Problema
```
Churn: 8% mensal
Padrão: Clientes saíam antes de ver resultados
```

### Descoberta
```
Análise mostrou:
- Clientes que recuperavam investimento em 30 dias
- Ficavam MUITO mais tempo
- Activation point = "ROI positivo em 30 dias"
```

### Solução
```
Criaram "The Fast Cash Play":
- Framework para recuperar investimento rápido
- Direcionou onboarding para gerar ROI em 30 dias
- Mediu e celebrou quando atingiam
```

### Resultado
```
Churn: 8% → 3%
Timeline: 6 meses
Impacto: 2.67x aumento em LTV
```

---

## Framework de Análise

### Matriz de Activation Points
```yaml
candidate_activation_points:
  candidate_1:
    description: ""
    correlation_score: 0 # 1-10
    achievability: 0 # 1-10
    measurability: 0 # 1-10
    controllability: 0 # 1-10
    speed_days: 0
    total_score: 0

  candidate_2:
    # ... mesmo formato
```

### Scoring Guide
| Critério | 1-3 (Fraco) | 4-6 (Médio) | 7-10 (Forte) |
|----------|-------------|-------------|--------------|
| Correlação | <20% diff em retention | 20-40% diff | >40% diff |
| Alcançável | <30% atingem | 30-60% | >60% |
| Mensurável | Subjetivo | Parcial | Automatizado |
| Controlável | Externo | Parcial | 100% interno |
| Velocidade | >90 dias | 30-90 dias | <30 dias |

---

## Output: Activation Points Report

```yaml
activation_points_report:
  timestamp: ""
  business: ""

  analysis_summary:
    customers_analyzed: 0
    patterns_identified: 0
    candidates_tested: 0

  validated_activation_point:
    description: ""
    metric: ""
    target: ""
    time_to_achieve: ""
    current_achievement_rate: 0
    correlation_with_retention: ""

  secondary_activation_points:
    - description: ""
      metric: ""
      priority: ""

  recommendations:
    messaging_changes: []
    onboarding_changes: []
    product_changes: []

  testing_plan:
    hypothesis: ""
    experiment_design: ""
    success_criteria: ""
    timeline: ""

  next_review_date: ""
```

---

## Quality Gate

```yaml
activation_discovery_quality:
  - [ ] Analisou churned de 3+ meses (não apenas ativos)
  - [ ] Filtrou top 20% por revenue
  - [ ] Coletou dados demográficos E comportamentais
  - [ ] Identificou 5+ candidatos
  - [ ] Scorou candidatos com framework objetivo
  - [ ] Activation point é ALCANÇÁVEL (>50% podem atingir)
  - [ ] Activation point é MENSURÁVEL (consegue trackear)
  - [ ] Plano de teste definido
```

## Handoff

After completion:
- → `design-onboarding-sequence.md` para direcionar ao activation point
- → `create-engagement-scoring.md` para trackear progress ao activation
- → `implement-5-horsemen.md` se ainda não implementou táticas básicas

---
*Task: HZ_RET_003 | Agent: hormozi-retention | Version: 1.0*
*Source: $100M Retention Playbook - Step 1 Churn Checklist*



<\!-- Criado com Squad Creator do AIOSPRO por @oalanicolas e @pedrovalerio | 2026-02-10 -->
