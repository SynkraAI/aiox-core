# Task: Personalize Feedback Rules

**Task ID:** dopamine-learning/assessment-11-personalize-feedback-rules
**Version:** 1.0.0
**Status:** Production Ready
**Created:** 2026-02-12
**Category:** Assessment Feedback Realtime Workflow
**Total Lines:** 320

---

## Executive Summary

This task creates conditional feedback logic that personalizes the 4-layer feedback based on learner profile (anxiety level, learning pace, confidence). Instead of one-size-fits-all feedback, different learners get feedback timed and framed for their psychological state.

**Workflow Position:** Phase 3 of Assessment Feedback Realtime workflow
**Input Dependency:** Requires Task 10 (feedback layers) completed
**Success Definition:** Personalization rules for 3+ learner segments (anxiety, pace, confidence)**

---

## Purpose

Generic feedback for all learners:
- ❌ Anxious learners get delayed feedback (anxiety increases)
- ❌ High-achievers get simple feedback (boredom increases)
- ❌ Slow learners get fast feedback cadence (overwhelm)

Personalized feedback:
- ✅ Anxious learners: Fast L1-2 (300ms), reassuring copy
- ✅ High-achievers: Normal timing, deeper principle
- ✅ Slow learners: Slower cadence (600ms between layers)

---

## Executor Type

**Agent (100%)**

Pure rules engine design for feedback personalization.

---

## Inputs

### Required Inputs

```yaml
feedback_layers:
  field: "4-layer feedback from Task 10"
  format: "YAML"
  required: true

learner_profile:
  field: "Learner traits (anxiety, pace, confidence)"
  format: "YAML (from Task 1)"
  required: true

personalization_segments:
  field: "Learner segments to support"
  format: "list"
  example: |
    - Anxious learner (anxiety_level > 7)
    - High-achiever (ability > 70%)
    - Slow processor (cognitive_load < 30min)
```

---

## Preconditions

- [ ] Task 10 completed (feedback layers)
- [ ] Learner segmentation defined
- [ ] Decision logic clear (IF anxiety > 7, THEN...)

---

## Steps

### Step 1: Define Learner Segments (6 min)

Identify primary personalization dimensions:
- **Anxiety Level:** 1-10 scale
- **Processing Speed:** Fast / Moderate / Slow
- **Confidence Level:** Low / Moderate / High
- **Performance:** Struggling / Progressing / Excelling

Create segments:
```
SEGMENT 1: Anxious High-Performer
- Anxiety: 7+
- Confidence: Low (despite ability)
- Speed: Fast
- Action: Fast feedback (reassurance), emphasize progress

SEGMENT 2: Confident Achiever
- Anxiety: <4
- Confidence: High
- Speed: Fast
- Action: Normal feedback, deeper principles

SEGMENT 3: Slow Processor
- Anxiety: Varies
- Speed: Slow
- Processing: Needs time
- Action: Longer delays, more thinking time

SEGMENT 4: Struggling but Motivated
- Performance: Below 50%
- Motivation: High
- Speed: Moderate
- Action: More supportive language, frequent wins
```

**Output:** Learner segments with decision criteria

**Checkpoint:** Segments identified

---

### Step 2: Design Feedback Rules Per Segment (10 min)

For each segment, specify customizations:

```
SEGMENT 1: ANXIOUS HIGH-PERFORMER
Rule 1 (Timing):
  IF anxiety_level >= 7:
    L1_delay = 100ms (unchanged)
    L2_delay = 200ms (faster than 300ms baseline)
    L3_delay = 1000ms (faster than 2000ms)
    L4_delay = 5000ms (shorter wait)

Rule 2 (Copy):
  IF anxiety_level >= 7:
    L1_copy = "✓ You're on track" (emphasize progress)
    L2_copy = Include positive framing ("This shows strong thinking")
    Remove any "but" language (creates doubt)

Rule 3 (Frequency):
  IF anxiety_level >= 7:
    Show progress more frequently (quiz shows 15% → 20% bar)
    Add affirmations between layers

SEGMENT 2: CONFIDENT ACHIEVER
Rule 1 (Depth):
  IF ability > 70% AND anxiety < 4:
    Include additional complexity in L3
    Add advanced principle connections in L4
    Use technically precise language

Rule 2 (Autonomy):
  IF confidence > 7:
    Allow question review during feedback
    Let them skip layers if desired
    Provide "show more details" option

SEGMENT 3: SLOW PROCESSOR
Rule 1 (Timing):
  IF processing_speed = "slow":
    Increase all delays by 25%
    L1: 100-150ms (unchanged)
    L2: 350-450ms (keep normal)
    L3: 1500-3500ms (slower for thinking)
    L4: 7000-20000ms (more time for integration)

Rule 2 (Pacing):
  IF cognitive_load < 40min:
    Space layers further apart
    Add "pause and think" prompts
    Allow replay of layers

SEGMENT 4: STRUGGLING BUT MOTIVATED
Rule 1 (Support):
  IF performance < 50% AND motivation >= 7:
    Add extra encouragement language
    Highlight any correct reasoning, even if final answer wrong
    Provide hint-based progression

Rule 2 (Scaffolding):
  IF performance < 50%:
    Add Layer 2.5 (micro-scaffolding)
    More detailed explanation with examples
    Link to prerequisite concepts
```

**Output:** Rules specifications for all segments

**Checkpoint:** All segments have decision logic

---

### Step 3: Create Personalization Conditions (8 min)

Define exact IF-THEN logic for platform implementation:

