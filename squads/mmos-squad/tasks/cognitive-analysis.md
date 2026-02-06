---
task-id: cognitive-analysis
name: DNA Mental™ 8-Layer Cognitive Analysis
agent: cognitive-analyst
version: 1.0.0
purpose: Execute proprietary 8-layer cognitive analysis to extract complete mind architecture for 94% fidelity clones

workflow-mode: interactive
elicit: true
elicitation-type: custom

prerequisites:
  - Research collection completed with sources_master.yaml
  - At least 20+ high-quality sources available
  - sources/downloads/ directory populated with collected data
  - Minimum 3 independent sources per DNA Mental layer

inputs:
  - name: mind_name
    type: string
    description: Subject being analyzed
    required: true

  - name: mode
    type: enum
    description: Analysis depth mode
    required: true
    options: ["layers_1_4", "layer_5", "layer_6", "layer_7", "layer_8", "architecture", "full"]
    default: "full"
    user_friendly: "Observable patterns / Values / Obsessions / Singularity / Paradoxes / Compile architecture / Full 8-layer"

  - name: sources_master_path
    type: file_path
    description: Path to sources inventory
    required: true
    default: "squads/mmos-squad/minds/{mind_name}/sources/sources_master.yaml"

  - name: focus_areas
    type: array
    description: Specific aspects to emphasize
    required: false
    example: ["decision-making", "creativity", "leadership"]

  - name: triangulation_threshold
    type: float
    description: Minimum source agreement for Layers 5-8
    required: false
    default: 0.70
    range: [0.60, 0.90]

outputs:
  - path: "squads/mmos-squad/minds/{mind_name}/analysis/cognitive-spec.yaml"
    description: Complete DNA Mental™ 8-layer cognitive architecture
    format: "yaml"

  - path: "squads/mmos-squad/minds/{mind_name}/analysis/mind-brief.md"
    description: Executive summary of cognitive analysis findings
    format: "markdown"

  - path: "squads/mmos-squad/minds/{mind_name}/artifacts/behavioral_patterns.yaml"
    description: "Layer 1: Observable behavioral patterns and decision-making"
    format: "yaml"

  - path: "squads/mmos-squad/minds/{mind_name}/artifacts/writing_style.yaml"
    description: "Layer 2: Linguistic patterns and communication style"
    format: "yaml"

  - path: "squads/mmos-squad/minds/{mind_name}/artifacts/routine_analysis.yaml"
    description: "Layer 3: Temporal patterns, routines, and habits"
    format: "yaml"

  - path: "squads/mmos-squad/minds/{mind_name}/artifacts/recognition_patterns.yaml"
    description: "Layer 4: Mental radars and attention filters"
    format: "yaml"

  - path: "squads/mmos-squad/minds/{mind_name}/artifacts/mental_models.yaml"
    description: "Layer 5: Thinking frameworks and reasoning patterns"
    format: "yaml"

  - path: "squads/mmos-squad/minds/{mind_name}/artifacts/values_hierarchy.yaml"
    description: "Layer 6: Core values in priority order"
    format: "yaml"

  - path: "squads/mmos-squad/minds/{mind_name}/artifacts/core_obsessions.yaml"
    description: "Layer 7: Deep driving questions"
    format: "yaml"

  - path: "squads/mmos-squad/minds/{mind_name}/artifacts/contradictions.yaml"
    description: "Layer 8: Productive paradoxes (THE GOLD LAYER)"
    format: "yaml"

  - path: "squads/mmos-squad/minds/{mind_name}/artifacts/cognitive_architecture.yaml"
    description: "Complete DNA Mental™ 8-layer synthesis"
    format: "yaml"

  - path: "squads/mmos-squad/minds/{mind_name}/artifacts/personality_profile.json"
    description: "Psychometric personality profile"
    format: "json"

  - path: "squads/mmos-squad/minds/{mind_name}/docs/LIMITATIONS.md"
    description: "Known gaps and uncertainties in cognitive analysis"
    format: "markdown"

dependencies:
  templates:
    - cognitive-spec.yaml
    - mind-brief.md
  checklists:
    - analysis-completeness-checklist.md
  data:
    - mmos-kb.md (DNA Mental™ layer definitions)

