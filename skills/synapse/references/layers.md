# SYNAPSE 8-Layer Architecture Reference

## Overview

SYNAPSE processes rules through an 8-layer pipeline executed sequentially on every prompt. Each layer has a specific purpose, trigger condition, and priority level. The engine orchestrator (`.aios-core/core/synapse/engine.js`) chains all layers and the output formatter produces the final `<synapse-rules>` XML block.

## Layer Pipeline

```
L0 Constitution → L1 Global → L2 Agent → L3 Workflow → L4 Task → L5 Squad → L6 Keyword → L7 Star-Command
```

Layers execute in order. Each layer's output is collected and passed to the formatter.

## Layer Details

### L0: Constitution (NON-NEGOTIABLE)

| Property | Value |
|----------|-------|
| **Purpose** | Enforce inviolable framework principles (6 articles) |
| **Trigger** | Always active (`ALWAYS_ON=true`, `NON_NEGOTIABLE=true`) |
| **Priority** | Highest — cannot be overridden by any other layer |
| **Domain file** | `.synapse/constitution` |
| **Source** | Auto-generated from `.aios-core/constitution.md` via `generate-constitution.js` |
| **Implementation** | `.aios-core/core/synapse/layers/l0-constitution.js` |

**Articles:** CLI First, Agent Authority, Story-Driven Development, No Invention, Quality First, Absolute Imports.

### L1: Global + Context

| Property | Value |
|----------|-------|
| **Purpose** | Universal rules applied to all prompts + bracket-specific behavior |
| **Trigger** | Always active (`ALWAYS_ON=true`) |
| **Priority** | High — applies to every prompt regardless of context |
| **Domain files** | `.synapse/global`, `.synapse/context` |
| **Implementation** | `.aios-core/core/synapse/layers/l1-global.js` |

**Content:** Coding standards, import rules, TypeScript rules, error handling patterns, bracket-specific context rules.

### L2: Agent-Scoped

| Property | Value |
|----------|-------|
| **Purpose** | Inject agent-specific rules when an agent is active |
| **Trigger** | `AGENT_TRIGGER` matches active agent ID from session |
| **Priority** | Medium-high — only active when agent is activated |
| **Domain files** | `.synapse/agent-dev`, `.synapse/agent-qa`, `.synapse/agent-architect`, etc. (12 total) |
| **Implementation** | `.aios-core/core/synapse/layers/l2-agent.js` |

**Agents covered:** dev, qa, architect, pm, po, sm, devops, analyst, data-engineer, ux (ux-design-expert), aios-master, squad-creator.

### L3: Workflow-Scoped

| Property | Value |
|----------|-------|
| **Purpose** | Inject workflow-specific rules when a workflow is active |
| **Trigger** | `WORKFLOW_TRIGGER` matches active workflow from session |
| **Priority** | Medium — active during specific development workflows |
| **Domain files** | `.synapse/workflow-story-dev`, `.synapse/workflow-epic-create`, `.synapse/workflow-arch-review` |
| **Implementation** | `.aios-core/core/synapse/layers/l3-workflow.js` |

### L4: Task Context

| Property | Value |
|----------|-------|
| **Purpose** | Inject context about the currently active task |
| **Trigger** | Active task detected in session state |
| **Priority** | Medium — active during task execution |
| **Domain files** | Dynamic (injected from session context) |
| **Implementation** | `.aios-core/core/synapse/layers/l4-task.js` |

### L5: Squad Discovery

| Property | Value |
|----------|-------|
| **Purpose** | Discover and inject rules from active squad domains |
| **Trigger** | Squad is active in session |
| **Priority** | Medium-low — only when working with squads |
| **Domain files** | Squad-specific domains (discovered at runtime) |
| **Implementation** | `.aios-core/core/synapse/layers/l5-squad.js` |

### L6: Keyword (RECALL)

| Property | Value |
|----------|-------|
| **Purpose** | Activate domains when user prompt contains matching keywords |
| **Trigger** | User prompt contains keyword listed in domain's `RECALL` field |
| **Priority** | Low — optional, skipped in DEPLETED bracket to conserve tokens |
| **Domain files** | Any domain with `RECALL` key in manifest |
| **Implementation** | `.aios-core/core/synapse/layers/l6-keyword.js` |

