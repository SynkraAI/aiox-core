# Task: Specify Feedback Architecture

**Task ID:** dopamine-learning/quiz-04-specify-feedback-architecture
**Version:** 1.0.0
**Status:** Production Ready
**Created:** 2026-02-12
**Category:** Quiz Immersivo Workflow
**Total Lines:** 440

---

## Executive Summary

This task designs the real-time feedback system that translates question variants into lived experience. Instead of static "correct/incorrect" messages, this specifies a 4-layer feedback architecture: immediate confirmation (100-200ms), explanation (300-500ms), principle extraction (1-3s), and integration (5-15s). Each layer fires at precise timing with specific copy optimized for the learner's dopamine architecture and psychological state.

**Workflow Position:** Phase 4 of Quiz Immersivo workflow
**Input Dependency:** Requires Task 1 (profile) + Task 2 (dopamine timing) + Task 3 (question bank) completed
**Success Definition:** Feedback spec for ALL questions with timing, copy, and layer architecture
**Output Quality Gate:** Feedback preserves learning objective AND optimizes dopamine signal timing**

---

## Purpose

A learner submits an answer. What happens next?

**Without this task (current state):**
- Page shows "Correct! ✓" (2s delay)
- Learner feels... nothing. No dopamine. No learning reinforcement.

**With this task (optimized):**
- **0-200ms (Layer 1 - Immediate):** Page shows checkmark (confirms correct answer)
- **300-500ms (Layer 2 - Explanation):** Shows why this answer is right ("Payment is isolated from Orders")
- **1-3s (Layer 3 - Principle):** Reveals principle ("This isolation prevents cascade failures")
- **5-15s (Layer 4 - Integration):** Connects to bigger picture ("Remember when service went down? That's why.")

Each layer is timed to hit the RPE window, maximize retention, and build progressively deeper understanding. The result: learner leaves with dopamine signal encoded + principle retained.

---

## Executor Type

**Agent (100%)**

This is technical + pedagogical work. The agent applies Kapp (instructional design), Schultz (dopamine timing), and Eyal (habit formation) to create feedback architecture. No human iteration needed unless inputs are unclear.

---

## Inputs

### Required Inputs

```yaml
question_bank:
  field: "Question variants with learning objectives"
  format: "YAML (from Task 3 output)"
  required: true
  example: "question-banks/pm-acme-question-bank.yaml"
  validation: "Must include all question variants + success criteria"

dopamine_map:
  field: "Dopamine timing and RPE specifications"
  format: "YAML (from Task 2 output)"
  required: true
  example: "dopamine-maps/pm-acme-objectives-dopamine-map.yaml"
  validation: "Must include feedback_latency_ms, dopamine_signal, learning_rate_alpha"

learner_profile:
  field: "Learner anxiety level, communication preferences"
  format: "YAML (from Task 1 output)"
  required: true
  example: "learner-profiles/pm-acme-profile.yaml"
  validation: "Must include anxiety_level, learning_modality, stress_response"

domain_expertise:
  field: "Domain knowledge to explain concepts"
  format: "text/optional"
  required: false
  example: |
    Domain: Microservices Architecture
    Key principles:
    - Service isolation prevents cascade failures
    - Asynchronous communication improves resilience
  validation: "Used to generate layer 3 (principle extraction)"
```

### Optional Inputs

```yaml
feedback_tone:
  field: "How should feedback sound?"
  format: "text/optional"
  example: "Encouraging but not patronizing, technical but accessible"

error_handling:
  field: "How to handle incorrect answers?"
  format: "text/optional"
  example: "Don't shame, explain the misconception, redirect to correct thinking"
```

---

## Preconditions

Before starting this task:

- [ ] Task 3 completed (question bank with all variants exists)
- [ ] Task 2 completed (dopamine timing specs exist)
- [ ] Task 1 completed (learner profile with anxiety/stress_response exists)
- [ ] All questions have success criteria defined (how to score correct/incorrect)

---

## Steps

