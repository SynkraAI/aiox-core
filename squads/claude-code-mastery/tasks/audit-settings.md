# Task: Audit Claude Code Settings

**Task ID:** CCM-CONFIG-002
**Version:** 1.0.0
**Command:** `*audit-settings`
**Orchestrator:** Sigil (config-engineer)
**Purpose:** Audit all active Claude Code settings layers for conflicts, redundancies, security gaps, and optimization opportunities by reading managed, project, local, and user configuration files.

---

## Overview

```
  +------------------+     +------------------+     +------------------+
  | 1. Read All      | --> | 2. Check for     | --> | 3. Validate      |
  |    Settings Files|     |    Conflicts     |     |    Deny Rules    |
  +------------------+     +------------------+     +------------------+
       |                                                    |
       v                                                    v
  +------------------+     +------------------+     +------------------+
  | 4. Check         | --> | 5. Verify MCP    | --> | 6. Generate      |
  |    Permission    |     |    Configs       |     |    Audit Report  |
  |    Mode          |     |                  |     |                  |
  +------------------+     +------------------+     +------------------+
```

---

## Inputs

| Field | Type | Source | Required | Validation |
|-------|------|--------|----------|------------|
| project_root | string | Working directory | Yes | Must contain .claude/ or be a project root |
| check_managed | boolean | User parameter | No | Whether to check managed-settings.json (default: true) |

---

## Preconditions

- Read access to all settings file locations
- Claude Code installed on the system
- At least one settings file must exist (.claude/settings.json minimum)

---

## Execution Phases

### Phase 1: Read All Settings Files

Locate and read each settings layer in precedence order:

| Layer | Priority | Path | Scope |
|-------|----------|------|-------|
| 1 (Highest) | Managed | Platform-specific managed-settings.json | Organization |
| 2 | CLI args | (Runtime only -- cannot be audited from files) | Session |
| 3 | Local | .claude/settings.local.json | Personal/project |
| 4 | Shared | .claude/settings.json | Team/project |
| 5 (Lowest) | User | ~/.claude/settings.json | Personal/global |

**Managed settings locations:**
- macOS: `/Library/Application Support/ClaudeCode/managed-settings.json`
- Linux/WSL: `/etc/claude-code/managed-settings.json`
- Windows: `C:\Program Files\ClaudeCode\managed-settings.json`

For each file found:
1. Parse JSON and validate structure
2. Extract permission rules (deny, ask, allow arrays)
3. Extract MCP server configurations
4. Extract hook configurations
5. Extract sandbox settings
6. Record file modification timestamp

### Phase 2: Check for Conflicts Between Scopes

1. **Rule conflicts**: Same Tool(specifier) pattern appearing in different rule types across layers
   - Example: `Bash(npm run *)` in local allow but shared deny
   - Resolution: Deny always wins (merge + dedup behavior)
   - Flag as WARNING if user likely intended allow
2. **Mode conflicts**: Different defaultMode across layers
   - Higher precedence layer wins
   - Flag if local overrides shared (may confuse team)
3. **Array merging analysis**: Permission arrays merge across scopes
   - Identify duplicate rules (same pattern in multiple layers)
   - Identify contradictions (pattern in both allow and deny)
4. **Hook conflicts**: Same event with different configurations across layers
   - Managed hooks cannot be overridden

### Phase 3: Validate Deny Rules Cover Sensitive Paths

Check that critical sensitive files are protected:

**Required deny rules (flag if missing):**

| Pattern | Protects | Severity if Missing |
|---------|----------|---------------------|
| `Read(./.env)` | Environment variables | CRITICAL |
| `Read(./.env.*)` | Environment variants | CRITICAL |
| `Read(./secrets/**)` | Secrets directory | HIGH |
| `Read(./**/*.pem)` | SSL/TLS certificates | HIGH |
| `Read(./**/*.key)` | Private keys | HIGH |
| `Bash(rm -rf *)` | Destructive deletion | CRITICAL |
| `Bash(curl * \| bash)` | Pipe-to-shell attacks | HIGH |

**AIOX-specific deny rules (if .aiox-core/ exists):**

| Pattern | Protects | Severity if Missing |
|---------|----------|---------------------|
| `Edit(.aiox-core/core/**)` | L1 Framework Core | HIGH |
| `Edit(.aiox-core/constitution.md)` | Constitution | HIGH |
| `Edit(bin/aiox.js)` | CLI entry point | MEDIUM |

### Phase 4: Check Permission Mode Appropriateness

1. Determine effective permission mode (highest precedence layer wins)
2. Assess appropriateness for the project:
   - `bypassPermissions` on a team project -> CRITICAL warning
   - `autoApprove` without deny rules -> HIGH warning
   - `askAlways` with extensive allow rules -> INFO (could upgrade to acceptEdits)
   - `acceptEdits` with proper deny rules -> GOOD (recommended setup)
3. Check for enterprise lockdown:
   - `disableBypassPermissionsMode` in managed settings
   - `allowManagedPermissionRulesOnly` flag

### Phase 5: Verify MCP Server Configurations

1. Collect MCP configurations from all layers
2. For each server:
   - Verify command/URL is specified
   - Check that environment variables reference env vars (not hardcoded values)
   - Verify the server has a matching MCP permission rule (allow or ask)
3. Check for enterprise restrictions:
   - `allowManagedMcpServersOnly` flag
   - `allowedMcpServers` / `deniedMcpServers` lists
4. Flag any MCP servers not in the allow list

### Phase 6: Generate Audit Report

Compile all findings into a structured report.

---

## Output Format

```markdown
## Settings Audit Report

**Project:** {project-name}
**Date:** {YYYY-MM-DD}
**Layers Found:** {count}/5

### Layer Summary

| Layer | File | Exists | Rules | Mode |
|-------|------|--------|-------|------|
| Managed | {path} | {Yes/No} | {N deny, N allow} | {mode or --} |
| Local | .claude/settings.local.json | {Yes/No} | {N deny, N allow} | {mode or --} |
| Shared | .claude/settings.json | {Yes/No} | {N deny, N allow} | {mode or --} |
| User | ~/.claude/settings.json | {Yes/No} | {N deny, N allow} | {mode or --} |

### Effective Configuration

- **Permission mode:** {effective mode} (from {layer})
- **Total deny rules:** {N} (after merge + dedup)
- **Total allow rules:** {N} (after merge + dedup)
- **MCP servers:** {N}
- **Hooks:** {N} events configured

### Findings

| # | Severity | Finding | Layer(s) | Recommendation |
|---|----------|---------|----------|----------------|
| 1 | {CRITICAL/HIGH/MEDIUM/LOW/INFO} | {description} | {layer} | {fix} |

### Security Gaps

{List of missing deny rules that should be present}

### Conflicts

{List of rule conflicts between layers}

### Optimization Opportunities

{List of redundancies and improvements}
```

---

## Veto Conditions

- **NEVER** modify any settings files during the audit. This is a read-only diagnostic.
- **NEVER** display the actual values of API keys, tokens, or secrets found in settings. Report presence only.
- **NEVER** report a clean audit if critical deny rules (for .env, secrets) are missing. Always flag these.
- **NEVER** recommend `bypassPermissions` mode as a fix for any issue.
- **NEVER** skip the managed-settings.json check in enterprise environments -- it is the highest authority layer.

---

## Completion Criteria

- [ ] All accessible settings layers read and parsed
- [ ] Conflicts between layers identified and documented
- [ ] Sensitive path deny rules validated (missing rules flagged)
- [ ] Permission mode assessed for appropriateness
- [ ] MCP server configurations verified
- [ ] Audit report generated with severity-ranked findings
