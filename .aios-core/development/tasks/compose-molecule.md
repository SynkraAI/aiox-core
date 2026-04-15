# Compose Molecule from Atoms

> Task ID: atlas-compose-molecule
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
task: composeMolecule()
responsavel: Atlas (Design System Builder)
responsavel_type: Agente
atomic_layer: Molecule

**Entrada:**
- campo: name
  tipo: string
  origem: User Input
  obrigatorio: true
  validacao: PascalCase component name (e.g., SearchInput, FormField)

- campo: atoms
  tipo: array
  origem: User Input
  obrigatorio: true
  validacao: List of existing atom component names to compose

- campo: design_spec
  tipo: string
  origem: User Input
  obrigatorio: false
  validacao: Reference to design spec, Figma URL, or layout description

- campo: force
  tipo: boolean
  origem: User Input
  obrigatorio: false
  validacao: Default false. Set true to overwrite existing molecule

**Saida:**
- campo: molecule_file
  tipo: string
  destino: File system (components/ui/molecules/{name}.tsx)
  persistido: true

- campo: test_file
  tipo: string
  destino: File system (components/ui/molecules/{name}.test.tsx)
  persistido: true

- campo: validation_report
  tipo: object
  destino: Console + Memory
  persistido: false
```

---

## Pre-Conditions

**Purpose:** Validate prerequisites BEFORE task execution (blocking)

**Checklist:**

```yaml
pre-conditions:
  - [ ] All required atom components exist and export valid React components
    tipo: pre-condition
    blocker: true
    validacao: |
      For each atom in the atoms list, verify the component .tsx file exists and has a named export
    error_message: "Pre-condition failed: One or more required atoms not found. Build them first with *build"

  - [ ] Molecule name does not conflict with existing components (unless force=true)
    tipo: pre-condition
    blocker: true
    validacao: |
      Check that no file with this name exists in atoms/ or molecules/ directories
    error_message: "Pre-condition failed: Component with this name already exists. Use --force to overwrite"

  - [ ] TypeScript and React configured in project
    tipo: pre-condition
    blocker: true
    validacao: |
      Check tsconfig.json exists and react is in package.json dependencies
    error_message: "Pre-condition failed: TypeScript and React must be configured"

  - [ ] Design tokens loaded (for consistent styling)
    tipo: pre-condition
    blocker: false
    validacao: |
      Check tokens.yaml or CSS custom properties exist. Warn if missing but continue
    error_message: "Warning: Design tokens not found. Component may use hardcoded values"
```

---

## Post-Conditions

**Purpose:** Validate execution success AFTER task completes

**Checklist:**

```yaml
post-conditions:
  - [ ] Molecule component file exists and compiles without TypeScript errors
    tipo: post-condition
    blocker: true
    validacao: |
      Verify .tsx file exists and tsc --noEmit passes with no errors for this file
    error_message: "Post-condition failed: Molecule component has TypeScript errors"

  - [ ] Test file exists and all tests pass
    tipo: post-condition
    blocker: true
    validacao: |
      Verify .test.tsx file exists and npm test passes for this component
    error_message: "Post-condition failed: Molecule tests failing"

  - [ ] Component file is <= 100 lines (Art. VII)
    tipo: post-condition
    blocker: true
    validacao: |
      Count lines in component file excluding blank lines at EOF; must be <= 100
    error_message: "Post-condition failed: Component exceeds 100-line limit. Extract logic to hooks or split"
