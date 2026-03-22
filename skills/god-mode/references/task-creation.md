# Task Creation Guide — Schema & Checklist

## Naming

| Rule | Pattern | Example |
|------|---------|---------|
| Core task | `{verb}-{noun}.md` | `qa-gate.md`, `create-doc.md` |
| Squad task | `{prefix}-{role}-{verb}-{noun}.md` | `bc-renderer-create-html.md` |
| Task function | `camelCase()` | `qaGate()`, `createDoc()` |

Common verbs: `create`, `validate`, `review`, `execute`, `analyze`, `design`, `build`, `extract`

## Where to Save

| Type | Path |
|------|------|
| **Core** | `.aiox-core/development/tasks/{name}.md` |
| **Squad** | `squads/{squad}/tasks/{name}.md` |

## Complete Task Schema

**IMPORTANTE:** O frontmatter YAML fica dentro de um comentario HTML `<!-- -->`, e campos `tools`/`utils` ficam em YAML `---` separado fora do comentario.

```markdown
---
tools:
  - {tool_name}
utils:
  - {utility_name}
---

# {Task Title}

## Purpose

{Clear 1-2 sentence description.}

---

## Execution Modes

### 1. YOLO Mode — Fast, Autonomous (0-1 prompts)
- Execute all steps without asking
- Log decisions instead of asking

### 2. Interactive Mode — Balanced (5-10 prompts) **[DEFAULT]**
- Ask at decision points
- Educational checkpoints

### 3. Pre-Flight Planning — Comprehensive (10-15 prompts)
- Plan everything before executing
- Full approval at each phase

**Parameter:** `mode` (optional, default: `interactive`)

---

<!--
## Task Definition (AIOX Task Format V1.0)

task: {taskFunction}()
responsavel: {AgentName} ({Archetype})
responsavel_type: Agente
atomic_layer: Template|Organism|System

**Entrada:**
- campo: {field_name}
  tipo: {string|path|object|array}
  origem: {User Input|config|computed}
  obrigatorio: {true|false}
  validacao: "{validation rule}"

**Saida:**
- campo: {field_name}
  tipo: {string|path|object|array}
  destino: {Return value|Memory|File}
  persistido: {true|false}

## Constitutional Gates

### Gate: {Gate Name} (Article {N})
constitutional_gate:
  article: {N}
  severity: BLOCK
  validation:
    - "{condition}"
  on_violation:
    action: BLOCK
    message: "{error message}"

## Pre-Conditions
- [ ] {Condition}
  tipo: pre-condition
  blocker: true
  validacao: "{how to check}"
  error_message: "{error if not met}"

## Post-Conditions
- [ ] {Condition}
  tipo: post-condition
  blocker: true
  validacao: "{how to verify}"

## Acceptance Criteria
- [ ] {Criterion}
  tipo: acceptance-criterion
  blocker: true

## Error Handling
**Strategy:** abort|recover|ignore
- {Error Name}
  - Cause: {cause}
  - Resolution: {fix}
  - Recovery: {fallback}
-->

---

## Steps

### Step 1: {Title}

{Detailed instructions.}

**Expected output:** {what this step produces}

### Step 2: {Title}

{Instructions...}

---

## Handoff

**Next agent:** {agent_id}
**Next command:** `*{command}`
**Artifacts produced:** {list of files/outputs}
```

## Minimal Template (Copy & Fill)

```markdown
---
tools: []
utils: []
---

# {Task Title}

## Purpose

{What this task does.}

---

## Execution Modes

### 1. YOLO Mode — (0-1 prompts)
### 2. Interactive Mode — **[DEFAULT]** (5-10 prompts)
### 3. Pre-Flight Planning — (10-15 prompts)

---

## Entrada

| Campo | Tipo | Obrigatorio | Origem |
|-------|------|-------------|--------|
| {field} | {type} | Sim/Nao | {origin} |

## Saida

| Campo | Tipo | Destino | Persistido |
|-------|------|---------|-----------|
| {field} | {type} | {destination} | Sim/Nao |

---

## Pre-Conditions

- [ ] {Condition 1}
- [ ] {Condition 2}

---

## Steps

### Step 1: {Title}

{Instructions}

### Step 2: {Title}

{Instructions}

---

## Post-Conditions

- [ ] {Verification 1}
- [ ] {Verification 2}

---

## Error Handling

| Error | Action |
|-------|--------|
| {error} | {action} |

---

## Handoff

**Next agent:** @{agent}
**Next command:** `*{command}`
```

## Path Resolution

```
Agent command → task file → resolved path
  Core: .aiox-core/development/tasks/{task-file}
  Squad: squads/{squad}/tasks/{task-file}
```

The `IDE-FILE-RESOLUTION` block in agent definitions handles this mapping.

## Registration Steps

### Core Task
1. Save to `.aiox-core/development/tasks/{name}.md`
2. Add to agent's `dependencies.tasks` array
3. If task maps to a command, add command entry in agent definition

### Squad Task
1. Save to `squads/{squad}/tasks/{name}.md`
2. Add to agent's `dependencies.tasks` array
3. Update squad `config.yaml` components

## Validation Checklist (12 Points)

| # | Check | Blocking |
|---|-------|----------|
| 1 | Valid Markdown with YAML frontmatter (`---`) | YES |
| 2 | `task` function name present (camelCase) | YES |
| 3 | `responsavel` agent specified | YES |
| 4 | Purpose section present and clear | YES |
| 5 | Execution Modes section (3 modes) | YES |
| 6 | Entrada/Saida documented | YES |
| 7 | Pre-conditions defined | Advisory |
| 8 | Steps are numbered and actionable | YES |
| 9 | Post-conditions defined | Advisory |
| 10 | Error handling section present | Advisory |
| 11 | File saved to correct path | YES |
| 12 | Added to agent dependencies | YES |
