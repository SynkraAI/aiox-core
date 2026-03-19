# Task: Generate Question Bank

**Task ID:** dopamine-learning/quiz-03-generate-question-bank
**Version:** 1.0.0
**Status:** Production Ready
**Created:** 2026-02-12
**Category:** Quiz Immersivo Workflow
**Total Lines:** 450

---

## Executive Summary

This task transforms boring, static questions into immersive, gamified variants that embed dopamine mechanisms discovered in Task 2. For each original question, the task generates 3 variants (narrative-driven, challenge-based, mystery-based) that maintain learning integrity while maximizing engagement. The result is a question bank that feels like a game, not an assessment.

**Workflow Position:** Phase 3 of Quiz Immersivo workflow
**Input Dependency:** Requires Task 1 (learner profile) + Task 2 (dopamine mapping) completed
**Success Definition:** Question bank with 4 variants per original question (original + 3 gamified), all maintaining learning objectives
**Output Quality Gate:** All variants must preserve learning objective while adding narrative/game mechanics**

---

## Purpose

Original questions:
- "What is a microservice?" (boring, no engagement)
- "Which service handles payments?" (functional but lifeless)
- "Design a new service for order tracking" (vague, no scaffolding)

Gamified questions:
- "Your product is growing. One service is becoming a bottleneck. What's the architecture problem?" (narrative context + prediction error)
- "Mystery: Why did the engineers split this feature across 3 services?" (curiosity hook + pattern recognition)
- "Challenge: You're redesigning payments. If this service goes down, who gets hurt?" (consequence-based reasoning)

Each variant preserves the learning objective but wraps it in a game mechanic that fires dopamine signals at optimal timing.

---

## Executor Type

**Agent (100%)**

This is creative + analytical work. The agent applies McGonigal (narrative), Chou (core drives), and Gee (learning principles) to reframe questions. No human iteration needed unless inputs are unclear.

---

## Inputs

### Required Inputs

```yaml
original_questions:
  field: "List of questions from learning objectives"
  format: "list or YAML"
  required: true
  example: |
    Q1: "Explain why product uses microservices vs monolith"
    Q2: "Which service handles customer payments?"
    Q3: "Design a new service for email notifications"
  validation: "4-10 questions, from learning objectives"
  source: "Workflow input or Task 1 learning_objectives"

dopamine_map:
  field: "Dopamine specifications from Task 2"
  format: "YAML (from Task 2 output)"
  required: true
  example: "dopamine-maps/pm-acme-objectives-dopamine-map.yaml"
  validation: "Must include feedback_latency, dopamine_signal, prediction_error specs"

learner_profile:
  field: "Learner traits (motivation, learning style, neurotype)"
  format: "YAML (from Task 1 output)"
  required: true
  example: "learner-profiles/pm-acme-profile.yaml"
  validation: "Must include learning_modality, neurotype, engagement_triggers"

narrative_theme:
  field: "What story/narrative fits the domain?"
  format: "text/optional"
  required: false
  example: |
    Theme: "You're an architect guiding a startup through scaling chaos"
    Tone: "Pragmatic but playful"
    Stakes: "Your decisions determine if company survives hypergrowth"
  validation: "Establishes narrative context for gamified questions"
```

### Optional Inputs

```yaml
gamification_style:
  field: "Preferred game mechanics"
  format: "text/optional"
  example: "Mystery-solving, challenge-progression, narrative-driven"

constraint_language:
  field: "Technical/non-technical audience?"
  format: "text/optional"
  example: "Executive summary level (not engineering details)"
```

---

## Preconditions

Before starting this task:

- [ ] Task 1 completed (learner profile with engagement_triggers exists)
- [ ] Task 2 completed (dopamine map with RPE specifications exists)
- [ ] Original questions are mapped to learning objectives (specific, not vague)
- [ ] Narrative theme determined (if applicable)

---

## Steps

### Step 1: Analyze Original Question Quality (5 min)

