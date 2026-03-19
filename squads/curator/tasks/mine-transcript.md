# Task: Mine Transcript

**Task ID:** mine-transcript
**Version:** 3.0.0
**Purpose:** Extract high-value moments from a transcript using ATHENA-MEK + Paper Edit methodology
**Agent:** content-miner-pro
**Command:** `*mine {transcript}`
**Execution Type:** Agent (requires judgment for moment identification and scoring)
**Origin:** ATHENA-MEK v1.0 (3-Pass Sequential) + Paper Edit (4 phases) — merged

---

## Task Anatomy

```yaml
task_name: mine-transcript
status: active
responsible_executor: content-miner-pro
execution_type: agent
input:
  required:
    - transcript: "Raw transcript text with timestamps (or text for timestamp estimation)"
  optional:
    - focus_types: "List of moment types to prioritize (hook, insight, story, quote, transition, b_roll_cue)"
    - target_format: "shorts | longform | documentary (affects scoring weights)"
    - max_moments: "Maximum moments to extract (default: unlimited, extract all)"
output:
  compact:
    file: "output/curated/{source-slug}/momentos.md"
    template: "squads/curator/templates/banco-momentos-tmpl.md"
    description: "Top 50 moments — structured MD, human-readable, < input size"
    naming: "{source-slug}/momentos.md — slug folder identifies source"
  annotated_transcript:
    file: "output/curated/{source-slug}/transcricao_anotada.md"
    template: "squads/curator/templates/transcricao-anotada-tmpl.md"
    description: "Full transcript annotated with KEEP/REMOVE/BRIDGE markers + natural cut points"
    naming: "{source-slug}/transcricao_anotada.md — full context for editor"
  archive:
    file: "_temp/mining/{source-slug}/all_moments_merged.md"
    description: "ALL moments raw — for reference only"
action_items:
  - "CHECK: If transcript >2000 lines → Execute Large File Protocol FIRST"
  - "Execute Pass 1: Anchor Table (Temporal Anchoring)"
  - "Execute Pass 2: Extraction (Tag + Score + Trigger Detection)"
  - "Execute Pass 3: Audit (Territorial Completeness + Quality)"
  - "Execute Pass 4: Selection & Compaction (Filter top 50, generate compact MD)"
  - "Execute Pass 4.5: Transcription Correction (STT Fix)"
  - "Execute Pass 4.6: Generate Annotated Transcript (CODE — Python script)"
  - "Execute Pass 4.7: Timestamp Validation (CODE — BLOCKING)"
  - "Execute Phase 5: Radio Cut (Audio Test on compact selection)"
  - "Run mining-quality.md checklist"
acceptance_criteria:
  - "Every moment has exact timestamp_inicio AND timestamp_fim (MM:SS or HH:MM:SS)"
  - "Every moment has tipo assigned from valid types"
  - "Every moment has gatilho_viral assigned from viral-triggers.yaml"
  - "Every moment has impact_score (1-10) derived from MQR formula"
  - "Every moment has MQR compact notation (H{n}/E{n}/S{n}/C{n})"
  - "Batch average impact_score between 5.5-6.5 (anti-inflation)"
  - "Every moment has contexto_antes and contexto_depois"
  - "Transcriptions are EXACT (word for word, not paraphrased)"
  - "Transcriptions corrected for known STT errors (no content added/removed)"
  - "Anti-laziness: total moments >= (duration_seconds / 180)"
  - "Territorial coverage: sum(moment_durations) / total_duration >= 40%"
  - "Quartile distribution: each quartile has 10-40% of moments"
  - "COMPACT output is SMALLER than input transcript"
  - "COMPACT output has max 50 moments (top by impact_score)"
  - "Quick Scan table present for rapid human review"
  - "Rankings section calculated"
  - "Temp files organized in _temp/mining/{source-slug}/"
  - "Compact output at output/curated/{source-slug}/momentos.md"
  - "validate_timestamps.py passes with exit code 0 (no WRONG timestamps)"
  - "validate_transcription.py drifts reviewed (no unresolved DRIFT > 5s)"
  - "mining-quality.md checklist passes (all mandatory + 80% quality)"
```

---

## LARGE FILE PROTOCOL (>2000 lines)

**CRITICAL: Check transcript line count BEFORE starting. If >2000 lines, decompose.**

### Step 0: Create Source Directory
```bash
# Generate slug from source TITLE (not video ID)
# Rules: lowercase, remove accents, replace spaces/special with hyphens, truncate ~60 chars
# "Cohort Avançado - Aula 1" → "cohort-avancado-aula1"
# "IA no Vale do Silício: O que NINGUÉM te conta" → "ia-no-vale-do-silicio-o-que-ninguem-te-conta"
# NEVER use video ID as slug (e.g. "givmh6rb6sa" is WRONG)
source_slug = sanitize(youtube_title or source_name)
# Store video ID as metadata only
youtube_id = "{video_id}"  # e.g. "givmh6rb6sa" — for reference, NOT for naming

mkdir -p _temp/mining/{source_slug}/parts
mkdir -p output/curated/{source_slug}/cortes/longform
mkdir -p output/curated/{source_slug}/cortes/shorts
# Output will be: output/curated/{source_slug}/momentos.md
```

### Step 1: Calculate Splits
```
total_lines / 1000 = N sub-agents (round up)
```

