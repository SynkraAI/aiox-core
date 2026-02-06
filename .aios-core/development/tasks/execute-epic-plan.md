---

## Execution Modes

**Choose your execution mode:**

### 1. YOLO Mode - Autonomous (0-2 prompts)
- Waves auto-proceed after gate approval
- Checkpoints default to GO
- **Best for:** Well-tested epics with low conflict risk

### 2. Interactive Mode - Balanced (5-10 prompts) **[DEFAULT]**
- Human checkpoint between waves
- Gate review before merge
- **Best for:** First epic execution, medium-high complexity

### 3. Pre-Flight Planning - Comprehensive Analysis
- Full dependency analysis before execution
- Dry-run wave structure validation
- **Best for:** Very high complexity epics, unknown conflict risk

**Parameter:** `mode` (optional, default: `interactive`)

---

## Task Definition (AIOS Task Format V1.0)

```yaml
task: executeEpicPlan()
responsavel: Morgan (PM)
responsavel_type: Agente
atomic_layer: Orchestration

**Entrada:**
- campo: execution_plan_path
  tipo: string
  origem: User Input
  obrigatório: true
  validação: Must be a valid path to an EXECUTION.yaml file (typically in docs/stories/epics/{epic}/)

- campo: action
  tipo: string
  origem: User Input
  obrigatório: false
  validação: Must be "start", "continue", "status", "skip-story", or "abort". Default: "start"

- campo: mode
  tipo: string
  origem: User Input
  obrigatório: false
  validação: Must be "yolo", "interactive", or "preflight". Default: "interactive"

- campo: wave
  tipo: number
  origem: User Input
  obrigatório: false
  validação: Wave number to resume from (only with action=continue). Default: auto-detect from state.

**Saída:**
- campo: epic_state
  tipo: object
  destino: File system (.aios/epic-{epicId}-state.yaml)
  persistido: true

- campo: wave_report
  tipo: object
  destino: Output
  persistido: false

- campo: next_steps
  tipo: string
  destino: Output
  persistido: false
```

---

## Pre-Conditions

```yaml
pre-conditions:
  - [ ] execution_plan_path must resolve to an existing YAML file
    tipo: pre-condition
    blocker: true
    validação: |
      File must exist and contain execution.epicId, execution.stories, execution.waves
    error_message: "Pre-condition failed: Execution plan not found at '{execution_plan_path}'"

  - [ ] All story files referenced in the plan must exist
    tipo: pre-condition
    blocker: true
    validação: |
      For each story in execution.stories, verify {storyBasePath}/{story.file} exists
    error_message: "Pre-condition failed: Story file '{story.file}' not found"

  - [ ] Template workflow must exist
    tipo: pre-condition
    blocker: true
    validação: |
      execution.template must resolve to .aios-core/development/workflows/{template}.yaml
    error_message: "Pre-condition failed: Template '{template}' not found"

  - [ ] For action=continue, state file must exist
    tipo: pre-condition
    blocker: true
    validação: |
      .aios/epic-{epicId}-state.yaml must exist with status=active
    error_message: "Pre-condition failed: No active state found. Use action=start first."

  - [ ] Git working tree must be clean (no uncommitted changes)
    tipo: pre-condition
    blocker: true
    validação: |
      git status --porcelain returns empty or only untracked files
    error_message: "Pre-condition failed: Uncommitted changes detected. Commit or stash first."
```

---

## Post-Conditions

```yaml
post-conditions:
  - [ ] State file updated with current wave progress
    tipo: post-condition
    blocker: true
    validação: |
      .aios/epic-{epicId}-state.yaml exists and reflects completed waves/stories
    error_message: "Post-condition failed: State file not persisted"

  - [ ] All completed stories have branches pushed
    tipo: post-condition
    blocker: false
    validação: |
      For each completed story, git branch {story.branch} exists
    error_message: "Warning: Some story branches may not have been pushed"
```

---

## Acceptance Criteria

