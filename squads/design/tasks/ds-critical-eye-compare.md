# Critical Eye — Compare and Rank Variants Within Category

> Task ID: ds-critical-eye-compare
> Agent: Brad Frost (Design System Architect)
> Version: 1.0.0
> v4.0-compatible: true
> **Execution Type:** `Agent`
> **Dependencies:** depends_on: `[ds-critical-eye-score]` · enables: `[ds-critical-eye-decide]` · workflow: `critical-eye`

## Description

Within each category, rank all scored variants from highest to lowest total score. Apply the tiebreaker rule: when two variants are within a 10% margin, the one with higher breadth wins (network effect favors broader adoption — Nathan Curtis). Identify the top candidate per category for potential CANONICAL promotion.

## Output Schema
- **produces:** `outputs/design-system/critical-eye/cycle-{N}/rankings.json`
- **format:** JSON — ranked variants per category with comparison matrix
- **consumed_by:** ds-critical-eye-decide

## Prerequisites

- Scored variants output from `ds-critical-eye-score` available
- `critical-eye-scoring-rules.yaml` loaded (for tiebreaker config)

## Workflow

### Steps

1. **Load Scored Variants**
   - Read `scored.json` from previous step
   - Group variants by category (should already be grouped from inventory)
   - Exclude any variants with lifecycle = `REJECT` (a11y blocker)
   - Check: scored variants loaded, REJECT variants excluded from ranking

2. **Sort Within Each Category**
   - For each category:
     - Sort variants by `scores.total` descending
     - Record rank position (1 = highest)
   - Check: all categories sorted

3. **Apply Tiebreaker Rule**
   - For each pair of adjacent-ranked variants in a category:
     - Calculate margin: `abs(score_a - score_b) / max(score_a, score_b) * 100`
     - If margin <= 10%:
       - Compare `scores.breadth`
       - Higher breadth wins the higher rank
       - Log: "Tiebreaker applied: {winner} (breadth={N}) beats {loser} (breadth={N}) within {margin}% margin"
   - Authority: Nathan Curtis — network effect favors broader adoption
   - Check: all ties resolved, tiebreaker applications logged

4. **Identify Category Leaders**
   - For each category:
     - The rank-1 variant is the "category leader"
     - If leader's `total_score >= 80` AND it's the highest in category → eligible for CANONICAL
     - If leader's `total_score >= 60` → eligible for STABLE
     - If leader's `total_score >= 40` → eligible for EXPERIMENTAL
   - Check: category leaders identified with eligibility flags

5. **Build Comparison Matrix**
   - For each category with 2+ variants:
     - Create head-to-head comparison showing which variant wins in each dimension
     - Structure:
       ```json
       {
         "category": "base",
         "component": "button",
         "variants": ["button-shared-v1", "button-clickmax-v2"],
         "dimension_winners": {
           "breadth": "button-shared-v1",
           "quality": "button-clickmax-v2",
           "consistency": "button-shared-v1",
           "maturity": "button-shared-v1",
           "simplicity": "button-clickmax-v2"
         },
         "overall_winner": "button-shared-v1",
         "margin": "12%"
       }
       ```
   - For categories with 1 variant: mark as "uncontested"
   - Check: comparison matrix built for all multi-variant categories

6. **Calculate Category Health**
   - For each category:
     - `avg_score`: average total score of all variants
     - `max_score`: highest score
     - `min_score`: lowest score
     - `spread`: max - min
     - `variant_count`: total variants
     - `has_canonical`: boolean (any variant currently CANONICAL?)
   - Categories with `avg_score < 40` flagged as "needs attention"
   - Check: health metrics calculated for all categories

7. **Generate Rankings Output**
   - Create `rankings.json`:
     ```json
     {
       "cycle": N,
       "timestamp": "ISO-8601",
       "categories": {
         "base": {
           "rankings": [...sorted variants with rank...],
           "leader": { "id": "...", "score": N, "eligibility": "..." },
           "comparisons": [...comparison matrices...],
           "health": { "avg": N, "max": N, "min": N, "spread": N, "count": N }
         },
         ...
       },
       "tiebreakers_applied": [...],
       "categories_needing_attention": [...]
     }
     ```
   - Check: output valid JSON, all categories represented

## Failure Handling

- **Scored variants not found:** Abort with "Run ds-critical-eye-score first."
- **Empty category:** Warn but continue (category present with 0 variants)
- **All variants REJECTED in category:** Flag category as "blocked — all variants failed a11y"

## Success Criteria

- [ ] All variants ranked within their category
- [ ] Tiebreaker rule applied where scores within 10%
- [ ] Category leaders identified with eligibility flags
- [ ] Comparison matrix built for multi-variant categories
- [ ] Category health metrics calculated
- [ ] Rankings JSON output complete and valid

## Related Checklists

- `squads/design/checklists/ds-critical-eye-review-checklist.md`
