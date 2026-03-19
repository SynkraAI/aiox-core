# Rename Story Titles to Atomic Design Hierarchy

**Task ID:** `sb-atomic-rename`
**Pattern:** HO-TP-001 (Task Anatomy Standard)
**Version:** 1.0.0
**Last Updated:** 2026-02-26

## Task Anatomy

| Field | Value |
|-------|-------|
| **task_name** | Rename Story Titles to Atomic Design |
| **status** | `active` |
| **responsible_executor** | @storybook-expert |
| **execution_type** | `Agent` |
| **input** | Component inventory with atomic classification |
| **output** | All existing stories renamed to Atomic Design hierarchy |
| **action_items** | 5 steps |
| **acceptance_criteria** | 4 criteria |

## Overview

Take existing Storybook stories with flat or inconsistent title hierarchy (e.g., `"UI/Button"`, `"Base Components/Card"`) and rename their `title` metadata to match Brad Frost's Atomic Design hierarchy: `Atoms/Subcategory/Name`, `Molecules/Subcategory/Name`, `Organisms/Domain/Name`, `Templates/Name`, `Pages/Name`.

This task does NOT create new stories or modify component files. It only changes the `title` string in existing `.stories.tsx` files.

## Input

- **component_inventory** (JSON)
  - Description: Inventory from `sb-brownfield-scan` with atomic classification
  - Required: Yes
  - Source: `outputs/design-system/{project}/brownfield/component-inventory.json`
- **stories_dir** (string)
  - Description: Directory containing existing story files
  - Required: Yes
  - Default: `src/components/`

## Output

- **renamed_stories** (list)
  - Description: List of story files with old title → new title mapping
- **rename_report** (Markdown)
  - Description: Summary of all renames applied
  - Destination: `outputs/design-system/{project}/brownfield/rename-report.md`

## Title Convention

### Atomic Design Hierarchy

| Level | Pattern | Subcategories | Example |
|-------|---------|---------------|---------|
| **Atom** | `Atoms/{Subcategory}/{Name}` | Forms, Data Display, Layout, Feedback | `Atoms/Forms/Button` |
| **Molecule** | `Molecules/{Subcategory}/{Name}` | Overlays, Navigation, Forms, Data Display, Content | `Molecules/Overlays/Dialog` |
| **Organism** | `Organisms/{Domain}/{Name}` | By domain (Squads, Kanban, Layout, etc.) | `Organisms/Squads/SquadCard` |
| **Template** | `Templates/{Name}` | Flat | `Templates/AppShell` |
| **Page** | `Pages/{Name}` | Flat | `Pages/Dashboard` |

### System vs Product Boundary

```
System (reusable, no business logic):
  Atoms/     → primitive UI elements
  Molecules/ → composed atom groups

Product (app-specific, domain logic):
  Organisms/ → feature-level sections
  Templates/ → layout skeletons
  Pages/     → data-connected views
```

### Subcategory Assignment Rules

**Atoms:**
- Forms: Button, Input, Textarea, Label, Checkbox, Radio Group, Switch, Slider, Toggle, Toggle Group, Input OTP
- Data Display: Badge, Avatar, Status Dot, Status Badge, Tag, Icon, Progress, Progress Bar, Section Label
- Layout: Separator, Aspect Ratio, Scroll Area, Resizable, Collapsible
- Feedback: Skeleton, FAB, Spinner

**Molecules:**
- Overlays: Dialog, Alert Dialog, Sheet, Drawer, Popover, Tooltip, Hover Card
- Navigation: Dropdown Menu, Context Menu, Navigation Menu, Menubar, Breadcrumb, Pagination
- Forms: Select, Command, Calendar, Date Picker
- Data Display: Card, Alert, Table, Tabs, Accordion, Carousel, Chart
- Content: Markdown Renderer, Toast/Sonner

**Organisms:**
- Grouped by domain directory (squads/, kanban/, layout/, monitor/, terminals/, etc.)

## Action Items

### Step 1: Load Component Inventory

- [ ] Read `component_inventory.json` from brownfield scan
- [ ] Extract atomic classification for each component
- [ ] Build title mapping: component name → new Atomic Design title

### Step 2: Find All Existing Stories

- [ ] Glob for `*.stories.tsx` and `*.stories.ts` in `stories_dir`
- [ ] For each story file, extract current `title` value from meta object
- [ ] Match each story to its component in the inventory

### Step 3: Build Rename Map

For each story, determine the new title:

```
current: title: "UI/Button"
new:     title: "Atoms/Forms/Button"

current: title: "UI/Dialog"
new:     title: "Molecules/Overlays/Dialog"

current: title: "UI/Sidebar"
new:     title: "Organisms/Navigation/Sidebar"
```

Rules:
- Use the `atomic_level` from the inventory to determine the top-level folder
- Use the `subcategory` assignment rules above for Atoms and Molecules
- Use the domain directory name for Organisms
- Keep Templates and Pages flat (no subcategory)

### Step 4: Apply Renames

For each story file:
- [ ] Read the file
- [ ] Find the `title: "..."` line in the meta object
- [ ] Replace with the new title
- [ ] Do NOT change anything else in the file
- [ ] Track old → new mapping

### Step 5: Verify

- [ ] Grep for any remaining non-Atomic titles (e.g., `title: "UI/`)
- [ ] Count renamed files vs total stories
- [ ] Report: "{N}/{M} stories renamed to Atomic Design hierarchy"

## Acceptance Criteria

- [ ] **AC-1:** Zero stories with flat/legacy title hierarchy remain (no `UI/`, `Base Components/`, `Core Components/`)
- [ ] **AC-2:** All stories use `{AtomicLevel}/{Subcategory}/{Name}` pattern
- [ ] **AC-3:** No other changes to story files (only title string modified)
- [ ] **AC-4:** TypeScript typecheck passes after rename (no import breakage)

## Error Handling

### Story Not In Inventory
- **Trigger:** Story exists for a component not found in brownfield scan
- **Detection:** No matching component in inventory
- **Recovery:** Classify manually based on file path and imports, apply heuristics from sb-brownfield-scan Step 4

### Ambiguous Subcategory
- **Trigger:** Component could fit in multiple subcategories
- **Detection:** Manual judgment needed
- **Recovery:** Prefer the primary function (e.g., Calendar is Forms, not Data Display)

## Dependencies

### Depends On (Upstream)
- `sb-brownfield-scan` - Component inventory with atomic classification

### Required By (Downstream)
- `sb-brownfield-migrate` - Stories for new components should follow same convention
- `sb-generate-all-stories` - New stories should follow same convention

## Related Checklists

- `squads/design/checklists/atomic-refactor-checklist.md`
- `squads/design/checklists/ds-component-quality-checklist.md`

## Handoff

| Attribute | Value |
|-----------|-------|
| **Next Task** | `sb-brownfield-migrate` |
| **Trigger** | All stories renamed |
| **Executor** | @storybook-expert |

### Handoff Package
- **renamed_stories**: List of old → new title mappings
- **rename_report**: Summary markdown

## Veto Conditions

- Changing anything in story files besides the `title` string
- Using flat titles without subcategories (e.g., `Atoms/Button` instead of `Atoms/Forms/Button`)
- Ignoring System vs Product boundary

---

_Task Version: 1.0.0_
_Pattern: HO-TP-001 (Task Anatomy Standard)_
_Last Updated: 2026-02-26_
_Compliant: Yes_
