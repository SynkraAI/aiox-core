# design-tooling-audit

> Evaluate and optimize design tool stack using Dave Malouf's "Governance over Tools" principle and Three Lenses framework.

## Overview

This task provides a structured approach to auditing the design tool ecosystem. Following Malouf's principle "Governance over tools - process clarity matters more than tool selection," we first understand workflows, then evaluate tools against actual needs.

## Prerequisites

- Understanding of current design workflows
- Access to tool usage data (if available)
- List of current tools and licenses
- Budget context for tool investments

## Malouf Framework Reference

### Core Principle
> "The best tools amplify good process - they can't fix bad process."

### Tool Categories (How We Work Lens)
1. **Design Tools** - Core design work (Figma, Sketch, etc.)
2. **Prototyping Tools** - Interactive prototypes
3. **Collaboration Tools** - Communication and feedback
4. **Asset Management** - Libraries, icons, images
5. **Design-Dev Integration** - Handoff and tokens
6. **Research Tools** - User research platforms
7. **Documentation Tools** - Specs and guidelines

### Evaluation Criteria
| Criterion | Description |
|-----------|-------------|
| Adoption | What % of team uses it? |
| Workflow Fit | Does it match how we work? |
| Integration | Does it connect to other tools? |
| Governance | Are there clear usage guidelines? |
| Cost Efficiency | Value vs cost? |
| Scalability | Will it work as we grow? |

## Task Steps

### Phase 1: Current State Inventory

```yaml
step: 1
name: "Tool Inventory"
template: |
  ## CURRENT TOOL INVENTORY

  ### Design Tools
  | Tool | Version | Licenses | Monthly Cost | Primary Use |
  |------|---------|----------|--------------|-------------|
  | [tool] | [X] | [Y] | $[Z] | [use case] |

  ### Prototyping Tools
  | Tool | Version | Licenses | Monthly Cost | Primary Use |
  |------|---------|----------|--------------|-------------|

  ### Collaboration Tools
  | Tool | Version | Licenses | Monthly Cost | Primary Use |
  |------|---------|----------|--------------|-------------|

  ### Asset Management
  | Tool | Version | Licenses | Monthly Cost | Primary Use |
  |------|---------|----------|--------------|-------------|

  ### Design-Dev Integration
  | Tool | Version | Licenses | Monthly Cost | Primary Use |
  |------|---------|----------|--------------|-------------|

  ### Research Tools
  | Tool | Version | Licenses | Monthly Cost | Primary Use |
  |------|---------|----------|--------------|-------------|

  ### Documentation Tools
  | Tool | Version | Licenses | Monthly Cost | Primary Use |
  |------|---------|----------|--------------|-------------|

  ---

  **Total Monthly Cost:** $[X]
  **Total Annual Cost:** $[Y]
  **Total Licenses:** [Z]
```

### Phase 2: Usage Analysis

```yaml
step: 2
name: "Analyze Actual Usage"
data_to_collect:
  quantitative:
    - Active users per tool
    - Login frequency
    - Feature usage (if available)
    - Integration usage
  qualitative:
    - Designer satisfaction per tool
    - Pain points
    - Workarounds in use
    - Feature requests

survey_questions:
  - "Which tools do you use daily? Weekly? Rarely?"
  - "Which tools cause the most friction?"
  - "What workarounds do you use?"
  - "What's missing from our tool stack?"
  - "If you could change one tool, which would it be?"

output: |
  ## USAGE ANALYSIS

  ### Adoption Rates
  | Tool | Team Size | Active Users | Adoption % | Status |
  |------|-----------|--------------|------------|--------|
  | [tool] | [X] | [Y] | [Z]% | [good/concern/critical] |

  ### Satisfaction Scores
  | Tool | Satisfaction (1-5) | Top Complaint |
  |------|-------------------|---------------|
  | [tool] | [X] | [complaint] |

  ### Identified Workarounds
  | Workaround | Why Needed | Frequency |
  |------------|------------|-----------|
  | [description] | [reason] | [daily/weekly/etc] |
```

### Phase 3: Workflow Mapping

