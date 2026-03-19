# Task: Validate Extraction Quality

Verify that rule extraction is complete and accurate.

```yaml
task:
  id: validate-extraction-quality
  name: "Validate Extraction Quality"
  executor: auditor
  elicit: false

  input:
    required:
      - rules_dir: "Directory with extracted rules"
      - source_dir: "Original source code directory"

  execution:
    steps:
      - step: 1
        name: "Schema validation"
        action: |
          For each rule file, verify:
          - All required fields present (rule_id, title, domain, severity, confidence, source)
          - Source reference is valid (file exists, lines exist)
          - No empty descriptions
          - Tags are non-empty

      - step: 2
        name: "Coverage check"
        action: |
          Compare source files vs rule files:
          - Which source files have no rules extracted?
          - Which source files have suspiciously few rules?
          - Are there source files that should have been scanned?

      - step: 3
        name: "Source verification"
        action: |
          For a sample of rules (10% or max 20):
          - Read the referenced source code
          - Verify the rule description matches the code
          - Check confidence level is appropriate
          - Flag inaccuracies

      - step: 4
        name: "Completeness scoring"
        action: |
          Score 0-10 on:
          - File coverage (files with rules / total files)
          - Rule density (rules per file vs hotspot score)
          - Confidence distribution (>50% alta is good)
          - Schema compliance (all fields populated)
          - Cross-reference integrity (no broken references)

  output:
    files:
      - "audit/quality-validation.md"
    data:
      - "quality_score: float (0-10)"
      - "issues: [{file, issue, severity}]"
```
