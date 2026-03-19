# {{sop_title}}

| Field              | Value                              |
|--------------------|------------------------------------|
| **SOP ID**         | {{sop_id}}                         |
| **Version**        | {{version}}                        |
| **Effective Date** | {{effective_date}}                 |
| **Author**         | {{author_name}} ({{author_role}})  |
| **Approver**       | {{approver_name}} ({{approver_role}}) |
| **Next Review**    | {{review_date}}                    |
| **Classification** | {{classification}}                 |
| **Status**         | {{status}}                         |

> **Regulatory Basis:** FDA 21 CFR Part 211 / GMP Annex 15 — This document follows controlled-document standards. All changes require formal revision and re-approval.

<!-- HEADER GUIDANCE:
     - sop_id follows the pattern: SOP-[DEPT]-[SEQ]-[REV] (e.g., SOP-QA-042-R03)
     - classification: CRITICAL / MAJOR / STANDARD / INFORMATIONAL
     - status: DRAFT / IN REVIEW / APPROVED / SUPERSEDED / RETIRED
     - Review cycle: CRITICAL=6mo, MAJOR=12mo, STANDARD=18mo, INFORMATIONAL=24mo
-->

---

## 1. Purpose & Scope

### 1.1 Purpose

<!-- PURPOSE GUIDANCE:
     - One paragraph, 2-4 sentences maximum.
     - Answer: WHY does this SOP exist? What outcome does it ensure?
     - Start with an action verb: "To establish...", "To ensure...", "To define..."
-->

{{purpose_statement}}

### 1.2 Scope

**In Scope:**
- {{scope_in_1}}
- {{scope_in_2}}
- {{scope_in_3}}

**Out of Scope:**
- {{scope_out_1}}
- {{scope_out_2}}

### 1.3 Applicability

This SOP applies to: {{applicable_roles_and_departments}}

### 1.4 Applicable Regulations & Standards

| Standard            | Reference                        |
|---------------------|----------------------------------|
| {{standard_1}}      | {{reference_1}}                  |
| {{standard_2}}      | {{reference_2}}                  |
| {{standard_3}}      | {{reference_3}}                  |

---

## 2. Definitions & Abbreviations

<!-- DEFINITIONS GUIDANCE:
     - List every term that could be ambiguous or domain-specific.
     - Alphabetical order.
     - Include abbreviations used anywhere in the document.
-->

| Term / Abbreviation | Definition                         |
|----------------------|------------------------------------|
| {{term_1}}           | {{definition_1}}                   |
| {{term_2}}           | {{definition_2}}                   |
| {{term_3}}           | {{definition_3}}                   |
| {{term_4}}           | {{definition_4}}                   |
| {{term_5}}           | {{definition_5}}                   |

---

## 3. Roles & Responsibilities (RACI)

<!-- RACI GUIDANCE:
     - R = Responsible (does the work)
     - A = Accountable (owns the outcome, only ONE per activity)
     - C = Consulted (provides input before)
     - I = Informed (notified after)
     - Every row MUST have exactly one "A".
-->

| Activity                  | {{role_1}}  | {{role_2}}  | {{role_3}}  | {{role_4}}  |
|---------------------------|-------------|-------------|-------------|-------------|
| {{activity_1}}            | {{raci_1a}} | {{raci_1b}} | {{raci_1c}} | {{raci_1d}} |
| {{activity_2}}            | {{raci_2a}} | {{raci_2b}} | {{raci_2c}} | {{raci_2d}} |
| {{activity_3}}            | {{raci_3a}} | {{raci_3b}} | {{raci_3c}} | {{raci_3d}} |
| {{activity_4}}            | {{raci_4a}} | {{raci_4b}} | {{raci_4c}} | {{raci_4d}} |
| {{activity_5}}            | {{raci_5a}} | {{raci_5b}} | {{raci_5c}} | {{raci_5d}} |

---

## 4. Prerequisites

<!-- PREREQUISITES GUIDANCE:
     - Materials: list every physical item, reagent, form, or supply needed.
     - Equipment: list instruments, software, tools with calibration/version requirements.
     - Access: system permissions, credentials, badges required.
     - Training: certifications or training modules that must be completed BEFORE execution.
     - Conditions: environmental or scheduling conditions that must be met.
-->

### 4.1 Materials & Equipment

| Item               | Specification       | Quantity        | Notes               |
|--------------------|---------------------|-----------------|---------------------|
| {{material_1}}     | {{spec_1}}          | {{qty_1}}       | {{notes_1}}         |
| {{material_2}}     | {{spec_2}}          | {{qty_2}}       | {{notes_2}}         |
| {{material_3}}     | {{spec_3}}          | {{qty_3}}       | {{notes_3}}         |

