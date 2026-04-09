# Tier 2 Template — Full-Featured Forge

> Use this template for complex domains with multiple workflows, state tracking, and plugins.
> Includes everything from Tier 1 PLUS: personality, config, runner, phases, workflows, plugins.

---

## Additional Files (beyond Tier 1)

### File 4: personality.md

```markdown
# {{DOMAIN_TITLE}} Forge — Personality

## Banner

Show this banner at the start of every interaction:

` ` `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {{EMOJI}} {{DOMAIN_UPPER}} FORGE — {{TAGLINE}}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
` ` `

## Progress Display

For multi-step operations, show progress:

` ` `
  Phase 1/N: {{phase_name}} ████████░░░░ 67%
` ` `

## Tone

{{TONE_DESCRIPTION}}
- Direct, no fluff
- Explain WHY each executor was chosen
- Use domain-specific terminology naturally
```

---

### File 5: config.yaml

```yaml
# {{DOMAIN_TITLE}} Forge — Configuration

version: "1.0.0"
domain: "{{DOMAIN}}"

defaults:
  tier: 1
  checkpoints: true
  max_retries: 3

phases:
  discovery:
    required: true
    timeout: null  # no timeout — wait for user
  execution:
    checkpoint_before: true
    checkpoint_after: true

quality_gates:
  {{QUALITY_GATES}}
  # Example:
  # validate_output:
  #   enabled: true
  #   check: "output files exist and are non-empty"

executors:
  {{EXECUTOR_CONFIG}}
  # Example:
  # default_squad: "squads/{squad-name}"
  # fallback_skill: "skills/{skill-name}"
```

---

### File 6: runner.md

```markdown
# {{DOMAIN_TITLE}} Forge — Runner

## State Machine

The runner manages execution state across phases.

### State File

Location: `.aios/{{DOMAIN}}-forge-runs/{run_id}/state.json`

` ` `json
{
  "run_id": "{{DOMAIN}}-{timestamp}",
  "domain": "{{DOMAIN}}",
  "status": "running|paused|completed|failed",
  "current_phase": 0,
  "intent": "{{detected_intent}}",
  "phases": {
    "0": { "status": "completed", "started": "ISO8601", "ended": "ISO8601" },
    "1": { "status": "running", "started": "ISO8601" }
  },
  "context": {
    "user_input": "original request",
    "discovery_answers": {},
    "plan": {}
  },
  "errors": []
}
` ` `

### Phase Transitions

` ` `
Phase 0 (Discovery) → Phase 1 (Plan) → Phase 2 (Execute) → Phase 3 (Deliver)
                                ↑                    |
                                └── on failure ──────┘
` ` `

### Error Recovery

| Error Type | Action |
|---|---|
| Executor not found | WARN user, skip step, suggest alternative |
| Executor fails | Retry up to max_retries, then HALT with options |
| User rejects plan | Return to Discovery with new context |
| State file corrupted | Rebuild from last known good phase |

### Resume Protocol

On `/{{DOMAIN}}-forge resume`:
1. Scan `.aios/{{DOMAIN}}-forge-runs/` for status == "running" or "paused"
2. Load state.json
3. Show summary of where we stopped
4. Ask user: "Continuar de onde parou ou recomeçar?"
```

---

### File 7: phases/phase-0-discovery.md

```markdown
# Phase 0: Discovery — {{DOMAIN_TITLE}} Forge

## Objetivo

Entender o que o usuário precisa antes de agir.

## Steps

### Step 1: Parse Intent

Read the user's original command. Classify using the Intent Classification table in SKILL.md.

### Step 2: Ask Discovery Questions

Use the Discovery Questions from SKILL.md. Skip questions the user already answered.

**Format (MANDATORY):** Present as numbered options with bold title + description.
Always end with "Digitar outra coisa." as escape valve.

### Step 3: Ecosystem Context

Load relevant context:
- Read capability-map.yaml
- Check for existing project state
- Load domain-specific context files

### Step 4: Summarize Understanding

Present to user:
` ` `
Entendi o seguinte:
- Objetivo: {what they want}
- Tipo: {classified intent}
- Executor(es): {who will do it}
- Estimativa: {rough scope}

Correto? Posso montar o plano?
` ` `

Wait for approval.
```

---

### File 8: workflows/ (one per execution path)

```markdown
# Workflow: {{WORKFLOW_NAME}} — {{DOMAIN_TITLE}} Forge

## When to Use

{{WHEN_TO_USE}}

## Pipeline

` ` `
Step 1: {{step}} → Executor: {{executor}}
Step 2: {{step}} → Executor: {{executor}}
...
Step N: {{step}} → Executor: {{executor}}
` ` `

## Checkpoints

- After Step {{N}}: {{what to validate}}

## Differences from Default

{{HOW_THIS_DIFFERS}}
```

---

### File 9: plugins/SCHEMA.md

```markdown
# {{DOMAIN_TITLE}} Forge — Plugin Schema

Plugins extend the forge's behavior via lifecycle hooks.

## Hook Points

| Hook | When | Use Case |
|---|---|---|
| `before:run` | Before any phase starts | Load custom context |
| `before:phase:N` | Before phase N | Pre-phase validation |
| `after:phase:N` | After phase N completes | Post-phase logging |
| `on:executor-dispatch` | When dispatching to executor | Inject context |
| `on:executor-return` | When executor completes | Validate output |
| `on:error` | On any error | Custom error handling |
| `on:checkpoint` | At user checkpoints | Custom display |
| `after:run` | After all phases complete | Cleanup, logging |

## Plugin Format

` ` `yaml
name: {{plugin-name}}
version: "1.0.0"
description: "What this plugin does"
hooks:
  - event: "after:phase:2"
    action: "log-output"
    config:
      log_file: "data/{{DOMAIN}}-log.jsonl"
` ` `
```

---

## Tier 2 Checklist

Before delivering a Tier 2 forge, verify:

- [ ] All Tier 1 files present and valid (SKILL.md, capability-map.yaml, references/examples.md)
- [ ] personality.md defines banner, progress display, and tone
- [ ] config.yaml has sensible defaults
- [ ] runner.md defines state machine, error recovery, and resume
- [ ] At least 1 phase file in phases/
- [ ] At least 1 workflow file in workflows/
- [ ] plugins/SCHEMA.md documents hook points
- [ ] All executors in capability-map.yaml exist (Glob check)
- [ ] State file path uses domain name (`{{DOMAIN}}-forge-runs/`)
