---
task-id: values-hierarchy-analysis
name: Values Hierarchy Analysis (Layer 6 - DNA Mental™)
agent: identity-analyst
version: 3.5.0
purpose: Map complete value hierarchy with sacrifices, trade-offs, anti-values, and temporal evolution

workflow-mode: interactive
elicit: true
elicitation-type: human-checkpoint

prerequisites:
  - Quote extraction completed (quotes_database.yaml exists)
  - Timeline mapping completed (life_timeline.yaml exists)
  - Behavioral patterns analyzed (behavioral_patterns.yaml exists)
  - Minimum 30+ sources spanning 3+ years
  - At least 10 documented sacrificial decisions

inputs:
  - name: mind_name
    type: string
    required: true

  - name: quotes_file
    type: file_path
    default: "squads/mmos-squad/minds/{mind_name}/artifacts/quotes_database.yaml"

  - name: timeline_file
    type: file_path
    default: "squads/mmos-squad/minds/{mind_name}/artifacts/life_timeline.yaml"

  - name: behavioral_file
    type: file_path
    default: "squads/mmos-squad/minds/{mind_name}/artifacts/behavioral_patterns.yaml"

  - name: minimum_core_values
    type: integer
    default: 10
    description: Minimum values in hierarchy (top 10-15)

  - name: triangulation_threshold
    type: float
    default: 0.70
    description: Minimum confidence for identity-critical layer

outputs:
  - path: "squads/mmos-squad/minds/{mind_name}/artifacts/values_hierarchy.yaml"
    description: Complete values hierarchy with evidences, anti-values, trade-offs
    format: yaml
    template: values-hierarchy.yaml

  - path: "squads/mmos-squad/minds/{mind_name}/docs/LAYER-6-VALIDATION-REPORT.md"
    description: Human checkpoint validation report
    format: markdown

validation:
  success-criteria:
    - "10-15 core values identified and ranked"
    - "Each value has 3+ independent behavioral evidences"
    - "Triangulation >= 70% (words + actions + consequences)"
    - "Anti-values documented (visceral rejections)"
    - "Trade-offs mapped with 3+ examples each"
    - "Temporal evolution tracked across life phases"
    - "🔴 HUMAN CHECKPOINT PASSED"

  warning-conditions:
    - "Any value with only 2 evidences (borderline)"
    - "Triangulation 60-69%"
    - "Missing anti-values section"
    - "Temporal evolution unclear"

  failure-conditions:
    - "Less than 10 core values identified"
    - "Any value with <2 evidences"
    - "Triangulation <60%"
    - "No sacrificial decisions documented"
    - "Human checkpoint rejected"

estimated-duration: "3-4 hours analysis + 30min human validation"
critical-success-factor: "Layer 6 errors cascade through Layer 7 (Obsessions) and Layer 8 (Paradoxes)"
human-checkpoint-required: true
---

# Values Hierarchy Analysis Task (Layer 6)

## Purpose

Map the complete hierarchy of values that drive all behavior and decision-making. Values are revealed through **sacrifices**, not proclamations. This is **Layer 6** of DNA Mental™ - identity-critical layer requiring **mandatory human validation**.

**Golden Rule:** Each value needs 3+ independent evidences or it's discarded as anomaly.

**Critical:** This layer shapes Layer 7 (Obsessions) and Layer 8 (Paradoxes). Errors here cascade through entire clone.

## Execution Steps

### Phase 1: Sacrifice-Based Value Identification (90 min)

**Method:** Analyze ONLY sacrificial decisions (gave up X to preserve Y)

1. **Read all sources** focusing on:
   - Difficult choices with clear trade-offs
   - Opportunities refused/accepted based on principles
   - Conflicts over principles
   - Resource allocation patterns (time/money/energy)
   - Breaking points (what triggers exit/fight)

