---
task-id: execute-cut
name: Execute Cut — FFmpeg Render Pipeline
agent: ffmpeg-cutter
version: 1.0.0
purpose: Execute FFmpeg cuts from validated YAML cut script, producing final rendered video segments with render report

workflow-mode: interactive
elicit: true
elicitation-type: custom

inputs:
  - name: cut_yaml
    type: file_path
    description: "Path to YAML cut script (from format-cut task, QG-004 must have passed)"
    required: true
    default: "output/curated/{source-slug}/cortes/{format}/{NN}_{name}.yaml"
  - name: video_input
    type: file_path
    description: "Path to source video file (local path, must exist)"
    required: true
  - name: output_dir
    type: directory_path
    description: "Optional override for output directory. Default: same directory as cut_yaml"
    required: false
    default: "output/curated/{source-slug}/renders/{format}/"

outputs:
  - path: "output/curated/{source-slug}/renders/{format}/{NN}_{name}_final.mp4"
    format: video/mp4
    description: "Final rendered video file (stream-copy or re-encoded)"
  - path: "output/curated/{source-slug}/renders/{format}/render_report.md"
    format: markdown
    description: "Render report with segment list, durations, mode (copy/re-encode), and final path"

dependencies:
  tasks:
    - format-cut (QG-004 must pass before execution)
  scripts:
    - scripts/execute_ffmpeg_cuts.py
  checklists:
    - checklists/render-quality.md (QG-RENDER)
  external:
    - ffmpeg (must be installed and on PATH)
---

# Task: Execute Cut

**Command:** `*render`
**Execution Type:** Worker (deterministic FFmpeg execution based on validated YAML — no creative judgment required)
**Pattern:** HO-TP-001 (Task Anatomy Standard)
**Version:** 1.0.0
**Last Updated:** 2026-02-18
**Governance Protocol:** `squads/squad-creator/protocols/ai-first-governance.md`

---

## AI-First Governance Gate

- [ ] Applied `squads/squad-creator/protocols/ai-first-governance.md`
- [ ] Mapped `Existing -> Gap -> Decision`
- [ ] Validated canonical sources (cut_yaml QG-004 marker present, video file exists)
- [ ] Documented contradictions and unresolved items

---

## Task Anatomy

| Field | Value |
|-------|-------|
| **task_name** | Execute Cut |
| **status** | `pending` |
| **responsible_executor** | ffmpeg-cutter |
| **execution_type** | `Worker` |
| **input** | cut_yaml (required), video_input (required), output_dir (optional) |
| **output** | Final video file (.mp4), render_report.md |
| **action_items** | 6 steps |
| **acceptance_criteria** | 3 criteria |

**Estimated Time:** 2-15 min (varies by video duration and codec)

---

## Executor Specification

| Attribute | Value |
|-----------|-------|
| **Type** | Worker |
| **Pattern** | HO-EP-004 |
| **Executor** | ffmpeg-cutter |
| **Rationale** | Execution is fully deterministic: validated YAML → FFmpeg commands → video file. No creative judgment, no content decisions. Worker is the correct executor type. |
| **Fallback** | Human operator (manual FFmpeg execution using commands from render_report.md) |

### Executor Selection Criteria

The task is appropriate for a Worker because:
- Input (YAML cut script) is fully validated and structured before this task begins
- FFmpeg operations are deterministic — same input always produces same output
- No content decisions are made during execution (all decided in format-cut)
- Error handling follows fixed rules (codec fallback, missing file block)
- CODE > LLM: this task is pure code execution, not reasoning

---

## Overview

Execute FFmpeg cuts based on a validated YAML cut script produced by the `format-cut` task (QG-004 passed). The task reads each segment definition from the YAML, constructs the appropriate FFmpeg command (stream-copy when possible, re-encode as fallback), executes all cuts, and generates a `render_report.md` with a full audit trail.

This task is the bridge between the creative/planning work (format-cut) and the physical video file the editor receives. It does not make content decisions — it executes decisions already locked in the YAML.

**KEY RULE:** This task NEVER executes without QG-004 marker in the cut_yaml. A YAML without this marker means format-cut did not complete its quality gate — execution is BLOCKED.