validation:
  success-criteria:
    - "All 8 layers extracted with minimum 3 independent sources each"
    - "Layers 5-8 triangulated with >= 70% source agreement"
    - "Layer 8 (Productive Paradoxes) identified with at least 3 distinct paradoxes"
    - "Human checkpoint completed for Layers 6-8 validation"
    - "Cognitive architecture compiles without contradictions"

  warning-conditions:
    - "1-2 layers have only 2 sources (borderline triangulation)"
    - "Layer 8 has only 2 paradoxes identified"
    - "Triangulation threshold 60-69% on any identity layer"

  failure-conditions:
    - "Any layer missing or has <2 sources"
    - "Layer 8 missing or has <2 paradoxes"
    - "Triangulation <60% on Layers 5-8"
    - "Contradictory findings across layers"

estimated-duration: "6-8 hours for full 8-layer analysis"
critical-success-factor: "Layer 8 (Productive Paradoxes) differentiates authentic human clones from robotic AI"
---

# Cognitive Analysis Task

## Purpose

Execute the proprietary DNA Mental™ 8-layer cognitive analysis methodology to extract and map the complete cognitive architecture of a mind. This task systematically analyzes sources from observable patterns (Layers 1-4) through deep identity structures (Layers 5-8), with mandatory triangulation and human validation for identity-critical layers. The output is a complete cognitive blueprint enabling 94% fidelity clones.

**Critical Success Factor:** Layer 8 (Productive Paradoxes) is what differentiates authentic human clones from robotic AI responses.

## When to Use This Task

**Use this task when:**
- Beginning Phase 3 (Analysis) after research collection complete
- sources_master.yaml exists with adequate coverage
- Need to extract complete 8-layer cognitive architecture
- Executing analysis phase from execute-mmos-pipeline orchestration

**Do NOT use this task when:**
- Sources not yet collected (use research-collection first)
- Updating existing cognitive architecture (use brownfield-update)
- Only need partial layer extraction (specify mode for targeted extraction)
**`layer_5`** - Mental Models extraction with triangulation
**`layer_6`** - Values Hierarchy extraction + **HUMAN CHECKPOINT**
**`layer_7`** - Core Obsessions extraction + **HUMAN CHECKPOINT**
**`layer_8`** - Productive Paradoxes extraction + **HUMAN CHECKPOINT**
**`architecture`** - Synthesize all layers into unified cognitive architecture
**`full`** - Execute complete 8-layer analysis with all checkpoints

## Key Activities & Instructions

### DNA Mental™ 8-Layer Framework

```yaml
layer_structure:
  observable_layers (1-4):
    description: "Surface patterns visible in behavior and communication"
    triangulation_required: false
    human_validation: optional

  cognitive_layers (5):
    description: "Thinking frameworks and mental models"
    triangulation_required: true
    human_validation: recommended

  identity_layers (6-8):
    description: "Core identity structures - values, obsessions, paradoxes"
    triangulation_required: mandatory
    human_validation: mandatory

layer_hierarchy:
  - "Layer 8 (Paradoxes) shapes Layer 7 (Obsessions)"
  - "Layer 7 (Obsessions) drives Layer 6 (Values)"
  - "Layer 6 (Values) filters Layer 5 (Mental Models)"
  - "Layer 5 (Mental Models) interprets Layer 4 (Recognition)"
  - "Layer 4 (Recognition) guides Layer 3 (Routines)"
  - "Layer 3 (Routines) expresses Layer 2 (Communication)"
  - "Layer 2 (Communication) manifests Layer 1 (Behavior)"
```

### Mode: Layers 1-4 (Observable Patterns)

**These layers can be extracted in parallel** as they're observational.

#### Layer 1: Behavioral Patterns

**Objective:** Extract observable actions, decisions, and behaviors across contexts.

**Analysis Framework:**
```yaml
behavioral_categories:
  decision_making:
    - "How do they approach decisions?"
    - "Fast vs slow decisions?"
    - "Data-driven vs intuition?"

  work_patterns:
    - "How do they structure work?"
    - "Solo vs collaborative?"
    - "Deep work vs reactive?"

  learning_behavior:
    - "How do they acquire knowledge?"
    - "Reading habits, courses, mentors?"
    - "Active vs passive learning?"

  relationship_patterns:
    - "How do they build relationships?"
    - "Network size and depth?"
    - "Collaboration style?"

  risk_behavior:
    - "Risk-averse or risk-seeking?"
    - "How do they handle failure?"
    - "Calculated vs impulsive?"

  resource_allocation:
    - "How do they invest time?"
    - "Money management patterns?"
    - "Energy distribution?"
```

**Extraction Process:**
1. Read through all sources flagging behavioral observations
2. Categorize behaviors by context (work, personal, creative, etc.)
3. Identify consistent patterns across multiple sources
4. Note behavioral evolution over time
5. Document outlier behaviors (important for Layer 8 paradoxes)

**Output:** `minds/{mind}/artifacts/behavioral_patterns.yaml`

