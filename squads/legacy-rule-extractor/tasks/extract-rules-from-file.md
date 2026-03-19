# Task: Extract Rules from File

Core extraction task — analyze a single source file and extract all business rules.

```yaml
task:
  id: extract-rules-from-file
  name: "Extract Rules from Single File"
  executor: decoder
  elicit: false

  input:
    required:
      - file_path: "Absolute path to source file"
    optional:
      - depth: "Analysis depth (surface|standard|deep). Default: standard"
      - focus: "Focus area (calculations|validations|flow|state). Default: all"
      - language: "Override language detection"

  execution:
    steps:
      - step: 1
        name: "Read and classify"
        action: |
          Read entire file content.
          Detect language from extension.
          Note file structure, imports, declarations.

      - step: 2
        name: "First pass — structural scan"
        action: |
          Identify major sections:
          - Function/procedure boundaries
          - Class/module structure
          - COBOL divisions and sections
          Map the overall control flow.

      - step: 3
        name: "Second pass — rule extraction"
        action: |
          Apply extraction protocol phases 2-6:
          - Control flow analysis (decisions)
          - Calculation extraction (formulas)
          - Validation extraction (constraints)
          - State transition extraction (status changes)
          - Implicit rule detection (magic numbers, conventions)

      - step: 4
        name: "Third pass — dependency mapping"
        action: |
          For each extracted rule:
          - Identify input dependencies
          - Identify output consumers
          - Map external calls (CALL, stored proc, API)
          - Map data sources (tables, files)

      - step: 5
        name: "Score confidence"
        action: |
          Assign confidence to each rule:
          - alta: explicit, commented, clear names
          - media: clear logic but cryptic names
          - baixa: implicit, magic numbers, side effects

      - step: 6
        name: "Generate output"
        action: |
          Produce rules-{filename}.md following rule-schema-tmpl.yaml.
          Include file header with summary statistics.

  output:
    files:
      - "rules-{filename}.md"
    data:
      - "rule_count: integer"
      - "confidence_distribution: {alta, media, baixa}"
      - "rule_types: {calculation, validation, flow, state}"
```