---

## Input

- **cut_yaml** (file_path)
  - Description: Path to YAML cut script from format-cut task
  - Required: Yes
  - Source: Output of `format-cut` task (QG-004 passed)
  - Validation: Must contain `quality_gate: QG-004` marker in metadata

- **video_input** (file_path)
  - Description: Path to the source video file on local disk
  - Required: Yes
  - Source: User-provided (raw video, local or downloaded)
  - Validation: File must exist and be readable by ffmpeg

- **output_dir** (directory_path)
  - Description: Override directory for output files
  - Required: No
  - Default: `output/curated/{source-slug}/renders/{format}/`
  - Note: Created automatically if it does not exist

---

## Output

- **{NN}_{name}_final.mp4** (video file)
  - Description: Final rendered video — all segments concatenated in assembly order
  - Destination: `output_dir` (default or override)
  - Format: MP4, H.264/AAC (stream-copy preferred, re-encode as fallback)

- **render_report.md** (markdown)
  - Description: Complete audit trail of the render run
  - Destination: Same `output_dir` as the video
  - Format: Markdown with table of segments, durations, modes, and final path

---

## Elicitation Points

Before execution, verify the following with the user or auto-resolve from inputs:

```yaml
elicitation:
  - id: confirm-paths
    question: "Confirm: cut_yaml={cut_yaml}, video_input={video_input}. Proceed?"
    when: "Always — safety check before irreversible FFmpeg execution"
    auto_resolve: "true if both files exist and QG-004 marker found"

  - id: output-dir-override
    question: "Output directory: default is output/curated/{source-slug}/renders/{format}/. Override?"
    when: "output_dir not provided"
    auto_resolve: "Use default if not provided"

  - id: codec-conflict
    question: "Source codec is {detected_codec}. Stream-copy may produce incompatible output for {platform}. Re-encode to H.264/AAC? (adds ~{estimate} min)"
    when: "Codec incompatibility detected during pre-flight"
    auto_resolve: "No — warn user and wait for explicit confirmation"

  - id: duration-mismatch
    question: "Expected duration from YAML: {expected}s. Actual rendered: {actual}s (delta: {delta}s). Delta exceeds 2s threshold. Deliver anyway?"
    when: "Duration check after render shows delta > 2s"
    auto_resolve: "No — block delivery, require user decision"
```

---

## Action Items

### Step 1: Pre-Flight Validation (BLOCKING)

Validate all inputs before touching FFmpeg. If any BLOCKING condition is met, abort immediately and report the exact veto reason.

```yaml
pre_flight_checks:
  - check: "YAML QG-004 marker"
    field: "cut_yaml.metadata.quality_gate"
    expected: "QG-004"
    on_fail: "BLOCK — format-cut did not complete quality gate. Run *create-cut first."

  - check: "YAML has exact timestamps"
    field: "cut_yaml.momentos[*].timestamp_inicio + timestamp_fim"
    validation: "All timestamps must be in HH:MM:SS or MM:SS format, no approximations"
    on_fail: "BLOCK — YAML has missing or approximate timestamps. Return to format-cut."

  - check: "Video file exists"
    field: "video_input"
    validation: "os.path.exists(video_input) == True"
    on_fail: "BLOCK — Source video not found at {video_input}. Provide correct path."

  - check: "ffmpeg installed"
    command: "ffmpeg -version"
    on_fail: "BLOCK — ffmpeg not found on PATH. Install ffmpeg and retry."

  - check: "Codec compatibility"
    command: "ffprobe -v quiet -select_streams v:0 -show_entries stream=codec_name -of default=noprint_wrappers=1:nokey=1 {video_input}"
    on_warn: "If codec incompatible → WARN user + offer re-encode fallback (do not auto-proceed)"
```

**Substeps:**
- [ ] Read cut_yaml and confirm QG-004 marker present
- [ ] Validate all timestamp fields are exact (HH:MM:SS or MM:SS)
- [ ] Confirm video_input file exists on disk
- [ ] Run `ffmpeg -version` — confirm ffmpeg is installed
- [ ] Run ffprobe on video_input — detect codec, warn if incompatible

