# design-process-optimization

> Streamline design workflows and reduce friction using Dave Malouf's DesignOps Pillars framework, focusing on Workflow Operations.

## Overview

This task systematically identifies and removes friction from design processes. Following Malouf's core principle: "Operations enable creativity - we remove friction so designers can focus on design."

## Prerequisites

- Understanding of current design workflows
- Access to designers for interviews/observation
- Awareness of pain points (formal or informal)
- Stakeholder support for process changes

## Malouf Framework Reference

### Core Principle
> "Process should feel like a handrail, not a cage."

### Workflow Operations Pillar Components
1. **Process Design** - Sprints, intake, milestones, approvals
2. **Rituals** - Planning, reviews, critiques, retrospectives
3. **Handoffs** - Design to dev, research to design, QA
4. **Templates** - Briefs, specs, presentations

### Friction Categories
| Category | Examples | Impact |
|----------|----------|--------|
| Wait Time | Approval delays, stakeholder availability | Slower delivery |
| Rework | Unclear requirements, late feedback | Wasted effort |
| Context Switching | Multiple projects, unclear priorities | Reduced quality |
| Information Loss | Poor handoffs, missing documentation | Errors, confusion |
| Tool Friction | Manual tasks, poor integration | Lost time |

## Task Steps

### Phase 1: Friction Discovery

```yaml
step: 1
name: "Identify Friction Points"
methods:
  observation:
    - Shadow designers for a day
    - Attend design reviews and critiques
    - Observe handoff meetings
  interviews:
    questions:
      - "Where do you spend time that isn't designing?"
      - "What slows you down most often?"
      - "What do you wish was easier?"
      - "Where do things get lost or confused?"
      - "What repetitive tasks annoy you?"
  data_analysis:
    - Project timeline analysis (planned vs actual)
    - Revision counts per project
    - Handoff rejection rates
    - Meeting time analysis

friction_log_template: |
  ## FRICTION DISCOVERY LOG

  ### Friction Point: [Name]

  **Category:** [Wait/Rework/Context Switch/Info Loss/Tool]
  **Frequency:** [Daily/Weekly/Per Project]
  **Severity:** [1-5]
  **Who's Affected:** [roles]

  **Description:**
  [What happens]

  **Root Cause:**
  [Why it happens]

  **Current Workaround:**
  [How people cope]

  **Impact:**
  - Time lost: [X hours/week]
  - Quality impact: [description]
  - Morale impact: [description]

  ---
```

### Phase 2: Process Mapping

```yaml
step: 2
name: "Map Current Processes"
workflows_to_map:
  - Design project lifecycle
  - Design review/critique
  - Design handoff
  - Design system contribution
  - Research integration

mapping_template: |
  ## PROCESS MAP: [Process Name]

  ### Current State

  ```
  [Step 1] --> [Step 2] --> [Step 3] --> [Step 4]
     |            |            |            |
  [Actor]     [Actor]     [Actor]     [Actor]
     |            |            |            |
  [Time]      [Time]      [Time]      [Time]
     |            |            |            |
  [Friction]  [Friction]  [Friction]  [Friction]
  ```

  ### Step Details

  | Step | Owner | Inputs | Outputs | Avg Time | Friction |
  |------|-------|--------|---------|----------|----------|
  | [step] | [who] | [what] | [what] | [time] | [yes/no] |

  ### Bottlenecks Identified
  1. [bottleneck 1] - [impact]
  2. [bottleneck 2] - [impact]

  ### Wait Time Analysis
  - Active work time: [X hours]
  - Wait time: [Y hours]
  - Efficiency ratio: [X / (X+Y)]%
```

### Phase 3: Prioritization

