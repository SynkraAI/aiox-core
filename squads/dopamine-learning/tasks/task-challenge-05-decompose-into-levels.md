# Task: Decompose Learning Challenge Into Progressive Levels

**Task ID:** dopamine-learning/challenge-05-decompose-into-levels
**Version:** 1.0.0
**Status:** Production Ready
**Created:** 2026-02-12
**Category:** Challenge Aprendizado Workflow
**Total Lines:** 400

---

## Executive Summary

This task breaks a complex learning challenge into 4 progressive difficulty levels (Novice → Intermediate → Advanced → Expert) while maintaining skill progression and preventing "difficulty cliffs." Each level teaches specific skills that scaffold into the next level. The decomposition follows Gee's scaffolding principles: each level removes support strategically, requiring learners to use skills from previous levels independently.

**Workflow Position:** Phase 1 of Challenge Aprendizado workflow
**Input Dependency:** Challenge specification + target learner profile
**Success Definition:** 4 levels defined with clear skill progressions + scaffolding fade specifications
**Output Quality Gate:** No level jumps > 2x difficulty; each level has 2-3 prerequisite skills from previous levels**

---

## Purpose

Learning challenges fail because they jump difficulty unpredictably:
- ❌ Level 1: "Easy intro exercise"
- ❌ Level 2: "10x harder, figure it out"

This task creates smooth progressions where:
- ✅ Level 1: Foundation (0% to 30% competence)
- ✅ Level 2: Building (30% to 60% competence)
- ✅ Level 3: Integration (60% to 85% competence)
- ✅ Level 4: Mastery (85%+ competence)

Each level explicitly teaches 2-3 new skills while using skills from previous levels autonomously.

---

## Executor Type

**Hybrid (60% Agent, 40% Human)**

- **Agent Role:** Apply scaffolding principles, suggest level decomposition, calculate difficulty gaps
- **Human Role:** Validate skill progression matches learner's reality, approve scaffolding strategy

---

## Inputs

### Required Inputs

```yaml
challenge_specification:
  field: "What is the learning challenge?"
  format: "text/paragraph"
  required: true
  example: |
    Challenge: Product managers need to master full-stack launch planning.
    Currently: Can manage one feature, need to manage 10-feature release.
    Target skill: Design and execute complex product launches solo.

learning_domain:
  field: "What skill/knowledge is being developed?"
  format: "text"
  required: true
  example: "Product Launch Orchestration"

target_learners:
  field: "Who are they? What's their baseline?"
  format: "text"
  required: true
  example: |
    - Junior PMs with 1-2 years experience
    - Can manage single features, not complex launches
    - Anxious about stakeholder management

target_final_level:
  field: "What should they be able to do at end?"
  format: "text"
  required: true
  example: "Design and execute a 10-feature launch, managing 50+ stakeholders"

time_available:
  field: "How long should progression take?"
  format: "text"
  required: true
  example: "4 weeks (1 level per week)"
```

### Optional Inputs

```yaml
prerequisite_skills:
  field: "What baseline skills must learner have?"
  format: "list/optional"
  example: |
    - Can manage feature roadmap
    - Knows basic stakeholder communication
    - Familiar with product metrics

constraint_language:
  field: "Domain-specific constraints?"
  format: "text/optional"
  example: "Must work in real production environment (not simulated)"
```

---

## Preconditions

Before starting this task:

- [ ] Challenge specification is clear (what's being learned, what's target proficiency)
- [ ] Target learner profile understood (baseline skills, learning constraints)
- [ ] Target final level defined (what should expert performance look like?)
- [ ] Time/resources available for 4-level progression

---

## Steps

### Step 1: Define Current State → Target State Clearly (5 min)

**Agent Activity:**
- Map challenge on skill progression scale:
  - **Current State:** What can learner do NOW?
  - **Level 1 (Novice):** What can they do with full scaffolding?
  - **Level 2 (Intermediate):** What with moderate scaffolding?
  - **Level 3 (Advanced):** What with minimal scaffolding?
  - **Level 4 (Expert):** What with no scaffolding?

- Identify specific behaviors at each level:
  ```
  Current: "Manage single feature launch"
  L1: "Plan and execute 2-feature launch with checklist"
  L2: "Plan and execute 5-feature launch with templates"
  L3: "Plan and execute 8-feature launch independently"
  L4: "Design architecture for 20+ feature launch"
  ```