```

---

## Acceptance Criteria

**Purpose:** Definitive pass/fail criteria for task completion

**Checklist:**

```yaml
acceptance-criteria:
  - [ ] Molecule imports and composes atoms without duplicating atom internals
    tipo: acceptance-criterion
    blocker: true
    validacao: |
      Assert molecule imports atoms via @/ absolute paths and renders them, does not re-implement atom logic
    error_message: "Acceptance criterion not met: Molecule duplicates atom logic instead of composing"

  - [ ] All interaction states implemented (hover, focus, disabled at minimum)
    tipo: acceptance-criterion
    blocker: true
    validacao: |
      Assert component handles hover (CSS), focus (focus-visible/focus-within), and disabled state via props
    error_message: "Acceptance criterion not met: Missing required interaction states"

  - [ ] Props interface fully typed with no 'any' types
    tipo: acceptance-criterion
    blocker: true
    validacao: |
      Assert exported interface covers all props with concrete types; grep for 'any' returns zero matches
    error_message: "Acceptance criterion not met: Props interface uses 'any' or is incomplete"

  - [ ] Accessibility: ARIA attributes and keyboard navigation supported
    tipo: acceptance-criterion
    blocker: true
    validacao: |
      Assert component includes appropriate ARIA attributes and jest-axe test passes
    error_message: "Acceptance criterion not met: Accessibility requirements not met"
```

---

## Tools

**External/shared resources used by this task:**

- **Tool:** component-generator
  - **Purpose:** Scaffold molecule file structure from template
  - **Source:** .aios-core/scripts/component-generator.js

- **Tool:** file-system
  - **Purpose:** File creation, validation, and line counting
  - **Source:** Node.js fs module

---

## Scripts

**Agent-specific code for this task:**

- **Script:** compose-molecule.js
  - **Purpose:** Molecule composition, atom validation, and test generation
  - **Language:** JavaScript
  - **Location:** .aios-core/scripts/compose-molecule.js

---

## Error Handling

**Strategy:** retry

**Common Errors:**

1. **Error:** Atom Not Found
   - **Cause:** Required atom component does not exist in project
   - **Resolution:** Build the missing atom first with *build {atom-name}
   - **Recovery:** List available atoms, suggest building missing ones

2. **Error:** Component Exceeds 100 Lines
   - **Cause:** Molecule is too complex for single component
   - **Resolution:** Extract business logic to custom hook (use{Name})
   - **Recovery:** If still >100, suggest splitting into sub-molecules

3. **Error:** TypeScript Compilation Error
   - **Cause:** Props mismatch between atoms and molecule interface
   - **Resolution:** Verify atom prop interfaces and fix type mismatches
   - **Recovery:** Display specific TS errors with suggested fixes

4. **Error:** Test Failure
   - **Cause:** Component behavior does not match test assertions
   - **Resolution:** Review test against actual component behavior
   - **Recovery:** Show failing tests, iterate until passing

---

## Performance

**Expected Metrics:**

```yaml
duration_expected: 3-8 min (estimated)
cost_estimated: $0.002-0.008
token_usage: ~1,500-5,000 tokens
```

**Optimization Notes:**
- Validate atom existence first (early exit); reuse atom test patterns; parallel lint + test

---

## Metadata

```yaml
story: N/A
version: 2.0.0
dependencies:
  - build-component
tags:
  - design-system
  - atomic-design
  - molecule
  - component-composition
