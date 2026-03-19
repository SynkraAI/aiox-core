# {{checklist_title}}

> **Design Principles** (Atul Gawande, *The Checklist Manifesto*):
> - One page maximum — if it doesn't fit, split it
> - 5-9 items per section — cognitive load boundary
> - Use pause points for critical/irreversible steps
> - Checklist is a VERIFICATION aid, not instruction manual
> - Two types: DO-CONFIRM (do from memory, then verify) or READ-DO (read then do)

<!-- CHECKLIST DESIGN RULES (for template maintainers):
     1. ONE PAGE maximum. Print and verify it fits on a single page. If not, split into sub-checklists.
     2. 5-9 items per section. Never exceed 9 items in a single section. Cognitive overload starts at 10.
     3. Pause points for critical steps. Any irreversible, high-risk, or multi-person verification step gets a pause point.
     4. Imperative language. Each item starts with a verb: Confirm, Verify, Check, Ensure, Record, Notify.
     5. No ambiguity. Each item must have a single, binary outcome: done or not done.
     6. Include "killer items". The items most commonly skipped or forgotten go at the top of each section.
     7. Test with a novice. If someone unfamiliar with the SOP can't use the checklist, simplify it.
     8. Date and version. Always tied to a specific SOP version. Update checklist when SOP changes.
-->

| Field              | Value                              |
|--------------------|------------------------------------|
| **Checklist ID**   | {{checklist_id}}                   |
| **Source SOP**     | {{sop_id}} v{{sop_version}}        |
| **SOP Title**      | {{sop_title}}                      |
| **Checklist Type** | {{checklist_type}}                 |
| **Version**        | {{checklist_version}}              |
| **Effective Date** | {{effective_date}}                 |
| **Created By**     | {{created_by}}                     |

**Checklist Type:**
- **DO-CONFIRM** — Perform tasks from memory/training, then use checklist to confirm nothing was missed. Best for experienced teams, routine procedures, time-critical situations.
- **READ-DO** — Read each item, perform it, then check it off. Best for infrequent procedures, new staff, complex/high-risk steps.

---

## PRE-FLIGHT (Before Starting)

> Complete ALL items below before beginning the procedure. If any item cannot be confirmed, STOP and resolve before proceeding.

| #  | Check                                | Status         |
|----|--------------------------------------|----------------|
| 1  | {{preflight_check_1}}                | [ ] CONFIRMED  |
| 2  | {{preflight_check_2}}                | [ ] CONFIRMED  |
| 3  | {{preflight_check_3}}                | [ ] CONFIRMED  |
| 4  | {{preflight_check_4}}                | [ ] CONFIRMED  |
| 5  | {{preflight_check_5}}                | [ ] CONFIRMED  |
| 6  | {{preflight_check_6}}                | [ ] CONFIRMED  |
| 7  | {{preflight_check_7}}                | [ ] CONFIRMED  |

**Pre-Flight Decision:** [ ] ALL checks passed -- proceed to Execution.

**Pre-flight confirmed by:** _________________ **Time:** _________

---

## EXECUTION

> {{#if checklist_type_do_confirm}}
> Perform all steps from training/SOP, then confirm each item below was completed correctly.
> {{/if}}
> {{#if checklist_type_read_do}}
> Read each item, perform the action, then check it off before moving to the next item.
> {{/if}}

### Block A: {{block_a_title}}

| #  | Action                               | Done   |
|----|--------------------------------------|--------|
| 1  | {{exec_action_1}}                    | [ ]    |
| 2  | {{exec_action_2}}                    | [ ]    |
| 3  | {{exec_action_3}}                    | [ ]    |
| 4  | [CRITICAL] {{exec_action_4}}         | [ ]    |
| 5  | {{exec_action_5}}                    | [ ]    |

> **--- PAUSE POINT ---**
> Confirm Block A completion with: _____________ (name/role)
> Verified at: __________ (time)

### Block B: {{block_b_title}}

| #  | Action                               | Done   |
|----|--------------------------------------|--------|
| 6  | {{exec_action_6}}                    | [ ]    |
| 7  | {{exec_action_7}}                    | [ ]    |
| 8  | {{exec_action_8}}                    | [ ]    |
| 9  | {{exec_action_9}}                    | [ ]    |

> **--- PAUSE POINT ---**
> Confirm Block B completion with: _____________ (name/role)
> Verified at: __________ (time)

### Block C: {{block_c_title}}

| #  | Action                               | Done   |
|----|--------------------------------------|--------|
| 10 | {{exec_action_10}}                   | [ ]    |
| 11 | {{exec_action_11}}                   | [ ]    |
| 12 | [CRITICAL] {{exec_action_12}}        | [ ]    |
| 13 | {{exec_action_13}}                   | [ ]    |
| 14 | {{exec_action_14}}                   | [ ]    |

> **--- CRITICAL PAUSE POINT ---**
> This step is irreversible. Confirm with {{critical_verifier}} before proceeding.
> Verified by: _________________ Time: _________

---

## VERIFICATION (After Completion)

> Confirm all outputs and quality criteria are met. Any unchecked item requires investigation.

| #  | Verification Item                    | Expected          | Actual    | Result                |
|----|--------------------------------------|-------------------|-----------|-----------------------|
| 1  | {{verify_item_1}}                    | {{expected_1}}    | _________ | [ ] PASS / [ ] FAIL   |
| 2  | {{verify_item_2}}                    | {{expected_2}}    | _________ | [ ] PASS / [ ] FAIL   |
| 3  | {{verify_item_3}}                    | {{expected_3}}    | _________ | [ ] PASS / [ ] FAIL   |
| 4  | {{verify_item_4}}                    | {{expected_4}}    | _________ | [ ] PASS / [ ] FAIL   |
| 5  | {{verify_item_5}}                    | {{expected_5}}    | _________ | [ ] PASS / [ ] FAIL   |

**Verification Decision:**
- [ ] ALL items PASS -- proceed to Sign-Off.
- [ ] ANY item FAIL -- STOP. Initiate error handling per {{sop_id}} Section 7.

---

## SIGN-OFF

| Role              | Name               | Signature          | Date               | Time               |
|-------------------|--------------------|--------------------|--------------------|--------------------|
| **Performer**     | {{performer_name}} | _____________      | ____/____/____     | ____:____          |
| **Verifier**      | {{verifier_name}}  | _____________      | ____/____/____     | ____:____          |
| **Approver**      | {{approver_name}}  | _____________      | ____/____/____     | ____:____          |

**Deviations Noted:** [ ] None / [ ] Yes -- see Deviation Form #__________

**Completion Status:** [ ] COMPLETE / [ ] INCOMPLETE -- Reason: _________________________

---

*Checklist {{checklist_id}} derived from {{sop_id}} v{{sop_version}}. Do not modify without updating source SOP.*
*Template: checklist-from-sop-tmpl.md | SOP Factory | Synkra AIOX*