```yaml
acceptance-criteria:
  - [ ] Each story in each wave was executed via development-cycle
    tipo: acceptance-criterion
    blocker: true
    validação: |
      Each story spawned a subagent that followed the full development-cycle
      (PO validate -> Executor develop -> Self-healing -> Quality gate -> DevOps push)
    error_message: "Acceptance criterion not met: Stories did not follow development-cycle"

  - [ ] Wave gates were executed between waves
    tipo: acceptance-criterion
    blocker: true
    validação: |
      After each wave, the gate agent reviewed cross-story integration
    error_message: "Acceptance criterion not met: Wave gates skipped"

  - [ ] State supports resume across sessions
    tipo: acceptance-criterion
    blocker: true
    validação: |
      Aborting and running action=continue resumes from last completed wave
    error_message: "Acceptance criterion not met: Resume not working"
```

---

## Tools

- **Tool:** Task tool (Claude Code built-in)
  - **Purpose:** Spawn subagents for story development-cycle and wave gates
  - **Source:** Claude Code runtime

- **Tool:** Read tool (Claude Code built-in)
  - **Purpose:** Read execution plan, story files, workflow templates
  - **Source:** Claude Code runtime

- **Tool:** Write tool (Claude Code built-in)
  - **Purpose:** Persist epic state file
  - **Source:** Claude Code runtime

- **Tool:** AskUserQuestion (Claude Code built-in)
  - **Purpose:** Wave checkpoints (GO/PAUSE/REVIEW/ABORT)
  - **Source:** Claude Code runtime

- **Tool:** Bash (Claude Code built-in)
  - **Purpose:** Git operations (branch check, worktree creation)
  - **Source:** Claude Code runtime

---

## Error Handling

**Strategy:** retry-at-story-level

**Common Errors:**

1. **Error:** Story development-cycle fails
   - **Cause:** Dev agent encountered an error, tests fail, etc.
   - **Resolution:** development-cycle handles retries internally (max 3)
   - **Recovery:** If still failing, mark story as blocked, continue other stories in wave

2. **Error:** Wave gate fails
   - **Cause:** Integration issues between stories in wave
   - **Resolution:** Gate agent identifies specific issues
   - **Recovery:** Create fix tasks, re-run affected stories, re-submit gate

3. **Error:** Merge conflict between wave branches
   - **Cause:** Stories modified overlapping files
   - **Resolution:** Follow merge order from execution plan
   - **Recovery:** Resolve conflicts manually, re-run tests

4. **Error:** State file corrupted
   - **Cause:** Interrupted write, concurrent access
   - **Resolution:** Backup state before each write
   - **Recovery:** Restore from .aios/epic-{epicId}-state.yaml.bak

---

## Performance

```yaml
duration_per_wave: 30-120 min (depends on story count and complexity)
duration_total: 2-8 hours (depends on epic size)
cost_per_story: $0.05-0.50 (subagent spawning)
token_usage: ~5,000-20,000 tokens per story cycle
```

---

## Metadata

```yaml
story: EPIC-ACT (epic infrastructure)
version: 1.0.0
dependencies:
  - epic-orchestration.yaml (template)
  - development-cycle.yaml (inner loop per story)
  - po-epic-context.md (epic context tracking)
  - validate-next-story.md (PO story validation)
tags:
  - epic
  - orchestration
  - wave-execution
  - parallel-development
  - quality-gates
updated_at: 2026-02-06
```

---

# Execute Epic Plan Task

## Purpose

Orchestrate the execution of an epic by reading a project-specific EXECUTION.yaml plan,
processing stories in wave-based parallel execution, running each story through the full
`development-cycle` (PO validate -> Dev implement -> Self-heal -> QA review -> DevOps push),
managing wave quality gates, and persisting state for resume across sessions.

## Prerequisites

- Execution plan YAML exists (e.g., `docs/stories/epics/{epic}/EPIC-{ID}-EXECUTION.yaml`)
- Template `epic-orchestration.yaml` exists in `.aios-core/development/workflows/`
- Inner loop `development-cycle.yaml` exists in `.aios-core/development/workflows/`
- All story files referenced in the plan exist
- Git working tree is clean

---

## Command

```
@pm *execute-epic {path-to-EXECUTION.yaml} [action] [--mode=interactive]
```

### Examples