### Step 2: Launch Parallel Sub-Agents
Each sub-agent receives this EXACT instruction via Task tool (subagent_type: general-purpose):

```
You are ATHENA content miner. Extract COMPLETE WORD-FOR-WORD transcriptions.

FILE: {path_to_transcript}
READ: Lines {start}-{end} (Part X of N) using Read tool with offset={start}, limit={count}

CRITICAL RULES - VIOLATION = FAILURE:
1. Extract COMPLETE WORD-FOR-WORD transcription for each moment
2. NEVER summarize. NEVER paraphrase. Copy EVERY word between timestamps.
3. Include: start timestamp, end timestamp, duration, trigger type, topic, FULL TEXT
4. Detect viral triggers from: LACUNA, QUEBRA, PICO, CONTRAINTUITIVO, TRANSFORMAÇÃO, CONTROVÉRSIA, ESPECÍFICO
5. Classify moment type from: hook, insight, story, quote, transition, b_roll_cue
6. Score using MQR dimensions:
   - H (Hook ×0.35): 5 yes/no — stops scroll? curiosity gap? challenges belief? no context needed? promises outcome? (each yes=2pts)
   - E (Emotion ×0.25): high=8-10 (awe/anger/excitement), medium=5-7 (surprise/hope/curiosity), low=1-4 (calm/bored)
   - S (Shareability ×0.25): 5 yes/no — sharer looks smart? actionable? quotable? trending topic? tag-worthy? (each yes=2pts)
   - C (Clarity ×0.15): 10=standalone, 8=one-sentence setup, 6=moderate, 4=heavy context, 2=dependent
   - Formula: impact_score = round(H×0.35 + E×0.25 + S×0.25 + C×0.15)
   - ANTI-INFLATION: avg should be 5.5-6.5. Score 10 requires H≥9 AND E≥8 AND S≥9 AND C≥8.

OUTPUT FORMAT (for each moment):
### MOMENTO [N]
- **Início:** [timestamp]
- **Fim:** [timestamp]
- **Duração:** [seconds]s
- **Tipo:** [moment type]
- **Gatilho:** [trigger type]
- **MQR:** [H{n}/E{n}/S{n}/C{n}]
- **Impact:** [calculated from MQR formula]
- **Assunto:** [2-5 word topic]

**TRANSCRIÇÃO COMPLETA:**
> [Copy the ENTIRE text word for word. Include ALL words spoken between timestamps.]

**Contexto antes:** [previous sentence]
**Contexto depois:** [next sentence]
**Speaker:** [speaker name]

Extract 8-15 HIGH-IMPACT moments from this section. QUALITY over quantity.
ONLY extract moments with:
- impact_score >= 6 (estimated during extraction)
- Clear viral trigger (lacuna, quebra, pico, etc.)
- Standalone value OR strong narrative contribution

ANTI-OVER-EXTRACTION:
- Skip filler content (score < 5)
- Skip repetitive explanations (unless new angle)
- Skip pure transitions (unless impact >= 7)
- 10 great moments > 30 mediocre ones
- Use MQR formula: avg score should be 5.5-6.5. Score 10 requires H≥9, E≥8, S≥9, C≥8

Save output to: _temp/mining/{source_slug}/parts/part_{XX}.md
```

### Step 3: Sub-Agent Outputs
Each sub-agent saves to:
```
_temp/mining/{source-slug}/parts/part_01.md
_temp/mining/{source-slug}/parts/part_02.md
...
_temp/mining/{source-slug}/parts/part_NN.md
```

### Step 4: Consolidation (CODE, not LLM)
```bash
# After all sub-agents complete, merge via script
python squads/curator/scripts/merge_mining_parts.py _temp/mining/{source-slug}/parts _temp/mining/{source-slug}/all_moments_merged.md
# Script: strips headers/summaries, extracts MOMENTO blocks, renumbers sequentially
# Output: _temp/mining/{source-slug}/all_moments_merged.md
```

### Step 5: Compact Output (CODE, not LLM)
```bash
# Generate compact {source-slug}/momentos.md (top 50 moments)
python squads/curator/scripts/generate_compact_mining.py
# Output: output/curated/{source-slug}/momentos.md
# Must be SMALLER than input transcript
```

### Large File Anti-Patterns

| NEVER DO | ALWAYS DO |
|----------|-----------|
| Read entire file in one Read call | Split into ~1000 line chunks per sub-agent |
| LLM merge of sub-agent results | Code merge (cat, append, python renumber) |
| Extract only timestamps without text | Extract timestamp + FULL TRANSCRIPTION |
| Summarize what was said | Literal word-for-word transcription |
| Approximate timestamps | EXACT timestamps from source |
| Dump all files in flat _temp/mining/ | Organize in _temp/mining/{source-slug}/ |
| Output larger than input | Compact output MUST be smaller than transcript |
| Extract 200+ moments from 4h content | 80-120 moments max, top 50 in compact output |
| Score inflation (everything is 9-10) | Use MQR formula: avg 5.5-6.5, recalibrate if >7.5 |

---

## Passes (ATHENA-MEK + Paper Edit Merged)

### PASS 1: Anchor Table (Temporal Anchoring)
**Duration:** 2-5 min
**Mode:** Systematic block-by-block scan
**Origin:** ATHENA-MEK Pass 1

