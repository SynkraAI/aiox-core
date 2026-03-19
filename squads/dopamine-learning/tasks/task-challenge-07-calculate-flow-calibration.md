# Task: Calculate Flow Calibration (Challenge-Skill Balance)

**Task ID:** dopamine-learning/challenge-07-calculate-flow-calibration
**Version:** 1.0.0
**Status:** Production Ready
**Created:** 2026-02-12
**Category:** Challenge Aprendizado Workflow
**Total Lines:** 350

---

## Executive Summary

This task applies Csikszentmihalyi's flow model to ensure challenge never exceeds learner's skill by more than 1.2x. Each level is calibrated so learners stay in the "flow zone" (challenge slightly above current skill) rather than falling into anxiety (too hard) or boredom (too easy). The result is 4 levels where motivation stays high throughout because difficulty feels achievable but not boring.

**Workflow Position:** Phase 3 of Challenge Aprendizado workflow
**Input Dependency:** Requires Task 5 (level progression) + Task 6 (narratives) completed
**Success Definition:** All 4 levels have challenge-skill calibration verified; no cliff jumps**

---

## Purpose

Challenge levels fail when:
- ❌ Level 2 is 3x harder than Level 1 (anxiety zone, learners quit)
- ❌ Level 1 is 0.5x difficulty (boredom zone, learners disengage)

This task ensures:
- ✅ Challenge grows at exactly the rate skill can grow
- ✅ Each level keeps learners in optimal flow state
- ✅ Motivation stays high because difficulty feels surmountable

---

## Executor Type

**Agent (100%)**

Pure mathematical calibration of challenge vs skill levels using Csikszentmihalyi framework.

---

## Inputs

### Required Inputs

```yaml
level_progression:
  field: "4-level progression with difficulty specs"
  format: "YAML (from Task 5)"
  required: true

narrative_framework:
  field: "Narrative with stakes/hero positioning"
  format: "YAML (from Task 6)"
  required: true

learner_profile:
  field: "Learner's baseline skill + ability"
  format: "YAML (from Task 1)"
  required: true
```

---

## Preconditions

- [ ] Task 5 completed (level progression exists)
- [ ] Task 6 completed (narratives with stakes defined)
- [ ] Learner baseline skill known (from Task 1)

---

## Steps

### Step 1: Establish Baseline Skill Level (5 min)

**Agent Activity:**
- Define learner's current state on 0-100 scale:
  - 0%: Complete novice, no relevant skills
  - 20%: Some foundation, but needs scaffolding
  - 40%: Moderate competence, can execute with support
  - 60%: Strong competence, mostly autonomous
  - 80%: Expert-level skills
  - 100%: Master, teaching others

- From Task 1 learner profile, extract current skill level
- Example: "PM can manage 1-feature launch = 20% skill level for full orchestration"

**Output:** Baseline skill percentage (0-100)

**Checkpoint:** Current state quantified

---

### Step 2: Define Challenge Difficulty Per Level (8 min)

