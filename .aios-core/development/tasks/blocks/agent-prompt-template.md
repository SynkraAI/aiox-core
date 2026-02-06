# Block: Agent Prompt Template

> **Block ID:** `agent-prompt-template`
> **Version:** 1.0.0
> **Type:** Reusable Include Block

## Purpose

Standardized template for spawning AIOS agents with consistent structure. Ensures all agent invocations follow the same persona loading, context, mission, and output pattern.

## Input

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `agent_name` | string | Yes | - | Agent's display name (e.g., "Aria", "Max") |
| `agent_role` | string | Yes | - | Agent's role title (e.g., "Architect", "Dev") |
| `agent_file_path` | string | Yes | - | Path to agent definition file |
| `context_category` | string | No | `null` | Category for context-loading block (e.g., "Architecture,Security") |
| `mission_description` | string | Yes | - | What the agent must accomplish |
| `output_path` | string | Yes | - | Where to save the result |
| `output_format` | string | No | `markdown` | Expected format (markdown, yaml, json) |

## Output

| Field | Type | Description |
|-------|------|-------------|
| `prompt` | string | Complete agent prompt ready for Task tool |

## Core Template

```markdown
You are {agent_name}, the AIOS {agent_role}. Read your complete agent file at:
{agent_file_path}

Adopt {agent_name}'s persona, voice, and expertise.

<!-- Include: blocks/context-loading.md -->
<!-- Parameters: category={context_category} -->

## Context

{context_from_user}

## Mission

{mission_description}

## Output

Save complete result to: {output_path}

Format: {output_format}

After saving, send a message to the team lead with a summary.
```

## Usage

### Include in Skill File

```markdown
<!-- Include: blocks/agent-prompt-template.md -->
<!-- Parameters:
  agent_name=Aria,
  agent_role=Architect,
  agent_file_path=.claude/commands/AIOS/agents/architect.md,
  context_category=Architecture,
  mission_description=Design the authentication module,
  output_path=docs/architecture/auth-design.md,
  output_format=markdown
-->
```

### Programmatic Usage

```javascript
const { loadBlock, renderTemplate } = require('.aios-core/utils/block-loader');

const template = await loadBlock('agent-prompt-template');
const prompt = await renderTemplate(template, {
  agent_name: 'Aria',
  agent_role: 'Architect',
  agent_file_path: '.claude/commands/AIOS/agents/architect.md',
  context_category: 'Architecture',
  context_from_user: 'We need to design auth for a multi-tenant SaaS.',
  mission_description: 'Create detailed authentication architecture document.',
  output_path: 'docs/architecture/auth-design.md',
  output_format: 'markdown'
});

// Use with Task tool
Task({ prompt, subagent_type: 'general-purpose' });
```

## Files Accessed

| File | Purpose |
|------|---------|
| Agent file at `{agent_file_path}` | Agent persona and capabilities |
| Via `context-loading` block | Git state, gotchas, preferences |

## Error Handling

| Error | Behavior |
|-------|----------|
| Missing required parameter | Block fails with validation error |
| Agent file not found | Agent reads empty, continues with defaults |
| Invalid output_format | Default to `markdown` |

## Notes

- Template is under 20 lines of core content
- Composes with `context-loading` block for project context
- Consistent "send message to team lead" ending for orchestration
- Works with both sequential and parallel agent invocation patterns
