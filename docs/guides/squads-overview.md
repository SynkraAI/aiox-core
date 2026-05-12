# Squads Overview

> **EN**

---

Introduction to AIOX Squads - modular teams of AI agents that extend framework functionality.

**Version:** 2.1.0
**Last Updated:** 2026-01-28

---

## What are Squads?

Squads are modular teams of AI agents that extend AIOX functionality for specific domains or use cases. Each squad is a self-contained package that can be installed, shared, and composed with other squads.

> **AIOX Squads:** AI agent teams working with you

### Key Characteristics

| Characteristic  | Description                                   |
| --------------- | --------------------------------------------- |
| **Modular**     | Self-contained packages with all dependencies |
| **Composable**  | Multiple squads can work together             |
| **Shareable**   | Publish to repository or marketplace          |
| **Extensible**  | Build on top of existing squads               |
| **Versionable** | Semantic versioning for compatibility         |

### Squad vs. Traditional Agents

| Traditional Agents   | AIOX Squads                |
| -------------------- | -------------------------- |
| Individual agents    | Coordinated team of agents |
| Single-purpose       | Domain-focused workflows   |
| Manual configuration | Packaged with config       |
| Copy-paste reuse     | Install and use            |
| No standardization   | TASK-FORMAT-SPEC-V1        |

---

## Squad Structure

A squad contains all the components needed for a specific domain:

```
./squads/my-squad/
├── squad.yaml              # Manifest (required)
├── README.md               # Documentation
├── LICENSE                 # License file
├── config/
│   ├── coding-standards.md # Code style rules
│   ├── tech-stack.md       # Technologies used
│   └── source-tree.md      # Directory structure
├── agents/
│   └── my-agent.md         # Agent definitions
├── tasks/
│   └── my-task.md          # Task definitions (task-first!)
├── workflows/
│   └── my-workflow.yaml    # Multi-step workflows
├── checklists/
│   └── review-checklist.md # Validation checklists
├── templates/
│   └── report-template.md  # Document templates
├── tools/
│   └── custom-tool.js      # Custom tool integrations
├── scripts/
│   └── setup.js            # Utility scripts
└── data/
    └── reference-data.json # Static data files
```

### Squad Manifest (squad.yaml)

Every squad requires a manifest file:

```yaml
# Required fields
name: my-squad # kebab-case, unique identifier
version: 1.0.0 # Semantic versioning
description: What this squad does

# Metadata
author: Your Name <email@example.com>
license: MIT
slashPrefix: my # Command prefix for IDE

# AIOX compatibility
aiox:
  minVersion: '2.1.0'
  type: squad

# Components declaration
components:
  agents:
    - my-agent.md
  tasks:
    - my-task.md
  workflows: []
  checklists: []
  templates: []
  tools: []
  scripts: []

# Configuration inheritance
config:
  extends: extend # extend | override | none
  coding-standards: config/coding-standards.md
  tech-stack: config/tech-stack.md
  source-tree: config/source-tree.md

# Dependencies
dependencies:
  node: [] # npm packages
  python: [] # pip packages
  squads: [] # Other squads

# Discovery tags
tags:
  - domain-specific
  - automation
```

---

## Creating a Squad

### Using @squad-creator Agent

```bash
# Activate the squad creator agent
@squad-creator

# Option 1: Guided design (recommended)
*design-squad --docs ./docs/prd/my-project.md

# Option 2: Direct creation
*create-squad my-squad

# Option 3: From template
*create-squad my-squad --template etl
```

### Available Templates

| Template     | Use Case                                 |
| ------------ | ---------------------------------------- |
| `basic`      | Simple squad with one agent and task     |
| `etl`        | Data extraction, transformation, loading |
| `agent-only` | Squad with agents, no tasks              |

### Squad Designer Workflow

1. **Collect Documentation** - Provide PRDs, specs, requirements
2. **Domain Analysis** - System extracts concepts, workflows, roles
3. **Agent Recommendations** - Review suggested agents
4. **Task Recommendations** - Review suggested tasks
5. **Generate Blueprint** - Save to `.squad-design.yaml`
6. **Create from Blueprint** - `*create-squad my-squad --from-design`

---

## Available Squads

### Official Squads

