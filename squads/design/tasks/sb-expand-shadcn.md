# Expand Shadcn Component Library

**Task ID:** `sb-expand-shadcn`
**Pattern:** HO-TP-001 (Task Anatomy Standard)
**Version:** 1.0.0
**Last Updated:** 2026-02-25

## Task Anatomy

| Field | Value |
|-------|-------|
| **task_name** | Expand Shadcn Component Library |
| **status** | `pending` |
| **responsible_executor** | @storybook-expert |
| **execution_type** | `Agent` |
| **input** | Project root, existing components list, target components list |
| **output** | All shadcn components installed in `src/components/ui/` |
| **action_items** | 6 steps |
| **acceptance_criteria** | 4 criteria |

## Overview

Install ALL shadcn/ui components (or a specified subset) via the shadcn CLI. Handles the full catalog (~45 components), detects already-installed components, applies known fixes for generated code issues, and preserves custom components.

## Input

- **project_root** (string)
  - Description: Absolute path to the project root
  - Required: Yes
- **components_json_path** (string)
  - Description: Path to `components.json` (shadcn config)
  - Required: Yes
  - Source: Detected from project root
- **target_scope** (string)
  - Description: What to install
  - Required: No
  - Default: `all`
  - Options: `all` (every available component), `missing` (only uninstalled), `list` (user-specified list)
- **component_list** (list)
  - Description: Specific components to install (only when target_scope=list)
  - Required: Only when target_scope=list
- **preserve_customizations** (boolean)
  - Description: Whether to backup custom components before shadcn overwrites them
  - Required: No
  - Default: `true`

## Output

- **installed_components** (list)
  - Description: List of all components now in `src/components/ui/`
- **overwritten_components** (list)
  - Description: Components that were overwritten by shadcn (had customizations)
- **applied_fixes** (list)
  - Description: Post-install fixes applied to generated code

## Action Items

### Step 1: Detect Current State

- [ ] Read `components.json` to confirm shadcn config (style, paths, aliases)
- [ ] Scan `src/components/ui/` for existing component files
- [ ] Identify custom components (files not matching shadcn catalog)
- [ ] Build delta list: catalog minus existing = components to install

**Full shadcn/ui Catalog (reference):**
```
accordion, alert, alert-dialog, aspect-ratio, avatar, badge, breadcrumb,
button, calendar, card, carousel, chart, checkbox, collapsible, command,
context-menu, dialog, drawer, dropdown-menu, hover-card, input, input-otp,
label, menubar, navigation-menu, pagination, popover, progress, radio-group,
resizable, scroll-area, select, separator, sheet, sidebar, skeleton, slider,
sonner, switch, table, tabs, textarea, toggle, toggle-group, tooltip
```

### Step 2: Backup Custom Components

If `preserve_customizations=true`:
- [ ] Identify files with custom exports beyond standard shadcn API
- [ ] Create backup: `cp {file}.tsx {file}.tsx.backup` for each custom file
- [ ] Document what was customized in handoff notes

**Known customization risks:**
- `skeleton.tsx` — shadcn overwrites custom variants (SkeletonCard, SkeletonAvatar, etc.)
- `button.tsx` — projects often add custom variants beyond default shadcn set
- `badge.tsx` — custom variant extensions are common

### Step 3: Install Components

```bash
npx shadcn@latest add {component_list}
```

For `target_scope=all`, install in batches to avoid CLI timeouts:

**Batch 1 — Forms:**
```bash
npx shadcn@latest add input label select textarea checkbox switch radio-group slider toggle toggle-group
```

**Batch 2 — Data Display:**
```bash
npx shadcn@latest add table tabs card avatar badge skeleton separator scroll-area progress
```

**Batch 3 — Overlays:**
```bash
npx shadcn@latest add dialog dropdown-menu tooltip popover sheet drawer hover-card alert-dialog command menubar context-menu navigation-menu
```

