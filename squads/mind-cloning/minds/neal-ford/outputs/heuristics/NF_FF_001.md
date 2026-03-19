# NF_FF_001 — Fitness Function Design

**Type:** Decision Heuristic
**Phase:** 1 (Architectural Governance)
**Agent:** @kaizen:neal-ford
**Pattern:** NF-CORE-001 (Fitness Function Design)

## Purpose

Heuristica para projetar fitness functions que protegem caracteristicas arquiteturais criticas. Cada sistema tem qualidades que DEVEM ser preservadas enquanto o sistema evolui — performance, seguranca, escalabilidade, manutenibilidade. Fitness functions transformam essas qualidades de "esperancas" em "garantias automatizadas."

## Configuration

```yaml
NF_FF_001:
  name: "Fitness Function Design"
  phase: 1
  pattern_reference: "NF-CORE-001"

  weights:
    characteristic_criticality: 0.9
    measurability: 0.9
    automation_feasibility: 0.8
    feedback_speed: 0.8
    false_positive_rate: 0.7
    maintenance_cost: 0.6

  thresholds:
    minimum_critical_characteristics: 3    # identifique pelo menos 3 caracteristicas criticas
    automation_required: true               # fitness function manual nao conta
    threshold_must_be_numeric: true         # "rapido" nao serve — "< 200ms p95" serve
    review_cadence_days: 90                 # revisar fitness functions a cada 90 dias

  veto_conditions:
    - condition: "no_measurable_threshold"
      action: "VETO — Fitness function sem threshold numerico e apenas opiniao disfarçada."
    - condition: "manual_verification_only"
      action: "VETO — Se nao e automatizado, nao e fitness function. E checklist."
    - condition: "characteristic_not_prioritized"
      action: "VETO — Nao crie fitness functions para tudo. Priorize as 3-5 mais criticas."
    - condition: "no_baseline_measurement"
      action: "VETO — Sem baseline, nao ha como saber se degradou. Meça primeiro, proteja depois."
    - condition: "blocks_all_deploys"
      action: "VETO — Fitness function que bloqueia TUDO e muito rigida. Calibre thresholds."

  decision_tree:
    - IF need_to_protect_architectural_quality THEN identify_critical_characteristics
    - IF characteristics_identified THEN prioritize_top_3_to_5
    - IF prioritized THEN define_measurable_threshold_for_each
    - IF thresholds_defined THEN choose_fitness_function_type
    - IF type_chosen THEN implement_automated_verification
    - IF implemented THEN integrate_into_ci_cd_pipeline
    - IF integrated THEN establish_baseline_and_monitor_trend
    - TERMINATION: fitness_function_active_and_monitoring

  output:
    type: "fitness function specification"
    values: ["CHARACTERISTIC", "TYPE", "THRESHOLD", "AUTOMATION", "PIPELINE STAGE"]
```

## Application

**Input:** Sistema ou servico que precisa proteger qualidades arquiteturais.

**Process:**

```text
STEP 1: Identifique Caracteristicas Criticas
  - "Quais qualidades esse sistema NAO PODE perder?"
  - Performance, seguranca, escalabilidade, manutenibilidade, custo...
  - IF more than 5 THEN prioritize — fitness functions para TUDO viram ruido

STEP 2: Defina Thresholds Numericos
  - "Qual e o limite aceitavel para cada caracteristica?"
  - Performance: "API response < 200ms p95"
  - Seguranca: "Zero CVEs criticos em dependencias"
  - Acoplamento: "Nenhum import circular entre modulos"
  - IF threshold is subjective ("bom") THEN make it numeric

STEP 3: Meça o Baseline
  - "Qual e o estado atual de cada caracteristica?"
  - IF no baseline THEN measure BEFORE creating fitness function
  - Baseline = ponto de referencia para detectar degradacao

STEP 4: Escolha o Tipo de Fitness Function
  - Atomic: testa UMA caracteristica (latencia, cobertura, tamanho de bundle)
  - Holistic: testa INTERACAO entre caracteristicas (performance + seguranca)
  - Triggered: executa em evento (deploy, PR, merge)
  - Continuous: monitora em tempo real (alertas de producao)

STEP 5: Implemente Automacao
  - "Como verificar isso automaticamente?"
  - CI pipeline: testes de performance, SAST, dependency audit
  - Deploy pipeline: smoke tests, canary metrics
  - Producao: alertas de SLO, anomaly detection
  - MUST be automated — manual review nao e fitness function

STEP 6: Integre no Pipeline
  - "Em que ponto do pipeline essa verificacao acontece?"
  - PR time: lint, type check, unit tests, dependency audit
  - Merge time: integration tests, performance benchmarks
  - Deploy time: smoke tests, canary analysis
  - Runtime: SLO monitoring, alerting

STEP 7: Monitore Tendencias
  - "A caracteristica esta melhorando ou degradando ao longo do tempo?"
  - Threshold catches degradation. Trend shows direction.
  - IF trend is negative THEN investigate BEFORE threshold is crossed
```

## Examples

### Fitness Functions para API REST

| Caracteristica | Tipo | Threshold | Automacao | Pipeline Stage |
|---------------|------|-----------|-----------|----------------|
| Latencia | Atomic/Triggered | < 200ms p95 | k6 load test | Deploy |
| Seguranca deps | Atomic/Triggered | 0 CVEs criticos | npm audit / Snyk | PR |
| Cobertura testes | Atomic/Triggered | >= 70% linhas | Vitest coverage | PR |
| Bundle size | Atomic/Triggered | < 500KB gzipped | size-limit | PR |
| Acoplamento | Holistic/Triggered | 0 circular imports | dependency-cruiser | PR |
| Disponibilidade | Continuous | >= 99.9% uptime | SLO monitor | Runtime |

### Fitness Function para Manutenibilidade

- **Caracteristica:** Manutenibilidade do codigo
- **Tipo:** Atomic/Triggered
- **Threshold:** Nenhum arquivo > 500 LOC, nenhuma funcao > 50 LOC
- **Automacao:** ESLint rules custom (max-lines, max-lines-per-function)
- **Pipeline Stage:** PR time
- **Baseline:** Medido via `cloc` e ESLint report

## Diagnostic Questions

1. "Quais sao as 3-5 qualidades que esse sistema NAO PODE perder?"
2. "Consigo medir cada qualidade com um numero?"
3. "Qual e o baseline atual para cada qualidade?"
4. "Onde no pipeline essa verificacao faz mais sentido?"
5. "Se essa fitness function falhar, o deploy para?"
6. "Estou protegendo o que importa ou criando burocracia?"

---

**Pattern Compliance:** NF-CORE-001 (Fitness Function Design) ok
**Source:** NF Mind DNA - Fitness Functions Framework