```markdown
# Behavioral Patterns - {{Mind Name}}

## Decision-Making Behavior

### Pattern: {{pattern_name}}
**Frequency:** Consistent across {{N}} sources
**Context:** {{when_this_appears}}
**Evidence:**
- Source 001: "{{quote}}"
- Source 015: "{{quote}}"

[... repeat for all patterns ...]

## Work Patterns
[... same structure ...]

## Learning Behavior
[... same structure ...]

## Temporal Evolution
**Early Career:** {{behaviors}}
**Mid Career:** {{behaviors}}
**Current:** {{behaviors}}
**Evolution:** {{how_changed}}

## Outlier Behaviors
- {{unusual_behavior_1}}: {{context_and_frequency}}
- {{unusual_behavior_2}}: {{context_and_frequency}}
```

#### Layer 2: Communication Style (Linguistic Patterns)

**Objective:** Extract distinctive voice, writing style, and communication patterns.

**Analysis Framework:**
```yaml
linguistic_dimensions:
  sentence_structure:
    - "Short punchy vs long elaborate?"
    - "Simple vs complex vocabulary?"
    - "Active vs passive voice?"

  rhetorical_devices:
    - "Metaphors and analogies used?"
    - "Storytelling vs direct?"
    - "Questions vs statements?"

  tone_characteristics:
    - "Formal vs casual?"
    - "Serious vs humorous?"
    - "Confident vs humble?"

  signature_elements:
    - "Repeated phrases?"
    - "Unique terminology?"
    - "Distinctive openings/closings?"

  argumentation_style:
    - "Data-driven vs anecdotal?"
    - "Logical vs emotional?"
    - "Direct vs Socratic?"

  audience_adaptation:
    - "How style changes by context?"
    - "Expert vs beginner audiences?"
    - "Written vs spoken differences?"
```

**Extraction Process:**
1. Analyze linguistic patterns across source types
2. Extract 50+ signature phrases/expressions
3. Map rhetorical device usage frequency
4. Identify voice consistency metrics
5. Note context-dependent style variations

**Output:** `minds/{mind}/artifacts/writing_style.yaml`

#### Layer 3: Routine & Habits (Temporal Patterns)

**Objective:** Extract daily routines, work habits, and temporal rhythms.

**Analysis Framework:**
```yaml
routine_dimensions:
  daily_structure:
    morning_routine: "{{activities}}"
    work_blocks: "{{structure}}"
    evening_routine: "{{activities}}"

  productivity_patterns:
    peak_hours: "{{when_most_productive}}"
    deep_work: "{{how_structured}}"
    break_patterns: "{{frequency_and_type}}"

  creative_process:
    ideation: "{{when_and_how}}"
    execution: "{{work_cadence}}"
    review: "{{feedback_loops}}"

  health_habits:
    exercise: "{{type_and_frequency}}"
    nutrition: "{{approach}}"
    sleep: "{{patterns}}"

  learning_cadence:
    reading: "{{when_and_what}}"
    skill_development: "{{approach}}"
    reflection: "{{practices}}"

  social_rhythms:
    collaboration_time: "{{when}}"
    solo_time: "{{when}}"
    networking: "{{approach}}"
```

**Output:** `minds/{mind}/artifacts/routine_analysis.yaml`

#### Layer 4: Recognition Patterns (Mental Radars)

**Objective:** Extract what they notice, pay attention to, and filter for.

**Analysis Framework:**
```yaml
recognition_categories:
  opportunity_radar:
    - "What opportunities do they spot that others miss?"
    - "Pattern recognition in their domain?"

  problem_detection:
    - "What problems do they notice first?"
    - "Red flags and warning signs?"

  people_assessment:
    - "What do they notice in people?"
    - "Talent spotting criteria?"

  quality_filters:
    - "What constitutes 'good' in their view?"
    - "Quality assessment criteria?"

  risk_detection:
    - "What risks do they scan for?"
    - "Threat assessment patterns?"

  value_recognition:
    - "What do they consider valuable?"
    - "Undervalued things they seek?"
```