```bash
# Start a new epic execution
@pm *execute-epic docs/stories/epics/epic-activation-pipeline/EPIC-ACT-EXECUTION.yaml

# Resume from where you left off
@pm *execute-epic docs/stories/epics/epic-activation-pipeline/EPIC-ACT-EXECUTION.yaml continue

# Check current progress
@pm *execute-epic docs/stories/epics/epic-activation-pipeline/EPIC-ACT-EXECUTION.yaml status

# Start in YOLO mode (autonomous)
@pm *execute-epic docs/stories/epics/epic-activation-pipeline/EPIC-ACT-EXECUTION.yaml start --mode=yolo

# Abort execution
@pm *execute-epic docs/stories/epics/epic-activation-pipeline/EPIC-ACT-EXECUTION.yaml abort
```

---

## Task Execution

### Action: `start`

Initialize epic execution and begin Wave 1.

**1. Read and parse the execution plan:**

```
Read {execution_plan_path}
Extract:
  - epicId
  - storyBasePath
  - template (reference to epic-orchestration.yaml)
  - stories (map of story definitions)
  - waves (ordered list of wave definitions)
  - final_gate (epic-level sign-off criteria)
  - bug_verification (optional checklist)
```

**2. Validate all references:**

```
FOR each story in execution.stories:
  VERIFY file exists at {storyBasePath}/{story.file}
  VERIFY story.executor is a valid agent ID
  VERIFY story.quality_gate is a valid agent ID
  VERIFY story.quality_gate != story.executor (enforcement from development-cycle)

FOR each wave in execution.waves:
  VERIFY all story IDs in wave.stories exist in execution.stories
  VERIFY wave.dependencies reference valid previous waves

VERIFY epic-orchestration.yaml exists
VERIFY development-cycle.yaml exists
```

**3. Pre-flight analysis (if mode=preflight):**

```
FOR each wave:
  List all key_files across stories in the wave
  Identify overlapping files → flag conflict risk
  Estimate total complexity
  Show dependency chain

Display full analysis and ASK user to confirm before proceeding.
```

**4. Initialize state:**

```yaml
# .aios/epic-{epicId}-state.yaml
epic_state:
  epicId: {epicId}
  execution_plan: {execution_plan_path}
  mode: {mode}
  started_at: {ISO timestamp}
  updated_at: {ISO timestamp}
  status: active

  current_wave: 1
  total_waves: {count}

  waves:
    1:
      name: {wave.name}
      status: pending  # pending | in_progress | gate_review | completed | failed
      stories:
        {story_id}:
          status: pending  # pending | in_progress | completed | failed | blocked
          branch: {story.branch}
          started_at: null
          completed_at: null
          executor: {story.executor}
          quality_gate: {story.quality_gate}
    2:
      # ...

  gate_verdicts: {}
  bug_verification: {}
```

**5. Display epic header:**

```
=== Epic Execution Started: {epicId} ===
Plan: {execution_plan_path}
Mode: {mode}
Stories: {total_stories} across {total_waves} waves
Template: epic-orchestration + development-cycle (per story)

Wave Structure:
  Wave 1: {wave.name} ({story_count} stories, parallel={wave.parallel})
  Wave 2: {wave.name} ({story_count} stories, parallel={wave.parallel})
  ...

Starting Wave 1...
```

**6. Execute Wave 1** — call the **Wave Executor** (see below).

**7. Save state and STOP** (wait for wave completion or user checkpoint).

---

### Action: `continue`

Resume epic execution from current state.

**1. Load state** from `.aios/epic-{epicId}-state.yaml`
**2. Verify** status is `active`
**3. Determine resume point:**

```
IF current wave has status=in_progress:
  → Resume wave (some stories may already be done)
IF current wave has status=gate_review:
  → Resume gate review
IF current wave has status=completed:
  → Advance to next wave
IF all waves completed:
  → Run final gate
```

**4. Execute from resume point** — call Wave Executor or Final Gate.
**5. Save state.**

---

### Action: `status`

Show epic progress without executing.

```
=== Epic Status: {epicId} ===
Plan: {execution_plan_path}
Mode: {mode}
Status: {active|completed|aborted}
Progress: Wave {current}/{total}

--- Wave Progress ---
  [x] Wave 1: {name} — {completed_stories}/{total_stories} stories
      [x] ACT-1: {title} (branch: {branch})
      [x] ACT-2: {title} (branch: {branch})
      ...
      Gate: APPROVED by @{agent}

  [>] Wave 2: {name} — {completed_stories}/{total_stories} stories  <-- current
      [>] ACT-6: {title} (branch: {branch}) — IN PROGRESS
      Gate: PENDING

  [ ] Wave 3: {name} — 0/{total_stories} stories
      ...

--- Bug Verification ---
  [x] Bug 1: {description} — Fixed by {story}
  [ ] Bug 2: {description} — Pending ({story})
  ...

Next: @pm *execute-epic {path} continue
```

