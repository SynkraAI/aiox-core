---
task-id: build-narrative
name: Build Narrative Structure
agent: "ken-burns | walter-murch | matthew-dicks (selected by style)"
version: 1.0.0
purpose: Transform mined moments into a coherent narrative structure

workflow-mode: interactive
elicit: true
elicitation-type: guided

inputs:
  - name: banco_momentos
    type: file_path
    description: "Compact mining output (QG-002 passed)"
    required: true
    default: "output/curated/{source-slug}/momentos.md"
  - name: style
    type: enum
    description: "Narrative approach"
    required: false
    default: "auto-select based on content"
    options: ["blind-assembly", "rule-of-six", "5-second-moment", "story-structure"]
  - name: target_format
    type: enum
    description: "Target output format"
    required: false
    options: ["shorts", "longform", "documentary"]
  - name: target_duration
    type: string
    description: "Target duration (e.g. '10:00', '0:30')"
    required: false
  - name: theme
    type: string
    description: "Primary narrative theme"
    required: false
  - name: curadoria
    type: file_path
    description: "External data enrichment file"
    required: false

outputs:
  - path: "narrative_structure.yaml"
    format: yaml
    description: "Narrative structure with assembly order, emotional arc, pacing notes"

dependencies:
  checklists:
    - checklists/narrative-quality.md
  templates:
    - templates/narrative-structure-tmpl.yaml
  data:
    - data/moment-types.yaml
    - data/viral-triggers.yaml
---

# Task: Build Narrative

**Command:** `*narrative {style}`
**Execution Type:** Agent (requires creative judgment for narrative assembly)

---

## Task Anatomy

```yaml
task_name: build-narrative
status: active
responsible_executor: "Tier 1 agent (selected by style)"
execution_type: agent
input:
  required:
    - banco_momentos: "{source-slug}/momentos.md from mining phase (QG-002 passed)"
  optional:
    - style: "blind-assembly | rule-of-six | 5-second-moment"
    - target_format: "shorts | longform | documentary"
    - target_duration: "Target duration (e.g., '10:00', '0:30')"
    - theme: "Primary narrative theme (e.g., 'transformation', 'discovery', 'conflict')"
    - curadoria: "curadoria.yaml if external data enrichment available"
output:
  file: "narrative_structure.yaml"
  description: "Narrative structure with assembly order, emotional arc, pacing notes"
action_items:
  - "Select Tier 1 agent based on style/content"
  - "Analyze banco_momentos for narrative potential"
  - "Build emotional arc structure"
  - "Determine assembly order (not chronological)"
  - "Identify transitions needed"
  - "Run radio cut test"
  - "Generate narrative_structure.yaml"
acceptance_criteria:
  - "Assembly order defined (may differ from chronological)"
  - "Emotional arc has clear beats (hook → setup → tension → climax → resolution)"
  - "All referenced moment IDs exist in banco_momentos"
  - "Transitions between non-adjacent moments identified"
  - "Radio cut test passed (makes sense as audio-only)"
  - "Pacing notes included for editor"
  - "No narrative gaps (unexplained jumps)"
  - "Target duration achievable with selected moments"
```

---

## Agent Selection

```yaml
agent_selection:
  - condition: "style == 'blind-assembly' OR documentary content OR emotional/character-driven"
    agent: "ken-burns"
    method: "Blind Assembly → Radio Cut → Reduction → Structure"
    best_for: "Emotional stories, testimonials, journey narratives"

  - condition: "style == 'rule-of-six' OR complex multi-thread content"
    agent: "walter-murch"
    method: "Rule of Six hierarchy (Emotion 51% > Story > Rhythm > Eye Trace > 2D > 3D)"
    best_for: "Multi-topic content, sophisticated editing, parallel threads"

  - condition: "style == '5-second-moment' OR clear transformation story"
    agent: "matthew-dicks"
    method: "Find THE 5-Second Moment of change → build backward and forward"
    best_for: "Transformation arcs, before/after, personal growth"

  - condition: "default (no style specified)"
    agent: "ken-burns"
    rationale: "Blind Assembly is the most versatile starting method"
```

---

## Phases

### PHASE 1: Moment Analysis
**Duration:** 2-3 min
**Mode:** Analytical

