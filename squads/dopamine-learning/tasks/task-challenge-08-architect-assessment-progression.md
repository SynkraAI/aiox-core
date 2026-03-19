# Task: Architect Assessment Progression

**Task ID:** dopamine-learning/challenge-08-architect-assessment-progression
**Version:** 1.0.0
**Status:** Production Ready
**Created:** 2026-02-12
**Category:** Challenge Aprendizado Workflow
**Total Lines:** 360

---

## Executive Summary

This task designs how success is measured and validated at each level, ensuring assessment difficulty matches challenge difficulty. Rather than a single final test, this creates progressive assessment gates (entry/exit per level) that measure specific competencies and provide clear advancement criteria.

**Workflow Position:** Phase 4 of Challenge Aprendizado workflow
**Input Dependency:** Requires Tasks 5-7 (progression, narrative, flow calibration) completed
**Success Definition:** Assessment framework with measurable rubrics + progression gates for all 4 levels
**Output Quality Gate:** Each gate is objective, achievable, and aligned with learning objectives**

---

## Purpose

Challenge progressions fail when assessment doesn't match difficulty:
- ❌ L1 has simple test, L3 has complex test (inconsistent rigor)
- ❌ Final assessment only (no progress check until end)
- ❌ Vague success criteria ("learner demonstrates mastery")

This task creates:
- ✅ Clear, measurable success criteria per level
- ✅ Entry gates verify prerequisite skills
- ✅ Exit gates prove mastery before advancement
- ✅ Assessment difficulty matches challenge difficulty

---

## Executor Type

**Agent (100%)**

Pure assessment design using Kapp (instructional design) + Gee (learning validation) frameworks.

---

## Inputs

### Required Inputs

```yaml
level_progression:
  field: "4-level progression with learning objectives"
  format: "YAML (from Task 5)"
  required: true

flow_calibration:
  field: "Challenge-skill balance verification"
  format: "YAML (from Task 7)"
  required: true

narrative_framework:
  field: "Stakes + hero positioning per level"
  format: "YAML (from Task 6)"
  required: true
```

---

## Preconditions

- [ ] Task 5 completed (levels defined)
- [ ] Task 7 completed (flow calibration done)
- [ ] Task 6 completed (narrative stakes defined)

---

## Steps

### Step 1: Define Assessment Approach Per Level (6 min)

**Agent Activity:**
- Choose assessment method matching difficulty:
  - L1: Simple performance test (execution with checklist)
  - L2: Moderate performance test (execution + contingency handling)
  - L3: Complex performance test (execution + adaptation + real stakeholder feedback)
  - L4: Synthesis assessment (design + mentoring + innovation)

- Map to cognitive demand:
  - L1 (Bloom L2): Knowledge + comprehension → simple test
  - L2 (Bloom L3): Application → scenario-based test
  - L3 (Bloom L4): Analysis + synthesis → real-world performance
  - L4 (Bloom L5-6): Evaluation + creation → design + mentoring evaluation

**Output:** Assessment type per level

**Checkpoint:** Assessment methods selected

---

### Step 2: Create Entry Gate Specifications (8 min)

**Agent Activity:**
- For each level, specify entry gate (what must learner prove before entering):

```
L1 Entry Gate:
- Assessment: Pre-test on stakeholder identification
- Requirement: Identify 10 stakeholders from case study + explain roles
- Passing score: 75% (7/10 correct)
- Purpose: Verify learner has foundation

L2 Entry Gate:
- Assessment: Pass L1 exit gate successfully
- Requirement: Complete L1 launch + satisfaction ≥4/5
- Passing score: 100% (all gate criteria met)
- Purpose: Verify L1 mastery before advancing

L3 Entry Gate:
- Assessment: Pass L2 exit gate + case study
- Requirement: L2 launch success + analyze case study of failed launch
- Passing score: 100% (gate) + 80% (case study)
- Purpose: Verify L2 mastery + reactive thinking

L4 Entry Gate:
- Assessment: Pass L3 exit gate twice (2 launches)
- Requirement: Successfully execute 2 different L3 launches
- Passing score: 100% (both gates) + proactive decisions ≥3
- Purpose: Verify mastery + leadership presence
```

**Output:** Entry gate specifications for all levels

**Checkpoint:** Gates ensure proper skill foundation

---

### Step 3: Create Exit Gate Specifications (10 min)

