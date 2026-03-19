# Workflow: Challenge de Aprendizado (Progressive Difficulty)

**Workflow ID:** dopamine-learning/challenge-aprendizado
**Version:** 1.0.0
**Status:** Production Ready
**Created:** 2026-02-12
**Total Lines:** 900+

---

## Executive Summary

This workflow designs learning challenges with progressive difficulty and dopamine-optimized mechanics. Rather than static problems, this creates dynamic challenge progressions where each level builds skill, confidence, and intrinsic motivation. The workflow orchestrates all 10 squad agents to ensure every difficulty level respects dopamine architecture, behavioral design, psychological drives, flow state, ethical constraints, pedagogical principles, engagement loops, narrative meaning, and assessment integrity.

**Timeline:** 3-5 hours from challenge specification to complete progression design
**Complexity:** High (most complex of 3 workflows—requires 4-level progression design)
**Success Rate Target:** 90%+ learner progression through levels, 85%+ mastery at each level

---

## Purpose & Value Proposition

### Challenge Being Solved

Traditional challenge progressions fail because they:
- ❌ Jump difficulty arbitrarily (easy → way too hard)
- ❌ Ignore dopamine timing (no scaffolded feedback)
- ❌ Lose motivation at difficulty increases (challenge drops engagement)
- ❌ Plateau at competence (no progression beyond basic mastery)
- ❌ Create anxiety instead of flow (challenge > skill causes frustration)

### What This Workflow Delivers

- ✅ Smooth difficulty progression (novice → intermediate → advanced → expert)
- ✅ Challenge-skill balance maintained at each level (learner stays in flow zone)
- ✅ Dopamine signals optimized for each difficulty tier
- ✅ Motivation increases with challenge (intrinsic > extrinsic)
- ✅ Behavioral scaffolding removes at right moments (fading design)
- ✅ Assessment integrates throughout (no surprise difficulty at final level)
- ✅ Narrative meaning grows with difficulty (challenge feels purposeful)

### Business Impact

- **Engagement Curve:** 95%+ complete Level 1, 85%+ complete Level 2, 70%+ complete Level 3+
- **Mastery Timeline:** 30-day mastery 3x faster vs traditional progression
- **Skill Transfer:** 75%+ transfer learned skills to novel contexts
- **Learner Confidence:** +200% self-assessed capability by Level 4

---

## Target Use Cases

### Primary Use Case 1: Sales Skill Development
New sales reps need progressive skill building (prospecting → pitching → closing → account management). Without progression, reps plateau or get frustrated. This workflow creates challenge progression that keeps motivation climbing.

### Primary Use Case 2: Leadership Development
Managers need progressive challenge (1:1s → team facilitation → organizational change). Current problem: Jumping from 1:1 skills to org change causes failure. This workflow bridges gaps.

### Primary Use Case 3: Technical Skill Stacks
Engineers learning complex skills (web development: HTML → CSS → JavaScript → React → Full Stack). Current problem: Difficulty cliff causes abandonment. This workflow maintains flow throughout.

### Primary Use Case 4: Creative Professional Development
Designers learning design thinking process (discovery → ideation → prototyping → testing → iteration). Current problem: Abstract stages feel disconnected. This workflow creates concrete, progressive challenges.

### Primary Use Case 5: Language Learning
Language students progressing (listening → speaking → reading → writing → conversation). Current problem: Speaking feels too hard too soon. This workflow scaffolds each skill before integrating.

---

## Input Specification

```yaml
input:
  challenge_domain:
    skill_name: "What skill is this challenge building?"
    domain: "Sales | Leadership | Technical | Creative | Academic | Other"
    target_learners: "Who is learning? (role, seniority, context)"
    required: true

  progression_framework:
    target_final_level: "Expert | Advanced | Intermediate | Competent"
    typical_time_to_master: "How long should progression take? (weeks/months)"
    learner_retention_target: "What % should complete all levels? (80%? 70%?)"
    required: true

  challenge_constraints:
    performance_complexity: "Simple (1-step) | Medium (5-step) | Complex (10+ step)"
    feedback_availability: "Real-time | End-of-attempt | Delayed (specify lag)"
    assessment_method: "Performance test | Portfolio | Peer review | Expert eval | Other"
    required: true

  level_specification:
    must_include_levels: "4 | 3 | 5 | Other (specify)"
    level_1_objective: "What should novice learner do?"
    level_2_objective: "What intermediate learner does?"
    level_3_objective: "What advanced learner does?"
    level_4_objective: "What expert learner does?"
    required: true

  success_criteria:
    mastery_definition: "What does expert performance look like?"
    retention_metric: "How to measure if learning stuck? (30-day test? on-job?)"
    transfer_metric: "How to measure if skill transfers? (novel context performance?)"
    required: true

  context_constraints:
    time_per_level: "How much time per level? (hours/days?)"
    assessment_frequency: "Assess at level end? Throughout? Never?"
    live_stakes: "Are levels assessed under pressure? (certification? job performance?)"
    required: false
```

---

## Workflow Architecture: 5 Phases

```
┌──────────────────────────────────────────────────────────┐
│ PHASE 1: CHALLENGE ANALYSIS & LEARNER PROFILING         │
│ Duration: 1-1.5 hours | Agents: Chief, Schultz, Fogg    │
│ Output: Challenge brief + learner/skill mapping          │
└──────────────────────────────────────────────────────────┘
                           ↓
┌──────────────────────────────────────────────────────────┐
│ PHASE 2: PARALLEL TIER 0 DIAGNOSIS (Challenge Specific) │
│ Duration: 1.5 hours | All 5 Tier 0 Agents (parallel)   │
│ Output: 5 perspectives on challenge progression design   │
│ Gate: Deterding ethical validation                       │
└──────────────────────────────────────────────────────────┘
                           ↓
┌──────────────────────────────────────────────────────────┐
│ PHASE 3: LEVEL PROGRESSION DESIGN (Sequential Tiers)    │
│ Duration: 1.5-2 hours                                   │
│ Agents: Csikszentmihalyi → Gee → Chou → Eyal           │
│ Output: Complete 4-level progression specification      │
└──────────────────────────────────────────────────────────┘
                           ↓
┌──────────────────────────────────────────────────────────┐
│ PHASE 4: NARRATIVE & ASSESSMENT INTEGRATION              │
│ Duration: 1 hour                                        │
│ Agents: McGonigal → Kapp                                │
│ Output: Full challenge progression with narrative + eval │
└──────────────────────────────────────────────────────────┘
                           ↓
┌──────────────────────────────────────────────────────────┐
│ PHASE 5: DELIVERY & PROGRESSION HANDOFF                  │
│ Duration: 30 min | Agent: Chief                         │
│ Output: Implementation guide + monitoring protocol       │
└──────────────────────────────────────────────────────────┘
```

---

## Phase 1: Challenge Analysis & Learner Profiling

### Duration
1-1.5 hours

### Purpose
Deeply understand the skill being taught, the learner's current state, and what progression looks like. This prevents designing difficulty progressions that don't fit reality.

### Actors & Responsibilities

**Actor 1: dopamine-learning-chief**
- Role: Orchestrator & Challenge Analyst
- Input: Raw request for challenge progression
- Activities:
  1. Clarify what skill is being developed (not just content, but behavioral mastery)
  2. Map current state → target state for learner
  3. Understand learner's psychology (what motivates progression?)
  4. Identify any learning prerequisites or dependencies
  5. Define what "mastery" means at each level
  6. Clarify assessment approach (how do we know if learner mastered?)
- Output: Challenge Analysis Brief
  - Skill definition (specific behaviors at each level)
  - Learner profile (current state, motivation, constraints)
  - Progression map (what changes from level to level?)
  - Assessment strategy (how to validate mastery?)
- Handoff: Routes to Schultz for dopamine timing

