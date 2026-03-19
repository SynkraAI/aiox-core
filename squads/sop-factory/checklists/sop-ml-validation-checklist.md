# ML-SOP Validation Checklist

> **Purpose:** Validate that a machine-readable SOP (YAML format) is structurally sound, logically consistent, and compatible with AI agent execution. Use this checklist after converting or authoring a YAML SOP using `sop-ml-tmpl.md`.
>
> **Audience:** SOP Factory agents, automation engineers, QA reviewers validating ML-format SOPs.

| Field               | Value                           |
|---------------------|---------------------------------|
| **Checklist ID**    | QC-ML-VAL-001                   |
| **Purpose**         | Validate a machine-readable SOP (YAML) for structural integrity, logical correctness, and AI agent compatibility |
| **SOP Under Review** | ________________________       |
| **SOP Version**     | ________________________        |
| **Validator**       | ________________________        |
| **Validation Date** | ________________________        |
| **Total Items**     | 28                              |

---

## Section 1: Schema Validation (6 items)

> Verify the YAML document conforms to the expected schema structure and all required fields are present and correctly typed.

| #  | Item                                                                                                                                      | Pass | Fail | N/A | Notes |
|----|-------------------------------------------------------------------------------------------------------------------------------------------|:----:|:----:|:---:|-------|
| 1  | YAML parses without syntax errors (valid YAML syntax, no tabs used for indentation, proper nesting)                                       | [ ]  | [ ]  | [ ] |       |
| 2  | All required top-level fields present: `sop.id`, `version`, `title`, `purpose`, `classification`, `status`, `trigger`, `context`, `steps`, `error_handling`, `quality_gate`, `outputs`, `metadata` | [ ]  | [ ]  | [ ] |       |
| 3  | `sop.id` follows naming convention (SOP-DEPT-SEQ-REV) and is unique within the SOP registry                                               | [ ]  | [ ]  | [ ] |       |
| 4  | All date fields use ISO 8601 format (YYYY-MM-DD or full ISO datetime)                                                                      | [ ]  | [ ]  | [ ] |       |
| 5  | All duration fields use ISO 8601 duration format (PT5M, PT1H, P1Y, etc.)                                                                   | [ ]  | [ ]  | [ ] |       |
| 6  | Enum fields contain only valid values: `classification` (low/medium/high/critical), `status` (DRAFT/ACTIVE/DEPRECATED/RETIRED), `trigger.type` (manual/scheduled/event/condition), `tool.type` (mcp/cli/api/ui/agent/manual), error action types, severity levels | [ ]  | [ ]  | [ ] |       |

**Section 1 Score:** _____ / 6

---

## Section 2: Step Integrity (8 items)

> Verify each step in the `steps` array is well-formed, properly sequenced, and has all required sub-fields.

| #  | Item                                                                                                                                      | Pass | Fail | N/A | Notes |
|----|-------------------------------------------------------------------------------------------------------------------------------------------|:----:|:----:|:---:|-------|
| 7  | Every step has a unique `id` (no duplicates in the steps array)                                                                            | [ ]  | [ ]  | [ ] |       |
| 8  | Step IDs follow sequential convention (S001, S002, ... with no gaps)                                                                       | [ ]  | [ ]  | [ ] |       |
| 9  | Every step has all required fields: `id`, `name`, `action`, `performer`, `tool`, `input`, `output`, `validation`                           | [ ]  | [ ]  | [ ] |       |
| 10 | `action` field uses verb_noun convention (e.g., validate_input, fetch_data, generate_report)                                               | [ ]  | [ ]  | [ ] |       |
| 11 | Every step has at least one `validation.rules` entry with field, operator, expected, and message                                           | [ ]  | [ ]  | [ ] |       |
| 12 | `on_success` references a valid step ID (that exists in steps array) or "END"                                                              | [ ]  | [ ]  | [ ] |       |
| 13 | `on_failure` references a valid error handler ID defined in `error_handling.handlers`                                                      | [ ]  | [ ]  | [ ] |       |
| 14 | No orphan steps exist (every step is reachable from S001 via on_success and/or decision_point paths)                                       | [ ]  | [ ]  | [ ] |       |

**Section 2 Score:** _____ / 8

---

## Section 3: Decision Logic (5 items)

> Verify all decision points are logically complete, deterministic, and create valid execution paths.

| #  | Item                                                                                                                                      | Pass | Fail | N/A | Notes |
|----|-------------------------------------------------------------------------------------------------------------------------------------------|:----:|:----:|:---:|-------|
| 15 | Every `decision_point` (non-null) has `question`, `evaluate`, and `branches` array                                                        | [ ]  | [ ]  | [ ] |       |
| 16 | Each `branches` array includes a `"condition": "default"` fallback branch as the last entry                                                | [ ]  | [ ]  | [ ] |       |
| 17 | All branch `goto` targets reference valid, existing step IDs                                                                               | [ ]  | [ ]  | [ ] |       |
| 18 | Decision conditions are mutually exclusive (no overlapping conditions that could match simultaneously)                                      | [ ]  | [ ]  | [ ] |       |
| 19 | The `evaluate` expression references only variables available in scope (previous step outputs, input values, environment variables, or context) | [ ]  | [ ]  | [ ] |       |

