# /squad-creator - Squad Architect v2.0

Activate the Squad Architect to create custom AIOS squads for any domain through research-first methodology.

## Instructions

**Load the orchestrator agent from `squads/squad-creator/agents/squad-architect.md` and follow its activation instructions.**

## Architecture

```
TIER 0: ORCHESTRATOR
  @squad-architect → Research, creation, validation coordination

TIER 1: SPECIALISTS
  @sop-extractor   → Extract SOPs from transcripts/meetings

TIER 2: WORKFLOWS
  mind-research-loop.md       → Iterative research for elite minds
  research-then-create-agent.md → Full agent creation pipeline
```

## Quick Reference

### Activate Squad
```bash
/squad-creator
```

### Direct Agent Access
```
@squad-architect  # Main orchestrator - squad creation
@sop-extractor    # Extract SOPs from transcripts
```

## Use Case Routing

| Situação | Agent | Workflow |
|----------|-------|----------|
| Criar squad novo | @squad-architect | mind-research-loop → create-squad |
| Criar agente individual | @squad-architect | research-then-create-agent |
| Extrair SOP de reunião | @sop-extractor | extract-sop |
| Validar squad existente | @squad-architect | validate-squad |
| Atualizar registry | @squad-architect | refresh-registry |

## Core Principle

```
"Clone minds > create generic bots"

People with skin in the game = Battle-tested frameworks
Real consequences = Reliable methodologies
Research FIRST = Quality guaranteed
```

## Tasks (via Skill tool)

### Creation
```
squad-creator:tasks:create-squad
squad-creator:tasks:create-agent
squad-creator:tasks:create-task
squad-creator:tasks:create-workflow
squad-creator:tasks:create-template
squad-creator:tasks:extract-sop
squad-creator:tasks:deep-research-pre-agent
```

### Validation
```
squad-creator:tasks:validate-squad
```

### Utility
```
squad-creator:tasks:refresh-registry
squad-creator:tasks:install-commands
squad-creator:tasks:sync-ide-command
```

## Workflows
```
squad-creator:workflows:mind-research-loop
squad-creator:workflows:research-then-create-agent
```

## Checklists
```
squad-creator:checklists:squad-checklist
squad-creator:checklists:mind-validation
squad-creator:checklists:agent-quality-gate
squad-creator:checklists:task-anatomy-checklist
squad-creator:checklists:deep-research-quality
squad-creator:checklists:quality-gate-checklist
squad-creator:checklists:executor-matrix-checklist
squad-creator:checklists:sop-validation
```

## Templates
```
squad-creator:templates:agent-tmpl
squad-creator:templates:task-tmpl
squad-creator:templates:readme-tmpl
squad-creator:templates:research-prompt-tmpl
squad-creator:templates:research-output-tmpl
squad-creator:templates:pop-extractor-prompt
```

## Data/Frameworks
```
squad-creator:data:squad-kb
squad-creator:data:best-practices
squad-creator:data:core-heuristics
squad-creator:data:tier-system-framework
squad-creator:data:quality-dimensions-framework
squad-creator:data:decision-heuristics-framework
squad-creator:data:executor-matrix-framework
```

## Commands (after activation)

### Creation
| Command | Description |
|---------|-------------|
| `*create-squad` | Create complete squad (guided) |
| `*create-agent` | Create individual agent |
| `*create-workflow` | Create multi-phase workflow |
| `*create-task` | Create atomic task |
| `*create-template` | Create output template |
| `*extract-sop` | Extract SOP from transcript |

### Validation (Granular)
| Command | Description |
|---------|-------------|
| `*validate-squad {name}` | Validate entire squad |
| `*validate-agent {file}` | Validate single agent |
| `*validate-task {file}` | Validate single task |
| `*validate-workflow {file}` | Validate single workflow |
| `*validate-template {file}` | Validate single template |
| `*validate-checklist {file}` | Validate single checklist |

### Utility
| Command | Description |
|---------|-------------|
| `*help` | Show all commands |
| `*show-registry` | Display squad registry |
| `*refresh-registry` | Update registry from squads/ |
| `*list-squads` | List all squads |
| `*exit` | Deactivate persona |

## Quality Standards

| Component | Minimum | Required Sections |
|-----------|---------|-------------------|
| Agent | 300 lines | voice_dna, output_examples, objection_algorithms |
| Workflow | 500 lines | phases, checkpoints, frameworks |
| Task (complex) | 500 lines | PHASES, YAML inline |
| Squad | All pass | orchestrator, tier structure, README |

## Activation Flow

1. Read `squads/squad-creator/agents/squad-architect.md` completely
2. Adopt the Squad Architect persona
3. Load `config.yaml` settings
4. If enabled, show ecosystem report
5. Greet user
6. Await commands or domain requests

---

*Squad Creator v2.0.0 - Research-First Squad Factory*
*2 agents | 11 tasks | 2 workflows | 8 checklists | 6 templates | 7 data files*
