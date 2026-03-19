# Apply or Validate Typography Hierarchy

> Task ID: ds-typography-map
> Agent: Page Composer (Page Composition & Layout Specialist)
> Version: 1.0.0
> **Execution Type:** `Agent`
> **Dependencies:** depends_on: `[]` · enables: `[ds-spacing-check]` · workflow: `audit`

## Description

Apply or validate typography hierarchy on a page. Checks H1 count (must be exactly 1), heading sequence (no skips), line lengths (45-75ch), vertical rhythm (24px baseline), and responsive type scale. Outputs a typography map with current state, violations, and recommendations with Tailwind classes.

## Input Schema

- **command:** `*typography-map {file-path|page-type}`
- **file-path:** Path to existing page file (e.g., `src/pages/Landing.tsx`)
- **page-type:** Or a page type string to generate recommended typography map (e.g., `landing`, `dashboard`)
- **format:** File path string or page type string

## Prerequisites

- Target file exists (if auditing existing page) or page type is valid (if generating map)
- Knowledge base loaded:
  - `squads/design/data/typography-hierarchy-rules.md`

## Workflow

### Steps

1. **Scan for Typography Elements** — Read file and extract all heading elements (H1-H6), body text, captions, and their associated Tailwind text-* classes.
   - Check: all typography elements identified with line references

2. **Check H1 Count** — Validate exactly one H1 exists per page. Multiple H1s break hierarchy and accessibility.
   - KB: `typography-hierarchy-rules.md`
   - Check: H1 count is exactly 1 — PASS or FAIL with line references

3. **Check Heading Sequence** — Validate headings follow sequential order without skips (H1 → H2 → H3, never H1 → H3). Log all heading occurrences.
   - KB: `typography-hierarchy-rules.md`
   - Check: heading sequence validated — no skips detected

4. **Check Line Lengths** — Verify body text containers have max-width constraints to keep line lengths within 45-75 characters (max-w-prose or equivalent).
   - KB: `typography-hierarchy-rules.md`
   - Check: line length constraints present on body text containers

5. **Check Vertical Rhythm** — Validate heading/body margins are multiples of 24px baseline (mb-6 = 24px, mb-12 = 48px). Flag non-baseline values.
   - KB: `typography-hierarchy-rules.md`
   - Check: vertical rhythm validated against 24px baseline

6. **Generate Report** — Produce typography map table showing current vs expected values, violations list, and recommendations with specific Tailwind classes. Update `.state.yaml`.
   - Check: report generated with actionable recommendations

## Output

- Typography map table (element, current, expected, status)
- Violations list with line references
- Recommendations with Tailwind classes
- `.state.yaml` updated with typography map

## Output Format

```
Scanning Landing.tsx for typography hierarchy...

**Typography Map:**
| Element  | Current          | Expected             | Status |
|----------|------------------|----------------------|--------|
| H1       | text-4xl         | text-5xl lg:text-7xl | WARN — undersized for hero |
| H2 (x3)  | text-2xl         | text-3xl lg:text-4xl | WARN — undersized for sections |
| H3 (x6)  | text-xl          | text-xl lg:text-2xl  | PASS |
| Body     | text-base        | text-base lg:text-lg | PASS |

**Violations:**
- H1 count: 1 (PASS)
- Heading sequence: H1 → H2 → H3 (PASS — no skips)
- Line length: Line 45 has no max-w-prose — unbounded line length (FAIL)
- Vertical rhythm: Section headings use mb-4 instead of mb-6 — breaks 24px baseline (WARN)

**Recommendations:**
- Upgrade H1 to `text-5xl font-bold tracking-tight lg:text-7xl`
- Upgrade H2 to `text-3xl font-semibold tracking-tight lg:text-4xl`
- Add `max-w-prose` to body text containers
- Normalize heading margins to multiples of 24px (mb-6 = 24px)

.state.yaml updated with typography map.
```

## Failure Handling

- **File not found:** Abort with "File '{path}' not found. Verify the path and try again."
- **No typography elements found:** If file contains no headings or text elements, warn "No typography elements detected in '{path}'. Is this the correct file?"
- **KB file not found:** Abort with "KB file typography-hierarchy-rules.md not found at squads/design/data/. Cannot perform typography mapping."
- **Multiple H1s detected:** Flag as FAIL with all H1 line references and recommendation to consolidate to single H1.
- **Heading skip detected:** Flag each skip with before/after heading and line references (e.g., "H1 at line 5 → H3 at line 12 — missing H2").

## Success Criteria

- [ ] All typography elements scanned with line references
- [ ] H1 count validated (exactly 1)
- [ ] Heading sequence validated (no skips)
- [ ] Line lengths checked for max-width constraints
- [ ] Vertical rhythm validated against 24px baseline
- [ ] Typography map table generated (current vs expected)
- [ ] Every violation has a specific Tailwind class recommendation
- [ ] `.state.yaml` updated with typography map

## Anti-Patterns

- Ignoring the modular type scale (1.25 ratio)
- Allowing multiple H1 elements
- Not checking responsive type scaling (missing lg: breakpoint classes)
- Using arbitrary margin values instead of 24px baseline multiples
- Providing recommendations without specific Tailwind classes
- Skipping line length validation

## Examples

### Example 1: Audit Existing Page

```
User: *typography-map src/pages/Landing.tsx
Composer: Scanning Landing.tsx for typography hierarchy...
Composer: H1 count: 1 (PASS)
Composer: Heading sequence: H1 → H2 → H3 (PASS)
Composer: Line length: FAIL at line 45 (no max-w-prose)
Composer: Vertical rhythm: WARN — mb-4 should be mb-6
Composer: Recommendations provided with Tailwind classes.
```

### Example 2: Generate Map for Page Type

```
User: *typography-map landing
Composer: Generating recommended typography map for Landing page...
Composer: Hero H1: text-5xl font-bold tracking-tight lg:text-7xl leading-tight
Composer: Section H2: text-3xl font-semibold tracking-tight lg:text-4xl leading-snug
Composer: Body: text-base lg:text-lg leading-relaxed max-w-prose
Composer: Caption: text-sm text-muted-foreground leading-normal
```

## Notes

- Uses only typography-hierarchy-rules.md as KB (single-KB task)
- Modular type scale is 1.25 ratio (Minor Third)
- Vertical rhythm baseline is 24px (mb-6 in Tailwind)
- H1 must be exactly 1 per page — this is both an accessibility and hierarchy requirement
- Heading sequence must not skip levels (H1 → H3 without H2 is invalid)
- Line length optimal range: 45-75 characters per line
- Pairs well with *layout-audit and *spacing-check for full page audit

## Related Checklists

- `squads/design/checklists/page-composition-checklist.md`

## Process Guards

- **On Fail:** Stop execution, capture evidence, and return remediation steps before proceeding.
