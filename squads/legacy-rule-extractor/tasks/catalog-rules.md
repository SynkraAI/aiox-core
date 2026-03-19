# Task: Catalog Rules

Generate the complete rule catalog from classified rules.

```yaml
task:
  id: catalog-rules
  name: "Generate Rule Catalog"
  executor: cartographer
  elicit: false

  input:
    required:
      - rules_dir: "Directory with classified rule files"
    optional:
      - system_name: "Name of the source system"
      - format: "Output format (markdown|yaml|both). Default: both"

  execution:
    steps:
      - step: 1
        name: "Collect all rules"
        action: |
          Read all rule files from rules_dir.
          Parse each rule's metadata (ID, domain, module, severity, confidence).
          Build in-memory catalog.

      - step: 2
        name: "Validate uniqueness"
        action: |
          Check for duplicate rule IDs.
          If found: append suffix (-a, -b) and flag for review.

      - step: 3
        name: "Organize by domain"
        action: |
          Group rules hierarchically:
          Domain > Module > Rules (sorted by ID)
          Generate statistics per domain and module.

      - step: 4
        name: "Build cross-references"
        action: |
          From dependency data in each rule:
          - Build forward references (rule A depends on B)
          - Build reverse references (rule B is used by A)
          - Identify orphan rules (no dependencies)
          - Identify hub rules (many dependents)

      - step: 5
        name: "Generate catalog files"
        action: |
          Produce:
          - rule-catalog.md (human-readable, organized by domain)
          - rule-catalog.yaml (machine-readable, full metadata)
          - domain-map.md (ASCII visual map)
          Following templates in templates/ directory.

  output:
    files:
      - "catalog/rule-catalog.md"
      - "catalog/rule-catalog.yaml"
      - "catalog/domain-map.md"
```