```
CONDITION 1 - Anxiety Detection:
IF learner_profile.anxiety_level >= 7
  THEN apply_segment: "anxious_high_performer"
  THEN trigger: "fast_feedback_reassurance"

CONDITION 2 - High Ability Detection:
IF learner_profile.ability_percent > 70 AND learner_profile.anxiety_level < 4
  THEN apply_segment: "confident_achiever"
  THEN trigger: "deep_principles"

CONDITION 3 - Slow Processor Detection:
IF learner_profile.cognitive_load_minutes < 40
  THEN apply_segment: "slow_processor"
  THEN trigger: "extended_timing"

CONDITION 4 - Performance Monitor:
IF last_5_questions_performance < 0.50 AND learner_profile.intrinsic_motivation > 7
  THEN apply_segment: "struggling_but_motivated"
  THEN trigger: "supportive_language" + "scaffolding"

CONDITION 5 - Dynamic Adjustment:
IF confidence_score was_low NOW is_high:
  THEN gradually_reduce_support (e.g., less reassurance)

IF performance consistently_high:
  THEN increase_difficulty (harder questions)
```

**Output:** Executable IF-THEN conditions

**Checkpoint:** All conditions testable

---

### Step 4: Create Personalization Rules Document (6 min)

Synthesize into YAML with:
- Learner segments (with identification criteria)
- Rules per segment (feedback customizations)
- Conditions (IF-THEN logic)
- Monitoring & adaptation (how to detect if personalization working)

**Output:** Complete personalization spec YAML

**Checkpoint:** Ready for Task 12 implementation spec

---

## Outputs

### Primary Output

**Personalization Rules Specification**

Format: YAML
Location: `/squads/dopamine-learning/data/personalization-rules/{{ assessment-slug }}-personalization-rules.yaml`

```yaml
personalization_framework:
  assessment_id: "product-onboarding"
  created: "{{ timestamp }}"

  segments:
    - segment_id: "anxious_high_performer"
      segment_name: "Anxious High-Performer"
      identification_criteria:
        anxiety_level: "> 7"
        ability_percent: "> 60"
        confidence: "< 5"
      description: "High ability but self-doubt + anxiety. Need fast reassurance."

      feedback_customizations:
        layer_1:
          timing_ms: 100  # unchanged
          copy: "✓ On track"  # progress emphasis
        layer_2:
          timing_ms: 200  # faster than 300ms baseline
          copy_addition: "This shows smart thinking"
        layer_3:
          timing_ms: 1000  # faster than 2000ms
          copy_tone: "supportive"
        layer_4:
          timing_ms: 5000  # shorter wait
          copy_addition: "You're building mastery"

      additional_support:
        - "Show progress bar after every 3 questions"
        - "Add confidence-building affirmations"
        - "Remove negative language ('but', 'however')"

    # ... additional segments ...

  conditions:
    - condition_id: "anxiety_trigger"
      description: "Detect anxious learner"
      rule: "IF anxiety_level >= 7 THEN segment=anxious_high_performer"
      monitoring: "Check anxiety_level from profile"

    - condition_id: "performance_adaptation"
      description: "Adapt based on live performance"
      rule: "IF last_5_performance < 0.5 AND motivation > 7 THEN increase_support"
      monitoring: "Calculate rolling 5-question average"

  monitoring_and_adaptation:
    check_frequency: "every_3_questions"
    metrics_to_monitor:
      - "confidence_score (is it increasing?)"
      - "question_completion_rate (are they staying engaged?)"
      - "feedback_satisfaction (do they feel helped?)"

    adaptation_triggers:
      - "IF confidence increases 2+ points: Gradually reduce reassurance"
      - "IF performance plateaus: Increase challenge"
      - "IF engagement drops: Add more scaffolding"

  guardrails:
    - "Never remove personalization abruptly (gradual fade)"
    - "Always default to supportive tone (don't assume confidence)"
    - "Monitor for gaming system (e.g., selecting 'slow' mode falsely)"
```

### Secondary Outputs

1. **Segment Decision Tree** (flowchart for identification)
2. **Personalization Impact Matrix** (which changes affect which learners)
3. **Monitoring Dashboard Spec** (what to track)

---

## Validation

### Checklist

- [ ] 3+ learner segments identified
- [ ] Each segment has specific identification criteria (not vague)
- [ ] Feedback customizations are actionable (testable in code)
- [ ] Rules don't conflict (no overlapping IF conditions)
- [ ] Monitoring strategy defined (how to know if working)
- [ ] Adaptation triggers specify when to change personalization
- [ ] Guardrails prevent misuse (no gaming)

### Success Criteria

**Threshold: 8/10**

| Criteria | Excellent | Acceptable | Poor |
|----------|-----------|-----------|------|
| **Segment Clarity** | Clear identification + distinct strategies | Segments clear but overlap | Vague boundaries |
| **Rule Specificity** | Exact IF-THEN logic, testable | Rules mostly testable | Vague rules |
| **Learner Relevance** | Personalization addresses real learner needs | Mostly relevant | Generic segments |
| **Monitoring** | Clear metrics for success | Monitoring present, vague | No monitoring plan |

---

## Estimated Effort

| Role | Effort |
|------|--------|
| Agent | 30-40 min |
| Total | 30-40 min |

---

## Integration

### Feeds To

**Final Task:** Task 12 - generate-implementation-spec
- Uses: Personalization rules
- Produces: Technical implementation guide

### Agent Routing

**Primary Agent:** Eyal (engagement/habit formation)

---

## Revision History

| Version | Date | Change |
|---------|------|--------|
| 1.0.0 | 2026-02-12 | Initial release |
