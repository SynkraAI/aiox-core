---
name: coderabbit-review
description: |
  Unified CodeRabbit CLI execution via WSL with self-healing loop.
  Use this skill when running automated code review before commits, PRs, or QA gates.
  Handles WSL wrapper, severity filtering, and auto-fix iterations.
user-invocable: true
argument-hint: "[scope: uncommitted|committed|base]"
---

# CodeRabbit Review

Centralized CodeRabbit CLI execution for automated code review via WSL.

## Prerequisites

- CodeRabbit CLI installed in WSL at `~/.local/bin/coderabbit`
- WSL distribution: Ubuntu
- Authenticated: `wsl bash -c '~/.local/bin/coderabbit auth status'`

## Execution

### 1. Determine Scope

Parse `$ARGUMENTS` to determine review scope:

| Argument | Command | Use Case |
|----------|---------|----------|
| `uncommitted` (default) | `--prompt-only -t uncommitted` | Pre-commit review |
| `committed` | `--prompt-only -t committed --base main` | QA story review |
| `base {branch}` | `--prompt-only --base {branch}` | Pre-PR review against specific base |

### 2. Build WSL Command

```bash
wsl bash -c 'cd /mnt/c/Users/AllFluence-User/Workspaces/AIOS/SynkraAI/aios-core && ~/.local/bin/coderabbit {flags}'
```

**Timeout:** 15 minutes (900000ms) — CodeRabbit reviews take 7-30 min.

### 3. Execute Review

Run the command via Bash tool with appropriate timeout.

### 4. Parse Results

Classify findings by severity:

| Severity | Action |
|----------|--------|
| **CRITICAL** | Must fix immediately — blocks completion |
| **HIGH** | Recommend fix before merge |
| **MEDIUM** | Document as technical debt |
| **LOW** | Optional improvement, note only |

### 5. Self-Healing Loop (if CRITICAL found)

```
iteration = 0
max_iterations = agent-specific (dev: 2, qa: 3, devops: 2)

WHILE iteration < max_iterations AND critical_issues_remain:
  1. Attempt auto-fix for each CRITICAL issue
  2. Re-run CodeRabbit review
  3. iteration++

IF critical_issues_remain after max_iterations:
  HALT and report to user
```

### 6. Report

Output a summary table:

```markdown
## CodeRabbit Review Results

| Severity | Count | Status |
|----------|-------|--------|
| CRITICAL | N | Fixed/Remaining |
| HIGH | N | Documented |
| MEDIUM | N | Tech debt |
| LOW | N | Noted |

**Decision:** PASS / FAIL
```

## Error Handling

| Error | Cause | Resolution |
|-------|-------|------------|
| `coderabbit: command not found` | Not installed in WSL | `wsl bash -c 'pip install coderabbit-cli'` |
| Timeout (>15 min) | Large review | Increase timeout, review is still processing |
| `not authenticated` | Auth expired | `wsl bash -c '~/.local/bin/coderabbit auth status'` |

## Agent-Specific Configuration

| Agent | Max Iterations | Severity Filter | Trigger |
|-------|---------------|-----------------|---------|
| @dev | 2 | CRITICAL only | Pre-commit (story completion) |
| @qa | 3 | CRITICAL + HIGH | Story review start |
| @devops | 2 | CRITICAL + HIGH | Pre-push / Pre-PR |

## Report Location

Save reports to: `docs/qa/coderabbit-reports/`