2. **Extract candidate values** from sacrifices:
   ```
   Sacrifice Example:
   - Date: 2018-03
   - Context: Offered $200K job at FAANG
   - Chose: Stay at startup for $80K
   - Sacrificed: Money, prestige, stability
   - Preserved: Autonomy, impact, learning
   - → Candidate Value: "Autonomy over compensation"
   ```

3. **Triangulation test** (3 sources required):
   - **Words**: What they SAY about this value
   - **Actions**: What they DO when tested
   - **Consequences Accepted**: What they PAY to preserve it

   If all 3 align with 3+ independent examples → Valid value
   If conflict → Investigate as potential paradox (Layer 8)

**Output Phase 1:** List of 15-25 candidate values with evidences

---

### Phase 2: Hierarchization & Ranking (60 min)

**Method:** Rank by intensity and immutability

1. **Intensity score** (1-10):
   - 10 = Would die for this / Never violated
   - 8-9 = Core identity / Rare violations with guilt
   - 6-7 = Important but contextual
   - 4-5 = Preference, not principle
   - 1-3 = Aspirational, frequently violated

2. **Immutability test**:
   - **Never violated** = Supreme value (rank 1-3)
   - **Rare exceptions** = Core but contextual (rank 4-7)
   - **Contextual** = Conditional value (rank 8-15)

3. **Trade-off analysis**:
   For each value pair, find documented choice:
   ```
   "Always chooses [Autonomy] over [Money]"
   - Example 1: 2018 job decision
   - Example 2: 2019 turned down acquisition
   - Example 3: 2021 quit high-paying consulting
   ```

**Output Phase 2:** Ranked list of top 15 values with intensity scores

---

### Phase 3: Anti-Values Extraction (45 min)

**Method:** Find visceral rejections (as important as values!)

1. **Identify anti-values** (what they reject):
   - Physical reactions documented (disgust, anger, withdrawal)
   - Verbal patterns ("[X] makes me sick")
   - Behavioral responses (fight/flight/freeze)
   - Energy spent combating (hours/week, % of discourse)

2. **Cost analysis**:
   - Opportunities lost (what they sacrificed to avoid)
   - Relationships lost (who they pushed away)
   - Energy spent fighting (that could build instead)

3. **Embodiment** (who represents anti-value):
   - Specific people they reject
   - Groups/movements they oppose
   - Archetypes they fight against

**Output Phase 3:** 3-5 anti-values with manifestations and costs

---

### Phase 4: Temporal Evolution Mapping (30 min)

**Method:** Track value shifts across life phases

1. **Identify life phases** from timeline.yaml:
   - Childhood (0-18)
   - Early career (18-30)
   - Current phase

2. **Extract dominant values per phase**:
   - What drove decisions then?
   - What shifted after formative events?
   - What crystallized and never changed?

3. **Transition events**:
   - What event triggered the shift?
   - How dramatic was the change?
   - Any values that never changed?

**Output Phase 4:** Evolution map showing phase → values → transition

---

### Phase 5: Validation & Human Checkpoint (30 min)

1. **Auto-validation** using `checklists/values-validation.md`:
   - [ ] All values have 3+ evidences
   - [ ] Triangulation >= 70%
   - [ ] Sacrifices documented
   - [ ] Anti-values identified
   - [ ] Trade-offs mapped

2. **Generate validation report**:
   ```markdown
   # Layer 6 Validation Report - {Mind Name}

   ## Analysis Summary
   - Core values identified: {count}
   - Anti-values identified: {count}
   - Average evidences per value: {number}
   - Triangulation confidence: {%}

   ## Top 5 Values (For Human Review)
   1. **{Value}** (Intensity: {score}/10)
      - Evidence 1: {brief}
      - Evidence 2: {brief}
      - Evidence 3: {brief}

   ## Questions for Human Validation
   - Does this ranking feel authentic?
   - Any values missing that should be top 5?
   - Any values ranked too high/low?
   - Do anti-values resonate?
   ```

