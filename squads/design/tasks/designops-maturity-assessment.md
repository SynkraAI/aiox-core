# designops-maturity-assessment

> Assess organization's DesignOps maturity level using Dave Malouf's Three Lenses framework and 5-level maturity model.

## Overview

This task provides a comprehensive assessment of an organization's DesignOps maturity across the Three Lenses: How We Work, How We Grow, How We Thrive. The output is a scored assessment with gap analysis and prioritized recommendations.

## Prerequisites

- Access to design team members for interviews/surveys
- Understanding of current organizational structure
- Stakeholder availability for context gathering

## Malouf Framework Reference

### Three Lenses of DesignOps
1. **How We Work** - Workflow, tools, processes, collaboration
2. **How We Grow** - Hiring, onboarding, career development, learning
3. **How We Thrive** - Culture, community, well-being, advocacy

### Maturity Levels
| Level | Name | Description |
|-------|------|-------------|
| 1 | Ad Hoc | No formal DesignOps - reactive and individual |
| 2 | Emerging | Basic standardization beginning - some awareness |
| 3 | Defined | Clear processes and standards - adoption growing |
| 4 | Managed | Metrics-driven optimization - continuous improvement |
| 5 | Optimized | Industry-leading - innovation and excellence |

## Task Steps

### Phase 1: Discovery (Diagnostic)

```yaml
step: 1
name: "Stakeholder Mapping"
actions:
  - Identify key stakeholders (design leadership, designers, cross-functional partners)
  - Schedule interviews or distribute surveys
  - Gather existing documentation (processes, tools, org charts)
questions:
  - "Who are the decision-makers for design operations?"
  - "What documentation exists about current processes?"
  - "Who can provide candid feedback about pain points?"
```

```yaml
step: 2
name: "Current State Discovery"
actions:
  - Interview 3-5 designers at different levels
  - Interview design leadership
  - Interview cross-functional partners (PM, Eng)
  - Review existing tools and processes
diagnostic_questions:
  how_we_work:
    - "What tools do you use for design? Is everyone using the same tools?"
    - "How do projects flow from brief to delivery?"
    - "How do design reviews happen? How often?"
    - "What's your handoff process to development?"
    - "Where do you store design assets?"
  how_we_grow:
    - "How were you hired? What was the interview process?"
    - "What was your onboarding experience like?"
    - "Is there a career ladder? Do you know how to progress?"
    - "What learning opportunities exist?"
  how_we_thrive:
    - "Do you feel part of a design community?"
    - "How is good work recognized?"
    - "How's your workload? Any burnout concerns?"
    - "Does design have influence on product decisions?"
```

### Phase 2: Assessment Scoring

```yaml
step: 3
name: "Score Each Lens"
template: |
  ## HOW WE WORK Assessment

  ### Workflow Management
  Score: [1-5]
  Evidence:
  - [ ] Design sprints/rituals defined
  - [ ] Project intake process exists
  - [ ] Review cycles documented
  - [ ] Version control for design
  Notes: [observations]

  ### Tooling
  Score: [1-5]
  Evidence:
  - [ ] Standard design tool adopted (>80%)
  - [ ] Prototyping tools defined
  - [ ] Collaboration tools standardized
  - [ ] Design-dev integration tools
  Notes: [observations]

  ### Asset Management
  Score: [1-5]
  Evidence:
  - [ ] Component library exists
  - [ ] Icon system managed
  - [ ] Brand assets centralized
  - [ ] Naming conventions defined
  Notes: [observations]

  ### Cross-Functional Collaboration
  Score: [1-5]
  Evidence:
  - [ ] Design-dev handoff process
  - [ ] PM-design alignment rituals
  - [ ] Research integration
  - [ ] QA involvement
  Notes: [observations]

  **Subtotal How We Work: [average]/5**

  ---

  ## HOW WE GROW Assessment

  ### Hiring
  Score: [1-5]
  Evidence:
  - [ ] Recruiting pipeline defined
  - [ ] Interview process documented
  - [ ] Portfolio review rubric exists
  - [ ] Diversity considerations
  Notes: [observations]

  ### Onboarding
  Score: [1-5]
  Evidence:
  - [ ] 90-day program exists
  - [ ] Buddy/mentor assigned
  - [ ] Tool training provided
  - [ ] First project guidance
  Notes: [observations]

  ### Career Development
  Score: [1-5]
  Evidence:
  - [ ] Career ladder defined
  - [ ] Skills matrix exists
  - [ ] Performance reviews structured
  - [ ] IC and management tracks
  Notes: [observations]

  ### Learning
  Score: [1-5]
  Evidence:
  - [ ] Training programs exist
  - [ ] Conference budget allocated
  - [ ] Skill sharing sessions
  - [ ] External courses supported
  Notes: [observations]

  **Subtotal How We Grow: [average]/5**

  ---

  ## HOW WE THRIVE Assessment

  ### Culture
  Score: [1-5]
  Evidence:
  - [ ] Design values articulated
  - [ ] Psychological safety present
  - [ ] Feedback culture healthy
  - [ ] Recognition systematic
  Notes: [observations]

  ### Community
  Score: [1-5]
  Evidence:
  - [ ] Design critiques regular
  - [ ] Show and tell sessions
  - [ ] Design guild/community exists
  - [ ] Cross-team connections
  Notes: [observations]

  ### Well-being
  Score: [1-5]
  Evidence:
  - [ ] Workload managed
  - [ ] Work-life balance supported
  - [ ] Mental health resources
  - [ ] Burnout prevention
  Notes: [observations]

  ### Advocacy
  Score: [1-5]
  Evidence:
  - [ ] Design leadership visible
  - [ ] Executive sponsorship
  - [ ] Design influences strategy
  - [ ] Seat at the table
  Notes: [observations]

  **Subtotal How We Thrive: [average]/5**
```

