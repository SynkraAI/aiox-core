# Dopamine-Learning Knowledge Base

**Squad**: Dopamine Learning Squad
**Created**: 2026-02-12
**Version**: 1.0.0
**Purpose**: Consolidated domain knowledge for all 10 agents and 3 workflows

---

## TABLE OF CONTENTS

1. [Core Concepts](#core-concepts)
2. [Dopamine Mechanisms](#dopamine-mechanisms)
3. [Behavioral Models](#behavioral-models)
4. [Learning Principles](#learning-principles)
5. [Engagement & Habits](#engagement--habits)
6. [Narrative & Resilience](#narrative--resilience)
7. [Flow State & Calibration](#flow-state--calibration)
8. [Ethical Design Principles](#ethical-design-principles)
9. [Best Practices](#best-practices)
10. [Anti-Patterns & Pitfalls](#anti-patterns--pitfalls)
11. [Implementation Toolkit](#implementation-toolkit)

---

## CORE CONCEPTS

### Dopamine as Learning Signal (Schultz)

**Key Insight**: Dopamine is not a "pleasure chemical" — it's a teaching signal that encodes **prediction error** (the difference between expected and actual reward).

**Mechanisms**:
- **Reward Prediction Error (RPE)**: When actual outcome > expected outcome, dopamine spike teaches learning
- **Temporal Difference Learning**: Dopamine neurons predict future rewards and update predictions when they're wrong
- **Variable Rewards**: Unpredictable rewards trigger MORE dopamine than predictable ones (because uncertainty creates prediction errors)

**Application to Learning**:
- Immediate, unpredictable feedback maximizes dopamine for learning
- Surprising correct answers (versus expected) create strongest learning signal
- Timing matters: 100-500ms feedback window is neurobiologically optimal
- Difficulty surprises (easier-than-expected vs harder-than-expected) trigger learning dopamine

**Quote**: "Dopamine doesn't create pleasure. It creates desire, wanting, and learning." — Wolfram Schultz

---

### Behavior = Motivation × Ability × Prompt (Fogg)

**The Formula**: B = MAP

A behavior happens when ALL THREE elements are present simultaneously:
1. **Motivation** (M) - Does the person WANT to do this? (emotional appeal NOW)
2. **Ability** (A) - Can they easily DO it? (simplicity, not skill)
3. **Prompt** (P) - Is there a cue RIGHT NOW? (trigger at the moment of behavior)

**Critical**: If any one is zero, behavior doesn't happen. Increase weak elements.

**Application**:
- Low motivation → Add emotional appeal (gamification, meaning)
- Low ability → Simplify interaction (1-click answers, no complexity)
- Missing prompt → Add cue (notification, suggestion, time-triggered)

**Example**: Quiz immersive
- M: Frame as quest (emotional appeal)
- A: One-click answers (simplicity)
- P: Immediate next question (seamless trigger)

---

### Core Drives (Chou - Octalysis)

**8 Core Drives** that motivate human behavior:

1. **Epic Meaning & Calling** - Sense of purpose ("saving the world")
2. **Development & Accomplishment** - Progress, leveling up, mastery
3. **Empowerment of Creativity & Feedback** - Freedom to express, experiment, see immediate impact
4. **Ownership & Possession** - Sense of ownership ("my profile," "my progress")
5. **Social Influence & Relatedness** - Community, connection, comparison
6. **Scarcity & Impatience** - Artificial scarcity drives urgency (limited time offers)
7. **Unpredictability & Curiosity** - Uncertainty and discovery trigger engagement
8. **Loss & Avoidance** - Fear of losing what we have (FOMO, streaks)

**Key Principle**: Most people respond to 2-3 drives, not all 8. Identify primary drives for your learner.

**Application to Learning**:
- Frame as epic quest (Drive 1)
- Show progress visually (Drive 2)
- Allow multiple solution approaches (Drive 3)
- Build personal portfolios (Drive 4)
- Create leaderboards or study groups (Drive 5)
- Time-limited challenges (Drive 6)
- Variable reward quiz mechanics (Drive 7)
- Maintain learning streaks (Drive 8)

---

## DOPAMINE MECHANISMS

### The 5 Core Dopamine Triggers in Learning

1. **Unpredictability** - Variable outcomes (randomized difficulty, surprise rewards)
   - Trigger: Each question difficulty is slightly unpredictable
   - Dopamine: Prediction error when actual difficulty differs from expected

2. **Prediction Error** - Mismatch between expected and actual
   - Trigger: Question easier/harder than anticipated
   - Dopamine: "Aha!" moment when understanding clicks

3. **Anticipation** - Uncertainty about WHEN reward comes
   - Trigger: Feedback timing varies (100-500ms)
   - Dopamine: Sustained activity while waiting for feedback

4. **Timing** - Immediate feedback during learning window
   - Trigger: Feedback within 500ms of answer
   - Dopamine: Peak amplification of learning signal

5. **Competence** - Mastery experience + self-determination
   - Trigger: Challenges matched to skill level (flow state)
   - Dopamine: Intrinsic motivation dopamine (not extrinsic reward dopamine)

### Dopamine Timing Specifications

| Feedback Layer | Timing | Dopamine Effect | Purpose |
|---|---|---|---|
| Layer 1: Correctness Signal | 100-200ms | Immediate spike | Satisfies prediction error |
| Layer 2: Explanation | 300-500ms | Sustained activity | Encodes learning |
| Layer 3: Principle | 1-3s | Integration dopamine | Connects to existing knowledge |
| Layer 4: Next Steps | 5-15s | Anticipation | Prepares for next learning |

---

## BEHAVIORAL MODELS

### B=MAP Failure Analysis

**Common Failure Points**:

| Problem | Root Cause | Solution |
|---|---|---|
| "No one answers questions" | Low M | Add narrative frame, emotional appeal |
| "Users abandon halfway" | Low A | Simplify interface, remove friction |
| "People forget to practice" | Missing P | Send reminders, notifications, schedules |
| "Compliance but no engagement" | Wrong M | Shift from extrinsic (grades) to intrinsic (mastery) |

### Behavioral Psychology Laws

**Law of Attraction**: We're drawn to activities that match our personality and values
- Solution: Segment learners, customize narrative accordingly

**Law of Habit Formation**: 66 days average to form habit (range: 18-254 days)
- Solution: Design feedback loops that reinforce desirable behavior

**Law of Reciprocity**: We repay in kind what we receive
- Solution: Provide generous feedback, learners reciprocate with effort

---

## LEARNING PRINCIPLES

### Gee's 36 Learning Principles (Highlights)

**16 Core Principles for Game-Based Learning**:

1. **Empowered Learners** - Agency and control over their learning
2. **Problem Solving** - Learn through solving meaningful problems
3. **Meaningful Choices** - Decisions matter and have consequences
4. **Situated Learning** - Learn in the context where knowledge is used
5. **Productive Failure** - Safe failure with instructional support
6. **Conceptual Challenges** - Deep learning, not fact memorization
7. **Just-in-Time Information** - Instruction when needed, not before
8. **System Thinking** - Understand interconnections and feedback loops
9. **Distributed Knowledge** - Learning spread across multiple modalities
10. **Transfer** - Apply learning to new contexts
11. **Motivation** - Intrinsic motivation through meaningful goals
12. **Pleasantly Frustrating** - Challenge at the edge of ability
13. **Cycles of Expertise** - Novice → Intermediate → Advanced → Expert
14. **Identity** - Learners adopt identities within the learning space
15. **Relationship** - Mentorship and social learning
16. **Multimodal** - Multiple ways to engage with content

**Application**:
- Provide meaningful choices in question response
- Scaffold failure with hints and explanation
- Teach conceptually, not just facts
- Use dialogue and interaction, not lecture
- Create progression cycles (L1→L2→L3→L4)

---

## ENGAGEMENT & HABITS

### Hook Model Sequence (Eyal)

**The Loop That Creates Habit**:

1. **Trigger** (External or Internal)
   - External: Notification, time, location
   - Internal: Boredom, curiosity, desire to progress

2. **Action** (Simplest behavior in anticipation of reward)
   - Must be easy (ability is high)
   - Must be motivated (emotional appeal)
   - Must be prompted (trigger is present)

3. **Variable Reward** (Unpredictable outcome)
   - Tribe rewards (social validation, leaderboard)
   - Hunt rewards (information, discovery)
   - Self rewards (achievement, progression)
   - Importance: Variability > magnitude

4. **Investment** (User invests time/data/effort)
   - Personalization ("my profile")
   - Customization ("my preferences")
   - Effort ("I earned this")
   - Importance: Increases sense of ownership and habit strength

**Habit Loop Re-triggers**: Cycle repeats, strengthening neural pathways

**Application to Questions**:
- Trigger: Time to next practice, notification
- Action: Click answer (one tap)
- Reward: Variable feedback (sometimes brief, sometimes detailed)
- Investment: Personalized progress dashboard

### Variable Reward Formula

**Most Effective**: Small probability of LARGE unpredictable reward
- Example: 10% chance of getting detailed explanation vs 90% chance of brief feedback

**Less Effective**: Guaranteed small reward
- Example: Every answer gets 5 points (predictable, weak dopamine)

**Implementation**:
- Randomize feedback depth (some detailed, some brief)
- Randomize difficulty (some easy, some hard)
- Randomize timing (some fast, some slow)
- Maintain unpredictability without frustration

---

## NARRATIVE & RESILIENCE

### Hero's Journey Framework (McGonigal)

**The 7-Stage Arc**:

1. **Ordinary World** - Learner's starting point (pre-test, initial state)
2. **Call to Adventure** - The challenge ("Can you master this?")
3. **Refusal of the Call** - Initial doubt ("This is hard")
4. **Meeting the Mentor** - Support system appears (hints, feedback, allies)
5. **Crossing the Threshold** - Commit to the challenge ("I'm going to figure this out")
6. **Tests, Allies, Enemies** - Progressive difficulty with support (L1→L2→L3)
7. **Ordeal & Reward** - Final challenge and mastery ("I did it!")

**Key**: Learner is the HERO, not passive recipient

**Application**:
- Quiz Immersivo: Frame as quest for learner (not testing)
- Challenge: Each level is a new ordeal to overcome
- Assessment: Final level is the supreme challenge, with celebration of success

### Gameful Resilience Principles

**Resilience = Ability to bounce back from difficulty**

**How games build resilience**:
1. **Safe Failure** - Failure has no real consequences (try again)
2. **Clear Goals** - Know what success looks like
3. **Immediate Feedback** - Understand what went wrong and why
4. **Progressive Challenge** - Gradually increase difficulty as skills grow
5. **Meaningful Purpose** - Challenge is worth the effort

**Anti-Resilience**:
- Punitive feedback ("You're wrong")
- Vague guidance ("Try harder")
- Stagnant difficulty (too easy or too hard)
- Meaningless challenges (busywork)

---

## FLOW STATE & CALIBRATION

### Flow Zone Calculation (Csikszentmihalyi)

**Flow = Challenge level matches Skill level at edge of capability**

```
HIGH  |        Flow Zone        |  Anxiety
      |                         |
      | <-- FLOW -->           | Challenge too high
      |                         |
Challenge Level |         |
      | Skill matches challenge |
      |                         |
LOW   |        Boredom          |  Apathy
      |                         |
      Challenge too low         Skill too low
      +----------+-----------+----------+
      LOW              Skill Level           HIGH
```

**Calculating Flow**:
- **Learner Skill**: 1-10 scale (self-reported or assessed)
- **Challenge Level**: 1-10 scale (based on learning objective difficulty)
- **Flow Zone**: Challenge = Skill ± 1 (within 1 point on either side)

**Application**:
- Level 1: Skill 2-3 → Challenge 2-4 (coaching, scaffolding)
- Level 2: Skill 4-5 → Challenge 4-6 (support, guidance)
- Level 3: Skill 6-7 → Challenge 6-8 (independence, stretch)
- Level 4: Skill 8-9 → Challenge 8-10 (mastery, self-directed)

**Monitoring Flow**:
- Boredom signal: Questions too easy, completion time < 1 min
- Anxiety signal: Questions too hard, abandonment rate > 30%
- Flow signal: Time on task 2-5 min, completion rate > 80%

---

## ETHICAL DESIGN PRINCIPLES

### Deterding's Intrinsic Motivation Checklist

**Self-Determination Theory**: Humans need autonomy, competence, and relatedness

**Autonomy Checklist**:
- [ ] Meaningful choices in quiz responses (not binary yes/no)
- [ ] Multiple solution paths ("Choose your approach")
- [ ] Control over pace/difficulty (learner decides progression)
- [ ] Transparency ("Here's why I'm asking this")

**Competence Checklist**:
- [ ] Clear success criteria (know what success looks like)
- [ ] Immediate feedback (understand what you got right/wrong)
- [ ] Scaffolded difficulty (challenges match skill)
- [ ] Progress visualization ("You've mastered X concepts")

**Relatedness Checklist**:
- [ ] Connection to larger purpose ("Why this matters")
- [ ] Community (group challenges, peer comparison optional)
- [ ] Mentorship (feedback feels like coaching, not judgment)
- [ ] Social options (solo or collaborative paths)

### Dark Patterns to Avoid (Exploitationware)

**❌ NEVER**:
- Addictive mechanics without purpose (engagement for engagement's sake)
- Manipulative scarcity ("Limited time! Hurry!" without reason)
- Guilt-based motivation ("You're falling behind")
- Fake progress ("You unlocked nothing")
- Habit formation for trivial tasks ("Maintain your 365-day streak")

**✅ INSTEAD**:
- Intrinsic motivation for meaningful learning
- Scarcity when real (limited spots, real deadlines)
- Autonomy-based motivation ("You've chosen your path")
- Earned rewards (real achievement)
- Habit formation for important practices

### Skill Atoms Framework

**Decompose Learning Into Motivating Skill Challenges**

Instead of: "Learn JavaScript" (vague, overwhelming)

Break into:
- Day 1: Master variables (20 min) ← Achievable challenge
- Day 2: Master functions (20 min)
- Day 3: Master objects (20 min)
- etc.

Each atom is:
- **Small** (15-30 min)
- **Achievable** (skill matches challenge)
- **Meaningful** (builds toward larger goal)
- **Rewarding** (immediate mastery feeling)

---

## BEST PRACTICES

### Question Design Checklist

- [ ] One clear learning objective (not multiple)
- [ ] Meaningful choices (not trivial distinctions)
- [ ] Immediate feedback (not delayed)
- [ ] Explanation-based feedback (not just "right/wrong")
- [ ] Progressive difficulty (matches learner path)
- [ ] Narrative context (why this matters)
- [ ] Safe failure (try again without penalty)
- [ ] Diverse response types (not all multiple choice)

### Feedback Design Checklist

- [ ] Layer 1: Correctness (100-200ms) - Answer accepted/rejected
- [ ] Layer 2: Explanation (300-500ms) - Why right/wrong
- [ ] Layer 3: Principle (1-3s) - Broader concept
- [ ] Layer 4: Integration (5-15s) - How it connects
- [ ] Tone: Encouraging (not punitive)
- [ ] Specificity: Concrete (not vague)
- [ ] Actionability: Next step clear

### Progression Design Checklist

- [ ] Entry level: Maximum support, clear expectations
- [ ] Mid levels: Graduated scaffolding reduction
- [ ] Expert level: Autonomy-based, challenge-focused
- [ ] Transition gates: Clear advancement criteria
- [ ] Difficulty curves: Smooth, no cliffs
- [ ] Narrative continuity: Story connects across levels

---

## ANTI-PATTERNS & PITFALLS

### Common Mistakes

| Mistake | Why It Fails | Fix |
|---|---|---|
| No feedback delays (instant response) | Doesn't match neurobiology of learning | Use 100-500ms timing window |
| Only correct/incorrect feedback | Doesn't teach, only judges | Add explanation layer |
| Predictable rewards | Dopamine habituates to predictability | Vary reward depth/timing |
| Too easy or too hard | Violates flow state | Calibrate to skill+1 |
| Meaningless choices | Illusion of agency | Choices must matter |
| Generic narrative | Doesn't activate intrinsic drives | Customize to learner goals |
| Guilt-based motivation | Triggers avoidance behavior | Use autonomy-based framing |
| No scaffolding fade | Creates dependency | Reduce support as skill grows |

### Red Flags

🚩 **If you see these, something's wrong**:
- "Complete 365 consecutive days" ← Exploitation, not learning
- "Answer must be EXACTLY this wording" ← Kills creativity
- "You're ranked #847" ← Harmful comparison
- "You've lost your 20-day streak!" ← Guilt/FOMO
- "Now unlocked: Next question" ← Fake achievement
- "Collect badges" ← Extrinsic if not meaningful
- "Time pressure!" ← Scarcity without reason

---

## IMPLEMENTATION TOOLKIT

### Phase Planning Template

```yaml
use_case: "Quiz Immersivo para Onboarding"

phase_1_diagnosis:
  schultz: "Identify dopamine mechanisms needed"
  fogg: "Assess learner motivation/ability"
  chou: "Map core drives"
  csikszentmihalyi: "Calibrate flow zone"
  deterding: "Validate ethical design"
  duration: "2 hours"

phase_2_execution:
  gee: "Apply 36 learning principles"
  eyal: "Design engagement loops"
  mcgonigal: "Frame as hero's journey"
  kapp: "Integrate feedback architecture"
  duration: "3-4 hours"

phase_3_delivery:
  outputs:
    - Implementation guide
    - Question bank (original + variants)
    - Feedback specification
    - Monitoring dashboard
  duration: "1-2 hours"
```

### Quality Checklist (SC_QC_DL_001)

Before launching any learning experience:

- [ ] Dopamine mechanisms: All 5 present (unpredictability, prediction error, anticipation, timing, competence)
- [ ] Learning principles: Minimum 5 of Gee's 36 applied
- [ ] Behavioral design: B=MAP all at high level (M>7, A>7, P>7)
- [ ] Flow state: Challenge-skill matched (within ±1)
- [ ] Feedback architecture: All 4 layers with correct timing
- [ ] Ethical design: Autonomy ≥8/10, Competence ≥8/10, Relatedness ≥7/10
- [ ] Narrative: Learner positioned as hero, not passive
- [ ] Resilience: Failure is safe, recovery is clear

---

**End of Knowledge Base**

*Last Updated: 2026-02-12*
*Maintained by: Dopamine-Learning Squad*