**Human Activity:**
- Validate this progression matches reality
- Add domain-specific constraints (if applicable)

**Output:** Current-to-target state map with 4 milestone behaviors

**Checkpoint:** All 4 levels have specific, observable behaviors

---

### Step 2: Identify Skills Required at Each Level (7 min)

**Agent Activity:**
- Decompose target skill into atomic sub-skills:

  **Level 1 (Novice):** Foundation skills
  - Skill A: Read requirements document
  - Skill B: Create basic timeline
  - Skill C: Identify 3 main stakeholders

  **Level 2 (Intermediate):** Build on foundation
  - Skill D: Manage stakeholder dependencies (uses C from L1)
  - Skill E: Create contingency plans (uses B from L1)
  - Skill F: Coordinate across teams (uses A+C from L1)

  **Level 3 (Advanced):** Integration
  - Skill G: Prioritize under constraints (uses D+E from L2)
  - Skill H: Adapt plan when things change (uses F from L2)
  - Skill I: Design communication cadence (uses all from L1-2)

  **Level 4 (Expert):** Synthesis
  - Skill J: Design scalable launch architecture (uses all previous)
  - Skill K: Mentor others (uses all previous)
  - Skill L: Innovate new launch approaches (uses all previous)

- Validate prerequisites:
  - Each new skill depends on 1-2 skills from previous level
  - No level introduces >3 new skills
  - Skills scaffold (build on each other)

**Output:** Skill dependency tree showing progression

**Checkpoint:** Skill tree has clear prerequisites + no jumps

---

### Step 3: Specify Learning Objectives Per Level (8 min)

**Agent Activity:**
- For each level, translate skills into learning objectives:

  **Level 1 Objective:**
  "Learner can execute a 2-feature launch with step-by-step guidance.
   Success metric: Checklist 100% complete, 0 missed dependencies"

  **Level 2 Objective:**
  "Learner can execute a 5-feature launch using provided templates.
   Success metric: Launch completes on time, stakeholders report 90%+ satisfaction"

  **Level 3 Objective:**
  "Learner can design and execute an 8-feature launch independently.
   Success metric: Pro-active problem solving (adapts plan without asking)"

  **Level 4 Objective:**
  "Learner can architect launch strategy for any-size launch.
   Success metric: Trains peer to do L3, suggests process improvements"

**Output:** Learning objectives (Bloom L2-L5) per level

**Checkpoint:** Objectives are measurable and progressive (L1 recall → L4 synthesis)

---

### Step 4: Calculate Scaffolding Strategy (Gee's Fading Model) (8 min)

**Agent Activity:**
- Design how support decreases across levels:

  ```
  Level 1 (100% scaffolding):
  - Detailed checklists
  - Step-by-step templates
  - Coach available (ask anytime)
  - Pre-made decisions (when to launch, order of features)

  Level 2 (60% scaffolding):
  - Templates provided but incomplete
  - Coach available for questions (not proactive)
  - Learner makes some decisions (feature order)
  - Contingency planning is their work

  Level 3 (30% scaffolding):
  - Only outcome goals specified (hit launch date, stakeholder satisfaction)
  - Coach reviews decisions (not provides them)
  - All decisions learner's responsibility
  - Can ask for specific help (e.g., "how to handle X?")

  Level 4 (0% scaffolding):
  - Only success metrics defined
  - No coach (peers for learning)
  - All decisions autonomous
  - Expected to teach others
  ```

- Fading schedule: When is each support removed?
  - Timeline support: L1 (full) → L2 (templates) → L3 (goals only) → L4 (none)
  - Stakeholder management: L1 (list given) → L2 (identify yourself) → L3-4 (own relationships)
  - Decision-making: L1 (decisions given) → L2-3 (template options) → L4 (from scratch)

**Output:** Scaffolding fade schedule with timeline for each support level

**Checkpoint:** Support fades progressively (not cliff drop)

---

### Step 5: Map Difficulty Progression & Flow State (8 min)

**Agent Activity:**
- Using Csikszentmihalyi flow model, ensure challenge/skill balance:

  ```
  Level 1: Skill 20%, Challenge 25% → SLIGHT ENGAGEMENT (build confidence)
  Level 2: Skill 35%, Challenge 50% → FLOW ZONE (challenge grows faster)
  Level 3: Skill 70%, Challenge 75% → DEEP FLOW (mastery building)
  Level 4: Skill 90%, Challenge 95% → ELITE FLOW (expert territory)
  ```