### 4.2 System Access & Permissions

| System             | Permission Level    | How to Request     |
|--------------------|---------------------|--------------------|
| {{system_1}}       | {{permission_1}}    | {{request_1}}      |
| {{system_2}}       | {{permission_2}}    | {{request_2}}      |

### 4.3 Required Training

| Training Module       | Certification ID   | Validity Period    |
|-----------------------|--------------------|--------------------|
| {{training_1}}        | {{cert_id_1}}      | {{validity_1}}     |
| {{training_2}}        | {{cert_id_2}}      | {{validity_2}}     |

### 4.4 Environmental Conditions / Preconditions

- [ ] {{precondition_1}}
- [ ] {{precondition_2}}
- [ ] {{precondition_3}}

---

## 5. Procedure

<!-- PROCEDURE GUIDANCE:
     - Number every step sequentially (5.1, 5.2, ...).
     - One action per step. Use imperative mood: "Open...", "Record...", "Verify...".
     - Include expected duration where relevant.
     - Mark decision points clearly with IF/THEN/ELSE.
     - Mark CRITICAL steps with [CRITICAL] tag.
     - Mark CAUTION steps with [CAUTION] tag.
     - Include PAUSE POINTS where a second person must verify.
     - Reference forms, tools, and systems by exact name.
-->

> **INSTRUCTION:** Execute steps sequentially unless branching is indicated. Do NOT skip steps. Each step must be initialed and timestamped.

### 5.1 {{step_1_title}}

**Performer:** {{step_1_role}}
**Estimated Time:** {{step_1_duration}}

1. {{step_1_action_1}}
2. {{step_1_action_2}}
3. {{step_1_action_3}}

**Expected Result:** {{step_1_expected_result}}

| Initial | Date/Time | Notes |
|---------|-----------|-------|
|         |           |       |

---

### 5.2 {{step_2_title}}

**Performer:** {{step_2_role}}
**Estimated Time:** {{step_2_duration}}

1. {{step_2_action_1}}
2. {{step_2_action_2}}

> **[CRITICAL]** {{step_2_critical_instruction}}

**Expected Result:** {{step_2_expected_result}}

| Initial | Date/Time | Notes |
|---------|-----------|-------|
|         |           |       |

---

### 5.3 Decision Point: {{decision_title}}

**IF** {{condition_true}}:
- Proceed to Step 5.4

**ELSE IF** {{condition_alternative}}:
- {{alternative_action}}
- Proceed to Step {{alternative_step}}

**ELSE:**
- STOP. Escalate to {{escalation_contact}}
- Document deviation per {{deviation_sop_ref}}

---

### 5.4 {{step_4_title}}

**Performer:** {{step_4_role}}
**Estimated Time:** {{step_4_duration}}

> **[CAUTION]** {{step_4_caution_instruction}}

1. {{step_4_action_1}}
2. {{step_4_action_2}}
3. {{step_4_action_3}}

> **--- PAUSE POINT ---**
> Second person verification required before proceeding.
> Verifier: __________ Date: __________ Time: __________

**Expected Result:** {{step_4_expected_result}}

| Initial | Date/Time | Verifier Initial |
|---------|-----------|------------------|
|         |           |                  |

---

### 5.5 {{step_5_title}}

**Performer:** {{step_5_role}}
**Estimated Time:** {{step_5_duration}}

1. {{step_5_action_1}}
2. {{step_5_action_2}}
3. {{step_5_action_3}}

**Expected Result:** {{step_5_expected_result}}

| Initial | Date/Time | Notes |
|---------|-----------|-------|
|         |           |       |

---

## 6. Verification & Acceptance Criteria

<!-- VERIFICATION GUIDANCE:
     - Define measurable criteria for each critical output.
     - Specify acceptable ranges, tolerances, or pass/fail thresholds.
     - Include who verifies and how discrepancies are handled.
-->

| Checkpoint           | Criteria             | Method               | Acceptable Range      | Verifier             |
|----------------------|----------------------|----------------------|-----------------------|----------------------|
| {{checkpoint_1}}     | {{criteria_1}}       | {{method_1}}         | {{range_1}}           | {{verifier_1}}       |
| {{checkpoint_2}}     | {{criteria_2}}       | {{method_2}}         | {{range_2}}           | {{verifier_2}}       |
| {{checkpoint_3}}     | {{criteria_3}}       | {{method_3}}         | {{range_3}}           | {{verifier_3}}       |

**Acceptance Decision:**
- ALL checkpoints PASS: Proceed to Section 8 (Records).
- ANY checkpoint FAILS: Proceed to Section 7 (Error Handling).

---

## 7. Error Handling & Deviations

