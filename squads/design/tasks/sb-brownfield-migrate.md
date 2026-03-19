# Migrate Brownfield Components

**Task ID:** `sb-brownfield-migrate`
**Pattern:** HO-TP-001 (Task Anatomy Standard)
**Version:** 1.0.0
**Last Updated:** 2026-02-25

## Task Anatomy

| Field | Value |
|-------|-------|
| **task_name** | Migrate Brownfield Components |
| **status** | `pending` |
| **responsible_executor** | @storybook-expert |
| **execution_type** | `Agent` |
| **input** | Component inventory, migration plan, dependency graph, target project |
| **output** | Story files for all brownfield components, adaptation report |
| **action_items** | 8 steps |
| **acceptance_criteria** | 6 criteria |

## Overview

Execute the migration plan produced by `sb-brownfield-scan`. For each component in dependency order: analyze its API, adapt it for Storybook isolation (mock providers, stub data, handle side effects), and generate a `.stories.tsx` file. Handles components ranging from simple atoms to complex organisms with context dependencies.

Supports two migration modes:
- **Same-project:** Components stay where they are, stories are added co-located
- **Cross-project:** Components are copied/adapted from source to target project

## Input

- **component_inventory** (JSON)
  - Description: Full inventory from sb-brownfield-scan
  - Required: Yes
  - Source: `outputs/design-system/{project}/brownfield/component-inventory.json`
- **migration_plan** (Markdown)
  - Description: Phased migration plan
  - Required: Yes
  - Source: `outputs/design-system/{project}/brownfield/migration-plan.md`
- **dependency_graph** (JSON)
  - Description: Component dependency tree
  - Required: Yes
  - Source: `outputs/design-system/{project}/brownfield/dependency-graph.json`
- **migration_mode** (enum)
  - Description: How to handle the migration
  - Required: No
  - Default: `same-project`
  - Options:
    - `same-project` — Add stories co-located with existing components
    - `cross-project` — Copy components to target project, then add stories
- **target_path** (string)
  - Description: Where to write stories (and components in cross-project mode)
  - Required: Only for cross-project mode
  - Default: Same directory as component
- **phase_filter** (string)
  - Description: Which phases to execute (e.g., "1", "1-3", "all")
  - Required: No
  - Default: `all`
- **category_filter** (string)
  - Description: Which category to migrate (e.g., "ui", "agents", "all")
  - Required: No
  - Default: `all`
- **component_filter** (string)
  - Description: Specific component name to migrate
  - Required: No

## Output

- **story_files** (list)
  - Description: Generated `.stories.tsx` files
  - Destination: Co-located with components or in target_path
- **adaptation_report** (Markdown)
  - Description: Report of adaptations made per component
  - Destination: `outputs/design-system/{project}/brownfield/adaptation-report.md`
- **mock_files** (list)
  - Description: Mock/stub files created for context dependencies
  - Destination: `.storybook/mocks/` or story decorators

## Action Items

### Step 1: Load Migration Context

- [ ] Read `component_inventory.json`
- [ ] Read `migration_plan.md`
- [ ] Read `dependency_graph.json`
- [ ] Apply filters (phase, category, component) to determine scope
- [ ] Report: "Migrating {N} components in {phases} phases"

### Step 2: Prepare Storybook Environment

If target project doesn't have Storybook yet:
- [ ] Run `sb-install` task (or delegate to workflow)
- [ ] Run `sb-configure` task

If Storybook exists:
- [ ] Verify `.storybook/main.ts` stories glob covers component locations
- [ ] Update glob if needed to include brownfield component paths

### Step 3: Process Phase by Phase

For each phase in the migration plan (respecting dependency order):

```
Phase 1 (atoms) → Phase 2 (molecules) → Phase 3 (organisms) → ...
```

Within each phase, process components in order of "most depended-on first" to maximize unblocking.

### Step 4: Analyze Each Component

For each component, determine story strategy based on complexity:

**4a. Simple Components (atoms, complexity 1-2)**
Strategy: Args-driven stories, minimal setup
```
Read component → extract props → generate meta + Default + Variants + Gallery
```

**4b. Composite Components (molecules, complexity 3-5)**
Strategy: Render function stories with composition
```
Read component → identify sub-components → compose render → add interaction stories
```