3. **🔴 HUMAN CHECKPOINT** (MANDATORY):
   ```
   Present to user:
   - Top 15 values ranked
   - Anti-values list
   - Key trade-offs
   - Evolution map

   Ask:
   "Does this value hierarchy authentically represent {Mind Name}?

   Options:
   1. APPROVE - Hierarchy is accurate, proceed to Layer 7
   2. REVISE - Make adjustments (specify which values)
   3. RE-ANALYZE - Fundamental misunderstanding, start over

   Decision: _______
   Notes: _______"
   ```

4. **Incorporate feedback** and regenerate if needed

**Output Phase 5:**
- `values_hierarchy.yaml` (approved by human)
- `LAYER-6-VALIDATION-REPORT.md`

---

## Output Format

Use template: `templates/values-hierarchy.yaml`

Critical fields:
```yaml
values_hierarchy:
  metadata:
    human_validated: true
    validator: "{name}"
    validation_date: "{date}"
    confidence_score: 0.XX

  core_values:  # Ranked 1-15
    - rank: 1
      name: "{Value Name}"
      intensity: 10
      immutability: "never_violated"

      evidences:  # Minimum 3
        - date: "YYYY-MM"
          context: "{situation}"
          sacrifice: "{what gave up}"
          preservation: "{what protected}"
          quote: "{what they said}"
          source: "{file}"

      language:
        keywords: ["{terms they use}"]
        metaphors: ["{how conceptualize}"]
        emotional_tone: "{how changes}"

      extreme_test:
        limit_situation: "{when went to extreme}"
        would_die_for: true/false
        violations: 0 or "{count + context}"

      tensions:
        conflicts_with_values: ["{other values}"]
        conflicts_with_people: ["{who}"]
        recurring_cost: "{what always pays}"

      origin:
        formative_event: "{experience}"
        influence: "{person/philosophy}"
        crystallization_age: {age}

  anti_values:  # Visceral rejections
    - name: "{Anti-Value}"
      rejection_intensity: 10
      manifestations:
        identification: "{how spots it}"
        physical_response: "{body reactions}"
        verbal_response: "{phrases}"
        behavioral_response: "{actions}"
      embodiments:
        - person: "{name}"
          reason: "{why represent it}"
      cost:
        opportunities_lost: ["{what}"]
        relationships_lost: ["{who}"]
        energy_spent: "{hours/week or %}"

  trade_offs:  # Documented patterns
    - pattern: "Always chooses {A} over {B}"
      examples:
        - date: "YYYY-MM"
          situation: "{what happened}"
          choice: "{what chose}"
          cost: "{what sacrificed}"
      exceptions: [] or ["{when/why}"]

  temporal_evolution:
    - phase: "{age range}"
      dominant_values:
        - value: "{name}"
          intensity: {score}
      transition_event: "{what changed everything}"
```

---

## Validation Checklist

After completion, execute: `*validate-layer-6`

Then **MANDATORY**: `*human-checkpoint`

**CRITICAL:** Do NOT proceed to Layer 7 (Obsessions) until human validates Layer 6. Errors cascade.

---

## Common Pitfalls

❌ **Confusing stated values with actual values**
- ✅ Solution: Only trust sacrifices, not proclamations

❌ **Accepting values with <3 evidences**
- ✅ Solution: Ruthlessly discard weak evidences

❌ **Missing anti-values**
- ✅ Solution: What they reject reveals as much as what they embrace

❌ **Skipping human checkpoint**
- ✅ Solution: AI cannot judge authenticity of identity layers

❌ **Confusing preferences with values**
- ✅ Solution: Values survive extreme tests, preferences don't

---

**Status:** Ready for execution
**Agent:** identity-analyst (Sarah)
**Human Checkpoint:** REQUIRED at Phase 5
**Next Task:** core-obsessions-analysis.md (Layer 7)