- Check: Does challenge grow faster than skill can initially handle?
  - If yes: Adjust scaffolding (more support at level transition)
  - If no: Increase challenge (less support sooner)

- Identify "difficulty cliffs" (where jump is >1.5x):
  - L1→L2: Is challenge jump too high? (Fix: Add L1.5?)
  - L2→L3: Same check
  - etc.

**Output:** Flow calibration matrix with difficulty percentages

**Checkpoint:** No difficulty cliff jumps; challenge progression smooth

---

### Step 6: Specify Assessment & Progression Gates (8 min)

**Agent Activity:**
- For each level, define:
  1. **Entry Gate:** What must learner demonstrate to enter this level?
  2. **Exit Gate:** What must they prove to advance to next level?

  Example:
  ```
  Level 1:
  - Entry: Pass pre-assessment on stakeholder identification
  - Exit: Execute 2-feature launch successfully (all checklist items + 0 surprises)

  Level 2:
  - Entry: Demonstrate L1 skills (pass L1 exit gate)
  - Exit: Execute 5-feature launch with 1-2 reactive problem solves

  Level 3:
  - Entry: Demonstrate L2 skills + pro-active adjustments
  - Exit: Execute 8-feature launch with 3+ pro-active decisions

  Level 4:
  - Entry: Demonstrate L3 mastery across 2 launches
  - Exit: Mentor peer through L3 launch successfully
  ```

- Specify success criteria (how do we know they passed?):
  - Objective measure (if possible): "Timeline accuracy ±2 days"
  - Qualitative measure (if needed): "Stakeholders report confident communication"

**Output:** Progression gates + success criteria per level

**Checkpoint:** Gates are clear, measurable, achievable

---

### Step 7: Create Level Progression Specification Document (6 min)

**Agent Activity:**
- Synthesize all analysis into structured level specification:
  - Level number + name (Novice/Intermediate/Advanced/Expert)
  - Learning objectives (Bloom L-level)
  - Skills taught (new + applied from previous)
  - Scaffolding level (% support)
  - Difficulty calibration (skill/challenge %)
  - Estimated time (how long to complete)
  - Entry/exit gates + success criteria
  - Prerequisites from previous level

**Output:** Level progression document (YAML/JSON)

**Checkpoint:** All 7 fields specified for each level

---

## Outputs

### Primary Output

**Level Progression Specification**

Format: YAML
Location: `/squads/dopamine-learning/data/level-progressions/{{ challenge-slug }}-level-progression.yaml`

