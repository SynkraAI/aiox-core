# Task: Design Mind Clone Consultation

**Task ID:** design-consult-mind-clones
**Version:** 1.0
**Purpose:** Parameterized, reusable consultation of Mind Clone advisors for design decisions — invokable by any Design Squad agent via `aios-brain-bridge` MCP.
**Owner Agents:** design-lead, ui-designer, ux-designer, motion-designer, design-systems-engineer, ux-researcher, ux-writer
**Mode:** Blocking for major decisions / Non-blocking with fallback if MCP unavailable
**Governance:** Enforces `.claude/rules/mind-clone-auto-consult.md` and `.claude/rules/jarvis-integration.md`

---

## Why This Task Exists

Design Squad agents reference Mind Clone advisors in their `customization` text (e.g., don-norman, dieter-rams, john-maeda, erik-spiekermann), but historically no workflow actually invoked `mcp__aios-brain-bridge__request_expert_consultation`. This task closes that gap: it is the single, parameterized entry point that makes Mind Clone consultation real, auditable, and callable from any design command.

---

## Inputs

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `question` | string | **Yes** | The specific decision, critique, or validation request to pose to the Mind Clone. Should be concrete and answerable (not open-ended). |
| `agent` | string | **Yes** | The Design Squad agent invoking the task (e.g., `design-lead`, `ui-designer`, `ux-designer`, `motion-designer`, `design-systems-engineer`, `ux-researcher`, `ux-writer`). Used for expert resolution and audit logging. |
| `expert-id` | string | No | Specific Mind Clone ID to consult. If omitted, resolved from the Default Expert Mapping table below using `agent` as the key. |
| `project` | string | No | Project context (e.g., `tocks`, `bretda`, `anipis`, `serenity`, `low-ticket-10k`, `aiox-corporation`). Used to enrich context payload. |
| `context` | string | No | Free-form additional context (constraints, prior decisions, links to artifacts) to attach to the consultation. |

---

## Default Expert Mapping

If `expert-id` is not supplied, the invoking `agent` resolves to a default Mind Clone per the table below. Pick the first expert whose domain best matches the `question`; otherwise default to the first entry.

| Invoking Agent | Default Expert (primary) | Alternate Expert | Domain Fit |
|----------------|--------------------------|------------------|-----------|
| `design-lead` | `don-norman` | `john-maeda` | Systems thinking, design leadership |
| `ui-designer` | `dieter-rams` | `erik-spiekermann` | Visual principles, typography |
| `ux-designer` | `don-norman` | `julie-zhuo` | Usability heuristics, craft |
| `motion-designer` | `val-head` | `refika-anadol` | Motion design, creative direction |
| `design-systems-engineer` | `brad-frost` | `addy-osmani` | Atomic Design, performance |
| `ux-researcher` | `teresa-torres` | `don-norman` | Continuous discovery, heuristics |
| `ux-writer` | `ann-handley` | `donald-miller` | Content craft, storytelling |

**Resolution rule:** If `expert-id` is omitted AND the `agent` is not in the table, fall back to `don-norman` (generalist design principles). Log the fallback in the audit trail.

**Full advisor list:** `.aios-core/data/jarvis-mind-clone-map.yaml` (see `agents.design-lead`, `agents.design-systems-engineer`, `agents.ux-design-expert`).
**Expert index:** `.aios-core/data/jarvis-mind-clone-index.json` (162 experts total, searchable by id).

---

## Pre-Conditions

```yaml
pre-conditions:
  - [ ] `question` is a non-empty string
    blocker: true
    error_message: "design-consult-mind-clones requires a concrete question. Abort."

  - [ ] `agent` is provided and maps to a known design agent id
    blocker: true
    error_message: "design-consult-mind-clones requires an invoking agent (design-lead, ui-designer, etc.)."

  - [ ] Resolved `expert-id` exists in .aios-core/data/jarvis-mind-clone-index.json
    blocker: false
    error_message: "Expert id not found in index — falling back to don-norman and logging warning."

  - [ ] MCP server `aios-brain-bridge` is reachable
    blocker: false
    error_message: "aios-brain-bridge MCP unavailable — activating fallback path (see Fallback section)."
```

