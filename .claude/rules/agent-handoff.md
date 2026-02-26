# Agent Handoff Protocol — Context Compaction

## Purpose

Prevent context window accumulation when switching between AIOS agents (`@agent` commands). Each agent switch compacts the previous agent's full persona into a structured handoff artifact (~379 tokens) instead of retaining the full definition (~3-5K tokens).

## When This Applies

This protocol activates whenever:
1. A user invokes a new agent via `@agent-name` or `/AIOS:agents:agent-name`
2. The current session already has a different agent active

## Handoff Protocol

### On Agent Switch (outgoing agent)

Before loading the new agent, mentally generate a handoff artifact with:

```yaml
handoff:
  from_agent: "{current_agent_id}"
  to_agent: "{new_agent_id}"
  story_context:
    story_id: "{active story ID}"
    story_path: "{active story path}"
    story_status: "{current status}"
    current_task: "{last task being worked on}"
    branch: "{current git branch}"
  decisions:
    - "{key decision 1}"
    - "{key decision 2}"
  files_modified:
    - "{file 1}"
    - "{file 2}"
  blockers:
    - "{any active blockers}"
  next_action: "{what the incoming agent should do}"
```

### On Agent Switch (incoming agent)

The incoming agent receives:
1. Its own **full agent profile** (persona, commands, dependencies)
2. The **handoff artifact** from the previous agent (compact summary)
3. **NOT** the previous agent's full persona/instructions/tool definitions

### Compaction Limits

| Limit | Value |
|-------|-------|
| Max handoff artifact size | 500 tokens |
| Max retained agent summaries | 3 (oldest discarded on 4th switch) |
| Max decisions in artifact | 5 |
| Max files_modified entries | 10 |
| Max blockers | 3 |

### What to Preserve (ALWAYS include)

- Active story ID and path
- Current task being worked on
- Git branch name
- Key architectural decisions made
- Files created or modified
- Active blockers

### What to Discard (NEVER carry forward)

- Previous agent's full persona definition
- Previous agent's command list
- Previous agent's dependency list
- Previous agent's tool configurations
- Previous agent's CodeRabbit integration details
- Previous agent's greeting templates

## Storage

Handoff artifacts are stored at `.aios/handoffs/` (runtime, gitignored). Format: `handoff-{from}-to-{to}-{timestamp}.yaml`.

## Template Reference

Full template: `.aios-core/development/templates/agent-handoff-tmpl.yaml`

## Example

Session flow: `@sm` creates story → `@dev` implements → `@qa` reviews

After `@sm` → `@dev` switch:
- `@sm` full persona (~3K tokens) is **discarded**
- Handoff artifact (~379 tokens) is **retained**: story ID, decisions, files, next action
- `@dev` full persona (~5K tokens) is **loaded**
- **Total context: ~5.4K** instead of ~8K (33% reduction per switch)

After `@dev` → `@qa` switch:
- `@dev` full persona is **discarded**
- `@dev` handoff artifact is **retained** alongside `@sm` handoff
- `@qa` full persona is **loaded**
- **Total context: ~5.2K** instead of ~12K (57% reduction after 2 switches)
