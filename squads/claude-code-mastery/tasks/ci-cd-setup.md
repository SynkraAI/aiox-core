# Task: Claude Code CI/CD Pipeline Setup

**Task ID:** ci-cd-setup
**Version:** 1.0
**Purpose:** Configure Claude Code for headless execution in CI/CD pipelines (PR review, code generation, testing)
**Orchestrator:** @project-integrator (Conduit)
**Mode:** Interactive (elicit: true)
**Quality Standard:** Pipeline runs successfully in headless mode, safety limits configured, costs controlled

---

## Overview

This task sets up Claude Code to run in CI/CD pipelines using headless mode (`claude -p`). It covers GitHub Actions integration, API key management, output format configuration, and safety limits to prevent runaway costs.

```
INPUT (ci_platform + integration_pattern + budget)
    |
[PHASE 1: INTEGRATION PATTERN SELECTION]
    -> Choose what Claude does in CI (review, generate, test)
    -> Define trigger events (PR open, push, comment)
    -> Set scope and limitations
    |
[PHASE 2: HEADLESS MODE CONFIGURATION]
    -> Configure claude -p for non-interactive use
    -> Set --output-format for machine-readable output
    -> Configure --max-turns for cost control
    |
[PHASE 3: GITHUB ACTIONS WORKFLOW]
    -> Create .github/workflows/claude-*.yml
    -> Configure trigger events
    -> Set up job steps
    |
[PHASE 4: API KEY AND ENVIRONMENT]
    -> Set up ANTHROPIC_API_KEY as secret
    -> Configure environment variables
    -> Set up caching for Claude Code CLI
    |
[PHASE 5: OUTPUT FORMAT AND PARSING]
    -> Configure --output-format stream-json
    -> Parse output for PR comments
    -> Handle error output
    |
[PHASE 6: SAFETY LIMITS]
    -> Set --max-turns to cap execution
    -> Configure cost budget per run
    -> Set up alerting for anomalies
    |
OUTPUT: CI/CD workflow files + secrets docs + safety config
```

---

## Inputs

| Field | Type | Source | Required | Validation |
|-------|------|--------|----------|------------|
| ci_platform | enum | User | yes | github-actions / gitlab-ci / other |
| integration_pattern | enum | User | yes | pr-review / code-gen / testing / custom |
| max_cost_per_run | string | User | no | Budget cap (default: $1.00) |
| trigger_events | array | User | no | When to run (default: pull_request) |
| claude_version | string | User | no | Pin to specific version or "latest" |

---

## Preconditions

1. GitHub repository with Actions enabled (or equivalent CI platform)
2. Anthropic API key available
3. Repository has existing CI/CD (recommended, not required)
4. Understanding of which tasks Claude should automate

---

## Phase 1: Integration Pattern Selection

**Goal:** Choose the right CI integration pattern.

### Available Patterns

| Pattern | Trigger | What Claude Does | Typical Cost |
|---------|---------|-----------------|--------------|
| **PR Review** | `pull_request` | Reviews code changes, posts comments | $0.10-0.50/PR |
| **Code Generation** | `workflow_dispatch` or comment | Generates code from spec/issue | $0.50-2.00/run |
| **Test Generation** | `pull_request` | Generates tests for new code | $0.20-1.00/PR |
| **Documentation** | `push` to main | Updates docs for changed code | $0.10-0.30/push |
| **Issue Triage** | `issues.opened` | Categorizes and labels issues | $0.05-0.10/issue |

### Steps

1.1. Select one or more patterns based on team needs.
1.2. Define the specific prompt for each pattern.
1.3. Set expected output format (comment, file, label).

---

## Phase 2: Headless Mode Configuration

**Goal:** Configure Claude Code for non-interactive execution.

### Headless Mode Basics

```bash
# Basic headless execution
claude -p "Review the changes in this PR for bugs and security issues"

# With output format
claude -p "..." --output-format stream-json

# With turn limit
claude -p "..." --max-turns 10

# With specific model
claude -p "..." --model sonnet

# With system prompt from file
claude -p "..." --system-prompt "$(cat .claude/ci-system-prompt.md)"
```

### Key Flags

| Flag | Purpose | Recommended |
|------|---------|-------------|
| `-p` | Non-interactive mode (read from argument) | Always use in CI |
| `--output-format stream-json` | Machine-parseable JSON output | For automated processing |
| `--output-format text` | Plain text output | For simple logging |
| `--max-turns` | Limit tool calls | Always set (default: 10) |
| `--model` | Select model | sonnet for cost, opus for quality |
| `--no-telemetry` | Disable telemetry | Recommended for CI |

### Steps

2.1. Compose the headless command for each integration pattern.
2.2. Create a system prompt file for CI context (`.claude/ci-system-prompt.md`).
2.3. Test the command locally before adding to CI.

---

## Phase 3: GitHub Actions Workflow

**Goal:** Create the CI workflow file.

### GitHub Actions Template

