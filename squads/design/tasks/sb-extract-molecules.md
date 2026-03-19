# Extract Molecules from Organisms

**Task ID:** `sb-extract-molecules`
**Pattern:** HO-TP-001 (Task Anatomy Standard)
**Version:** 1.0.0
**Last Updated:** 2026-02-26

## Task Anatomy

| Field | Value |
|-------|-------|
| **task_name** | Extract Molecules from Organisms |
| **status** | `active` |
| **responsible_executor** | @brad-frost |
| **execution_type** | `Agent` |
| **input** | Component inventory, dependency graph, organism source code |
| **output** | New molecule component files, stories, updated organisms |
| **action_items** | 6 steps |
| **acceptance_criteria** | 5 criteria |

## Overview

Analyze organism components for inline patterns that should be extracted as reusable molecules. When 2+ organisms share the same composed pattern (e.g., ProgressRing SVG, UserChip avatar+name, StatCard label+value), extract that pattern into a standalone molecule component with its own story.

This task enforces the Atomic Design composition rule: organisms should compose molecules and atoms, not implement inline what could be a molecule.

## Input

- **component_inventory** (JSON)
  - Description: Inventory from `sb-brownfield-scan`
  - Required: Yes
- **dependency_graph** (JSON)
  - Description: Component dependency tree
  - Required: Yes
- **organisms_dir** (string)
  - Description: Directory containing organism components
  - Required: Yes
  - Default: `src/components/`

## Output

- **new_molecules** (list)
  - Description: New molecule component files (`.tsx`) with stories (`.stories.tsx`)
  - Destination: `src/components/ui/` (System) or `src/components/{domain}/` (Product)
- **updated_organisms** (list)
  - Description: Organism files updated to import new molecules instead of inline patterns
- **extraction_report** (Markdown)
  - Description: Report of extractions performed
  - Destination: `outputs/design-system/{project}/brownfield/extraction-report.md`

## Detection Heuristics

### When to Extract

A pattern should be extracted as a molecule when:

1. **Shared pattern**: 2+ organisms use the same composed UI (e.g., same SVG circle + percentage text)
2. **Self-contained**: The pattern takes simple props and renders independently
3. **Named concept**: The pattern represents a recognizable UI concept (ProgressRing, UserChip, StatCard)
4. **Testable in isolation**: Can be rendered in Storybook without organism context

### Common Extraction Candidates

| Pattern | Composition | Found In |
|---------|-------------|----------|
| **ProgressRing** | SVG circle + percentage label | Score displays, progress indicators |
| **UserChip** | Avatar + Name + Status dot | User lists, agent displays |
| **NavItem** | Icon + Label + Badge + Active state | Sidebars, menus |
| **StatCard** | Label + Value + Trend indicator | Dashboard cards, metric panels |
| **SearchField** | Input + Icon + Clear button | Search bars, filter panels |
| **EmptyState** | Icon + Title + Description + Action | Empty lists, zero-data views |
| **ErrorState** | Alert + Retry button | Error boundaries, failed loads |

### When NOT to Extract

- Pattern is used only once (wait for second usage)
- Pattern requires organism-level context (store, API) to function
- Pattern is too generic (just a div with some classes)

## Action Items

### Step 1: Identify Extraction Candidates

- [ ] Read all organism component files
- [ ] For each, identify inline composed patterns (JSX blocks that could be standalone)
- [ ] Cross-reference: find same pattern in 2+ organisms
- [ ] Prioritize by usage count (most shared first)
- [ ] Report: "Found {N} candidates for extraction"

### Step 2: Design Molecule Interface

For each candidate:
- [ ] Define props interface (typed, minimal)
- [ ] Determine which atoms it composes
- [ ] Decide placement: `ui/` (System) or domain folder (Product)
- [ ] Naming: kebab-case file, PascalCase export

### Step 3: Create Molecule Component

For each extraction:
- [ ] Write component file with proper TypeScript types
- [ ] Import only atoms, not other molecules or organisms
- [ ] Use `cn()` for className merging
- [ ] Use CSS variables for theming (no hardcoded colors)
- [ ] Export named component (not default)

### Step 4: Create Molecule Story

For each new molecule:
- [ ] Create `.stories.tsx` co-located with component
- [ ] Title: `Molecules/{Subcategory}/{Name}`
- [ ] Include: Default, edge cases, size variants
- [ ] Tags: `["autodocs"]`
- [ ] CSF3 format with `satisfies Meta<typeof Component>`

### Step 5: Update Organisms

For each organism that used the inline pattern:
- [ ] Replace inline JSX with import of new molecule
- [ ] Pass the same data as props
- [ ] Verify visual output is identical
- [ ] Run typecheck

### Step 6: Verify

- [ ] All new molecules have stories
- [ ] All updated organisms still render correctly
- [ ] `npm run typecheck` passes
- [ ] No visual regressions (same pixels)

## Acceptance Criteria

- [ ] **AC-1:** All identified shared patterns extracted as molecules
- [ ] **AC-2:** Each new molecule has a `.stories.tsx` file with `Molecules/` title
- [ ] **AC-3:** Organisms updated to import molecules (no inline duplication)
- [ ] **AC-4:** TypeScript typecheck passes
- [ ] **AC-5:** Extraction report documents every extraction with before/after

## Dependencies

### Depends On (Upstream)
- `sb-brownfield-scan` - Inventory and dependency graph
- `sb-brownfield-migrate` - Organisms should have stories first (to verify no regression)

### Required By (Downstream)
- `sb-verify` - Final verification includes new molecules

## Related Checklists

- `squads/design/checklists/atomic-refactor-checklist.md`
- `squads/design/checklists/ds-component-quality-checklist.md`

## Handoff

| Attribute | Value |
|-----------|-------|
| **Next Task** | `sb-verify` or next `sb-brownfield-migrate` phase |
| **Trigger** | All extractions complete and verified |
| **Executor** | @brad-frost |

### Handoff Package
- **new_molecules**: List of new molecule files
- **updated_organisms**: List of updated organism files
- **extraction_report**: Full report

## Veto Conditions

- Extracting a pattern used only once
- Creating a molecule that requires organism-level context (stores, APIs)
- Breaking visual output of existing organisms
- Not creating a story for the new molecule

---

_Task Version: 1.0.0_
_Pattern: HO-TP-001 (Task Anatomy Standard)_
_Last Updated: 2026-02-26_
_Compliant: Yes_
