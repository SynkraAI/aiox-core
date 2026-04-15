# Constitution Compliance Gates

## Purpose

This checklist enforces ALL 8 Constitution articles as pre-flight and post-flight gates.
Each gate maps to a Constitution article. Agents run relevant gates before completing any deliverable.

[[LLM: INITIALIZATION INSTRUCTIONS - CONSTITUTION GATE VALIDATION

This checklist is MANDATORY for all agents. Constitution compliance is not optional.

EXECUTION APPROACH:

1. Pre-flight (before starting work):
   - Identify which gates apply to your agent role
   - Run ALL relevant gates
   - BLOCKING gates MUST pass before proceeding
   - WARNING gates are logged but do not halt execution

2. Post-flight (before handoff):
   - Re-verify ALL BLOCKING gates
   - Any failure = HALT and fix before handoff

SEVERITY LEVELS:
- NON-NEGOTIABLE (BLOCKING): Impede execution, requires correction. No override.
- MUST (BLOCKING): Impede execution, requires correction. Override only with documented justification.
- SHOULD (WARNING): Allows continuation with logged alert.

SKIP FLAG:
NON-NEGOTIABLE gates CANNOT be skipped.
MUST gates can be bypassed with --skip-constitution flag + mandatory justification logged:
"WARNING: Constitution gate {N} skipped. Justification: {reason}"
SHOULD gates can be bypassed silently.

The goal is preventing architectural drift, not checking boxes.]]

---

## Gate I: CLI First (NON-NEGOTIABLE) -- BLOCKING

> **Constitution Article I** | **Severity: NON-NEGOTIABLE**
> Applies to: @dev, @architect, @devops

- [ ] New feature works 100% via CLI before any UI implementation
- [ ] No UI-only features exist without CLI equivalent
- [ ] Dashboards only observe -- they never control or make decisions
- [ ] Implementation priority respected: CLI > Observability > UI

**On fail:** HALT -- implement CLI first, then UI. No exceptions.

**Validation:**
```
Check: Does this deliverable introduce new functionality?
  YES -> Verify CLI implementation exists and is functional
  YES -> Verify no UI was created before CLI works
  NO  -> Gate passes (maintenance/bugfix work)
```

---

## Gate II: Agent Authority (NON-NEGOTIABLE) -- BLOCKING

> **Constitution Article II** | **Severity: NON-NEGOTIABLE**
> Applies to: ALL agents

- [ ] Only @devops executes git push, PR creation, releases, and tags
- [ ] Agents operate within their defined scope (no authority overlap)
- [ ] Cross-agent work uses proper handoff artifacts
- [ ] Delegations follow the authority table:

| Authority | Exclusive Agent |
|-----------|----------------|
| git push / PR / Release | @devops |
| Story creation | @sm, @po |
| Architecture decisions | @architect |
| Quality verdicts | @qa |

**On fail:** HALT -- delegate to the authorized agent. No override.

---

## Gate III: Story-Driven Development (MUST) -- BLOCKING

> **Constitution Article III** | **Severity: MUST**
> Applies to: @dev, @sm, @po

- [ ] All development starts with a story in `docs/stories/`
- [ ] Story has acceptance criteria defined (Given/When/Then format preferred)
- [ ] Story has status != "Draft" (Ready, In Progress, or Done)
- [ ] Checkboxes tracked: `[ ]` -> `[x]` as tasks complete
- [ ] File List maintained and up-to-date in story

**On fail:** HALT -- create story first via `@sm *draft` or `@po *create-story`.

**Validation:**
```
Check: Does docs/stories/{storyId}/story.yaml exist?
  NO  -> BLOCK: "No story found. Create one before writing code."
  YES -> Verify acceptance criteria present
  YES -> Verify at least one task/subtask defined
```

---

## Gate IV: No Invention (MUST) -- BLOCKING

> **Constitution Article IV** | **Severity: MUST**
> Applies to: @dev, @architect, @sm

- [ ] Every spec statement traces to a documented requirement (FR-*, NFR-*, CON-*)
- [ ] No features added that are not present in requirements
- [ ] No implementation details assumed without research/validation
- [ ] No technologies specified without prior validation
- [ ] Reuse existing components/patterns before creating new ones (IDS protocol)

**On fail:** HALT -- find existing pattern, create ADR, or trace to requirement.

**Validation:**
```
Check: Does this deliverable introduce new patterns or features?
  YES -> Verify each traces to a requirement or ADR
  YES -> Verify IDS protocol was followed (Search -> Decide -> Log)
  NO  -> Gate passes
```

---

## Gate V: Quality First (MUST) -- BLOCKING

> **Constitution Article V** | **Severity: MUST**
> Applies to: @dev, @qa, @devops

