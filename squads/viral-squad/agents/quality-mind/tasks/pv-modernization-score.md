# Task: Modernization Score (\*modernization-score)

> Pedro Valério | Loaded on-demand when `*modernization-score {workflow}` is invoked

## Purpose

Aplicar 12-point checklist para avaliar se workflow segue padrões modernos AIOS

## Pre-requisite

Load `squads/squad-creator/data/pv-workflow-validation.yaml` for the complete 12-point checklist.

## Input

- Workflow file path (SKILL.md or workflow YAML)

## Steps

### 1. Load Framework

Read `squads/squad-creator/data/pv-workflow-validation.yaml`

### 2. Read Workflow

Read the complete workflow file to be evaluated

### 3. Check Each Pattern

| #   | Pattern              | Check For              | Legacy If          |
| --- | -------------------- | ---------------------- | ------------------ |
| 1   | Teams Architecture   | TeamCreate, TaskCreate | YAML declarativo   |
| 2   | SKILL.md Frontmatter | name: + description:   | Sem frontmatter    |
| 3   | Blocking Execution   | Task sem background    | Sleep loops        |
| 4   | Parallel Execution   | Task COM background    | Sem paralelismo    |
| 5   | Context Preamble     | git status, gotchas    | Sem context        |
| 6   | File-Based Comm      | outputs/{slug}/        | Inline outputs     |
| 7   | Agent File Refs      | Read agent file        | Hardcoded personas |
| 8   | Task Dependencies    | blockedBy              | depends_on         |
| 9   | bypassPermissions    | mode explícito         | Default            |
| 10  | Proper Finalization  | shutdown + TeamDelete  | Sem cleanup        |
| 11  | Anti-Pattern Docs    | NEVER DO THIS          | Sem docs           |
| 12  | Artifact Directory   | outputs/ estruturado   | Arbitrário         |

### 4. Generate Score Report

```yaml
modernization_score:
  workflow: "{name}"
  file: "{path}"
  date: "{date}"
  score: "X/12"
  interpretation: "{from scoring table}"

  patterns:
    - id: 1
      name: "Teams Architecture"
      status: "✅ | ❌"
      evidence: "{where found or missing}"
    # ... repeat for all 12

  recommendations:
    - priority: "high | medium | low"
      pattern: "{missing pattern}"
      action: "{what to implement}"
      effort: "{estimated effort}"
```

### Scoring Interpretation

| Score   | Interpretation          | Action                 |
| ------- | ----------------------- | ---------------------- |
| 12/12   | Totalmente moderno      | Pronto para produção   |
| 9-11/12 | Quase moderno           | Ajustes menores        |
| 5-8/12  | Parcialmente moderno    | Refactor significativo |
| 1-4/12  | Majoritariamente legado | Rewrite necessário     |
| 0/12    | Completamente legado    | Rewrite total          |

## Completion Criteria

- All 12 patterns checked with evidence
- Score calculated with interpretation
- Recommendations prioritized by impact
- Preservation notes (what to keep during refactor)
