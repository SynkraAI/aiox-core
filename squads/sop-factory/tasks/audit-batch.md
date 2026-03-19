# Task: Batch SOP Audit

## Task Anatomy

| Field | Value |
|-------|-------|
| **Task ID** | `audit-batch` |
| **Version** | `1.0.0` |
| **Status** | `active` |
| **Responsible Executor** | `sop-auditor` |
| **Execution Type** | `Agent` |

## Metadata
```yaml
id: audit-batch
name: "Batch SOP Audit"
category: audit
agent: sop-auditor
elicit: true
autonomous: false
description: "Audit multiple SOPs in a folder at once. Produces individual quick-audit scores, comparative rankings, pattern analysis across SOPs, and a dashboard with overall organizational SOP health score."
```

## Purpose

Assess the overall health of an organization's SOP collection. Rather than auditing one document at a time, this task scans an entire folder of SOPs, runs streamlined audits on each, then performs cross-document analysis to identify systemic patterns. The output is a dashboard that gives management a single-glance view of SOP quality across the organization, with drill-down capability into individual documents and common issues.

This is the "organizational health check" for process documentation. It answers: "How good are our SOPs overall, where are the weakest areas, and what systemic issues should we address?"

## Prerequisites

- [ ] SOP folder exists with at least 2 SOP files
- [ ] Files in the folder are in supported formats (Markdown, YAML, JSON)
- [ ] Compliance standard identified (if checking compliance)

## Inputs

```yaml
inputs:
  sop_folder:
    type: filepath
    required: true
    description: "Path to the folder containing SOP files to audit. All .md, .yaml, .yml, and .json files in this folder will be scanned."

  compliance_standard:
    type: enum
    required: false
    options: [iso-9001, fda-gmp, osha, none]
    description: "Compliance standard to check all SOPs against. If 'none' or omitted, only general quality is assessed."

  output_format:
    type: enum
    required: false
    default: summary
    options: [summary, detailed]
    description: >
      summary: Dashboard with scores and top issues per SOP (faster).
      detailed: Full individual audit reports plus dashboard (slower, more comprehensive).
```

## Workflow / Steps

### 1. Discover SOPs

```
ELICIT from user:
  1. What folder contains the SOPs to audit?
  2. Should all files be included, or only specific ones?
  3. What compliance standard should be checked (if any)?
  4. Do you want summary or detailed output?

ACTION: Scan the specified folder for SOP files

SCAN RULES:
  - Include: *.md, *.yaml, *.yml, *.json files
  - Exclude: Files starting with _ (underscore) or . (dot)
  - Exclude: README.md, CHANGELOG.md, LICENSE.md
  - Exclude: Files smaller than 100 bytes (likely empty)

FOR EACH discovered file:
  - Verify it appears to be an SOP (has procedure/steps content)
  - Record file name, size, last modified date
  - Classify format (human-md, yaml, json)

OUTPUT: sop_inventory = [
  {
    file: "<filename>",
    path: "<full path>",
    format: "<human-md|yaml|json>",
    size: <bytes>,
    modified: "<date>",
    appears_valid: <true|false>
  }
]

REPORT: "{count} SOP files discovered, {valid_count} appear valid"
```

### 2. Quick-Audit Each

