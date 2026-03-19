# Audit Page Layout Against Framework Rules

> Task ID: ds-layout-audit
> Agent: Page Composer (Page Composition & Layout Specialist)
> Version: 1.0.0
> **Execution Type:** `Agent`
> **Dependencies:** depends_on: `[]` · enables: `[ds-typography-map, ds-spacing-check]` · workflow: `audit`

## Description

Audit an existing page against the layout framework rules. Checks grid compliance, breakpoint coverage, container widths, responsive techniques, and layout pattern adherence. Outputs an audit report with a score (0-10) and Tailwind-based fixes for every issue found.

## Input Schema

- **command:** `*layout-audit {file-path}`
- **file-path:** Path to page or component file (e.g., `src/pages/Home.tsx`)
- **format:** File path string

## Prerequisites

- Target file exists and is readable
- Knowledge base loaded:
  - `squads/design/data/page-layout-framework.md`

## Workflow

### Steps

1. **Scan File** — Read and parse the target file. Extract all layout-related classes and structures (grid, flex, container, breakpoint, width, padding).
   - Check: file read successfully, layout elements identified

2. **Check Grid Compliance** — Validate grid usage against 12-column grid system. Flag arbitrary widths (w-1/3, w-[400px]) that should use grid-cols-*.
   - KB: `page-layout-framework.md`
   - Check: grid usage categorized as compliant/non-compliant with line references

3. **Check Breakpoint Coverage** — Verify responsive breakpoint handling. Every layout element must have mobile-first classes with progressive enhancement (sm:, md:, lg:, xl:).
   - KB: `page-layout-framework.md`
   - Check: breakpoint coverage assessed per layout element

4. **Check Container Widths** — Validate outer containers have max-w constraints (max-w-7xl, max-w-screen-xl, etc.). Flag unbounded containers.
   - KB: `page-layout-framework.md`
   - Check: container constraints validated with line references

5. **Score Layout** — Calculate overall layout score (0-10) based on grid compliance, breakpoint coverage, container widths, and pattern adherence.
   - Check: score calculated with category breakdown

6. **Generate Report** — Produce audit report with issues table, score, and Tailwind-based fix for every issue. Update `.state.yaml`.
   - Check: report generated with actionable fixes

## Output

- Layout audit report (Markdown)
- Score (0-10) with category breakdown
- Issues table with line numbers and fixes
- Tailwind-based fix for every issue
- `.state.yaml` updated with audit results

## Output Format

```
Scanning Dashboard.tsx against page-layout-framework rules...

**Layout Audit Report:**
| Rule                    | Status | Line | Issue                                      |
|-------------------------|--------|------|--------------------------------------------|
| Container max-width     | FAIL   | 12   | No max-w constraint — content stretches    |
| 12-column grid          | FAIL   | 34   | Using w-1/3 instead of grid-cols-*         |
| Mobile breakpoint       | FAIL   | 34   | No sm: or md: responsive classes           |
| Sidebar pattern         | PASS   | 8    | Correct aside + main structure             |
| Vertical sections       | WARN   | 56   | Inconsistent section padding (py-4 vs py-8)|

**Score: 4/10**

**Fixes:**
- Line 12: Add `max-w-7xl mx-auto` to outer container
- Line 34: Replace `w-1/3` with `grid grid-cols-12` and `col-span-4`
- Line 34: Add `grid-cols-1 md:grid-cols-12` for responsive
- Line 56: Normalize section padding to `py-16 lg:py-24`

.state.yaml updated with audit results.
```

## Failure Handling

- **File not found:** Abort with "File '{path}' not found. Verify the path and try again."
- **File is not a page/component:** If file contains no layout-relevant code (no JSX/TSX, no Tailwind classes), warn "File '{path}' contains no detectable layout code. Is this the correct file?"
- **KB file not found:** Abort with "KB file page-layout-framework.md not found at squads/design/data/. Cannot perform audit."
- **Parse error:** If file has syntax errors preventing parsing, warn "Could not fully parse '{path}'. Audit results may be incomplete." and continue with what can be analyzed.

## Success Criteria

- [ ] All layout elements in file scanned
- [ ] Grid compliance checked against 12-column system
- [ ] Breakpoint coverage assessed for all layout elements
- [ ] Container widths validated for max-w constraints
- [ ] Score calculated (0-10) with clear category breakdown
- [ ] Every issue has a specific Tailwind-based fix with line number
- [ ] `.state.yaml` updated with audit results

## Anti-Patterns

- Providing vague fixes like "add some responsive classes" instead of specific Tailwind classes
- Scoring without checking all categories
- Ignoring container width constraints
- Not providing line numbers for issues
- Skipping mobile-first validation

## Examples

### Example 1: Dashboard Audit

```
User: *layout-audit src/pages/Dashboard.tsx
Composer: Scanning Dashboard.tsx against page-layout-framework rules...
Composer: Issues found:
  - Line 23: Container missing max-w constraint (unbounded width)
  - Line 45: Grid not using 12-column system (using arbitrary widths)
  - Line 78: No responsive breakpoint handling for mobile
Composer: Score: 4/10
Composer: Fixes provided with Tailwind classes.
Composer: .state.yaml updated with audit results.
```

### Example 2: Clean Page

```
User: *layout-audit src/pages/About.tsx
Composer: Scanning About.tsx against page-layout-framework rules...
Composer: All rules pass. Score: 9/10
Composer: Minor: Line 12 could use container query for sidebar.
Composer: .state.yaml updated with audit results.
```

## Notes

- This is a read-only audit — no code modifications are made
- Uses only page-layout-framework.md as KB (single-KB task)
- Pairs well with *typography-map and *spacing-check for a full page audit
- Typical audit flow: `*layout-audit → *typography-map → *spacing-check → fixes`
- Fixes always use Tailwind classes, never arbitrary CSS values

## Related Checklists

- `squads/design/checklists/page-composition-checklist.md`

## Process Guards

- **On Fail:** Stop execution, capture evidence, and return remediation steps before proceeding.
