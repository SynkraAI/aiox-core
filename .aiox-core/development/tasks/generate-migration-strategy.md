# Generate Phased Migration Strategy

> Task ID: brad-generate-migration-strategy
> Agent: Brad (Design System Architect)
> Version: 1.0.0

## Execution Modes

**Choose your execution mode:**

### 1. YOLO Mode - Fast, Autonomous (0-1 prompts)
- Autonomous decision making with logging
- Minimal user interaction
- **Best for:** Simple, deterministic tasks

### 2. Interactive Mode - Balanced, Educational (5-10 prompts) **[DEFAULT]**
- Explicit decision checkpoints
- Educational explanations
- **Best for:** Learning, complex decisions

### 3. Pre-Flight Planning - Comprehensive Upfront Planning
- Task analysis phase (identify all ambiguities)
- Zero ambiguity execution
- **Best for:** Ambiguous requirements, critical work

**Parameter:** `mode` (optional, default: `interactive`)

---

## Task Definition (AIOX Task Format V1.0)

```yaml
task: generateMigrationStrategy()
responsável: Dara (Sage)
responsavel_type: Agente
atomic_layer: Strategy

**Entrada:**
- campo: name
  tipo: string
  origem: User Input
  obrigatório: true
  validação: Must be non-empty, lowercase, kebab-case

- campo: options
  tipo: object
  origem: User Input
  obrigatório: false
  validação: Valid JSON object with allowed keys

- campo: force
  tipo: boolean
  origem: User Input
  obrigatório: false
  validação: Default: false

**Saída:**
- campo: created_file
  tipo: string
  destino: File system
  persistido: true

- campo: validation_report
  tipo: object
  destino: Memory
  persistido: false

- campo: success
  tipo: boolean
  destino: Return value
  persistido: false
```

---

## Pre-Conditions

**Purpose:** Validate prerequisites BEFORE task execution (blocking)

**Checklist:**

```yaml
pre-conditions:
  - [ ] Target does not already exist; required inputs provided; permissions granted
    tipo: pre-condition
    blocker: true
    validação: |
      Check target does not already exist; required inputs provided; permissions granted
    error_message: "Pre-condition failed: Target does not already exist; required inputs provided; permissions granted"
```

---

## Post-Conditions

**Purpose:** Validate execution success AFTER task completes

**Checklist:**

```yaml
post-conditions:
  - [ ] Resource created successfully; validation passed; no errors logged
    tipo: post-condition
    blocker: true
    validação: |
      Verify resource created successfully; validation passed; no errors logged
    error_message: "Post-condition failed: Resource created successfully; validation passed; no errors logged"
```

---

## Acceptance Criteria

**Purpose:** Definitive pass/fail criteria for task completion

**Checklist:**

```yaml
acceptance-criteria:
  - [ ] Resource exists and is valid; no duplicate resources created
    tipo: acceptance-criterion
    blocker: true
    validação: |
      Assert resource exists and is valid; no duplicate resources created
    error_message: "Acceptance criterion not met: Resource exists and is valid; no duplicate resources created"
```

---

## Tools

**External/shared resources used by this task:**

- **Tool:** component-generator
  - **Purpose:** Generate new components from templates
  - **Source:** .aiox-core/scripts/component-generator.js

- **Tool:** file-system
  - **Purpose:** File creation and validation
  - **Source:** Node.js fs module

---

## Scripts

**Agent-specific code for this task:**

- **Script:** create-component.js
  - **Purpose:** Component creation workflow
  - **Language:** JavaScript
  - **Location:** .aiox-core/scripts/create-component.js

---

## Error Handling

**Strategy:** retry

**Common Errors:**

1. **Error:** Resource Already Exists
   - **Cause:** Target file/resource already exists in system
   - **Resolution:** Use force flag or choose different name
   - **Recovery:** Prompt user for alternative name or force overwrite

2. **Error:** Invalid Input
   - **Cause:** Input name contains invalid characters or format
   - **Resolution:** Validate input against naming rules (kebab-case, lowercase, no special chars)
   - **Recovery:** Sanitize input or reject with clear error message

3. **Error:** Permission Denied
   - **Cause:** Insufficient permissions to create resource
   - **Resolution:** Check file system permissions, run with elevated privileges if needed
   - **Recovery:** Log error, notify user, suggest permission fix

---

## Performance

**Expected Metrics:**

