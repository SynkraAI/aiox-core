# resolve-github-issue.md

**Task**: Investigate and Resolve GitHub Issue

**Purpose**: End-to-end workflow for investigating, planning, implementing, testing, and closing a GitHub issue following project standards (Constitution, Story-Driven, Quality Gates).

**When to use**: After selecting an issue from triage, via `@devops *resolve-issue {number}` or user request like "resolve issue #138".

## Execution Modes

**Choose your execution mode:**

### 1. YOLO Mode - Fast, Autonomous (0-1 prompts)
- Investigate, fix, test, commit, push, close — minimal prompts
- Decisions logged but not confirmed
- **Best for:** Quick fixes (XS/S effort), well-defined bugs, chore tasks

### 2. Interactive Mode - Balanced, Educational (5-10 prompts) **[DEFAULT]**
- Checkpoints at investigation, plan, implementation, and push
- User confirms approach before major changes
- **Best for:** Most issues, medium complexity

### 3. Pre-Flight Planning - Comprehensive Upfront Planning
- Full investigation + research + detailed plan BEFORE any code
- User approves plan, then autonomous execution
- **Best for:** Complex issues, multi-file changes, unknown root cause

**Parameter:** `mode` (optional, default: `interactive`)

---

## Task Definition (AIOS Task Format V1.0)

```yaml
task: resolveGithubIssue()
responsavel: Gage (Operator)
responsavel_type: Agente
atomic_layer: Organism

**Entrada:**
- campo: issue_number
  tipo: number
  origem: User Input
  obrigatorio: true
  validacao: Must be a valid open GitHub issue number

- campo: mode
  tipo: string
  origem: User Input
  obrigatorio: false
  validacao: yolo|interactive|pre-flight
  default: interactive

- campo: branch
  tipo: string
  origem: Auto-detect or User Input
  obrigatorio: false
  validacao: Valid git branch name
  default: Current branch

**Saida:**
- campo: resolution_summary
  tipo: object
  destino: GitHub Issue Comment + User Display
  persistido: true
  formato: |
    { issue: number, commit: sha, files_changed: number, tests: pass/fail, closed: boolean }

- campo: commit_sha
  tipo: string
  destino: Git
  persistido: true
```

---

## Pre-Conditions

**Purpose:** Validate prerequisites BEFORE task execution (blocking)

**Checklist:**

```yaml
pre-conditions:
  - [ ] GitHub CLI authenticated (gh auth status)
    tipo: pre-condition
    blocker: true
    error_message: "GitHub CLI not authenticated. Run: gh auth login"

  - [ ] Issue exists and is open
    tipo: pre-condition
    blocker: true
    validacao: |
      Run: gh issue view {issue_number} --json state
      Must return state: "OPEN"
    error_message: "Issue #{issue_number} not found or already closed"

  - [ ] Working tree is clean (no uncommitted changes)
    tipo: pre-condition
    blocker: false
    validacao: |
      Run: git status --porcelain
      If dirty: warn user, suggest stash or commit first
    error_message: "Uncommitted changes detected. Commit or stash before proceeding."

  - [ ] On appropriate branch
    tipo: pre-condition
    blocker: false
    validacao: |
      Check current branch with: git branch --show-current
      Warn if on main/master (suggest creating feature branch)
```

---

## Workflow Steps

### Phase 1: Investigate (understand the issue)

**Goal:** Fully understand the problem before writing any code.

```yaml
steps:
  1_fetch_issue:
    command: gh issue view {issue_number} --json title,body,labels,comments,assignees
    output: issue_data
    purpose: Get full issue details including comments with context

  2_analyze_issue:
    action: Read issue body and comments carefully
    extract:
      - What is the reported problem?
      - What is the expected behavior?
      - What is the actual behavior?
      - Are there reproduction steps?
      - Are there error messages or logs?
      - Which files/modules are likely affected?
    output: issue_analysis

  3_codebase_investigation:
    action: Search codebase for affected code
    tools:
      - Grep: Search for keywords from issue (error messages, function names, file paths)
      - Glob: Find related files by pattern
      - Read: Read suspect files to understand current behavior
    output: affected_files[]
    purpose: Confirm root cause and scope of change

  4_research_if_needed:
    condition: Issue involves external standards, APIs, or unfamiliar technology
    action: |
      Use /tech-search skill for deep research:
        - External format specifications (e.g., Copilot .agent.md format)
        - API documentation changes
        - Best practices for the technology involved
      Research output saved to docs/research/{date}-{slug}/
    output: research_findings (optional)
    examples:
      - Issue #138: Required /tech-search for GitHub Copilot custom agents format
      - Issue #159: No research needed (simple rename across codebase)
```

