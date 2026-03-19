# Task: Validate Phase 1

**Task ID:** knowledge-base-builder/validate-phase1
**Version:** 1.0.0
**Status:** Production Ready
**Created:** 2026-02-13
**Category:** Phase 1 - Validation

---

## Executive Summary

This task runs all Phase 1 quality checks (material coverage, concept quality, taxonomy integrity, traceability), calculates the overall quality score, and produces a quality report with remediation plan for any failures. This is the mandatory validation gate before Phase 2.

**Workflow Position:** Step 1.7 of full pipeline (final Phase 1 step)
**Success Definition:** Quality score >= 7.0, zero blocking failures
**Output Quality Gate:** PHASE1-COMPLETE (requires user approval)

---

## Executor Type

**Agent (80%) + Human Validation (20%)**
- Agent runs all automated checks and calculates scores
- Human reviews quality report and approves Phase 1

---

## Inputs

```yaml
knowledge_base_path:
  field: "Path to Phase 1 output directory"
  format: "Absolute file path"
  required: true

processing_log:
  field: "Processing log from ingestion"
  format: "processing-log.yaml"
  required: true
```

---

## Action Items

### Step 1: Material Coverage Checks (KB-COV-*)
1. KB-COV-001: Verify all inventory files were attempted (check processing log)
2. KB-COV-002: Calculate parse success rate (>= 95% required)
3. KB-COV-003: Spot-check text extraction completeness
4. KB-COV-004: Verify every failure has documented error reason

### Step 2: Concept Quality Checks (KB-CPT-*)
1. KB-CPT-001: Count total concepts (>= 20 required)
2. KB-CPT-002: Calculate definition coverage (>= 90% required)
3. KB-CPT-003: Verify source attribution (100% required)
4. KB-CPT-004: Calculate relationship coverage (>= 80% target)
5. KB-CPT-005: Check confidence distribution (<= 10% below 0.6)
6. KB-CPT-006: Scan for duplicate concepts

### Step 3: Taxonomy Integrity Checks (KB-TAX-*)
1. KB-TAX-001: Count orphan concepts (must be 0)
2. KB-TAX-002: Measure hierarchy depth (2-5 levels)
3. KB-TAX-003: Calculate category balance ratio (<= 5:1)
4. KB-TAX-004: Check for overlapping categories (MECE)
5. KB-TAX-005: Verify navigation paths (>= 2 required)
6. KB-TAX-006: Calculate tag coverage (>= 90% with 2+ tags)

### Step 4: Traceability Checks (KB-TRC-*)
1. KB-TRC-001: Calculate full chain coverage (>= 98% required)
2. KB-TRC-002: Verify all link references resolve (100% required)
3. KB-TRC-003: Check bidirectional completeness (100% required)
4. KB-TRC-004: Verify citation completeness (>= 95% target)
5. KB-TRC-005: Check cross-reference evidence

### Step 5: Score Calculation
```
Material Coverage Score = weighted average of KB-COV-* results (weight: 0.20)
Concept Quality Score = weighted average of KB-CPT-* results (weight: 0.30)
Taxonomy Integrity Score = weighted average of KB-TAX-* results (weight: 0.20)
Traceability Score = weighted average of KB-TRC-* results (weight: 0.30)

Overall Score = sum of weighted suite scores (0-10 scale)

Status:
  PASS: score >= 8.0 AND zero blocking failures
  PASS_WITH_WARNINGS: score >= 7.0 AND zero blocking failures
  FAIL: score < 7.0 OR any blocking failure
```

### Step 6: Remediation Plan
For each failing check:
1. Identify root cause
2. Determine which agent should fix it
3. Estimate fix time
4. Prioritize: blocking fixes first, then warnings

### Step 7: Present to User
1. Show quality score and status
2. Show key metrics: material coverage, concept count, traceability
3. Show any issues with remediation steps
4. Request explicit approval: "Phase 1 approved, proceed to Phase 2"

---

## Output

```yaml
output:
  quality_report:
    path: "{output_path}/reports/quality-report.yaml"
    format: "Full validation results with per-check pass/fail"

  coverage_report:
    path: "{output_path}/reports/coverage-report.yaml"
    format: "Material processing coverage statistics"

  quality_report_md:
    path: "{output_path}/reports/quality-report.md"
    format: "Human-readable quality report"
```

---

## Acceptance Criteria

- [ ] All 21 checks executed (KB-COV 4 + KB-CPT 6 + KB-TAX 6 + KB-TRC 5)
- [ ] Overall quality score calculated and reported
- [ ] Blocking failures clearly identified
- [ ] Remediation plan includes specific fix actions
- [ ] Human-readable quality report generated
- [ ] User approval recorded before Phase 2 proceeds