---

### Action: `skip-story`

Skip a specific story within the current wave (only if not critical).

**1. Load state.**
**2. Verify** the story is in the current wave and has priority != critical.
**3. Mark story as skipped** with reason.
**4. If all other stories in wave are done**, proceed to wave gate.
**5. Save state.**

---

### Action: `abort`

Abort epic execution.

**1. Load state.**
**2. Set status to `aborted`.**
**3. Generate abort report:**

```
=== Epic Aborted: {epicId} ===
Progress: Wave {current}/{total}

Completed:
  - Wave 1: {N} stories done
  - ...

In Progress:
  - {story}: branch {branch} (uncommitted work may exist)

Branches created:
  - feat/act-1-greeting-config
  - feat/act-2-user-profile-audit
  - ...

State preserved at: .aios/epic-{epicId}-state.yaml
To resume later: @pm *execute-epic {path} continue
```

**4. Save state.**

---

## Wave Executor (Core Algorithm)

This procedure executes a single wave from the epic plan.

```
PROCEDURE execute_wave(wave, stories, state):

  state.waves[wave.number].status = "in_progress"
  save_state()

  Display:
    "--- Wave {wave.number}: {wave.name} ---"
    "Stories: {story_count} | Parallel: {wave.parallel}"
    "Dependencies: {wave.dependencies}"

  # ─────────────────────────────────────────
  # STEP 1: Execute stories via development-cycle
  # ─────────────────────────────────────────

  IF wave.parallel == true:
    # Spawn ALL stories in this wave simultaneously using Task tool
    # Each story runs the full development-cycle as a subagent

    FOR EACH story_id IN wave.stories (IN PARALLEL):
      story = execution.stories[story_id]

      IF state.waves[wave.number].stories[story_id].status == "completed":
        SKIP (already done from previous resume)

      state.waves[wave.number].stories[story_id].status = "in_progress"
      state.waves[wave.number].stories[story_id].started_at = NOW

      # Spawn subagent for this story
      Task tool call:
        description: "EPIC:{epicId} Wave:{wave.number} Story:{story_id}"
        subagent_type: "aios-dev"
        prompt: |
          You are executing story {story_id} as part of epic {epicId}, Wave {wave.number}.

          ## Story File
          Read and implement: {storyBasePath}/{story.file}

          ## Development Cycle
          Follow the development-cycle workflow:
          1. @po validates the story draft (read the story, verify acceptance criteria)
          2. @{story.executor} implements the code changes
          3. Self-healing: fix any lint/test/typecheck errors
          4. @{story.quality_gate} reviews the implementation
          5. @devops creates branch {story.branch} and pushes

          ## Epic Context
          - Epic: {epicId} — {epic title from INDEX}
          - Wave: {wave.number} of {total_waves} — "{wave.name}"
          - This story: {story.title}
          - Complexity: {story.complexity}
          - Key files: {story.key_files}

          ## Branch
          Create and work on branch: {story.branch}

          ## Output
          When done, report:
          - Status: completed or failed
          - Files changed
          - Tests added/passing
          - Branch pushed: yes/no

    # Wait for ALL parallel stories to complete
    # Collect results

  ELSE (sequential):
    # Execute stories one at a time
    FOR EACH story_id IN wave.stories (SEQUENTIAL):
      # Same spawning logic as above, but wait for each before starting next

  # ─────────────────────────────────────────
  # STEP 2: Update state with results
  # ─────────────────────────────────────────

  FOR EACH story_id IN wave.stories:
    IF story completed successfully:
      state.waves[wave.number].stories[story_id].status = "completed"
      state.waves[wave.number].stories[story_id].completed_at = NOW
    ELSE:
      state.waves[wave.number].stories[story_id].status = "failed"
      Log failure reason

  save_state()

  # Check if wave can proceed
  failed_stories = stories with status == "failed"
  IF failed_stories is not empty:
    Display:
      "WARNING: {count} stories failed in Wave {wave.number}:"
      FOR EACH failed: "  - {story_id}: {reason}"
      "Options: retry failed stories or proceed to gate with partial results"
    ASK user: [Retry] [Proceed] [Abort]

  # ─────────────────────────────────────────
  # STEP 3: Wave Gate (integration review)
  # ─────────────────────────────────────────

  state.waves[wave.number].status = "gate_review"
  save_state()

  Display:
    "--- Wave {wave.number} Gate: Integration Review ---"
    "Agent: @{wave.gate.agent}"
    "Focus: {wave.gate.focus}"

  # Spawn gate agent for integration review
  Task tool call:
    description: "EPIC:{epicId} Wave:{wave.number} GATE"
    subagent_type: "aios-architect"  # or whatever the gate agent is
    prompt: |
      You are reviewing Wave {wave.number} ("{wave.name}") of epic {epicId}.

      ## Stories Completed in This Wave
      {FOR EACH story in wave: story_id, title, branch, key_files}

      ## Gate Review Focus
      {wave.gate.focus}

      ## Review Checklist
      - [ ] Cross-story integration compatibility
      - [ ] No shared file conflicts between story branches
      - [ ] Combined test suite passes
      - [ ] No regressions from parallel changes
      - [ ] Architecture consistency across stories

      ## Merge Plan
      Order: {wave.merge.order}
      Conflict risk: {wave.merge.conflict_risk}
      Notes: {wave.merge.notes}

      ## Output
      Verdict: APPROVED or REJECTED
      If REJECTED: list specific issues to fix

  # Process gate result
  IF gate verdict == APPROVED:
    state.gate_verdicts[wave.number] = { status: "approved", agent: gate_agent, at: NOW }

    # Merge wave branches (delegate to @devops)
    Display:
      "Gate APPROVED. Merging branches..."
      "Merge order: {wave.merge.order}"

    Task tool call:
      description: "EPIC:{epicId} Wave:{wave.number} MERGE"
      subagent_type: "aios-devops"
      prompt: |
        Merge Wave {wave.number} branches to main in this order:
        {wave.merge.order}

        For each branch:
        1. git merge {branch} --no-ff
        2. Resolve conflicts if any (conflict risk: {wave.merge.conflict_risk})
        3. Run tests after merge
        4. Tag: {wave.tag}

  ELSE (REJECTED):
    state.gate_verdicts[wave.number] = { status: "rejected", issues: gate_issues }
    Display rejection issues
    ASK user: [Fix and retry] [Override] [Abort]

  # ─────────────────────────────────────────
  # STEP 4: Wave Checkpoint
  # ─────────────────────────────────────────

  state.waves[wave.number].status = "completed"
  save_state()

  IF mode == "interactive":
    Display:
      "=== Wave {wave.number} Complete ==="
      "Stories: {completed}/{total}"
      "Gate: {verdict}"
      "Tag: {wave.tag}"
      ""
      "Next: Wave {wave.number + 1} — {next_wave.name}"
      "Stories: {next_wave.stories}"

    ASK user: [GO - Continue to next wave]
             [PAUSE - Save state, stop execution]
             [REVIEW - Show detailed wave summary]
             [ABORT - Stop the epic]

    ON GO: advance current_wave, execute next wave
    ON PAUSE: save state, STOP
    ON REVIEW: show detailed summary, then re-ask
    ON ABORT: set status=aborted, STOP

  ELSE IF mode == "yolo":
    # Auto-proceed to next wave
    advance current_wave
    execute next wave

END PROCEDURE
```

