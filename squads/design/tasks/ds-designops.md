# Setup DesignOps Workflow

> Task ID: brad-ds-designops
> Agent: Brad (Design System Architect)
> Version: 1.0.0
> **Execution Type:** `Hybrid`
> **Human Checkpoint:** Review and approve the operational playbook and metrics dashboard configuration before rollout to the team
> **Dependencies:** depends_on: `[]` · enables: `[]` · workflow: `governance`

## Description

Setup DesignOps workflow for your design system team. Maps current operations, identifies bottlenecks, defines metrics, creates operational playbook, and configures dashboards.

## Prerequisites

- Active design system with at least 1 dedicated team member
- Understanding of current DS workflow (even if informal)

## Workflow

### Interactive Elicitation

1. **Gather Parameters**
   - DS team size and roles
   - Current workflow (how components go from idea to production)
   - Known bottlenecks or pain points
   - Tools in use (Figma, Storybook, CI/CD, docs)

### Steps

1. **Map Current Operations**
   - Document current component lifecycle (request → design → build → test → release)
   - Identify handoff points between design and development
   - Map review and approval cycles
   - Document release process
   - Check: workflow map has >= 1 stage AND each stage has owner + timeline — abort with "Workflow map incomplete: {N} stages missing owners or timelines"

2. **Identify Bottlenecks**
   - Design-to-dev handoff delays
   - Review cycle length
   - Release cadence gaps
   - Documentation lag
   - Consumer adoption barriers
   - Check: bottleneck count >= 0 AND each has estimated impact (hours/sprint or cost) — log "Found {N} bottlenecks with total estimated impact of {hours} hours/sprint"

3. **Define DesignOps Metrics**
   - **Adoption rate:** % of product teams using DS components
   - **Contribution velocity:** Components contributed per sprint/month
   - **Time-to-component:** Days from request to production release
   - **Coverage:** % of UI built with DS components vs. custom
   - **Satisfaction:** Consumer team satisfaction score (survey)
   - Check: each metric has data source identified AND collection method defined — abort with "Unmeasurable metrics: {list of metrics without data sources}"

4. **Create Operational Playbook**
   - Component request process
   - Design review checklist
   - Code review checklist
   - Release checklist
   - Onboarding guide for new DS team members
   - Check: playbook contains sections for request, design review, code review, release, and onboarding — abort with "Playbook missing lifecycle stages: {list}"

5. **Configure Metrics Dashboard**
   - Define data sources for each metric
   - Recommend dashboard tool (GitHub insights, custom, Notion)
   - Create dashboard template with metric calculations
   - Define review cadence (weekly/monthly)
   - Update .state.yaml

## Output

- `designops-playbook.md` — Complete operational playbook
- `designops-metrics.md` — Metric definitions and targets
- `dashboard-config.md` — Dashboard setup and data sources
- `.state.yaml` updated

## Related Checklists

- `squads/design/checklists/designops-maturity-checklist.md`
- `squads/design/checklists/design-handoff-checklist.md`
- `squads/design/checklists/ds-component-quality-checklist.md`
- `squads/design/checklists/ds-a11y-release-gate-checklist.md`

## Failure Handling

- **Workflow mapping incomplete:** Request stakeholder interviews, document known stages with confidence scores, flag gaps requiring additional discovery, defer playbook creation until >=80% coverage achieved
- **Metrics lack measurable data sources:** For each unmeasurable metric, propose proxy metrics with available data or recommend instrumentation additions, prioritize metrics by business impact
- **Bottleneck impact cannot be quantified:** Run time-tracking pilot (1 sprint), instrument handoff points with timestamps, calculate actual vs. theoretical cycle time to establish baseline
- **Dashboard tool integration fails:** Fallback to spreadsheet-based dashboard template, provide manual update instructions, estimate effort for custom dashboard implementation with available resources

## Success Criteria

- Complete workflow mapped with bottlenecks identified
- Metrics are defined, measurable, and have targets
- Playbook covers entire component lifecycle
- Dashboard can be implemented with available tools


## Process Guards
- **On Fail:** Stop execution, capture evidence, and return remediation steps before proceeding.
