# Task: Enterprise Configuration

**Task ID:** CCM-CONFIG-007
**Version:** 1.0.0
**Command:** `*enterprise-config`
**Orchestrator:** Sigil (config-engineer)
**Purpose:** Generate and deploy enterprise-grade Claude Code configuration using managed-settings.json for organizational policy enforcement, MDM integration, compliance rules, and standardized MCP server deployment across teams.

---

## Overview

```
  +------------------+     +------------------+     +------------------+
  | 1. Set Up        | --> | 2. Configure     | --> | 3. Set Up        |
  |    managed-      |     |    MDM/OS-Level  |     |    managed-      |
  |    settings.json |     |    Policies      |     |    mcp.json      |
  +------------------+     +------------------+     +------------------+
       |                                                    |
       v                                                    v
  +------------------+     +------------------+
  | 4. Configure     | --> | 5. Deploy        |
  |    Compliance    |     |    Across        |
  |    Rules         |     |    Organization  |
  +------------------+     +------------------+
```

---

## Inputs

| Field | Type | Source | Required | Validation |
|-------|------|--------|----------|------------|
| org_name | string | User parameter | Yes | Organization identifier |
| compliance | array | User parameter | No | Compliance frameworks: `soc2`, `hipaa`, `gdpr`, `pci`, `iso27001` |
| platform_targets | array | User parameter | No | `macos`, `linux`, `windows`, `wsl2` (default: all) |
| team_count | number | User parameter | No | Number of developers/teams using Claude Code |

---

## Preconditions

- Administrative access to deploy managed settings files
- Understanding of organizational security policies
- MDM system access (for macOS plist or Windows registry deployment)
- Knowledge of approved tools and MCP servers for the organization

---

## Execution Phases

### Phase 1: Set Up managed-settings.json

Create the managed settings file that cannot be overridden by user or project settings:

**Deployment locations (one per platform):**

| Platform | Path |
|----------|------|
| macOS | `/Library/Application Support/ClaudeCode/managed-settings.json` |
| Linux/WSL | `/etc/claude-code/managed-settings.json` |
| Windows | `C:\Program Files\ClaudeCode\managed-settings.json` |

**Base template:**

```json
{
  "permissions": {
    "deny": [
      "Read(./.env)",
      "Read(./.env.*)",
      "Read(./secrets/**)",
      "Read(./**/*.pem)",
      "Read(./**/*.key)",
      "Bash(rm -rf /)",
      "Bash(curl * | bash)",
      "Bash(wget * | bash)"
    ],
    "defaultMode": "acceptEdits"
  },
  "disableBypassPermissionsMode": "disable",
  "allowManagedPermissionRulesOnly": false,
  "env": {
    "CLAUDE_CODE_EFFORT_LEVEL": "high",
    "CLAUDE_AUTOCOMPACT_PCT_OVERRIDE": "80"
  },
  "companyAnnouncements": [
    "{org_name}: Use Claude Code responsibly. Report issues to #ai-tools."
  ]
}
```

**Managed-only policy keys:**

| Key | Type | Purpose | Recommendation |
|-----|------|---------|----------------|
| `disableBypassPermissionsMode` | `"disable"` | Prevent users from bypassing permissions | Always set in enterprise |
| `allowManagedPermissionRulesOnly` | boolean | Only managed deny/allow rules apply | `true` for regulated environments |
| `allowManagedHooksOnly` | boolean | Only managed hooks can execute | `true` for high-security |
| `allowManagedMcpServersOnly` | boolean | Only managed MCP servers allowed | `true` for compliance |
| `companyAnnouncements` | string[] | Messages shown to all users | Use for policies and reminders |

### Phase 2: Configure MDM/OS-Level Policies

For organizations using Mobile Device Management:

**macOS (plist):**
```xml
<!-- com.anthropic.claudecode.plist -->
<dict>
  <key>disableBypassPermissionsMode</key>
  <string>disable</string>
  <key>permissions</key>
  <dict>
    <key>defaultMode</key>
    <string>acceptEdits</string>
    <key>deny</key>
    <array>
      <string>Read(./.env)</string>
      <string>Read(./.env.*)</string>
      <string>Read(./secrets/**)</string>
    </array>
  </dict>
</dict>
```

**Windows (Registry):**
```
HKLM\SOFTWARE\Policies\ClaudeCode\
  disableBypassPermissionsMode = "disable" (REG_SZ)
  permissions\defaultMode = "acceptEdits" (REG_SZ)
```

**Linux (file-based):**
Deploy `/etc/claude-code/managed-settings.json` via configuration management (Ansible, Chef, Puppet).

Provide platform-specific deployment scripts or configuration snippets.

### Phase 3: Set Up managed-mcp.json

Create the managed MCP configuration for standard organizational tools:

**Deployment locations:**

| Platform | Path |
|----------|------|
| macOS | `/Library/Application Support/ClaudeCode/managed-mcp.json` |
| Linux/WSL | `/etc/claude-code/managed-mcp.json` |
| Windows | `C:\Program Files\ClaudeCode\managed-mcp.json` |

**Template:**