```yaml
steps:
  - step: 1.1
    action: "Verify transcript has timestamps"
    if_missing: "Estimate from word count (~150 words/min)"
    output: "Timestamped transcript ready for anchoring"

  - step: 1.2
    action: "Identify speaker changes"
    note: "Mark each speaker if multi-speaker content"

  - step: 1.3
    action: "Note total duration, structure, and calculate minimums"
    calculations:
      total_duration_seconds: "Convert last timestamp to seconds"
      minimum_moments: "total_duration_seconds / 180"
      quartile_boundaries: "Divide duration into 4 equal parts"

  - step: 1.4
    action: "Build mental Anchor Table mapping"
    note: >-
      For each WebVTT/SRT block: note block ID, timestamp, speaker.
      This creates the reference system for all future timestamps.
      Every timestamp in output MUST trace back to a real block.
```

**Checkpoint (BLOCKING — must pass before Pass 2):**
- [ ] Transcript has timestamps (exact or estimated)
- [ ] Speaker attribution complete
- [ ] Total duration known
- [ ] minimum_moments calculated (duration_seconds / 180)
- [ ] Quartile boundaries defined (Q1: 0-25%, Q2: 25-50%, Q3: 50-75%, Q4: 75-100%)

---

### PASS 2: Extraction (Tag + Score + Trigger)
**Duration:** 5-15 min
**Mode:** Full read-through with multi-layer tagging
**Origin:** ATHENA-MEK Pass 2 + Paper Edit Phase 2

```yaml
steps:
  - step: 2.1
    action: "Read through ENTIRE transcript without stopping"
    purpose: "Get feel for flow, energy, topic changes, emotional peaks"

  - step: 2.2
    action: "Second pass: tag each segment by MOMENT TYPE"
    reference: "squads/curator/data/moment-types.yaml"
    types:
      hook: "Attention-grabbing: counter-intuitive, big promise, curiosity gap, controversy"
      insight: "Valuable info: framework, data point, cause-effect, pattern revelation"
      story: "Narrative with arc: personal anecdote, case study, before/after"
      quote: "Quotable standalone: memorable phrasing, universal truth, contrarian take"
      transition: "Natural bridge: topic change, recap, question pivot, callback"
      b_roll_cue: "Visual opportunity: data viz, demonstration, showing"

  - step: 2.3
    action: "For each moment, detect VIRAL TRIGGER"
    reference: "squads/curator/data/viral-triggers.yaml"
    triggers:
      lacuna: "Curiosity gap — information loop that needs closing"
      quebra: "Pattern break — contradicts common sense"
      pico: "Emotional peak — vulnerability, anger, confession"
      contraintuitivo: "Counter-intuitive — feels wrong but is true"
      transformacao: "Transformation arc — before/after radical change"
      controversia: "Debate catalyst — polarizing, tribal response"
      especifico: "Quantified surprise — exact numbers that shock"

  - step: 2.4
    action: "Score each moment using MQR (Moment Quality Rubric)"
    reference: "squads/curator/data/moment-quality-rubric.yaml"
    dimensions:
      H_hook_strength:
        weight: 0.35
        method: "5 yes/no × 2pts: stops scroll? curiosity gap? challenges belief? no context? promises outcome?"
      E_emotional_arousal:
        weight: 0.25
        method: "Arousal map: high=8-10 (awe/anger/excitement), medium=5-7 (surprise/hope/curiosity), low=1-4 (calm/bored)"
      S_shareability:
        weight: 0.25
        method: "5 yes/no × 2pts: makes sharer look smart? actionable? quotable? trending? tag-worthy?"
      C_standalone_clarity:
        weight: 0.15
        method: "Scale: 10=standalone, 8=one-sentence setup, 6=moderate context, 4=heavy, 2=dependent"
    formula: "impact_score = round(H × 0.35 + E × 0.25 + S × 0.25 + C × 0.15)"
    notation: "H8/E7/S9/C6 (record in mqr field)"
    anti_inflation: "Expected avg 5.5-6.5. If avg > 7.5 → STOP and recalibrate."

  - step: 2.4b
    action: "Assign tags array and notes"

  - step: 2.5
    action: "ANTI-LAZINESS CHECK"
    rule: |
      Count extracted moments so far.
      IF count < minimum_moments (from Pass 1):
        → You are being lazy. Continue mining.
        → Focus on quartiles with fewer moments.
        → Lower threshold: look for impact >= 4.
      DO NOT proceed to Pass 3 until minimum is met.
```

**Checkpoint (BLOCKING — must pass before Pass 3):**
- [ ] Every segment has a tipo
- [ ] Every segment has gatilho_viral (primary + secondary if applicable)
- [ ] Tags array populated for each moment
- [ ] Impact scores assigned (1-10)
- [ ] Anti-laziness: total moments >= minimum_moments
- [ ] Moments spread across all 4 quartiles (no quartile empty)

---

### PASS 3: Audit (Selection + Territorial Completeness)
**Duration:** 3-5 min
**Mode:** Analytical validation
**Origin:** ATHENA-MEK Pass 3 + Paper Edit Phase 3

