# Task: Convert SOP Format

## Task Anatomy

| Field | Value |
|-------|-------|
| **Task ID** | `convert-sop-format` |
| **Version** | `1.0.0` |
| **Status** | `active` |
| **Responsible Executor** | `sop-ml-architect` |
| **Execution Type** | `Agent` |

## Metadata
```yaml
id: convert-sop-format
name: "Convert SOP Format"
category: conversion
agent: sop-ml-architect
elicit: false
autonomous: true
description: "Convert an SOP between human-readable Markdown, YAML, and JSON formats while preserving semantic equivalence. Supports bidirectional conversion: human-to-machine and machine-to-human. Validates that no information is lost in translation."
```

## Purpose

Enable seamless conversion between SOP formats to serve different consumers. A human-readable Markdown SOP can be converted to structured YAML/JSON for AI agent consumption, and vice versa. This is essential for maintaining a single source of truth while serving both human operators and automated systems.

The key challenge is **semantic equivalence**: ensuring that the meaning, structure, decision logic, and error handling are preserved across formats without information loss.

## Prerequisites

- [ ] Source SOP file exists and is readable
- [ ] Source format is one of: human-md, yaml, json
- [ ] Target format is different from source format
- [ ] SOP ML Schema (`sop-ml-schema`) accessible for YAML/JSON validation

## Inputs

```yaml
inputs:
  source_file:
    type: filepath
    required: true
    description: "Path to the source SOP file to convert"

  source_format:
    type: enum
    required: false
    options: [human-md, yaml, json]
    default: auto-detect
    description: "Format of the source file. If 'auto-detect', the agent determines format from file extension and content structure."

  target_format:
    type: enum
    required: true
    options: [human-md, yaml, json]
    description: "Desired output format"
```

## Format Mapping Schema

```yaml
element_mapping:
  # How elements map between formats

  metadata:
    human_md: "YAML front matter (---) or header table"
    yaml: "sop.metadata object"
    json: "sop.metadata object"
    fields: [id, version, created, author, status, description]

  purpose:
    human_md: "## Purpose section (prose)"
    yaml: "sop.purpose (string)"
    json: "sop.purpose (string)"

  scope:
    human_md: "## Scope section (prose with bullets)"
    yaml: "sop.scope { includes: [], excludes: [] }"
    json: "sop.scope { includes: [], excludes: [] }"

  definitions:
    human_md: "## Definitions section (term: definition list)"
    yaml: "sop.definitions[] { term, definition }"
    json: "sop.definitions[] { term, definition }"

  roles:
    human_md: "## Responsibilities / RACI table"
    yaml: "sop.roles[] { id, name, responsibilities[] }"
    json: "sop.roles[] { id, name, responsibilities[] }"

  inputs:
    human_md: "## Inputs section or prerequisite list"
    yaml: "sop.inputs[] { name, type, required, description }"
    json: "sop.inputs[] { name, type, required, description }"

  outputs:
    human_md: "## Output section"
    yaml: "sop.outputs[] { name, type, description }"
    json: "sop.outputs[] { name, type, description }"

  procedure_steps:
    human_md: "## Procedure - numbered steps with action verbs"
    yaml: "sop.states[] { id, action, transitions[] }"
    json: "sop.states[] { id, action, transitions[] }"
    notes: >
      Human steps are linear with branching noted inline.
      ML steps are state machines with explicit transitions.
      Conversion requires decomposing linear steps into states.

  decision_points:
    human_md: "IF/THEN blocks or decision tree sections"
    yaml: "states with type: 'decision' and multiple transitions"
    json: "states with type: 'decision' and multiple transitions"

  error_handling:
    human_md: "## Error Handling / Troubleshooting section"
    yaml: "sop.error_handling { global, per_state[] }"
    json: "sop.error_handling { global, per_state[] }"

  visual_elements:
    human_md: "Mermaid code blocks (```mermaid)"
    yaml: "sop.diagrams[] { type, content } (Mermaid as string)"
    json: "sop.diagrams[] { type, content } (Mermaid as string)"

  revision_history:
    human_md: "## Revision History table"
    yaml: "sop.revisions[] { version, date, author, changes }"
    json: "sop.revisions[] { version, date, author, changes }"
```

## Workflow / Steps

### 1. Parse Source

```
ACTION: Detect format and parse the source SOP into an internal representation

FORMAT DETECTION (if auto-detect):
  - .md file with prose sections -> human-md
  - .yaml/.yml file with sop: root key -> yaml
  - .json file with sop root key -> json
  - Ambiguous -> examine content structure

PARSING:
  human-md:
    - Extract YAML front matter (if present)
    - Parse Markdown headings into section tree
    - Extract numbered steps from Procedure section
    - Parse RACI tables
    - Extract Mermaid blocks
    - Identify IF/THEN decision blocks
    - Capture all content including prose descriptions

  yaml:
    - Parse YAML structure
    - Validate against sop-ml-schema (warn if non-conformant)
    - Extract state machine definition
    - Map tool bindings
    - Capture all metadata

  json:
    - Parse JSON structure
    - Validate against sop-ml-schema
    - Extract same elements as YAML

STORE: internal_representation = {
  metadata: {},
  purpose: "",
  scope: { includes: [], excludes: [] },
  definitions: [],
  roles: [],
  inputs: [],
  outputs: [],
  steps: [],           # linear representation
  states: [],          # state machine representation
  decisions: [],
  error_handling: {},
  visuals: [],
  revisions: [],
  raw_content: {}      # anything that doesn't map cleanly
}
```

### 2. Map Elements

```
ACTION: Map source elements to target schema

