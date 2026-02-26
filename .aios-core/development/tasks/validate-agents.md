# Validate Agents Task

---
execution_mode: programmatic  # TOK-3: PTC-eligible — batch-scan all agent files in single Bash block
---

## Purpose

Validate all agent definition files for structural integrity, required fields,
dependency existence, and unified activation pipeline reference.

Story ACT-6: Framework integrity checking via `*validate-agents` command.

---

## Parameters

- **scope**: `all` (default) | `{agent-id}` - Validate all agents or a specific one
- **strict**: `false` (default) | `true` - Fail on warnings in addition to errors
- **output**: `summary` (default) | `detailed` - Output verbosity

---

## Execution Steps

### Step 1: Discover Agent Files

Scan `.aios-core/development/agents/` for all `.md` files.
Expected agents: dev, qa, architect, pm, po, sm, analyst, data-engineer, ux-design-expert, devops, aios-master, squad-creator

### Step 2: Parse YAML Block

For each agent file:
1. Extract the YAML block between ` ```yaml ` and ` ``` ` fences
2. Parse using `js-yaml.load()` (safe loader)
3. If parse fails, try normalizing compact command format first
4. Report parse errors with line numbers

### Step 3: Validate Required Fields

| Field | Required | Default | Notes |
|-------|----------|---------|-------|
| `agent.id` | Yes | - | Must match filename |
| `agent.name` | Yes | - | Human-readable name |
| `agent.icon` | No | - | Emoji icon |
| `persona_profile` | Yes | - | Must have greeting_levels |
| `persona_profile.greeting_levels` | Yes | - | minimal, named, archetypal |
| `persona.role` | Yes | - | Role description |
| `commands` | Yes | [] | Array of command objects |
| `activation-instructions` | Yes | - | Must include STEP 1-5 |

### Step 4: Validate Activation Pipeline Reference

Check that STEP 3 in `activation-instructions` references:
- `unified-activation-pipeline.js` (Story ACT-6)
- NOT the old `greeting-builder.js` direct reference

Report as WARNING if still referencing old path.

### Step 5: Validate Dependencies

For each agent's `dependencies.tasks` list:
1. Check that each referenced task file exists in `.aios-core/development/tasks/`
2. Report missing dependencies as ERRORS

For each agent's `dependencies.checklists` list:
1. Check in `.aios-core/development/checklists/`
2. Report missing as WARNINGS

### Step 6: Validate Command Structure

For each command in `commands` array:
1. Must have `name` field (string)
2. `description` is recommended (WARNING if missing)
3. `visibility` array is recommended for session-aware filtering

### Step 7: Cross-Agent Validation

1. Verify no duplicate agent IDs across files
2. Verify all 12 expected agents are present
3. Verify `*yolo` command exists (universal command)

### Step 8: Generate Report

Output format:

```
=== Agent Validation Report ===

[PASS] dev.md - 15 commands, 8 tasks, pipeline: unified
[PASS] qa.md - 12 commands, 6 tasks, pipeline: unified
[WARN] devops.md - Missing visibility metadata on 5 commands
[FAIL] broken-agent.md - YAML parse error at line 42

Summary: 11 passed, 1 warning, 0 failed
```

---

## Error Handling

- YAML parse errors: Report file, line number, error message
- Missing files: Report expected path
- Invalid fields: Report field name and expected format
- Continue validation on errors (don't stop at first failure)

---

## Dependencies

- `js-yaml` - YAML parsing
- `fs` - File system access
- Agent files in `.aios-core/development/agents/`
- Task files in `.aios-core/development/tasks/`
- `unified-activation-pipeline.js` - Pipeline reference check

---

*Story ACT-6 | Task: validate-agents | Created 2026-02-06*
