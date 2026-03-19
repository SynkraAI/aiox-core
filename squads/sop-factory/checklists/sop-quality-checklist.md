# SOP Quality Checklist

> **Purpose:** Evaluate the overall quality of a Standard Operating Procedure across 5 critical dimensions. Use this checklist during the SOP review gate before approval.
>
> **Scoring:** Check each item that passes. Calculate percentage per section and overall.
> - **90-100% APPROVED** — SOP meets quality standards, ready for deployment
> - **70-89% NEEDS REVISION** — SOP has gaps that must be addressed before approval
> - **<70% REDO** — SOP has fundamental issues and requires significant rework

| Field              | Value                           |
|--------------------|---------------------------------|
| **Checklist ID**   | QC-QUALITY-001                  |
| **Purpose**        | Evaluate overall quality of an SOP before approval |
| **SOP Under Review** | ________________________      |
| **SOP Version**    | ________________________        |
| **Reviewer**       | ________________________        |
| **Review Date**    | ________________________        |
| **Total Items**    | 31                              |

---

## Section 1: Structure & Format (8 items)

| #  | Item                                                                                                                          | Pass | Fail | N/A | Notes |
|----|-------------------------------------------------------------------------------------------------------------------------------|:----:|:----:|:---:|-------|
| 1  | SOP has a unique ID following the naming convention (SOP-DEPT-SEQ-REV)                                                        | [ ]  | [ ]  | [ ] |       |
| 2  | Version number is present and follows semantic versioning or sequential format                                                 | [ ]  | [ ]  | [ ] |       |
| 3  | All required header fields are populated (ID, version, effective date, review date, classification, department, owner, approver, status) | [ ]  | [ ]  | [ ] |       |
| 4  | All 11 required sections are present (Header, Purpose & Scope, Definitions, RACI, Prerequisites, Procedure, Verification, Error Handling, Records, Revision History, Appendices) | [ ]  | [ ]  | [ ] |       |
| 5  | Sections are numbered sequentially and consistently                                                                            | [ ]  | [ ]  | [ ] |       |
| 6  | Tables are properly formatted with headers and alignment                                                                       | [ ]  | [ ]  | [ ] |       |
| 7  | Cross-references to other SOPs use correct IDs and are bidirectional                                                           | [ ]  | [ ]  | [ ] |       |
| 8  | Appendices are labeled (A, B, C...) and referenced from the Procedure section                                                  | [ ]  | [ ]  | [ ] |       |

**Section 1 Score:** _____ / 8 = _____%

---

## Section 2: Content Quality (10 items)

| #  | Item                                                                                                                          | Pass | Fail | N/A | Notes |
|----|-------------------------------------------------------------------------------------------------------------------------------|:----:|:----:|:---:|-------|
| 9  | Purpose statement is concise (2-4 sentences) and starts with an action verb                                                    | [ ]  | [ ]  | [ ] |       |
| 10 | Scope clearly defines in-scope, out-of-scope, and applicable roles/departments                                                 | [ ]  | [ ]  | [ ] |       |
| 11 | Every technical term and abbreviation is defined in the Definitions section                                                     | [ ]  | [ ]  | [ ] |       |
| 12 | RACI matrix has exactly ONE "A" (Accountable) per activity row                                                                 | [ ]  | [ ]  | [ ] |       |
| 13 | Each procedure step contains exactly one action, written in imperative mood ("Open...", "Record...", "Verify...")               | [ ]  | [ ]  | [ ] |       |
| 14 | Decision points use explicit IF/THEN/ELSE logic with all branches covered including a default/fallback                         | [ ]  | [ ]  | [ ] |       |
| 15 | Critical steps are tagged with [CRITICAL] and include escalation paths                                                         | [ ]  | [ ]  | [ ] |       |
| 16 | Verification criteria are measurable with specific acceptable ranges or thresholds                                              | [ ]  | [ ]  | [ ] |       |
| 17 | Error handling covers at least the top 5 known failure modes with symptom, cause, corrective action, and escalation             | [ ]  | [ ]  | [ ] |       |
| 18 | Revision history includes all changes with version, date, author, and description                                              | [ ]  | [ ]  | [ ] |       |

**Section 2 Score:** _____ / 10 = _____%

---

## Section 3: Readability (5 items)

