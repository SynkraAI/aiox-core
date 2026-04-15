# Generate Pattern Library Documentation

> Task ID: atlas-generate-documentation
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
task: generateDocumentation()
responsavel: Atlas (Design System Builder)
responsavel_type: Agente
atomic_layer: Strategy

**Entrada:**
- campo: component_path
  tipo: string
  origem: User Input
  obrigatorio: true
  validacao: Valid path to a React TypeScript component file (.tsx) or directory of components

- campo: output_dir
  tipo: string
  origem: User Input
  obrigatorio: false
  validacao: Default docs/components/

- campo: include_examples
  tipo: boolean
  origem: User Input
  obrigatorio: false
  validacao: Default true. Generate usage examples for each component

- campo: all
  tipo: boolean
  origem: User Input
  obrigatorio: false
  validacao: Default false. When true, scan entire components directory

**Saida:**
- campo: documentation_files
  tipo: array
  destino: File system (docs/components/{component}.md per component)
  persistido: true

- campo: index_file
  tipo: string
  destino: File system (docs/components/index.md)
  persistido: true

- campo: generation_summary
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
  - [ ] Component source file(s) exist and are valid TypeScript/TSX
    tipo: pre-condition
    blocker: true
    validacao: |
      Check specified path exists and contains .tsx files with React component exports
    error_message: "Pre-condition failed: No valid React TypeScript components found at specified path"

  - [ ] At least one component exports a typed props interface or type
    tipo: pre-condition
    blocker: true
    validacao: |
      Parse component files and verify at least one exports an interface or type for props
    error_message: "Pre-condition failed: Components must export typed props for documentation generation"

  - [ ] Output directory writable
    tipo: pre-condition
    blocker: true
    validacao: |
      Check docs/components/ exists or can be created with write permissions
    error_message: "Pre-condition failed: Cannot write to output directory"
```

---

## Post-Conditions

**Purpose:** Validate execution success AFTER task completes

**Checklist:**

```yaml
post-conditions:
  - [ ] Documentation markdown file generated for each component
    tipo: post-condition
    blocker: true
    validacao: |
      Verify a .md file exists in output directory for each processed component
    error_message: "Post-condition failed: Missing documentation files for one or more components"

  - [ ] Each doc file contains props table matching actual component interface
    tipo: post-condition
    blocker: true
    validacao: |
      Cross-reference props table entries with exported interface fields for each component
    error_message: "Post-condition failed: Props table does not match component interfaces"

  - [ ] Pattern library index file generated
    tipo: post-condition
    blocker: true
    validacao: |
      Verify docs/components/index.md exists with links to all component docs
    error_message: "Post-condition failed: Index file not generated"
```

---

## Acceptance Criteria

**Purpose:** Definitive pass/fail criteria for task completion

**Checklist:**

```yaml
acceptance-criteria:
  - [ ] Every prop documented with name, type, default value, and description
    tipo: acceptance-criterion
    blocker: true
    validacao: |
      Assert props table has a row for every field in each component's props interface
    error_message: "Acceptance criterion not met: Missing prop documentation"

  - [ ] At least 3 usage examples per component (basic, variants, responsive)
    tipo: acceptance-criterion
    blocker: true
    validacao: |
      Assert each component doc contains at least 3 distinct JSX code examples
    error_message: "Acceptance criterion not met: Fewer than 3 usage examples"

  - [ ] Accessibility notes section present for each component
    tipo: acceptance-criterion
    blocker: true
    validacao: |
      Assert each doc has an accessibility section documenting ARIA attributes and keyboard interactions
    error_message: "Acceptance criterion not met: Missing accessibility notes"

  - [ ] Import statement uses absolute path (@/ prefix)
    tipo: acceptance-criterion
    blocker: true
    validacao: |
      Assert documented import paths use @/ prefix (Art. VI compliance)
    error_message: "Acceptance criterion not met: Import examples must use absolute @/ paths"
```

---

## Tools

**External/shared resources used by this task:**

- **Tool:** file-system
  - **Purpose:** Read component source files, write documentation output
  - **Source:** Node.js fs module

- **Tool:** typescript-parser
  - **Purpose:** Extract props interface, type definitions, and TSDoc comments
  - **Source:** TypeScript compiler API or regex extraction

---

## Scripts

**Agent-specific code for this task:**

- **Script:** generate-docs.js
  - **Purpose:** Component parsing, props extraction, and markdown generation
  - **Language:** JavaScript
  - **Location:** .aios-core/scripts/generate-docs.js

---

## Error Handling

**Strategy:** fallback

**Common Errors:**

1. **Error:** Component File Not Found
   - **Cause:** Invalid path or file was moved/deleted
   - **Resolution:** Verify component path and try again
   - **Recovery:** Search for component by name in project

2. **Error:** No Props Interface Found
   - **Cause:** Component uses inline types or destructured props without export
   - **Resolution:** Extract props from function signature
   - **Recovery:** Generate partial docs with warning about missing types

3. **Error:** Complex Type Resolution
   - **Cause:** Props use generics, unions, or deeply imported types
   - **Resolution:** Resolve imported types recursively up to 2 levels
   - **Recovery:** Document the type reference with link to source file

4. **Error:** TSDoc Comments Missing
   - **Cause:** Component props have no JSDoc/TSDoc descriptions
   - **Resolution:** Infer descriptions from prop names and types
   - **Recovery:** Generate inferred descriptions, flag for manual review

---

## Performance

**Expected Metrics:**

```yaml
duration_expected: 3-8 min (estimated)
cost_estimated: $0.002-0.005
token_usage: ~1,500-5,000 tokens
```

**Optimization Notes:**
- Single-pass AST parsing per file; template-based markdown output; batch file writes

---

## Metadata

```yaml
story: N/A
version: 2.0.0
dependencies:
  - build-component
