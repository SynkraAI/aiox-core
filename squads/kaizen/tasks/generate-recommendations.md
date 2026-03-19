---
task: generateRecommendations()
responsavel: "KaizenChief"
responsavel_type: Agente
atomic_layer: Organism
Entrada:
  - nome: analysis_reports
    tipo: object
    obrigatorio: true
  - nome: recommendation_history
    tipo: object
    obrigatorio: false
Saida:
  - nome: prioritized_recommendations
    tipo: markdown
    obrigatorio: true
Checklist:
  - Sintetizar findings dos 6 agentes
  - Aplicar RULE-RD-001 (filtrar N<3)
  - Priorizar por impacto e viabilidade
  - Cross-reference com recomendacoes anteriores
  - Gerar lista final com acoes concretas
---

# Task: Generate Prioritized Recommendations
# ID: KZ-TP-005
# Executor: kaizen-chief (synthesis)
# Trigger: Final phase of wf-ecosystem-analysis or *recommend command

task:
  name: "Generate Recommendations"
  status: ready
  responsible_executor: kaizen-chief
  execution_type: hybrid
  elicit: false

  description: |
    Synthesize findings from all 6 agents into a prioritized list of
    actionable recommendations. Each recommendation must have evidence,
    action, cost, and ROI.

  input:
    - "topology_report — from topology-analyst"
    - "performance_report — from performance-tracker"
    - "bottleneck_report — from bottleneck-hunter"
    - "capability_report — from capability-mapper"
    - "radar_report — from tech-radar"
    - "cost_report — from cost-analyst"

  steps:
    - id: "1"
      name: "Collect all findings"
      action: |
        1. Read all 6 agent reports
        2. Extract individual findings/alerts/recommendations
        3. Deduplicate (same issue flagged by multiple agents)

    - id: "2"
      name: "Score each finding"
      action: |
        For each unique finding:
        - Impact (1-10): How much does this affect ecosystem output?
        - Urgency (1-10): How soon must this be addressed?
        - Feasibility (1-10): How easy is this to implement?
        - Composite = Impact x Urgency x Feasibility / 100

    - id: "3"
      name: "Rank and select top 5"
      action: |
        1. Sort by composite score (descending)
        2. Select top 5 recommendations
        3. If >5 recommendations, cut lowest impact (QG-KZ-003 veto)
        4. If any recommendation lacks evidence, remove (QG-KZ-003 veto)

    - id: "4"
      name: "Format each recommendation"
      action: |
        Per recommendation:
        - ACTION: What specifically to do
        - EVIDENCE: Which agent(s) flagged this, with data
        - COST: Estimated effort/tokens/time
        - ROI: From cost-analyst calculation
        - OWNER: Suggested squad or agent to execute

    - id: "5"
      name: "Generate executive summary"
      action: |
        3-sentence summary:
        1. Current ecosystem state (healthy/warning/critical)
        2. Top finding and its impact
        3. Recommended immediate action

  output:
    format: "Prioritized Recommendations"
    max_recommendations: 5
    required_per_recommendation:
      - action
      - evidence
      - cost
      - roi

  acceptance_criteria:
    - "All 6 agent reports consumed"
    - "Findings deduplicated"
    - "Max 5 recommendations"
    - "Each has evidence + action + cost + ROI"
    - "Executive summary generated"
    - "Quality Gate QG-KZ-003 passed"

  action_items:
    - "kaizen-chief synthesizes all reports"
    - "Apply weekly-report-tmpl.md template"
    - "Save to data/reports/week-{N}-{date}.md"
    - "Present to user"
