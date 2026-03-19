# Calculate ROI and Cost Savings

> Task ID: brad-calculate-roi
> Agent: Brad (Design System Architect)
> Version: 1.1.0
> v4.0-compatible: true
> **Execution Type:** `Agent`
> **Dependencies:** depends_on: `[ds-generate-migration-strategy]` · enables: `[ds-generate-shock-report]` · workflow: `brownfield-audit`

## Description

Calculate real cost savings from pattern consolidation with hard numbers. Estimates monthly/annual maintenance costs before and after, projects ROI timeline, shows when investment breaks even.

## Input Schema
- **requires:** Output from `ds-generate-migration-strategy`
- **format:** Markdown report
- **location:** `outputs/design-system/{project}/migration/migration-strategy.md`

## Output Schema
- **produces:** `outputs/design-system/{project}/roi/roi-analysis.md`
- **format:** Markdown report
- **consumed_by:** ds-generate-shock-report

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
   - Check: .state.yaml contains consolidation section with before/after pattern counts — abort with "No consolidation data: run *consolidate first"

2. **Calculate Maintenance Cost (Before)**
   - Formula: patterns × hours_per_pattern_monthly × hourly_rate × 12
   - Default: 2 hours/month per pattern for maintenance
   - Include debugging, updates, consistency fixes
   - Check: monthly cost > 0 AND cost = patterns * hours_per_pattern * hourly_rate — log "Before: {patterns} patterns, ${cost}/month"

3. **Calculate Maintenance Cost (After)**
   - Same formula with consolidated pattern count
   - Factor in design system overhead (small)
   - Check: after_cost < before_cost — log "After: {patterns} patterns, ${cost}/month"

4. **Calculate Monthly and Annual Savings**
   - Monthly savings = cost_before - cost_after
   - Annual savings = monthly_savings × 12
   - Check: monthly_savings > 0 OR report contains justification for negative/zero savings — log "Savings: ${monthly}/month, ${annual}/year"

5. **Estimate Implementation Cost**
   - Developer time to create design system
   - Migration effort (from migration strategy)
   - Training time
   - Default: $10,000-15,000 for medium teams
   - Check: implementation cost > 0 AND includes developer time + migration + training — log "Implementation cost: ${cost} ({weeks} developer-weeks)"

6. **Calculate ROI Metrics**
   - ROI ratio = annual_savings / implementation_cost
   - Breakeven point = implementation_cost / monthly_savings (in months)
   - 3-year projection = (annual_savings × 3) - implementation_cost
   - Check: ROI ratio calculated AND breakeven months > 0 AND 3-year projection generated — log "ROI: {ratio}x, breakeven: {months} months"

7. **Calculate Velocity Impact**
   - Estimate time saved per feature (fewer component decisions)
   - Project velocity multiplier (3-6x typical)
   - Convert to dollar value (time = money)
   - Check: velocity multiplier calculated AND time savings expressed in hours/month — log "Velocity: {multiplier}x, {hours} hours/month saved"

8. **Generate ROI Report**
   - Create roi-analysis.md with executive summary
   - Include detailed calculations with formulas
   - Generate charts (text-based or recommend tools)
   - Show sensitivity analysis (best/worst case)
   - Check: `test -f roi-analysis.md` AND file contains executive summary + formulas + sensitivity analysis — abort with "ROI report generation failed"

9. **Create Stakeholder Summary**
   - One-page executive summary
   - Key numbers only (investment, savings, breakeven)
   - Visual comparison (before/after costs)
   - Check: `test -f executive-summary.md` AND contains investment + savings + breakeven figures — abort with "Executive summary generation failed"

10. **Update State File**
    - Add ROI section to .state.yaml
    - Record all cost calculations
    - Update phase to "roi_calculated"
    - Check: .state.yaml contains `phase: "roi_calculated"` AND roi section with all cost fields — abort with "State update failed: {missing field}"

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

## Failure Handling

- **No consolidation data available:** If .state.yaml missing consolidation section or before/after pattern counts, abort with "No consolidation data: run *consolidate first to generate pattern reduction metrics."
- **Negative or zero monthly savings:** If calculated monthly savings <=0, abort with "ROI calculation shows negative savings: ${value}/month. Review pattern consolidation strategy or maintenance cost assumptions."
- **Unrealistic cost inputs:** If hourly rate >$500/hr or <$50/hr, warn user "Hourly rate ${rate}/hr seems {high|low}. Industry average: $100-200/hr. Confirm before proceeding to avoid stakeholder skepticism."
- **Implementation cost exceeds annual savings:** If implementation_cost > annual_savings AND ROI ratio <1.0, warn user "ROI ratio {ratio}x is negative. Consider phased rollout or reassess consolidation scope to improve business case."

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


## Related Checklists

- `squads/design/checklists/ds-component-quality-checklist.md`
- `squads/design/checklists/ds-pattern-audit-checklist.md`

## Process Guards
- **On Fail:** Stop execution, capture evidence, and return remediation steps before proceeding.