**Notes:** Do NOT proceed to Step 2 if any BLOCKING condition is triggered.

---

### Step 2: Parse YAML and Build Command List

Read all segments from cut_yaml in assembly order (ordem_montagem) and build the FFmpeg command sequence.

```yaml
steps:
  - step: 2.1
    action: "Read cut_yaml completely"
    parse:
      - "metadata.fonte_original (source label for report)"
      - "metadata.duracao_alvo (expected final duration)"
      - "momentos[] sorted by ordem_montagem"
      - "Each momento: timestamp_inicio, timestamp_fim, id, tipo"

  - step: 2.2
    action: "Determine render mode per segment"
    logic: |
      IF source codec is H.264/AAC AND target is MP4:
        mode = "stream-copy" (fast, lossless, default)
      ELSE:
        mode = "re-encode" (H.264/AAC, CRF 18, preset fast)
        WARN user before proceeding (see Elicitation Point: codec-conflict)

  - step: 2.3
    action: "Build FFmpeg command per segment"
    stream_copy_template: |
      ffmpeg -ss {timestamp_inicio} -to {timestamp_fim} -i {video_input} \
        -c copy output/segment_{ordem_montagem:02d}_{id}.mp4
    re_encode_template: |
      ffmpeg -ss {timestamp_inicio} -to {timestamp_fim} -i {video_input} \
        -c:v libx264 -crf 18 -preset fast -c:a aac -b:a 192k \
        output/segment_{ordem_montagem:02d}_{id}.mp4

  - step: 2.4
    action: "Build concat list for final assembly"
    format: |
      # concat_list.txt (FFmpeg concat demuxer format)
      file 'segment_01_{id}.mp4'
      file 'segment_02_{id}.mp4'
      ...
```

**Substeps:**
- [ ] All moments parsed in ordem_montagem order
- [ ] Render mode determined (copy or re-encode) for each segment
- [ ] FFmpeg command list built for all segments
- [ ] Concat list file prepared

---

### Step 3: Execute FFmpeg Cuts (CODE)

Run the actual cuts via Python script. This is the deterministic execution step — no LLM reasoning, pure code.

```yaml
code: |
  python squads/curator/scripts/execute_ffmpeg_cuts.py \
    --input {video_input} \
    --cut-yaml {cut_yaml} \
    [--output-dir {output_dir}]

script_behavior:
  - Reads cut_yaml, validates QG-004 marker
  - Creates output_dir if not exists
  - Executes FFmpeg per segment (stream-copy or re-encode)
  - Assembles segments via FFmpeg concat demuxer
  - Calculates actual duration of final file
  - Writes render_report.md
  - Returns exit code 0 on success, 1 on any failure

on_error:
  exit_code_1: "Script failed — see stderr for specific FFmpeg error. Report to user with exact command that failed."
```

**Substeps:**
- [ ] Script invoked with correct arguments
- [ ] All segment cuts executed without error
- [ ] Segments concatenated into final video
- [ ] Output MP4 exists in output_dir

---

### Step 4: Duration Validation

After render, compare actual output duration against the expected duration from the YAML.

```yaml
validation:
  expected_duration: "cut_yaml.metadata.duracao_alvo (in seconds)"
  actual_duration: "ffprobe -v quiet -show_entries format=duration -of default=noprint_wrappers=1 {output_file}"
  tolerance: "±2 seconds"
  on_pass: "Continue to Step 5"
  on_fail: |
    Delta > 2s detected.
    Elicit user decision (see Elicitation Point: duration-mismatch).
    Do NOT auto-deliver.
    Log delta in render_report.md regardless of decision.
```

**Substeps:**
- [ ] ffprobe duration check executed on final output
- [ ] Delta calculated: |actual - expected|
- [ ] If delta ≤ 2s → PASS
- [ ] If delta > 2s → WARN user, await decision

---

### Step 5: Generate render_report.md

Write the render report to output_dir. This is mandatory — no delivery without report.

```yaml
report_structure:
  # See Output Example section below for concrete format
  sections:
    - header (source, date, mode, final path)
    - segments table (id, timestamps, duration, mode, status)
    - duration summary (expected, actual, delta, verdict)
    - warnings (codec fallbacks, duration deltas)
    - delivery checklist (QG-RENDER items)
```

