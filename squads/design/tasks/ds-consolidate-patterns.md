# Consolidate Patterns Using Intelligent Clustering

> Task ID: brad-consolidate-patterns
> Agent: Brad (Design System Architect)
> Version: 1.1.0
> v4.0-compatible: true
> **Execution Type:** `Agent`
> **Dependencies:** depends_on: `[ds-audit-codebase]` · enables: `[ds-extract-tokens]` · workflow: `brownfield-audit`
> **On Fail:** If reduction <50% → review clustering thresholds (default 5% HSL may be too strict). If pattern-inventory.json missing/corrupt → re-run `*audit`. If consolidation produces 0 clusters → input data likely empty, return to audit phase. Do NOT proceed to tokenize with unconsolidated patterns.

## Description

Reduce UI pattern redundancy by clustering similar patterns using intelligent algorithms (HSL color clustering at 5% threshold, semantic button grouping). Target: >80% reduction. **v4.0: Reference data/ds-reference-architectures.md for cross-system consolidation patterns (Material 3, Fluent 2, Carbon, Spectrum).**

## Input Schema
- **requires:** Output from `ds-audit-codebase`
- **format:** JSON data
- **location:** `outputs/design-system/{project}/audit/pattern-inventory.json`

## Output Schema
- **produces:** `outputs/design-system/{project}/consolidation/`
- **format:** Text data (color-clusters.txt, spacing-consolidation.txt, button-consolidation.txt)
- **consumed_by:** ds-extract-tokens

## Prerequisites

- Audit completed (*audit command run successfully)
- .state.yaml exists with inventory results
- pattern-inventory.json available

## Workflow

### Interactive Elicitation

This task uses interactive elicitation to review consolidation decisions.

1. **Load Audit Results**
   - Read pattern-inventory.json for full data, .state.yaml for metadata
   - Display current redundancy metrics
   - Confirm user wants to proceed with consolidation

