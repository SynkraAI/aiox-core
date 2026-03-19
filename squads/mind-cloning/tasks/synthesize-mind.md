# Task: Synthesize Mind DNA

Combine Voice DNA + Thinking DNA into a single, complete mind DNA file.

---

## Metadata
- **task-id:** synthesize-mind
- **agent:** mind-cloner
- **elicit:** false
- **execution_type:** automated

## Prerequisites

- Voice DNA extracted: `squads/mind-cloning/minds/{mind_slug}/voice_dna.yaml`
- Thinking DNA extracted: `squads/mind-cloning/minds/{mind_slug}/thinking_dna.yaml`
- Both must have passed their respective quality checks

## Instructions

### Step 1: Load Both DNA Files

Read:
- `squads/mind-cloning/minds/{mind_slug}/voice_dna.yaml`
- `squads/mind-cloning/minds/{mind_slug}/thinking_dna.yaml`

Verify both exist and have valid content.

### Step 2: Cross-Reference Analysis

Identify connections between Voice and Thinking DNA:

1. **Voice-Thinking Alignment:** Where communication style reflects thinking patterns
   - Example: Direct communication style + fast decision pipeline
2. **Voice-Thinking Tension:** Where communication contradicts thinking
   - Example: Warm tone BUT ruthless veto heuristics
3. **Reinforcement Patterns:** Where voice amplifies thinking
   - Example: Power words that map to framework steps

### Step 2.5: Evaluate Stage Architecture

Consult `squads/mind-cloning/data/clone-stages-guide.md` to determine if this clone needs stages.

**Evaluation criteria:**
1. Does the expert's behavior change significantly by context?
2. Does the expert have distinct "modes" (e.g., teaching vs confronting)?
3. Will the clone serve multiple interaction types (e.g., sales funnel, support)?

**Decision:**
- If YES to any → Design stage architecture using patterns from the guide
- If NO to all → Proceed as single-stage clone

**If stages are needed:**
1. Select the closest pattern from the guide (funnel, atendimento, educacional, expert with moods)
2. Define 3-5 stages with clear triggers and transitions
3. Add `stages` section to the output Mind DNA (see template)

**Heuristic AN004:** Never use a single giant prompt for context-dependent behavior. Break into stages.

### Step 3: Build Complete Mind DNA

Combine into a single file using template `squads/mind-cloning/templates/mind-dna-complete-tmpl.yaml`:

Structure:
```yaml
mind_dna:
  metadata:
    expert_name: ""
    domain: ""
    extraction_date: ""
    fidelity_level: ""
    voice_score: "X/10"
    thinking_score: "X/9"

  identity_statement: ""  # From Voice DNA Phase 8

  voice:
    # Complete Voice DNA sections
    vocabulary: ...
    storytelling: ...
    writing_style: ...
    tone: ...
    anti_patterns: ...
    immune_system: ...
    contradictions: ...

  thinking:
    # Complete Thinking DNA sections
    recognition_patterns: ...
    frameworks: ...
    heuristics: ...
    decision_architecture: ...
    anti_patterns: ...
    objection_handling: ...
    handoff_triggers: ...

  synthesis:
    voice_thinking_alignment: []
    voice_thinking_tensions: []
    reinforcement_patterns: []
    overall_coherence: "X/10"

  sources:
    total: 0
    tier_distribution: {}
    key_sources: []
```

### Step 4: Calculate Fidelity Level

Based on quality scores:

| Level | Voice Score | Thinking Score | Fidelity |
|-------|-----------|---------------|----------|
| Basic | 6/10 | 5/9 | 60-75% |
| Intermediate | 7/10 | 6/9 | 75-85% |
| Premium | 9/10 | 8/9 | 85-95% |
| Elite | 10/10 | 9/9 | 93-97% |

### Step 5: Generate Quality Dashboard

Create `squads/mind-cloning/minds/{mind_slug}/quality_dashboard.md` using template `squads/mind-cloning/templates/quality-dashboard-tmpl.md`.

### Step 6: Save Complete Mind DNA

Save to `squads/mind-cloning/minds/{mind_slug}/mind_dna_complete.yaml`.

Present summary to user:
- Fidelity level achieved
- Voice/Thinking scores
- Key cross-references found
- Any gaps or areas for improvement

## Important Notes

- This is an AUTOMATED step - no user interaction needed unless gaps found
- If either Voice or Thinking DNA failed quality check, STOP and notify user
- Cross-reference analysis adds value beyond simple concatenation
- The synthesis section is what distinguishes a mind clone from two separate profiles
- Consult `data/dna-mental-8layers.md` checklist to validate coverage of all 8 layers
- Clone with fewer than 6/8 layers covered = INCOMPLETE, flag for re-extraction
