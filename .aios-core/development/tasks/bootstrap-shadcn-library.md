# Bootstrap Shadcn/Radix Component Library

> Task ID: atlas-bootstrap-shadcn  
> Agent: Atlas (Design System Builder)  
> Version: 2.0.0

## Execution Modes

**Choose your execution mode:**

### 1. YOLO Mode - Fast, Autonomous (0-1 prompts)
- Autonomous decision making with logging
- Minimal user interaction
- **Best for:** Simple, deterministic tasks

### 2. Interactive Mode - Balanced, Educational (5-10 prompts) **[DEFAULT]**
- Explicit decision checkpoints
- Educational explanations
- **Best for:** Learning, complex decisions

### 3. Pre-Flight Planning - Comprehensive Upfront Planning
- Task analysis phase (identify all ambiguities)
- Zero ambiguity execution
- **Best for:** Ambiguous requirements, critical work

**Parameter:** `mode` (optional, default: `interactive`)

---

## Task Definition (AIOS Task Format V1.0)

```yaml
task: bootstrapShadcnLibrary()
responsavel: Atlas (Design System Builder)
responsavel_type: Agente
atomic_layer: Config

**Entrada:**
- campo: project_path
  tipo: string
  origem: User Input
  obrigatorio: true
  validacao: Valid path to a Next.js project root with package.json

- campo: components
  tipo: array
  origem: User Input
  obrigatorio: false
  validacao: Default [button, input, card, dialog]. Component names from shadcn registry

- campo: style
  tipo: string
  origem: User Input
  obrigatorio: false
  validacao: Default 'new-york'. Options 'new-york' or 'default'

- campo: base_color
  tipo: string
  origem: User Input
  obrigatorio: false
  validacao: Default 'slate'. Options slate, gray, zinc, neutral, stone

**Saida:**
- campo: config_file
  tipo: string
  destino: File (components.json)
  persistido: true

- campo: utility_file
  tipo: string
  destino: File (lib/utils.ts)
  persistido: true

- campo: component_files
  tipo: array
  destino: File system (components/ui/*.tsx)
  persistido: true

- campo: setup_report
  tipo: object
  destino: Console
  persistido: false
```

---

## Pre-Conditions

**Purpose:** Validate prerequisites BEFORE task execution (blocking)

**Checklist:**

```yaml
pre-conditions:
  - [ ] Next.js installed (next in package.json dependencies)
    tipo: pre-condition
    blocker: true
    validacao: |
      Check package.json exists at project root and 'next' appears in dependencies or devDependencies
    error_message: "Pre-condition failed: Next.js not found. Install with 'npm install next react react-dom'"

  - [ ] Tailwind CSS v4+ configured
    tipo: pre-condition
    blocker: true
    validacao: |
      Check for tailwind.config.ts/js or tailwind CSS imports in globals.css/app.css
    error_message: "Pre-condition failed: Tailwind CSS not configured. Install and configure Tailwind first"

  - [ ] TypeScript configured (tsconfig.json with path aliases)
    tipo: pre-condition
    blocker: true
    validacao: |
      Check tsconfig.json exists with compilerOptions.paths including @/* alias
    error_message: "Pre-condition failed: TypeScript must be configured with @/ path alias in tsconfig.json"

  - [ ] Node.js >= 18 available
    tipo: pre-condition
    blocker: true
    validacao: |
      Run node --version and verify major version >= 18
    error_message: "Pre-condition failed: Node.js 18+ required for shadcn CLI"
```

---

## Post-Conditions

**Purpose:** Validate execution success AFTER task completes

**Checklist:**

```yaml
post-conditions:
  - [ ] components.json created with valid shadcn configuration
    tipo: post-condition
    blocker: true
    validacao: |
      Verify components.json exists at project root with style, rsc, tsx, and aliases fields
    error_message: "Post-condition failed: shadcn configuration file not created or invalid"

  - [ ] All requested components installed as .tsx files in components/ui/
    tipo: post-condition
    blocker: true
    validacao: |
      Verify each requested component has a corresponding .tsx file in components/ui/ directory
    error_message: "Post-condition failed: One or more components not installed"

  - [ ] cn() utility function available at lib/utils.ts
    tipo: post-condition
    blocker: true
    validacao: |
      Verify lib/utils.ts exists and exports cn function using clsx + tailwind-merge
    error_message: "Post-condition failed: cn() utility not available"

  - [ ] TypeScript compilation passes with zero errors
    tipo: post-condition
    blocker: true
    validacao: |
      Run tsc --noEmit and verify zero errors related to installed components
    error_message: "Post-condition failed: TypeScript errors in installed shadcn components"
```

---

## Acceptance Criteria

**Purpose:** Definitive pass/fail criteria for task completion

