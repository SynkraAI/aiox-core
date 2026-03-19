# Critical Eye — Generate Cycle Report

> Task ID: ds-critical-eye-report
> Agent: Brad Frost (Design System Architect)
> Version: 1.0.0
> v4.0-compatible: true
> **Execution Type:** `Agent`
> **Dependencies:** depends_on: `[ds-critical-eye-decide]` · enables: `[]` · workflow: `critical-eye`

## Description

Compile a comprehensive cycle report summarizing everything that happened in this Critical Eye evaluation cycle. Includes: summary statistics, all scores by category, transitions executed, proposals pending, category health overview, and recommendations for next cycle.

Uses the `critical-eye-cycle-report-tmpl.md` template for consistent formatting across cycles.

## Output Schema
- **produces:** `outputs/design-system/critical-eye/cycle-{N}/report.md`
- **format:** Markdown — human-readable report following template
- **consumed_by:** design-chief (review), team (visibility)

## Prerequisites

- All previous Critical Eye steps completed (inventory, score, compare, decide)
- Template: `squads/design/templates/critical-eye-cycle-report-tmpl.md`

## Workflow

### Steps

1. **Load All Cycle Data**
   - Read `inventory.json` — variant counts, new variants, orphans
   - Read `scored.json` — all scores by variant
   - Read `rankings.json` — rankings, leaders, comparisons, health
   - Read `decisions.json` — auto-transitions executed
   - Read `proposals.json` — pending checkpoint proposals
   - Read `review-decisions.json` (if exists) — design-chief review results
   - Check: all required files loaded

2. **Calculate Summary Statistics**
   - Total variants evaluated
   - New variants this cycle
   - Transitions executed: count by type (CANDIDATE→EXPERIMENTAL, EXPERIMENTAL→STABLE, REJECT)
   - Proposals pending human review
   - Average score across all variants
   - Highest score / lowest score (non-REJECT)
   - Categories evaluated
   - Categories needing attention (avg < 40)
   - Check: statistics calculated

3. **Build Category Breakdown**
   - For each category:
     - Leader variant + score
     - All variants with scores (table format)
     - Transitions that occurred
     - Health metrics (avg, spread, count)
     - Recommendation (e.g., "needs more sources", "ready for canonical review", "healthy")
   - Check: all categories represented

4. **Build Transition Summary**
   - Table of all transitions executed:
     | Variant | From | To | Score | Reason |
   - Separate section for proposals awaiting review:
     | Variant | Proposed | Score | Requires |
   - Check: all transitions and proposals listed

5. **Generate Recommendations**
   - **Immediate actions:** Variants close to thresholds (e.g., score 78 — almost CANONICAL)
   - **Source gaps:** Variants with breadth = 0 (snowflake) — recommend finding additional sources
   - **Quality gaps:** Variants with low quality sub-scores — recommend specific improvements
   - **A11y concerns:** Variants with low (but non-zero) accessibility — recommend remediation
   - **Next cycle focus:** Categories with most room for improvement
   - Check: at least 1 recommendation generated

6. **Render Report Using Template**
   - Load `critical-eye-cycle-report-tmpl.md`
   - Fill in all sections with computed data
   - Include timestamp, cycle number, scoring rules version
   - Check: template sections all populated

7. **Save Report**
   - Write to `outputs/design-system/critical-eye/cycle-{N}/report.md`
   - Check: file saved successfully

## Failure Handling

- **Missing cycle data:** Generate partial report with available data, note gaps
- **Template not found:** Use inline format (degrade gracefully)
- **No transitions this cycle:** Note "No lifecycle changes this cycle" — not an error

## Success Criteria

- [ ] Report includes summary statistics
- [ ] All categories covered with scores and rankings
- [ ] Transition summary complete (executed + proposals)
- [ ] Recommendations generated for next cycle
- [ ] Template format followed
- [ ] Report saved to correct cycle output directory

## Related Checklists

- `squads/design/checklists/ds-critical-eye-review-checklist.md`
