# Decision Heuristics Framework

> **Version:** 1.0.0
> **Source:** AIOS Quality Standards

Framework for creating decision heuristics that validate choices at workflow checkpoints.

---

## 1. Heuristic Anatomy

Every decision heuristic must have this structure:

```yaml
heuristic:
  id: "{PREFIX}_{AREA}_{NUMBER}"  # e.g., "QA_STR_001"
  name: "Human-readable name"
  type: "Decision Heuristic"
  phase: 1-N                      # Which workflow phase
  agent: "@squad:agent-name"      # Which agent applies it

  # Weighted criteria
  weights:
    criterion_1: 0.9              # 0.0 to 1.0
    criterion_2: 0.8
    criterion_3: 0.7

  # Minimum thresholds for pass
  thresholds:
    criterion_1: 0.8              # Must score >= this
    criterion_2: 0.7
    criterion_3: null             # Context-dependent

  # Conditions that BLOCK progress
  veto_conditions:
    - condition: "criterion_1 < 0.7"
      action: "VETO - Return to previous phase"
    - condition: "critical_check = false"
      action: "VETO - Cannot proceed"

  # What to do when veto triggers
  feedback_on_failure:
    - "Specific remediation step 1"
    - "Specific remediation step 2"

  # Output decision
  output:
    type: "decision"
    values: ["APPROVE", "REVIEW", "VETO"]
```

---

## 2. Decision Tree Structure

Every heuristic needs a decision tree:

```
PRIMARY BRANCH (highest priority):
  IF (critical_condition_violated)
    THEN VETO → immediate action

SECONDARY BRANCH:
  ELSE IF (important_condition < threshold)
    THEN REVIEW → requires justification

TERTIARY BRANCH:
  ELSE IF (optional_condition < threshold)
    THEN APPROVE with conditions

TERMINATION: Define when to stop evaluating
FALLBACK: What to do in edge cases
```

---

## 3. Standard Heuristic Templates

### 3.1 Strategic Alignment Heuristic

**Purpose:** Validate that actions align with vision/goals.

```yaml
strategic_alignment:
  id: "{PREFIX}_STR_001"
  name: "Strategic Alignment Check"
  phase: "early (architecture/planning)"

  weights:
    vision_clarity: 0.9
    goal_alignment: 0.8
    resource_efficiency: 0.7

  thresholds:
    vision_clarity: 0.8
    goal_alignment: 0.7
    resource_efficiency: 0.5

  veto_conditions:
    - condition: "vision_clarity < 0.7"
      action: "VETO - Vision unclear, return to Discovery"

  decision_tree: |
    IF (action directly enables vision)
      THEN priority = HIGH → APPROVE
    ELSE IF (action creates optionality towards vision)
      THEN priority = MEDIUM → APPROVE with conditions
    ELSE IF (action does not serve vision)
      THEN REVIEW - requires justification
    TERMINATION: Action contradicts vision
```

### 3.2 Coherence Scan Heuristic

**Purpose:** Validate executor/resource fit.

```yaml
coherence_scan:
  id: "{PREFIX}_COH_001"
  name: "Coherence Validation"
  phase: "mid (executor assignment)"

  weights:
    consistency: 1.0           # VETO power
    system_fit: 0.8
    capability: 0.3

  thresholds:
    consistency: 0.7           # Must be coherent
    system_fit: 0.7
    capability: null           # Context-dependent

  veto_conditions:
    - condition: "consistency < 0.7"
      action: "VETO - Reassign executor"
    - condition: "detected_incoherence = true"
      action: "VETO - Trust violation"

  decision_tree: |
    PRIMARY:
      IF (consistency == 'Incoherent')
        THEN REJECT immediately → VETO
    SECONDARY:
      ELSE IF (system_fit < 0.7)
        THEN FLAG for observation → REVIEW
    TERTIARY:
      ELSE IF (capability < required)
        THEN Consider training → REVIEW with conditions
```

### 3.3 Automation Decision Heuristic

**Purpose:** Decide when to automate vs keep manual.

