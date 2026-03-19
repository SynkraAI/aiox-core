# Task: Benchmark SOP Against Standards

## Task Anatomy

| Field | Value |
|-------|-------|
| **Task ID** | `benchmark-sop` |
| **Version** | `1.0.0` |
| **Status** | `active` |
| **Responsible Executor** | `sop-analyst` |
| **Execution Type** | `Agent` |

## Metadata
```yaml
id: benchmark-sop
name: "Benchmark SOP Against Standards"
category: analysis
agent: sop-analyst
elicit: true
autonomous: false
description: "Compare an SOP against specific industry standards (ISO 9001, FDA/GMP, Six Sigma, Toyota Production System, Gawande Checklist Principles). Maps every standard requirement, calculates compliance percentage, and identifies gaps prioritized by severity."
```

## Purpose

Benchmark an existing SOP against one or more recognized process documentation standards. Unlike the general `analyze-sop` task which scores against internal quality dimensions, this task maps the SOP point-by-point against the requirements of a specific external standard. This is critical for organizations seeking certification, operating in regulated industries, or aiming to adopt best-in-class methodologies.

## Prerequisites

- [ ] SOP file exists and is accessible
- [ ] Target benchmark standard identified
- [ ] Standards reference data (`sop-standards-reference.yaml`) accessible

## Inputs

```yaml
inputs:
  sop_file:
    type: filepath
    required: true
    description: "Path to the SOP file to benchmark"

  benchmark_standard:
    type: enum
    required: true
    options: [iso-9001, fda-gmp, six-sigma, toyota, gawande, all]
    description: >
      Standard to benchmark against:
      - iso-9001: ISO 9001:2015 Quality Management Systems
      - fda-gmp: FDA 21 CFR Part 11 / Good Manufacturing Practice
      - six-sigma: Six Sigma DMAIC process documentation requirements
      - toyota: Toyota Production System standardized work principles
      - gawande: Atul Gawande's Checklist Manifesto principles
      - all: Benchmark against all standards (comprehensive)
```

## Standards Requirements Reference

### ISO 9001:2015 Requirements for Documented Procedures

```yaml
iso_9001:
  document_control:
    - req: "DOC-01"
      text: "Unique document identifier assigned"
      section: "7.5.2"
    - req: "DOC-02"
      text: "Version number and revision history maintained"
      section: "7.5.2"
    - req: "DOC-03"
      text: "Effective date specified"
      section: "7.5.2"
    - req: "DOC-04"
      text: "Author and approver identified"
      section: "7.5.2"
    - req: "DOC-05"
      text: "Review cycle and next review date defined"
      section: "7.5.2"
    - req: "DOC-06"
      text: "Distribution and access control specified"
      section: "7.5.3"

  process_approach:
    - req: "PROC-01"
      text: "Process inputs defined"
      section: "4.4.1"
    - req: "PROC-02"
      text: "Process outputs defined"
      section: "4.4.1"
    - req: "PROC-03"
      text: "Sequence and interaction of steps documented"
      section: "4.4.1"
    - req: "PROC-04"
      text: "Criteria and methods for process control defined"
      section: "4.4.1"
    - req: "PROC-05"
      text: "Resources required identified"
      section: "4.4.1"
    - req: "PROC-06"
      text: "Responsibilities and authorities assigned"
      section: "4.4.1"
    - req: "PROC-07"
      text: "Risks and opportunities addressed"
      section: "4.4.1"

  performance:
    - req: "PERF-01"
      text: "Monitoring and measurement methods defined"
      section: "9.1.1"
    - req: "PERF-02"
      text: "Performance indicators (KPIs) specified"
      section: "9.1.1"
    - req: "PERF-03"
      text: "Nonconformity and corrective action procedures"
      section: "10.2"

  improvement:
    - req: "IMP-01"
      text: "Continual improvement mechanism described"
      section: "10.3"
    - req: "IMP-02"
      text: "Feedback collection method specified"
      section: "10.3"
```

### FDA/GMP Requirements

