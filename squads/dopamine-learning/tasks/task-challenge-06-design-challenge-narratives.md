# Task: Design Challenge Narratives

**Task ID:** dopamine-learning/challenge-06-design-challenge-narratives
**Version:** 1.0.0
**Status:** Production Ready
**Created:** 2026-02-12
**Category:** Challenge Aprendizado Workflow
**Total Lines:** 380

---

## Executive Summary

This task frames each of the 4 challenge levels in McGonigal's hero's journey narrative while mapping Chou's core drives (autonomy, mastery, purpose). Instead of "Level 2: 5-feature launch," learners experience "The Rising Challenge: You're stretched, but ready. Take on complexity." Each level tells a story that increases stakes progressively, making the learning journey feel like meaningful personal growth.

**Workflow Position:** Phase 2 of Challenge Aprendizado workflow
**Input Dependency:** Requires Task 5 (level progression) completed
**Success Definition:** Narrative framework for each level with hero positioning + core drive mapping
**Output Quality Gate:** Each level's narrative increases stakes; learner feels progression in meaning not just difficulty**

---

## Purpose

Challenge levels without narrative feel like work:
- "Complete 8-feature launch" (dry, obligatory)

Challenges WITH narrative feel like adventure:
- "You've proven you can handle complexity. Now the stakes rise. A 50-person organization depends on your orchestration. Can you coordinate them all?" (meaningful, personal)

This task creates narrative meaning that sustains motivation through difficulty increases. When learners feel like heroes with expanding responsibility, they push through harder challenges.

---

## Executor Type

**Agent (100%)**

This is creative work combining narrative design (McGonigal) + psychological drives (Chou). No human iteration needed unless inputs are unclear.

---

## Inputs

### Required Inputs

```yaml
level_progression:
  field: "4-level progression from Task 5"
  format: "YAML"
  required: true
  source: "task-challenge-05 output"

challenge_context:
  field: "What's the domain? What makes it meaningful?"
  format: "text"
  required: true
  example: |
    You're building a product company that scales from 0 to 100 people.
    Your decisions determine if we survive hypergrowth. This is real stakes.

learner_profile:
  field: "Learner's motivation type + values"
  format: "YAML"
  required: true
  source: "Task 1 output"
  validation: "Must include primary_drive (autonomy/mastery/purpose/social)"
```

### Optional Inputs

```yaml
brand_narrative:
  field: "Existing brand story (optional)"
  format: "text"
  example: "Company started 3 years ago in a garage. Now we're growing fast."

cultural_values:
  field: "What does company value?"
  format: "list"
  example: |
    - We believe in transparency
    - We move fast
    - We care for each other
```

---

## Preconditions

- [ ] Task 5 completed (4-level progression exists)
- [ ] Challenge context clear (domain + stakes)
- [ ] Learner motivation type known (from Task 1)

---

## Steps

### Step 1: Establish Overall Hero's Journey Arc (6 min)

**Agent Activity:**
- Map McGonigal's 7-stage hero's journey onto 4 challenge levels:

```
Stage 1 (Call to Adventure) → Level 1: "You can handle this"
Stage 2 (Crossing Threshold) → Level 2: "Complexity arrives"
Stage 3 (Tests & Allies) → Level 3: "You adapt + lead"
Stage 4 (Ordeal/Crisis) → Level 4: "You architect the future"
```

- Define story arc:
  - **Opening conflict:** "Your product is growing. You need to launch faster."
  - **Rising tension:** "Each level adds stakeholders, complexity, stakes"
  - **Climax:** "Level 3/4: Can you handle this?"
  - **Resolution:** "You emerge as architect/leader"

**Output:** Overall narrative arc across all 4 levels

**Checkpoint:** Hero's journey structure established

---

### Step 2: Map Core Drives Per Level (8 min)

**Agent Activity:**
- For each level, identify which Chou core drives to emphasize:

