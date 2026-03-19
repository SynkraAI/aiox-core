# Generate Phased Migration Strategy

> Task ID: brad-generate-migration-strategy
> Agent: Brad (Design System Architect)
> Version: 1.1.0
> v4.0-compatible: true
> **Execution Type:** `Hybrid`
> **Human Checkpoint:** Review and approve the 4-phase migration plan and rollback procedures before proceeding to ROI calculation
> **Dependencies:** depends_on: `[ds-extract-tokens]` · enables: `[ds-calculate-roi]` · workflow: `brownfield-audit`
> **On Fail:** If tokens.yaml missing → re-run `*tokenize`. If migration plan has unresolved component mappings → review token coverage and add missing tokens manually. If human reviewer rejects plan → revise phases based on feedback and re-submit for approval. Do NOT proceed to ROI with unapproved migration plan.

## Description

Create realistic 4-phase migration plan to gradually adopt design system without blocking sprints. Prioritizes high-impact patterns first, includes rollback procedures, tracks progress.

## Input Schema
- **requires:** Output from `ds-extract-tokens`
- **format:** YAML data (tokens.yaml with all design tokens)
- **location:** `outputs/design-system/{project}/tokens/tokens.yaml`

## Output Schema
- **produces:** `outputs/design-system/{project}/migration/migration-strategy.md`
- **format:** Markdown report
- **consumed_by:** ds-calculate-roi

## Prerequisites

- Tokenization completed (*tokenize command run successfully)
- .state.yaml contains consolidation and token data
- Token files exist (tokens.yaml, exports)

## Workflow

### Interactive Elicitation

This task uses interactive elicitation to customize migration strategy.

1. **Assess Team Context**
   - Ask about team size and velocity
   - Current sprint length
   - Risk tolerance (conservative vs aggressive rollout)
   - Availability for migration work

2. **Review Pattern Priority**
   - Show most-used patterns (highest impact first)
   - Confirm prioritization strategy
   - Identify any must-have-first patterns

3. **Define Phase Timeline**
   - Estimate effort per phase
   - Map to sprint schedule
   - Set milestone dates
   - Confirm realistic timeline

### Steps

1. **Load Token and Consolidation Data**
   - Read .state.yaml for consolidation metrics
   - Load token locations
   - Identify pattern counts and reduction percentages
   - Check: .state.yaml contains `phase: "tokenize_complete"` AND token file paths resolve — abort with "Tokenization not completed: run *tokenize first"

2. **Analyze Pattern Impact**
   - Calculate usage frequency for each pattern type
   - Identify highest-impact patterns (most instances)
   - Estimate migration effort per pattern
   - Prioritize by impact/effort ratio
   - Check: priority list count > 0 AND each entry has usage frequency + effort estimate — log "{N} patterns prioritized by impact/effort ratio"

3. **Design Phase 1: Foundation**
   - Goal: Deploy token system with zero visual changes
   - Tasks: Add token files, configure build, update CSS to use tokens
   - Risk: Low (no component changes)
   - Duration: 1 sprint
   - Check: phase-1 has goal, task list, risk level, and duration — abort with "Phase 1 incomplete: missing {field}"

4. **Design Phase 2: High-Impact Patterns**
   - Goal: Replace most-used components for immediate ROI
   - Identify top 3 patterns (buttons, inputs, cards typically)
   - Calculate instances to migrate
   - Estimate effort and ROI
   - Risk: Medium
   - Duration: 2-3 sprints
   - Check: top 3 patterns selected with instance counts and effort estimates — log "Phase 2 targets: {pattern1} ({N1} instances), {pattern2} ({N2}), {pattern3} ({N3})"

5. **Design Phase 3: Long-Tail Cleanup**
   - Goal: Consolidate remaining patterns
   - List remaining components
   - Group by complexity
   - Estimate effort
   - Risk: Low (proven system exists)
   - Duration: 2-4 sprints
   - Check: remaining components listed with complexity groupings and effort estimates — log "{N} remaining patterns grouped into {G} complexity tiers"

