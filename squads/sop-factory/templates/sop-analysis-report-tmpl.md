# SOP Analysis Report

| Field              | Value                           |
|--------------------|---------------------------------|
| **Report ID**      | {{report_id}}                   |
| **SOP Analyzed**   | {{sop_id}} v{{sop_version}}     |
| **SOP Title**      | {{sop_title}}                   |
| **Analyst**        | {{analyst_name}}                |
| **Analysis Date**  | {{analysis_date}}               |
| **Report Version** | {{report_version}}              |
| **Methodology**    | {{methodology}}                 |

---

## 1. Executive Summary

### Overall Assessment

| Metric              | Value                          |
|---------------------|--------------------------------|
| **Overall Score**   | {{overall_score}} / 100        |
| **Grade**           | {{grade}}                      |
| **Verdict**         | {{verdict}}                    |
| **Risk Level**      | {{risk_level}}                 |

**Grade Scale:** A (90-100) Exemplary | B (80-89) Effective | C (70-79) Adequate | D (60-69) Below Standard | F (<60) Unacceptable

### Top 3 Findings

| #  | Finding                          | Severity   | Dimension              | Impact                        |
|----|----------------------------------|------------|------------------------|-------------------------------|
| 1  | {{finding_1_title}}              | {{finding_1_severity}} | {{finding_1_dimension}} | {{finding_1_impact}}   |
| 2  | {{finding_2_title}}              | {{finding_2_severity}} | {{finding_2_dimension}} | {{finding_2_impact}}   |
| 3  | {{finding_3_title}}              | {{finding_3_severity}} | {{finding_3_dimension}} | {{finding_3_impact}}   |

### Recommendation

{{executive_recommendation}}

---

## 2. Dimensional Scorecard

<!-- SCORECARD GUIDANCE:
     - Score each dimension 0-10.
     - Weight reflects importance to overall score (must sum to 1.00).
     - Weighted Score = Score x Weight.
     - Overall Score = Sum of Weighted Scores x 10 (to get 0-100 scale).
-->

| #  | Dimension                    | Score (0-10) | Weight | Weighted Score | Assessment          |
|----|------------------------------|:------------:|:------:|:--------------:|---------------------|
| 1  | Clarity & Readability        | {{score_1}}  | 0.12   | {{weighted_1}} | {{assessment_1}}    |
| 2  | Completeness                 | {{score_2}}  | 0.15   | {{weighted_2}} | {{assessment_2}}    |
| 3  | Accuracy & Correctness       | {{score_3}}  | 0.12   | {{weighted_3}} | {{assessment_3}}    |
| 4  | Actionability                | {{score_4}}  | 0.10   | {{weighted_4}} | {{assessment_4}}    |
| 5  | Compliance & Governance      | {{score_5}}  | 0.12   | {{weighted_5}} | {{assessment_5}}    |
| 6  | Error Handling & Recovery    | {{score_6}}  | 0.10   | {{weighted_6}} | {{assessment_6}}    |
| 7  | Measurability & Verification | {{score_7}}  | 0.08   | {{weighted_7}} | {{assessment_7}}    |
| 8  | Maintainability              | {{score_8}}  | 0.07   | {{weighted_8}} | {{assessment_8}}    |
| 9  | Role Clarity (RACI)          | {{score_9}}  | 0.08   | {{weighted_9}} | {{assessment_9}}    |
| 10 | Machine Readability          | {{score_10}} | 0.06   | {{weighted_10}}| {{assessment_10}}   |
|    | **TOTAL**                    |              | **1.00** | **{{total_weighted}}** |              |
|    | **Overall Score (x10)**      |              |        | **{{overall_score}}/100** |           |

---

## 3. Detailed Findings

<!-- DETAILED FINDINGS GUIDANCE:
     - One subsection per dimension.
     - For each: what was evaluated, what was found, evidence, impact, recommendation.
     - Use severity tags: [CRITICAL] [HIGH] [MEDIUM] [LOW] [INFO]
-->

### 3.1 Clarity & Readability ({{score_1}}/10)

**What was evaluated:** Language clarity, sentence structure, use of jargon, formatting consistency, logical flow, readability metrics (Flesch-Kincaid).