```yaml
steps:
  - step: 1.1
    action: "Read {source-slug}/momentos.md completely"
    focus:
      - "Total moments available"
      - "Distribution by type (hooks, insights, stories, quotes)"
      - "Top-ranked moments"
      - "Dependencies between moments"

  - step: 1.2
    action: "Identify narrative potential"
    questions:
      - "Is there a clear transformation arc?"
      - "Are there strong emotional peaks?"
      - "Do stories have complete arcs (setup → tension → resolution)?"
      - "Is there enough material for target duration?"

  - step: 1.3
    action: "Select moments for narrative"
    criteria:
      shorts: "impact_score >= 7, prefer standalone moments"
      longform: "impact_score >= 5, include context and transitions"
      documentary: "include lower-scored moments for pacing/contrast"
```

**Checkpoint:**
- [ ] banco_momentos fully analyzed
- [ ] Narrative potential assessed
- [ ] Moment selection made

---

### PHASE 2: Emotional Arc Construction
**Duration:** 5-8 min
**Mode:** Creative assembly

```yaml
steps:
  - step: 2.1
    action: "Map selected moments to emotional beats"
    arc_structure:
      opening_hook:
        purpose: "Grab attention, establish stakes"
        emotional_goal: "Curiosity, intrigue"
        select_from: "hooks with highest impact_score"

      setup:
        purpose: "Establish characters, context, world"
        emotional_goal: "Connection, familiarity"
        select_from: "stories, context-setting insights"

      rising_tension:
        purpose: "Build conflict, obstacles, complexity"
        emotional_goal: "Concern, anticipation"
        select_from: "stories with conflict, contrarian insights"

      climax:
        purpose: "Peak emotional moment"
        emotional_goal: "Maximum engagement"
        select_from: "highest-impact story or insight moment"

      resolution:
        purpose: "Resolve tension, deliver payoff"
        emotional_goal: "Satisfaction, catharsis"
        select_from: "resolution moments, key insights"

      reflection:
        purpose: "Meaning, takeaway, call to action"
        emotional_goal: "Inspiration, motivation"
        select_from: "quotes, actionable insights"

  - step: 2.2
    action: "Determine assembly order"
    rule: "Order by NARRATIVE logic, NOT chronological order"
    note: "Moment from 00:45:00 can come before moment from 00:05:00"

  - step: 2.3
    action: "Identify transition needs"
    types:
      natural: "Moments flow naturally (context_after → context_before align)"
      bridge_needed: "Need verbal bridge (mark exact phrase if available in source)"
      hard_cut: "Intentional jump cut for energy"
    critical_rule: "Transition text must come FROM the source material, never invented"
```

**Checkpoint:**
- [ ] All beats have moments assigned
- [ ] Assembly order defined
- [ ] Transitions identified and sourced

---

### PHASE 3: Radio Cut Test
**Duration:** 2-3 min
**Mode:** Mental simulation

```yaml
steps:
  - step: 3.1
    action: "Mentally 'listen' to assembly in order"
    imagine: "Eyes closed, hearing only the audio in sequence"
    evaluate:
      - "Does it make sense without context explanation?"
      - "Where does attention wander?"
      - "Are there confusing jumps?"
      - "Does the emotional arc build correctly?"

  - step: 3.2
    action: "Note problems"
    track:
      attention_drops: "Timestamps where energy falls"
      confusion_points: "Jumps that don't make sense"
      missing_context: "Places that need setup"
      pacing_issues: "Too fast or too slow sections"

  - step: 3.3
    action: "Fix problems"
    options:
      - "Add transition moment from source"
      - "Reorder moments"
      - "Cut moment that breaks flow"
      - "Add pacing note (pause, breath)"

  - step: 3.4
    action: "Re-test until radio cut passes"
```

**Checkpoint:**
- [ ] Radio cut test passed
- [ ] No unexplained jumps
- [ ] Emotional arc builds correctly
- [ ] Pacing feels right

---

### PHASE 4: Generate Output
**Duration:** 2-3 min
**Mode:** Systematic generation

