# designops-metrics-setup

> Establish DesignOps KPIs and measurement systems using Dave Malouf's three-layer Metrics Stack framework.

## Overview

This task guides the establishment of a comprehensive DesignOps measurement system. Following Malouf's principle: "Measure at all three levels: output, outcome, impact." The goal is to connect design work to business results while avoiding the trap of measuring activity without value.

## Prerequisites

- Basic understanding of current design operations
- Access to existing data sources (project tools, HR systems, etc.)
- Stakeholder alignment on what success looks like
- Tools or willingness to implement tracking

## Malouf Framework Reference

### The Metrics Stack
```
               IMPACT METRICS
              (Business Value)
                    |
             OUTCOME METRICS
           (Quality & Effectiveness)
                    |
              OUTPUT METRICS
           (Activity & Deliverables)
```

### Core Principle
> "You can't improve what you don't measure - but also, not everything needs measuring."

### Metrics by Three Lenses
| Lens | Output Examples | Outcome Examples | Impact Examples |
|------|-----------------|------------------|-----------------|
| How We Work | Throughput, cycle time | Quality, handoff success | Time to market |
| How We Grow | Hiring velocity, training hours | Retention, time to productivity | Talent attraction |
| How We Thrive | Community participation | Satisfaction scores | Design influence |

## Task Steps

### Phase 1: Define What to Measure

```yaml
step: 1
name: "Identify Measurement Goals"
questions:
  business:
    - "What does leadership need to know about design?"
    - "How is design success currently perceived?"
    - "What decisions need data support?"
  operational:
    - "What operational improvements are we targeting?"
    - "Where do we suspect inefficiencies?"
    - "What processes are we trying to optimize?"
  team:
    - "How do we know if the team is healthy?"
    - "What indicators suggest problems?"
    - "How do we track growth and development?"

goal_template: |
  ## MEASUREMENT GOALS

  ### Business Questions We Need to Answer
  1. [Question]: Required data: [data]
  2. [Question]: Required data: [data]

  ### Operational Questions We Need to Answer
  1. [Question]: Required data: [data]
  2. [Question]: Required data: [data]

  ### Team Health Questions We Need to Answer
  1. [Question]: Required data: [data]
  2. [Question]: Required data: [data]
```

### Phase 2: Select Output Metrics

```yaml
step: 2
name: "Define Output Metrics"
description: "What the team produces - activity and deliverables"
cadence: "Weekly or sprint-based"
warning: "Output metrics alone can incentivize wrong behaviors"

recommended_metrics:
  process:
    - name: "Design Throughput"
      definition: "Number of design deliverables completed per sprint"
      target: "Consistent or improving trend"
      collection: "Project management tool"

    - name: "Time to First Design"
      definition: "Days from brief to first design review"
      target: "< 5 days for standard projects"
      collection: "Project timestamps"

    - name: "Design Iteration Cycles"
      definition: "Number of major revisions per project"
      target: "2-3 cycles (not 0, not 10+)"
      collection: "Design tool version history"

    - name: "Handoff Completion Rate"
      definition: "% of handoffs with all required artifacts"
      target: "> 95%"
      collection: "Handoff checklist completion"

  tools:
    - name: "Tool Adoption Rate"
      definition: "% of team using standard tools"
      target: "> 95%"
      collection: "License/login data"

    - name: "Component Usage Rate"
      definition: "% of designs using design system components"
      target: "> 80%"
      collection: "Design system analytics"

    - name: "Asset Reuse Rate"
      definition: "% of new designs reusing existing assets"
      target: "> 60%"
      collection: "Design system analytics"

  growth:
    - name: "Hiring Velocity"
      definition: "Days from req open to offer accepted"
      target: "< 45 days"
      collection: "ATS data"

    - name: "Training Hours"
      definition: "Hours of training per designer per quarter"
      target: "> 20 hours"
      collection: "Learning system data"

selection_template: |
  ## SELECTED OUTPUT METRICS

  | Metric | Definition | Target | Source | Owner |
  |--------|------------|--------|--------|-------|
  | [metric] | [definition] | [target] | [source] | [owner] |
```

### Phase 3: Select Outcome Metrics