```yaml
step: 3
name: "Map Tools to Workflows"
principle: "Understand the process before evaluating tools."

workflows_to_map:
  - name: "Design Creation"
    steps:
      - "Brief received"
      - "Research/discovery"
      - "Initial concepts"
      - "Design iteration"
      - "Review/feedback"
      - "Final design"
    tools_used: "[list per step]"
    gaps: "[where tools fail]"

  - name: "Design Handoff"
    steps:
      - "Design complete"
      - "Spec documentation"
      - "Developer review"
      - "Asset export"
      - "Implementation support"
    tools_used: "[list per step]"
    gaps: "[where tools fail]"

  - name: "Design System Management"
    steps:
      - "Component creation"
      - "Documentation"
      - "Token management"
      - "Version control"
      - "Distribution"
    tools_used: "[list per step]"
    gaps: "[where tools fail]"

output: |
  ## WORKFLOW-TOOL MAPPING

  ### Design Creation Workflow
  ```
  [Step 1] --[Tool]--> [Step 2] --[Tool]--> [Step 3]
                              |
                         [Gap: ...]
  ```

  ### Identified Gaps
  | Workflow | Step | Gap Description | Impact |
  |----------|------|-----------------|--------|
  | [workflow] | [step] | [gap] | [high/med/low] |
```

### Phase 4: Governance Assessment

```yaml
step: 4
name: "Assess Tool Governance"
checklist:
  documentation:
    - "[ ] Tool selection criteria documented?"
    - "[ ] Usage guidelines exist?"
    - "[ ] Best practices documented?"
    - "[ ] Training materials available?"
  ownership:
    - "[ ] Tool owner assigned for each tool?"
    - "[ ] License management process?"
    - "[ ] Vendor relationship owner?"
    - "[ ] Budget owner?"
  standards:
    - "[ ] File naming conventions?"
    - "[ ] Folder structure standards?"
    - "[ ] Version control guidelines?"
    - "[ ] Sharing/permissions standards?"
  onboarding:
    - "[ ] New hire tool training exists?"
    - "[ ] Access provisioning process?"
    - "[ ] Tool setup documentation?"

output: |
  ## GOVERNANCE ASSESSMENT

  ### Current State
  | Area | Score (1-5) | Notes |
  |------|-------------|-------|
  | Documentation | [X] | [notes] |
  | Ownership | [X] | [notes] |
  | Standards | [X] | [notes] |
  | Onboarding | [X] | [notes] |

  **Overall Governance Score:** [X]/5

  ### Critical Gaps
  - [gap 1]
  - [gap 2]
```

### Phase 5: Tool Evaluation

```yaml
step: 5
name: "Evaluate Each Tool"
criteria:
  - name: "Adoption"
    weight: 20
    scoring: "1=<50%, 2=50-70%, 3=70-85%, 4=85-95%, 5=>95%"
  - name: "Workflow Fit"
    weight: 25
    scoring: "1=poor, 3=adequate, 5=excellent"
  - name: "Integration"
    weight: 20
    scoring: "1=none, 3=some, 5=fully integrated"
  - name: "Governance"
    weight: 15
    scoring: "1=none, 3=basic, 5=comprehensive"
  - name: "Cost Efficiency"
    weight: 10
    scoring: "1=overpriced, 3=fair, 5=excellent value"
  - name: "Scalability"
    weight: 10
    scoring: "1=won't scale, 3=needs work, 5=ready to scale"

evaluation_template: |
  ## TOOL EVALUATION: [Tool Name]

  ### Scores
  | Criterion | Weight | Score | Weighted |
  |-----------|--------|-------|----------|
  | Adoption | 20% | [1-5] | [X] |
  | Workflow Fit | 25% | [1-5] | [X] |
  | Integration | 20% | [1-5] | [X] |
  | Governance | 15% | [1-5] | [X] |
  | Cost Efficiency | 10% | [1-5] | [X] |
  | Scalability | 10% | [1-5] | [X] |
  | **Total** | | | **[X]/5** |

  ### Recommendation
  [ ] Keep as-is
  [ ] Keep with improvements
  [ ] Replace
  [ ] Consolidate with [other tool]
  [ ] Sunset

  ### Action Items
  - [action 1]
  - [action 2]
```

