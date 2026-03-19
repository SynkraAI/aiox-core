---
task-id: resume-mining
name: Resume Interrupted Mining
agent: content-miner-pro
version: 1.0.0
purpose: Resume interrupted mining operation from checkpoint (partial sub-agent outputs)

workflow-mode: interactive
elicit: true
elicitation-type: guided
execution_type: Hybrid
responsible_executor: content-miner-pro

action_items:
  - "Scan _temp/mining/{source-slug}/parts/ for existing partial outputs"
  - "Calculate total chunks needed and identify missing/failed chunks"
  - "Re-mine missing chunks using same prompt template as mine-transcript.md"
  - "Merge all parts via squads/curator/scripts/merge_mining_parts.py (CODE, not LLM)"
  - "Run full validation pipeline (Pass 4 through Pass 6)"
  - "Generate delivery report with exact file paths"

acceptance_criteria:
  - "Checkpoint state correctly detected from _temp/mining/{source-slug}/parts/"
  - "Missing chunks identified and re-mined (or explicitly skipped with justification)"
  - "momentos.md generated in output/curated/{source-slug}/ with all moments (existing + new)"
  - "transcricao_anotada.md generated in output/curated/{source-slug}/"
  - "Quality metrics pass: anti-laziness, territorial coverage >= 40%, quartile distribution"
  - "Timestamp validation passes (validate_timestamps.py exit code 0)"
  - "Mining quality checklist passes (mandatory 100%, quality 80%)"
  - "Delivery report shown with exact file paths of all deliverables"

prerequisites:
  - Original transcript file (_temp/mining/{source-slug}/transcript_raw.txt)
  - Existing _temp/mining/{source-slug}/parts/ directory with partial outputs
  - Optional: output/curated/{source-slug}/momentos.md from previous attempt

inputs:
  - name: source_slug
    type: string
    description: Source slug identifier (e.g. "cohort-avancado-aula1")
    required: true
  - name: transcript_path
    type: file_path
    description: Path to raw transcript file
    required: true
    default: "_temp/mining/{source-slug}/transcript_raw.txt"
  - name: force_remine
    type: boolean
    description: Re-mine all chunks (ignore existing parts)
    required: false
    default: false

outputs:
  - path: "output/curated/{source-slug}/momentos.md"
    description: Complete compact mining output (top 50 moments)
    format: markdown
  - path: "output/curated/{source-slug}/transcricao_anotada.md"
    description: Annotated transcript with KEEP/REMOVE/BRIDGE markers
    format: markdown
  - path: "_temp/mining/{source-slug}/all_moments_merged.md"
    description: All moments merged archive
    format: markdown

dependencies:
  tasks:
    - mine-transcript.md
  scripts:
    - squads/curator/scripts/generate_compact_mining.py
    - squads/curator/scripts/generate_annotated_transcript.py
    - squads/curator/scripts/validate_timestamps.py
    - squads/curator/scripts/validate_transcription.py
  checklists:
    - checklists/mining-quality.md

veto_conditions:
  - id: VETO-01
    condition: "No previous mining state found"
    detection: "_temp/mining/{source-slug}/parts/ directory does not exist or contains zero part files"
    action: "BLOCK — use *mine instead; resume-mining requires an existing partial mining session to continue"
  - id: VETO-02
    condition: "Previous mining corrupted (missing parts/)"
    detection: "parts/ directory exists but all part files are empty (< 10 lines each) or contain no MOMENTO blocks"
    action: "BLOCK — corruption detected; start a fresh mining session with *mine rather than resuming corrupt data"
  - id: VETO-03
    condition: "Source transcript changed since last mining"
    detection: "transcript_raw.txt file size or last-modified timestamp differs significantly from when parts were created AND existing parts reference timestamps not present in current transcript"
    action: "BLOCK — transcript mismatch; resuming would produce inconsistent moments; start fresh with *mine on the current transcript"
---

# resume-mining

---

## Overview

Resumes an interrupted mining operation by detecting which sub-agent chunks were already processed and continuing from where it left off. Essential for large transcripts (>2000 lines) processed via the Large File Protocol, where individual sub-agent tasks may fail or timeout.

**Use cases:**
- Mining was interrupted (crash, timeout, context limit)
- Sub-agent failed on specific chunk(s)
- Partial mining needs completion after session break
- User wants to re-mine specific chunks with different parameters

**Inputs:**
- Source slug identifying the mining session
- Raw transcript file
- Existing partial outputs in `_temp/mining/{source-slug}/parts/`

