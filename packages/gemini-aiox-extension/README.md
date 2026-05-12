# AIOX Gemini CLI Extension

Brings Synkra AIOX multi-agent orchestration to Gemini CLI.

## Installation

```bash
gemini extensions install github.com/synkra/aiox-core/packages/gemini-aiox-extension
```

Or manually copy to `~/.gemini/extensions/aiox/`

## Features

### Quick Agent Launcher
Use slash commands for fast activation flow (Codex `$`-like UX):
- `/aiox-menu` - show all quick launch commands
- `/aiox-dev`
- `/aiox-architect`
- `/aiox-qa`
- `/aiox-devops`
- `/aiox-master`
- and other `/aiox-<agent-id>` commands

Each launcher returns a ready-to-send activation prompt plus greeting preview.

### Commands
- `/aiox-status` - Show system status
- `/aiox-agents` - List available agents
- `/aiox-validate` - Validate installation
- `/aiox-menu` - Show quick launch menu
- `/aiox-agent <id>` - Generic launcher by agent id

### Hooks
Automatic integration with AIOX memory and security:
- Session context loading
- Gotchas and patterns injection
- Security validation (blocks secrets)
- Audit logging

## Requirements

- Gemini CLI v0.26.0+
- AIOX Core installed (`npx aiox-core install`)
- Node.js 18+

## Cross-CLI Compatibility

AIOX skills work identically in both Claude Code and Gemini CLI. Same agents, same commands, same format.

## License

MIT
