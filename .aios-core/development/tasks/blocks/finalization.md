# Block: Finalization

> **Block ID:** `finalization`
> **Version:** 1.0.0
> **Type:** Reusable Include Block

## Purpose

End a multi-agent workflow by presenting summary to user, cleaning up team resources, and providing next steps. Used at the end of orchestrator skills after all phases complete.

## Input

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `workflow_name` | string | Yes | - | Display name of the workflow (e.g., "Enhance Workflow", "Deep Strategic Planning") |
| `slug` | string | Yes | - | Project/decision slug in snake_case |
| `artifacts_list` | object[] | Yes | - | Array of `{ path, description }` for generated files |
| `summary_data` | object | No | `{}` | Workflow-specific summary (e.g., `{ epic_title, stories_count }`) |
| `next_steps` | string[] | Yes | - | Array of recommended next actions |
| `team_name` | string | Yes | - | Team name for cleanup (e.g., "enhance-{slug}") |

## Output

| Field | Type | Description |
|-------|------|-------------|
| `summary_presented` | boolean | User was shown final summary |
| `agents_shutdown` | boolean | All agents received shutdown_request |
| `team_deleted` | boolean | TeamDelete executed successfully |

## Core Content

### Step 1: Present Summary to User

Display a formatted summary containing:
- All generated artifact paths with descriptions
- Workflow-specific highlights (from `summary_data`)
- Next steps as numbered list

### Step 2: Cleanup Agents

```
# For each remaining agent in the team:
SendMessage(
  type: "shutdown_request",
  recipient: "{agent_name}",
  content: "Workflow complete. Shutting down."
)
```

### Step 3: Delete Team

```
# After all agents acknowledge shutdown:
TeamDelete(team_name: "{team_name}")
```

### Summary Template

```markdown
## {workflow_name} Complete: {slug}

### Generated Artifacts
{foreach artifact in artifacts_list}
- `{artifact.path}` - {artifact.description}
{/foreach}

### Summary
{workflow-specific summary from summary_data}

### Next Steps
{foreach step, index in next_steps}
{index + 1}. {step}
{/foreach}
```

## Usage

### Include in Skill File

```markdown
<!-- Include: blocks/finalization.md -->
<!-- Parameters:
  workflow_name=Enhance Workflow
  slug={project_slug}
  team_name=enhance-{slug}
-->
```

### Programmatic Usage

```javascript
const finalize = async ({ workflow_name, slug, artifacts_list, summary_data, next_steps, team_name }) => {
  // 1. Present summary
  presentSummary({ workflow_name, slug, artifacts_list, summary_data, next_steps });

  // 2. Shutdown agents
  const agents = await getTeamAgents(team_name);
  for (const agent of agents) {
    await sendShutdownRequest(agent);
  }

  // 3. Delete team
  await teamDelete(team_name);

  return { summary_presented: true, agents_shutdown: true, team_deleted: true };
};
```

## Error Handling

| Error | Behavior |
|-------|----------|
| Agent shutdown timeout | Log warning, continue with TeamDelete |
| TeamDelete fails | Log error, report to user |
| Missing artifacts | List as "not generated" in summary |

## Notes

- Block executes after ALL phases complete
- Agents should save their work before receiving shutdown_request
- TeamDelete is the final cleanup step
- Found in 2+ orchestrator skills with 95%+ similarity
- Total lines saved: ~40 lines × N skills
