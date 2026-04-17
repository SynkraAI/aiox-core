# Handoff Artifact Schema

**Directory:** `.aios/handoffs/`
**Format:** YAML (one artifact per file)
**Owner:** All agents (producers) + activation-instructions STEP 5.5 (consumer)
**Created:** 2026-04-17

---

## Purpose

Handoff artifacts are the persistent contract between agents across sessions. When an agent completes a meaningful command (`*mockup`, `*draft`, `*develop`, `*review`, etc.), it writes a YAML artifact here describing what was just done and what the next agent should likely do next.

On activation (STEP 5.5 of every agent's `activation-instructions`), the incoming agent scans this directory for the most recent artifact with `consumed != true`, cross-references its `from_agent` + `last_command` against `.aios-core/data/workflow-chains.yaml`, and surfaces a suggested next command to the user. After the suggestion is displayed, the artifact is marked `consumed: true`.

This closes the loop that previously referenced a non-existent directory — making the "💡 Suggested: `*{next_command}`" line of the greeting finally functional.

---

## Filename Convention

```
{timestamp-safe}-{from_agent}-{command-sans-asterisk}.yaml
```

Where:
- `{timestamp-safe}` is the ISO-8601 UTC timestamp with `:` replaced by `-` (so the filename is portable across OSes). Example: `2026-04-17T14:30:00Z` → `2026-04-17T14-30-00Z`.
- `{from_agent}` is the agent id (kebab-case) that produced the artifact. Example: `ui-designer`, `sm`, `dev`.
- `{command-sans-asterisk}` is the invoking command with the leading `*` stripped. Example: `*mockup` → `mockup`, `*develop` → `develop`, `*validate-story-draft` → `validate-story-draft`.

**Example filenames:**

```
2026-04-17T14-30-00Z-ui-designer-mockup.yaml
2026-04-17T15-02-11Z-sm-draft.yaml
2026-04-17T17-45-00Z-dev-develop.yaml
```

Alphabetical sort by filename === chronological sort. This makes "most recent unconsumed" trivially implementable (scan descending, pick first where `consumed != true`).

---

## Required Fields

| Field | Type | Description |
|-------|------|-------------|
| `from_agent` | string | Agent id that produced the artifact (kebab-case, no `@`). Example: `ui-designer`. |
| `last_command` | string | The `*command` that was just completed (with leading `*`). Example: `*mockup`. |
| `timestamp` | string (ISO-8601) | UTC timestamp when the artifact was written. Example: `2026-04-17T14:30:00Z`. |
| `consumed` | boolean | Lifecycle flag. Always `false` at write time. Flipped to `true` by the next agent after STEP 5.5 displays the suggestion. |

---

## Optional Fields

| Field | Type | Description |
|-------|------|-------------|
| `to_agent` | string | Hint for the next agent id. Consumer may ignore if workflow-chains.yaml suggests a different path. Example: `ux-designer`. |
| `args` | string | Suggested args string to pass to the next `*command`. Example: `"serenity"`. |
| `context.project` | string | Project slug. Example: `tocks`, `bretda`, `anipis`. |
| `context.story` | string \| null | Active story id, or `null`. Example: `STORY-7.5`. |
| `context.summary` | string | Short (1-2 sentence) description of what the previous command produced. |
| `deliverables` | list | Files or outputs produced by the previous command. See structure below. |
| `deliverables[].path` | string | Absolute or project-relative path to the deliverable. |
| `deliverables[].type` | string | File type marker. Example: `md`, `png`, `yaml`, `tsx`. |
| `deliverables[].description` | string | Short description of the deliverable's purpose. |
| `next_suggestions` | list | Zero or more hints for continuation. |
| `next_suggestions[].command` | string | Suggested `*command` (with leading `*`). Example: `*palette`. |
| `next_suggestions[].reason` | string | Short rationale — why this next step makes sense. |
| `metadata.workflow` | string | Workflow identifier if produced inside one. Example: `visual_design_flow`. |
| `metadata.phase` | string | Named phase within the workflow. Example: `phase_1_brand`. |
| `metadata.session_id` | string \| null | Optional session/run uuid for correlating multiple artifacts. |

---

## Example Artifact

```yaml
# .aios/handoffs/2026-04-17T14-30-00Z-ui-designer-mockup.yaml

# required
from_agent: ui-designer
last_command: "*mockup"
timestamp: "2026-04-17T14:30:00Z"
consumed: false

# optional
to_agent: ui-designer
args: "serenity"
context:
  project: serenity
  story: null
  summary: "High-fidelity dashboard mockup generated via Stitch — hero, navigation, KPI cards."
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
  session_id: null
```

---

## Lifecycle

```
┌──────────────┐                      ┌──────────────┐                      ┌──────────────┐
│  Agent A     │ --- writes YAML ---> │  .aios/      │ <-- reads on -----   │  Agent B     │
│ (producer)   │                      │  handoffs/   │     activation       │ (consumer)   │
│              │                      │              │     STEP 5.5         │              │
│ *mockup done │                      │ consumed:    │                      │ suggests     │
│              │                      │   false      │                      │ *next-cmd    │
└──────────────┘                      └──────────────┘                      └──────┬───────┘
                                             ▲                                     │
                                             │                                     │
                                             └────── marks consumed: true ─────────┘
                                                    after suggestion displayed
```

**Rules:**

1. Producers **always** write with `consumed: false`.
2. Consumers **never** modify any field other than `consumed` (from `false` to `true`).
3. Artifacts are **append-only** (new file per command); old artifacts are not edited in place.
4. Artifacts older than 7 days with `consumed: true` are candidates for archival (out of scope for v1 — left as a future cleanup task).

---

## Writing a Handoff

Agents write handoffs via the reusable task:

```
.aios-core/development/tasks/write-handoff.md
```

See that task's "Example Invocations" section for concrete shapes. Do **not** write handoffs by hand or inline in commands — always invoke the task so the filename convention, timestamp format, and required fields stay in lockstep.

---

## References

- **Consumer contract:** `aios-master.md` + every agent `.md` — `activation-instructions` STEP 5.5
- **Chain data:** `.aios-core/data/workflow-chains.yaml` — routing table mapping `(from_agent, last_command)` → next step
- **Writer task:** `.aios-core/development/tasks/write-handoff.md` — the only sanctioned way to produce an artifact
- **Rule:** `.claude/rules/workflow-execution.md` — squad-first routing context
