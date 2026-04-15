# Blockers Report

## Purpose

Scrum Master surfaces all blocked stories and unresolved dependencies across the active sprint, categorizes them by severity, and generates a blockers report with suggested resolutions.

---

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

## Task Definition (AIOS Task Format V1.0)

```yaml
task: blockersReport()
responsavel: River (Facilitator)
responsavel_type: Agente
atomic_layer: Organism

**Entrada:**
- campo: sprint_number
  tipo: number
  origem: User Input or Auto-detected
  obrigatorio: false
  validacao: Positive integer; if omitted, detect from latest sprint plan

- campo: output_file
  tipo: boolean
  origem: User Input
  obrigatorio: false
  validacao: Default false (console output only); if true, also writes to file

**Saida:**
- campo: blockers_report
  tipo: string
  destino: Console output (always) + optional file (docs/sprints/blockers-report.md)
  persistido: conditional

- campo: blocker_count
  tipo: number
  destino: Return value
  persistido: false

- campo: critical_count
  tipo: number
  destino: Return value
  persistido: false
```

---

## Pre-Conditions

**Purpose:** Validate prerequisites BEFORE task execution (blocking)

**Checklist:**

```yaml
pre-conditions:
  - [ ] docs/stories/ directory exists and contains story files
    tipo: pre-condition
    blocker: true
    validacao: |
      Check docs/stories/ exists and has at least one .story.md file
    error_message: "Pre-condition failed: No story files found in docs/stories/"

  - [ ] Sprint plan exists for the target sprint (if sprint_number provided)
    tipo: pre-condition
    blocker: false
    validacao: |
      If sprint_number given, check docs/sprints/sprint-plan-{N}.md exists.
      If no sprint plan, scan all non-Done stories instead.
    error_message: "Warning: No sprint plan found for Sprint {N} — scanning all active stories"
```

---

## SEQUENTIAL Task Execution (Do not proceed until current Task is complete)

### Step 1: Determine Scope of Analysis

- Load `.aios-core/core-config.yaml` and extract `devStoryLocation`
- If `sprint_number` provided and sprint plan exists:
  - Read `docs/sprints/sprint-plan-{N}.md` and extract committed story list
  - Scope = only stories in the sprint plan
  - Log: "Analyzing blockers for Sprint {N} ({count} committed stories)"
- If no sprint_number or no sprint plan found:
  - Scope = all stories in `docs/stories/` that are NOT status Done
  - Log: "Analyzing blockers across all active stories ({count} stories)"

### Step 2: Scan Stories for Blocker Indicators

For each story in scope, read the story file and check for:

**2a. Explicit Blocked Status**
- Story status field equals "Blocked"
- Extract blocker reason if documented in the story
- Severity: CRITICAL

**2b. Dependency on Incomplete Stories**
- Story lists dependencies on other stories
- Check if each dependency story has status Done
- If dependency is NOT Done: this story is dependency-blocked
- Severity: CRITICAL if dependency is also Blocked; HIGH if dependency is In Progress; MEDIUM if dependency is Ready/Draft

**2c. Missing Executor Assignment**
- Story has no executor field or executor is empty
- Story cannot be picked up for implementation without an executor
- Severity: HIGH if story status is Ready/Approved; MEDIUM if Draft

**2d. Missing Quality Gate Assignment**
- Story has no quality_gate field or quality_gate is empty
- Story cannot complete the review cycle without a quality gate
- Severity: MEDIUM

**2e. Failed Quality Gates**
- Story has quality gate result of REJECTED or NEEDS_WORK
- Story requires rework or re-review
- Severity: HIGH if REJECTED; MEDIUM if NEEDS_WORK

**2f. Stale In-Progress Stories**
- Story status is In Progress but has no recent activity (no git commits referencing story ID in last 5 days)
- May indicate a silent blocker
- Severity: MEDIUM

- Log: "Scan complete: {N} blockers found across {M} stories"

### Step 3: Build Dependency Chains

- For each dependency-blocked story, trace the full dependency chain:
  - Story A depends on Story B depends on Story C
  - If any story in the chain is Blocked, the entire chain is CRITICAL
- Identify circular dependencies (A depends on B, B depends on A)
- Build a visual dependency tree for the report
- Log: "{N} dependency chains analyzed, {M} circular dependencies found"

### Step 4: Categorize and Prioritize Blockers

- Group all identified blockers by severity:

| Severity | Criteria |
|----------|----------|
| CRITICAL | Explicitly Blocked status; dependency on Blocked story; circular dependency |
| HIGH     | Dependency on incomplete story (In Progress); REJECTED quality gate; missing executor on Ready story |
| MEDIUM   | NEEDS_WORK quality gate; missing quality_gate assignment; stale In Progress; missing executor on Draft story |

- Within each severity, sort by:
  1. Number of downstream stories affected (more = higher priority)
  2. Sprint plan position (earlier = higher priority)
  3. Story ID (ascending)

### Step 5: Generate Resolution Suggestions

For each blocker, generate a specific suggested resolution:

| Blocker Type | Suggested Resolution |
|-------------|---------------------|
| Explicitly Blocked | "@sm investigate blocker reason and coordinate with {executor}" |
| Dependency not Done | "Prioritize {dependency_id} completion or decouple {story_id} from dependency" |
| Circular dependency | "Break circular dependency: remove dependency from {story_id_A} or {story_id_B}" |
| Missing executor | "@po assign executor to {story_id} — suggested: {recommended_executor based on story type}" |
| Missing quality gate | "@po assign quality gate to {story_id} — suggested: {recommended_qg based on executor}" |
| REJECTED | "@sm schedule refinement for {story_id} to address rejection feedback" |
| NEEDS_WORK | "@{executor} address quality gate feedback on {story_id}" |
| Stale In Progress | "@sm check in with {executor} on {story_id} — no activity detected" |

