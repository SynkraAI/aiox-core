# NF_DM_001 — DORA Classification

**Type:** Decision Heuristic
**Phase:** 1 (Performance Assessment)
**Agent:** @kaizen:nicole-forsgren
**Pattern:** NF-CORE-001 (DORA Metrics Classification)

## Purpose

Heurístico para classificar qualquer time/organização nas 4 bandas de performance DORA (Elite, High, Medium, Low). A classificação correta é a base para identificar gaps, priorizar capabilities e medir progresso. Sem classificação precisa, qualquer esforço de melhoria é cego.

## Configuration

```yaml
NF_DM_001:
  name: "DORA Classification"
  phase: 1
  pattern_reference: "NF-CORE-001"

  weights:
    deployment_frequency: 0.85       # cadência de entrega
    lead_time_for_changes: 0.9       # velocidade do pipeline
    mean_time_to_restore: 0.85       # resiliência a falhas
    change_failure_rate: 0.8         # qualidade do processo

  thresholds:
    elite:
      deployment_frequency: "on-demand (multiple per day)"
      lead_time: "< 1 hour"
      mttr: "< 1 hour"
      cfr: "0-15%"
    high:
      deployment_frequency: "daily to weekly"
      lead_time: "1 day to 1 week"
      mttr: "< 1 day"
      cfr: "16-30%"
    medium:
      deployment_frequency: "weekly to monthly"
      lead_time: "1 week to 1 month"
      mttr: "1 day to 1 week"
      cfr: "16-30%"
    low:
      deployment_frequency: "monthly to semi-annually"
      lead_time: "1 month to 6 months"
      mttr: "> 6 months"
      cfr: "16-30%"

  veto_conditions:
    - condition: "measuring_lines_of_code"
      action: "VETO — Lines of code não mede nada útil. Use as 4 métricas DORA."
    - condition: "measuring_velocity_points"
      action: "VETO — Story points medem estimativa, não performance real. Meça deployment frequency."
    - condition: "optimizing_single_metric"
      action: "VETO — As 4 métricas devem melhorar juntas. Otimizar uma às custas de outra é anti-pattern."
    - condition: "comparing_teams_on_metrics"
      action: "VETO — DORA é para medir progresso do TIME vs. si mesmo, não para ranking entre times."
    - condition: "using_metrics_as_targets"
      action: "ALERTA — Goodhart's Law: quando uma métrica vira meta, deixa de ser boa métrica."

  decision_tree:
    - IF all_4_metrics_elite THEN elite_performer
    - IF 3_metrics_elite_1_high THEN near_elite_focus_on_gap
    - IF majority_high THEN high_performer_identify_bottleneck
    - IF mixed_medium_and_high THEN medium_performer_prioritize_worst_metric
    - IF any_metric_low THEN low_in_that_dimension_fix_first
    - IF all_low THEN start_with_deployment_frequency_and_lead_time
    - TERMINATION: classification_assigned_with_improvement_roadmap

  output:
    type: "classification + gap analysis"
    values: ["ELITE", "HIGH", "MEDIUM", "LOW", "MIXED — ADDRESS WEAKEST"]
```

## Classification Bands

```text
ELITE PERFORMERS:
  Deployment Frequency: On-demand (múltiplos por dia)
  Lead Time for Changes: < 1 hora
  Mean Time to Restore: < 1 hora
  Change Failure Rate: 0-15%

  Características:
    - Deploy é evento rotineiro, não cerimônia
    - Pipeline completamente automatizado
    - Observabilidade excelente — detectam e restauram rápido
    - Feature flags, canary releases, progressive delivery
    - Cultura generativa (Westrum) — falhas geram aprendizado

HIGH PERFORMERS:
  Deployment Frequency: Diário a semanal
  Lead Time for Changes: 1 dia a 1 semana
  Mean Time to Restore: < 1 dia
  Change Failure Rate: 16-30%

  Características:
    - CI/CD funcional mas com alguns gates manuais
    - Boa automação de testes
    - Monitoramento presente mas não completo
    - Times com autonomia razoável

MEDIUM PERFORMERS:
  Deployment Frequency: Semanal a mensal
  Lead Time for Changes: 1 semana a 1 mês
  Mean Time to Restore: 1 dia a 1 semana
  Change Failure Rate: 16-30%

  Características:
    - Processos manuais significativos
    - Testes parcialmente automatizados
    - Deploys são eventos "importantes"
    - Dependências entre times geram espera

LOW PERFORMERS:
  Deployment Frequency: Mensal a semestral
  Lead Time for Changes: 1 mês a 6 meses
  Mean Time to Restore: > 6 meses
  Change Failure Rate: 16-30%

  Características:
    - Deploy é evento traumático e arriscado
    - Pouca ou nenhuma automação
    - "Release trains" ou deploys agendados
    - Testes predominantemente manuais
    - Cultura de medo de mudança
```

## Key Insight: Throughput e Stability NÃO São Trade-offs

```text
A DESCOBERTA MAIS IMPORTANTE:

  Mito: "Se aumentarmos a velocidade, a qualidade cai."
  Realidade: Elite performers são MELHORES em AMBOS.

  Por quê? Porque as mesmas capabilities (CI/CD, automação,
  small batches, observabilidade) melhoram velocidade E estabilidade
  simultaneamente.

  Deploys pequenos e frequentes = menos risco por deploy
  Menos risco = menos falhas
  Menos falhas + boa observabilidade = MTTR baixo

  É um ciclo virtuoso, não um trade-off.
```

## Application

**Input:** Dados atuais de delivery do time (frequência de deploy, lead time, MTTR, CFR).

**Process:**
1. Colete as 4 métricas atuais do time
2. Classifique cada métrica na banda correspondente
3. Identifique a banda geral (determinada pela métrica mais fraca)
4. Identifique gaps entre métricas (uma métrica forte, outra fraca)
5. Priorize melhoria da métrica mais fraca

## Examples

### Classification: Startup com CD

- **DF:** Múltiplos por dia (ELITE)
- **LT:** < 1 hora (ELITE)
- **MTTR:** ~4 horas (HIGH)
- **CFR:** ~20% (HIGH)
- **Classificação:** HIGH (puxada por MTTR e CFR)
- **Ação:** Melhorar observabilidade (MTTR) e cobertura de testes (CFR)

### Classification: Enterprise Tradicional

- **DF:** Mensal (LOW)
- **LT:** 2 meses (LOW)
- **MTTR:** 1 semana (MEDIUM)
- **CFR:** ~25% (HIGH)
- **Classificação:** LOW (DF e LT são o gargalo)
- **Ação:** Comece por deployment frequency. Automatize pipeline. Reduza batch size.

### Classification: Time com Métricas Mistas

- **DF:** Diário (HIGH)
- **LT:** 3 dias (HIGH)
- **MTTR:** 2 semanas (LOW)
- **CFR:** ~10% (ELITE)
- **Classificação:** MIXED — MTTR é o ponto cego
- **Ação:** Investir em observabilidade, alertas e runbooks de recovery.

## Diagnostic Questions

1. "Com que frequência vocês fazem deploy para produção?"
2. "Quanto tempo do commit até produção?"
3. "Quando algo quebra, quanto tempo para restaurar?"
4. "Qual percentual de deploys causa incidente?"
5. "Vocês tratam velocidade e qualidade como trade-off? (Spoiler: não deveria ser.)"

---

**Pattern Compliance:** NF-CORE-001 (DORA Metrics Classification) ✓
**Source:** NF Mind DNA - DORA Metrics Framework
