# Generate Pattern Library Documentation

> Task ID: atlas-generate-documentation
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
task: generateDocumentation()
responsável: Morgan (Strategist)
responsavel_type: Agente
atomic_layer: Template

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

**Strategy:** fallback

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
duration_expected: 3-8 min (estimated)
cost_estimated: $0.002-0.005
token_usage: ~1,500-5,000 tokens
```

**Optimization Notes:**
- Cache template compilation; minimize data transformations; lazy load resources

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

Generate comprehensive pattern library documentation from built components. Creates searchable, navigable docs with usage examples, prop tables, accessibility notes, and live previews.

## Prerequisites

- At least 1 component built
- Design system setup complete
- Component .md files exist

## Workflow

### Steps

1. **Scan Built Components** - Find all atoms, molecules, organisms
2. **Parse Component Metadata** - Extract props, types, variants
3. **Generate Pattern Library Index** - Main navigation page
4. **Generate Component Pages** - Detailed pages per component
5. **Generate Usage Examples** - Code snippets and live previews
6. **Generate Accessibility Guide** - WCAG compliance notes
7. **Generate Token Reference** - Token usage documentation
8. **Create Search Index** - Searchable component library

## Output

- **index.md**: Pattern library homepage
- **components/{Component}.md**: Per-component pages
- **tokens.md**: Token reference guide
- **accessibility.md**: Accessibility guidelines
- **getting-started.md**: Setup and usage guide

## Success Criteria

- [ ] All components documented
- [ ] Props documented with types
- [ ] Usage examples for each variant
- [ ] Accessibility notes included
- [ ] Searchable and navigable
- [ ] Up-to-date with latest components

## Example

```bash
*document
```

Output:
```
📚 Atlas: Generating pattern library documentation...

Scanning components:
  ✓ 8 atoms found
  ✓ 5 molecules found
  ✓ 2 organisms found

Generating documentation:
  ✓ index.md (pattern library home)
  ✓ components/Button.md
  ✓ components/Input.md
  ✓ components/FormField.md
  ...
  ✓ tokens.md (token reference)
  ✓ accessibility.md (WCAG guide)
  ✓ getting-started.md

✅ Pattern library: design-system/docs/

Atlas says: "Documentation is code. Keep it fresh."
```

## Notes

- Auto-generates from TypeScript types
- Updates when components change
- Includes live Storybook links (if enabled)
- Searchable by component name, prop, or token
