---
task: navigatorDoctor()
responsavel: "@navigator"
responsavel_type: Agent
atomic_layer: Task
elicit: false

Entrada:
  - campo: verbose
    tipo: boolean
    origem: CLI flag
    obrigatorio: false
    validacao: "Show detailed output (default: false)"

Saida:
  - campo: health_status
    tipo: object
    destino: Console
    persistido: false

  - campo: exit_code
    tipo: number
    destino: Process
    persistido: false

Checklist:
  - "[ ] Check Node.js version (>= 18.0.0)"
  - "[ ] Check Git availability"
  - "[ ] Check NPM dependencies (js-yaml, glob, inquirer)"
  - "[ ] Check Git hooks installation"
  - "[ ] Check directory structure"
  - "[ ] Check pipeline map validity"
  - "[ ] Check scripts readable"
  - "[ ] Display health summary"
veto_conditions:
  - "Node.js not available in PATH → BLOCK (doctor script requires Node.js runtime)"
  - "Doctor script file missing or unreadable → BLOCK (reinstall Navigator squad)"
---

# Navigator Doctor Task

## Purpose

Run health checks to validate Navigator installation, dependencies, and configuration. Helps diagnose issues when Navigator commands fail or behave unexpectedly.

## Story Reference

- **Sprint:** Sprint 1 - Navigator Quick Wins
- **Task:** #3 - Create *navigator-doctor command

## Pre-Conditions

```yaml
pre-conditions:
  - [ ] AIOS project initialized
    tipo: pre-condition
    blocker: false
    validacao: |
      .aios-core/ directory exists
    error_message: "Not an AIOS project. Run 'npx aios-core install' first."
```

## Execution Steps

### Step 1: Run Health Check Script

```bash
node .aios-core/development/scripts/navigator/doctor.js
```

### Expected Output

```
🧭 Navigator Health Check

✓ Node.js v20.10.0 (>= 18.0.0)
✓ git version 2.39.0
✓ All required packages installed (js-yaml, glob, inquirer)
✓ Navigator post-commit hook installed
✓ All required directories exist
✓ Pipeline map valid (10 phases)
✓ All 5 scripts present and readable

--- Health Check Summary ---

✓ Node.js v20.10.0 (>= 18.0.0)
✓ git version 2.39.0
✓ All required packages installed (js-yaml, glob, inquirer)
✓ Navigator post-commit hook installed
✓ All required directories exist
✓ Pipeline map valid (10 phases)
✓ All 5 scripts present and readable

7/7 checks passed

✅ Navigator is healthy!
```

## Health Checks

### 1. Node.js Version
- **Check:** Node.js >= 18.0.0
- **Fix:** Install Node.js 18+ from https://nodejs.org

### 2. Git Availability
- **Check:** `git --version` succeeds
- **Fix:** Install Git from https://git-scm.com

### 3. NPM Dependencies
- **Check:** js-yaml, glob, inquirer packages installed
- **Fix:** `npm install js-yaml glob inquirer`

### 4. Git Hooks
- **Check:** Navigator hook in `.husky/post-commit`
- **Fix:** Add hook manually or run `npm run prepare`

### 5. Directory Structure
- **Check:** Required directories exist:
  - `.aios-core/development/agents`
  - `.aios-core/development/tasks`
  - `.aios-core/development/templates`
  - `.aios-core/development/scripts/navigator`
  - `.aios-core/development/data`
- **Fix:** Reinstall AIOS or create missing directories

### 6. Pipeline Map
- **Check:** `navigator-pipeline-map.yaml` exists and is valid
- **Fix:** Create or fix YAML syntax

### 7. Scripts Executable
- **Check:** All 5 Navigator scripts present and readable
- **Fix:** Reinstall Navigator scripts or fix permissions

## Error Handling

### Error 1: Missing Dependencies

```yaml
error: MISSING_DEPENDENCIES
cause: NPM packages not installed
resolution: npm install <package>
recovery: Install missing packages and re-run doctor
```

### Error 2: Git Hook Not Installed

```yaml
error: GIT_HOOK_MISSING
cause: Husky not configured or Navigator hook not added
resolution: Add Navigator hook to .husky/post-commit
recovery: Manual installation or npm run prepare
```

### Error 3: Invalid Pipeline Map

```yaml
error: INVALID_PIPELINE_MAP
cause: YAML syntax error or missing phases array
resolution: Fix YAML structure
recovery: Restore from backup or recreate
```

## Post-Conditions

```yaml
post-conditions:
  - [ ] Health status displayed
    tipo: post-condition
    blocker: false
    validacao: |
      All checks run and results shown
    error_message: "Health check incomplete"

  - [ ] Exit code correct
    tipo: post-condition
    blocker: false
    validacao: |
      Exit 0 if all passed, exit 1 if any failed
    error_message: "Incorrect exit code"
```

## Dependencies

- **Scripts:**
  - `.aios-core/development/scripts/navigator/doctor.js`

- **Tools:**
  - Node.js (>= 18.0.0)
  - Git
  - js-yaml, glob, inquirer (npm packages)

## Metadata

```yaml
story: Navigator Sprint 1 - Quick Wins
version: 1.0.0
created: 2026-02-15
author: Luiz Fosc
tags:
  - navigator
  - health-check
  - doctor
  - diagnostics
```

---

*Task definition for *navigator-doctor command*
