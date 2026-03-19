---
id: WF-RM-004
name: Repertoire Validation
version: 1.0.0
description: >
  Valida repertório mapeado contra evidências, detecta gaps entre
  conhecimento declarado e praticado, e identifica oportunidades
  de double-loop learning.
trigger: manual
phases:
  - LOAD_REPERTOIRE
  - GAP_DETECTION
  - INFERENCE_AUDIT
  - REPORT
agents_involved:
  - argyris
  - collins
quality_gates:
  - QG-RV-001: Repertoire Loaded
  - QG-RV-002: Validation Complete
estimated_duration: 20-40 minutes
input: Existing repertoire-manifest.yaml + source evidence
output: gap-analysis.md + validated manifest
---

# Repertoire Validation

## Overview

Workflow de validação que cruza o repertório mapeado com evidências
de prática para detectar gaps, contradições e oportunidades de crescimento.
Essencial para garantir que o mapa reflete a realidade, não apenas
auto-percepção.

## Pipeline

```
REPERTOIRE MANIFEST
    │
    ▼
LOAD & SEGMENT (argyris)
    │ Agrupar por área de domínio
    ▼  gate: QG-RV-001
GAP DETECTION (argyris)
    │ Espoused vs Theory-in-Use
    │ Ladder of Inference audit
    ▼
EXPERTISE REVALIDATION (collins)
    │ Checar níveis de expertise com nova evidência
    ▼  gate: QG-RV-002
REPORT
    │ Gap analysis + recommendations
    ▼
OUTPUT: Validated manifest + gap-analysis.md
```

## Gap Detection Protocol

### 1. Espoused vs Theory-in-Use Comparison

```yaml
for_each_domain_area:
  espoused:
    sources: "Q&A responses, written content, self-descriptions"
    extract: "O que a pessoa DIZ que sabe/faz/acredita"

  theory_in_use:
    sources: "CDM incidents, behavioral evidence, actual outputs"
    extract: "O que a PRÁTICA revela"

  gap_types:
    - contradiction: "Diz X mas faz Y"
      severity: critical
      action: "Apresentar evidência, facilitar reconciliação"

    - blind_spot: "Não percebe que faz Z"
      severity: moderate
      action: "Documentar como repertório inconsciente"

    - aspiration: "Quer fazer X mas ainda faz Y"
      severity: minor
      action: "Documentar como growth edge"

    - growth_edge: "Está em transição de Y para X"
      severity: informational
      action: "Documentar como desenvolvimento ativo"
```

### 2. Ladder of Inference Audit

```yaml
for_critical_frameworks:
  trace:
    - level_1_data: "Dados observáveis que a pessoa usou"
    - level_2_selection: "Quais dados selecionou (e quais ignorou)"
    - level_3_meaning: "Significado atribuído"
    - level_4_assumptions: "Premissas subjacentes"
    - level_5_conclusions: "Conclusões tiradas"
    - level_6_beliefs: "Crenças formadas"
    - level_7_actions: "Ações resultantes"

  flag:
    - skipped_levels: "Saltos na cadeia inferencial"
    - ignored_data: "Dados disponíveis mas não considerados"
    - untested_assumptions: "Premissas aceitas sem verificação"
    - reflexive_loops: "Crenças que filtram dados futuros"
```

### 3. Double-Loop Opportunities

```yaml
identify:
  single_loop: "Áreas onde a pessoa ajusta ações mas não questiona premissas"
  double_loop: "Oportunidades para questionar premissas fundamentais"
  model_I: "Padrões de raciocínio defensivo"
  model_II: "Oportunidades para transparência e escolha livre"
```

## Output: Gap Analysis Report

```yaml
gap_analysis:
  summary:
    total_areas_validated: N
    gaps_found: N
    critical_gaps: N
    growth_edges: N

  gaps:
    - id: "GAP-001"
      area: "Area name"
      type: "contradiction | blind_spot | aspiration | growth_edge"
      severity: "critical | moderate | minor | informational"
      espoused: "O que diz"
      actual: "O que faz"
      evidence: "Fonte da evidência"
      recommendation: "Ação sugerida"

  double_loop_opportunities:
    - area: "Area name"
      current_assumption: "Premissa atual"
      alternative: "Premissa alternativa a considerar"
      potential_impact: "O que mudaria se questionasse"

  expertise_revalidation:
    upgrades: ["Áreas onde nível subiu"]
    downgrades: ["Áreas onde nível foi corrigido para baixo"]
    confirmed: ["Áreas validadas no nível original"]
```

---

_Workflow Version: 1.0.0_
_Last Updated: 2026-02-18_
