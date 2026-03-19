# Mining Quality Checklist v2.5

**Purpose:** Validate mining output before passing to Tier 1
**Used by:** content-miner-pro
**Gate:** QG-002
**Methodology:** ATHENA-MEK v2.0 + Paper Edit

---

## Completeness Tiering

> Adapted from ETL completeness-check pattern. Not all checks are equal.

| Tier | Criticality | Threshold | Failure Impact |
|------|-------------|-----------|----------------|
| **Tier 1** (Critical) | BLOCKING — pipeline stops | 100% must pass | Cannot proceed to Tier 1 narrative |
| **Tier 2** (Important) | WARNING — documented, proceed with caution | 80% must pass | Reduced output quality |
| **Tier 3** (Quality) | ADVISORY — nice to have | 60% should pass | Minor quality degradation |

**Tier 1 = Sections 1-9 below (Mandatory Checks)**
**Tier 2 = Methodology + Completeness (Quality Checks)**
**Tier 3 = Usability (Quality Checks)**

---

## Mandatory Checks — TIER 1 (ALL must pass — 0 tolerance)

### 1. Timestamps (5 items)
- [ ] Every moment has `timestamp_inicio`
- [ ] Every moment has `timestamp_fim`
- [ ] Timestamps are exact (MM:SS or HH:MM:SS)
- [ ] No "approximately" or "around" timestamps
- [ ] Duration calculated correctly (fim - inicio = duracao_segundos)

### 2. Transcription (4 items)
- [ ] Transcription is EXACT (word for word)
- [ ] Not paraphrased or summarized
- [ ] Preserves original speaker phrasing
- [ ] Line breaks preserved if meaningful

### 3. Classification (5 items)
- [ ] Every moment has `tipo` assigned
- [ ] Type is valid (hook, insight, story, quote, transition, b_roll_cue)
- [ ] Every moment has `gatilho_viral` assigned
- [ ] Trigger is valid (lacuna, quebra, pico, contraintuitivo, transformacao, controversia, especifico)
- [ ] Tags array populated

### 4. Scoring — MQR (5 items)
- [ ] Every moment has MQR compact notation (H{n}/E{n}/S{n}/C{n})
- [ ] Impact score derived from MQR formula: round(H×0.35 + E×0.25 + S×0.25 + C×0.15)
- [ ] Sub-scores are internally consistent (H, E, S, C each 1-10)
- [ ] Batch average impact_score is between 5.5-6.5 (anti-inflation guard)
- [ ] Notes explain scoring rationale for H, E, S, or C outliers

### 5. Context (4 items)
- [ ] `contexto_antes` populated
- [ ] `contexto_depois` populated
- [ ] Speaker identified (for multi-speaker)
- [ ] Dependencies noted if applicable

### 6. Structure (5 items)
- [ ] `{source-slug}/momentos.md` follows template v3.0
- [ ] Metadata section complete (includes por_tipo AND por_gatilho)
- [ ] Index section updated (por_tipo AND por_gatilho)
- [ ] Rankings calculated (includes gatilho and most_viral)
- [ ] Coverage metrics section populated

### 7. ATHENA Enforcement (4 items) — CRITICAL
- [ ] **Anti-laziness:** total moments >= `duracao_total_segundos / 180`
- [ ] **Territorial coverage:** `soma_duracoes / duracao_total >= 40%`
- [ ] **Quartile distribution:** no quartile below 10% of total moments
- [ ] **Quality report** section included in output

### 8. Timestamp Validation — CODE (4 items) — CRITICAL
- [ ] `validate_timestamps.py` passes with exit code 0 (no WRONG timestamps)
- [ ] `validate_transcription.py` drifts reviewed (no unresolved DRIFT > 5s)
- [ ] If transcript_raw unavailable: internal consistency checks pass (timestamps in order, fim > inicio)
- [ ] Cross-YAML consistency verified (`validate_cross_yaml.py`) when multiple cuts exist for same source

### 9. Annotated Transcript (6 items)
- [ ] `{source-slug}/transcricao_anotada.md` exists in `output/curated/`
- [ ] All KEEP segments match banco de momentos moment numbers
- [ ] All KEEP segments have `corte_natural_in` and `corte_natural_out`
- [ ] BRIDGE segments have full transcription text
- [ ] REMOVE segments have 1-line summary
- [ ] No gaps in transcript coverage (every second accounted for)

### 10. Cut Configuration Quality (7 items)
- [ ] Duration recommendation shows beat-by-beat breakdown
- [ ] Platform sweet spot alignment indicated with confidence level
- [ ] Style preset affects measurable parameters (not just a label)
- [ ] Multi-variant: each variant uses different hook
- [ ] Multi-variant: comparison summary generated
- [ ] User confirmed configuration before cut generation
- [ ] No hardcoded duration values (15/30/60) in output

---

## Quality Checks — TIER 2 (Should pass — 80% threshold)