**Section 3 Score:** _____ / 5

---

## Section 4: Error Handling (4 items)

> Verify error handling is comprehensive, all handlers are properly defined, and recovery paths are valid.

| #  | Item                                                                                                                                      | Pass | Fail | N/A | Notes |
|----|-------------------------------------------------------------------------------------------------------------------------------------------|:----:|:----:|:---:|-------|
| 20 | Every error handler has a unique `id` (no duplicates in handlers array)                                                                    | [ ]  | [ ]  | [ ] |       |
| 21 | Every handler ID referenced by `on_failure` in any step exists in `error_handling.handlers`                                                | [ ]  | [ ]  | [ ] |       |
| 22 | Retry configurations have reasonable limits: `max_retries` <= 5, `retry_delay` >= PT1S, `backoff` is one of fixed/linear/exponential       | [ ]  | [ ]  | [ ] |       |
| 23 | A `fallback` handler is defined for unmatched errors with `action`, `notify`, and `log_level` fields                                       | [ ]  | [ ]  | [ ] |       |

**Section 4 Score:** _____ / 4

---

## Section 5: AI Agent Compatibility (5 items)

> Verify the ML-SOP can be parsed and executed by an AI agent or automation pipeline without human interpretation.

| #  | Item                                                                                                                                      | Pass | Fail | N/A | Notes |
|----|-------------------------------------------------------------------------------------------------------------------------------------------|:----:|:----:|:---:|-------|
| 24 | All `tool.id` values in steps reference registered/available tools defined in `context.tools` array                                        | [ ]  | [ ]  | [ ] |       |
| 25 | All `input.source` values are resolvable: `literal` has a value, `previous_step` references a valid step.output, `env` references a defined environment variable, `user_input` is flagged for agent prompt | [ ]  | [ ]  | [ ] |       |
| 26 | All `output.store_as` variable names are unique across the entire SOP (no variable shadowing between steps)                                | [ ]  | [ ]  | [ ] |       |
| 27 | `quality_gate.criteria` weights sum to exactly 1.0 (tolerance: +/- 0.01)                                                                  | [ ]  | [ ]  | [ ] |       |
| 28 | The SOP can be traversed from step S001 to "END" through at least one complete, valid execution path without encountering undefined references | [ ]  | [ ]  | [ ] |       |

**Section 5 Score:** _____ / 5

---

## Scoring Summary

| Section                      | Items | Score       | Percentage |
|------------------------------|:-----:|:-----------:|:----------:|
| 1. Schema Validation         | 6     | _____ / 6   | _____%     |
| 2. Step Integrity            | 8     | _____ / 8   | _____%     |
| 3. Decision Logic            | 5     | _____ / 5   | _____%     |
| 4. Error Handling            | 4     | _____ / 4   | _____%     |
| 5. AI Agent Compatibility    | 5     | _____ / 5   | _____%     |
| **TOTAL**                    | **28** | **_____ / 28** | **_____%** |

---

## Validation Verdict

| Score Range | Verdict                    | Action                                                        |
|:-----------:|----------------------------|---------------------------------------------------------------|
| 100%        | **VALID**                  | ML-SOP passes all checks. Ready for agent deployment.          |
| 90-99%      | **VALID WITH WARNINGS**    | Minor issues flagged. Document warnings. Deployable with caution. |
| 75-89%      | **INVALID -- FIXABLE**     | Structural or logic issues found. Fix and re-validate.         |
| <75%        | **INVALID -- REWORK**      | Fundamental schema or logic errors. Requires significant rework. |

**Final Verdict:** ___________________________

### Critical Failures (must fix)

1. _________________________________________________________________________________
2. _________________________________________________________________________________
3. _________________________________________________________________________________

### Warnings (should fix)

1. _________________________________________________________________________________
2. _________________________________________________________________________________

---

## Automated Validation Results (if applicable)

> Fill this section if automated schema validation was run.

| Check                | Tool               | Result         | Details              |
|----------------------|--------------------|----------------|----------------------|
| YAML Syntax          | {{yaml_linter}}    | PASS / FAIL    | {{yaml_details}}     |
| JSON Schema          | {{schema_validator}} | PASS / FAIL  | {{schema_details}}   |
| Reference Integrity  | {{ref_checker}}    | PASS / FAIL    | {{ref_details}}      |
| Path Coverage        | {{path_analyzer}}  | PASS / FAIL    | {{path_details}}     |

---

**Validator Signature:** _________________________ **Date:** _______________

---

*ML-SOP Validation Checklist v2.0. 28 items across 5 validation dimensions for machine-readable SOP integrity.*
*Checklist: sop-ml-validation-checklist.md | SOP Factory | Synkra AIOX*
