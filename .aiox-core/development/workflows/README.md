# AIOX Workflows

This directory contains workflow definitions for the Synkra AIOX framework. Workflows define multi-step processes that can be executed by AIOX agents.

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

## Setup Environment Workflow

The `setup-environment` workflow helps developers configure their IDE for optimal AIOX development experience.

### Features
- Backs up existing IDE configurations
- Applies AIOX-specific development rules
- Verifies GitHub CLI installation and authentication
- Provides clear feedback throughout the process

### Usage

From the aiox-master agent:
```
@aiox-master
*setup-environment
```

Or directly via npm:
```bash
npm run setup:environment
```

### What It Does
2. **GitHub CLI Check** - Ensures GitHub CLI is installed and authenticated
3. **Backup Creation** - Saves existing rules before making changes
4. **Rule Application** - Copies AIOX-specific rules to appropriate locations
5. **Verification** - Confirms successful setup

### IDE Rule Locations
- **Cursor**: `.cursorules`
- **Claude Code**: `.claude/CLAUDE.md`

### Requirements
- Node.js 18+
- One or more supported IDEs installed
- GitHub CLI (recommended)

## Creating New Workflows

Workflows are defined in YAML format. See existing workflows for examples.

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
  sequence:
    - step: step_slug
      id: step-1
      agent: responsible-agent
      action: What this step does
      next: next-step-id

  # Optional compatibility metadata (non-executable)
  phases:
    - phase_1: Discovery
    - phase_2: Execution
```

## Best Practices
1. Keep workflows focused on a single objective
2. Include error handling for each step
3. Provide clear user feedback
4. Make workflows idempotent when possible
5. Document prerequisites and outcomes
