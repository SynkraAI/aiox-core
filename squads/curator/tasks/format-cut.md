---
task-id: format-cut
name: Format Cut — Editor-Ready Cut Script
agent: "mrbeast | brendan-kane | jonah-berger (selected by format/goal)"
version: 1.1.0
purpose: Transform narrative structure into format-optimized, editor-ready cut script

workflow-mode: interactive
elicit: true
elicitation-type: custom

inputs:
  - name: narrative_structure
    type: file_path
    description: "Narrative structure from Tier 1 (QG-003 passed)"
    required: true
    default: "narrative_structure.yaml"
  - name: target_format
    type: enum
    description: "Output format type"
    required: true
    options: ["shorts", "longform", "longform_simple", "documentary", "social_clips"]
  - name: platform
    type: enum
    description: "Target platform"
    required: false
    options: ["tiktok", "reels", "youtube_shorts", "youtube_main", "linkedin", "multi-platform"]
  - name: target_duration
    type: string
    description: "User override for duration (Duration Intelligence calculates by default)"
    required: false
  - name: style_preset
    type: enum
    description: "Visual/pacing style"
    required: false
    default: "viral (shorts) | educational (longform)"
    options: ["viral", "educational", "emotional", "entertaining", "conversational"]
  - name: num_cuts
    type: integer
    description: "Number of cut variants to produce"
    required: false
    default: 1
  - name: curadoria
    type: file_path
    description: "External data enrichment file"
    required: false
  - name: transcricao_anotada
    type: file_path
    description: "Annotated transcript (REQUIRED for longform_simple)"
    required: false
    default: "output/curated/{source-slug}/transcricao_anotada.md"
  - name: constrained_moments
    type: integer_array
    description: "Specific moment IDs to use (from *select-moments)"
    required: false

outputs:
  - path: "output/curated/{source-slug}/cortes/{format}/{NN}_{name}.yaml"
    format: yaml
    description: "Editor-ready cut script"
  - path: "output/curated/{source-slug}/cortes/{format}/{NN}_{name}_GUIA_EDITOR.md"
    format: markdown
    description: "Human-readable editor guide (generated via script)"

dependencies:
  templates:
    - templates/shorts-cut-tmpl.yaml
    - templates/longform-cut-tmpl.yaml
    - templates/longform-simple-cut-tmpl.yaml
    - templates/social-clips-tmpl.yaml
  checklists:
    - checklists/output-quality.md
  scripts:
    - squads/curator/scripts/generate_editor_guide.py
---

# Task: Format Cut

**Command:** `*create-cut {format}`
**Execution Type:** Agent (requires judgment for format optimization and hook engineering)

---

## Task Anatomy