tags:
  - design-system
  - documentation
  - developer-experience
updated_at: 2026-04-10
```

---


## Description

Generate comprehensive pattern library documentation from built components. Creates searchable, navigable docs with usage examples, prop tables, accessibility notes, and live previews.

## Prerequisites

- At least 1 component built
- Design system setup complete
- Component .tsx files exist with exported props interfaces

## Workflow

### Interactive Elicitation

This task uses interactive elicitation to configure documentation generation.

1. **Select Components**
   - Single component path or --all for entire directory
   - Auto-detect component names and atomic levels
   - Confirm components to document

2. **Configure Output**
   - Output directory (default: docs/components/)
   - Include usage examples (default: yes)
   - Include Storybook links (if Storybook configured)

3. **Review Generated Docs**
   - Preview props table accuracy
   - Confirm examples are syntactically valid
   - Ask for additional notes or caveats

### Steps

1. **Scan Built Components**
   - Find all atoms, molecules, organisms in target path
   - Parse component names and atomic levels
   - Sort by atomic level (atoms first, then molecules, then organisms)
   - Validation: At least 1 component found

2. **Parse Component Metadata**
   - For each component, extract:
     - Component name (PascalCase export)
     - Props interface (all fields with types)
     - Default values from defaultProps or destructuring defaults
     - TSDoc comments (if present)
     - VariantProps from cva (if present)
   - Validation: Props extracted for each component

3. **Generate Props Table**
   - Format as markdown table: Prop | Type | Default | Required | Description
   - Infer descriptions from prop names when TSDoc missing
   - Mark required props (no ? or default)
   - Include variant props separately if using cva
   - Validation: Table covers every exported prop

4. **Generate Usage Examples**
   - Basic: minimal example with required props only
   - With Variants: show each variant/size if applicable
   - Responsive: show in responsive layout context
   - Use absolute import paths (@/)
   - Validation: Examples are syntactically valid JSX

5. **Generate Accessibility Guide**
   - Document ARIA attributes the component sets
   - List keyboard interactions (Tab, Enter, Space, Escape)
   - Note screen reader behavior
   - Reference WCAG criteria met
   - Validation: Accessibility section complete

6. **Generate Token Reference**
   - List design tokens used by this component
   - Show CSS custom property names
   - Link to token source
   - Validation: Token usage documented

7. **Generate Pattern Library Index**
   - Create index.md with navigation links to all component docs
   - Group by atomic level (Atoms, Molecules, Organisms)
   - Include component count summary
   - Validation: Index links all documented components

8. **Create Search-Friendly Metadata**
   - Add frontmatter to each doc (component name, atomic level, tags)
   - Enable searchable by component name, prop, or token
   - Validation: Frontmatter present on all doc files

## Output

- **docs/components/index.md**: Pattern library homepage with navigation
- **docs/components/{component}.md**: Per-component documentation
- **docs/components/tokens.md**: Token reference guide (if tokens exist)
- **docs/components/accessibility.md**: Accessibility guidelines summary

## Success Criteria

- [ ] All components documented with props tables
- [ ] Props documented with types, defaults, and descriptions
- [ ] At least 3 usage examples per component
- [ ] Accessibility notes included per component
- [ ] Import paths use absolute @/ prefix
- [ ] Pattern library index links all components
- [ ] Searchable and navigable documentation
- [ ] Up-to-date with latest component source

## Example

```bash
*document
```

Output:
```
Atlas: Generating pattern library documentation...

Scanning components:
  8 atoms found
  5 molecules found
  2 organisms found

Generating documentation:
  index.md (pattern library home)
  components/Button.md (5 props, 3 variants)
  components/Input.md (8 props)
  components/FormField.md (4 props, composed from Label + Input)
  ...
  tokens.md (token reference)
  accessibility.md (WCAG guide)

Documentation generated: docs/components/ (15 files)

Atlas says: "Documentation is code. Keep it fresh."
```

## Notes

- Auto-generates from TypeScript types and TSDoc comments
- Re-run when components change to keep docs in sync
- Includes live Storybook links (if enabled)
- Searchable by component name, prop, or token
- Atlas recommends: Run *generate-docs after every *build or *compose-molecule
