# IDE Sync

**Story 6.19** - IDE Command Auto-Sync System
**Story TD-4** - Pre-commit Auto-Stage Integration

Automatically synchronizes AIOX agent definitions to IDE command files.

## Overview

IDE Sync keeps agent definitions in `.aiox-core/development/agents/` synchronized with IDE-specific command files in:

- `.claude/commands/AIOX/agents/` (Claude Code)
- `.codex/agents/` (Codex CLI support files)
- `.gemini/rules/AIOX/agents/` (Gemini CLI)
- `.gemini/commands/` (Gemini slash command launcher files)
- `.github/agents/` (GitHub Copilot support files)
- `.cursor/rules/agents/` (Cursor)
- `.antigravity/rules/agents/` (Antigravity)

For Codex `/skills` activators, use the dedicated skills sync:

```bash
npm run sync:skills:codex
npm run sync:skills:codex:global
```

## Pre-commit Integration (Story TD-4)

The pre-commit hook automatically:

1. Runs IDE sync before each commit
2. Auto-stages any changed IDE command files
3. Runs lint-staged for code quality

This ensures IDE command files are always in sync with agent definitions.

### Bypass

Skip the pre-commit hook if needed (NOT recommended):

```bash
git commit --no-verify
```

## Commands

### Sync

Sync agents to all enabled IDEs:

```bash
npm run sync:ide
# or
node .aiox-core/infrastructure/scripts/ide-sync/index.js sync
```

Sync specific IDE only:

```bash
npm run sync:ide:cursor
npm run sync:ide:codex
npm run sync:ide:gemini
npm run sync:ide:github-copilot
npm run sync:ide:antigravity
npm run sync:ide:claude
```

### Validate

Check if IDE files are in sync (report mode):

```bash
npm run sync:ide:validate
# or
node .aiox-core/infrastructure/scripts/ide-sync/index.js validate
```

Strict mode (CI - exits with code 1 if drift detected):

```bash
npm run sync:ide:check
# or
node .aiox-core/infrastructure/scripts/ide-sync/index.js validate --strict
```

## Options

| Option          | Description                                  |
| --------------- | -------------------------------------------- |
| `--ide <name>`  | Sync/validate specific IDE only              |
| `--strict`      | Exit with code 1 if drift detected (CI mode) |
| `--dry-run`     | Preview changes without writing files        |
| `--verbose, -v` | Show detailed output                         |
| `--quiet, -q`   | Minimal output (for pre-commit hooks)        |

## Configuration

Configure in `.aiox-core/core-config.yaml`:

```yaml
ideSync:
  enabled: true
  source: .aiox-core/development/agents
  targets:
    claude-code:
      enabled: true
      path: .claude/commands/AIOX/agents
      format: full-markdown-yaml
    codex:
      enabled: true
      path: .codex/agents
      format: full-markdown-yaml
    gemini:
      enabled: true
      path: .gemini/rules/AIOX/agents
      format: full-markdown-yaml
    github-copilot:
      enabled: true
      path: .github/agents
      format: full-markdown-yaml
    cursor:
      enabled: true
      path: .cursor/rules/agents
      format: condensed-rules
    # ... other IDEs
  redirects:
    aiox-developer: aiox-master
    db-sage: data-engineer
```

## IDE Formats

Each IDE has a specific format for agent files:

| IDE         | Format                  | Extension |
| ----------- | ----------------------- | --------- |
| Claude Code | Full markdown with YAML | `.md`     |
| Codex CLI   | Full markdown with YAML | `.md`     |
| Gemini CLI  | Full markdown with YAML | `.md`     |
| GitHub Copilot | Full markdown with YAML | `.md`   |
| Cursor      | Condensed rules         | `.md`     |
| Antigravity | Cursor-style            | `.md`     |

Platform-specific checks:

```bash
npm run validate:claude-sync
npm run validate:claude-integration
npm run validate:codex-sync
npm run validate:codex-integration
npm run validate:gemini-sync
npm run validate:gemini-integration
```

## Redirect Agents

Deprecated or renamed agents are handled via redirects. When an old agent name is requested, a redirect file is created pointing to the new agent.

Example redirect file:

```markdown
# Agent Redirect: aiox-developer -> aiox-master

This agent has been renamed. Use `aiox-master` instead.
```

## File Structure

```
.aiox-core/infrastructure/scripts/ide-sync/
├── index.js                 # Main orchestrator
├── agent-parser.js          # Parse agent YAML/MD files
├── redirect-generator.js    # Generate redirect files
├── validator.js             # Validate sync status
├── README.md                # This file
└── transformers/
    ├── claude-code.js       # Claude Code format
    ├── cursor.js            # Cursor format
    └── antigravity.js       # Antigravity format
```

## Performance

IDE sync is designed to be fast:

- Typical execution: <0.2 seconds
- Pre-commit hook total: <2 seconds

## Troubleshooting

### YAML Parse Errors

Some agent files may have YAML formatting issues. The sync will continue but skip problematic files. Check the output for warnings.

### IDE Files Out of Sync

Run manual sync:

```bash
npm run sync:ide
```

### Validation Fails in CI

Ensure you run sync before committing:

```bash
npm run sync:ide && git add .
```

Or rely on the pre-commit hook to auto-stage changes.

---

**Related Stories:**

- Story 6.19: IDE Command Auto-Sync System
- Story TD-4: IDE Sync Pre-commit Auto-Stage