```yaml
task_name: format-cut
status: active
responsible_executor: "Tier 2 agent (selected by format/goal)"
execution_type: agent
input:
  required:
    - narrative_structure: "narrative_structure.yaml from Tier 1 (QG-003 passed)"
    - target_format: "shorts | longform | longform_simple | documentary | social_clips"
  optional:
    - platform: "tiktok | reels | youtube_shorts | youtube_main"
    - target_duration: "User override only — Duration Intelligence calculates from content + platform sweet spots by default"
    - viral_goal: "true | false - Optimize for viral potential"
    - curadoria: "curadoria.yaml if external data available"
    - num_cuts: "Number of cut variants to produce (default: 1)"
    - style_preset: "viral | educational | emotional | entertaining (default: viral for shorts, educational for longform)"
    - transcricao_anotada: "output/curated/{source-slug}/transcricao_anotada.md — annotated transcript with KEEP/REMOVE/BRIDGE markers, natural cut points, and bridge material. REQUIRED for longform_simple format."
output:
  file: "output/curated/{source-slug}/cortes/{format}/{NN}_{name}.yaml"
  naming: |
    longform: output/curated/{source-slug}/cortes/longform/{NN}_{titulo_sanitizado}.yaml
    shorts: output/curated/{source-slug}/cortes/shorts/{NN}_{titulo_sanitizado}.yaml
    NN = sequential number (01, 02, etc.)
    titulo_sanitizado = slugified titulo from metadata
  templates:
    shorts: "squads/curator/templates/shorts-cut-tmpl.yaml"
    longform: "squads/curator/templates/longform-cut-tmpl.yaml"
action_items:
  - "Select Tier 2 agent based on format/goal"
  - "Apply format-specific optimization"
  - "Optimize hooks for platform"
  - "Integrate curadoria if available"
  - "Generate roteiro_corte.yaml using template"
  - "Validate against QG-004"
acceptance_criteria:
  - "roteiro_corte.yaml follows template structure"
  - "All timestamps are EXACT (MM:SS or HH:MM:SS from original source)"
  - "Transcriptions are EXACT (word for word from banco_momentos)"
  - "Assembly order defined (ordem_montagem field)"
  - "Transitions between moments identified"
  - "Transitions sourced from annotated transcript BRIDGE segments where available"
  - "Natural cut points (corte_natural_in/out) sourced from transcricao_anotada"
  - "Editor instructions clear and actionable"
  - "Format-specific requirements met (see platform rules)"
  - "Editor guide MD exists alongside each YAML cut file"
  - "Curadoria integrated with encaixe_sugerido if available"
```

---

## Agent Selection

```yaml
agent_selection:
  by_format:
    - condition: "target_format == 'shorts'"
      primary: "mrbeast"
      secondary: "brendan-kane (hook optimization)"
      rationale: "Sub-60s structure + viral hooks + retention architecture"

    - condition: "target_format == 'longform'"
      primary: "mrbeast"
      secondary: "jonah-berger (shareability)"
      rationale: "10+ min structure + retention architecture + social triggers"

    - condition: "target_format == 'documentary'"
      primary: "mrbeast"
      rationale: "Documentary uses longform retention structure"

    - condition: "target_format == 'longform_simple'"
      primary: "mrbeast"
      secondary: null
      rationale: "Light mode — chronological order, no full Tier 1 narrative. Tier 1 SKIPPED. Uses transcricao_anotada as backbone."
      tier_1_skip: true

    - condition: "target_format == 'social_clips'"
      primary: "brendan-kane"
      secondary: "mrbeast"
      rationale: "Multi-platform clip package — Hook Point methodology + platform-specific length variants per clip"
      template: "squads/curator/templates/social-clips-tmpl.yaml"

  by_goal:
    - condition: "viral_goal == true"
      add: "brendan-kane"
      rationale: "Hook Point methodology for viral optimization"

    - condition: "Need shareability analysis"
      add: "jonah-berger"
      rationale: "STEPPS framework for social triggers"

  collaboration:
    note: "Multiple Tier 2 agents can contribute to same cut"
    example: "mrbeast for retention structure + brendan-kane for hook + jonah-berger for STEPPS analysis"
```

---

## Phases

### PHASE 1: Format Analysis
**Duration:** 2-3 min
**Mode:** Analytical