**Substeps:**
- [ ] render_report.md written to output_dir
- [ ] All segments listed with durations and modes
- [ ] Duration verdict recorded (PASS/WARN)
- [ ] Final video path confirmed in report

---

### Step 6: Run QG-RENDER Checklist

Execute all items from `squads/curator/checklists/render-quality.md` before marking task complete.

**Substeps:**
- [ ] Read `squads/curator/checklists/render-quality.md`
- [ ] Execute each checklist item
- [ ] All blocking items pass
- [ ] Checklist result recorded in render_report.md

---

## Acceptance Criteria

The task is complete when ALL of the following criteria are met:

- [ ] **AC-001:** Final video file exists at output path and is playable
  - Measurement: `ffprobe {output_file}` returns valid video stream info
  - Threshold: Exit code 0, duration > 0

- [ ] **AC-002:** Actual duration is within ±2 seconds of expected duration from YAML
  - Measurement: `|actual_duration - cut_yaml.metadata.duracao_alvo| <= 2`
  - Threshold: ≤ 2 seconds delta

- [ ] **AC-003:** render_report.md exists in output_dir with all mandatory sections
  - Measurement: File exists, contains segment table, duration summary, final video path
  - Threshold: All 4 sections present and populated

---

## Veto Conditions (BLOCKING)

The following conditions BLOCK execution. Task does not proceed until resolved.

```yaml
veto_conditions:
  - id: VETO-001
    name: "YAML sem timestamps exatos"
    trigger: "Any momento in cut_yaml has null, approximate, or malformed timestamp"
    detection: "Pre-flight Step 1 — regex validation of all timestamp fields"
    action: "BLOCK"
    message: "YAML has missing or approximate timestamps. Return to format-cut and re-run QG-004."

  - id: VETO-002
    name: "YAML sem QG-004 marker"
    trigger: "cut_yaml.metadata.quality_gate != 'QG-004'"
    detection: "Pre-flight Step 1 — read metadata.quality_gate field"
    action: "BLOCK"
    message: "YAML has no QG-004 marker. format-cut quality gate was not completed. Run *create-cut and pass QG-004 first."

  - id: VETO-003
    name: "Video file not found"
    trigger: "video_input path does not exist on disk"
    detection: "Pre-flight Step 1 — os.path.exists(video_input)"
    action: "BLOCK"
    message: "Source video not found at {video_input}. Provide correct absolute path."

  - id: VETO-004
    name: "ffmpeg not installed"
    trigger: "ffmpeg -version returns non-zero exit code"
    detection: "Pre-flight Step 1 — ffmpeg -version"
    action: "BLOCK"
    message: "ffmpeg not found on PATH. Install ffmpeg (https://ffmpeg.org/download.html) and retry."

  - id: VETO-005
    name: "Codec incompatível"
    trigger: "Source codec is not H.264/AAC and output target requires H.264/AAC"
    detection: "Pre-flight Step 1 — ffprobe codec detection"
    action: "WARN + re-encode fallback"
    message: "Source codec {codec} may produce incompatible output for {platform}. Re-encoding to H.264/AAC (CRF 18). This adds ~{estimate} minutes. Confirm to proceed."
    fallback: "Re-encode with libx264 CRF 18, preset fast, AAC 192k"
    blocking: false
```

---

## Quality Gate: QG-RENDER

**Reference:** `squads/curator/checklists/render-quality.md`
**Placement:** Exit gate (after render, before delivery)
**Type:** Automated + manual verification
**Severity:** Blocking