```yaml
level_progression:
  challenge_id: "pm-launch-orchestration"
  challenge_name: "Product Launch Orchestration Mastery"
  created: "{{ timestamp }}"
  total_levels: 4

  progression_summary:
    current_state: "Can manage 1-feature launches"
    level_1_state: "Can manage 2-feature launches with checklist"
    level_2_state: "Can manage 5-feature launches with templates"
    level_3_state: "Can manage 8-feature launches independently"
    level_4_state: "Can architect 20+ feature launches"
    total_time_estimate: "4 weeks (1 week per level)"

  levels:
    - level_number: 1
      level_name: "Novice: Checklist Execution"
      level_slug: "novice-checklist"

      learning_objectives:
        - "Follow structured checklist to execute 2-feature launch (Bloom L1-L2)"
        - "Identify 5 key stakeholders and their roles (Bloom L2)"
        - "Create basic project timeline (Bloom L2)"

      skills:
        new_skills:
          - "skill_id: identify-stakeholders, name: Identify stakeholders, proficiency_gain: 20%"
          - "skill_id: basic-timeline, name: Create timeline, proficiency_gain: 20%"
          - "skill_id: execute-launch, name: Execute launch sequence, proficiency_gain: 30%"
        applied_skills: []  # First level has no prerequisites

      scaffolding:
        scaffolding_level_percent: 100
        support_elements:
          - "Detailed step-by-step checklist"
          - "Pre-defined stakeholder template"
          - "Timeline template (fill-in-the-blank)"
          - "Coach available for all questions"
          - "No major decisions required (all pre-made)"

      difficulty_calibration:
        estimated_skill_level: 20  # 0-100
        estimated_challenge_level: 25  # 0-100
        flow_zone_confidence: 0.65  # Should feel achievable but slightly challenging
        difficulty_vs_previous: "entry_level"

      timeline:
        estimated_hours: 5
        typical_days_to_complete: 3
        deadline_buffer: "1 week"

      success_criteria:
        - "Checklist: 100% items complete"
        - "Stakeholder communication: Zero surprises (all informed proactively)"
        - "Timeline: Launch within ±3 days of plan"
        - "Post-assessment: Score ≥80% on L1 knowledge test"

      entry_gate:
        description: "Pass pre-assessment on stakeholder identification"
        assessment: "Identify 10 stakeholders from case study + explain their roles"
        passing_score: 0.75

      exit_gate:
        description: "Execute 2-feature launch successfully using checklist"
        assessment: "Real or simulated launch with all checklist items + feedback survey"
        success_criteria:
          - "Checklist completion: 100%"
          - "Stakeholder satisfaction: ≥4/5"
          - "Timeline accuracy: ±3 days"

    - level_number: 2
      level_name: "Intermediate: Template-Based Planning"
      level_slug: "intermediate-templates"

      learning_objectives:
        - "Use templates to plan and execute 5-feature launch (Bloom L3)"
        - "Identify and manage stakeholder dependencies (Bloom L3)"
        - "Create contingency plans for common issues (Bloom L3)"

      skills:
        new_skills:
          - "skill_id: dependency-management, name: Manage dependencies, proficiency_gain: 25%"
          - "skill_id: contingency-planning, name: Plan contingencies, proficiency_gain: 20%"
          - "skill_id: scale-communication, name: Scale communication, proficiency_gain: 15%"
        applied_skills:
          - "skill_id: identify-stakeholders, proficiency_level: 40%  # Build on L1"
          - "skill_id: basic-timeline, proficiency_level: 40%  # Build on L1"

      scaffolding:
        scaffolding_level_percent: 60
        support_elements:
          - "Partially-filled templates (learner completes)"
          - "Dependency mapping tool provided"
          - "Contingency plan examples (but learner writes their own)"
          - "Coach available for questions (not proactive)"
          - "Learner makes decisions: Feature order, communication timing"

      difficulty_calibration:
        estimated_skill_level: 40
        estimated_challenge_level: 50
        flow_zone_confidence: 0.80  # Entering deep flow
        difficulty_vs_previous: "1.5x harder (acceptable jump)"

      timeline:
        estimated_hours: 12
        typical_days_to_complete: 7
        deadline_buffer: "1 week"

      success_criteria:
        - "Timeline: Accurate within ±2 days"
        - "Dependencies: 90%+ identified and planned"
        - "Contingencies: 3+ contingency plans created"
        - "Stakeholder satisfaction: ≥4.2/5"

      entry_gate:
        description: "Demonstrate mastery of Level 1 skills"
        assessment: "Execute L1 launch + pass L1 exit gate"
        passing_score: "100% + satisfaction ≥4/5"

      exit_gate:
        description: "Execute 5-feature launch with template + proactive problem-solving"
        assessment: "Real or simulated 5-feature launch with template"
        success_criteria:
          - "Timeline accuracy: ±2 days"
          - "Dependencies managed: 90%+ identified"
          - "Contingencies executed: Reactive problem-solving visible"
          - "Stakeholder satisfaction: ≥4.2/5"

    - level_number: 3
      level_name: "Advanced: Independent Orchestration"
      level_slug: "advanced-independent"

      learning_objectives:
        - "Design and execute 8-feature launch from scratch (Bloom L4)"
        - "Adapt plans proactively when conditions change (Bloom L4)"
        - "Design communication cadence for complex stakeholder network (Bloom L4)"

      skills:
        new_skills:
          - "skill_id: adaptive-planning, name: Adapt plans in real-time, proficiency_gain: 30%"
          - "skill_id: strategic-communication, name: Design communication strategy, proficiency_gain: 25%"
          - "skill_id: risk-mitigation, name: Identify and mitigate risks, proficiency_gain: 20%"
        applied_skills:
          - "skill_id: dependency-management, proficiency_level: 70%  # Build on L2"
          - "skill_id: contingency-planning, proficiency_level: 70%  # Build on L2"

      scaffolding:
        scaffolding_level_percent: 30
        support_elements:
          - "Only outcome goals specified (timeline, stakeholder satisfaction)"
          - "No templates (learner designs from scratch)"
          - "Coach available only for specific questions"
          - "All decisions learner's responsibility"
          - "Examples from past launches (no solutions)"

      difficulty_calibration:
        estimated_skill_level: 70
        estimated_challenge_level: 75
        flow_zone_confidence: 0.90  # Deep mastery flow
        difficulty_vs_previous: "1.3x harder (acceptable)"

      timeline:
        estimated_hours: 20
        typical_days_to_complete: 14
        deadline_buffer: "2 weeks"

      success_criteria:
        - "Launch execution: No major surprises (proactive adaptation)"
        - "Stakeholder network: Complex dependencies (15+ managed)"
        - "Timeline: Accurate within ±1 day"
        - "Stakeholder satisfaction: ≥4.4/5"
        - "Pro-active decisions: ≥3 major adaptations made"

      entry_gate:
        description: "Demonstrate L2 mastery + adaptive thinking"
        assessment: "Pass L2 exit gate + case study on handling launch disruption"
        passing_score: "100% + case study ≥80%"

      exit_gate:
        description: "Execute 8-feature launch with pro-active problem-solving"
        assessment: "Real or simulated 8-feature launch without templates"
        success_criteria:
          - "Pro-active adaptations: ≥3 major decisions"
          - "Timeline accuracy: ±1 day"
          - "Stakeholder satisfaction: ≥4.4/5"
          - "Risk mitigation: Zero surprises in post-mortem"

    - level_number: 4
      level_name: "Expert: Architecture & Mentoring"
      level_slug: "expert-architecture"

      learning_objectives:
        - "Design launch architecture for any-scale launch (Bloom L5-L6)"
        - "Mentor peer through complex launch (Bloom L5)"
        - "Identify process improvements and innovate (Bloom L5-L6)"

      skills:
        new_skills:
          - "skill_id: launch-architecture, name: Design launch system, proficiency_gain: 25%"
          - "skill_id: mentoring, name: Mentor others, proficiency_gain: 20%"
          - "skill_id: innovation, name: Innovate processes, proficiency_gain: 15%"
        applied_skills:
          - "skill_id: adaptive-planning, proficiency_level: 95%  # Apply at scale"
          - "skill_id: strategic-communication, proficiency_level: 95%  # Apply at scale"

      scaffolding:
        scaffolding_level_percent: 0
        support_elements:
          - "Only success metrics defined (no process guidance)"
          - "Peer network (not coach)"
          - "Expected to teach others"
          - "Autonomous authority (can set own standards)"

      difficulty_calibration:
        estimated_skill_level: 90
        estimated_challenge_level: 95
        flow_zone_confidence: 0.95  # Expert mastery
        difficulty_vs_previous: "1.2x (appropriate for expert)"

      timeline:
        estimated_hours: 30+
        typical_days_to_complete: 30+
        deadline_buffer: "None (open-ended)"

      success_criteria:
        - "Architecture designed and executed: 20+ feature launch"
        - "Mentee success: Peer completes L3 launch independently"
        - "Innovation: Suggests 2+ process improvements"
        - "Mastery demonstration: Expert-level problem-solving in peer feedback"

      entry_gate:
        description: "Demonstrate L3 mastery across multiple launches"
        assessment: "Pass L3 exit gate on 2 different launches"
        passing_score: "100% on both + case study ≥85%"

      exit_gate:
        description: "Design and mentor architecture for complex launch + process innovation"
        assessment: "Design launch system + mentor peer + present innovations"
        success_criteria:
          - "Architecture design: 20+ feature launch documented"
          - "Mentee success rate: ≥90% (peer completes launch)"
          - "Innovations: 2+ improvements documented with rationale"
          - "Expert evaluation: Peer/leadership rates as expert"

  scaffolding_fade_chart:
    level_1: 100%
    level_2: 60%
    level_3: 30%
    level_4: 0%

  difficulty_progression_chart:
    level_1:
      skill_estimate: 20%
      challenge_estimate: 25%
      flow_zone: "entry"
    level_2:
      skill_estimate: 40%
      challenge_estimate: 50%
      flow_zone: "building"
    level_3:
      skill_estimate: 70%
      challenge_estimate: 75%
      flow_zone: "deep"
    level_4:
      skill_estimate: 90%
      challenge_estimate: 95%
      flow_zone: "expert"

  progression_gates:
    - gate_id: "entry_l1"
      level: 1
      type: "entry"
      requirement: "Pre-assessment on stakeholder identification"
      passing_score: 0.75

    - gate_id: "exit_l1"
      level: 1
      type: "exit"
      requirement: "Execute 2-feature launch + satisfaction"
      passing_score: 1.0

    - gate_id: "entry_l2"
      level: 2
      type: "entry"
      requirement: "Pass L1 exit gate"
      passing_score: 1.0

    # ... additional gates ...
```

