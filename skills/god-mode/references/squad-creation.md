# Squad Creation Guide — Structure & Checklist

## What is a Squad

A squad is a self-contained collection of agents, tasks, workflows, and config that work together toward a specific domain. Squads live in `squads/{name}/` and are activated via slash commands.

## Naming

| Element | Pattern | Example |
|---------|---------|---------|
| Squad name | `{kebab-case}` | `advisor-board`, `whatsapp-prospector` |
| Slash prefix | `{camelCase}` (in config.yaml) | `advisorBoard`, `ensinioProspector` |
| Agent ID | `{prefix}-{role}` | `ab-hormozi`, `ep-parser` |
| Task ID | `{prefix}-{role}-{verb}-{noun}.md` | `ab-chief-run-session.md` |

## Directory Structure

```
squads/{squad-name}/
├── config.yaml                    # Manifest (REQUIRED)
├── README.md                      # Documentation (REQUIRED)
├── agents/                        # Agent definitions (REQUIRED)
│   ├── {prefix}-{role}.md
│   └── ...
├── tasks/                         # Task definitions (REQUIRED)
│   ├── {prefix}-{role}-{verb}-{noun}.md
│   └── ...
├── workflows/                     # Multi-step workflows
│   └── {workflow-name}.yaml
├── checklists/                    # Validation checklists
│   └── {checklist-name}.md
├── templates/                     # Reusable templates
│   └── {template-name}.md
├── data/                          # Static data files
│   └── {data}.json
├── lib/                           # Implementation code
│   └── {module}.js
├── scripts/                       # Utility scripts
│   └── {script}.js
└── docs/                          # Reference documentation
    └── {ref}.md
```

## config.yaml Schema

**IMPORTANTE:** Nosso ecossistema usa `config.yaml` (nao `squad.yaml` como o generico).

```yaml
pack:
  name: "{squad-name}"                       # kebab-case (REQUIRED)
  version: "1.0.0"                           # SemVer (REQUIRED)
  short-title: "{Display Title}"             # REQUIRED
  description: >-                            # REQUIRED
    Multi-line description of squad purpose.
  author: "{author}"                         # REQUIRED
  icon: "{emoji}"                            # REQUIRED
  slashPrefix: "{camelCase}"                 # REQUIRED — activation prefix

# ─── TIER STRUCTURE ─── (agent hierarchy)

tier_structure:
  orchestrator: "{chief-agent-id}"           # Main coordinator
  tier_0:
    name: "{Level Name}"
    agents: ["{agent-1}", "{agent-2}"]
    purpose: "{what they do}"
  tier_1:
    name: "{Specialist Level}"
    agents: ["{agent-3}", "{agent-4}"]
    purpose: "{specializations}"

# ─── COMPONENTS ───

components:
  agents:
    - "{prefix}-{role1}.md"
    - "{prefix}-{role2}.md"
  tasks:
    - "{prefix}-{role}-{verb}-{noun}.md"
  workflows:
    - "{workflow-name}.yaml"
  checklists: []
  templates: []

# ─── PATTERN LIBRARY ─── (optional, for squads with patterns)

pattern_library:
  prefix: "{XX}"                             # 2-char prefix
  naming_convention:
    format: "{PREFIX}-{CATEGORY}-{NUMBER}"
    example: "AB-TP-001"
  categories:
    - id: "{CAT}"
      name: "{Category Name}"
  patterns: []

# ─── MINDS ─── (optional, for squads with mind clones)

minds:
  "{agent-id}":
    dna_path: "squads/mind-cloning/minds/{slug}/outputs/"
    fidelity: "9.0/10"
    source: "{Source material description}"

# ─── TASK STANDARDS ─── (optional)

task_standards:
  enforce_anatomy: true
  required_fields:
    - purpose
    - execution_modes
    - pre_conditions

# ─── DEPENDENCIES ───

dependencies:
  node: []
  python: []
  squads: []                                 # Other squads this depends on

# ─── METADATA ───

tags:
  - "{domain}"
  - "{capability}"
```

## Agent Collaboration Patterns

### Pipeline (sequential)
```
Agent A → Agent B → Agent C → Agent D
```
Ex: `parser → analyzer → writer → presenter`

### Hub-and-Spoke (coordinator)
```
        ┌─ Agent B
Chief ──┼─ Agent C
        └─ Agent D
```
Ex: `board-chief → hormozi, taleb, duke`

### Review Loop
```
Agent A → Agent B → [PASS] → Done
              └─ [FAIL] → Agent A (fix) → Agent B (re-review)
```

### Document in each agent:
- **Receives From**: Which agent(s) provide input
- **Hands Off To**: Which agent(s) receive output
- **Shared Artifacts**: Common files between agents

## README.md Template

```markdown
# {Squad Name}

{Brief 1-sentence description.}

## Quick Start

@{squad-name}
*{main-command} {args}

## Agents

| Agent | Role | When to Use |
|-------|------|-------------|
| `{id}` | {role} | {trigger} |

## Commands

| Command | Description |
|---------|-------------|
| `*{cmd}` | {description} |

## How It Works

{Narrative or ASCII diagram of flow}

## Architecture

{Directory tree}
```

## Registration Steps

1. Create squad directory: `squads/{name}/`
2. Create `config.yaml` with manifest
3. Create agent files in `agents/`
4. Create task files in `tasks/`
5. Write `README.md`
6. Create slash commands in `.claude/commands/{squad-name}/`
7. Run `/catalog` to update command index

## Validation Checklist (15 Points)

| # | Check | Blocking |
|---|-------|----------|
| 1 | `config.yaml` exists and is valid YAML | YES |
| 2 | `pack.name` is kebab-case | YES |
| 3 | `pack.version` follows semver | YES |
| 4 | `pack.slashPrefix` is unique (not used by other squads) | YES |
| 5 | All files in `components.agents` exist | YES |
| 6 | All files in `components.tasks` exist | YES |
| 7 | All agent IDs start with `{prefix}-` | YES |
| 8 | All task IDs follow naming convention | Advisory |
| 9 | `tier_structure` defined with orchestrator | Advisory |
| 10 | Agent collaboration documented (receives/hands-off) | Advisory |
| 11 | README.md exists | Advisory |
| 12 | At least 1 workflow defined | Advisory |
| 13 | Slash commands created in `.claude/commands/` | YES |
| 14 | No naming conflicts with existing squads | YES |
| 15 | `/catalog` updated after creation | Advisory |
