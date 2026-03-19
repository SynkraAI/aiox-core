# Output Quality Checklist

**Purpose:** Validate final `roteiro_corte.yaml` before delivery to editor
**Used by:** curator-chief, mrbeast
**Gate:** QG-004

---

## Mandatory Checks (ALL must pass)

### 1. File Structure
- [ ] `roteiro_corte.yaml` exists
- [ ] File follows template structure
- [ ] Metadata section complete

### 2. Timestamps
- [ ] ALL timestamps are EXACT (match `banco_momentos` source)
- [ ] Format is consistent (MM:SS or HH:MM:SS)
- [ ] No "approximately" or "around" timestamps
- [ ] `timestamp_inicio` and `timestamp_fim` present for every moment

### 3. Transcriptions
- [ ] ALL transcriptions are EXACT (word for word)
- [ ] Not paraphrased or summarized
- [ ] Preserves original speaker phrasing
- [ ] No text was INVENTED (all content from source material)

### 4. Assembly Order
- [ ] Assembly order (`ordem_montagem`) is sequential
- [ ] Order is clear and unambiguous
- [ ] Every entry has explicit position number

### 5. Moment Fields
- [ ] Every moment has `tipo` assigned
- [ ] Every moment has `timestamp_inicio`
- [ ] Every moment has `timestamp_fim`
- [ ] Every moment has `transcricao`

### 6. Editor Instructions
- [ ] Editor instructions (`instrucoes_editor`) section complete
- [ ] Instructions are actionable (not vague)
- [ ] Technical requirements specified (resolution, aspect ratio if applicable)

### 7. Transitions
- [ ] Transitions between ALL non-adjacent moments identified
- [ ] Transition type specified (cut, dissolve, narration bridge, B-roll, text)
- [ ] No unexplained jumps in timeline

### 8. Source Integrity
- [ ] No text was INVENTED (all content from source material)
- [ ] Every claim traceable to specific moment in `banco_momentos`
- [ ] No creative additions disguised as source content

---

## Quality Checks (Should pass)

### Platform Optimization
- [ ] Hooks optimized for target platform
- [ ] Platform-specific adaptations noted (aspect ratio, duration limits)
- [ ] Retention tactics included (cuts, zoom, text overlay)
- [ ] Pacing appropriate for format (shorts vs longform)

### Curadoria
- [ ] Curadoria items have verified sources
- [ ] External data points are accurate and cited
- [ ] Integration points clearly marked in timeline

### Completeness
- [ ] Summary section (`sumario`) complete with counts and structure
- [ ] Total duration calculated and within target range
- [ ] Pre-delivery checklist embedded in file

### Usability
- [ ] Editor could cut directly from this document
- [ ] No ambiguous instructions
- [ ] Notes explain non-obvious editorial choices

---

## Pass Criteria

**QG-004 PASS requires:**
- ALL mandatory checks ✓
- At least 75% of quality checks ✓

**If FAIL:**
1. Identify which check failed
2. Fix the specific issues
3. Re-validate checklist
4. Only deliver to editor when all mandatory checks pass

---

## Scoring

| Category | Items | Points Each | Max |
|----------|-------|-------------|-----|
| **Mandatory: File Structure** | 3 items | 2 pts | 6 |
| **Mandatory: Timestamps** | 4 items | 2 pts | 8 |
| **Mandatory: Transcriptions** | 4 items | 2 pts | 8 |
| **Mandatory: Assembly Order** | 3 items | 2 pts | 6 |
| **Mandatory: Moment Fields** | 4 items | 2 pts | 8 |
| **Mandatory: Editor Instructions** | 3 items | 2 pts | 6 |
| **Mandatory: Transitions** | 3 items | 2 pts | 6 |
| **Mandatory: Source Integrity** | 3 items | 2 pts | 6 |
| **Quality: Platform Optimization** | 4 items | 1 pt | 4 |
| **Quality: Curadoria** | 3 items | 1 pt | 3 |
| **Quality: Completeness** | 3 items | 1 pt | 3 |
| **Quality: Usability** | 3 items | 1 pt | 3 |
| **Total** | **40 items** | | **67** |