**Agent Activity:**
- For each original question, assess:
  1. **Learning Objective:** What does learner need to demonstrate?
  2. **Current Format:** Multiple choice? Free response? Scenario?
  3. **Engagement Level:** Does it feel like a game? (likely: no)
  4. **Dopamine Opportunity:** Where's the prediction error / core drive?
  5. **Scaffolding Level:** Is question clear or ambiguous?

- Identify gaps:
  - What's missing? (narrative context, prediction error, autonomy choice, etc.)
  - What makes it feel "test-like" instead of "game-like"?
  - How can we reframe without changing what's being learned?

**Output:** Original question analysis (gap identification)

**Checkpoint:** All original questions analyzed for dopamine/narrative opportunity

---

### Step 2: Design Narrative Wrapper (7 min)

**Agent Activity:**
- If narrative_theme provided:
  - Establish story context (hero's journey, McGonigal's game frame)
  - Define NPC allies/antagonists
  - Create stakes for each question
- If no narrative provided:
  - Suggest default narrative based on domain:
    - Technical onboarding → "You're the architect"
    - Sales training → "You're building your sales practice"
    - Leadership development → "You're growing a team"
- Design narrative threads that:
  - Connect questions (not isolated)
  - Increase stakes progressively (Q1 low stakes → Q3 high stakes)
  - Create surprise/delight moments (unexpected ally reveals, plot twists)
  - Embed core drives (Autonomy: "What would YOU do?" | Mastery: "Can you solve this?" | Purpose: "This matters because...")

**Output:** Narrative framework with story arcs, NPC cast, stakes progression

**Checkpoint:** Narrative context established for gamification

---

### Step 3: Identify Core Drives Per Question (8 min)

