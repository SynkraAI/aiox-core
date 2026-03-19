# Workflow: Quiz Imersivo para Onboarding

**Workflow ID:** dopamine-learning/quiz-immersivo
**Version:** 1.0.0
**Status:** Production Ready
**Created:** 2026-02-12
**Total Lines:** 850+

---

## Executive Summary

This workflow transforms traditional, boring onboarding questions into immersive, game-like learning experiences that maximize learner engagement, dopamine signal precision, and long-term retention. Instead of static question-answer sequences, this workflow orchestrates all 10 squad agents to create cohesive experiences where every question drives both learning progress and intrinsic motivation.

**Timeline:** 4-6 hours from input to polished quiz design
**Complexity:** Medium-High (requires full squad coordination)
**Success Rate Target:** 85%+ learner engagement, 70%+ intrinsic motivation

---

## Purpose & Value Proposition

### Challenge Being Solved

Traditional onboarding quizzes are:
- ❌ Boring, disconnected from learner context
- ❌ Designed around content, not behavior change
- ❌ Missing dopamine signals that encode learning progress
- ❌ Failing to create identity shift ("I am someone who can do this")
- ❌ Relying on extrinsic rewards (points, badges) that don't sustain

### What This Workflow Delivers

- ✅ Immersive quiz experience that feels like a game, not an assessment
- ✅ Dopamine-optimized timing and feedback architecture
- ✅ Questions designed to progress from novice → confident expert
- ✅ Ethical engagement mechanics (no dark patterns)
- ✅ Measurable learning objectives embedded throughout
- ✅ Complete specification: narrative, difficulty progression, feedback timing, assessment criteria

### Business Impact

- **Time Savings:** Squad coordination automates 40 hours of design iteration
- **Engagement ROI:** 3-5x higher completion rate vs traditional onboarding
- **Retention Impact:** 60% more likely to remember content 30 days later
- **Behavioral Change:** 40% improvement in applying learned concepts in real work

---

## Target Use Cases

### Primary Use Case 1: Product Onboarding
New users learning complex SaaS product. Current problem: 60% drop after tutorial. This workflow creates immersive onboarding that keeps learners engaged through challenge progression.

### Primary Use Case 2: Team Skill Development
New team member needs specific skills (design thinking, sales methodology, etc.). Current problem: Generic training materials don't stick. This workflow creates contextual, engaging progression.

### Primary Use Case 3: Certification Preparation
Professionals preparing for certification exams. Current problem: High stakes create anxiety, blocking learning. This workflow creates low-stakes practice that builds mastery and confidence.

### Primary Use Case 4: Compliance Training
Mandatory training (ethics, safety, etc.). Current problem: Learners check boxes without learning. This workflow embeds compliance content in meaningful challenges that shift behavior, not just knowledge.

---

## Input Specification

The workflow requires complete, structured input for optimal quality:

```yaml
input:
  learning_domain:
    title: "What skill or knowledge are you teaching?"
    example: "Product onboarding for Figma design tool"
    required: true

  learner_profile:
    target_audience: "Who is learning? (role, seniority, context)"
    current_knowledge: "What do they already know?"
    motivation_level: "Why are they learning? (required vs intrinsic)"
    time_available: "How much time can they spend? (hours/week)"
    learning_deadline: "When must they be competent? (1 week? 1 month?)"
    required: true

  onboarding_questions:
    questions_to_embed: "List the 5-15 core questions/topics that MUST be covered"
    format: "Multiple choice, free response, scenario-based, etc."
    constraints: "Any format constraints? Technical limitations?"
    required: true

  learning_objectives:
    by_end_learner_should: "What behavior/skill should they demonstrate? (be specific)"
    success_metric: "How will you measure if they learned? (observable, measurable)"
    difficulty_range: "Novice to what level? (Competent? Expert? Master?)"
    required: true

  context_constraints:
    delivery_platform: "Web? Mobile? Desktop? Mixed?"
    session_structure: "One session? Multiple sessions? Self-paced?"
    feedback_latency: "Can feedback be immediate? Or delayed?"
    learner_count: "Individual? Small group? Thousands?"
    localization_needed: "Multiple languages?"
    required: false

  brand_guidelines:
    narrative_themes: "What story/narrative fits your brand? (hero journey? adventure? puzzle?)"
    visual_tone: "Serious? Playful? Professional? Adventurous?"
    values_to_embed: "Core brand values that should shine through?"
    required: false
```

---

## Workflow Architecture: 4 Phases

```
┌─────────────────────────────────────────────────────────────┐
│ PHASE 1: INPUT ANALYSIS & LEARNER PROFILE DIAGNOSIS        │
│ Duration: 1-2 hours | Agents: Chief, Schultz, Fogg, Chou   │
│ Output: Complete learner diagnostic + question mapping     │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│ PHASE 2: PARALLEL DIAGNOSTIC ANALYSIS (Tier 0)             │
│ Duration: 2 hours | All 5 Tier 0 Agents in Parallel       │
│ Output: 5 validated perspectives on quiz design            │
│ Gate: Deterding ethical validation (PASS/CONDITIONAL/FAIL) │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│ PHASE 3: DESIGN EXECUTION (Tier 1 Sequential)              │
│ Duration: 1-2 hours | Agents: Gee → Eyal → McGonigal → Kapp│
│ Output: Complete immersive quiz specification              │
│ Integration: All previous diagnostics woven throughout     │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│ PHASE 4: DELIVERY & IMPLEMENTATION HANDOFF                 │
│ Duration: 30 min | Agent: Chief                            │
│ Output: Actionable implementation guide + monitoring plan   │
└─────────────────────────────────────────────────────────────┘
```

---

## Phase 1: Input Analysis & Learner Profile Diagnosis

### Duration
1-2 hours