**Checkpoint (Interactive/Pre-Flight modes):**

Present investigation summary to user:
```
Investigation Summary for Issue #{number}:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Problem: {description}
Root Cause: {root_cause}
Affected Files: {count} files
  - {file1}
  - {file2}
  - ...
Research: {needed/not_needed/completed}
Estimated Effort: {XS/S/M/L/XL}

Proposed Approach:
  1. {step1}
  2. {step2}
  ...

Proceed with implementation? (Y/n)
```

### Phase 2: Plan (design the solution)

**Goal:** Create a clear implementation plan before touching code.

```yaml
steps:
  1_identify_changes:
    action: List all files that need to be created, modified, or deleted
    output: change_manifest[]
    format: |
      | Action | File | Description |
      |--------|------|-------------|
      | CREATE | path/to/new-file.js | New component for X |
      | MODIFY | path/to/existing.js | Update function Y |
      | DELETE | path/to/old-file.md | Replaced by new format |
      | RENAME | old-name → new-name | Extension change |

  2_check_dependencies:
    action: Verify if changes affect other systems
    checks:
      - Does this change affect the installer? (packages/installer/)
      - Does this change affect IDE sync? (.aios-core/infrastructure/scripts/ide-sync/)
      - Does this change affect tests? (tests/)
      - Does this change affect documentation? (docs/)
      - Does this change affect CI/CD? (.github/workflows/)
      - Does this change affect other agents? (.aios-core/development/agents/)
    output: dependency_impacts[]

  3_verify_ids_gate:
    action: IDS G4 - Check Entity Registry for reusable patterns
    gate: G4 (Dev Context - Informational, non-blocking)
    checks:
      - Are there existing patterns/utilities that solve part of this?
      - Can existing code be ADAPTED (< 30% change) instead of creating new?
      - If creating new entities, prepare registry entry
    output: ids_decision (REUSE/ADAPT/CREATE per entity)

  4_plan_tests:
    action: Determine test strategy
    checks:
      - Existing tests that need updating?
      - New tests required?
      - Manual validation steps?
    output: test_plan
```

### Phase 3: Implement (make the changes)

**Goal:** Execute the plan with quality and safety.

```yaml
steps:
  1_implement_changes:
    action: Apply changes following the plan from Phase 2
    rules:
      - Follow project conventions (CLAUDE.md)
      - Use absolute imports, never relative
      - No `any` in TypeScript
      - kebab-case files, PascalCase components
      - Conventional Commits for commit message
      - Reference issue number in commit: "fix(scope): description (#N)"

  2_parallel_execution:
    condition: Multiple independent changes can be made simultaneously
    action: Use Task tool with subagents for parallel work
    examples:
      - Issue #159: 5 parallel agents for bulk rename across 136 files
      - Issue #138: Sequential (transformer → config → sync → cleanup)
    guidance: |
      Use parallel agents when:
        - Changes are to independent files with no cross-dependencies
        - Bulk operations across many files (>10 files with similar changes)
        - Research + implementation can overlap
      Use sequential when:
        - Later changes depend on earlier ones
        - Config changes must be tested before file operations
        - New code must exist before references to it

  3_handle_edge_cases:
    action: Watch for common pitfalls from past sessions
    known_pitfalls:
      - Email addresses inside strings may match rename patterns (Issue #159: security@synkra/aios-core.dev)
      - YAML parser converts "KEY: value" to objects, not strings (Issue #138: core_principles)
      - Windows bash escapes `!` in inline scripts (use temp .js files instead of node -e)
      - Replace_all may match unintended occurrences (always verify with Grep after bulk changes)
      - Submodule `pro` shows as modified even when unchanged (ignore in git status)
    mitigation: |
      After bulk changes:
        1. Grep for the old pattern to verify completeness
        2. Grep for corruption patterns (partial replacements)
        3. Read a sample of changed files to verify correctness

  4_regenerate_manifests:
    condition: Changes affect files tracked by install manifest
    action: |
      Run: node scripts/generate-install-manifest.js
      This regenerates .aios-core/install-manifest.yaml
    when: Any file in .aios-core/ or packages/ is created, modified, or deleted

  5_run_ide_sync:
    condition: Changes affect agent definitions or IDE sync system
    action: |
      Run: node .aios-core/infrastructure/scripts/ide-sync/index.js sync --verbose
      Verify all IDEs sync without errors
    when: Changes to .aios-core/development/agents/ or ide-sync/
```

