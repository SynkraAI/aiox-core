# Task: Configure Sandbox Environment

**Task ID:** CCM-CONFIG-006
**Version:** 1.0.0
**Command:** `*sandbox-setup`
**Orchestrator:** Sigil (config-engineer)
**Purpose:** Configure Claude Code's sandbox environment for filesystem isolation, network restrictions, and process boundaries to ensure safe command execution with minimal friction.

---

## Overview

```
  +------------------+     +------------------+     +------------------+
  | 1. Assess        | --> | 2. Configure     | --> | 3. Set Up        |
  |    Isolation     |     |    Sandbox Mode  |     |    Network       |
  |    Needs         |     |    in Settings   |     |    Restrictions  |
  +------------------+     +------------------+     +------------------+
       |                                                    |
       v                                                    v
  +------------------+     +------------------+
  | 4. Configure     | --> | 5. Test Sandbox  |
  |    File System   |     |    Isolation     |
  |    Boundaries    |     |                  |
  +------------------+     +------------------+
```

---

## Inputs

| Field | Type | Source | Required | Validation |
|-------|------|--------|----------|------------|
| project_root | string | Working directory | Yes | Valid project directory |
| platform | string | Auto-detected | No | `macos`, `linux`, `wsl2`, `windows` |
| isolation_level | string | User parameter | No | `standard` (default), `strict`, `airgapped` |

---

## Preconditions

- Claude Code installed and operational
- Understanding of the project's required filesystem access and network needs
- Platform supports sandboxing (macOS, Linux, WSL2 -- Windows has limited support)

---

## Execution Phases

### Phase 1: Assess Isolation Needs

1. Determine the platform and available sandbox features:

| Platform | Sandbox Technology | Filesystem | Network | Status |
|----------|--------------------|------------|---------|--------|
| macOS | Apple Sandbox (Seatbelt) | Full support | Full support | Production |
| Linux | Landlock + Seccomp | Full support | Full support | Production |
| WSL2 | Linux sandbox in WSL | Full support | Full support | Production |
| Windows (native) | Limited | Partial | Limited | Limited |

2. Survey project requirements:
   - Which directories need write access? (src/, tests/, docs/, node_modules/)
   - Which directories should be read-only? (.aiox-core/, config files)
   - Which directories should be invisible? (secrets/, .env files)
   - What external network access is needed? (npm registry, API servers, CDN)
   - Are any system commands needed outside sandbox? (git, docker)

3. Choose isolation level:

| Level | Filesystem | Network | Use Case |
|-------|-----------|---------|----------|
| standard | Write to project, read home | Allow known domains | General development |
| strict | Write to src/ only | Allow only essential | Sensitive projects |
| airgapped | Write to src/ only | No external network | Regulated/offline |

### Phase 2: Configure Sandbox Mode in Settings

Generate the sandbox configuration in settings.json:

```json
{
  "sandbox": {
    "enabled": true,
    "autoAllowBashIfSandboxed": true,
    "excludedCommands": ["git", "docker"],
    "allowUnsandboxedCommands": false
  }
}
```

**Key settings explained:**

| Setting | Purpose | Recommendation |
|---------|---------|----------------|
| `enabled` | Enable sandbox for bash commands | `true` for all shared projects |
| `autoAllowBashIfSandboxed` | Skip permission prompts for sandboxed bash | `true` -- sandbox provides safety |
| `excludedCommands` | Commands that bypass sandbox | Only git, docker if needed |
| `allowUnsandboxedCommands` | Allow `dangerouslyDisableSandbox` | `false` unless explicit need |

### Phase 3: Set Up Network Restrictions

Configure network access using the `network` section:

```json
{
  "sandbox": {
    "network": {
      "allowedDomains": [
        "registry.npmjs.org",
        "api.github.com",
        "raw.githubusercontent.com"
      ],
      "allowUnixSockets": [],
      "allowAllUnixSockets": false,
      "allowLocalBinding": false,
      "httpProxyPort": 0,
      "socksProxyPort": 0
    }
  }
}
```

**Common domain allowlists by project type:**

| Project Type | Domains to Allow |
|-------------|-----------------|
| Node.js | registry.npmjs.org, nodejs.org |
| Python | pypi.org, files.pythonhosted.org |
| Frontend | unpkg.com, cdn.jsdelivr.net, fonts.googleapis.com |
| Supabase | *.supabase.co, *.supabase.in |
| GitHub | api.github.com, raw.githubusercontent.com |
| Docker | registry.docker.io, auth.docker.io |
| General API | (project-specific API domains) |