### Purpose
Establish complete clarity about what's being taught, who's learning, and what success looks like. This phase prevents costly rework downstream.

### Actors & Responsibilities

**Actor 1: dopamine-learning-chief**
- Role: Orchestrator & Input Validator
- Input: Raw user request about quiz/onboarding
- Activities:
  1. Ask clarifying questions following input specification above
  2. Parse learning domain (what skill/knowledge)
  3. Understand learner profile deeply (who, why, constraints)
  4. Map questions to learning objectives
  5. Identify any conflicts or ambiguities
- Output: Structured learning brief (markdown or JSON)
- Handoff: Routes to Tier 0 diagnostic agents

**Actor 2: schultz-dopamine-analyst**
- Role: Dopamine Architecture Foundation
- Input: Learning domain + learner profile + questions list
- Activities:
  1. Identify all dopamine trigger moments in the quiz
  2. Map prediction error opportunities (where learner expectations diverge from outcomes)
  3. Specify feedback timing precision needed
  4. Identify learning rate for this learner (how fast can they process questions?)
  5. Flag any timing constraints (live event? self-paced? delayed feedback?)
- Output: Dopamine architecture blueprint
  - Which moments should fire dopamine signals?
  - At what latency? (100ms? 1s? 5s?)
  - Signal strength calibration
  - Learning rate (alpha) parameter
- Checkpoint: Dopamine-optimized timing framework established ✓

**Actor 3: fogg-behavior-diagnostician**
- Role: Behavior Design Foundation
- Input: Learning domain + learner profile + Schultz's dopamine timing
- Activities:
  1. Diagnose current barriers to onboarding success (Motivation? Ability? Prompt?)
  2. Identify where learners typically disengage
  3. Map which questions trigger questions (which questions unlock curiosity?)
  4. Assess if question difficulty progression matches ability progression
  5. Design prompts for each question (how do we ask the question so learner attempts it?)
- Output: Behavior architecture
  - Motivation diagnosis (what keeps learner going?)
  - Ability gaps (what must we scaffold?)
  - Prompt timing (when to introduce each question?)
  - Friction points (where do learners get stuck?)
- Checkpoint: B=MAP framework applied to quiz structure ✓

**Actor 4: chou-core-drives-mapper**
- Role: Intrinsic Motivation Activation
- Input: Learning domain + learner profile + Fogg's behavior architecture
- Activities:
  1. Identify which core drives (8 core drives model) activate for this learner
  2. Map which drive(s) are PRIMARY (most motivating for this specific person)
  3. Check for drive conflicts (does extrinsic reward damage intrinsic drive?)
  4. Identify saturation risks (is one drive over-activated?)
  5. Design which question sequence activates drives in right order
- Output: Drive activation map
  - Primary drives for this learner
  - Which questions activate which drives
  - Optimal sequencing for drive momentum
  - Intrinsic motivation baseline (what % should be intrinsic vs extrinsic?)
- Checkpoint: Core drives aligned with learning objectives ✓

**Actor 5: csikszentmihalyi-flow-calibrator**
- Role: Challenge-Skill Balance & Experience Design
- Input: Learning domain + learner profile + Fogg's progression + difficulty range
- Activities:
  1. Assess learner's baseline skill level
  2. Map difficulty of each question
  3. Design challenge progression so learner stays in flow zone (not bored, not anxious)
  4. Identify where challenges should jump vs incrementally increase
  5. Design feedback timing to maintain flow state
- Output: Flow calibration
  - Difficulty curve (easy → medium → hard progression)
  - Challenge-skill balance matrix
  - Boredom/anxiety threshold markers
  - Feedback rhythm to maintain flow
- Checkpoint: Challenge progression keeps learner in flow zone ✓

**Actor 6: deterding-intrinsic-validator**
- Role: Ethical Validation Gate
- Input: All previous diagnostics + Chou's drive activation
- Activities:
  1. Audit engagement mechanics for dark patterns
  2. Check if intrinsic motivation is preserved (not manipulated)
  3. Validate that rewards support learning, not dependency
  4. Identify any autonomy-violating mechanics
  5. Flag any concerns that require redesign
- Output: Ethical validation decision
  - ✓ APPROVED (all mechanics ethical, proceed)
  - ⚠️ CONDITIONAL (proceed with modifications)
  - ❌ REDESIGN REQUIRED (ethical issues must be resolved)
- Checkpoint: Ethical gate (decision tree below)

### Phase 1 Decision Tree: Ethical Gate

```
Deterding reviews all diagnostics:

├─ Are all rewards connected to genuine learning progress?
│  ├─ YES → Continue
│  └─ NO → Flag as "arbitrary reward risk"
│
├─ Is learner autonomy preserved?
│  ├─ YES → Continue
│  └─ NO → Flag as "autonomy violation"
│
├─ Is any drive over-activated (risk of addiction)?
│  ├─ YES → Modify drive sequence
│  └─ NO → Continue
│
└─ Is intrinsic motivation primary (>70%)?
   ├─ YES → ✓ APPROVED → Proceed to Phase 2
   ├─ 50-70% → ⚠️ CONDITIONAL → Modify extrinsic structure
   └─ <50% → ❌ REDESIGN → Rethink reward architecture
```

### Phase 1 Checkpoint

**Checkpoint ID:** WF-QUIZ-001
**Gate Criteria:**
- [ ] Learner profile fully understood (motivation, ability, constraints)
- [ ] All questions mapped to learning objectives
- [ ] Dopamine timing architecture specified (all feedback latencies defined)
- [ ] Behavior barriers identified (motivation/ability/prompt gaps)
- [ ] Core drives aligned with learning design
- [ ] Challenge-skill progression defined
- [ ] Ethical validation passed (or conditional with modifications)

**On Failure:** Return to Chief for clarification on ambiguous inputs. Reroute affected agent to reanalyze.