**Agent Activity:**
- For each level, specify exit gate (what must learner prove to advance):

```
L1 Exit Gate: Execute Simple Launch
- Task: Execute 2-feature launch with provided checklist
- Success Criteria:
  * Checklist completion: 100%
  * Stakeholder communication: Proactive (not reactive)
  * Timeline accuracy: Within ±3 days
  * Post-assessment survey: Stakeholder satisfaction ≥4/5
- Grading: All 4 criteria must be met (OR logic)
- Time limit: 1 week

L2 Exit Gate: Execute Moderate Launch
- Task: Execute 5-feature launch using templates (self-created if needed)
- Success Criteria:
  * Timeline: Within ±2 days
  * Dependencies: 90%+ identified and planned
  * Contingencies: ≥3 contingency plans executed
  * Stakeholder feedback: ≥4.2/5
  * Reactive problem-solving: Visible (≥1 adaptation)
- Grading: 4/5 criteria met (one can be conditional)
- Time limit: 1 week

L3 Exit Gate: Execute Complex Launch Independently
- Task: Execute 8-feature launch from scratch (no templates)
- Success Criteria:
  * Timeline: Within ±1 day
  * Proactive adaptations: ≥3 major decisions made
  * Stakeholder satisfaction: ≥4.4/5
  * Risk management: Zero surprises (all risks identified/mitigated)
  * Peer feedback: "They handled this like a leader"
- Grading: 5/5 criteria must be met (AND logic—high bar)
- Time limit: 2 weeks

L4 Exit Gate: Design System + Mentor
- Task: Design launch architecture (20+ features) + mentor peer through L3
- Success Criteria:
  * Architecture: Documented with clear rationale
  * Mentee success: Peer completes L3 successfully (≥90%)
  * Innovations: ≥2 process improvements proposed with rationale
  * Expert evaluation: Leadership rates as "ready for bigger scope"
  * Legacy evidence: "This system enables future launches"
- Grading: All criteria must be met (AND logic—highest bar)
- Time limit: Open-ended (4-6 weeks typical)
```

**Output:** Exit gate specifications for all levels

**Checkpoint:** Gates appropriately measure competency per level

---

### Step 4: Create Rubrics Per Level (10 min)

**Agent Activity:**
- For each exit gate, create detailed grading rubric:

```
L1 RUBRIC:
Criterion: Checklist Completion
- Excellent (3 pts): 100%, all items with notes
- Acceptable (2 pts): 95-99%, minor items missed
- Poor (1 pt): <95%, multiple items missed
- Failing (0 pts): <90% or skipped items

Criterion: Stakeholder Communication
- Excellent (3): Proactive communication on all decisions
- Acceptable (2): Mostly proactive, some reactive
- Poor (1): Mostly reactive, few proactive
- Failing (0): Completely reactive

[Similar rubrics for Timeline, Satisfaction]

PASSING GRADE: ≥10/12 points (3 criteria × 4 points max)
```

- Rubric levels should align with flow zone expectations:
  - L1: Lower bar (building confidence)
  - L2: Moderate bar (building mastery)
  - L3: High bar (testing leadership)
  - L4: Highest bar (testing expert level)

**Output:** Detailed rubrics for all exit gates

**Checkpoint:** Rubrics are specific and measurable

---

### Step 5: Map Assessment to Narrative Stakes (8 min)

**Agent Activity:**
- Connect assessment to narrative consequences:

```
L1 Narrative: "First challenge, learning environment"
Assessment Consequence: "If you fail, we adjust. No shame."

L2 Narrative: "Your decisions affect 50+ people"
Assessment Consequence: "If you don't plan well, launch delays. People feel it."

L3 Narrative: "Organization depends on you"
Assessment Consequence: "If you can't adapt, launch fails. Organization doubts you."

L4 Narrative: "You're architecting the future"
Assessment Consequence: "If your design is weak, culture breaks. Legacy matters."
```

- Assessment stakes should match narrative stakes for psychological alignment

**Output:** Assessment-narrative alignment map

**Checkpoint:** Assessment consequences feel real to learner

---

### Step 6: Create Progression Checkpoint Document (6 min)

**Agent Activity:**
- Synthesize into progression framework:
  - All entry gates (4 total)
  - All exit gates (4 total)
  - All rubrics (4 total)
  - Passing scores per level
  - Advancement logic (what triggers moving to next level?)

