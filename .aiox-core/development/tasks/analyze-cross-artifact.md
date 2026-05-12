# Cross-Artifact Analysis Task

> **Command:** `*analyze`
> **Owner Agent:** @qa (can be invoked by any agent)
> **Mode:** Read-only (no file modifications)

---

## Purpose

Executar análise de consistência cross-artifact para identificar gaps, inconsistências, e ambiguidades entre PRD, Architecture, Stories, e Specs. Produz relatório consolidado com severidades e recomendações.

**Inspirado por:** GitHub Spec-Kit `/speckit.analyze`

---

## autoClaude

```yaml
autoClaude:
  version: '3.0'

  elicit: false
  deterministic: true
  composable: true
  readOnly: true  # CRITICAL: This task NEVER modifies files

  inputs:
    - name: scope
      type: enum
      values: [all, prd, architecture, stories, specs]
      required: false
      default: all
      description: Escopo da análise

    - name: storyId
      type: string
      required: false
      description: Analisar story específica (opcional)

  outputs:
    - name: analysis_report
      type: stdout
      format: markdown
      description: Relatório consolidado (não salva arquivo)

  verification:
    type: manual
    description: Revisão humana do relatório
```

---

## Constitutional Reference

> **Reference:** Constitution Article V - Quality First
> **Purpose:** Garantir qualidade e consistência antes de implementação

---

## Analysis Passes

### Pass 1: Coverage Gaps

```yaml
coverage_analysis:
  description: Identificar requisitos sem implementação e vice-versa

  checks:
    - name: requirements_without_tasks
      description: Requisitos em PRD/spec sem tasks correspondentes
      severity: HIGH

    - name: tasks_without_requirements
      description: Tasks sem requisito rastreável
      severity: MEDIUM

    - name: acceptance_criteria_coverage
      description: Critérios de aceite sem testes
      severity: HIGH

    - name: stories_without_specs
      description: Stories sem especificação formal
      severity: MEDIUM
```

### Pass 2: Consistency Check

```yaml
consistency_analysis:
  description: Detectar inconsistências entre artefatos

  checks:
    - name: prd_vs_architecture
      description: PRD menciona features não cobertas na arquitetura
      severity: HIGH
      sources: [docs/prd.md, docs/prd/, docs/architecture.md, docs/architecture/]

    - name: architecture_vs_stories
      description: Decisões arquiteturais não refletidas em stories
      severity: MEDIUM

    - name: spec_vs_story
      description: Spec diverge dos acceptance criteria da story
      severity: HIGH

    - name: terminology_drift
      description: Mesmo conceito com nomes diferentes
      severity: LOW
```

### Pass 3: Ambiguity Detection

```yaml
ambiguity_analysis:
  description: Identificar áreas sub-especificadas

  checks:
    - name: vague_requirements
      patterns:
        - "should be fast"
        - "user-friendly"
        - "as needed"
        - "etc."
        - "TBD"
        - "TODO"
      severity: MEDIUM

    - name: missing_acceptance_criteria
      description: Stories sem critérios mensuráveis
      severity: HIGH

    - name: unresolved_questions
      description: Open Questions não resolvidas em specs
      severity: MEDIUM

    - name: assumption_not_validated
      description: Assumptions sem validação documentada
      severity: LOW
```

### Pass 4: Constitution Compliance

```yaml
constitution_compliance:
  description: Verificar aderência aos princípios constitucionais

  checks:
    - name: cli_first_violation
      article: I
      description: UI implementada sem CLI correspondente
      severity: CRITICAL

    - name: no_invention_violation
      article: IV
      description: Spec com conteúdo não rastreável
      severity: CRITICAL

    - name: story_driven_violation
      article: III
      description: Código sem story associada
      severity: HIGH
```

---

## Severity Levels

| Severity | Descrição | Ação |
|----------|-----------|------|
| **CRITICAL** | Viola Constitution, bloqueia progresso | MUST fix before continue |
| **HIGH** | Gap significativo, risco alto | SHOULD fix before implementation |
| **MEDIUM** | Inconsistência moderada | Consider fixing |
| **LOW** | Melhoria de qualidade | Nice to have |

