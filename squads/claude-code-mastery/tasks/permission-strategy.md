# Task: Design Permission Strategy

**Task ID:** CCM-CONFIG-005
**Version:** 1.0.0
**Command:** `*permission-strategy`
**Orchestrator:** Sigil (config-engineer)
**Purpose:** Design a comprehensive permission strategy for a project by assessing security needs, selecting the appropriate permission mode, and engineering precise allow/ask/deny rules using Claude Code's `Tool(specifier)` syntax.

---

## Overview

```
  +------------------+     +------------------+     +------------------+
  | 1. Assess        | --> | 2. Choose        | --> | 3. Configure     |
  |    Security      |     |    Permission    |     |    Allow Rules   |
  |    Needs         |     |    Mode          |     |                  |
  +------------------+     +------------------+     +------------------+
       |                                                    |
       v                                                    v
  +------------------+     +------------------+     +------------------+
  | 4. Configure     | --> | 5. Set MCP       | --> |    STRATEGY      |
  |    Deny Rules    |     |    Tool          |     |    DOCUMENT      |
  +------------------+     |    Permissions   |     +------------------+
                            +------------------+
```

---

## Inputs

| Field | Type | Source | Required | Validation |
|-------|------|--------|----------|------------|
| project_root | string | Working directory | Yes | Valid project directory |
| team_size | string | User parameter | No | `solo`, `small` (2-5), `team` (6+), `enterprise` |
| sensitivity | string | User parameter | No | `low`, `standard` (default), `high`, `regulated` |

---

## Preconditions

- Understanding of the project's technology stack
- Knowledge of team composition and access patterns
- Awareness of any compliance requirements (SOC2, HIPAA, etc.)

---

## Execution Phases

### Phase 1: Assess Project Security Needs

1. Determine the sensitivity profile:

| Factor | Weight | Assessment |
|--------|--------|------------|
| Handles PII/PHI data | HIGH | Check for user data, health records |
| Has production credentials | HIGH | .env files, secret managers |
| External API integrations | MEDIUM | Third-party services, webhooks |
| Financial transactions | HIGH | Payment processing, billing |
| Open source project | LOW | Public code, no secrets |
| Internal tool | MEDIUM | Company data, internal APIs |

2. Scan for sensitive file patterns:
   - `.env`, `.env.*` -- environment variables
   - `*.pem`, `*.key`, `*.p12` -- certificates and keys
   - `secrets/`, `credentials/`, `private/` -- secret directories
   - `*.tfvars`, `*.tfstate` -- Terraform state with secrets
   - `docker-compose.*.yml` -- may contain credentials
3. Identify safe operation patterns:
   - Read-only operations (git diff, git log, cat)
   - Build/test operations (npm run, pytest)
   - Development servers (npm run dev, next dev)

### Phase 2: Choose Permission Mode

Select the base mode based on assessment:

| Mode | Use When | Friction Level | Security Level |
|------|----------|----------------|----------------|
| askAlways | Regulated environments, onboarding, high sensitivity | High | Maximum |
| acceptEdits | Standard development, trusted codebase, medium sensitivity | Medium | Balanced |
| autoApprove | Solo developer, low sensitivity, personal projects | Low | Minimum |
| plan | Complex workflows requiring upfront approval (managed only) | Medium | High |

**Decision tree:**

```
Is this regulated (SOC2, HIPAA)?
  YES -> askAlways + strict deny rules
  NO  -> Is it a team project?
    YES -> acceptEdits + comprehensive deny/allow
    NO  -> Is it high sensitivity?
      YES -> acceptEdits + strict deny rules
      NO  -> autoApprove + basic deny rules (still deny secrets)
```

Present recommendation with rationale. Allow user override.

### Phase 3: Configure Allow Rules

Build the allow list using `Tool(specifier)` syntax:

**Evaluation order reminder:** deny -> ask -> allow (first match wins).

**Common allow patterns by tool:**

| Tool | Pattern | Purpose |
|------|---------|---------|
| `Bash(npm run *)` | Allow all npm scripts | Development workflow |
| `Bash(npx *)` | Allow npx execution | Tool execution |
| `Bash(git status)` | Git status check | Version control |
| `Bash(git diff *)` | Git diff viewing | Code review |
| `Bash(git log *)` | Git history | Version control |
| `Bash(git add *)` | Git staging | Version control |
| `Bash(git commit *)` | Git commits | Version control |
| `Bash(node *)` | Node.js execution | Development |
| `Bash(python *)` | Python execution | Development |
| `Bash(pytest *)` | Python testing | Testing |
| `Read(src/**)` | Read source code | Development |
| `Read(docs/**)` | Read documentation | Reference |
| `Read(tests/**)` | Read test files | Testing |
| `Edit(src/**)` | Edit source code | Development |
| `Edit(tests/**)` | Edit test files | Testing |
| `WebFetch(domain:*.npmjs.org)` | NPM registry | Package info |
| `WebFetch(domain:api.github.com)` | GitHub API | Repository info |
| `MCP(context7)` | Library docs | Documentation |
| `Agent(Explore)` | Exploration subagent | Analysis |

