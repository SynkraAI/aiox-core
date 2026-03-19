# Task: Detect Conflicts

Compare rule catalogs from different systems to find contradictions.

```yaml
task:
  id: detect-conflicts
  name: "Detect Cross-System Conflicts"
  executor: auditor
  elicit: false

  input:
    required:
      - catalog_a: "Path to first rule catalog"
      - catalog_b: "Path to second rule catalog"
    optional:
      - similarity_threshold: "Minimum similarity to flag (default: 0.75)"

  execution:
    steps:
      - step: 1
        name: "Load catalogs"
        action: |
          Parse both rule catalogs.
          Index rules by: domain, module, entity, keywords.

      - step: 2
        name: "Find candidate pairs"
        action: |
          Match rules across systems using:
          - Same domain + module
          - Same business entity
          - Keyword overlap in title/description > threshold
          - Similar calculation patterns
          Generate candidate pair list.

      - step: 3
        name: "Deep comparison"
        action: |
          For each candidate pair, compare:
          - Logic (same conditions? same results?)
          - Values (same constants? same percentages?)
          - Scope (same entities? same conditions?)
          - Exceptions (same edge cases?)

          Classify as:
          - CONTRADICTION: Different result for same input
          - OVERLAP: Partially same, with variations
          - GAP: Exists in one system only
          - DRIFT: Same concept, diverged over time
          - TEMPORAL: Different due to update timing

      - step: 4
        name: "Score severity"
        action: |
          For each conflict, compute severity score (0-10):
          - Business impact (0.35)
          - Frequency (0.25)
          - Detectability (0.20)
          - Resolution complexity (0.20)

      - step: 5
        name: "Generate recommendations"
        action: |
          For each conflict:
          - Which system is likely correct (with reasoning)
          - Recommended resolution strategy
          - Validation steps needed
          - Impact if left unresolved

      - step: 6
        name: "Generate report"
        action: |
          Produce conflict-report.md following template.
          Sort by severity score (highest first).
          Include executive summary with conflict counts.

  output:
    files:
      - "audit/conflict-report.md"
    data:
      - "conflict_count: integer"
      - "by_type: {contradiction, overlap, gap, drift, temporal}"
      - "critical_conflicts: integer"
```