```yaml
steps:
  - step: 1.1
    action: "Read narrative_structure.yaml completely"
    verify:
      - "Assembly order exists"
      - "Emotional arc defined"
      - "Moment IDs are valid"
      - "Estimated duration calculated"

  - step: 1.1b
    action: "Read transcricao_anotada.md if available"
    purpose: "Source bridge material, natural cut points, and inter-moment context"
    verify:
      - "KEEP segments match momento IDs from narrative_structure"
      - "BRIDGE segments identified for transition text"
      - "Natural cut points available for each KEEP moment"
    note: "Optional but STRONGLY recommended. Without it, transitions must be manually sourced."

  - step: 1.2
    action: "Determine format constraints"
    by_format:
      shorts:
        duration: "content-driven (Duration Intelligence)"
        duration_note: |
          Duration is calculated from content structure, NOT fixed buckets.
          Platform sweet spots guide but do not dictate:
            TikTok viral: 24-38s | value: 60-90s | max: 60s
            Instagram Reels viral: 7-15s | value: 30-45s | max: 90s
            YouTube Shorts optimal: 50-58s | max: 60s
            LinkedIn: 60-90s | max: 10m
            Twitter/X: 20-45s | max: 140s
          Completion rate > arbitrary length.
          Ref: .dispatch/research/curator-cut-customization-research.md (Section 3)
        hook_window: "1 second"
        cut_frequency: "every 2-4 seconds"
        must_have: "loop or CTA ending"

      longform:
        min_duration: "10 minutes"
        hook_window: "5 seconds"
        retention_tactics: "chapter markers, pattern interrupts every 2-3 min"
        must_have: "strong opening, mid-roll hooks, satisfying close"

      longform_simple:
        min_duration: "20 minutes"
        max_duration: "25 minutes"
        hook_window: "first 2 minutes (engineered opening)"
        source_window: "30-35 min raw -> 20-25 min after REMOVE cleanup"
        requires: "transcricao_anotada.md (BLOCKING — format does not work without it)"
        must_have: "strong hook (any source location), 2-3 dense opening moments, chronological flow after opening"
        tier_1: "SKIPPED — chronological order replaces narrative restructuring"
        max_insertions: "2-3 moments from outside the window"

      documentary:
        duration: "flexible"
        pacing: "slower, more breath"
        must_have: "emotional arc with contrast, let moments breathe"

      social_clips:
        template: "squads/curator/templates/social-clips-tmpl.yaml"
        description: "Multi-platform clip package — one moment per clip, each with platform-specific length variant"
        clips_per_run: "3-10 independent clips (each 15-90s)"
        hook_window: "1 second"
        must_have: "Each clip standalone (no context required from other clips)"
        platforms_supported: ["tiktok", "reels", "youtube_shorts", "linkedin", "twitter_x"]
        note: "Each clip is self-contained. No assembly order across clips. Each clip has its own editor guide section."

  - step: 1.3
    action: "Map narrative moments to format structure"
    note: "Some moments may need trimming or splitting for format"
```

**Checkpoint:**
- [ ] narrative_structure analyzed
- [ ] Format constraints understood
- [ ] Moment-to-format mapping done

---

### PHASE 1.5: Duration Intelligence
**Duration:** 2-3 min
**Mode:** Analytical (content-driven calculation)