**Actor 2: schultz-dopamine-analyst**
- Role: Dopamine Architecture for Challenge Progression
- Input: Challenge brief + learning levels
- Activities:
  1. Map dopamine signals for EACH LEVEL
     - Level 1 (novice): Where should dopamine fire to build confidence?
     - Level 2 (intermediate): Where should signals shift (less scaffolding signal)?
     - Level 3 (advanced): Where should signals encode mastery progress?
     - Level 4 (expert): Where should signals be minimal (intrinsic drives primary)?
  2. Design signal progression (dopamine architecture evolves with learner)
  3. Specify feedback latency for each level
     - Level 1: Faster feedback (immediate = confidence building)
     - Level 2: Moderate feedback (encourages independence)
     - Level 3+: Slower feedback (learner must solve without scaffolding)
  4. Identify learning rate changes (alpha parameter by level)
     - Level 1: Higher learning rate (faster progress = engagement)
     - Level 2-3: Moderate (deliberate practice speed)
     - Level 4: Lower (expert refinement takes time)
  5. Flag any prediction error opportunities that progression should exploit
- Output: Dopamine Progression Architecture
  - Level 1 dopamine timing (immediate, confidence-focused)
  - Level 2 dopamine timing (moderate, mastery-focused)
  - Level 3 dopamine timing (minimal scaffolding, performance-focused)
  - Level 4 dopamine timing (intrinsic motivation primary)
  - Learning rate (alpha) by level
  - Feedback latency requirements by level
- Checkpoint: Dopamine signals optimized for progression ✓

**Actor 3: fogg-behavior-diagnostician**
- Role: Behavioral Progression Design
- Input: Challenge brief + Schultz's dopamine progression
- Activities:
  1. Diagnose behavioral changes needed at each level
     - Level 1: What behavior change? (low ability, needs high prompt support)
     - Level 2: What new behaviors? (ability growing, reduce prompt dependency)
     - Level 3: What autonomous behaviors? (high ability, minimal prompt needed)
     - Level 4: What adaptive behaviors? (expert-level flexibility)
  2. Design scaffolding removal (fading strategy)
     - Level 1: High scaffolding (lots of prompts, guidance, support)
     - Level 2: Moderate scaffolding (fewer prompts, more independence)
     - Level 3: Minimal scaffolding (learner takes initiative)
     - Level 4: No scaffolding (expert-level autonomy)
  3. Identify motivation gaps at each level
     - Where does motivation typically drop?
     - Which level transition is hardest?
     - How to maintain motivation through difficulty increase?
  4. Design prompts for each level
     - Level 1 prompts: Supportive, frequent, lowering friction
     - Level 2 prompts: Guiding, less frequent, building independence
     - Level 3 prompts: Minimal, challenging learner to think
     - Level 4 prompts: None (or peer/community-based)
- Output: Behavioral Progression
  - Scaffolding architecture by level (what support at each?)
  - Scaffolding fading schedule (when to remove support?)
  - Prompt timing by level (how often, what type?)
  - Motivation strategy by level (how to keep engagement climbing?)
- Checkpoint: B=MAP framework applied to progression ✓

### Phase 1 Checkpoint