### Step 1: Design 4-Layer Feedback Architecture Framework (5 min)

**Agent Activity:**
- Establish feedback layer structure:

```
Layer 1 (0-200ms):   IMMEDIATE CONFIRMATION
└─ Purpose: Rapid feedback loop, confirm learner's choice registered
└─ Example: Checkmark appears, or "Processing your answer..."

Layer 2 (300-500ms): EXPLANATION
└─ Purpose: Why was this answer right/wrong?
└─ Example: "Correct! Here's why: [specific reason]"

Layer 3 (1-3s):      PRINCIPLE EXTRACTION
└─ Purpose: Connect answer to broader concept/principle
└─ Example: "This exemplifies [principle X]"

Layer 4 (5-15s):     INTEGRATION & MEMORY ENCODING
└─ Purpose: Connect to previous learning + real-world application
└─ Example: "Remember the 2AM payment outage? Here's how this principle saved us..."
```

- Map learner customization:
  - Anxious learner: Shorten layers 1-2 (need quick reassurance), keep layer 3 (need explanation)
  - High-ability: Keep full stack (can handle uncertainty before explanation)
  - Low-motivation: Emphasize layer 4 (connection to purpose)

**Output:** Feedback layer framework with timing specifications

**Checkpoint:** 4-layer architecture defined with timing ranges

---

### Step 2: Generate Layer 1 Copy (8 min)

**Agent Activity:**
- Layer 1: Immediate confirmation (appears at 100-200ms)
- Purpose: Fast feedback = low uncertainty = dopamine signal
- Design principles:
  - Super short (3-8 words max)
  - Visual first (checkmark/X icon + minimal text)
  - Tone: Neutral + encouraging
  - Same copy for ALL correct answers (consistency)

- Copy variations by learner type:
  - Anxious learner: "✓ You're on track" (emphasize progress)
  - High ability: "✓ Correct" (minimal hand-holding)
  - Low motivation: "✓ +5 points" (extrinsic reward visible)

- For incorrect answers:
  - NOT: "✗ Wrong" (shame/frustration)
  - Instead: "✓ Let's explore this" or "🔍 Interesting choice" (redirects to learning)

**Output:** Layer 1 copy with variants by learner type + answer correctness

**Checkpoint:** Layer 1 copy finalized with all correct/incorrect variations

---

### Step 3: Generate Layer 2 Copy (12 min)

**Agent Activity:**
- Layer 2: Explanation (appears at 300-500ms)
- Purpose: Why did learner's choice lead to this result?
- Design principles:
  - 1-2 sentences max
  - Specific to THIS question (not generic)
  - Explain misconception if incorrect
  - Lead learner toward principle

- Structure:
  - **Correct answer explanation:**
    ```
    "You chose [option], because [specific reason].
     This is right because [concrete evidence]."
    ```
  - **Incorrect answer explanation:**
    ```
    "You chose [option], but [misconception they have].
     Actually, [correct concept]. Here's why: [concrete evidence]."
    ```

- Example (microservices question):
  - Correct: "You chose 'Payment service isolated.' Exactly. When one service fails, others stay up because they're independent."
  - Incorrect: "You chose 'All services crash.' That would be true in a monolith. But microservices are separate, so one failure is contained."

**Output:** Layer 2 copy for each question + answer variant (correct/incorrect)

**Checkpoint:** Layer 2 explanations written for all questions

---

### Step 4: Generate Layer 3 Copy (12 min)

**Agent Activity:**
- Layer 3: Principle extraction (appears at 1-3s)
- Purpose: Abstract the principle from this specific example
- Design principles:
  - Name the principle explicitly
  - Connect to broader concept
  - Set up for layer 4 (real-world application)
  - Learner's mental model gets updated here

- Structure:
  ```
  "This illustrates the principle: [PRINCIPLE NAME]

   Definition: [1-2 sentence definition]

   Why it matters: [Why this principle is important]"
  ```