```yaml
DURATION INTELLIGENCE ALGORITHM:
# Duration is CALCULATED from content structure, NOT chosen from buckets.
# Platform limits are CEILINGS, not TARGETS.
# Ref: .dispatch/research/curator-cut-customization-research.md (Section 3)

FOR SHORTS:
  1. Identify HOOK moment → estimate duration
     - Pattern interrupt hooks: 1-3s
     - Question hooks: 3-5s
     - Story hooks: 3-7s

  2. Identify CORE VALUE moment(s) → sum durations
     - Single insight: 10-20s
     - Multi-point explanation: 20-40s
     - Story arc: 15-30s

  3. Add PAYOFF time
     - Punchline/revelation: 2-5s
     - Emotional beat: 3-7s

  4. Add CTA/LOOP time
     - Simple CTA: 2-3s
     - Loop setup: 1-2s

  5. SUM = recommended_duration

  6. Apply PLATFORM CAP:
     recommended = min(sum, platform_max)

  7. Check SWEET SPOT alignment → set confidence:
     if platform == "tiktok" and sum in 24-38:
       confidence = "HIGH — in viral sweet spot"
     elif platform == "reels" and sum in 7-15:
       confidence = "HIGH — in viral sweet spot"
     elif platform == "youtube_shorts" and sum in 50-58:
       confidence = "HIGH — in optimal range"
     elif platform == "linkedin" and sum in 60-90:
       confidence = "HIGH — in optimal range"
     elif platform == "twitter_x" and sum in 20-45:
       confidence = "HIGH — in optimal range"
     else:
       confidence = "MODERATE — outside sweet spot, may still work"

  8. Present with BREAKDOWN showing each beat's contribution:
     "Hook: 3s + Context: 5s + Value: 28s + Payoff: 4s + CTA: 2s = 42s"
     "Platform: TikTok (limit: 60s, sweet spot: 24-38s)"
     "Confidence: MODERATE — 4s over sweet spot ceiling"
     "Tolerance: +/-5s"

FOR LONGFORM:
  1. Sum all selected moment durations
  2. Add transition time (2-5s per transition)
  3. Add intro time (10-30s)
  4. Add outro time (15-30s)
  5. Present with chapter breakdown:
     "Chapter 1 (Hook+Context): 45s | Chapter 2 (Body): 4m30s | Chapter 3 (Climax): 2m | Chapter 4 (Close): 1m15s"
     "Transitions: 12 x ~3s = 36s"
     "Total: 8m06s + 36s = 8m42s"

PLATFORM SWEET SPOT REFERENCE:
  tiktok:       viral: 24-38s | value: 60-90s | max: 60s
  reels:        viral: 7-15s  | value: 30-45s | max: 90s
  youtube_shorts: optimal: 50-58s | max: 60s
  linkedin:     optimal: 60-90s | max: 10m
  twitter_x:    optimal: 20-45s | max: 140s

OUTPUT FORMAT (mandatory):
  - Duration recommendation with beat-by-beat breakdown
  - Platform alignment (sweet spot match or deviation)
  - Confidence level (HIGH or MODERATE) with explanation
  - Tolerance range (+/-5s)
  - If user override provided: warning if outside sweet spot
```

**Checkpoint:**
- [ ] Duration calculated from content structure (not fixed buckets)
- [ ] Platform sweet spot alignment checked
- [ ] Confidence level set with explanation
- [ ] Breakdown shows each beat's contribution

---

### PHASE 2: Format Optimization
**Duration:** 5-10 min
**Mode:** Creative optimization

```yaml
steps:
  - step: 2.1
    action: "Apply format-specific structure"
    shorts_structure:
      note: "Beat durations are content-driven percentages, not fixed seconds. Actual seconds come from Duration Intelligence."
      - "HOOK (~5-10% of total): Pattern interrupt, scroll-stopping"
      - "CONTEXT (~10-15% of total): Quick setup, promise value"
      - "VALUE (~50-60% of total): Deliver content, cuts every 2-4s"
      - "PAYOFF (~15-20% of total): The moment they came for"
      - "LOOP/CTA (~5% of total): Drive replay or action"

    longform_structure:
      - "COLD OPEN (0-30s): Hook + promise"
      - "INTRO (30s-2m): Context, establish credibility"
      - "BODY (2m-8m): Main content in chapters"
      - "CLIMAX (8m-9m): Peak value delivery"
      - "CLOSE (9m-10m): Summary + CTA"

    longform_simple_structure:
      - "ENGINEERED OPENING (0-2m): Hook from anywhere + 2-3 dense moments"
      - "CHRONOLOGICAL FLOW (2m-end): Window content in original order"
      - "POINT INSERTIONS: 2-3 moments from outside window, placed where thematically relevant"
      - "GAP HANDLING: REMOVE=jump_cut, BRIDGE=keep_connector, KEEP=include"

  - step: 2.2
    action: "Optimize hooks"
    for_shorts: "1-second pattern interrupt (visual + verbal)"
    for_longform: "5-second cold open that demands attention"
    rule: "Hook text must come from source material (NEVER invented)"

  - step: 2.3
    action: "Add retention tactics"
    shorts: "Cut every 2-4s, zoom at key moments, text overlay"
    longform: "Pattern interrupts every 2-3 min, chapter markers, teasers"

  - step: 2.4
    action: "Integrate curadoria if available"
    merge:
      - "Match curadoria items to moments via encaixe_sugerido"
      - "Define tipo_uso (overlay, verbal mention, card, b-roll)"
      - "Place in assembly order at correct position"
```