---

## Execution Flow

```yaml
execution:
  steps:
    - id: 1-gather
      action: Coletar todos os artefatos no escopo
      files:
        - docs/prd.md OR docs/prd/**/*.md
        - docs/architecture.md OR docs/architecture/**/*.md
        - docs/stories/**/story.yaml
        - docs/stories/**/spec/*.md
        - docs/stories/**/spec/*.json

    - id: 2-parse
      action: Extrair estrutura de cada artefato
      extract:
        - requirements (FR-*, NFR-*, CON-*)
        - acceptance_criteria
        - tasks
        - decisions
        - open_questions
        - assumptions

    - id: 3-analyze
      action: Executar 4 passes de análise
      passes: [coverage, consistency, ambiguity, constitution]

    - id: 4-aggregate
      action: Consolidar findings por severidade

    - id: 5-report
      action: Gerar relatório markdown
```

---

## Report Format

````markdown
# Cross-Artifact Analysis Report

> **Generated:** {timestamp}
> **Scope:** {scope}
> **Analyzed:** {file_count} files

---

## Executive Summary

| Severity | Count |
|----------|-------|
| CRITICAL | {n} |
| HIGH | {n} |
| MEDIUM | {n} |
| LOW | {n} |

**Overall Health:** {HEALTHY | CONCERNS | AT_RISK | BLOCKED}

---

## Critical Findings (MUST FIX)

### Finding C1: {title}
- **Category:** {constitution_violation | coverage_gap | inconsistency}
- **Location:** {file:line or artifact reference}
- **Description:** {details}
- **Resolution:** {recommended action}

---

## High Priority Findings

### Finding H1: {title}
...

---

## Coverage Metrics

| Metric | Value | Target |
|--------|-------|--------|
| Requirements with tasks | {n}% | 100% |
| Tasks with requirements | {n}% | 100% |
| Acceptance criteria with tests | {n}% | 80% |
| Stories with specs | {n}% | 100% |

---

## Recommendations

1. **Immediate:** {critical fixes}
2. **Before Implementation:** {high priority fixes}
3. **Improvement:** {medium/low fixes}

---

## Files Analyzed

- {file1}
- {file2}
- ...

---

*Report generated by AIOX Cross-Artifact Analysis*
*Reference: Constitution Article V - Quality First*
````

---

## Usage Examples

```bash
# Análise completa do projeto
*analyze

# Análise apenas de stories
*analyze --scope stories

# Análise de story específica
*analyze --story 2.1

# Análise com foco em PRD vs Architecture
*analyze --scope prd,architecture
```

---

## Integration with Existing Checklists

Esta task agrega e referencia os seguintes checklists existentes:

| Checklist | Uso na Análise |
|-----------|----------------|
| `architect-checklist.md` | Pass 2: PRD vs Architecture |
| `story-draft-checklist.md` | Pass 3: Ambiguity in stories |
| `story-dod-checklist.md` | Pass 1: Coverage gaps |
| `pm-checklist.md` | Pass 2: PRD consistency |
| `po-master-checklist.md` | Pass 1: Story coverage |

---

## Error Handling

```yaml
errors:
  - condition: No PRD found
    action: WARN and continue with available artifacts

  - condition: No stories found
    action: WARN and limit analysis to PRD/Architecture

  - condition: Parse error in artifact
    action: Report error, skip file, continue analysis

  - condition: Empty analysis (no findings)
    action: Report "HEALTHY" status
```

---

## Metadata

```yaml
metadata:
  version: 1.0.0
  created: 2025-01-30
  inspired_by: GitHub Spec-Kit /speckit.analyze
  tags:
    - quality
    - analysis
    - cross-artifact
    - read-only
```

---

*Cross-Artifact Analysis Task v1.0.0*
*CLI First | Quality First | Read-Only*
