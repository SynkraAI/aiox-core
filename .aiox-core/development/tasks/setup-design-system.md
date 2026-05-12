# Setup Design System Structure

> Task ID: atlas-setup-design-system
> Agent: Atlas (Design System Builder)
> Version: 1.0.0

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

## Task Definition (AIOX Task Format V1.0)

```yaml
task: setupDesignSystem()
responsável: Uma (Empathizer)
responsavel_type: Agente
atomic_layer: Config

**Entrada:**
- campo: project_path
  tipo: string
  origem: User Input
  obrigatório: true
  validação: Valid directory path

- campo: options
  tipo: object
  origem: User Input
  obrigatório: false
  validação: Initialization options

**Saída:**
- campo: initialized_project
  tipo: string
  destino: File system
  persistido: true

- campo: config_created
  tipo: boolean
  destino: Return value
  persistido: false
```

---

## Pre-Conditions

**Purpose:** Validate prerequisites BEFORE task execution (blocking)

**Checklist:**

```yaml
pre-conditions:
  - [ ] Directory is empty or force flag set; config valid
    tipo: pre-condition
    blocker: true
    validação: |
      Check directory is empty or force flag set; config valid
    error_message: "Pre-condition failed: Directory is empty or force flag set; config valid"
```

---

## Post-Conditions

**Purpose:** Validate execution success AFTER task completes

**Checklist:**

```yaml
post-conditions:
  - [ ] Project initialized; config files created; structure valid
    tipo: post-condition
    blocker: true
    validação: |
      Verify project initialized; config files created; structure valid
    error_message: "Post-condition failed: Project initialized; config files created; structure valid"
```

---

## Acceptance Criteria

**Purpose:** Definitive pass/fail criteria for task completion

**Checklist:**

```yaml
acceptance-criteria:
  - [ ] Project structure correct; all config files valid
    tipo: acceptance-criterion
    blocker: true
    validação: |
      Assert project structure correct; all config files valid
    error_message: "Acceptance criterion not met: Project structure correct; all config files valid"
```

---

## Tools

**External/shared resources used by this task:**

- **Tool:** project-scaffolder
  - **Purpose:** Generate project structure and config
  - **Source:** .aiox-core/scripts/project-scaffolder.js

- **Tool:** config-manager
  - **Purpose:** Initialize configuration files
  - **Source:** .aiox-core/utils/config-manager.js

---

## Scripts

**Agent-specific code for this task:**

- **Script:** init-project.js
  - **Purpose:** Project initialization workflow
  - **Language:** JavaScript
  - **Location:** .aiox-core/scripts/init-project.js

---

## Error Handling

**Strategy:** retry

**Common Errors:**

1. **Error:** Directory Not Empty
   - **Cause:** Target directory already contains files
   - **Resolution:** Use force flag or choose empty directory
   - **Recovery:** Prompt for confirmation, merge or abort

2. **Error:** Initialization Failed
   - **Cause:** Error creating project structure
   - **Resolution:** Check permissions and disk space
   - **Recovery:** Cleanup partial initialization, log error

---

## Performance

**Expected Metrics:**

```yaml
duration_expected: 2-10 min (estimated)
cost_estimated: $0.001-0.008
token_usage: ~800-2,500 tokens
```

**Optimization Notes:**
- Validate configuration early; use atomic writes; implement rollback checkpoints

---

## Metadata

```yaml
story: N/A
version: 1.0.0
dependencies:
  - N/A
tags:
  - automation
  - workflow
updated_at: 2025-11-17
```

---


## Description

Initialize design system structure for greenfield or brownfield projects. Load tokens from Brad's .state.yaml or manual input, configure Tailwind v4 (`@theme`), bootstrap Shadcn utilities, and prepare Atlas for component generation.

## Prerequisites

- Node.js and npm installed (for React/TypeScript components)
- Either: Brad's .state.yaml with tokens OR manual token files
- Project has package.json (or Atlas will create one)

## Workflow

### Interactive Elicitation

This task uses interactive elicitation to configure setup.

1. **Detect Starting Point**
   - Check for Brad's .state.yaml (brownfield from audit)
   - If not found, ask for greenfield setup
   - Confirm which approach to use