```
Level 1 (Novice - Building confidence):
- Autonomy: "You decide how to organize" (low stakes, choices safe)
- Mastery: "You can do this" (confidence-building)
- Social: "Others did this successfully" (normalization)
→ Dominant drive: MASTERY (build confidence)

Level 2 (Intermediate - Growing autonomy):
- Autonomy: "You design the plan" (more authority)
- Mastery: "Complexity test" (challenge increasing)
- Purpose: "Your decisions affect growth" (meaning emerges)
→ Dominant drive: AUTONOMY (let them lead)

Level 3 (Advanced - Purpose + Mastery):
- Purpose: "You're orchestrating growth" (high stakes)
- Mastery: "Complex problem solving" (deep challenge)
- Social: "Mentoring peers" (expert recognition)
→ Dominant drive: PURPOSE (meaningful work)

Level 4 (Expert - Innovation):
- Autonomy: "Design the system" (complete freedom)
- Mastery: "Expert-level innovation" (elite achievement)
- Purpose: "Shape organizational future" (legacy)
→ Dominant drive: PURPOSE + AUTONOMY
```

**Output:** Core drive mapping per level with narrative emphasis

**Checkpoint:** Primary drive identified for each level

---

### Step 3: Create Hero Positioning Per Level (10 min)

**Agent Activity:**
- Define learner's role/identity at each level:

```
Level 1: "Apprentice"
- Role: "You're learning the craft"
- Positioning: "Trainee, supported, discovering"
- Example: "Your mentor guides you through first launch"

Level 2: "Practitioner"
- Role: "You're gaining mastery"
- Positioning: "Skilled executor, gaining independence"
- Example: "You design the plan. Your mentor reviews it."

Level 3: "Leader"
- Role: "You're orchestrating"
- Positioning: "Expert, trusted decision-maker"
- Example: "The team looks to you for decisions"

Level 4: "Architect"
- Role: "You're designing the future"
- Positioning: "Visionary, teaching others"
- Example: "You're building the system for others to use"
```

**Output:** Hero positioning narrative for each level

**Checkpoint:** Learner's role evolves across levels in clear steps

---

### Step 4: Design Narrative Consequence & Stakes (10 min)

**Agent Activity:**
- For each level, specify the consequence if learner fails:

```
Level 1 Stakes:
- "If you don't learn this, launch gets delayed 1 week"
- "Low stakes, learning environment"

Level 2 Stakes:
- "If your plan is wrong, 5-feature launch derails"
- "Medium stakes, responsibility growing"

Level 3 Stakes:
- "If you don't adapt, 8-feature launch fails + team loses confidence"
- "High stakes, organizational impact"

Level 4 Stakes:
- "If your architecture doesn't scale, company culture breaks"
- "Highest stakes, long-term impact"
```

- Consequence narrative:
  - Level 1: "Learn fast, feedback is safe"
  - Level 2: "Your decisions matter. 50+ people affected."
  - Level 3: "You're carrying the team. Don't let them down."
  - Level 4: "You're building the future. Lead well."

**Output:** Consequence & stakes narrative per level

**Checkpoint:** Stakes increase meaningfully across levels

---

### Step 5: Design NPC Allies & Mentors (10 min)

**Agent Activity:**
- Create supporting characters that evolve:

```
MENTOR EVOLUTION:
Level 1: Active mentor ("I'll guide you step-by-step")
Level 2: Coaching mentor ("Here's feedback on your plan")
Level 3: Peer mentor ("What would you do here?")
Level 4: Peer/Leadership ("We're learning from you")

NPC ALLIES:
Level 1: 2-3 supporters ("The team believes in you")
Level 2: 10+ stakeholders ("Complex web of relationships")
Level 3: 20+ people ("Major organizational dependency")
Level 4: Mentee learner ("You're teaching them")
```

- Character arcs:
  - Mentor starts supportive, gradually removes support
  - Peers start skeptical, gradually gain trust in you
  - Organization grows alongside your leadership

**Output:** NPC cast + evolution across levels

**Checkpoint:** Supporting characters create narrative momentum