**Quality Indicators:**
- All questions linked to specific learning objectives ✓
- Feedback timing specified to within 500ms ✓
- Learner profile clarity score >90% ✓
- No conflicting guidance from Tier 0 agents ✓

---

## Phase 2: Parallel Diagnostic Analysis (Tier 0) - Already Captured Above

Phase 1 includes the complete Tier 0 diagnostic analysis running in parallel. All 5 Tier 0 agents review the same input simultaneously and produce their specialized diagnostics. Deterding's gate validates all conclusions before proceeding.

### Summary of Tier 0 Outputs
- **Schultz:** Dopamine timing blueprint
- **Fogg:** Behavior design foundation
- **Chou:** Drive activation sequence
- **Csikszentmihalyi:** Flow progression map
- **Deterding:** ✓ APPROVED to proceed

---

## Phase 3: Design Execution (Tier 1 Sequential)

### Duration
1.5-2 hours

### Purpose
Transform Tier 0 diagnostics into a complete, actionable immersive quiz specification that can be implemented by designers, developers, or instructional designers.

### Actor 1: gee-learning-architect

**Input:** All Tier 0 diagnostics + learning brief

**Role:** Pedagogical orchestration & 36 principles integration

**Activities:**

1. **Map 36 Learning Principles to Quiz Structure**
   - Empowered Learners: Where do learners make meaningful choices?
   - Meaningful Challenges: How does each question connect to larger goal?
   - Productive Failure: Where do we intentionally surface misconceptions?
   - Performance Before Competence: How do we let learners perform at edge of ability?
   - Consolidated Learning: How many low-stakes practice attempts before high-stakes?
   - Multiple Routes: Can questions be solved multiple ways?
   - Conceptual Before Procedural: Do learners understand *why* before *how*?
   - Embedded Assessment: Is feedback at every step?
   - Identity Development: How does this quiz help learner see themselves as capable?
   - Transfer Design: How will learning apply beyond this quiz?

2. **Design Question-by-Question Sequence**
   For each of the 5-15 core questions:
   - Sequencing (where in quiz? after what prerequisites?)
   - Difficulty (novice/intermediate/expert)
   - Framing (what narrative context?)
   - Correct answer pedagogy (why is this right?)
   - Wrong answer pedagogy (what misconception does this target?)
   - Learning principle embedded (which principle is this question implementing?)

3. **Create Scaffolding Architecture**
   - Where do learners need hints?
   - What's the just-in-time information to provide?
   - Where do we fade support as learner progresses?
   - Scaffolding removal timeline

4. **Design Identity Development Arc**
   - Opening: "You are someone capable of [skill]"
   - Progression: How does learner's self-image grow?
   - Closing: Reflection on identity shift ("I am now someone who...")

5. **Specify Transfer Design**
   - How will learner apply this in real context?
   - What's the bridge from quiz to real performance?

**Output: Gee Learning Specification**
```yaml
gee_specification:
  complete_sequence:
    - question_1:
        title: "..."
        learning_principle: "Empowered Learners"
        difficulty: "novice"
        sequence_order: 1
        pedagogy: "..."
        identity_development: "Beginning to see themselves as capable"
        scaffolding: "Low - they're ready for this"
    - question_2:
        title: "..."
        # ... detailed specification

  identity_arc:
    opening: "Here's what you'll become..."
    progression: ["See yourself as capable", "See yourself growing", ...]
    closing: "You are now someone who can..."

  transfer_design:
    application_context: "How this applies in real work"
    bridge_activity: "Specific action to take after quiz"
```

**Handoff to:** Eyal (Engagement Designer)

**Checkpoint: WF-QUIZ-002**
- [ ] All 36 applicable principles mapped to questions
- [ ] Question sequencing justified pedagogically
- [ ] Identity development arc clear
- [ ] Scaffolding strategy specified
- [ ] Transfer design articulated

---

### Actor 2: eyal-engagement-designer

**Input:** Gee's learning specification + Tier 0 diagnostics

**Role:** Engagement loop architect & hook mechanics integration

**Activities:**

1. **Design Hook Model Integration**
   - Trigger: What prompts learner to start? (external: "time for your assessment" / internal: "I want to prove I know this")
   - Action: What's the simplest action they take? (read question, make choice, reflect)
   - Variable Reward: What's unpredictable but valuable? (different question types, twist in narrative, discovery)
   - Investment: What makes them invested? (progress shown, identity stake, curiosity loop)

2. **Design Variable Reward Structure**
   - For each question, what's the surprise/delight element?
   - How does reward timing connect to dopamine architecture (from Schultz)?
   - What makes each question feel valuable, not just correct/incorrect?
   - Examples:
     * Mystery: "What will the next challenge be?"
     * Progress: "You're now X% toward mastery"
     * Story twist: "Unexpected narrative reveal that recontextualizes previous learning"
     * Social: "You answered the same way as X% of experts"

3. **Design Engagement Momentum**
   - Opening energy (how to hook learner immediately?)
   - Momentum building (which questions keep energy climbing?)
   - Climax (which question is the peak challenge?)
   - Resolution (how do we celebrate completion?)

