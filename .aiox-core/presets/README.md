# AIOX Presets

**Version:** 1.0.0
**Last Updated:** 2026-01-28
**Status:** Active

---

## Overview

AIOX Presets are pre-configured bundles that provide ready-to-use configurations for specific use cases, project types, or team structures. Presets simplify the initial setup process and ensure consistent configuration across projects.

### What is a Preset?

A preset is a collection of:

- Agent configurations
- Task selections
- Quality gate settings
- IDE configurations
- MCP server setups

Presets can be combined (layered) to create custom configurations that match your project needs.

---

## Available Presets

### Core Presets

| Preset       | Description             | Agents             | Use Case          |
| ------------ | ----------------------- | ------------------ | ----------------- |
| `minimal`    | Bare minimum AIOX setup | dev                | Quick prototyping |
| `standard`   | Balanced configuration  | dev, qa, architect | General projects  |
| `enterprise` | Full-featured setup     | All 11 agents      | Large teams       |

### Domain-Specific Presets

| Preset      | Description                | Focus Area            |
| ----------- | -------------------------- | --------------------- |
| `frontend`  | Frontend development focus | React, Vue, Angular   |
| `backend`   | Backend API development    | Node.js, Python, Go   |
| `fullstack` | Complete web development   | Frontend + Backend    |
| `data`      | Data engineering focus     | ETL, Analytics        |
| `mobile`    | Mobile app development     | React Native, Flutter |

### Team Structure Presets

| Preset       | Description          | Team Size   |
| ------------ | -------------------- | ----------- |
| `solo`       | Individual developer | 1 person    |
| `small-team` | Small agile team     | 2-5 people  |
| `squad`      | Product squad        | 5-10 people |
| `department` | Multi-team setup     | 10+ people  |

---

## Creating Custom Presets

### Preset Structure

```
presets/
├── minimal/
│   ├── preset.yaml       # Preset configuration
│   ├── agents/           # Agent overrides
│   └── README.md         # Preset documentation
│
├── standard/
│   ├── preset.yaml
│   ├── agents/
│   ├── tasks/
│   └── README.md
│
└── custom/               # Your custom presets
    └── my-preset/
        ├── preset.yaml
        └── README.md
```

### Preset Configuration (preset.yaml)

```yaml
# preset.yaml
name: my-custom-preset
version: 1.0.0
description: Custom preset for specific use case
extends: standard # Optional: inherit from another preset

# Agent Configuration
agents:
  enabled:
    - dev
    - qa
    - architect
  disabled:
    - data-engineer
  overrides:
    dev:
      persona: 'Senior developer specializing in TypeScript'

# Task Configuration
tasks:
  enabled:
    - create-story
    - implement-feature
    - run-tests
  disabled:
    - database-migration # Not needed for this project

# Quality Gates
quality_gates:
  layer1:
    enabled: true
    checks:
      - lint
      - typecheck
  layer2:
    enabled: true
    coderabbit: true
  layer3:
    enabled: true
    required_reviewers: 1

# IDE Configuration
ide:
  vscode: true
  cursor: true

# MCP Configuration
mcp:
  enabled:
    - exa
    - context7
  disabled:
    - apify
```

### Creating a New Preset

1. **Create directory structure:**

```bash
mkdir -p presets/my-preset
```

2. **Create preset.yaml:**

```yaml
name: my-preset
version: 1.0.0
description: My custom configuration
extends: standard

agents:
  enabled:
    - dev
    - qa

quality_gates:
  layer1:
    enabled: true
```

3. **Create README.md:**

```markdown
# My Preset

Description of when to use this preset.

## Included Features

- Feature 1
- Feature 2

## Usage

\`\`\`bash
aiox install --preset my-preset
\`\`\`
```

---

## Usage

### Installing with a Preset

```bash
# Install with specific preset
aiox install --preset standard

# Install with multiple presets (layered)
aiox install --preset standard --preset frontend

# Install custom preset from directory
aiox install --preset ./presets/my-preset
```

### Listing Available Presets

```bash
# List built-in presets
aiox presets list

# List with details
aiox presets list --verbose
```

### Viewing Preset Details

```bash
# View preset configuration
aiox presets show standard

# Compare two presets
aiox presets diff minimal standard
```

### Exporting Current Configuration as Preset

```bash
# Export current project config as preset
aiox presets export --name my-project-preset --output ./presets/

# Export with description
aiox presets export --name my-preset --description "Project template" --output ./presets/
```

---

## Preset Layering

Presets can be layered to combine configurations:

```bash
aiox install --preset standard --preset frontend --preset small-team
```

**Resolution Order:**

1. Base configuration
2. First preset (standard)
3. Second preset (frontend - overrides standard)
4. Third preset (small-team - overrides both)

### Layering Rules

| Setting Type        | Behavior        |
| ------------------- | --------------- |
| `enabled` arrays    | Merged (union)  |
| `disabled` arrays   | Merged (union)  |
| `overrides` objects | Deep merged     |
| Scalar values       | Last value wins |

### Example: Layered Configuration

```yaml
# standard preset
agents:
  enabled: [dev, qa, architect]

# frontend preset (extends standard)
agents:
  enabled: [ux-design-expert]  # Added to list
  overrides:
    dev:
      focus: "React development"

# Result
agents:
  enabled: [dev, qa, architect, ux-design-expert]
  overrides:
    dev:
      focus: "React development"
```

---

## Best Practices

### For Preset Creators

1. **Start from existing presets** - Use `extends` to build on proven configurations
2. **Document thoroughly** - Include README with use cases and examples
3. **Keep focused** - Each preset should serve a specific purpose
4. **Version appropriately** - Use semantic versioning for presets
5. **Test combinations** - Verify preset works when layered with others

### For Preset Users

1. **Start minimal** - Begin with `minimal` or `standard`, add as needed
2. **Review before install** - Use `aiox presets show` to understand what you're getting
3. **Export before modifying** - Save your config as a preset before major changes
4. **Keep presets updated** - Check for preset updates when upgrading AIOX

### Naming Conventions

| Type           | Convention       | Example             |
| -------------- | ---------------- | ------------------- |
| Core presets   | lowercase        | `standard`          |
| Domain presets | lowercase-domain | `frontend`          |
| Team presets   | lowercase-type   | `small-team`        |
| Custom presets | your-choice      | `my-company-preset` |

---

## Preset Directory Structure Reference

```
presets/
├── README.md                 # This file
│
├── minimal/                  # Minimal preset
│   ├── preset.yaml
│   └── README.md
│
├── standard/                 # Standard preset
│   ├── preset.yaml
│   ├── agents/
│   │   └── dev.yaml         # Agent overrides
│   ├── tasks/
│   │   └── enabled.yaml     # Task selection
│   └── README.md
│
├── enterprise/               # Enterprise preset
│   ├── preset.yaml
│   ├── agents/
│   ├── tasks/
│   ├── quality-gates/
│   │   └── config.yaml
│   └── README.md
│
├── frontend/                 # Frontend focus
│   ├── preset.yaml
│   └── README.md
│
├── backend/                  # Backend focus
│   ├── preset.yaml
│   └── README.md
│
└── custom/                   # Custom presets (gitignored)
    └── .gitkeep
```

---

## Related Documents

- [Installation Guide](/docs/installation/README.md)
- [Configuration Reference](/docs/guides/configuration-reference.md)
- [Agent Reference Guide](/docs/agent-reference-guide.md)
- [Multi-Repo Strategy](/docs/architecture/multi-repo-strategy.md)

---

_Last Updated: 2026-01-28 | AIOX Framework Team_
