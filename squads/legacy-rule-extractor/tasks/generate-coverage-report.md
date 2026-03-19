# Task: Generate Coverage Report

Produce detailed extraction coverage metrics.

```yaml
task:
  id: generate-coverage-report
  name: "Generate Coverage Report"
  executor: auditor
  elicit: false

  input:
    required:
      - rules_dir: "Directory with extracted rules"
      - source_dir: "Original source code directory"
      - scan_report: "Scan report from Archaeologist"

  execution:
    steps:
      - step: 1
        name: "File coverage"
        action: |
          files_scanned / total_source_files * 100
          List unscanned files with reason.

      - step: 2
        name: "Hotspot coverage"
        action: |
          Of the top 20 hotspots, how many were fully extracted?
          Flag hotspots with no rules extracted.

      - step: 3
        name: "Domain coverage"
        action: |
          Expected domains (from module map) vs actual domains with rules.
          Flag domains with zero rules.

      - step: 4
        name: "Confidence distribution"
        action: |
          alta / media / baixa percentages.
          Target: >= 50% alta.
          If < 30% alta: flag for SME review.

      - step: 5
        name: "Generate report"
        action: |
          Produce coverage-report.md with tables and metrics.
          Include recommendations for improving coverage.

  output:
    files:
      - "audit/coverage-report.md"
```
