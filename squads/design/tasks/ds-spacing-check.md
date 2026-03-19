# Validate Spacing Rhythm and Token Usage

> Task ID: ds-spacing-check
> Agent: Page Composer (Page Composition & Layout Specialist)
> Version: 1.0.0
> **Execution Type:** `Agent`
> **Dependencies:** depends_on: `[]` · enables: `[]` · workflow: `audit`

## Description

Validate spacing rhythm and token usage on a page. Checks spacing token compliance (4px grid), proximity rules, whitespace strategy consistency (generous/balanced/compact), and section gap rhythm. Outputs a spacing report with violations, fixes, and strategy recommendations.

## Input Schema

- **command:** `*spacing-check {file-path|page-type}`
- **file-path:** Path to existing page file (e.g., `src/pages/Home.tsx`)
- **page-type:** Or a page type string to generate recommended spacing map (e.g., `landing`, `dashboard`)
- **format:** File path string or page type string

## Prerequisites

- Target file exists (if auditing existing page) or page type is valid (if generating map)
- Knowledge base loaded:
  - `squads/design/data/spacing-rhythm-system.md`

## Workflow

### Steps

1. **Scan for Spacing Tokens** — Read file and extract all spacing-related Tailwind classes (p-*, m-*, gap-*, space-*, py-*, px-*, mt-*, mb-*, etc.) with line references.
   - Check: all spacing classes identified and catalogued

2. **Check 4px Grid Compliance** — Validate every spacing value maps to the 4px grid (4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96). Flag arbitrary values or non-grid-aligned values.
   - KB: `spacing-rhythm-system.md`
   - Check: all spacing values validated against 4px grid

3. **Check Proximity Rules** — Validate that related elements are grouped with tighter spacing (8-16px) while unrelated elements have larger gaps (32-96px). Proximity is the strongest grouping cue.
   - KB: `spacing-rhythm-system.md`
   - Check: proximity grouping validated — related elements tight, sections separated

4. **Check Strategy Consistency** — Determine the whitespace strategy in use (generous/balanced/compact) and validate consistency across the page. Flag mixed strategies.
   - KB: `spacing-rhythm-system.md`
   - Check: whitespace strategy identified and consistency validated
   - Expected strategies by page type: generous (landing, about), balanced (blog, pricing), compact (dashboard, auth)

5. **Check Section Gaps** — Validate section-level gaps follow a consistent rhythm. Section gaps should be uniform or follow an intentional pattern (e.g., py-24 for all sections).
   - KB: `spacing-rhythm-system.md`
   - Check: section gap rhythm validated — consistent or intentionally varied

6. **Generate Report** — Produce spacing report with violations list, strategy assessment, and recommendations with specific Tailwind classes. Update `.state.yaml`.
   - Check: report generated with actionable recommendations

## Output

- Spacing report (Markdown)
- Violations list with line references
- Strategy assessment (generous/balanced/compact)
- Recommendations with Tailwind classes
- `.state.yaml` updated with spacing check results

## Output Format

```
Scanning Home.tsx for spacing rhythm compliance...

**Spacing Strategy Detected:** Mixed (inconsistent — should be Generous for landing)

**Spacing Report:**
| Category          | Status | Line | Issue                                          |
|-------------------|--------|------|------------------------------------------------|
| 4px grid          | FAIL   | 23   | p-[13px] — not on 4px grid (use p-3 = 12px)   |
| 4px grid          | FAIL   | 45   | mt-[22px] — not on 4px grid (use mt-5 = 20px)  |
| Proximity         | WARN   | 34   | Related items have gap-8 but sibling section gap-8 — no differentiation |
| Strategy          | FAIL   | —    | Mixed: py-24 (generous) + py-4 (compact) in same page |
| Section gaps      | WARN   | 56   | Inconsistent: py-24 → py-8 → py-24 — breaks rhythm |

**Strategy Recommendation:** Generous (appropriate for landing page)
| Zone            | Recommended | Tailwind     |
|-----------------|-------------|--------------|
| Section gap     | 96px        | py-24        |
| Element group   | 32px        | space-y-8    |
| Inline elements | 16px        | gap-4        |
| Related items   | 8px         | gap-2        |

**Fixes:**
- Line 23: Replace `p-[13px]` with `p-3` (12px) — 4px grid compliance
- Line 45: Replace `mt-[22px]` with `mt-5` (20px) — 4px grid compliance
- Line 56: Normalize section padding to `py-24` for consistent rhythm

.state.yaml updated with spacing check results.
```

## Failure Handling

- **File not found:** Abort with "File '{path}' not found. Verify the path and try again."
- **No spacing classes found:** If file contains no spacing-related Tailwind classes, warn "No spacing tokens detected in '{path}'. Is this the correct file or is spacing handled by a parent?"
- **KB file not found:** Abort with "KB file spacing-rhythm-system.md not found at squads/design/data/. Cannot perform spacing check."
- **Cannot determine strategy:** If spacing values are too inconsistent to classify a strategy, report "Strategy: Unclassifiable — values too varied. Recommend choosing Generous/Balanced/Compact and applying consistently."

## Success Criteria

- [ ] All spacing classes extracted with line references
- [ ] 4px grid compliance validated for every spacing value
- [ ] Proximity grouping validated (tight for related, wide for sections)
- [ ] Whitespace strategy identified and consistency assessed
- [ ] Section gaps validated for rhythm consistency
- [ ] Every violation has a specific Tailwind class fix
- [ ] Strategy recommendation matches page type
- [ ] `.state.yaml` updated with spacing check results

## Anti-Patterns

- Using arbitrary pixel values (p-[13px]) instead of Tailwind spacing tokens
- Mixing whitespace strategies within the same page without intention
- Using the same gap for related items and section breaks
- Applying compact strategy to a landing page or generous to a dashboard
- Providing vague fixes like "increase spacing" instead of specific Tailwind classes

## Examples

### Example 1: Audit Existing Page

```
User: *spacing-check src/pages/Home.tsx
Composer: Scanning Home.tsx for spacing rhythm compliance...
Composer: Strategy detected: Mixed (inconsistent)
Composer: Violations: 2 off-grid values, 1 proximity issue, 1 strategy mismatch
Composer: Recommendation: Generous strategy for landing page
Composer: Fixes provided with Tailwind classes.
Composer: .state.yaml updated.
```

### Example 2: Generate Spacing Map for Page Type

```
User: *spacing-check dashboard
Composer: Generating recommended spacing map for Dashboard page...
Composer: Strategy: Compact
Composer: Section gap: 48px (py-12)
Composer: Element group: 16px (space-y-4)
Composer: Inline elements: 8px (gap-2)
Composer: Card internal: 16px (p-4)
```

## Notes

- Uses only spacing-rhythm-system.md as KB (single-KB task)
- The 4px grid is: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96 (all multiples of 4)
- Three whitespace strategies: generous (landing, about), balanced (blog, pricing), compact (dashboard, auth)
- Proximity is the strongest grouping cue — elements 8px apart read as related
- Section gaps should be consistent (e.g., all py-24) or intentionally graduated
- Pairs well with *layout-audit and *typography-map for full page audit

## Related Checklists

- `squads/design/checklists/page-composition-checklist.md`

## Process Guards

- **On Fail:** Stop execution, capture evidence, and return remediation steps before proceeding.