- Example (microservices):
  ```
  "This illustrates the principle: SERVICE ISOLATION

   Definition: In microservices, each service runs independently.
   If one fails, others continue operating.

   Why it matters: Isolation prevents cascading failures.
   One service crash doesn't take down the whole system."
  ```

- Dopamine note: This is where learning LOCKS IN. The delayed feedback (1-3s) allows uncertainty to build, making principle landing more powerful.

**Output:** Layer 3 copy for each question with principle naming + definition

**Checkpoint:** Layer 3 copy written for all questions

---

### Step 5: Generate Layer 4 Copy (12 min)

**Agent Activity:**
- Layer 4: Integration & memory encoding (appears at 5-15s)
- Purpose: Connect to learner's life/work/previous learning
- Design principles:
  - Tell a story or give context
  - Make principle "real" (not abstract)
  - High dopamine potential (aha moment)
  - Build curiosity for next question

- Structure:
  ```
  "[Real-world story or learner's context]

   This is why [principle] matters:
   [Specific consequence if principle violated]

   You just learned how to prevent this. Nice work."
  ```

- Example (microservices):
  ```
  "Remember the 2AM payment outage when we lost $50K in revenue?

   Here's what happened: One service crashed and took down EVERYTHING.

   With microservices + isolation, that crash would affect only
   the one service. Payments would still process. You just learned
   the architectural choice that prevents this crisis.

   Next question: You'll see HOW services stay independent."
  ```

- Learner customization:
  - Anxious: Emphasize "You prevented crisis" (confidence building)
  - High ability: Focus on technical depth (system design consequences)
  - Low motivation: Highlight personal relevance (how does this affect your job?)

**Output:** Layer 4 copy for each question with real-world context + consequence

**Checkpoint:** Layer 4 copy written for all questions

---

### Step 6: Specify Error Handling & Misconception Correction (8 min)

**Agent Activity:**
- For EACH question, identify likely misconceptions:
  - What would a learner incorrectly assume?
  - What's the "trap answer"?
  - How do we correct it without shame?

- Design error-handling copy:
  - **Trap answer feedback:** Explain why they fell for it
  - **Misconception correction:** Show the correct mental model
  - **Encouragement:** "You're thinking like X, but it's actually Y"

- Example:
  ```
  QUESTION: "What happens if Payment service crashes?"

  TRAP ANSWER: "All services crash" (learner mistakes monolith for microservices)

  ERROR HANDLING (Layer 2):
  "You chose 'All services crash.'
   That would be true in a monolith where everything is coupled.
   But in microservices, each service is independent.
   Payment crashing only affects Payment. Orders keeps running."

  LAYER 3 (Principle): Service isolation

  LAYER 4 (Integration): "This is why your platform stayed up during outages."
  ```

**Output:** Error-handling spec for misconceptions + correction language

**Checkpoint:** Misconception handling specified for all questions

---

### Step 7: Create Feedback Architecture Specification Document (5 min)

**Agent Activity:**
- Synthesize all layers into structured feedback spec:
  - Question ID
  - Correct answer feedback (all 4 layers)
  - Incorrect answer feedback (all 4 layers)
  - Misconception handling
  - Timing specifications (precise milliseconds)
  - Personalization rules (adjust by learner type)

**Output:** Complete feedback architecture YAML

**Checkpoint:** Feedback spec complete with timing + copy for all questions

---

## Outputs

### Primary Output

**Feedback Architecture Specification**

Format: YAML
Location: `/squads/dopamine-learning/data/feedback-specs/{{ learner-slug }}-feedback-architecture.yaml`

