# AIOS Workflows

This directory contains workflow definitions for the Synkra AIOS framework. Workflows define multi-step processes that can be executed by AIOS agents.

## Available Workflows

### Development Workflows
- **brownfield-discovery.yaml** - Comprehensive technical debt assessment for existing projects
- **brownfield-fullstack.yaml** - Workflow for existing full-stack projects
- **brownfield-service.yaml** - Workflow for existing service/backend projects
- **brownfield-ui.yaml** - Workflow for existing UI/frontend projects
- **greenfield-fullstack.yaml** - Workflow for new full-stack projects
- **greenfield-service.yaml** - Workflow for new service/backend projects
- **greenfield-ui.yaml** - Workflow for new UI/frontend projects

### Configuration Workflows
- **setup-environment.yaml** - Configure IDE (Windsurf/Cursor/Claude Code) with AIOS development rules

## Setup Environment Workflow

The `setup-environment` workflow helps developers configure their IDE for optimal AIOS development experience.

### Features
- Detects installed IDEs (Windsurf, Cursor, Claude Code)
- Backs up existing IDE configurations
- Applies AIOS-specific development rules
- Verifies GitHub CLI installation and authentication
- Provides clear feedback throughout the process

### Usage

From the aios-master agent:
```
@aios-master
*setup-environment
```

Or directly via npm:
```bash
npm run setup:environment
```

### What It Does
1. **IDE Detection** - Scans for `.windsurf/`, `.cursor/`, or `.claude/` directories
2. **GitHub CLI Check** - Ensures GitHub CLI is installed and authenticated
3. **Backup Creation** - Saves existing rules before making changes
4. **Rule Application** - Copies AIOS-specific rules to appropriate locations
5. **Verification** - Confirms successful setup

### IDE Rule Locations
- **Windsurf**: `.windsurf/rules`
- **Cursor**: `.cursorules`
- **Claude Code**: `.claude/CLAUDE.md`

### Requirements
- Node.js 18+
- One or more supported IDEs installed
- GitHub CLI (recommended)

## Creating New Workflows

Workflows can be defined in YAML or Markdown format with YAML frontmatter. See existing workflows for examples.

### Workflow Structure
```yaml
workflow:
  id: unique-workflow-id
  name: Human-readable name
  description: What this workflow does
  type: configuration|development|deployment
  metadata:
    elicit: true  # If user interaction required
    confirmation_required: true
  steps:
    - id: step-1
      name: Step name
      description: What this step does
```

## Best Practices
1. Keep workflows focused on a single objective
2. Include error handling for each step
3. Provide clear user feedback
4. Make workflows idempotent when possible
5. Document prerequisites and outcomes