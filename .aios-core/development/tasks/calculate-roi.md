# Calculate ROI and Cost Savings

> Task ID: brad-calculate-roi
> Agent: Brad (Design System Architect)
> Version: 2.0.0

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

## Task Definition (AIOS Task Format V1.0)

```yaml
task: calculateRoi()
responsavel: Brad (Design System Architect)
responsavel_type: Agente
atomic_layer: Strategy

**Entrada:**
- campo: audit_data
  tipo: object
  origem: File (pattern-inventory.json)
  obrigatorio: true
  validacao: Valid JSON with pattern counts and redundancy factors

- campo: consolidation_data
  tipo: object
  origem: File (consolidation-report.md / .state.yaml)
  obrigatorio: false
  validacao: Before/after pattern counts. Optional but enriches accuracy

- campo: hourly_rate
  tipo: number
  origem: User Input
  obrigatorio: false
  validacao: Default $150/hr. Must be positive number

- campo: team_size
  tipo: number
  origem: User Input
  obrigatorio: false
  validacao: Default 3. Number of developers maintaining UI

- campo: hours_per_pattern
  tipo: number
  origem: User Input
  obrigatorio: false
  validacao: Default 2 hours/month per pattern for maintenance

**Saida:**
- campo: roi_report
  tipo: object
  destino: File (roi-analysis.md)
  persistido: true

- campo: executive_summary
  tipo: string
  destino: File (executive-summary.md)
  persistido: true

- campo: cost_breakdown
  tipo: object
  destino: File (cost-breakdown.yaml)
  persistido: true
```

---

## Pre-Conditions

**Purpose:** Validate prerequisites BEFORE task execution (blocking)

**Checklist:**

```yaml
pre-conditions:
  - [ ] Audit data (pattern-inventory.json) or consolidation data exists
    tipo: pre-condition
    blocker: true
    validacao: |
      Check pattern-inventory.json exists with pattern counts, or .state.yaml has consolidation metrics
    error_message: "Pre-condition failed: Run *audit first to generate pattern data for ROI calculation"

  - [ ] At least one pattern category has measurable redundancy
    tipo: pre-condition
    blocker: false
    validacao: |
      Check at least one category has redundancy factor > 1. Warn if all are 1 (no waste to calculate)
    error_message: "Warning: No measurable redundancy found. ROI will show zero savings"
```

---

## Post-Conditions

**Purpose:** Validate execution success AFTER task completes

**Checklist:**

```yaml
post-conditions:
  - [ ] ROI report generated with all five metric categories
    tipo: post-condition
    blocker: true
    validacao: |
      Verify roi-analysis.md exists and contains: component reduction, bundle impact, hardcoded elimination, time savings, maintenance reduction
    error_message: "Post-condition failed: ROI report missing one or more required metric categories"

  - [ ] Executive summary generated with key financial metrics
    tipo: post-condition
    blocker: true
    validacao: |
      Verify executive-summary.md exists with investment cost, annual savings, breakeven period, and ROI ratio
    error_message: "Post-condition failed: Executive summary incomplete"

  - [ ] All calculated values are valid positive numbers (no NaN)
    tipo: post-condition
    blocker: true
    validacao: |
      Parse all numeric outputs and verify they are finite, non-negative numbers
    error_message: "Post-condition failed: ROI report contains invalid numeric values"
```

---

## Acceptance Criteria

**Purpose:** Definitive pass/fail criteria for task completion

**Checklist:**

```yaml
acceptance-criteria:
  - [ ] Component count before/after documented with reduction percentage
    tipo: acceptance-criterion
    blocker: true
    validacao: |
      Assert components_before, components_after, and reduction_percentage fields exist and are valid
    error_message: "Acceptance criterion not met: Component count reduction not documented"

  - [ ] Developer time savings calculated in hours AND dollar value
    tipo: acceptance-criterion
    blocker: true
    validacao: |
      Assert hours_saved_annually and dollar_savings_annually fields exist as positive numbers
    error_message: "Acceptance criterion not met: Time savings not calculated"

  - [ ] Breakeven period calculated in months
    tipo: acceptance-criterion
    blocker: true
    validacao: |
      Assert breakeven_months field exists as a positive number
    error_message: "Acceptance criterion not met: Breakeven period not calculated"

  - [ ] Calculation methodology and assumptions documented
    tipo: acceptance-criterion
    blocker: true
    validacao: |
      Assert report includes formulas used and assumptions made (hourly rate, hours per pattern, etc.)
    error_message: "Acceptance criterion not met: Methodology not documented"
```

---

## Tools

**External/shared resources used by this task:**

- **Tool:** file-system
  - **Purpose:** Read audit/consolidation data, write ROI reports
  - **Source:** Node.js fs module

- **Tool:** code-analyzer
  - **Purpose:** Measure bundle size impact (optional, for precise measurements)
  - **Source:** .aios-core/utils/code-analyzer.js