```yaml
steps:
  - step: 3.1
    action: "Select highest-value moments"
    criteria: "impact_score >= 5 for general, >= 7 for shorts"

  - step: 3.2
    action: "Note dependencies between moments"
    format: "dependencies: [list of moment IDs this moment needs]"

  - step: 3.3
    action: "TERRITORIAL COMPLETENESS AUDIT"
    calculations:
      coverage_percent: |
        sum(all moment durations) / total_duration_seconds * 100
        TARGET: >= 40%
        ALERT IF: < 30%
      quartile_distribution: |
        Q1 (0-25% of duration): count moments in this range
        Q2 (25-50%): count
        Q3 (50-75%): count
        Q4 (75-100%): count
        TARGET: each quartile has 10-40% of total moments
        ALERT IF: any quartile < 10%
    on_alert: |
      IF coverage < 30%: Return to Pass 2, mine neglected sections.
      IF any quartile < 10%: Return to Pass 2, focus on that quartile.
      DO NOT proceed until thresholds are met.

  - step: 3.4
    action: "Rank by impact within each type"
    output: "Top hooks, top insights, top quotes, longest stories"

  - step: 3.5
    action: "Generate quality report"
    output: |
      ===== MINING QUALITY REPORT =====
      COMPLETENESS:
      - Total moments: X
      - Coverage: Y%
      - Distribution: Q1=A% | Q2=B% | Q3=C% | Q4=D%
      - Minimum required: Z (actual: X)

      PRECISION:
      - All timestamps from source: ✓/✗
      - Word-for-word transcription: ✓/✗

      BY TYPE: hooks=N | insights=N | stories=N | quotes=N | transitions=N | b_roll=N
      BY TRIGGER: lacuna=N | quebra=N | pico=N | contraintuitivo=N | transformacao=N | controversia=N | especifico=N

      STATUS: [APPROVED] or [FAILED - Fix Pass X]
      =================================
```

**Checkpoint (BLOCKING — must pass before Pass 4):**
- [ ] High-value moments selected
- [ ] Dependencies mapped
- [ ] Coverage >= 40%
- [ ] Each quartile >= 10% of moments
- [ ] Rankings calculated
- [ ] Quality report generated

---

### PASS 4: Selection & Compaction (NEW)
**Duration:** 3-5 min
**Mode:** Filter + CODE generation
**Origin:** Addresses output bloat problem

```yaml
steps:
  - step: 4.1
    action: "Select top 50 moments for compact output"
    criteria:
      method: "Quartile-balanced top-N selection (code, not manual)"
      guarantee_minimum_per_quartile: 5  # At least 5 moments per quartile
      fill_remaining: "By impact_score descending across all quartiles"
      sort_final: "Chronological (by timestamp_inicio)"
      note: |
        MQR anti-inflation means scores of 10 are nearly impossible (0-1 per transcript)
        and scores 9+ should be under 15%. The script handles quartile balance automatically.
        Do NOT manually filter by score threshold — let the script select.
    cap: 50  # Max moments in compact output

  - step: 4.2
    action: "Generate compact output via CODE"
    code: |
      python squads/curator/scripts/generate_compact_mining.py <input> <output> <source_name> <duration_sec>
      # Arguments:
      #   arg1: input file — _temp/mining/{source-slug}/all_moments_merged.md
      #   arg2: output file — output/curated/{source-slug}/momentos.md
      #   arg3: source name — human-readable (e.g. "Cohort Avancado - Aula 1")
      #   arg4: total duration in seconds (e.g. 17344)
      # Example:
      #   python squads/curator/scripts/generate_compact_mining.py _temp/mining/my-source/all_moments_merged.md output/curated/my-source/momentos.md "My Source Name" 3600
    output: "output/curated/{source-slug}/momentos.md"
    format: "Structured Markdown with YAML frontmatter"
    sections:
      - "YAML frontmatter (metadata, counts, coverage)"
      - "Metrics table"
      - "Distribution (by type and trigger)"
      - "Quick Scan table (all 50 in one scannable table)"
      - "Rankings (top hooks, insights, quotes, stories)"
      - "Full moments (50 with complete transcription)"

  - step: 4.3
    action: "Validate compact output size"
    rule: "compact output MUST be SMALLER than input transcript"
    check: |
      compact_size_kb = file_size("output/curated/{source-slug}/momentos.md")
      input_size_kb = file_size(transcript_path)
      ASSERT compact_size_kb < input_size_kb
      # Typical ratio: 10-15% of input

  - step: 4.4
    action: "Verify archive exists"
    check: "_temp/mining/{source-slug}/all_moments_merged.md contains ALL moments"
```

**Checkpoint (BLOCKING — must pass before Pass 4.5):**
- [ ] Top 50 moments selected
- [ ] {source-slug}/momentos.md generated in output/curated/
- [ ] Compact output is SMALLER than input transcript
- [ ] Quick Scan table present
- [ ] Rankings present
- [ ] Archive (all_moments_merged.md) intact in _temp/mining/{source-slug}/

---

### PASS 4.5: Transcription Correction (STT Fix)
**Duration:** 2-3 min
**Mode:** Pattern-based correction
**Purpose:** Fix speech-to-text errors in compact output transcriptions

