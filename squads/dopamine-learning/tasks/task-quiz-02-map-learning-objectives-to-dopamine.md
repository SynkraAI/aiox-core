# Task: Map Learning Objectives to Dopamine Mechanisms

**Task ID:** dopamine-learning/quiz-02-map-learning-objectives-to-dopamine
**Version:** 1.0.0
**Status:** Production Ready
**Created:** 2026-02-12
**Category:** Quiz Immersivo Workflow
**Total Lines:** 420

---

## Executive Summary

This task translates abstract learning objectives ("understand platform architecture") into concrete dopamine trigger specifications ("prediction error at 1.2s latency when user realizes their mental model was wrong"). This is where neuroscience meets learning design—mapping Schultz's reward prediction error framework onto specific quiz moments.

**Workflow Position:** Phase 2 of Quiz Immersivo workflow
**Input Dependency:** Requires Task 1 (learner profile) completed
**Success Definition:** Dopamine mechanism specified for each learning objective with timing, trigger type, and feedback structure
**Output Quality Gate:** 100% of objectives must map to specific RPE mechanisms (not generic rewards)

---

## Purpose

Learning objectives are about BEHAVIOR, not just knowledge. But dopamine doesn't fire for "understanding"—it fires for prediction errors. This task bridges the gap:

- Learning objective: "Learner understands why product uses this architecture"
- Dopamine mechanism: "Learner predicts one answer → we reveal a counterintuitive fact → prediction error signals at 1s latency"

Without this mapping, Task 3 will generate questions that test knowledge but don't optimize dopamine encoding. This task ensures EVERY question has a specific dopamine mechanism embedded.

---

## Executor Type

**Agent (100%)**

This is pure analytical work. The agent applies Schultz's neuroscience framework to learning design. No human iteration needed unless inputs are unclear.

---

## Inputs

### Required Inputs

```yaml
learning_objectives:
  field: "What should learner be able to do after quiz?"
  format: "list (bullet or numbered)"
  required: true
  example: |
    1. Explain why product uses microservices vs monolith
    2. Predict which service handles specific feature
    3. Troubleshoot basic service connection errors
    4. Design a new feature across 2+ services
  validation: "4-10 objectives, specific behaviors not vague knowledge"
  source: "From workflow input or Task 1"

learner_profile:
  field: "Learner's motivation/ability/constraints"
  format: "YAML (from Task 1 output)"
  required: true
  example: "learner-profiles/pm-acme-profile.yaml"
  validation: "Must include dopamine_architecture section from Task 1"

dopamine_background:
  field: "Understanding of Schultz prediction error framework"
  format: "reference/optional"
  required: false
  example: |
    Schultz identified 3 dopamine mechanisms:
    1. Prediction Error (actual > predicted = positive signal)
    2. Learning Rate (alpha: how fast to update predictions)
    3. Prediction Uncertainty (high uncertainty = stronger signal)
  validation: "Used to calibrate RPE specificity"
```

### Optional Inputs

```yaml
content_domains:
  field: "What domains are being taught?"
  format: "text/optional"
  example: "Technical (software architecture), behavioral (customer empathy)"

previous_dopamine_maps:
  field: "Any dopamine mappings from similar learning?"
  format: "reference/optional"
  example: "Similar onboarding used prediction-error at 1.2s for architecture understanding"
```

---

## Preconditions

Before starting this task:

- [ ] Task 1 completed (learner profile exists with dopamine_architecture section)
- [ ] Learning objectives are specific behaviors, not vague knowledge goals
- [ ] Learner profile includes feedback_latency_required and reward_frequency
- [ ] Agent has access to Schultz dopamine framework (see Background section)

---

## Steps

### Step 1: Parse Learning Objectives into Cognitive Domains (5 min)

**Agent Activity:**
- For each learning objective, classify into cognitive domain:
  - **Knowledge (Bloom L1-2):** Recall facts, understand concepts
  - **Application (Bloom L3):** Apply knowledge to scenarios
  - **Analysis (Bloom L4):** Break down, compare, contrast
  - **Synthesis (Bloom L5):** Create, design, predict
  - **Evaluation (Bloom L6):** Judge, assess, justify