**Isolation levels:**
- **standard**: Allow package registries + project APIs
- **strict**: Allow only package registries
- **airgapped**: Empty allowedDomains (no external network)

### Phase 4: Configure File System Boundaries

Set filesystem access controls:

```json
{
  "sandbox": {
    "filesystem": {
      "allowWrite": [
        "/src",
        "/tests",
        "/docs",
        "//tmp"
      ],
      "denyWrite": [
        "/.aiox-core/core",
        "/node_modules",
        "/.git"
      ],
      "denyRead": [
        "/.env",
        "/.env.*",
        "/secrets"
      ]
    }
  }
}
```

**Path prefix reference:**

| Prefix | Meaning | Example |
|--------|---------|---------|
| `//` | Filesystem root | `//tmp/build` |
| `~/` | Home directory | `~/.ssh`, `~/.kube` |
| `/` | Relative to settings file directory | `/src`, `/tests` |
| `./` | Runtime-resolved relative path | `./output` |

**Standard write access:**

| Level | Write Allowed | Write Denied |
|-------|---------------|--------------|
| standard | src/, tests/, docs/, tmp/ | node_modules/, .git/, .aiox-core/core/ |
| strict | src/ only | Everything else |
| airgapped | src/ with review | Everything else |

**Read restrictions (always deny):**
- `.env`, `.env.*` -- environment variables
- `secrets/`, `private/` -- secret directories
- `~/.ssh/` -- SSH keys
- `~/.aws/` -- AWS credentials
- `~/.kube/` -- Kubernetes configs

### Phase 5: Test Sandbox Isolation

1. Verify sandbox is active:
   - Run a bash command and check for sandbox indicators
   - Attempt to read a denied path (should fail gracefully)
   - Attempt to write to a denied path (should fail gracefully)

2. Test network restrictions:
   - Attempt to fetch from an allowed domain (should succeed)
   - Attempt to fetch from a non-allowed domain (should be blocked)

3. Test filesystem boundaries:
   - Write to an allowed path (should succeed)
   - Write to a denied path (should be blocked)
   - Read from a denied path (should be blocked)

4. Document test results:

| Test | Expected | Actual | Status |
|------|----------|--------|--------|
| Read .env | BLOCKED | {result} | {PASS/FAIL} |
| Write to src/ | ALLOWED | {result} | {PASS/FAIL} |
| Fetch npm registry | ALLOWED | {result} | {PASS/FAIL} |
| Fetch random domain | BLOCKED | {result} | {PASS/FAIL} |

---

## Output Format

```markdown
## Sandbox Configuration

**Platform:** {platform}
**Isolation Level:** {standard | strict | airgapped}

### Settings Applied

```json
{complete sandbox section of settings.json}
```

### Filesystem Policy

| Path | Read | Write | Rationale |
|------|------|-------|-----------|
| src/ | Yes | Yes | Source code development |
| .env | No | No | Sensitive environment variables |
| node_modules/ | Yes | No | Dependencies (managed by npm) |
| ... | ... | ... | ... |

### Network Policy

| Domain | Allowed | Rationale |
|--------|---------|-----------|
| registry.npmjs.org | Yes | Package installation |
| *.supabase.co | Yes | Database access |
| * (all others) | No | Default deny |

### Test Results

{Test table from Phase 5}

### Excluded Commands

{List of commands that bypass sandbox with justification}
```

---

## Veto Conditions

- **NEVER** disable the sandbox without explicit user confirmation and documented justification.
- **NEVER** add `allowAllUnixSockets: true` in production or team environments -- it bypasses network restrictions.
- **NEVER** add home directory (`~/`) to write-allowed paths. Only specific subdirectories if absolutely needed.
- **NEVER** set `allowUnsandboxedCommands: true` in enterprise or team settings -- it allows bypassing all sandbox protections.
- **NEVER** add wildcard domains (`*`) to the allowedDomains list. Be specific about which domains need access.

---

## Completion Criteria

- [ ] Platform detected and sandbox support verified
- [ ] Isolation level selected based on security assessment
- [ ] Sandbox enabled in settings with appropriate flags
- [ ] Network restrictions configured with specific domain allowlist
- [ ] Filesystem boundaries set with write/read controls
- [ ] Sandbox isolation tested with documented results