```yaml
steps:
  - step: 4.5.1
    action: "Apply STT error corrections via CODE"
    code: |
      python squads/curator/scripts/apply_stt_corrections.py output/curated/{source-slug}/momentos.md squads/curator/data/stt-corrections.yaml --dry-run
      # Review output, then apply:
      python squads/curator/scripts/apply_stt_corrections.py output/curated/{source-slug}/momentos.md squads/curator/data/stt-corrections.yaml
    rules:
      - "ONLY fix obvious STT errors (wrong words that sound similar)"
      - "NEVER add content that doesn't exist"
      - "NEVER remove content"
      - "NEVER change meaning"
      - "Apply corrections to transcription blocks only, not metadata"
    reference: "squads/curator/data/stt-corrections.yaml"
    note: "Auto-corrections are applied by script. Contextual corrections are flagged for LLM review."

  - step: 4.5.2
    action: "Review contextual corrections flagged by script"
    rule: |
      The script flags contextual corrections (e.g. "barra" → "/" only when referring to commands).
      Review each flagged item and apply manually only when context confirms the correction.
      Patterns are defined in squads/curator/data/stt-corrections.yaml under 'contextual' key.

  - step: 4.5.3
    action: "Verify no content added or removed"
    check: "Word count per moment should be identical or within 1-2 words (only substitutions)"
```

**Checkpoint (BLOCKING — must pass before Phase 5):**
- [ ] STT patterns applied to {source-slug}/momentos.md
- [ ] No content added (word count increased)
- [ ] No content removed (word count decreased significantly)
- [ ] Meaning preserved in all transcriptions
- [ ] Only obvious sound-alike errors corrected

---

### PASS 4.6: Generate Annotated Transcript (CODE)
**Duration:** 1-2 min
**Mode:** CODE execution (Python script)
**Origin:** v2.6.0 — Full-context editor deliverable
**Purpose:** Generate full annotated transcript with KEEP/REMOVE/BRIDGE markers for editor context

```yaml
steps:
  - step: 4.6.0
    action: "Ensure raw transcript is saved"
    check: "_temp/mining/{source-slug}/transcript_raw.txt exists"
    if_missing: |
      Save the original transcript to _temp/mining/{source-slug}/transcript_raw.txt
      BEFORE proceeding. This file is required for the annotated transcript script.
    note: "If transcript was pasted (not from file), save it now."

  - step: 4.6.1
    action: "Generate annotated transcript via CODE"
    code: |
      python squads/curator/scripts/generate_annotated_transcript.py <transcript> <momentos> <output> <source_name>
      # Arguments:
      #   arg1: transcript file — _temp/mining/{source-slug}/transcript_raw.txt
      #   arg2: momentos file — output/curated/{source-slug}/momentos.md
      #   arg3: output file — output/curated/{source-slug}/transcricao_anotada.md
      #   arg4: source name — human-readable (e.g. "Cohort Avancado - Aula 1")
      # Example:
      #   python squads/curator/scripts/generate_annotated_transcript.py \
      #     _temp/mining/my-source/transcript_raw.txt \
      #     output/curated/my-source/momentos.md \
      #     output/curated/my-source/transcricao_anotada.md \
      #     "My Source Name"
    output: "output/curated/{source-slug}/transcricao_anotada.md"
    format: "Structured Markdown with YAML frontmatter + KEEP/REMOVE/BRIDGE segments"
    sections:
      - "YAML frontmatter (metadata, segment counts, parameters)"
      - "Legend (KEEP/REMOVE/BRIDGE definitions)"
      - "Annotated segments covering entire transcript timeline"
      - "Natural cut points (IN/OUT) for each KEEP segment"
      - "BRIDGE segments with full transcription text"
      - "REMOVE segments with 1-line summaries"

  - step: 4.6.2
    action: "Validate annotated transcript"
    checks:
      - "All KEEP segments map to banco de momentos moment numbers"
      - "No gaps in timeline (every second accounted for)"
      - "All KEEP segments have corte_natural_in and corte_natural_out"
      - "BRIDGE segments have full transcription text"
      - "REMOVE segments have 1-line summary"
      - "Output exists at output/curated/{source-slug}/transcricao_anotada.md"

  - step: 4.6.3
    action: "Fallback: LLM-based generation"
    when: "transcript_raw.txt not available AND transcript only in LLM context"
    note: |
      If transcript is only available as pasted text (not saved to file),
      generate the annotated transcript inline using the LLM. This is the
      FALLBACK path — Option A (script) is always preferred per CODE > LLM.
      Mark all KEEP segments with moment IDs. Use 30-second threshold for BRIDGE.
```

**Checkpoint (BLOCKING — must pass before Phase 5):**
- [ ] `{source-slug}/transcricao_anotada.md` exists in output/curated/
- [ ] All KEEP segments match banco de momentos moment numbers
- [ ] All KEEP segments have corte_natural_in and corte_natural_out
- [ ] BRIDGE segments have full transcription text
- [ ] REMOVE segments have 1-line summary
- [ ] No gaps in transcript coverage (every second accounted for)

---

### PASS 4.7: Timestamp Validation (CODE — BLOCKING)
**Duration:** 1-2 min
**Mode:** CODE execution (Python scripts)
**Origin:** v3.1.0 — Automated timestamp verification against source transcript
**Purpose:** Verify that LLM-extracted timestamps actually match the raw transcript

