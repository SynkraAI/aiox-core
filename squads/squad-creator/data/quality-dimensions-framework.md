# Quality Dimensions Framework

> **Version:** 1.0.0
> **Source:** AIOS Quality Standards

Framework for evaluating squad outputs using multi-dimensional quality scoring.

---

## 1. Overview

A comprehensive quality assessment uses 10 standardized dimensions. Each dimension has:
- **Weight:** Relative importance (0.0-1.0)
- **Threshold:** Minimum acceptable score
- **Veto Power:** Whether low score blocks progress

---

## 2. Standard Quality Dimensions

### Configuration

```yaml
quality_dimensions:
  pattern_reference: "squad-creator/data/quality-dimensions-framework.md"
  total_dimensions: 10

  scoring:
    overall_threshold: 7.0
    minimum_per_dimension: 6.0
    veto_on_failure: false  # Default to REVIEW, not VETO

  dimensions:
    1_accuracy:
      name: "Accuracy"
      weight: 1.0
      threshold: 7.0
      veto_power: true
      description: "Correctness verified by data/evidence"

    2_coherence:
      name: "Coherence"
      weight: 0.9
      threshold: 6.0
      veto_power: false
      description: "Internal consistency and alignment"

    3_strategic_alignment:
      name: "Strategic Alignment"
      weight: 0.9
      threshold: 6.0
      veto_power: false
      description: "Connection to goals and vision"

    4_operational_excellence:
      name: "Operational Excellence"
      weight: 0.8
      threshold: 6.0
      veto_power: false
      description: "Process quality and efficiency"

    5_innovation_capacity:
      name: "Innovation Capacity"
      weight: 0.7
      threshold: 5.0
      veto_power: false
      description: "Ability to create novel solutions"

    6_risk_management:
      name: "Risk Management"
      weight: 0.8
      threshold: 6.0
      veto_power: false
      description: "Identification and mitigation of risks"

    7_resource_optimization:
      name: "Resource Optimization"
      weight: 0.8
      threshold: 6.0
      veto_power: false
      description: "Efficient use of time, money, people"

    8_stakeholder_value:
      name: "Stakeholder Value"
      weight: 0.7
      threshold: 6.0
      veto_power: false
      description: "Value delivered to all parties"

    9_sustainability:
      name: "Sustainability"
      weight: 0.7
      threshold: 6.0
      veto_power: false
      description: "Long-term viability"

    10_adaptability:
      name: "Adaptability"
      weight: 0.6
      threshold: 5.0
      veto_power: false
      description: "Ability to respond to change"
```

---

## 3. Dimension Details

### 3.1 Accuracy (Weight: 1.0, VETO)

**Definition:** Correctness verified by data/evidence.

**Scoring Criteria:**
- 9-10: All claims verified, zero errors
- 7-8: Minor inaccuracies, easily corrected
- 5-6: Some unverified claims, needs review
- 3-4: Significant errors or contradictions
- 1-2: Fundamentally incorrect

**Red Flags:**
- Claims without supporting evidence
- Contradictions within the output
- Outdated or incorrect data

### 3.2 Coherence (Weight: 0.9)

**Definition:** Internal consistency and alignment.

**Scoring Criteria:**
- 9-10: Perfect internal consistency
- 7-8: Minor inconsistencies, easily reconciled
- 5-6: Some logical gaps
- 3-4: Significant contradictions
- 1-2: Incoherent

**Red Flags:**
- Statements contradict each other
- Logic gaps in reasoning
- Disconnected sections

### 3.3 Strategic Alignment (Weight: 0.9)

**Definition:** Connection to goals and vision.

**Scoring Criteria:**
- 9-10: Directly enables strategic goals
- 7-8: Clearly supports strategy
- 5-6: Neutral, neither helps nor hinders
- 3-4: Questionable alignment
- 1-2: Contradicts strategic direction

**Red Flags:**
- No clear connection to objectives
- Works against stated goals
- Short-term focus at expense of long-term

### 3.4 Operational Excellence (Weight: 0.8)

**Definition:** Process quality and efficiency.

**Scoring Criteria:**
- 9-10: Optimal process, best practices
- 7-8: Well-designed, minor improvements possible
- 5-6: Functional but inefficient
- 3-4: Significant process issues
- 1-2: Broken or missing processes

**Red Flags:**
- Manual work that should be automated
- Missing documentation
- Inconsistent execution

### 3.5 Innovation Capacity (Weight: 0.7)

**Definition:** Ability to create novel solutions.

**Scoring Criteria:**
- 9-10: Breakthrough innovation
- 7-8: Creative improvements
- 5-6: Standard solutions
- 3-4: Outdated approaches
- 1-2: No innovation

**Red Flags:**
- Copy-paste solutions without adaptation
- Ignoring new tools/methods
- Resistance to improvement

