# Churn Diagnosis Checklist

> Checklist de validação para `diagnose-churn-rate.md` (HZ_RET_001)
> Source: $100M Retention Playbook - Formulas Fundamentais
> Agent: hormozi-retention

---

## Pre-Diagnosis: Data Collection

```yaml
pre_diagnosis:
  required_data:
    - [ ] Número de clientes no início do período
    - [ ] Número de clientes no fim do período
    - [ ] Número de clientes perdidos (churned)
    - [ ] ARPU (Average Revenue Per User)
    - [ ] Gross margin % (margem bruta)
    - [ ] CAC (Customer Acquisition Cost)

  optional_data:
    - [ ] Revenue no início vs fim (para revenue churn)
    - [ ] Avg transactions per customer (se transacional)
    - [ ] NRR (Net Revenue Retention)
    - [ ] Expansion revenue
```

---

## Churn Calculation Validation

```yaml
churn_validation:
  formula_check:
    - [ ] Usou APENAS cohort original (sem novos clientes)
    - [ ] Período definido claramente (mensal/trimestral)
    - [ ] Clientes perdidos = saíram, não pausados

  common_errors:
    - [ ] NÃO incluiu novos clientes no denominador
    - [ ] NÃO confundiu com revenue churn
    - [ ] NÃO misturou períodos diferentes
```

---

## LTV Calculation Validation

```yaml
ltv_validation:
  recurring_business:
    - [ ] Usou fórmula: LTGP = GP Mensal / Churn Rate
    - [ ] Usou Gross Profit (não revenue bruto)
    - [ ] Churn está em decimal (5% = 0.05)

  transactional_business:
    - [ ] Usou fórmula: LTGP = GP/transação × Avg transações
    - [ ] Média de transações baseada em dados reais
```

---

## LTV:CAC Ratio Interpretation

```yaml
ratio_interpretation:
  health_check:
    - [ ] Ratio ≥ 3:1 → Saudável, pode escalar
    - [ ] Ratio 2:1-3:1 → Alerta, otimizar LTV ou reduzir CAC
    - [ ] Ratio < 2:1 → Crítico, PARAR escala

  action_alignment:
    - [ ] Recomendação alinhada com status do ratio
    - [ ] Prioridades corretas (backend antes de acquisition)
```

---

## Red Flags Identified

```yaml
red_flags_check:
  must_flag:
    - [ ] Churn > 10% mensal → PARAR aquisição
    - [ ] LTV:CAC < 2:1 → PARAR escala
    - [ ] Payback > 12 meses → Risco de caixa
    - [ ] NRR < 80% → Hemorrhaging clientes

  green_lights:
    - [ ] Churn < 3% → Produto forte
    - [ ] LTV:CAC > 3:1 → Pode escalar
    - [ ] Payback < 6 meses → Modelo saudável
    - [ ] NRR > 100% → Crescimento orgânico
```

---

## Output Quality

```yaml
output_quality:
  report_complete:
    - [ ] Todas métricas core calculadas
    - [ ] Status de cada métrica definido
    - [ ] Diagnóstico overall claro
    - [ ] Root cause hypothesis documentada
    - [ ] Ações recomendadas priorizadas
    - [ ] Próxima task indicada baseada em dados
```

---

## Decision Rules Applied

```yaml
decision_rules:
  - [ ] DR-001: Churn > 10% = problema de produto, não de crescimento
  - [ ] DR-004: LTV:CAC < 2:1 = parar de escalar
  - [ ] DR-006: LTV:CAC ≥ 3:1 = pode escalar agressivamente
```

---

*Checklist: churn-diagnosis | Version: 1.0*
*Supports: diagnose-churn-rate.md (HZ_RET_001)*

---

## Scoring

| Category | Items | Points Each | Max |
|----------|-------|-------------|-----|
| Critical — Churn Calculation Validation & Red Flags | 11 | 3 | 33 |
| Standard — Required Data, LTV Validation, Ratio Interpretation | 14 | 2 | 28 |
| Bonus — Optional Data, Output Quality, Decision Rules | 13 | 1 | 13 |
| **TOTAL** | **38** | | **74** |

### Thresholds
- **PASS**: >= 60 points (80%)
- **CONDITIONAL**: >= 45 points (60%)
- **FAIL**: < 45 points

### If FAIL
The churn diagnosis is unreliable. Re-collect baseline data ensuring cohort-only calculations (no new customers in denominator), then recalculate LTV using gross profit and verify the LTV:CAC ratio before making any scaling decisions.



<\!-- Criado com Squad Creator do AIOSPRO por @oalanicolas e @pedrovalerio | 2026-02-10 -->