```yaml
step: 3
name: "Define Outcome Metrics"
description: "What the team achieves - quality and effectiveness"
cadence: "Monthly or quarterly"
warning: "Outcome metrics need context"

recommended_metrics:
  design_quality:
    - name: "Usability Test Success Rate"
      definition: "% of designs passing usability testing"
      target: "> 80%"
      collection: "Research results"

    - name: "Accessibility Compliance"
      definition: "% of designs meeting WCAG AA"
      target: "100%"
      collection: "A11y audit results"

    - name: "Handoff Acceptance Rate"
      definition: "% of handoffs accepted without major rework"
      target: "> 90%"
      collection: "Dev feedback tracking"

    - name: "Design Debt Ratio"
      definition: "% of backlog that is design debt"
      target: "< 20%"
      collection: "Backlog analysis"

  team_health:
    - name: "Designer Satisfaction"
      definition: "Satisfaction score from team survey"
      target: "> 4/5 or > 40 NPS"
      collection: "Quarterly survey"

    - name: "Retention Rate"
      definition: "% of designers staying > 2 years"
      target: "> 80%"
      collection: "HR data"

    - name: "Time to Productivity"
      definition: "Days for new hire to contribute independently"
      target: "< 90 days"
      collection: "Manager assessment"

    - name: "Internal Promotion Rate"
      definition: "% of senior roles filled internally"
      target: "> 50%"
      collection: "HR data"

  collaboration:
    - name: "Stakeholder Satisfaction"
      definition: "PM/Eng satisfaction with design collaboration"
      target: "> 4/5"
      collection: "Quarterly survey"

    - name: "Implementation Fidelity"
      definition: "% of specs implemented as designed"
      target: "> 85%"
      collection: "QA assessment"

selection_template: |
  ## SELECTED OUTCOME METRICS

  | Metric | Definition | Target | Source | Owner |
  |--------|------------|--------|--------|-------|
  | [metric] | [definition] | [target] | [source] | [owner] |
```

### Phase 4: Select Impact Metrics

```yaml
step: 4
name: "Define Impact Metrics"
description: "Business value created - strategic contribution"
cadence: "Quarterly or annually"
warning: "Impact metrics require cross-functional data and attribution"

recommended_metrics:
  business_value:
    - name: "Design-Attributed Conversion"
      definition: "Conversion improvement from design changes"
      target: "Increasing trend"
      collection: "A/B test results"

    - name: "Development Cost Savings"
      definition: "Dev cost avoided through design system reuse"
      target: "Quantifiable savings"
      collection: "Component usage x dev cost"

    - name: "Time to Market Improvement"
      definition: "Reduction in delivery time due to design efficiency"
      target: "20-30% improvement"
      collection: "Project timeline analysis"

  customer_impact:
    - name: "Customer Satisfaction (Design-related)"
      definition: "NPS/CSAT changes tied to design updates"
      target: "Positive contribution"
      collection: "Customer feedback + release correlation"

    - name: "Task Success Rate"
      definition: "% of users completing key tasks"
      target: "> 90%"
      collection: "Analytics"

    - name: "Support Ticket Reduction"
      definition: "Reduction in UX-related support issues"
      target: "Decreasing trend"
      collection: "Support ticket analysis"

  organizational:
    - name: "Design Influence Score"
      definition: "% of strategic decisions influenced by design"
      target: "Increasing presence"
      collection: "Leadership assessment"

    - name: "Talent Attraction"
      definition: "Quality and quantity of design applicants"
      target: "> 50 qualified per role"
      collection: "Recruiting metrics"

selection_template: |
  ## SELECTED IMPACT METRICS

  | Metric | Definition | Target | Source | Owner |
  |--------|------------|--------|--------|-------|
  | [metric] | [definition] | [target] | [source] | [owner] |
```

### Phase 5: Build Data Collection

```yaml
step: 5
name: "Establish Data Collection"
approach: |
  Start simple. Don't try to automate everything at once.
  Manual collection is fine initially.

data_sources:
  - source: "Project Management Tool"
    metrics: ["Throughput", "Cycle time", "Handoff tracking"]
    integration: "[Jira/Asana/etc]"

  - source: "Design Tool Analytics"
    metrics: ["Component usage", "Asset reuse", "Version history"]
    integration: "[Figma Analytics/etc]"

  - source: "Surveys"
    metrics: ["Satisfaction", "Stakeholder feedback", "Team health"]
    integration: "[Survey tool]"
    cadence: "Quarterly"

  - source: "HR Systems"
    metrics: ["Retention", "Hiring velocity", "Promotions"]
    integration: "[HRIS]"

  - source: "Product Analytics"
    metrics: ["Task success", "Conversions", "Usage"]
    integration: "[Analytics platform]"

collection_plan_template: |
  ## DATA COLLECTION PLAN

  ### Automated Collection
  | Metric | Source | Integration | Frequency |
  |--------|--------|-------------|-----------|
  | [metric] | [source] | [how] | [when] |

  ### Manual Collection
  | Metric | Source | Owner | Frequency |
  |--------|--------|-------|-----------|
  | [metric] | [source] | [who] | [when] |

  ### Survey Collection
  | Survey | Audience | Frequency | Metrics Collected |
  |--------|----------|-----------|-------------------|
  | [survey] | [who] | [when] | [list] |
```

### Phase 6: Create Reporting