| Squad             | Version | Description                        | Repository                                                                       |
| ----------------- | ------- | ---------------------------------- | -------------------------------------------------------------------------------- |
| **etl-squad**     | 2.0.0   | Data collection and transformation | [aiox-squads/etl](https://github.com/SynkraAI/aiox-squads/tree/main/etl)         |
| **creator-squad** | 1.0.0   | Content generation utilities       | [aiox-squads/creator](https://github.com/SynkraAI/aiox-squads/tree/main/creator) |

### Distribution Levels

```
┌─────────────────────────────────────────────────────────────┐
│                    SQUAD DISTRIBUTION                        │
├─────────────────────────────────────────────────────────────┤
│  Level 1: LOCAL        --> ./squads/           (Private)    │
│  Level 2: AIOX-SQUADS  --> github.com/SynkraAI (Public)     │
│  Level 3: SYNKRA API   --> api.synkra.dev      (Marketplace)│
└─────────────────────────────────────────────────────────────┘
```

### Installing Squads

```bash
# List available squads
aiox squads list

# Download from official repository
*download-squad etl-squad

# Download specific version
*download-squad etl-squad@2.0.0

# List local squads
*list-squads
```

---

## Best Practices

### 1. Follow Task-First Architecture

Squads follow task-first architecture where tasks are the primary entry point:

```
User Request --> Task --> Agent Execution --> Output
                  │
             Workflow (if multi-step)
```

Tasks must follow [TASK-FORMAT-SPECIFICATION-V1](../../.aiox-core/docs/standards/TASK-FORMAT-SPECIFICATION-V1.md).

### 2. Use Config Inheritance Wisely

| Mode       | Behavior                            |
| ---------- | ----------------------------------- |
| `extend`   | Add squad rules to core AIOX rules  |
| `override` | Replace core rules with squad rules |
| `none`     | Standalone configuration            |

### 3. Validate Before Publishing

```bash
# Validate squad structure
*validate-squad my-squad

# Strict mode (for CI/CD)
*validate-squad my-squad --strict
```

### 4. Document Your Squad

Include comprehensive documentation:

- `README.md` with usage examples
- Clear agent descriptions
- Task input/output specifications
- Workflow diagrams

### 5. Version Appropriately

Use semantic versioning:

- **Major (X.0.0):** Breaking changes
- **Minor (0.X.0):** New features, backward compatible
- **Patch (0.0.X):** Bug fixes

---

## Squad Commands Reference

| Command                                  | Description                     |
| ---------------------------------------- | ------------------------------- |
| `*create-squad {name}`                   | Create new squad with prompts   |
| `*create-squad {name} --template {type}` | Create from template            |
| `*create-squad {name} --from-design`     | Create from design blueprint    |
| `*validate-squad {name}`                 | Validate squad structure        |
| `*list-squads`                           | List all local squads           |
| `*download-squad {name}`                 | Download from repository        |
| `*design-squad`                          | Design squad from documentation |
| `*analyze-squad {name}`                  | Analyze squad structure         |
| `*extend-squad {name}`                   | Add components to squad         |
| `*publish-squad {path}`                  | Publish to repository           |

---

## Next Steps

- **Create Your First Squad:** Follow the [Squads Guide](./squads-guide.md) for detailed instructions
- **Explore Official Squads:** Check [aiox-squads repository](https://github.com/SynkraAI/aiox-squads)
- **Contribute:** See [Contributing Squads Guide](./contributing-squads.md)
- **Learn Task Format:** Read [TASK-FORMAT-SPECIFICATION-V1](../../.aiox-core/docs/standards/TASK-FORMAT-SPECIFICATION-V1.md)

---

## Related Documentation

- [Squads Development Guide](./squads-guide.md) - Complete guide for creating and managing squads
- [Squad Migration Guide](./squad-migration.md) - Migrating from legacy format
- [Task Format Specification](../../.aiox-core/docs/standards/TASK-FORMAT-SPECIFICATION-V1.md)
- [@squad-creator Agent](../../.aiox-core/development/agents/squad-creator.md)

---

## FAQ

### What's the difference between a Squad and legacy AIOX squad formats?

**Squads** are the standard format in AIOX 2.1+ with:

- Task-first architecture
- JSON Schema validation
- Three-level distribution
- Better tooling (`@squad-creator`)

### Can I use Squads from different sources together?

Yes. The Squad Loader resolves from multiple sources. Local squads take precedence.

### Can Squads depend on other Squads?

Yes, declare in `dependencies.squads`:

```yaml
dependencies:
  squads:
    - etl-squad@^2.0.0
```

### What's the minimum AIOX version for Squads?

Squads require AIOX 2.1.0+. Set in manifest:

```yaml
aiox:
  minVersion: '2.1.0'
```

---

_AIOX Squads: AI agent teams working with you_

_Version: 2.1.0 | Updated: 2026-01-28_