### Thresholds
- **Pass:** >= 54 points (mandatory) + >= 10/13 quality points = **>= 64 total** (mandatory perfect + 75% quality)
- **Excellent:** >= 64 points (96%) — all mandatory + nearly all quality
- **Fail:** < 54 mandatory points → **BLOCK** (any mandatory item failed = automatic block regardless of total)

> **Note:** Mandatory items are non-negotiable. A score of 67/67 with one mandatory miss is still a FAIL. Mandatory section must score 54/54 to pass the gate.

---

## Edge Cases

### Case: Target format not specified by user
**Signal:** The `roteiro_corte.yaml` is being produced but no target platform or format was specified (shorts, longform, podcast clip, etc.). Platform Optimization quality checks cannot be properly evaluated.
**Action:** Do NOT guess the format. Before completing the output: (1) Check if format was specified in the story/briefing — if so, use that. (2) Check if `narrative_structure.yaml` metadata contains format hints. (3) If neither exists, produce the output in a **platform-agnostic** format: include all moments with full timestamps and transcriptions, but leave platform-specific fields (aspect ratio, duration limits, retention tactics) as `TBD_format_required`. Add a `format_pending` flag to metadata.
**Threshold:** Platform Optimization quality section (4 points) is excluded from scoring when format is unspecified. Adjusted quality threshold: >= 7/9 remaining quality points. All mandatory checks apply unchanged.

### Case: Source has poor audio quality (gaps in transcript)
**Signal:** Transcript has `[inaudible]`, `[unclear]`, or blank gaps where audio quality prevented transcription. These gaps may fall within selected moments.
**Action:** For each affected moment: (1) Mark the gap explicitly in `transcricao` field — never fill gaps with guessed content. (2) Add `audio_gap: true` flag to the moment. (3) In `instrucoes_editor`, note the gap location and suggest handling (text overlay, skip segment, re-record narration bridge). (4) If the gap is in a critical moment (hook, climax), flag for curator-chief review — the moment may need to be replaced.
**Threshold:** Source Integrity mandatory checks still apply — `[inaudible]` markers are acceptable as they represent honest transcription. Transcription checks pass if the audible portions are exact. Quality Usability check requires that gap-handling instructions are clear enough for the editor.

### Case: Content requires heavy contextualization for audience
**Signal:** Source material assumes audience knowledge that the target audience does not have (e.g., insider jargon, references to previous episodes, technical concepts). The `roteiro_corte.yaml` would be incomprehensible without added context.
**Action:** Contextualization must be clearly separated from source content. In `roteiro_corte.yaml`: (1) Add `contextualization` blocks between moments — these are editor instructions for narration bridges, text overlays, or intro segments. (2) Every contextualization block must be explicitly marked as `type: added_context` (not source material). (3) Source Integrity checks verify that added context is never mixed into `transcricao` fields.
**Threshold:** All mandatory checks apply. Source Integrity is the critical gate — added context must never be disguised as source transcription. Transitions mandatory check benefits from contextualization blocks (they serve as bridges). Quality Usability threshold is stricter: ALL 3 usability items must pass (editor needs extra clarity when context is layered).

### Case: Output exceeds platform limits (too long for shorts, etc.)
**Signal:** The assembled `roteiro_corte.yaml` total duration exceeds the target platform's limits (e.g., > 60s for YouTube Shorts, > 90s for Instagram Reels, > 10min for a "quick tip" longform).
**Action:** Do NOT silently trim content. Options: (1) Return to narrative phase and request a tighter selection — identify which moments can be cut with least narrative damage. (2) Split into multiple outputs (Part 1, Part 2) if the content warrants a series. (3) If slightly over limit (< 10% excess), flag for editor with `duration_warning` and let them make the cut decision. In all cases, add `target_duration`, `actual_duration`, and `duration_delta` fields to metadata.
**Threshold:** Completeness quality check ("total duration within target range") automatically fails. If within 10% overage, remaining quality checks proceed normally and output can pass with curator-chief acknowledgment. If over 10%, this is a **BLOCK** — return to narrative phase for re-selection before delivery.