```yaml
quality_gate:
  id: "QG-RENDER"
  name: "Render Quality Gate"
  placement: "exit"
  type: "hybrid"
  severity: "blocking"

  criteria:
    - check: "Final video file exists"
      type: "automated"
      field: "output_path"
      operator: "file_exists"
      weight: 1.0

    - check: "Video is playable (ffprobe exit 0)"
      type: "automated"
      command: "ffprobe -v quiet {output_file}"
      operator: "exit_code_eq"
      value: 0
      weight: 1.0

    - check: "Duration within ±2s of expected"
      type: "automated"
      field: "duration_delta"
      operator: "lte"
      value: 2
      weight: 1.0

    - check: "render_report.md exists with all sections"
      type: "automated"
      field: "render_report_path"
      operator: "file_exists"
      weight: 1.0

    - check: "All segments in YAML are present in render"
      type: "automated"
      field: "segment_count"
      operator: "eq"
      value: "cut_yaml.momentos.length"
      weight: 1.0

  thresholds:
    pass: 1.0
    review: 0.8
    fail: 0.0

  pass_action:
    - "Mark task complete"
    - "Deliver render_report.md and final video path to curator-chief"

  fail_action:
    - "Log failure in render_report.md"
    - "Return to Step 3 with error details"
    - "If VETO condition — block entirely and require user resolution"
```

---

## Output Example

Concrete `render_report.md` for a 3-segment shorts cut:

```markdown
# Render Report

**Source:** entrevista-marcos-2026-01-15
**Cut YAML:** output/curated/entrevista-marcos-2026-01-15/cortes/shorts/01_melhor_insight.yaml
**QG-004:** PASSED
**Render Date:** 2026-02-18T14:32:00
**Mode:** stream-copy (all segments)
**Final Video:** output/curated/entrevista-marcos-2026-01-15/renders/shorts/01_melhor_insight_final.mp4

---

## Segments

| # | Momento ID | Start     | End       | Duration | Mode        | Status |
|---|-----------|-----------|-----------|----------|-------------|--------|
| 1 | m_003     | 00:04:12  | 00:04:19  | 7s       | stream-copy | OK     |
| 2 | m_007     | 00:11:44  | 00:12:05  | 21s      | stream-copy | OK     |
| 3 | m_021     | 00:28:33  | 00:28:47  | 14s      | stream-copy | OK     |

---

## Duration Summary

| Metric      | Value     |
|-------------|-----------|
| Expected    | 42s       |
| Actual      | 43s       |
| Delta       | 1s        |
| Verdict     | **PASS** (within ±2s threshold) |

---

## Warnings

None.

---

## QG-RENDER Checklist

- [x] Final video file exists
- [x] Video is playable (ffprobe exit 0)
- [x] Duration within ±2s of expected
- [x] render_report.md complete
- [x] All 3 segments present in render

**QG-RENDER: PASSED**

---

## Delivery

Final video ready for editor:
`output/curated/entrevista-marcos-2026-01-15/renders/shorts/01_melhor_insight_final.mp4`
```

---

## Error Handling

### VETO-001 / VETO-002: YAML Not Ready

- **Trigger:** Missing timestamps or missing QG-004 marker
- **Detection:** Pre-flight Step 1
- **Recovery:** Return to format-cut agent, run `*create-cut {format}`, ensure QG-004 passes before retrying `*render`
- **Prevention:** format-cut enforces QG-004 before output — do not copy YAML manually

### VETO-003: Video File Not Found

- **Trigger:** `video_input` path does not exist
- **Detection:** Pre-flight `os.path.exists()` check
- **Recovery:** Provide correct absolute path to source video
- **Prevention:** Always use absolute paths; confirm file location before running `*render`

### VETO-004: FFmpeg Not Installed

- **Trigger:** `ffmpeg -version` fails
- **Detection:** Pre-flight shell command
- **Recovery:** Install ffmpeg from https://ffmpeg.org/download.html, confirm `ffmpeg -version` succeeds, retry
- **Prevention:** Verify ffmpeg installation as part of environment setup

### VETO-005: Codec Incompatibility

- **Trigger:** Source video uses HEVC, VP9, AV1, or other non-H.264 codec
- **Detection:** ffprobe during pre-flight
- **Recovery:** User confirms re-encode → script switches to `libx264 CRF 18 + AAC 192k`
- **Prevention:** Download source video in H.264 format when possible to avoid re-encode overhead

### Duration Delta > 2s

- **Trigger:** Rendered file duration differs from YAML expected by more than 2 seconds
- **Detection:** Step 4 post-render ffprobe check
- **Recovery:** Investigate timestamp precision in YAML (off-by-one frames are common cause). If acceptable, user can approve delivery with warning logged.
- **Prevention:** Ensure banco_momentos timestamps are frame-accurate