2. **Review Clustering Parameters**
   - HSL threshold for colors (default: 5%)
   - Ask if user has manual overrides (patterns that shouldn't merge)
   - Confirm output directory

3. **Present Consolidation Recommendations**
   - Show before/after for each pattern type
   - Ask for approval or adjustments
   - Allow manual overrides before finalizing

### Steps

1. **Load Audit Data**
   - Read pattern-inventory.json for full inventory data
   - Read .state.yaml for scan metadata (path, timestamp)
   - If pattern-inventory.json not found, check .state.yaml for inventory_file path
   - Validate audit phase completed
   - Extract pattern counts and scan path
   - Check: pattern-inventory.json OR .state.yaml contains inventory data with pattern count > 0 — abort with "No audit data found: run *audit first"

2. **Cluster Colors by HSL Similarity**
   - Extract all unique colors from codebase
   - Convert hex to HSL color space
   - Group colors within 5% HSL threshold
   - Select most-used color in each cluster as primary
   - Identify semantic relationships (primary-dark as hover state)
   - Check: cluster count > 0 AND each cluster has primary color + usage count — log "{N} color clusters from {total} unique colors"

3. **Cluster Button Patterns by Semantic Purpose**
   - Extract button class names and patterns
   - Analyze naming for semantic meaning (primary, secondary, danger, etc)
   - Group functionally equivalent buttons
   - Recommend minimal variant set (primary, secondary, destructive)
   - Check: button variant count <= 5 AND each variant has semantic name + mapped classes — log "{before} button patterns consolidated to {after} variants"

4. **Consolidate Spacing Values**
   - Extract all padding and margin values
   - Identify base unit (4px or 8px)
   - Propose spacing scale (xs, sm, md, lg, xl, 2xl, 3xl)
   - Map existing values to scale
   - Check: spacing scale has base unit (4px or 8px) AND scale count between 5-10 values — log "Spacing: {before} values consolidated to {after}-step scale (base: {unit})"

5. **Consolidate Typography**
   - Extract font sizes, weights, families
   - Propose type scale (modular scale or fixed intervals)
   - Consolidate similar weights (merge 500 and 600 if both exist)
   - Recommend minimal font family set
   - Check: type scale has sizes + weights + families defined AND count < original — log "Typography: {before} values consolidated to {after} tokens"

6. **Generate Consolidation Report**
   - Create consolidation-report.md with before/after metrics
   - Include reduction percentages for each pattern type
   - Generate detailed cluster files (color-clusters.txt, button-consolidation.txt)
   - Calculate overall reduction percentage
   - Check: overall reduction >= 80% OR report contains explicit justification for lower reduction — log "Overall reduction: {pct}% ({before} -> {after} patterns)"

7. **Create Pattern Mapping**
   - Generate old-to-new mapping for each pattern type
   - Document which old patterns map to which new tokens
   - Create migration guide snippets
   - Check: mapping entries cover all consolidated pattern types (colors, buttons, spacing, typography) — abort with "Incomplete mapping: {type} missing"

8. **Update State File**
   - Add consolidation section to .state.yaml
   - Record before/after counts for all pattern types
   - Update phase to "consolidation_complete"
   - Log Brad's consolidation decisions
   - Check: .state.yaml contains `phase: "consolidation_complete"` AND before/after counts for all pattern types — abort with "State update failed: {missing field}"

## Output

- **consolidation-report.md**: Executive summary with reduction metrics
- **color-clusters.txt**: Detailed color groupings with usage counts
- **button-consolidation.txt**: Button semantic analysis and recommendations
- **spacing-consolidation.txt**: Spacing scale proposal
- **typography-consolidation.txt**: Typography scale proposal
- **pattern-mapping.json**: Old pattern → new token mappings
- **.state.yaml**: Updated with consolidation decisions

### Output Format

```yaml
# .state.yaml consolidation section
consolidation:
  completed_at: "2025-10-27T12:30:00Z"
  patterns_consolidated:
    colors:
      before: 89
      after: 12
      reduction: "86.5%"
      clusters: 8
    buttons:
      before: 47
      after: 3
      reduction: "93.6%"
      variants: ["primary", "secondary", "destructive"]
    spacing:
      before: 19
      after: 7
      reduction: "63.2%"
      scale: ["xs", "sm", "md", "lg", "xl", "2xl", "3xl"]
    typography:
      before: 21
      after: 10
      reduction: "52.4%"
  overall_reduction: "81.8%"
  target_met: true
```

## Failure Handling

- **Pattern reduction <60%:** Review clustering thresholds — HSL tolerance may be too tight. Widen from 10% to 15% and re-run
- **Inventory file not found:** Check .state.yaml for inventory_file path. Re-run *audit if missing
- **Conflicting patterns detected:** Present conflicts to user for manual resolution before proceeding
- **Consolidation takes >10 min:** Split by pattern type (colors first, then spacing, then components)

## Success Criteria

- [ ] >80% overall pattern reduction achieved
- [ ] Color clustering uses HSL similarity (not just hex distance)
- [ ] Button variants identified by semantic purpose
- [ ] Spacing scale based on consistent base unit
- [ ] Most-used patterns preserved as primary tokens
- [ ] All consolidation decisions documented with rationale
- [ ] User can review and override before finalizing

## Quality Gate

> **GATE: Consolidation Review** — Human checkpoint before proceeding to tokenization

| Metric | Threshold | Action if FAIL |
|--------|-----------|----------------|
| Pattern reduction | >= 60% | Widen HSL clustering tolerance from 10% to 15%, re-run consolidation |
| Color clusters | <= 20 unique groups | Merge near-duplicates manually, re-cluster with looser threshold |
| Spacing scale | Based on consistent base unit | If no base unit detected, propose 4px/8px grid and re-align |
| User approval | Required | Present consolidation summary, get explicit "proceed" before tokenization |

**Rework rule:** If reduction < 40% after 2 iterations, escalate to user — codebase may have genuinely diverse patterns that shouldn't be consolidated.

## Error Handling

- **No audit data found**: Exit with message to run *audit first
- **Insufficient patterns to consolidate**: Report that codebase is already clean
- **Cannot achieve 80% reduction**: Explain why and show actual reduction achieved
- **Invalid state file**: Attempt to recover from backup or prompt re-audit

## Security Considerations

- Read-only analysis of patterns (no code modification)
- Validate user overrides to prevent injection
- Handle malformed color values safely
- Backup state file before overwriting

## Examples

### Example 1: Successful Consolidation

```bash
*consolidate
```

Output:
```
🎨 CONSOLIDATING COLORS...
Found 89 unique colors
Clustering with 5% HSL threshold...

CLUSTER 1 - Primary Blues (4 → 1):
  #0066CC (234 uses) <- KEEP
  #0065CB, #0067CD, #0064CA (merge)

CLUSTER 2 - Error Reds (3 → 1):
  #DC2626 (89 uses) <- KEEP
  #DB2525, #DD2727 (merge)

📊 CONSOLIDATION SUMMARY:
| Pattern    | Before | After | Reduction |
|------------|--------|-------|-----------|
| Colors     | 89     | 12    | 86.5%     |
| Buttons    | 47     | 3     | 93.6%     |
| Spacing    | 19     | 7     | 63.2%     |
| Typography | 21     | 10    | 52.4%     |
| TOTAL      | 176    | 32    | 81.8%     |

✅ TARGET MET: >80% reduction achieved
✅ Report saved: outputs/design-system/my-app/consolidation/consolidation-report.md
```

### Example 2: User Override

```bash
*consolidate

Brad: "Merge #0066CC and #0052A3?"
User: "No, #0052A3 is intentional hover state"
Brad: "Override recorded. Keeping both."
```

## Notes

- HSL color space provides perceptual similarity (better than RGB/hex distance)
- Most-used pattern in each cluster becomes the canonical token
- Semantic button analysis looks for keywords: primary, main, secondary, default, danger, delete, destructive
- Spacing scale should use consistent base unit (4px or 8px)
- Manual overrides are respected and documented
- Run this after every audit to prevent pattern regression
- Brad says: "Numbers don't lie. 82% reduction = real savings."
## Related Checklists

- `squads/design/checklists/ds-component-quality-checklist.md`
- `squads/design/checklists/ds-pattern-audit-checklist.md`