```yaml
step: 3
name: "Prioritize Improvements"
framework: |
  Use Impact vs Effort matrix:

  HIGH IMPACT + LOW EFFORT = Quick Wins (Do First)
  HIGH IMPACT + HIGH EFFORT = Strategic (Plan Carefully)
  LOW IMPACT + LOW EFFORT = Nice to Have
  LOW IMPACT + HIGH EFFORT = Avoid

prioritization_template: |
  ## FRICTION PRIORITIZATION MATRIX

  ### Quick Wins (High Impact, Low Effort)
  | Friction Point | Impact | Effort | Action |
  |----------------|--------|--------|--------|
  | [friction] | [1-5] | [1-5] | [action] |

  ### Strategic Improvements (High Impact, High Effort)
  | Friction Point | Impact | Effort | Action |
  |----------------|--------|--------|--------|
  | [friction] | [1-5] | [1-5] | [action] |

  ### Nice to Have (Low Impact, Low Effort)
  | Friction Point | Impact | Effort | Action |
  |----------------|--------|--------|--------|
  | [friction] | [1-5] | [1-5] | [action] |

  ### Deprioritize (Low Impact, High Effort)
  | Friction Point | Impact | Effort | Reason to Skip |
  |----------------|--------|--------|----------------|
  | [friction] | [1-5] | [1-5] | [reason] |
```

### Phase 4: Solution Design

```yaml
step: 4
name: "Design Improvements"
solution_categories:
  process_simplification:
    - Remove unnecessary steps
    - Combine related steps
    - Eliminate approvals that don't add value
  ritual_optimization:
    - Right-size meeting frequency
    - Clarify purpose and outcomes
    - Add missing rituals
  handoff_improvement:
    - Standardize handoff format
    - Add checkpoints
    - Automate where possible
  template_creation:
    - Standard project brief
    - Design spec template
    - Review checklist
  automation:
    - Integrate tools
    - Auto-generate artifacts
    - Streamline repetitive tasks

solution_template: |
  ## SOLUTION DESIGN: [Friction Point]

  ### Current State
  [Description of current process]

  ### Future State
  [Description of improved process]

  ### Changes Required
  1. [Change 1]
  2. [Change 2]
  3. [Change 3]

  ### Process Comparison
  | Aspect | Current | Future | Improvement |
  |--------|---------|--------|-------------|
  | Steps | [X] | [Y] | [Z]% reduction |
  | Time | [X] hrs | [Y] hrs | [Z]% faster |
  | Wait | [X] hrs | [Y] hrs | [Z]% reduction |
  | Touch points | [X] | [Y] | [Z]% fewer |

  ### Dependencies
  - [dependency 1]
  - [dependency 2]

  ### Risks
  - [risk 1] - Mitigation: [mitigation]

  ### Success Metrics
  - [metric 1]: Target [X]
  - [metric 2]: Target [Y]
```

### Phase 5: Implementation

```yaml
step: 5
name: "Implement Improvements"
approach: |
  Pilot → Iterate → Roll Out

  Never roll out process changes organization-wide without piloting.

implementation_template: |
  ## IMPLEMENTATION PLAN: [Improvement]

  ### Phase 1: Pilot (2-4 weeks)

  **Pilot Group:** [team/project]
  **Duration:** [X weeks]
  **Success Criteria:** [metrics]

  **Checklist:**
  - [ ] Pilot group identified and briefed
  - [ ] Current baseline measured
  - [ ] New process documented
  - [ ] Training completed
  - [ ] Feedback mechanism in place
  - [ ] Success metrics defined

  ### Phase 2: Iterate (1-2 weeks)

  **Feedback Collection:**
  - [ ] Pilot retrospective conducted
  - [ ] Metrics analyzed
  - [ ] Adjustments identified

  **Adjustments:**
  - [adjustment 1]
  - [adjustment 2]

  ### Phase 3: Roll Out (2-4 weeks)

  **Communication:**
  - [ ] Announcement prepared
  - [ ] Documentation updated
  - [ ] Training scheduled

  **Execution:**
  - [ ] Team 1 trained and adopted
  - [ ] Team 2 trained and adopted
  - [ ] Team N trained and adopted

  **Support:**
  - [ ] FAQ created
  - [ ] Support channel established
  - [ ] Champions identified
```

### Phase 6: Measurement

