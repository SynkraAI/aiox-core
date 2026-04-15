# Sprint Retrospective

## Purpose

Scrum Master facilitates a sprint retrospective by analyzing completed stories, identifying what went well and what needs improvement, and generating actionable items for the next sprint.

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
task: sprintRetrospective()
responsavel: River (Facilitator)
responsavel_type: Agente
atomic_layer: Organism

**Entrada:**
- campo: sprint_number
  tipo: number
  origem: User Input or Auto-detected
  obrigatorio: false
  validacao: Positive integer; if omitted, detect from latest sprint plan

**Saida:**
- campo: retro_file
  tipo: string
  destino: File system (docs/sprints/retro-sprint-{N}.md)
  persistido: true

- campo: action_items
  tipo: array
  destino: Return value
  persistido: false

- campo: sprint_health
  tipo: string
  destino: Return value
  persistido: false
  values: HEALTHY|NEEDS_ATTENTION|AT_RISK
```

---

## Pre-Conditions

**Purpose:** Validate prerequisites BEFORE task execution (blocking)

**Checklist:**

```yaml
pre-conditions:
  - [ ] Sprint plan exists for the target sprint
    tipo: pre-condition
    blocker: true
    validacao: |
      Check docs/sprints/sprint-plan-{N}.md exists
    error_message: "Pre-condition failed: No sprint plan found for Sprint {N}"

  - [ ] At least one story from the sprint has been worked on
    tipo: pre-condition
    blocker: true
    validacao: |
      Check that at least one story listed in the sprint plan has status Done, In Progress, or Blocked
    error_message: "Pre-condition failed: No stories from this sprint have been worked on"

  - [ ] docs/stories/ directory exists
    tipo: pre-condition
    blocker: true
    validacao: |
      Check docs/stories/ exists
    error_message: "Pre-condition failed: docs/stories/ directory not found"
```

---

## SEQUENTIAL Task Execution (Do not proceed until current Task is complete)

### Step 1: Load Sprint Plan and Identify Stories

- Load `.aios-core/core-config.yaml` and extract `devStoryLocation`
- If `sprint_number` not provided, find the highest sprint plan number in `docs/sprints/`
- Read `docs/sprints/sprint-plan-{N}.md` and extract the list of committed stories
- For each committed story, record:
  - Story ID
  - Title
  - Estimated points
  - Executor
  - Quality gate
- Log: "Retrospective for Sprint {N}: {count} committed stories"

### Step 2: Collect Story Outcomes

- For each committed story, read the story file from `docs/stories/` and extract:
  - **Current status**: Done, In Progress, Blocked, Ready (not started)
  - **Quality gate result**: Look for QA section — APPROVED, NEEDS_WORK, or REJECTED
  - **Blockers**: Look for blocker notes or Blocked status
  - **Completion notes**: Extract from Dev Agent Record section if present
  - **Deviations**: Any scope changes or implementation deviations noted
- Categorize each story outcome:
  - **COMPLETED_CLEAN**: Status=Done, quality_gate=APPROVED
  - **COMPLETED_WITH_ISSUES**: Status=Done, quality_gate=NEEDS_WORK (rework needed)
  - **INCOMPLETE**: Status=In Progress (carried over)
  - **BLOCKED**: Status=Blocked
  - **NOT_STARTED**: Status=Ready (never picked up)
  - **REJECTED**: quality_gate=REJECTED
- Log: "Story outcomes collected: {completed} done, {incomplete} in progress, {blocked} blocked, {not_started} not started"

### Step 3: Calculate Sprint Metrics

- **Velocity**: Total points of COMPLETED_CLEAN + COMPLETED_WITH_ISSUES stories
- **Commitment vs Delivery**: committed_points vs delivered_points
- **Completion Rate**: (completed stories / total committed stories) * 100
- **Quality Rate**: (COMPLETED_CLEAN / total completed) * 100
- **Carry-Over Count**: Number of INCOMPLETE + NOT_STARTED stories
- **Sprint Health**:
  - HEALTHY: Completion >= 80% AND Quality >= 80%
  - NEEDS_ATTENTION: Completion >= 60% OR Quality >= 60%
  - AT_RISK: Completion < 60% AND Quality < 60%
- Log: "Sprint velocity: {velocity} pts | Completion: {rate}% | Quality: {quality_rate}%"

### Step 4: Analyze What Went Well

- Identify positive patterns:
  - Stories completed on time (COMPLETED_CLEAN)
  - Stories that passed quality gate on first review
  - Stories completed ahead of estimate
  - Effective executor/quality_gate pairings
  - Clear acceptance criteria that led to smooth implementation
- For each positive finding, note the contributing factor
- Log: "{N} positive findings identified"

### Step 5: Analyze What Needs Improvement

- Identify improvement areas:
  - Stories that were BLOCKED — what caused the blocker?
  - Stories that were REJECTED or NEEDS_WORK — what was the quality issue?
  - Stories NOT_STARTED — why were they not picked up?
  - Stories INCOMPLETE — what prevented completion?
  - Overestimated stories (completed much faster than estimate)
  - Underestimated stories (took much longer than estimate)
  - Missing or unclear acceptance criteria
  - Dependency issues that caused delays
- For each issue, identify root cause and affected stories
- Log: "{N} improvement areas identified"

### Step 6: Generate Action Items

- For each improvement area, create a specific, actionable item:
  - **Owner**: Which agent or role should address this
  - **Action**: What specific change to make
  - **Priority**: HIGH, MEDIUM, LOW
  - **Target**: When this should be addressed (next sprint, next retro, ongoing)
- Ensure action items are:
  - Specific (not vague like "improve quality")
  - Measurable (can verify if done)
  - Achievable (within team's control)
  - Relevant (addresses identified issue)
  - Time-bound (has a target)
- Log: "{N} action items generated"

### Step 7: Generate Retrospective Document

- Create `docs/sprints/retro-sprint-{N}.md` with the following structure:

```markdown
# Sprint {N} Retrospective