**Outputs:**
- Continues mining for missing chunks
- Merges all parts into complete output
- Runs full validation pipeline (Pass 4 through Pass 6)

---

## Phase 1: Discovery — Assess Current State

**Executor:** Worker
**Duration:** ~1-2 min

```yaml
steps:
  - step: 1.1
    action: "Scan _temp/mining/{source-slug}/parts/ for existing part files"
    collect:
      - existing_parts: "List of part_XX.md files found"
      - part_line_counts: "Line count per part (detect empty/corrupt)"
      - part_moment_counts: "Number of MOMENTO blocks per part"

  - step: 1.2
    action: "Calculate total chunks needed"
    code: |
      # Count total lines in transcript
      wc -l _temp/mining/{source-slug}/transcript_raw.txt
      # Calculate: total_lines / 1000 = N chunks (round up)
    output: "total_chunks_needed"

  - step: 1.3
    action: "Identify missing/failed chunks"
    logic: |
      missing = []
      for i in range(1, total_chunks_needed + 1):
        part_file = f"part_{i:02d}.md"
        if part_file not in existing_parts:
          missing.append(i)
        elif line_count(part_file) < 10:
          missing.append(i)  # Too short = likely failed
    output: "missing_chunks list"

  - step: 1.4
    action: "Check for existing merged/compact output"
    check:
      - "_temp/mining/{source-slug}/all_moments_merged.md exists?"
      - "output/curated/{source-slug}/momentos.md exists?"
      - "output/curated/{source-slug}/transcricao_anotada.md exists?"
```

**Checkpoint (BLOCKING):**
- [ ] Transcript raw file exists and is readable
- [ ] Parts directory scanned
- [ ] Missing chunks identified
- [ ] Total chunks calculated

---

## Phase 2: Elicitation — Confirm Resume Strategy

**Executor:** Human (interactive)

```
🔄 Resume Mining: {source-slug}

Detected partial mining:
  • Total chunks needed: {total_chunks}
  • Already mined: {completed_count}/{total_chunks} ({percentage}%)
  • Missing/failed: {missing_count} chunks ({missing_list})
  • Existing moments: ~{existing_moment_count}

Resume options:
1. Continue with {missing_count} missing chunks only (Recommended)
2. Re-mine failed chunks + validate existing
3. Re-mine everything (fresh start, delete existing parts)
4. Skip to consolidation (use existing parts as-is)

Enter choice (1-4):
```

---

## Phase 3: Execute Missing Chunks

**Executor:** Agent (parallel sub-agents)
**Duration:** ~2-5 min per chunk

```yaml
steps:
  - step: 3.1
    action: "Calculate line ranges for missing chunks"
    logic: |
      for chunk_id in missing_chunks:
        start_line = (chunk_id - 1) * 1000
        end_line = min(chunk_id * 1000, total_lines)
        # Launch sub-agent with these boundaries

  - step: 3.2
    action: "Launch parallel sub-agents for missing chunks"
    method: "Same as mine-transcript.md Large File Protocol Step 2"
    note: |
      Use EXACT same prompt template as mine-transcript.md to ensure
      consistent output format between resumed and original chunks.
    output: "_temp/mining/{source-slug}/parts/part_{XX}.md per chunk"

  - step: 3.3
    action: "Validate new chunk outputs"
    checks:
      - "Each new part has >= 5 MOMENTO blocks"
      - "Each part has valid timestamps (MM:SS or HH:MM:SS)"
      - "Each part has MQR scores"
      - "No empty or corrupt files"
    on_fail: |
      If a chunk fails again:
      1. Log the failure with error details
      2. Offer: retry once more OR skip chunk (with coverage impact noted)
      3. If skipped: document in quality report as gap
```

**Checkpoint (BLOCKING):**
- [ ] All missing chunks processed (or explicitly skipped with justification)
- [ ] New part files saved to `_temp/mining/{source-slug}/parts/`
- [ ] Each new part has valid MOMENTO blocks

---

## Phase 4: Consolidation & Validation Pipeline

**Executor:** Worker + Agent
**Duration:** ~5-10 min

