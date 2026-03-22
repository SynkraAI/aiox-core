# Forge Runner — Execution Engine

> The heart of Forge. A state machine that orchestrates AIOS agents phase by phase.

---

## 1. Runner Lifecycle

```
INIT -> PHASE_0 -> PHASE_3 -> PHASE_5 -> COMPLETE
                      |
                      +-- (per story) -> SDC subloop
                      |     SM -> PO -> DEV -> QA
                      |                  |
                      |           FAIL -> RETRY (max 3)
                      |           FAIL 3x -> ESCALATE
                      +-- CHECKPOINT (every N stories)
```

For FULL_APP mode, the lifecycle expands to:
```
INIT -> PHASE_0 -> PHASE_1 -> PHASE_2 -> PHASE_3 -> PHASE_4 -> PHASE_5 -> COMPLETE
```

---

## 2. Execution Protocol (for EACH phase)

### Step 1: Enter Phase
1. Read the phase file from `phases/phase-{N}-{name}.md`
2. Show phase header (from personality.md)
3. Show progress indicator with updated status
4. Update state.json: `phases.{N}.status = "running"`, `current_phase = N`

### Step 2: Execute Phase
1. Follow the phase file instructions exactly
2. For agent dispatch: use the Agent Dispatch Protocol (SKILL.md Section 5)
3. For checkpoints: show checkpoint format (personality.md), wait for user input

### Step 3: Exit Phase
1. Verify phase outputs exist (files created, validations passed)
2. Update state.json: `phases.{N}.status = "completed"`, `phases.{N}.completed_at = now`
3. Show handoff visual if next phase involves a different agent
4. Proceed to next phase

---

## 3. SDC Subloop (Story Development Cycle — Phase 3)

For each story in priority order:

### 3.1 Story Creation (@sm)

Dispatch @sm via Agent tool with:
- Agent: `.aios-core/development/agents/aios-sm.md`
- Task: `.aios-core/development/tasks/create-next-story.md`
- Input: Epic/PRD from Phase 1 (or user description for SINGLE_FEATURE)
- Output: Story file at `docs/stories/active/{id}.story.md`

### 3.2 Story Validation (@po)

Dispatch @po via Agent tool with:
- Agent: `.aios-core/development/agents/aios-po.md`
- Task: `.aios-core/development/tasks/validate-next-story.md`
- Input: Story file from 3.1
- Veto: Score < 7/10 -> return to @sm with feedback (max 2 retries)
- Output: Story status updated to "Ready"

### 3.3 Implementation (@dev)

Dispatch @dev via Agent tool with:
- Agent: `.aios-core/development/agents/aios-dev.md`
- Task: `.aios-core/development/tasks/dev-develop-story.md`
- Mode: YOLO (autonomous)
- Input: Story file (status: Ready) + project context
- Output: Code changes, story status "In Progress" -> "In Review"

### 3.4 Quality Gate (@qa)

Dispatch @qa via Agent tool with:
- Agent: `.aios-core/development/agents/aios-qa.md`
- Task: `.aios-core/development/tasks/qa-review-story.md`
- Input: Story file + code changes from @dev
- Decision:
  - **PASS** -> Mark story Done, proceed to next story
  - **FAIL** -> Enter Error Recovery (Section 4)

### 3.5 Progress Tracking

After each story completes:
1. Update state.json: `phases.3.stories_completed += 1`
2. Show mini progress: `"Story {N}/{total} done ✅"`
3. Every `config.checkpoint_interval` stories (default: 3): show CHECKPOINT

---

## 4. Error Recovery Tree

When an error occurs in Phase 3 (Build Loop), analyze the error and route intelligently:

### Detection

Parse the Agent tool response for error signals:
- Output contains "architecture", "design pattern", "wrong abstraction" -> **ARCHITECTURE_ERROR**
- Output contains "migration", "schema", "database", "RLS", "query" -> **DB_ERROR**
- Output contains "unclear", "ambiguous", "not sure if", "should this" -> **REQUIREMENT_ERROR**
- Same error message appears 3 times -> **STUCK**
- Any other error -> **GENERIC_ERROR**

### Routing

```
ARCHITECTURE_ERROR:
  1. Show error banner (personality.md)
  2. Dispatch @architect with the specific issue
  3. @architect provides design guidance
  4. Re-dispatch @dev with architect's guidance
  5. If still fails -> CHECKPOINT (ask user)

DB_ERROR:
  1. Show error banner
  2. Dispatch @data-engineer with the specific DB issue
  3. @data-engineer creates/fixes migration or schema
  4. Re-dispatch @dev with updated schema
  5. If still fails -> CHECKPOINT (ask user)

REQUIREMENT_ERROR:
  1. Show CHECKPOINT with the ambiguity
  2. Ask user to clarify
  3. If user doesn't know -> dispatch @po to refine the story AC
  4. Re-dispatch @dev with clarified requirement

STUCK (same error 3x):
  1. HALT execution
  2. Show diagnostic:
     - What was attempted (3 times)
     - What failed each time
     - Possible causes
  3. Offer options:
     a. "Quer que eu chame @architect pra analisar?"
     b. "Quer pular essa story e voltar depois?"
     c. "Quer parar aqui? (salvo o progresso)"

GENERIC_ERROR:
  1. Retry @dev with error context (max 3 retries)
  2. After 3 retries -> escalate to @aios-master
  3. @aios-master has no restrictions -> can fix anything
  4. If @aios-master fails -> HALT + CHECKPOINT
```

### Error Log

Every error is logged in state.json:
```json
{
  "errors": [
    {
      "phase": 3,
      "story_id": "1.2",
      "type": "GENERIC_ERROR",
      "message": "npm run typecheck failed: Property 'x' does not exist",
      "retry_count": 1,
      "escalated_to": null,
      "resolved": true,
      "timestamp": "2026-03-21T15:30:00Z"
    }
  ]
}
```

---

## 5. Veto Conditions (automatic quality gates)

Before moving to the next story in Phase 3, automatically verify:

| Check | Command | Veto If |
|-------|---------|---------|
| Lint | `npm run lint` | Any errors (warnings OK) |
| TypeCheck | `npm run typecheck` | Any errors |
| Tests | `npm test` | Any failures |
| Story AC | Read story file | Any AC checkbox unchecked |

If a veto condition triggers:
1. Do NOT proceed to @qa
2. Re-dispatch @dev with the specific veto failure
3. Max 2 veto fix attempts per story
4. After 2 failed attempts: send to @qa anyway (QA will catch and route)

---

## 6. Resume Protocol

When resuming an interrupted run:

1. Read `.aios/forge-runs/{run_id}/state.json`
2. Show: "Retomando run `{run_id}` — parado na Phase {N}"
3. Show progress indicator with current state
4. Jump to `current_phase` and continue from where it stopped
5. If Phase 3: check `stories_completed` to know which story to continue from

---

## 7. Completion Protocol

After all phases complete:

1. Update state.json: `status = "completed"`, `completed_at = now`
2. Show completion banner (personality.md) with:
   - Run ID
   - Number of stories implemented
   - PR URL (if deployed)
   - Total errors encountered and resolved
3. If in a project with memory: save run summary to feedback memory
