# Contributing Squads Guide

> **EN** | [PT](../pt/guides/contributing-squads.md) | [ES](../es/guides/contributing-squads.md)

---

How to contribute squads to the AIOX ecosystem.

## Overview

There are two ways to share your squad with the community:

1. **aiox-squads Repository** - Free, open-source squads on GitHub
2. **Synkra Marketplace** - Premium squads via Synkra API

## Quality Standards

All contributed squads must meet these standards:

### Required

| Requirement | Description |
|-------------|-------------|
| **Valid manifest** | `squad.yaml` passes JSON Schema validation |
| **Documentation** | README.md with usage instructions |
| **License** | Open source license (MIT, Apache 2.0, etc.) |
| **AIOX compatibility** | `aiox.minVersion: "2.1.0"` or higher |
| **Task-first architecture** | Tasks as primary entry points |

### Recommended

| Recommendation | Description |
|----------------|-------------|
| **Examples** | Usage examples in README |
| **Tests** | Unit tests for critical functionality |
| **Changelog** | Version history documentation |
| **Troubleshooting** | Common issues and solutions |

## Naming Conventions

### Squad Names

- Use `kebab-case`: `my-awesome-squad`
- Be descriptive: `etl-data-pipeline` not `data1`
- Avoid generic names: `helper-squad` is too vague
- No version numbers in name: `my-squad` not `my-squad-v2`

### Prefix (slashPrefix)

The `slashPrefix` in `squad.yaml` determines command prefixes:

```yaml
slashPrefix: etl  # Commands become *etl-extract, *etl-transform
```

Choose a unique, short prefix (2-5 characters).

## Manifest Requirements

### Required Fields

```yaml
# These fields are REQUIRED
name: my-squad
version: 1.0.0              # Semantic versioning
description: Clear description of what this squad does

aiox:
  minVersion: "2.1.0"
  type: squad

components:
  agents: []                # At least one agent OR task
  tasks: []
```

### Recommended Fields

```yaml
# These fields are RECOMMENDED
author: Your Name <email@example.com>
license: MIT
slashPrefix: my

tags:
  - relevant
  - keywords

dependencies:
  node: []
  python: []
  squads: []
```

## Documentation Requirements

### README.md Structure

```markdown
# Squad Name

Brief description (1-2 sentences).

## Installation

How to install/add this squad.

## Usage

Basic usage examples.

## Commands

| Command | Description |
|---------|-------------|
| *cmd1 | What it does |
| *cmd2 | What it does |

## Configuration

Any configuration options.

## Examples

Detailed usage examples.

## Troubleshooting

Common issues and solutions.

## License

License information.
```

## Publishing to aiox-squads

### Prerequisites

1. GitHub account
2. Squad validated: `*validate-squad --strict`
3. Unique squad name (check existing squads)

### Steps

```bash
# 1. Validate your squad
@squad-creator
*validate-squad my-squad --strict

# 2. Publish (creates PR)
*publish-squad ./squads/my-squad
```

This will:
1. Fork `SynkraAI/aiox-squads` (if needed)
2. Create branch with your squad
3. Open PR for review

### Review Process

1. **Automated checks** - Schema validation, structure check
2. **Maintainer review** - Code review, quality check
3. **Merge** - Squad added to registry

Timeline: Usually 2-5 business days.

## Publishing to Synkra Marketplace

### Prerequisites

1. Synkra account
2. API token configured
3. Squad validated

### Steps

```bash
# 1. Configure token
export SYNKRA_API_TOKEN="your-token"

# 2. Sync to marketplace
@squad-creator
*sync-squad-synkra ./squads/my-squad --public
```

### Visibility Options

| Flag | Effect |
|------|--------|
| `--private` | Only visible to your workspace |
| `--public` | Visible to everyone |

## Updating Published Squads

### Version Bumping

Follow semantic versioning:

- **MAJOR** (1.0.0 → 2.0.0): Breaking changes
- **MINOR** (1.0.0 → 1.1.0): New features, backward compatible
- **PATCH** (1.0.0 → 1.0.1): Bug fixes

### Update Process

```bash
# 1. Update version in squad.yaml
# 2. Update CHANGELOG.md
# 3. Validate
*validate-squad my-squad --strict

# 4. Re-publish
*publish-squad ./squads/my-squad
# or
*sync-squad-synkra ./squads/my-squad
```

## Code of Conduct

### Do

- Provide clear, accurate documentation
- Test your squad before publishing
- Respond to issues and feedback
- Keep dependencies minimal
- Follow AIOX conventions

### Don't

- Include malicious code
- Store credentials in code
- Copy others' work without attribution
- Use offensive names or content
- Spam the registry with test squads

## Getting Help

- **Questions**: [GitHub Discussions](https://github.com/SynkraAI/aiox-core/discussions)
- **Issues**: [Issue Tracker](https://github.com/SynkraAI/aiox-core/issues)
- **Guidelines**: This document

## Related Resources

- [Squad Development Guide](./squads-guide.md)
- [Squad Migration Guide](./squad-migration.md)
- [aiox-squads Repository](https://github.com/SynkraAI/aiox-squads)

---

**Version:** 1.0.0 | **Updated:** 2025-12-26 | **Story:** SQS-8