updated_at: 2026-04-10
```

---


## Description

Build molecule component by composing existing atoms following Atomic Design methodology. Examples: FormField (Label + Input), Card (Heading + Text + Button), SearchBar (Input + Button).

## Prerequisites

- Setup completed
- Atom components exist (dependencies)
- Tokens loaded

## Workflow

### Interactive Elicitation

This task uses interactive elicitation to configure the molecule.

1. **Define Molecule Composition**
   - Ask for molecule name (PascalCase)
   - List available atoms in the project
   - Select which atoms compose this molecule
   - Confirm atom import paths

2. **Configure Interaction States**
   - Which states apply (hover, focus, disabled, loading, error)
   - Default prop values
   - Event handlers needed (onChange, onSubmit, onClick)

3. **Review Composition Plan**
   - Show proposed component structure
   - Confirm prop interface
   - Validate against 100-line budget
   - Confirm test coverage plan

### Steps

1. **Validate Atom Dependencies**
   - Check each required atom file exists
   - Verify atom exports a named React component
   - Check atom has TypeScript types exported
   - Validation: All atoms exist, are typed, and importable

2. **Define Props Interface**
   - Analyze atom props to determine molecule-level props
   - Create TypeScript interface extending or composing atom props
   - Add molecule-specific props (e.g., onSubmit for SearchInput)
   - Ensure no `any` types
   - Validation: Interface compiles and covers all props

3. **Generate Molecule Component**
   - Create file in molecules/ directory (kebab-case filename)
   - Use React.forwardRef for ref forwarding
   - Import atoms with absolute paths (@/)
   - Compose atoms with molecule-specific layout
   - Wire props from molecule to child atoms
   - Use cn() for conditional class merging
   - Apply design tokens for spacing/layout (no hardcoded values)
   - Validation: Component renders atoms in correct hierarchy

4. **Add Interaction States**
   - Implement hover styles (Tailwind hover: prefix)
   - Implement focus management (focus-within, focus-visible)
   - Implement disabled state (pointer-events-none, opacity-70)
   - Add loading state if applicable (spinner, aria-busy)
   - Wire ARIA attributes (aria-disabled, aria-busy, aria-label)
   - Validation: All specified states functional

5. **Verify Line Count**
   - Count total lines in component file
   - If >100: extract logic to custom hook (use{Name})
   - If still >100 after extraction: split into sub-molecules
   - Validation: Component file <= 100 lines

6. **Generate Tests**
   - Create {molecule-name}.test.tsx with RTL
   - Test default render (snapshot)
   - Test each interaction state
   - Test prop forwarding to child atoms
   - Test event handlers fire correctly
   - Add jest-axe accessibility assertions
   - Validation: All tests pass with >80% coverage

7. **Generate Stories (Optional)**
   - If Storybook configured, create {molecule-name}.stories.tsx
   - Show molecule with different atom combinations
   - Add controls for interactive prop editing
   - Validation: Stories render without warnings

8. **Generate Documentation**
   - Create brief docs (props table, usage example)
   - Document composed atom structure
   - Validation: Docs match actual component

9. **Update Index**
   - Add to molecules/index.ts barrel export
   - Verify import works
   - Validation: Component importable via barrel

10. **Update State**
    - Add molecule to .state.yaml components list
    - Record atomic level, atom dependencies, test coverage
    - Validation: State tracking updated

## Output

- Molecule component (TypeScript, <= 100 lines)
- Unit tests (RTL + jest-axe, >80% coverage)
- Storybook stories (optional)
- Documentation
- Updated barrel export

## Success Criteria

- [ ] All atom dependencies imported correctly (absolute @/ paths)
- [ ] Molecule composes atoms (not reimplements)
- [ ] Molecule-specific logic isolated
- [ ] Props fully typed (no `any`)
- [ ] Component <= 100 lines
- [ ] Tests cover atom interactions
- [ ] Accessible (WCAG AA, jest-axe passes)

## Example

```typescript
// form-field.tsx (molecule)
import * as React from 'react';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/atoms/label';
import { Input, type InputProps } from '@/components/ui/atoms/input';
import { HelperText } from '@/components/ui/atoms/helper-text';

export interface FormFieldProps extends InputProps {
  label: string;
  helperText?: string;
  error?: string;
  className?: string;
}

const FormField = React.forwardRef<HTMLInputElement, FormFieldProps>(
  ({ label, helperText, error, className, id, ...inputProps }, ref) => {
    const fieldId = id ?? React.useId();
    return (
      <div className={cn('flex flex-col gap-1.5', className)}>
        <Label htmlFor={fieldId}>{label}</Label>
        <Input ref={ref} id={fieldId} aria-invalid={!!error} {...inputProps} />
        {error && <HelperText variant="error">{error}</HelperText>}
        {!error && helperText && <HelperText>{helperText}</HelperText>}
      </div>
    );
  }
);
FormField.displayName = 'FormField';

export { FormField };
```

## Notes

- Molecules compose atoms, don't reimplement
- Molecule adds composition logic only
- Atoms remain independent and reusable
- Test atom interactions in molecule context
- The 100-line limit forces good decomposition
- If a molecule needs >3 atoms, consider if it should be an organism
- Atlas recommends: Build atoms first with *build, then compose with *compose-molecule
