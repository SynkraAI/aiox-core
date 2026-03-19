# Install Storybook

**Task ID:** `sb-install`
**Pattern:** HO-TP-001 (Task Anatomy Standard)
**Version:** 1.0.0
**Last Updated:** 2026-02-25

## Task Anatomy

| Field | Value |
|-------|-------|
| **task_name** | Install Storybook |
| **status** | `pending` |
| **responsible_executor** | @storybook-expert |
| **execution_type** | `Agent` |
| **input** | Project root path, package manager (npm/pnpm/bun) |
| **output** | Storybook packages installed as devDependencies |
| **action_items** | 5 steps |
| **acceptance_criteria** | 4 criteria |

## Overview

Install Storybook with the `nextjs-vite` framework and all required addons as devDependencies. This task handles package installation only — configuration is handled by `sb-configure`.

## Input

- **project_root** (string)
  - Description: Absolute path to the project root (where package.json lives)
  - Required: Yes
- **package_manager** (string)
  - Description: Package manager to use (`npm`, `pnpm`, or `bun`)
  - Required: Yes
  - Default: Detected from lockfile
- **storybook_version** (string)
  - Description: Storybook major version to install
  - Required: No
  - Default: `latest` (currently v10)

## Output

- **installed_packages** (list)
  - Description: List of installed devDependencies
  - Destination: `package.json` devDependencies

## Action Items

### Step 1: Detect Project Environment

Read `package.json` to identify:
- [ ] Framework (Next.js, Vite, React)
- [ ] Existing Storybook packages (if any — abort if already installed)
- [ ] Package manager (from lockfile: package-lock.json → npm, pnpm-lock.yaml → pnpm, bun.lockb → bun)
- [ ] TypeScript version

### Step 2: Determine Package Set

Based on framework detection, select packages:

**Core (always required):**
```
storybook
```

**Framework adapter (select ONE):**

| Framework | Adapter Package |
|-----------|----------------|
| Next.js + Vite | `@storybook/nextjs-vite` |
| Next.js + Webpack | `@storybook/nextjs` |
| Vite (standalone) | `@storybook/react-vite` |
| Webpack (standalone) | `@storybook/react-webpack5` |

**Addons (recommended set):**
```
@storybook/addon-docs
@storybook/addon-a11y
@storybook/addon-themes
@storybook/addon-vitest
@chromatic-com/storybook
```

**Notes:**
- In Storybook v10+, `@storybook/test` is bundled as `storybook/test` — do NOT install separately
- Types (`Meta`, `StoryObj`, `Preview`) import from the framework adapter, NOT from `storybook`

### Step 3: Install Packages

```bash
{package_manager} install -D storybook {framework_adapter} @storybook/addon-docs @storybook/addon-a11y @storybook/addon-themes @storybook/addon-vitest @chromatic-com/storybook
```

If peer dependency conflicts occur:
- Try `--legacy-peer-deps` (npm) or `--no-strict-peer-deps` (pnpm)
- Document which flag was needed

### Step 4: Verify Installation

- [ ] All packages appear in `devDependencies`
- [ ] No duplicate Storybook packages at different major versions
- [ ] `npx storybook --version` returns installed version

### Step 5: Add Scripts to package.json

Add to `scripts`:
```json
{
  "storybook": "storybook dev -p 6006",
  "build-storybook": "storybook build"
}
```

## Acceptance Criteria

- [ ] **AC-1:** All required packages installed as devDependencies
- [ ] **AC-2:** No peer dependency errors in install output
- [ ] **AC-3:** `storybook` and `build-storybook` scripts present in package.json
- [ ] **AC-4:** `npx storybook --version` returns correct version

## Error Handling

### Peer Dependency Conflict
- **Trigger:** npm/pnpm rejects install due to peer dep mismatch
- **Detection:** Exit code != 0 with "ERESOLVE" or "peer dep" in output
- **Recovery:** Retry with `--legacy-peer-deps`. If still fails, check for `@storybook/test` as separate package (remove it — bundled in v10)
- **Prevention:** Always check for existing Storybook packages before installing

### Framework Adapter Wrong Choice
- **Trigger:** Project uses Vite but nextjs adapter selected (or vice versa)
- **Detection:** Build fails with "Cannot find module" for framework-specific APIs
- **Recovery:** Uninstall wrong adapter, install correct one based on framework detection
- **Prevention:** Step 1 framework detection is mandatory

## Related Checklists

- `squads/design/checklists/ds-migration-readiness-checklist.md`
- `squads/design/checklists/ds-component-quality-checklist.md`

## Handoff

| Attribute | Value |
|-----------|-------|
| **Next Task** | `sb-configure` |
| **Trigger** | All acceptance criteria met |
| **Executor** | @storybook-expert |

### Handoff Package

- **installed_packages**: List of package names and versions installed
- **framework_adapter**: Which adapter was selected
- **package_manager**: Which PM was used

---

_Task Version: 1.0.0_
_Pattern: HO-TP-001 (Task Anatomy Standard)_
_Last Updated: 2026-02-25_
_Compliant: Yes_
