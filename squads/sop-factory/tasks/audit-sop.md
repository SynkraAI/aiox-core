# Task: Full SOP Audit

## Task Anatomy

| Field | Value |
|-------|-------|
| **Task ID** | `audit-sop` |
| **Version** | `1.0.0` |
| **Status** | `active` |
| **Responsible Executor** | `sop-auditor` |
| **Execution Type** | `Agent` |

## Metadata
```yaml
id: audit-sop
name: "Full SOP Audit"
category: audit
agent: sop-auditor
elicit: false
autonomous: true
description: "Comprehensive quality and compliance audit of an SOP. Performs structural, content, and compliance checks, risk assessment, and Philip Crosby's 14-Point Quality Assessment. Produces a verdict (CERTIFIED/APPROVED/CONDITIONAL/REJECTED) with detailed findings and remediation plan."
```

## Purpose

Perform a rigorous, multi-layered audit of an SOP to determine its fitness for production use. This goes beyond the analysis task (`analyze-sop`) by applying formal audit methodology: structural audit, content audit, compliance verification, risk assessment, and the Crosby 14-Point Assessment. The audit produces a formal verdict that can be used for document control and release decisions.

Philip Crosby's "Quality is Free" philosophy drives this audit: the cost of building quality into the SOP upfront is always less than the cost of non-conformance downstream. Every finding represents a potential cost of quality.

## Prerequisites

- [ ] SOP file exists and is readable
- [ ] Compliance standards specified (if applicable)
- [ ] Audit depth determined (standard or deep)

## Inputs

```yaml
inputs:
  sop_file:
    type: filepath
    required: true
    description: "Path to the SOP file to audit"

  compliance_standards:
    type: array
    items:
      type: enum
      options: [iso-9001, fda-gmp, osha]
    required: false
    description: "Compliance standards to check against. Multiple can be specified. If omitted, audit focuses on general quality only."

  audit_depth:
    type: enum
    required: false
    default: standard
    options: [standard, deep]
    description: >
      standard: Checks all sections, scores all dimensions, applies Crosby 14-point.
      deep: All of standard plus line-by-line content review, cross-reference verification, and exhaustive edge-case analysis.
```

## Philip Crosby 14-Point Quality Assessment