<!-- ERROR HANDLING GUIDANCE:
     - Cover the most common failure modes (top 5-10).
     - For each: symptom, root cause, immediate action, escalation path.
     - Reference the deviation/CAPA SOP for formal deviations.
     - Include rollback procedures where applicable.
-->

### 7.1 Known Failure Modes

| #  | Symptom                    | Probable Cause           | Immediate Action         | Escalation              |
|----|----------------------------|--------------------------|--------------------------|-------------------------|
| 1  | {{symptom_1}}              | {{cause_1}}              | {{action_1}}             | {{escalation_1}}        |
| 2  | {{symptom_2}}              | {{cause_2}}              | {{action_2}}             | {{escalation_2}}        |
| 3  | {{symptom_3}}              | {{cause_3}}              | {{action_3}}             | {{escalation_3}}        |

### 7.2 Deviation Procedure

1. **STOP** — Halt the procedure at the current step.
2. **DOCUMENT** — Record the deviation on Form {{deviation_form_id}}.
3. **ASSESS** — Determine impact on product quality / patient safety / data integrity.
4. **NOTIFY** — Notify {{deviation_notify_role}} within {{deviation_notify_timeframe}}.
5. **DO NOT RESUME** — Until written authorization is received from {{deviation_authorizer}}.
6. **RESOLVE** — Follow CAPA process per {{capa_sop_reference}}.

### 7.3 Deviation Log

| Deviation # | Step # | Description | Impact Assessment | CAPA # | Resolved By | Date |
|-------------|--------|-------------|-------------------|--------|-------------|------|
|             |        |             |                   |        |             |      |

### 7.4 Rollback Procedure

{{rollback_instructions}}

---

## 8. Records & Documentation

<!-- RECORDS GUIDANCE:
     - List every document, form, log, or record generated by this SOP.
     - Specify retention period per regulatory requirements.
     - Specify storage location (physical and/or electronic).
     - Reference data integrity principles (ALCOA+).
-->

### 8.1 Records Generated

| Record                 | Form/System         | Retention Period     | Storage Location       | Responsible          |
|------------------------|---------------------|----------------------|------------------------|----------------------|
| {{record_1}}           | {{form_1}}          | {{retention_1}}      | {{storage_1}}          | {{responsible_1}}    |
| {{record_2}}           | {{form_2}}          | {{retention_2}}      | {{storage_2}}          | {{responsible_2}}    |
| {{record_3}}           | {{form_3}}          | {{retention_3}}      | {{storage_3}}          | {{responsible_3}}    |

### 8.2 Related Documents

| SOP ID               | Title                           | Relationship             |
|-----------------------|---------------------------------|--------------------------|
| {{related_sop_1_id}}  | {{related_sop_1_title}}        | {{relationship_1}}       |
| {{related_sop_2_id}}  | {{related_sop_2_title}}        | {{relationship_2}}       |

### 8.3 Data Integrity Statement

All records generated by this SOP must comply with ALCOA+ principles:
- **A**ttributable: All entries must identify who performed the action.
- **L**egible: All entries must be clear and readable.
- **C**ontemporaneous: Record at time of activity.
- **O**riginal: Preserve first-capture data.
- **A**ccurate: Reflect true observations.
- **+** Complete, Consistent, Enduring, Available.

---

## 9. Revision History

<!-- REVISION HISTORY GUIDANCE:
     - Log every change, no matter how minor.
     - Include: version, date, author, description of change, approval.
     - Most recent revision at the top.
-->

| Version   | Date               | Author             | Change Description                         | Approved By          |
|-----------|--------------------|--------------------|--------------------------------------------|----------------------|
| {{version}} | {{effective_date}} | {{author_name}}  | {{change_description}}                     | {{approver_name}}    |
|           |                    |                    |                                            |                      |

**Change Control Process:** All revisions must follow {{change_control_sop}}. Minor editorial changes (typos, formatting) require author + approver sign-off. Substantive changes require full review cycle.

---

## 10. Appendices

### Appendix A: {{appendix_a_title}}

{{appendix_a_content}}

### Appendix B: {{appendix_b_title}}

{{appendix_b_content}}

### Appendix C: {{appendix_c_title}}

{{appendix_c_content}}

---

## Sign-Off

| Role              | Name               | Signature          | Date               |
|-------------------|--------------------|--------------------|--------------------|
| Author            | {{author_name}}    |                    |                    |
| Reviewer          | {{reviewer_name}}  |                    |                    |
| Approver          | {{approver_name}}  |                    |                    |
| Quality Assurance | {{qa_signoff}}     |                    |                    |

---

*This document is controlled. Unauthorized copies are not valid. Verify current version before use.*
*End of {{sop_id}} v{{version}}*
*Template: sop-human-tmpl.md | SOP Factory | Synkra AIOX*