```
ACTION: Run a streamlined audit on each discovered SOP

QUICK-AUDIT SCOPE (subset of full audit-sop):
  a) Structural Check (30% weight)
     - Count of expected sections present / 11
     - Metadata completeness (version, date, author, approver)
     - Formatting consistency

  b) Content Check (30% weight)
     - Action verb usage in procedure steps
     - Readability grade estimate
     - Step count and atomicity
     - Decision points identified

  c) Compliance Spot-Check (20% weight, if standard specified)
     - Top 5 most critical requirements from the standard
     - Quick pass/fail for each

  d) Crosby Spot-Check (20% weight)
     - Top 5 most impactful Crosby points:
       1. Management Commitment (owner defined?)
       7. Zero Defects Planning (unambiguous steps?)
       6. Corrective Action (error handling?)
       14. Do It Over Again (review cycle?)
       8. Employee Education (training requirements?)

SCORING:
  quick_score = (structural * 0.30) + (content * 0.30) + (compliance * 0.20) + (crosby * 0.20)

VERDICT (same scale as full audit):
  >= 90: CERTIFIED
  >= 75: APPROVED
  >= 60: CONDITIONAL
  < 60: REJECTED

FOR EACH SOP, produce:
  quick_audit = {
    file: "<filename>",
    score: <0-100>,
    verdict: "<verdict>",
    structural_score: <0-100>,
    content_score: <0-100>,
    compliance_score: <0-100>,
    crosby_score: <0-100>,
    top_issues: [<top 3 findings>],
    strengths: [<top 2 strengths>]
  }

ESTIMATED TIME: ~2 minutes per SOP (vs ~10 minutes for full audit)
```

### 3. Comparative Scoring

```
ACTION: Rank all SOPs and produce comparative analysis

RANKINGS:
  a) Overall Score Ranking
     | Rank | SOP Name | Score | Verdict | Top Issue |
     |------|----------|-------|---------|-----------|
     | 1 | best-sop.md | 95 | CERTIFIED | Minor formatting |
     | 2 | good-sop.md | 82 | APPROVED | Missing error handling |
     | ... | ... | ... | ... | ... |
     | N | worst-sop.md | 45 | REJECTED | Missing 6/11 sections |

  b) Per-Dimension Rankings
     - Best/worst for structural quality
     - Best/worst for content quality
     - Best/worst for compliance
     - Best/worst for Crosby assessment

  c) Distribution Analysis
     | Verdict | Count | Percentage |
     |---------|-------|------------|
     | CERTIFIED | X | X% |
     | APPROVED | X | X% |
     | CONDITIONAL | X | X% |
     | REJECTED | X | X% |

  d) Score Statistics
     - Mean score: X
     - Median score: X
     - Standard deviation: X
     - Min/Max: X / X

OUTPUT: comparative_analysis with all rankings and statistics
```

### 4. Identify Patterns

```
ACTION: Analyze common issues across all SOPs

PATTERN DETECTION:
  a) Systemic Missing Sections
     - Which sections are most commonly missing?
     - "Error Handling is missing in 70% of SOPs" -> systemic issue

  b) Common Content Issues
     - Recurring readability problems
     - Consistently missing RACI
     - Widespread ambiguous language
     - Common absence of visual elements

  c) Compliance Patterns
     - Which compliance requirements are universally unmet?
     - Which are universally met?
     - Cluster by compliance area

  d) Quality Trends
     - Are newer SOPs better than older ones? (by modified date)
     - Are certain categories/departments better than others?
     - Is there a correlation between SOP length and quality?

  e) Positive Patterns
     - What do the top-scoring SOPs have in common?
     - Best practices already in use that should be standardized

OUTPUT: patterns = {
  systemic_issues: [
    {
      issue: "<description>",
      frequency: "<% of SOPs affected>",
      affected_sops: [<filenames>],
      impact: "high|medium|low",
      recommendation: "<systemic fix>"
    }
  ],
  positive_patterns: [
    {
      pattern: "<description>",
      exemplar_sops: [<filenames>],
      recommendation: "<standardize this>"
    }
  ],
  trends: [<trend observations>]
}
```

### 5. Generate Dashboard