**Checkpoint:**
- [ ] Format structure applied
- [ ] Hooks optimized for platform
- [ ] Retention tactics added
- [ ] Curadoria integrated (if available)

---

### PHASE 2.5: Style Presets
**Duration:** 1-2 min
**Mode:** Selection + parameter application

```yaml
STYLE PRESETS:
# A style preset affects MEASURABLE PARAMETERS (cut_frequency, overlay_density,
# hook_strategy). A style that only changes a label is NOT a style preset.
# Each preset encodes pacing principles from professional editor workflows.
# Ref: .dispatch/research/curator-cut-customization-research.md (Section 6)

viral:
  pacing: fast (cuts every 2-4s)
  text_overlay: bold, high-contrast, frequent (every 3-5s)
  overlay_density: high  # 1 overlay per 3-5 seconds
  energy: high
  hook_style: pattern-interrupt or shocking stat
  cta: loop back to hook for replay
  cut_frequency: 0.33-0.5 cuts/s
  best_for: TikTok, Reels

educational:
  pacing: moderate (cuts every 5-8s)
  text_overlay: clean, minimal, keyword highlights only
  overlay_density: low  # 1 overlay per 8-12 seconds
  energy: calm-confident
  hook_style: question or "here's what you need to know"
  cta: follow for more / comment question
  cut_frequency: 0.125-0.2 cuts/s
  best_for: YouTube Shorts, LinkedIn

emotional:
  pacing: slow (cuts every 8-15s, breathing room)
  text_overlay: minimal, elegant
  overlay_density: minimal  # 1-2 overlays total
  energy: intimate
  hook_style: personal story or vulnerable confession
  cta: soft (share if this resonated)
  cut_frequency: 0.067-0.125 cuts/s
  best_for: Instagram, emotional content

entertaining:
  pacing: dynamic (varied rhythm, surprise cuts)
  text_overlay: playful, emoji-enhanced
  overlay_density: medium  # 1 overlay per 5-8 seconds
  energy: varied (builds and releases)
  hook_style: bold claim or absurd premise
  cta: direct (follow, comment what you think)
  cut_frequency: variable (0.1-0.5 cuts/s depending on beat)
  best_for: TikTok, cross-platform

LONGFORM ADAPTATIONS:
  # Longform typically uses educational or emotional styles.
  # Viral and entertaining can apply to specific chapters but not full video.
  educational_longform:
    chapter_pacing: moderate (cuts every 5-8s within chapters)
    pattern_interrupts: every 2-3 minutes
    text_overlay: keyword highlights at key insights
    energy: builds across chapters, peaks at climax
    best_for: YouTube main, course content

  emotional_longform:
    chapter_pacing: slow (lets moments breathe, 8-15s between cuts)
    pattern_interrupts: every 3-5 minutes (subtle)
    text_overlay: minimal, only for key quotes
    energy: slow build with deliberate peaks
    best_for: documentary, podcast video

RULE: Style preset MUST affect measurable parameters (cut_frequency,
  overlay_density, hook_strategy). A style that only changes a label
  is NOT a style preset.

APPLICATION:
  1. Select style from user input or default (viral for shorts, educational for longform)
  2. Apply style parameters to cut_frequency map
  3. Apply style parameters to text_overlay plan
  4. Apply style parameters to hook selection strategy
  5. Record style in output metadata
```

**Checkpoint:**
- [ ] Style preset selected (user-specified or default)
- [ ] Measurable parameters applied (cut_frequency, overlay_density, hook_strategy)
- [ ] Style recorded in output metadata

---

### PHASE 3: Generate Cut Script
**Duration:** 3-5 min
**Mode:** Systematic generation

