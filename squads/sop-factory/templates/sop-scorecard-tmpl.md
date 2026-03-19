# SOP Scorecard

| Field              | Value                          |
|--------------------|--------------------------------|
| **SOP ID**         | {{sop_id}}                     |
| **SOP Title**      | {{sop_title}}                  |
| **Version**        | {{sop_version}}                |
| **Assessed By**    | {{assessor_name}}              |
| **Assessment Date**| {{assessment_date}}            |

---

## Overall Assessment

| Metric              | Value                          |
|---------------------|--------------------------------|
| **Overall Score**   | **{{overall_score}} / 100**    |
| **Grade**           | **{{grade}}**                  |
| **Verdict**         | **{{verdict}}**                |

**Grade Scale:** A (90-100) | B (80-89) | C (70-79) | D (60-69) | F (<60)
**Verdicts:** APPROVED | APPROVED WITH CONDITIONS | NEEDS REVISION | REDO

---

## 10-Dimension Heatmap

<!-- HEATMAP GUIDANCE:
     - Score 0-10 per dimension.
     - Status uses visual indicators:
       - 9-10 = EXCELLENT
       - 7-8  = GOOD
       - 5-6  = FAIR
       - 3-4  = POOR
       - 0-2  = CRITICAL
-->

| #  | Dimension                    | Score   | Grade | Status     |
|----|------------------------------|---------|-------|------------|
|  1 | Clarity & Readability        | {{score_1}}/10  | {{grade_1}} | {{status_1}} |
|  2 | Completeness                 | {{score_2}}/10  | {{grade_2}} | {{status_2}} |
|  3 | Accuracy & Correctness       | {{score_3}}/10  | {{grade_3}} | {{status_3}} |
|  4 | Actionability                | {{score_4}}/10  | {{grade_4}} | {{status_4}} |
|  5 | Compliance & Governance      | {{score_5}}/10  | {{grade_5}} | {{status_5}} |
|  6 | Error Handling & Recovery    | {{score_6}}/10  | {{grade_6}} | {{status_6}} |
|  7 | Measurability & Verification | {{score_7}}/10  | {{grade_7}} | {{status_7}} |
|  8 | Maintainability              | {{score_8}}/10  | {{grade_8}} | {{status_8}} |
|  9 | Role Clarity (RACI)          | {{score_9}}/10  | {{grade_9}} | {{status_9}} |
| 10 | Machine Readability          | {{score_10}}/10 | {{grade_10}}| {{status_10}}|

**Status Key:** EXCELLENT | GOOD | FAIR | POOR | CRITICAL

**Visual Heatmap:**
```
Clarity      [{{d1_bar}}] {{score_1}}/10
Completeness [{{d2_bar}}] {{score_2}}/10
Accuracy     [{{d3_bar}}] {{score_3}}/10
Actionable   [{{d4_bar}}] {{score_4}}/10
Compliance   [{{d5_bar}}] {{score_5}}/10
Error Hdl    [{{d6_bar}}] {{score_6}}/10
Measurable   [{{d7_bar}}] {{score_7}}/10
Maintain     [{{d8_bar}}] {{score_8}}/10
RACI         [{{d9_bar}}] {{score_9}}/10
ML-Ready     [{{d10_bar}}] {{score_10}}/10
```

---

## Top 3 Strengths

| #  | Dimension              | Strength                                  |
|----|------------------------|-------------------------------------------|
| 1  | {{str_1_dimension}}    | {{strength_1_description}}                |
| 2  | {{str_2_dimension}}    | {{strength_2_description}}                |
| 3  | {{str_3_dimension}}    | {{strength_3_description}}                |

---

## Top 3 Improvements Needed

| #  | Dimension              | Issue                       | Priority | Recommended Action              |
|----|------------------------|-----------------------------|----------|---------------------------------|
| 1  | {{imp_1_dimension}}    | {{improvement_1_description}} | {{imp_1_priority}} | {{imp_1_action}}     |
| 2  | {{imp_2_dimension}}    | {{improvement_2_description}} | {{imp_2_priority}} | {{imp_2_action}}     |
| 3  | {{imp_3_dimension}}    | {{improvement_3_description}} | {{imp_3_priority}} | {{imp_3_action}}     |

**Priority:** P1 (Critical) | P2 (High) | P3 (Medium)

---

## Verdict & Next Steps

**Verdict:** {{verdict}}

{{verdict_rationale}}

**Required Actions Before Approval:**

{{#if has_required_actions}}
- [ ] {{required_action_1}}
- [ ] {{required_action_2}}
- [ ] {{required_action_3}}
{{else}}
No blocking actions. SOP is approved for use.
{{/if}}

---

## Next Review

| Field               | Value              |
|---------------------|--------------------|
| **Next Review Date** | {{next_review_date}} |
| **Review Type**     | {{review_type}}    |
| **Assigned Reviewer** | {{reviewer_name}} |
| **Full Report Ref** | {{report_id_ref}}  |

<!-- Review Type: FULL (all dimensions) | TARGETED (specific dimensions) | DELTA (changes since last review) -->

---

*Scorecard generated on {{assessment_date}}. Full analysis: {{report_id_ref}}.*
*Template: sop-scorecard-tmpl.md | SOP Factory | Synkra AIOX*