### Phase 4: Validate (test and verify)

**Goal:** Ensure changes are correct and don't break anything.

```yaml
steps:
  1_run_tests:
    command: npm test
    must_pass: true
    on_failure: |
      Analyze test output, fix failures, re-run.
      Do NOT proceed to commit if tests fail.

  2_verify_changes:
    action: Manual verification
    checks:
      - [ ] All files listed in plan were changed
      - [ ] No unintended files were modified
      - [ ] Grep confirms old patterns are gone (for bulk changes)
      - [ ] Sample output looks correct (for format changes)
      - [ ] No secrets or credentials in changed files

  3_lint_check:
    command: npm run lint
    must_pass: false
    note: Warn if lint fails but don't block (some projects may not have lint)
```

### Phase 5: Commit & Push

**Goal:** Create a clean, well-documented commit and push to remote.

```yaml
steps:
  1_stage_changes:
    action: Stage ONLY files related to this issue
    rules:
      - Use specific file names, NOT "git add -A" or "git add ."
      - Exclude unrelated changes (pro submodule, coverage files, etc.)
      - Exclude .env, credentials, and sensitive files
      - Include regenerated manifests if applicable

  2_commit:
    action: Create commit following Conventional Commits
    format: |
      {type}({scope}): {description} (#{issue_number})

      {body - what was changed and why}

      Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
    type_map:
      BUG: fix
      FEATURE: feat
      ENHANCEMENT: feat
      DOCS: docs
      CHORE: chore
      SECURITY: fix

  3_push:
    command: git push origin {branch}
    authority: "@devops EXCLUSIVE — only this agent pushes to remote"
    on_failure: |
      Check if branch has upstream: git push -u origin {branch}
      Check for conflicts: git pull --rebase origin {branch}

  4_close_issue:
    command: |
      gh issue close {issue_number} --comment "$(cat <<'EOF'
      ## Resolved in commit {sha}

      ### Root Cause
      {root_cause_description}

      ### Changes
      {numbered_list_of_changes}

      ### Validation
      - {test_count} tests passing
      - {validation_details}
      EOF
      )"
    purpose: Close with detailed resolution comment for future reference
```

---

## Post-Conditions

**Purpose:** Validate execution success AFTER task completes

**Checklist:**

```yaml
post-conditions:
  - [ ] All planned changes implemented
    tipo: post-condition
    blocker: true

  - [ ] Tests pass (npm test exit code 0)
    tipo: post-condition
    blocker: true

  - [ ] Changes committed with proper message referencing issue
    tipo: post-condition
    blocker: true

  - [ ] Changes pushed to remote
    tipo: post-condition
    blocker: true

  - [ ] Issue closed with resolution comment
    tipo: post-condition
    blocker: true
```

---

## Acceptance Criteria

**Purpose:** Definitive pass/fail criteria for task completion

**Checklist:**

```yaml
acceptance-criteria:
  - [ ] Issue root cause identified and documented in close comment
    tipo: acceptance-criterion
    blocker: true

  - [ ] Fix addresses the reported problem completely
    tipo: acceptance-criterion
    blocker: true

  - [ ] No regressions introduced (all existing tests pass)
    tipo: acceptance-criterion
    blocker: true

  - [ ] Commit follows Conventional Commits format with issue reference
    tipo: acceptance-criterion
    blocker: true

  - [ ] Issue closed on GitHub with detailed resolution
    tipo: acceptance-criterion
    blocker: true

  - [ ] If research was needed, saved to docs/research/
    tipo: acceptance-criterion
    blocker: false
```

---

## Tools

**External/shared resources used by this task:**

- **Tool:** gh (GitHub CLI)
  - **Purpose:** Fetch issue details, close issues, add comments
  - **Source:** System CLI
  - **Required:** true

- **Tool:** git
  - **Purpose:** Stage, commit, push changes
  - **Source:** System CLI
  - **Required:** true
  - **Authority:** @devops EXCLUSIVE for push operations

- **Tool:** npm
  - **Purpose:** Run tests (npm test), lint, build
  - **Source:** System CLI
  - **Required:** true