**Output:** Complete assessment progression spec

**Checkpoint:** Ready for implementation

---

## Outputs

### Primary Output

**Assessment Progression Specification**

Format: YAML
Location: `/squads/dopamine-learning/data/assessment-specs/{{ challenge-slug }}-assessment-progression.yaml`

```yaml
assessment_framework:
  challenge_id: "pm-launch-orchestration"
  created: "{{ timestamp }}"

  progression_gates:
    - level_number: 1
      level_name: "Novice"

      entry_gate:
        gate_id: "entry_l1_pre_assessment"
        gate_type: "entry"
        assessment_name: "Pre-Assessment: Stakeholder Identification"
        format: "knowledge_test"
        task: |
          Learner reads case study (2-page product company launch scenario).
          Task: Identify 10 key stakeholders and explain their roles.
        success_criteria:
          - "Identify ≥8/10 stakeholders correctly"
          - "Explain role for ≥7/10 correctly"
        passing_score: 0.75  # 75%
        passing_logic: "AND (both criteria must be met)"
        time_limit_minutes: 30
        purpose: "Verify foundation knowledge before training"

      exit_gate:
        gate_id: "exit_l1_simple_launch"
        gate_type: "exit"
        assessment_name: "Execute 2-Feature Launch"
        format: "performance_test"
        task: |
          Execute end-to-end 2-feature product launch using provided checklist.
          Real or simulated launch. All support available.
        rubric:
          - criterion: "Checklist Completion"
            weight: 25
            excellent: "100%, all items documented"
            acceptable: "95-99%, 1-2 items missed"
            poor: "<95%, multiple items missed"
            score_excellent: 3
            score_acceptable: 2
            score_poor: 1
            score_failing: 0

          - criterion: "Stakeholder Communication"
            weight: 25
            excellent: "Proactive communication to all stakeholders pre-announcement"
            acceptable: "Mostly proactive, 1-2 reactive"
            poor: "Mostly reactive"
            score_excellent: 3
            score_acceptable: 2
            score_poor: 1
            score_failing: 0

          - criterion: "Timeline Accuracy"
            weight: 25
            excellent: "Launch ±0-1 day from plan"
            acceptable: "Launch ±2-3 days from plan"
            poor: "Launch ±4+ days from plan"
            score_excellent: 3
            score_acceptable: 2
            score_poor: 1
            score_failing: 0

          - criterion: "Stakeholder Satisfaction"
            weight: 25
            excellent: "Post-launch survey ≥4.5/5"
            acceptable: "Post-launch survey 4.0-4.4/5"
            poor: "Post-launch survey 3.5-3.9/5"
            score_excellent: 3
            score_acceptable: 2
            score_poor: 1
            score_failing: 0

        passing_score: 10  # 10/12 points minimum (83%)
        passing_logic: "AND (all 4 criteria ≥1 point)"
        time_limit_days: 7
        purpose: "Prove L1 competency before advancing"

      advancement_logic: |
        IF exit_gate_score ≥ 10/12:
          Status: PASS → Can advance to L2
        IF exit_gate_score < 10/12:
          Status: CONDITIONAL → Redo specific failed criteria
          OR FAIL → Must repeat L1

    - level_number: 2
      level_name: "Intermediate"

      entry_gate:
        gate_id: "entry_l2_l1_mastery"
        gate_type: "entry"
        assessment_name: "L1 Mastery Verification"
        format: "performance_verification"
        task: |
          Learner must have passed L1 exit gate.
          + Demonstrate L1 skills in new context (different product).
        success_criteria:
          - "L1 exit gate: Pass score ≥10/12"
          - "L1 application: Execute variant launch ≥8/12"
        passing_score: 1.0  # 100% of criteria
        passing_logic: "AND (both must be met)"
        time_limit_days: 3
        purpose: "Verify L1 mastery in new context"

      exit_gate:
        gate_id: "exit_l2_moderate_launch"
        gate_type: "exit"
        assessment_name: "Execute 5-Feature Launch"
        format: "performance_test"
        task: |
          Execute 5-feature launch with templates.
          Learner must navigate:
          - 15+ stakeholders
          - 2-3 dependencies to manage
          - 1-2 contingencies to plan
          Real or simulated. Reduced support (coach available for Q&A, not proactive).
        rubric:
          - criterion: "Timeline Accuracy"
            weight: 20
            excellent: "±0-1 days"
            acceptable: "±2 days"
            poor: ">±2 days"

          - criterion: "Dependency Management"
            weight: 20
            excellent: "90%+ identified + managed"
            acceptable: "75-89% identified + managed"
            poor: "<75%"

          - criterion: "Contingency Planning"
            weight: 20
            excellent: "≥3 contingencies planned"
            acceptable: "2 contingencies"
            poor: "<2 contingencies"

          - criterion: "Stakeholder Satisfaction"
            weight: 20
            excellent: "≥4.2/5"
            acceptable: "4.0-4.1/5"
            poor: "<4.0/5"

          - criterion: "Adaptive Decision-Making"
            weight: 20
            excellent: "≥2 proactive adaptations"
            acceptable: "1 proactive adaptation"
            poor: "0 proactive adaptations"

        passing_score: 3.5  # Average ≥3.5 points (avg of 5 criteria)
        passing_logic: "4/5 criteria must score ≥2 (acceptable or better)"
        time_limit_days: 7
        purpose: "Prove L2 competency before advancing"

      advancement_logic: |
        IF exit_gate_average ≥ 3.5:
          Status: PASS → Can advance to L3
        ELSE IF exit_gate_average ≥ 3.0 AND learner_feedback = "ready":
          Status: CONDITIONAL → Can attempt L3 with extra scaffolding
        ELSE:
          Status: FAIL → Redo L2

    # L3 and L4 follow similar structure with higher bars...

  assessment_summary:
    total_gates: 8  # 4 entry + 4 exit
    progression_style: "mastery-based"  # Must meet criteria to advance
    retry_policy: "Unlimited retries until passing. No time limit."
    rubric_calibration: "Rigor increases with level (L1: 83% pass → L4: 100% pass)"

  learner_customization:
    if_high_ability: |
      - Allow skipping L1 if pre-assessment = 90%
      - Increase L3/L4 bar (expect ≥4 adaptations instead of ≥3)
    if_anxious: |
      - Extra L1 support (can redo exit gate 3x without penalty)
      - L2/L3 gates have "conditional pass" option (progress with extra scaffolding)
    if_low_motivation: |
      - Add gamification (points, badges per gate passed)
      - More frequent checkpoints (weekly, not gate-based)
```