---

## Scripts

**Agent-specific code for this task:**

- **Script:** calculate-roi.js
  - **Purpose:** Cost calculation, ROI projection, and report generation
  - **Language:** JavaScript
  - **Location:** .aios-core/scripts/calculate-roi.js

---

## Error Handling

**Strategy:** fallback

**Common Errors:**

1. **Error:** Missing Audit Data
   - **Cause:** *audit was not run or data was deleted
   - **Resolution:** Run *audit first to generate pattern-inventory.json
   - **Recovery:** Exit with instruction to run audit

2. **Error:** Bundle Size Measurement Failed
   - **Cause:** Build tools not configured or project does not build
   - **Resolution:** Use heuristic estimate (0.5KB per duplicate pattern)
   - **Recovery:** Continue with estimated values, flag as approximate

3. **Error:** Division by Zero
   - **Cause:** patterns_before is 0 (pristine codebase) or monthly_savings is 0
   - **Resolution:** Default reduction to 0%, breakeven to N/A
   - **Recovery:** Report clean state with no ROI opportunity

4. **Error:** Unrealistic Cost Estimates
   - **Cause:** Input parameters produce implausible results
   - **Resolution:** Validate against reasonable bounds, warn user
   - **Recovery:** Use industry defaults with warning logged

---

## Performance

**Expected Metrics:**

```yaml
duration_expected: 5-20 min (estimated)
cost_estimated: $0.003-0.015
token_usage: ~2,000-8,000 tokens
```

**Optimization Notes:**
- Pure calculation from existing data; no filesystem scanning needed; fast execution

---

## Metadata

```yaml
story: N/A
version: 2.0.0
dependencies:
  - audit-codebase
tags:
  - design-system
  - roi
  - cost-analysis
  - stakeholder-communication
updated_at: 2026-04-10
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
   - Formula: patterns x hours_per_pattern_monthly x hourly_rate x 12
   - Default: 2 hours/month per pattern for maintenance
   - Include debugging, updates, consistency fixes
   - Validation: Reasonable cost estimate generated

3. **Calculate Maintenance Cost (After)**
   - Same formula with consolidated pattern count
   - Factor in design system overhead (small)
   - Validation: Post-consolidation cost calculated

4. **Calculate Monthly and Annual Savings**
   - Monthly savings = cost_before - cost_after
   - Annual savings = monthly_savings x 12
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
   - 3-year projection = (annual_savings x 3) - implementation_cost
   - Validation: ROI calculations complete

7. **Calculate Velocity Impact**
   - Estimate time saved per feature (fewer component decisions)
   - Project velocity multiplier (3-6x typical)
   - Convert to dollar value (time = money)
   - Validation: Velocity impact quantified

8. **Count Hardcoded Values Eliminated**
   - Count hardcoded color hex values from audit
   - Count hardcoded spacing values (px without variable)
   - Count hardcoded font declarations
   - Sum total to be replaced by tokens
   - Validation: Elimination count is non-negative

9. **Estimate Bundle Size Impact**
   - If build tools available: measure actual bundle difference
   - If not: estimate 0.5KB per duplicate CSS pattern, 1KB per duplicate component
   - Calculate total duplicate KB and percentage of bundle
   - Validation: Size values are positive numbers

10. **Generate ROI Report**
    - Create roi-analysis.md with executive summary
    - Include detailed calculations with formulas
    - Show sensitivity analysis (best/worst case)
    - Validation: Comprehensive ROI document created

11. **Create Stakeholder Summary**
    - One-page executive summary
    - Key numbers only (investment, savings, breakeven)
    - Visual comparison (before/after costs)
    - Validation: Stakeholder-ready summary

12. **Update State File**
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
- [ ] Hardcoded values elimination counted by category
- [ ] Bundle size impact estimated
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
Brad: Calculating ROI from pattern consolidation...

Team Context:
  - Developers: 8
  - Hourly rate: $150/hr
  - Patterns maintained: 176 -> 32

COST ANALYSIS:

BEFORE consolidation:
  176 patterns x 2 hrs/month x $150/hr = $52,800/month
  Annual cost: $633,600

AFTER consolidation:
  32 patterns x 2 hrs/month x $150/hr = $9,600/month
  Annual cost: $115,200

SAVINGS:
  Monthly: $43,200
  Annual: $518,400
  3-year total: $1,555,200

ROI METRICS:
  Implementation cost: $15,000
  ROI ratio: 34.6x
  Breakeven: 0.35 months (10 days!)
  Year 1 net profit: $503,400

VELOCITY IMPACT:
  Estimated 5x faster feature development
  288 hours/month saved = 1.8 FTE equivalent

Report saved: outputs/design-system/my-app/roi/roi-analysis.md
Executive summary: outputs/design-system/my-app/roi/executive-summary.md

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
- 81.8% pattern reduction (176 -> 32)
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