**Checklist:**

```yaml
acceptance-criteria:
  - [ ] shadcn init configuration complete with RSC and CSS variables enabled
    tipo: acceptance-criterion
    blocker: true
    validacao: |
      Assert components.json has rsc:true, cssVariables:true, and aliases for components, utils, and ui
    error_message: "Acceptance criterion not met: shadcn init configuration incomplete"

  - [ ] Base components (button, input, card, dialog) installed and importable
    tipo: acceptance-criterion
    blocker: true
    validacao: |
      Assert each base component exports a valid React component and can be imported via @/components/ui/{name}
    error_message: "Acceptance criterion not met: Base components not properly installed"

  - [ ] Design system tokens applied to CSS variables (or shadcn defaults present)
    tipo: acceptance-criterion
    blocker: true
    validacao: |
      Assert globals.css contains :root with --primary, --secondary, --background, --foreground CSS variables
    error_message: "Acceptance criterion not met: Theme CSS variables not configured"

  - [ ] Barrel export created for easy component importing
    tipo: acceptance-criterion
    blocker: false
    validacao: |
      Assert components/ui/index.ts exists with re-exports for all installed components
    error_message: "Warning: Barrel export not created. Components must be imported individually"
```

---

## Tools

**External/shared resources used by this task:**

- **Tool:** shadcn-cli
  - **Purpose:** Initialize project and install components from shadcn registry
  - **Source:** npx shadcn@latest

- **Tool:** npm
  - **Purpose:** Install utility dependencies (clsx, tailwind-merge, cva)
  - **Source:** npm CLI

- **Tool:** file-system
  - **Purpose:** Read/write configuration, verify installed files
  - **Source:** Node.js fs module

---

## Scripts

**Agent-specific code for this task:**

- **Script:** bootstrap-shadcn.js
  - **Purpose:** Automated shadcn initialization, component installation, and token mapping
  - **Language:** JavaScript
  - **Location:** .aios-core/scripts/bootstrap-shadcn.js

---

## Error Handling

**Strategy:** retry

**Common Errors:**

1. **Error:** Next.js Not Found
   - **Cause:** Project does not have Next.js installed
   - **Resolution:** Install Next.js: npm install next react react-dom
   - **Recovery:** Exit with setup instructions

2. **Error:** Tailwind Not Configured
   - **Cause:** Tailwind CSS not installed or missing config file
   - **Resolution:** Install and configure Tailwind CSS for Next.js
   - **Recovery:** Provide step-by-step Tailwind setup guide

3. **Error:** shadcn Init Failed
   - **Cause:** Incompatible project structure or missing dependencies
   - **Resolution:** Check project structure matches App Router conventions
   - **Recovery:** Manual components.json creation with documented defaults

4. **Error:** Component Install Failed
   - **Cause:** Network error, component not in registry, or version mismatch
   - **Resolution:** Check network, verify component name in shadcn docs
   - **Recovery:** Retry once with --overwrite; skip component with warning

5. **Error:** TypeScript Path Alias Error
   - **Cause:** @/ alias not configured or pointing to wrong directory
   - **Resolution:** Fix tsconfig.json paths to include "@/*": ["./src/*"] or ["./app/*"]
   - **Recovery:** Show specific TS error, suggest tsconfig fix

---

## Performance

**Expected Metrics:**

```yaml
duration_expected: 2-10 min (estimated)
cost_estimated: $0.001-0.008
token_usage: ~800-2,500 tokens
```

**Optimization Notes:**
- Validate prerequisites early (fail fast); batch component installs; parallel npm + file operations

---

## Metadata

```yaml
story: N/A
version: 2.0.0
dependencies:
  - N/A
tags:
  - design-system
  - shadcn
  - setup
  - component-library
  - radix
updated_at: 2026-04-10
```

---


## Description

Install and curate a Shadcn UI component library leveraging Tailwind v4, Radix primitives, and project design tokens. Establish shared utilities (`cn`, `cva`), Spinner/loading patterns, and documentation scaffold.

## Prerequisites

- Tailwind v4 configured with tokens (`@theme` + dark mode)
- React/Next.js project with TypeScript
- Node.js >= 18
- Storybook (optional but recommended)

## Workflow

### Interactive Elicitation

This task uses interactive elicitation to configure the setup.

1. **Verify Project Setup**
   - Detect Next.js version and router type (App/Pages)
   - Detect Tailwind CSS version and configuration
   - Verify TypeScript path aliases (@/ configured)
   - Show detected configuration for confirmation

2. **Configure shadcn Preferences**
   - Style preset: new-york (default) or default
   - Base color: slate, gray, zinc, neutral, stone
   - CSS variables: yes (recommended)
   - React Server Components: yes (default for App Router)
   - Component directory: components/ui/ (default)

