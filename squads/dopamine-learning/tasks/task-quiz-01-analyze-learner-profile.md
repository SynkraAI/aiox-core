# Task: Analyze Learner Profile

**Task ID:** dopamine-learning/quiz-01-analyze-learner-profile
**Version:** 1.0.0
**Status:** Production Ready
**Created:** 2026-02-12
**Category:** Quiz Immersivo Workflow
**Total Lines:** 380

---

## Executive Summary

This is an atomic task that analyzes the learner's current state (skills, motivation, learning style, constraints) and produces a structured profile that becomes the foundation for all downstream dopamine-learning design decisions. This task executes ONCE per quiz/onboarding project, typically taking 30-45 minutes.

**Workflow Position:** Entry point to Quiz Immersivo workflow
**Success Definition:** Complete learner profile with quantified motivation/ability/skill scores
**Output Quality Gate:** Profile must include 8+ specific learner traits, not generic statements

---

## Purpose

Establish comprehensive clarity about WHO is learning, WHY they're learning, and WHAT constraints they face. A poorly understood learner profile leads to designs that miss motivation drivers, misjudge ability levels, and waste dopamine signals on irrelevant triggers.

This task prevents 10+ hours of rework downstream by getting learner psychology right FIRST.

---

## Executor Type

**Hybrid (40% Agent, 60% Human)**

- **Agent Role:** Conducts diagnostic framework and suggests profile structure
- **Human Role:** Provides learner context, validates motivation assessment, approves final profile

---

## Inputs

### Required Inputs

```yaml
learner_context:
  field: "Who is this learner?"
  format: "text/paragraph"
  required: true
  example: |
    New product manager at SaaS startup. 3 years product experience,
    first time at fast-growth company. Needs to master our platform
    in 1 week before first customer meeting. High pressure, motivated
    but anxious about mistakes.
  validation: "Must include role, seniority, context, and constraints"

learning_objectives:
  field: "What must they learn?"
  format: "text (bullet list or paragraph)"
  required: true
  example: |
    - Understand platform architecture (technical concepts)
    - Complete 3 core workflows (hands-on skills)
    - Explain product value to customers (communication)
  validation: "3-8 objectives, specific behaviors not vague knowledge"

previous_performance:
  field: "Any prior learning/performance data?"
  format: "text/optional"
  required: false
  example: "Passed onboarding for competitors' platforms. Scored 85% on sales training."
  validation: "Relevant performance data only"

constraints:
  field: "What limits this learner's learning?"
  format: "text (bullet list)"
  required: true
  example: |
    - Only 1 hour/day available for next week
    - High anxiety under pressure (needs encouragement)
    - Prefers visual/hands-on learning over reading
    - Has ADHD (needs frequent breaks, gamified progression)
  validation: "Time, cognitive, emotional, and learning style constraints"

motivation_context:
  field: "What drives/blocks their motivation?"
  format: "text/paragraph"
  required: false
  example: |
    Highly motivated by proving competence and peer recognition.
    Blocked by perfectionism and fear of looking incompetent in front
    of leaders. Responds well to quick wins and progress visibility.
  validation: "Explicit drives and blockers"
```

### Optional Inputs

```yaml
learning_history:
  field: "How have they learned similar content before?"
  format: "text/optional"
  example: "Took 2-week bootcamp for product management. Self-taught design tools."

communication_preferences:
  field: "How do they prefer to receive feedback?"
  format: "text/optional"
  example: "Prefers written feedback with specific examples. Anxious about real-time corrections."

peer_context:
  field: "Are they learning with others or alone?"
  format: "text/optional"
  example: "Learning alongside 4 other new PMs. Competitive but collaborative."
```

---

## Preconditions

Before starting this task:

- [ ] Quiz/onboarding project is defined (what's being taught exists)
- [ ] User has access to learner context (can describe them in detail)
- [ ] Learning objectives exist (even if rough)
- [ ] No previous learner profile exists for this person/cohort

---

## Steps

### Step 1: Intake Learner Context (5 min)

**Agent Activity:**
- Present structured intake form to human based on Required Inputs above
- Ask clarifying questions if inputs are vague (e.g., "When you say 'anxious,' can you give a specific example?")
- Capture all context in markdown format

**Human Activity:**
- Fill in learner context form with as much detail as possible
- Provide specific examples, not generalizations

**Checkpoint:** Learner context document complete with all 5 required fields

---

### Step 2: Analyze Motivation Using Fogg Framework (8 min)

**Agent Activity:**
- Map learner motivation across Fogg's B=MAP model:
  - **Behavior:** What specific learning behaviors must happen? (attempt question, struggle, persist)
  - **Motivation:** What drives engagement? (intrinsic: mastery, autonomy, purpose | extrinsic: deadline, peer pressure, reward)
  - **Ability:** Can they do the learning behavior? (time available, cognitive capacity, prerequisite skills)
  - **Prompt:** What will trigger learning attempt? (deadline, peer seeing them, curiosity)
- Quantify motivation on 1-10 scale with evidence:
  - Intrinsic motivation: How much does learner WANT to learn? (1=coerced, 10=passionate)
  - Deadline pressure: How urgent is learning? (1=optional, 10=immediate job impact)
  - Confidence level: How likely do they think they'll succeed? (1=I'll fail, 10=I'll ace it)
  - Fear/anxiety level: How anxious are they? (1=relaxed, 10=panicked)

**Output:** Motivation diagnostic with 4 quantified scores + evidence

**Checkpoint:** Motivation scores calculated with specific examples from learner context

---

### Step 3: Assess Learning Ability & Constraints (8 min)

**Agent Activity:**
- Map learner ability across 4 dimensions:
  1. **Cognitive Load Capacity:** How much information can they process per session? (low=5 min focus, high=90 min deep work)
  2. **Time Availability:** How much time/week do they have? (low=30 min/week, high=10+ hrs/week)
  3. **Prerequisite Skills:** What foundational knowledge do they have? (0%=novice, 100%=expert)
  4. **Learning Style Preference:** How do they learn best? (visual/kinesthetic/auditory/reading)
- Identify ability gaps: "They have X% prerequisite skills but need X% for core concepts"
- Identify scaffolding needs: "Needs 15% more intro-level content before main challenge"

**Output:** Ability assessment with specific numbers and scaffolding requirements

**Checkpoint:** Ability profile complete with all 4 dimensions + scaffolding gaps identified

---

### Step 4: Map Learning Style & Neurotype (8 min)

**Agent Activity:**
- Based on constraints/communication preferences, identify:
  1. **Primary Learning Modality:** Visual (infographics, diagrams), Kinesthetic (hands-on), Auditory (explanation/video), Reading (text)
  2. **Neurotype Considerations:** ADHD (needs breaks/gamification), anxiety (needs progress visibility), high-achievement (likes competition/mastery), perfectionist (needs permission to fail)
  3. **Engagement Triggers:** What makes THIS learner want to continue? (progress bars, peer comparison, expert feedback, autonomy choice, mastery moments)
  4. **Disengagement Triggers:** What makes them want to quit? (ambiguity, being wrong in public, too-long sessions, unclear progress)

**Output:** Learning style profile with specific triggers and guardrails

**Checkpoint:** Neurotype and learning modality identified with engagement/disengagement triggers

---

### Step 5: Synthesize Learner Motivation-Ability Quadrant (5 min)

**Agent Activity:**
- Plot learner on 2D matrix:
  - **X-axis:** Ability (low ← → high)
  - **Y-axis:** Motivation (low ← → high)
- This determines quiz difficulty strategy:
  - **Quadrant 1 (High ability + High motivation):** Design challenge-focused quiz, assume independent learning
  - **Quadrant 2 (Low ability + High motivation):** Design scaffolded quiz, assume beginner needs step-by-step
  - **Quadrant 3 (Low ability + Low motivation):** Design gamified quiz, use extrinsic rewards + frequent wins
  - **Quadrant 4 (High ability + Low motivation):** Design autonomy-focused quiz, let them choose path + self-paced

**Output:** Quadrant position + strategic implications for quiz design

**Checkpoint:** Motivation-Ability quadrant identified with design strategy

---

### Step 6: Identify Dopamine Triggers & Blockers (7 min)

**Agent Activity:**
- Based on learner profile, identify:
  1. **Primary Dopamine Triggers (what fires dopamine for THIS learner?):**
     - Mastery/competence signals (progress bars, skill unlock messages)
     - Autonomy triggers (choice, control over learning path)
     - Purpose/meaning (connection to larger goal)
     - Social signals (peer recognition, expert validation)
     - Surprise/novelty (unexpected rewards, plot twists)
  2. **Dopamine Blockers (what prevents dopamine signal?):**
     - Unclear progress (ambiguous feedback)
     - Loss of autonomy (forced path)
     - Repeated failure (frustration without recovery)
     - Delayed feedback (uncertainty)
     - Comparison anxiety (being compared to faster learners)
  3. **Feedback Latency Needs:** How fast must feedback arrive? (Anxious learners need 100-300ms, confident learners can wait 1-3s)
  4. **Reward Timing Sensitivity:** How often should they see wins? (ADHD/low motivation: every 2-3 min, high motivation: every 10-15 min)

**Output:** Dopamine trigger/blocker map with specific latency requirements

**Checkpoint:** Dopamine architecture specifications identified

---

### Step 7: Create Learner Profile Document (3 min)

**Agent Activity:**
- Synthesize all analysis into single learner profile YAML/JSON document with sections:
  - **Learner Identity:** Name/role/context
  - **Motivation Profile:** Intrinsic/extrinsic scores (1-10), confidence level, fear level
  - **Ability Profile:** Cognitive load capacity, time availability, prerequisite skills %, learning style
  - **Psychological Profile:** Neurotype, engagement triggers, disengagement triggers
  - **Dopamine Architecture:** Primary triggers, blockers, feedback latency, reward timing
  - **Design Strategy:** Recommended quiz approach based on quadrant position
  - **Constraints & Guardrails:** What NOT to do (e.g., "Don't use timed pressure - creates anxiety")

**Output:** Learner Profile document (YAML or JSON, 400-600 words equivalent)

**Checkpoint:** Profile document complete with all 6 sections

---

## Outputs

### Primary Output

**Learner Profile Document**

Format: YAML or JSON
Location: `/squads/dopamine-learning/data/learner-profiles/{learner-slug}-profile.yaml`

```yaml
learner_profile:
  id: "learner_{{ slug }}"
  name: "{{ learner name }}"
  role: "{{ job title }}"
  created: "{{ timestamp }}"

  motivation:
    intrinsic_score: 7  # 1-10, how much do they WANT to learn
    extrinsic_score: 8  # 1-10, how much external pressure
    confidence_level: 5  # 1-10, do they think they'll succeed
    anxiety_level: 6    # 1-10, how anxious are they
    primary_drive: "mastery"  # intrinsic or extrinsic
    motivation_blockers:
      - "Perfectionism: gets stuck on getting it right"
      - "Fear of looking incompetent in front of leadership"

  ability:
    cognitive_load_capacity: "60 min focus sessions"
    time_available: "1 hour/day for 5 days"
    prerequisite_skills: 0.6  # 0-1, 60% have needed foundation
    learning_modality: "visual/kinesthetic"
    preferred_pace: "fast" # fast/moderate/slow

  neurotype:
    neurodivergence: "ADHD-adjacent (gets bored with passive content)"
    learning_preference: "hands-on, immediate feedback"
    stress_response: "becomes anxious under time pressure"

  dopamine_architecture:
    primary_triggers:
      - "Progress visibility (needs to see advancement)"
      - "Quick wins (first 5 minutes must feel achievable)"
      - "Autonomy (choice of learning path)"
    dopamine_blockers:
      - "Ambiguous feedback (needs clear right/wrong)"
      - "Long delays (anxiety increases with uncertainty)"
      - "Comparison to peers (triggers perfectionism)"
    feedback_latency_required: "300-500ms"
    reward_frequency: "every 2-3 questions"

  design_strategy:
    quadrant: "high_ability_high_motivation"
    recommended_approach: "challenge-focused, autonomy-centered"
    quiz_difficulty: "intermediate-to-advanced"
    scaffolding_level: "low (minimal hand-holding)"

  guardrails:
    - "DO: Show progress bars, mastery progression"
    - "DO: Give autonomy in question order/difficulty"
    - "DO: Provide fast feedback (< 500ms)"
    - "DON'T: Use timed pressure or countdown timers"
    - "DON'T: Compare to other learners"
    - "DON'T: Use only passive reading (needs hands-on)"
```

### Secondary Outputs

1. **Motivation Diagnostic Document**
   - Format: Markdown
   - Content: Detailed Fogg B=MAP analysis with evidence
   - Use: Understanding motivation drivers for feedback copy

2. **Dopamine Trigger Specification**
   - Format: YAML
   - Content: Exact trigger timing, latency, reward frequency
   - Use: Foundation for Task 2 (map-learning-objectives-to-dopamine)

3. **Design Strategy Memo**
   - Format: Markdown, 300 words
   - Content: Recommendations for quiz design based on profile
   - Use: Reference for all downstream designers

---

## Validation

### Checklist

- [ ] Learner context includes role, seniority, constraints, and motivation drivers (not generic)
- [ ] Motivation quantified on 1-10 scales with specific evidence from learner context
- [ ] Ability assessment includes all 4 dimensions (cognitive, time, skills, style)
- [ ] Learning modality identified with specific engagement/disengagement triggers
- [ ] Motivation-Ability quadrant position determined
- [ ] Dopamine triggers/blockers mapped to THIS learner (not generic)
- [ ] Feedback latency requirements specified in milliseconds
- [ ] Profile document includes all 6 sections (identity, motivation, ability, psychology, dopamine, strategy)
- [ ] Guardrails specify what NOT to do (prevents downstream misuse)
- [ ] No vague statements ("good communicator" → BAD; "prefers written feedback with examples" → GOOD)

### Success Criteria

**Threshold: 9/10 on quality rubric**

| Criteria | Excellent (3) | Acceptable (2) | Poor (1) |
|----------|--------------|----------------|---------|
| **Learner specificity** | Profile describes this specific person, not a generic cohort | Mostly specific with 1-2 generic statements | Uses personas/generics instead of actual learner data |
| **Quantification** | All motivation/ability scores include 1-3 supporting examples | Scores provided with minimal evidence | Scores with no justification |
| **Dopamine applicability** | Triggers/blockers are THIS learner's actual drivers (not generic) | Mostly relevant with minor generic elements | Uses template dopamine list unchanged |
| **Design implication clarity** | Each profile element connects to specific design decision | Some connections implied but not explicit | Profile seems unrelated to quiz design |
| **Actionability** | Downstream designers can make specific decisions from profile | Downstream designers need clarification | Profile doesn't guide design decisions |
| **Guardrail specificity** | Guardrails say "DO NOT use timed pressure (creates anxiety)" not just "BE supportive" | Guardrails are somewhat vague | Guardrails are generic platitudes |

---

## Estimated Effort

| Role | Effort | Notes |
|------|--------|-------|
| **Agent (Hybrid component)** | 12 min | Framework application, question generation, synthesis |
| **Human** | 20-30 min | Learner context interview, validation, approval |
| **Total Duration** | 30-45 min | Single session, no async handoffs |
| **Human + Agent** | ~35 min | Concurrent phases (agent can prepare while human reflects) |

---

## Integration

### Feeds To

**Workflow:** Quiz Immersivo (dopamine-learning/quiz-immersivo)

**Next Task in Sequence:** Task 2 - map-learning-objectives-to-dopamine
- Uses: Learner Profile, Dopamine Architecture
- Produces: Dopamine mapping for each objective

### Depends On

- None (this is entry point)

### Agent Routing

**Primary Agent:** dopamine-learning-chief (intake + synthesis)
**Secondary Agents:** schultz-dopamine-analyst (validate dopamine components)

**No handoff required** - output is ready for Task 2 immediately

---

## Quality Threshold

**Pass/Fail Gate:** Profile must score >= 9/10 on checklist above

If < 9/10:
1. Identify which criteria failed
2. Gather missing information
3. Re-run Step 2-4 with clarified inputs
4. Re-validate

**Common Failure Reasons:**
- Learner context too generic ("new user" instead of specific role/motivation)
- Motivation scores without evidence ("I think they're motivated")
- Dopamine triggers are template, not personalized
- Missing guardrails section
- Design strategy not connected to profile

---

## Related Tasks

- **Task 2:** map-learning-objectives-to-dopamine (uses this profile + objectives)
- **Task 3:** generate-question-bank (uses learner profile for tone/difficulty)
- **Task 4:** specify-feedback-architecture (uses dopamine triggers from profile)

---

## Notes for Executor

### If Learner is High-Anxiety Type

- Emphasize quick wins in first 3 questions
- Reduce feedback latency to < 300ms
- Use "you're on track" language liberally
- DO NOT use timed pressure or visible "mistakes" counter

### If Learner is High-Ability Type

- Assume less scaffolding needed
- Increase autonomy (let them choose question difficulty)
- Use advanced concepts without over-explanation
- Emphasize challenge and mastery progression

### If Learner is Low-Motivation Type

- Flag for Task 3: will need extrinsic rewards + gamification
- Increase frequency of wins (every 2 questions)
- Connect each question to learner's personal goal
- Use peer recognition if available

### If Time-Constrained Learner

- Reduce question bank size
- Increase feedback density (more learning per question)
- Avoid multi-step questions (keep each atomic)
- Flag time constraint for Task 4 feedback architecture

---

## Revision History

| Version | Date | Change |
|---------|------|--------|
| 1.0.0 | 2026-02-12 | Initial production release |