**Strengths:**
- {{d1_strength_1}}
- {{d1_strength_2}}

**Findings:**

| #  | Finding                | Severity       | Evidence           | Impact              |
|----|------------------------|----------------|--------------------|---------------------|
| 1  | {{d1_finding_1}}       | {{d1_sev_1}}   | {{d1_evidence_1}}  | {{d1_impact_1}}     |
| 2  | {{d1_finding_2}}       | {{d1_sev_2}}   | {{d1_evidence_2}}  | {{d1_impact_2}}     |

**Recommendation:** {{d1_recommendation}}

---

### 3.2 Completeness ({{score_2}}/10)

**What was evaluated:** Presence and completeness of all required SOP sections per organizational template and regulatory standards.

**Strengths:**
- {{d2_strength_1}}
- {{d2_strength_2}}

**Findings:**

| #  | Finding                | Severity       | Evidence           | Impact              |
|----|------------------------|----------------|--------------------|---------------------|
| 1  | {{d2_finding_1}}       | {{d2_sev_1}}   | {{d2_evidence_1}}  | {{d2_impact_1}}     |
| 2  | {{d2_finding_2}}       | {{d2_sev_2}}   | {{d2_evidence_2}}  | {{d2_impact_2}}     |

**Recommendation:** {{d2_recommendation}}

---

### 3.3 Accuracy & Correctness ({{score_3}}/10)

**What was evaluated:** Technical accuracy, correct references, valid commands/procedures, up-to-date information.

**Strengths:**
- {{d3_strength_1}}
- {{d3_strength_2}}

**Findings:**

| #  | Finding                | Severity       | Evidence           | Impact              |
|----|------------------------|----------------|--------------------|---------------------|
| 1  | {{d3_finding_1}}       | {{d3_sev_1}}   | {{d3_evidence_1}}  | {{d3_impact_1}}     |
| 2  | {{d3_finding_2}}       | {{d3_sev_2}}   | {{d3_evidence_2}}  | {{d3_impact_2}}     |

**Recommendation:** {{d3_recommendation}}

---

### 3.4 Actionability ({{score_4}}/10)

**What was evaluated:** Step-by-step clarity, one-action-per-step adherence, decision point logic, use of imperative mood, specificity of instructions.

**Strengths:**
- {{d4_strength_1}}
- {{d4_strength_2}}

**Findings:**

| #  | Finding                | Severity       | Evidence           | Impact              |
|----|------------------------|----------------|--------------------|---------------------|
| 1  | {{d4_finding_1}}       | {{d4_sev_1}}   | {{d4_evidence_1}}  | {{d4_impact_1}}     |
| 2  | {{d4_finding_2}}       | {{d4_sev_2}}   | {{d4_evidence_2}}  | {{d4_impact_2}}     |

**Recommendation:** {{d4_recommendation}}

---

### 3.5 Compliance & Governance ({{score_5}}/10)

**What was evaluated:** Alignment with applicable regulatory requirements (FDA 21 CFR, ISO, GMP, SOX, etc.), mandatory language, audit trail provisions, approval workflows.

**Strengths:**
- {{d5_strength_1}}
- {{d5_strength_2}}

**Findings:**

| #  | Finding                | Severity       | Evidence           | Impact              |
|----|------------------------|----------------|--------------------|---------------------|
| 1  | {{d5_finding_1}}       | {{d5_sev_1}}   | {{d5_evidence_1}}  | {{d5_impact_1}}     |
| 2  | {{d5_finding_2}}       | {{d5_sev_2}}   | {{d5_evidence_2}}  | {{d5_impact_2}}     |

**Recommendation:** {{d5_recommendation}}

---

### 3.6 Error Handling & Recovery ({{score_6}}/10)

**What was evaluated:** Failure mode identification, escalation paths, rollback procedures, deviation handling, recovery actions.

**Strengths:**
- {{d6_strength_1}}
- {{d6_strength_2}}

**Findings:**

| #  | Finding                | Severity       | Evidence           | Impact              |
|----|------------------------|----------------|--------------------|---------------------|
| 1  | {{d6_finding_1}}       | {{d6_sev_1}}   | {{d6_evidence_1}}  | {{d6_impact_1}}     |
| 2  | {{d6_finding_2}}       | {{d6_sev_2}}   | {{d6_evidence_2}}  | {{d6_impact_2}}     |