```yaml
step: 6
name: "Measure Results"
metrics_to_track:
  efficiency:
    - "Time from brief to delivery"
    - "Wait time in process"
    - "Revision cycles"
  quality:
    - "Handoff rejection rate"
    - "Rework percentage"
    - "Stakeholder satisfaction"
  satisfaction:
    - "Designer satisfaction with process"
    - "Cross-functional partner feedback"

tracking_template: |
  ## PROCESS OPTIMIZATION RESULTS

  ### [Process Name] Improvements

  | Metric | Before | After | Change |
  |--------|--------|-------|--------|
  | Time to delivery | [X] days | [Y] days | [Z]% improvement |
  | Wait time | [X] hrs | [Y] hrs | [Z]% reduction |
  | Revision cycles | [X] | [Y] | [Z]% reduction |
  | Handoff rejections | [X]% | [Y]% | [Z]% improvement |
  | Designer satisfaction | [X]/5 | [Y]/5 | +[Z] |

  ### Qualitative Feedback
  - "[quote from designer]"
  - "[quote from stakeholder]"

  ### Lessons Learned
  - [lesson 1]
  - [lesson 2]

  ### Next Optimization Targets
  - [target 1]
  - [target 2]
```

## Common Process Optimizations

### Design Review Process
| Common Issue | Solution |
|--------------|----------|
| Too many reviewers | Define review RACI, limit to decision-makers |
| Unclear feedback | Structured feedback template |
| Multiple rounds | Combine reviews, earlier alignment |
| Scheduling delays | Fixed critique slots in calendar |

### Design Handoff Process
| Common Issue | Solution |
|--------------|----------|
| Missing specs | Handoff checklist template |
| Questions during dev | Design-dev pairing, office hours |
| Late changes | Change freeze policy |
| Asset management | Centralized, version-controlled assets |

### Project Intake Process
| Common Issue | Solution |
|--------------|----------|
| Unclear requirements | Standard brief template |
| Scope creep | Change request process |
| Priority conflicts | Centralized prioritization |
| Unrealistic timelines | Estimation framework |

## Malouf Principles Applied

- **"Operations enable creativity"** - Every change should reduce friction
- **"Process should feel like a handrail"** - Guide without constraining
- **"Where is the friction?"** - Start with pain points
- **"Measure before optimizing"** - Baseline before changes
- **"Every exception becomes a precedent"** - Design for sustainability

## Output Artifacts

1. **Friction Discovery Log** - Documented pain points
2. **Process Maps** - Current state visualizations
3. **Prioritization Matrix** - Impact vs effort analysis
4. **Solution Designs** - Detailed improvement plans
5. **Implementation Plans** - Pilot and rollout plans
6. **Results Dashboard** - Before/after metrics

## Anti-patterns to Avoid

| Anti-pattern | Why Bad | Instead |
|--------------|---------|---------|
| Big bang rollout | High risk, hard to course-correct | Pilot first |
| Process for process sake | Adds friction, not value | Start with friction |
| Over-engineering | Complex processes fail | Keep it simple |
| Ignoring feedback | Builds resentment | Iterate based on input |
| Measuring everything | Analysis paralysis | Focus on key metrics |

## Related Tasks

- `designops-maturity-assessment.md` - Broader assessment
- `design-tooling-audit.md` - Tool-related friction
- `designops-metrics-setup.md` - Track improvements

## Related Checklists

- `squads/design/checklists/design-handoff-checklist.md`
- `squads/design/checklists/design-team-health-checklist.md`
- `squads/design/checklists/designops-maturity-checklist.md`

## Notes

> The goal is not to have the most sophisticated process. The goal is to have the simplest process that enables quality design work at scale.


## Process Guards
- **Execution Type:** `Hybrid`
- **Dependencies:** depends_on: `[]` · enables: `[]` · workflow: `design-system`
- **On Fail:** Stop execution, capture evidence, and return remediation steps before proceeding.

## Success Criteria
- [ ] Output artifact(s) generated and referenced.
- [ ] Validation checks executed with evidence.
- [ ] Next-step dependencies documented.