2. **Load or Create Tokens**
   - Brownfield: Load tokens from Brad's state
   - Greenfield: Ask for tokens.yaml location or create template
   - Validate token schema

3. **Configure Project Structure**
   - Ask for component output directory (default: `src/components/ui`)
   - Confirm Tailwind v4 entry file (`app.css`) and token sources
   - Decide on Radix/Slot usage, Shadcn component seeding
   - Test framework (Jest/Vitest) + Storybook (yes/no)

### Steps

1. **Detect Brad's State**
   - Search for .state.yaml in outputs/design-system/
   - If found, validate tokenization phase completed
   - If not found, prepare greenfield setup
   - Validation: Starting point identified

2. **Load Token Data**
   - Brownfield: Read token locations from .state.yaml
   - Greenfield: Prompt for tokens.yaml location
   - Parse and validate token schema
   - Check for required token categories (color, spacing, typography)
   - Validation: Tokens loaded and valid

3. **Create Directory Structure**
   - Create `components/ui/` (atoms/molecules), `components/composite/`, `components/layout/`
   - Create `lib/` for utilities (`utils.ts`, `cn`, helpers)
   - Create `tokens/` directory (YAML, JSON, DTCG, platform exports)
   - Create `docs/` (component docs, design guidelines)
   - Create `__tests__/` for shared testing utilities
   - Validation: Directory structure aligns with Atomic Design + Shadcn conventions

4. **Copy Token Files**
   - Copy tokens.yaml + tokens.dtcg.json + companion exports into `tokens/`
   - Generate tokens/index.ts for centralized imports
   - Ensure dark mode + semantic aliases available
   - Validation: Tokens accessible in project (TS + runtime)

5. **Initialize Package Dependencies**
   - Check for React, TypeScript, and Tailwind packages
   - Install `class-variance-authority`, `tailwind-merge`, `@radix-ui/react-slot`, `lucide-react`
   - Add testing (`@testing-library/react`, `@testing-library/jest-dom`, `jest-axe`)
   - Install Storybook 8 (if requested)
   - Validation: `npm install` (or pnpm) completes without errors

6. **Create Configuration Files**
   - Generate/merge `tsconfig.json`, `jest.config.js`, `.storybook/` configs
   - Create `app.css` (or `globals.css`) with `@import "tailwindcss";` and `@theme` definitions
   - Add `.cursorrules`, ESLint, Prettier configs aligned with Tailwind v4
   - Create `design-system.config.yaml` for Atlas settings
   - Validation: Configuration files valid and documented

7. **Generate Token Index**
   - Create tokens/index.ts exporting typed getters (core/semantic/component)
   - Provide helper functions for CSS variable access, `theme` helper for Tailwind
   - Validation: `import { tokens } from '@/tokens'` works across components

8. **Create Base Styles**
   - Populate `app.css` with `@theme`, `@layer base/components/utilities`
   - Add reset (modern-normalize), focus-visible, typography defaults
   - Implement `[data-theme="dark"]` overrides and container queries
   - Validation: Running Tailwind build yields expected utilities without warnings

9. **Initialize State Tracking**
   - Create or update `.state.yaml` for Atlas
   - Record setup configuration (directories, tooling, dependencies)
   - Capture Tailwind version, token coverage, shadcn components installed
   - Set phase to "setup_complete"
   - Validation: State file created

10. **Generate Setup Report**
    - Create setup-summary.md
    - List all created files and directories
    - Document next steps (build components)
    - Validation: Setup documented

## Output