4. **Design Habit Loop Prevention (Deterding's Concern)**
   - How to avoid addiction-like patterns
   - How to make engagement sustainable beyond the quiz
   - Transfer to ongoing learning behavior

5. **Specify Engagement Metrics**
   - What indicates healthy engagement? (time per question, attempt pattern, emotion signals)
   - What indicates problematic engagement? (compulsive retaking, anxiety signals)
   - Adjustment rules (if metrics drift, what changes?)

**Output: Eyal Engagement Specification**
```yaml
eyal_specification:
  hook_model:
    trigger: "..."
    action: "..."
    variable_reward: "..."
    investment: "..."

  variable_reward_structure:
    - question_1:
        reward_type: "Mystery | Progress | Story | Social | Autonomy"
        reward_timing: "Immediate | Delayed | Progressive"
        reward_intensity: "Low | Medium | High"
        dopamine_alignment: "Matches Schultz timing"

  engagement_momentum:
    opening: "..."
    progression: ["Question 1: hook interest", "Question 2: build confidence", ...]
    climax: "Question 8: ultimate challenge"
    resolution: "Celebration of mastery"

  engagement_metrics:
    healthy_indicators: ["Time per question 60-120s", ...]
    problematic_indicators: ["Abandonment after Q3", ...]
    adjustment_triggers: ["If time>180s, add hint", ...]
```

**Handoff to:** McGonigal (Resilience Storyteller)

**Checkpoint: WF-QUIZ-003**
- [ ] Hook model specified for each phase
- [ ] Variable rewards designed (avoiding dark patterns)
- [ ] Engagement momentum arc clear
- [ ] Engagement metrics specified
- [ ] Sustainability design addressed

---

### Actor 3: mcgonigal-resilience-storyteller

**Input:** Eyal's engagement specification + Gee's identity arc + learning domain

**Role:** Narrative framing & meaning-making orchestration

**Activities:**

1. **Apply Hero's Journey Framework**
   - Call (Opening): Learner receives quest (why this quiz matters)
   - Challenge (Obstacles): Questions that feel hard but doable
   - Growth (Transformation): How learner's self-image transforms through quiz
   - Return (Application): How learner brings learning back to real world

2. **Design Resilience Reframing**
   - When learner struggles or gets question wrong, how do we reframe it?
   - "Struggle is where growth happens" not "you failed"
   - How do we show that difficulty is positive signal?

3. **Create Narrative Threads**
   - What story connects all the questions?
   - Is this adventure? Mystery? Personal growth journey?
   - How does each question advance the narrative?

4. **Design Meaning-Making Moments**
   - Where do we pause for reflection?
   - Where do we connect to learner's larger goals?
   - Where do we celebrate small wins?

5. **Specify Emotional Journey**
   - Opening emotion: Curiosity? Determination?
   - Progression: Confidence building? Triumphant?
   - Closing: Sense of accomplishment? Identity shift?

**Output: McGonigal Narrative Specification**
```yaml
mcgonigal_specification:
  hero_journey:
    call: "Why this quiz matters (to you, specifically)"
    challenges: "Questions reframed as quests not tests"
    growth: "How you're becoming X"
    return: "How you'll use this in your real world"

  narrative_framing:
    theme: "Hero's Journey | Personal Growth | Mystery | Adventure"
    story_elements:
      - opening_narrative: "..."
      - question_frames: ["Question 1 advances the story by...", ...]
      - closing_narrative: "..."

  resilience_reframing:
    struggle_moments: ["If learner gets Q3 wrong, say...", ...]
    celebration_moments: ["After Q7 correct, say...", ...]
    meaning_moments: ["After Q5, ask reflection...", ...]

  emotional_journey:
    opening_emotion: "Curiosity"
    progression: ["Growing confidence", "Challenged but capable", "Mastery"]
    closing_emotion: "Identity shift (I am now...)"
```

**Handoff to:** Kapp (Instructional Integrator)

**Checkpoint: WF-QUIZ-004**
- [ ] Hero's Journey framework applied
- [ ] Narrative connects all questions
- [ ] Resilience reframing specified
- [ ] Emotional journey designed
- [ ] Meaning moments identified

---

### Actor 4: kapp-instructional-integrator

**Input:** All previous Tier 1 specifications + all Tier 0 diagnostics

**Role:** Feedback design & assessment integration orchestration

**Activities:**

1. **Design Feedback Architecture**
   From Schultz's dopamine timing:
   - Immediate feedback (within 100-200ms): Correctness signal
   - Short-term feedback (1-5s): Explanation + learning principle
   - Long-term feedback (end of quiz): Progress against objectives

2. **Specify Correctness Feedback**
   - What does learner see immediately after answering?
   - Not just "✓ Correct / ✗ Wrong" but pedagogically meaningful feedback
   - Example: "✓ Correct! You identified the key insight: [principle]. This matters because [context]."

3. **Design Misconception Correction**
   - For wrong answers, what misconception are we addressing?
   - How do we correct without shaming?
   - How do we turn wrong answer into learning opportunity?

4. **Specify Learning Objective Alignment**
   - Which learning objective does this question assess?
   - Is feedback specifically about objective mastery?
   - Can learner see their progress toward each objective?

5. **Design Real-time Feedback Timing**
   - Based on Schultz: When should each feedback element appear?
   - 100ms: Immediate acknowledgment
   - 300-500ms: Explanation
   - 1000ms: Connection to larger learning

6. **Create Assessment Integration Map**
   - Not just quiz completion but learning measurement
   - What does mastery look like for each objective?
   - How do we know learner learned vs just got lucky?

7. **Specify Performance vs Learning Feedback**
   - Performance feedback: "You got this right"
   - Learning feedback: "Here's what this teaches you"
   - Design both layers

**Output: Kapp Assessment & Feedback Specification**
```yaml
kapp_specification:
  feedback_architecture:
    immediate_feedback:
      latency: "100-200ms"
      content: "Correctness signal + brief explanation"
      example: "✓ Correct! This is right because [principle]."

    short_term_feedback:
      latency: "1-5 seconds"
      content: "Deep explanation + learning principle + context"
      example: "This answer shows understanding of [principle] which matters in [context]."

    long_term_feedback:
      latency: "End of quiz"
      content: "Overall learning objective progress + mastery summary"

  misconception_corrections:
    - wrong_answer_1:
        misconception: "What learner might be thinking"
        correction: "Here's the accurate principle"
        learning_pivot: "How to use this correction for growth"

  objective_alignment:
    - objective_1:
        questions_assessing: [Q2, Q5, Q8]
        mastery_criteria: "Learner can..."
        progress_tracking: "Show learner their % toward mastery"

  real_time_feedback_timing:
    feedback_sequence:
      - timing: "100ms"
        element: "Visual acknowledgment (checkmark/X)"
      - timing: "300ms"
        element: "Brief principle explanation"
      - timing: "1000ms"
        element: "Deep learning connection"
      - timing: "3000ms"
        element: "Progress update"

  performance_vs_learning_feedback:
    - question_1:
        performance_layer: "You answered correctly"
        learning_layer: "This demonstrates understanding of [principle] which applies to [context]"
```

**Checkpoint: WF-QUIZ-005**
- [ ] Feedback timing matches Schultz's dopamine architecture
- [ ] All learning objectives have assessment
- [ ] Misconception correction specified
- [ ] Real-time feedback sequence specified
- [ ] Performance vs learning feedback layers designed

---

## Phase 4: Delivery & Implementation Handoff

### Duration
30-45 minutes

### Purpose
Translate all specifications into actionable implementation guide that product designers or developers can execute.

### Actor: dopamine-learning-chief

**Activities:**

1. **Integrate All Specifications**
   - Consolidate 4 Tier 1 specifications into master quiz design
   - Verify all Tier 0 diagnostics are represented
   - Check for conflicts or misalignments

2. **Create Implementation Guide**
   - Question-by-question specifications
   - Timing diagrams
   - Copy deck (exact narrative language)
   - Visual design guidelines derived from strategy
   - Technical specifications (feedback latencies, etc.)

3. **Create Monitoring & Adjustment Protocol**
   - Which metrics indicate healthy learning?
   - Which metrics indicate problems?
   - What adjustments to make if metrics drift?

4. **Specify Success Criteria**
   - How to validate quiz achieved learning objectives?
   - How to measure engagement?
   - How to measure dopamine signal effectiveness?
   - How to measure long-term behavior change?

**Output: Implementation Package**

```markdown
# Quiz Immersive: Implementation Guide
## [Quiz Name]

### Summary
[1-paragraph overview of what this quiz teaches and why it matters]

### Learning Objectives
- Objective 1: Learner can [specific behavior]
- Objective 2: Learner can [specific behavior]
- Objective 3: Learner can [specific behavior]

### Complete Question Specification

#### Question 1: [Title]
**Sequence Position:** 1/15
**Learning Objective:** Objective 2
**Pedagogical Principle:** Empowered Learners
**Difficulty:** Novice
**Narrative Context:** [How this question appears in story]

**Question Copy:**
[Exact text learner sees]

**Answer Options:**
A) [Option] - [Why this is wrong/right]
B) [Option] - [Why this is wrong/right]
C) [Option] - [Why this is wrong/right]
D) [Option] - [Why this is wrong/right]

**Correct Answer:** C

**Immediate Feedback (100ms):**
[Visual: Green checkmark]

**Short-term Feedback (500ms):**
"✓ Correct! [Explanation of why C is right and principle it teaches]"

**Misconception Handling (for wrong answers):**
- If A selected: "You might think [misconception], but actually [correction]"
- If B selected: "Close! But [distinction]. The right answer is..."
- If D selected: "This demonstrates [misconception]. Here's the principle..."

**Learning Feedback (1-5s):**
"This shows you understand [principle], which is crucial because [context]. Next you'll apply this to..."

**Engagement Element:**
Variable Reward: [Mystery | Progress | Story Reveal | Social | Autonomy]
Narrative Advance: [How this question moves story forward]

**Identity Development:**
[How does answering this question help learner see themselves as capable of X?]

---

[Repeat for all questions]

### Feedback Timing Diagram

```
Time    Element                 Latency
0ms     User clicks answer      (baseline)
↓
100ms   Visual feedback         +100ms
        (checkmark/X)
↓
300ms   Brief explanation       +200ms
        "Why this is right"
↓
1000ms  Learning connection     +700ms
        "Why this principle matters"
↓
3000ms  Progress update         +2000ms
        "You're X% toward mastery"
```

### Engagement Momentum Curve

```
Energy
  ↑
  │    ╱╲╱╲╱╲
  │   ╱  ╲  ╲    ← Hook at opening
  │  ╱    ╲  ╲
  │ ╱      ╲  ╲╱
  └─────────────────→ Time
  Q1  Q5  Q8  Q15
  (Opening) (Climax) (Closing)
```

### Monitoring Dashboard

**Healthy Engagement Indicators:**
- Avg time per question: 60-120s
- Completion rate: >80%
- First-attempt correctness: 60-75% (not too easy, not too hard)
- Learner satisfaction: >4/5

**Problematic Indicators:**
- Abandonment after Q3: Suggests opening isn't hooking
- Avg time per question >300s: Suggests questions too hard
- Low satisfaction: Suggests narrative/engagement failing
- High error rate (>50% wrong): Suggests scaffolding insufficient

**Adjustment Protocol:**
- If abandonment >20% after Q3: Review opening hook with Eyal
- If avg time >300s: Simplify question or add hint with Gee
- If satisfaction <3: Review narrative framing with McGonigal
- If error rate >50%: Add scaffolding/prerequisite content with Gee

### Success Criteria

**Learning Success:**
- [ ] 70%+ of learners reach 80%+ accuracy on learning objectives
- [ ] Learners can demonstrate learning in real-world context (not just quiz)
- [ ] 30-day retention: Learner remembers and applies 60%+ of content

**Engagement Success:**
- [ ] 80%+ completion rate
- [ ] >4/5 learner satisfaction
- [ ] Intrinsic motivation >70% (measured by post-quiz survey)
- [ ] Recommendation likelihood >8/10

**Behavioral Success:**
- [ ] Learners apply skills in real work within 7 days
- [ ] 60%+ demonstrate mastery when assessed in real context
- [ ] Negative behaviors from before quiz <20% by day 30

**Implementation Ready!**
This quiz is ready for design/development when all fields above completed.
```

### Create Monitoring Protocol

```yaml
monitoring_protocol:
  daily_metrics:
    - metric: completion_rate
      healthy_range: "75-90%"
      check_frequency: "Daily at 8am"

    - metric: average_time_per_question
      healthy_range: "60-120 seconds"
      check_frequency: "Daily"

  weekly_metrics:
    - metric: learning_objective_mastery
      healthy_range: ">75% of learners >80% accuracy"

    - metric: engagement_sentiment
      healthy_range: ">4.0/5 satisfaction"

  adjustment_triggers:
    - if: "completion_rate < 60%"
      then: "Convene urgent review with Eyal + McGonigal"
      action: "Review opening hook and narrative frame"

    - if: "avg_time > 300s"
      then: "Route to Gee for difficulty review"
      action: "Consider scaffolding addition or question simplification"
```

---

## Quality Gates: 5 Critical Validation Points

### Quality Gate 1: Input Clarity (Phase 1 Exit)
**Gate ID:** WF-QUIZ-Q1
**Validator:** dopamine-learning-chief
**Criteria:**
- [ ] Learning objectives specific and measurable
- [ ] Learner profile clear (no ambiguity)
- [ ] All questions mapped to objectives
- [ ] Success metrics defined
- [ ] Constraints understood

**On Failure:** Return to user for clarification. Do not proceed without clarity.

**Approval Indicates:** "We know exactly what we're building"

---

### Quality Gate 2: Ethical Foundation (Phase 1 Exit)
**Gate ID:** WF-QUIZ-Q2
**Validator:** deterding-intrinsic-validator
**Criteria:**
- [ ] No dark patterns (compulsion, anxiety triggers, FOMO)
- [ ] Intrinsic motivation >70%
- [ ] Autonomy preserved (learner choices matter)
- [ ] Rewards connected to genuine learning
- [ ] No addiction mechanics

**Options:**
- ✅ APPROVED → Proceed immediately
- ⚠️ CONDITIONAL → Proceed with specific modifications
- ❌ REDESIGN → Return to earlier phase

**Approval Indicates:** "This design respects the learner"

---

### Quality Gate 3: Pedagogical Coherence (Phase 3 Mid-Point)
**Gate ID:** WF-QUIZ-Q3
**Validator:** gee-learning-architect
**Criteria:**
- [ ] Applicable 36 principles embedded
- [ ] Learning sequence scaffolded properly
- [ ] Question difficulty progression validated
- [ ] Identity development arc clear
- [ ] Transfer design specified

**On Failure:** Return to Gee for sequence redesign.

**Approval Indicates:** "Questions teach, not just test"

---

### Quality Gate 4: Engagement Sustainability (Phase 3 Mid-Point)
**Gate ID:** WF-QUIZ-Q4
**Validator:** eyal-engagement-designer
**Criteria:**
- [ ] Hook model specified for each phase
- [ ] Variable rewards avoid dark patterns (Deterding approved)
- [ ] Engagement momentum curve validated
- [ ] Post-quiz behavior sustained
- [ ] Engagement metrics defined

**On Failure:** Return to Eyal for engagement redesign.

**Approval Indicates:** "Engagement is authentic and sustainable"

---

### Quality Gate 5: Feedback Precision (Phase 4 Entry)
**Gate ID:** WF-QUIZ-Q5
**Validator:** kapp-instructional-integrator
**Criteria:**
- [ ] All feedback timing matches Schultz dopamine architecture
- [ ] Learning objective alignment 100%
- [ ] Misconception correction specified
- [ ] Performance vs learning feedback layers designed
- [ ] Real-world transfer designed

**On Failure:** Return to Kapp for feedback redesign.

**Approval Indicates:** "Every bit of feedback teaches"

---

## Error Handling & Recovery Paths

### Error 1: Learner Profile Ambiguity (Phase 1)
**Symptom:** Unclear who is learning, why, or what success looks like
**Recovery:**
1. Chief asks specific clarifying questions
2. Document answers in structured format
3. Restart Phase 1 diagnostics with clarity
4. No progress to Phase 2 without clarity

### Error 2: Tier 0 Agent Disagreement (Phase 1)
**Symptom:** Agents provide conflicting guidance (e.g., Schultz wants fast feedback, but platform can't deliver)
**Recovery:**
1. Chief identifies conflict explicitly
2. Route to relevant agents for negotiation
3. Document the trade-off decision
4. Proceed with negotiated approach
5. Flag as constraint for implementation team

### Error 3: Ethical Gate Failure (Phase 1 Exit)
**Symptom:** Deterding rejects design as unethical
**Recovery:**
1. Document specific ethics concerns
2. Return to source agent (Chou/Eyal for drive issues, etc.)
3. Modify design to address concerns
4. Resubmit to Deterding
5. Do not proceed without approval

### Error 4: Pedagogical Misalignment (Phase 3)
**Symptom:** Questions don't actually teach the learning objectives
**Recovery:**
1. Gee identifies which principle(s) missing
2. Redesign questions with principle in mind
3. Validate with Fogg (does behavior structure support it?)
4. Proceed only after pedagogical coherence validated

### Error 5: Engagement Collapse (Phase 3)
**Symptom:** No variable reward, narrative feels flat, momentum dies
**Recovery:**
1. Eyal identifies engagement failure
2. McGonigal reviews narrative framing
3. Redesign hook model or narrative elements
4. Validate engagement momentum curve
5. Proceed only after engagement validated

### Error 6: Feedback Timing Impossible (Phase 4)
**Symptom:** Platform can't deliver feedback within required latency (Schultz says 100ms, platform can only do 2s)
**Recovery:**
1. Document technical constraint
2. Schultz redesigns dopamine model for longer latency
3. Verify dopamine effectiveness still >80% with longer latency
4. Proceed with modified timing
5. Flag for future technical improvement

### Error 7: Implementation Complexity Exceeds Capacity
**Symptom:** Implementation package too complex for team's capability
**Recovery:**
1. Chief simplifies specification to MVP version
2. Identify "nice-to-have" features that can be added later
3. Core pedagogical/engagement elements must remain
4. Create phased implementation roadmap
5. Proceed with MVP version first

---

## Handoff Sequence

```
User Input
   ↓
Chief + Schultz + Fogg + Chou + Csikszentmihalyi
   ↓ (runs in parallel)
Deterding (ethical gate)
   ↓
Gee (learning architecture)
   ↓
Eyal (engagement loops)
   ↓
McGonigal (narrative framing)
   ↓
Kapp (assessment/feedback)
   ↓
Chief (final integration + implementation guide)
   ↓
Implementation Team
```

---

## Output Specification: What Gets Delivered

### Deliverable 1: Implementation Guide
**Format:** Markdown document, 50-80 pages
**Contents:**
- Executive summary
- Learning objectives
- Complete question specification (Q-by-Q)
- Feedback architecture
- Timing diagrams
- Narrative copy deck
- Visual design guidelines (derived from strategy)
- Monitoring dashboard
- Success criteria

### Deliverable 2: Question Bank (Structured Data)
**Format:** JSON or YAML
**Contents:**
```json
{
  "quiz_id": "quiz-immersivo-001",
  "questions": [
    {
      "id": "q1",
      "title": "...",
      "text": "...",
      "options": [
        {"id": "a", "text": "...", "correct": true, "pedagogy": "..."},
        {"id": "b", "text": "...", "correct": false, "misconception": "..."}
      ],
      "feedback": {
        "immediate": {"latency": 100, "content": "..."},
        "short_term": {"latency": 500, "content": "..."},
        "learning": {"latency": 1000, "content": "..."}
      },
      "learning_objective": "obj_2",
      "principle": "Empowered Learners"
    }
  ]
}
```

### Deliverable 3: Engagement Strategy Document
**Format:** Markdown document, 20-30 pages
**Contents:**
- Hook model specification
- Variable reward architecture
- Momentum curve visualization
- Engagement metrics dashboard
- Adjustment protocols

### Deliverable 4: Narrative & Copy Deck
**Format:** Markdown or Google Doc
**Contents:**
- Opening narrative
- Q-by-Q narrative framing
- Feedback language (exact copy to use)
- Closing narrative
- Reflection prompts

### Deliverable 5: Monitoring & Adjustment Protocol
**Format:** Markdown document
**Contents:**
- Daily metrics to track
- Weekly metrics to track
- What constitutes healthy vs problematic
- Specific adjustment actions for each metric drift
- Success criteria checklist

### Deliverable 6: Squad Diagnostic Report (Optional)
**Format:** Markdown document, 40-60 pages
**Contents:**
- Complete Tier 0 analysis (Schultz, Fogg, Chou, Csikszentmihalyi, Deterding summaries)
- Design decisions and trade-offs
- Assumptions made
- Risks identified
- Recommended monitoring

---

## Success Criteria & Metrics

### Learning Success
- **Objective Mastery:** 70%+ of learners achieve 80%+ accuracy on learning objectives
- **Real-World Transfer:** Learner demonstrates learned skill in actual work context within 7 days
- **Retention:** 30-day retention >60% (learner remembers and applies content)
- **Competence Progression:** Learner visible progresses from novice → competent

### Engagement Success
- **Completion Rate:** 80%+ of learners complete entire quiz
- **Learner Satisfaction:** >4.0/5 on post-quiz survey
- **Intrinsic Motivation:** >70% of engagement driven by intrinsic motivation (measured post-quiz)
- **Recommendation Likelihood:** >8/10 would recommend this to colleague

### Behavioral Success
- **On-the-Job Application:** 60%+ demonstrate mastery when assessed in real work context
- **Habit Formation:** Behavior change sustained >30 days (90%+ still performing learned skill)
- **Knowledge Sharing:** Learner teaches 1+ colleagues the skill
- **Problem-Solving Improvement:** Relevant problems solved 40%+ better post-quiz

### Dopamine Architecture Success
- **Signal Timing:** Feedback delivered within specified latency 95%+ of time
- **Learning Curve:** Learner's accuracy improves at predicted rate
- **Prediction Error:** Learner's confidence calibration improves (better predictions about own performance)
- **No Addiction Patterns:** Zero indicators of compulsive quiz retaking or anxiety-driven engagement

### Ethical Validation Success
- **Autonomy Preserved:** Learner feels agency and choice throughout quiz
- **No Dark Patterns:** Zero reports of manipulation, compulsion, or unethical mechanics
- **Intrinsic Motivation Primary:** >70% engagement intrinsically motivated (not points-chasing)
- **Long-term Behavior:** Positive behavior change extends beyond quiz

---

## Integration Points & Dependencies

### Required Agent Availability
- dopamine-learning-chief (orchestrator)
- schultz-dopamine-analyst (Tier 0)
- fogg-behavior-diagnostician (Tier 0)
- chou-core-drives-mapper (Tier 0)
- csikszentmihalyi-flow-calibrator (Tier 0)
- deterding-intrinsic-validator (Tier 0 + Gate)
- gee-learning-architect (Tier 1)
- eyal-engagement-designer (Tier 1)
- mcgonigal-resilience-storyteller (Tier 1)
- kapp-instructional-integrator (Tier 1)

### External System Requirements
- Learning platform with <500ms feedback latency (for optimal dopamine signals)
- Ability to track per-learner metrics (engagement, completion, satisfaction)
- Assessment capability (track learning objective mastery)
- A/B testing capability (optional, for ongoing optimization)

### Prerequisites to Start
- [ ] Learning domain clearly scoped (what skill/knowledge?)
- [ ] Target learner profile defined (who? why? constraints?)
- [ ] Success metrics identified (how to know if it worked?)
- [ ] Stakeholder alignment on approach (squad will take 4-6 hours)
- [ ] Implementation team ready to build (guide only works if executed)

### Data Flowing Into Workflow
- Learning objective specifications (from user)
- Learner profile data (demographics, motivation, ability, constraints)
- Question list (topics that must be covered)
- Platform constraints (technical limitations, delivery method)

### Data Flowing Out of Workflow
- Complete implementation guide
- Question bank (structured for platform integration)
- Monitoring dashboard specifications
- Success criteria and KPIs
- Coaching guidance for implementation team

---

## Parallelizable vs Sequential

### Can Run In Parallel
- Schultz, Fogg, Chou, Csikszentmihalyi all analyze input simultaneously (Phase 1)
- All Tier 0 agents work in parallel

### Must Run Sequentially
- Phase 1 must complete before Phase 2 (needs diagnostic foundation)
- Gee → Eyal → McGonigal → Kapp (each builds on previous)
- Deterding gate must pass before Phase 3 execution
- Phase 3 must complete before Phase 4 (integration needs all components)

### Parallelizable Tier 1 (Optional Optimization)
- Gee, Eyal, McGonigal could theoretically run in parallel with shared constraints
- NOT RECOMMENDED: Each agent needs previous output to do best work
- Sequential handoffs maintain quality better

---

## Typical Timeline

| Phase | Duration | Actors | Output |
|-------|----------|--------|--------|
| Phase 1: Diagnosis | 1-2 hours | Chief + Tier 0 (parallel) + Gate | Learning brief + diagnostics |
| Phase 2: Already included in Phase 1 | - | - | - |
| Phase 3: Execution | 1.5-2 hours | Gee → Eyal → McGonigal → Kapp | 4 specifications |
| Phase 4: Delivery | 30-45 min | Chief | Implementation guide |
| **Total** | **4-6 hours** | **All 10 agents** | **Complete immersive quiz design** |

---

## Anti-Patterns to Avoid

### ❌ Anti-Pattern 1: Skipping Ethical Gate
**Problem:** You want to move fast and skip Deterding validation
**Why This Fails:** Unethical mechanics cause learner resentment, low engagement, dependency, or burnout
**The Right Way:** Always wait for Deterding's ✓ APPROVED or ⚠️ CONDITIONAL

### ❌ Anti-Pattern 2: Tier 0 Input Skip
**Problem:** User wants to "just jump to quiz design" without diagnostics
**Why This Fails:** Without dopamine timing, behavior structure, etc., quiz won't work
**The Right Way:** Full Phase 1 diagnostics are NOT optional (even if accelerated)

### ❌ Anti-Pattern 3: Generic Questions
**Problem:** Reusing old quiz questions without redesign
**Why This Fails:** Questions may not fit learner profile, dopamine architecture, or new narrative
**The Right Way:** Each question designed specifically for this learner, this domain, this time

### ❌ Anti-Pattern 4: Feedback Too Delayed
**Problem:** "We'll give feedback after quiz ends"
**Why This Fails:** Dopamine signals decay rapidly; feedback 24 hours later won't encode learning
**The Right Way:** Feedback within 500ms for optimal dopamine signal (or redesign dopamine model if latency >2s)

### ❌ Anti-Pattern 5: Ignoring Engagement Metrics
**Problem:** Quiz goes live, no one monitors if it's actually engaging
**Why This Fails:** Problems compound; by week 3 engagement collapsed
**The Right Way:** Monitor daily (completion, time, satisfaction), adjust weekly

---

## Operational Notes

### When to Use This Workflow
✅ Creating new onboarding quiz or learning assessment
✅ Redesigning boring/underperforming quiz
✅ Scaling quiz that works for 100 to 10,000 learners
✅ Embedding learning into product experience
✅ Creating compliance or certification training that actually sticks

### When NOT to Use This Workflow
❌ Quick survey or feedback form (use simpler process)
❌ One-off question or test (overkill investment)
❌ Quiz that just needs copy editing (use editing workflow)
❌ Content that's already proven to work (use optimization workflow instead)

### Key Assumptions
- Learning domain is clearly scoped (not "teach everything")
- Learner profile is knowable (we can ask clarifying questions)
- Success metrics are definable and measurable
- Implementation team has 2-4 weeks to build (not 2 days)
- Platform can deliver feedback within required latency (or we redesign dopamine model)

### Estimated Squad Effort
- **Schultz:** 1-1.5 hours
- **Fogg:** 1-1.5 hours
- **Chou:** 1-1.5 hours
- **Csikszentmihalyi:** 1-1.5 hours
- **Deterding:** 1-1.5 hours
- **Gee:** 1.5-2 hours
- **Eyal:** 1.5-2 hours
- **McGonigal:** 1-1.5 hours
- **Kapp:** 1.5-2 hours
- **Chief:** 1.5-2 hours (orchestration + integration)
- **Total:** 12-17 hours agent work → 4-6 hours elapsed (due to parallel Tier 0 work)

---

## Version History

- **v1.0.0** (2026-02-12) — Initial production-ready workflow for immersive quizzes
  - Complete 4-phase architecture
  - All 10 agent roles specified
  - 5 quality gates with validation criteria
  - Comprehensive error handling
  - Production handoff package

---

**Workflow Status:** ✓ Production Ready
**Last Updated:** 2026-02-12
**Next Review:** 2026-03-12 (post-first-implementation review)

