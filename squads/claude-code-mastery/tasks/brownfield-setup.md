# Task: Brownfield Project Claude Code Setup

**Task ID:** brownfield-setup
**Version:** 1.0
**Purpose:** Set up Claude Code in an existing brownfield project, respecting established conventions and protecting critical paths
**Orchestrator:** @project-integrator (Conduit)
**Mode:** Interactive (elicit: true)
**Quality Standard:** No existing workflow disrupted, deny rules protect critical paths, conventions documented

---

## Overview

This task differs from integrate-project in that it focuses on **discovering and respecting existing conventions** rather than establishing new ones. The brownfield approach prioritizes safety: protect what exists, teach Claude the project's rules, and integrate without disrupting established workflows.

```
INPUT (project_root + critical_paths)
    |
[PHASE 1: CODEBASE SCANNING]
    -> Discover frameworks, patterns, naming conventions
    -> Identify coding style from existing code
    -> Map project structure and architecture
    |
[PHASE 2: EXISTING TOOLING DETECTION]
    -> Detect CI/CD pipelines
    -> Detect linting, formatting, testing setup
    -> Identify deployment workflows
    |
[PHASE 3: CONVENTION-RESPECTING CLAUDE.MD]
    -> Generate CLAUDE.md that teaches Claude the project's ways
    -> Document coding patterns found in existing code
    -> Include project-specific terminology
    |
[PHASE 4: PATTERN RULES]
    -> Create rules that encode project-specific patterns
    -> Teach Claude about architectural decisions
    -> Document anti-patterns to avoid
    |
[PHASE 5: DENY RULES FOR CRITICAL PATHS]
    -> Identify files/directories that must not be modified
    -> Configure deny rules in settings.json
    -> Set up allow exceptions for specific operations
    |
[PHASE 6: WORKFLOW INTEGRATION]
    -> Configure hooks for existing CI/CD
    -> Set up pre-commit alignment with existing linters
    -> Ensure Claude follows the team's git workflow
    |
OUTPUT: Brownfield integration config + protected paths + convention docs
```

---

## Inputs

| Field | Type | Source | Required | Validation |
|-------|------|--------|----------|------------|
| project_root | string | Auto-detect | yes | Existing project with source code |
| critical_paths | array | User | no | Paths that must never be modified by AI |
| team_conventions_doc | string | User | no | Path to existing coding standards doc |
| deployment_branch | string | User | no | Branch used for deployment (default: main) |
| legacy_areas | array | User | no | Directories with legacy code to be careful with |

---

## Preconditions

1. Project exists with established codebase (not greenfield)
2. Project has existing commit history (to analyze conventions)
3. User can identify critical paths that need protection
4. Git is initialized and functional

---

## Phase 1: Codebase Scanning

**Goal:** Understand the project's established patterns without changing anything.

### Steps

1.1. Scan directory structure and build a source tree:

```
src/
  components/     -> React components (functional, arrow functions)
  services/       -> API service layer (class-based)
  utils/          -> Utility functions (pure functions)
  hooks/          -> Custom React hooks (use* naming)
  types/          -> TypeScript type definitions
```

1.2. Analyze coding patterns from existing files:
   - Import style (named vs default, absolute vs relative)
   - Component patterns (functional vs class, hooks usage)
   - Error handling patterns (try/catch vs error boundaries)
   - Naming conventions (camelCase, PascalCase, kebab-case for files)
   - Comment style and density

1.3. Detect architectural patterns:
   - State management approach
   - API integration patterns
   - Routing structure
   - Authentication flow

1.4. Build a pattern inventory:

```yaml
patterns:
  imports: "absolute with @ alias"
  components: "functional with arrow functions"
  state: "Zustand stores in src/stores/"
  api: "axios instances in src/services/"
  naming:
    files: "kebab-case"
    components: "PascalCase"
    functions: "camelCase"
    constants: "UPPER_SNAKE_CASE"
```

---

## Phase 2: Existing Tooling Detection

**Goal:** Map all existing development tools and workflows.

### Steps

2.1. Check for CI/CD:
   - `.github/workflows/*.yml` (GitHub Actions)
   - `.gitlab-ci.yml` (GitLab CI)
   - `Jenkinsfile` (Jenkins)
   - `.circleci/` (CircleCI)
   - `vercel.json` (Vercel)
   - `netlify.toml` (Netlify)

2.2. Check for code quality tools:
   - `.eslintrc*` / `eslint.config.*` (ESLint)
   - `.prettierrc*` (Prettier)
   - `.stylelintrc*` (Stylelint)
   - `.editorconfig` (EditorConfig)
   - `commitlint.config.*` (Commit message linting)