### Secondary Outputs

1. **Gate Rubrics Matrix** (visual table for reference)
2. **Passing Score Justification** (markdown, why each bar)
3. **Advancement Decision Tree** (flowchart for gate logic)

---

## Validation

### Checklist

- [ ] Entry gates verify prerequisite skills
- [ ] Exit gates measure specific learning objectives
- [ ] Rubrics are objective and measurable
- [ ] Passing scores are appropriate to level difficulty
- [ ] Assessment difficulty matches challenge difficulty (from Task 7)
- [ ] Gates prevent skipping levels (must pass L2 to enter L3)
- [ ] Advancement logic is clear (IF score > X, THEN advance)
- [ ] Learner customization provided (high ability, anxious, low motivation)
- [ ] Gates include real-world component (not just knowledge test)

### Success Criteria

**Threshold: 9/10**

| Criteria | Excellent | Acceptable | Poor |
|----------|-----------|-----------|------|
| **Gate Clarity** | Entry/exit gates crystal clear, measurable | Most gates clear, some vague | Vague gate criteria |
| **Rubric Quality** | Specific scores per performance level | Rubrics present, some ambiguity | Generic rubrics |
| **Rigor Progression** | L1 gentle, L4 very hard (clear progression) | Mostly progressive | Inconsistent rigor |
| **Real-World Element** | Gates include performance in context | Some simulation | Pure knowledge tests |
| **Advancement Logic** | Clear IF-THEN logic for progression | Logic mostly clear | Ambiguous advancement |

---

## Estimated Effort

| Role | Effort |
|------|--------|
| Agent | 40-50 min |
| Total | 40-50 min |

---

## Integration

### Feeds To

**Workflow Completion:** This is final task for Challenge Aprendizado workflow

### Depends On

- Task 5: Level progression
- Task 6: Narrative framework
- Task 7: Flow calibration

### Agent Routing

**Primary Agents:** Kapp (assessment design), Gee (learning validation)

---

## Revision History

| Version | Date | Change |
|---------|------|--------|
| 1.0.0 | 2026-02-12 | Initial release |

