# Calculate ROI and Cost Savings

> Task ID: brad-calculate-roi
> Agent: Brad (Design System Architect)
> Version: 1.0.0

## Execution Modes

**Choose your execution mode:**

### 1. YOLO Mode - Fast, Autonomous (0-1 prompts)
- Autonomous decision making with logging
- Minimal user interaction
- **Best for:** Simple, deterministic tasks

### 2. Interactive Mode - Balanced, Educational (5-10 prompts) **[DEFAULT]**
- Explicit decision checkpoints
- Educational explanations
- **Best for:** Learning, complex decisions

### 3. Pre-Flight Planning - Comprehensive Upfront Planning
- Task analysis phase (identify all ambiguities)
- Zero ambiguity execution
- **Best for:** Ambiguous requirements, critical work

**Parameter:** `mode` (optional, default: `interactive`)

---

## Task Definition (AIOX Task Format V1.0)

```yaml
task: calculateRoi()
responsável: Morgan (Strategist)
responsavel_type: Agente
atomic_layer: Strategy

**Entrada:**
- campo: task
  tipo: string
  origem: User Input
  obrigatório: true
  validação: Must be registered task

- campo: parameters
  tipo: object
  origem: User Input
  obrigatório: false
  validação: Valid task parameters

- campo: mode
  tipo: string
  origem: User Input
  obrigatório: false
  validação: yolo|interactive|pre-flight

**Saída:**
- campo: execution_result
  tipo: object
  destino: Memory
  persistido: false

- campo: logs
  tipo: array
  destino: File (.ai/logs/*)
  persistido: true

- campo: state
  tipo: object
  destino: State management
  persistido: true
```

---

## Pre-Conditions

**Purpose:** Validate prerequisites BEFORE task execution (blocking)

**Checklist:**

```yaml
pre-conditions:
  - [ ] Task is registered; required parameters provided; dependencies met
    tipo: pre-condition
    blocker: true
    validação: |
      Check task is registered; required parameters provided; dependencies met
    error_message: "Pre-condition failed: Task is registered; required parameters provided; dependencies met"
```

---

## Post-Conditions

**Purpose:** Validate execution success AFTER task completes

**Checklist:**

```yaml
post-conditions:
  - [ ] Task completed; exit code 0; expected outputs created
    tipo: post-condition
    blocker: true
    validação: |
      Verify task completed; exit code 0; expected outputs created
    error_message: "Post-condition failed: Task completed; exit code 0; expected outputs created"
```

---

## Acceptance Criteria

**Purpose:** Definitive pass/fail criteria for task completion

**Checklist:**

```yaml
acceptance-criteria:
  - [ ] Task completed as expected; side effects documented
    tipo: acceptance-criterion
    blocker: true
    validação: |
      Assert task completed as expected; side effects documented
    error_message: "Acceptance criterion not met: Task completed as expected; side effects documented"
```

---

## Tools

**External/shared resources used by this task:**

- **Tool:** task-runner
  - **Purpose:** Task execution and orchestration
  - **Source:** .aiox-core/core/task-runner.js

- **Tool:** logger
  - **Purpose:** Execution logging and error tracking
  - **Source:** .aiox-core/utils/logger.js

---

## Scripts

**Agent-specific code for this task:**

- **Script:** execute-task.js
  - **Purpose:** Generic task execution wrapper
  - **Language:** JavaScript
  - **Location:** .aiox-core/scripts/execute-task.js

---

## Error Handling

**Strategy:** fallback

**Common Errors:**

1. **Error:** Task Not Found
   - **Cause:** Specified task not registered in system
   - **Resolution:** Verify task name and registration
   - **Recovery:** List available tasks, suggest similar

2. **Error:** Invalid Parameters
   - **Cause:** Task parameters do not match expected schema
   - **Resolution:** Validate parameters against task definition
   - **Recovery:** Provide parameter template, reject execution