- Map each domain to appropriate dopamine mechanism:
  - Knowledge → Novelty detection (new information surprises)
  - Application → Prediction error (does their model work?)
  - Analysis → Uncertainty resolution (what's the pattern?)
  - Synthesis → Exploration reward (their idea creates value)
  - Evaluation → Mastery signal (they can judge quality)

**Output:** Objective-to-domain mapping with Bloom levels

**Checkpoint:** All objectives classified with cognitive domain

---

### Step 2: Identify Prediction Error Opportunities for Each Objective (8 min)

**Agent Activity:**
- For each objective, ask: "Where could learner's predictions be WRONG in interesting ways?"
- Design prediction opportunities:
  1. **Implicit Prediction:** Learner has unstated model (e.g., "this feature works like X")
  2. **Violation Moment:** Quiz reveals the assumption is wrong (e.g., "actually, it works like Y")
  3. **Error Signal:** Prediction error fires (learner updates mental model)
  4. **Learning:** Learner encodes the new model strongly (RPE makes encoding efficient)

- Examples:
  - Objective: "Understand microservice architecture"
    - Implicit prediction: "Each service is independent" (typical learner assumption)
    - Violation: "Services constantly communicate with each other" (quiz reveals this)
    - RPE timing: 1.0-1.5s after learner realizes their assumption was wrong

  - Objective: "Predict which service handles feature"
    - Implicit prediction: Learner thinks service X handles feature Y
    - Violation: "Actually, services Z and A handle it together"
    - RPE timing: 500-800ms after learner submits answer

**Output:** Prediction-error specification for each objective

**Checkpoint:** RPE opportunity identified for all objectives

---

### Step 3: Specify Dopamine Timing by Latency Sensitivity (8 min)

**Agent Activity:**
- Consult learner profile's feedback_latency_required (from Task 1)
- For each prediction-error opportunity, specify exact timing:
  1. **Immediate Feedback Latency (100-300ms):** For anxious learners or early-stage learning
     - Learner submits answer → system confirms right/wrong fast
     - High uncertainty resolution = strong dopamine signal
     - Use case: "I don't know if I'm on track" → immediate reassurance

  2. **Moderate Latency (500-1000ms):** For building independence/confidence
     - Slight delay creates tension (good for excitement RPE)
     - Learner thinks about their answer while waiting
     - Use case: "Let me reflect on what I did"

  3. **Slow Latency (1-3s):** For advanced learners or mastery building
     - Longer wait increases prediction uncertainty = stronger RPE
     - Learner has time to consider alternatives
     - Use case: "I want to think about this deeply"

  4. **Very Slow Latency (3-10s):** For deep learning/synthesis objectives only
     - Maximum uncertainty = maximum learning signal
     - Only use if learner has high motivation + confidence
     - Use case: "Help me understand the principle, not just the answer"

- Map each objective to latency tier:
  - If learner_profile.anxiety_level > 7: Use immediate latency for first 3 objectives
  - If learner_profile.cognitive_load_capacity < 40min: Use shorter latencies (less wait = less frustration)
  - If learner_profile.quadrant = "high_ability_high_motivation": Use moderate-to-slow latencies (more uncertainty = more learning)

**Output:** Latency specification per objective (in milliseconds)

**Checkpoint:** All objectives have feedback latency specified (e.g., "800-1000ms for prediction error resolution")

---

### Step 4: Map RPE Strength to Learning Rate (7 min)

**Agent Activity:**
- Schultz framework: Learning rate (alpha) determines how strongly prediction error updates mental model
- Alpha ranges: 0.1 (minimal learning) to 0.9 (extreme learning)
- Map each objective to learning strength:
  - **Critical objectives (must learn deeply):** Alpha = 0.7-0.9
    - Strong RPE signal, delayed feedback allows uncertainty buildup
    - Example: "Understand why product uses this architecture"

  - **Important objectives (should learn well):** Alpha = 0.4-0.6
    - Moderate RPE signal, balanced feedback timing
    - Example: "Predict which service handles feature"

  - **Foundational objectives (should be familiar):** Alpha = 0.2-0.3
    - Weaker RPE signal, faster feedback reassurance
    - Example: "Recall service names and basic functions"

**Output:** Learning rate (alpha) specification per objective

**Checkpoint:** Alpha parameter specified for all objectives

---

### Step 5: Specify Prediction Uncertainty Calibration (7 min)

**Agent Activity:**
- Schultz also models dopamine based on PREDICTION UNCERTAINTY (how confident is the prediction?)
- High uncertainty = stronger dopamine signal (more surprising)
- Low uncertainty = weaker dopamine signal (expected outcome)
- Calibrate for each objective:
  1. **High Uncertainty Objectives:** Learner should feel uncertain before feedback
     - Example: "What will happen if service crashes?" (genuine uncertainty)
     - Design: Ask prediction, then reveal consequence
     - Dopamine: Strong (unexpected outcome = high RPE)
     - Use case: Counterintuitive concepts

  2. **Medium Uncertainty Objectives:** Learner somewhat confident but not sure
     - Example: "Which service handles this?" (partly confident from earlier learning)
     - Design: Ask, reveal if correct or misconception addressed
     - Dopamine: Moderate (partial prediction error)
     - Use case: Application of known concepts

  3. **Low Uncertainty Objectives:** Learner should feel confident before feedback
     - Example: "Recall the 3 core services" (after learning)
     - Design: Ask, reveal as correct (confidence boost = dopamine)
     - Dopamine: Moderate (confirmation of prediction = positive RPE)
     - Use case: Mastery/recall objectives

**Output:** Uncertainty calibration per objective (high/medium/low)

**Checkpoint:** Prediction uncertainty specified for all objectives

---

### Step 6: Create Dopamine Mapping Document (5 min)

**Agent Activity:**
- Synthesize all analysis into structured dopamine mapping document with:
  - Learning objective
  - Cognitive domain (Bloom level)
  - Prediction error mechanism (what assumption will be violated?)
  - Feedback latency (milliseconds)
  - Learning rate / alpha (0.1-0.9)
  - Prediction uncertainty (high/medium/low)
  - Dopamine signal type (novelty/prediction-error/uncertainty/mastery)
  - Timing rationale (why this latency for this learner?)

**Output:** Dopamine mapping YAML/JSON

**Checkpoint:** Complete mapping with all 8 fields per objective

---

## Outputs

### Primary Output

**Dopamine Mapping Document**

Format: YAML
Location: `/squads/dopamine-learning/data/dopamine-maps/{{ learner-slug }}-objectives-dopamine-map.yaml`

```yaml
dopamine_mapping:
  learner_id: "pm_acme_001"
  created: "{{ timestamp }}"
  source_objectives: "quiz_input_objectives.txt"

  objectives:
    - objective_id: "obj_001"
      objective: "Explain why product uses microservices vs monolith"
      cognitive_domain: "Knowledge/Understanding (Bloom L2)"

      prediction_error:
        implicit_prediction: "Microservices are independent, don't talk to each other"
        violation_moment: "User learns services communicate constantly for resilience"
        error_type: "violation_of_assumption"

      dopamine_architecture:
        primary_signal: "prediction_error"
        secondary_signal: "novelty_detection"
        feedback_latency_ms: 1200
        latency_rationale: "Learner has moderate anxiety (score 6/10). Not too fast (triggers perfectionism), not too slow (triggers uncertainty anxiety). 1.2s allows reflection without excessive wait."
        learning_rate_alpha: 0.7
        alpha_rationale: "Critical objective—must deeply encode why choice was made. Strong RPE signal needed."
        prediction_uncertainty: "high"
        uncertainty_rationale: "Learner has no prior microservices experience. High uncertainty means high dopamine surprise when revealed."

      question_design_implications:
        - "Ask learner to predict: 'Why did the team choose microservices?'"
        - "Show their prediction on screen (creates commitment)"
        - "Reveal: 'Top reason: Service isolation ensures one failure doesn't cascade'"
        - "At 1.2s: Show checkmark + 'You understand the key tradeoff'"

      risk_factors:
        - "If learner is very anxious, 1.2s might feel too long. Monitor engagement."
        - "If learner has prior architecture knowledge, reduce uncertainty (they'll predict correctly)."

    - objective_id: "obj_002"
      objective: "Predict which service handles specific feature"
      cognitive_domain: "Application/Analysis (Bloom L3-4)"

      prediction_error:
        implicit_prediction: "Feature X is handled by Service A (learner's mental model)"
        violation_moment: "Actually, Feature X involves Services A, C, and E coordinating"
        error_type: "model_incompleteness"

      dopamine_architecture:
        primary_signal: "prediction_error"
        feedback_latency_ms: 700
        latency_rationale: "Learner prefers fast feedback for application-level questions. 700ms keeps them engaged without overthinking."
        learning_rate_alpha: 0.5
        alpha_rationale: "Important but not critical. Learner will build this model through repeated application across multiple questions."
        prediction_uncertainty: "medium"
        uncertainty_rationale: "Learner should be partly confident (can reason about service boundaries) but uncertain (may miss service interactions)."

      question_design_implications:
        - "Show: 'When user submits payment, which service(s) handle it?'"
        - "Give 4 options: A only, A+B, A+C+E, B+D"
        - "At 700ms: Reveal correct answer + explain interaction flow"
        - "Show: 'See how Payment talks to Auth, Cache, and History? That's service coordination.'"

      risk_factors:
        - "Don't make this too hard too early—learner must succeed on first 2 questions or motivation drops."

    # ... additional objectives follow same structure ...

  dopamine_summary:
    total_objectives: 4
    average_feedback_latency_ms: 875
    average_learning_rate_alpha: 0.575
    uncertainty_distribution:
      high: 2
      medium: 1
      low: 1
    dominant_signal_type: "prediction_error"

  learner_customization:
    anxiety_adjustment: "Feedback latencies reduced 100ms for anxious learner vs baseline"
    ability_adjustment: "Learning rates increased 0.2 alpha for high-ability learner"
    motivation_note: "High intrinsic motivation allows longer feedback delays without disengagement"
```

### Secondary Outputs

1. **Dopamine Mechanisms Reference**
   - Format: Markdown
   - Content: Explanation of each dopamine signal type used in this mapping
   - Use: Reference for Task 3 question design

2. **Latency Calibration Rationale**
   - Format: Markdown
   - Content: 100-200 word explanation of why these latencies match this learner
   - Use: Handoff to Task 4 (feedback timing implementation)

3. **Risk Factors & Guardrails**
   - Format: Markdown
   - Content: Specific risks for each objective + mitigation
   - Use: Monitoring during quiz execution

---

## Validation

### Checklist

- [ ] All learning objectives mapped to specific prediction-error mechanisms (not generic dopamine)
- [ ] Each objective has feedback latency specified in milliseconds (not vague "immediate" or "delayed")
- [ ] Learning rate (alpha) specified for each objective (0.1-0.9 range)
- [ ] Prediction uncertainty calibrated to learner's prior knowledge and ability
- [ ] Latency rationale explains why THIS learner needs THIS timing
- [ ] Implicit prediction specified (what will learner assume?)
- [ ] Violation moment specified (how will assumption be challenged?)
- [ ] Dopamine signal type matches cognitive domain (knowledge → novelty, application → prediction-error, etc.)
- [ ] Risk factors identified for each objective
- [ ] No objective uses generic "reward" instead of specific RPE mechanism

### Success Criteria

**Threshold: 9/10 on quality rubric**

| Criteria | Excellent (3) | Acceptable (2) | Poor (1) |
|----------|--------------|----------------|---------|
| **RPE Specificity** | Each objective has explicit prediction that will be violated + error timing | Most objectives specify error type but not all details | Uses template dopamine "prediction error" without object-specific mechanisms |
| **Latency Justification** | Latency chosen based on learner's anxiety/ability/motivation with specific numbers | Latencies reasonable but justification minimal | Latencies arbitrary or same for all objectives |
| **Learner Customization** | Mapping explicitly adjusts for THIS learner vs template baseline | Some customization but not comprehensive | Uses generic dopamine timing for all learner types |
| **Alpha Specification** | Each objective has alpha (0.1-0.9) justified by importance + learner factors | Alpha specified but rationale thin | Alpha generic or not specified |
| **Risk Identification** | 2-3 specific risks per objective with mitigation strategies | Risk factors vague or generic | No risk factors identified |
| **Question Implications** | Mapping translates to specific question design elements (what to ask, when to reveal) | Implications implied but not explicit | Mapping disconnected from question design |

---

## Estimated Effort

| Role | Effort | Notes |
|------|--------|-------|
| **Agent** | 40-50 min | Full analysis, no human iteration |
| **Validation** | 5-10 min | Quick human review of dopamine mappings |
| **Total Duration** | 45-60 min | Single session |

---

## Integration

### Feeds To

**Workflow:** Quiz Immersivo (dopamine-learning/quiz-immersivo)

**Next Task in Sequence:** Task 3 - generate-question-bank
- Uses: Dopamine mapping (feedback latencies, learning rates, RPE mechanisms)
- Produces: Questions with embedded dopamine architecture

### Depends On

- Task 1: analyze-learner-profile (required: learner profile with dopamine_architecture)

### Agent Routing

**Primary Agent:** schultz-dopamine-analyst
**Backup Agent:** fogg-behavior-diagnostician (if behavioral adjustment needed)

**Handoff:** Output ready for Task 3 immediately (no rework needed)

---

## Background: Schultz Prediction Error Framework

### Core Principle

Dopamine fires NOT for rewards, but for PREDICTION ERRORS (actual - predicted).

```
Prediction Error = Actual Reward - Predicted Reward

If actual > predicted = POSITIVE RPE (dopamine fires, learn strongly)
If actual < predicted = NEGATIVE RPE (dopamine drops, learn what NOT to do)
If actual = predicted = NO RPE (no dopamine, learning weak)
```

### In Learning Context

- **Prediction:** What learner expects to happen (based on mental model)
- **Actual:** What actually happens (revealed by quiz)
- **Error:** Mismatch between prediction and reality
- **Dopamine Signal:** Strength of learning signal proportional to magnitude of error

### Example

- Learner predicts: "Microservices are independent"
- Reality: "Microservices talk constantly"
- Error: High (major assumption violated)
- Dopamine: STRONG (they learn this efficiently)

### Latency Sensitivity

RPE timing matters because:
- **Fast feedback (100-300ms):** Used for basic confirmation ("Am I on track?")
- **Moderate feedback (500-1000ms):** Used for uncertainty resolution ("Did I get it right?")
- **Slow feedback (1-3s):** Used for deep learning ("What's the principle?")
- **Very slow feedback (3-10s):** Used for reflection ("Help me synthesize this")

Latency affects signal strength—too slow creates frustration, too fast skips reflection.

---

## Common Pitfalls

### Pitfall 1: Generic Dopamine Rewards

❌ WRONG:
```yaml
dopamine_signal: "positive feedback"
feedback: "Good job!"
```

✅ CORRECT:
```yaml
dopamine_signal: "prediction_error"
implicit_prediction: "Learner thinks service is stateless"
violation_moment: "Revelation that service maintains customer session state"
feedback_latency_ms: 1000
learning_rate_alpha: 0.7
feedback: "You predicted stateless, but here's why services maintain state..."
```

### Pitfall 2: Same Latency for All Objectives

❌ WRONG: All objectives use 500ms feedback

✅ CORRECT:
```yaml
obj_knowledge: 300ms    # Need quick reassurance for recall
obj_application: 700ms  # Needs time to think about their answer
obj_synthesis: 1500ms   # Deep learning needs reflection time
```

### Pitfall 3: Ignoring Learner Customization

❌ WRONG: Anxiety level = 8/10 but still using 2s feedback latency

✅ CORRECT: For anxious learners, reduce latencies 25% (1.5s → 1.1s, 1.0s → 0.75s)

---

## Related Tasks

- **Task 1:** analyze-learner-profile (provides learner dopamine_architecture baseline)
- **Task 3:** generate-question-bank (implements these dopamine mechanisms in questions)
- **Task 4:** specify-feedback-architecture (operationalizes dopamine timing)

---

## Revision History

| Version | Date | Change |
|---------|------|--------|
| 1.0.0 | 2026-02-12 | Initial production release |

