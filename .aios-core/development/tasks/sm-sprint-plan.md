# Sprint Plan

## Purpose

Scrum Master creates a sprint plan by selecting prioritized stories from the backlog that fit within sprint capacity, producing a structured sprint plan document with dependencies and risk analysis.

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
task: sprintPlan()
responsavel: River (Facilitator)
responsavel_type: Agente
atomic_layer: Organism

**Entrada:**
- campo: sprint_number
  tipo: number
  origem: User Input or Auto-detected
  obrigatorio: false
  validacao: Positive integer; if omitted, auto-increment from last sprint

- campo: capacity
  tipo: number
  origem: User Input
  obrigatorio: false
  validacao: Positive integer, default 10 story points

- campo: sprint_duration
  tipo: string
  origem: User Input
  obrigatorio: false
  validacao: Default "2 weeks"

**Saida:**
- campo: sprint_plan_file
  tipo: string
  destino: File system (docs/sprints/sprint-plan-{N}.md)
  persistido: true

- campo: selected_stories
  tipo: array
  destino: Return value
  persistido: false

- campo: total_points
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

  - [ ] At least one story has status Ready or Approved
    tipo: pre-condition
    blocker: true
    validacao: |
      Scan story files for status field matching Ready or Approved
    error_message: "Pre-condition failed: No stories with status Ready or Approved found"

  - [ ] core-config.yaml exists and is readable
    tipo: pre-condition
    blocker: true
    validacao: |
      Check .aios-core/core-config.yaml exists
    error_message: "Pre-condition failed: core-config.yaml not found"
```

---

## SEQUENTIAL Task Execution (Do not proceed until current Task is complete)

### Step 1: Load Configuration and Determine Sprint Number

- Load `.aios-core/core-config.yaml` and extract `devStoryLocation`
- Check `docs/sprints/` directory for existing sprint plans
- If `sprint_number` not provided, auto-detect by finding the highest existing sprint plan number and incrementing by 1
- If no previous sprints exist, set sprint_number to 1
- Calculate sprint dates: start_date = today, end_date = start_date + sprint_duration
- Log: "Planning Sprint {sprint_number}: {start_date} to {end_date}"

### Step 2: Read Active Epic(s) and Catalog Stories

- Scan `docs/stories/` for all `.story.md` files
- For each story, extract:
  - Story ID (e.g., `1.3`)
  - Title
  - Status (Draft, Ready, Approved, In Progress, Done, Blocked)
  - Estimate size (S, M, L, XL)
  - Epic number
  - Dependencies (if listed)
  - Executor and quality_gate assignments
- Build a catalog of all stories with their metadata
- Log: "Found {N} total stories across {M} epics"

### Step 3: Filter Eligible Stories

- Filter stories to only those with status `Ready` or `Approved`
- Exclude stories already assigned to a previous sprint (check existing sprint plan files)
- Exclude stories with status `Done` or `In Progress`
- Sort eligible stories by:
  1. Epic priority (lower epic number = higher priority)
  2. Story sequence within epic (lower story number = higher priority)
- Log: "Found {N} eligible stories for sprint planning"

### Step 4: Calculate Story Points and Select Stories

- Map estimate sizes to story points:
  - S = 1 point
  - M = 2 points
  - L = 3 points
  - XL = 5 points
  - If no estimate provided, default to M (2 points) and flag for review
- Set sprint capacity (default: 10 points, or user-provided value)
- Select stories in priority order until capacity is reached:
  - If adding next story would exceed capacity by more than 1 point, stop
  - If adding next story would exceed capacity by exactly 1 point, include it (slight over-commitment is acceptable)
- Track total selected points vs capacity
- Log: "Selected {N} stories totaling {P} points (capacity: {C})"

### Step 5: Analyze Dependencies Between Selected Stories

- For each selected story, check if it depends on another story
- Build dependency graph for selected stories
- Identify dependency conflicts:
  - **CRITICAL**: Selected story depends on a non-selected story that is not Done
  - **WARNING**: Selected story depends on another selected story (ordering matters)
  - **INFO**: Selected story depends on a Done story (resolved)
- If CRITICAL dependency found: either include the dependency story (if capacity allows) or flag for user decision
- Determine execution order based on dependency chain

### Step 6: Identify Risks

- Flag stories without estimates as risk ("Unestimated story included")
- Flag stories without executor assignment as risk ("No executor assigned")
- Flag stories without quality_gate assignment as risk ("No quality gate assigned")
- Flag dependency chains longer than 2 stories as risk ("Long dependency chain")
- Flag if total points exceed capacity as risk ("Sprint over-committed")
- Flag if total points are less than 70% of capacity as risk ("Sprint under-committed")
- Categorize risks as HIGH, MEDIUM, or LOW

### Step 7: Generate Sprint Plan Document

- Create `docs/sprints/` directory if it does not exist
- Generate `docs/sprints/sprint-plan-{N}.md` with the following structure:

```markdown
# Sprint {N} Plan

