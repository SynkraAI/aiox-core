# Build Production-Ready Component

> Task ID: atlas-build-component
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
task: buildComponent()
responsável: Uma (Empathizer)
responsavel_type: Agente
atomic_layer: Molecule

**Entrada:**
- campo: name
  tipo: string
  origem: User Input
  obrigatório: true
  validação: Must be non-empty, lowercase, kebab-case

- campo: options
  tipo: object
  origem: User Input
  obrigatório: false
  validação: Valid JSON object with allowed keys

- campo: force
  tipo: boolean
  origem: User Input
  obrigatório: false
  validação: Default: false

**Saída:**
- campo: created_file
  tipo: string
  destino: File system
  persistido: true

- campo: validation_report
  tipo: object
  destino: Memory
  persistido: false

- campo: success
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
  - [ ] Target does not already exist; required inputs provided; permissions granted
    tipo: pre-condition
    blocker: true
    validação: |
      Check target does not already exist; required inputs provided; permissions granted
    error_message: "Pre-condition failed: Target does not already exist; required inputs provided; permissions granted"
```

---

## Post-Conditions

**Purpose:** Validate execution success AFTER task completes

**Checklist:**

```yaml
post-conditions:
  - [ ] Resource created successfully; validation passed; no errors logged
    tipo: post-condition
    blocker: true
    validação: |
      Verify resource created successfully; validation passed; no errors logged
    error_message: "Post-condition failed: Resource created successfully; validation passed; no errors logged"
```

---

## Acceptance Criteria

**Purpose:** Definitive pass/fail criteria for task completion

**Checklist:**

```yaml
acceptance-criteria:
  - [ ] Resource exists and is valid; no duplicate resources created
    tipo: acceptance-criterion
    blocker: true
    validação: |
      Assert resource exists and is valid; no duplicate resources created
    error_message: "Acceptance criterion not met: Resource exists and is valid; no duplicate resources created"
```

---

## Tools

**External/shared resources used by this task:**

- **Tool:** component-generator
  - **Purpose:** Generate new components from templates
  - **Source:** .aiox-core/scripts/component-generator.js

- **Tool:** file-system
  - **Purpose:** File creation and validation
  - **Source:** Node.js fs module

---

## Scripts

**Agent-specific code for this task:**

- **Script:** create-component.js
  - **Purpose:** Component creation workflow
  - **Language:** JavaScript
  - **Location:** .aiox-core/scripts/create-component.js

---

## Error Handling

**Strategy:** retry

**Common Errors:**

1. **Error:** Resource Already Exists
   - **Cause:** Target file/resource already exists in system
   - **Resolution:** Use force flag or choose different name
   - **Recovery:** Prompt user for alternative name or force overwrite

2. **Error:** Invalid Input
   - **Cause:** Input name contains invalid characters or format
   - **Resolution:** Validate input against naming rules (kebab-case, lowercase, no special chars)
   - **Recovery:** Sanitize input or reject with clear error message

3. **Error:** Permission Denied
   - **Cause:** Insufficient permissions to create resource
   - **Resolution:** Check file system permissions, run with elevated privileges if needed
   - **Recovery:** Log error, notify user, suggest permission fix

---

## Performance

**Expected Metrics:**

```yaml
duration_expected: 2-5 min (estimated)
cost_estimated: $0.001-0.003
token_usage: ~1,000-3,000 tokens
```

**Optimization Notes:**
- Parallelize independent operations; reuse atom results; implement early exits

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

Generate production-ready React TypeScript component from design tokens. Output follows Shadcn-style Tailwind utility patterns with `cva` variants, optional Radix composition, tests, Storybook stories, and documentation. All styling uses tokens/variables (zero hardcoded values) and supports loading/accessibility states out of the box.

## Prerequisites

- Setup completed (*setup command run successfully)
- Tokens loaded and accessible
- React and TypeScript configured

## Workflow

### Interactive Elicitation

This task uses interactive elicitation to configure component.

1. **Select Component Type**
   - Atomic level (atom, molecule, organism)
   - Component name (Button, Input, Card, etc)
   - Confirm token availability for this component

2. **Configure Component Features**
   - Variants needed (primary, secondary, destructive)
   - Sizes needed (sm, md, lg)
   - States needed (hover, disabled, loading, error)
   - Additional props

3. **Review Generation Plan**
   - Show files to be generated
   - Confirm test coverage requirements
   - Ask for Storybook stories (if enabled)

### Steps

1. **Validate Prerequisites**
   - Check tokens are loaded
   - Verify component doesn't already exist (or confirm overwrite)
   - Validate component name (PascalCase)
   - Validation: Ready to generate

2. **Load Token References**
   - Identify which tokens this component needs
   - Validate token availability
   - Generate token import statements
   - Validation: All required tokens exist

3. **Generate Component File**
   - Create React component using `React.forwardRef` + `Slot` (Radix pattern)
   - Import `cva` + `cn` helpers (`class-variance-authority`, `tailwind-merge`)
   - Implement variants, sizes, density, and loading states
   - Wire ARIA attributes, keyboard handling, dark mode parity
   - Validation: Valid TypeScript (strict), lint clean, no hardcoded CSS values

4. **Author Variant Catalogue**
   - Define `cva` config (base classes, variants, compound variants, defaults)
   - Map variant classes to tokens (Tailwind utilities referencing design tokens)
   - Generate story-friendly helper types (VariantProps)
   - Validation: Variants align with consolidated tokens and atomic level

5. **Generate Unit Tests**
   - Create test file ({Component}.test.tsx) with RTL + jest-axe
   - Snapshot default render, variant permutations, responsive classes
   - Test loading/disabled state interactions and event handlers
   - Aim for >85% coverage including accessibility assertions
   - Validation: Tests pass locally (npm test) with coverage gated

6. **Generate Storybook Stories (Optional)**
   - If Storybook enabled, create {Component}.stories.tsx (Storybook 8 syntax)
   - Provide CSF stories for each variant/size & loading state
   - Configure controls, play functions, a11y addon
   - Validation: `npm run storybook` renders without warnings

7. **Run Accessibility Checks**
   - Validate ARIA attributes + keyboard flows (Tab/Shift+Tab/Space/Enter)
   - Check WCAG 2.2 AA + APCA contrast, including dark mode tokens
   - Ensure focus-visible styles present and themable
   - Validation: jest-axe passes, manual keyboard traversal verified

8. **Generate Component Documentation**
   - Create {Component}.md in docs/ with overview + variant tables
   - Document props, TypeScript types, default variants, composition notes
   - Include usage for light/dark themes, loading state, accessibility guidance
   - Validation: Docs align with generated code and tokens

9. **Update Component Index**
   - Add to design-system/index.ts
   - Export component for easy import
   - Update barrel exports
   - Validation: Component importable

10. **Update State File**
    - Add component to patterns_built in .state.yaml
    - Record atomic level, variants, test coverage
    - Increment component count
    - Validation: State tracking updated

## Output

- **{Component}.tsx**: React TypeScript component (forwardRef + cva)
- **{Component}.test.tsx**: Unit + accessibility tests
- **{Component}.stories.tsx**: Storybook stories (optional)
- **{Component}.md**: Component reference documentation
- **ui/index.ts**: Barrel export updated
- **.state.yaml**: Updated with component metadata + variant catalog

### Output Format

```typescript
// button.tsx
import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Spinner } from '@/components/ui/spinner';

