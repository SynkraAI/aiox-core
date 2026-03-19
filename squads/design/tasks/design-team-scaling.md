# design-team-scaling

> Plan design team growth and structure using Dave Malouf's scaling framework and team topology principles.

## Overview

This task guides strategic planning for scaling a design team from current state to target size. It emphasizes building systems before adding headcount, following Malouf's principle: "Scale through systems, not just headcount."

## Prerequisites

- Completed `designops-maturity-assessment.md` (know your current maturity)
- Understanding of business growth plans
- Budget parameters (rough estimates acceptable)
- Timeline expectations

## Malouf Framework Reference

### Scaling Phases
| Phase | Size | Name | Key Focus |
|-------|------|------|-----------|
| 1 | 0-5 | Founding | Establish credibility, first wins |
| 2 | 5-15 | Building | Standardize, build foundations |
| 3 | 15-50 | Scaling | Scale processes, build management |
| 4 | 50-150 | Optimizing | Efficiency, centers of excellence |
| 5 | 150+ | Enterprise | Multi-BU coordination, global |

### Team Topologies
| Topology | Description | Best For |
|----------|-------------|----------|
| Centralized | All designers in one team | <20 designers, consistency priority |
| Embedded | Designers sit in product teams | Speed priority, deep product knowledge |
| Federated | Embedded with dotted line to design | 50+ designers, balance consistency/speed |
| Hybrid | Mix based on function | Large, complex orgs, specialized needs |

### Scaling Principles
1. Systems before headcount
2. Hire one level ahead
3. Document before scaling
4. Measure what matters
5. Culture is fragile at scale
6. Governance enables, not restricts

## Task Steps

### Phase 1: Current State Assessment

```yaml
step: 1
name: "Assess Current State"
questions:
  headcount:
    - "How many designers currently?"
    - "What's the breakdown by role/level?"
    - "What's the designer-to-engineer ratio?"
    - "What's the designer-to-PM ratio?"
  maturity:
    - "What's your DesignOps maturity level?"
    - "What processes are documented?"
    - "What's working well?"
    - "What's breaking?"
  structure:
    - "Current topology (centralized/embedded/etc)?"
    - "Reporting structure?"
    - "Who manages designers?"
output: |
  CURRENT STATE SNAPSHOT

  Headcount: [X] designers
  Breakdown:
  - Senior: [X]
  - Mid: [X]
  - Junior: [X]
  - Specialists: [X] (research, systems, etc.)

  Ratios:
  - Designer:Engineer = 1:[X]
  - Designer:PM = 1:[X]

  Maturity Level: [X]/5
  Current Topology: [type]

  Strengths:
  - [list]

  Pain Points:
  - [list]
```

### Phase 2: Target State Definition

```yaml
step: 2
name: "Define Target State"
questions:
  growth:
    - "Target headcount in 6/12/18 months?"
    - "What's driving the growth?"
    - "What new capabilities are needed?"
  business_context:
    - "New products/markets?"
    - "Acquisition/merger planned?"
    - "Reorganization coming?"
  constraints:
    - "Budget constraints?"
    - "Hiring market conditions?"
    - "Timeline pressures?"
output: |
  TARGET STATE DEFINITION

  Timeline: [X] months
  Target Headcount: [Y] designers
  Growth Rate: [Z] designers/quarter

  New Capabilities Needed:
  - [list]

  Business Drivers:
  - [list]

  Constraints:
  - [list]
```

### Phase 3: Gap Analysis (Systems vs Headcount)

```yaml
step: 3
name: "Identify Systems Gaps"
principle: "Build the system before hiring - otherwise you're just adding chaos."
checklist:
  processes:
    - "[ ] Design workflow documented?"
    - "[ ] Handoff process defined?"
    - "[ ] Review process standardized?"
    - "[ ] Project intake established?"
  tools:
    - "[ ] Tool stack standardized?"
    - "[ ] Asset management centralized?"
    - "[ ] Design system exists?"
    - "[ ] Collaboration tools unified?"
  people_ops:
    - "[ ] Hiring process documented?"
    - "[ ] Interview rubric exists?"
    - "[ ] Onboarding program built?"
    - "[ ] Career ladder defined?"
  governance:
    - "[ ] Decision rights clear?"
    - "[ ] Standards documented?"
    - "[ ] Escalation paths defined?"
    - "[ ] Quality gates established?"
  metrics:
    - "[ ] Baseline metrics collected?"
    - "[ ] Success metrics defined?"
    - "[ ] Reporting cadence set?"
output: |
  SYSTEMS GAP ANALYSIS

  Ready to Scale:
  - [list of checked items]

  Must Build Before Scaling:
  - [list of unchecked items, prioritized]

  Estimated Effort: [X] weeks/months to close gaps
```

### Phase 4: Topology Recommendation

```yaml
step: 4
name: "Evaluate Team Topology"
decision_factors:
  - current_size: "[X]"
  - target_size: "[Y]"
  - product_complexity: "[low/medium/high]"
  - consistency_priority: "[1-5]"
  - speed_priority: "[1-5]"
  - maturity_level: "[1-5]"

evaluation_matrix: |
  | Factor | Weight | Centralized | Embedded | Federated | Hybrid |
  |--------|--------|-------------|----------|-----------|--------|
  | Size fit | 30% | [1-5] | [1-5] | [1-5] | [1-5] |
  | Consistency | 25% | [1-5] | [1-5] | [1-5] | [1-5] |
  | Speed | 25% | [1-5] | [1-5] | [1-5] | [1-5] |
  | Maturity fit | 20% | [1-5] | [1-5] | [1-5] | [1-5] |
  | **Weighted Total** | | [X] | [X] | [X] | [X] |

output: |
  TOPOLOGY RECOMMENDATION

  Recommended: [Topology]

  Rationale:
  - [reason 1]
  - [reason 2]
  - [reason 3]

  Structure Proposal:
  [Org chart or description]

  Transition Plan (if changing):
  1. [step]
  2. [step]
  3. [step]

  Warning Signs to Watch:
  - [sign 1]
  - [sign 2]
```