```yaml
feedback_architecture:
  learner_id: "pm_acme_001"
  quiz_domain: "Product Onboarding (Microservices)"
  created: "{{ timestamp }}"

  feedback_framework:
    total_layers: 4
    layer_1:
      name: "Immediate Confirmation"
      timing_ms: 100-200
      purpose: "Rapid feedback, confirm action registered"
      psychology: "Low uncertainty = dopamine signal fires quickly"
    layer_2:
      name: "Explanation"
      timing_ms: 300-500
      purpose: "Why is this answer right/wrong?"
      psychology: "Learner updates mental model based on feedback"
    layer_3:
      name: "Principle"
      timing_ms: 1000-3000
      purpose: "Abstract principle from specific example"
      psychology: "Delayed feedback creates uncertainty then resolution = strong learning"
    layer_4:
      name: "Integration"
      timing_ms: 5000-15000
      purpose: "Connect to real world, make memory stick"
      psychology: "Story + consequence = deep encoding + dopamine peak"

  questions:
    - question_id: "q_arch_001"
      question_text: "Why do microservices matter?"

      correct_answer_feedback:
        answer: "Payment service isolated from Orders prevents cascade failures"

        layer_1:
          timing_ms: 150
          copy: "✓ Correct"
          visual: "green_checkmark"
          tone: "neutral_encouraging"

        layer_2:
          timing_ms: 400
          copy: |
            Exactly right. You identified the core value of microservices:
            isolation. When Payment fails, it doesn't crash Orders or Inventory.
          tone: "affirming"
          learning_goal: "Confirm understanding of isolation principle"

        layer_3:
          timing_ms: 2000
          copy: |
            This exemplifies SERVICE ISOLATION.

            Definition: Each microservice runs independently.
            If one fails, others continue operating.

            Why it matters: Prevents cascading failures across the system.
          tone: "educational"
          principle_name: "service_isolation"
          learning_rate_alpha: 0.7

        layer_4:
          timing_ms: 8000
          copy: |
            Real story: Our 2AM payment outage. If we had monolith architecture,
            every customer-facing service would crash for 2 hours.

            With microservices? Only Payment was affected. Orders kept processing.
            Inventory stayed online. This decision saved us $50K.

            You now understand the architectural principle that made this possible.
          tone: "narrative_consequential"
          story_context: "real_company_event"
          consequence_level: "high_stakes"
          integration_theme: "business_impact"

      incorrect_answer_feedback:
        # Most common wrong answer
        wrong_answer: "All services crash if one fails (monolith thinking)"

        layer_1:
          timing_ms: 150
          copy: "🔍 Let's explore this"
          visual: "question_mark_icon"
          tone: "neutral_redirecting"
          NOT: "❌ Wrong"  # Avoid shame

        layer_2:
          timing_ms: 400
          copy: |
            You chose "all services crash."
            That would be true if we used a monolith architecture (one big system).

            But we use microservices (independent systems).
            So when Payment fails, Orders keeps running.
          tone: "corrective_not_blaming"
          misconception: "confusing_monolith_with_microservices"
          redirect: "Guide to correct mental model"

        layer_3:
          timing_ms: 2000
          copy: |
            The principle you're thinking of is cascade failure,
            which happens in monoliths.

            We're learning a different principle: SERVICE ISOLATION.
            This prevents those cascades.

            Microservices were invented specifically to solve the
            cascade problem.
          tone: "educational_connecting_concepts"
          principle_name: "service_isolation"
          contrasting_principle: "cascade_failure"

        layer_4:
          timing_ms: 8000
          copy: |
            Remember the outage story we told?
            2AM, payment service crashes.

            In a monolith: Everything goes down. 2-hour company-wide outage.

            With microservices: Just Payment is affected.
            Orders, Inventory, Analytics? All running.

            THIS is why service isolation matters.
            You're now building the mental model to prevent outages.
          tone: "narrative_revelatory"
          learning_objective: "Update mental model from monolith to microservices"

      misconception_handling:
        likely_misconceptions:
          - "Microservices are separate but still connected (cascade possible)"
          - "Isolation means services never communicate (misunderstanding)"
          - "Any service crash crashes everything (monolith thinking)"

        correction_strategy: |
          Layer 2: Name misconception + explain why that thinking came from
          monolith architecture.

          Layer 3: Clarify: isolation means INDEPENDENT FAILURE,
          not no-communication.

          Layer 4: Story shows concrete example of isolation in action.

    - question_id: "q_arch_002"
      # ... additional questions follow same structure ...

  feedback_timing_summary:
    average_layer_1_timing: 150
    average_layer_2_timing: 400
    average_layer_3_timing: 2000
    average_layer_4_timing: 8000
    total_time_to_full_feedback: 10.5  # seconds

  learner_customization:
    anxiety_level: 6
    adjustments:
      - "Layer 1-2 timing reduced 25% (more reassurance needed)"
      - "Layer 3 kept normal (learner can handle uncertainty)"
      - "Layer 4 emphasizes progress/confidence (anxiety reduction)"

    communication_preference: "written_with_examples"
    adjustments:
      - "All copy includes concrete examples"
      - "Avoid abstract principles without illustration"
      - "Story-based layer 4 is longer (learner learns through narrative)"

  error_prevention:
    trap_answers_identified: true
    misconception_corrections: true
    shame_avoiding_language: true

    guidelines:
      - "Never use ❌ Wrong or similar shame language"
      - "Always explain misconception + correct thinking"
      - "Connect to learner's context (why they thought this way)"

  implementation_notes:
    - "Layer 1 appears immediately (100-200ms) - must be fast"
    - "Layer 2 fades in at 300-500ms - after learner processes layer 1"
    - "Layer 3 replaces layer 2 or appears below - uncertainty window needed"
    - "Layer 4 appears in separate UI section - integrates learning"
    - "All timings adjust ±50ms based on network latency"
```

