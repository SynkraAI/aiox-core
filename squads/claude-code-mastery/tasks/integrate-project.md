# Task: Integrate Claude Code into Existing Project

**Task ID:** integrate-project
**Version:** 1.0
**Purpose:** Set up Claude Code infrastructure in an existing project with tailored configuration
**Orchestrator:** @project-integrator (Conduit)
**Mode:** Interactive (elicit: true)
**Quality Standard:** Integration passes smoke test, all config files valid, CLAUDE.md under 200 lines

---

## Overview

This task integrates Claude Code into an existing project by detecting the project's tech stack, generating appropriate configuration, setting up rules, hooks, and MCP servers. Follows Unix philosophy: do one thing well, compose small tools.

```
INPUT (project_root)
    |
[PHASE 1: PROJECT DETECTION]
    -> Scan for package.json, requirements.txt, go.mod, etc.
    -> Identify frameworks, languages, and patterns
    -> Detect existing CI/CD, linting, testing setup
    |
[PHASE 2: CLAUDE.MD GENERATION]
    -> Generate CLAUDE.md tailored to project
    -> Include code standards, testing, git conventions
    -> Keep under 200 lines
    |
[PHASE 3: SETTINGS CONFIGURATION]
    -> Create .claude/settings.json
    -> Configure deny/allow rules for critical paths
    -> Set up permissions appropriate to project
    |
[PHASE 4: RULES SETUP]
    -> Create .claude/rules/ directory
    -> Write path-based contextual rules
    -> Configure auto-loading behavior
    |
[PHASE 5: HOOKS CONFIGURATION]
    -> Identify project workflow integration points
    -> Set up pre-tool-use guards if needed
    -> Configure notification hooks
    |
[PHASE 6: MCP SETUP]
    -> Identify useful MCP servers for the stack
    -> Configure project-specific MCPs
    -> Validate tool availability
    |
[PHASE 7: AGENTS SETUP]
    -> Create project-specific subagent definitions
    -> Configure agents for project's domain
    -> Test agent execution
    |
[PHASE 8: SMOKE TEST]
    -> Verify all config files parse correctly
    -> Test Claude Code can read and understand the project
    -> Validate rules load in correct contexts
    |
OUTPUT: Complete Claude Code integration + smoke test results
```

---

## Inputs

| Field | Type | Source | Required | Validation |
|-------|------|--------|----------|------------|
| project_root | string | Auto-detect | yes | Valid directory with source code |
| project_name | string | Auto or user | no | Human-readable project name |
| primary_language | string | Auto-detect | no | Main programming language |
| team_size | string | User | no | solo / small / medium / large |
| existing_ci | boolean | Auto-detect | no | Whether CI/CD is already configured |

---

## Preconditions

1. Project directory exists with source code
2. Claude Code CLI is installed
3. User has write access to project directory
4. Git is initialized in the project (or will be)

---

## Phase 1: Project Detection

**Goal:** Understand the project's tech stack and conventions.

### Detection Signals

| File | Indicates |
|------|-----------|
| `package.json` | Node.js project -- check scripts, dependencies |
| `tsconfig.json` | TypeScript usage |
| `next.config.*` | Next.js framework |
| `requirements.txt` / `pyproject.toml` | Python project |
| `go.mod` | Go project |
| `Cargo.toml` | Rust project |
| `.eslintrc*` / `eslint.config.*` | ESLint configured |
| `.prettierrc*` | Prettier configured |
| `jest.config.*` / `vitest.config.*` | Test framework |
| `Dockerfile` / `docker-compose.yml` | Containerized |
| `.github/workflows/` | GitHub Actions CI/CD |
| `supabase/` | Supabase database |

### Steps

1.1. Scan project root for all detection signals above.
1.2. Read `package.json` (if exists) for scripts and dependencies.
1.3. Identify the project structure pattern (monorepo, single-app, library).
1.4. Detect existing code formatting and linting rules.
1.5. Document findings:

```yaml
detection:
  language: "TypeScript"
  framework: "Next.js 14"
  package_manager: "npm"
  test_framework: "Jest"
  linter: "ESLint"
  formatter: "Prettier"
  ci: "GitHub Actions"
  database: "Supabase"
  structure: "single-app"
```

---

## Phase 2: CLAUDE.md Generation

**Goal:** Create a concise, effective CLAUDE.md file.

### Guidelines