### Methodology (8 items) — TIER 2
- [ ] Pass 1 (Anchor/Timestamp) completed
- [ ] Pass 2 (Extraction/Tagging + MQR scoring) completed
- [ ] Pass 3 (Audit/Territorial completeness) completed
- [ ] Pass 4 (Selection & Compaction — top 50 via script) completed
- [ ] Pass 4.5 (STT Correction — fix speech-to-text errors) completed
- [ ] Pass 4.6 (Generate Annotated Transcript — CODE, Python script) completed
- [ ] Pass 4.7 (Timestamp Validation — CODE, BLOCKING) completed
- [ ] Phase 5 (Radio Cut — audio coherence test) completed
- [ ] Pass 6 (Cleanup & Delivery Report — paths communicated, both deliverables listed) completed

### Completeness (5 items) — TIER 2
- [ ] All high-value moments captured
- [ ] No obvious moments missed in any quartile
- [ ] Hook candidates identified (minimum 3)
- [ ] At least 1 story segment captured
- [ ] At least 3 different viral triggers represented

### Usability (3 items) — TIER 3 (Advisory)
- [ ] Editor could cut directly from this document
- [ ] No ambiguous instructions
- [ ] Notes explain non-obvious choices

---

## Pass Criteria

**QG-002 PASS requires:**
- **TIER 1 (Critical):** ALL mandatory checks ✓ (49/49) — 0 tolerance, BLOCKING
- **TIER 2 (Important):** At least 80% of methodology + completeness checks ✓ (11/13)
- **TIER 3 (Advisory):** At least 60% of usability checks ✓ (2/3) — non-blocking

**If TIER 1 FAIL:**
1. **BLOCK** — cannot proceed to Tier 1 narrative
2. Document which checks failed
3. Identify which Pass needs re-execution
4. Fix the specific issues
5. Re-run checklist
6. Only pass to Tier 1 when ALL Tier 1 checks pass

**If TIER 2 FAIL (but TIER 1 passes):**
1. Document which quality checks failed
2. Assess impact on downstream quality
3. Fix if possible, or document as known limitation
4. May proceed with documented quality debt

**If TIER 3 FAIL (but TIER 1+2 pass):**
1. Note in quality report
2. Proceed — these are polish items
3. Address in next iteration if time permits

---

## Scoring

| Category | Items | Points Each | Max |
|----------|-------|-------------|-----|
| **Mandatory: Timestamps** | 5 items | 2 pts | 10 |
| **Mandatory: Transcription** | 4 items | 2 pts | 8 |
| **Mandatory: Classification** | 5 items | 2 pts | 10 |
| **Mandatory: Scoring (MQR)** | 5 items | 2 pts | 10 |
| **Mandatory: Context** | 4 items | 2 pts | 8 |
| **Mandatory: Structure** | 5 items | 2 pts | 10 |
| **Mandatory: ATHENA Enforcement** | 4 items | 2 pts | 8 |
| **Mandatory: Timestamp Validation** | 4 items | 2 pts | 8 |
| **Mandatory: Annotated Transcript** | 6 items | 2 pts | 12 |
| **Mandatory: Cut Configuration** | 7 items | 2 pts | 14 |
| **Quality: Methodology** | 8 items | 1 pt | 8 |
| **Quality: Completeness** | 5 items | 1 pt | 5 |
| **Quality: Usability** | 3 items | 1 pt | 3 |
| **Total** | **65 items** | | **114** |

### Thresholds
- **Pass:** >= 98 mandatory points + >= 13/16 quality points = **>= 111 total**
- **Excellent:** >= 111 points (97%) — all mandatory + nearly all quality
- **Fail:** < 98 mandatory points → **BLOCK** (any mandatory item failed = automatic block)

> **Note:** Mandatory items are non-negotiable. The ATHENA Enforcement section (anti-laziness, coverage, quartiles, quality report) is MANDATORY, not optional.

---

## Edge Cases

### Case: Empty or very short transcript (< 5 minutes)
**Signal:** Source under 5 minutes, fewer than 3 extractable moments.
**Action:** Flag as `low_density: true`. Complete mining with available material. Skip anti-laziness minimum check (document why). Quality completeness threshold reduced to 50%.
**Threshold:** All other mandatory checks apply fully.

### Case: Multiple speakers with no identification
**Signal:** Multiple voices, no speaker labels.
**Action:** Label as `Speaker_A`, `Speaker_B`. Add `speaker_unverified: true`. Pass criteria unchanged but annotate in metadata.

### Case: Non-Portuguese / mixed language
**Signal:** Content in other language or code-switching.
**Action:** Preserve ORIGINAL language exactly (never translate during mining). Add `language` field per moment. Tags include `lang:en` or `lang:mixed` where applicable.

### Case: Transcript with no timestamps
**Signal:** No timestamp data available.
**Action:** **BLOCKER.** Attempt recovery: re-transcribe, cross-reference audio, alignment tools. If unrecoverable, escalate to curator-chief for waiver. Cannot pass QG-002 without timestamps.

### Case: Transcript > 2000 lines
**Signal:** Large file that exceeds Read tool limits.
**Action:** Execute Large File Protocol from mine-transcript.md. Split into ~1000 line chunks, process with parallel sub-agents, consolidate via code. All mandatory checks still apply to consolidated output.
