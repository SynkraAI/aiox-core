---
task: costAnalysis()
responsavel: "CostAnalyst"
responsavel_type: Agente
atomic_layer: Molecule
Entrada:
  - nome: tool_inventory
    tipo: object
    obrigatorio: true
  - nome: usage_metrics
    tipo: object
    obrigatorio: true
Saida:
  - nome: cost_report
    tipo: markdown
    obrigatorio: true
Checklist:
  - Catalogar custos por ferramenta/servico
  - Aplicar Activity-Based Costing (Kaplan)
  - Calcular ROI por ferramenta
  - Identificar desperdicio e oportunidades de consolidacao
  - Gerar recomendacoes de otimizacao priorizadas por impacto
---

# Task: Cost Analysis
# ID: KZ-TP-004
# Executor: cost-analyst
# Trigger: *cost command or weekly cadence

task:
  name: "Cost Analysis"
  status: ready
  responsible_executor: cost-analyst
  execution_type: agent
  elicit: false

  description: |
    Analyze costs across the ecosystem using FinOps principles.
    Identify waste, calculate ROI per squad, and forecast budget.

  input:
    - "All previous agent reports (topology, performance, bottleneck, capability, radar)"
    - "squads/*/config/config.yaml — squad metadata"
    - "API usage logs (if available)"
    - "Model pricing data"

  steps:
    - id: "1"
      name: "INFORM phase (visibility)"
      action: |
        1. Estimate cost per squad based on:
           - Agent count x estimated tokens per activation
           - Tool/API costs referenced in configs
           - Model costs (by model type used)
        2. Calculate cost per task (total spend / completed tasks)
        3. Build cost allocation table

    - id: "2"
      name: "OPTIMIZE phase (reduce waste)"
      action: |
        1. Apply IN_CA_001 (cost spike detection)
        2. Apply IN_CA_003 (idle cost)
        3. Apply IN_CA_004 (model downgrade opportunity)
        4. Identify unused tools still in configs
        5. Calculate potential savings per optimization

    - id: "3"
      name: "OPERATE phase (governance)"
      action: |
        1. Set cost thresholds per squad based on output value
        2. Apply IN_CA_002 (negative ROI check)
        3. Apply IN_CA_005 (scale threshold)
        4. Forecast next week budget based on trends

    - id: "4"
      name: "Calculate ROI per recommendation"
      action: |
        For each recommendation from other agents:
        1. Estimate implementation cost (tokens, time, tools)
        2. Estimate expected value (output improvement, waste reduction)
        3. Calculate ROI = (value - cost) / cost
        4. Rank recommendations by ROI

  output:
    format: "Cost Analysis Report"
    sections:
      - spend_summary (per squad)
      - waste_identification
      - roi_per_recommendation
      - budget_forecast
      - unit_economics

  acceptance_criteria:
    - "Cost estimated for all active squads"
    - "Waste identified with savings potential"
    - "ROI calculated for each recommendation"
    - "Budget forecast for next period"
    - "All cost heuristics applied"

  veto_conditions:
    - "ROI calculado sem métricas reais (estimativa pura) → MARCAR margem de erro obrigatória"
    - "Custo por squad sem breakdown detalhado (agentes, tokens, APIs) → REDO step 1"
    - "Recomendação de corte sem verificação de impacto no throughput → BLOQUEAR"
    - "Forecast sem trend de 2+ períodos → CLASSIFICAR como projeção especulativa"

  action_items:
    - "Run cost-analyst *cost"
    - "Attach ROI to all recommendations from other agents"
    - "Hand off to kaizen-chief for final report"