- Keep under 200 lines (auto-memory compatibility)
- Focus on what Claude needs to know, not general documentation
- Include: code standards, testing commands, git conventions, key architecture decisions
- Use managed sections (`<!-- AIOX-MANAGED-START -->`) for auto-updatable content

### Steps

2.1. Generate CLAUDE.md with these sections:
   - Project overview (2-3 sentences)
   - Tech stack summary (table)
   - Code standards (from detected linter/formatter config)
   - Testing commands (from package.json scripts)
   - Git conventions (from existing commit history)
   - Key directories and their purposes
   - Common commands reference

2.2. Verify line count is under 200.
2.3. If over 200, move detailed sections to `.claude/rules/` files.

---

## Phase 3: Settings Configuration

**Goal:** Create `.claude/settings.json` with appropriate rules.

### Steps

3.1. Create `.claude/settings.json` with:

```json
{
  "permissions": {
    "allow": [],
    "deny": []
  }
}
```

3.2. Add deny rules for sensitive paths:
   - `.env*` files (secrets)
   - `credentials*` files
   - `**/node_modules/**`
   - Production config files

3.3. Add allow rules for common development operations:
   - Build commands
   - Test commands
   - Lint/format commands

---

## Phase 4: Rules Setup

**Goal:** Create contextual rules that load based on file paths.

### Steps

4.1. Create `.claude/rules/` directory.
4.2. Create rules based on project structure:

| Rule File | Activates When | Content |
|-----------|----------------|---------|
| `frontend.md` | Editing `src/components/**` | Component patterns, styling conventions |
| `api.md` | Editing `src/api/**` or `pages/api/**` | API patterns, error handling |
| `testing.md` | Editing `**/*.test.*` | Testing conventions, mock patterns |
| `database.md` | Editing `supabase/**` or `prisma/**` | Migration patterns, schema rules |

4.3. Each rule file should use frontmatter to specify activation paths:

```markdown
---
paths:
  - "src/components/**"
---
# Component Rules
...
```

---

## Phase 5: Hooks Configuration

**Goal:** Integrate Claude Code hooks with the project's workflow.

### Steps

5.1. Assess which hooks would benefit the project:
   - `PreToolUse` -- guard against modifying protected files
   - `PostToolUse` -- log tool usage for audit
   - `Notification` -- alert on specific events
5.2. Create hooks in `.claude/hooks/` if project needs custom behavior.
5.3. Register hooks in `.claude/settings.json`.

---

## Phase 6: MCP Setup

**Goal:** Configure MCP servers relevant to the project.

### Steps

6.1. Based on detected tech stack, recommend MCP servers.
6.2. Delegate to mcp-workflow task for full configuration.
6.3. Document configured MCPs in CLAUDE.md.

---

## Phase 7: Agents Setup

**Goal:** Create project-specific subagent definitions.

### Steps

7.1. Based on project complexity, create agents:
   - For simple projects: no custom agents needed
   - For medium projects: 1-2 specialized agents (e.g., code-reviewer, test-writer)
   - For large projects: full agent team with topology

7.2. Create agent files in `.claude/agents/`.
7.3. Delegate to create-agent-definition task for each agent.

---

## Phase 8: Smoke Test

**Goal:** Verify the integration works end-to-end.

### Steps

8.1. Verify all config files are valid JSON/YAML.
8.2. Verify CLAUDE.md is under 200 lines and contains key sections.
8.3. Test that rules load when editing relevant files.
8.4. Test that MCP servers connect (if configured).
8.5. Run a simple Claude Code command to verify everything works:
   - Ask Claude to read a source file and explain it
   - Verify it follows the conventions in CLAUDE.md

---

## Output Format

```yaml
integration_result:
  project_type: "Next.js TypeScript"
  files_created:
    - "CLAUDE.md"
    - ".claude/settings.json"
    - ".claude/rules/frontend.md"
    - ".claude/rules/testing.md"
  mcp_configured: ["context7"]
  agents_created: []
  smoke_test:
    config_valid: true
    rules_load: true
    mcp_connected: true
    claude_responds: true
  overall_status: "PASS"
```

---

## Veto Conditions

| Condition | Action |
|-----------|--------|
| Project root has no source code files | HALT -- nothing to integrate with |
| CLAUDE.md already exists and has managed sections | WARN -- merge instead of overwrite |
| .claude/settings.json exists with custom rules | WARN -- merge, do not overwrite |
| No write access to project directory | HALT -- cannot create config files |
| Project uses unsupported language (no detection signals) | WARN -- generate generic CLAUDE.md |