**4c. Complex Components (organisms, complexity 6-8)**
Strategy: Render function + decorators for context
```
Read component → identify context deps → create mock providers → compose stories
```

**4d. Context-Dependent Components (complexity 8+)**
Strategy: Full isolation with mocks and stubs

Identify and handle:
- **Router dependency:** Wrap with `MemoryRouter` or mock `useRouter`
- **Auth context:** Provide mock user object
- **API calls:** Mock with `msw` handlers or `fn()` stubs
- **Global state:** Provide mock store/context
- **Feature flags:** Provide default flag values

Create decorator or wrapper:
```typescript
// .storybook/decorators/with-providers.tsx
export const withProviders = (Story) => (
  <MockAuthProvider user={mockUser}>
    <MockRouterProvider>
      <Story />
    </MockRouterProvider>
  </MockAuthProvider>
);
```

### Step 5: Generate Story Files

For each component, generate story following CSF3 conventions:

```typescript
import type { Meta, StoryObj } from "{framework_adapter}";
import { {Component} } from "{import_path}";
// Additional imports for sub-components, icons, etc.

const meta = {
  title: "{Category}/{ComponentName}",
  component: {Component},
  tags: ["autodocs"],
  // parameters: { layout: "padded" } for layout components
  // decorators: [withProviders] for context-dependent components
} satisfies Meta<typeof {Component}>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { /* ... */ };
// Variant stories, gallery, interaction tests as needed
```

**Title hierarchy for brownfield:**

| Atomic Level | Title Pattern | Example |
|-------------|---------------|---------|
| Atom | `Atoms/{Subcategory}/{Name}` | `Atoms/Forms/Button` |
| Molecule | `Molecules/{Subcategory}/{Name}` | `Molecules/Overlays/Dialog` |
| Organism | `Organisms/{Domain}/{Name}` | `Organisms/Squads/SquadCard` |
| Template | `Templates/{Name}` | `Templates/AppShell` |
| Page | `Pages/{Name}` | `Pages/StudentDashboard` |

**Atomic Design Subcategories:**

| Level | Subcategories |
|-------|--------------|
| **Atoms** | Forms, Data Display, Layout, Feedback |
| **Molecules** | Overlays, Navigation, Forms, Data Display, Content |
| **Organisms** | By domain: Squads, Kanban, Stories, Monitor, Layout, Terminals, Bob, Agents |
| **Templates** | Flat (no subcategory) |
| **Pages** | Flat (no subcategory) |

**System vs Product boundary:**
- **System** (Atoms + Molecules): Reusable, no business logic, publishable to registry
- **Product** (Organisms + Templates + Pages): App-specific, domain logic, not reusable

### Step 6: Handle Cross-Project Migration (if applicable)

When `migration_mode=cross-project`:

**6a. Copy component file to target:**
```bash
cp {source_path}/{component}.tsx {target_path}/components/{category}/{component}.tsx
```

**6b. Adapt imports:**
- Rewrite relative imports to match new location
- Replace project-specific aliases (`@/` → new project alias)
- Verify all dependencies exist in target project
- Install missing npm packages

**6c. Resolve missing dependencies:**
- If component imports another component not yet in target → flag as blocked
- If component imports a util/hook → copy that too
- Track all copied files in adaptation_report

### Step 7: Verify Each Phase

After completing each phase:

- [ ] `npm run typecheck` — zero errors from new story files
- [ ] `npm run lint` — zero errors from new story files
- [ ] Storybook renders new stories without crashes

If errors found:
- Fix in the current phase before proceeding to next
- Document fixes in adaptation_report

### Step 8: Generate Adaptation Report

```markdown
# Brownfield Migration Report

## Summary
- **Total components scanned:** 95
- **Components migrated:** 95
- **Stories generated:** 95
- **Phases completed:** 10/10
- **Adaptations required:** 23

## Phase Results

### Phase 1: Atoms (18 components)
| Component | Story | Adaptations | Status |
|-----------|-------|-------------|--------|
| GlassButton | glass-button.stories.tsx | None | OK |
| Badge | badge.stories.tsx | None | OK |
...

### Phase 3: Organisms (30 components)
| Component | Story | Adaptations | Status |
|-----------|-------|-------------|--------|
| AgentCard | agent-card.stories.tsx | Mock: useAgentData hook | OK |
| ChatContainer | chat-container.stories.tsx | Mock: WebSocket, AuthContext | OK |
...

## Adaptations Applied
1. **AgentCard** — Mocked `useAgentData` hook with static fixture data
2. **ChatContainer** — Created `withChatProviders` decorator for WebSocket + Auth
3. **KanbanBoard** — Mocked drag-and-drop context (dnd-kit)
...

## Mock Files Created
- `.storybook/mocks/auth-provider.tsx`
- `.storybook/mocks/router-provider.tsx`
- `.storybook/mocks/agent-data.ts`
```