export const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-70',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/90',
        outline: 'border border-border bg-transparent hover:bg-muted'
      },
      size: {
        sm: 'h-9 px-3',
        md: 'h-10 px-4',
        lg: 'h-12 px-6 text-base',
        icon: 'h-10 w-10'
      }
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md'
    }
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  isLoading?: boolean;
  loadingIcon?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant, size, asChild = false, isLoading = false, loadingIcon, children, ...props },
    ref
  ) => {
    const Comp = asChild ? Slot : 'button';

    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className, isLoading && 'pointer-events-none')}
        data-state={isLoading ? 'loading' : props['data-state']}
        aria-busy={isLoading}
        {...props}
      >
        {isLoading && (loadingIcon ?? <Spinner className="mr-2 h-4 w-4 animate-spin" />)}
        <span className="inline-flex items-center gap-1">{children}</span>
      </Comp>
    );
  }
);
Button.displayName = 'Button';

export { Button };
```

## Success Criteria

- [ ] Component compiles without TypeScript errors (strict) and passes lint
- [ ] Variants implemented via `cva` with token-backed Tailwind utilities
- [ ] Props fully typed (VariantProps + custom props) with TSDoc
- [ ] Loading/disabled states, accessibility attributes, and dark mode supported
- [ ] Unit + jest-axe tests pass with ≥85% coverage
- [ ] Storybook stories render (if enabled) with controls + docs tab
- [ ] Component documentation published with variant/density tables
- [ ] .state.yaml updated with variant catalogue + QA status

## Error Handling

- **Token not found**: Report which token is missing, suggest alternatives
- **Component exists**: Ask to overwrite or use different name
- **TypeScript errors**: Display errors, suggest fixes
- **Test failures**: Show failing tests, don't complete until fixed
- **Accessibility violations**: Warn and suggest improvements

## Security Considerations

- Sanitize component name (prevent injection)
- Validate token references
- Escape user content in examples
- No eval() or dynamic code execution

## Examples

### Example 1: Build Button Component

```bash
*build button
```

Output:
```
🏗️ Atlas: Building Button component...

📋 Configuration:
  - Type: Atom
  - Variants: primary, secondary, outline
  - Sizes: sm, md, lg, icon
  - Loading state: enabled (spinner)
  - Tests: RTL + jest-axe (>85% coverage)
  - Storybook: Yes

✓ Generated button.tsx (Shadcn-style, cva variants)
✓ Generated button.test.tsx (22 tests, jest-axe assertions)
✓ Generated button.stories.tsx (8 stories, controls + docs)
✓ Generated button.md (usage + theming guidance)

🧪 Running tests...
  ✓ renders default button (matches snapshot)
  ✓ applies variant classes via cva
  ✓ shows spinner + disables interactions when loading
  ✓ passes accessibility audit (jest-axe)
  ✓ supports asChild slot rendering
  Coverage: 96.4%

♿ Accessibility check:
  ✓ ARIA attributes present
  ✓ Color contrast: 4.8:1 (WCAG AA ✓)
  ✓ Keyboard navigable
  ✓ Focus indicators visible

✅ Button component ready!

Import: `import { Button } from '@/components/ui/button';`
Usage: `<Button variant="primary" isLoading>Saving</Button>`

Atlas says: "Built right. Built once."
```

### Example 2: Build Input Component

```bash
*build input
```

Output includes additional features:
- Validation states (error, success)
- Helper text prop
- Label integration
- Icon slots

## Notes

- All components strictly typed with TypeScript
- Zero hardcoded values enforced (tokens only)
- Accessibility is non-negotiable (WCAG AA minimum)
- Test coverage >80% required
- Tailwind utilities + tokens ensure zero hardcoded values
- Variants and sizes extend via `cva` without editing component body
- Components are tree-shakeable and server-component friendly
- Storybook stories enable visual + interaction testing
- Documentation mirrors props/types for instant onboarding
- Components follow Atomic Design principles
- Atlas ensures quality at every step