```yaml
crosby_14_points:
  1_management_commitment:
    question: "Is management commitment to quality evident?"
    audit_checks:
      - "Process owner is identified by name or role"
      - "Approver is identified (distinct from author)"
      - "Accountability chain is documented"
      - "Resource allocation is addressed"
    scoring: "All checks = 10, 3/4 = 7, 2/4 = 4, <2 = 1"

  2_quality_improvement_team:
    question: "Is this SOP part of a managed documentation system?"
    audit_checks:
      - "SOP ID follows a numbering system"
      - "Referenced in a document registry or master list"
      - "Cross-references to related SOPs exist"
      - "Review/update responsibilities assigned"
    scoring: "All checks = 10, 3/4 = 7, 2/4 = 4, <2 = 1"

  3_quality_measurement:
    question: "Are quality metrics and KPIs defined?"
    audit_checks:
      - "Process KPIs specified (cycle time, error rate, etc.)"
      - "Measurement methods described"
      - "Baseline values or targets provided"
      - "Monitoring frequency defined"
    scoring: "All checks = 10, 3/4 = 7, 2/4 = 4, <2 = 1"

  4_cost_of_quality:
    question: "Is the impact of non-compliance assessed?"
    audit_checks:
      - "Business impact of errors described"
      - "Compliance risk identified"
      - "Customer impact addressed"
      - "Cost/time of rework mentioned"
    scoring: "All checks = 10, 3/4 = 7, 2/4 = 4, <2 = 1"

  5_quality_awareness:
    question: "Is the SOP accessible to all stakeholders?"
    audit_checks:
      - "Distribution list or access method defined"
      - "Language appropriate for target audience"
      - "Available in required formats (digital, print)"
      - "Location/repository specified"
    scoring: "All checks = 10, 3/4 = 7, 2/4 = 4, <2 = 1"

  6_corrective_action:
    question: "Are error handling and escalation paths defined?"
    audit_checks:
      - "Common failure modes documented"
      - "Corrective actions for each failure"
      - "Escalation criteria and contacts"
      - "Root cause analysis method referenced"
    scoring: "All checks = 10, 3/4 = 7, 2/4 = 4, <2 = 1"

  7_zero_defects_planning:
    question: "Is the SOP designed for first-time-right execution?"
    audit_checks:
      - "Steps are unambiguous (no interpretation needed)"
      - "Prerequisites are explicitly stated"
      - "Verification points after critical steps"
      - "Common mistakes warned against"
    scoring: "All checks = 10, 3/4 = 7, 2/4 = 4, <2 = 1"

  8_employee_education:
    question: "Are training requirements specified?"
    audit_checks:
      - "Required training or certifications listed"
      - "Competency assessment method defined"
      - "Training records requirements stated"
      - "Retraining triggers identified"
    scoring: "All checks = 10, 3/4 = 7, 2/4 = 4, <2 = 1"

  9_zero_defects_day:
    question: "Is there a clear effective date and rollout plan?"
    audit_checks:
      - "Effective date specified"
      - "Supersedes previous version (if applicable)"
      - "Communication plan for rollout"
      - "Transition period defined (if applicable)"
    scoring: "All checks = 10, 3/4 = 7, 2/4 = 4, <2 = 1"

  10_goal_setting:
    question: "Are success criteria and goals defined?"
    audit_checks:
      - "Process success criteria defined"
      - "Quality targets specified"
      - "Completion criteria clear"
      - "Performance benchmarks referenced"
    scoring: "All checks = 10, 3/4 = 7, 2/4 = 4, <2 = 1"

  11_error_cause_removal:
    question: "Are root causes of errors addressed?"
    audit_checks:
      - "Known root causes documented"
      - "Preventive measures included"
      - "Error-proofing (poka-yoke) applied"
      - "Lessons learned incorporated"
    scoring: "All checks = 10, 3/4 = 7, 2/4 = 4, <2 = 1"

  12_recognition:
    question: "Is there a feedback mechanism for improvements?"
    audit_checks:
      - "Feedback collection method specified"
      - "Suggestion process for improvements"
      - "Contact for questions/issues"
      - "Mechanism for reporting SOP defects"
    scoring: "All checks = 10, 3/4 = 7, 2/4 = 4, <2 = 1"

  13_quality_councils:
    question: "Is there a review and approval workflow?"
    audit_checks:
      - "Author, reviewer, approver roles defined"
      - "Review criteria documented"
      - "Approval workflow specified"
      - "Multi-level review for critical SOPs"
    scoring: "All checks = 10, 3/4 = 7, 2/4 = 4, <2 = 1"

  14_do_it_over_again:
    question: "Is a scheduled review cycle defined?"
    audit_checks:
      - "Review frequency specified (e.g., annual)"
      - "Next review date stated"
      - "Review triggers defined (regulatory change, incident, etc.)"
      - "Continuous improvement mechanism"
    scoring: "All checks = 10, 3/4 = 7, 2/4 = 4, <2 = 1"
```

## Verdict Scale

```yaml
verdict_scale:
  CERTIFIED:
    score_range: "90-100"
    meaning: "SOP meets all quality and compliance requirements. Ready for production use."
    action: "Approve for immediate release"
    color: "green"

  APPROVED:
    score_range: "75-89"
    meaning: "SOP meets core requirements with minor gaps. Acceptable for use with noted improvements."
    action: "Release with improvement plan (30-day remediation)"
    color: "yellow"

  CONDITIONAL:
    score_range: "60-74"
    meaning: "SOP has significant gaps that must be addressed. Not suitable for production without revision."
    action: "Revise and re-audit within 14 days"
    color: "orange"

  REJECTED:
    score_range: "0-59"
    meaning: "SOP fails to meet minimum quality standards. Major rewrite required."
    action: "Return to author for complete revision"
    color: "red"
```

## Workflow / Steps

### 1. Ingest

```
ACTION: Read and parse the SOP file

EXTRACT:
  - File format and structure
  - Metadata (if YAML front matter or header present)
  - Section inventory
  - Word count, step count
  - Stated compliance standards
  - Stated audience and process owner

STORE: sop_data = {
  format, metadata, sections[], steps[],
  word_count, step_count,
  stated_compliance, audience, owner
}
```

### 2. Structural Audit