```yaml
name: Claude Code Review
on:
  pull_request:
    types: [opened, synchronize]

permissions:
  contents: read
  pull-requests: write

jobs:
  claude-review:
    runs-on: ubuntu-latest
    timeout-minutes: 10
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Install Claude Code
        run: npm install -g @anthropic-ai/claude-code@latest

      - name: Run Claude Review
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
        run: |
          DIFF=$(git diff origin/main...HEAD)
          claude -p "Review these changes for bugs, security issues, and code quality. Be concise. Changes: $DIFF" \
            --output-format text \
            --max-turns 10 \
            --model sonnet \
            > review-output.txt

      - name: Post Review Comment
        uses: actions/github-script@v7
        with:
          script: |
            const fs = require('fs');
            const review = fs.readFileSync('review-output.txt', 'utf8');
            await github.rest.issues.createComment({
              owner: context.repo.owner,
              repo: context.repo.repo,
              issue_number: context.issue.number,
              body: `## Claude Code Review\n\n${review}`
            });
```

### Steps

3.1. Create `.github/workflows/claude-review.yml` (or equivalent).
3.2. Configure trigger events.
3.3. Set appropriate `timeout-minutes` (10 for reviews, 30 for generation).
3.4. Add `permissions` block for required GitHub token scopes.

---

## Phase 4: API Key and Environment

**Goal:** Securely configure API access.

### Steps

4.1. Add `ANTHROPIC_API_KEY` as a repository secret:
   - Go to Settings > Secrets and variables > Actions
   - Add `ANTHROPIC_API_KEY` with the API key value

4.2. Configure additional environment variables if needed:

```yaml
env:
  ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
  CLAUDE_MODEL: "sonnet"
  CLAUDE_MAX_TURNS: "10"
```

4.3. Security considerations:
   - NEVER log the API key
   - NEVER pass the key as a command argument (use env var)
   - Use repository secrets, not environment variables in workflow files
   - Consider using OIDC for keyless authentication if available

---

## Phase 5: Output Format and Parsing

**Goal:** Configure output for machine consumption.

### Stream JSON Format

When using `--output-format stream-json`, output is newline-delimited JSON:

```json
{"type": "assistant", "content": "Here is my analysis..."}
{"type": "tool_use", "tool": "Read", "input": {"file_path": "..."}}
{"type": "tool_result", "content": "..."}
{"type": "assistant", "content": "Based on reading the file..."}
```

### Steps

5.1. Choose output format based on integration pattern:
   - PR review -> `text` (for posting as comment)
   - Code generation -> `stream-json` (for parsing file changes)
   - Testing -> `text` (for test result summary)

5.2. Create a parsing script if using `stream-json`:

```bash
# Extract final assistant message
claude -p "..." --output-format stream-json | \
  jq -s '[.[] | select(.type == "assistant")] | last | .content'
```

5.3. Handle error cases:
   - Empty output -> Claude could not process
   - Timeout -> increase timeout or reduce scope
   - Rate limit -> add retry logic with backoff

---

## Phase 6: Safety Limits

**Goal:** Prevent runaway costs and unintended behavior.

### Safety Configuration

| Limit | Value | Purpose |
|-------|-------|---------|
| `--max-turns` | 10 (review), 25 (generation) | Cap tool call iterations |
| `timeout-minutes` | 10 (review), 30 (generation) | GitHub Actions job timeout |
| Max diff size | 5000 lines | Skip very large PRs |
| Cost per run | $1.00 default | Alert if exceeded |
| Runs per day | 50 | Prevent abuse on high-activity repos |

### Steps

6.1. Set `--max-turns` for every `claude -p` invocation.
6.2. Add a diff size check before running Claude:

```bash
DIFF_LINES=$(git diff origin/main...HEAD | wc -l)
if [ "$DIFF_LINES" -gt 5000 ]; then
  echo "PR too large for automated review ($DIFF_LINES lines)"
  exit 0
fi
```

6.3. Configure job concurrency to prevent parallel runs:

```yaml
concurrency:
  group: claude-review-${{ github.event.pull_request.number }}
  cancel-in-progress: true
```

6.4. Set up cost monitoring (check Anthropic usage dashboard).

---

## Output Format

```yaml
ci_cd_setup_result:
  platform: "github-actions"
  integration_pattern: "pr-review"
  files_created:
    - ".github/workflows/claude-review.yml"
    - ".claude/ci-system-prompt.md"
  secrets_required:
    - "ANTHROPIC_API_KEY"
  safety_limits:
    max_turns: 10
    timeout_minutes: 10
    max_diff_lines: 5000
  estimated_cost_per_run: "$0.10-0.50"
  tested: true
  overall_status: "PASS"
```

---

## Veto Conditions

| Condition | Action |
|-----------|--------|
| No CI platform access (cannot create workflows) | HALT -- need admin access |
| API key not available | HALT -- cannot configure without key |
| Repository is public and key would be exposed | HALT -- ensure secrets are properly configured |
| Cost budget is zero | HALT -- headless mode incurs API costs |
| CI platform not supported (no GitHub Actions, no GitLab CI) | HALT -- manual setup required |
