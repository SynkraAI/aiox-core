# Regression Test Suite V2.0

**Created:** 2025-01-17  
**Purpose:** Reusable test suite for validating V2.0 task format backward compatibility  
**Story:** STORY-6.1.7.2 - Task Execution Validation

---

## Overview

This regression test suite provides standardized test scenarios for validating that migrated V2.0 tasks maintain backward compatibility with V1.0 behavior while supporting new V2.0 features.

---

## Test Environment Setup

### Prerequisites

1. **Node.js:** v18+ installed and verified
   ```bash
   node --version
   ```

2. **Git CLI:** Available and configured
   ```bash
   git --version
   ```

3. **PM Tool Access:** Configured (ClickUp/GitHub/Jira)
   - Check `.aiox-core/core-config.yaml` for PM tool setting
   - Ensure API credentials configured if required

4. **Test Database:** Supabase local or test instance
   - Database connection configured
   - Migration directory accessible

### Test Data Setup

#### 1. Sample Story
- **Location:** `docs/stories/test/test-001-sample-story.md`
- **Story ID:** `STORY-TEST-001`
- **Status:** Draft
- **Purpose:** Used for story development and validation workflows

#### 2. Sample Requirements
- **Location:** `docs/requirements/test-sample-requirements.md`
- **Format:** Standard PRD template
- **Purpose:** Used for story creation workflow testing

#### 3. Sample Migration
- **Location:** `supabase/migrations/20250117000000_test_migration.sql`
- **Type:** Creates `test_validation_table`
- **Purpose:** Used for database migration workflow testing

#### 4. PM Tool Test Story
- **ClickUp:** Task ID format `12345678` (8-digit numeric)
- **GitHub:** Issue number format `#123`
- **Jira:** Task key format `TEST-123`
- **Purpose:** Used for PM tool integration workflow testing

---

## Task Execution Tests

### Priority 1 - Core Development Tasks

#### Test 1.1: dev-develop-story.md

**Test Data:**
- Story file: `docs/stories/test/test-001-sample-story.md`
- Mode: yolo (autonomous)

**Execution Steps:**
1. Activate dev agent
2. Execute: `*develop-yolo docs/stories/test/test-001-sample-story.md`
3. Verify story implementation completes
4. Check Dev Agent Record updated
5. Validate File List updated

**Expected Results:**
- ✅ Task executes without errors
- ✅ Story status updated to "Ready for Review"
- ✅ Dev Agent Record sections populated
- ✅ Output format: Duration line 7, Tokens line 8, Metrics last

**Validation Criteria:**
- Exit code: 0
- Required outputs generated
- Post-conditions met
- No error messages

---

#### Test 1.2: qa-gate.md

**Test Data:**
- Story file: Completed story from Test 1.1

**Execution Steps:**
1. Activate qa agent
2. Execute: `*qa-gate {story-id}`
3. Verify QA review completes
4. Check QA Results section updated

**Expected Results:**
- ✅ QA gate document created
- ✅ Test results documented
- ✅ Issues identified (if any)
- ✅ Final verdict provided

**Validation Criteria:**
- QA gate report generated
- All test results documented
- Clear pass/fail verdict

---

#### Test 1.3: create-next-story.md

**Test Data:**
- Requirements: `docs/requirements/test-sample-requirements.md`

**Execution Steps:**
1. Activate sm agent (or po agent)
2. Execute: `*create-story` with requirements
3. Verify story file created
4. Validate story structure

**Expected Results:**
- ✅ Story file created in correct location
- ✅ All required sections present
- ✅ Story follows template format
- ✅ Story ID assigned correctly

**Validation Criteria:**
- Story file exists
- Template compliance verified
- All sections populated

---

#### Test 1.4: validate-next-story.md

**Test Data:**
- Story file: Draft story (e.g., Test 1.3 output)

**Execution Steps:**
1. Activate po agent
2. Execute: `*validate-story-draft {story-path}`
3. Verify validation report generated
4. Check for issues identified

**Expected Results:**
- ✅ Validation report created
- ✅ Issues categorized (Critical/Should-Fix/Nice-to-Have)
- ✅ Implementation readiness score provided
- ✅ Clear GO/NO-GO decision

**Validation Criteria:**
- Validation report generated
- All validation checks executed
- Actionable feedback provided

---

#### Test 1.5: execute-checklist.md

**Test Data:**
- Checklist: `po-master-checklist.md` or `story-dod-checklist.md`

**Execution Steps:**
1. Execute: `*execute-checklist {checklist-name}`
2. Verify checklist items checked
3. Validate completion report

**Expected Results:**
- ✅ Checklist executed successfully
- ✅ All items validated
- ✅ Completion report generated
- ✅ Issues documented (if any)

**Validation Criteria:**
- Checklist completes without errors
- All items checked appropriately
- Report generated

