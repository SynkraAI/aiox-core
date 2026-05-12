# Squad Development Guide

> **EN** | [PT](../pt/guides/squads-guide.md) | [ES](../es/guides/squads-guide.md)

---

Complete guide for creating, validating, publishing, and managing Squads in AIOX.

> **AIOX Squads:** Equipes de AI agents trabalhando com você

## Table of Contents

1. [What is a Squad?](#what-is-a-squad)
2. [Quick Start](#quick-start)
3. [Squad Architecture](#squad-architecture)
4. [Creating Squads](#creating-squads)
5. [Squad Designer](#squad-designer)
6. [Analyzing & Extending Squads](#analyzing--extending-squads) *(NEW)*
7. [Validating Squads](#validating-squads)
8. [Publishing & Distribution](#publishing--distribution)
9. [Migration from Legacy Format](#migration-from-legacy-format)
10. [Squad Loader & Resolution](#squad-loader--resolution)
11. [Troubleshooting](#troubleshooting)
12. [FAQ](#faq)

---

## What is a Squad?

Squads are modular teams of AI agents that extend AIOX functionality. Each squad is a self-contained package containing:

| Component | Purpose |
|-----------|---------|
| **Agents** | Domain-specific AI personas |
| **Tasks** | Executable workflows (TASK-FORMAT-SPEC-V1) |
| **Workflows** | Multi-step orchestrations |
| **Config** | Coding standards, tech stack, source tree |
| **Templates** | Document generation templates |
| **Tools** | Custom tool integrations |

### Distribution Levels

```
┌─────────────────────────────────────────────────────────────┐
│                    SQUAD DISTRIBUTION                        │
├─────────────────────────────────────────────────────────────┤
│  Level 1: LOCAL        → ./squads/           (Private)      │
│  Level 2: AIOX-SQUADS  → github.com/SynkraAI (Public/Free)  │
│  Level 3: SYNKRA API   → api.synkra.dev      (Marketplace)  │
└─────────────────────────────────────────────────────────────┘
```

### Official Squads

| Squad | Version | Description |
|-------|---------|-------------|
| [etl-squad](https://github.com/SynkraAI/aiox-squads/tree/main/etl) | 2.0.0 | Data collection and transformation |
| [creator-squad](https://github.com/SynkraAI/aiox-squads/tree/main/creator) | 1.0.0 | Content generation utilities |

---

## Quick Start

### Prerequisites

- Node.js 18+
- AIOX project initialized (`.aiox-core/` exists)
- Git for version control

### Option 1: Guided Design (Recommended)

```bash
# Activate squad-creator agent
@squad-creator

# Design squad from your documentation
*design-squad --docs ./docs/prd/my-project.md

# Review recommendations, then create
*create-squad my-squad --from-design

# Validate before use
*validate-squad my-squad
```

### Option 2: Direct Creation

```bash
@squad-creator

# Create with interactive prompts
*create-squad my-domain-squad

# Or specify template
*create-squad my-squad --template etl
```

---

## Squad Architecture

### Directory Structure

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

```yaml
# Required fields
name: my-squad                    # kebab-case, unique identifier
version: 1.0.0                    # Semantic versioning
description: What this squad does

# Metadata
author: Your Name <email@example.com>
license: MIT
slashPrefix: my                   # Command prefix for IDE

# AIOX compatibility
aiox:
  minVersion: "2.1.0"
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
  extends: extend                 # extend | override | none
  coding-standards: config/coding-standards.md
  tech-stack: config/tech-stack.md
  source-tree: config/source-tree.md

# Dependencies
dependencies:
  node: []                        # npm packages
  python: []                      # pip packages
  squads: []                      # Other squads

# Discovery tags
tags:
  - domain-specific
  - automation
```

### Task-First Architecture

Squads follow **task-first architecture** where tasks are the primary entry point:

```
User Request → Task → Agent Execution → Output
                ↓
           Workflow (if multi-step)
```

Tasks must follow [TASK-FORMAT-SPECIFICATION-V1](../../.aiox-core/docs/standards/TASK-FORMAT-SPECIFICATION-V1.md).

---

## Creating Squads

### Using @squad-creator Agent

```bash
# Activate the agent
@squad-creator

# View all commands
*help
```

### Available Commands

| Command | Description |
|---------|-------------|
| `*create-squad {name}` | Create new squad with prompts |
| `*create-squad {name} --template {type}` | Create from template (basic, etl, agent-only) |
| `*create-squad {name} --from-design` | Create from design blueprint |
| `*validate-squad {name}` | Validate squad structure |
| `*list-squads` | List all local squads |
| `*design-squad` | Design squad from documentation |

### Templates

| Template | Use Case |
|----------|----------|
| `basic` | Simple squad with one agent and task |
| `etl` | Data extraction, transformation, loading |
| `agent-only` | Squad with agents, no tasks |

### Config Inheritance Modes

| Mode | Behavior |
|------|----------|
| `extend` | Add squad rules to core AIOX rules |
| `override` | Replace core rules with squad rules |
| `none` | Standalone configuration |

---

## Squad Designer

The Squad Designer analyzes your documentation and recommends agents and tasks.

### Usage

```bash
@squad-creator

# Interactive design
*design-squad

# Design from specific files
*design-squad --docs ./docs/prd/requirements.md ./docs/specs/api.md

# Specify domain context
*design-squad --domain casting --docs ./docs/
```

### Workflow

1. **Collect Documentation** - Provide PRDs, specs, requirements
2. **Domain Analysis** - System extracts concepts, workflows, roles
3. **Agent Recommendations** - Review suggested agents
4. **Task Recommendations** - Review suggested tasks
5. **Generate Blueprint** - Save to `.squad-design.yaml`
6. **Create from Blueprint** - `*create-squad my-squad --from-design`

### Blueprint Format

```yaml
# .squad-design.yaml
metadata:
  domain: casting
  created: 2025-12-26T10:00:00Z
  source_docs:
    - ./docs/prd/casting-system.md

recommended_agents:
  - name: casting-coordinator
    role: Coordinates casting workflows
    confidence: 0.92

recommended_tasks:
  - name: process-submission
    description: Process actor submission
    agent: casting-coordinator
    confidence: 0.88
```

---

## Analyzing & Extending Squads

After creating a squad, you can analyze its structure and extend it with new components using the `*analyze-squad` and `*extend-squad` commands.

### Analyzing Squads

```bash
@squad-creator

# Basic analysis
*analyze-squad my-squad

# Include file details
*analyze-squad my-squad --verbose

# Save to markdown file
*analyze-squad my-squad --format markdown

# Output as JSON
*analyze-squad my-squad --format json
```

### Analysis Output

```
=== Squad Analysis: my-squad ===

Overview
  Name: my-squad
  Version: 1.0.0
  Author: Your Name

Components
  agents/ (2)
    - lead-agent.md
    - helper-agent.md
  tasks/ (3)
    - lead-agent-task1.md
    - lead-agent-task2.md
    - helper-agent-task1.md
  workflows/ (0) <- Empty
  checklists/ (0) <- Empty

Coverage
  Agents: [#####-----] 50% (1/2 with tasks)
  Tasks: [########--] 80% (3 tasks)
  Directories: [##--------] 25% (2/8 populated)

Suggestions
  1. [!] Add tasks for helper-agent (currently has only 1)
  2. [*] Create workflows for common sequences
  3. [-] Add checklists for validation

Next: *extend-squad my-squad
```

### Extending Squads

Add new components to existing squads with automatic manifest updates:

```bash
@squad-creator

# Interactive mode (guided)
*extend-squad my-squad

# Direct mode - Add agent
*extend-squad my-squad --add agent --name analytics-agent

# Add task with agent linkage
*extend-squad my-squad --add task --name process-data --agent lead-agent

# Add workflow with story reference
*extend-squad my-squad --add workflow --name daily-processing --story SQS-11

# Add all component types
*extend-squad my-squad --add template --name report-template
*extend-squad my-squad --add tool --name data-validator
*extend-squad my-squad --add checklist --name quality-checklist
*extend-squad my-squad --add script --name migration-helper
*extend-squad my-squad --add data --name config-data
```

### Interactive Extend Flow

```
@squad-creator
*extend-squad my-squad

? What would you like to add?
  1. Agent - New agent persona
  2. Task - New task for an agent
  3. Workflow - Multi-step workflow
  4. Checklist - Validation checklist
  5. Template - Document template
  6. Tool - Custom tool (JavaScript)
  7. Script - Automation script
  8. Data - Static data file (YAML)

> 2

? Task name: process-data
? Which agent owns this task?
  1. lead-agent
  2. helper-agent
> 1
? Task description (optional): Process incoming data and generate output
? Link to story? (leave blank to skip): SQS-11

Creating task...
  Created: tasks/lead-agent-process-data.md
  Updated: squad.yaml (added to components.tasks)
  Validation: PASS

Next steps:
  1. Edit tasks/lead-agent-process-data.md
  2. Add entrada/saida/checklist
  3. Run: *validate-squad my-squad
```

### Component Types

| Type | Directory | Extension | Description |
|------|-----------|-----------|-------------|
| agent | agents/ | .md | Agent persona definition |
| task | tasks/ | .md | Executable task workflow |
| workflow | workflows/ | .yaml | Multi-step orchestration |
| checklist | checklists/ | .md | Validation checklist |
| template | templates/ | .md | Document generation template |
| tool | tools/ | .js | Custom tool integration |
| script | scripts/ | .js | Utility automation script |
| data | data/ | .yaml | Static data configuration |

### Continuous Improvement Workflow

```bash
# 1. Analyze current state
*analyze-squad my-squad

# 2. Review suggestions and coverage metrics

# 3. Add missing components
*extend-squad my-squad --add task --name new-task --agent lead-agent
*extend-squad my-squad --add checklist --name quality-checklist

# 4. Re-analyze to verify improvement
*analyze-squad my-squad

# 5. Validate before use
*validate-squad my-squad
```

### Programmatic Usage

```javascript
const { SquadAnalyzer } = require('./.aiox-core/development/scripts/squad/squad-analyzer');
const { SquadExtender } = require('./.aiox-core/development/scripts/squad/squad-extender');

// Analyze squad
const analyzer = new SquadAnalyzer({ squadsPath: './squads' });
const analysis = await analyzer.analyze('my-squad');

console.log('Coverage:', analysis.coverage);
console.log('Suggestions:', analysis.suggestions);

// Extend squad
const extender = new SquadExtender({ squadsPath: './squads' });
const result = await extender.addComponent('my-squad', {
  type: 'task',
  name: 'new-task',
  agentId: 'lead-agent',
  description: 'A new task',
  storyId: 'SQS-11',
});

console.log('Created:', result.filePath);
console.log('Manifest updated:', result.manifestUpdated);
```

---

## Validating Squads

### Basic Validation

```bash
@squad-creator
*validate-squad my-squad
```

### Strict Mode (for CI/CD)

```bash
*validate-squad my-squad --strict
```

Treats warnings as errors.

### Validation Checks

| Check | Description |
|-------|-------------|
| **Manifest Schema** | squad.yaml against JSON Schema |
| **Directory Structure** | Required folders exist |
| **Task Format** | Tasks follow TASK-FORMAT-SPEC-V1 |
| **Agent Definitions** | Agents have required fields |
| **Dependencies** | Referenced files exist |

### Validation Output

```
Validating squad: my-squad
═══════════════════════════

✅ Manifest: Valid
✅ Structure: Complete
✅ Tasks: 3/3 valid
✅ Agents: 2/2 valid
⚠️ Warnings:
   - README.md is minimal (consider expanding)

Summary: VALID (3 warnings)
```

### Programmatic Validation

```javascript
const { SquadValidator } = require('./.aiox-core/development/scripts/squad');

const validator = new SquadValidator({ strict: false });
const result = await validator.validate('./squads/my-squad');

console.log(result);
// { valid: true, errors: [], warnings: [...], suggestions: [...] }
```

---

## Publishing & Distribution

### Level 1: Local (Private)

Squads in `./squads/` are automatically available to your project.

```bash
# List local squads
*list-squads
```

### Level 2: aiox-squads Repository (Public)

```bash
@squad-creator

# Validate first
*validate-squad my-squad --strict

# Publish to GitHub
*publish-squad ./squads/my-squad
```

This creates a PR to [SynkraAI/aiox-squads](https://github.com/SynkraAI/aiox-squads).

### Level 3: Synkra Marketplace

```bash
# Set up authentication
export SYNKRA_API_TOKEN="your-token"

# Sync to marketplace
*sync-squad-synkra ./squads/my-squad --public
```

### Downloading Squads

```bash
@squad-creator

# List available squads
*download-squad --list

# Download specific squad
*download-squad etl-squad

# Download specific version
*download-squad etl-squad@2.0.0
```

---

## Migration from Legacy Format

### Detecting Legacy Squads

Legacy squads use `config.yaml` instead of `squad.yaml` and may be missing:
- `aiox.type` field
- `aiox.minVersion` field
- Task-first structure

### Migration Command

```bash
@squad-creator

# Preview changes
*migrate-squad ./squads/legacy-squad --dry-run

# Execute migration
*migrate-squad ./squads/legacy-squad

# Verbose output
*migrate-squad ./squads/legacy-squad --verbose
```

### Migration Steps

1. **Backup** - Creates `.backup/pre-migration-{timestamp}/`
2. **Rename** - `config.yaml` → `squad.yaml`
3. **Add Fields** - `aiox.type`, `aiox.minVersion`
4. **Restructure** - Organize into task-first layout
5. **Validate** - Run validation on migrated squad

### Rollback

```bash
# Restore from backup
cp -r ./squads/my-squad/.backup/pre-migration-*/. ./squads/my-squad/
```

See [Squad Migration Guide](./squad-migration.md) for detailed scenarios.

---

## Squad Loader & Resolution

### Resolution Chain

The Squad Loader resolves squads in this order:

```
1. Local     → ./squads/{name}/
2. npm       → node_modules/@aiox-squads/{name}/
3. Workspace → ../{name}/ (monorepo)
4. Registry  → api.synkra.dev/squads/{name}
```

### Programmatic Usage

```javascript
const { SquadLoader } = require('./.aiox-core/development/scripts/squad');

const loader = new SquadLoader({
  squadsPath: './squads',
  verbose: false
});

// Resolve squad path
const { path, manifestPath } = await loader.resolve('my-squad');

// Load manifest
const manifest = await loader.loadManifest('./squads/my-squad');

// List all local squads
const squads = await loader.listLocal();
// [{ name: 'my-squad', path: './squads/my-squad', manifestPath: '...' }]
```

### Error Handling

```javascript
const { SquadLoader, SquadLoaderError } = require('./.aiox-core/development/scripts/squad');

try {
  await loader.resolve('non-existent');
} catch (error) {
  if (error instanceof SquadLoaderError) {
    console.error(`[${error.code}] ${error.message}`);
    console.log(`Suggestion: ${error.suggestion}`);
  }
}
```

### Error Codes

| Code | Description | Solution |
|------|-------------|----------|
| `SQUAD_NOT_FOUND` | Squad directory not found | Create with `*create-squad` |
| `MANIFEST_NOT_FOUND` | No manifest file | Create `squad.yaml` |
| `YAML_PARSE_ERROR` | Invalid YAML syntax | Use YAML linter |
| `PERMISSION_DENIED` | File permission error | Check `chmod 644` |

---

## Troubleshooting

### "Squad not found"

```bash
# Check squads directory exists
ls ./squads/

# Verify manifest
cat ./squads/my-squad/squad.yaml

# Check resolution
@squad-creator
*list-squads
```

### Validation Errors

```bash
# Get detailed errors
*validate-squad my-squad --verbose

# Common fixes:
# - name: must be kebab-case
# - version: must be semver (x.y.z)
# - aiox.type: must be "squad"
# - aiox.minVersion: must be valid semver
```

### YAML Parse Errors

```bash
# Validate YAML syntax online or with:
npx js-yaml ./squads/my-squad/squad.yaml
```

Common issues:
- Incorrect indentation (use 2 spaces)
- Missing quotes around special characters
- Tabs instead of spaces

### Migration Failures

```bash
# Check backup exists
ls ./squads/my-squad/.backup/

# Restore and retry
cp -r ./squads/my-squad/.backup/pre-migration-*/. ./squads/my-squad/
*migrate-squad ./squads/my-squad --verbose
```

### Publishing Errors

```bash
# Check GitHub authentication
gh auth status

# Check squad validation
*validate-squad my-squad --strict

# Check for naming conflicts
*download-squad --list | grep my-squad
```

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

### How do I update a published Squad?

1. Update version in `squad.yaml` (semver)
2. Run `*validate-squad --strict`
3. Re-publish: `*publish-squad` or `*sync-squad-synkra`

### Can Squads depend on other Squads?

Yes, declare in `dependencies.squads`:

```yaml
dependencies:
  squads:
    - etl-squad@^2.0.0
```

### How do I make a Squad private?

- **Level 1**: Keep in `./squads/` (not committed) - add to `.gitignore`
- **Level 3**: Sync with `--private` flag: `*sync-squad-synkra my-squad --private`

### What's the minimum AIOX version for Squads?

Squads require AIOX 2.1.0+. Set in manifest:

```yaml
aiox:
  minVersion: "2.1.0"
```

### How do I test my Squad before publishing?

```bash
# 1. Validate structure
*validate-squad my-squad --strict

# 2. Test locally
@my-agent  # Activate squad agent
*my-task   # Run squad task

# 3. Run squad tests (if defined)
npm test -- tests/squads/my-squad/
```

---

## Related Resources

- [TASK-FORMAT-SPECIFICATION-V1](../../.aiox-core/docs/standards/TASK-FORMAT-SPECIFICATION-V1.md)
- [Contributing Squads Guide](./contributing-squads.md)
- [Squad Migration Guide](./squad-migration.md)
- [Squads API Reference](../api/squads-api.md)
- [@squad-creator Agent](../../.aiox-core/development/agents/squad-creator.md)
- [aiox-squads Repository](https://github.com/SynkraAI/aiox-squads)

---

## Getting Help

- [GitHub Discussions](https://github.com/SynkraAI/aiox-core/discussions)
- [Issue Tracker](https://github.com/SynkraAI/aiox-core/issues)

---

*AIOX Squads: Equipes de AI agents trabalhando com você*

**Version:** 2.1.0 | **Updated:** 2025-12-26 | **Stories:** SQS-8, SQS-11