```yaml
steps:
  - step: 4.1
    action: "Generate narrative_structure.yaml"
    sections:
      metadata: "Method used, source, version, target duration"
      emotional_arc: "Beats with moment IDs, duration, emotional goals"
      assembly_order: "Ordered list of moments with timestamps and transition notes"
      radio_cut_test: "Results - passed/failed, attention drops, emotional peaks"
      pacing_notes: "Editor instructions for timing and breath"
      curadoria_integration: "Where external data fits (if curadoria.yaml available)"

  - step: 4.2
    action: "Verify all moment IDs exist in banco_momentos"
    validation: "Cross-reference every ID in assembly_order against banco_momentos.momentos[].id"

  - step: 4.3
    action: "Calculate estimated duration"
    method: "Sum duration_seconds of all moments in assembly_order + transition time"
    compare: "Against target_duration if specified"
```

---

## Quality Gate: QG-003

**BLOCKING.** Must pass before output moves to Tier 2.

```yaml
mandatory_checks:
  - "narrative_structure.yaml exists"
  - "Assembly order defined and makes sense"
  - "All moment IDs valid (exist in banco_momentos)"
  - "No narrative gaps (unexplained jumps between moments)"
  - "Transitions identified for non-adjacent moments"
  - "Radio cut test passed"

quality_checks:
  - "Emotional arc has distinct beats"
  - "Pacing notes included"
  - "Estimated duration within target range"
  - "Curadoria integrated if available"

pass_criteria:
  mandatory: "ALL must pass"
  quality: "At least 75% must pass"

on_fail:
  - "Identify which narrative element fails"
  - "Options: reorder, add transitions, cut problematic moments"
  - "Re-run radio cut test"
  - "Only pass to Tier 2 when criteria met"
```

---

## Anti-Patterns

```yaml
never_do:
  - "Invent text for transitions (must come from source)"
  - "Keep chronological order without questioning (narrative order often differs)"
  - "Include moments just because they scored high (must fit narrative)"
  - "Skip the radio cut test"
  - "Ignore pacing (rushing emotional moments)"
  - "Reference moment IDs that don't exist in banco_momentos"

always_do:
  - "Test assembly as audio-only (radio cut)"
  - "Map moments to emotional arc beats"
  - "Define assembly order explicitly"
  - "Include pacing notes for editor"
  - "Source all transition text from original content"
  - "Validate moment IDs against banco_momentos"
```

---

## Handoff

```yaml
on_complete:
  pass_to: "curator-chief"
  deliver: "narrative_structure.yaml"
  context: "Narrative structured using {method}. {n} moments in {beats} beats. Duration: ~{duration}. Ready for format optimization."
  next_gate: "QG-003 passed"

alternative_handoffs:
  - to: "mrbeast"
    when: "target_format == shorts OR target_format == longform"
  - to: "brendan-kane"
    when: "Viral hook optimization needed"
  - to: "jonah-berger"
    when: "Shareability optimization needed"
```

---

## Veto Conditions (BLOCKING)

| ID | Condition | Detection | Action |
|----|-----------|-----------|--------|
| VETO-01 | No momentos.md input (mining not done) | `banco_momentos` path does not exist or file is empty | BLOCK — run `*mine` first to generate mining output |
| VETO-02 | Less than 10 moments extracted | YAML frontmatter `top_50` field < 10 OR fewer than 10 MOMENTO blocks present | BLOCK — insufficient material for narrative construction; return to mining |
| VETO-03 | Moments without timestamps | Any MOMENTO block is missing `Início` or `Fim` fields | BLOCK — timestamps are required for assembly order and editor instructions |

---

## Dependencies

| Type | File | When Used |
|------|------|-----------|
| Input | `{source-slug}/momentos.md` | Source moments (required) |
| Input | `curadoria.yaml` | External data (optional) |

---

## Usage

```bash
# Via curator-chief
@curator:curator-chief
*narrative blind-assembly

# Direct to specific agent
@curator:ken-burns
*blind-assembly [banco_momentos]

@curator:walter-murch
*rule-of-six [banco_momentos]

@curator:matthew-dicks
*5-second-moment [banco_momentos]

# With theme
*narrative blind-assembly --theme transformation
```

---

_Task Version: 1.0.0_
_Agents: ken-burns, walter-murch, matthew-dicks_
_Quality Gate: QG-003 (blocking)_
_Input: {source-slug}/momentos.md (QG-002 passed)_