3. **Error:** Execution Timeout
   - **Cause:** Task exceeds maximum execution time
   - **Resolution:** Optimize task or increase timeout
   - **Recovery:** Kill task, cleanup resources, log state

---

## Performance

**Expected Metrics:**

```yaml
duration_expected: 5-20 min (estimated)
cost_estimated: $0.003-0.015
token_usage: ~2,000-8,000 tokens
```

**Optimization Notes:**
- Iterative analysis with depth limits; cache intermediate results; batch similar operations

---

## Metadata

```yaml
story: N/A
version: 1.0.0
dependencies:
  - N/A
tags:
  - automation
  - workflow
updated_at: 2025-11-17
```

---


## Description

Calculate real cost savings from pattern consolidation with hard numbers. Estimates monthly/annual maintenance costs before and after, projects ROI timeline, shows when investment breaks even.

## Prerequisites

- Consolidation completed (*consolidate command run successfully)
- .state.yaml contains pattern reduction metrics
- Optional: Team salary data for accurate calculations

## Workflow

### Interactive Elicitation

This task uses interactive elicitation to gather cost parameters.

1. **Gather Team Context**
   - Team size (number of developers)
   - Average developer hourly rate (default: $150/hr)
   - Monthly hours spent on UI maintenance (estimate if unknown)
   - Implementation cost estimate

2. **Review Pattern Metrics**
   - Show consolidation metrics (patterns before/after)
   - Confirm reduction percentages
   - Identify highest-impact reductions

3. **Configure Calculation**
   - Ask for conservative vs aggressive estimates
   - Include or exclude training costs
   - Set ROI calculation period (1 year default)

### Steps

1. **Load Consolidation Metrics**
   - Read .state.yaml for pattern reduction data
   - Extract before/after counts for all pattern types
   - Calculate reduction percentages
   - Validation: Consolidation data exists

2. **Calculate Maintenance Cost (Before)**
   - Formula: patterns × hours_per_pattern_monthly × hourly_rate × 12
   - Default: 2 hours/month per pattern for maintenance
   - Include debugging, updates, consistency fixes
   - Validation: Reasonable cost estimate generated

3. **Calculate Maintenance Cost (After)**
   - Same formula with consolidated pattern count
   - Factor in design system overhead (small)
   - Validation: Post-consolidation cost calculated

4. **Calculate Monthly and Annual Savings**
   - Monthly savings = cost_before - cost_after
   - Annual savings = monthly_savings × 12
   - Validation: Positive savings or explain why not

5. **Estimate Implementation Cost**
   - Developer time to create design system
   - Migration effort (from migration strategy)
   - Training time
   - Default: $10,000-15,000 for medium teams
   - Validation: Implementation cost estimated

6. **Calculate ROI Metrics**
   - ROI ratio = annual_savings / implementation_cost
   - Breakeven point = implementation_cost / monthly_savings (in months)
   - 3-year projection = (annual_savings × 3) - implementation_cost
   - Validation: ROI calculations complete

7. **Calculate Velocity Impact**
   - Estimate time saved per feature (fewer component decisions)
   - Project velocity multiplier (3-6x typical)
   - Convert to dollar value (time = money)
   - Validation: Velocity impact quantified

8. **Generate ROI Report**
   - Create roi-analysis.md with executive summary
   - Include detailed calculations with formulas
   - Generate charts (text-based or recommend tools)
   - Show sensitivity analysis (best/worst case)
   - Validation: Comprehensive ROI document created

9. **Create Stakeholder Summary**
   - One-page executive summary
   - Key numbers only (investment, savings, breakeven)
   - Visual comparison (before/after costs)
   - Validation: Stakeholder-ready summary

10. **Update State File**
    - Add ROI section to .state.yaml
    - Record all cost calculations
    - Update phase to "roi_calculated"
    - Validation: State updated with financial data

## Output