---

## Integration

This task integrates with:

- **format-cut** (upstream): Consumes `roteiro_corte.yaml` with QG-004 marker. Cannot execute without it.
- **generate-editor-guide** (parallel): Both tasks can run in parallel after format-cut completes — editor guide is the human-readable companion, execute-cut is the machine execution.
- **curator-chief** (orchestrator): Receives render_report.md and final video path on completion.
- **execute_ffmpeg_cuts.py** (script): The Python script that performs the actual FFmpeg execution. Task is a wrapper that validates pre-conditions and post-conditions around the script.
- **QG-RENDER checklist** (`squads/curator/checklists/render-quality.md`): Executed at Step 6 before delivery.

---

## Dependencies

### Depends On (Upstream)

- `format-cut` — Format Cut Task
  - Required output: `roteiro_corte.yaml` with `metadata.quality_gate: QG-004`

### Required By (Downstream)

- `curator-chief` (delivery handoff)
  - Uses output: `render_report.md` + final MP4 path

---

## Handoff

| Attribute | Value |
|-----------|-------|
| **Next Task** | `curator-chief` (delivery review) |
| **Trigger** | QG-RENDER passed, render_report.md written |
| **Executor** | curator-chief |

### Handoff Checklist

Before handoff, verify:
- [ ] Final MP4 exists and is playable
- [ ] Duration delta ≤ 2s (or user explicitly approved with warning logged)
- [ ] render_report.md is complete with all 4 sections
- [ ] QG-RENDER all items checked

### Handoff Package

The following artifacts are passed to the next task:

- **final_video**: Path to rendered MP4 — `output/curated/{source-slug}/renders/{format}/{NN}_{name}_final.mp4`
- **render_report**: Path to report — `output/curated/{source-slug}/renders/{format}/render_report.md`
- **qg_render_verdict**: `PASSED` or `PASSED_WITH_WARNINGS`

---

## Usage

```bash
# Via curator-chief (recommended)
@curator:curator-chief
*render

# Direct execution (with explicit paths)
*render --cut-yaml output/curated/entrevista-marcos/cortes/shorts/01_insight.yaml \
        --video-input raw/entrevista-marcos-2026-01-15.mp4

# With output directory override
*render --cut-yaml {cut_yaml} \
        --video-input {video_input} \
        --output-dir /Volumes/ExternalDrive/renders/

# Via Python script directly (bypass agent, for debugging)
python squads/curator/scripts/execute_ffmpeg_cuts.py \
  --input raw/entrevista-marcos-2026-01-15.mp4 \
  --cut-yaml output/curated/entrevista-marcos/cortes/shorts/01_insight.yaml
```

---

## Validation Checklist (HO-TP-001)

### Mandatory Fields Check

- [x] `task_name` follows "Verb + Object" format → "Execute Cut"
- [x] `status` is one of: pending | in_progress | completed → `pending`
- [x] `responsible_executor` is clearly specified → `ffmpeg-cutter`
- [x] `execution_type` is one of: Human | Agent | Hybrid | Worker → `Worker`
- [x] `input` array has at least 1 item → 3 inputs defined
- [x] `output` array has at least 1 item → 2 outputs defined
- [x] `action_items` has clear, actionable steps → 6 steps
- [x] `acceptance_criteria` has measurable criteria → 3 criteria with measurement + threshold

### Quality Check

- [x] Task is atomic (single responsibility: execute FFmpeg cuts from validated YAML)
- [x] Inputs are well-defined with types
- [x] Outputs match acceptance criteria
- [x] Action items are sequential and clear
- [x] Executor type matches task nature (Worker — deterministic code execution)
- [x] Handoff is specified (curator-chief)

---

_Task Version: 1.0.0_
_Pattern: HO-TP-001 (Task Anatomy Standard)_
_Last Updated: 2026-02-18_
_Compliant: Yes_
_Quality Gate: QG-RENDER (blocking, exit)_
_Depends On: format-cut (QG-004 required)_
_Script: squads/curator/scripts/execute_ffmpeg_cuts.py_
