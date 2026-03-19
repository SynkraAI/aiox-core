# Batch Image Generation (BATCH Framework)

> Task ID: image-batch
> Agent: Nano Banana Generator
> Version: 1.0.0
> **Execution Type:** `Agent`
> **Dependencies:** depends_on: `[image-generate]` · enables: `[prompt-refine]` · workflow: `any`
> **On Fail:** If batch partially fails → save successful images, log failures, offer retry for failed items only. If all fail → check API key and model, fall back to single generation.

## Description

Generate systematic image variations using the BATCH framework (Bulk Artistic Testing & Comparison Hub). Locks a core prompt and varies along defined axes (color, style, composition, mood) to explore the design space efficiently. Each variation uses the base `image-generate` task.

## Output Schema
- **produces:** `{output_dir}/batch-{batch_id}/` (multiple PNGs) + `{output_dir}/batch-{batch_id}/batch-log.yaml`
- **format:** PNG images + YAML metadata
- **consumed_by:** logo-curate, prompt-refine

## Related Checklists
- `squads/design/checklists/design-fidelity-checklist.md`
- `squads/design/checklists/design-handoff-checklist.md`

## Prerequisites

- `OPENROUTER_API_KEY` set in `.env`
- Base SCDS prompt (the "core lock")
- Defined variation axes with values

## Workflow

### Steps

1. **Define Core Prompt Lock**
   - Identify the SCDS components that remain constant across all variations
   - These form the "base" that every variation shares
   - Document the locked components explicitly

2. **Define Variation Axes**
   - Select 1-3 axes to vary. Common axes:
     - **Color**: palette shifts (warm, cool, monochrome, earth tones, vibrant)
     - **Style**: aesthetic shifts (minimalist, geometric, organic, hand-drawn, 3D)
     - **Composition**: layout shifts (centered, asymmetric, contained, open)
     - **Mood**: tone shifts (professional, playful, bold, elegant, raw)
   - Each axis has 2-5 values
   - Total variations = product of all axis values (cap at 15 per batch)

3. **Generate Variation Matrix**
   - Create all combinations of axis values
   - For each combination, construct a complete SCDS prompt by injecting the variation values into the core lock
   - Display the matrix for user review before generation

4. **Execute Batch Generation**
   - For each variation in the matrix:
     - Construct SCDS prompt with variation values
     - Call `image-generate` task
     - Save to `{output_dir}/batch-{batch_id}/{axis_values}.png`
     - Log result in batch-log.yaml
   - Use sequential execution (API rate limits)
   - Pause 5s between generations

5. **Create Batch Summary**
   - Generate `batch-log.yaml`:
     ```yaml
     batch_id: "{batch_id}"
     timestamp: "{ISO-8601}"
     core_prompt: "{locked_scds}"
     variation_axes:
       - axis: "{axis_name}"
         values: ["{v1}", "{v2}", "{v3}"]
     total_planned: {n}
     total_generated: {n}
     total_failed: {n}
     variations:
       - id: "{var_id}"
         axis_values: {color: "warm", style: "minimalist"}
         prompt: "{full_scds}"
         output_file: "{filename}.png"
         status: "success|failed"
         error: "{error_msg if failed}"
     ```

6. **Present Results**
   - Group images by variation axis for easy comparison
   - Highlight which axis values produced the strongest results
   - Offer: select favorites → refine (prompt-refine), or run another batch

## Output

| Artifact | Location | Description |
|---|---|---|
| Batch images | `{output_dir}/batch-{batch_id}/` | All generated variation images |
| Batch log | `{output_dir}/batch-{batch_id}/batch-log.yaml` | Full metadata + prompts per variation |

## Anti-Patterns

- **"Axis explosion"** — Varying 4+ axes with 5+ values each = 625+ images. Cap at 15 per batch. If more exploration needed, run sequential focused batches
- **"Unlocked core"** — Changing the core prompt between variations defeats the purpose. Lock the core, vary only the defined axes
- **"No curation"** — Generating 15 images without presenting them grouped by axis. Always group for meaningful comparison
- **"Resolution waste"** — Using 4K for batch exploration. Use 1K for batches, upgrade winners to 2K/4K later

## Failure Handling

- **Partial failure (>50% success):** Continue with successful images, note failures
- **Partial failure (<50% success):** Pause batch, diagnose common failure cause
- **Rate limit during batch:** Increase pause between generations to 15s, continue
- **All failures:** Abort batch, check API configuration

## Success Criteria

- [ ] Core prompt locked and documented
- [ ] Variation axes defined with clear values
- [ ] All planned variations attempted
- [ ] Results grouped by axis for comparison
- [ ] Batch log complete with all prompts and metadata
- [ ] Failed variations documented with error cause

## Handoff

```yaml
to: "{requesting_agent}"
pass:
  - batch_dir: "{output_dir}/batch-{batch_id}/"
  - batch_log: "{output_dir}/batch-{batch_id}/batch-log.yaml"
  - batch_id: "{batch_id}"
  - total_generated: {n}
  - recommended_favorites: ["{var_id_1}", "{var_id_2}"]
```