```yaml
steps:
  - step: 4.1
    action: "Merge all parts (CODE, not LLM)"
    code: |
      python squads/curator/scripts/merge_mining_parts.py \
        _temp/mining/{source-slug}/parts \
        _temp/mining/{source-slug}/all_moments_merged.md

  - step: 4.2
    action: "Generate compact output (Pass 4 from mine-transcript.md)"
    code: |
      python squads/curator/scripts/generate_compact_mining.py \
        _temp/mining/{source-slug}/all_moments_merged.md \
        output/curated/{source-slug}/momentos.md \
        "{source_name}" \
        {duration_seconds}

  - step: 4.3
    action: "Apply STT corrections (Pass 4.5)"
    code: |
      python squads/curator/scripts/apply_stt_corrections.py \
        output/curated/{source-slug}/momentos.md \
        squads/curator/data/stt-corrections.yaml

  - step: 4.4
    action: "Generate annotated transcript (Pass 4.6)"
    code: |
      python squads/curator/scripts/generate_annotated_transcript.py \
        _temp/mining/{source-slug}/transcript_raw.txt \
        output/curated/{source-slug}/momentos.md \
        output/curated/{source-slug}/transcricao_anotada.md \
        "{source_name}"

  - step: 4.5
    action: "Run timestamp validation (Pass 4.7 — BLOCKING)"
    code: |
      python squads/curator/scripts/validate_timestamps.py \
        output/curated/{source-slug}/momentos.md \
        --transcript _temp/mining/{source-slug}/transcript_raw.txt \
        --tolerance 2
    on_fail: "Fix flagged timestamps, re-run"

  - step: 4.6
    action: "Run transcription validation"
    code: |
      python squads/curator/scripts/validate_transcription.py \
        output/curated/{source-slug}/momentos.md \
        --transcript _temp/mining/{source-slug}/transcript_raw.txt \
        --tolerance 5

  - step: 4.7
    action: "Generate source INDEX.md"
    code: |
      python squads/curator/scripts/generate_source_index.py \
        {source-slug} \
        --source-name "{source_name}" \
        --duration "{HH:MM:SS}"

  - step: 4.8
    action: "Run mining-quality.md checklist"
    checklist: "squads/curator/checklists/mining-quality.md"
    pass_criteria: "All mandatory (100%) + quality (80%)"
```

**Checkpoint (BLOCKING):**
- [ ] all_moments_merged.md generated
- [ ] momentos.md generated (compact, < input size)
- [ ] transcricao_anotada.md generated
- [ ] validate_timestamps.py passes (exit code 0)
- [ ] mining-quality.md checklist passes

---

## Phase 5: Delivery Report

**Executor:** Agent
**Duration:** ~1 min

```yaml
steps:
  - step: 5.1
    action: "Display delivery report (MANDATORY)"
    format: |
      🔄 **Mining resumed and complete.**

      **Resumed:** {missing_count} chunks re-mined, {skipped_count} skipped
      **Total:** {total_moments} moments from {total_chunks} chunks

      **Deliverable 1:** `output/curated/{source-slug}/momentos.md`
      - {N} top moments | Coverage: {X}% | Size: {Y} KB

      **Deliverable 2:** `output/curated/{source-slug}/transcricao_anotada.md`
      - {K} KEEP / {B} BRIDGE / {R} REMOVE segments

      **Archive:** `_temp/mining/{source-slug}/all_moments_merged.md`
      **Index:** `output/curated/{source-slug}/INDEX.md`

      **Validation:**
      - Timestamps: ✅ validated
      - Quality checklist: ✅ passed ({score}/114)

      **Next steps:**
      1. *create-cut shorts — Create viral cuts
      2. *create-cut longform — Create long cut
      3. *enrich — Add data/trends
      4. Mine another transcript
```

---

## Acceptance Criteria

- [ ] All missing chunks identified and processed (or explicitly skipped)
- [ ] Merged output contains moments from ALL chunks
- [ ] Compact output (momentos.md) generated and < input size
- [ ] Annotated transcript generated
- [ ] Timestamp validation passes
- [ ] Mining quality checklist passes
- [ ] Delivery report shown with exact paths
- [ ] No data lost from previously completed chunks

---

## Anti-Patterns

| NEVER DO | ALWAYS DO |
|----------|-----------|
| Re-mine chunks that already succeeded | Scan existing parts first |
| Merge via LLM | Use merge script (CODE) |
| Skip validation after resume | Run full Pass 4-6 pipeline |
| Lose existing chunk outputs | Preserve all part files |
| Resume without checking transcript_raw exists | Verify prerequisites first |

---

## Handoff

```yaml
on_complete:
  pass_to: "curator-chief"
  deliver:
    - "output/curated/{source-slug}/momentos.md"
    - "output/curated/{source-slug}/transcricao_anotada.md"
  context: "Mining resumed. {N} moments total. Coverage: {X}%. Ready for narrative."
  next_gate: "QG-002 passed"
```

---

_Task Version: 1.0.0_
_Agent: content-miner-pro_
_Adapted from: ETL resume-collection.md pattern_
