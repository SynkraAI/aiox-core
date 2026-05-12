# Bootstrap Shadcn/Radix Component Library

> Task ID: atlas-bootstrap-shadcn  
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
task: bootstrapShadcnLibrary()
responsável: Uma (Empathizer)
responsavel_type: Agente
atomic_layer: Config

**Entrada:**
- campo: task
  tipo: string
  origem: User Input
  obrigatório: true
  validação: Must be registered task

- campo: parameters
  tipo: object
  origem: User Input
  obrigatório: false
  validação: Valid task parameters

- campo: mode
  tipo: string
  origem: User Input
  obrigatório: false
  validação: yolo|interactive|pre-flight

**Saída:**
- campo: execution_result
  tipo: object
  destino: Memory
  persistido: false

- campo: logs
  tipo: array
  destino: File (.ai/logs/*)
  persistido: true

- campo: state
  tipo: object
  destino: State management
  persistido: true
```

---

## Pre-Conditions

**Purpose:** Validate prerequisites BEFORE task execution (blocking)

**Checklist:**

```yaml
pre-conditions:
  - [ ] Task is registered; required parameters provided; dependencies met
    tipo: pre-condition
    blocker: true
    validação: |
      Check task is registered; required parameters provided; dependencies met
    error_message: "Pre-condition failed: Task is registered; required parameters provided; dependencies met"
```

---

## Post-Conditions

**Purpose:** Validate execution success AFTER task completes

**Checklist:**

```yaml
post-conditions:
  - [ ] Task completed; exit code 0; expected outputs created
    tipo: post-condition
    blocker: true
    validação: |
      Verify task completed; exit code 0; expected outputs created
    error_message: "Post-condition failed: Task completed; exit code 0; expected outputs created"
```

---

## Acceptance Criteria

**Purpose:** Definitive pass/fail criteria for task completion

**Checklist:**

```yaml
acceptance-criteria:
  - [ ] Task completed as expected; side effects documented
    tipo: acceptance-criterion
    blocker: true
    validação: |
      Assert task completed as expected; side effects documented
    error_message: "Acceptance criterion not met: Task completed as expected; side effects documented"
```

---

## Tools

**External/shared resources used by this task:**

- **Tool:** task-runner
  - **Purpose:** Task execution and orchestration
  - **Source:** .aiox-core/core/task-runner.js

- **Tool:** logger
  - **Purpose:** Execution logging and error tracking
  - **Source:** .aiox-core/utils/logger.js

---

## Scripts

**Agent-specific code for this task:**

- **Script:** execute-task.js
  - **Purpose:** Generic task execution wrapper
  - **Language:** JavaScript
  - **Location:** .aiox-core/scripts/execute-task.js

---

## Error Handling

**Strategy:** retry

**Common Errors:**

1. **Error:** Task Not Found
   - **Cause:** Specified task not registered in system
   - **Resolution:** Verify task name and registration
   - **Recovery:** List available tasks, suggest similar

2. **Error:** Invalid Parameters
   - **Cause:** Task parameters do not match expected schema
   - **Resolution:** Validate parameters against task definition
   - **Recovery:** Provide parameter template, reject execution

3. **Error:** Execution Timeout
   - **Cause:** Task exceeds maximum execution time
   - **Resolution:** Optimize task or increase timeout
   - **Recovery:** Kill task, cleanup resources, log state

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

Install and curate a Shadcn UI component library leveraging Tailwind v4, Radix primitives, and project design tokens. Establish shared utilities (`cn`, `cva`), Spinner/loading patterns, and documentation scaffold.

## Prerequisites

- Tailwind v4 configured with tokens (`@theme` + dark mode)
- React/Next.js project with TypeScript
- Node.js ≥ 18
- Storybook (optional but recommended)

## Workflow

1. **Initialize Shadcn CLI**
   ```bash
   npx shadcn@latest init
   ```
   - Configure paths (`components`, `lib/utils.ts`)
   - Enable TypeScript + Tailwind + Radix defaults

2. **Install Core Utilities**
   ```bash
   npx shadcn@latest add button input card textarea badge skeleton spinner
   ```
   - Ensure `cn` helper uses `clsx` + `tailwind-merge`
   - Add `Spinner` component for loading states (if not provided by template)

3. **Map to Tokens**
   - Replace hardcoded colors with semantic token classes (`bg-primary`, etc.)
   - Align spacing/typography with design system scale
   - Add dark mode variants (`dark:bg-background`)

4. **Radix Integration**
   - Install Radix primitives as required (`@radix-ui/react-slot`, etc.)
   - Verify accessibility attributes and focus management remain intact

5. **Variant & Utility Enhancements**
   - Extend `cva` definitions to match project variants (density, destructive, ghost)
   - Add shared loading pattern (Spinner + `isLoading` prop)
   - Introduce compound variants for icon buttons, destructive actions

6. **Documentation & Storybook**
   - Create MDX or markdown docs for each component (`docs/components`)
   - Optional: Add Storybook stories using auto-generated stories from `tasks/build-component`

7. **Update State**
   - Append to `.state.yaml` (`tooling.shadcn`) with components installed, timestamp
   - Record any local overrides or follow-up actions

## Deliverables

- Populated `components/ui/` directory with Shadcn components
- Updated `lib/utils.ts` (`cn`, `formatNumber`, etc. if needed)
- Component documentation & Storybook stories (optional)
- `.state.yaml` entries for `tooling.shadcn`

## Success Criteria

- [ ] Shadcn CLI initialized with Tailwind v4-compatible paths
- [ ] Core components (button/input/card/etc.) installed and tokenized
- [ ] `cn` helper + `class-variance-authority` configured
- [ ] Spinner/loading pattern standardized across components
- [ ] Documentation/Storybook updated with usage examples
- [ ] `.state.yaml` reports bootstrap timestamp and component list

## Error Handling

- **CLI install failure**: Delete partial files, rerun `npx shadcn@latest init`
- **Radix import mismatch**: Align versions with lockfile, reinstall packages
- **Token mismatch**: Regenerate Tailwind classes or add missing semantic tokens
- **Storybook build failure**: Update Storybook to latest (v8+) and re-run

## Notes

- Prefer named exports (`export { Button }`) for tree-shaking
- Maintain parity between Shadcn variants and design token aliases
- Document manual updates (Shadcn is copy/paste — no automatic updates)
- Schedule regular audits to pull upstream improvements intentionally