Customize based on detected project needs.

### Phase 4: Configure Deny Rules

Build the deny list (evaluated first, highest priority):

**Mandatory deny rules (always include):**

```json
{
  "deny": [
    "Read(./.env)",
    "Read(./.env.*)",
    "Read(./.env.local)",
    "Read(./secrets/**)",
    "Read(./**/*.pem)",
    "Read(./**/*.key)",
    "Read(./**/*.p12)",
    "Bash(rm -rf /)",
    "Bash(rm -rf ~)",
    "Bash(curl * | bash)",
    "Bash(wget * | bash)",
    "Bash(> /dev/sda)"
  ]
}
```

**Project-specific deny rules:**

| Project Type | Additional Deny Rules |
|-------------|----------------------|
| AIOX | `Edit(.aiox-core/core/**)`, `Edit(.aiox-core/constitution.md)`, `Edit(bin/aiox.js)` |
| Infrastructure | `Bash(terraform apply *)`, `Bash(terraform destroy *)` |
| Database | `Bash(psql * DROP *)`, `Bash(mysql * DROP *)` |
| Docker | `Bash(docker rm -f *)`, `Bash(docker system prune *)` |

**Ask rules (prompt before executing):**

```json
{
  "ask": [
    "Bash(git push *)",
    "Bash(git checkout -- *)",
    "Bash(git reset --hard *)",
    "Edit(./package.json)",
    "Edit(./tsconfig.json)",
    "Bash(npm install *)",
    "Bash(npm uninstall *)"
  ]
}
```

### Phase 5: Set MCP Tool Permissions

1. For each configured MCP server, add appropriate permission rules:
   - Trusted servers: add to allow list (e.g., `MCP(context7)`)
   - Semi-trusted: add to ask list (e.g., `MCP(filesystem)`)
   - Blocked: add to deny list (e.g., `MCP(untrusted-server)`)
2. If enterprise: check `allowedMcpServers` / `deniedMcpServers` managed lists
3. For Agent permissions:
   - Allow known safe subagents: `Agent(Explore)`, `Agent(Plan)`
   - Custom agents: add to allow if trusted, ask if new

---

## Output Format

```markdown
## Permission Strategy

**Project:** {project-name}
**Sensitivity:** {level}
**Team:** {size}
**Mode:** {selected-mode}

### Rule Summary

| Category | Count | Examples |
|----------|-------|---------|
| deny | {N} | .env, secrets, destructive commands |
| ask | {N} | git push, package.json changes |
| allow | {N} | npm scripts, git read-only, src/ access |

### Complete Configuration

```json
{
  "permissions": {
    "deny": [ ... ],
    "ask": [ ... ],
    "allow": [ ... ],
    "defaultMode": "{mode}"
  }
}
```

### Evaluation Examples

Show how specific operations will be handled:

| Operation | Matches | Category | Result |
|-----------|---------|----------|--------|
| `cat .env` | `Read(./.env)` | deny | BLOCKED |
| `npm run test` | `Bash(npm run *)` | allow | AUTO-APPROVED |
| `git push origin main` | `Bash(git push *)` | ask | PROMPTS USER |
| `edit src/app.ts` | `Edit(src/**)` | allow | AUTO-APPROVED |

### Security Coverage

- [x] Environment files protected
- [x] Secret directories blocked
- [x] Destructive commands blocked
- [x] Pipe-to-shell attacks blocked
- [x] Certificate/key files protected
- [ ] {Any gaps flagged here}
```

---

## Veto Conditions

- **NEVER** design a strategy without deny rules for .env and secrets. These are non-negotiable security baselines.
- **NEVER** add destructive bash commands (rm -rf, format, mkfs) to the allow list.
- **NEVER** recommend `bypassPermissions` mode for team or enterprise environments.
- **NEVER** allow `Bash(curl * | bash)` or `Bash(wget * | bash)` patterns -- pipe-to-shell is a known attack vector.
- **NEVER** put the same pattern in both deny and allow without explaining that deny always wins.

---

## Completion Criteria

- [ ] Security assessment completed with sensitivity profile
- [ ] Permission mode selected with documented rationale
- [ ] Deny rules cover all mandatory sensitive patterns
- [ ] Allow rules enable detected development workflows
- [ ] Ask rules protect modification of critical config files
- [ ] MCP tool permissions set for all configured servers
- [ ] Evaluation examples show how common operations are handled