| #  | Item                                                                                                                          | Pass | Fail | N/A | Notes |
|----|-------------------------------------------------------------------------------------------------------------------------------|:----:|:----:|:---:|-------|
| 19 | Average sentence length is 20 words or fewer per step                                                                          | [ ]  | [ ]  | [ ] |       |
| 20 | Reading level is appropriate for the target audience (Flesch-Kincaid Grade 8-10 for operators, 10-12 for technical staff)       | [ ]  | [ ]  | [ ] |       |
| 21 | No ambiguous pronouns (e.g., "it", "this", "they") without clear antecedents within the same sentence                         | [ ]  | [ ]  | [ ] |       |
| 22 | Consistent terminology throughout (same concept = same word, no synonyms for key terms)                                        | [ ]  | [ ]  | [ ] |       |
| 23 | Visual aids (flowcharts, diagrams, screenshots) are included where procedures have 3+ decision points or complex sequences     | [ ]  | [ ]  | [ ] |       |

**Section 3 Score:** _____ / 5 = _____%

---

## Section 4: Compliance & Governance (5 items)

| #  | Item                                                                                                                          | Pass | Fail | N/A | Notes |
|----|-------------------------------------------------------------------------------------------------------------------------------|:----:|:----:|:---:|-------|
| 24 | Applicable regulatory references are cited (FDA, ISO, GMP, SOX, etc.) where applicable                                        | [ ]  | [ ]  | [ ] |       |
| 25 | Data integrity requirements follow ALCOA+ principles (Attributable, Legible, Contemporaneous, Original, Accurate)               | [ ]  | [ ]  | [ ] |       |
| 26 | Record retention periods meet or exceed regulatory minimums                                                                     | [ ]  | [ ]  | [ ] |       |
| 27 | Review date is set per classification cycle (CRITICAL=6mo, MAJOR=12mo, STANDARD=18mo, INFORMATIONAL=24mo)                      | [ ]  | [ ]  | [ ] |       |
| 28 | Deviation/CAPA procedure is referenced with correct SOP ID and form references                                                 | [ ]  | [ ]  | [ ] |       |

**Section 4 Score:** _____ / 5 = _____%

---

## Section 5: Acid Tests (3 items)

> These are the ultimate quality gates. If ANY acid test fails, the SOP cannot be approved regardless of the overall score.

| #  | Test                     | Description                                                                                                                                                   | Pass | Fail | Notes |
|----|--------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------|:----:|:----:|-------|
| 29 | **New Employee Test**    | Could a qualified new employee (with prerequisite training but no tribal knowledge) execute this SOP correctly on their first attempt without asking for help? | [ ]  | [ ]  |       |
| 30 | **Phone Test**           | Could someone follow this SOP correctly if read instructions over the phone (no visual aids, no pointing, no "you know what I mean")?                          | [ ]  | [ ]  |       |
| 31 | **Ambiguity Test**       | Read every step aloud. Does any step contain words like "appropriate", "as needed", "if necessary", "properly", "correctly", "ensure", "adequate", or "sufficient" without defining what those mean in context? If yes, FAIL. | [ ]  | [ ]  |       |

**Section 5 Score:** _____ / 3 = _____%

> **CRITICAL:** If any Acid Test fails, the verdict is automatically NEEDS REVISION (or REDO if 2+ fail), regardless of overall percentage.

---

## Scoring Summary

| Section                     | Items | Score      | Percentage |
|-----------------------------|:-----:|:----------:|:----------:|
| 1. Structure & Format       | 8     | _____ / 8  | _____%     |
| 2. Content Quality          | 10    | _____ / 10 | _____%     |
| 3. Readability              | 5     | _____ / 5  | _____%     |
| 4. Compliance & Governance  | 5     | _____ / 5  | _____%     |
| 5. Acid Tests               | 3     | _____ / 3  | _____%     |
| **TOTAL**                   | **31** | **_____ / 31** | **_____%** |

---

## Verdict

| Score Range | Verdict            | Action Required                                          |
|:-----------:|--------------------|----------------------------------------------------------|
| 90-100%     | **APPROVED**       | No changes required. Proceed to formal sign-off.          |
| 70-89%      | **NEEDS REVISION** | Address all FAIL items. Re-submit for targeted review.   |
| <70%        | **REDO**           | Fundamental quality issues. Return for comprehensive rewrite. |

**Final Verdict:** ___________________________

**Reviewer Comments:**

_______________________________________________________________________________

_______________________________________________________________________________

_______________________________________________________________________________

**Reviewer Signature:** _________________________ **Date:** _______________

---

*SOP Quality Checklist v2.0. Based on FDA/GMP best practices and The Checklist Manifesto (Gawande) principles.*
*Checklist: sop-quality-checklist.md | SOP Factory | Synkra AIOX*