### Phase 5: Scaling Roadmap

```yaml
step: 5
name: "Build Scaling Roadmap"
template: |
  ## DESIGN TEAM SCALING PLAN

  From: [X] designers
  To: [Y] designers
  Timeline: [Z] months

  ---

  ### PHASE 1: FOUNDATION
  Timeline: Months 1-[X]
  Objective: Build systems before scaling

  **Systems to Build:**
  - [ ] [system 1]
  - [ ] [system 2]
  - [ ] [system 3]

  **Hires (if any):**
  - [role]: [justification]

  **Success Metrics:**
  - [metric]: [target]

  ---

  ### PHASE 2: FIRST WAVE
  Timeline: Months [X]-[Y]
  Objective: First major hiring push

  **Prerequisites Completed:**
  - [system 1] operational
  - [system 2] operational

  **Hires:**
  | Role | Level | Quantity | Priority |
  |------|-------|----------|----------|
  | [role] | [level] | [X] | [1-3] |

  **Management Needs:**
  - [description]

  **Success Metrics:**
  - Time to hire: <[X] days
  - Time to productivity: <[X] days
  - Satisfaction: >[X]/5

  ---

  ### PHASE 3: ACCELERATION
  Timeline: Months [X]-[Y]
  Objective: Scale what works

  **Hires:**
  | Role | Level | Quantity | Priority |
  |------|-------|----------|----------|
  | [role] | [level] | [X] | [1-3] |

  **Programs to Scale:**
  - [program 1]
  - [program 2]

  **Success Metrics:**
  - Process adoption: >[X]%
  - Retention: >[X]%

  ---

  ### PHASE 4: OPTIMIZATION
  Timeline: Months [X]-[Y]
  Objective: Fine-tune and stabilize

  **Final Hires:**
  - [description]

  **Optimization Focus:**
  - [area 1]
  - [area 2]

  **Success Metrics:**
  - All maturity areas at Level [X]+
  - Designer satisfaction >[X]/5
  - Retention >[X]%
```

### Phase 6: Budget Model

```yaml
step: 6
name: "Estimate Budget"
template: |
  ## SCALING BUDGET ESTIMATE

  ### PEOPLE COSTS

  | Role | Level | Qty | Annual Cost | Total |
  |------|-------|-----|-------------|-------|
  | [role] | [level] | [X] | $[Y]K | $[Z]K |

  Subtotal People: $[X]

  ### TOOLS & INFRASTRUCTURE

  | Item | Per Seat | Seats | Total |
  |------|----------|-------|-------|
  | [tool] | $[X] | [Y] | $[Z] |

  Subtotal Tools: $[X]

  ### PROGRAMS

  | Program | Annual Cost |
  |---------|-------------|
  | Training/Conferences | $[X] |
  | Community Events | $[X] |
  | Learning Budget | $[X] |

  Subtotal Programs: $[X]

  ### TOTAL INVESTMENT

  Year 1: $[X]
  Year 2: $[X]

  ### ROI PROJECTION

  | Value Driver | Estimated Value |
  |--------------|-----------------|
  | Productivity gains | $[X] |
  | Reduced rework | $[X] |
  | Faster onboarding | $[X] |
  | Quality improvement | $[X] |

  Total Projected Value: $[X]
  ROI Ratio: [X]:1
```

## Malouf Principles Applied

- **"Scale through systems, not just headcount"** - Build foundation before hiring
- **"Document before you scale - tribal knowledge doesn't scale"** - Require documentation
- **"Culture is fragile at scale - intentionality is required"** - Plan culture preservation
- **"Hire one level ahead - your future self will thank you"** - Plan for growth
- **"The right structure depends on context"** - Customize topology recommendation

## Output Artifacts

1. **Current State Assessment** - Baseline documentation
2. **Target State Definition** - Growth goals
3. **Systems Gap Analysis** - Prerequisites before scaling
4. **Topology Recommendation** - Structure proposal
5. **Scaling Roadmap** - Phased plan
6. **Budget Estimate** - Investment and ROI

## Warning Signs During Scaling

Monitor these indicators that scaling is going wrong:

| Phase | Warning Sign | Action |
|-------|--------------|--------|
| Building | Quality inconsistent | Slow down, standardize |
| Scaling | Managers overwhelmed | Add management layer |
| Scaling | Communication breaking | Increase rituals |
| Optimizing | Innovation slowing | Reduce bureaucracy |
| Enterprise | Ivory tower forming | Increase autonomy |

## Related Tasks

- `designops-maturity-assessment.md` - Assess before scaling
- `design-tooling-audit.md` - Ensure tools scale
- `design-process-optimization.md` - Streamline before scaling
- `designops-metrics-setup.md` - Track scaling success

## Checklist Reference

Use `checklists/design-team-health-checklist.md` to monitor team health during scaling.


## Related Checklists

- `squads/design/checklists/ds-component-quality-checklist.md`

## Process Guards
- **Execution Type:** `Hybrid`
- **Dependencies:** depends_on: `[]` · enables: `[]` · workflow: `design-system`
- **On Fail:** Stop execution, capture evidence, and return remediation steps before proceeding.

## Success Criteria
- [ ] Output artifact(s) generated and referenced.
- [ ] Validation checks executed with evidence.
- [ ] Next-step dependencies documented.
