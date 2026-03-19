# Generate All Stories

**Task ID:** `sb-generate-all-stories`
**Pattern:** HO-TP-001 (Task Anatomy Standard)
**Version:** 1.0.0
**Last Updated:** 2026-02-25

## Task Anatomy

| Field | Value |
|-------|-------|
| **task_name** | Generate All Stories |
| **status** | `pending` |
| **responsible_executor** | @storybook-expert |
| **execution_type** | `Agent` |
| **input** | Component directory, component list, story conventions |
| **output** | `.stories.tsx` file for every component |
| **action_items** | 7 steps |
| **acceptance_criteria** | 6 criteria |

## Overview

Generate a `.stories.tsx` file for EVERY component in the project's UI directory. Follows CSF3 conventions with TypeScript strict mode, `satisfies Meta<typeof Component>` pattern, Portuguese content, and co-located file placement. Handles both shadcn standard components and project-specific custom components.

## Input

- **components_dir** (string)
  - Description: Directory containing UI components
  - Required: Yes
  - Default: `src/components/ui/`
- **installed_components** (list)
  - Description: List of component files from sb-expand-shadcn output
  - Required: Yes
  - Source: Previous task handoff
- **custom_components** (list)
  - Description: Project-specific components not from shadcn
  - Required: No
  - Source: Previous task handoff
- **story_conventions** (object)
  - Description: Project-specific story writing conventions
  - Required: No
  - Source: storybook-expert agent configuration

## Output

- **story_files** (list)
  - Description: Generated `.stories.tsx` files
  - Destination: Co-located with components (`src/components/ui/{name}.stories.tsx`)
- **coverage_report** (object)
  - Description: Components covered vs total

## Action Items

### Step 1: Inventory All Components

- [ ] Scan `{components_dir}` for all `.tsx` files (exclude `.stories.tsx`, `.test.tsx`)
- [ ] For each file, extract: exported component names, props interface, variants (CVA)
- [ ] Separate into: shadcn standard components vs custom components
- [ ] Check which already have `.stories.tsx` files (skip if exists and valid)

### Step 2: Classify Components

Classify each component to determine story strategy:

| Category | Examples | Story Strategy |
|----------|----------|---------------|
| **Simple (args-only)** | Badge, Separator, Avatar, Progress, Skeleton | Default + variant stories, AllVariants gallery |
| **Form Controls** | Input, Textarea, Select, Checkbox, Switch, Slider, RadioGroup, Toggle | Default + WithLabel + states (disabled, error) |
| **Compound (render required)** | Dialog, Sheet, Drawer, Popover, Tooltip, DropdownMenu, ContextMenu, Command, AlertDialog, HoverCard | Render function stories showing trigger + content |
| **Layout** | Card, Table, Tabs, Accordion, Collapsible, Resizable, ScrollArea | Render function with realistic content |
| **Navigation** | Breadcrumb, Pagination, NavigationMenu, Menubar, Sidebar | Render function with navigation structure |
| **Notification** | Alert, Sonner/Toast | Default + variants (success, error, warning) |
| **Utility** | AspectRatio, Calendar, Carousel, Chart, InputOTP | Specialized render per component |
| **Custom** | Project-specific | Analyze props/variants and generate accordingly |

### Step 3: Generate Story Files

For EACH component without an existing valid story:

**3a. Read the component file:**
```
Read(src/components/ui/{name}.tsx)
```

**3b. Extract metadata:**
- Component name and exports
- Props interface (variants, sizes, states)
- CVA variants (if using class-variance-authority)
- Required children/content patterns
- Event handlers (onClick, onChange, etc.)

**3c. Apply story template:**

```typescript
import type { Meta, StoryObj } from "{framework_adapter}";
import { {ComponentName} } from "./{component-file}";

const meta = {
  title: "{AtomicLevel}/{Subcategory}/{ComponentName}",
  // Examples:
  // Atoms: "Atoms/Forms/Button", "Atoms/Data Display/Badge"
  // Molecules: "Molecules/Overlays/Dialog", "Molecules/Navigation/Breadcrumb"
  // Organisms: "Organisms/Squads/SquadCard", "Organisms/Kanban/KanbanBoard"
  // Templates: "Templates/AppShell" (flat, no subcategory)
  // Pages: "Pages/Dashboard" (flat, no subcategory)
  component: {ComponentName},
  tags: ["autodocs"],
  // argTypes based on extracted props
  // args with sensible defaults
} satisfies Meta<typeof {ComponentName}>;

export default meta;
type Story = StoryObj<typeof meta>;

// Default story (always first)
export const Default: Story = {
  args: { /* default props */ },
};

// Variant stories (one per variant)
// Gallery story (AllVariants)
// Composition stories (With{Feature})
```

**Atomic Design Title Convention:**

| Level | Pattern | Subcategories | Example |
|-------|---------|---------------|---------|
| **Atom** | `Atoms/{Subcategory}/{Name}` | Forms, Data Display, Layout, Feedback | `Atoms/Forms/Button` |
| **Molecule** | `Molecules/{Subcategory}/{Name}` | Overlays, Navigation, Forms, Data Display, Content | `Molecules/Overlays/Dialog` |
| **Organism** | `Organisms/{Domain}/{Name}` | By domain directory | `Organisms/Squads/SquadCard` |
| **Template** | `Templates/{Name}` | Flat (no subcategory) | `Templates/AppShell` |
| **Page** | `Pages/{Name}` | Flat (no subcategory) | `Pages/Dashboard` |

