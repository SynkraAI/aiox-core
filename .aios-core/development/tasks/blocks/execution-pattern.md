# Block: Execution Pattern

> **Block ID:** `execution-pattern`
> **Version:** 1.0.0
> **Type:** Reusable Include Block

## Purpose

Define how agent waiting works with the Task tool. Provides patterns for sequential and parallel execution, plus anti-patterns to avoid.

## Input

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `execution_type` | string | No | `sequential` | One of: `sequential`, `parallel`, `mixed` |
| `parallel_count` | number | No | `3` | Number of parallel agents (only for parallel/mixed) |

## Output

| Field | Type | Description |
|-------|------|-------------|
| `understanding` | string | How blocking mechanism works |
| `pattern` | string | Code pattern for the execution type |
| `anti_patterns` | string[] | What to avoid |

## Core Content

### How Agent Waiting Works

The `Task` tool has **native blocking behavior** - it automatically waits for the agent to complete before returning. You do NOT need any manual waiting mechanism.

### Sequential Execution

```
# Task tool WITHOUT run_in_background = BLOCKS until agent completes
Task(prompt: "...", subagent_type: "general-purpose", ...)
# ↑ This line does NOT return until the agent finishes
# ↓ When execution reaches here, the agent is DONE
TaskUpdate(taskId: "X", status: "completed")
```

### Parallel Execution

```
# Spawn ALL N agents in a SINGLE message with run_in_background: true
Task(prompt: "agent 1...", run_in_background: true)  → returns task_id_1
Task(prompt: "agent 2...", run_in_background: true)  → returns task_id_2
Task(prompt: "agent N...", run_in_background: true)  → returns task_id_N

# Then wait for each using TaskOutput (blocks until agent completes)
TaskOutput(task_id: "id_1", block: true)
TaskOutput(task_id: "id_2", block: true)
TaskOutput(task_id: "id_N", block: true)
```

### Mixed Execution

Combine sequential phases with parallel phases:
1. Sequential: Use blocking Task calls
2. Parallel: Spawn with `run_in_background: true`, collect with `TaskOutput`
3. Sequential: Resume after all parallel agents complete

## Anti-Patterns (NEVER DO THIS)

```
# ❌ WRONG: Sleep loops
Bash("sleep 30")
Bash("sleep 60")

# ❌ WRONG: Polling loops
while not done:
    Bash("sleep 10")
    check_if_file_exists()

# ❌ WRONG: Periodic file checking
Read("output_file")  # hoping it appeared
Bash("sleep 30")
Read("output_file")  # checking again

# ❌ WRONG: Asking teammate for status via SendMessage polling
SendMessage("hey, are you done yet?")
```

**The Task tool handles ALL waiting automatically. Trust the blocking mechanism.**

## Usage

### Include in Skill File

```markdown
<!-- Include: blocks/execution-pattern.md -->
<!-- Parameters: execution_type=mixed, parallel_count=4 -->
```

### Direct Reference

```markdown
## Execution Pattern (CRITICAL)

See: `.aios-core/development/tasks/blocks/execution-pattern.md`

This skill uses **{execution_type}** execution with {parallel_count} parallel agents.
```

## Files Accessed

None - this is a reference/documentation block.

## Error Handling

| Error | Behavior |
|-------|----------|
| Invalid execution_type | Default to `sequential` |
| parallel_count < 1 | Default to `3` |

## Notes

- Block provides understanding, not executable code
- Anti-patterns section prevents common mistakes
- Found in 8+ skills with 98% similarity
- Total lines saved: ~35 lines × 8 skills = 280 lines
