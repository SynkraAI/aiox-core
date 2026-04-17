# Task: Write Handoff Artifact

**Task ID:** write-handoff
**Version:** 1.0
**Purpose:** Parameterized, reusable writer for handoff artifacts at `.aios/handoffs/` — invokable by ANY agent at the end of a meaningful command to persist state for the next agent's activation.
**Owner Agents:** All agents (producer-side). Consumer-side lives in `activation-instructions` STEP 5.5.
**Mode:** Non-blocking, idempotent. Write failure must never abort the invoking command.
**Governance:** Implements the schema at `.aios-core/data/handoffs-schema.md`.

---

## Why This Task Exists

Every agent's `activation-instructions` STEP 5.5 reads `.aios/handoffs/` on startup to surface the "💡 **Suggested:** `*{next_command}`" line of the greeting. Without a producer, that directory stays empty and the suggestion never fires. This task is the producer — the single, parameterized entry point that keeps the handoff contract alive.

It also enforces the filename convention, timestamp format, and required fields so that independent agents can not accidentally diverge from the schema.

---

## Inputs

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `from_agent` | string | **Yes** | Agent id producing the artifact (kebab-case, no `@`). Example: `ui-designer`, `sm`, `dev`. |
| `last_command` | string | **Yes** | The `*command` just completed (WITH leading `*`). Example: `*mockup`, `*draft`, `*develop`. |
| `to_agent` | string | No | Hint for the next agent id. Example: `ux-designer`. |
| `args` | string | No | Suggested args string to pass to the next command. Example: `"serenity"`. |
| `context.project` | string | No | Project slug. Example: `tocks`, `bretda`, `anipis`. |
| `context.story` | string | No | Active story id. Example: `STORY-7.5`. |
| `context.summary` | string | No | Short (1-2 sentences) description of what was just produced. |
| `deliverables` | list | No | Files/outputs produced. Each entry: `{ path, type, description }`. |
| `next_suggestions` | list | No | 0-N hints for continuation. Each entry: `{ command, reason }`. |
| `metadata.workflow` | string | No | Workflow identifier if produced inside one. Example: `visual_design_flow`. |
| `metadata.phase` | string | No | Named phase within the workflow. Example: `phase_1_brand`. |
| `metadata.session_id` | string | No | Optional session/run uuid for correlation. |

See `.aios-core/data/handoffs-schema.md` for full field semantics.

---

## Pre-Conditions

```yaml
pre-conditions:
  - [ ] `from_agent` is a non-empty string (kebab-case, no `@` prefix)
    blocker: true
    error_message: "write-handoff requires a from_agent (e.g., ui-designer). Abort."

  - [ ] `last_command` is a non-empty string AND starts with `*`
    blocker: true
    error_message: "write-handoff requires last_command with leading asterisk (e.g., *mockup). Abort."

  - [ ] `.aios/handoffs/` directory is reachable OR creatable
    blocker: false
    error_message: "Handoff directory missing — will create via mkdir."
```

---

## Workflow (4 Steps)

### Step 1 — Compute Timestamp and Filename

1. Generate the current UTC timestamp in ISO-8601 format:
   - Shape: `YYYY-MM-DDTHH:MM:SSZ`
   - Example: `2026-04-17T14:30:00Z`
   - Capture as `timestamp` (used inside the YAML body).

2. Compute the filename-safe variant (`:` is illegal on Windows filenames):
   - Replace all `:` with `-` in the timestamp.
   - Example: `2026-04-17T14:30:00Z` → `2026-04-17T14-30-00Z`
   - Capture as `ts-safe`.

3. Strip the leading `*` from `last_command` for the filename segment:
   - Example: `*mockup` → `mockup`, `*validate-story-draft` → `validate-story-draft`
   - Capture as `cmd-safe`.

4. Compose the final filename:
   ```
   {ts-safe}-{from_agent}-{cmd-safe}.yaml
   ```
   Example: `2026-04-17T14-30-00Z-ui-designer-mockup.yaml`

### Step 2 — Ensure Target Directory Exists

1. Check that `.aios/handoffs/` exists.
2. If missing, create it (`mkdir -p .aios/handoffs/`). The task should be robust to greenfield installs where `.gitkeep` is the only prior tenant.
3. If creation fails (permissions, read-only filesystem), skip to Fallback.

### Step 3 — Assemble and Write the YAML Body

1. Assemble the required block:

   ```yaml
   from_agent: {from_agent}
   last_command: "{last_command}"
   timestamp: "{timestamp}"
   consumed: false
   ```

2. Append optional fields ONLY when the input was supplied — never emit empty keys.
   - `to_agent`, `args` at the top level.
   - `context:` block only if at least one of `context.project`, `context.story`, `context.summary` is provided.
   - `deliverables:` block only if the list is non-empty; each entry must have `path`, `type`, `description`.
   - `next_suggestions:` block only if the list is non-empty; each entry must have `command`, `reason`.
   - `metadata:` block only if at least one of `metadata.workflow`, `metadata.phase`, `metadata.session_id` is provided.

3. Write the composed YAML to `.aios/handoffs/{filename}` using the invoking agent's file-write capability (Write tool, fs.writeFile, etc.).

4. Do **not** overwrite an existing file with the same name. If a collision occurs (same second, same agent, same command), append `-2`, `-3`, etc. to the `cmd-safe` segment until unique. This is a defensive branch — second-granularity timestamps should make collisions rare.

### Step 4 — Return the Artifact Path

1. Return the absolute or project-relative path of the written file to the caller.
2. Log a brief confirmation line in the invoking agent's response (optional but recommended):
   ```
   📎 Handoff recorded: .aios/handoffs/{filename}
   ```