### L7: Star-Command

| Property | Value |
|----------|-------|
| **Purpose** | Detect and inject mode-switching commands (`*brief`, `*dev`, `*synapse status`, etc.) |
| **Trigger** | User types `*command` in prompt |
| **Priority** | Highest for explicit commands — user intent is paramount |
| **Domain file** | `.synapse/commands` |
| **Implementation** | `.aios-core/core/synapse/layers/l7-star-command.js` |

## Pipeline Execution Flow

```
1. Hook receives UserPromptSubmit event (stdin JSON)
2. Engine calculates context bracket (prompt count → percent → bracket)
3. Engine determines active layers for current bracket
4. For each active layer (L0 → L7):
   a. Layer processor loads relevant domain(s)
   b. Rules are filtered/resolved
   c. Layer output is collected
5. Memory bridge consulted (if pro available, DEPLETED/CRITICAL brackets)
6. Formatter assembles <synapse-rules> XML within token budget
7. Output written to stdout (appended to user prompt)
```

## Conflict Resolution

When rules from different layers conflict:

1. **NON_NEGOTIABLE wins** — L0 Constitution rules cannot be overridden
2. **Higher layer number = more specific** — L7 Star-Command overrides L1 Global for the current prompt
3. **Agent > Global** — L2 agent-scoped rules take precedence over L1 global rules
4. **Workflow > Agent** — L3 workflow rules can augment L2 agent rules
5. **Explicit > Implicit** — Star-commands (explicit user intent) override automatic rules

## Output Format

The formatter produces XML output:

```xml
<synapse-rules>
[CONTEXT BRACKET: MODERATE] 40-60% context remaining — all layers active
[CONSTITUTION] (NON-NEGOTIABLE) CLI First | Agent Authority | Story-Driven | No Invention | Quality First | Absolute Imports
[ACTIVE AGENT: @dev] Follow story tasks, update Dev Agent Record only, CodeRabbit pre-commit
[ACTIVE WORKFLOW: story_development] Follow SDC phases, update checkboxes
[TASK CONTEXT] Current task details
[SQUAD: mmos] Squad-specific rules
[STAR-COMMANDS] *dev: Code over explanation, minimal changes
[DEVMODE STATUS] Pipeline metrics (if DEVMODE=true)
[LOADED DOMAINS SUMMARY] constitution, global, context, agent-dev, workflow-story-dev, commands
</synapse-rules>
```

**Section ordering** (highest priority first):
1. CONTEXT_BRACKET
2. CONSTITUTION
3. AGENT
4. WORKFLOW
5. TASK
6. SQUAD
7. KEYWORD
8. MEMORY_HINTS
9. STAR_COMMANDS
10. DEVMODE
11. SUMMARY

## Performance Targets

| Metric | Target | Hard Limit |
|--------|--------|------------|
| Total pipeline | <70ms | <100ms |
| Individual layer | <15ms | <20ms (L0/L7: <5ms) |
| Startup (.synapse/ discovery) | <5ms | <10ms |
| Session I/O | <10ms | <15ms |

**Timeout behavior:** If any layer exceeds its time limit, it is skipped with a warning. The pipeline never blocks the prompt.

## Source Files

| File | Purpose |
|------|---------|
| `.aios-core/core/synapse/engine.js` | SynapseEngine orchestrator |
| `.aios-core/core/synapse/layers/l0-constitution.js` | L0 processor |
| `.aios-core/core/synapse/layers/l1-global.js` | L1 processor |
| `.aios-core/core/synapse/layers/l2-agent.js` | L2 processor |
| `.aios-core/core/synapse/layers/l3-workflow.js` | L3 processor |
| `.aios-core/core/synapse/layers/l4-task.js` | L4 processor |
| `.aios-core/core/synapse/layers/l5-squad.js` | L5 processor |
| `.aios-core/core/synapse/layers/l6-keyword.js` | L6 processor |
| `.aios-core/core/synapse/layers/l7-star-command.js` | L7 processor |
| `.aios-core/core/synapse/layers/layer-processor.js` | Abstract base class |
| `.aios-core/core/synapse/output/formatter.js` | XML formatter + token budget |
| `.claude/hooks/synapse-engine.js` | Hook entry point |