```yaml
steps:
  - step: 3.1
    action: "Generate roteiro_corte.yaml using template"
    template: "squads/curator/templates/shorts-cut-tmpl.yaml (for shorts) or squads/curator/templates/longform-cut-tmpl.yaml (for longform)"
    sections:
      metadata:
        - "titulo (descriptive title for the cut)"
        - "fonte_original (source URL/name)"
        - "duracao_original (original content duration)"
        - "duracao_alvo (target duration)"
        - "formato (shorts|longform|documentary)"
        - "plataforma (tiktok|reels|youtube_shorts|youtube_main)"
        - "data_geracao (today's date)"

      momentos:
        per_moment:
          - "id (sequential in assembly order)"
          - "ordem_montagem (assembly position)"
          - "tipo (from banco_momentos)"
          - "timestamp_inicio (EXACT from source)"
          - "timestamp_fim (EXACT from source)"
          - "duracao_segundos (calculated)"
          - "transcricao (EXACT word for word)"
          - "contexto_antes (for editor context)"
          - "contexto_depois (for editor context)"
          - "transicao_antes (null|natural|hard_cut|bridge text)"
          - "transicao_depois (null|natural|pausa_intencional|bridge text)"
          - "notas_editor (specific instructions for this moment)"

      curadoria:
        per_item:
          - "id, tipo, conteudo, fonte, encaixe_sugerido, confianca"

      instrucoes_editor:
        - "gerais (universal instructions)"
        - "sobre_transicoes (transition guide)"
        - "transicoes_necessarias (specific bridges with source)"
        - "sobre_audio (music, effects, volume)"
        - "sobre_visual (camera, zoom, cuts)"

      sumario:
        - "total_momentos"
        - "duracao_final_estimada"
        - "estrutura (beat list with timings)"
        - "momentos_por_tipo (count by type)"

  - step: 3.2
    action: "Verify all timestamps against banco_momentos"
    validation: "Every timestamp_inicio and timestamp_fim must match banco_momentos exactly"

  - step: 3.3
    action: "Verify all transcriptions are exact"
    validation: "Compare each transcricao field against banco_momentos.momentos[].transcricao"

  - step: 3.4
    action: "Add platform-specific adaptations"
    if_shorts:
      tiktok: "Native feel, trending sounds, text on screen"
      reels: "Slightly polished, strong thumbnail"
      youtube_shorts: "Educational tone, subscribe CTA"
```

---

### PHASE 4: Editor Guide Generation (CODE)
**Duration:** 1 min
**Mode:** CODE execution (Python script)
**Purpose:** Generate human-readable editor guide MD alongside each cut YAML

```yaml
steps:
  - step: 4.1
    action: "Generate editor guide via CODE"
    code: |
      python squads/curator/scripts/generate_editor_guide.py output/curated/{source-slug}/cortes/{format}/
      # Generates {filename}_GUIA_EDITOR.md alongside each YAML cut file
    output: "One _GUIA_EDITOR.md per YAML cut file in same directory"

  - step: 4.2
    action: "Validate editor guides exist"
    check: "For every .yaml cut file, a corresponding _GUIA_EDITOR.md exists"

  - step: 4.3
    action: "Cross-YAML consistency check (BLOCKING)"
    code: |
      python squads/curator/scripts/validate_cross_yaml.py output/curated/{source-slug}/cortes/{format}/
    on_fail: "Exit code 1 = shared moment IDs have inconsistent timestamps across YAMLs. Fix before delivery."
    blocking: true
    note: "Only meaningful when multiple cut YAMLs exist for same source. Script exits 0 if no shared IDs."
```

**Checkpoint:**
- [ ] Editor guide MD exists alongside each YAML cut file
- [ ] Guide includes chapter summary table
- [ ] Guide includes all moment transcriptions
- [ ] Guide includes bridge timestamps and transitions

---

## Quality Gate: QG-004

**BLOCKING.** Must pass before delivery to editor.