**Recommendation:** {{d6_recommendation}}

---

### 3.7 Measurability & Verification ({{score_7}}/10)

**What was evaluated:** Acceptance criteria specificity, measurability, verification methods, pause points, sign-off requirements.

**Strengths:**
- {{d7_strength_1}}
- {{d7_strength_2}}

**Findings:**

| #  | Finding                | Severity       | Evidence           | Impact              |
|----|------------------------|----------------|--------------------|---------------------|
| 1  | {{d7_finding_1}}       | {{d7_sev_1}}   | {{d7_evidence_1}}  | {{d7_impact_1}}     |
| 2  | {{d7_finding_2}}       | {{d7_sev_2}}   | {{d7_evidence_2}}  | {{d7_impact_2}}     |

**Recommendation:** {{d7_recommendation}}

---

### 3.8 Maintainability ({{score_8}}/10)

**What was evaluated:** Modular structure, version control, review schedule, change history, ease of update, template compliance.

**Strengths:**
- {{d8_strength_1}}
- {{d8_strength_2}}

**Findings:**

| #  | Finding                | Severity       | Evidence           | Impact              |
|----|------------------------|----------------|--------------------|---------------------|
| 1  | {{d8_finding_1}}       | {{d8_sev_1}}   | {{d8_evidence_1}}  | {{d8_impact_1}}     |
| 2  | {{d8_finding_2}}       | {{d8_sev_2}}   | {{d8_evidence_2}}  | {{d8_impact_2}}     |

**Recommendation:** {{d8_recommendation}}

---

### 3.9 Role Clarity — RACI ({{score_9}}/10)

**What was evaluated:** RACI matrix completeness, single accountability per activity, role clarity, escalation ownership.

**Strengths:**
- {{d9_strength_1}}
- {{d9_strength_2}}

**Findings:**

| #  | Finding                | Severity       | Evidence           | Impact              |
|----|------------------------|----------------|--------------------|---------------------|
| 1  | {{d9_finding_1}}       | {{d9_sev_1}}   | {{d9_evidence_1}}  | {{d9_impact_1}}     |
| 2  | {{d9_finding_2}}       | {{d9_sev_2}}   | {{d9_evidence_2}}  | {{d9_impact_2}}     |

**Recommendation:** {{d9_recommendation}}

---

### 3.10 Machine Readability ({{score_10}}/10)

**What was evaluated:** Suitability for conversion to ML-SOP format, structured data presence, automation potential, tool references, agent compatibility.

**Strengths:**
- {{d10_strength_1}}
- {{d10_strength_2}}

**Findings:**

| #  | Finding                | Severity       | Evidence           | Impact              |
|----|------------------------|----------------|--------------------|---------------------|
| 1  | {{d10_finding_1}}      | {{d10_sev_1}}  | {{d10_evidence_1}} | {{d10_impact_1}}    |
| 2  | {{d10_finding_2}}      | {{d10_sev_2}}  | {{d10_evidence_2}} | {{d10_impact_2}}    |

**Recommendation:** {{d10_recommendation}}

---

## 4. Gap Inventory

<!-- GAP INVENTORY GUIDANCE:
     - Consolidate all gaps found across all dimensions.
     - Prioritize: P1 (Critical, fix immediately), P2 (High, fix before approval), P3 (Medium, fix in next revision).
     - Map each gap to the dimension and finding that identified it.
     - Estimate effort: XS (< 1hr), S (1-4hr), M (4-8hr), L (1-3 days), XL (> 3 days).
-->

| Gap ID  | Gap Description                | Dimension              | Severity   | Current State         | Target State             | Effort     |
|---------|--------------------------------|------------------------|------------|-----------------------|--------------------------|------------|
| GAP-001 | {{gap_1_description}}          | {{gap_1_dimension}}    | {{gap_1_sev}} | {{gap_1_current}}  | {{gap_1_target}}         | {{gap_1_effort}} |
| GAP-002 | {{gap_2_description}}          | {{gap_2_dimension}}    | {{gap_2_sev}} | {{gap_2_current}}  | {{gap_2_target}}         | {{gap_2_effort}} |
| GAP-003 | {{gap_3_description}}          | {{gap_3_dimension}}    | {{gap_3_sev}} | {{gap_3_current}}  | {{gap_3_target}}         | {{gap_3_effort}} |
| GAP-004 | {{gap_4_description}}          | {{gap_4_dimension}}    | {{gap_4_sev}} | {{gap_4_current}}  | {{gap_4_target}}         | {{gap_4_effort}} |
| GAP-005 | {{gap_5_description}}          | {{gap_5_dimension}}    | {{gap_5_sev}} | {{gap_5_current}}  | {{gap_5_target}}         | {{gap_5_effort}} |

