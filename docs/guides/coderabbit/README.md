# CodeRabbit Integration Guide

**Version:** 1.0.0
**Last Updated:** 2026-01-28
**Applicable Agents:** @qa (Quinn), @devops (Gage)

---

## What is CodeRabbit?

[CodeRabbit](https://coderabbit.ai/) is an AI-powered code review tool that provides automated analysis of code changes. It integrates with GitHub pull requests to catch issues before human review, improving code quality and reducing review time.

### Key Capabilities

- **Security Scanning** - Detect SQL injection, XSS, hardcoded secrets
- **Code Quality** - Analyze complexity, duplication, patterns
- **Performance** - Identify anti-patterns and optimization opportunities
- **Best Practices** - Enforce coding standards and conventions

---

## AIOX Integration Overview

In AIOX, CodeRabbit is integrated into the Quality Gates system as part of **Layer 2: PR Automation**.

```
Quality Gates 3 Layers
=======================

Layer 1: LOCAL (Pre-commit)
├── ESLint, Prettier, TypeScript
├── Unit tests (fast)
└── Catches: 30% of issues

Layer 2: PR AUTOMATION  <-- CodeRabbit lives here
├── CodeRabbit AI review
├── Integration tests, coverage
├── Security scan, performance
└── Catches: Additional 50% (80% total)

Layer 3: HUMAN REVIEW
├── Architecture alignment
├── Business logic correctness
└── Catches: Final 20% (100% total)
```

---

## Agents Using CodeRabbit

### @qa (Quinn) - Quality Assurance Agent

Quinn uses CodeRabbit for comprehensive story reviews with self-healing capabilities.

**Usage:**

```
@qa
*review {story}    # Includes CodeRabbit scan
*code-review {scope}  # uncommitted or committed
```

**Self-Healing Workflow:**

1. Run CodeRabbit scan
2. If CRITICAL/HIGH issues found, auto-fix (up to 3 attempts)
3. If MEDIUM issues, document as tech debt
4. If LOW issues, note in review only

### @devops (Gage) - DevOps Agent

Gage uses CodeRabbit as a quality gate before push and PR creation.

**Usage:**

```
@devops
*pre-push         # Includes CodeRabbit validation
*create-pr        # Blocks if CRITICAL issues found
```

**Quality Gate Rules:**
| Severity | Action |
|----------|--------|
| CRITICAL | Block PR creation, must fix immediately |
| HIGH | Warn user, recommend fix before merge |
| MEDIUM | Document in PR description, create follow-up issue |
| LOW | Optional improvements, note in comments |

---

## Configuration

### Installation (WSL)

CodeRabbit CLI is installed in WSL (Windows Subsystem for Linux) for cross-platform consistency.

**Location:** `~/.local/bin/coderabbit`

**Verify Installation:**

```bash
wsl bash -c '~/.local/bin/coderabbit --version'
```

**Authentication:**

```bash
wsl bash -c '~/.local/bin/coderabbit auth status'
```

### AIOX Agent Configuration

CodeRabbit is configured in agent definition files:

**Location:** `.aiox-core/development/agents/qa.md` and `devops.md`

```yaml
coderabbit_integration:
  enabled: true
  installation_mode: wsl
  wsl_config:
    distribution: Ubuntu
    installation_path: ~/.local/bin/coderabbit
    working_directory: /mnt/c/Users/.../aiox-core
```

---

## Available Commands

### Review Uncommitted Changes

Reviews changes not yet committed (working directory).

```bash
# Via agent
@qa
*code-review uncommitted

# Direct command (if needed)
wsl bash -c 'cd /mnt/c/.../aiox-core && ~/.local/bin/coderabbit --prompt-only -t uncommitted'
```

### Review Committed Changes

Reviews committed changes against main branch.

```bash
# Via agent
@qa
*code-review committed

# Direct command
wsl bash -c 'cd /mnt/c/.../aiox-core && ~/.local/bin/coderabbit --prompt-only -t committed --base main'
```

### Pre-PR Review

Reviews all changes before creating a pull request.

```bash
# Via agent
@devops
*pre-push

# Direct command
wsl bash -c 'cd /mnt/c/.../aiox-core && ~/.local/bin/coderabbit --prompt-only --base main'
```

---

## Severity Levels

CodeRabbit categorizes issues by severity:

| Severity     | Description                               | AIOX Action                      |
| ------------ | ----------------------------------------- | -------------------------------- |
| **CRITICAL** | Security vulnerabilities, data loss risks | Block, auto-fix (3 attempts max) |
| **HIGH**     | Significant bugs, performance issues      | Block, auto-fix recommended      |
| **MEDIUM**   | Code quality issues, maintainability      | Document as tech debt            |
| **LOW**      | Style improvements, minor suggestions     | Note in review                   |

---

## Self-Healing Workflow

The @qa agent implements automatic issue resolution:

```
iteration = 0
max_iterations = 3

WHILE iteration < max_iterations:
  1. Run CodeRabbit scan
  2. Parse output for severity levels

  IF no CRITICAL/HIGH issues:
    - Document MEDIUM issues as tech debt
    - Log: "QA passed"
    - BREAK (ready to approve)

  IF CRITICAL or HIGH issues:
    - Attempt auto-fix for each issue
    - iteration++
    - CONTINUE loop

IF iterations exhausted AND issues remain:
  - Log: "Issues remain after 3 iterations"
  - Generate detailed QA gate report
  - Set gate decision: FAIL
  - HALT (require human intervention)
```

---

## Best Practices

### 1. Run Early, Run Often

Run CodeRabbit on uncommitted changes during development:

```
@qa
*code-review uncommitted
```

This catches issues before they become harder to fix.

### 2. Address CRITICAL Issues Immediately

Never push code with CRITICAL issues. These typically indicate:

- Security vulnerabilities
- Hardcoded credentials
- SQL injection risks
- Cross-site scripting (XSS)

### 3. Document Technical Debt

MEDIUM issues should be tracked, not ignored:

```
@qa
*backlog-add {story} tech-debt medium "CodeRabbit: Reduce complexity in utils.js"
```

### 4. Review CodeRabbit Suggestions

Not all suggestions require action. Use judgment:

- **Accept** improvements that add value
- **Ignore** suggestions that don't fit the codebase
- **Discuss** contentious recommendations with the team

### 5. Configure Severity Filters

For rapid iteration during development, focus on high-severity issues:

```yaml
severity_filter:
  - CRITICAL
  - HIGH
```

---

## Troubleshooting

### "coderabbit: command not found"

**Cause:** Path not configured correctly

**Solution:**

```bash
# Verify installation
wsl bash -c 'ls -la ~/.local/bin/coderabbit'

# If missing, reinstall
wsl bash -c 'curl -fsSL https://coderabbit.ai/install.sh | bash'
```

### "not authenticated"

**Cause:** CodeRabbit CLI not authenticated

**Solution:**

```bash
wsl bash -c '~/.local/bin/coderabbit auth login'
```

### Timeout Errors

**Cause:** Large changesets take longer to analyze

**Solution:**

- Increase timeout in task configuration (default: 15-30 minutes)
- Break large PRs into smaller chunks
- Review is still processing; wait and retry

### "No changes to review"

**Cause:** No uncommitted changes or already reviewed

**Solution:**

```bash
# Check git status
git status

# For committed changes, specify base
wsl bash -c 'cd /path/to/repo && ~/.local/bin/coderabbit --prompt-only --base main'
```

---

## Integration with AIOX Workflow

### Standard Development Flow

```
1. Developer works on story
   └── @dev implements changes

2. Pre-commit quality (Layer 1)
   └── Husky runs lint, tests

3. Ready for review
   └── @qa *review {story}
       └── CodeRabbit scans (Layer 2)
       └── Self-healing if needed
       └── QA gate decision

4. Push to remote
   └── @devops *pre-push
       └── CodeRabbit validates
       └── Quality gates pass

5. Create PR
   └── @devops *create-pr
       └── CodeRabbit gates PR creation
       └── Blocks if CRITICAL issues

6. Human review (Layer 3)
   └── Reviewers approve
```

### Story File Integration

CodeRabbit results are recorded in story files:

```markdown
## CodeRabbit Integration

### Story Type Analysis

| Attribute         | Value              | Rationale           |
| ----------------- | ------------------ | ------------------- |
| Type              | Feature            | New functionality   |
| Complexity        | Medium             | Multiple components |
| Test Requirements | Unit + Integration | API endpoints       |

### Agent Assignment

| Role      | Agent | Responsibility              |
| --------- | ----- | --------------------------- |
| Primary   | @dev  | Implementation              |
| Secondary | @qa   | CodeRabbit review + QA gate |
```

---

## Report Location

CodeRabbit reports are stored in:

```
docs/qa/coderabbit-reports/
├── {story-id}-{date}.md
├── {story-id}-{date}.md
└── ...
```

---

## Related Documentation

- [Quality Gates Specification](../../../.aiox-core/docs/standards/QUALITY-GATES-SPECIFICATION.md)
- [@qa Agent Definition](../../../.aiox-core/development/agents/qa.md)
- [@devops Agent Definition](../../../.aiox-core/development/agents/devops.md)
- [Pre-Push Quality Gate Task](../../../.aiox-core/development/tasks/github-devops-pre-push-quality-gate.md)

---

## External Resources

- [CodeRabbit Documentation](https://docs.coderabbit.ai/)
- [CodeRabbit CLI Reference](https://docs.coderabbit.ai/cli)
- [GitHub App Installation](https://github.com/apps/coderabbit-ai)

---

_Last Updated: 2026-01-28 | AIOX Framework Team_