- **roi-analysis.md**: Detailed ROI analysis with calculations
- **executive-summary.md**: One-page stakeholder summary
- **cost-breakdown.yaml**: Structured cost data
- **.state.yaml**: Updated with ROI metrics

### Output Format

```yaml
# roi section in .state.yaml
roi:
  calculated_at: "2025-10-27T14:00:00Z"

  before:
    patterns: 176
    monthly_cost: $38,100
    annual_cost: $457,200
    hours_per_month: 352

  after:
    patterns: 32
    monthly_cost: $6,900
    annual_cost: $82,800
    hours_per_month: 64

  savings:
    monthly: $31,200
    annual: $374,400
    hours_saved_monthly: 288

  implementation:
    estimated_cost: $12,000
    developer_weeks: 4

  roi_metrics:
    ratio: 31.2
    breakeven_months: 0.38
    year_1_net: $362,400
    year_3_cumulative: $1,111,200

  velocity_impact:
    multiplier: "4-6x"
    time_savings: "70% reduction in UI decisions"
```

## Success Criteria

- [ ] Realistic cost estimates based on team context
- [ ] Both pre and post-consolidation costs calculated
- [ ] ROI ratio shows positive return (>2x minimum)
- [ ] Breakeven point calculated (typically <1 year)
- [ ] Velocity impact quantified
- [ ] Executive summary is stakeholder-ready
- [ ] All calculations show formulas used

## Error Handling

- **No consolidation data**: Exit with message to run *consolidate first
- **Unrealistic costs**: Warn user, suggest reviewing inputs
- **Negative ROI**: Explain why, suggest higher-impact consolidation
- **Missing team data**: Use industry defaults, flag estimates as rough

## Security Considerations

- Salary data is sensitive - only used for calculations, not logged
- Cost reports stored securely
- No external data transmission
- User can review before sharing with stakeholders

## Examples

### Example 1: ROI Calculation

```bash
*calculate-roi
```

Output:
```
💰 Brad: Calculating ROI from pattern consolidation...

Team Context:
  - Developers: 8
  - Hourly rate: $150/hr
  - Patterns maintained: 176 → 32

📊 COST ANALYSIS:

BEFORE consolidation:
  176 patterns × 2 hrs/month × $150/hr = $52,800/month
  Annual cost: $633,600

AFTER consolidation:
  32 patterns × 2 hrs/month × $150/hr = $9,600/month
  Annual cost: $115,200

💵 SAVINGS:
  Monthly: $43,200
  Annual: $518,400
  3-year total: $1,555,200

🎯 ROI METRICS:
  Implementation cost: $15,000
  ROI ratio: 34.6x
  Breakeven: 0.35 months (10 days!)
  Year 1 net profit: $503,400

⚡ VELOCITY IMPACT:
  Estimated 5x faster feature development
  288 hours/month saved = 1.8 FTE equivalent

✅ Report saved: outputs/design-system/my-app/roi/roi-analysis.md
✅ Executive summary: outputs/design-system/my-app/roi/executive-summary.md

Brad says: Numbers don't lie. Show this to your boss.
```

### Example 2: Executive Summary

```markdown
# Design System ROI - Executive Summary

## Investment
**$15,000** (4 developer-weeks)

## Return
**$518,400/year** savings

## ROI
**34.6x return** on investment

## Breakeven
**10 days**

## Impact
- 81.8% pattern reduction (176 → 32)
- 5x velocity improvement
- 1.8 FTE equivalent time savings

**Recommendation**: Immediate approval. Payback in under 2 weeks.
```

## Notes

- Default 2 hours/month per pattern for maintenance (conservative)
- Includes: debugging, updates, consistency fixes, code reviews
- Velocity multiplier (3-6x) based on industry research
- Implementation cost varies by team size and existing tech debt
- ROI improves over time as system matures
- Brad's estimates are conservative (actual savings often higher)
- Use this report to justify design system to stakeholders
- Recalculate ROI after Phase 2 migration to validate projections