6. **Design Phase 4: Enforcement**
   - Goal: Prevent regression
   - Add CI/CD pattern validation
   - Deprecate old components
   - Monitor adoption metrics
   - Risk: Low
   - Duration: 1 sprint
   - Check: enforcement plan includes CI/CD validation step, deprecation list, and monitoring metrics — abort with "Enforcement phase incomplete: missing {field}"

7. **Create Component Mapping**
   - Generate old component → new component mapping
   - Document prop changes
   - Create migration snippets (find/replace patterns)
   - Check: mapping entries count == total component count AND each has old-to-new + prop changes — abort with "Incomplete mapping: {N} components missing"

8. **Define Rollback Procedures**
   - Document rollback steps for each phase
   - Identify rollback trigger conditions
   - Ensure backups exist
   - Check: each phase has rollback steps, trigger conditions, and backup references — abort with "Rollback plan incomplete for phase {N}"

9. **Generate Migration Documentation**
   - Create migration-strategy.md (executive summary)
   - Create phase-specific guides (phase-1.md, phase-2.md, etc)
   - Generate component mapping file
   - Include code examples
   - Check: `test -f migration-strategy.md` AND phase guide files exist for all 4 phases AND file sizes > 0 — abort with "Migration docs generation failed: missing {file}"

10. **Calculate ROI Timeline**
    - Estimate when ROI breakeven occurs
    - Project cumulative savings by phase
    - Show investment vs savings curve
    - Check: ROI projection includes breakeven month and cumulative savings per phase — abort with "ROI projection generation failed"

11. **Update State File**
    - Add migration section to .state.yaml
    - Record phase count, timeline, priorities
    - Update phase to "migration_strategy_complete"
    - Set ready_for_atlas flag
    - Check: .state.yaml contains `phase: "migration_strategy_complete"` AND `ready_for_atlas: true` — abort with "State update failed: {missing field}"

## Output

- **migration-strategy.md**: Executive summary with 4-phase plan
- **phase-1-foundation.md**: Detailed Phase 1 tasks
- **phase-2-high-impact.md**: Detailed Phase 2 tasks
- **phase-3-long-tail.md**: Detailed Phase 3 tasks
- **phase-4-enforcement.md**: Detailed Phase 4 tasks
- **component-mapping.json**: Old → new component map
- **migration-progress.yaml**: Progress tracking template
- **.state.yaml**: Updated with migration plan

### Output Format

```markdown
# Migration Strategy

## Executive Summary

**Target**: Adopt design system with >80% pattern reduction
**Timeline**: 6-8 sprints (12-16 weeks)
**Risk Level**: Medium (phased approach reduces risk)
**ROI Breakeven**: Phase 2 completion (~6 weeks)

## Phase 1: Foundation (1 sprint)

**Goal**: Deploy tokens, zero visual changes

**Tasks**:
- [ ] Add token files to project (tokens.yaml, exports)
- [ ] Configure build pipeline to process tokens
- [ ] Update existing CSS to use CSS custom properties
- [ ] No component changes yet

**Success Criteria**: Tokens deployed, no visual regressions

**Rollback**: Remove token files, revert CSS

## Phase 2: High-Impact Patterns (2-3 sprints)

**Goal**: Replace most-used components for immediate ROI

**Priorities**:
1. Button (327 instances → 3 variants) - 93% reduction
2. Input (189 instances → 5 variants) - 87% reduction
3. Card (145 instances → 2 variants) - 85% reduction

**Success Criteria**: Top 3 patterns migrated, measurable velocity improvement

**Rollback**: Component-level rollback, old components still available

## Phase 3: Long-Tail Cleanup (2-4 sprints)

**Goal**: Consolidate remaining patterns

**Tasks**:
- [ ] Forms (23 variations → 5)
- [ ] Modals (12 variations → 2)
- [ ] Navigation (8 variations → 3)

**Success Criteria**: >85% overall pattern consolidation achieved

## Phase 4: Enforcement (1 sprint)

**Goal**: Prevent regression

**Tasks**:
- [ ] Add CI/CD pattern validation
- [ ] Deprecate old components
- [ ] Block non-system patterns
- [ ] Monitor adoption metrics

**Success Criteria**: System enforced, adoption sustained
```