```
ACTION: Verify SOP structure against expected framework

CHECKS:
  a) Section Presence (FDA/GMP 11-section framework)
     - Header/metadata
     - Purpose
     - Scope
     - Definitions
     - Responsibilities
     - Materials/Equipment
     - Procedure
     - Error Handling
     - Quality Control
     - References
     - Revision History
     Score: (sections present / 11) * 10

  b) Section Ordering
     - Are sections in logical order?
     - Does information flow make sense?
     Score: correct order = 10, minor issues = 7, major issues = 3

  c) Formatting Consistency
     - Consistent heading levels
     - Consistent list formatting
     - Consistent table formatting
     - Consistent code block usage
     Score: fully consistent = 10, minor issues = 7, inconsistent = 3

  d) Completeness of Metadata
     - Version, date, author, approver all present
     - SOP ID present
     - Status field present
     Score: all present = 10, most = 7, few = 3

FINDING per issue: { id, type: "structural", severity, location, description, recommendation }
```

### 3. Content Audit

```
ACTION: Analyze content quality in depth

CHECKS:
  a) Procedure Step Quality
     - Action verbs present (% of steps)
     - Atomic steps (one action per step)
     - Expected outcomes stated
     - Ambiguous language detected
     Score: composite of sub-checks

  b) Clarity Assessment
     - Readability grade (Flesch-Kincaid estimate)
     - Passive voice percentage
     - Undefined jargon count
     - Average sentence length
     Score: based on analyze-sop rubric

  c) Completeness Assessment
     - All inputs defined
     - All outputs defined
     - All roles assigned
     - All tools specified
     - Edge cases addressed
     Score: composite

  d) Logical Integrity
     - No contradictions between sections
     - Decision points have all branches
     - No circular references
     - No dead-end paths
     Score: contradiction count drives score

  e) Deep Review (audit_depth == "deep" only)
     - Line-by-line content review
     - Cross-reference verification (do referenced docs exist?)
     - Terminology consistency across sections
     - Version history accuracy
     Score: additional findings

FINDING per issue: { id, type: "content", severity, location, description, recommendation }
```

### 4. Compliance Check

```
ACTION: Verify compliance with specified standards

IF compliance_standards provided:
  FOR EACH standard:
    - Load standard requirements (same as benchmark-sop)
    - Map each requirement to SOP content
    - Classify as COMPLIANT / PARTIAL / NON_COMPLIANT / N_A
    - Calculate compliance percentage

  AGGREGATE: overall_compliance = weighted average across standards

IF no compliance_standards:
  - Apply general document quality standards only
  - Note: "No compliance standards specified for this audit"

FINDING per issue: { id, type: "compliance", standard, req_id, severity, description, recommendation }
```

### 5. Risk Assessment

```
ACTION: Identify risks from SOP gaps

RISK CATEGORIES:
  a) Safety Risk
     - Missing safety warnings
     - Unclear hazard communication
     - No PPE requirements (for physical processes)
     - No emergency procedures

  b) Quality Risk
     - Missing verification steps
     - No acceptance criteria
     - Ambiguous instructions leading to variation
     - No error detection mechanism

  c) Compliance Risk
     - Missing required sections per standard
     - No document control
     - No training requirements
     - No audit trail

  d) Operational Risk
     - Single point of failure (one person dependency)
     - No backup procedures
     - No escalation path
     - Missing time constraints

FOR EACH risk:
  risk = {
    id: "RISK-{N}",
    category: "<safety|quality|compliance|operational>",
    description: "<what could go wrong>",
    likelihood: "high|medium|low",
    impact: "high|medium|low",
    risk_level: "<likelihood x impact matrix>",
    source_gap: "<finding ID>",
    mitigation: "<recommended action>"
  }

RISK MATRIX:
  | | High Impact | Medium Impact | Low Impact |
  |---|---|---|---|
  | High Likelihood | CRITICAL | HIGH | MEDIUM |
  | Medium Likelihood | HIGH | MEDIUM | LOW |
  | Low Likelihood | MEDIUM | LOW | LOW |
```

### 6. Crosby 14-Point Assessment

