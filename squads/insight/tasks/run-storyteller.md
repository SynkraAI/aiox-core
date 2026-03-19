# Task: Run Data Storyteller

**Task ID:** run-storyteller
**Version:** 1.0
**Execution Type:** Agent
**Purpose:** Transform data into narrative reports (pre-sales, weekly, monthly, quarterly)
**Executor:** @data-storyteller
**Orchestrator:** @insight-chief
**Estimated Time:** 15-30 min

---

## Inputs

| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `report_type` | enum | Yes | `"impact"`, `"weekly"`, `"monthly"`, `"quarterly"` | `"impact"` |
| `business_name` | string | Yes | Business/client name | "Clínica Sorrir" |
| `dossier` | object | Conditional | Output from digital-profiler | Required for impact |
| `opportunity_map` | object | Conditional | Output from market-scout | Required for impact |
| `metrics_data` | object | Conditional | Ads/Analytics/CRM data | Required for monthly/quarterly |
| `previous_report` | object | No | Previous period report for comparison | For monthly/quarterly |

---

## Preconditions

- [ ] Report type specified
- [ ] Required input data available (depends on type)
- [ ] For impact: profiler + scout outputs ready
- [ ] For monthly: at least 1 month of data

---

## Steps

### Step 1: Understand Context (Knaflic Step 1)
```yaml
action: define_context
questions:
  impact:
    audience: "Operador (para apresentar ao lead)"
    goal: "Convencer lead a contratar"
    expected_action: "Lead aceita proposta"
  weekly:
    audience: "Operador (interno)"
    goal: "Acompanhar evolução"
    expected_action: "Ajustar prioridades"
  monthly:
    audience: "Cliente (empresário não-técnico)"
    goal: "Mostrar valor entregue"
    expected_action: "Renovar contrato"
  quarterly:
    audience: "Cliente + Operador"
    goal: "Visão estratégica"
    expected_action: "Aprovar plano próximo trimestre"
output: "Context definition guides entire report"
```

### Step 2: Structure Narrative (ABT — Olson)
```yaml
action: create_abt_structure
framework: "olson_abt"
process:
  - "For each key finding, structure as:"
  - "AND: Establish agreement/context"
  - "BUT: Introduce tension/gap"
  - "THEREFORE: Resolve with action"
rule: "NEVER end on BUT — always have THEREFORE"
output: "ABT-structured insights"
```

### Step 3: Choose Visuals (Knaflic Step 2)
```yaml
action: select_visuals
rules:
  comparison: "Horizontal bar chart"
  trend: "Line chart"
  proportion: "Pie (max 5 slices) or stacked bar"
  score: "Gauge or progress bar"
  distribution: "Histogram"
  before_after: "Side-by-side"
output: "Visual type selected for each data point"
```

### Step 4: Eliminate Clutter (Knaflic Step 3 + Tufte)
```yaml
action: apply_tufte
gate: "data_ink_ratio"
remove:
  - "Unnecessary gridlines"
  - "Decorative borders"
  - "3D effects"
  - "Redundant legends"
  - "Background textures"
rule: "If removing element doesn't change message → REMOVE"
```

### Step 5: Focus Attention (Knaflic Step 4)
```yaml
action: focus_attention
techniques:
  - "Color for main insight, gray for context"
  - "Bold/size for hierarchy"
  - "Whitespace to separate sections"
  - "One key number per section (hero metric)"
gate: "Does the eye go straight to the insight?"
```

### Step 6: Design & Assemble (Knaflic Step 5)
```yaml
action: assemble_report
structure:
  impact:
    - "Headline (1 ABT sentence)"
    - "Score gauge (0-100)"
    - "Top 3 gaps (with competitor comparison)"
    - "Top 3 quick wins (cost + time + impact)"
    - "Projection (before vs after)"
    - "CTA: propose complete diagnosis"
  weekly:
    - "Executive summary (3 lines)"
    - "KPIs per client (table)"
    - "Alerts (drops, anomalies)"
    - "Recommended actions"
  monthly:
    - "Headline (ABT)"
    - "What we did (actions)"
    - "Results with context (not just numbers)"
    - "Previous month comparison"
    - "Next steps"
    - "Highlight of the month"
  quarterly:
    - "Score evolution (3-month chart)"
    - "Competitor comparison evolution"
    - "ROI of actions taken"
    - "Recommendations for next quarter"
```

### Step 7: Translate Technical Terms
```yaml
action: translate_jargon
rules:
  - "CTR → de cada 100 que viram, X clicaram"
  - "Bounce Rate → X% saíram sem fazer nada"
  - "CPC → cada clique custou R$ X"
  - "Impressões → X pessoas viram"
  - "Conversão → X fizeram o que queríamos"
  - "ROI → para cada R$ 1 investido, voltaram R$ X"
gate: "Zero technical jargon without explanation"
```

### Step 8: Quality Gates
```yaml
action: run_quality_gates
gates:
  dykes_triad:
    check: "Balance of Data + Narrative + Visuals"
    veto: "Any element missing or dominating"
  heath_success:
    check: "Main insights pass SUCCESs (Simple, Unexpected, Concrete, Credible, Emotional, Story)"
    focus: "Concrete + Emotional most important for business owner"
  cairo_5_qualities:
    check: "Truthful, Functional, Beautiful, Insightful, Enlightening"
    veto: "Data distortion detected (axis manipulation, cherry-picking)"
  tufte_data_ink:
    check: "No chartjunk remaining"
    veto: "Decorative elements that don't inform"
```

---

## Outputs

| Output | Format | Description |
|--------|--------|-------------|
| Report | Markdown | Narrative report (type-specific) |
| Quality score | Checklist | Gates passed/failed |

---

## Veto Conditions

- Numbers listed without narrative → REJECT
- Technical jargon without translation → REJECT
- No CTA at end → REJECT
- Data distortion (Cairo) → REJECT
- Missing ABT structure → REJECT
- Report without headline → REJECT

---

## Acceptance Criteria

- [ ] Headline of impact (1 ABT sentence)
- [ ] Insights structured as ABT
- [ ] Triad balanced (data + narrative + visuals)
- [ ] Data-Ink Ratio applied (zero chartjunk)
- [ ] SUCCESs test on main insights
- [ ] 5 Qualities audit on visuals
- [ ] Business owner language (no jargon)
- [ ] Clear CTA at end
- [ ] Brazilian market context applied

---

## Handoff

→ Return to @insight-chief for QA checkpoint (IN-QA-003)