**Agent Activity:**
- For each level, estimate challenge difficulty on 0-100 scale:
  - Complexity (# of stakeholders, features, decisions)
  - Unpredictability (how much can go wrong)
  - Autonomy required (how much support available)

Example:
```
Level 1: 2 features, 5 stakeholders, full checklist = 25% challenge
Level 2: 5 features, 15 stakeholders, 60% support = 50% challenge
Level 3: 8 features, 50+ stakeholders, 30% support = 75% challenge
Level 4: 20+ features, 100+ stakeholders, 0% support = 95% challenge
```

**Output:** Challenge difficulty per level (0-100)

**Checkpoint:** All levels have difficulty scores

---

### Step 3: Calculate Skill Progression Path (8 min)

**Agent Activity:**
- Estimate skill growth at each level:

```
Entry to L1: Skill grows from 20% → 35% (practice + feedback)
Entry to L2: Skill grows from 35% → 50%
Entry to L3: Skill grows from 50% → 75%
Entry to L4: Skill grows from 75% → 95%
```

- Growth rate depends on:
  - Scaffolding level (more support = slower growth)
  - Time available (1 week vs 1 month)
  - Feedback frequency
  - Learner motivation

**Output:** Skill progression estimate per level

**Checkpoint:** Skill growth trajectory specified

---

### Step 4: Verify Flow Zone (No Anxiety/Boredom) (8 min)

**Agent Activity:**
- Csikszentmihalyi's model:
  - Flow zone: Challenge is 1.0-1.4x current skill
  - Anxiety zone: Challenge > 1.5x skill (too hard)
  - Boredom zone: Challenge < 0.8x skill (too easy)

Verify each transition:
```
Level 1: Skill 35%, Challenge 25% → 25/35 = 0.71 (slight boredom, ok for confidence building)
Level 2: Skill 50%, Challenge 50% → 50/50 = 1.0 (perfect flow)
Level 3: Skill 75%, Challenge 75% → 75/75 = 1.0 (perfect flow)
Level 4: Skill 95%, Challenge 95% → 95/95 = 1.0 (perfect flow)
```

- Flag any transitions outside 0.8-1.4 range:
  - If ratio < 0.8: Add challenge (too boring)
  - If ratio > 1.5: Reduce challenge (too hard, add scaffolding)

**Output:** Flow zone verification for all transitions

**Checkpoint:** All levels in flow zone (no anxiety/boredom)

---

### Step 5: Identify Difficulty Cliffs & Mitigations (8 min)

**Agent Activity:**
- Check challenge jump between levels:
  - Acceptable: < 1.5x increase
  - Concerning: 1.5x-2.0x increase (may need scaffolding adjustment)
  - Dangerous: > 2.0x increase (needs level inserted or scaffolding added)

Example check:
```
L1→L2: Challenge 25% → 50% = 2.0x jump (concerning! need scaffolding)
L2→L3: Challenge 50% → 75% = 1.5x jump (acceptable)
L3→L4: Challenge 75% → 95% = 1.27x jump (acceptable)
```

- Mitigations for difficult jumps:
  - Add interim sub-level (L1.5)
  - Increase scaffolding in higher level
  - Provide explicit bridge learning

**Output:** Cliff analysis + mitigation strategies

**Checkpoint:** All cliff jumps identified + mitigated

---

### Step 6: Create Flow Calibration Spec (5 min)

**Agent Activity:**
- Synthesize into flow calibration document with:
  - Baseline skill level
  - Challenge difficulty per level
  - Expected skill progression
  - Flow zone verification (all green)
  - Cliff analysis + mitigations
  - Recommenda adjustments if needed

**Output:** Complete flow calibration spec

**Checkpoint:** Ready for Task 8

---

## Outputs

### Primary Output

**Flow Calibration Specification**

Format: YAML
Location: `/squads/dopamine-learning/data/flow-calibrations/{{ challenge-slug }}-flow-calibration.yaml`

```yaml
flow_calibration:
  challenge_id: "pm-launch-orchestration"
  created: "{{ timestamp }}"

  baseline:
    learner_current_skill: 20  # 0-100 scale
    current_skill_description: "Can execute 1-feature launch with full support"
    target_final_skill: 95
    target_final_description: "Can architect 20+ feature launch + mentor others"

  flow_model_theory:
    optimal_flow_zone: "1.0-1.4x (challenge is 1.0-1.4 times current skill)"
    anxiety_zone: "> 1.5x (too hard, learner overwhelmed)"
    boredom_zone: "< 0.8x (too easy, learner disengaged)"

  levels:
    - level_number: 1
      level_name: "Novice"

      skill_calibration:
        entry_skill: 20
        exit_skill: 35
        skill_growth: 15  # percentage points
        skill_growth_drivers:
          - "Practice with checklist support"
          - "Immediate feedback on decisions"
          - "Coach available for clarification"

      challenge_calibration:
        complexity_elements:
          - "2 features to coordinate"
          - "5 stakeholders to inform"
          - "1-week timeline"
          - "Pre-made decisions (when/what/how)"
        complexity_score: 25  # 0-100
        challenge_description: "Simple scaffold—low complexity, high support"

      flow_zone_analysis:
        ratio: 0.71  # 25 challenge / 35 skill = 0.71
        zone: "slight_boredom"
        zone_status: "✓ OK (building confidence, not pushing yet)"
        optimal_range: "0.71 is below optimal 1.0, but appropriate for L1 confidence building"

      transition_to_next_level:
        cliff_factor: 1.0  # 50 challenge (L2) / 35 skill (L1 exit) = 1.43x
        cliff_severity: "concerning"
        cliff_status: "⚠ Acceptable but steep. Will feel challenging. Add extra scaffolding in L2 start."

    - level_number: 2
      level_name: "Intermediate"

      skill_calibration:
        entry_skill: 35
        exit_skill: 50
        skill_growth: 15
        skill_growth_drivers:
          - "Templates provided (learner fills in)"
          - "Delayed coach support (not proactive)"
          - "Learner makes key decisions"

      challenge_calibration:
        complexity_elements:
          - "5 features to coordinate"
          - "15 stakeholders to manage"
          - "1 stakeholder dependency to resolve"
          - "1 contingency to plan"
        complexity_score: 50
        challenge_description: "Moderate complexity, reducing support"

      flow_zone_analysis:
        ratio: 1.0  # 50 challenge / 50 skill
        zone: "optimal_flow"
        zone_status: "✓ PERFECT (challenge = skill, optimal engagement)"

      transition_to_next_level:
        cliff_factor: 1.5  # 75 challenge (L3) / 50 skill (L2 exit)
        cliff_severity: "acceptable"
        cliff_status: "✓ 1.5x is at boundary of acceptable. Learner will feel stretched but capable."

    - level_number: 3
      level_name: "Advanced"

      skill_calibration:
        entry_skill: 50
        exit_skill: 75
        skill_growth: 25  # Bigger growth leap
        skill_growth_drivers:
          - "No templates (learner designs)"
          - "Coach available only for questions"
          - "All decisions learner responsibility"
          - "Real-world complexity (surprises)"

      challenge_calibration:
        complexity_elements:
          - "8 features to coordinate"
          - "50+ stakeholders to manage"
          - "3+ dependencies to resolve"
          - "Real-time adaptation required"
          - "Zero scaffolding support"
        complexity_score: 75
        challenge_description: "High complexity, minimal support—learner orchestrating"

      flow_zone_analysis:
        ratio: 1.0  # 75 challenge / 75 skill
        zone: "optimal_flow"
        zone_status: "✓ PERFECT (deep flow, mastery building)"

      transition_to_next_level:
        cliff_factor: 1.27  # 95 challenge (L4) / 75 skill (L3 exit)
        cliff_severity: "acceptable"
        cliff_status: "✓ 1.27x is comfortable. Learner ready for next leap."

    - level_number: 4
      level_name: "Expert"

      skill_calibration:
        entry_skill: 75
        exit_skill: 95
        skill_growth: 20
        skill_growth_drivers:
          - "Zero scaffolding (complete autonomy)"
          - "Peer learning, not coach"
          - "Mentoring responsibility (teaching others)"
          - "Innovation required"

      challenge_calibration:
        complexity_elements:
          - "20+ features to coordinate"
          - "100+ stakeholders"
          - "10+ dependencies"
          - "System design (not just execution)"
          - "Mentoring responsibility"
        complexity_score: 95
        challenge_description: "Extreme complexity, zero support—expert-level architecture"

      flow_zone_analysis:
        ratio: 1.0  # 95 challenge / 95 skill
        zone: "optimal_flow"
        zone_status: "✓ PERFECT (expert mastery, pushing boundaries)"

  overall_flow_progression:
    summary: |
      L1: 0.71 (slight boredom, confidence building) ✓
      L2: 1.0 (perfect flow) ✓
      L3: 1.0 (perfect flow) ✓
      L4: 1.0 (perfect flow) ✓

      All levels in acceptable range. Progression is smooth.
      No anxiety zones. No dangerous boredom.

  cliff_analysis:
    l1_to_l2:
      jump_factor: 1.43
      severity: "concerning"
      assessment: "L1 learner will feel stretch at L2 start. Mitigate with extra scaffolding first 2 days."
      mitigation: "Add 'L1.5 lite' where templates are partially filled. Full templates available by L2 day 3."

    l2_to_l3:
      jump_factor: 1.5
      severity: "acceptable"
      assessment: "Exactly at boundary. Learner ready but will feel challenged."
      mitigation: "No extra mitigation needed. This is intentional challenge bump."

    l3_to_l4:
      jump_factor: 1.27
      severity: "acceptable"
      assessment: "Comfortable progression. L3 success prepares well for L4."
      mitigation: "No mitigation needed. Natural progression."

  recommendations:
    - "Monitor L1→L2 transition closely. If learners struggle, add 'lite templates' mid-L2."
    - "L2→L3 cliff is intended. Communicate: 'You're ready for this step up.'"
    - "All levels maintain optimal flow. Proceed with progression design."
    - "Suggest extra scaffolding for anxious learners (add 25% support in L2/L3)."

  adjustments_if_needed:
    if_anxiety_high: |
      - Add L1.5 intermediate level
      - Keep L2 challenge at 45% (not 50%)
      - Provide templates in L3 (not "from scratch")

    if_low_motivation: |
      - Reduce L1→L2 jump by adding sub-level
      - Increase L2/L3 challenge to keep engagement (boost mastery opportunity)

    if_time_constrained: |
      - Reduce L4 to "Intermediate mastery" (no mentoring requirement)
      - Compress timeline by 25%
```

### Secondary Outputs

1. **Flow Zone Verification Matrix** (Markdown table)
2. **Cliff Jump Analysis** (visual chart)
3. **Scaffolding Adjustment Recommendations** (markdown)

---

## Validation

### Checklist

- [ ] All levels have challenge-skill ratio between 0.8-1.4
- [ ] No anxiety zone transitions (ratio > 1.5)
- [ ] No dramatic cliff jumps (> 2.0x)
- [ ] Skill progression path is realistic given scaffolding
- [ ] Flow zone stays consistent across all levels
- [ ] Mitigations identified for cliff concerns
- [ ] Learner customization guidance provided

### Success Criteria

**Threshold: 9/10**

| Criteria | Excellent | Acceptable | Poor |
|----------|-----------|-----------|------|
| **Flow Zone Coverage** | All levels 0.8-1.4 (no anxiety/boredom) | 3/4 levels optimal | Multiple zones out of range |
| **Cliff Analysis** | All jumps identified + mitigated | Most jumps identified | Cliff analysis incomplete |
| **Skill Progression** | Realistic growth path with drivers | Growth estimates present | Growth unrealistic |
| **Recommendations** | Specific, actionable adjustments | General suggestions | No recommendations |

---

## Estimated Effort

| Role | Effort |
|------|--------|
| Agent | 30-40 min |
| Total | 30-40 min |

---

## Integration

### Feeds To

**Next Task:** Task 8 - architect-assessment-progression

### Depends On

- Task 5: Level progression
- Task 6: Narrative framework

### Agent Routing

**Primary Agent:** Csikszentmihalyi (flow expert)

---

## Revision History

| Version | Date | Change |
|---------|------|--------|
| 1.0.0 | 2026-02-12 | Initial release |