---

### Step 6: Create Surprise/Delight Moments (8 min)

**Agent Activity:**
- Design unexpected positive moments that boost dopamine:

```
Level 1 Delight:
"First launch succeeds perfectly. No surprises.
 Your mentor: 'You've got great instincts. Trust them.'"

Level 2 Delight:
"Mid-launch crisis. You adapt on fly.
 Mentor: 'That was exactly what I would have done.'"

Level 3 Delight:
"Complex stakeholder conflict. You solve it diplomatically.
 Peer: 'I've never seen someone handle that so well.'"

Level 4 Delight:
"You mentor peer through L3 launch. They succeed.
 Leadership: 'You're exactly the kind of leader we need.'"
```

- Purpose: Create moments of recognition/mastery that fuel dopamine

**Output:** Surprise moments + recognition moments per level

**Checkpoint:** Delight moments provide dopamine hits at key progression points

---

### Step 7: Synthesize Narrative Framework Document (8 min)

**Agent Activity:**
- Create complete narrative spec with:
  - Hero's journey arc
  - Core drive emphasis per level
  - Hero positioning (Apprentice → Practitioner → Leader → Architect)
  - Stakes & consequences
  - NPC allies + mentors
  - Surprise/delight moments
  - Narrative themes (growth, trust, impact)

**Output:** Complete narrative framework YAML

**Checkpoint:** Narrative spec ready for Task 7

---

## Outputs

### Primary Output

**Narrative Framework Specification**

Format: YAML
Location: `/squads/dopamine-learning/data/narratives/{{ challenge-slug }}-narrative-framework.yaml`