### Secondary Outputs

1. **Skill Dependency Map (Visual)**
   - Format: Markdown + ASCII art
   - Content: Shows how skills build across levels
   - Use: Design reference, learner communication

2. **Scaffolding Fade Schedule**
   - Format: Markdown table
   - Content: When each support element is removed
   - Use: Coach reference for when to adjust support

3. **Difficulty Calibration Report**
   - Format: Markdown
   - Content: Flow zone analysis + difficulty jump verification
   - Use: Validation that progression is smooth

---

## Validation

### Checklist

- [ ] All 4 levels defined with clear learning objectives
- [ ] Each level has 2-3 NEW skills + prerequisite skills from previous
- [ ] Scaffolding decreases progressively (100% → 60% → 30% → 0%)
- [ ] No difficulty jump > 1.5x (checked in flow calibration)
- [ ] Entry/exit gates measurable and achievable
- [ ] Success criteria are objective (not vague)
- [ ] Time estimates include buffer
- [ ] Skill prerequisites explicitly mapped (L2 builds on specific L1 skills)
- [ ] Expert level isn't just "do more" but includes mentoring/innovation
- [ ] Progression gates prevent skipping levels

### Success Criteria

**Threshold: 9/10 on quality rubric**

| Criteria | Excellent (3) | Acceptable (2) | Poor (1) |
|----------|--------------|----------------|---------|
| **Level Clarity** | Each level has distinct, measurable learning objectives | Objectives present but somewhat vague | Objectives missing or generic |
| **Skill Progression** | New skills clearly prerequisite previous skills, no jumps | Skill progression clear but some connections weak | Skills seem disconnected |
| **Scaffolding Fade** | Support decreases progressively (100/60/30/0) with rationale | Scaffolding decreases but inconsistent | No clear scaffolding strategy |
| **Difficulty Balance** | Flow zone maintained at all levels (no cliffs >1.5x) | Mostly smooth, 1 difficult jump | Multiple difficulty jumps |
| **Gate Clarity** | Entry/exit gates measurable and achievable | Gates present but somewhat vague | Gates missing or unmeasurable |
| **Time Estimation** | Realistic time + buffer, matches skill difficulty | Time estimated but conservative | Time unrealistic |
| **Learner Customization** | Progression tailored to target learner profile | Generic progression | Doesn't match learner profile |
| **Expert Level** | L4 includes mentoring + innovation (not just more practice) | L4 is advanced practice | L4 is same as L3 but bigger |

