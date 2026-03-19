---
task: performanceDashboard()
responsavel: "PerformanceTracker"
responsavel_type: Agente
atomic_layer: Molecule
Entrada:
  - nome: git_history
    tipo: object
    obrigatorio: true
  - nome: squad_metrics
    tipo: object
    obrigatorio: true
Saida:
  - nome: dashboard_report
    tipo: markdown
    obrigatorio: true
Checklist:
  - Coletar metricas DORA (deployment frequency, lead time, MTTR, change failure rate)
  - Calcular dimensoes BSC (financeiro, cliente, processos, aprendizado)
  - Rastrear progresso OKR por squad
  - Gerar dashboard formatado com template
  - Destacar areas em WARNING ou CRITICAL
---

# Task: Generate Performance Dashboard
# ID: KZ-TP-002
# Executor: performance-tracker
# Trigger: *performance command or weekly cadence

task:
  name: "Performance Dashboard"
  status: ready
  responsible_executor: performance-tracker
  execution_type: agent
  elicit: false

  description: |
    Generate a comprehensive performance dashboard using DORA metrics,
    Balanced Scorecard, and OKR status for all active squads.

  input:
    - "squads/*/config/config.yaml — squad metadata"
    - "git log -- squads/ — activity history"
    - "squads/kaizen/data/reports/ — historical reports"
    - "docs/stories/*.md — story completion status"

  steps:
    - id: "1"
      name: "Collect activity data"
      action: |
        1. For each squad: git log frequency, file changes, commit patterns
        2. Count completed tasks/stories per squad
        3. Measure lead time: story created → story completed
        4. Identify rework: stories with multiple fix commits

    - id: "2"
      name: "Calculate DORA metrics"
      action: |
        Per squad:
        - Task Frequency: commits per week to squad directory
        - Lead Time: avg days from story start to completion
        - MTTR: avg time to fix issues after detection
        - Rework Rate: % of tasks requiring rework commits
        - Classify: Elite / High / Medium / Low

    - id: "3"
      name: "Build Balanced Scorecard"
      action: |
        Per squad, score 1-10:
        - Financial: cost efficiency (estimated token spend vs output)
        - Customer: output quality (completion rate, acceptance criteria met)
        - Internal Process: workflow efficiency (lead time, throughput)
        - Learning & Growth: new capabilities added, patterns refined

    - id: "4"
      name: "Check OKR status"
      action: |
        1. Read current OKRs from stories/PRDs
        2. Calculate progress per key result
        3. Flag stalled OKRs (IN_PT_003)
        4. Summarize overall alignment

    - id: "5"
      name: "Generate alerts"
      action: |
        Apply heuristics IN_PT_001 through IN_PT_005
        Flag any threshold violations
        Prioritize alerts by severity

  output:
    format: "Performance Dashboard"
    template: "templates/performance-dashboard-tmpl.md"

  acceptance_criteria:
    - "DORA metrics calculated for all active squads"
    - "BSC scored for all active squads"
    - "OKR status checked"
    - "All heuristics applied"
    - "Alerts prioritized by severity"

  veto_conditions:
    - "Métricas DORA calculadas sem dados reais de git log → BLOQUEAR (dados fabricados)"
    - "Alerta sem trend de 2+ períodos → REBAIXAR para observação (não é alerta)"
    - "BSC com score sem justificativa por dimensão → REDO step 3"
    - "Dashboard sem dados de TODOS os squads ativos → BLOQUEAR (análise incompleta)"

  action_items:
    - "Run performance-tracker *performance"
    - "Hand off alerts to bottleneck-hunter if constraints detected"
    - "Hand off to kaizen-chief for weekly report"