---

## Final Gate

After all waves complete:

```
PROCEDURE final_gate(execution, state):

  Display:
    "=== FINAL GATE: Epic {epicId} ==="
    "Agent: @{execution.final_gate.agent}"

  # Spawn final gate agent
  Task tool call:
    description: "EPIC:{epicId} FINAL GATE"
    subagent_type: "aios-architect"
    prompt: |
      Epic-level sign-off for {epicId}.

      ## Focus
      {execution.final_gate.focus}

      ## Bug Verification Checklist
      {FOR EACH bug in execution.bug_verification:
        Bug {bug.bug}: {bug.description}
        Fixed by: {bug.fixed_by}
        Verify: {bug.verify}
      }

      ## All Waves
      {FOR EACH wave: number, name, stories, gate verdict}

      ## Output
      Verdict: APPROVED or REJECTED
      Bug verification: {checklist with pass/fail per bug}

  IF approved:
    state.status = "completed"
    Tag: {execution.final_gate.tag}

    # Optional: Retrospective
    IF execution.retrospective:
      Display: "Running retrospective..."
      Spawn @{execution.retrospective.agent} for retrospective

  save_state()
  Display final report.

END PROCEDURE
```

---

## State Persistence

State is saved after EVERY significant action (wave start, story complete, gate verdict, checkpoint).