**3d. Content rules:**
- ALL text content in Portuguese (pt-BR): "Abrir", "Salvar", "Cancelar", "Digite aqui..."
- Use `fn()` from `storybook/test` for event handlers
- Use `parameters: { layout: "padded" }` for layout components
- Use `parameters: { layout: "fullscreen" }` for navigation/sidebar
- Default layout is `centered` (from preview.ts global config)

### Step 4: Handle Compound Components

Components with multiple sub-exports (Dialog, DropdownMenu, etc.) need special handling:

```typescript
// Import all sub-components
import {
  {Parent},
  {ParentTrigger},
  {ParentContent},
  // ... other sub-components
} from "./{component-file}";
```

The render function composes sub-components with realistic content:
- Triggers use Button or text elements
- Content shows representative UI
- Include enough sub-components to demonstrate the API

### Step 5: Batch Write Files

Write all story files to disk. For large batches (40+ files), process in groups of 5-10 to maintain quality:

- [ ] Group 1: Simple components (args-only) — fastest to generate
- [ ] Group 2: Form controls — moderate complexity
- [ ] Group 3: Compound components — highest complexity, need careful composition
- [ ] Group 4: Layout/navigation components — need realistic content
- [ ] Group 5: Custom components — need individual analysis

### Step 6: Type Check and Fix

After writing all story files:

```bash
npm run typecheck
```

**Common TypeScript errors and fixes:**

| Error | Cause | Fix |
|-------|-------|-----|
| `Type '...' not assignable to parameter of 'never'` | Story with render but no args, component has required props | Add required props to `args` even when render handles them |
| `Cannot find module` | Wrong import path | Verify component exports match imports |
| `Property '...' does not exist` | Wrong prop name | Check component props interface |
| Unused imports | Imported component not used in render | Remove unused imports |

Fix ALL type errors before proceeding.

### Step 7: Lint Check and Fix

```bash
npm run lint
```

Fix any lint errors in generated story files.

## Acceptance Criteria

- [ ] **AC-1:** Every component in `{components_dir}` has a corresponding `.stories.tsx` file
- [ ] **AC-2:** All stories use `satisfies Meta<typeof Component>` pattern
- [ ] **AC-3:** All stories have `tags: ["autodocs"]`
- [ ] **AC-4:** `npm run typecheck` — zero errors
- [ ] **AC-5:** `npm run lint` — zero errors
- [ ] **AC-6:** All text content in Portuguese (pt-BR)

## Quality Gate

```yaml
quality_gate:
  id: "SB-QG-001"
  name: "Story Coverage Gate"
  placement: "exit"
  type: "automated"
  severity: "blocking"

  criteria:
    - check: "coverage_ratio"
      type: "threshold"
      field: "stories_count / components_count"
      value: 1.0
      operator: ">="
      weight: 40
    - check: "typecheck_pass"
      type: "boolean"
      field: "typecheck_exit_code"
      value: 0
      operator: "=="
      weight: 30
    - check: "lint_pass"
      type: "boolean"
      field: "lint_exit_code"
      value: 0
      operator: "=="
      weight: 30

  thresholds:
    pass: 100
    review: 80
    fail: 79

  pass_action:
    - "Proceed to sb-verify"
  fail_action:
    - "Fix type/lint errors"
    - "Generate missing stories"
    - "Re-run quality gate"
```

## Error Handling

### Component Has No Exported Component
- **Trigger:** File exports only utilities, types, or hooks (not a React component)
- **Detection:** No JSX.Element or React.FC export found
- **Recovery:** Skip this file — it doesnt need a story
- **Prevention:** Step 1 filters by exported component presence

### Generated Story Has Type Errors
- **Trigger:** Props interface doesnt match args
- **Detection:** Step 6 typecheck
- **Recovery:** Read component source again, fix args to match actual props
- **Prevention:** Careful prop extraction in Step 3b

### Component Requires External Context
- **Trigger:** Component crashes without Provider, Router, or Context
- **Detection:** Runtime error in Storybook
- **Recovery:** Add decorator with required Provider in story meta
- **Prevention:** Detect context dependencies during component analysis

## Dependencies

### Depends On (Upstream)

- `sb-expand-shadcn` - Expand Shadcn Library
  - Required output: installed_components, custom_components
- `sb-configure` - Configure Storybook
  - Required output: framework_adapter, stories_glob

### Required By (Downstream)

- `sb-verify` - Verify Storybook Setup
  - Uses output: All story files written

## Related Checklists

- `squads/design/checklists/ds-component-quality-checklist.md`
- `squads/design/checklists/ds-accessibility-wcag-checklist.md`

## Handoff

| Attribute | Value |
|-----------|-------|
| **Next Task** | `sb-verify` |
| **Trigger** | All acceptance criteria met |
| **Executor** | @storybook-expert |

### Handoff Package

- **story_files**: List of generated story files with paths
- **coverage_report**: Components total vs stories generated
- **type_errors_fixed**: List of type errors encountered and fixed
- **skipped_components**: Files skipped (no exportable component)

---

_Task Version: 1.0.0_
_Pattern: HO-TP-001 (Task Anatomy Standard)_
_Last Updated: 2026-02-25_
_Compliant: Yes_
