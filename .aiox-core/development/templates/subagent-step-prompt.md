# Subagent Step Prompt Template

> **Purpose:** Reusable template for constructing subagent prompts in the Workflow Runtime Engine.
> Each variable is replaced at runtime by the orchestrator (aiox-master) before spawning the subagent via the Task tool.

---

## Template

```
You are {{AGENT_NAME}}, {{AGENT_TITLE}}.

## Your Persona

{{AGENT_YAML}}

## Your Task

{{TASK_CONTENT}}

## Context

Workflow: {{WORKFLOW_NAME}} | Step: {{STEP_ID}} | Phase: {{PHASE_NAME}}
Action: {{ACTION}}

## Input Data

{{INPUT_DATA}}

## Reference Data

{{REFERENCE_DATA}}

## User Input (Elicitation)

{{USER_INPUT}}

## Step Instructions

{{STEP_NOTES}}

## CRITICAL OUTPUT FORMAT

You MUST return your complete output as a YAML block at the END of your response.
This block will be parsed by the orchestrator to extract outputs for subsequent steps.

```yaml
step_output:
  status: completed|failed
  outputs:
    # Include all output fields defined in the workflow step's 'outputs' list
    # Example:
    #   task_completa: "..."
    #   score_9p: 85
    #   gaps: [...]
  score: null
  notes: "Summary of what was done and key decisions made"
  artifacts:
    - name: "artifact-name.md"
      path: "relative/path/to/artifact"
      status: created|updated
```

Execute the task now. Do NOT greet. Do NOT show commands. Do NOT ask questions (all inputs are provided above). Focus entirely on task execution and produce the output YAML block at the end.
```

---

## Variable Reference

| Variable | Source | Description |
|----------|--------|-------------|
| `{{AGENT_NAME}}` | Agent file → `agent.name` | Agent's display name (e.g., "Orion", "Pedro") |
| `{{AGENT_TITLE}}` | Agent file → `agent.title` | Agent's role title |
| `{{AGENT_YAML}}` | Agent file → full YAML block | Complete agent persona definition |
| `{{TASK_CONTENT}}` | Task file via `uses` field | Complete task file content |
| `{{WORKFLOW_NAME}}` | Workflow YAML → `workflow.name` | Name of the executing workflow |
| `{{STEP_ID}}` | Sequence item → `id` | Unique step identifier |
| `{{PHASE_NAME}}` | Current phase marker → `name` | Name of the current phase |
| `{{ACTION}}` | Sequence item → `action` | Action description for this step |
| `{{INPUT_DATA}}` | State → previous step outputs | YAML of outputs from steps listed in `requires` |
| `{{REFERENCE_DATA}}` | Agent deps + workflow resources | Content of data files (e.g., mandamentos.yaml) |
| `{{USER_INPUT}}` | Elicitation responses | YAML block of user answers (if `elicit: true`) |
| `{{STEP_NOTES}}` | Sequence item → `notes` | Detailed instructions from the workflow step |

---

## Resolution Rules

### Path Resolution by Context

| Context | Agent Path | Task Path | Data Path |
|---------|-----------|-----------|-----------|
| `core` | `.aiox-core/development/agents/{agent}.md` | `.aiox-core/development/tasks/{uses}.md` | `.aiox-core/data/{file}` |
| `squad` | `squads/{squad}/agents/{agent}.md` | `squads/{squad}/tasks/{uses}.md` | `squads/{squad}/data/{file}` |
| `hybrid` | squad-first, core-fallback | squad-first, core-fallback | squad-first, core-fallback |

### Hybrid Resolution Order

1. Check `squads/{squad}/agents/{agent}.md` first
2. If not found, check `.aiox-core/development/agents/{agent}.md`
3. If agent has explicit prefix (`core:architect` or `squad:validator`), use that directly

### Agent YAML Extraction

The `{{AGENT_YAML}}` variable should contain the complete YAML block from the agent file, starting from the opening ` ```yaml ` marker and ending at the closing ` ``` ` marker. This includes all sections: agent identity, persona, commands, dependencies.

### Task Content Extraction

The `{{TASK_CONTENT}}` variable should contain the full task file content, from the Task Definition through Task Execution sections. Strip YAML frontmatter if present but keep all executable instructions.

---

## Notes

- This template is referenced by `run-workflow-engine.md` task
- The orchestrator (aiox-master) builds the prompt by reading files and replacing variables
- Subagents receive the complete prompt and execute autonomously
- The orchestrator parses the `step_output` YAML block from the subagent's response
- If the subagent fails to produce a valid YAML block, the orchestrator retries or requests manual intervention
