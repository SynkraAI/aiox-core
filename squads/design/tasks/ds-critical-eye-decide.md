# Critical Eye — Make Lifecycle Transition Decisions

> Task ID: ds-critical-eye-decide
> Agent: Brad Frost (Design System Architect)
> Version: 1.0.0
> v4.0-compatible: true
> **Execution Type:** `Agent`
> **Dependencies:** depends_on: `[ds-critical-eye-compare]` · enables: `[ds-critical-eye-report]` · workflow: `critical-eye`

## Description

Apply lifecycle transition rules to all ranked variants. Auto-transitions execute immediately: CANDIDATE→EXPERIMENTAL (breadth >= 10), EXPERIMENTAL→STABLE (total >= 60). Checkpoint transitions generate proposals for human review: STABLE→CANONICAL (total >= 80 + highest in category), CANONICAL→DEPRECATED (superseded by 10+ margin). The absolute blocker (a11y = 0 → REJECT) was already applied in the score step.

All decisions are logged to the append-only `canonical-decisions.json` for full traceability.

## Output Schema
- **produces:**
  - `outputs/design-system/critical-eye/cycle-{N}/decisions.json` — executed auto-transitions
  - `outputs/design-system/critical-eye/cycle-{N}/proposals.json` — checkpoint proposals for design-chief
  - Updates `workspace/ui/pattern-catalog.json` — lifecycle + scores
  - Appends to `workspace/ui/canonical-decisions.json` — decision log
- **consumed_by:** ds-critical-eye-report, ds-critical-eye-review-checklist (for proposals)

## Prerequisites

- Rankings output from `ds-critical-eye-compare` available
- `pattern-catalog.json` writable
- `canonical-decisions.json` writable
- `critical-eye-scoring-rules.yaml` loaded (for transition rules)

## Workflow

### Steps

1. **Load Inputs**
   - Read `rankings.json` from previous step
   - Read `pattern-catalog.json` (will be updated)
   - Read `canonical-decisions.json` (will be appended)
   - Read `critical-eye-scoring-rules.yaml` → `lifecycle.transitions` section
   - Check: all files loaded and valid

2. **Evaluate Auto-Transitions**
   - For each variant, check current lifecycle and scores:
   - **CANDIDATE → EXPERIMENTAL** (auto):
     - Condition: `breadth_score >= 10` (appears in 2+ sources)
     - If met: execute transition immediately
   - **EXPERIMENTAL → STABLE** (auto):
     - Condition: `total_score >= 60`
     - If met: execute transition immediately
   - **ANY → REJECT** (auto, blocker):
     - Condition: `accessibility_score == 0`
     - Already handled in score step, but verify no regressions
   - Check: all auto-transitions evaluated

3. **Execute Auto-Transitions**
   - For each auto-transition:
     - Update `variant.lifecycle` in pattern-catalog.json
     - Append to `variant.lifecycleHistory`:
       ```json
       {
         "from": "CANDIDATE",
         "to": "EXPERIMENTAL",
         "cycle": N,
         "type": "auto",
         "reason": "breadth_score >= 10 (2 sources)",
         "timestamp": "ISO-8601"
       }
       ```
     - Create decision entry for `canonical-decisions.json`
   - Check: all auto-transitions applied and logged

4. **Generate Checkpoint Proposals**
   - **STABLE → CANONICAL** (requires design-chief approval):
     - Condition: `total_score >= 80 AND highest_in_category`
     - If met: create proposal (NOT executed yet)
     - Include: variant ID, scores, category leader status, comparison matrix
   - **CANONICAL → DEPRECATED** (requires design-chief approval):
     - Condition: `new_canonical_candidate_score > current_canonical_score + 10`
     - If met: create deprecation proposal with replacement candidate
   - Check: all proposals generated with full justification

5. **Update Pattern Catalog**
   - Write updated scores for ALL variants (even those with no transition)
   - Update `evaluationCycle` to current cycle number
   - Update `lastEvaluatedAt` to current timestamp
   - For each variant: update `lastScoredAtCycle` to current cycle
   - Check: catalog saved with no data loss, cycle number incremented

6. **Append to Decisions Log**
   - For each decision (auto-transition executed):
     ```json
     {
       "id": "decision-{cycle}-{index}",
       "cycle": N,
       "timestamp": "ISO-8601",
       "variantId": "button-shared-v1",
       "category": "base",
       "transition": { "from": "CANDIDATE", "to": "EXPERIMENTAL" },
       "type": "auto",
       "scores": { "total": 65, "breadth": 10, "quality": 22, ... },
       "reason": "breadth_score >= 10 (2 sources detected)",
       "authority": "Nathan Curtis / EightShapes — Usage Breadth Scale",
       "previousDecision": null
     }
     ```
   - Update `canonical-decisions.json.lastCycle` to current cycle
   - Check: decisions appended (not overwritten), log integrity preserved

7. **Generate Decision Outputs**
   - `decisions.json`: all auto-transitions executed this cycle
   - `proposals.json`: all checkpoint proposals awaiting human review
   - Check: both files valid JSON

## Failure Handling

- **Rankings not found:** Abort with "Run ds-critical-eye-compare first."
- **Catalog write failure:** CRITICAL — abort immediately, do not corrupt catalog
- **Decisions log write failure:** Log to console, create backup decisions file
- **Conflicting transitions:** If a variant qualifies for multiple transitions, apply the highest-priority one (REJECT > any other)

## Success Criteria

- [ ] All auto-transitions (CANDIDATE→EXPERIMENTAL, EXPERIMENTAL→STABLE) executed
- [ ] Checkpoint proposals (STABLE→CANONICAL, CANONICAL→DEPRECATED) generated
- [ ] Pattern catalog updated with new scores and lifecycle states
- [ ] Decisions log appended with full traceability
- [ ] No data corruption in catalog or decisions log
- [ ] Cycle number incremented
- [ ] Every decision cites authority source from scoring rules

## Anti-Patterns

- **"Silent transition"** — Executing a transition without logging it. Every transition MUST be in the decisions log.
- **"Forced canonical"** — Promoting to CANONICAL without the design-chief checkpoint. Auto-transitions STOP at STABLE.
- **"Retroactive scoring"** — Changing scores after decisions are made. Scores are immutable once logged. Re-score in next cycle.

## Related Checklists

- `squads/design/checklists/ds-critical-eye-review-checklist.md`
