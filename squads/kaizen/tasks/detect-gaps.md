---
task: detectGaps()
responsavel: "CapabilityMapper"
responsavel_type: Agente
atomic_layer: Molecule
Entrada:
  - nome: ecosystem_baseline
    tipo: object
    obrigatorio: true
  - nome: epic_context
    tipo: object
    obrigatorio: false
Saida:
  - nome: gap_report
    tipo: markdown
    obrigatorio: true
Checklist:
  - Carregar ecosystem-baseline.yaml
  - Mapear competencias existentes via Wardley Maps
  - Identificar gaps de cobertura (4R framework)
  - Classificar gaps por severidade e impacto
  - Aplicar RULE-RD-001 (N>=3 evidencias)
  - Gerar relatorio com recomendacoes priorizadas
---

# Task: Detect Competency & Tool Gaps
# ID: KZ-TP-001
# Executor: capability-mapper (primary) + tech-radar (tool gaps)
# Trigger: *gaps command or proactive on epic/story update

task:
  name: "Detect Gaps"
  status: ready
  responsible_executor: capability-mapper
  execution_type: agent
  elicit: false

  description: |
    Scan the ecosystem for competency gaps (missing mind clones) and
    tool gaps (missing APIs, MCPs, libraries). Cross-reference current
    capabilities against active epics, stories, and planned work.

  input:
    - "squads/*/agents/*.md — current agent inventory"
    - "squads/*/config/config.yaml — squad capabilities"
    - "docs/stories/*.md — active stories"
    - "docs/prd/*.md — product requirements"
    - "git log -20 — recent activity context"

  steps:
    - id: "1"
      name: "Inventory current capabilities"
      action: |
        1. Glob squads/*/agents/*.md to list all agents
        2. Extract domain/expertise from each agent's persona section
        3. Build capability matrix: domain → agent → squad

    - id: "2"
      name: "Inventory required capabilities"
      action: |
        1. Read active stories from docs/stories/
        2. Read PRDs from docs/prd/
        3. Extract referenced domains, tools, platforms
        4. Build requirement matrix: domain → story/epic → status

    - id: "3"
      name: "Cross-reference and detect gaps"
      action: |
        1. Compare capability matrix vs requirement matrix
        2. Mark gaps: required domain with no matching agent
        3. Mark tool gaps: required tool/API with no integration
        4. Score each gap: impact (1-10) x urgency (1-10)

    - id: "4"
      name: "Generate recommendations"
      action: |
        For each gap:
        1. COMPETENCY GAP → Recommend mind clone (who to clone, why)
        2. TOOL GAP → Recommend tool (what tool, quadrant placement)
        3. Calculate ROI: estimated value vs effort to fill gap

  output:
    format: "Gap Analysis Report"
    template: "templates/capability-map-tmpl.md"
    sections:
      - competency_gaps (with recommended minds)
      - tool_gaps (with recommended tools)
      - 4r_analysis (recruit, retain, reskill, redesign)
      - prioritized_actions

  acceptance_criteria:
    - "All squads scanned for current capabilities"
    - "All active stories/PRDs scanned for requirements"
    - "Each gap has impact + urgency score"
    - "Each recommendation has specific action + ROI estimate"
    - "Gaps sorted by composite score (impact x urgency)"

  veto_conditions:
    - "Gap classificado como CRÍTICO sem N>=3 ocorrências → BLOQUEAR (RULE-RD-001)"
    - "Recomendação de novo agente sem evidência de demanda em stories/epics → REMOVER"
    - "Tool gap sem verificação de alternativas existentes no radar → REDO step 3"
    - "Output sem scores de impacto x urgência para cada gap → BLOQUEAR publicação"

  action_items:
    - "Run capability-mapper *gaps"
    - "Run tech-radar *recommend-tools"
    - "Merge results into unified gap report"
    - "Hand off to kaizen-chief for synthesis"