```yaml
narrative_framework:
  challenge_id: "pm-launch-orchestration"
  created: "{{ timestamp }}"

  overall_arc:
    title: "From Apprentice to Architect"
    opening_hook: "Your product is growing 50% month-over-month. Can you scale your execution?"
    climax: "You're orchestrating a 20-feature launch for 100+ people. The future is in your hands."
    resolution: "You emerge as the trusted leader who scales launches from simple to complex."

  hero_journey:
    stage_1: "Call to Adventure"
    level_mapping: "Level 1 (Novice)"
    narrative: "You've done one launch. Can you do two? Let's find out."

    stage_2: "Crossing Threshold"
    level_mapping: "Level 2 (Intermediate)"
    narrative: "OK, you're ready. Now complexity arrives. 5 features, 10+ stakeholders. Can you handle it?"

    stage_3: "Tests & Allies"
    level_mapping: "Level 3 (Advanced)"
    narrative: "The team trusts you now. 8 features, 50+ people. You're orchestrating growth."

    stage_4: "Ordeal/Crisis & Return"
    level_mapping: "Level 4 (Expert)"
    narrative: "Now you design the architecture. You're not just executing—you're building the system others will use."

  levels:
    - level_number: 1
      level_name: "Apprentice: First Challenge"
      level_slug: "apprentice-first"

      core_drive_emphasis:
        primary: "mastery"
        secondary: "autonomy"
        rationale: "Build confidence first. Autonomy makes it feel safe to try."

      hero_positioning:
        role: "Apprentice Learning the Craft"
        identity_statement: "You're discovering your capability"
        positioning_narrative: |
          You've done this once. Now you're doing it twice.
          Your mentor is here. Listen, learn, trust the process.
          This is your foundation.

      stakes_narrative: |
        Low stakes. This is learning environment.
        If something goes wrong, we adjust. You're not failing—you're learning.
        Every expert was once an apprentice.

      npcs:
        - name: "Your Mentor"
          role: "Active guide"
          positioning: "Supports every step"
          evolution: "Gradually steps back as you show capability"
        - name: "Your Peer"
          role: "Went through this too"
          positioning: "Normalizes the journey"
          evolution: "Becomes ally + friend as you progress"

      moment_of_truth: |
        🎯 DELIGHT MOMENT:
        Your 2-feature launch succeeds smoothly.
        Your mentor smiles: "You've got instincts for this.
        They'll serve you well as things get complex."
        → Dopamine hit: Mastery + recognition

      narrative_theme: "Foundation building. You can do this."

    - level_number: 2
      level_name: "Practitioner: Growing Complexity"
      level_slug: "practitioner-complexity"

      core_drive_emphasis:
        primary: "autonomy"
        secondary: "mastery"
        rationale: "You're ready to lead. Let them design their own approach."

      hero_positioning:
        role: "Practitioner Gaining Mastery"
        identity_statement: "You're becoming trusted executor"
        positioning_narrative: |
          You've proven yourself. Now it's time to run your own show.
          Yes, 5 features is more complex. Yes, stakeholders are messier.
          But you've got this. Make your decisions. We'll support the execution.

      stakes_narrative: |
        Medium stakes. Your decisions directly impact launch success.
        50+ people are counting on you to plan well.
        This is where leadership starts.

      npcs:
        - name: "Your Mentor"
          role: "Coaching from the sidelines"
          positioning: "Reviews your work, asks questions"
          evolution: "Gradually asks you for advice"
        - name: "The Stakeholders"
          role: "Growing network"
          positioning: "Depend on your leadership"
          evolution: "Start trusting you"

      moment_of_truth: |
        💡 DELIGHT MOMENT:
        Mid-launch, something breaks unexpectedly.
        You think fast, adjust the plan on the fly.
        Your mentor: "That's exactly how I would have handled it. You're ready."
        → Dopamine hit: Mastery + autonomy + expert recognition

      narrative_theme: "You're ready to lead. Trust yourself."

    - level_number: 3
      level_name: "Leader: Orchestrating Growth"
      level_slug: "leader-orchestration"

      core_drive_emphasis:
        primary: "purpose"
        secondary: "autonomy"
        rationale: "They're orchestrating organizational growth. Make that meaning explicit."

      hero_positioning:
        role: "Leader Orchestrating Complexity"
        identity_statement: "You are the person the organization depends on"
        positioning_narrative: |
          8 features. 50+ people. This is real complexity.
          You're not just executing anymore. You're orchestrating.
          Your decisions determine if we scale successfully.
          The organization is watching. Lead well.

      stakes_narrative: |
        High stakes. Organizational impact.
        If you don't adapt when things change, the launch derails.
        If you keep people informed, we win together.
        This is where your impact multiplies.

      npcs:
        - name: "Your Peer"
          role: "Looking to you for guidance"
          positioning: "Wants to learn from your approach"
          evolution: "Becomes your trusted advisor + later, your mentee"
        - name: "Leadership"
          role: "Watching your execution"
          positioning: "Betting on you"
          evolution: "Gives you more autonomy + bigger challenges"

      moment_of_truth: |
        🔥 CRISIS MOMENT:
        Complex stakeholder conflict. Two teams disagree on timeline.
        You navigate it diplomatically, making everyone feel heard.
        Your peer: "I've never seen someone handle conflict that well."
        Leadership: "This is exactly the kind of thinking we need."
        → Dopamine hit: Purpose + mastery + social recognition

      narrative_theme: "You're carrying the organization. Lead them well."

    - level_number: 4
      level_name: "Architect: Designing the Future"
      level_slug: "architect-future"

      core_drive_emphasis:
        primary: "purpose"
        secondary: "autonomy"
        rationale: "Legacy building. They're designing systems, not just executing."

      hero_positioning:
        role: "Architect Designing Systems"
        identity_statement: "You are building the foundation for others"
        positioning_narrative: |
          20+ feature launch. 100+ person organization.
          You're not managing this launch. You're architecting the system
          that will enable launches forever.
          You're building the infrastructure of leadership.

      stakes_narrative: |
        Highest stakes. Organizational legacy.
        How you architect this determines if we stay nimble or get bureaucratic.
        How you mentor determines if the next generation is ready.
        This is your lasting impact.

      npcs:
        - name: "Your Mentee"
          role: "Learning from you"
          positioning: "You're teaching them to be Level 3"
          evolution: "They succeed because you taught well"
        - name: "Organization"
          role: "Learning from your vision"
          positioning: "Implementing your system"
          evolution: "Culture shifts based on your leadership"

      moment_of_truth: |
        👑 LEGACY MOMENT:
        Your mentee completes their first complex launch.
        They credit you: "I learned this from watching you."
        Leadership: "This is exactly the culture we're building."
        Your mentor: "You've become what you needed when you started."
        → Dopamine hit: Purpose + mastery + social recognition + legacy

      narrative_theme: "You're building the future. Design it well."

  narrative_themes:
    - "Growth: From apprentice to architect"
    - "Trust: From supported to autonomous"
    - "Impact: From individual to organizational"
    - "Legacy: From executing to architecting"

  learner_customization:
    if_intrinsic_motivation_high: "Emphasize purpose + mastery over extrinsic rewards"
    if_anxiety_moderate: "Give safety nets in Level 1, gradually remove scaffolding"
    if_social_drive_strong: "Emphasize peer learning + recognition moments"
    if_autonomy_important: "Progressive autonomy is key—don't rush scaffolding removal"
```

