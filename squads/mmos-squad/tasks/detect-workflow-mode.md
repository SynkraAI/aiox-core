---
task-id: detect-workflow-mode
name: Detect Workflow Mode (Stub)
agent: mapper
version: 1.0.0
purpose: Confirm already-detected workflow mode and save to metadata (stub task for backward compatibility)

workflow-mode: automatic
elicit: false

inputs:
  - name: mode
    type: string
    description: Already-detected mode from map_mind.py auto-detection
    required: true
    source: execution_context

  - name: slug
    type: string
    description: Mind slug
    required: true
    source: execution_context

outputs:
  - squads/mmos-squad/minds/{slug}/metadata/mode.yaml
  - squads/mmos-squad/minds/{slug}/metadata/config.yaml

estimated-duration: "5 seconds"
---

# Detect Workflow Mode (Stub Task)

## Purpose

This is a **compatibility stub** task. The actual mode detection is performed by `map_mind.py` using `workflow_detector.py` BEFORE the workflow is invoked.

This task simply:
1. Confirms the mode already detected
2. Saves it to metadata files for tracking
3. Allows the workflow to proceed

**Architecture Note:** This phase will be removed in Epic E001 Story 4 when workflows are refactored to accept mode as a pre-detected parameter.

## Execution

**INPUT (from execution context):**
- `mode`: Already detected (e.g., "public", "no-public-interviews", "no-public-materials")
- `slug`: Mind slug (e.g., "linus_torvalds")

**ACTIONS:**
1. Confirm mode from context
2. Create metadata directory if needed
3. Save mode.yaml
4. Save config.yaml with workflow parameters

**OUTPUTS:**
- `squads/mmos-squad/minds/{slug}/metadata/mode.yaml`
- `squads/mmos-squad/minds/{slug}/metadata/config.yaml`

## Mode Confirmation

The mode has already been detected by auto-detection engine:
- ✅ Mode: `{mode}` (from execution context)
- ✅ Slug: `{slug}`

This task confirms and saves this information for the rest of the pipeline.

## Metadata Files Created

### mode.yaml
```yaml
mode: {mode}
detected_at: {timestamp}
detection_method: auto_detect_workflow
confidence: high
```

### config.yaml
```yaml
workflow_type: greenfield
mode: {mode}
slug: {slug}
person_name: {person_name}
started_at: {timestamp}
pipeline_version: 2.0
```

**Status:** ✅ Mode confirmed and saved to metadata