## Sprint Overview
- **Sprint Number:** {N}
- **Start Date:** {start_date}
- **End Date:** {end_date}
- **Capacity:** {capacity} story points
- **Committed Points:** {total_points}
- **Utilization:** {percentage}%

## Selected Stories

| # | Story ID | Title | Estimate | Points | Executor | Quality Gate | Dependencies |
|---|----------|-------|----------|--------|----------|-------------|-------------|
| 1 | {id}     | {title} | {size} | {pts} | {exec}  | {qg}        | {deps}      |

## Execution Order

{Ordered list based on dependency analysis}

## Dependencies

{Dependency graph and resolution status}

## Risks

| Severity | Risk | Story | Mitigation |
|----------|------|-------|------------|
| {level}  | {description} | {story_id} | {suggestion} |

## Sprint Goals

{Auto-generated summary of what this sprint aims to deliver, based on selected stories}

## Notes

- Generated by @sm on {timestamp}
- Capacity model: S=1, M=2, L=3, XL=5
```

- Log: "Sprint plan generated: docs/sprints/sprint-plan-{N}.md"

---

## Post-Conditions

**Purpose:** Validate execution success AFTER task completes

**Checklist:**

```yaml
post-conditions:
  - [ ] Sprint plan file created at docs/sprints/sprint-plan-{N}.md
    tipo: post-condition
    blocker: true
    validacao: |
      Verify file exists and contains all required sections
    error_message: "Post-condition failed: Sprint plan file not created"

  - [ ] Total committed points do not exceed capacity by more than 1 point
    tipo: post-condition
    blocker: false
    validacao: |
      Verify total_points <= capacity + 1
    error_message: "Warning: Sprint significantly over-committed"

  - [ ] All selected stories have status Ready or Approved
    tipo: post-condition
    blocker: true
    validacao: |
      Verify no Draft or Blocked stories were selected
    error_message: "Post-condition failed: Invalid story status in sprint plan"
```

---

## Acceptance Criteria

**Purpose:** Definitive pass/fail criteria for task completion

**Checklist:**

```yaml
acceptance-criteria:
  - [ ] Sprint plan document exists with all required sections
    tipo: acceptance-criterion
    blocker: true
    validacao: |
      Assert sprint plan has Overview, Selected Stories, Execution Order, Dependencies, and Risks sections
    error_message: "Acceptance criterion not met: Sprint plan missing required sections"

  - [ ] All selected stories are eligible (status Ready or Approved)
    tipo: acceptance-criterion
    blocker: true
    validacao: |
      Assert no ineligible stories were included in the sprint plan
    error_message: "Acceptance criterion not met: Ineligible stories in sprint plan"

  - [ ] Dependencies between selected stories are identified and ordered
    tipo: acceptance-criterion
    blocker: true
    validacao: |
      Assert dependency analysis was performed and execution order reflects it
    error_message: "Acceptance criterion not met: Dependency analysis missing"
```

---

## Error Handling

**Strategy:** retry

**Common Errors:**

1. **Error:** No Eligible Stories Found
   - **Cause:** All stories are in Draft, Blocked, Done, or In Progress status
   - **Resolution:** Review story statuses and promote Draft stories to Ready
   - **Recovery:** List all stories with their current status, suggest which to promote

2. **Error:** Capacity Exceeded With Single Story
   - **Cause:** First eligible story (XL=5) already exceeds capacity
   - **Resolution:** Increase sprint capacity or break XL story into smaller stories
   - **Recovery:** Suggest story splitting strategy

3. **Error:** Circular Dependency Detected
   - **Cause:** Story A depends on B, B depends on A
   - **Resolution:** Review and fix dependency declarations in story files
   - **Recovery:** Flag circular dependency chain, list affected stories

---

## Performance

**Expected Metrics:**

```yaml
duration_expected: 3-8 min (estimated)
cost_estimated: $0.002-0.008
token_usage: ~2,000-6,000 tokens
```

**Optimization Notes:**
- Story scanning can be parallelized across epic directories
- Cache story metadata for repeated planning sessions

---

## Metadata

```yaml
story: N/A
version: 1.0.0
dependencies:
  - N/A
tags:
  - sprint-planning
  - scrum-master
  - backlog
updated_at: 2026-04-10
```

---

## Handoff

next_agent: @dev
next_command: *develop {first-story-id}
condition: Sprint plan approved and first story is Ready
alternatives:
  - agent: @po, command: *validate-story-draft {story-id}, condition: Selected stories need validation before sprint start
  - agent: @sm, command: *refine-story {story-id}, condition: Stories need refinement before sprint commitment