---

### Priority 2 - Agent-Specific Tasks

#### Test 2.1: po-pull-story.md

**Test Data:**
- PM Tool: Configured PM tool (ClickUp/GitHub/Jira)
- Task ID: Pre-created task in PM tool

**Execution Steps:**
1. Activate po agent
2. Execute: `*pull-story {task-id}`
3. Verify story file synced locally
4. Validate story content matches PM tool

**Expected Results:**
- ✅ Story file created/updated locally
- ✅ Content matches PM tool task
- ✅ Metadata synced correctly
- ✅ No data loss

**Validation Criteria:**
- Story file synced successfully
- Content accuracy verified
- Metadata preserved

---

#### Test 2.2: db-apply-migration.md

**Test Data:**
- Migration file: `supabase/migrations/20250117000000_test_migration.sql`

**Execution Steps:**
1. Activate db-sage agent (or dev agent)
2. Execute: `*db-apply-migration {migration-file}`
3. Verify migration applied
4. Validate database state

**Expected Results:**
- ✅ Migration applied successfully
- ✅ Database schema updated
- ✅ No errors during migration
- ✅ Rollback available if needed

**Validation Criteria:**
- Migration completes successfully
- Schema changes verified
- No data corruption

---

#### Test 2.3: create-agent.md

**Test Data:**
- Agent spec: Sample agent definition YAML

**Execution Steps:**
1. Execute: `*create-agent` with agent spec
2. Verify agent file created
3. Validate agent structure

**Expected Results:**
- ✅ Agent file created in correct location
- ✅ Agent follows template format
- ✅ All required sections present
- ✅ Agent ID assigned correctly

**Validation Criteria:**
- Agent file exists
- Template compliance verified
- Valid agent definition

---

#### Test 2.4: create-task.md

**Test Data:**
- Task spec: Sample task definition

**Execution Steps:**
1. Execute: `*create-task` with task spec
2. Verify task file created
3. Validate task structure

**Expected Results:**
- ✅ Task file created in correct location
- ✅ Task follows V2.0 format
- ✅ All required sections present
- ✅ Task ID assigned correctly

**Validation Criteria:**
- Task file exists
- V2.0 format compliance verified
- Valid task definition

---

#### Test 2.5: qa-run-tests.md

**Test Data:**
- Test suite: Project test suite

**Execution Steps:**
1. Activate qa agent
2. Execute: `*run-tests`
3. Verify tests execute
4. Validate test results

**Expected Results:**
- ✅ All tests execute successfully
- ✅ Test results documented
- ✅ Coverage reported
- ✅ Failures identified (if any)

**Validation Criteria:**
- Tests complete execution
- Results accurately reported
- Coverage metrics provided

---

### Priority 3 - Utility Tasks

#### Test 3.1: correct-course.md

**Test Data:**
- Deviation scenario: Sample process deviation

**Execution Steps:**
1. Execute: `*correct-course` with deviation
2. Verify correction identified
3. Validate recommendations provided

**Expected Results:**
- ✅ Deviation identified
- ✅ Root cause analyzed
- ✅ Corrective actions recommended
- ✅ Process updated if needed

**Validation Criteria:**
- Deviation correctly identified
- Actionable recommendations provided
- Process correction documented

---

#### Test 3.2: create-doc.md

**Test Data:**
- Template: PRD template or other doc template

**Execution Steps:**
1. Execute: `*create-doc` with template
2. Verify document created
3. Validate document structure

**Expected Results:**
- ✅ Document created successfully
- ✅ Template followed correctly
- ✅ All sections populated
- ✅ Document formatted properly

**Validation Criteria:**
- Document exists
- Template compliance verified
- Content quality acceptable

---

#### Test 3.3: security-scan.md

**Test Data:**
- Target: Codebase or specific directory

**Execution Steps:**
1. Execute: `*security-scan {target}`
2. Verify scan completes
3. Validate security report generated

**Expected Results:**
- ✅ Security scan completes
- ✅ Vulnerabilities identified
- ✅ Severity levels assigned
- ✅ Remediation recommendations provided

**Validation Criteria:**
- Scan completes successfully
- All vulnerabilities reported
- Recommendations actionable

---

#### Test 3.4: sync-documentation.md

**Test Data:**
- Target: `docs/` directory

**Execution Steps:**
1. Execute: `*sync-documentation {target}`
2. Verify documentation synced
3. Validate consistency

**Expected Results:**
- ✅ Documentation synced successfully
- ✅ Consistency verified
- ✅ Updates documented
- ✅ No conflicts

**Validation Criteria:**
- Sync completes successfully
- Documentation consistent
- Changes documented

---

#### Test 3.5: improve-self.md

**Test Data:**
- Feedback: Sample improvement feedback