```yaml
step: 6
name: "Establish Reporting Cadence"
cadences:
  weekly:
    audience: "Design team"
    focus: "Output metrics"
    format: "Dashboard or standup"
  monthly:
    audience: "Design leadership"
    focus: "Output + Outcome metrics"
    format: "Report or meeting"
  quarterly:
    audience: "Executive stakeholders"
    focus: "Outcome + Impact metrics"
    format: "Business review presentation"

dashboard_template: |
  ## DESIGNOPS METRICS DASHBOARD

  ### Executive Summary (Monthly)

  | Metric | This Period | Last Period | Trend | Target | Status |
  |--------|-------------|-------------|-------|--------|--------|
  | [metric] | [value] | [value] | [+/-X%] | [target] | [emoji] |

  ### How We Work

  | Output Metrics | Value | Target | Status |
  |----------------|-------|--------|--------|
  | Design throughput | [X] | [Y] | [status] |
  | Cycle time | [X] days | [Y] days | [status] |

  | Outcome Metrics | Value | Target | Status |
  |-----------------|-------|--------|--------|
  | Handoff acceptance | [X]% | [Y]% | [status] |
  | Implementation fidelity | [X]% | [Y]% | [status] |

  ### How We Grow

  | Output Metrics | Value | Target | Status |
  |----------------|-------|--------|--------|
  | Time to hire | [X] days | [Y] days | [status] |
  | Training hours | [X] hrs | [Y] hrs | [status] |

  | Outcome Metrics | Value | Target | Status |
  |-----------------|-------|--------|--------|
  | Time to productivity | [X] days | [Y] days | [status] |
  | Retention rate | [X]% | [Y]% | [status] |

  ### How We Thrive

  | Output Metrics | Value | Target | Status |
  |----------------|-------|--------|--------|
  | Community events | [X] | [Y] | [status] |
  | Recognition given | [X] | [Y] | [status] |

  | Outcome Metrics | Value | Target | Status |
  |-----------------|-------|--------|--------|
  | Designer satisfaction | [X]/5 | [Y]/5 | [status] |
  | Engagement score | [X]% | [Y]% | [status] |

  ### Impact Metrics (Quarterly)

  | Metric | This Quarter | Last Quarter | YoY Change |
  |--------|--------------|--------------|------------|
  | [metric] | [value] | [value] | [+/-X%] |

  ---

  ### Narrative
  [What the numbers mean - story behind the data]

  ### Actions
  [What we're doing based on this data]
```

## Malouf Principles Applied

- **"Measure at all three levels"** - Output, Outcome, Impact stack
- **"Activity is not value"** - Don't stop at output metrics
- **"Connect design work to business results"** - Impact metrics essential
- **"What story do your numbers tell?"** - Data needs narrative
- **"Not everything needs measuring"** - Focus on what matters

## Output Artifacts

1. **Measurement Goals** - What we need to know and why
2. **Metrics Catalog** - Selected metrics with definitions
3. **Data Collection Plan** - Sources and methods
4. **Dashboard Template** - Reporting format
5. **Reporting Cadence** - Who sees what when

## Common Mistakes to Avoid

| Mistake | Why Bad | Instead |
|---------|---------|---------|
| Only output metrics | Incentivizes activity over value | Add outcome and impact |
| Too many metrics | Analysis paralysis | Start with 5-10 key metrics |
| No baseline | Can't show improvement | Measure before changing |
| Data without story | Numbers don't drive action | Add narrative context |
| Static metrics | Needs evolve | Review quarterly |

## Metrics Maturity Journey

| Level | Characteristics | Focus |
|-------|-----------------|-------|
| 1. Ad Hoc | No formal metrics | Establish any baseline |
| 2. Basic | Output metrics tracked | Add consistency |
| 3. Developing | Output + some outcome | Add outcome metrics |
| 4. Mature | Full stack tracked | Connect to business |
| 5. Optimized | Predictive, automated | Continuous improvement |

## Related Tasks

- `designops-maturity-assessment.md` - Use metrics to track maturity progress
- `design-process-optimization.md` - Measure process improvements
- `design-team-scaling.md` - Track scaling success

## Related Checklists

- `squads/design/checklists/designops-maturity-checklist.md`
- `squads/design/checklists/design-team-health-checklist.md`
- `squads/design/checklists/design-handoff-checklist.md`

## Notes

> "The purpose of metrics is not to have dashboards. The purpose is to make better decisions. If your metrics aren't driving decisions, you're measuring the wrong things."


## Process Guards
- **Execution Type:** `Hybrid`
- **Dependencies:** depends_on: `[]` · enables: `[]` · workflow: `design-system`
- **On Fail:** Stop execution, capture evidence, and return remediation steps before proceeding.

## Success Criteria
- [ ] Output artifact(s) generated and referenced.
- [ ] Validation checks executed with evidence.
- [ ] Next-step dependencies documented.
