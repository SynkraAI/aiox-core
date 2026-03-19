# Task: Generate Migration Brief

Produce executive summary for migration/modernization planning.

```yaml
task:
  id: generate-migration-brief
  name: "Generate Migration Brief"
  executor: cartographer
  elicit: false

  input:
    required:
      - catalog: "Rule catalog"
    optional:
      - conflict_report: "Conflict report from Auditor"
      - target_platform: "Target technology for migration"

  execution:
    steps:
      - step: 1
        name: "Executive summary"
        action: |
          Write high-level overview:
          - System analyzed (name, language, age estimate)
          - Total rules extracted
          - Coverage metrics
          - Overall complexity assessment

      - step: 2
        name: "Critical rules inventory"
        action: |
          List all severity=critica rules with:
          - Rule ID and description
          - Source reference
          - Dependencies
          - Migration risk (based on complexity + confidence)
          These MUST be migrated first and tested most thoroughly.

      - step: 3
        name: "High-risk rules"
        action: |
          List rules with confidence=baixa or high complexity:
          - These need SME validation before migration
          - Flag rules with magic numbers or implicit logic
          - Recommend validation sessions with business users

      - step: 4
        name: "Domain migration order"
        action: |
          Recommend migration sequence based on:
          - Dependency graph (foundations first)
          - Business criticality
          - Rule complexity
          - Cross-system conflicts to resolve

      - step: 5
        name: "Risk assessment"
        action: |
          Summarize:
          - Number of rules with confidence=baixa (risk)
          - Cross-system conflicts unresolved
          - Orphan rules (may be obsolete)
          - Hub rules (high impact if wrong)

  output:
    files:
      - "catalog/migration-brief.md"
```