```json
{
  "mcpServers": {
    "context7": {
      "command": "npx",
      "args": ["-y", "@context7/mcp-server"],
      "env": {}
    }
  },
  "allowedMcpServers": [
    { "serverName": "context7" },
    { "serverName": "playwright" }
  ],
  "deniedMcpServers": [
    { "serverName": "filesystem" }
  ]
}
```

**Server allowlisting strategy:**

| Strategy | Setting | Use Case |
|----------|---------|----------|
| Open (default) | No restrictions | Trusted teams, experimental |
| Allowlist | `allowedMcpServers` array | Standard teams, moderate control |
| Managed-only | `allowManagedMcpServersOnly: true` | Regulated environments |
| Blocklist | `deniedMcpServers` array | Block specific known-risky servers |

### Phase 4: Configure Compliance Rules

For each compliance framework, add specific rules:

**SOC2:**
```json
{
  "permissions": {
    "deny": [
      "Read(./**/*.pem)", "Read(./**/*.key)",
      "Bash(curl * | bash)", "Bash(wget * | bash)"
    ]
  },
  "disableBypassPermissionsMode": "disable",
  "sandbox": {
    "network": { "allowManagedDomainsOnly": true }
  }
}
```

**HIPAA (healthcare data):**
```json
{
  "permissions": {
    "deny": [
      "Read(./patient-data/**)", "Read(./phi/**)",
      "WebFetch"
    ],
    "defaultMode": "askAlways"
  },
  "allowManagedPermissionRulesOnly": true,
  "allowManagedMcpServersOnly": true
}
```

**GDPR (personal data):**
```json
{
  "permissions": {
    "deny": [
      "Read(./user-data/**)", "Read(./pii/**)",
      "Read(./**/personal/**)"
    ]
  },
  "companyAnnouncements": [
    "GDPR: Do not paste personal data into Claude Code prompts."
  ]
}
```

**PCI-DSS (payment data):**
```json
{
  "permissions": {
    "deny": [
      "Read(./payment/**)", "Read(./**/*card*)",
      "Read(./**/*billing*)"
    ],
    "defaultMode": "askAlways"
  },
  "disableBypassPermissionsMode": "disable"
}
```

Merge compliance rules with the base managed-settings.json.

### Phase 5: Deploy Across Organization

1. Generate deployment artifacts:
   - `managed-settings.json` for each platform
   - `managed-mcp.json` for each platform
   - MDM profiles (plist for macOS, registry for Windows)
   - Managed CLAUDE.md (optional, for org-wide instructions)
2. Create deployment documentation:
   - Installation instructions per platform
   - Verification commands to confirm deployment
   - Rollback procedure
3. Provide verification checklist:

```bash
# Verify managed settings are loaded (run as user)
# Claude Code will show managed policy indicators in the UI

# Check managed file exists
# macOS:
ls -la "/Library/Application Support/ClaudeCode/managed-settings.json"
# Linux:
ls -la /etc/claude-code/managed-settings.json
# Windows:
dir "C:\Program Files\ClaudeCode\managed-settings.json"
```

---

## Output Format

```markdown
## Enterprise Configuration Package

**Organization:** {org_name}
**Compliance:** {frameworks}
**Platforms:** {targets}
**Teams:** {team_count}

### Generated Files

| File | Platform | Purpose | Deploy To |
|------|----------|---------|-----------|
| managed-settings.json | {platform} | Policy enforcement | {path} |
| managed-mcp.json | {platform} | Standard MCP servers | {path} |
| CLAUDE.md | All | Org-wide instructions | {path} |
| {mcp-profile} | macOS | MDM deployment | Jamf/Intune |

### Policy Summary

| Policy | Setting | Effect |
|--------|---------|--------|
| Bypass disabled | disableBypassPermissionsMode: disable | Users cannot skip permissions |
| Managed rules only | allowManagedPermissionRulesOnly: {val} | {effect} |
| Managed MCP only | allowManagedMcpServersOnly: {val} | {effect} |
| Network restriction | allowManagedDomainsOnly: {val} | {effect} |

### Deny Rules ({count} total)

{Numbered list of all deny rules with categories}

### Approved MCP Servers

| Server | Purpose | Status |
|--------|---------|--------|
| {name} | {purpose} | Allowed/Managed |

### Deployment Instructions

{Platform-specific deployment steps}

### Verification

{Commands to verify deployment on each platform}

### Rollback

{Steps to remove managed settings if needed}
```

---

## Veto Conditions

- **NEVER** generate enterprise configuration without `disableBypassPermissionsMode: "disable"`. This is the foundational enterprise security control.
- **NEVER** include real API keys, tokens, or credentials in managed configuration files. Use environment variable references.
- **NEVER** set `allowManagedPermissionRulesOnly: true` without also including comprehensive deny rules. This would leave the system unprotected.
- **NEVER** deploy managed-settings.json without providing a rollback procedure. Configuration errors at the managed level affect all users.
- **NEVER** omit compliance-specific rules when a compliance framework is specified. Partial compliance is worse than documented non-compliance.

---

## Completion Criteria

- [ ] managed-settings.json generated with deny-first rules and enterprise policy keys
- [ ] MDM/OS-level deployment method documented for target platforms
- [ ] managed-mcp.json generated with approved server list
- [ ] Compliance rules integrated for all specified frameworks
- [ ] Deployment instructions created per platform
- [ ] Verification commands provided
- [ ] Rollback procedure documented
