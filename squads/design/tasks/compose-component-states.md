# Compose Component States

> Task ID: compose-component-states
> Agent: Page Composer (Page Composition & Layout Specialist)
> Version: 1.0.0
> **Execution Type:** `Agent`
> **Dependencies:** depends_on: `[ds-compose-page]` · enables: `[quality validation]`

## Description

Generate loading, empty, and error states for all data-dependent sections of a composed page. Ensures pages don't ship with only the "happy path" populated state.

## Input Schema

- **command:** `*compose-states {page-file}`
- **page-file:** Path to the generated page component from `*compose-page`

## Prerequisites

- Page already composed via `*compose-page` (Phase 8 output exists)
- Component index available at `squads/design/data/component-index.json`

## Workflow

### Steps

1. **Scan Page for Data-Dependent Sections** — Identify all sections that render dynamic data (tables, charts, KPI cards, lists, feeds, user-generated content).

2. **Classify Each Section** — For each data-dependent section, determine:
   - What data it displays
   - What the loading shape looks like (skeleton dimensions)
   - What "no data" means for this section
   - What errors are plausible (network, permission, timeout)

3. **Generate Loading States** — For each section:
   - Use shadcn `Skeleton` components matching the content shape
   - Skeleton should mirror the real layout (same grid, same card count)
   - Animate with `animate-pulse` (Tailwind default)
   - Never use spinner-only loading (always skeleton)

4. **Generate Empty States** — For each section:
   - Icon or illustration relevant to the section
   - Helpful message explaining the empty state
   - Primary action CTA ("Create your first [item]", "Import data", etc.)
   - Use muted colors, centered layout

5. **Generate Error States** — For each section:
   - Specific error message (not generic "Something went wrong")
   - Retry button
   - Optional: link to support/docs
   - Use `text-destructive` for error text

6. **Integrate States into Page** — Add conditional rendering pattern:

```tsx
{isLoading ? (
  <SectionSkeleton />
) : error ? (
  <SectionError error={error} onRetry={refetch} />
) : data.length === 0 ? (
  <SectionEmpty onAction={handleCreate} />
) : (
  <SectionContent data={data} />
)}
```

7. **Validate** — Check:
   - Every data-dependent section has all 3 states
   - Skeleton shapes match real content dimensions
   - Empty states have actionable CTAs
   - Error states have retry capability

## Output

- Updated page component with loading/empty/error states
- State components (if extracted to separate files)
- Validation report listing sections and their state coverage

## Output Format

```
Section Analysis:
| Section | Data Source | Loading | Empty | Error |
|---------|-----------|---------|-------|-------|
| KPI Cards | API /metrics | Skeleton 4-card grid | "No metrics yet" | Retry button |
| User Table | API /users | Skeleton 5-row table | "No users found" + Invite CTA | Retry button |
| Activity Feed | WebSocket | Skeleton 3-item list | "No activity yet" | Reconnect button |

States generated: 3 sections x 3 states = 9 state components
```

## Success Criteria

- [ ] All data-dependent sections identified
- [ ] Loading skeletons match real content shapes
- [ ] Empty states have descriptive messages and CTAs
- [ ] Error states have specific messages and retry actions
- [ ] Conditional rendering pattern applied consistently
- [ ] No section ships with only the populated state

## Anti-Patterns

- Using a single spinner for the entire page instead of per-section skeletons
- Generic "Something went wrong" without context
- Empty states without CTAs (user has no next action)
- Skeleton shapes that don't match the real content layout
- Forgetting to handle the error state entirely

## Related Checklists

- `squads/design/checklists/page-composition-checklist.md`

## Related

- `squads/design/data/component-index.json` — Skeleton component reference
- `squads/design/data/anti-ai-look-patterns.md` — Pattern 9: Missing States
- `squads/design/checklists/page-composition-checklist.md` — Quality gate
