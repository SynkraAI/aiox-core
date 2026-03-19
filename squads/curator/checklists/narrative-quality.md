# Narrative Quality Checklist

**Purpose:** Validate narrative structure before passing to Tier 2
**Used by:** ken-burns, walter-murch, matthew-dicks
**Gate:** QG-003

---

## Mandatory Checks (ALL must pass)

### 1. Structure File
- [ ] `narrative_structure.yaml` exists
- [ ] File follows expected template format
- [ ] Metadata section complete

### 2. Assembly Order
- [ ] Assembly order explicitly defined
- [ ] Order is NOT just chronological (intentional sequencing)
- [ ] Every entry has clear position in sequence

### 3. Moment References
- [ ] All referenced moment IDs exist in `banco_momentos`
- [ ] No orphan references (IDs that point to nothing)
- [ ] No stale references (IDs from outdated mining)

### 4. Emotional Arc
- [ ] Emotional arc has distinct beats
- [ ] Minimum beats present: hook, setup, climax, resolution
- [ ] Each beat has at least one moment assigned
- [ ] Arc progression is intentional (not accidental)

### 5. Narrative Continuity
- [ ] No narrative gaps between segments
- [ ] Every transition between non-adjacent moments is identified
- [ ] Transitions have explicit bridging strategy (narration, B-roll, text)
- [ ] Viewer/listener can follow without confusion

### 6. Radio Cut Test
- [ ] Radio cut test passed (makes sense as audio-only)
- [ ] Story is comprehensible without visuals
- [ ] No reliance on "you can see here" without audio context

---

## Quality Checks (Should pass)

### Emotional Progression
- [ ] Emotional progression builds correctly (peaks and valleys)
- [ ] No two high-intensity moments back-to-back without breathing room
- [ ] Contrast used (quiet before loud, slow before fast)
- [ ] Emotional payoff matches setup investment

### Pacing
- [ ] Pacing notes included for editor
- [ ] Target duration achievable with selected moments
- [ ] Segment durations estimated and totaled
- [ ] No single segment dominates disproportionately

### Content Selection
- [ ] Moments selected fit the narrative (not just highest-scored)
- [ ] Low-score moments included if narratively essential
- [ ] High-score moments excluded if narratively redundant (justified)

### Integration
- [ ] Curadoria integration points identified (if curadoria available)
- [ ] External references have verified sources
- [ ] Supplementary material mapped to specific moments

---

## Pass Criteria

**QG-003 PASS requires:**
- ALL mandatory checks ✓
- At least 80% of quality checks ✓

**If FAIL:**
1. Document which checks failed
2. Fix the specific issues
3. Re-run checklist
4. Only pass to Tier 2 when all mandatory checks pass

---

## Scoring

| Category | Items | Points Each | Max |
|----------|-------|-------------|-----|
| **Mandatory: Structure File** | 3 items | 2 pts | 6 |
| **Mandatory: Assembly Order** | 3 items | 2 pts | 6 |
| **Mandatory: Moment References** | 3 items | 2 pts | 6 |
| **Mandatory: Emotional Arc** | 4 items | 2 pts | 8 |
| **Mandatory: Narrative Continuity** | 4 items | 2 pts | 8 |
| **Mandatory: Radio Cut Test** | 3 items | 2 pts | 6 |
| **Quality: Emotional Progression** | 4 items | 1 pt | 4 |
| **Quality: Pacing** | 4 items | 1 pt | 4 |
| **Quality: Content Selection** | 3 items | 1 pt | 3 |
| **Quality: Integration** | 3 items | 1 pt | 3 |
| **Total** | **34 items** | | **54** |

### Thresholds
- **Pass:** >= 40 points (mandatory) + >= 11/14 quality points = **>= 51 total** (mandatory perfect + 80% quality)
- **Excellent:** >= 51 points (94%) — all mandatory + nearly all quality
- **Fail:** < 40 mandatory points → **BLOCK** (any mandatory item failed = automatic block regardless of total)

> **Note:** Mandatory items are non-negotiable. A score of 54/54 with one mandatory miss is still a FAIL. Mandatory section must score 40/40 to pass the gate.

---

## Edge Cases

### Case: Only 1-2 moments found (insufficient material)
**Signal:** Mining output (`banco_momentos`) contains fewer than 3 usable moments. Narrative structure cannot form a complete arc (hook + setup + climax + resolution requires minimum 4 beats).
**Action:** Do NOT force a narrative from insufficient material. Options: (1) Return to mining phase and request deeper extraction — sometimes moments are missed on first pass. (2) If source genuinely lacks material, flag as `insufficient_material` and produce a "micro-narrative" with reduced arc requirements (hook + single beat + close). (3) Recommend combining with another source to reach minimum density.
**Threshold:** Emotional Arc mandatory check is modified — minimum beats reduced from 4 (hook, setup, climax, resolution) to 2 (hook + close) for micro-narratives. All other mandatory checks apply. Document the exception with justification.

### Case: All moments are same type (no variety)
**Signal:** Every moment in `banco_momentos` has the same `tipo` (e.g., all "insight" or all "quote"). This produces a monotone narrative with no emotional contrast or pacing variation.
**Action:** First verify this is not a mining error — return to Tier 0 to check if variety was missed. If source genuinely contains only one type, build narrative variety through: (1) sequencing by sub-theme instead of type, (2) varying emotional intensity within the same type, (3) adding transition strategies that create artificial contrast (pacing changes, B-roll breaks). Annotate `narrative_structure.yaml` with `variety_constraint: single_type` and explain the compensating strategy.
**Threshold:** Emotional Progression quality checks are evaluated against the compensating strategy rather than standard variety expectations. Pass criteria unchanged for mandatory items.

### Case: Source material is purely technical (no emotional content)
**Signal:** Source material is instructional, tutorial, or data-heavy with no personal stories, emotional moments, or human-interest elements. Emotional arc construction is difficult because the content is inherently flat.
**Action:** Shift narrative strategy from emotional arc to intellectual arc: curiosity (hook) -> complexity (setup) -> insight/revelation (climax) -> application (resolution). Replace emotional beat labels with intellectual equivalents. The Radio Cut Test still applies — technical content must still be comprehensible as audio. Add `arc_type: intellectual` to `narrative_structure.yaml` metadata.
**Threshold:** Emotional Arc mandatory check is reinterpreted — "emotional beats" become "intellectual beats" with same structural requirements (minimum 4 beats: hook, setup, climax, resolution). Emotional Progression quality checks are evaluated against intellectual engagement curve instead of emotional intensity.

### Case: Conflicting moments (contradictory statements)
**Signal:** Two or more moments in `banco_momentos` contain statements that directly contradict each other (e.g., speaker says "X is essential" in one moment and "X doesn't matter" in another).
**Action:** Do NOT silently pick one and discard the other. Options: (1) Check timestamps — the later statement may represent an evolved position (use both to show the evolution). (2) Check context — contradiction may be rhetorical (e.g., presenting an opposing view before refuting it). (3) If genuine contradiction, flag both moments with `contradiction_pair: [moment_id_1, moment_id_2]` and choose the version that best fits the narrative's thesis. Document the decision in the assembly notes.
**Threshold:** All mandatory checks apply. Narrative Continuity check requires explicit handling of the contradiction — the viewer/listener must not be confused by conflicting statements appearing without context.