3. Do not block the caller on this step. If the invoking agent is mid-workflow, the handoff write is a fire-and-forget tail-step.

---

## Fallback (Write Failure)

If Step 2 or Step 3 fails (directory uncreatable, disk full, permission denied):

1. Emit a console warning: `"write-handoff: unable to persist artifact — next agent's activation suggestion will be skipped silently."`
2. Do **not** raise to the caller — the invoking command's success or failure is independent of the handoff.
3. If the invoking agent has a visible deliverable it can annotate, add a one-liner: `"Handoff not written (see warning above); next agent will not receive workflow hint."`
4. Continue.

This is intentionally permissive: handoffs are best-effort, not load-bearing. STEP 5.5 of the consumer already handles the "no artifact found" branch silently.

---

## Post-Conditions

```yaml
post-conditions:
  - [ ] File written at .aios/handoffs/{ts-safe}-{from_agent}-{cmd-safe}.yaml
    blocker: false
    error_message: "Handoff file not written — consumer will skip suggestion step silently."

  - [ ] File contains all required fields (from_agent, last_command, timestamp, consumed: false)
    blocker: false
    error_message: "Handoff malformed — consumer may fail to parse; investigate."

  - [ ] Filename uses `-` instead of `:` in the timestamp segment
    blocker: false
    error_message: "Filename contains illegal `:` on Windows — parsing may still work but portability is compromised."
```

---

## Acceptance Criteria

- Task is invoked with a valid `from_agent` and `last_command` (with `*` prefix).
- A YAML file is written to `.aios/handoffs/` using the naming convention `{ts-safe}-{from_agent}-{cmd-safe}.yaml`.
- The YAML includes all four required fields; optional fields are only present when inputs supplied them.
- `consumed: false` is always set at write time.
- On any write failure, the invoking command still completes successfully.
- No inline YAML writing in agent commands — this task is the only sanctioned writer.

---

## Example Invocations

### Example 1 — ui-designer after `*mockup` (with deliverables and next_suggestions)

```yaml
task: write-handoff
params:
  from_agent: ui-designer
  last_command: "*mockup"
  context:
    project: serenity
    story: null
    summary: "High-fidelity dashboard mockup generated — hero, nav, KPI cards."
  deliverables:
    - path: "outputs/ui-design/serenity/mockups/dashboard-v1.html"
      type: "html"
      description: "Stitch-generated interactive prototype"
    - path: "outputs/ui-design/serenity/mockups/dashboard-v1.png"
      type: "png"
      description: "Static screenshot for sharing"
  next_suggestions:
    - command: "*palette"
      reason: "Typical next step in visual_design_flow — tokenize colors after mockup"
    - command: "*responsive"
      reason: "Generate breakpoint specs once mockup is approved"
  metadata:
    workflow: visual_design_flow
    phase: phase_2_layout
# → writes .aios/handoffs/2026-04-17T14-30-00Z-ui-designer-mockup.yaml
```

### Example 2 — ux-researcher after `*persona` (minimal required fields + to_agent hint)

```yaml
task: write-handoff
params:
  from_agent: ux-researcher
  last_command: "*persona"
  to_agent: ux-designer
  context:
    project: tocks
    summary: "Three primary personas validated via 12 interviews — dossier ready for wireframing."
  next_suggestions:
    - command: "*wireframe"
      reason: "Personas approved — proceed to wireframing"
# → writes .aios/handoffs/2026-04-17T15-02-11Z-ux-researcher-persona.yaml
```

### Example 3 — dev after `*develop` (minimum viable)

```yaml
task: write-handoff
params:
  from_agent: dev
  last_command: "*develop"
  context:
    project: aiox-corporation
    story: STORY-ACT-6
    summary: "Unified activation pipeline — all 12 agents integrated. Ready for QA."
  next_suggestions:
    - command: "*review"
      reason: "Story implementation complete — hand off to @qa"
# → writes .aios/handoffs/2026-04-17T17-45-00Z-dev-develop.yaml
```

---

## Integration Contracts

Agents that invoke this task as a tail-step in their workflows MUST:

1. Pass their own agent id as `from_agent` — never the caller's, never the user's.
2. Include the leading `*` in `last_command` — the task will strip it for the filename segment but expects it in the YAML body to be consistent with how `activation-instructions` STEP 5.5 reads it.
3. Treat write failures as non-fatal — the command's primary output is what the user paid for; the handoff is a bonus.
4. Never manipulate `.aios/handoffs/` files by hand — only through this task.
5. Never write a handoff with `consumed: true` — that state transition is owned by the consumer side (STEP 5.5).

---

## References

- **Schema:** `.aios-core/data/handoffs-schema.md` — full field reference, lifecycle, filename convention
- **Consumer contract:** `aios-master.md` + every agent `.md` — `activation-instructions` STEP 5.5
- **Chain data:** `.aios-core/data/workflow-chains.yaml` — routing table `(from_agent, last_command)` → next step
- **Rule:** `.claude/rules/workflow-execution.md` — squad-first routing context

---

## Metadata

```yaml
task: write-handoff
version: 1.0.0
story: Design Squad Fix Plan — Task #8
dependencies:
  - .aios/handoffs/ (creatable on demand)
  - .aios-core/data/handoffs-schema.md
tags:
  - handoff
  - workflow
  - continuity
  - governance
  - universal
agents:
  - all
created_at: 2026-04-17
changelog:
  1.0.0:
    - Initial version: parameterized handoff artifact writer
    - Filename convention with Windows-safe timestamp
    - Non-blocking fallback for write failures
    - Schema alignment with .aios-core/data/handoffs-schema.md
```
