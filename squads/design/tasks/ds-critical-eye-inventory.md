# Critical Eye — Inventory Variants Per Category

> Task ID: ds-critical-eye-inventory
> Agent: Brad Frost (Design System Architect)
> Version: 1.0.0
> v4.0-compatible: true
> **Execution Type:** `Agent`
> **Dependencies:** depends_on: `[]` · enables: `[ds-critical-eye-score]` · workflow: `critical-eye`

## Description

Scan `pattern-catalog.json` and group all variants by category. Detect new variants added since the last cycle (from latest Figma extraction or manual registration). Cross-reference with `registry.json`, component metadata, and brand files to ensure completeness.

This is Step 1 of the Critical Eye workflow — the foundation that all subsequent scoring depends on.

## Output Schema
- **produces:** `outputs/design-system/critical-eye/cycle-{N}/inventory.json`
- **format:** JSON — variants grouped by category with source cross-references
- **consumed_by:** ds-critical-eye-score

## Prerequisites

- `workspace/ui/pattern-catalog.json` exists and contains at least 1 variant
- `squads/design/data/critical-eye-scoring-rules.yaml` loaded (for category definitions)
- `workspace/ui/registry.json` accessible (for cross-reference)
- `workspace/domains/design-system/metadata/components.json` accessible

## Workflow

### Steps

1. **Load Catalog and Rules**
   - Read `pattern-catalog.json`
   - Read `critical-eye-scoring-rules.yaml` → extract `categories` section
   - Determine cycle number: `catalog.evaluationCycle + 1`
   - Check: catalog file exists AND is valid JSON AND has `variants` array

2. **Group Variants by Category**
   - For each variant in `catalog.variants`:
     - Map to the category defined in `scoring-rules.categories` (base, core, layout, navigation, feedback, data)
     - If variant.category not found in rules, flag as `UNCATEGORIZED`
   - Check: every variant mapped to exactly one category OR flagged

3. **Detect New Variants**
   - Compare each variant's `addedAtCycle` with current cycle number
   - Variants where `addedAtCycle == currentCycle` OR `lastScoredAtCycle == null` are flagged as `NEW`
   - Check: new variant count logged

4. **Cross-Reference with Registry**
   - For each variant with a `metadata.registryKey`:
     - Verify the key exists in `registry.json.items[]`
     - Verify the component files listed in metadata actually exist on disk
   - Flag variants with broken references as `ORPHANED`
   - Check: zero ORPHANED variants (warn if any)

5. **Cross-Reference with Component Metadata**
   - For each variant with a `metadata.componentMetadata` path:
     - Verify the metadata JSON exists
     - Extract: variants count, states count, a11y coverage
   - Enrich inventory with these details for scoring step
   - Check: metadata enrichment successful for all non-null paths

6. **Count Sources Per Variant**
   - For each variant, count `variant.sources.length`
   - This feeds directly into the breadth dimension of scoring
   - Check: source counts populated for all variants

7. **Generate Inventory Output**
   - Create `inventory.json` with structure:
     ```json
     {
       "cycle": N,
       "timestamp": "ISO-8601",
       "totalVariants": count,
       "newVariants": count,
       "orphanedVariants": count,
       "categories": {
         "base": { "variants": [...], "count": N },
         "core": { "variants": [...], "count": N },
         ...
       }
     }
     ```
   - Check: output JSON is valid AND all categories represented

## Failure Handling

- **Catalog not found:** Abort with "pattern-catalog.json not found. Run Wave 1 foundation first."
- **Invalid JSON:** Abort with parsing error details
- **Orphaned variants:** Warn but continue (non-blocking). Log orphaned IDs in output.
- **Empty catalog:** Abort with "No variants to inventory. Add components to pattern-catalog.json first."

## Success Criteria

- [ ] All variants in catalog grouped by category
- [ ] New variants (since last cycle) identified
- [ ] Cross-reference with registry.json completed
- [ ] Cross-reference with component metadata completed
- [ ] Source counts populated for breadth scoring
- [ ] Inventory JSON output is valid and complete
- [ ] Zero uncategorized variants (or explicitly flagged)

## Error Handling

- **Missing files**: Report which reference file is missing, suggest corrective action
- **Category mismatch**: If variant.category not in scoring rules, list valid categories
- **Stale data**: If component metadata newer than catalog entry, flag for re-sync

## Related Checklists

- `squads/design/checklists/ds-critical-eye-review-checklist.md`
