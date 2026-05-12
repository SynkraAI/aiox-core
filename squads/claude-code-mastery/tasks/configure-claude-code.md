# Task: Configure Claude Code Settings

**Task ID:** CCM-CONFIG-001
**Version:** 1.0.0
**Command:** `*configure`
**Orchestrator:** Sigil (config-engineer)
**Purpose:** Configure Claude Code settings for a project by analyzing project needs and generating a tailored `.claude/settings.json` with appropriate permissions, deny rules, and MCP server configuration.

---

## Overview

```
  +------------------+     +------------------+     +------------------+
  | 1. Analyze       | --> | 2. Generate      | --> | 3. Set Permission|
  |    Project Needs |     |    settings.json |     |    Mode          |
  +------------------+     +------------------+     +------------------+
       |                                                    |
       v                                                    v
  +------------------+     +------------------+     +------------------+
  | 4. Configure     | --> | 5. Set Up        | --> |    VALIDATE      |
  |    MCP Servers   |     |    Env Variables |     |    & OUTPUT      |
  +------------------+     +------------------+     +------------------+
```

---

## Inputs

| Field | Type | Source | Required | Validation |
|-------|------|--------|----------|------------|
| project_root | string | Working directory | Yes | Valid directory with project files |
| security_level | string | User parameter | No | `standard` (default), `strict`, `enterprise` |
| existing_settings | object | .claude/settings.json | No | Existing config to merge with |

---

## Preconditions

- Write access to the .claude/ directory
- Understanding of the project's technology stack (detected or user-provided)
- If existing settings.json: user confirms merge or overwrite strategy

---

## Execution Phases

### Phase 1: Analyze Project Needs

1. Scan the project for technology markers:
   - Package manager: npm, yarn, pnpm, bun (check lock files)
   - Framework: Next.js, Vite, Express, Fastify, Django, etc.
   - Testing: Jest, Vitest, Playwright, Cypress
   - Database: Supabase, Prisma, Drizzle migrations
   - AIOX: Check for .aiox-core/ directory
2. Identify sensitive file patterns:
   - `.env`, `.env.*`, `.env.local`
   - `secrets/`, `credentials/`, `private/`
   - `*.pem`, `*.key`, `*.p12`
3. Identify safe development operations:
   - Package scripts from package.json
   - Git read-only operations
   - Test runners, linters, formatters
4. Document findings for the user

### Phase 2: Generate settings.json

Build the settings file following deny-first methodology:

```json
{
  "permissions": {
    "deny": [
      "Read(./.env)",
      "Read(./.env.*)",
      "Read(./secrets/**)",
      "Read(./**/*.pem)",
      "Read(./**/*.key)",
      "Bash(rm -rf *)",
      "Bash(curl * | bash)",
      "Bash(wget * | bash)"
    ],
    "allow": [],
    "defaultMode": "acceptEdits"
  }
}
```

Populate `allow` based on detected project needs:
- **Always:** `Bash(git status)`, `Bash(git diff *)`, `Bash(git log *)`
- **Node.js:** `Bash(npm run *)`, `Bash(npx *)`, `Bash(node *)`
- **Python:** `Bash(python *)`, `Bash(pip *)`, `Bash(pytest *)`
- **Testing:** `Bash({test-runner} *)` based on detected framework
- **Build:** Allow detected build commands
- **Lint:** Allow detected lint/format commands

### Phase 3: Set Permission Mode

Select the appropriate permission mode:

| Security Level | Default Mode | Rationale |
|---------------|--------------|-----------|
| standard | acceptEdits | Auto-approves file edits, prompts for bash/network |
| strict | askAlways | Prompts for every operation including edits |
| enterprise | askAlways | Plus managed-settings.json restrictions |

Present the selected mode with explanation. Allow user override.

**Settings Hierarchy Reference (for user awareness):**

```
managed-settings.json  (highest -- cannot be overridden)
  > CLI arguments       (session-only)
  > settings.local.json (personal, gitignored)
  > settings.json       (shared, committed)
  > ~/.claude/settings.json (user-level, lowest)
```

### Phase 4: Configure MCP Servers

1. Ask which MCP servers the project needs
2. For each selected server, add to settings.json or .claude/mcp.json:
   ```json
   {
     "mcpServers": {
       "context7": {
         "command": "npx",
         "args": ["-y", "@context7/mcp-server"]
       }
     }
   }
   ```
3. Common server configurations:
   - **context7**: Library documentation lookup (no API key needed)
   - **playwright**: Browser automation (no API key needed)
   - **exa**: Web search (requires EXA_API_KEY)
   - **supabase**: Database (requires SUPABASE_ACCESS_TOKEN)
4. For servers requiring API keys: add placeholder with comment, never hardcode real keys
5. Add MCP-specific permission rules:
   - `MCP({server-name})` to allow list for approved servers
   - `MCP(filesystem)` to deny list if not needed

### Phase 5: Set Up Environment Variables

1. Document recommended environment variables for the settings:
   - `ANTHROPIC_MODEL`: Model override if needed
   - `CLAUDE_CODE_EFFORT_LEVEL`: high/medium/low
   - `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE`: Context management
   - `BASH_DEFAULT_TIMEOUT_MS`: Command timeout
2. If enterprise: add organizational env vars to managed config
3. Create a reference comment block at the top of settings.json:
   ```json
   // Environment variables can be set in .env or shell profile:
   // CLAUDE_CODE_EFFORT_LEVEL=high
   // CLAUDE_AUTOCOMPACT_PCT_OVERRIDE=50
   ```
   (Note: JSON does not support comments -- provide as separate documentation)

---

## Output Format

```markdown
## Configuration Complete

**Security Level:** {standard | strict | enterprise}
**Permission Mode:** {defaultMode}

### Generated: .claude/settings.json

| Section | Count | Details |
|---------|-------|---------|
| deny rules | {N} | Blocks: {summary} |
| allow rules | {N} | Permits: {summary} |
| MCP servers | {N} | {server names} |

### Permission Rules

**Deny (evaluated first):**
{numbered list of deny rules with explanations}

**Allow:**
{numbered list of allow rules with explanations}

### Environment Variables

| Variable | Recommended Value | Purpose |
|----------|-------------------|---------|
| {name} | {value} | {purpose} |

### Verification

Run `*audit-settings` to validate the configuration.
```

---

## Veto Conditions

- **NEVER** generate a settings.json without deny rules. Every configuration must block sensitive files at minimum.
- **NEVER** hardcode API keys, tokens, or credentials in settings files. Use environment variables or placeholders.
- **NEVER** set `bypassPermissions` as the default mode unless the user explicitly requests it and acknowledges the security implications.
- **NEVER** allow `Bash(rm -rf *)` or other destructive operations in the allow list.
- **NEVER** merge settings without showing the user the diff between old and new configuration.

---

## Completion Criteria

- [ ] Project needs analyzed (technology, sensitive files, safe operations)
- [ ] settings.json generated with deny-first permission rules
- [ ] Permission mode selected and justified
- [ ] MCP servers configured with placeholder credentials
- [ ] Environment variable recommendations documented
- [ ] Configuration summary displayed to user
