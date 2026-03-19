# Task: Detect Redundancies

Find duplicate or overlapping rules within a single system.

```yaml
task:
  id: detect-redundancies
  name: "Detect Rule Redundancies"
  executor: auditor
  elicit: false

  input:
    required:
      - catalog: "Path to rule catalog"

  execution:
    steps:
      - step: 1
        name: "Pairwise comparison"
        action: |
          Compare each rule against all others in same domain.
          Flag pairs with high similarity in:
          - Logic/conditions
          - Calculations
          - Entity/field targets

      - step: 2
        name: "Classify redundancy"
        action: |
          - EXACT: Same rule, different locations
          - NEAR: Same rule with minor variations
          - PARTIAL: Overlapping scope, different details
          - SUPERSEDED: One rule is a newer version of another

      - step: 3
        name: "Recommend consolidation"
        action: |
          For each redundancy:
          - Which instance to keep (most complete)
          - What to merge from the other
          - Risk of consolidation

  output:
    files:
      - "audit/redundancy-report.md"
```
