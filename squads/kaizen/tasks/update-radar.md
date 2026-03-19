---
task: updateRadar()
responsavel: "TechRadar"
responsavel_type: Agente
atomic_layer: Molecule
Entrada:
  - nome: current_radar
    tipo: yaml
    obrigatorio: true
  - nome: tool_usage_data
    tipo: object
    obrigatorio: true
Saida:
  - nome: updated_radar
    tipo: yaml
    obrigatorio: true
Checklist:
  - Carregar radar atual (initial-radar.yaml)
  - Avaliar ferramentas com Fitness Functions
  - Classificar em rings (Adopt/Trial/Assess/Hold)
  - Identificar ferramentas novas para avaliacao
  - Gerar radar atualizado com justificativas
---

# Task: Update Technology Radar
# ID: KZ-TP-003
# Executor: tech-radar
# Trigger: *radar command or quarterly cadence

task:
  name: "Update Technology Radar"
  status: ready
  responsible_executor: tech-radar
  execution_type: agent
  elicit: false

  description: |
    Update the technology radar with current tool evaluations,
    movements between rings, and fitness function results.

  input:
    - "squads/*/config/config.yaml — tools referenced by squads"
    - "squads/*/agents/*.md — tools/APIs used by agents"
    - "squads/kaizen/data/radar/ — previous radar state"
    - "Capability gaps from capability-mapper"

  steps:
    - id: "1"
      name: "Inventory current tools"
      action: |
        1. Scan all squad configs and agent files for tool references
        2. Categorize into 4 quadrants: APIs, MCPs, Libraries, Models
        3. Count usage frequency per tool

    - id: "2"
      name: "Evaluate ring placement"
      action: |
        Per tool:
        - Adopt: >3 successful uses, proven reliability
        - Trial: 1-3 uses, positive results
        - Assess: 0 uses but addresses known gap
        - Hold: known issues or better alternative exists
        Apply IN_TR_001 (adopt without evidence)
        Apply IN_TR_002 (hold too long)

    - id: "3"
      name: "Detect movements"
      action: |
        Compare current placement vs previous radar
        Document movements with evidence for each change
        Apply IN_TR_005 (new tool opportunity)

    - id: "4"
      name: "Run fitness functions"
      action: |
        Per squad:
        - Latency: avg response time for tasks
        - Token efficiency: output quality per token
        - Accuracy: acceptance criteria pass rate
        - Cost/task: total cost divided by completed tasks
        Apply IN_TR_003 (missing fitness function)

    - id: "5"
      name: "Check for consolidation"
      action: |
        Apply IN_TR_004 (tool sprawl)
        Identify duplicate tools serving same purpose
        Recommend consolidation where applicable

  output:
    format: "Technology Radar"
    template: "templates/tech-radar-tmpl.md"

  acceptance_criteria:
    - "All tools categorized into quadrants"
    - "All tools placed in appropriate ring with evidence"
    - "Movements documented with rationale"
    - "Fitness functions run for all active squads"
    - "Consolidation opportunities identified"

  veto_conditions:
    - "Movimento entre rings sem evidência de fitness function → BLOQUEAR (RULE-RD-001)"
    - "Tool em Adopt sem 3+ usos comprovados → REBAIXAR para Trial"
    - "Nova tool em Assess sem gap correspondente no capability-mapper → REMOVER"
    - "Consolidação recomendada sem grep de referências no codebase → BLOQUEAR (GATE-RD-VERIFY)"

  action_items:
    - "Run tech-radar *radar"
    - "Save updated radar to data/radar/"
    - "Hand off tool gap recommendations to kaizen-chief"