```yaml
steps:
  - step: 4.7.0
    action: "Ensure raw transcript exists"
    check: "_temp/mining/{source-slug}/transcript_raw.txt exists"
    if_missing: |
      If transcript was pasted or acquired from YouTube, save it NOW:
        _temp/mining/{source-slug}/transcript_raw.txt
      If transcript is unavailable: validation runs in LIMITED mode
      (internal consistency only — timestamps in order, fim > inicio).
    note: "Without transcript_raw, full validation is impossible."

  - step: 4.7.1
    action: "Run timestamp validation via CODE"
    code: |
      python squads/curator/scripts/validate_timestamps.py output/curated/{source-slug}/momentos.md --transcript _temp/mining/{source-slug}/transcript_raw.txt --tolerance 2
      # Also validate all_moments_merged if it exists:
      python squads/curator/scripts/validate_timestamps.py _temp/mining/{source-slug}/all_moments_merged.md --transcript _temp/mining/{source-slug}/transcript_raw.txt --tolerance 2
    on_fail: |
      Exit code 1 = WRONG timestamps found.
      → Review the report to identify which moments have bad timestamps.
      → Return to Pass 2 and re-extract ONLY the flagged moments.
      → Re-run validation after fix.
    on_pass: "All timestamps verified. Proceed to Phase 5."
    note: "AUTOMATED: Workflows wf-mine-to-cut and wf-longform-simple-pipeline MUST execute this script as blocking post-action. Manual execution is NOT sufficient."

  - step: 4.7.2
    action: "Run transcription validation via CODE"
    code: |
      python squads/curator/scripts/validate_transcription.py output/curated/{source-slug}/momentos.md --transcript _temp/mining/{source-slug}/transcript_raw.txt --tolerance 5
    on_fail: |
      Drift detected = transcription text doesn't match declared timestamp.
      → Report shows real timestamp vs declared.
      → Fix: update timestamp to real value, or re-extract transcription.
    note: "This script uses fuzzy matching — drifts > 5s are flagged."

  - step: 4.7.3
    action: "Validate GUIA_EDITOR files if they exist"
    code: |
      # For each GUIA_EDITOR in output/curated/{source-slug}/cortes/
      # Run validation against same transcript_raw
      for guia in output/curated/{source-slug}/cortes/**/*GUIA_EDITOR.md; do
        python squads/curator/scripts/validate_timestamps.py "$guia" --transcript _temp/mining/{source-slug}/transcript_raw.txt --tolerance 2
      done
    note: "Ensures cut scripts also have valid timestamps. Non-blocking but reported."
```

**Checkpoint (BLOCKING — must pass before Phase 5):**
- [ ] `validate_timestamps.py` exits with code 0 (no WRONG timestamps)
- [ ] `validate_transcription.py` drifts reviewed (DRIFT > 5s investigated)
- [ ] If transcript_raw unavailable: internal consistency checks pass
- [ ] GUIA_EDITOR files validated (if they exist)

---

### PHASE 5: Radio Cut (Audio Test)
**Duration:** 2-3 min
**Mode:** Mental simulation
**Origin:** Paper Edit Phase 4 (renumbered)

```yaml
steps:
  - step: 5.1
    action: "Mentally 'listen' to compact selection (top 50) in sequence"
    question: "Does this make sense as audio-only?"

  - step: 5.2
    action: "Flag moments that need visual support"
    mark_as: "b_roll_cue or add note in {source-slug}/momentos.md"

  - step: 5.3
    action: "Verify transitions are smooth in compact selection"
    check: "Does the Quick Scan table flow naturally top-to-bottom?"
```

**Checkpoint:**
- [ ] Audio-only coherence verified on compact selection
- [ ] Visual support needs flagged
- [ ] output/curated/{source-slug}/momentos.md is final deliverable

---

### PASS 6: Cleanup & Delivery Report (MANDATORY)
**Duration:** 1 min
**Mode:** Automated + report
**Purpose:** Clean temp files and TELL THE USER where deliverable is

```yaml
steps:
  - step: 6.1
    action: "Clean obsolete temp files"
    delete:
      - "_temp/mining/{source-slug}/all_moments_raw.md (duplicate of merged)"
    keep:
      - "_temp/mining/{source-slug}/parts/ (audit trail)"
      - "_temp/mining/{source-slug}/all_moments_merged.md (archive)"
      - "_temp/mining/{source-slug}/AUDIT_REPORT.md (if exists)"

  - step: 6.1b
    action: "Generate source INDEX.md (CODE)"
    code: |
      python squads/curator/scripts/generate_source_index.py {source-slug} --source-name "{source_name}" --youtube-id "{youtube_id}" --duration "{HH:MM:SS}"
      # Output: output/curated/{source-slug}/INDEX.md
    note: "Idempotent — safe to re-run. Updates existing INDEX.md."

  - step: 6.2
    action: "MANDATORY: Display delivery report to user"
    format: |
      ✅ **Mining complete.**

      **Deliverable 1:** `output/curated/{source-slug}/momentos.md`
      - {N} top moments from {TOTAL} mined
      - Coverage: {X}% | Size: {Y} KB (vs {Z} KB input)

      **Deliverable 2:** `output/curated/{source-slug}/transcricao_anotada.md`
      - Full transcript with {N} KEEP / {N} BRIDGE / {N} REMOVE segments
      - {N} natural cut points identified

      **Archive:** `_temp/mining/{source-slug}/all_moments_merged.md`
      **Index:** `output/curated/{source-slug}/INDEX.md`
      - All {TOTAL} moments (reference only)

      **Next steps:**
      1. *create-cut shorts — Criar cortes virais
      2. *create-cut longform — Criar corte longo
      3. *enrich — Adicionar dados/tendências
      4. Minerar outro transcript
    rule: "NEVER finish mining without showing this report. User MUST know where files are."
```