### Secondary Outputs

1. **Feedback Copy Reference Document**
   - Format: Markdown
   - Content: All feedback copy organized by question ID for easy reference
   - Use: Copy/paste for implementation

2. **Timing Calibration Guide**
   - Format: Markdown
   - Content: Why each timing was chosen + how to adjust if needed
   - Use: Technical implementation reference

3. **Error Handling & Misconception Matrix**
   - Format: Markdown table
   - Content: Wrong answers + correction copy for each question
   - Use: QA testing + error handling implementation

4. **Personalization Rules Engine**
   - Format: JSON/YAML
   - Content: Conditional logic for customizing feedback by learner type
   - Use: Personalization implementation in platform

---

## Validation

### Checklist

- [ ] All 4 feedback layers specified for EVERY question (no partial specs)
- [ ] Layer timing specified in milliseconds (not vague "immediately" or "delayed")
- [ ] Layer 1 copy is super short (3-8 words, appears instantly)
- [ ] Layer 2 explains specific reason for correctness (not generic praise)
- [ ] Layer 3 names principle explicitly + defines it
- [ ] Layer 4 tells story + connects to learner's context
- [ ] Incorrect answer handling avoids shame language
- [ ] Misconception identification + correction specified for all trap answers
- [ ] Learner customization applied (anxiety adjustments, communication preference, etc.)
- [ ] Timing aligns with dopamine map from Task 2 (same latencies)

### Success Criteria

**Threshold: 9/10 on quality rubric**

| Criteria | Excellent (3) | Acceptable (2) | Poor (1) |
|----------|--------------|----------------|---------|
| **4-Layer Completeness** | All 4 layers for all questions with distinct purposes | Most questions have 4 layers | Some questions missing layers |
| **Timing Precision** | Exact milliseconds specified with learner customization | Timing ranges provided | Vague timing ("soon," "later") |
| **Copy Quality** | Feedback is engaging, specific, and mistake-avoiding | Copy adequate but generic | Copy is vague or shame-inducing |
| **Misconception Handling** | Trap answers identified + specific correction language | Most misconceptions addressed | Generic error handling |
| **Principle Naming** | Layer 3 explicitly names + defines principle | Principle mentioned but vague | No principle extraction |
| **Story Integration** | Layer 4 story is relevant + high-stakes | Story present but weak | No story/context |
| **Learner Customization** | Feedback adjusted for anxiety/motivation/learning style | Some customization present | Generic for all learners |
| **Implementation Readiness** | Spec includes all copy ready to implement | Spec needs minor polish | Spec needs major rework |

