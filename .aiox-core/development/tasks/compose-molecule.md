# Compose Molecule from Atoms

> Task ID: atlas-compose-molecule
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
task: composeMolecule()
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

Build molecule component by composing existing atoms following Atomic Design methodology. Examples: FormField (Label + Input), Card (Heading + Text + Button), SearchBar (Input + Button).

## Prerequisites

- Setup completed
- Atom components exist (dependencies)
- Tokens loaded

## Workflow

### Steps

1. **Validate Atom Dependencies** - Check required atoms exist
2. **Generate Molecule Component** - Compose atoms with molecule logic
3. **Generate Molecule Styles** - Molecule-specific layout and spacing
4. **Generate Tests** - Test molecule composition and interactions
5. **Generate Stories** - Show molecule with different atom combinations
6. **Generate Documentation** - Document composed structure
7. **Update Index** - Export molecule
8. **Update State** - Track molecule built

## Output

- Molecule component (TypeScript)
- Molecule styles (CSS Modules)
- Tests (>80% coverage)
- Stories (optional)
- Documentation

## Success Criteria

- [ ] All atom dependencies imported correctly
- [ ] Molecule composes atoms (not reimplements)
- [ ] Molecule-specific logic isolated
- [ ] Tests cover atom interactions
- [ ] Accessible (WCAG AA)

## Example

```typescript
// FormField.tsx (molecule)
import { Label } from '../atoms/Label';
import { Input, InputProps } from '../atoms/Input';
import { HelperText } from '../atoms/HelperText';

export interface FormFieldProps extends InputProps {
  label: string;
  helperText?: string;
  error?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  helperText,
  error,
  ...inputProps
}) => {
  return (
    <div className={styles.formField}>
      <Label htmlFor={inputProps.id}>{label}</Label>
      <Input {...inputProps} error={!!error} />
      {error && <HelperText variant="error">{error}</HelperText>}
      {!error && helperText && <HelperText>{helperText}</HelperText>}
    </div>
  );
};
```

## Notes

- Molecules compose atoms, don't reimplement
- Molecule adds composition logic only
- Atoms remain independent and reusable
- Test atom interactions in molecule context