```yaml
automation_decision:
  id: "{PREFIX}_AUT_001"
  name: "Automation Tipping Point"
  phase: "mid (workflow design)"

  weights:
    frequency: 0.7
    impact: 0.9
    automatability: 0.8
    guardrails_present: 1.0    # VETO power

  thresholds:
    frequency: "2x per month"
    impact: 0.6
    automatability: 0.5
    standardization: 0.7

  veto_conditions:
    - condition: "guardrails_missing = true"
      action: "VETO - Define safety guardrails first"

  decision_tree: |
    IF (automatability > 0.5 AND guardrails_present)
      THEN AUTOMATE
    ELSE IF (impact > 0.6)
      THEN KEEP_MANUAL (needs human judgment)
    ELSE IF (frequency < 1x/month AND impact < 0.5)
      THEN ELIMINATE
    CONSTRAINT: NEVER automate without guardrails

  automation_rules:
    - trigger: "Task repeated 2+ times"
      action: "Document and automate"
    - trigger: "Task repeated 3+ times without automation"
      assessment: "Design failure - immediate remediation"
    - trigger: "Any automation"
      requirement: "Must have guardrails, logs, manual escape"
```

---

## 4. Evaluation Criteria Table

Standard format for documenting criteria:

| Criterion | Weight | Threshold | VETO Power | Description |
|-----------|--------|-----------|------------|-------------|
| criterion_1 | 0.9 | ≥0.8 | YES | What it measures |
| criterion_2 | 0.8 | ≥0.7 | NO | What it measures |
| criterion_3 | 0.7 | Context | NO | What it measures |

---

## 5. Failure Modes Documentation

Every heuristic should document failure modes:

```yaml
failure_modes:
  - name: "False Positive"
    trigger: "What causes false approval"
    manifestation: "What happens when it fails"
    detection: "How to detect the failure"
    recovery: "How to fix it"
    prevention: "How to prevent it"

  - name: "False Negative"
    trigger: "What causes false rejection"
    manifestation: "What happens"
    detection: "How to detect"
    recovery: "How to fix"
    prevention: "How to prevent"
```

---

## 6. Checkpoint Integration

Heuristics integrate with workflow checkpoints:

```yaml
checkpoint:
  id: "checkpoint-name"
  heuristic: "{PREFIX}_{AREA}_{NUMBER}"
  phase: N

  criteria:
    - metric: "metric_name"
      threshold: 0.8
      operator: ">="
    - metric: "another_metric"
      threshold: 0.7
      operator: ">="

  veto_conditions:
    - condition: "condition_expression"
      action: "HALT - Reason"

  validation_questions:
    - "Question to verify criterion 1?"
    - "Question to verify criterion 2?"

  pass_action: "Proceed to Phase N+1"
  fail_action: "Return to Phase N-1 with feedback"
```

---

## 7. Performance Metrics

Track heuristic performance:

```yaml
performance:
  decision_speed: "Time to make decision"
  accuracy_rate: "Percentage of correct decisions"
  confidence_level: "Confidence in decisions"
  resource_efficiency: "0-10 scale"
  context_sensitivity: "0-10 scale"
```

---

## 8. Creating Custom Heuristics

### Step 1: Identify the Decision Point

- What decision needs to be made?
- At which workflow phase?
- Who/what makes the decision?

### Step 2: Define Criteria

- What factors matter?
- How important is each (weights)?
- What's the minimum acceptable (thresholds)?

### Step 3: Define Veto Conditions

- What absolutely cannot happen?
- What triggers immediate rejection?

### Step 4: Build Decision Tree

- Primary branch (highest priority)
- Secondary branches
- Termination conditions
- Fallback behavior

### Step 5: Document Failure Modes

- What could go wrong?
- How to detect and recover?

### Step 6: Integrate with Checkpoint

- Which checkpoint uses this?
- What validation questions?

---

## 9. Quality Gate Pattern

Heuristics work within quality gates:

```
┌─────────────────────────────────────────┐
│  QUALITY GATE                           │
├─────────────────────────────────────────┤
│  1. Evaluate criteria against thresholds│
│  2. Check veto conditions               │
│  3. Apply decision tree                 │
│  4. Output: APPROVE | REVIEW | VETO     │
└─────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────┐
│  IF APPROVE: Proceed to next phase      │
│  IF REVIEW: Human intervention needed   │
│  IF VETO: Return to previous phase      │
└─────────────────────────────────────────┘
```

---

*AIOS Decision Heuristics Framework v1.0*