```yaml
mandatory_checks:
  - "roteiro_corte.yaml exists and follows template"
  - "All timestamps are EXACT (match banco_momentos source)"
  - "All transcriptions are EXACT (word for word from source)"
  - "Assembly order (ordem_montagem) is sequential and clear"
  - "Editor instructions (instrucoes_editor) section complete"
  - "Transitions between all non-adjacent moments identified"
  - "No text was INVENTED (all from source material)"

quality_checks:
  - "Hooks optimized for target platform"
  - "Retention tactics included"
  - "Curadoria integrated if available"
  - "Pacing appropriate for format"
  - "Summary section complete"
  - "Platform-specific adaptations noted"

pass_criteria:
  mandatory: "ALL must pass"
  quality: "At least 75% must pass"

on_fail:
  - "Identify which check failed"
  - "Fix: if timestamp wrong → re-check banco_momentos"
  - "Fix: if transition missing → find bridge in source"
  - "Fix: if text invented → remove or source from material"
  - "Re-validate"
```

---

## Multi-Variant Generation

```yaml
MULTI-VARIANT GENERATION PROTOCOL:
# Ref: .dispatch/research/curator-cut-customization-research.md (Section 5)

RULE: num_cuts > 1 → generate N DIFFERENT assemblies, NOT N copies

DIVERSITY REQUIREMENTS:
  - Each variant MUST use a different hook
  - Each variant SHOULD use different supporting moments (where possible)
  - Each variant MAY use different pacing/style (if style param allows)

VARIANT STRATEGY:
  Variant 1 (Primary):
    Hook: Highest-scored hook from banco de momentos
    Moments: Top-scored supporting moments
    Style: User-selected style (or default)
    Duration: Recommended duration from Duration Intelligence

  Variant 2 (Alternative Hook):
    Hook: Second-highest hook
    Moments: Same core moments OR alternative set
    Style: Same style OR educational (for contrast)
    Duration: Same OR +/-10s variation

  Variant 3 (Creative Contrast):
    Hook: Third hook OR completely different approach
    Moments: Alternative moment set where available
    Style: Different style for contrast
    Duration: Different sweet spot (e.g., 15s vs 42s)

  Variant N (up to 5):
    Maximize diversity across all dimensions
    If insufficient unique hooks: STOP generating
    Inform user: "Only N strong hooks found, generating N variants"

CONSTRAINT: If only 1 strong hook exists → cap at 1 variant
  Inform user: "Only 1 viable hook found. Multi-variant not recommended."

DIMINISHING RETURNS:
  2-3 variants: High value
  4-5 variants: Moderate value
  6+: Not recommended (budget dilution)

OUTPUT per variant: roteiro_corte_v{N} section
  Each variant output MUST include:
    - variant_id: v1, v2, v3... (matches template field)
    - variant_rationale: Why this variant is different from others
    - hook_used: moment ID + hook type + score
    - moments_selected: list of moment IDs used
    - duration: recommended duration with breakdown
    - style: style preset applied
    - rationale: what makes this variant different

COMPARISON SUMMARY (mandatory if multi-variant):
  | Variant | Hook | Moments | Duration | Style | Key Differentiator |
  |---------|------|---------|----------|-------|--------------------|
  | v1 | #3 (counter-intuitive) | 3,7,12 | 42s | viral | Strongest hook |
  | v2 | #12 (personal story) | 5,8,15 | 38s | emotional | Story-driven |
  | v3 | #28 (bold claim) | 3,9,20 | 55s | educational | Deep value |
```

**Execution flow when num_cuts > 1:**

1. Run Duration Intelligence for primary variant
2. Select top N hooks from banco de momentos (where N = num_cuts)
3. If fewer than N viable hooks exist, cap variants at available hooks
4. Generate each variant with distinct hook + moment combination
5. Apply style presets (same or different per variant, depending on user config)
6. Produce comparison summary table
7. Present all variants with clear differentiation rationale

---

## Anti-Patterns

