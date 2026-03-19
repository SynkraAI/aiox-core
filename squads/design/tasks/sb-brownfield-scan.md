# Scan Brownfield Components

**Task ID:** `sb-brownfield-scan`
**Pattern:** HO-TP-001 (Task Anatomy Standard)
**Version:** 1.0.0
**Last Updated:** 2026-02-25

## Task Anatomy

| Field | Value |
|-------|-------|
| **task_name** | Scan Brownfield Components |
| **status** | `pending` |
| **responsible_executor** | @storybook-expert |
| **execution_type** | `Agent` |
| **input** | Source codebase path, file extensions, exclusion patterns |
| **output** | Component inventory JSON with classification and dependency map |
| **action_items** | 7 steps |
| **acceptance_criteria** | 5 criteria |

## Overview

Walk an existing (brownfield) codebase and produce a complete component inventory. For each component: identify name, location, exported API (props), dependencies, atomic classification (atom/molecule/organism/template/page), and complexity score. This inventory feeds the migration pipeline that generates Storybook stories for every component.

Works on ANY React/Next.js codebase — source and target can be the same project or different projects.

## Input

- **source_path** (string)
  - Description: Root path to scan for components (e.g., `./aiox-platform/src/components`)
  - Required: Yes
- **file_extensions** (list)
  - Description: File extensions to include
  - Required: No
  - Default: `["tsx", "jsx"]`
- **exclude_patterns** (list)
  - Description: Glob patterns to exclude from scan
  - Required: No
  - Default: `["*.stories.*", "*.test.*", "*.spec.*", "**/__tests__/**", "**/node_modules/**"]`
- **target_storybook** (string)
  - Description: Path to the target Storybook project (can be same project or different)
  - Required: No
  - Default: Same project as source
- **scan_mode** (enum)
  - Description: How deep to scan
  - Required: No
  - Default: `full`
  - Options: `full` (all files), `components-only` (only files in `components/` dirs), `exports-only` (only files with React component exports)

## Output

- **component_inventory** (JSON)
  - Description: Complete inventory of all components found
  - Destination: `outputs/design-system/{project}/brownfield/component-inventory.json`
  - Format: See schema below
- **migration_plan** (Markdown)
  - Description: Prioritized migration plan with phases
  - Destination: `outputs/design-system/{project}/brownfield/migration-plan.md`
- **dependency_graph** (JSON)
  - Description: Component dependency tree
  - Destination: `outputs/design-system/{project}/brownfield/dependency-graph.json`

### Output Schema: component_inventory

```json
{
  "scan_metadata": {
    "source_path": "string",
    "scan_date": "ISO-8601",
    "total_files_scanned": "number",
    "total_components_found": "number",
    "scan_duration_ms": "number"
  },
  "components": [
    {
      "name": "GlassCard",
      "file_path": "src/components/ui/glass-card.tsx",
      "exports": ["GlassCard", "GlassCardHeader", "GlassCardContent"],
      "props": {
        "GlassCard": {
          "variant": { "type": "union", "values": ["default", "elevated", "flat"] },
          "className": { "type": "string", "optional": true }
        }
      },
      "atomic_level": "molecule",
      "category": "ui",
      "dependencies": {
        "internal": ["Button", "Badge"],
        "external": ["@radix-ui/react-slot", "class-variance-authority"]
      },
      "has_variants": true,
      "variant_count": 3,
      "has_story": false,
      "complexity_score": 3,
      "lines_of_code": 85,
      "migration_notes": []
    }
  ],
  "categories": {
    "ui": { "count": 18, "components": ["GlassCard", "GlassButton", "..."] },
    "layout": { "count": 6, "components": ["Sidebar", "Header", "..."] },
    "agents": { "count": 8, "components": ["AgentCard", "..."] }
  },
  "atomic_distribution": {
    "atom": 12,
    "molecule": 25,
    "organism": 30,
    "template": 8,
    "page": 5
  },
  "migration_phases": [
    {
      "phase": 1,
      "name": "Atoms & Primitives",
      "components": ["Button", "Badge", "Avatar", "Input", "Label"],
      "priority": "critical",
      "rationale": "Foundation — other components depend on these"
    }
  ]
}
```

## Action Items

### Step 1: Validate Source Path

- [ ] Verify `source_path` exists and is readable
- [ ] Count total files matching `file_extensions`
- [ ] Report: "Found {N} files to scan in {path}"
- [ ] If 0 files found, abort with guidance on correct path

### Step 2: Scan for Component Files

Walk the directory tree and identify files that export React components:

```bash
# Find all TSX/JSX files (excluding test/story files)
find {source_path} -type f \( -name "*.tsx" -o -name "*.jsx" \) \
  ! -name "*.stories.*" ! -name "*.test.*" ! -name "*.spec.*" \
  ! -path "*/__tests__/*" ! -path "*/node_modules/*"
```

For each file, determine if it exports a React component by checking for:
- `export function {Name}` or `export const {Name}` with JSX return
- `export default function` with JSX return
- `React.forwardRef` usage
- `React.FC` or `React.ComponentType` type annotations

### Step 3: Extract Component Metadata

For each component file, extract:

**3a. Exports:**
- Named exports: `export { Button, ButtonProps }`
- Default exports: `export default Button`
- Sub-component exports: `DialogTrigger`, `DialogContent`, etc.

**3b. Props Interface:**
- TypeScript interfaces/types for props
- CVA variants (if using class-variance-authority)
- Default prop values

**3c. Dependencies:**
- Internal imports: other components from the same project
- External imports: npm packages (Radix, etc.)
- Context dependencies: providers, hooks that need wrapping