3. **Select Base Components**
   - Default set: button, input, card, dialog
   - Ask for additional components
   - Show dependency tree (dialog needs button)
   - Confirm final component list

### Steps

1. **Validate Project Prerequisites**
   - Check package.json for Next.js dependency
   - Check for Tailwind CSS configuration
   - Verify tsconfig.json exists with baseUrl and paths
   - Check Node.js version >= 18
   - Validation: All prerequisites met

2. **Configure Path Aliases**
   - Verify @/ alias in tsconfig.json points to src/ or app/
   - If missing, add paths configuration
   - Verify alias resolves correctly
   - Validation: @/ import alias configured

3. **Initialize Shadcn CLI**
   ```bash
   npx shadcn@latest init
   ```
   - Configure paths (`components`, `lib/utils.ts`)
   - Enable TypeScript + Tailwind + Radix defaults
   - Enable CSS variables and RSC support
   - Validation: components.json created

4. **Install Core Utilities**
   - Ensure `cn` helper uses `clsx` + `tailwind-merge`
   - Install class-variance-authority for cva
   - Add `Spinner` component for loading states
   - Validation: Utilities importable from @/lib/utils

5. **Install Base Components**
   ```bash
   npx shadcn@latest add button input card textarea badge skeleton dialog
   ```
   - Resolve dependency order (button before dialog)
   - Verify each file created in components/ui/
   - Validation: All requested components installed

6. **Map to Design Tokens**
   - If design tokens exist (from *tokenize): map to CSS variables
   - Replace hardcoded colors with semantic token classes (`bg-primary`, etc.)
   - Align spacing/typography with design system scale
   - Add dark mode variants (`dark:bg-background`)
   - If no tokens: use shadcn defaults
   - Validation: CSS variables render correctly

7. **Radix Integration Verification**
   - Install Radix primitives as required (`@radix-ui/react-slot`, etc.)
   - Verify accessibility attributes and focus management intact
   - Validation: Radix primitives functional

8. **Variant and Utility Enhancements**
   - Extend `cva` definitions to match project variants (density, destructive, ghost)
   - Add shared loading pattern (Spinner + `isLoading` prop)
   - Introduce compound variants for icon buttons, destructive actions
   - Validation: Extended variants compile and render

9. **Create Barrel Export**
   - Create components/ui/index.ts with re-exports for all installed components
   - Verify barrel import works from consuming code
   - Validation: Components importable via barrel

10. **Verify TypeScript Compilation**
    - Run tsc --noEmit
    - Fix any path alias or type errors
    - Validation: Zero TypeScript errors

11. **Documentation and Storybook**
    - Create brief docs for each component (docs/components/)
    - Optional: Add Storybook stories using auto-generated stories from *build-component task
    - Validation: Docs created or Storybook renders

12. **Update State**
    - Append to `.state.yaml` (`tooling.shadcn`) with components installed, timestamp
    - Record style preset, base color, and any local overrides
    - Validation: State file updated

## Deliverables

- Populated `components/ui/` directory with Shadcn components
- Updated `lib/utils.ts` (`cn`, `formatNumber`, etc. if needed)
- `components.json` shadcn configuration
- Barrel export `components/ui/index.ts`
- Component documentation and Storybook stories (optional)
- `.state.yaml` entries for `tooling.shadcn`

## Success Criteria

- [ ] Shadcn CLI initialized with Tailwind v4-compatible paths
- [ ] Core components (button/input/card/dialog minimum) installed and tokenized
- [ ] `cn` helper + `class-variance-authority` configured and importable
- [ ] Spinner/loading pattern standardized across components
- [ ] TypeScript compilation passes with zero errors
- [ ] Barrel export created for easy importing
- [ ] Documentation/Storybook updated with usage examples
- [ ] `.state.yaml` reports bootstrap timestamp and component list

## Error Handling

- **CLI install failure**: Delete partial files, rerun `npx shadcn@latest init`
- **Radix import mismatch**: Align versions with lockfile, reinstall packages
- **Token mismatch**: Regenerate Tailwind classes or add missing semantic tokens
- **Storybook build failure**: Update Storybook to latest (v8+) and re-run
- **Network failure during install**: Cache components locally, retry with backoff

## Security Considerations

- Verify shadcn package source (npmjs.com/package/shadcn)
- Run npm audit after installing dependencies
- No arbitrary code execution during setup
- Validate all npm packages before installation

## Notes

- Prefer named exports (`export { Button }`) for tree-shaking
- Maintain parity between Shadcn variants and design token aliases
- Document manual updates (Shadcn is copy/paste -- no automatic updates)
- Schedule regular audits to pull upstream improvements intentionally
- Atlas recommends: Run *audit after bootstrap to establish baseline metrics
