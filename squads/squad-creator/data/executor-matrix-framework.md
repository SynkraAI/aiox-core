# Executor Matrix Framework

> **Version:** 1.0.0
> **Source:** AIOS Quality Standards

Framework for classifying WHO executes each task in a workflow.

---

## 1. Executor Types

| Type | Characteristics | Cost | Speed | When to Use |
|------|-----------------|------|-------|-------------|
| **Human** | Judgment, creativity, relationships | $$$ | Slow | Critical decisions, negotiations, creative work |
| **Agent (AI)** | Analysis, generation, pattern recognition | $$$$ | Fast | Data analysis, content generation, pattern matching |
| **Hybrid** | AI assists, human validates | $$ | Moderate | Reviews, assisted approvals, quality validation |
| **Worker** | Deterministic, APIs, file operations | $ | Very Fast | Automations, integrations, file operations |

---

## 2. Executor Profiles

### Human Executor

```yaml
human:
  id: "EXEC-H-001"
  characteristics:
    - "Judgment and decision-making"
    - "Creativity and innovation"
    - "Relationship building"
    - "Contextual understanding"
    - "Ethical reasoning"

  strengths:
    - "Complex problem solving"
    - "Emotional intelligence"
    - "Handling ambiguity"
    - "Strategic thinking"
    - "Negotiation"

  weaknesses:
    - "Speed (slow)"
    - "Consistency (varies)"
    - "Scale (limited)"
    - "Cost (high)"
    - "Availability (limited)"

  cost_model: "$$$"
  speed_model: "Slow"

  best_for:
    - "Critical decisions with high stakes"
    - "Creative work requiring originality"
    - "Relationship-dependent tasks"
    - "Ambiguous situations"
    - "Final approvals"
```

### Agent (AI) Executor

```yaml
agent:
  id: "EXEC-A-001"
  characteristics:
    - "Pattern recognition"
    - "Data analysis"
    - "Content generation"
    - "Consistency at scale"
    - "24/7 availability"

  strengths:
    - "Speed (very fast)"
    - "Scale (unlimited)"
    - "Consistency"
    - "Data processing"
    - "Pattern matching"

  weaknesses:
    - "Judgment (limited)"
    - "Creativity (derivative)"
    - "Context (may miss nuance)"
    - "Cost (token-based)"
    - "Hallucination risk"

  cost_model: "$$$$"
  speed_model: "Fast"

  best_for:
    - "Data analysis and summarization"
    - "Content generation from templates"
    - "Pattern recognition tasks"
    - "Research and information gathering"
    - "First drafts and iterations"
```

### Hybrid Executor

```yaml
hybrid:
  id: "EXEC-HY-001"
  characteristics:
    - "AI generates, human validates"
    - "Combined judgment and speed"
    - "Quality assurance built-in"
    - "Learning feedback loop"

  strengths:
    - "Balance of speed and quality"
    - "Human oversight on AI output"
    - "Scalable with quality control"
    - "Continuous improvement"

  weaknesses:
    - "Coordination overhead"
    - "Handoff friction"
    - "Training requirements"
    - "Process complexity"

  cost_model: "$$"
  speed_model: "Moderate"

  best_for:
    - "Content review and editing"
    - "Quality assurance"
    - "Assisted decision-making"
    - "Training AI with feedback"
    - "High-volume with quality needs"
```

### Worker Executor

```yaml
worker:
  id: "EXEC-W-001"
  characteristics:
    - "Deterministic execution"
    - "API interactions"
    - "File operations"
    - "Scheduled tasks"
    - "No judgment required"

  strengths:
    - "Speed (fastest)"
    - "Consistency (100%)"
    - "Cost (lowest)"
    - "Scale (unlimited)"
    - "Reliability"

  weaknesses:
    - "No judgment"
    - "Rigid (follows rules exactly)"
    - "No adaptation"
    - "Requires clear specification"

  cost_model: "$"
  speed_model: "Very Fast"

  best_for:
    - "Data transformations"
    - "API integrations"
    - "File operations"
    - "Scheduled jobs"
    - "Deterministic processes"
```

---

## 3. Selection Decision Tree

```
START: What type of task is this?
    │
    ├── Requires creativity or judgment?
    │   └── YES → Consider HUMAN or HYBRID
    │       ├── High stakes or final decision?
    │       │   └── YES → HUMAN
    │       │   └── NO → HYBRID
    │
    ├── Requires data analysis or pattern recognition?
    │   └── YES → Consider AGENT
    │       ├── Needs human validation?
    │       │   └── YES → HYBRID
    │       │   └── NO → AGENT
    │
    ├── Deterministic with clear rules?
    │   └── YES → Consider WORKER
    │       ├── Involves external APIs or file ops?
    │       │   └── YES → WORKER
    │       │   └── NO → Check if automation exists
    │
    └── DEFAULT: Start with HYBRID, optimize later
```

---

## 4. Selection Matrix