- **Tool:** /tech-search (skill)
  - **Purpose:** Deep research when issue involves external specs/APIs
  - **Source:** .claude/skills/tech-search
  - **Required:** false (only when research needed)

- **Tool:** Grep/Glob/Read
  - **Purpose:** Codebase investigation during Phase 1
  - **Source:** Claude Code native tools
  - **Required:** true

- **Tool:** Task (subagents)
  - **Purpose:** Parallel execution for bulk operations
  - **Source:** Claude Code native tool
  - **Required:** false (only for large-scope changes)

---

## Dependencies

```yaml
dependencies:
  tasks:
    - triage-github-issues.md        # Upstream: triage feeds into resolve
    - github-devops-pre-push-quality-gate.md  # Optional: full quality gate before push
  checklists: []
  templates: []
  skills:
    - tech-search                     # For deep research when needed
  tools:
    - gh (GitHub CLI)
    - git
    - npm
```

---

## Error Handling

**Strategy:** checkpoint-and-recover

**Common Errors:**

1. **Error:** Issue already closed
   - **Cause:** Someone else closed the issue
   - **Resolution:** Verify with `gh issue view`, report to user
   - **Recovery:** Skip close step, still commit if fix was needed

2. **Error:** Tests fail after implementation
   - **Cause:** Code change introduced regression
   - **Resolution:** Analyze test output, fix the issue
   - **Recovery:** Do NOT push. Fix tests first, then retry Phase 4-5

3. **Error:** Push rejected (behind remote)
   - **Cause:** Remote has new commits
   - **Resolution:** `git pull --rebase origin {branch}` then retry push
   - **Recovery:** If rebase has conflicts, resolve and re-test

4. **Error:** Bulk replace corrupts unintended strings
   - **Cause:** Pattern matches inside URLs, emails, or compound identifiers
   - **Resolution:** Grep for corruption patterns immediately after replace
   - **Recovery:** Manual fix of affected files, re-verify
   - **Prevention:** Use targeted edits instead of global replace when pattern is ambiguous

5. **Error:** Research needed but /tech-search unavailable
   - **Cause:** Skill not loaded or external search failing
   - **Resolution:** Fall back to manual WebSearch + WebFetch
   - **Recovery:** Document findings manually in docs/research/

---

## Performance

**Expected Metrics:**

```yaml
duration_expected:
  XS_issue: 5-15 min
  S_issue: 15-30 min
  M_issue: 30-60 min
  L_issue: 1-2 hours
  XL_issue: 2-4 hours
cost_estimated: $0.01-0.10 (depends on complexity and research)
token_usage: ~5,000-50,000 tokens
```

---

## Metadata

```yaml
story: N/A (operational task)
version: 1.0.0
dependencies:
  tasks:
    - triage-github-issues.md
    - github-devops-pre-push-quality-gate.md
  skills:
    - tech-search
tags:
  - devops
  - issue-management
  - implementation
  - quality-gates
created_at: 2026-02-21
updated_at: 2026-02-21
related_tasks:
  - triage-github-issues.md
  - github-devops-pre-push-quality-gate.md
  - github-devops-github-pr-automation.md
```

---

## Lessons Learned (from past sessions)

These patterns were identified from real issue resolution sessions and should guide execution:

### Issue #159 (Bulk Rename) — Parallel + Edge Cases
- **Pattern:** 5 parallel agents for 136 files, split by directory
- **Pitfall:** `@synkra/aios-core` inside email `security@synkra/aios-core.dev` was corrupted
- **Lesson:** Always Grep for edge cases AFTER bulk replacements

### Issue #138 (Copilot Format) — Research-First
- **Pattern:** /tech-search before implementation, 6-phase plan from research
- **Pitfall:** YAML parsed `CRITICAL: value` as `{CRITICAL: value}` object instead of string
- **Lesson:** Handle both string and object formats when processing YAML arrays

### Issue #174 (Package Name) — Quick Win
- **Pattern:** Small, focused fix in 1 file, immediate validation
- **Lesson:** Quick wins should still follow full validate → commit → push → close cycle

### Email Removal — User Feedback Mid-Session
- **Pattern:** User noticed non-existent emails during issue resolution
- **Lesson:** Be responsive to user feedback even when working on a different issue

---

## Integration with @devops Agent

Called via `@devops *resolve-issue {number}` command.

**Upstream:** `*triage-issues` → user selects issue → `*resolve-issue {number}`
**Downstream:** After resolution → `*triage-issues` again for next issue (if in batch mode)