### Step 6: Generate Blockers Report

- Produce the report in the following format (always output to console):

```markdown
# Blockers Report

## Summary
- **Sprint:** {N} (or "All Active Stories")
- **Generated:** {timestamp}
- **Total Blockers:** {count}
- **CRITICAL:** {critical_count}
- **HIGH:** {high_count}
- **MEDIUM:** {medium_count}

## CRITICAL Blockers

| # | Story ID | Title | Blocker Type | Reason | Resolution |
|---|----------|-------|-------------|--------|------------|
| 1 | {id}     | {title} | {type}    | {reason} | {resolution} |

## HIGH Blockers

| # | Story ID | Title | Blocker Type | Reason | Resolution |
|---|----------|-------|-------------|--------|------------|
| 1 | {id}     | {title} | {type}    | {reason} | {resolution} |

## MEDIUM Blockers

| # | Story ID | Title | Blocker Type | Reason | Resolution |
|---|----------|-------|-------------|--------|------------|
| 1 | {id}     | {title} | {type}    | {reason} | {resolution} |

## Dependency Chains

{Visual dependency trees for blocked chains}

## Recommended Actions

{Prioritized list of actions to unblock the sprint}

1. [CRITICAL] {action} — unblocks {N} stories
2. [HIGH] {action} — unblocks {N} stories
...

## Notes

- Generated by @sm on {timestamp}
- Stories with no blockers: {count}
```

- If `output_file` is true, also write to `docs/sprints/blockers-report.md`
- If no blockers found, output: "No blockers found. All {N} stories in scope are unblocked."
- Log: "Blockers report generated: {critical} CRITICAL, {high} HIGH, {medium} MEDIUM"

---

## Post-Conditions

**Purpose:** Validate execution success AFTER task completes

**Checklist:**

```yaml
post-conditions:
  - [ ] All stories in scope were scanned for blocker indicators
    tipo: post-condition
    blocker: true
    validacao: |
      Verify every story in scope was analyzed
    error_message: "Post-condition failed: Not all stories were scanned"

  - [ ] Blockers are categorized by severity with resolutions
    tipo: post-condition
    blocker: true
    validacao: |
      Verify each blocker has severity classification and suggested resolution
    error_message: "Post-condition failed: Blockers missing severity or resolution"

  - [ ] Report output to console
    tipo: post-condition
    blocker: true
    validacao: |
      Verify report was displayed to user
    error_message: "Post-condition failed: Report not output to console"
```

---

## Acceptance Criteria

**Purpose:** Definitive pass/fail criteria for task completion

**Checklist:**

```yaml
acceptance-criteria:
  - [ ] All six blocker types are checked for each story
    tipo: acceptance-criterion
    blocker: true
    validacao: |
      Assert blocked status, dependencies, executor, quality_gate, failed gates, and staleness were all checked
    error_message: "Acceptance criterion not met: Not all blocker types were checked"

  - [ ] Blockers are categorized as CRITICAL, HIGH, or MEDIUM with clear criteria
    tipo: acceptance-criterion
    blocker: true
    validacao: |
      Assert each blocker has a severity level matching the defined criteria
    error_message: "Acceptance criterion not met: Blocker severity not properly categorized"

  - [ ] Each blocker has a specific, actionable resolution suggestion
    tipo: acceptance-criterion
    blocker: true
    validacao: |
      Assert every blocker entry includes a resolution with agent mention and action
    error_message: "Acceptance criterion not met: Blockers missing resolution suggestions"
```

---

## Error Handling

**Strategy:** retry

**Common Errors:**

1. **Error:** No Stories Found
   - **Cause:** docs/stories/ is empty or devStoryLocation is misconfigured
   - **Resolution:** Verify core-config.yaml devStoryLocation setting
   - **Recovery:** Display config path, suggest creating stories first

2. **Error:** Story File Parse Error
   - **Cause:** Story file has malformed YAML frontmatter or unexpected format
   - **Resolution:** Skip the problematic story and continue scanning others
   - **Recovery:** Note unparseable story in report as "Parse Error — manual review needed"

3. **Error:** Sprint Plan References Non-Existent Story
   - **Cause:** Story was deleted or renamed after sprint planning
   - **Resolution:** Note as CRITICAL blocker ("Story file missing")
   - **Recovery:** Include in report with resolution "Locate or recreate story {story_id}"

---

## Performance

**Expected Metrics:**

```yaml
duration_expected: 2-5 min (estimated)
cost_estimated: $0.002-0.006
token_usage: ~2,000-5,000 tokens
```

**Optimization Notes:**
- Story scanning can be parallelized
- Git activity check (for stale detection) can be batched into a single git log call
- Report is lightweight — most time spent reading story files

---

## Metadata

```yaml
story: N/A
version: 1.0.0
dependencies:
  - N/A
tags:
  - blockers
  - scrum-master
  - sprint-health
  - dependencies
updated_at: 2026-04-10
```

---

## Handoff

next_agent: @sm
next_command: *refine-story {blocked-story-id}
condition: CRITICAL or HIGH blockers found that need story refinement
alternatives:
  - agent: @po, command: *validate-story-draft {story-id}, condition: Blocker is missing executor or quality gate assignment
  - agent: @dev, command: *develop {dependency-story-id}, condition: Blocker is unfinished dependency that needs implementation