---

## Estimated Effort

| Role | Effort | Notes |
|------|--------|-------|
| **Agent** | 80-120 min | Generate 4 layers × N questions + customization |
| **Validation** | 10-15 min | Quick review of tone, timing, educational quality |
| **Total Duration** | 90-135 min | Can be split across 2 sessions if needed |

---

## Integration

### Feeds To

**Workflow:** Quiz Immersivo (dopamine-learning/quiz-immersivo)

**Output Usage:** This is the final deliverable ready for platform implementation
- Front-end engineers: Implement Layer 1-4 rendering + timing
- Copy writers: Use as feedback copy template
- QA: Test timing + story integration

### Depends On

- Task 1: analyze-learner-profile (provides anxiety_level, communication_preference)
- Task 2: map-learning-objectives-to-dopamine (provides feedback_latency, dopamine_signal)
- Task 3: generate-question-bank (provides questions + success criteria)

### Agent Routing

**Primary Agents:** Kapp (feedback architecture), Schultz (dopamine timing), Eyal (habit formation)
**Coordination:** Sequential (Kapp designs, Schultz validates timing, Eyal adds engagement hook)

**Handoff:** Output is implementation-ready (can go directly to front-end)

---

## Background: 4-Layer Feedback Theory

### Why 4 Layers?

Single feedback ("correct/incorrect") creates weak learning signal. But feedback architecture with timing and depth creates progressively stronger encoding:

1. **Layer 1 (immediate):** Confirm learner's action registered (resolve motor/registration uncertainty)
2. **Layer 2 (300-500ms):** Explain why (resolve conceptual uncertainty)
3. **Layer 3 (1-3s):** Abstract principle (uncertainty max → learning max)
4. **Layer 4 (5-15s):** Integrate with life (encode memory + meaning)

Total feedback time: 10-20 seconds. Result: 3-5x stronger retention vs single-layer feedback.

### Timing Science

From Schultz dopamine research:
- **100-300ms:** "Am I on track?" uncertainty resolved = confidence dopamine
- **500-1000ms:** Prediction error window (learner's model meets reality)
- **1-3s:** Principle extraction (abstract from concrete example)
- **5-15s:** Memory integration (connect to autobiographical knowledge)

Longer delays = deeper learning but risk frustration. This task calibrates timing to learner's anxiety/motivation.

---

## Common Pitfalls

### Pitfall 1: Shame Language

❌ WRONG:
```
"❌ Incorrect. How did you get this wrong?"
```

✅ CORRECT:
```
"🔍 Let's explore this together. You chose A, but B is actually correct because..."
```

### Pitfall 2: Same Timing for All Questions

❌ WRONG: All questions use 1s delay for layer 3

✅ CORRECT:
```
Knowledge question: 500ms (faster, learner ready for answer)
Synthesis question: 2500ms (needs thinking time)
```

### Pitfall 3: Layers Aren't Distinct

❌ WRONG:
```
Layer 2: "Correct! Service isolation prevents cascades."
Layer 3: "Correct! Service isolation prevents cascades." (same content!)
```

✅ CORRECT:
```
Layer 2: "Correct! Payment stays independent." (specific to question)
Layer 3: "This exemplifies SERVICE ISOLATION principle." (abstract principle)
Layer 4: "Remember 2AM outage? This prevented that." (narrative integration)
```

### Pitfall 4: Ignoring Anxiety Customization

❌ WRONG: Anxious learner gets 2s delay for layer 2

✅ CORRECT: Anxious learner gets 300ms (needs reassurance faster)

---

## Related Tasks

- **Task 1:** analyze-learner-profile (provides anxiety, communication preference)
- **Task 2:** map-learning-objectives-to-dopamine (provides dopamine timing specs)
- **Task 3:** generate-question-bank (provides questions + success criteria)

---

## Revision History

| Version | Date | Change |
|---------|------|--------|
| 1.0.0 | 2026-02-12 | Initial production release |