## Failure Handling

- **No token data available:** BLOCK — re-run *tokenize first. Migration without tokens produces unusable strategy
- **Risk assessment HIGH for >50% of components:** Recommend phased migration starting with lowest-risk components. Add Phase 0 (pilot)
- **Estimated migration >6 months:** Split into quarterly milestones with independent go/no-go gates per milestone
- **Conflicting frameworks detected:** Document each framework's migration path separately before creating unified strategy

## Success Criteria

- [ ] 4 distinct phases defined with clear goals
- [ ] Phase 1 has zero visual changes (safe foundation)
- [ ] Phase 2 prioritizes highest-impact patterns
- [ ] Each phase has success criteria and rollback plan
- [ ] Timeline is realistic for team size/velocity
- [ ] Component mapping covers all patterns
- [ ] ROI breakeven projected accurately

## Quality Gate

> **GATE: Migration Strategy Review** — Human approval required before any migration begins

| Metric | Threshold | Action if FAIL |
|--------|-----------|----------------|
| Token data available | All tokens generated | BLOCK — return to *tokenize. Never plan migration without tokens |
| Risk assessment | No CRITICAL risks unmitigated | Add mitigation plan for each CRITICAL risk before proceeding |
| Estimated duration | Approved by stakeholder | If > 6 months, split into quarterly milestones with independent go/no-go |
| Rollback plan | Defined for each phase | Add rollback steps — migration without rollback is not production-ready |

**Rework rule:** If > 50% of components are HIGH risk, add Phase 0 (pilot) with 2-3 lowest-risk components to validate approach before full migration.

## Error Handling

- **No tokenization data**: Exit with message to run *tokenize first
- **Cannot estimate timeline**: Use defaults, warn user to adjust
- **Insufficient pattern data**: Recommend re-running audit
- **Team context missing**: Use conservative defaults

## Security Considerations

- Migration scripts run with user permissions only
- Validate component mapping to prevent injection
- Backup files before any automated changes
- Rollback procedures tested before execution

## Examples

### Example 1: Migration Strategy Generation

```bash
*migrate
```

Output:
```
🔍 Brad: Generating phased migration strategy...

📊 Pattern Analysis:
  - Buttons: 327 instances (highest priority)
  - Inputs: 189 instances
  - Colors: 1247 usages

🗓️ MIGRATION PLAN (4 phases, 6-8 sprints):

Phase 1: Foundation (1 sprint)
  Deploy tokens, no visual changes
  Risk: LOW

Phase 2: High-Impact (2-3 sprints)
  Migrate Button, Input, Card
  Expected ROI: $31,200/month savings
  Risk: MEDIUM

Phase 3: Long-Tail (2-4 sprints)
  Cleanup remaining 15 patterns
  Risk: LOW

Phase 4: Enforcement (1 sprint)
  CI/CD validation, prevent regression
  Risk: LOW

💰 ROI Projection:
  Investment: ~$12,000
  Breakeven: Week 6 (Phase 2 complete)
  Year 1 Savings: $374,400

✅ Migration docs saved: outputs/design-system/my-app/migration/
✅ Ready for Merovingian to build components
```

### Example 2: Component Mapping

```json
{
  "buttons": {
    ".btn-primary": "Button variant='primary'",
    ".button-primary": "Button variant='primary'",
    ".btn-main": "Button variant='primary'",
    ".btn-secondary": "Button variant='secondary'",
    ".btn-danger": "Button variant='destructive'"
  },
  "props_changed": {
    "Button": {
      "old": "type='primary'",
      "new": "variant='primary'"
    }
  }
}
```

## Notes

- Phase 1 must complete before Phase 2 (foundation required)
- High-impact patterns = most instances × easiest to migrate
- Rollback gets harder as system grows - do it early if needed
- CI/CD enforcement prevents regression (Phase 4 critical)
- Timeline assumes team works on migration alongside features
- Brad says: "Phased rollout = safe rollout. No big-bang rewrites."
- After this, hand off to Merovingian: *agent atlas for component building
## Related Checklists

- `squads/design/checklists/ds-migration-readiness-checklist.md`

