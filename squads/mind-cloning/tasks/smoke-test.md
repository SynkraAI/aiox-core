# Task: Smoke Test Mind Clone

Run 3 validation tests on the complete mind DNA to verify clone fidelity. This is a BLOCKING GATE.

---

## Metadata
- **task-id:** smoke-test
- **agent:** mind-cloner
- **elicit:** true
- **execution_type:** interactive

## Prerequisites

- Complete mind DNA: `squads/mind-cloning/minds/{mind_slug}/mind_dna_complete.yaml`

## Instructions

### Step 1: Load Mind DNA

Read `squads/mind-cloning/minds/{mind_slug}/mind_dna_complete.yaml` and internalize the complete profile.

### Step 2: Test 1 - Domain Knowledge

**Objective:** Verify the clone knows the expert's domain deeply.

**Method:**
1. Ask the user to pose a domain-specific question that the expert would answer distinctively
2. Generate a response AS the expert, using their Voice DNA + Thinking DNA
3. Ask the user to rate: "Does this sound like {expert}?" (1-10)

**Pass criteria:** Score >= 7/10

### Step 3: Test 2 - Decision Making

**Objective:** Verify the clone makes decisions like the expert.

**Method:**
1. Present a scenario within the expert's domain that requires a decision
2. Apply the expert's decision pipeline, heuristics, and frameworks
3. Generate the decision reasoning AS the expert
4. Ask user: "Would {expert} decide this way?" (1-10)

**Pass criteria:** Score >= 7/10

### Step 4: Test 3 - Objection Response

**Objective:** Verify the clone handles pushback like the expert.

**Method:**
1. Challenge a core belief/principle of the expert
2. Respond AS the expert, using their immune system, objection handling, and voice
3. Ask user: "Is this how {expert} would react?" (1-10)

**Pass criteria:** Score >= 7/10

### Step 5: Evaluate Results

```
Test 1 (Knowledge):  X/10  [PASS/FAIL]
Test 2 (Decision):   X/10  [PASS/FAIL]
Test 3 (Objection):  X/10  [PASS/FAIL]

Overall: X/3 tests passed
```

**Decision:**
- **3/3 PASS** → Clone approved, save results
- **2/3 PASS** → Identify weak area, suggest targeted re-extraction
- **1/3 or 0/3 PASS** → Clone needs significant rework

### Step 5.5: Diagnostic (on failure)

**Trigger:** Any test scored < 7/10.

When a test fails, run the diagnostic framework from `squads/mind-cloning/data/diagnostic-framework.md`:

1. **Run the 6 diagnostic questions** against the clone:
   - Would the clone say something the expert would NEVER say?
   - Does it have all 3: Playbook, Framework, Swipe File?
   - Are sources gold or bronze?
   - What % of time was spent on curation vs prompt?
   - Was it tested with 5-10 people blind?
   - Can it be hacked? Does it hold character under pressure?

2. **Identify red flags** from the diagnostic framework

3. **Cross-reference with heuristics** from `squads/mind-cloning/data/heuristics-catalog.md`:
   - Check which AN001-AN005 heuristics were violated
   - Check if any veto conditions apply

4. **Generate corrective action plan:**
   ```
   DIAGNOSTIC REPORT
   ─────────────────
   Failed test(s): [list]
   Root cause: [identified cause]
   Heuristic(s) violated: [AN00X]
   Red flags detected: [list]
   Corrective action: [specific action]
   Effort estimate: Low (1-2h) | Medium (2-4h) | High (4-8h)
   Phase(s) to re-run: [specific phases]
   ```

5. Present the report to the user with recommended next steps before proceeding

### Step 6: Generate Smoke Test Report

Save to `squads/mind-cloning/minds/{mind_slug}/smoke_test_result.yaml`:

```yaml
smoke_test:
  expert: ""
  date: ""
  results:
    domain_knowledge:
      score: X
      status: "PASS|FAIL"
      notes: ""
    decision_making:
      score: X
      status: "PASS|FAIL"
      notes: ""
    objection_response:
      score: X
      status: "PASS|FAIL"
      notes: ""
  overall:
    passed: X/3
    status: "APPROVED|NEEDS_REWORK|FAILED"
    recommendations: []
```

### Step 7: Next Steps

If APPROVED:
- "Clone approved! Mind DNA is ready for use."
- "Use the mind_dna_complete.yaml to create an agent with @squad-creator *create-agent"

If NEEDS_REWORK:
- Identify which specific phases of Voice/Thinking DNA need improvement
- Suggest re-running specific extraction phases with additional sources

## Important Notes

- User participation is MANDATORY for smoke tests - they validate authenticity
- Tests should use scenarios the user is familiar with (they know the expert)
- A "too perfect" response might indicate over-fitting - flag to user
- If user doesn't know the expert well enough to judge, suggest finding someone who does
- Smoke tests are the FINAL quality gate - do not skip or shortcut them