```
ACTION: Evaluate SOP against all 14 Crosby quality points

FOR EACH of the 14 points:
  1. Run all audit checks for that point
  2. Score (1-10 scale)
  3. Document evidence (what was found)
  4. Document gaps (what was missing)
  5. Provide recommendation

CALCULATE: crosby_score = average of all 14 point scores * 10 (scale to 100)

OUTPUT: crosby_assessment = {
  points: [
    { point: 1, name: "Management Commitment", score: X, checks: [...], evidence: "...", gaps: "..." },
    ...
  ],
  total_score: <0-100>,
  summary: "<assessment summary>"
}
```

### 7. Verdict

```
ACTION: Calculate final audit score and assign verdict

SCORING COMPONENTS:
  a) Structural Score (20% weight)
     - Section presence, ordering, formatting, metadata

  b) Content Score (30% weight)
     - Step quality, clarity, completeness, logical integrity

  c) Compliance Score (20% weight)
     - Per-standard compliance percentages (or general quality if no standards)

  d) Risk Score (15% weight)
     - Inverse of risk severity (fewer/lower risks = higher score)

  e) Crosby Score (15% weight)
     - 14-point assessment total

FINAL_SCORE = (structural * 0.20) + (content * 0.30) + (compliance * 0.20) + (risk * 0.15) + (crosby * 0.15)

VERDICT:
  >= 90: CERTIFIED
  >= 75: APPROVED
  >= 60: CONDITIONAL
  < 60: REJECTED

OVERRIDE RULES:
  - Any CRITICAL risk finding -> cannot be CERTIFIED (max APPROVED)
  - Any safety risk with high likelihood -> cannot be APPROVED (max CONDITIONAL)
  - Compliance score < 50% for any required standard -> cannot be APPROVED
```

### 8. Remediation Plan

```
ACTION: Compile prioritized remediation plan from all findings

STRUCTURE:
  Priority 1 - CRITICAL (Must fix before any use):
    - Safety risks
    - Critical compliance gaps
    - Showstopper ambiguities

  Priority 2 - HIGH (Fix within 14 days):
    - Major content gaps
    - Significant compliance issues
    - High-risk operational gaps

  Priority 3 - MEDIUM (Fix within 30 days):
    - Moderate content improvements
    - Missing best practices
    - Moderate risk items

  Priority 4 - LOW (Fix within 90 days):
    - Minor formatting issues
    - Nice-to-have enhancements
    - Low-risk items

FOR EACH finding:
  - Finding ID
  - Description
  - Current state (what exists)
  - Required state (what should exist)
  - Specific fix instructions
  - Effort estimate
  - Responsible role

GENERATE: Remediation checklist (checkboxes for tracking)
```

## Output

```yaml
outputs:
  primary:
    path: "outputs/sop-factory/audit/{sop-name}-audit-report.md"
    format: markdown
    description: "Complete audit report with verdict, scores, all findings, risk assessment, Crosby assessment, and remediation plan"

  metadata:
    verdict: "<CERTIFIED|APPROVED|CONDITIONAL|REJECTED>"
    final_score: "<0-100>"
    structural_score: "<0-100>"
    content_score: "<0-100>"
    compliance_score: "<0-100>"
    risk_score: "<0-100>"
    crosby_score: "<0-100>"
    total_findings: "<number>"
    critical_findings: "<number>"
    risks_identified: "<number>"
    compliance_standards_checked: ["<standards>"]
    audit_depth: "<standard|deep>"
```

## Acceptance Criteria

- [ ] All 14 Crosby points are assessed with scores and evidence
- [ ] Compliance checks are performed for every specified standard
- [ ] Risk assessment is completed with risk matrix classification
- [ ] Structural audit covers all 11 expected sections
- [ ] Content audit evaluates clarity, completeness, and logical integrity
- [ ] Final score is calculated with correct weighting
- [ ] Verdict is assigned per the scale and override rules
- [ ] Remediation plan includes specific fix instructions per finding
- [ ] Findings are prioritized (P1 through P4)
- [ ] Audit report includes executive summary suitable for management

## Veto Conditions

- STOP if the input file is not an SOP (wrong document type)
- STOP if the file is empty or unreadable
- STOP if compliance standards are specified but their requirements cannot be loaded
- STOP if the SOP is less than 100 words (insufficient content to audit)
- STOP if deep audit is requested but the SOP references external documents that cannot be accessed