**Checkpoint ID:** WF-CHALLENGE-001
**Gate Criteria:**
- [ ] Skill definition clear (specific behaviors, not just knowledge)
- [ ] Progression levels defined (what's different at each level?)
- [ ] Learner profile understood (motivation, ability, constraints)
- [ ] Assessment approach specified (how to validate mastery?)
- [ ] Dopamine timing specified for each level
- [ ] Behavioral scaffolding strategy designed
- [ ] Motivation preservation strategy clear

**On Failure:** Return to Chief for clarification.

---

## Phase 2: Parallel Tier 0 Diagnosis (All Challenge-Specific)

### Duration
1.5 hours (parallel, not sequential)

### Purpose
Each Tier 0 agent brings specialized lens to challenge progression design. All agents analyze same challenge but focus on different aspects.

### Actor 1: chou-core-drives-mapper

**Input:** Challenge brief + Schultz's dopamine progression + Fogg's scaffolding design

**Role:** Drive Evolution & Motivation Sequencing

**Activities:**

1. **Map Drive Activation by Level**
   - Level 1 (novice): Which drives motivate a learner just starting?
     - Typically: Curiosity (novelty), Empowerment (building ability), Community (not alone)
   - Level 2 (intermediate): Which drives keep intermediate learner going?
     - Typically: Mastery (I'm getting better), Achievement (progress visible)
   - Level 3 (advanced): Which drives sustain advanced learners?
     - Typically: Mastery, Purpose (this matters), Autonomy (I choose my path)
   - Level 4 (expert): Which drives activate for expert?
     - Typically: Purpose (contribute), Autonomy (lead), Community (mentor others)

2. **Design Drive Sequence Through Progression**
   - How to activate right drives at right time?
   - How to prevent drive saturation (same drive over-activated)?
   - How to create sustainable motivation (intrinsic > extrinsic)?

3. **Identify Drive-Level Mismatch Risks**
   - Risk: Level 3 challenge activates only achievement drive
   - Better: Level 3 activates mastery + purpose + autonomy (multiple drives sustained)

4. **Design Intrinsic Motivation Arc**
   - Level 1: 60% intrinsic, 40% extrinsic (need external support)
   - Level 2: 70% intrinsic, 30% extrinsic (building self-drive)
   - Level 3: 85% intrinsic, 15% extrinsic (mostly self-motivated)
   - Level 4: 95% intrinsic, 5% extrinsic (expert self-sustaining)

**Output:** Drive Progression Architecture
```yaml
drive_progression:
  level_1:
    primary_drives: ["Curiosity", "Empowerment", "Community"]
    intrinsic_ratio: "60%"
    drive_activation_moments: ["Starting challenge", "Early success", "Group learning"]

  level_2:
    primary_drives: ["Mastery", "Achievement", "Autonomy"]
    intrinsic_ratio: "70%"
    drive_activation_moments: ["Visible progress", "Independent success", "Choice points"]

  level_3:
    primary_drives: ["Mastery", "Purpose", "Autonomy", "Social Contribution"]
    intrinsic_ratio: "85%"
    drive_activation_moments: ["Expert-level insight", "Real-world application", "Helping others"]

  level_4:
    primary_drives: ["Purpose", "Autonomy", "Community (as mentor)"]
    intrinsic_ratio: "95%"
    drive_activation_moments: ["Contributing insights", "Mentoring others", "Advancing field"]
```

**Checkpoint:** Drives aligned with progression arc ✓

---

### Actor 2: csikszentmihalyi-flow-calibrator

**Input:** Challenge brief + Fogg's scaffolding design + Schultz's learning rates

**Role:** Flow Zone Maintenance Through Difficulty Progression

**Activities:**

1. **Assess Learner Skill Baseline (Level 1)**
   - What can novice learner do without challenge?
   - What challenge is appropriate for novice? (not so easy they're bored, not so hard they panic)
   - Novice flow zone: Challenge X, Skill 1 → Flow state when challenge ≈ skill

2. **Design Challenge Trajectory**
   - Level 1 challenge: Skill 1 + 0.1 (slightly above current, doable with effort)
   - Level 2 challenge: Skill 2 + 0.1 (learner's skill grew, challenge grows proportionally)
   - Level 3 challenge: Skill 3 + 0.1 (expert-level challenge, expert-level skill)
   - Level 4 challenge: Skill 4 + 0.2 (expert stretching toward mastery)

3. **Design Difficulty Curve (Smooth vs Cliff)**
   - ❌ Level 1 (easy) → Level 2 (way too hard) = CLIFF (learner quits)
   - ✅ Level 1 (easy) → Level 2 (+10% harder) → Level 3 (+10%) → Level 4 (+20%) = CURVE
   - Implementation: Each level increases challenge 10-15%, not 50%+

4. **Map Boredom & Anxiety Thresholds**
   - Boredom threshold: Challenge < Skill × 0.9 (too easy, learner disengages)
   - Anxiety threshold: Challenge > Skill × 1.3 (too hard, learner panics)
   - Flow zone: Skill × 0.95 < Challenge < Skill × 1.15 (optimal learning)

5. **Design Skill-Building Opportunities**
   - Between challenges, how does learner build skill?
   - Level 1 → 2: Mastery practice on Level 1 concepts (builds skill to 1.5)
   - Level 2 → 3: Deliberate practice on Level 2 challenges (builds skill to 2.5)
   - Progression: Skill builds between levels, then challenge increases

6. **Specify Feedback Timing for Flow Maintenance**
   - Immediate feedback (within 100ms) = confidence boost (novice)
   - Delayed feedback (1-5s) = time for reflection (intermediate)
   - Very delayed (10-30s) = learner struggles before resolution (advanced)
   - Progression: Feedback delay increases as learner progresses

**Output:** Flow Calibration by Level
```yaml
flow_progression:
  level_1:
    learner_skill: 1.0
    challenge_level: 1.1
    flow_zone_quality: "High (safe learning)"
    feedback_timing: "100-200ms (immediate)"
    boredom_risk: "Low (challenge present)"
    anxiety_risk: "Low (skill sufficient)"

  level_2:
    learner_skill: 2.0
    challenge_level: 2.1
    flow_zone_quality: "High (optimal)"
    feedback_timing: "1-3s (reflective)"
    boredom_risk: "Medium (monitor)"
    anxiety_risk: "Low (able to complete)"

  level_3:
    learner_skill: 3.0
    challenge_level: 3.1
    flow_zone_quality: "High (stretch zone)"
    feedback_timing: "5-10s (delay for thinking)"
    boredom_risk: "Low (challenge high)"
    anxiety_risk: "Medium (monitor)"

  level_4:
    learner_skill: 4.0
    challenge_level: 4.2
    flow_zone_quality: "High (mastery zone)"
    feedback_timing: "10-30s (learner seeks help)"
    boredom_risk: "Low (expert challenge)"
    anxiety_risk: "Medium-High (expert stakes)"
```

**Checkpoint:** Challenge progression maintains flow throughout ✓

---

### Actor 3: deterding-intrinsic-validator

**Input:** All previous diagnostics + drive progression + flow design

**Role:** Ethical Gate for Challenge Progression

**Activities:**

1. **Audit for Dark Patterns Across Levels**
   - Level 1: Are scaffolds supportive or controlling?
   - Level 2: Does difficulty increase feel fair or exploitative?
   - Level 3-4: Are challenges autonomous or coercive?

2. **Validate Intrinsic Motivation Arc**
   - ✓ Intrinsic grows from 60% → 95%? (good trajectory)
   - ❌ Intrinsic drops at Level 3? (red flag - why?)
   - Level 3 re-design if intrinsic motivation tanks

3. **Check for Addiction Mechanics**
   - Are learners compulsively retaking levels? (red flag)
   - Is progress genuinely mastery or just engagement metrics? (must be mastery)
   - Does progression support long-term growth or short-term engagement? (must be long-term)

4. **Validate Autonomy Preservation**
   - Can learner choose their own pace? (must support)
   - Can learner skip levels if capable? (should allow)
   - Can learner opt out and return later? (must allow)

5. **Identify Ethical Risks**
   - Gamification that enables deep learning? (✓ good)
   - Gamification that hijacks psychology for profit? (❌ block)
   - Difficulty designed for learning or for engagement metrics? (must be learning)

**Output: Ethical Validation Decision**
- ✅ APPROVED (all mechanics ethical, progression sound)
- ⚠️ CONDITIONAL (approve with specific modifications)
- ❌ REDESIGN (ethical issues must be resolved)

**Checkpoint: WF-CHALLENGE-002 (Ethical Gate)**
- [ ] No dark patterns identified
- [ ] Intrinsic motivation arc healthy (grows with progression)
- [ ] No addiction mechanics
- [ ] Autonomy preserved at each level
- [ ] Assessment approach ethical (measures learning, not engagement)
- [ ] ✅ APPROVED or ⚠️ CONDITIONAL with explicit modifications

**On Failure:** Return to source agents for redesign.

---

## Phase 3: Level Progression Design (Sequential Tier 1)

### Duration
1.5-2 hours (sequential handoffs)

### Purpose
Design each of the 4 levels in detail: what learner does, what they learn, how they progress, what keeps them motivated.

### Actor 1: gee-learning-architect

**Input:** All Tier 0 diagnostics + Chief's challenge brief

**Role:** Pedagogical scaffolding by level + 36 principles implementation

**Activities:**

1. **Level-by-Level Pedagogical Design**

   **LEVEL 1: NOVICE → COMPETENT**
   - **Learning Objective:** Learner can perform core skill with support
   - **36 Principles Applied:**
     - Empowered Learners: Simple choices (2 options, not 10)
     - Meaningful Challenges: "This is foundational for everything"
     - Productive Failure: 1-2 intentional misconceptions to surface
     - Performance Before Competence: Do it now, refinement later
     - Consolidated Learning: 3+ low-stakes attempts before evaluation
   - **Scaffolding Level:** HIGH
     - Provide step-by-step prompts
     - Show examples of correct performance
     - Offer immediate help
   - **Learning Sequence:**
     1. Demonstrate skill (show how it's done)
     2. Guided practice (coach supports learner)
     3. Independent attempt (learner tries alone)
     4. Feedback & refinement (coach shows what worked)

   **LEVEL 2: COMPETENT → PROFICIENT**
   - **Learning Objective:** Learner can perform core skill independently
   - **36 Principles Applied:**
     - Performance Before Competence: Now learner performs without examples
     - Multiple Routes: "Here are 3 different approaches, pick one"
     - Conceptual Before Procedural: "Why this approach? When to use it?"
     - Consolidated Learning: 5+ attempts with decreasing support
   - **Scaffolding Level:** MODERATE
     - Hints instead of solutions
     - Examples rare, principles emphasized
     - Learner troubleshoots own errors
   - **Learning Sequence:**
     1. Learner attempts independently
     2. Learner analyzes own performance
     3. Learner adjusts approach
     4. Coach provides minimal feedback
     5. Repeat with new variation

   **LEVEL 3: PROFICIENT → ADVANCED**
   - **Learning Objective:** Learner can adapt skill to novel contexts
   - **36 Principles Applied:**
     - Meaningful Challenges: "Real-world challenge: [specific case]"
     - Empowered Learners: "You choose which context to tackle"
     - Transfer Design: "How does this principle apply here?"
     - Identity Development: "You're becoming an expert in [domain]"
   - **Scaffolding Level:** MINIMAL
     - No hints, no examples, learner figures out
     - Coach asks questions ("Why did you choose that?")
     - Peer learning emerges
   - **Learning Sequence:**
     1. Novel context challenge presented
     2. Learner independently attempts
     3. Learner explains their approach
     4. Peer feedback or coach challenges thinking
     5. Learner refines approach

   **LEVEL 4: ADVANCED → EXPERT**
   - **Learning Objective:** Learner can master edge cases, teach others, advance field
   - **36 Principles Applied:**
     - Empowered Learners: "Design your own challenge"
     - Identity Development: "You are now an expert, mentor others"
     - Transfer & Innovation: "How to apply this to unsolved problems?"
   - **Scaffolding Level:** NONE
     - Coach is now peer/colleague
     - Challenge is self-directed
     - Learner teaches others
   - **Learning Sequence:**
     1. Self-directed challenge (learner identifies gap)
     2. Independent research & experimentation
     3. Teach a peer or document insights
     4. Receive expert feedback
     5. Contribute to community knowledge

2. **Design Progression Bridges**
   - What happens between Level 1 → 2?
   - Bridge activity: Deliberate practice on Level 1, preparation for Level 2 concepts
   - What happens between Level 2 → 3?
   - Bridge activity: Real-world application of Level 2, reflection on novel contexts
   - Bridges = consolidation + preparation

3. **Map Prerequisite Dependencies**
   - Level 1 prerequisite: [Knowledge/skill learner already has]
   - Level 2 prerequisite: [Mastery of Level 1 + X new knowledge]
   - Level 3 prerequisite: [Transfer ability from Level 2]
   - Level 4 prerequisite: [Expert-level thinking in Level 3]

4. **Design Transfer Architecture**
   - Level 1 transfer: Not applicable (foundational)
   - Level 2 transfer: From guided → independent (transfer of support)
   - Level 3 transfer: From Level 3 context → novel contexts (big leap!)
   - Level 4 transfer: From mastery → contribution (expert to field)

**Output: Gee Level Specifications**
```yaml
gee_specifications:
  level_1:
    objective: "Learner can perform skill with coaching support"
    scaffolding: "HIGH"
    principles_applied: ["Empowered Learners", "Meaningful Challenges", ...]
    learning_sequence:
      step_1: "Demonstrate"
      step_2: "Guided practice"
      step_3: "Independent attempt"
      step_4: "Feedback & refinement"
    consolidation: "3+ attempts, increasing independence"

  level_2:
    objective: "Learner can perform skill independently"
    scaffolding: "MODERATE"
    principles_applied: ["Performance Before Competence", "Multiple Routes", ...]
    learning_sequence:
      step_1: "Independent attempt"
      step_2: "Self-analysis"
      step_3: "Adjustment"
      step_4: "Minimal feedback"
    consolidation: "5+ attempts, full independence"

  level_3:
    objective: "Learner can adapt skill to novel contexts"
    scaffolding: "MINIMAL"
    principles_applied: ["Meaningful Challenges", "Empowered Learners", ...]
    learning_sequence:
      step_1: "Novel context challenge"
      step_2: "Independent attempt"
      step_3: "Explain approach"
      step_4: "Peer/coach challenge"
    consolidation: "2-3 novel contexts, mastery emerging"

  level_4:
    objective: "Learner can master edge cases, teach others, advance field"
    scaffolding: "NONE"
    principles_applied: ["Empowered Learners", "Identity Development", ...]
    learning_sequence:
      step_1: "Self-directed challenge"
      step_2: "Independent research"
      step_3: "Teach/document"
      step_4: "Expert feedback"
    consolidation: "Expert-level contribution"

  progression_bridges:
    level_1_to_2: "Deliberate practice on L1, introduction to L2 concepts"
    level_2_to_3: "Real-world application thinking, novel context prep"
    level_3_to_4: "Expert challenges, teaching opportunities"
```

**Handoff to:** Eyal (Engagement Designer)

**Checkpoint: WF-CHALLENGE-003**
- [ ] All 4 levels pedagogically designed
- [ ] Scaffolding progression clear (high → moderate → minimal → none)
- [ ] Learning sequences specified
- [ ] Progression bridges designed
- [ ] Transfer architecture defined

---

### Actor 2: eyal-engagement-designer

**Input:** Gee's level specifications + Tier 0 diagnostics

**Role:** Engagement maintenance across difficulty progression

**Activities:**

1. **Design Hook Model for Each Level**

   **Level 1 Hook:**
   - Trigger: "Ready to build [skill]? Start here"
   - Action: "Attempt first challenge" (low friction)
   - Variable Reward: "Immediate success signal" (confidence boost)
   - Investment: "You're starting a journey to [expert level]"

   **Level 2 Hook:**
   - Trigger: "You mastered Level 1. Ready for next?"
   - Action: "Attempt Level 2 challenge" (moderate friction, higher stakes)
   - Variable Reward: "Notice yourself solving independently" (mastery signal)
   - Investment: "You're building real-world capability"

   **Level 3 Hook:**
   - Trigger: "Experts face novel contexts. Can you?"
   - Action: "Apply skill to new situation" (high friction, real challenge)
   - Variable Reward: "Realize you solved novel problem" (adaptation signal)
   - Investment: "You're becoming an expert"

   **Level 4 Hook:**
   - Trigger: "Ready to lead? Experts teach and advance the field"
   - Action: "Design own challenge or teach peer" (complete autonomy)
   - Variable Reward: "See impact on others or field" (contribution signal)
   - Investment: "You're a recognized expert"

2. **Design Variable Reward Structure by Level**

   **Level 1 Rewards (Confidence Focus):**
   - Immediate success signals (✓ got it right!)
   - Progress bars (you're 20% through!)
   - Encouragement (great effort!)
   - Social: "Others at your level succeeded"

   **Level 2 Rewards (Mastery Focus):**
   - Recognition of improvement (faster than last time!)
   - Challenge progression (next one will be harder)
   - Comparative: "You solved this as fast as experts"
   - Surprise: Different challenge types keep novelty

   **Level 3 Rewards (Adaptation Focus):**
   - Novel problem solved (you adapted successfully!)
   - Recognition: "Only 20% of learners reach this level"
   - Peer learning: See how others tackled this
   - Real-world impact: "This skill applies to [job role]"

   **Level 4 Rewards (Contribution Focus):**
   - Peer recognition (you taught X people)
   - Published insights (your thinking added to knowledge base)
   - Community role (you're now a mentor)
   - Autonomy: "You lead this now"

3. **Design Engagement Momentum by Level**

   **Level 1 Energy Curve:**
   - Opening: Hook enthusiasm (exciting to start)
   - Middle: Steady confidence building
   - Climax: First success feeling (I can do this!)
   - Resolution: Ready for Level 2

   **Level 2 Energy Curve:**
   - Opening: Rising challenge
   - Middle: Struggle-success-struggle (productive difficulty)
   - Climax: Independence achieved (I don't need help!)
   - Resolution: Ready for real-world application

   **Level 3 Energy Curve:**
   - Opening: Excitement of novel context
   - Middle: Adaptation challenge (thinking differently)
   - Climax: Transfer success (principle applies here!)
   - Resolution: Ready to teach/lead

   **Level 4 Energy Curve:**
   - Opening: Expert-level challenge or mentoring
   - Middle: Self-directed mastery (autonomous learning)
   - Climax: Contribution moment (I advanced this field)
   - Resolution: Legacy building (paying it forward)

4. **Design Engagement Metrics by Level**

   **Level 1 Metrics (Health Check):**
   - Completion rate: >80% start Level 1
   - Attempt pattern: 3-5 attempts normal
   - Time per attempt: 10-20 min per challenge
   - Satisfaction: >4/5

   **Level 2 Metrics:**
   - Progression rate: >75% complete Level 1 → Level 2
   - Attempt pattern: 2-3 attempts per challenge
   - Time per attempt: 15-30 min (more complex)
   - Independence: Fewer help requests than Level 1

   **Level 3 Metrics:**
   - Progression rate: >60% complete Level 2 → Level 3
   - Attempt pattern: 1-2 attempts (expertise showing)
   - Time per attempt: 20-40 min (adaptive thinking)
   - Novel context success: >70% first-attempt success

   **Level 4 Metrics:**
   - Progression rate: >40% reach Level 4 (expected drop)
   - Self-directed engagement: Learner initiates challenges
   - Teaching activity: Learner helps others
   - Contribution rate: Documentation, peer reviews, etc.

5. **Design Habit Loop Prevention**
   - Level 1: Monitor for compulsive retaking (sign of anxiety, not engagement)
   - Level 2: Monitor for plateau (sign of boredom, increase challenge)
   - Level 3: Monitor for abandonment (novel context too hard, add scaffolding)
   - Level 4: Monitor for expert fatigue (mentor burden too high)

**Output: Eyal Engagement by Level**
```yaml
eyal_specifications:
  level_1:
    hook:
      trigger: "Ready to start?"
      action: "First attempt"
      reward: "Success signal + encouragement"
      investment: "Progress toward expertise"

    variable_rewards: ["Success markers", "Progress bars", "Encouragement", "Social proof"]

    engagement_momentum: "Confidence building → First success"

    metrics:
      completion_rate: ">80%"
      satisfaction: ">4/5"
      attempt_pattern: "3-5 attempts"

  level_2:
    hook:
      trigger: "Master Level 1? Try Level 2"
      action: "Independent attempt"
      reward: "Mastery recognition"
      investment: "Real-world capability"

    variable_rewards: ["Improvement recognition", "Challenge progression", "Comparative success", "Novelty"]

    engagement_momentum: "Rising challenge → Independence achievement"

    metrics:
      progression_rate: ">75%"
      independence: "Fewer help requests"
      attempt_pattern: "2-3 attempts"

  # Level 3 and 4 follow same structure...
```

**Handoff to:** McGonigal (Resilience Storyteller)

**Checkpoint: WF-CHALLENGE-004**
- [ ] Hook model designed for all 4 levels
- [ ] Variable reward structure avoids dark patterns
- [ ] Engagement momentum curve designed
- [ ] Engagement metrics specified
- [ ] Habit loop prevention addressed

---

### Actor 3: mcgonigal-resilience-storyteller

**Input:** Eyal's engagement by level + Gee's progression design

**Role:** Narrative meaning across difficulty progression

**Activities:**

1. **Design Hero's Journey Across All 4 Levels**

   **Level 1: The Call**
   - Narrative Frame: "You're beginning a quest to become [expert]"
   - Why This Matters: "This foundational skill is key to [larger purpose]"
   - Hero Identity: "You're someone willing to grow"

   **Level 2: The Challenge**
   - Narrative Frame: "Now you face challenges alone. You're ready"
   - Why This Matters: "Independent mastery is where real growth happens"
   - Hero Identity: "You're becoming capable and confident"

   **Level 3: Transformation**
   - Narrative Frame: "You face novel challenges. You're adapting like an expert"
   - Why This Matters: "Adaptation is what separates experts from competent"
   - Hero Identity: "You're becoming an expert in your field"

   **Level 4: Mastery & Legacy**
   - Narrative Frame: "Now you lead. You teach. You advance the field"
   - Why This Matters: "Expert contribution benefits the whole community"
   - Hero Identity: "You're a recognized expert, a mentor, a contributor"

2. **Design Resilience Reframing by Level**

   **Level 1 Struggle:**
   - If learner fails: "Struggle means you're learning. This is where growth happens"
   - If frustrated: "Frustration is normal. It means you're at the edge of your ability"
   - Reframe: "Every mistake teaches you something"

   **Level 2 Struggle:**
   - If learner fails: "You're trying something hard. That's expert behavior"
   - If stuck: "Expert problem-solving involves struggle. You're developing that muscle"
   - Reframe: "Difficulty signals you're developing real skill"

   **Level 3 Struggle:**
   - If learner fails on novel context: "You're pushing beyond your comfort zone. Experts do this"
   - If frustrated: "Novel challenges are supposed to be hard. You're adapting"
   - Reframe: "This struggle is where expertise deepens"

   **Level 4 Struggle:**
   - If learner avoids teaching: "Sharing expertise feels vulnerable. That's normal"
   - If self-doubt: "Experts doubt themselves. Growth happens anyway"
   - Reframe: "Your contribution matters, even when uncertain"

3. **Design Meaning Moments by Level**

   **Level 1 Meaning Moments:**
   - "This skill will help you [real-world application]"
   - "You're joining thousands learning this skill"
   - "Your first success proves you can do this"

   **Level 2 Meaning Moments:**
   - "Notice: You just solved this without help. That's growth"
   - "You're now independent. This is real mastery"
   - "See how this principle applies in real work?"

   **Level 3 Meaning Moments:**
   - "You just adapted to a novel context. Few reach this"
   - "Your expertise is now visible in real-world performance"
   - "How will you use this expertise?"

   **Level 4 Meaning Moments:**
   - "See the impact you're having on others?"
   - "Your insights are advancing this field"
   - "You're a recognized expert now"

4. **Design Emotional Journey by Level**

   **Level 1:** Curiosity → Confidence → "I can do this!"
   **Level 2:** Challenge → Determination → "I did it alone!"
   **Level 3:** Excitement → Adaptation → "I'm becoming an expert!"
   **Level 4:** Mastery → Purpose → "I'm contributing to this field"

5. **Design Identity Arc**

   - **Opening (Level 1):** "You have potential to become [expert]"
   - **Midpoint (Level 2):** "You're independent now. You're capable"
   - **Turning Point (Level 3):** "Notice: You're thinking like an expert"
   - **Closing (Level 4):** "You are now a recognized expert. You lead"

**Output: McGonigal Narrative by Level**
```yaml
mcgonigal_specifications:
  level_1:
    hero_journey: "The Call - Begin your quest"
    narrative_frame: "Foundational skill is beginning of expertise journey"
    resilience_reframing: "Struggle = learning in progress"
    meaning_moments: ["Real-world application", "Community connection", "First success"]
    emotional_journey: "Curiosity → Confidence → I can do this!"
    identity: "You have potential"

  level_2:
    hero_journey: "The Challenge - Face it alone"
    narrative_frame: "Real mastery means independent performance"
    resilience_reframing: "Difficulty = expertise development"
    meaning_moments: ["Independence achieved", "Principle recognition", "Growth visible"]
    emotional_journey: "Challenge → Determination → I did it alone!"
    identity: "You're capable and independent"

  # Level 3 and 4 follow similar structure...
```

**Handoff to:** Kapp (Instructional Integrator)

**Checkpoint: WF-CHALLENGE-005**
- [ ] Hero's Journey framework applied to all 4 levels
- [ ] Resilience reframing specified
- [ ] Meaning moments identified
- [ ] Emotional journey designed
- [ ] Identity arc clear

---

### Actor 4: kapp-instructional-integrator

**Input:** All previous Tier 1 specs + Tier 0 diagnostics

**Role:** Assessment integration & feedback architecture across progression

**Activities:**

1. **Design Assessment by Level**

   **Level 1 Assessment:**
   - What: Can learner perform core skill with coaching?
   - How: Attempt challenges, coach evaluates (not formal test)
   - Criteria: Correctness 60%+, Shows attempt even if wrong
   - Frequency: Continuous (feedback at every attempt)
   - Stakes: Low (no penalty for errors)

   **Level 2 Assessment:**
   - What: Can learner perform skill independently?
   - How: Attempt challenges without help, self-evaluate
   - Criteria: Correctness 75%+, Independence demonstrated
   - Frequency: Per challenge (each challenge is mini-assessment)
   - Stakes: Medium (progress blocked if not competent)

   **Level 3 Assessment:**
   - What: Can learner adapt skill to novel contexts?
   - How: Apply skill to novel situation, explain reasoning
   - Criteria: Transfer success 70%+, Reasoning sound
   - Frequency: Per novel context
   - Stakes: Medium-High (reaching expert level requires this)

   **Level 4 Assessment:**
   - What: Can learner master edge cases, teach, contribute?
   - How: Self-directed project, peer review, contribution
   - Criteria: Original insight, teaching quality, field contribution
   - Frequency: Ongoing (no endpoint, continuous mastery)
   - Stakes: High (expert performance expected)

2. **Design Feedback Architecture by Level**

   **Level 1 Feedback (High Frequency, Coaching Focus):**
   - Timing: Immediate (100-300ms) per Schultz dopamine
   - Content: "You got X right. Here's why it matters. Try this next"
   - Tone: Encouraging, supportive
   - Frequency: After every attempt

   **Level 2 Feedback (Moderate Frequency, Learning Focus):**
   - Timing: 1-3 seconds per Schultz (learner should try thinking first)
   - Content: "You solved this. Notice how principle X applied. Try applying Y next"
   - Tone: Informative, building independence
   - Frequency: After each challenge

   **Level 3 Feedback (Low Frequency, Challenge Focus):**
   - Timing: 5-15 seconds (learner should struggle, then get feedback)
   - Content: "Your approach was X. That worked because Y. Consider also Z"
   - Tone: Sophisticated, peer-to-peer
   - Frequency: Only when requested or after significant attempt

   **Level 4 Feedback (Expert-to-Expert, Contribution Focus):**
   - Timing: Delayed (24-48 hours) for deep reflection
   - Content: Expert review of contribution, suggestions for impact
   - Tone: Professional, collegial
   - Frequency: Quarterly or project-based

3. **Design Misconception Correction by Level**

   **Level 1 Misconceptions:**
   - Common: "This skill doesn't matter"
   - Correction: "Actually, this principle applies everywhere because..."
   - Learning: Help learner see relevance

   **Level 2 Misconceptions:**
   - Common: "One approach is always right"
   - Correction: "Actually, multiple approaches work. Here's when each applies"
   - Learning: Help learner think contextually

   **Level 3 Misconceptions:**
   - Common: "Rules always apply the same way"
   - Correction: "Actually, experts adapt rules. Here's how..."
   - Learning: Help learner think like expert

   **Level 4 Misconceptions:**
   - Common: "I understand everything about this"
   - Correction: "Actually, edge case X challenges that understanding. Consider..."
   - Learning: Deepen expert thinking

4. **Design Real-Time Feedback Timing**

   From Schultz dopamine architecture + Csikszentmihalyi flow:

   **Level 1 Timeline:**
   ```
   0ms: User attempts
   → 100ms: Visual acknowledgment
   → 200ms: Correctness (✓/✗)
   → 500ms: Explanation (why)
   → 1000ms: Next prompt (keep momentum)
   ```

   **Level 2 Timeline:**
   ```
   0ms: User attempts
   → 500ms: User thinks (no immediate feedback)
   → 1000ms: Correctness + principle
   → 3000ms: Next challenge
   ```

   **Level 3 Timeline:**
   ```
   0ms: User attempts
   → 5000ms: User tries to solve self
   → 10000ms: Feedback on approach
   → 30000ms: Next challenge or reflection
   ```

   **Level 4 Timeline:**
   ```
   0ms: User works on self-directed challenge
   → 1000ms: Checkpoint (user confirms progress)
   → 24-48h: Expert feedback on approach
   → 1 week: Reflection and next challenge
   ```

5. **Design Learning Objective Integration**

   **Level 1:** Objective = "Perform skill with support"
   - Assessment measures: Correctness, attempt quality
   - Feedback connects to: Principle explanations

   **Level 2:** Objective = "Perform skill independently"
   - Assessment measures: Correctness without help, independence
   - Feedback connects to: Principle + independence marker

   **Level 3:** Objective = "Adapt skill to novel contexts"
   - Assessment measures: Transfer success, reasoning quality
   - Feedback connects to: Principle application in new context

   **Level 4:** Objective = "Master, teach, contribute"
   - Assessment measures: Insight quality, teaching effectiveness, contribution
   - Feedback connects to: Expert-level thinking, field impact

**Output: Kapp Assessment by Level**
```yaml
kapp_specifications:
  level_1:
    assessment:
      what: "Can perform skill with coaching"
      how: "Continuous evaluation of attempts"
      criteria: "Correctness 60%+, Shows effort"
      stakes: "Low"

    feedback:
      timing: "100-1000ms (immediate)"
      content: "Correctness + explanation + next prompt"
      frequency: "After every attempt"
      tone: "Coaching, encouraging"

    learning_objectives:
      primary: "Perform skill with coaching support"
      measurement: "Correctness, attempt quality, engagement"

  level_2:
    assessment:
      what: "Can perform skill independently"
      how: "Self-evaluated challenge attempts"
      criteria: "Correctness 75%+, Independence shown"
      stakes: "Medium"

    feedback:
      timing: "1-3s (reflective)"
      content: "Principle + independent success recognition"
      frequency: "Per challenge"
      tone: "Informative, building independence"

    learning_objectives:
      primary: "Perform skill independently"
      measurement: "Correctness, independence markers"

  # Level 3 and 4 follow similar structure...
```

**Checkpoint: WF-CHALLENGE-006**
- [ ] Assessment designed for all 4 levels
- [ ] Feedback timing matches Schultz + Csikszentmihalyi
- [ ] Learning objective alignment 100%
- [ ] Misconception correction specified
- [ ] Performance vs learning feedback layers designed

---

## Phase 4: Narrative & Assessment Integration (Already Covered)

Phases 3 and 4 overlap significantly—all Tier 1 agents contribute to the complete specification.

---

## Phase 5: Delivery & Progression Handoff

### Duration
30-45 minutes

### Purpose
Integrate all specifications into actionable implementation guide for challenge progression design.

### Actor: dopamine-learning-chief

**Activities:**

1. **Integrate All Specifications**
   - Verify all Tier 0 diagnostics represented
   - Check all 4 levels coherent with each other
   - Identify any conflicts or inconsistencies
   - Ensure narrative threads connect across levels

2. **Create Level-by-Level Implementation Guides**
   - Level 1: Novice guide (what learner experiences)
   - Level 2: Intermediate guide (progression experience)
   - Level 3: Advanced guide (novel context challenges)
   - Level 4: Expert guide (self-directed and teaching)

3. **Create Progression Transition Guides**
   - Level 1 → 2 transition (what preparation, what skills transfer)
   - Level 2 → 3 transition (what changes, new capabilities needed)
   - Level 3 → 4 transition (expert readiness check)

4. **Create Monitoring & Adjustment Protocol**
   - Which metrics to track by level?
   - What indicates healthy progression vs problems?
   - What adjustments if progression stalls?

**Output: Challenge Progression Implementation Package**

```markdown
# Challenge Progression: Implementation Guide
## [Challenge Name]

### Overview
[Executive summary of skill, progression, timeline]

### Learning Outcomes by Level

#### Level 1: NOVICE → COMPETENT
**Outcome:** Learner can perform core skill with coaching support
**Timeline:** 3-5 days
**Effort:** 5-10 hours

**What Learner Experiences:**
- Day 1: Demonstration + guided practice
- Day 2-3: Independent attempts with coaching
- Day 4-5: Consolidation (3+ repetitions, building confidence)

**What Learner Learns:**
- Core skill mechanics
- Foundational principles
- When to use this skill

**Scaffolding Provided:**
- Step-by-step prompts
- Example performances
- Immediate error correction
- Encouragement and support

**Success Indicators:**
- 60%+ correctness on attempts
- 4+ independent attempts
- Learner reports: "I understand this"
- Satisfaction: >4/5

**What Happens Next:**
- Learner moves to Level 2 when: Mastery demonstrated
- Bridge activity: Deliberate practice on L1, intro to L2 concepts

---

#### Level 2: COMPETENT → PROFICIENT
**Outcome:** Learner can perform skill independently
**Timeline:** 5-7 days
**Effort:** 8-12 hours

**What Learner Experiences:**
- Day 1-2: Independent attempts (no examples, hints available)
- Day 3-4: Hints removed, learner solves problems
- Day 5-7: Repeated variations, mastery consolidation

**What Learner Learns:**
- Context-appropriate skill use
- When each approach works best
- Troubleshooting own errors

**Scaffolding Provided:**
- Hints (not solutions)
- Principle explanations (not procedures)
- Peer learning (not coach coaching)

**Success Indicators:**
- 75%+ correctness on attempts
- 2-3 attempts per challenge
- First-attempt success >40%
- Learner reports: "I can do this alone"

**What Happens Next:**
- Learner moves to Level 3 when: Independent mastery shown
- Bridge activity: Apply Level 2 skill in real-world context

---

#### Level 3: PROFICIENT → ADVANCED
**Outcome:** Learner can adapt skill to novel contexts
**Timeline:** 7-10 days
**Effort:** 10-15 hours

**What Learner Experiences:**
- Day 1-3: Novel context challenges (skill in unfamiliar situation)
- Day 4-7: Adaptation challenges (skill + new wrinkle)
- Day 8-10: Complex scenarios (multiple principles)

**What Learner Learns:**
- Expert-level adaptation
- Transfer of principle across contexts
- Edge case handling
- Expert decision-making

**Scaffolding Provided:**
- None (learner figures out)
- Questions (coach asks, not tells)
- Peer learning (discuss approach with peers)

**Success Indicators:**
- 70%+ first-attempt success on novel contexts
- Learner can explain reasoning
- Transfer to real-world evident
- Learner reports: "I'm thinking like an expert"

**What Happens Next:**
- Learner moves to Level 4 when: Adaptation mastery shown
- Bridge activity: Mentoring opportunity or edge case investigation

---

#### Level 4: ADVANCED → EXPERT
**Outcome:** Learner masters edge cases, teaches others, contributes to field
**Timeline:** Ongoing (no endpoint)
**Effort:** 5+ hours/week ongoing

**What Learner Experiences:**
- Self-directed challenge identification
- Research and experimentation
- Teaching peers or documenting insights
- Expert community engagement
- Contribution to field knowledge

**What Learner Learns:**
- Deep expertise in edge cases
- Teaching ability
- Leadership in field
- Continuous innovation

**Scaffolding Provided:**
- None (learner is self-directed)
- Expert feedback on contributions
- Community engagement
- Leadership opportunities

**Success Indicators:**
- Learner identifies own challenges
- Teaching others successfully
- Contributions recognized by peers
- Learner reports: "I'm an expert and mentor"

---

### Complete Question/Challenge Bank

[For each level, specify each challenge]

#### Level 1 Challenge 1: [Title]
**Skill being built:** [Specific skill]
**Difficulty:** Novice
**Scaffolding:** HIGH
**Attempt limit:** Unlimited (low stakes)

**Challenge Specification:**
[What learner attempts, constraints, success criteria]

**Correct Approach:**
[How to do it right, why it's right]

**Coaching Feedback (if wrong):**
- Common error 1: [Misconception]. Actually... [Correction]
- Common error 2: [Misconception]. Actually... [Correction]

**Learning Feedback (if right):**
[Explanation of principle, how it applies, preview of next level]

**Progression Logic:**
- [This challenge teaches] → [Next challenge requires]
- [Attempts needed] → [Moves to next challenge when]

---

### Progression Transitions

#### Level 1 → Level 2: From Coaching to Independence
**Transition Gate Criteria:**
- [ ] Level 1 mastery demonstrated (60%+ attempts correct)
- [ ] Learner ready for independence (confidence >3/5)
- [ ] Preparation complete (bridge activity done)

**What Changes:**
- Scaffolding removed (hints, examples gone)
- Frequency of feedback reduced (learner thinks first)
- Complexity increases (novel elements introduced)
- Autonomy increases (learner makes more choices)

**Learner Prep:**
- 3-5 deliberate practice attempts on Level 1 concepts
- Introduction to Level 2 principles
- Confidence building activity
- Peer discussion of transition

**How to Support:**
- "You're ready for this. Trust yourself"
- "This is harder. That means you're growing"
- "Struggle is normal. It means learning"
- "You can do this independently"

---

#### Level 2 → Level 3: From Performance to Adaptation
**Transition Gate Criteria:**
- [ ] Level 2 mastery demonstrated (75%+ correct)
- [ ] Independence shown (help requests <20% of attempts)
- [ ] Real-world application done (applies skill in job)

**What Changes:**
- Context becomes novel (skill in unfamiliar situations)
- Rules become flexible (context determines approach)
- Complexity increases (multiple principles interact)
- Expert thinking expected (reasoning visible)

**Learner Prep:**
- Real-world application assignment (use Level 2 skill)
- Reflection on principle variations ("When is approach X better than Y?")
- Expert interview (shadow expert, see adaptation)
- Confidence building ("You're ready for expert-level thinking")

**How to Support:**
- "You've mastered the basics. Now you adapt like experts do"
- "This context is novel. That's exactly where growth happens"
- "Your reasoning matters more than perfect execution"
- "You're thinking like an expert now"

---

#### Level 3 → Level 4: From Mastery to Contribution
**Transition Gate Criteria:**
- [ ] Level 3 mastery demonstrated (70%+ novel context success)
- [ ] Adaptation thinking shown (reasoning sound, principles applied)
- [ ] Expert identity emerging (learner sees self as expert)

**What Changes:**
- Challenge becomes self-directed (learner chooses what to work on)
- Teaching becomes central (learner teaches others)
- Contribution becomes goal (advance field, not just self)
- Autonomy complete (full expert status)

**Learner Prep:**
- Mentoring opportunity (teach peer Level 1-2)
- Research assignment (investigate edge case)
- Contribution opportunity (document insights, publish)
- Leadership opportunity (lead project or community)

**How to Support:**
- "You're an expert now. What's your next challenge?"
- "Your insights matter. How will you share them?"
- "Mentor someone. Teaching deepens your own expertise"
- "Contribute to the field. Shape what comes next"

---

### Monitoring Dashboard

#### Level 1 Health Metrics
- **Completion rate:** >80% complete Level 1
- **Attempt pattern:** 3-5 attempts per challenge average
- **Time per attempt:** 10-20 min per challenge
- **Satisfaction:** >4/5
- **Progression:** >75% advance to Level 2

**If completion <80%:**
- Action: Investigate opening hook (too hard? boring?)
- Fix: Simplify Level 1 or add more encouragement

**If satisfaction <4/5:**
- Action: Investigate scaffolding (too much? too little?)
- Fix: Adjust coaching frequency and feedback depth

#### Level 2 Health Metrics
- **Progression rate:** >75% from Level 1 → Level 2
- **Attempt pattern:** 2-3 attempts per challenge
- **Independence:** Help requests <20% of attempts
- **Time per attempt:** 15-30 min (more complex than L1)
- **First-attempt success:** >40% (learner improving)

**If progression <75%:**
- Action: Check Level 2 difficulty (too big jump from L1?)
- Fix: Add bridge activity or intermediate challenges

**If help requests >20%:**
- Action: Learner not ready for independence
- Fix: Additional L2 coaching or return to L1 concepts

#### Level 3 Health Metrics
- **Progression rate:** >60% from Level 2 → Level 3
- **Novel context success:** >70% first-attempt success
- **Adaptation quality:** Reasoning sound in >80%
- **Time per challenge:** 20-40 min (adaptive thinking)
- **Learner reports:** "Thinking like expert"

**If progression <60%:**
- Action: Level 2→3 transition too big
- Fix: More practice on transfer-focused activities at Level 2

**If novel context success <70%:**
- Action: Learner not ready for adaptation
- Fix: More guided practice on principle application before Level 3

#### Level 4 Health Metrics
- **Self-directed engagement:** Learner identifies own challenges
- **Teaching activity:** >1 peer mentored per quarter
- **Contribution rate:** Documented insights or peer reviews
- **Expert engagement:** Participation in field activities
- **Learner identity:** "I'm a recognized expert"

**If teaching <1/quarter:**
- Action: Expert not engaged in contribution
- Fix: Create mentoring opportunity or leadership role

**If contribution <1/quarter:**
- Action: Expert knowledge not being shared
- Fix: Documentation assignment or publication opportunity

---

### Adjustment Protocol

**If Engagement Drops at Any Level:**
1. Identify where: Which level? Which challenge type?
2. Diagnose why: Too hard? Too easy? Boring? Anxious?
3. Adjust based on diagnosis:
   - Too hard → Add scaffolding or reduce challenge
   - Too easy → Increase challenge or add novel wrinkle
   - Boring → Add narrative or social element
   - Anxious → Reduce stakes or add confidence activity

**If Learner Stalls (Doesn't Progress):**
1. Check mastery: Can learner perform current level?
2. If yes: Progression block (learner ready, gate not clear)
   - Action: Clarify gate criteria, help learner see readiness
3. If no: Learning block (learner not ready)
   - Action: Additional practice, revisit prerequisites

**If Learner Abandons Challenge:**
1. Check timing: Did they try too soon?
   - Action: Provide prerequisite or bridge activity
2. Check difficulty: Is it too hard?
   - Action: Add scaffolding or simplify challenge
3. Check motivation: Did motivation drop?
   - Action: Review narrative, add social element, celebrate progress

---

### Success Criteria

**Learning Success:**
- [ ] 70%+ complete Level 1
- [ ] 60%+ complete Level 2
- [ ] 45%+ complete Level 3
- [ ] 20%+ reach Level 4 expert status
- [ ] Mastery demonstrated at each level (80%+ performance)

**Engagement Success:**
- [ ] 80%+ Level 1 completion
- [ ] >4/5 satisfaction at each level
- [ ] Intrinsic motivation 60% → 95% progression
- [ ] <20% abandonment between levels

**Behavioral Success:**
- [ ] Real-world application within 7 days of Level 2
- [ ] 60%+ demonstrate mastery in real-work context
- [ ] Transfer to novel contexts evident at Level 3
- [ ] Expert contribution evident at Level 4

**Implementation Ready!**
```

---

## Quality Gates: 6 Critical Validation Points

### Quality Gate 1: Challenge Domain Clarity (Phase 1 Exit)
**Gate ID:** WF-CHALLENGE-Q1
**Validator:** dopamine-learning-chief
**Criteria:**
- [ ] Skill clearly defined (specific behaviors, not knowledge)
- [ ] Progression levels defined (what's different at each?)
- [ ] Success metrics measurable
- [ ] No ambiguity on what "expert" means

**Approval Indicates:** "We know what skill we're building"

---

### Quality Gate 2: Ethical Foundation (Phase 1 Exit)
**Gate ID:** WF-CHALLENGE-Q2
**Validator:** deterding-intrinsic-validator
**Criteria:**
- [ ] No dark patterns in difficulty progression
- [ ] Intrinsic motivation grows with progression
- [ ] No compulsion mechanics at any level
- [ ] Autonomy preserved throughout

**Decision Options:**
- ✅ APPROVED
- ⚠️ CONDITIONAL
- ❌ REDESIGN

**Approval Indicates:** "Progression respects learner"

---

### Quality Gate 3: Flow Zone Maintenance (Phase 2 Exit)
**Gate ID:** WF-CHALLENGE-Q3
**Validator:** csikszentmihalyi-flow-calibrator
**Criteria:**
- [ ] Challenge-skill balance maintained at all levels
- [ ] Difficulty curve smooth (no cliffs)
- [ ] Boredom/anxiety thresholds respected
- [ ] Feedback timing supports flow

**Approval Indicates:** "Learner stays in flow zone throughout"

---

### Quality Gate 4: Pedagogical Coherence (Phase 3 Mid-Point)
**Gate ID:** WF-CHALLENGE-Q4
**Validator:** gee-learning-architect
**Criteria:**
- [ ] 36 principles embedded at each level
- [ ] Scaffolding progression logical (high → moderate → minimal → none)
- [ ] Learning sequences clearly specified
- [ ] Progression bridges designed

**Approval Indicates:** "Questions teach, not just test"

---

### Quality Gate 5: Engagement Sustainability (Phase 3 Mid-Point)
**Gate ID:** WF-CHALLENGE-Q5
**Validator:** eyal-engagement-designer
**Criteria:**
- [ ] Hook model works at all levels
- [ ] Variable rewards avoid dark patterns
- [ ] Engagement momentum designed
- [ ] Habit loop prevention addressed

**Approval Indicates:** "Engagement authentic across all levels"

---

### Quality Gate 6: Assessment Integrity (Phase 4 Exit)
**Gate ID:** WF-CHALLENGE-Q6
**Validator:** kapp-instructional-integrator
**Criteria:**
- [ ] Assessment measures learning (not just engagement)
- [ ] Feedback timing optimized
- [ ] Learning objectives alignment 100%
- [ ] Misconception correction specified

**Approval Indicates:** "Every level measures real mastery"

---

## Error Handling & Recovery

### Error 1: Domain Ambiguity
**Symptom:** Unclear what skill is being taught at each level
**Recovery:** Chief clarifies skill definition, exact behaviors at each level

### Error 2: Difficulty Cliff
**Symptom:** Learner can't progress from Level 2 → 3
**Recovery:** Csikszentmihalyi redesigns difficulty curve, adds bridge activity

### Error 3: Motivation Drop
**Symptom:** Engagement collapses at Level 3
**Recovery:** Eyal + McGonigal redesign engagement and narrative at transition

### Error 4: Ethical Concern
**Symptom:** Deterding flags dark patterns or autonomy violation
**Recovery:** Halt progression design, return to source agent for redesign

### Error 5: Scaffolding Mismatch
**Symptom:** Learner still dependent on scaffolds at Level 3 (should be faded)
**Recovery:** Fogg + Gee redesign fading schedule, verify prerequisite mastery

### Error 6: Assessment Gap
**Symptom:** No clear way to know if learner mastered level
**Recovery:** Kapp designs specific assessment criteria and validation method

---

## Handoff Sequence

```
Challenge Spec
   ↓
Chief + Schultz + Fogg
   ↓ (parallel)
Chou + Csikszentmihalyi + Deterding (gate)
   ↓
Gee (4-level pedagogy)
   ↓
Eyal (engagement by level)
   ↓
McGonigal (narrative by level)
   ↓
Kapp (assessment by level)
   ↓
Chief (integration + implementation)
   ↓
Implementation Team
```

---

## Output Specification: What Gets Delivered

### Deliverable 1: Progression Implementation Guide
- Level-by-level specifications
- Challenge bank (50-100 challenges designed)
- Transition guides
- Monitoring protocol
- Adjustment framework

### Deliverable 2: Narrative & Scaffolding Spec
- Hero's journey across levels
- Resilience reframing by level
- Scaffolding fading schedule
- Identity arc
- Emotional journey

### Deliverable 3: Assessment & Feedback Framework
- Assessment criteria by level
- Feedback timing diagrams
- Misconception corrections
- Learning objective alignment
- Success metrics

### Deliverable 4: Monitoring Dashboard
- Daily metrics by level
- Adjustment triggers
- Health checks
- Progression gates

---

## Success Criteria

### Learning Success
- 70%+ Level 1 completion
- 60%+ Level 2 completion
- 45%+ Level 3 completion
- 20%+ reach expert status
- 80%+ mastery at each level

### Engagement Success
- >80% Level 1 completion
- >4/5 satisfaction average
- Intrinsic motivation 60% → 95%
- <20% abandonment between levels

### Behavioral Success
- 60%+ real-world mastery by day 30
- Transfer to novel contexts evident
- Expert contribution visible at Level 4

---

## Operational Notes

### When to Use This Workflow
✅ Building multi-level skill progression
✅ Designing learning curves with proper scaffolding
✅ Creating challenges with difficulty balance
✅ Ensuring motivation sustains across levels

### When NOT to Use This Workflow
❌ Single challenge (use simpler process)
❌ 2-level progression (may be overkill)
❌ Already-proven challenge set (use optimization workflow)

### Key Assumptions
- Skill is decomposable into 4 levels
- Learners progress at roughly similar pace
- Assessment possible at each level
- Implementation team can build challenges

### Estimated Squad Effort
- **Total agent hours:** 18-24 hours
- **Elapsed time:** 3-5 hours (parallel Tier 0)
- **Per-agent load:** 1.5-2.5 hours each

---

**Workflow Status:** ✓ Production Ready
**Last Updated:** 2026-02-12

