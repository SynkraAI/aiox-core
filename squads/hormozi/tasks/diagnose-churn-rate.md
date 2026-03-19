# diagnose-churn-rate

## Metadata
```yaml
task_id: HZ_RET_001
agent: hormozi-retention
type: diagnostic
complexity: medium
estimated_time: 30-45 min
source: "$100M Retention Playbook - Formulas Fundamentais"
```

## Purpose

Calcular churn rate, LTV e LTV:CAC ratio para diagnosticar a saúde do backend do negócio e determinar prioridades de ação.

> "Reducing churn from 10% to 3% is a 3.3x increase in lifetime value. It costs five to twenty-five times more to acquire a new customer compared to retaining one." — Alex Hormozi

---

## Input Required

```yaml
churn_diagnosis_input:
  business_model: "" # recurring | transactional
  period: "" # monthly | quarterly
  customers_start_of_period: 0
  customers_end_of_period: 0
  customers_lost: 0 # Note: novos clientes NÃO afetam cálculo
  arpu: 0 # Average Revenue Per User
  gross_margin_percent: 0 # Ex: 70 para 70%
  cac: 0 # Customer Acquisition Cost
  # Opcional (se disponível)
  revenue_start: 0
  revenue_end: 0
  avg_transactions_per_customer: 0 # Para transacionais
```

---

## Step 1: Calculate Churn Rate

### Formula
```
Churn = Clientes que saíram / Pool original de clientes

IMPORTANTE: Novos clientes NÃO entram no cálculo.
```

### Exemplo
```
100 clientes em 01/Jan
5 cancelaram durante Janeiro
95 restantes em 01/Fev

Churn = 5 / 100 = 5% mensal
```

### Extended: Revenue Churn (Dollar-Weighted)
```
Revenue Churn = Receita perdida / Receita total início

Mais importante que customer churn porque pesa por valor.
Ex: Perder 1 cliente de $10k > perder 10 de $100
```

### Benchmarks
| Churn Mensal | Status | Ação |
|--------------|--------|------|
| < 3% | Excelente | Foque em aquisição |
| 3-5% | Bom | Otimize com 5 Horsemen |
| 5-10% | Alerta | Priorize retention |
| > 10% | Crítico | PARE aquisição, conserte produto |

---

## Step 2: Calculate LTV

### Para Negócios de Recorrência
```
LTGP = Gross Profit Mensal / Churn Rate

Exemplo:
ARPU: $200/mês
Margem: 60%
GP Mensal: $120
Churn: 5%

LTGP = $120 / 0.05 = $2,400
```

### Para Negócios Transacionais
```
LTGP = Gross Profit por Transação × Média de Transações

Exemplo:
Ticket médio: $100
Margem: 80%
GP por transação: $80
Média transações: 4

LTGP = $80 × 4 = $320
```

### Impacto do Churn no LTV
| Churn | Meses Médios | Se ARPU $100 |
|-------|--------------|--------------|
| 10% | 10 meses | $1,000 LTV |
| 5% | 20 meses | $2,000 LTV |
| 3% | 33 meses | $3,300 LTV |
| 2% | 50 meses | $5,000 LTV |

---

## Step 3: Calculate LTV:CAC Ratio

### Formula
```
LTV:CAC = LTGP / CAC

Exemplo:
LTGP: $2,400
CAC: $600

LTV:CAC = $2,400 / $600 = 4:1
```

### Health Check
| Ratio | Status | Ação Imediata |
|-------|--------|---------------|
| ≥ 3:1 | Saudável | Pode escalar agressivamente |
| 2:1 - 3:1 | Alerta | Margens finas, otimizar LTV ou reduzir CAC |
| < 2:1 | Crítico | PARAR escala, consertar backend primeiro |

---

## Step 4: Extended Metrics (Se Dados Disponíveis)

### Net Revenue Retention (NRR)
```
NRR = (Receita início + Expansão - Contração - Churn) / Receita início × 100

NRR > 100% = Crescendo mesmo sem novos clientes
NRR < 100% = Encolhendo, precisa de novos clientes para compensar
```

### Payback Period
```
Payback = CAC / (ARPU × Margem)

Meta: < 12 meses (idealmente < 6)
```

---

## Step 5: Diagnosis & Red Flags

### Decision Rules
```yaml
red_flags:
  - churn > 10%: "PARE aquisição, problema de produto"
  - ltv_cac < 2: "PARE escala, consertar backend"
  - payback > 12_months: "Risco de caixa, revisar unit economics"
  - nrr < 80%: "Hemorrhaging clientes, prioridade 1"

green_lights:
  - churn < 3%: "Produto forte, foque em aquisição"
  - ltv_cac > 3: "Pode escalar agressivamente"
  - payback < 6_months: "Modelo saudável"
  - nrr > 100%: "Crescimento orgânico, máquina funcionando"
```

---

## Output: Churn Diagnosis Report

```yaml
churn_diagnosis_report:
  timestamp: ""
  business: ""

  core_metrics:
    churn_rate:
      value: 0
      unit: "percent_monthly"
      status: "" # excellent | good | warning | critical

    ltgp:
      value: 0
      currency: "USD"
      calculation_method: "" # recurring | transactional

    ltv_cac_ratio:
      value: 0
      status: "" # healthy | alert | critical

  extended_metrics:
    revenue_churn: 0
    nrr: 0
    payback_months: 0

  diagnosis:
    overall_health: "" # healthy | needs_attention | critical
    primary_issue: ""
    root_cause_hypothesis: ""

  recommended_actions:
    immediate: []
    short_term: []
    long_term: []

  next_task: "" # Based on diagnosis
```

---

## Quality Gate

```yaml
churn_diagnosis_quality:
  - [ ] Churn calculado APENAS com cohort original (sem novos)
  - [ ] LTV calculado com método correto (recurring vs transactional)
  - [ ] Margem bruta usada (não revenue bruto)
  - [ ] LTV:CAC interpretado corretamente
  - [ ] Red flags identificados se presentes
  - [ ] Próxima ação recomendada baseada em dados
  - [ ] Dados validados com cliente (não assumidos)
```

## Handoff

After completion:
- **Churn > 10%** → Revisar produto antes de qualquer tática de retention
- **LTV:CAC < 2:1** → `design-money-model.md` para consertar unit economics
- **Churn 5-10%** → `implement-5-horsemen.md` para táticas de retention
- **Churn < 5%** → `discover-activation-points.md` para otimização
- **Precisa de métricas** → `create-engagement-scoring.md` para tracking

---
*Task: HZ_RET_001 | Agent: hormozi-retention | Version: 1.0*
*Source: $100M Retention Playbook - Formulas Fundamentais*



<\!-- Criado com Squad Creator do AIOSPRO por @oalanicolas e @pedrovalerio | 2026-02-10 -->