- [ ] `npm run lint` passes with 0 new errors (pre-existing errors documented)
- [ ] `npm run typecheck` passes with 0 new errors
- [ ] `npm test` passes with 0 new failures (if tests exist for changed code)
- [ ] `npm run build` completes successfully (when applicable)
- [ ] No CRITICAL issues from code review tools
- [ ] Test coverage does not decrease

**On fail:** HALT -- fix quality issues before proceeding.

**Validation:**
```
Run: npm run lint && npm run typecheck && npm test
  ANY FAIL -> BLOCK with specific error output
  ALL PASS -> Gate passes
```

---

## Gate VI: Absolute Imports (SHOULD) -- WARNING

> **Constitution Article VI** | **Severity: SHOULD**
> Applies to: @dev

- [ ] All imports use `@/` prefix (no relative `../../../`)
- [ ] Import order follows convention: React > External > UI > Utils > Stores > Features > CSS
- [ ] Exception: Imports within the same module/feature may be relative

**On fail:** WARN -- fix imports when practical. Non-blocking.

**Validation:**
```
Search: grep for '../../../' in changed files
  FOUND -> WARN: "Relative imports detected. Consider using @/ prefix."
  NONE  -> Gate passes
```

---

## Gate VII: Componentize First (MUST) -- BLOCKING

> **Constitution Article VII** | **Severity: MUST**
> Applies to: @dev, @ux-design-expert

- [ ] Atomic Design hierarchy respected: atoms -> molecules -> organisms
- [ ] No component file exceeds 100 lines
- [ ] Mock data lives in separate `.ts` files (never inline in components)
- [ ] DRY enforced: 2+ occurrences = extract to shared component
- [ ] Design tokens centralized (no hardcoded colors, spacing, etc.)
- [ ] Visual components created BEFORE business logic

**On fail:** HALT -- extract component, externalize data, or centralize tokens.

**Validation:**
```
Check: Are new UI components being created?
  YES -> Verify line count <= 100
  YES -> Verify no inline mock data
  YES -> Verify design tokens used (no hardcoded values)
  NO  -> Gate passes (backend/CLI work)
```

---

## Gate VIII: Visual Before Code (SHOULD) -- WARNING

> **Constitution Article VIII** | **Severity: SHOULD**
> Applies to: @dev, @ux-design-expert

- [ ] Frontend features have design spec/wireframe before implementation
- [ ] Design tokens defined before component coding
- [ ] Design squad consulted for new UI patterns
- [ ] Backend/CLI stories may skip this gate

**On fail:** WARN -- consider creating visual spec first. Non-blocking for backend.

**Validation:**
```
Check: Is this a frontend/UI story?
  YES -> Verify design artifact exists (wireframe, mockup, or design-spec)
  YES -> WARN if no design artifact found
  NO  -> Gate passes (backend/CLI work skips this gate)
```

---

## Agent Gate Matrix

Quick reference: which gates each agent MUST verify.

| Gate | @dev | @qa | @architect | @sm | @po | @devops | @ux |
|------|------|-----|------------|-----|-----|---------|-----|
| I. CLI First | X | | X | | | X | |
| II. Agent Authority | X | X | X | X | X | X | X |
| III. Story-Driven | X | | | X | X | | |
| IV. No Invention | X | | X | X | | | |
| V. Quality First | X | X | | | | X | |
| VI. Absolute Imports | X | | | | | | |
| VII. Componentize | X | | | | | | X |
| VIII. Visual Before Code | X | | | | | | X |

---

## Workflow Integration

### Pre-flight (before starting work)
1. Identify your agent role in the Agent Gate Matrix
2. Run all marked gates
3. BLOCKING gates must ALL pass before writing any code
4. WARNING gates are logged -- proceed with awareness

### Post-flight (before handoff)
1. Re-verify ALL BLOCKING gates for your role
2. Any BLOCKING failure = HALT and fix before handoff
3. Log WARNING gate status in handoff artifact

### Story Workflow Checkpoints

| Phase | Who validates | Gates |
|-------|--------------|-------|
| Story creation | @sm, @po | III, IV |
| Implementation | @dev | I, IV, V, VI, VII, VIII |
| Review | @qa | II, V, VII |
| Push | @devops | II, V |

---

## References

- **Constitution:** `.aios-core/constitution.md`
- **CLAUDE.md principles:** `.claude/CLAUDE.md`
- **Gate severity definitions:** Constitution > Governance > Gate Severity Levels
- **Existing gates in tasks:** `.aios-core/development/tasks/dev-develop-story.md`

---

*Constitution Gates v1.0.0 -- Enforcing CLI First | Agent Authority | Quality First*
