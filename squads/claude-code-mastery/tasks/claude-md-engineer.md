# Task: Engineer Optimal CLAUDE.md

**Task ID:** claude-md-engineer
**Version:** 1.0
**Purpose:** Engineer a high-quality, concise CLAUDE.md file optimized for Claude Code's context loading and auto-memory
**Orchestrator:** @project-integrator (Conduit)
**Mode:** Interactive (elicit: true)
**Quality Standard:** Under 200 lines, all sections actionable, no filler content, passes self-review

---

## Overview

CLAUDE.md is the most important file for Claude Code productivity. A well-engineered CLAUDE.md teaches Claude how to work in the project with minimal tokens. This task creates one from scratch or rewrites an existing one using context engineering principles.

```
INPUT (project_root + [existing_claude_md])
    |
[PHASE 1: PROJECT ANALYSIS]
    -> Analyze tech stack and project structure
    -> Identify critical patterns and conventions
    -> Determine what Claude needs to know
    |
[PHASE 2: CODE STANDARDS SECTION]
    -> Extract coding style from existing code
    -> Define naming conventions
    -> Set import and export patterns
    |
[PHASE 3: TESTING REQUIREMENTS]
    -> Identify test framework and patterns
    -> Define testing commands
    -> Set coverage expectations
    |
[PHASE 4: GIT AND PR CONVENTIONS]
    -> Extract commit message format from history
    -> Document branch naming conventions
    -> Note PR requirements
    |
[PHASE 5: PROJECT-SPECIFIC GUIDANCE]
    -> Document key architecture decisions
    -> List critical files and their purposes
    -> Add tool-specific guidance
    |
[PHASE 6: OPTIMIZATION]
    -> Trim to under 200 lines
    -> Remove redundant content
    -> Verify every line is actionable
    |
[PHASE 7: MANAGED SECTIONS]
    -> Add managed section markers for auto-updates
    -> Separate stable content from dynamic content
    -> Document update strategy
    |
[PHASE 8: VALIDATION]
    -> Line count check
    -> Content review for actionability
    -> Test with sample Claude interaction
    |
OUTPUT: Optimized CLAUDE.md file
```

---

## Inputs

| Field | Type | Source | Required | Validation |
|-------|------|--------|----------|------------|
| project_root | string | Auto-detect | yes | Valid project directory |
| existing_claude_md | string | Auto-detect | no | Path to existing CLAUDE.md if present |
| project_name | string | User or auto | no | Human-readable project name |
| team_notes | string | User | no | Any team conventions not captured in code |
| style | enum | User | no | minimal / standard / comprehensive (default: standard) |

---

## Preconditions

1. Project directory exists with source code
2. Understanding of what Claude Code needs from CLAUDE.md
3. Access to project's existing code for pattern extraction

---

## Phase 1: Project Analysis

**Goal:** Determine what Claude must know to be productive in this project.

### Information Hierarchy (most important first)

1. **What to run** -- Build, test, lint commands
2. **How to write code** -- Patterns, conventions, style
3. **Where things are** -- Key directories, entry points
4. **What not to do** -- Anti-patterns, forbidden operations
5. **How to integrate** -- Git workflow, PR process

### Steps

1.1. Detect tech stack (package.json, tsconfig.json, etc.).
1.2. Identify the 5-10 most important patterns by analyzing:
   - Most frequently used patterns across files
   - Patterns that are project-specific (not framework defaults)
   - Patterns that Claude commonly gets wrong
1.3. List what Claude needs to know vs what it already knows:
   - Claude already knows React, TypeScript, common frameworks
   - Claude does NOT know your project's custom patterns, aliases, conventions

---

## Phase 2: Code Standards Section

**Goal:** Define how code should be written in this project.

### Steps

2.1. Analyze 5-10 representative source files for patterns.
2.2. Document only patterns that deviate from defaults:

```markdown
## Code Standards
- Use named exports (not default exports)
- Import with @ alias: `import { Button } from '@/components/Button'`
- Error handling: always use custom AppError class
- State: Zustand stores in src/stores/, one file per domain
```

2.3. Keep this section under 20 lines.
2.4. If standards are complex, create `.claude/rules/code-standards.md` and reference it.

---

## Phase 3: Testing Requirements

**Goal:** Tell Claude exactly how to test in this project.

### Steps

3.1. Extract test configuration from project files.
3.2. Document the essential testing commands:

```markdown
## Testing
- Run all tests: `npm test`
- Run specific: `npm test -- --testPathPattern=auth`
- Coverage: `npm test -- --coverage`
- Watch mode: `npm test -- --watch`
- E2E: `npx playwright test`
```

3.3. Document testing patterns:
   - Where test files live (co-located vs separate directory)
   - Naming convention (*.test.ts vs *.spec.ts)
   - Mock patterns specific to this project