**Batch 4 — Utility & Layout:**
```bash
npx shadcn@latest add accordion alert aspect-ratio breadcrumb calendar carousel chart collapsible input-otp pagination resizable sidebar sonner
```

**Notes:**
- The shadcn CLI automatically installs required Radix dependencies
- Each `add` command may modify `package.json` (new Radix packages)
- If a component already exists, shadcn CLI will prompt to overwrite (use `--overwrite` flag or answer yes)

### Step 4: Apply Known Fixes

After installation, scan generated files for known issues:

**Fix 1: sidebar.tsx purity error**
- **Issue:** `React.useMemo(() => Math.random()...)` violates React strict mode (side effect in useMemo)
- **Fix:** Change to `React.useState(() => Math.random()...)[0]`
- **Detection:** Search for `Math.random` in `useMemo`

**Fix 2: eslint violations**
- **Issue:** Some generated files may have unused imports or variables
- **Detection:** Run `npm run lint` and check for errors in `src/components/ui/`
- **Fix:** Remove unused imports, fix lint errors

**Fix 3: TypeScript strict mode**
- **Issue:** Some generated files may have implicit `any` types
- **Detection:** Run `npm run typecheck`
- **Fix:** Add explicit types where needed

### Step 5: Restore Custom Components

If backups were created in Step 2:
- [ ] Compare backup with new file to identify lost customizations
- [ ] Merge custom exports back into new shadcn base (if compatible)
- [ ] Or restore backup entirely if merge is too risky
- [ ] Delete .backup files after resolution

### Step 6: Verify Installation

- [ ] All target components exist in `src/components/ui/`
- [ ] `npm run typecheck` passes with zero errors
- [ ] `npm run lint` passes with zero errors
- [ ] No broken imports in existing code

## Acceptance Criteria

- [ ] **AC-1:** All target components installed in `src/components/ui/`
- [ ] **AC-2:** `npm run typecheck` — zero errors
- [ ] **AC-3:** `npm run lint` — zero errors
- [ ] **AC-4:** Custom component functionality preserved (if applicable)

## Error Handling

### Shadcn CLI Fails
- **Trigger:** `npx shadcn@latest add` exits with error
- **Detection:** Non-zero exit code
- **Recovery:** Check for missing `components.json`, verify Tailwind config, try individual component install instead of batch
- **Prevention:** Step 1 validates components.json exists

### Component Overwrites Custom Code
- **Trigger:** Shadcn CLI replaces a customized component file
- **Detection:** Step 2 backup comparison
- **Recovery:** Restore from .backup file, manually merge if needed
- **Prevention:** Step 2 creates backups before install

### Radix Version Conflicts
- **Trigger:** New Radix packages conflict with existing ones
- **Detection:** npm/pnpm warns about peer dependency conflicts
- **Recovery:** Run package manager with `--legacy-peer-deps` or use resolutions
- **Prevention:** Check existing Radix versions before bulk install

## Dependencies

### Depends On (Upstream)

- `sb-configure` - Configure Storybook
  - Required output: Working Storybook configuration

### Required By (Downstream)

- `sb-generate-all-stories` - Generate All Stories
  - Uses output: installed_components list

## Related Checklists

- `squads/design/checklists/ds-component-quality-checklist.md`
- `squads/design/checklists/ds-migration-readiness-checklist.md`

## Handoff

| Attribute | Value |
|-----------|-------|
| **Next Task** | `sb-generate-all-stories` |
| **Trigger** | All acceptance criteria met |
| **Executor** | @storybook-expert |

### Handoff Package

- **installed_components**: Complete list of components in `src/components/ui/`
- **overwritten_components**: Components that had customizations overwritten
- **applied_fixes**: Post-install fixes applied
- **custom_components**: Files not from shadcn catalog (project-specific)

---

_Task Version: 1.0.0_
_Pattern: HO-TP-001 (Task Anatomy Standard)_
_Last Updated: 2026-02-25_
_Compliant: Yes_
