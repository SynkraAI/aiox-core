# Task: Identify Rule Hotspots

Deep analysis of files to score their business rule density.

```yaml
task:
  id: identify-rule-hotspots
  name: "Identify Rule Hotspots"
  executor: archaeologist
  elicit: false

  input:
    required:
      - file_list: "List of source files to analyze"
      - language: "Programming language of the files"

  execution:
    steps:
      - step: 1
        name: "Count conditional structures"
        action: |
          For each file, count:
          - IF/ELSE/ELSIF chains
          - SWITCH/CASE/EVALUATE blocks
          - Ternary operators
          - Guard clauses
          Normalize by file length (per 100 lines).

      - step: 2
        name: "Detect calculation patterns"
        action: |
          Search for:
          - Arithmetic operations with business variables
          - Percentage calculations
          - Rounding functions
          - Currency/monetary operations
          - Accumulation patterns

      - step: 3
        name: "Detect validation patterns"
        action: |
          Search for:
          - Input validation blocks
          - Range/limit checks
          - Format validations
          - Error raising with business messages
          - Constraint enforcement

      - step: 4
        name: "Detect state transitions"
        action: |
          Search for:
          - Status field assignments
          - Workflow step progressions
          - Flag/boolean toggles
          - Lifecycle method calls

      - step: 5
        name: "Compute composite score"
        action: |
          hotspot_score = (
            conditional_density * 0.30 +
            calculation_count * 0.25 +
            validation_count * 0.25 +
            state_transition_count * 0.20
          ) * 100

          Rank all files by composite score.

  output:
    data:
      - "ranked_hotspots: [{file, score, breakdown}]"
```