3.4. Keep this section under 15 lines.

---

## Phase 4: Git and PR Conventions

**Goal:** Teach Claude the project's git workflow.

### Steps

4.1. Analyze recent commit messages for format:

```bash
git log --oneline -20
```

4.2. Document the conventions:

```markdown
## Git Conventions
- Commits: `type(scope): description` (conventional commits)
- Branch naming: `feature/`, `fix/`, `chore/`
- PR: squash merge, reference issue number
```

4.3. Keep this section under 10 lines.

---

## Phase 5: Project-Specific Guidance

**Goal:** Document what makes this project unique.

### Steps

5.1. Identify key architecture decisions:

```markdown
## Architecture
- Monorepo with packages/ directory
- API routes in src/app/api/ (Next.js App Router)
- Database: Supabase with RLS policies
- Auth: Supabase Auth with JWT
```

5.2. List critical files that Claude should know about:

```markdown
## Key Files
- `src/lib/supabase.ts` -- Supabase client singleton
- `src/middleware.ts` -- Auth middleware for all routes
- `src/types/database.ts` -- Auto-generated DB types
```

5.3. Add tool-specific guidance if using non-standard tools.
5.4. Keep combined section under 30 lines.

---

## Phase 6: Optimization

**Goal:** Trim to maximum impact per token.

### Optimization Rules

1. **Every line must be actionable** -- remove "this project uses..." in favor of "use..."
2. **No tutorials** -- Claude knows how React works, don't explain it
3. **No filler** -- remove "please ensure", "make sure to", just state the rule
4. **Commands over descriptions** -- `npm test` over "run the test suite using npm"
5. **Tables over paragraphs** -- structured data is faster to parse
6. **Defer to rules** -- move detailed patterns to `.claude/rules/` files

### Steps

6.1. Review every line and ask: "Would removing this cause Claude to make a mistake?"
   - If no, remove it
   - If yes, keep it
6.2. Convert paragraphs to bullet points or tables.
6.3. Move any section over 30 lines to a rules file.
6.4. Target final length:
   - Minimal style: 50-80 lines
   - Standard style: 100-150 lines
   - Comprehensive style: 150-200 lines

---

## Phase 7: Managed Sections

**Goal:** Enable auto-updating of dynamic content.

### Managed Section Pattern

```markdown
<!-- MANAGED-START: tech-stack -->
## Tech Stack
- Next.js 14, React 18, TypeScript 5
- Tailwind CSS, shadcn/ui
- Supabase (auth + database)
<!-- MANAGED-END: tech-stack -->
```

### Steps

7.1. Identify sections that change frequently (tech stack versions, commands).
7.2. Wrap them in managed section markers.
7.3. Identify sections that are stable (architecture, conventions).
7.4. Leave stable sections as plain markdown.

---

## Phase 8: Validation

**Goal:** Verify the CLAUDE.md is effective.

### Validation Checklist

- [ ] Total line count under 200
- [ ] Every section has at least one actionable instruction
- [ ] No section exceeds 30 lines
- [ ] All referenced file paths exist
- [ ] All referenced commands exist in package.json
- [ ] No duplicate information across sections
- [ ] No tutorial-style explanations
- [ ] Managed sections properly formatted

### Steps

8.1. Run the validation checklist.
8.2. Test with a sample Claude interaction:
   - Ask Claude to create a new component -- does it follow the patterns?
   - Ask Claude to add a test -- does it use the right framework?
   - Ask Claude to commit -- does it use the right format?
8.3. If any test fails, identify the missing instruction and add it.

---

## Output Format

```yaml
claude_md_engineer_result:
  file: "CLAUDE.md"
  total_lines: 142
  style: "standard"
  sections:
    - name: "Project Overview"
      lines: 5
    - name: "Code Standards"
      lines: 18
    - name: "Testing"
      lines: 12
    - name: "Git Conventions"
      lines: 8
    - name: "Architecture"
      lines: 15
    - name: "Key Files"
      lines: 10
    - name: "Commands"
      lines: 8
  managed_sections: 2
  rules_extracted_to:
    - ".claude/rules/code-standards.md"
    - ".claude/rules/architecture.md"
  validation:
    line_count: "pass"
    actionability: "pass"
    references: "pass"
    sample_test: "pass"
  overall_status: "PASS"
```

---

## Veto Conditions

| Condition | Action |
|-----------|--------|
| CLAUDE.md exceeds 200 lines after optimization | HALT -- continue trimming or extract to rules |
| No source code in project (nothing to analyze) | HALT -- no patterns to document |
| Existing CLAUDE.md has custom managed sections from another tool | WARN -- preserve existing markers |
| Project uses language/framework with no detected conventions | WARN -- generate minimal CLAUDE.md |
| Every line removed in optimization was marked as necessary | WARN -- project may genuinely need 200+ lines, use rules files |