## Acceptance Criteria

- [ ] **AC-1:** Every component in the migration plan has a `.stories.tsx` file
- [ ] **AC-2:** Stories follow CSF3 with `satisfies Meta<typeof Component>`
- [ ] **AC-3:** `npm run typecheck` — zero errors
- [ ] **AC-4:** `npm run lint` — zero errors
- [ ] **AC-5:** All context-dependent components have mock decorators
- [ ] **AC-6:** Adaptation report documents every adaptation made

## Quality Gate

```yaml
quality_gate:
  id: "SB-BF-QG-001"
  name: "Brownfield Migration Gate"
  placement: "exit"
  type: "hybrid"
  severity: "blocking"

  criteria:
    - check: "coverage_ratio"
      field: "stories_generated / components_in_plan"
      value: 1.0
      operator: ">="
      weight: 40
    - check: "typecheck"
      field: "typecheck_exit_code"
      value: 0
      operator: "=="
      weight: 25
    - check: "lint"
      field: "lint_exit_code"
      value: 0
      operator: "=="
      weight: 25
    - check: "adaptation_documented"
      field: "all_adaptations_in_report"
      value: true
      operator: "=="
      weight: 10

  thresholds:
    pass: 100
    review: 80
    fail: 79
```

## Error Handling

### Component Crashes in Storybook
- **Trigger:** Component throws error without required context/provider
- **Detection:** Storybook shows error overlay
- **Recovery:** Identify missing context, create mock decorator, retry
- **Prevention:** Step 4 context analysis should catch most cases

### Import Resolution Fails (Cross-Project)
- **Trigger:** Copied component imports module not in target project
- **Detection:** TypeScript "Cannot find module" error
- **Recovery:** Copy missing dependency, or install npm package, or create stub
- **Prevention:** Step 6c dependency resolution

### Component Has Side Effects
- **Trigger:** Component makes API calls, mutates global state on mount
- **Detection:** Network errors or state warnings in Storybook console
- **Recovery:** Mock API calls with `msw` or `fn()`, provide inert context
- **Prevention:** Step 4 complexity analysis flags side effects

### Drag-and-Drop / Canvas / WebGL Components
- **Trigger:** Components using canvas, WebGL, or complex DOM APIs
- **Detection:** Blank render or "not supported" errors
- **Recovery:** Skip render stories, create visual-only stories with screenshots
- **Prevention:** Flag in inventory with `migration_notes: ["requires-canvas-mock"]`

## Dependencies

### Depends On (Upstream)
- `sb-brownfield-scan` - Scan Brownfield Components
  - Required output: component_inventory, migration_plan, dependency_graph

### Required By (Downstream)
- `sb-verify` - Verify Storybook Setup
  - Uses output: story_files

## Related Checklists

- `squads/design/checklists/component-adaptation-checklist.md`
- `squads/design/checklists/ds-migration-readiness-checklist.md`

## Handoff

| Attribute | Value |
|-----------|-------|
| **Next Task** | `sb-verify` |
| **Trigger** | All phases completed, adaptation report generated |
| **Executor** | @storybook-expert |

### Handoff Package
- **story_files**: List of all generated story file paths
- **mock_files**: List of mock/decorator files created
- **adaptation_report**: Full adaptation report
- **coverage**: Stories generated vs total components

## Veto Conditions

- Migrating organisms before their atom/molecule dependencies have stories
- Skipping context analysis for components with hooks
- Not documenting adaptations in the report
- Cross-project migration without resolving all import dependencies

---

_Task Version: 1.0.0_
_Pattern: HO-TP-001 (Task Anatomy Standard)_
_Last Updated: 2026-02-25_
_Compliant: Yes_