MAPPING STRATEGY BY DIRECTION:

  human-md -> yaml/json:
    - Convert prose Purpose to string field
    - Convert scope bullets to includes/excludes arrays
    - Convert definitions list to structured array
    - Convert RACI table to roles array
    - Convert numbered steps to state machine:
      * Each step becomes a state
      * Sequential steps get auto-transitions
      * IF/THEN blocks become decision states with branched transitions
      * Error handling sections become per-state error configs
    - Convert Mermaid blocks to diagram strings
    - Infer types for inputs/outputs from context
    - Generate state IDs from step numbers/names

  yaml/json -> human-md:
    - Convert metadata to YAML front matter
    - Convert purpose string to ## Purpose section with prose
    - Convert state machine to numbered procedure steps:
      * Linearize the state machine (topological sort)
      * Decision states become IF/THEN blocks
      * Parallel states become noted parallel paths
    - Convert roles array to RACI table
    - Convert error_handling to ## Error Handling section
    - Render diagram strings as Mermaid code blocks
    - Add natural language descriptions for each step

  yaml <-> json:
    - Direct structural mapping (schema is equivalent)
    - Preserve all fields
    - Handle YAML-specific features (anchors, multiline strings)

TRACK: elements_mapped[], elements_unmappable[]
```

### 3. Transform

```
ACTION: Execute the transformation maintaining semantic equivalence

TRANSFORMATION RULES:
  a) Information Preservation
     - Every piece of information in source MUST appear in target
     - If an element has no direct mapping, place in a "notes" or "additional" section
     - Never silently drop content

  b) Semantic Equivalence
     - Decision logic must produce same outcomes in both formats
     - Step ordering must be preserved
     - Role assignments must be preserved
     - Error paths must be preserved

  c) Format-Specific Enhancements
     - human-md: Add visual formatting, section headers, tables
     - yaml: Add comments for human readability
     - json: Minimize but maintain readability (2-space indent)

  d) State Machine Conversion (human -> ML)
     - Simple sequential step: state with single transition to next
     - IF/THEN step: decision state with conditional transitions
     - Loop/repeat step: state with self-transition + exit condition
     - Parallel steps: fork/join states
     - Error step: error state with recovery transitions

  e) Linearization (ML -> human)
     - Topological sort of state machine
     - Decision states become "IF condition THEN: ... ELSE: ..."
     - Fork states become "The following steps can be performed in parallel:"
     - Error states become numbered troubleshooting items
```

### 4. Validate

```
ACTION: Verify target output quality

VALIDATION CHECKS:
  a) Format Validity
     - human-md: Valid Markdown, headings render correctly, tables valid
     - yaml: Valid YAML, parses without error
     - json: Valid JSON, parses without error

  b) Schema Conformance (for yaml/json targets)
     - Validate against sop-ml-schema
     - All required fields present
     - Types match schema definitions

  c) Information Completeness
     - Compare element counts: source steps vs target steps
     - Compare decision points: source vs target
     - Compare roles: source vs target
     - Compare error handlers: source vs target
     - Flag any unmapped elements

  d) Semantic Equivalence Check
     - Walk through source procedure and verify each step exists in target
     - Verify decision branches are complete
     - Verify error paths are preserved

  e) Roundtrip Test (if feasible)
     - Convert target back to source format
     - Compare with original
     - Note any differences (some formatting loss is acceptable)

OUTPUT: validation_report = {
  format_valid: <true|false>,
  schema_conformant: <true|false>,
  elements_mapped: <count>,
  elements_unmapped: <count>,
  semantic_equivalent: <true|false>,
  differences: [<list of any differences>],
  warnings: [<list of warnings>]
}
```

### 5. Output

```
ACTION: Save converted SOP and validation report

DETERMINE output filename:
  - Preserve original name
  - Change extension to match target format
  - Add format suffix if needed for clarity

FILES:
  - Converted SOP: outputs/sop-factory/converted/{sop-name}.{target-extension}
  - Validation report: outputs/sop-factory/converted/{sop-name}-conversion-report.md

CONVERSION REPORT includes:
  - Source format and file
  - Target format and file
  - Elements mapped successfully
  - Elements that required transformation
  - Any unmapped elements (with explanation)
  - Validation results
  - Recommendations for manual review
```

## Output

```yaml
outputs:
  primary:
    path: "outputs/sop-factory/converted/{sop-name}.{md|yaml|json}"
    format: "human-md|yaml|json"
    description: "Converted SOP in target format"

  secondary:
    - path: "outputs/sop-factory/converted/{sop-name}-conversion-report.md"
      format: markdown
      description: "Conversion validation report with element mapping details"

  metadata:
    source_format: "<human-md|yaml|json>"
    target_format: "<human-md|yaml|json>"
    elements_mapped: "<number>"
    elements_unmapped: "<number>"
    format_valid: "<true|false>"
    schema_conformant: "<true|false for yaml/json>"
    semantic_equivalent: "<true|false>"
```

## Acceptance Criteria

- [ ] No information is lost in conversion (all source elements present in target)
- [ ] Target file passes format validation (valid Markdown, YAML, or JSON)
- [ ] For YAML/JSON targets: passes schema validation against `sop-ml-schema`
- [ ] Bidirectional roundtrip is feasible (convert back produces equivalent result)
- [ ] Decision logic is preserved with all branches
- [ ] Error handling is preserved with all paths
- [ ] Role assignments are preserved
- [ ] Conversion report documents all mapping decisions
- [ ] Any unmapped elements are documented with explanations

## Veto Conditions

- STOP if source format cannot be detected or parsed
- STOP if source and target formats are identical (no conversion needed)
- STOP if source file is not an SOP (wrong document type)
- STOP if more than 30% of source elements cannot be mapped to target format (conversion would lose too much information)
- STOP if the source SOP contains embedded binary content (images, attachments) that cannot be represented in the target format
