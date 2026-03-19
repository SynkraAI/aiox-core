# Task: Extract Calculations

Find and document all business formulas and computations.

```yaml
task:
  id: extract-calculations
  name: "Extract Calculation Rules"
  executor: decoder
  elicit: false

  input:
    required:
      - code_block: "Code section to analyze"
      - language: "Programming language"

  execution:
    steps:
      - step: 1
        name: "Identify arithmetic operations"
        action: |
          Find all lines with:
          - Basic arithmetic (+, -, *, /)
          - COMPUTE statements (COBOL)
          - BigDecimal operations (Java)
          - Percentage calculations
          - Rounding (ROUNDED, Math.round, TRUNC)

      - step: 2
        name: "Map formula components"
        action: |
          For each calculation:
          - Input variables (with data types if known)
          - Formula/expression (exact code)
          - Output variable
          - Precision/rounding rules
          - Context (what triggers this calculation)

      - step: 3
        name: "Detect accumulation patterns"
        action: |
          Running totals, SUM aggregations, loop-based accumulations.
          These often represent reporting rules or batch processing logic.

      - step: 4
        name: "Document in business terms"
        action: |
          Translate each formula to plain language:
          VL-DESC = VL-TOTAL * 0.10
          → "Desconto de 10% sobre o valor total"

  output:
    data:
      - "calculations: [{formula, inputs, output, rounding, meaning}]"
```