```yaml
fda_gmp:
  structure:
    - req: "FDA-01"
      text: "Purpose statement present"
    - req: "FDA-02"
      text: "Scope clearly defined"
    - req: "FDA-03"
      text: "Definitions and abbreviations section"
    - req: "FDA-04"
      text: "Responsibilities section with named roles"
    - req: "FDA-05"
      text: "Materials and equipment listed"
    - req: "FDA-06"
      text: "Step-by-step procedure with numbered steps"
    - req: "FDA-07"
      text: "Quality control/verification section"
    - req: "FDA-08"
      text: "References and related documents"
    - req: "FDA-09"
      text: "Revision history with signatures"
    - req: "FDA-10"
      text: "Training requirements specified"
    - req: "FDA-11"
      text: "Record keeping requirements defined"

  compliance:
    - req: "FDA-12"
      text: "Electronic signature controls (21 CFR Part 11)"
    - req: "FDA-13"
      text: "Audit trail requirements"
    - req: "FDA-14"
      text: "Deviation handling procedures"
    - req: "FDA-15"
      text: "CAPA (Corrective and Preventive Action) integration"
```

### Toyota Production System (Standardized Work)

```yaml
toyota_tps:
  - req: "TPS-01"
    text: "Takt time defined (cycle time aligned to demand)"
  - req: "TPS-02"
    text: "Work sequence clearly specified"
  - req: "TPS-03"
    text: "Standard in-process stock defined"
  - req: "TPS-04"
    text: "Visual management elements present (diagrams, photos)"
  - req: "TPS-05"
    text: "One-point lessons for key skills"
  - req: "TPS-06"
    text: "Abnormality response defined (andon/escalation)"
  - req: "TPS-07"
    text: "Kaizen opportunities documented"
  - req: "TPS-08"
    text: "Gemba-verified (observed at the actual workplace)"
  - req: "TPS-09"
    text: "Waste categories addressed (muda, mura, muri)"
  - req: "TPS-10"
    text: "5S integration (Sort, Set, Shine, Standardize, Sustain)"
```

### Gawande Checklist Principles

```yaml
gawande:
  - req: "GAW-01"
    text: "Fits on one page (brevity)"
  - req: "GAW-02"
    text: "Each item is a single, verifiable action"
  - req: "GAW-03"
    text: "Pause points at critical junctures"
  - req: "GAW-04"
    text: "DO-CONFIRM or READ-DO format specified"
  - req: "GAW-05"
    text: "Tested in real-world conditions"
  - req: "GAW-06"
    text: "Revision date present"
  - req: "GAW-07"
    text: "No unnecessary explanation (reference SOP for detail)"
  - req: "GAW-08"
    text: "Kill items (things that MUST happen or process halts)"
```

### Six Sigma DMAIC Documentation

```yaml
six_sigma:
  - req: "SS-01"
    text: "Problem/process defined with CTQ (Critical to Quality)"
  - req: "SS-02"
    text: "Measurement system defined"
  - req: "SS-03"
    text: "Data collection plan specified"
  - req: "SS-04"
    text: "Root cause analysis methodology documented"
  - req: "SS-05"
    text: "Control plan for sustained performance"
  - req: "SS-06"
    text: "Statistical process control parameters"
  - req: "SS-07"
    text: "SIPOC (Supplier-Input-Process-Output-Customer) defined"
  - req: "SS-08"
    text: "Voice of Customer (VOC) integrated"
```

## Workflow / Steps

### 1. Select Standard

```
ACTION: Load benchmark criteria based on selected standard

IF benchmark_standard == "all":
  Load ALL standards (ISO 9001 + FDA/GMP + Six Sigma + Toyota + Gawande)
  total_requirements = sum of all requirements
ELSE:
  Load selected standard requirements
  total_requirements = count of requirements for that standard

STORE: benchmark_criteria = {
  standard: "<name>",
  requirements: [<loaded requirements>],
  total_count: <number>
}
```

### 2. Map Requirements

```
ACTION: Map each standard requirement to SOP content

FOR EACH requirement in benchmark_criteria:
  SEARCH SOP content for evidence of compliance
  CLASSIFY as:
    - COMPLIANT: Requirement fully met with clear evidence
    - PARTIAL: Requirement partially met (some elements present)
    - NON_COMPLIANT: Requirement not met (no evidence found)
    - NOT_APPLICABLE: Requirement does not apply to this process type

FORMAT per mapping:
  - req_id: "<requirement ID>"
    requirement: "<requirement text>"
    status: "<COMPLIANT|PARTIAL|NON_COMPLIANT|NOT_APPLICABLE>"
    evidence: "<specific section/text in SOP that addresses this>"
    gap_description: "<what is missing, if not fully compliant>"
    severity: "critical|major|minor"
```

### 3. Gap Analysis