### 3.6 Risk Management (Weight: 0.8)

**Definition:** Identification and mitigation of risks.

**Scoring Criteria:**
- 9-10: All risks identified and mitigated
- 7-8: Major risks addressed
- 5-6: Some risks identified, partial mitigation
- 3-4: Significant blind spots
- 1-2: No risk consideration

**Red Flags:**
- No contingency plans
- Ignoring known risks
- Single points of failure

### 3.7 Resource Optimization (Weight: 0.8)

**Definition:** Efficient use of time, money, people.

**Scoring Criteria:**
- 9-10: Optimal resource allocation
- 7-8: Efficient with minor waste
- 5-6: Acceptable efficiency
- 3-4: Significant waste
- 1-2: Grossly inefficient

**Red Flags:**
- Redundant work
- Over-engineering
- Under-utilization of available resources

### 3.8 Stakeholder Value (Weight: 0.7)

**Definition:** Value delivered to all parties.

**Scoring Criteria:**
- 9-10: Exceptional value for all stakeholders
- 7-8: Good value, meets expectations
- 5-6: Minimal viable value
- 3-4: Some stakeholders underserved
- 1-2: No clear value

**Red Flags:**
- Ignoring key stakeholder needs
- Unbalanced value distribution
- No clear benefit articulation

### 3.9 Sustainability (Weight: 0.7)

**Definition:** Long-term viability.

**Scoring Criteria:**
- 9-10: Built for perpetuity
- 7-8: Sustainable with maintenance
- 5-6: Medium-term viability
- 3-4: Short-term solution
- 1-2: Not sustainable

**Red Flags:**
- Technical debt accumulation
- Dependency on unsustainable resources
- No maintenance plan

### 3.10 Adaptability (Weight: 0.6)

**Definition:** Ability to respond to change.

**Scoring Criteria:**
- 9-10: Highly flexible, easy to modify
- 7-8: Adaptable with reasonable effort
- 5-6: Some flexibility
- 3-4: Rigid, hard to change
- 1-2: Inflexible, locked in

**Red Flags:**
- Hardcoded assumptions
- No extension points
- Tightly coupled components

---

## 4. Assessment Template

```yaml
quality_assessment:
  subject: "What is being assessed"
  assessment_date: "YYYY-MM-DD"
  assessor: "Who/what performed assessment"

  dimensions:
    - name: "Accuracy"
      score: 0-10
      evidence: "Supporting observations"
      recommendations: ["Improvements"]

    - name: "Coherence"
      score: 0-10
      evidence: "Observations"
      recommendations: []

    # ... repeat for all 10 dimensions

  overall_score: number  # Weighted average
  pass_threshold: 7.0
  status: "PASS | FAIL | REVIEW"

  summary:
    strengths: ["What's working well"]
    weaknesses: ["What needs improvement"]
    critical_issues: ["Blocking issues"]
    recommendations: ["Prioritized actions"]
```

---

## 5. Scoring Calculation

### Weighted Average Formula

```
overall_score = Σ(dimension_score × weight) / Σ(weights)
```

### Pass/Fail Logic

```
IF (overall_score >= 7.0 AND no_dimension < 6.0)
  THEN status = PASS
ELSE IF (any_veto_dimension < threshold)
  THEN status = FAIL
ELSE
  status = REVIEW
```

---

## 6. Domain-Specific Weights

Adjust weights based on domain:

### Software Development

```yaml
weights_override:
  accuracy: 1.0        # Code must work
  operational_excellence: 0.9
  risk_management: 0.9
  sustainability: 0.8
```

### Marketing/Copy

```yaml
weights_override:
  stakeholder_value: 1.0  # Must resonate with audience
  innovation_capacity: 0.9
  coherence: 0.9
```

### Operations/Process

```yaml
weights_override:
  operational_excellence: 1.0
  resource_optimization: 0.9
  risk_management: 0.9
```

---

## 7. Integration with Workflows

Add quality assessment as a checkpoint:

```yaml
checkpoint:
  id: "quality-gate"
  type: "quality_dimensions"
  phase: "final"

  dimensions_to_evaluate: "all"  # or specific list

  thresholds:
    overall: 7.0
    per_dimension: 6.0

  veto_dimensions:
    - "accuracy"

  pass_action: "Approve and publish"
  fail_action: "Return for revision"
  review_action: "Escalate to human"
```

---

## 8. Continuous Improvement

Track scores over time:

```yaml
tracking:
  aggregate_by: ["month", "quarter"]
  metrics:
    - average_overall_score
    - dimension_averages
    - fail_rate
    - veto_rate
  alerts:
    - condition: "average_score < 7.0"
      action: "Review process quality"
```

---

*AIOS Quality Dimensions Framework v1.0*