**Summary:** {{total_gaps}} gaps identified ({{p1_count}} P1, {{p2_count}} P2, {{p3_count}} P3)

**Effort Scale:** XS (< 1h) | S (1-4h) | M (4-8h) | L (1-3 days) | XL (> 3 days)

---

## 5. Remediation Plan

### Priority 1 — Critical (Must fix before approval)

| #  | Action                          | Gap Ref   | Owner          | Deadline        | Success Criteria          | Status     |
|----|---------------------------------|-----------|----------------|-----------------|---------------------------|------------|
| 1  | {{p1_action_1}}                 | GAP-{{p1_gap_ref_1}} | {{p1_owner_1}} | {{p1_deadline_1}} | {{p1_criteria_1}} | {{p1_status_1}} |
| 2  | {{p1_action_2}}                 | GAP-{{p1_gap_ref_2}} | {{p1_owner_2}} | {{p1_deadline_2}} | {{p1_criteria_2}} | {{p1_status_2}} |

### Priority 2 — High (Must fix within 30 days)

| #  | Action                          | Gap Ref   | Owner          | Deadline        | Success Criteria          | Status     |
|----|---------------------------------|-----------|----------------|-----------------|---------------------------|------------|
| 1  | {{p2_action_1}}                 | GAP-{{p2_gap_ref_1}} | {{p2_owner_1}} | {{p2_deadline_1}} | {{p2_criteria_1}} | {{p2_status_1}} |
| 2  | {{p2_action_2}}                 | GAP-{{p2_gap_ref_2}} | {{p2_owner_2}} | {{p2_deadline_2}} | {{p2_criteria_2}} | {{p2_status_2}} |

### Priority 3 — Medium (Fix in next revision cycle)

| #  | Action                          | Gap Ref   | Owner          | Deadline        | Success Criteria          | Status     |
|----|---------------------------------|-----------|----------------|-----------------|---------------------------|------------|
| 1  | {{p3_action_1}}                 | GAP-{{p3_gap_ref_1}} | {{p3_owner_1}} | {{p3_deadline_1}} | {{p3_criteria_1}} | {{p3_status_1}} |
| 2  | {{p3_action_2}}                 | GAP-{{p3_gap_ref_2}} | {{p3_owner_2}} | {{p3_deadline_2}} | {{p3_criteria_2}} | {{p3_status_2}} |

---

## 6. Metadata

| Field                | Value                           |
|----------------------|---------------------------------|
| **Analysis Tool**    | {{analysis_tool}}               |
| **Tool Version**     | {{tool_version}}                |
| **Time Spent**       | {{analysis_duration}}           |
| **Documents Reviewed** | {{documents_reviewed}}        |
| **Methodology**      | {{methodology}}                 |
| **Confidence Level** | {{confidence_level}}            |
| **Regulatory Context** | {{regulatory_context}}        |
| **Next Review**      | {{next_review_date}}            |

### Scoring Methodology

Each dimension is scored 0-10 and weighted according to the SOP's domain and risk level. The overall score is the sum of weighted dimension scores multiplied by 10 (to produce a 0-100 scale). Grades follow the standard scale:

- **A (90-100):** Exemplary — ready for immediate deployment
- **B (80-89):** Effective — minor improvements recommended
- **C (70-79):** Adequate — several improvements needed before deployment
- **D (60-69):** Below Standard — significant rework required
- **F (<60):** Unacceptable — fundamental redesign needed

---

*Report generated on {{analysis_date}} by {{analyst_name}}. Report ID: {{report_id}}.*
*Template: sop-analysis-report-tmpl.md | SOP Factory | Synkra AIOX*