- **components/** directory structure (ui/, composite/, layout/)
- **tokens/** with YAML + JSON + DTCG exports
- **app.css** (or globals.css) with Tailwind `@theme` and base styles
- **lib/utils.ts** with `cn` helper + shared utilities
- **setup-summary.md** with configuration details
- **.state.yaml** updated with Atlas setup data (tailwind/shadcn metadata)

### Output Format

```yaml
# .state.yaml Atlas setup section
atlas_setup:
  completed_at: "2025-10-27T15:00:00Z"
  starting_point: "brownfield"  # or "greenfield"

  configuration:
    component_directory: "src/components/ui"
    css_approach: "tailwind_v4"
    test_framework: "jest"
    storybook_enabled: true
    shadcn_enabled: true

  tokens_loaded:
    source: "Brad tokenization"
    categories:
      - color (12 tokens)
      - spacing (7 tokens)
      - typography (10 tokens)
      - radius (4 tokens)
      - shadow (3 tokens)
    total_tokens: 36
    validation: "passed"

  directory_structure:
    - components/ui/
    - components/composite/
    - components/layout/
    - tokens/
    - lib/
    - docs/
    - __tests__/

  dependencies_added:
    - "@testing-library/react"
    - "@testing-library/jest-dom"
    - "@storybook/react"
    - "class-variance-authority"
    - "tailwind-merge"
    - "@radix-ui/react-slot"

  phase: "setup_complete"
  ready_for: "component_building"
```

## Success Criteria

- [ ] Directory structure follows Atomic Design principles
- [ ] Tokens (YAML + DTCG) loaded and validated successfully
- [ ] Tailwind v4 `@theme` + layers configured and build succeeds
- [ ] Package dependencies installed (React, Tailwind, cva, tailwind-merge, Radix)
- [ ] Configuration files valid (tsconfig, jest, Storybook, .cursorrules)
- [ ] Base styles created with tokens + dark mode parity
- [ ] State tracking initialized (tooling, benchmarks, component paths)
- [ ] Setup documented clearly (setup-summary.md)

## Error Handling

- **No tokens found**: Offer to create token template or prompt for manual input
- **Invalid token schema**: Report specific errors, suggest fixes
- **Missing dependencies**: Auto-install with npm or prompt user
- **Directory exists**: Ask to overwrite or use different location
- **Invalid project structure**: Warn user, continue with compatible setup

## Security Considerations

- Validate token file paths (no directory traversal)
- Sanitize directory names
- Don't execute code during setup
- Validate package.json before modifying

## Examples

### Example 1: Brownfield Setup (From Brad)

```bash
*setup
```

Output:
```
🏗️ Atlas: Setting up design system structure...

✓ Detected Brad's state: outputs/design-system/my-app/.state.yaml
✓ Loading tokens from Brad's tokenization...
  - 12 color tokens (OKLCH)
  - 7 spacing tokens
  - 10 typography tokens
  - 6 component mappings
  - Total: 36 tokens validated

📁 Creating directory structure...
  ✓ src/components/ui/
  ✓ src/components/composite/
  ✓ src/lib/utils.ts
  ✓ tokens/ (yaml/json/dtcg)

📦 Installing dependencies...
  ✓ class-variance-authority
  ✓ tailwind-merge
  ✓ @radix-ui/react-slot
  ✓ @testing-library/react + jest-axe
  ✓ @storybook/react (optional)

⚙️ Generating configuration...
  ✓ tokens/index.ts (typed exports)
  ✓ app.css with @theme + dark mode
  ✓ jest.config.js / storybook-main.ts
  ✓ .cursorrules (Tailwind v4 + Shadcn patterns)

✅ Setup complete!

Next steps:
  1. Bootstrap Shadcn library: *bootstrap-shadcn
  2. Build components: *build button
  3. Generate docs: *document
Atlas says: "Foundation is solid. Ready to build."
```

### Example 2: Greenfield Setup

```bash
*setup
```

Output:
```
🏗️ Atlas: No Brad state found. Starting greenfield setup...

? Token source:
  1. I have tokens.yaml
  2. Create token template
  3. Manual input

User selects 1

? Path to tokens.yaml: ./tokens/tokens.yaml

✓ Tokens loaded and validated (24 tokens)

? Component directory: src/components/ui
? Tailwind entry file: src/app/app.css
? Bootstrap Shadcn starter kit? Yes
? Enable Storybook? Yes

[...setup continues...]
```

## Notes

- Brownfield setup is faster (tokens from Brad)
- Greenfield requires manual token creation or import
- Atomic Design + Shadcn structure (ui/, composite/, layout/)
- All styling must use tokens/Tailwind utilities (no CSS modules)
- Storybook 8 recommended for visual QA
- `class-variance-authority`, `tailwind-merge`, Radix Slot installed by default
- Atlas automatically creates TypeScript types for tokens
- Base styles include CSS reset and token variables
- Setup can be re-run safely (asks before overwriting)
- Next step after setup: *build {pattern} to generate components