**3d. Complexity Indicators:**
- Lines of code
- Number of hooks used
- Number of internal dependencies
- Uses context/providers
- Has side effects (API calls, subscriptions)
- Requires global state

### Step 4: Classify by Atomic Level

Apply atomic design classification heuristics:

| Level | Heuristics | Examples |
|-------|-----------|----------|
| **Atom** | No internal component deps, single responsibility, <80 LOC, 0-2 props | Button, Badge, Avatar, Input, Label, Separator, Skeleton |
| **Molecule** | Uses 2-3 atoms, single purpose, <150 LOC | InputWithLabel, CardHeader, NavItem, SearchBar |
| **Organism** | Uses multiple molecules/atoms, section-level, distinct business function | AgentCard, KanbanColumn, ChatContainer, Sidebar |
| **Template** | Layout skeleton, defines content areas, no business logic | AppLayout, DashboardLayout, AuthLayout |
| **Page** | Full page, connects to data, has routing context | AgentExplorer, KanbanBoard, DashboardPage |

**Classification Algorithm:**
```
IF internal_deps == 0 AND loc < 80 → atom
ELIF internal_deps <= 3 AND loc < 150 → molecule
ELIF internal_deps <= 8 AND has_business_logic → organism
ELIF is_layout AND defines_content_areas → template
ELIF connects_to_data OR has_routing → page
ELSE → organism (default)
```

### Step 5: Detect Existing Stories

Check if each component already has a `.stories.tsx` file:
- Co-located: `{component}.stories.tsx` next to component
- Separate dir: `stories/{component}.stories.tsx`
- Legacy: `__stories__/{component}.stories.tsx`

Mark `has_story: true/false` in inventory.

### Step 6: Build Dependency Graph

Map which components depend on which:

```json
{
  "AgentCard": {
    "depends_on": ["Badge", "Avatar", "Button"],
    "depended_by": ["AgentList", "AgentExplorer"]
  }
}
```

This determines migration order: atoms first (no deps), then molecules (depend on atoms), then organisms, etc.

### Step 7: Generate Migration Plan

Based on inventory + dependency graph, produce phased migration plan:

**Phase ordering rules:**
1. Components with 0 internal deps first (atoms)
2. Components whose ALL deps are already migrated (molecules)
3. Continue up the dependency tree (organisms → templates → pages)
4. Within each phase, sort by: most depended-on first (maximize unblocking)

**Categories:** Group components by domain (ui, layout, agents, chat, kanban, etc.) based on directory structure or naming patterns.

**Output format:**

```markdown
# Brownfield Migration Plan

## Phase 1: Atoms & Primitives (18 components)
Priority: CRITICAL — foundation for all other components

| Component | File | Deps | Depended By | Complexity |
|-----------|------|------|-------------|------------|
| Button | src/ui/button.tsx | 0 | 42 | 2 |
| Badge | src/ui/badge.tsx | 0 | 15 | 1 |
...

## Phase 2: Molecules (25 components)
Priority: HIGH — compose atoms into reusable patterns
...
```

## Acceptance Criteria

- [ ] **AC-1:** `component-inventory.json` contains ALL component files in scan path
- [ ] **AC-2:** Each component has atomic_level classification
- [ ] **AC-3:** Each component has dependency map (internal + external)
- [ ] **AC-4:** `migration-plan.md` has phased plan ordered by dependency tree
- [ ] **AC-5:** `dependency-graph.json` is complete and acyclic

## Error Handling

### Circular Dependencies
- **Trigger:** Component A imports B, B imports A
- **Detection:** Graph cycle detection during Step 6
- **Recovery:** Flag circular pair, classify both at same phase level, note in migration_notes
- **Prevention:** Common in brownfield — expected, not a blocker

### Non-Component Files in Scan
- **Trigger:** File exports hooks, utils, types but no React component
- **Detection:** Step 2 JSX/component detection
- **Recovery:** Skip file, do not include in component inventory
- **Prevention:** Filter by component export patterns

### Very Large Codebases (500+ files)
- **Trigger:** Scan takes too long or produces unwieldy output
- **Detection:** File count > 500 in Step 1
- **Recovery:** Use `scan_mode=components-only` to focus on component directories
- **Prevention:** Ask user to narrow `source_path` to component directories

## Dependencies

### Depends On (Upstream)
- None (entry point task)

### Required By (Downstream)
- `sb-brownfield-migrate` - Migrate Brownfield Components
  - Uses output: component_inventory, migration_plan, dependency_graph

## Related Checklists

- `squads/design/checklists/ds-migration-readiness-checklist.md`
- `squads/design/checklists/ds-pattern-audit-checklist.md`

## Handoff

| Attribute | Value |
|-----------|-------|
| **Next Task** | `sb-brownfield-migrate` |
| **Trigger** | Inventory and migration plan generated |
| **Executor** | @storybook-expert |

### Handoff Package
- **component_inventory**: Full JSON inventory
- **migration_plan**: Phased markdown plan
- **dependency_graph**: Component dependency tree
- **total_components**: Count of components found
- **total_with_stories**: Count that already have stories
- **migration_gap**: Components needing stories

## Veto Conditions

- Classifying ALL components as "organism" without heuristic analysis
- Ignoring dependency order in migration plan (atoms MUST come first)
- Skipping components because they "look complex"
- Generating migration plan without dependency graph

---

_Task Version: 1.0.0_
_Pattern: HO-TP-001 (Task Anatomy Standard)_
_Last Updated: 2026-02-25_
_Compliant: Yes_
