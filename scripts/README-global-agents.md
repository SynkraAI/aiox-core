# Global AIOS Agents Installation

This script installs AIOS agents globally in Kiro CLI, making them available in any project.

## Installation

From the aios-core project root:

```bash
node scripts/install-agents-globally.js
```

## What Gets Installed

**12 AIOS Agents:**
- `@aios-master` - Master orchestration agent
- `@analyst` - PRD creation and analysis
- `@architect` - Architecture and technical design
- `@data-engineer` - Data pipelines and engineering
- `@dev` - Feature implementation
- `@devops` - Infrastructure and deployment
- `@pm` - Product strategy and prioritization
- `@po` - Backlog management
- `@qa` - Testing and quality assurance
- `@sm` - Sprint management and story creation
- `@squad-creator` - Create custom agent squads
- `@ux-design-expert` - User experience design

**Installation Locations:**
- Agent files: `~/.kiro/agents/aios/`
- Configuration: `~/.kiro/settings/agents.json`

## Usage

Once installed, you can use AIOS agents in **any Kiro CLI session**:

```bash
# Start Kiro in any project
kiro-cli chat

# Activate an agent using shortcuts
@architect
@dev
@qa

# Or use slash commands
/architect
/dev
/qa
```

## Agent Workflow

```bash
# 1. Activate agent
@architect

# 2. Use agent commands
*help              # Show available commands
*create-plan       # Agent-specific command

# 3. Exit agent
*exit
```

## How It Works

The installation script:
1. Copies agent markdown files from `.aios-core/development/agents/` to `~/.kiro/agents/aios/`
2. Creates a configuration file at `~/.kiro/settings/agents.json` with agent metadata
3. Sets up shortcuts (`@agent`, `/agent`) for easy activation

When you type `@architect` in Kiro:
1. Kiro reads the agent file from `~/.kiro/agents/aios/architect.md`
2. Loads the agent's instructions, commands, and workflows
3. Assumes that agent's persona until you type `*exit`

## Updating Agents

To update to the latest agent versions:

```bash
# Pull latest aios-core changes
cd /path/to/aios-core
git pull

# Reinstall agents globally
node scripts/install-agents-globally.js
```

The script will overwrite existing agent files with the latest versions.

## Uninstalling

To remove global AIOS agents:

```bash
rm -rf ~/.kiro/agents/aios
rm ~/.kiro/settings/agents.json
```

## Troubleshooting

**Agents not activating:**
- Verify files exist: `ls ~/.kiro/agents/aios/`
- Check configuration: `cat ~/.kiro/settings/agents.json`
- Ensure you're using the correct shortcuts: `@architect`, not `@architect.md`

**Permission errors:**
- Ensure `~/.kiro/` directory is writable
- Run script without sudo (it installs to your home directory)

**Agent file not found:**
- Reinstall: `node scripts/install-agents-globally.js`
- Verify source files exist in `.aios-core/development/agents/`

## Global vs Local Installation

**Key Differences:**

| Aspect | Global | Local (Project) |
|--------|--------|-----------------|
| **Location** | `~/.kiro/agents/aios/` | `.aios-core/development/agents/` |
| **Configuration** | `~/.kiro/settings/agents.json` | `.aios-core/core-config.yaml` + `AGENTS.md` |
| **Scope** | All projects | Current project only |
| **Context** | Generic | Project-specific (PRD, Architecture, Stories) |
| **Precedence** | Low | High (local overrides global) |

**When to Use:**

- **Global:** Quick access to agents in any project without AIOS setup
- **Local:** Full AIOS development with project context and workflows

**Coexistence:**

When both exist, Kiro CLI uses this precedence:
1. Local agents (`.aios-core/development/agents/`) - if in AIOS project
2. Global agents (`~/.kiro/agents/aios/`) - fallback
3. Error if neither found

📖 **[Complete documentation: Global vs Local Installation](../docs/guides/global-vs-local-installation.md)**

## Notes

- This is separate from project-local agent configuration (`AGENTS.md`)
- Global agents work in any project, local agents only in specific projects
- You can have both global and local agents - local takes precedence
- Agent files are static markdown - they don't auto-update