**Agent Activity:**
- For each question, map 3 core drives (Chou's Octalysis):
  1. **Which drive applies?**
     - Autonomy (choice, control)
     - Mastery (challenge, progression)
     - Purpose (mission, meaning)
     - Social (recognition, competition)
     - Unpredictability (surprise, curiosity)
     - Avoidance (fear of loss)
  2. **How to emphasize it?**
     - Autonomy: "You decide: Should we split this service or keep it together?"
     - Mastery: "Can you solve this architecture puzzle?"
     - Purpose: "Your decision determines if we survive the growth crisis"
     - Social: "What would a world-class architect do here?"
     - Unpredictability: "This service does something unexpected..."
     - Avoidance: "If you get this wrong, the system crashes"

- Prioritize drives by learner profile:
  - High achiever (quad 1): Emphasize Mastery + Autonomy
  - Intrinsically motivated: Emphasize Purpose + Autonomy
  - Anxious learner: Emphasize quick wins + clear feedback (less Avoidance)
  - Low motivation: Emphasize Social + Unpredictability

**Output:** Core drive mapping per question

**Checkpoint:** Primary and secondary core drives identified for each question

---

### Step 4: Create Variant 1 - Narrative-Driven (12 min)

**Agent Activity:**
- Transform original question into story-embedded version
- Formula:
  1. **Scene Setting:** Establish context in narrative
  2. **Prediction Hook:** Ask learner to predict/decide based on scenario
  3. **Consequence Frame:** "If you choose X, then..."
  4. **Open Question:** Let learner explain their reasoning

Example:

**Original:** "Why do microservices matter?"

**Narrative Variant:**
```
🎬 SCENE: It's 2AM. The Payment service is down.
   100 customers can't complete orders. Your CEO is in the Slack.

   Question: Why didn't we catch this earlier?

   Here's what happened:
   - With a monolith: If one feature breaks, everything breaks
   - With microservices: One broken service hurts only that function

   YOUR QUESTION: How would microservices have helped us here?

   A) Payment would be isolated, other services stay up
   B) All services would have crashed anyway
   C) We wouldn't need monitoring with microservices

   [After you answer, we'll reveal what happened at similar companies]
```

**Elements:**
- ✅ Scene setting creates investment
- ✅ Personal stake ("your CEO")
- ✅ Prediction (learner guesses before reveal)
- ✅ Consequence framing (this affects the business)
- ✅ Narrative weaving (connects to company story)

**Output:** Narrative variant with scene + prediction hook + consequence frame

**Checkpoint:** Narrative variant preserves learning objective + adds engagement

---

### Step 5: Create Variant 2 - Challenge/Competition-Based (12 min)

**Agent Activity:**
- Transform original question into competitive challenge
- Formula:
  1. **Difficulty Ladder:** What would novice/intermediate/advanced learner attempt?
  2. **Choice:** Let learner choose their difficulty (Autonomy)
  3. **Challenge Frame:** "Can you solve this?" not "Do you know this?"
  4. **Mastery Progression:** Each difficulty reveals deeper principle

Example:

**Original:** "Which service handles customer payments?"

**Challenge Variant:**
```
⚡ CHALLENGE: Service Detective

EASY (1 point):   "Which service processes payments?"
                  → Multiple choice (Service A/B/C/D)

MEDIUM (3 points): "Why does Payment talk to Auth and Vault?"
                  → Choose top 2 reasons from 5 options

HARD (5 points):  "If Card encryption happens in Vault, what happens
                   if Vault goes down? What services are affected?"
                  → Free response with 2-3 minute explanation video

🏆 You chose: HARD
Can you solve it? (This determines your mastery level)
```

**Elements:**
- ✅ Learner chooses difficulty (Autonomy)
- ✅ Progressive complexity (easy → hard)
- ✅ Point/mastery framing (visible progression)
- ✅ Deeper principle at harder levels
- ✅ Uncertainty/challenge appeal ("Can you solve this?")

**Output:** Challenge variant with difficulty ladder + progressive complexity

**Checkpoint:** Challenge variant creates mastery + autonomy drive

---

### Step 6: Create Variant 3 - Mystery/Curiosity-Based (12 min)

**Agent Activity:**
- Transform original question into pattern recognition / mystery solving
- Formula:
  1. **Mystery Hook:** Present puzzling observation
  2. **Clues:** Give 3-4 clues learner must connect
  3. **Prediction:** Learner guesses the pattern/principle
  4. **Reveal:** Show why their reasoning was right/wrong

Example:

**Original:** "Explain microservice architecture choice"

**Mystery Variant:**
```
🔍 MYSTERY: The Architectural Puzzle

Here's what you observe:
- Payment, Orders, and Inventory are in one system
- But Email notifications are completely separate
- And Analytics runs on its own infrastructure
- What's the pattern?

CLUES:
1. Email notifications aren't mission-critical
2. Analytics queries run for hours and spike CPU
3. Payment processes happen 100x per second
4. Inventory updates in real-time during sales

🤔 YOUR QUESTION:
Why would someone architect it this way?

(Think about: speed requirements, failure tolerance, resource usage)
```

**Elements:**
- ✅ Curiosity hook (why would they do THIS?)
- ✅ Pattern recognition (connect the clues)
- ✅ Unpredictability/intrigue drive
- ✅ Learner actively theorizing (not passive)
- ✅ Surprise moment (when pattern clicks)

**Output:** Mystery variant with hooks + clues + pattern recognition frame

**Checkpoint:** Mystery variant activates curiosity/unpredictability drive

---

### Step 7: Create Question Bank YAML (8 min)

**Agent Activity:**
- Synthesize all 4 variants (original + 3 gamified) into structured question bank:
  - Question ID
  - Learning objective (what this teaches)
  - Original question
  - Variant 1 (narrative)
  - Variant 2 (challenge)
  - Variant 3 (mystery)
  - Dopamine mechanism (from Task 2)
  - Core drives activated
  - Feedback timing (from Task 2)
  - Difficulty/scaffolding level
  - Estimated time (how long to answer?)
  - Success criteria (how to score it?)

**Output:** Question bank YAML with all variants

**Checkpoint:** Complete question bank with 4 variants per original question

---

## Outputs

### Primary Output

**Question Bank Document**

Format: YAML
Location: `/squads/dopamine-learning/data/question-banks/{{ learner-slug }}-question-bank.yaml`

```yaml
question_bank:
  learner_id: "pm_acme_001"
  quiz_domain: "Product Onboarding (Microservices Architecture)"
  created: "{{ timestamp }}"
  total_questions: 4
  variants_per_question: 4

  questions:
    - question_id: "q_arch_001"
      learning_objective: "Explain why product uses microservices vs monolith"
      cognitive_domain: "Knowledge/Understanding (Bloom L2)"
      difficulty: "intermediate"

      original_question:
        format: "free_response"
        text: "Why do microservices matter?"
        estimated_time_seconds: 120

      variants:
        - variant_id: "q_arch_001_original"
          variant_type: "original"
          variant_name: "Direct Knowledge Question"
          text: "Why do microservices matter?"
          game_elements: "none"
          estimated_time_seconds: 120

        - variant_id: "q_arch_001_narrative"
          variant_type: "narrative"
          variant_name: "Crisis Scenario"
          game_elements: "scene_setting, personal_stakes, consequence_framing"
          text: |
            🎬 SCENE: It's 2AM. The Payment service is down.
            100 customers can't complete orders. Your CEO is in the Slack.

            Question: Why didn't we catch this earlier?
            [Scene setting + stakes established]

            Here's what happened:
            - With a monolith: If one feature breaks, everything breaks
            - With microservices: One broken service hurts only that function

            YOUR QUESTION: How would microservices have helped us here?

            A) Payment would be isolated, other services stay up
            B) All services would have crashed anyway
            C) We wouldn't need monitoring with microservices
          core_drives:
            - "purpose" # This decision matters for business survival
            - "mastery" # Can learner identify the architectural advantage?
            - "unpredictability" # Unexpected crisis creates urgency
          dopamine_mechanism: "prediction_error"
          dopamine_timing_ms: 1200
          estimated_time_seconds: 180

        - variant_id: "q_arch_001_challenge"
          variant_type: "challenge"
          variant_name: "Difficulty Ladder Challenge"
          game_elements: "difficulty_choice, mastery_progression, points"
          text: |
            ⚡ CHALLENGE: Microservices Architect

            EASY (1 point):
            "In a microservice system, if Payment goes down,
            what happens to the Orders service?"
            → A) Also goes down  B) Stays up but can't charge

            MEDIUM (3 points):
            "Why would a company accept the complexity of microservices
            instead of using one simple system?"
            → Choose 2 reasons from 5 options

            HARD (5 points):
            "Design a hypothetical scenario where microservices save your
            company from total system failure. Explain the before/after."
            → Free response with video explanation

            🏆 You chose: [Learner selects difficulty]
            Can you solve it?
          core_drives:
            - "autonomy" # Choose your difficulty
            - "mastery" # Progressive challenge
            - "unpredictability" # What level will you choose?
          dopamine_mechanism: "mastery_progression"
          dopamine_timing_ms: 900
          estimated_time_seconds: 300

        - variant_id: "q_arch_001_mystery"
          variant_type: "mystery"
          variant_name: "Pattern Recognition Mystery"
          game_elements: "curiosity_hook, clue_gathering, pattern_recognition"
          text: |
            🔍 MYSTERY: Why Design It This Way?

            Observations:
            - Payment, Orders, Inventory are tightly coupled
            - Email notifications are completely separate
            - Analytics runs on its own infrastructure
            - What's the pattern?

            CLUES:
            1. Email can be delayed 30 minutes without business impact
            2. Analytics queries run for 6 hours and spike CPU 90%
            3. Payment processes 500/sec during peak hours
            4. System failures must not crash payments

            🤔 Your question: Why would someone architect it this way?

            [Hint: Think about speed, reliability, and resource needs]
          core_drives:
            - "unpredictability" # Puzzle to solve
            - "mastery" # Can you see the pattern?
            - "autonomy" # You discover the answer
          dopamine_mechanism: "novelty_detection"
          dopamine_timing_ms: 1500
          estimated_time_seconds: 240

      success_criteria:
        original: "Learner correctly explains 2+ reasons why microservices matter vs monolith"
        narrative: "Learner chooses correct answer (Payment isolation prevents cascade)"
        challenge: "Learner selects difficulty and completes explanation at that level"
        mystery: "Learner identifies 2+ factors in architectural decision (speed, reliability, resource isolation)"

      assessment_rubric:
        poor_response: "Mentions only 1 reason or misunderstands tradeoffs"
        acceptable_response: "Identifies 2 reasons (e.g., isolation + scalability)"
        excellent_response: "Identifies 3+ reasons with concrete examples (isolation prevents cascades, services scale independently, failures are isolated)"

      learner_customization:
        for_anxious_learner: "Use narrative variant (provides context comfort) + shorter latency (1000ms instead of 1200ms)"
        for_high_ability: "Use mystery variant (requires deeper reasoning)"
        for_low_motivation: "Use challenge variant (points + autonomy boost engagement)"

    # ... additional questions follow same structure ...

  question_bank_summary:
    total_variants: 16  # 4 questions × 4 variants each
    variant_distribution:
      original: 4
      narrative: 4
      challenge: 4
      mystery: 4
    estimated_total_quiz_time: 1200  # 20 minutes
    core_drive_coverage:
      autonomy: 12
      mastery: 14
      purpose: 10
      social: 2
      unpredictability: 14
    dopamine_mechanism_distribution:
      prediction_error: 8
      mastery_progression: 4
      novelty_detection: 4

  randomization_rules:
    variant_selection: "For each learner, randomly select 1 variant per question (balanced distribution)"
    question_order: "Randomize question order, but keep difficulty progression (easy first 2, harder last 2)"
    difficulty_progression: "Never show hard variant before learner succeeds on medium variant"
```

### Secondary Outputs

1. **Variant Comparison Document**
   - Format: Markdown table
   - Content: Side-by-side comparison of all 4 variants for quick reference
   - Use: Implementation guide for question rendering

2. **Gamification Elements Guide**
   - Format: Markdown
   - Content: How each game element (scene setting, clues, point system) maps to engagement
   - Use: Designer reference for question implementation

3. **Difficulty & Scaffolding Guide**
   - Format: Markdown
   - Content: Scaffolding levels per variant (original = medium, narrative = low, challenge = variable, mystery = high)
   - Use: Determining if pre-work needed

---

## Validation

### Checklist

- [ ] All original learning objectives preserved in ALL 4 variants (objective doesn't change, only framing)
- [ ] Each question has 4 variants (original + narrative + challenge + mystery)
- [ ] Narrative variant creates narrative context without adding cognitive load
- [ ] Challenge variant includes autonomy choice (easy/medium/hard) + visible progression
- [ ] Mystery variant includes curiosity hook + clue gathering + pattern recognition
- [ ] All variants specify core drives activated (not generic "engagement")
- [ ] All variants map to dopamine timing from Task 2
- [ ] Success criteria are measurable and objective (not vague)
- [ ] Learner customization guidance provided (anxious learners get X variant, etc.)
- [ ] Question bank specifies randomization rules (prevents learner gaming the system)

### Success Criteria

**Threshold: 9/10 on quality rubric**

| Criteria | Excellent (3) | Acceptable (2) | Poor (1) |
|----------|--------------|----------------|---------|
| **Learning Preservation** | All 4 variants test the same objective, just framed differently | 3/4 variants preserve objective | Variants test different concepts |
| **Narrative Embedding** | Narrative variant feels naturally integrated, not forced | Narrative present but feels tacked on | No real narrative, just added words |
| **Challenge Autonomy** | Challenge variant lets learner choose difficulty meaningfully (not just cosmetic) | Difficulty choice exists but limited | No genuine difficulty choice |
| **Mystery Ingenuity** | Mystery hooks curiosity naturally (learner wants to solve it) | Mystery present but forced | Mystery doesn't create genuine interest |
| **Dopamine Specificity** | All variants implement exact dopamine timing from Task 2 | Timing loosely followed | Timing ignored |
| **Core Drive Match** | Core drives match learner profile (high achiever gets Mastery/Autonomy, etc.) | Core drives identified but not matched to learner | Generic drives for all learners |
| **Game Feel** | Questions genuinely feel like game challenges, not assessments | Gamification present but assessment-like | Feels like test, not game |
| **Success Criteria** | Grading rubric is objective and implementable | Rubric somewhat vague | Rubric is subjective/unmeasurable |

---

## Estimated Effort

| Role | Effort | Notes |
|------|--------|-------|
| **Agent** | 60-90 min | Creative generation of 3 variants × N questions |
| **Validation** | 10-15 min | Quick human review of variant quality |
| **Total Duration** | 70-105 min | Single session, may split variant generation |

---

## Integration

### Feeds To

**Workflow:** Quiz Immersivo (dopamine-learning/quiz-immersivo)

**Next Task in Sequence:** Task 4 - specify-feedback-architecture
- Uses: Question bank variants + dopamine timing
- Produces: Complete feedback copy + timing spec

### Depends On

- Task 1: analyze-learner-profile (provides learning_modality, engagement_triggers, neurotype)
- Task 2: map-learning-objectives-to-dopamine (provides dopamine_timing, learning_rates, RPE mechanics)

### Agent Routing

**Primary Agents:** McGonigal (narrative frames), Chou (core drives), Gee (learning principles)
**Coordination:** All 3 agents work in parallel on different variant types

**Handoff:** Output ready for Task 4 immediately (no rework needed)

---

## Game Element Reference

### Core Drive Activators (Chou's Octalysis)

- **Autonomy:** Choice (question order, difficulty, learning path)
- **Mastery:** Progressive challenge (easy → medium → hard), skill unlocking, mastery points
- **Purpose:** Mission framing, connecting to larger goal, meaningful stakes
- **Social:** Peer comparison, community recognition, expert validation
- **Unpredictability:** Surprise reveals, plot twists, random rewards, curiosity hooks
- **Avoidance:** Fear of loss (failing consequences), time pressure, danger
- **Scarcity:** Limited attempts, time constraints, exclusive content
- **Ownership:** Progress tracking, resource accumulation, customization

### Gamification Techniques

**For Narrative Variants:**
- Scene setting + NPC characters + stakes
- Consequence framing ("if you choose X, then Y happens")
- Personal investment ("your CEO is watching")

**For Challenge Variants:**
- Difficulty choice + visible progression
- Points/mastery scoring system
- Progressive unlock (complete easy → access medium → access hard)

**For Mystery Variants:**
- Curiosity hooks (unsolved puzzles)
- Clue gathering (connect the dots)
- Pattern recognition (learner discovers principle)
- Surprise reveals (when pattern clicks)

---

## Common Pitfalls

### Pitfall 1: Variants Test Different Objectives

❌ WRONG:
```
Original: "What's a microservice?"
Narrative: "Design a microservice system from scratch"
(These teach different things!)
```

✅ CORRECT:
```
Original: "What's a microservice?"
Narrative: "Explain why companies choose microservices"
(Same objective: understanding concept, different framing)
```

### Pitfall 2: Narrative Adds Cognitive Load

❌ WRONG: Narrative variant is 500+ words of backstory

✅ CORRECT: Narrative variant establishes scene in 50-100 words, focuses question

### Pitfall 3: Challenge Difficulty Choice is Cosmetic

❌ WRONG: Easy/Medium/Hard all test exact same thing, just labeled differently

✅ CORRECT:
```
Easy: "Multiple choice - which service?"
Medium: "Explain why this service handles this"
Hard: "Design the service and justify your architecture"
```

---

## Related Tasks

- **Task 1:** analyze-learner-profile (provides neurotype, engagement triggers)
- **Task 2:** map-learning-objectives-to-dopamine (provides dopamine timing, RPE specs)
- **Task 4:** specify-feedback-architecture (implements feedback for these variants)

---

## Revision History

| Version | Date | Change |
|---------|------|--------|
| 1.0.0 | 2026-02-12 | Initial production release |