```
ACTION: Analyze non-compliant and partial items

FOR EACH NON_COMPLIANT or PARTIAL item:
  - Describe specifically what is missing
  - Assess severity:
    * critical: Regulatory risk, safety impact, or audit finding
    * major: Significant quality or process impact
    * minor: Best practice gap, no immediate risk
  - Estimate effort to remediate:
    * quick_fix: < 30 minutes (add a section, define a term)
    * moderate: 1-4 hours (write a new section, create a diagram)
    * major: > 4 hours (significant rewrite, process redesign)

GROUP gaps by:
  - Standard section (document control, process, performance, etc.)
  - Severity (critical first)
```

### 4. Score Compliance

```
ACTION: Calculate compliance percentages

SCORING:
  - COMPLIANT = 1.0 point
  - PARTIAL = 0.5 point
  - NON_COMPLIANT = 0.0 points
  - NOT_APPLICABLE = excluded from calculation

PER SECTION:
  section_score = (points earned / applicable requirements) * 100%

OVERALL:
  total_score = (total points earned / total applicable requirements) * 100%

GRADE:
  >= 90%: "Highly Compliant" (Green)
  75-89%: "Substantially Compliant" (Yellow)
  60-74%: "Partially Compliant" (Orange)
  < 60%: "Non-Compliant" (Red)
```

### 5. Generate Benchmark Report

```
ACTION: Compile benchmark report with compliance heatmap

STRUCTURE:
  # SOP Benchmark Report: {SOP Name}
  ## Benchmark Standard: {standard name}

  ### Executive Summary
  - Overall Compliance: {percentage}% ({grade})
  - Requirements Assessed: {total}
  - Compliant: {count} | Partial: {count} | Non-Compliant: {count} | N/A: {count}
  - Critical Gaps: {count}

  ### Compliance Heatmap
  | Section | Requirements | Compliant | Partial | Non-Compliant | Score |
  |---------|-------------|-----------|---------|---------------|-------|
  | Document Control | X | X | X | X | XX% |
  | Process Approach | X | X | X | X | XX% |
  | ... | ... | ... | ... | ... | ... |
  | **TOTAL** | **X** | **X** | **X** | **X** | **XX%** |

  ### Detailed Findings
  #### Critical Gaps
  | Req ID | Requirement | Status | Gap | Remediation |
  ...

  #### Major Gaps
  ...

  #### Minor Gaps
  ...

  ### Remediation Roadmap
  #### Phase 1: Critical (Immediate)
  ...
  #### Phase 2: Major (Within 30 days)
  ...
  #### Phase 3: Minor (Within 90 days)
  ...

  ### Compliance Certification Statement
  Based on this assessment, the SOP is rated as: {grade}
  Next recommended review: {date}

FILE: outputs/sop-factory/analysis/{sop-name}-benchmark-{standard}.md
```

## Output

```yaml
outputs:
  primary:
    path: "outputs/sop-factory/analysis/{sop-name}-benchmark-{standard}.md"
    format: markdown
    description: "Benchmark report with compliance heatmap, findings, and remediation roadmap"

  metadata:
    standard: "<benchmark standard>"
    total_requirements: "<number>"
    compliance_percentage: "<number>"
    compliance_grade: "<Highly|Substantially|Partially|Non>-Compliant"
    critical_gaps: "<number>"
    major_gaps: "<number>"
    minor_gaps: "<number>"
```

## Acceptance Criteria

- [ ] Every requirement from the selected standard is mapped to the SOP
- [ ] Each mapping has a status (COMPLIANT, PARTIAL, NON_COMPLIANT, NOT_APPLICABLE)
- [ ] Each non-compliant item has specific evidence of what is missing
- [ ] Compliance percentage is calculated correctly per section and overall
- [ ] Gaps are prioritized by severity (critical, major, minor)
- [ ] Compliance heatmap table is generated with per-section scores
- [ ] Remediation roadmap is phased (immediate, 30 days, 90 days)
- [ ] Grade is assigned matching the compliance percentage scale
- [ ] Report includes specific, actionable remediation steps (not generic advice)

## Veto Conditions

- STOP if the input file is not an SOP
- STOP if the benchmark standard is specified but its requirements data cannot be loaded
- STOP if the SOP is in a format that cannot be meaningfully mapped to the standard (e.g., a raw YAML config file benchmarked against Gawande checklist principles)
- STOP if "all" standards are selected but fewer than 3 standards can be applied to the process type