## Sprint Summary
- **Sprint Number:** {N}
- **Sprint Dates:** {start_date} to {end_date}
- **Sprint Health:** {HEALTHY|NEEDS_ATTENTION|AT_RISK}

## Metrics

| Metric | Value |
|--------|-------|
| Committed Points | {committed} |
| Delivered Points | {delivered} |
| Velocity | {velocity} |
| Completion Rate | {rate}% |
| Quality Rate | {quality_rate}% |
| Carry-Over Stories | {count} |

## Story Outcomes

| Story ID | Title | Estimate | Status | Quality Gate | Notes |
|----------|-------|----------|--------|-------------|-------|
| {id}     | {title} | {pts} | {outcome} | {qg_result} | {notes} |

## What Went Well

{Numbered list of positive findings with contributing factors}

## What Needs Improvement

{Numbered list of improvement areas with root cause analysis}

## Action Items

| # | Action | Owner | Priority | Target |
|---|--------|-------|----------|--------|
| 1 | {action} | {owner} | {priority} | {target} |

## Carry-Over Stories

{List of stories carrying over to next sprint with reason}

## Notes

- Generated by @sm on {timestamp}
- Sprint health assessment: {explanation}
```

- Log: "Retrospective generated: docs/sprints/retro-sprint-{N}.md"

---

## Post-Conditions

**Purpose:** Validate execution success AFTER task completes

**Checklist:**

```yaml
post-conditions:
  - [ ] Retrospective file created at docs/sprints/retro-sprint-{N}.md
    tipo: post-condition
    blocker: true
    validacao: |
      Verify file exists and contains all required sections
    error_message: "Post-condition failed: Retrospective file not created"

  - [ ] All committed stories have an outcome recorded
    tipo: post-condition
    blocker: true
    validacao: |
      Verify every story from the sprint plan appears in the Story Outcomes table
    error_message: "Post-condition failed: Missing story outcomes"

  - [ ] At least one action item generated
    tipo: post-condition
    blocker: false
    validacao: |
      Verify action items section is not empty
    error_message: "Warning: No action items generated — review improvement areas"
```

---

## Acceptance Criteria

**Purpose:** Definitive pass/fail criteria for task completion

**Checklist:**

```yaml
acceptance-criteria:
  - [ ] Retrospective covers all three sections: What Went Well, What Needs Improvement, Action Items
    tipo: acceptance-criterion
    blocker: true
    validacao: |
      Assert all three sections exist and are non-empty
    error_message: "Acceptance criterion not met: Missing retrospective sections"

  - [ ] Sprint metrics are calculated and presented
    tipo: acceptance-criterion
    blocker: true
    validacao: |
      Assert velocity, completion rate, and quality rate are present
    error_message: "Acceptance criterion not met: Sprint metrics missing"

  - [ ] Action items are specific and have owners assigned
    tipo: acceptance-criterion
    blocker: true
    validacao: |
      Assert each action item has action description, owner, priority, and target
    error_message: "Acceptance criterion not met: Action items incomplete"
```

---

## Error Handling

**Strategy:** retry

**Common Errors:**

1. **Error:** Sprint Plan Not Found
   - **Cause:** No sprint plan exists for the target sprint number
   - **Resolution:** Run `*sprint-plan` first to create a sprint plan
   - **Recovery:** List available sprint plans, suggest correct sprint number

2. **Error:** Story File Missing
   - **Cause:** Story referenced in sprint plan no longer exists
   - **Resolution:** Note the missing story as "Story file not found" in outcomes
   - **Recovery:** Continue with remaining stories, flag missing story in report

3. **Error:** Cannot Determine Story Outcome
   - **Cause:** Story file lacks status or quality gate information
   - **Resolution:** Default to NOT_STARTED if no status indicators found
   - **Recovery:** Flag story as requiring manual review in retrospective

---

## Performance

**Expected Metrics:**

```yaml
duration_expected: 5-10 min (estimated)
cost_estimated: $0.003-0.010
token_usage: ~3,000-8,000 tokens
```

**Optimization Notes:**
- Story file reads can be parallelized
- Metrics calculation is fast once outcomes are collected

---

## Metadata

```yaml
story: N/A
version: 1.0.0
dependencies:
  - sm-sprint-plan.md
tags:
  - retrospective
  - scrum-master
  - sprint-review
updated_at: 2026-04-10
```

---

## Handoff

next_agent: @sm
next_command: *sprint-plan
condition: Retrospective complete, ready to plan next sprint
alternatives:
  - agent: @po, command: *create-story, condition: Action items require new stories
  - agent: @sm, command: *refine-story {story-id}, condition: Carry-over stories need refinement