**Checkpoint:**
- [ ] Obsolete temp files cleaned
- [ ] Delivery report displayed to user with EXACT paths
- [ ] User knows where `output/curated/{source-slug}/momentos.md` is

---

## Quality Gate: QG-002

**BLOCKING.** Must pass before output moves to Tier 1.

Run checklist: `squads/curator/checklists/mining-quality.md`

```yaml
mandatory_checks:
  # Timestamps (from ATHENA)
  - "Every moment has timestamp_inicio AND timestamp_fim"
  - "Timestamps are EXACT (MM:SS or HH:MM:SS), not approximate"
  - "Timestamps trace to real source blocks (not invented)"
  - "Duration calculated correctly"

  # Transcription (from ATHENA)
  - "Transcription is EXACT (word for word)"
  - "No paraphrasing or summarizing"
  - "STT errors corrected (no content added/removed)"

  # Classification (merged)
  - "Every moment has tipo from valid types"
  - "Every moment has gatilho_viral from viral-triggers.yaml"
  - "Tags array populated"
  - "Impact score (1-10) assigned"

  # Context
  - "contexto_antes and contexto_depois populated"
  - "Speaker identified"

  # Structure
  - "{source-slug}/momentos.md follows template structure"
  - "Index sections complete (by type AND by trigger)"
  - "Rankings section calculated"
  - "Coverage metrics section populated"

  # ATHENA Enforcement
  - "Anti-laziness: moments >= duration_seconds / 180"
  - "Territorial coverage >= 40%"
  - "No quartile below 10% of moments"
  - "Quality report included"

quality_checks:
  - "All 4 passes/phases completed in order"
  - "All high-value moments captured (no obvious misses)"
  - "Minimum 3 hook candidates identified"
  - "At least 1 story segment captured"
  - "Editor could cut directly from this document"
  - "No ambiguous instructions in notes"
  - "At least 3 different viral triggers represented"

pass_criteria:
  mandatory: "ALL must pass (100%)"
  quality: "At least 80% must pass"

on_fail:
  - "Document which checks failed"
  - "Fix specific issues (return to relevant Pass)"
  - "Re-run checklist"
  - "Only pass to Tier 1 when criteria met"
```

---

## Output Example

Concrete example of `momentos.md` output structure (3 moments from a 60-min transcript):

```markdown
---
source: "cohort-avancado-aula1"
total_mined: 42
top_50: 42
coverage_percent: 47
extraction_date: "2026-02-18"
---

### MOMENTO 1
- **Início:** 04:12
- **Fim:** 04:38
- **Duração:** 26s
- **Tipo:** hook
- **Gatilho:** contraintuitivo
- **MQR:** H8/E7/S8/C9
- **Impact:** 8
- **Assunto:** IA substitui habilidades, não pessoas

**TRANSCRIÇÃO COMPLETA:**
> "A IA não vai substituir você. Ela vai substituir alguém que sabe usar IA melhor do que você. Isso é um ponto completamente diferente."

**Contexto antes:** Falando sobre mercado de trabalho em 2026.
**Contexto depois:** Explica que adaptação é o diferencial.
**Speaker:** Alan

---

### MOMENTO 2
- **Início:** 18:55
- **Fim:** 19:22
- **Duração:** 27s
- **Tipo:** insight
- **Gatilho:** especifico
- **MQR:** H6/E6/S7/C8
- **Impact:** 7
- **Assunto:** Taxa de conversão com cold email

**TRANSCRIÇÃO COMPLETA:**
> "Mandamos 400 cold emails. Tivemos 47 respostas positivas. Isso é 11.75% de resposta — a média do mercado é 2 a 3%. O segredo não foi o copy, foi a segmentação."

**Contexto antes:** Mostrando case real de agência de marketing.
**Contexto depois:** Detalha o processo de segmentação usado.
**Speaker:** Alan

---

### MOMENTO 3
- **Início:** 43:07
- **Fim:** 43:41
- **Duração:** 34s
- **Tipo:** story
- **Gatilho:** transformacao
- **MQR:** H7/E8/S6/C7
- **Impact:** 7
- **Assunto:** Virada de chave com produtividade

**TRANSCRIÇÃO COMPLETA:**
> "Quando eu parei de tentar otimizar meu tempo e comecei a otimizar minha energia, tudo mudou. Eu fazia 14 horas por dia e produzia menos do que hoje em 6 horas. O problema nunca foi o tempo."

**Contexto antes:** Discussão sobre burnout entre empreendedores.
**Contexto depois:** Apresenta framework de blocos de energia.
**Speaker:** Alan
```

---

## Output Format

Uses template: `squads/curator/templates/banco-momentos-tmpl.md` (compact v3.0)

Key sections:
1. **metadata** - Source, duration, speakers, extraction date, counts by type AND trigger
2. **momentos** - Each moment with full structure (timestamps, transcription, context, tags, score, gatilho_viral)
3. **coverage_metrics** - Coverage %, quartile distribution, anti-laziness validation
4. **quality_report** - ATHENA audit results
5. **indice** - Index by type AND by trigger for quick access
6. **rankings** - Top hooks, insights, quotes, longest stories, most viral

---

## Transcription Fidelity Rules (ATHENA)

