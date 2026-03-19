# Task: Parse Control Flow

Analyze conditional structures to extract decision rules.

```yaml
task:
  id: parse-control-flow
  name: "Parse Control Flow for Decision Rules"
  executor: decoder
  elicit: false

  input:
    required:
      - code_block: "Code section to analyze"
      - language: "Programming language"

  execution:
    steps:
      - step: 1
        name: "Map conditional tree"
        action: |
          Build decision tree from IF/ELSE/SWITCH structures.
          For each branch:
          - Condition expression
          - True path action
          - False path action
          - Nesting level

      - step: 2
        name: "Extract decision rules"
        action: |
          Each terminal branch = one business decision.
          Compound conditions (AND/OR) = multiple criteria.
          Document the business meaning of each path.

      - step: 3
        name: "Identify guard clauses"
        action: |
          Early returns/exits that enforce preconditions.
          These are often the most important validation rules.

  output:
    data:
      - "decisions: [{condition, action, nesting, meaning}]"
```