| Requirement | Human | Agent | Hybrid | Worker |
|-------------|-------|-------|--------|--------|
| Creativity | ✅ | ⚠️ | ✅ | ❌ |
| Judgment | ✅ | ⚠️ | ✅ | ❌ |
| Speed | ❌ | ✅ | ⚠️ | ✅ |
| Consistency | ⚠️ | ✅ | ✅ | ✅ |
| Scale | ❌ | ✅ | ✅ | ✅ |
| Low cost | ❌ | ⚠️ | ✅ | ✅ |
| Complex reasoning | ✅ | ⚠️ | ✅ | ❌ |
| Data processing | ⚠️ | ✅ | ✅ | ✅ |
| Relationships | ✅ | ❌ | ⚠️ | ❌ |
| Availability | ⚠️ | ✅ | ✅ | ✅ |

Legend: ✅ Strong | ⚠️ Moderate | ❌ Weak

---

## 5. Task Assignment Template

```yaml
task:
  name: "{Task Name}"

  executor:
    type: "Human | Agent | Hybrid | Worker"
    pattern: "EXEC-{type}-001"

    rationale: |
      Why this executor type was chosen

    fallback:
      type: "Alternative executor if primary fails"
      trigger: "When to use fallback"

    requirements:
      skills: ["Required skills/capabilities"]
      access: ["Required access/permissions"]

  execution_context:
    supervision: "none | minimal | moderate | high"
    validation: "none | automated | human"
    escalation: "When to escalate to human"
```

---

## 6. Common Patterns

### Pattern 1: AI Draft, Human Review (Hybrid)

```yaml
pattern: "ai-draft-human-review"
executor: Hybrid

flow:
  1. Agent creates initial draft
  2. Human reviews and provides feedback
  3. Agent incorporates feedback
  4. Human approves final version

use_when:
  - "Content creation"
  - "Document generation"
  - "Report writing"
```

### Pattern 2: Human Decision, AI Execution

```yaml
pattern: "human-decision-ai-execution"
executor: Hybrid

flow:
  1. Human makes strategic decision
  2. Agent executes decision at scale
  3. Worker handles mechanical tasks
  4. Human reviews results

use_when:
  - "Campaign execution"
  - "Batch processing with oversight"
  - "Strategic initiatives"
```

### Pattern 3: Fully Automated Pipeline

```yaml
pattern: "automated-pipeline"
executor: Worker + Agent

flow:
  1. Trigger event occurs
  2. Worker fetches/transforms data
  3. Agent processes/analyzes
  4. Worker stores/distributes results
  5. Human reviews exceptions only

use_when:
  - "Data pipelines"
  - "Scheduled reports"
  - "Integration workflows"
```

### Pattern 4: Human-in-the-Loop Critical

```yaml
pattern: "human-critical"
executor: Human with Worker support

flow:
  1. Worker prepares context and data
  2. Human makes critical decision
  3. Worker executes approved action
  4. Human monitors outcome

use_when:
  - "Financial approvals"
  - "Legal decisions"
  - "Customer escalations"
```

---

## 7. Guardrails for Each Type

### Human Guardrails

```yaml
human_guardrails:
  - "Clear decision criteria provided"
  - "Time limits for decisions"
  - "Escalation path defined"
  - "Documentation requirements"
```

### Agent Guardrails

```yaml
agent_guardrails:
  - "Output validation rules"
  - "Confidence thresholds"
  - "Human escalation triggers"
  - "Rate limiting"
  - "Hallucination detection"
```

### Hybrid Guardrails

```yaml
hybrid_guardrails:
  - "Clear handoff protocols"
  - "Validation checkpoints"
  - "Feedback capture"
  - "Quality metrics"
```

### Worker Guardrails

```yaml
worker_guardrails:
  - "Idempotency required"
  - "Loop prevention"
  - "Error handling"
  - "Audit logging"
  - "Manual override route"
```

---

## 8. Cost-Speed Optimization

```
                    SPEED
                      ↑
                      │
    Worker ────────── │ ──────── Agent
    (Cheapest,        │         (Expensive,
     Fastest)         │          Fast)
                      │
    ──────────────────┼────────────────→ COST
                      │
    Hybrid ────────── │ ──────── Human
    (Moderate,        │         (Most Expensive,
     Moderate)        │          Slowest)
                      │
```

### Optimization Rules

1. **Start with Worker** if task is deterministic
2. **Use Agent** if pattern recognition or generation needed
3. **Use Hybrid** if quality validation required
4. **Use Human** only for critical decisions or creativity

---

## 9. Migration Paths

### Human → Hybrid

```yaml
migration:
  from: Human
  to: Hybrid
  trigger: "Task is repeatable with pattern"
  steps:
    1. Document human decision criteria
    2. Train AI on historical decisions
    3. Start with AI draft, human review
    4. Reduce human involvement as confidence grows
```

### Hybrid → Agent

```yaml
migration:
  from: Hybrid
  to: Agent
  trigger: "Human approval rate > 95%"
  steps:
    1. Analyze rejection reasons
    2. Codify edge cases
    3. Implement automated validation
    4. Move to exception-only human review
```

### Agent → Worker

```yaml
migration:
  from: Agent
  to: Worker
  trigger: "Task becomes deterministic"
  steps:
    1. Identify stable patterns
    2. Codify rules
    3. Implement as script/automation
    4. Remove AI dependency
```

---

*AIOS Executor Matrix Framework v1.0*