---

## Workflow (5 Steps)

### Step 1 — Validate & Resolve Inputs

1. Assert `question` is non-empty and `agent` is provided.
2. If `expert-id` is supplied, verify it exists in the index file; otherwise resolve from the Default Expert Mapping table using `agent` as key.
3. Normalize `project` and `context` (default to empty strings if omitted).
4. Compute `topic-slug`: lowercase the first 40 chars of `question`, replace non-alphanumerics with `-`, strip trailing `-`.

### Step 2 — Request Consultation

Invoke the MCP tool:

```
mcp__aios-brain-bridge__request_expert_consultation
  expert:   {resolved expert-id}
  question: {question}
  context:  {
    project: {project},
    agent:   {agent},
    context: {context}
  }
```

Capture the returned `consultation_id`. If the tool errors or times out, proceed to the Fallback section.

### Step 3 — Retrieve Response

Poll for the response using:

```
mcp__aios-brain-bridge__get_consultation_response
  consultation_id: {from Step 2}
```

**Polling strategy:**
- Initial wait: 5s
- Retry every 10s, up to 60s total
- On timeout: proceed to Fallback section with `"Expert consultation pending"` marker.

### Step 4 — Integrate Advice Into Deliverable

1. Summarize the expert's response (1-3 bullets of actionable guidance).
2. Incorporate relevant points into the invoking agent's current deliverable (brief, critique, brand audit, approval note, etc.).
3. Preserve the full raw response for the audit log — do not paraphrase away nuance.

### Step 5 — Audit Log (Mandatory)

Write the consultation to a date-stamped log file at:

```
.aios-core/data/mind-clone-consultations/YYYY-MM-DD-{agent}-{expert}-{topic-slug}.md
```

**Log file template:**

```markdown
# Mind Clone Consultation Log

- **Timestamp:** {ISO 8601 UTC}
- **Invoking Agent:** {agent}
- **Expert Consulted:** {expert-id}
- **Project:** {project or "n/a"}
- **Consultation ID:** {id from MCP or "fallback"}

## Question

{question}

## Context Provided

{context, or "none"}

## Expert Response

{full raw response, or "FALLBACK — MCP unavailable, recommendation pending"}

## How Applied

{1-3 bullets describing how advice was integrated into the deliverable}

## Deliverable Reference

{path or identifier of the artifact where advice landed}
```

If the log directory does not exist, create it (`.aios-core/data/mind-clone-consultations/`).

---

## Fallback (MCP Unavailable)

Per `.claude/rules/mind-clone-auto-consult.md`:

1. Emit a console warning: `"Mind Clone consultation unavailable — proceeding without expert input."`
2. Insert into the invoking agent's deliverable:
   `"Expert consultation pending — recommend review with {expert-id} once aios-brain-bridge MCP is available."`
3. Still write the audit log (Step 5) with `Consultation ID: fallback` and `Expert Response: FALLBACK — MCP unavailable`. This preserves the trail so consultations can be retroactively re-run.
4. Do **not** block the caller — design work continues, annotated.

---

## Post-Conditions

```yaml
post-conditions:
  - [ ] Expert resolved (either explicit or from mapping)
    blocker: true
    error_message: "No expert resolved — task cannot complete."

  - [ ] Audit log file exists at .aios-core/data/mind-clone-consultations/YYYY-MM-DD-{agent}-{expert}-{topic}.md
    blocker: true
    error_message: "Consultation not auditable — log file missing."

  - [ ] Invoking deliverable contains either the integrated advice OR the fallback marker
    blocker: true
    error_message: "Consultation outcome not reflected in deliverable."
```

---

## Acceptance Criteria

- Task is invoked with a concrete `question` and valid `agent`.
- Expert is resolved via explicit `expert-id` or default mapping — never guessed.
- On MCP success: full response captured, advice integrated, log written.
- On MCP failure: fallback marker placed in deliverable, log still written with fallback flag.
- No hallucinated experts, no invented tool names (only `mcp__aios-brain-bridge__request_expert_consultation` and `mcp__aios-brain-bridge__get_consultation_response`).