### Secondary Outputs

1. **Narrative Tone Guide**
   - Format: Markdown
   - Content: How to speak to learner at each level
   - Use: Copy writing reference

2. **NPC Character Profiles**
   - Format: Markdown
   - Content: Mentor/ally evolution + dialogue examples
   - Use: Implementation reference

3. **Dopamine Narrative Moments**
   - Format: Markdown
   - Content: When delight/recognition moments occur
   - Use: Coordinate with Task 7 (flow calibration)

---

## Validation

### Checklist

- [ ] Hero's journey mapped to all 4 levels
- [ ] Core drives match learner motivation type (from Task 1)
- [ ] Stakes increase progressively (L1 low → L4 highest)
- [ ] Hero role evolves: Apprentice → Practitioner → Leader → Architect
- [ ] NPC allies create relationship arc (skeptical → trusting → collaborative)
- [ ] Delight moments positioned at key dopamine windows
- [ ] Narrative themes are consistent throughout
- [ ] Learner customization applied (motivation type adjustments)
- [ ] No shame language; challenges are framed as opportunity
- [ ] Stakes connect to real organizational impact (not fictional)

### Success Criteria

**Threshold: 9/10**

| Criteria | Excellent (3) | Acceptable (2) | Poor (1) |
|----------|--------------|----------------|---------|
| **Narrative Coherence** | Story flows naturally across all 4 levels | Story present but some disconnects | No clear narrative |
| **Core Drive Alignment** | Drives match learner type + increase meaningfully | Drives identified but generic | Drives ignored |
| **Stakes Progression** | Stakes increase realistically (L1 → L4) | Stakes present but inconsistent | Stakes vague |
| **Hero Positioning** | Role evolution feels earned (Apprentice → Architect) | Role progress present but fast | No role evolution |
| **Ally Development** | NPCs create emotional connection + show growth | NPCs present but flat | Generic or missing NPCs |
| **Delight Moments** | Recognition hits at psychological high points | Moments present but poorly timed | No moment design |
| **Learner Relevance** | Narrative speaks directly to learner's situation | Generic narrative | Doesn't resonate |

---

## Estimated Effort

| Role | Effort |
|------|--------|
| Agent | 50-70 min |
| Validation | 5-10 min |
| Total | 55-80 min |

---

## Integration

### Feeds To

**Next Task:** Task 7 - calculate-flow-calibration
- Uses: Narrative stakes + hero positioning
- Produces: Dopamine timing for narrative moments

### Depends On

- Task 5: Level progression
- Task 1: Learner profile (motivation type)

### Agent Routing

**Primary Agent:** McGonigal (narrative framing), Chou (core drives)

---

## Revision History

| Version | Date | Change |
|---------|------|--------|
| 1.0.0 | 2026-02-12 | Initial production release |

