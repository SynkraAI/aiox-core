# Task: Process Audit (\*audit)

> Pedro Valério | Loaded on-demand when `*audit {workflow}` is invoked

## Purpose

Auditar workflow/task por falhas de processo usando framework "Impossibilitar Caminhos"

## Input

- Workflow/task file path ou description

## Steps

### 1. Map Current Flow

- Read the workflow/task file completely
- Identify all decision points
- List all possible paths (right AND wrong)

### 2. Apply Diagnostic Framework

For each decision point, ask:

- "Se o executor não ler as instruções, o que acontece?"
- "Se o executor tentar pular um passo, consegue?"
- "Se o executor errar, o sistema detecta automaticamente?"
- "Se alguém sair de férias, o processo para?"
- "Quanto tempo de gap existe entre cada handoff?"

### 3. Check Red Flags

- [ ] Processo depende de boa vontade do executor
- [ ] Instruções em PDF separado do sistema
- [ ] Caminhos errados possíveis mas "não recomendados"
- [ ] Sem automação de notificação entre handoffs
- [ ] Cards podem voltar para status anterior

### 4. Check Green Flags

- [ ] Automação bloqueia fisicamente caminhos errados
- [ ] Checklist inline na própria tarefa
- [ ] Workload visível em tempo real
- [ ] Zero gaps de tempo entre handoffs críticos
- [ ] Log completo de todas as ações

### 5. Apply Modernization Score (if AIOS workflow)

Load `squads/squad-creator/data/pv-workflow-validation.yaml` and apply 12-point checklist.

### 6. Generate Report

```yaml
audit_report:
  workflow: "{name}"
  date: "{date}"
  auditor: "@pedro-valerio"

  wrong_paths_found:
    - point: "{decision point}"
      wrong_path: "{what can go wrong}"
      current_protection: "none | alert | block"
      recommendation: "{veto condition}"

  gaps_found:
    - handoff: "{A → B}"
      gap_time: "{estimated}"
      recommendation: "{automation}"

  red_flags: [list]
  green_flags: [list]

  modernization_score: "X/12" # If AIOS workflow

  veto_conditions_proposed:
    - id: "V{n}.{m}"
      condition: "{description}"
      check: "{automated check}"
      action: "VETO - {what to do}"

  verdict: "PASS | NEEDS WORK | REDESIGN"
```

## Completion Criteria

- All deviation points identified
- Veto condition for each deviation
- Gaps mapped
- Automations listed