---

## Example Invocations

### Example 1 — design-lead validating a brief (default expert resolution)

```yaml
task: design-consult-mind-clones
params:
  question: "Does this design brief for Bretda's 2026 rebrand prioritize clarity of brand values over surface aesthetics?"
  agent: design-lead
  project: bretda
  context: "Brief draft at outputs/design-lead/bretda/brief-v2.md. Target: luxury billiard tables, dark brand tone, R$33k avg ticket."
# expert-id omitted → resolves to don-norman (design-lead default)
```

### Example 2 — ui-designer requesting typography critique (explicit expert)

```yaml
task: design-consult-mind-clones
params:
  question: "Is this typographic hierarchy (Cormorant H1 + Raleway body) appropriate for a dark luxury landing page, or does the contrast risk undermining legibility?"
  agent: ui-designer
  expert-id: erik-spiekermann
  project: bretda
  context: "Homepage hero section, Figma file 1234. Current pair: Cormorant 64/72 Regular + Raleway 18/28 Medium."
```

### Example 3 — design-systems-engineer validating token architecture

```yaml
task: design-consult-mind-clones
params:
  question: "Should semantic tokens be layered over primitive color tokens, or should each component reference primitives directly?"
  agent: design-systems-engineer
  expert-id: brad-frost
  project: tocks
  context: "Current tokens.json has primitives only. Considering adding semantic layer (button/bg, surface/raised, etc.)."
```

### Example 4 — Bash-style invocation (for scripted callers)

```bash
# Conceptual — actual invocation happens through the invoking agent's workflow,
# which calls the MCP tools directly. This is the semantic shape:

invoke design-consult-mind-clones \
  --question "Does this micro-interaction risk motion sickness for users with vestibular disorders?" \
  --agent motion-designer \
  --expert-id val-head \
  --project anipis \
  --context "Scroll-linked parallax on dashboard, 40px displacement, 400ms ease-out."
```

---

## Integration Contracts

Agents that wire `*commands` to this task MUST:

1. Pass `agent` as their own agent id (not the user's).
2. Never invent `expert-id` values — use the Default Expert Mapping table or consult `.aios-core/data/jarvis-mind-clone-map.yaml`.
3. Treat fallback outcomes as non-fatal — design work proceeds annotated, not blocked.
4. Surface the audit log path to the user in their response so the consultation is discoverable.

---

## References

- **Rule:** `.claude/rules/mind-clone-auto-consult.md` — when core agents MUST consult before decisions
- **Rule:** `.claude/rules/jarvis-integration.md` — gate hooks, self-consultation flow, 162-expert universe
- **Rule:** `.claude/rules/mcp-usage.md` — `aios-brain-bridge` is a custom MCP (16 tools), native tools preferred but MCP required for expert consultation
- **Data:** `.aios-core/data/jarvis-mind-clone-map.yaml` — agent-to-advisor mapping (primary/secondary/project overrides)
- **Data:** `.aios-core/data/jarvis-mind-clone-index.json` — full 162-expert index, source-of-truth for valid expert ids
- **MCP Tools:** `mcp__aios-brain-bridge__request_expert_consultation`, `mcp__aios-brain-bridge__get_consultation_response`

---

## Metadata

```yaml
task: design-consult-mind-clones
version: 1.0.0
story: Design Squad Fix Plan — Task #4
dependencies:
  - aios-brain-bridge MCP
  - .aios-core/data/jarvis-mind-clone-map.yaml
  - .aios-core/data/jarvis-mind-clone-index.json
tags:
  - design-squad
  - mind-clone
  - consultation
  - mcp
  - governance
agents:
  - design-lead
  - ui-designer
  - ux-designer
  - motion-designer
  - design-systems-engineer
  - ux-researcher
  - ux-writer
created_at: 2026-04-17
changelog:
  1.0.0:
    - Initial version: parameterized Mind Clone consultation for Design Squad
    - Default expert mapping for 7 design agents
    - Mandatory audit log at .aios-core/data/mind-clone-consultations/
    - Fallback path for MCP unavailability
```
