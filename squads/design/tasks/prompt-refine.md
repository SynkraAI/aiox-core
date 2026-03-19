# Prompt Refinement (PRIO Framework)

> Task ID: prompt-refine
> Agent: Nano Banana Generator
> Version: 1.0.0
> **Execution Type:** `Agent`
> **Dependencies:** depends_on: `[image-generate]` · enables: `[]` · workflow: `any`
> **On Fail:** If refinement produces worse results → revert to previous best prompt and try different variable isolation. If stuck after 3 iterations → escalate to requesting agent with analysis of what's not working.

## Description

Iteratively refine an image generation prompt using the PRIO framework (Prompt Refinement & Iteration Optimization). Takes an existing generation result (successful or partially successful), analyzes what worked and what didn't, isolates variables, generates targeted variations, and selects the best outcome. Maximum 5 PRIO cycles per session.

## Output Schema
- **produces:** `{output_dir}/refinements/` (refined PNGs) + `{output_dir}/refinement-log.yaml`
- **format:** PNG images + YAML metadata
- **consumed_by:** logo-curate, logo-deliverable

## Related Checklists
- `squads/design/checklists/design-fidelity-checklist.md`
- `squads/design/checklists/design-handoff-checklist.md`

## Prerequisites

- Previous generation result(s) to refine from
- Original SCDS prompt used
- Clear direction on what to improve (from user or requesting agent)

## Workflow

### Steps

1. **Result Analysis (P)**
   - Review the source image(s) and original prompt
   - Identify what's working well (keep these elements)
   - Identify what needs improvement (target these)
   - Categorize issues:
     - **Compositional**: layout, balance, spacing
     - **Stylistic**: aesthetic doesn't match intent
     - **Technical**: resolution, artifacts, distortion
     - **Semantic**: subject doesn't match description
     - **Typography**: text rendering issues (if applicable)

2. **Variable Isolation (R)**
   - From the analysis, select 1-2 variables to change per iteration
   - Do NOT change multiple variables simultaneously (scientific approach)
   - Document which SCDS component each variable maps to:
     - SUBJECT variables: object, action, quantity
     - SETTING variables: environment, lighting, time
     - STYLE variables: aesthetic, mood, technique
     - TECHNICAL variables: ratio, resolution, negative prompt
   - Create hypothesis: "Changing {variable} from {current} to {proposed} should improve {aspect}"

3. **Variation Generation (I)**
   - Generate 3-5 variations changing ONLY the isolated variable(s)
   - Use `image-generate` for each variation
   - Keep all other prompt elements identical
   - Save to `{output_dir}/refinements/cycle-{n}/`

4. **Best-of Selection (O)**
   - Compare variations against the original
   - Score each on the improvement axis (1-5):
     - 1 = worse than original
     - 3 = equal to original
     - 5 = significant improvement
   - Select the best variation as the new baseline
   - Document learnings:
     ```yaml
     cycle: {n}
     hypothesis: "{hypothesis}"
     variable_changed: "{variable}"
     best_variation: "{var_id}"
     improvement_score: {1-5}
     learning: "{what we learned}"
     ```

5. **Iterate or Conclude**
   - If improvement score >= 4 AND user satisfied → conclude
   - If improvement score >= 3 → run another PRIO cycle with new variable
   - If improvement score <= 2 → revert to previous baseline, try different variable
   - Maximum 5 cycles per session

6. **Generate Refinement Log**
   - Create `{output_dir}/refinement-log.yaml`:
     ```yaml
     refinement_id: "{id}"
     source_generation: "{original_id}"
     original_prompt: "{scds_prompt}"
     total_cycles: {n}
     cycles:
       - cycle: 1
         variable: "{var}"
         hypothesis: "{hyp}"
         variations_generated: {n}
         best_variation: "{var_id}"
         improvement_score: {score}
         learning: "{learning}"
         prompt_delta: "{what changed}"
     final_prompt: "{evolved_scds}"
     final_image: "{path}"
     cumulative_improvement: "{summary}"
     ```

## Output

| Artifact | Location | Description |
|---|---|---|
| Refined images | `{output_dir}/refinements/` | All refinement cycle outputs |
| Refinement log | `{output_dir}/refinement-log.yaml` | Complete PRIO cycle history |
| Final prompt | Embedded in log | The optimized SCDS prompt |

## Anti-Patterns

- **"Shotgun refinement"** — Changing 5+ variables at once. You can't learn what worked. Isolate 1-2 variables per cycle
- **"Prompt amnesia"** — Not documenting what changed between iterations. ALWAYS record the delta
- **"Infinite loop"** — Running 10+ cycles without improvement. Cap at 5, then escalate
- **"Reversal blindness"** — Refusing to revert when a change made things worse. Always revert to last known good baseline
- **"Subjective scoring"** — Scoring without clear criteria. Define the improvement axis BEFORE generating variations

## Failure Handling

- **No improvement after 3 cycles:** Document patterns, suggest fundamentally different approach (new concept direction)
- **Regression (worse than original):** Immediately revert, log the change that caused regression
- **API failures during cycle:** Resume from last successful variation
- **User can't decide between variations:** Present side-by-side with objective criteria

## Success Criteria

- [ ] Source analysis documented before first refinement
- [ ] Single variable isolated per cycle
- [ ] Hypothesis documented before generation
- [ ] All cycles logged with scores and learnings
- [ ] Final prompt documented for reproducibility
- [ ] Cumulative improvement summary provided

## Handoff

```yaml
to: "{requesting_agent}"
pass:
  - final_image: "{output_dir}/refinements/{best_file}.png"
  - final_prompt: "{evolved_scds}"
  - refinement_log: "{output_dir}/refinement-log.yaml"
  - total_cycles: {n}
  - improvement_summary: "{summary}"
```