### Phase 6: Recommendations

```yaml
step: 6
name: "Generate Recommendations"
categories:
  keep:
    criteria: "Score >= 4, high adoption, good fit"
    action: "Maintain and optimize"
  improve:
    criteria: "Score 3-4, fixable gaps"
    action: "Address governance/training gaps"
  replace:
    criteria: "Score < 3, critical gaps"
    action: "Evaluate alternatives"
  consolidate:
    criteria: "Overlapping functionality"
    action: "Reduce tool sprawl"
  sunset:
    criteria: "Low adoption, no clear need"
    action: "Phase out"

output: |
  ## TOOL AUDIT RECOMMENDATIONS

  ### Summary Matrix
  | Tool | Score | Recommendation | Priority |
  |------|-------|----------------|----------|
  | [tool] | [X]/5 | [action] | [1-3] |

  ### Keep (Optimize)
  | Tool | Optimization Actions |
  |------|---------------------|
  | [tool] | [actions] |

  ### Improve
  | Tool | Issues | Actions | Timeline |
  |------|--------|---------|----------|
  | [tool] | [issues] | [actions] | [X weeks] |

  ### Replace
  | Current Tool | Issues | Recommended Alternative | Migration Effort |
  |--------------|--------|------------------------|------------------|
  | [tool] | [issues] | [alternative] | [high/med/low] |

  ### Consolidate
  | Tools to Consolidate | Target Tool | Rationale |
  |---------------------|-------------|-----------|
  | [tool A], [tool B] | [target] | [rationale] |

  ### Sunset
  | Tool | Reason | Timeline |
  |------|--------|----------|
  | [tool] | [reason] | [date] |

  ---

  ### Cost Impact

  | Action | Current Cost | New Cost | Savings |
  |--------|--------------|----------|---------|
  | [action] | $[X]/mo | $[Y]/mo | $[Z]/mo |

  **Total Annual Savings:** $[X]

  ---

  ### Implementation Roadmap

  **Month 1-2:** [quick wins]
  **Month 3-4:** [governance improvements]
  **Month 5-6:** [migrations/replacements]
```

## Malouf Principles Applied

- **"Governance over tools"** - Assess process clarity before tool selection
- **"The best tools amplify good process"** - Map workflows before evaluating
- **"You can't improve what you don't measure"** - Collect usage data
- **"Consistency at scale requires governance"** - Establish standards

## Output Artifacts

1. **Tool Inventory** - Complete list with costs
2. **Usage Analysis** - Adoption and satisfaction data
3. **Workflow-Tool Map** - How tools support workflows
4. **Governance Assessment** - Standards and ownership
5. **Tool Evaluations** - Scored assessments
6. **Recommendations Report** - Prioritized actions

## Common Tool Stack Anti-patterns

| Anti-pattern | Symptom | Solution |
|--------------|---------|----------|
| Tool sprawl | 5+ tools for similar function | Consolidate |
| Shelfware | Paid tools unused | Audit and sunset |
| Shadow IT | Unapproved tools in use | Governance + training |
| Missing governance | No standards or ownership | Establish governance |
| Poor integration | Manual data transfer | Invest in integration |

## Related Tasks

- `designops-maturity-assessment.md` - Broader assessment
- `design-process-optimization.md` - Optimize workflows first
- `designops-metrics-setup.md` - Track tool effectiveness

## Related Checklists

- `squads/design/checklists/designops-maturity-checklist.md`
- `squads/design/checklists/design-team-health-checklist.md`
- `squads/design/checklists/design-handoff-checklist.md`

## Notes

> Remember: A tool audit without workflow understanding is just a spreadsheet exercise. Understand how work flows, then evaluate if tools support that flow.


## Process Guards
- **Execution Type:** `Hybrid`
- **Dependencies:** depends_on: `[]` · enables: `[]` · workflow: `design-system`
- **On Fail:** Stop execution, capture evidence, and return remediation steps before proceeding.

## Success Criteria
- [ ] Output artifact(s) generated and referenced.
- [ ] Validation checks executed with evidence.
- [ ] Next-step dependencies documented.
