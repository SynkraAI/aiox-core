# Task: Extract Validations

Find and document all business validation and constraint rules.

```yaml
task:
  id: extract-validations
  name: "Extract Validation Rules"
  executor: decoder
  elicit: false

  input:
    required:
      - code_block: "Code section to analyze"
      - language: "Programming language"

  execution:
    steps:
      - step: 1
        name: "Identify validation blocks"
        action: |
          Find patterns:
          - Null/empty checks before processing
          - Range validations (min <= value <= max)
          - Format validations (regex, masks)
          - Type checks
          - Cross-field validations (field A depends on field B)
          - Referential checks (exists in table/list)

      - step: 2
        name: "Extract error handling"
        action: |
          For each validation failure:
          - Error code (if any)
          - Error message text
          - Action taken (reject, default, warn)
          - Severity (blocking vs warning)

      - step: 3
        name: "Document constraints"
        action: |
          For each validation:
          - What is validated (field/entity)
          - Valid condition (what passes)
          - Invalid action (what happens on failure)
          - Business reason (why this constraint exists)

  output:
    data:
      - "validations: [{field, condition, error_action, error_message, reason}]"
```