2.3. Check for testing:
   - `jest.config.*` (Jest)
   - `vitest.config.*` (Vitest)
   - `cypress.config.*` (Cypress)
   - `playwright.config.*` (Playwright)

2.4. Document existing scripts from package.json:

```yaml
scripts:
  dev: "next dev"
  build: "next build"
  test: "jest --coverage"
  lint: "eslint src/"
  format: "prettier --write src/"
```

---

## Phase 3: Convention-Respecting CLAUDE.md

**Goal:** Create CLAUDE.md that teaches Claude to write code that looks like the existing codebase.

### Steps

3.1. Write CLAUDE.md with emphasis on existing patterns:

```markdown
# {Project Name}

## Code Standards (from existing codebase)
- Import style: {detected pattern}
- Component pattern: {detected pattern}
- File naming: {detected pattern}
- Error handling: {detected pattern}

## Commands
- `{npm run dev}` -- Start development server
- `{npm test}` -- Run tests
- `{npm run lint}` -- Run linter

## Architecture
{Brief description of project structure}

## Critical Rules
- NEVER modify files in {critical_paths}
- ALWAYS follow existing patterns in neighboring files
- When in doubt, check how similar code is written in the codebase
```

3.2. If a team conventions document exists, incorporate its rules.
3.3. Keep under 200 lines. Move details to rules files.

---

## Phase 4: Pattern Rules

**Goal:** Create rules that encode project-specific knowledge.

### Steps

4.1. Create `.claude/rules/` with pattern files:

| Rule | Content |
|------|---------|
| `code-style.md` | Naming conventions, import patterns, file structure |
| `architecture.md` | Layer boundaries, data flow, dependency rules |
| `anti-patterns.md` | Things to never do in this codebase |
| `legacy-areas.md` | Special handling for legacy code sections |

4.2. Use path-based activation for context-specific rules:

```markdown
---
paths:
  - "src/legacy/**"
---
# Legacy Code Rules
- Do NOT refactor unless explicitly asked
- Maintain existing patterns even if suboptimal
- Add tests before making any changes
```

---

## Phase 5: Deny Rules for Critical Paths

**Goal:** Protect files and directories that AI should not modify.

### Common Critical Paths

| Path Pattern | Reason |
|-------------|--------|
| `.env*` | Secrets and credentials |
| `**/migrations/**` | Database migrations (run, don't edit) |
| `docker-compose.prod.yml` | Production infrastructure |
| `*.lock` | Lock files (managed by package managers) |
| `.github/workflows/**` | CI/CD pipelines |
| `infrastructure/**` | Infrastructure-as-code |

### Steps

5.1. Collect critical paths from user and auto-detection.
5.2. Configure deny rules in `.claude/settings.json`:

```json
{
  "permissions": {
    "deny": [
      "Edit(.env*)",
      "Write(.env*)",
      "Edit(**/migrations/**)",
      "Edit(docker-compose.prod.yml)",
      "Edit(.github/workflows/**)"
    ],
    "allow": [
      "Read(**)"
    ]
  }
}
```

5.3. Verify deny rules do not block legitimate development work.

---

## Phase 6: Workflow Integration

**Goal:** Make Claude Code work within the project's existing workflows.

### Steps

6.1. Configure pre-tool-use hooks to align with existing linters:
   - After writing code, suggest running the project's lint command
   - After modifying tests, suggest running the project's test command

6.2. Align git behavior with team conventions:
   - Detect commit message format from history (conventional commits, etc.)
   - Document branch naming conventions
   - Note any PR template or review requirements

6.3. Set up notification hooks for critical operations:
   - Alert when modifying shared configuration files
   - Alert when adding new dependencies

---

## Output Format

```yaml
brownfield_setup_result:
  project_analysis:
    language: "TypeScript"
    framework: "Next.js 14"
    patterns_detected: 12
    tooling_detected: ["ESLint", "Prettier", "Jest", "GitHub Actions"]
  files_created:
    - "CLAUDE.md"
    - ".claude/settings.json"
    - ".claude/rules/code-style.md"
    - ".claude/rules/architecture.md"
    - ".claude/rules/anti-patterns.md"
  critical_paths_protected: 5
  deny_rules_configured: 5
  existing_workflows_integrated: true
  disruption_risk: "none"
  overall_status: "PASS"
```

---

## Veto Conditions

| Condition | Action |
|-----------|--------|
| Project has no existing source code | HALT -- use integrate-project for greenfield |
| CLAUDE.md exists and is manually maintained | WARN -- ask before overwriting |
| Cannot detect any coding patterns (empty repo) | HALT -- nothing to learn from |
| Critical paths list is empty and project is large | WARN -- strongly recommend identifying critical paths |
| Existing .claude/settings.json has deny rules | MERGE -- add to existing rules, do not replace |
