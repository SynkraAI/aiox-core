# Task: Design 4-Layer Feedback Architecture

**Task ID:** dopamine-learning/assessment-10-design-feedback-layers
**Version:** 1.0.0
**Status:** Production Ready
**Created:** 2026-02-12
**Category:** Assessment Feedback Realtime Workflow
**Total Lines:** 330

---

## Executive Summary

This task designs the 4-layer real-time feedback system for all assessment questions. Each layer fires at precise timing with specific copy: immediate confirmation (100-200ms), explanation (300-500ms), principle (1-3s), integration (5-15s). This is the foundation for optimal dopamine signal timing during assessment, ensuring feedback doesn't just tell learners if they're right, but encodes deep learning.

**Workflow Position:** Phase 2 of Assessment Feedback Realtime workflow
**Input Dependency:** Requires Task 9 (structured question bank) completed
**Success Definition:** 4-layer feedback spec for ALL questions with copy + timing**

---

## Purpose

Assessment feedback without layering:
- ❌ "Correct ✓" appears at 2s (learner already forgot their question)
- ❌ No explanation of WHY (no learning reinforcement)
- ❌ No connection to principle (isolated fact, not integrated)

Assessment feedback with 4 layers:
- ✅ Layer 1 (100ms): Immediate confirmation (dopamine fires fast)
- ✅ Layer 2 (400ms): Explanation (learner updates mental model)
- ✅ Layer 3 (2s): Principle (abstract learning)
- ✅ Layer 4 (10s): Integration (memory encoding)

---

## Executor Type

**Agent (100%)**

Pure instructional design work generating feedback layers for all questions.

---

## Inputs

### Required Inputs

```yaml
structured_question_bank:
  field: "Question bank with objective mapping from Task 9"
  format: "YAML"
  required: true

dopamine_timing_baseline:
  field: "Reference timing specs (from Quiz/Challenge workflows)"
  format: "YAML"
  required: true
```

---

## Preconditions

- [ ] Task 9 completed (structured question bank)
- [ ] Learning objectives aligned to questions
- [ ] Question success criteria defined (correct/incorrect answers known)

---

## Steps

### Step 1: Layer 1 Copy - Immediate Confirmation (8 min)

Generate super short copy for ALL questions (appears 100-200ms):

```
CORRECT: "✓ You got it" or "✓ Correct"
INCORRECT: "🔍 Let's explore this" (never "❌ Wrong")
```

Format per question type:
- Multiple choice: Checkmark + option letter shown
- Free response: "Processing your answer..."
- Scenario-based: "Interesting choice"

**Output:** Layer 1 copy for all questions

**Checkpoint:** All questions have confirmation copy

---

### Step 2: Layer 2 Copy - Explanation (12 min)

Generate 1-2 sentence explanation per question (appears 300-500ms):

```
CORRECT: "You chose [X], because [reason]. This is right because [evidence]."
INCORRECT: "You chose [X], but [misconception]. Actually, [correct concept]."
```

Example:
- Correct: "You predicted Payment is isolated. Correct! Isolation prevents one service failure from cascading."
- Incorrect: "You predicted all services crash. That's monolith thinking. Microservices are independent."

**Output:** Layer 2 explanations for all questions

**Checkpoint:** Explanations specific to THIS question (not generic)

---

### Step 3: Layer 3 Copy - Principle (12 min)

Generate principle extraction for all questions (appears 1-3s):

```
"This exemplifies [PRINCIPLE NAME].

Definition: [1-2 sentence definition]

Why it matters: [Why this principle is important]"
```

Example:
```
"This exemplifies SERVICE ISOLATION.

Definition: Each microservice runs independently.
If one fails, others continue.

Why it matters: Isolation prevents cascading failures.
One broken service doesn't take down everything."
```

**Output:** Layer 3 principle extractions for all questions

**Checkpoint:** All questions have principle named + defined

---

### Step 4: Layer 4 Copy - Integration (12 min)

Generate narrative integration for all questions (appears 5-15s):

```
"[Real-world story relevant to learner]

This is why [principle] matters:
[Specific consequence if principle violated]

You're learning what prevents this."
```

Example:
```
"Remember the 2AM payment outage? $50K revenue lost.

This is why SERVICE ISOLATION matters:
One service crashed. Took everything with it.
If we had isolation? Just Payment would be affected.

You're learning the architecture that prevents this crisis."
```

**Output:** Layer 4 narratives for all questions

**Checkpoint:** Stories are relevant + high-stakes

---

### Step 5: Specify Timing Per Question (8 min)

Customize timing based on:
- Question difficulty (hard questions need longer L3 for reflection)
- Learner profile (anxious needs faster feedback)
- Question type (scenario needs slower timing than MC)

Formula:
- L1: Always 100-200ms (fastest)
- L2: 300-500ms (standard) or 200-300ms (anxious)
- L3: 1000-3000ms (standard) or 500-1500ms (anxious)
- L4: 5000-15000ms (standard) or 3000-8000ms (anxious)

**Output:** Timing specifications per question

**Checkpoint:** All questions have custom timing

---

### Step 6: Create Feedback Layer Document (6 min)

Synthesize all layers into YAML with:
- Question ID
- Layer 1 copy + timing
- Layer 2 copy + timing
- Layer 3 copy + principle + timing
- Layer 4 copy + timing
- Customization rules (adjust if learner is anxious, etc.)

**Output:** Complete feedback spec YAML

**Checkpoint:** Ready for Task 11 personalization

---

## Outputs

### Primary Output

**4-Layer Feedback Specification**

Format: YAML
Location: `/squads/dopamine-learning/data/feedback-layers/{{ assessment-slug }}-feedback-layers.yaml`

(Structure similar to Task 4 but focused on assessment questions)

### Secondary Outputs

1. **Layer Copy Reference** (markdown, all copy organized)
2. **Timing Calibration Guide** (why each timing was chosen)
3. **Feedback Implementation Checklist** (for developers)

---

## Validation

### Checklist

- [ ] All questions have 4-layer feedback (no incomplete layers)
- [ ] Layer 1 is super short (3-8 words max)
- [ ] Layer 2 explains WHY (specific to this question)
- [ ] Layer 3 names principle explicitly
- [ ] Layer 4 includes relevant story
- [ ] No shame language in any layer
- [ ] Timing is custom per question (not all 1s delay)
- [ ] Feedback is implementable (not vague)

### Success Criteria

**Threshold: 9/10**

| Criteria | Excellent | Acceptable | Poor |
|----------|-----------|-----------|------|
| **Layer Completeness** | All 4 layers for all questions | Most questions complete | Gaps in layers |
| **Copy Quality** | Specific, engaging, no shame | Generic but functional | Vague or shame-inducing |
| **Principle Naming** | Explicit name + definition per L3 | Principle mentioned | No principle extraction |
| **Story Integration** | L4 stories are high-stakes + relevant | Stories present, weak | No story/context |
| **Timing Customization** | Custom per question + learner | Mostly standard timing | All same timing |

---

## Estimated Effort

| Role | Effort |
|------|--------|
| Agent | 60-80 min |
| Total | 60-80 min |

---

## Integration

### Feeds To

**Next Task:** Task 11 - personalize-feedback-rules
- Uses: Feedback layers for all questions
- Produces: Personalization logic

### Agent Routing

**Primary Agents:** Kapp (feedback), Schultz (dopamine timing)

---

## Revision History

| Version | Date | Change |
|---------|------|--------|
| 1.0.0 | 2026-02-12 | Initial release |