---

## Estimated Effort

| Role | Effort | Notes |
|------|--------|-------|
| **Agent** | 25-35 min | Decomposition, skill mapping, scaffolding design |
| **Human** | 15-20 min | Validation of progression, approval of gates |
| **Total Duration** | 40-55 min | Single session |

---

## Integration

### Feeds To

**Workflow:** Challenge Aprendizado (dopamine-learning/challenge-aprendizado)

**Next Task in Sequence:** Task 6 - design-challenge-narratives
- Uses: Level progression + skill specs
- Produces: Narrative framing for each level

### Depends On

- Challenge specification (input)
- Target learner profile (input)

### Agent Routing

**Primary Agent:** Csikszentmihalyi (flow calibration expert)
**Supporting Agents:** Gee (scaffolding), Fogg (behavior progression)

**Handoff:** Output ready for Task 6 immediately

---

## Background: Scaffolding Theory (Gee)

### Core Principle

Scaffolding = temporary support removed as learner gains competence.

1. **Level 1 (Full scaffolding):** Learner does task WITH full support
2. **Level 2 (Moderate scaffolding):** Learner does task WITH reduced support
3. **Level 3 (Minimal scaffolding):** Learner does task WITH tiny support
4. **Level 4 (No scaffolding):** Learner does task AUTONOMOUSLY

Timing of removal matters: Too fast = frustration, too slow = dependency.

---

## Related Tasks

- **Task 6:** design-challenge-narratives (uses level progression)
- **Task 7:** calculate-flow-calibration (validates difficulty progression)
- **Task 8:** architect-assessment-progression (defines assessment per level)

---

## Revision History

| Version | Date | Change |
|---------|------|--------|
| 1.0.0 | 2026-02-12 | Initial production release |

