# Critical Eye — Score Variants Using 5 Dimensions

> Task ID: ds-critical-eye-score
> Agent: Brad Frost (Design System Architect)
> Version: 1.0.0
> v4.0-compatible: true
> **Execution Type:** `Agent`
> **Dependencies:** depends_on: `[ds-critical-eye-inventory]` · enables: `[ds-critical-eye-compare]` · workflow: `critical-eye`

## Description

Apply the Critical Eye scoring engine to every variant in the inventory. The engine evaluates 5 dimensions totaling 100 points: Breadth (25), Quality (30), Consistency (20), Maturity (15), Simplicity (10). Includes the absolute blocker: accessibility score = 0 triggers automatic REJECT regardless of total.

Authority: Nathan Curtis/EightShapes, GOV.UK Contribution Criteria, USWDS Lifecycle, Brad Frost — Death to Complexity.

## Output Schema
- **produces:** `outputs/design-system/critical-eye/cycle-{N}/scored.json`
- **format:** JSON — each variant with detailed per-dimension scores
- **consumed_by:** ds-critical-eye-compare

## Prerequisites

- Inventory output from `ds-critical-eye-inventory` available
- `squads/design/data/critical-eye-scoring-rules.yaml` loaded
- Component source files accessible for quality evaluation
- Component metadata JSONs accessible for enrichment

## Workflow

### Steps

1. **Load Inputs**
   - Read inventory JSON from previous step
   - Read `critical-eye-scoring-rules.yaml` — full scoring configuration
   - Check: both files valid and compatible (same cycle number)

2. **Score Breadth (25 pts) — Nathan Curtis Breadth Scale**
   - For each variant:
     - Count `variant.sources.length`
     - Apply rule: 1 source = 0pts (snowflake), 2 = 10pts (discuss), 3 = 15pts (probable), 4 = 20pts (strong), 5+ = 25pts (confirmed)
   - Check: breadth score assigned to every variant

3. **Score Quality (30 pts) — EightShapes Component QA**
   - For each variant, evaluate 6 sub-dimensions:
     - **token_compliance** (5pts): Count hardcoded values in source files (`#hex`, `Npx` except 0px). 0 hardcoded = 5pts, <5 = 3pts, 5-10 = 1pt, >10 = 0pts
     - **states_coverage** (5pts): Count states implemented vs reference [default, hover, focus, disabled, error, loading]. Prorated: (implemented / 6) * 5
     - **accessibility** (5pts, BLOCKER): Check WCAG AA contrast, ARIA attributes, keyboard nav, focus-visible. Score 0 = AUTOMATIC REJECT
     - **responsiveness** (5pts): Check breakpoints coverage (mobile/tablet/desktop). All 3 = 5pts, 2 = 3pts, 1 = 1pt, fixed = 0pts
     - **composability** (5pts): Evaluate how well it composes with other catalog variants. 3+ canonicals = 5pts, 1-2 = 3pts, requires adaptation = 1pt, incompatible = 0pts
     - **resilience** (5pts): Test edge cases [empty content, long text, overflow, missing image, RTL]. All = 5pts, 3+ = 3pts, 1-2 = 1pt, none = 0pts
   - Sum sub-dimensions for quality total
   - Check: quality.accessibility evaluated — if 0, immediately flag variant for REJECT

4. **Score Consistency (20 pts) — GOV.UK Contribution Criteria**
   - For each variant, evaluate 3 sub-dimensions:
     - **naming** (5pts): Check naming conventions (kebab-case, semantic prefixes). 100% = 5pts, minor desvios = 3pts, inconsistent = 0pts
     - **api_patterns** (5pts): Check CVA + variant pattern + slot pattern usage. Full = 5pts, partial = 3pts, different API = 0pts
     - **visual_harmony** (10pts): Evaluate visual coherence with DS. Indistinguishable = 10pts, small differences = 7pts, recognizably different = 4pts, conflicts = 0pts
   - Check: consistency total calculated for all variants

5. **Score Maturity (15 pts) — USWDS Component Lifecycle**
   - For each variant, evaluate 3 sub-dimensions:
     - **stability** (5pts): Check lifecycleHistory for breaking changes. No changes in 3+ cycles = 5pts, minor in last = 3pts, major recent = 1pt, new = 0pts
     - **documentation** (5pts): Check for guidelines + API + examples + do/dont. Full = 5pts, partial = 3pts, JSDoc only = 1pt, none = 0pts
     - **tests** (5pts): Check for unit + visual regression + a11y tests. All = 5pts, unit only = 3pts, smoke = 1pt, none = 0pts
   - Check: maturity total calculated

6. **Score Simplicity (10 pts) — Brad Frost Death to Complexity**
   - For each variant, evaluate 2 sub-dimensions:
     - **complexity** (5pts): Count LOC of main component file. <50 = 5pts, 50-150 = 3pts, 150-300 = 1pt, >300 = 0pts
     - **dependencies** (5pts): Count external deps (excluding React + CVA). 0 = 5pts, 1-2 = 3pts, 3-5 = 1pt, 6+ = 0pts
   - Check: simplicity total calculated

7. **Calculate Total Score**
   - Sum all 5 dimension totals: breadth + quality + consistency + maturity + simplicity
   - Maximum possible: 25 + 30 + 20 + 15 + 10 = 100
   - Check: total is between 0 and 100 for all variants

8. **Apply Accessibility Blocker**
   - For any variant where `quality.accessibility == 0`:
     - Override lifecycle to `REJECT`
     - Flag with `blocker: "accessibility_zero"`
     - Log: "Variant {id} REJECTED — accessibility score 0 is absolute blocker"
   - Check: all a11y-zero variants flagged

9. **Generate Scored Output**
   - Create `scored.json` with each variant's complete score breakdown
   - Include dimension totals, sub-dimension details, and any blocker flags
   - Check: output valid JSON, all variants scored

## Failure Handling

- **Inventory not found:** Abort with "Run ds-critical-eye-inventory first."
- **Source files missing:** Score quality dimensions as 0 with note "source files not found"
- **Scoring rules invalid:** Abort with YAML parsing error details

## Success Criteria

- [ ] All 5 dimensions scored for every variant
- [ ] Breadth based on actual source counts
- [ ] Quality evaluated against real component source code
- [ ] Accessibility blocker applied (score=0 → REJECT)
- [ ] Total scores between 0-100
- [ ] Scored JSON output complete and valid
- [ ] No dimension left as null after evaluation

## Related Checklists

- `squads/design/checklists/ds-critical-eye-review-checklist.md`