### Phase 3: Gap Analysis

```yaml
step: 4
name: "Calculate Overall Maturity"
calculation: |
  OVERALL MATURITY = (How We Work + How We Grow + How We Thrive) / 3

  Interpretation:
  1.0 - 1.5 = Level 1 (Ad Hoc)
  1.6 - 2.5 = Level 2 (Emerging)
  2.6 - 3.5 = Level 3 (Defined)
  3.6 - 4.5 = Level 4 (Managed)
  4.6 - 5.0 = Level 5 (Optimized)
```

```yaml
step: 5
name: "Identify Gaps"
actions:
  - Compare current state to target state
  - Identify highest-impact gaps
  - Prioritize by effort vs impact
prioritization_matrix: |
  | Gap | Impact (1-5) | Effort (1-5) | Priority |
  |-----|--------------|--------------|----------|
  | [gap 1] | [X] | [Y] | [High/Med/Low] |
  | [gap 2] | [X] | [Y] | [High/Med/Low] |

  Priority Rule:
  - High Impact + Low Effort = Quick Win (do first)
  - High Impact + High Effort = Strategic (plan carefully)
  - Low Impact + Low Effort = Nice to have
  - Low Impact + High Effort = Avoid
```

### Phase 4: Recommendations

```yaml
step: 6
name: "Generate Recommendations"
output_structure: |
  ## DESIGNOPS MATURITY ASSESSMENT REPORT

  Organization: [Name]
  Assessment Date: [Date]
  Assessor: Dave Malouf Framework

  ---

  ### Executive Summary

  **Current Maturity Level: [X]/5 ([Level Name])**

  | Lens | Score | Status |
  |------|-------|--------|
  | How We Work | [X]/5 | [Level] |
  | How We Grow | [X]/5 | [Level] |
  | How We Thrive | [X]/5 | [Level] |

  **Key Finding:** [One sentence summary of biggest gap]

  ---

  ### Detailed Findings

  [Lens-by-lens breakdown with evidence]

  ---

  ### Top 3 Priority Recommendations

  1. **[Recommendation 1]** (Quick Win)
     - Gap addressed: [X]
     - Expected impact: [X]
     - Timeline: [X weeks/months]

  2. **[Recommendation 2]** (Quick Win or Strategic)
     - Gap addressed: [X]
     - Expected impact: [X]
     - Timeline: [X weeks/months]

  3. **[Recommendation 3]** (Strategic)
     - Gap addressed: [X]
     - Expected impact: [X]
     - Timeline: [X weeks/months]

  ---

  ### 12-Month Roadmap

  **Q1:** [Focus areas]
  **Q2:** [Focus areas]
  **Q3:** [Focus areas]
  **Q4:** [Focus areas]

  ---

  ### Success Metrics

  | Metric | Current | Target | Timeline |
  |--------|---------|--------|----------|
  | Overall Maturity | [X] | [Y] | [Z months] |
  | [Specific metric] | [X] | [Y] | [Z months] |

  ---

  > "You can't skip maturity levels - organizations evolve in stages."
  > - Dave Malouf
```

## Malouf Principles Applied

- **"Where is the friction? That's where we start."** - Focus diagnostic on pain points
- **"You can't skip maturity levels"** - Recommend incremental improvements only
- **"Measure before optimizing"** - Establish baselines before proposing changes
- **"Operations enable creativity"** - Frame recommendations as friction removal
- **"Three Lenses"** - Always assess all three dimensions

## Output Artifacts

1. **Maturity Assessment Report** (comprehensive document)
2. **Gap Analysis Matrix** (prioritized list)
3. **Roadmap** (quarterly plan)
4. **Success Metrics Dashboard** (tracking template)

## Next Steps After Assessment

- If maturity < 2: Focus on documenting current practices
- If maturity 2-3: Build formal processes and governance
- If maturity 3-4: Implement metrics and optimize
- If maturity > 4: Focus on innovation and industry leadership

## Related Tasks

- `design-team-scaling.md` - Use after assessing "How We Grow"
- `design-tooling-audit.md` - Deep dive on tooling gaps
- `design-process-optimization.md` - Address workflow gaps
- `designops-metrics-setup.md` - Implement measurement systems

## Checklist Reference

Use `checklists/designops-maturity-checklist.md` for detailed criteria at each level.


## Related Checklists

- `squads/design/checklists/designops-maturity-checklist.md`
- `squads/design/checklists/design-team-health-checklist.md`

## Process Guards
- **Execution Type:** `Hybrid`
- **Dependencies:** depends_on: `[]` · enables: `[]` · workflow: `design-system`
- **On Fail:** Stop execution, capture evidence, and return remediation steps before proceeding.

## Success Criteria
- [ ] Output artifact(s) generated and referenced.
- [ ] Validation checks executed with evidence.
- [ ] Next-step dependencies documented.
