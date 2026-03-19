# Activation Point Discovery Checklist

> Checklist de validação para `discover-activation-points.md` (HZ_RET_003)
> Source: $100M Retention Playbook - Step 1 Churn Checklist
> Agent: hormozi-retention

---

## Data Collection

```yaml
data_collection:
  customer_selection:
    - [ ] Identificou churned customers que ficaram 3+ meses
    - [ ] Filtrou top 20% por lifetime revenue
    - [ ] Amostra suficiente para análise (mín 20 clientes)

  data_gathered:
    - [ ] Demographics coletados (age, location, profession)
    - [ ] Psychographics coletados (goals, pain points, values)
    - [ ] Usage patterns mapeados (first action, features, frequency)
    - [ ] Milestones atingidos documentados
```

---

## Pattern Analysis

```yaml
pattern_analysis:
  common_factors:
    - [ ] Identificou ações específicas que tomaram
    - [ ] Identificou resultados específicos que atingiram
    - [ ] Mapeou timeline de quando atingiram
    - [ ] Listou features mais usadas

  validation_method:
    - [ ] Análise quantitativa realizada
    - [ ] Entrevistas qualitativas (se possível)
    - [ ] Correlação com retenção verificada
```

---

## Candidate Selection

```yaml
candidates:
  initial_list:
    - [ ] Pelo menos 5 candidatos identificados
    - [ ] Cada candidato documentado com descrição clara

  scoring_criteria:
    - [ ] Correlação score (1-10): Alta correlação com retenção
    - [ ] Achievability score (1-10): >50% podem atingir
    - [ ] Measurability score (1-10): Consegue trackear
    - [ ] Controllability score (1-10): Consegue influenciar
    - [ ] Speed score: Atingível em <90 dias

  filtered:
    - [ ] Candidatos scorados objetivamente
    - [ ] Top 3 selecionados para teste
```

---

## Activation Point Validation

```yaml
validation:
  criteria_met:
    - [ ] ALCANÇÁVEL: >50% dos clientes podem atingir
    - [ ] MENSURÁVEL: Sistema pode trackear se atingiu
    - [ ] CONTROLÁVEL: Consegue influenciar via produto/serviço
    - [ ] RÁPIDO: Atingível em tempo razoável (30-90 dias ideal)

  correlation_verified:
    - [ ] Clientes que atingem têm retention significativamente maior
    - [ ] Diferença é estatisticamente relevante
```

---

## Test Plan Created

```yaml
test_plan:
  hypothesis:
    - [ ] Hipótese clara: "Se cliente faz X, churn reduz Y%"
    - [ ] Métricas de sucesso definidas

  experiment:
    - [ ] Grupo de teste definido
    - [ ] Grupo de controle definido
    - [ ] Período de teste (30-60 dias)
    - [ ] Owner do experimento
```

---

## Implications Mapped

```yaml
implications:
  messaging:
    - [ ] Como atualizar copy para atrair quem pode atingir
    - [ ] Qualificação de leads ajustada

  onboarding:
    - [ ] Caminho para activation point claro
    - [ ] Fricções identificadas
    - [ ] Quick wins no caminho definidos
```

---

## Output Quality

```yaml
output_quality:
  report_complete:
    - [ ] Activation point principal definido com métrica
    - [ ] Secondary activation points listados
    - [ ] Test plan documentado
    - [ ] Recomendações de messaging
    - [ ] Recomendações de onboarding
    - [ ] Review date agendado (6-12 meses)
```

---

*Checklist: activation-point | Version: 1.0*
*Supports: discover-activation-points.md (HZ_RET_003)*

---

## Scoring

| Category | Items | Points Each | Max |
|----------|-------|-------------|-----|
| Critical — Validation Criteria & Correlation Verified | 6 | 3 | 18 |
| Standard — Data Collection, Pattern Analysis, Candidate Selection | 18 | 2 | 36 |
| Bonus — Test Plan, Implications, Output Quality | 13 | 1 | 13 |
| **TOTAL** | **37** | | **67** |

### Thresholds
- **PASS**: >= 54 points (80%)
- **CONDITIONAL**: >= 41 points (60%)
- **FAIL**: < 41 points

### If FAIL
The activation point has not been validated with sufficient rigor. Return to Data Collection and ensure a minimum sample of 20 churned long-tenure customers is analyzed before re-running pattern analysis and candidate scoring.



<\!-- Criado com Squad Creator do AIOSPRO por @oalanicolas e @pedrovalerio | 2026-02-10 -->