```yaml
never_do:
  - "Invent transition text (must come from source material)"
  - "Approximate timestamps ('around 5:00')"
  - "Paraphrase transcriptions (must be exact)"
  - "Skip format-specific requirements"
  - "Deliver without editor instructions"
  - "Ignore platform differences (TikTok != YouTube Shorts)"
  - "Add moments not in banco_momentos or narrative_structure"

always_do:
  - "EXACT timestamps from banco_momentos"
  - "EXACT transcriptions word for word"
  - "Clear editor instructions per moment"
  - "Platform-specific adaptations"
  - "Transitions sourced from transcricao_anotada BRIDGE segments (preferred) or original material"
  - "Natural cut points from transcricao_anotada (corte_natural_in/out)"
  - "Complete instrucoes_editor section"
  - "Pre-delivery checklist in sumario"
```

---

### PHASE 5: Update Source Index (CODE)
**Duration:** <1 min
**Mode:** CODE execution

```yaml
steps:
  - step: 5.1
    action: "Update source INDEX.md with new cut artifacts"
    code: |
      python squads/curator/scripts/generate_source_index.py {source-slug}
      # Updates output/curated/{source-slug}/INDEX.md with new cut files
    note: "Idempotent — safe to re-run after each cut."
```

---

## Handoff

```yaml
on_complete:
  pass_to: "curator-chief"
  deliver:
    - "roteiro_corte.yaml"
    - "editor_instructions (embedded in yaml)"
  context: "Cut script ready. Format: {format}. {n} moments, ~{duration}. Platform: {platform}. QG-004 passed."
  final_delivery: true

downstream:
  - to: "editor (human)"
    what: "roteiro_corte.yaml - cut directly from this"
  - to: "@copy"
    what: "High-impact moments for repurposing into new copy"
  - to: "@newsletter"
    what: "Key insights for newsletter content"
```

---

## Veto Conditions (BLOCKING)

| ID | Condition | Detection | Action |
|----|-----------|-----------|--------|
| VETO-01 | No narrative structure input | `narrative_structure.yaml` does not exist or path is not provided | BLOCK — run `*narrative` first to generate Tier 1 output (except `longform_simple` which skips Tier 1) |
| VETO-02 | Target format not specified | `target_format` input is null or not one of the valid enum values | BLOCK — format determines template, structure, agent selection, and duration rules; cannot proceed without it |
| VETO-03 | Narrative has zero selected moments | `assembly_order` in narrative_structure.yaml is empty or absent | BLOCK — no moments to cut; return to build-narrative and ensure assembly order is defined |

---

## Dependencies

| Type | File | When Used |
|------|------|-----------|
| Input | `narrative_structure.yaml` | Source structure (required) |
| Input | `curadoria.yaml` | External data (optional) |
| Input | `{source-slug}/transcricao_anotada.md` | Bridge material, cut points, inter-moment context (optional, recommended) |
| Template | `templates/shorts-cut-tmpl.yaml` | Generating shorts output |
| Template | `templates/longform-cut-tmpl.yaml` | Generating longform output |

---

## Usage

```bash
# Via curator-chief
@curator:curator-chief
*create-cut shorts
*create-cut longform
*create-cut documentary

# Direct to specific agent
@curator:mrbeast
*retention [narrative_structure]

@curator:mrbeast
*structure [narrative_structure]

# With platform specification
*create-cut shorts --platform tiktok
*create-cut longform --platform youtube_main

# With viral optimization
*create-cut shorts --viral true

# With style preset
*create-cut shorts --style viral
*create-cut shorts --style educational
*create-cut longform --style emotional

# Multiple variants
*create-cut shorts --num 3
*create-cut shorts --num 3 --style viral

# Multiple variants with mixed styles
*create-cut shorts --num 3 --style varied  # Each variant gets a different style
```

---

_Task Version: 1.1.0_
_Agents: mrbeast, brendan-kane, jonah-berger_
_Quality Gate: QG-004 (blocking)_
_Input: narrative_structure.yaml (QG-003 passed)_
_Output: roteiro_corte.yaml (final deliverable)_