```yaml
duration_expected: 5-20 min (estimated)
cost_estimated: $0.003-0.015
token_usage: ~2,000-8,000 tokens
```

**Optimization Notes:**
- Iterative analysis with depth limits; cache intermediate results; batch similar operations

---

## Metadata

```yaml
story: N/A
version: 1.0.0
dependencies:
  - N/A
tags:
  - automation
  - workflow
updated_at: 2025-11-17
```

---


## Description

Create realistic 4-phase migration plan to gradually adopt design system without blocking sprints. Prioritizes high-impact patterns first, includes rollback procedures, tracks progress.

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
   - Validation: Tokenization phase completed

2. **Analyze Pattern Impact**
   - Calculate usage frequency for each pattern type
   - Identify highest-impact patterns (most instances)
   - Estimate migration effort per pattern
   - Prioritize by impact/effort ratio
   - Validation: Priority list created

3. **Design Phase 1: Foundation**
   - Goal: Deploy token system with zero visual changes
   - Tasks: Add token files, configure build, update CSS to use tokens
   - Risk: Low (no component changes)
   - Duration: 1 sprint
   - Validation: Phase plan defined

4. **Design Phase 2: High-Impact Patterns**
   - Goal: Replace most-used components for immediate ROI
   - Identify top 3 patterns (buttons, inputs, cards typically)
   - Calculate instances to migrate
   - Estimate effort and ROI
   - Risk: Medium
   - Duration: 2-3 sprints
   - Validation: High-impact patterns identified

5. **Design Phase 3: Long-Tail Cleanup**
   - Goal: Consolidate remaining patterns
   - List remaining components
   - Group by complexity
   - Estimate effort
   - Risk: Low (proven system exists)
   - Duration: 2-4 sprints
   - Validation: Cleanup plan created

6. **Design Phase 4: Enforcement**
   - Goal: Prevent regression
   - Add CI/CD pattern validation
   - Deprecate old components
   - Monitor adoption metrics
   - Risk: Low
   - Duration: 1 sprint
   - Validation: Enforcement strategy defined

7. **Create Component Mapping**
   - Generate old component → new component mapping
   - Document prop changes
   - Create migration snippets (find/replace patterns)
   - Validation: Complete mapping for all components

8. **Define Rollback Procedures**
   - Document rollback steps for each phase
   - Identify rollback trigger conditions
   - Ensure backups exist
   - Validation: Rollback plan documented

9. **Generate Migration Documentation**
   - Create migration-strategy.md (executive summary)
   - Create phase-specific guides (phase-1.md, phase-2.md, etc)
   - Generate component mapping file
   - Include code examples
   - Validation: Complete migration docs created

10. **Calculate ROI Timeline**
    - Estimate when ROI breakeven occurs
    - Project cumulative savings by phase
    - Show investment vs savings curve
    - Validation: ROI projection created

11. **Update State File**
    - Add migration section to .state.yaml
    - Record phase count, timeline, priorities
    - Update phase to "migration_strategy_complete"
    - Set ready_for_atlas flag
    - Validation: State updated for Atlas handoff

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

## Critical References

**ALWAYS include these in migration strategy docs:**

- **Migration Validation Checklist** (`migration-validation-checklist.md`)
  - Run AFTER every migration script execution
  - Detects corrupted classes, build failures, visual regressions
  - 5-10 min validation saves hours of debugging
  - **Non-negotiable** - must be followed before committing

- **Migration Pitfalls** (`migration-pitfalls.md`)
  - Common mistakes and how to avoid them
  - Anti-patterns from real incidents
  - Detection patterns for corruption
  - Prevention strategies

**In every phase guide, include:**
```markdown
## Validation

After executing migration scripts:
1. Run migration-validation-checklist.md (ALL steps)
2. Review migration-pitfalls.md for common issues
3. Do NOT commit until validation passes

See: Squads/super-agentes/checklists/migration-validation-checklist.md
```

## Success Criteria

- [ ] 4 distinct phases defined with clear goals
- [ ] Phase 1 has zero visual changes (safe foundation)
- [ ] Phase 2 prioritizes highest-impact patterns
- [ ] Each phase has success criteria and rollback plan
- [ ] Timeline is realistic for team size/velocity
- [ ] Component mapping covers all patterns
- [ ] ROI breakeven projected accurately

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
✅ Ready for Atlas to build components
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
- After this, hand off to Atlas: *agent atlas for component building