```yaml
rules:
  - "Copy WORD FOR WORD from transcript blocks"
  - "NEVER alter, correct, or paraphrase"
  - "Use '...' ONLY when intentionally SKIPPING blocks"
  - "Preserve original language (do not translate)"
  - "Line breaks preserved if meaningful"

ellipsis_syntax:
  correct: '"contexto... [MOMENTO OURO]... conclusão" (blocks skipped intentionally)'
  wrong: '"contexto... [MOMENTO OURO]" (natural end, no ellipsis needed)'

block_mapping:
  description: "When extracting a moment that spans multiple blocks, list which blocks are included"
  format: "blocos_incluidos: [B055, B056, B057]"
  purpose: "Audit trail — editor can verify exact source"
```

---

## Anti-Patterns

```yaml
never_do:
  - "Approximate timestamps ('around 5 minutes', '~12:00')"
  - "Paraphrase or summarize transcription (must be EXACT)"
  - "Skip any of the 3 passes + Pass 4.5 + Pass 4.6 + Pass 4.7 + Phase 5"
  - "Leave moments without tipo AND gatilho_viral"
  - "Forget context_before/context_after"
  - "Assign scores without justification in notes"
  - "Skip the quality checklist"
  - "Stop mining before minimum_moments reached (anti-laziness)"
  - "Concentrate all moments in first quartile (territorial completeness)"
  - "Use LLM to merge sub-agent results (CODE only)"
  - "Read a >2000 line file without splitting into sub-agents"
  - "Add content during STT correction (only substitute wrong words)"
  - "Skip Pass 4.5 STT correction step"

always_do:
  - "Exact timestamps (MM:SS or HH:MM:SS)"
  - "Follow all 3 passes + Pass 4.5 + Pass 4.6 + Pass 4.7 + Phase 5 in order"
  - "Preserve exact transcription word for word"
  - "Apply STT correction patterns in Pass 4.5 (only fix sound-alike errors)"
  - "Tag every moment with tipo AND gatilho_viral"
  - "Include context for editor understanding"
  - "Score via MQR (H/E/S/C) → impact_score, record compact notation"
  - "Calculate and report coverage % and quartile distribution"
  - "Check anti-laziness minimum before finishing"
  - "Run mining-quality.md before delivery"
  - "For >2000 lines: split into parallel sub-agents"
```

---

## Handoff

```yaml
on_complete:
  pass_to: "curator-chief"
  deliver:
    - "{source-slug}/momentos.md"
    - "{source-slug}/transcricao_anotada.md"
  context: "Mining complete with {n} moments. Coverage: {x}%. Top hooks: #{ids}. Annotated transcript with {k} KEEP / {b} BRIDGE / {r} REMOVE segments. Ready for narrative."
  next_gate: "QG-002 passed"

alternative_handoffs:
  - to: "ken-burns"
    when: "Documentary narrative needed"
  - to: "walter-murch"
    when: "Complex multi-thread assembly needed"
  - to: "matthew-dicks"
    when: "Transformation story focus"
```

---

## Veto Conditions (BLOCKING)

| ID | Condition | Detection | Action |
|----|-----------|-----------|--------|
| VETO-01 | No transcript provided or file not found | Input is empty, null, or path does not exist on disk | BLOCK — ask user to provide transcript before proceeding |
| VETO-02 | Transcript shorter than 5 minutes of content | Word count < 750 words OR last timestamp < 05:00 | BLOCK — insufficient content for meaningful moment extraction |
| VETO-03 | Source language not identifiable | First 200 words contain no recognizable language patterns | BLOCK — cannot guarantee word-for-word transcription fidelity without language detection |

---

## Dependencies

| Type | File | When Used |
|------|------|-----------|
| Template | `templates/banco-momentos-tmpl.md` | Compact output structure (v3.0) |
| Template | `templates/transcricao-anotada-tmpl.md` | Annotated transcript structure (v1.0) |
| Checklist | `checklists/mining-quality.md` | QG-002 validation |
| Data | `data/moment-types.yaml` | Moment type classification |
| Data | `data/viral-triggers.yaml` | Viral trigger detection |
| Data | `data/moment-quality-rubric.yaml` | MQR scoring dimensions + formula |
| Script | `squads/curator/scripts/generate_annotated_transcript.py` | Pass 4.6 annotated transcript generation |
| Script | `squads/curator/scripts/validate_timestamps.py` | Pass 4.7 timestamp validation |
| Script | `squads/curator/scripts/validate_transcription.py` | Pass 4.7 transcription drift detection |
| Script | `squads/curator/scripts/_validation_common.py` | Shared parsing for validation scripts |
| Script | `squads/curator/scripts/generate_source_index.py` | Pass 6 INDEX.md generation |
| Script | `squads/curator/scripts/merge_mining_parts.py` | Step 4 part consolidation |
| Script | `squads/curator/scripts/apply_stt_corrections.py` | Pass 4.5 STT correction |
| Data | `data/stt-corrections.yaml` | STT correction patterns |

---

## Usage

```bash
# Via curator-chief
@curator:curator-chief
*mine [paste transcript here]

# Direct agent activation
@curator:content-miner-pro
*mine [paste transcript here]

# With focus on specific types
*mine [transcript] --focus hooks,stories

# For shorts-optimized extraction
*mine [transcript] --target shorts
```

---

_Task Version: 3.0.0_
_Agent: content-miner-pro_
_Quality Gate: QG-002 (blocking)_
_Methodology: ATHENA-MEK v2.0 (3 passes + Radio Cut) + Large File Protocol_
