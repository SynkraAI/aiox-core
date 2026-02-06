# Task: Create Squad Template

**Task ID:** create-template
**Version:** 2.0
**Purpose:** Create output templates for squad artifacts through interactive elicitation
**Orchestrator:** @squad-architect
**Mode:** Elicitation-based (interactive)
**Quality Standard:** AIOS Level (300+ lines, valid YAML/MD)

**Frameworks Used:**
- `data/quality-dimensions-framework.md` → Template validation (Phase 3)

---

## Overview

This task creates output templates for AIOS squads. Templates define the structure and format of artifacts that agents and tasks produce.

**v2.0 Changes:**
- PHASE-based structure
- Quality gate SC_TPL_001 must pass
- Clear elicitation patterns
- Validation criteria defined

```
INPUT (template_purpose + pack_name)
    ↓
[PHASE 0: CONTEXT]
    → Identify target pack
    → Define template identity
    ↓
[PHASE 1: STRUCTURE]
    → Define sections
    → Configure placeholders
    → Add special features
    ↓
[PHASE 2: ELICITATION]
    → Design elicitation flow (if interactive)
    → Configure options
    ↓
[PHASE 3: VALIDATION]
    → Run SC_TPL_001 quality gate
    → Save template file
    ↓
OUTPUT: Template file + Quality Gate PASS
```

---

## Inputs

| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `template_name` | string | Yes | Human-readable name | `"Legal Contract"` |
| `template_id` | string | Yes | kebab-case identifier | `"legal-contract"` |
| `pack_name` | string | Yes | Target squad | `"legal"` |
| `output_format` | enum | Yes | `md`, `yaml`, `json`, `html` | `"md"` |

---

## Preconditions

- [ ] Target pack exists at `squads/{pack_name}/`
- [ ] squad-architect agent is active
- [ ] Write permissions for `squads/{pack_name}/templates/`

---

## PHASE 0: CONTEXT

**Duration:** 2-5 minutes
**Mode:** Interactive

### Step 0.1: Identify Target Pack

**Actions:**
```yaml
identify_pack:
  validation:
    - check_path: "squads/{pack_name}/"
    - check_exists: true
    - load_config: "config.yaml"

  on_not_exists:
    - suggest: "Create pack first"
    - option: "Create template standalone"
```

### Step 0.2: Define Template Identity

**Elicitation:**
```yaml
elicit_identity:
  template_name:
    question: "What is the template name? (human-readable)"
    example: "Legal Contract"

  template_id:
    question: "What is the template ID? (kebab-case)"
    example: "legal-contract"
    validation: "Must be unique within pack"

  output_format:
    question: "What format should the output be?"
    options:
      - "Markdown (.md) - Documents, reports"
      - "YAML (.yaml) - Structured data"
      - "JSON (.json) - Data interchange"
      - "HTML (.html) - Web pages"

  output_filename:
    question: "What is the output filename pattern?"
    example: "docs/{project_name}-contract.md"

  output_title:
    question: "What is the output title pattern?"
    example: "{project_name} Service Agreement"
```

### Step 0.3: Define Workflow Mode

**Elicitation:**
```yaml
elicit_mode:
  workflow_mode:
    question: "How should this template be used?"
    options:
      - automated: "Filled automatically without user input"
      - interactive: "Requires user elicitation"

  if_interactive:
    elicitation_type:
      question: "What level of elicitation?"
      options:
        - basic: "Simple questions to fill placeholders"
        - advanced: "Structured options with refinement"
```

**Output (PHASE 0):**
```yaml
phase_0_output:
  pack_name: "legal"
  template_id: "legal-contract"
  output_format: "md"
  workflow_mode: "interactive"
  elicitation_type: "advanced"
```

---

## PHASE 1: STRUCTURE

**Duration:** 10-15 minutes
**Mode:** Interactive

### Step 1.1: Define Sections

**Elicitation:**
```yaml
elicit_sections:
  question: "What are the main sections of this template?"

  for_each_section:
    - section_id: "kebab-case identifier"
    - section_title: "Human-readable title (optional)"
    - instruction: "What should this section contain?"
    - elicit: "Does this section need user input? (true/false)"
    - template_content: "Structure/template for this section"
    - condition: "Condition for including (optional)"
    - examples: "Example content (optional)"
```

**Section Template:**
```yaml
section_template:
  structure: |
    - id: {section_id}
      title: "{section_title}"
      instruction: |
        {instruction}
      elicit: {true|false}
      template: |
        {template_content}
      condition: "{condition}"  # optional
      examples:
        - "{example_1}"
```

### Step 1.2: Configure Placeholders

**Elicitation:**
```yaml
elicit_placeholders:
  question: "What variable information needs to be filled in?"

  for_each_placeholder:
    - name: "Placeholder name (e.g., {{project_name}})"
    - type: "text | date | number | list | object"
    - required: "true | false"
    - description: "What this placeholder represents"
    - default: "Default value (optional)"

  naming_convention:
    - "Use {{snake_case}} or {{camelCase}}"
    - "Be descriptive and intuitive"
```

**Placeholder Documentation:**
```yaml
placeholder_template:
  structure: |
    placeholders:
      - name: "{{placeholder_name}}"
        type: "{type}"
        required: {true|false}
        description: "{description}"
        default: "{default}"  # optional
```

### Step 1.3: Add Special Features