```yaml
# .aios/epic-{epicId}-state.yaml
epic_state:
  epicId: EPIC-ACT
  execution_plan: docs/stories/epics/epic-activation-pipeline/EPIC-ACT-EXECUTION.yaml
  mode: interactive
  started_at: "2026-02-06T10:00:00Z"
  updated_at: "2026-02-06T14:30:00Z"
  status: active  # active | completed | aborted

  current_wave: 2
  total_waves: 3

  waves:
    1:
      name: "Foundation Fixes"
      status: completed
      tag: wave-1-complete
      stories:
        ACT-1: { status: completed, branch: feat/act-1-greeting-config }
        ACT-2: { status: completed, branch: feat/act-2-user-profile-audit }
        ACT-3: { status: completed, branch: feat/act-3-status-loader-reliability }
        ACT-4: { status: completed, branch: feat/act-4-permission-mode }
    2:
      name: "Unification"
      status: in_progress
      stories:
        ACT-6: { status: in_progress, branch: feat/act-6-unified-pipeline }
    3:
      name: "Intelligence & Governance"
      status: pending
      stories:
        ACT-5: { status: pending }
        ACT-7: { status: pending }
        ACT-8: { status: pending }

  gate_verdicts:
    1: { status: approved, agent: architect, at: "2026-02-06T12:00:00Z" }

  bug_verification:
    1: { verified: true, by: ACT-1 }
    2: { verified: false, pending: ACT-4 }
```

### Resume Across Sessions

The state file persists on disk. To resume in a new Claude Code session:

```
@pm *execute-epic docs/stories/epics/epic-activation-pipeline/EPIC-ACT-EXECUTION.yaml continue
```

The executor loads state, reads `current_wave` and story statuses, and picks up exactly where it left off.

---

## Integration with Existing Infrastructure

### development-cycle.yaml (inner loop)
Each story spawns the full development-cycle:
1. `@po` validates story draft
2. `${story.executor}` develops (spawned in terminal)
3. `@dev` self-healing (CodeRabbit, conditional)
4. `${story.quality_gate}` reviews (agent != executor)
5. `@devops` pushes branch + PR
6. `@po` checkpoint (auto-GO in wave mode)

### epic-orchestration.yaml (template)
Provides the generic wave pattern that this task instantiates with project-specific data from the EXECUTION.yaml.

### po-epic-context.md
Used by @po during story validation to understand accumulated changes across the epic.

### Wave Executor (wave-executor.js)
The JS engine can be used for programmatic wave execution if available. This task provides the AI-driven alternative that works without code changes.

---

## Output Format

All actions produce structured output:
- Epic header with progress
- Current wave status
- Story-level detail
- Next command to run
- Estimated remaining time (based on complexity ratings)

---

## Related Commands

- `*create-epic` - Create a new epic (PM)
- `*epic-context` - Show accumulated epic context (PO)
- `*run-workflow development-cycle` - Run single story cycle
- `*waves` - Analyze wave structure of a workflow
- `*status` - General workflow status

---

## Agent Integration

This task is owned by:
- `@pm` (Morgan/Bob) - Primary orchestrator

This task spawns:
- `@po` (Pax) - Story validation, checkpoints
- `@dev` (Dex) - Story implementation (via development-cycle)
- `@architect` (Aria) - Wave gates, final gate
- `@devops` (Gage) - Branch merge, push
- `@qa` (Quinn) - Quality gates (via development-cycle)

---

## Change Log

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-02-06 | Initial implementation — connects epic-orchestration + development-cycle |