```
ACTION: Compile the batch audit dashboard report

DASHBOARD STRUCTURE:

  # SOP Batch Audit Dashboard
  ## Date: {date} | SOPs Audited: {count} | Standard: {standard or 'General Quality'}

  ### Organization SOP Health Score: {average score}/100 ({overall grade})

  #### Health Indicator
  ```
  [==========>          ] 72/100 - CONDITIONAL
  ```

  ### Verdict Distribution
  | Verdict | Count | % | Visual |
  |---------|-------|---|--------|
  | CERTIFIED | X | X% | ████████░░ |
  | APPROVED | X | X% | ██████░░░░ |
  | CONDITIONAL | X | X% | ████░░░░░░ |
  | REJECTED | X | X% | ██░░░░░░░░ |

  ### Score Heatmap
  | SOP | Structure | Content | Compliance | Crosby | TOTAL | Verdict |
  |-----|-----------|---------|------------|--------|-------|---------|
  | sop-a.md | 90 | 85 | 80 | 75 | 83 | APPROVED |
  | sop-b.md | 70 | 60 | 55 | 50 | 59 | REJECTED |
  | ... | ... | ... | ... | ... | ... | ... |

  ### Top 5 Systemic Issues
  | # | Issue | Affected SOPs | Impact | Fix Priority |
  |---|-------|--------------|--------|-------------|
  | 1 | Missing error handling | 8/12 (67%) | HIGH | P1 |
  | 2 | No RACI defined | 7/12 (58%) | HIGH | P1 |
  | ... | ... | ... | ... | ... |

  ### Best Practices Identified
  - {exemplar SOP} demonstrates excellent {pattern}
  - ...

  ### Recommendations
  #### Immediate Actions (P1)
  - ...
  #### Short-Term (P2, within 30 days)
  - ...
  #### Long-Term (P3, within 90 days)
  - ...

  ### Individual SOP Summaries
  [For each SOP: score, verdict, top 3 issues, top 2 strengths]

  ### Appendix: Full Rankings
  [Complete sorted list]

FILE: outputs/sop-factory/audit/batch-audit-dashboard-{date}.md

IF output_format == "detailed":
  ALSO generate individual audit reports per SOP in:
  outputs/sop-factory/audit/individual/{sop-name}-quick-audit.md
```

## Output

```yaml
outputs:
  primary:
    path: "outputs/sop-factory/audit/batch-audit-dashboard-{date}.md"
    format: markdown
    description: "Batch audit dashboard with organizational health score, heatmap, rankings, patterns, and recommendations"

  secondary:
    - path: "outputs/sop-factory/audit/individual/{sop-name}-quick-audit.md"
      format: markdown
      description: "Individual quick-audit report per SOP (only if output_format == 'detailed')"
      condition: "output_format == detailed"

  metadata:
    sops_discovered: "<number>"
    sops_audited: "<number>"
    sops_skipped: "<number (invalid files)>"
    org_health_score: "<0-100>"
    org_grade: "<A|B|C|D|F>"
    certified_count: "<number>"
    approved_count: "<number>"
    conditional_count: "<number>"
    rejected_count: "<number>"
    systemic_issues_count: "<number>"
    compliance_standard: "<standard or 'none'>"
    output_format: "<summary|detailed>"
```

## Acceptance Criteria

- [ ] Every SOP file in the folder is audited (or explicitly skipped with reason)
- [ ] Comparative rankings are generated (overall and per-dimension)
- [ ] Common/systemic issues are identified with frequency counts
- [ ] Organizational health score is calculated as weighted average
- [ ] Score heatmap table is generated with all SOPs and dimensions
- [ ] Verdict distribution shows count and percentage per verdict level
- [ ] Top systemic issues are prioritized with fix recommendations
- [ ] Positive patterns are identified from top-performing SOPs
- [ ] Dashboard fits in a single scrollable document
- [ ] Recommendations are actionable and prioritized (P1/P2/P3)

## Veto Conditions

- STOP if the specified folder does not exist or is empty
- STOP if no valid SOP files are found in the folder (all files are non-SOP)
- STOP if only 1 SOP is found (use `audit-sop` instead for single file)
- STOP if the folder contains more than 100 SOPs (break into batches to manage scope)
- STOP if file access permissions prevent reading any files in the folder