**Check for special features:**
```yaml
special_features:
  repeatable_sections:
    question: "Are there sections that repeat multiple times?"
    if_yes:
      - section_id: "Which section?"
      - iteration_var: "Iteration variable (e.g., {{item_number}})"
      - min_items: "Minimum items"
      - max_items: "Maximum items (optional)"

  conditional_sections:
    question: "Are there sections that only appear under conditions?"
    if_yes:
      - section_id: "Which section?"
      - condition: "When should it appear?"

  diagrams:
    question: "Should this template include diagrams?"
    if_yes:
      - diagram_type: "mermaid | ascii | other"
      - diagram_section: "Where in the template?"

  nested_sections:
    question: "Are there sections with subsections?"
    if_yes:
      - parent_section: "Which parent?"
      - children: "What subsections?"
```

**Output (PHASE 1):**
```yaml
phase_1_output:
  sections_count: 8
  placeholders_count: 12
  repeatable_sections: 1
  conditional_sections: 2
  diagrams: 0
```

---

## PHASE 2: ELICITATION (If Interactive)

**Duration:** 5-10 minutes
**Condition:** Only if `workflow_mode == "interactive"`
**Mode:** Interactive

### Step 2.1: Design Elicitation Flow

**Elicitation:**
```yaml
elicit_flow:
  flow_title:
    question: "What is the elicitation flow title?"
    example: "Contract Generation Wizard"

  sections:
    question: "What are the main elicitation sections?"
    for_each:
      - section_id: "kebab-case"
      - options: "What options to present?"
```

### Step 2.2: Configure Options

**For each elicitation section:**
```yaml
elicit_options:
  template: |
    custom_elicitation:
      title: "{flow_title}"
      sections:
        - id: {section_id}
          options:
            - id: {option_id}
              label: "{option_label}"
              description: "{option_description}"
            # ... more options

  example: |
    custom_elicitation:
      title: "Contract Type Selection"
      sections:
        - id: contract-type
          options:
            - id: service
              label: "Service Agreement"
              description: "For ongoing service relationships"
            - id: product
              label: "Product License"
              description: "For software or product licensing"
```

**Output (PHASE 2):**
```yaml
phase_2_output:
  elicitation_title: "Contract Generation Wizard"
  elicitation_sections: 3
  total_options: 9
```

---

## PHASE 3: VALIDATION & OUTPUT

**Duration:** 2-5 minutes
**Checkpoint:** SC_TPL_001 (Template Quality Gate)
**Mode:** Autonomous

### Step 3.1: Compile Template File

**Actions:**
```yaml
compile_template:
  sections:
    - metadata: "id, name, version"
    - output: "format, filename, title"
    - workflow: "mode, elicitation_type"
    - custom_elicitation: "if interactive"
    - sections: "all template sections"
    - placeholders: "documentation"
    - validation: "rules"

  output_location: "squads/{pack_name}/templates/{template_id}.yaml"
```

### Step 3.2: Run Quality Gate SC_TPL_001

**Actions:**
```yaml
run_quality_gate:
  heuristic_id: SC_TPL_001
  name: "Template Quality Gate"
  blocking: true

  blocking_requirements:
    valid_yaml: true
    metadata_complete:
      - id: true
      - name: true
      - version: true
    output_config:
      - format: true
      - filename: true
    sections: ">= 1"
    placeholders_documented: true

  scoring:
    | Dimension | Weight | Check |
    |-----------|--------|-------|
    | Structure | 0.30 | Valid YAML, all sections |
    | Placeholders | 0.25 | All documented |
    | Elicitation | 0.20 | Clear flow |
    | Examples | 0.15 | Helpful examples |
    | Documentation | 0.10 | Well-documented |

  threshold: 7.0
```

### Step 3.3: Save Template File

**Actions:**
```yaml
save_template:
  path: "squads/{pack_name}/templates/{template_id}.yaml"

  post_save:
    - verify_yaml_valid
    - update_pack_readme
    - log_creation
```

**Output (PHASE 3):**
```yaml
phase_3_output:
  quality_score: 8.0/10
  blocking_requirements: "ALL PASS"
  template_file: "squads/{your-squad}/templates/legal-contract.yaml"
  status: "PASS"
```

---

## Outputs

| Output | Location | Description |
|--------|----------|-------------|
| Template File | `squads/{pack_name}/templates/{template_id}.yaml` | Complete template |
| Updated README | `squads/{pack_name}/README.md` | Template added |

---

## Validation Criteria (All Must Pass)

### Structure
- [ ] Valid YAML syntax
- [ ] All required metadata present
- [ ] Output configuration complete

### Content
- [ ] Sections well-structured
- [ ] All placeholders documented
- [ ] Elicitation flow clear (if interactive)

### Quality
- [ ] Lines >= 200
- [ ] SC_TPL_001 score >= 7.0
- [ ] Examples provided

---

## Heuristics Reference

| Heuristic ID | Name | Where Applied | Blocking |
|--------------|------|---------------|----------|
| SC_TPL_001 | Template Quality Gate | Phase 3 | Yes |

---

## Error Handling

```yaml
error_handling:
  invalid_yaml:
    - "Template has YAML syntax errors"
    - action: "Show errors, fix, retry"

  missing_placeholders:
    - "Placeholders used but not documented"
    - action: "Add documentation for each"

  validation_fails:
    - "Template doesn't meet quality gate"
    - action: "Identify failures, fix, re-validate"
```

---

## Integration with AIOS

This task creates templates that:
- Follow AIOS template standards
- Can be used by agents via tasks
- Support interactive elicitation
- Produce validated outputs
- Integrate with squad ecosystem

---

_Task Version: 2.0_
_Last Updated: 2026-02-01_
_Lines: 350+_