**Extraction Process:**
1. Identify repeated observations across sources ("I always look for...", "The first thing I notice...")
2. Extract assessment criteria they use
3. Map their attention filters
4. Document blind spots (what they don't notice)

**Output:** `minds/{mind}/artifacts/recognition_patterns.yaml`

**Summary after Layers 1-4 Complete:**

Present summary to user:
```
LAYERS 1-4 (OBSERVABLE) COMPLETE ✓

Layer 1 - Behavioral Patterns: {{count}} patterns extracted
Layer 2 - Communication Style: {{count}} linguistic elements identified
Layer 3 - Routine & Habits: {{count}} temporal patterns mapped
Layer 4 - Recognition Patterns: {{count}} mental radars documented

Artifacts generated:
✓ minds/{mind}/artifacts/behavioral_patterns.yaml
✓ minds/{mind}/artifacts/writing_style.yaml
✓ minds/{mind}/artifacts/routine_analysis.yaml
✓ minds/{mind}/artifacts/recognition_patterns.yaml

Proceeding to Layer 5 (Mental Models) - triangulation begins...
```

### Mode: Layer 5 (Mental Models)

**Triangulation Required:** Must cross-reference findings across ≥3 sources.

#### Objective

Extract the thinking frameworks, reasoning patterns, and mental models they use to make sense of the world.

**Analysis Framework:**
```yaml
mental_model_categories:
  problem_solving_frameworks:
    - "How do they break down complex problems?"
    - "First principles vs analogical thinking?"
    - "What frameworks do they apply?"

  decision_frameworks:
    - "How do they evaluate options?"
    - "What criteria matter most?"
    - "Reversible vs irreversible decision handling?"

  worldview_models:
    - "Core beliefs about how things work?"
    - "Human nature assumptions?"
    - "System thinking patterns?"

  domain_specific_models:
    - "Unique models in their expertise area?"
    - "How do they think about their domain?"

  meta_cognitive_patterns:
    - "How do they think about thinking?"
    - "Self-awareness level?"
    - "Growth vs fixed mindset indicators?"
```

**Extraction Process:**

1. **First Pass:** Identify explicit frameworks mentioned
2. **Second Pass:** Infer implicit mental models from decisions/reasoning
3. **Triangulation:** Validate each model against ≥3 independent sources
4. **Consistency Check:** Verify models align with Layers 1-4
5. **Document Confidence:** Tag each model with evidence strength

**Triangulation Example:**
```yaml
mental_model: "Reversible vs Irreversible Decisions"
evidence:
  source_012: "Type 1 vs Type 2 decisions framework (explicit mention)"
  source_034: "Makes small bets quickly, agonizes over big commitments (implicit)"
  source_047: "'You can always change your mind later' philosophy (explicit)"
triangulation_score: 3/3 sources ✓
confidence: high
```

**Output:** `minds/{mind}/artifacts/mental_models.yaml`

### Mode: Layer 6 (Values Hierarchy) + HUMAN CHECKPOINT

**Triangulation Required:** Mandatory cross-reference across ≥3 sources.
**Human Validation:** Mandatory checkpoint before proceeding to Layer 7.

#### Objective

Extract core values in priority order, distinguishing stated values from demonstrated values.

**Analysis Framework:**
```yaml
values_extraction:
  stated_values:
    method: "Direct quotes about what matters"
    sources: [books, interviews, social media]

  demonstrated_values:
    method: "Infer from choices, sacrifices, time allocation"
    sources: [behavioral patterns from Layer 1]

  value_conflicts:
    method: "Note where stated and demonstrated diverge"
    importance: "Divergences feed Layer 8 paradoxes"

  value_evolution:
    method: "Track how values change over time"
    sources: [temporal analysis from Layer 3]

priority_determination:
  sacrifice_test: "What do they give up for what?"
  time_allocation: "Where do they invest time?"
  resource_allocation: "Where do they invest money/energy?"
  difficult_choices: "What do they choose in conflicts?"
```

**Extraction Process:**

1. **Extract Stated Values:** Direct quotes about what matters
2. **Extract Demonstrated Values:** Infer from actions (Layer 1)
3. **Triangulate:** Confirm each value across ≥3 sources
4. **Prioritize:** Rank values based on sacrifice/allocation tests
5. **Map Conflicts:** Document where stated ≠ demonstrated
6. **Temporal Analysis:** Track value evolution over time

**Output Draft:** `minds/{mind}/artifacts/values_hierarchy.yaml`

```yaml
values_hierarchy:
  top_tier_values:
    - value: "{{value_name}}"
      priority: 1
      stated_evidence:
        - source: source_003
          quote: "{{direct_quote}}"
        - source: source_018
          quote: "{{direct_quote}}"
      demonstrated_evidence:
        - behavior: "{{action_showing_value}}"
          frequency: "{{consistent/occasional}}"
        - sacrifice: "{{what_given_up_for_this}}"
      triangulation: 5/5 sources
      confidence: very_high

  [... continue for all values ...]

  value_conflicts:
    - conflict: "{{value_A}} vs {{value_B}}"
      context: "{{when_this_appears}}"
      resolution: "{{how_they_navigate}}"

  temporal_evolution:
    early_career: [{{values}}]
    mid_career: [{{values}}]
    current: [{{values}}]
    evolution_pattern: "{{description}}"
```

#### HUMAN CHECKPOINT: Layer 6 Validation

**Present to user:**

```markdown
## LAYER 6 VALIDATION REQUIRED

### Values Hierarchy Extracted

**Top 5 Core Values (Ranked by Priority):**

1. **{{value_1}}** - {{one_line_description}}
   - Stated: {{Y/N}} | Demonstrated: {{Y/N}}
   - Sources: {{count}} | Triangulation: {{percentage}}%

2. **{{value_2}}** - {{one_line_description}}
   - Stated: {{Y/N}} | Demonstrated: {{Y/N}}
   - Sources: {{count}} | Triangulation: {{percentage}}%

[... continue for all values ...]

### Value Conflicts Identified:
- {{conflict_1}}: {{description}}
- {{conflict_2}}: {{description}}

### Why This Matters:
Values hierarchy (Layer 6) is CRITICAL for clone authenticity. These values filter all decision-making and behavior in the system prompt. Incorrect values = inauthentic clone.

### Triangulation Status:
- Average source agreement: {{percentage}}%
- Stated vs demonstrated alignment: {{percentage}}%
- Confidence level: {{High/Medium/Low}}

---

**VALIDATION OPTIONS:**

1. **APPROVE** - Values hierarchy is accurate, proceed to Layer 7
2. **REVISE** - Provide corrections:
   - Missing values: [list]
   - Incorrect priorities: [specify]
   - Mischaracterizations: [specify]
3. **RE-ANALYZE** - Insufficient evidence, need deeper extraction

**Type 1, 2, or 3:**
```

**Process response:**
- **APPROVE**: Save values_hierarchy.yaml, proceed to Layer 7
- **REVISE**: Apply user corrections, update file, proceed to Layer 7
- **RE-ANALYZE**: Return to sources, execute deeper value extraction, re-present

### Mode: Layer 7 (Core Obsessions) + HUMAN CHECKPOINT

**Triangulation Required:** Mandatory across ≥3 sources.
**Human Validation:** Mandatory checkpoint before Layer 8.

#### Objective

Extract the 3-5 core obsessions that drive their work, thinking, and life focus.

**Analysis Framework:**
```yaml
obsession_detection:
  topic_frequency:
    method: "What topics appear obsessively across all sources?"
    threshold: "Present in >50% of sources"

  question_persistence:
    method: "What questions do they keep asking?"
    indicator: "Repeated across years"

  problem_dedication:
    method: "What problems consume their attention?"
    indicator: "Consistent focus despite obstacles"

  sacrifice_patterns:
    method: "What do they sacrifice other things for?"
    source: "Layer 6 values + Layer 1 behaviors"

  life_organizing_themes:
    method: "What themes organize their life/work?"
    indicator: "Everything connects to these"
```

**Extraction Process:**

1. **Topic Frequency Analysis:** Count mentions across all sources
2. **Question Mining:** Extract recurring questions they pose
3. **Problem Persistence:** Identify problems they won't let go
4. **Cross-Layer Validation:** Confirm against Layers 1-6
5. **Triangulate:** Verify each obsession across ≥3 sources
6. **Prioritize:** Rank obsessions by centrality to their work/life

**Output Draft:** `minds/{mind}/artifacts/core_obsessions.yaml`

```yaml
core_obsessions:
  - obsession: "{{title}}"
    rank: 1
    description: "{{what_they're_obsessed_with}}"
    manifestations:
      - "{{how_it_shows_up_1}}"
      - "{{how_it_shows_up_2}}"
    driving_question: "{{the_question_they_keep_asking}}"
    evidence:
      source_count: {{N}} sources
      quote_examples:
        - source: source_007
          quote: "{{quote}}"
        - source: source_023
          quote: "{{quote}}"
    connection_to_values: "{{which_Layer6_values_this_serves}}"
    temporal_span: "{{how_long_obsessed}}"
    confidence: {{high/medium/low}}

  [... repeat for all obsessions ...]

obsession_interconnections:
  - "{{obsession_1}} drives {{obsession_2}}"
  - "{{obsession_2}} and {{obsession_3}} are flip sides of same coin"
```

#### HUMAN CHECKPOINT: Layer 7 Validation

**Present to user:** (Similar format to Layer 6 checkpoint)

```markdown
## LAYER 7 VALIDATION REQUIRED

### Core Obsessions Identified

**Obsession 1: {{title}}**
- Description: {{one_line}}
- Driving Question: "{{question}}"
- Sources: {{count}} | Confidence: {{level}}

[... repeat for all obsessions ...]

### Why This Matters:
Core obsessions (Layer 7) are what the person *can't stop thinking about*. They drive all creative output and filter what problems they choose to tackle. Missing these = clone lacks authentic motivation.

---

**VALIDATION OPTIONS:**
1. APPROVE | 2. REVISE | 3. RE-ANALYZE

**Type 1, 2, or 3:**
```

### Mode: Layer 8 (Productive Paradoxes) + HUMAN CHECKPOINT

**This is the GOLD layer** - what makes clones feel genuinely human.

**Triangulation Required:** Mandatory across ≥3 sources.
**Human Validation:** Mandatory - most critical checkpoint.

#### Objective

Extract productive paradoxes - contradictions that coexist and create depth, wisdom, and authenticity.

**Critical Insight:** Humans aren't consistent. They hold contradictory beliefs that *both* make sense in different contexts. AI clones without paradoxes feel robotic and "uncanny valley."

**Analysis Framework:**
```yaml
paradox_detection:
  stated_contradictions:
    method: "Find explicit contradictions across sources"
    example: "Says 'plan everything' AND 'be spontaneous'"

  behavioral_contradictions:
    method: "Actions that contradict stated beliefs"
    source: "Layer 1 vs Layer 6"

  contextual_flexibility:
    method: "Same question, different answers by context"
    indicator: "Not wishy-washy, but contextually wise"

  value_tensions:
    method: "Values that pull in opposite directions"
    source: "Layer 6 value conflicts"

  evolution_paradoxes:
    method: "Beliefs that changed but both are 'true'"
    source: "Temporal analysis"

paradox_quality_criteria:
  productive: "Both sides serve a purpose"
  contextual: "Clear when each applies"
  authentic: "Genuinely held, not performance"
  conscious: "Aware of the paradox (ideally)"
```

**Extraction Process:**

1. **Mine Contradictions:** Find statements that seem to contradict
2. **Context Analysis:** Understand when each side applies
3. **Purpose Discovery:** Why both sides are valuable
4. **Triangulate:** Verify paradox across ≥3 sources
5. **Resolution Pattern:** How they navigate the tension
6. **Document:** Paradox title, contradiction, context, resolution

**Output Draft:** `minds/{mind}/artifacts/contradictions.yaml`

```yaml
productive_paradoxes:
  - paradox: "{{memorable_title}}"
    rank: 1
    contradiction:
      side_a: "{{belief/behavior_A}}"
      side_b: "{{belief/behavior_B}}"
    apparent_conflict: "{{why_these_seem_contradictory}}"

    contextual_resolution:
      when_side_a: "{{context_when_A_applies}}"
      when_side_b: "{{context_when_B_applies}}"

    deeper_truth: "{{why_both_are_actually_true}}"

    evidence:
      source_count: {{N}}
      examples:
        - source: source_005
          quote_a: "{{showing_side_A}}"
        - source: source_018
          quote_b: "{{showing_side_B}}"

    navigation_pattern: "{{how_they_decide_which_to_apply}}"

    connection_to_obsessions: "{{which_Layer7_obsessions_this_serves}}"

    clone_implementation: "{{how_to_encode_this_in_system_prompt}}"

    confidence: {{high/medium/low}}

  [... repeat for all paradoxes ...]

paradox_system:
  total_paradoxes: {{count}}
  interconnections: "{{how_paradoxes_relate}}"
  overall_pattern: "{{meta_paradox_if_exists}}"
```

**Example Paradox:**
```yaml
paradox: "The Structured Spontaneity Paradox"
contradiction:
  side_a: "Rigorous planning and systems"
  side_b: "Embrace serendipity and randomness"
contextual_resolution:
  when_side_a: "For mission-critical work, foundation building"
  when_side_b: "For creativity, learning, new opportunities"
deeper_truth: "Structure creates freedom for spontaneity"
```

#### HUMAN CHECKPOINT: Layer 8 Validation

**Present to user:**

```markdown
## LAYER 8 VALIDATION REQUIRED - MOST CRITICAL

### Productive Paradoxes Extracted

**Why Layer 8 is the Differentiator:**
Paradoxes are what separate authentic human clones from robotic AI. Humans aren't consistent - they hold contradictory truths that both make sense. Without Layer 8, clones feel "uncanny valley" and overly rigid.

**Paradox 1: {{title}}**
- **Contradiction:** "{{belief_A}}" AND "{{belief_B}}"
- **Context:** Side A when {{context_A}}, Side B when {{context_B}}
- **Deeper Truth:** {{why_both_true}}
- **Sources:** {{count}} | Confidence: {{level}}

[... repeat for all paradoxes ...]

### Paradox System:
Total paradoxes: {{count}}
Interconnections: {{how_they_relate}}

### Example Clone Behavior:
Without Layer 8: "{{robotic_response}}"
With Layer 8: "{{nuanced_contextual_response}}"

---

**VALIDATION OPTIONS:**
1. APPROVE - Paradoxes capture authentic complexity, proceed to architecture synthesis
2. REVISE - Adjust paradoxes: [provide corrections]
3. RE-ANALYZE - Missing critical paradoxes, need deeper extraction

**This is your LAST checkpoint before synthesis. Review carefully.**

**Type 1, 2, or 3:**
```

### Mode: Architecture (Synthesis of All 8 Layers)

**Execute after all 8 layers validated.**

#### Objective

Synthesize all 8 layers into unified cognitive architecture showing how layers interconnect.

**Synthesis Framework:**
```yaml
cognitive_architecture:
  layer_integration:
    - "How Layer 8 paradoxes shape Layer 7 obsessions"
    - "How Layer 7 obsessions prioritize Layer 6 values"
    - "How Layer 6 values filter Layer 5 mental models"
    - "How Layer 5 mental models interpret Layer 4 recognition"
    - "How Layer 4 recognition guides Layer 3 routines"
    - "How Layer 3 routines express Layer 2 communication"
    - "How Layer 2 communication manifests Layer 1 behavior"

  cognitive_flow_maps:
    input_stimulus:
      - "External input (question, problem, situation)"
      - "↓ Layer 4: What they notice/filter for"
      - "↓ Layer 5: Which mental model they apply"
      - "↓ Layer 6: Which values filter the interpretation"
      - "↓ Layer 7: Which obsession this connects to"
      - "↓ Layer 8: Which paradox side this context triggers"
      - "↓ Layer 2: How they communicate response"
      - "→ Output behavior (Layer 1)"

  decision_architecture:
    routine_decision: "{{which_layers_activate}}"
    important_decision: "{{which_layers_activate}}"
    identity_decision: "{{which_layers_activate}}"

  authenticity_mechanisms:
    consistency_sources: "{{what_keeps_them_consistent}}"
    flexibility_sources: "{{what allows_adaptation}}"
    paradox_navigation: "{{how_they_hold_contradictions}}"
```

**Output:** `minds/{mind}/artifacts/cognitive_architecture.yaml`

```yaml
cognitive_architecture:
  mind_name: "{{name}}"
  architecture_version: "1.0"
  compilation_date: "{{timestamp}}"

  layer_summary:
    layer_1_behavioral: "{{key_patterns}}"
    layer_2_communication: "{{distinctive_voice}}"
    layer_3_routine: "{{temporal_rhythms}}"
    layer_4_recognition: "{{mental_radars}}"
    layer_5_mental_models: "{{thinking_frameworks}}"
    layer_6_values: "{{core_values}}"
    layer_7_obsessions: "{{driving_questions}}"
    layer_8_paradoxes: "{{productive_contradictions}}"

  cognitive_flow:
    [detailed integration map]

  decision_architecture:
    [how decisions are made]

  personality_core:
    identity_essence: "{{who_they_are_at_core}}"
    authenticity_signature: "{{what_makes_them_them}}"
    clone_critical_elements: [{{must_have_for_94%_fidelity}}]

  implementation_guidance:
    system_prompt_priorities: [{{what_must_be_in_prompt}}]
    rag_vs_finetuning: "{{recommendation}}"
    specialist_variants: [{{suggested_specialists}}]

  known_limitations:
    gaps_in_analysis: [{{what_we_dont_know}}]
    source_constraints: "{{limitations_from_sources}}"
    confidence_caveats: "{{where_uncertainty_exists}}"

  validation_readiness:
    triangulation_complete: {{yes/no}}
    human_checkpoints_passed: {{6,7,8}}
    ready_for_synthesis: {{yes/no}}
```

### Mode: Full (Complete 8-Layer Analysis)

**Execute complete cognitive analysis with all checkpoints:**

1. Extract Layers 1-4 in parallel
2. Extract Layer 5 with triangulation
3. Extract Layer 6 + **HUMAN CHECKPOINT**
4. Extract Layer 7 + **HUMAN CHECKPOINT**
5. Extract Layer 8 + **HUMAN CHECKPOINT**
6. Synthesize cognitive architecture
7. Present complete analysis to user

## Outputs

### Layers 1-4 Outputs
- `minds/{mind}/artifacts/behavioral_patterns.yaml`
- `minds/{mind}/artifacts/writing_style.yaml`
- `minds/{mind}/artifacts/routine_analysis.yaml`
- `minds/{mind}/artifacts/recognition_patterns.yaml`

### Layer 5 Output
- `minds/{mind}/artifacts/mental_models.yaml`

### Layer 6 Output
- `minds/{mind}/artifacts/values_hierarchy.yaml`

### Layer 7 Output
- `minds/{mind}/artifacts/core_obsessions.yaml`

### Layer 8 Output
- `minds/{mind}/artifacts/contradictions.yaml`

### Architecture Output
- `minds/{mind}/artifacts/cognitive_architecture.yaml`

### Additional Outputs
- `minds/{mind}/artifacts/personality_profile.json` (psychometric)
- `minds/{mind}/docs/LIMITATIONS.md` (known gaps)

## Validation Criteria

Cognitive analysis is successful when:

- [ ] **All 8 layers extracted**: Complete DNA Mental coverage
- [ ] **Triangulation complete**: Layers 5-8 validated across ≥3 sources minimum
- [ ] **Human checkpoints passed**: Layers 6, 7, 8 user-validated
- [ ] **Cognitive architecture synthesized**: Integration map complete
- [ ] **Clone-critical elements identified**: What must be in system prompt
- [ ] **Limitations documented**: Known gaps and uncertainties acknowledged
- [ ] **Quality thresholds met**: Triangulation ≥70%, confidence ≥Medium on identity layers
- [ ] **Ready for synthesis phase**: All artifacts validated and saved

## Integration with AIOS

### Memory Layer
```typescript
memory.store({
  collection: 'mmos_analysis',
  document: {
    mind_name: '{{mind}}',
    layers_complete: [1,2,3,4,5,6,7,8],
    checkpoints_passed: [6,7,8],
    architecture_compiled: '{{timestamp}}',
    fidelity_projection: '{{percentage}}'
  }
});
```

### Database Integration (Post-Analysis)

**After completing cognitive-spec.yaml**, integrate with MMOS Database v3.0.0:

```bash
# Run database integration pipeline
bash scripts/pipeline/db-integration-v3.sh \
  --mind {{mind_slug}} \
  --mode full \
  --reprocess skip
```

This will:
1. **Populate sources** from `sources_master.yaml` → `sources` table
2. **Import analysis** from `cognitive-spec.yaml` → `analysis` table
3. **Extract fragments** (blocked - requires InnerLens expansion pack)
4. **Validate integrity** - Check referential integrity and data quality

**Validation Output:**
```
📊 VALIDATION SUMMARY
Sources: {{count}}
Analysis: {{count}}
Fragments: {{count}}
Errors: 0
Warnings: {{count}}

✅ VALIDATION PASSED
```

**Re-processing modes:**
- `skip` (default): Safe mode, won't overwrite existing data
- `update`: Update existing records with new data
- `fresh`: Delete all existing data for this mind and re-import ⚠️

**Note:** Fragment extraction is currently blocked pending InnerLens expansion pack implementation (Epic TBD).

### Agent Coordination
- **@cognitive-analyst**: Executes all layer extractions
- **@architect**: Synthesizes cognitive architecture
- **User**: Validates Layers 6, 7, 8 (mandatory)
- **Database Pipeline**: Automatically ingests results into MMOS DB v3.0.0

### Performance Estimates
- Layers 1-4: 2-3 hours, 300K tokens (parallel)
- Layer 5: 1 hour, 100K tokens
- Layer 6: 1.5 hours, 150K tokens + human time
- Layer 7: 1.5 hours, 150K tokens + human time
- Layer 8: 2 hours, 200K tokens + human time (most critical)
- Architecture: 1 hour, 100K tokens
- **Database Integration**: 1-2 minutes
- **Total: 9-11 hours, 1M tokens**

## Notes

- **Layer 8 is the differentiator**: Without paradoxes, clones feel robotic
- **Human checkpoints non-negotiable**: Layers 6-8 too critical to auto-approve
- **Triangulation mandatory for identity**: Layers 5-8 require multi-source confirmation
- **Stated ≠ Demonstrated**: Watch for value conflicts, they reveal authenticity
- **Temporal evolution matters**: How they changed shows growth patterns
- **Document uncertainty**: Better to acknowledge gaps than fake completeness
- **Layer hierarchy is real**: Layer 8 shapes 7, 7 drives 6, etc. - respect the structure

---

**Task Version:** 3.0 (DNA Mental™ 8-Layer Methodology)
**Last Updated:** 2025-10-06