**Execution Steps:**
1. Execute: `*improve-self` with feedback
2. Verify improvements identified
3. Validate action plan created

**Expected Results:**
- ✅ Improvements identified
- ✅ Action plan created
- ✅ Prioritization provided
- ✅ Implementation tracked

**Validation Criteria:**
- Improvements correctly identified
- Action plan actionable
- Prioritization logical

---

## Workflow Execution Tests

### Workflow 1: Story Development Flow

**Test Steps:**
1. PO creates story from requirements
2. Dev implements story
3. QA runs quality gate

**Expected Results:**
- ✅ Story created successfully
- ✅ Story implemented completely
- ✅ QA gate passes
- ✅ End-to-end flow works

**Validation Criteria:**
- All steps complete successfully
- Data flows correctly between steps
- No integration issues

---

### Workflow 2: PM Tool Integration Flow

**Test Steps:**
1. PO pulls story from PM tool
2. Dev updates story locally
3. PO syncs story back to PM tool

**Expected Results:**
- ✅ Story pulled successfully
- ✅ Local updates committed
- ✅ PM tool updated correctly
- ✅ Bidirectional sync works

**Validation Criteria:**
- All steps complete successfully
- Data integrity maintained
- PM tool reflects changes

---

### Workflow 3: Database Migration Flow

**Test Steps:**
1. Dev runs dry-run validation
2. Dev applies migration
3. QA runs smoke test

**Expected Results:**
- ✅ Dry-run validates successfully
- ✅ Migration applies without errors
- ✅ Smoke test passes
- ✅ Database state correct

**Validation Criteria:**
- All steps complete successfully
- Database integrity maintained
- Rollback available if needed

---

## Output Format Validation

### Expected Output Format

All task outputs must follow this format:

```
[Task execution content]

Duration: [time]
Tokens: [count]
Metrics: [additional metrics]
```

**Validation:**
- Duration on line 7 (or specified line)
- Tokens on line 8 (or specified line)
- Metrics at end

---

## Regression Detection

### Critical Regression Criteria
- Task fails to execute
- Required output not generated
- Post-conditions not met
- Data corruption or loss

### Minor Regression Criteria
- Output format slightly different (but parseable)
- Performance degraded >10% (but acceptable)
- Warning messages (non-blocking)

### Non-Regression (Acceptable)
- Output format enhanced (additional fields)
- Performance improved
- Better error messages

---

## Performance Baseline

### V1.0 Baseline
- Not available (establishing V2.0 baseline)

### V2.0 Baseline
- To be established during first execution
- Document duration, tokens, and metrics
- Use as comparison for future changes

---

## Test Execution Log

| Test ID | Task/Workflow | Status | Duration | Result | Notes |
|---------|---------------|--------|----------|--------|-------|
| 1.1 | dev-develop-story | Pending | - | - | - |
| 1.2 | qa-gate | Pending | - | - | - |
| 1.3 | create-next-story | Pending | - | - | - |
| 1.4 | validate-next-story | Pending | - | - | - |
| 1.5 | execute-checklist | Pending | - | - | - |
| 2.1 | po-pull-story | Pending | - | - | - |
| 2.2 | db-apply-migration | Pending | - | - | - |
| 2.3 | create-agent | Pending | - | - | - |
| 2.4 | create-task | Pending | - | - | - |
| 2.5 | qa-run-tests | Pending | - | - | - |
| 3.1 | correct-course | Pending | - | - | - |
| 3.2 | create-doc | Pending | - | - | - |
| 3.3 | security-scan | Pending | - | - | - |
| 3.4 | sync-documentation | Pending | - | - | - |
| 3.5 | improve-self | Pending | - | - | - |
| W1 | Story Development Flow | Pending | - | - | - |
| W2 | PM Tool Integration Flow | Pending | - | - | - |
| W3 | Database Migration Flow | Pending | - | - | - |

---

## Automated Validation Scripts

### Script 1: Output Format Validator

```bash
#!/bin/bash
# Validates task output format

validate_output_format() {
    local output_file=$1
    # Check for Duration line
    # Check for Tokens line
    # Check for Metrics section
    # Return 0 if valid, 1 if invalid
}
```

### Script 2: Regression Detector

```bash
#!/bin/bash
# Detects regressions by comparing outputs

detect_regressions() {
    local baseline=$1
    local current=$2
    # Compare outputs
    # Identify differences
    # Classify as regression/enhancement/acceptable
}
```

---

## Maintenance

### Updating Test Suite

When updating this test suite:
1. Document changes in Change Log
2. Update test execution log
3. Verify all tests still pass
4. Update baseline metrics if needed

### Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | 2025-01-17 | Initial test suite creation | Dex (Dev) |

---

**Last Updated:** 2025-01-17  
**Maintained By:** Dev Team

