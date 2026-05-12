# Task: Context Rot Audit

**Task ID:** context-rot-audit
**Version:** 1.0
**Purpose:** Audit CLAUDE.md, rules, and auto-memory for stale, incorrect, or bloated context that degrades Claude Code performance
**Orchestrator:** @project-integrator (Conduit)
**Mode:** Autonomous (elicit: false)
**Quality Standard:** Rot score calculated, all stale references identified, remediation plan generated

---

## Overview

Context rot occurs when CLAUDE.md, rules files, and auto-memory accumulate outdated instructions, references to deleted files, deprecated patterns, and bloated content. This audit systematically detects rot and produces a remediation plan.

```
INPUT (project_root)
    |
[PHASE 1: CLAUDE.MD SIZE AUDIT]
    -> Measure line count and section sizes
    -> Flag if over 500 lines
    -> Identify largest sections
    |
[PHASE 2: REFERENCE VALIDATION]
    -> Check every file path referenced in CLAUDE.md
    -> Check every file path referenced in rules
    -> Report missing/moved files
    |
[PHASE 3: INSTRUCTION STALENESS]
    -> Check for outdated API references
    -> Check for deprecated package mentions
    -> Check for patterns that conflict with current code
    |
[PHASE 4: RULES STRUCTURE AUDIT]
    -> Verify rules match current directory structure
    -> Check for orphaned rules (paths no longer exist)
    -> Validate frontmatter path patterns
    |
[PHASE 5: AUTO-MEMORY AUDIT]
    -> Check .claude/agent-memory/ for stale entries
    -> Verify referenced files still exist
    -> Check for contradictory entries
    |
[PHASE 6: ROT SCORE AND REMEDIATION]
    -> Calculate overall rot score
    -> Generate prioritized fix list
    -> Produce remediation plan
    |
OUTPUT: Rot score + findings report + remediation plan
```

---

## Inputs

| Field | Type | Source | Required | Validation |
|-------|------|--------|----------|------------|
| project_root | string | Auto-detect | yes | Valid directory with .claude/ or CLAUDE.md |
| fix_automatically | boolean | User | no | Whether to auto-fix simple issues (default: false) |
| verbose | boolean | User | no | Show all checks including passing (default: false) |

---

## Preconditions

1. Project has Claude Code configured (CLAUDE.md or .claude/ exists)
2. Git repository for change history analysis
3. Read access to all project files

---

## Phase 1: CLAUDE.md Size Audit

**Goal:** Check if CLAUDE.md has grown beyond effective size.

### Size Thresholds

| Lines | Status | Impact |
|-------|--------|--------|
| < 100 | Lean | Optimal for auto-memory |
| 100-200 | Normal | Good for most projects |
| 200-500 | Growing | Consider splitting into rules |
| 500+ | Bloated | Actively degrades performance |

### Steps

1.1. Count total lines in CLAUDE.md.
1.2. Measure each section's line count.
1.3. Identify the top 3 largest sections.
1.4. Flag any section over 50 lines as candidate for extraction to rules file.
1.5. Check for duplicate information across sections.

### Findings Format

```yaml
size_audit:
  total_lines: 347
  status: "growing"
  largest_sections:
    - name: "Code Standards"
      lines: 89
      recommendation: "Extract to .claude/rules/code-standards.md"
    - name: "API Reference"
      lines: 67
      recommendation: "Extract to .claude/rules/api.md"
  duplicates_found: 2
```

---

## Phase 2: Reference Validation

**Goal:** Verify every file/directory referenced in context files actually exists.

### Steps

2.1. Extract all file paths from CLAUDE.md (look for backtick-quoted paths, code blocks).
2.2. Extract all file paths from `.claude/rules/*.md`.
2.3. For each path, check if it exists in the project:

```
Reference: `src/components/Button.tsx`
Status: EXISTS / MISSING / MOVED

Reference: `npm run test:e2e`
Status: VALID (in package.json scripts) / INVALID
```

2.4. Check command references against package.json scripts.
2.5. Report all missing references with suggested fixes.

### Findings Format

```yaml
reference_audit:
  total_references: 45
  valid: 38
  missing: 5
  likely_moved: 2
  missing_details:
    - path: "src/lib/api-client.ts"
      referenced_in: "CLAUDE.md:42"
      suggestion: "File was renamed to src/lib/http-client.ts"
```

---

## Phase 3: Instruction Staleness

**Goal:** Detect outdated instructions that could cause Claude to do the wrong thing.

### Staleness Indicators

| Signal | Detection Method |
|--------|-----------------|
| Deprecated package | Check if version in instructions differs from package.json |
| Old API patterns | Instructions mention patterns not found in current code |
| Removed scripts | Referenced npm scripts no longer in package.json |
| Old directory structure | Instructions reference paths that were restructured |
| Version-specific instructions | Instructions tied to old framework version |

### Steps

3.1. Cross-reference CLAUDE.md instructions with current package.json:
   - Are referenced dependencies still installed?
   - Do version numbers match?
3.2. Check if code patterns described in CLAUDE.md exist in the codebase:
   - Grep for the pattern in source files
   - If not found, the instruction is stale
3.3. Check for tech-specific staleness:
   - React class components mentioned but none exist
   - Old import paths referenced
   - Deprecated API methods mentioned

### Findings Format

```yaml
staleness_audit:
  total_instructions_checked: 23
  current: 18
  stale: 4
  uncertain: 1
  stale_details:
    - instruction: "Use getServerSideProps for data fetching"
      location: "CLAUDE.md:78"
      issue: "Project uses App Router with server components"
      fix: "Update to describe server component patterns"
```

---

## Phase 4: Rules Structure Audit

**Goal:** Verify rules files match the current project structure.

### Steps

4.1. List all `.claude/rules/*.md` files.
4.2. For each rule with path-based frontmatter:
   - Extract the `paths:` patterns
   - Verify at least one file matches the glob pattern
   - If no files match, the rule is orphaned

4.3. Check for missing rules:
   - Are there important directories with no corresponding rule?
   - Compare rule coverage against project structure

4.4. Check for conflicting rules:
   - Do any rules give contradictory instructions for the same paths?

### Findings Format

```yaml
rules_audit:
  total_rules: 6
  active: 4
  orphaned: 1
  missing_coverage: 2
  orphaned_details:
    - file: ".claude/rules/graphql.md"
      paths_pattern: "src/graphql/**"
      issue: "No graphql directory exists (removed in v2 migration)"
  missing_coverage:
    - directory: "src/middleware/"
      suggestion: "Create middleware.md rule for auth and validation patterns"
```

---

## Phase 5: Auto-Memory Audit

**Goal:** Check agent memory files for stale entries.

### Steps

5.1. Scan `.claude/agent-memory/` for all memory files.
5.2. For each memory file:
   - Check if referenced files still exist
   - Check if referenced patterns are still valid
   - Check for contradictions with current CLAUDE.md
5.3. Check MEMORY.md line count (should be under 200 for auto-loading).
5.4. Identify entries that are session-specific (should not be in persistent memory).

---

## Phase 6: Rot Score and Remediation

**Goal:** Calculate overall health and produce a fix plan.

### Rot Score Calculation

```
Rot Score = (missing_refs * 3) + (stale_instructions * 5) + (orphaned_rules * 2) +
            (size_penalty) + (memory_issues * 2)

Size Penalty:
  < 200 lines: 0 points
  200-500 lines: 5 points
  500+ lines: 15 points

Score Interpretation:
  0-5:   Healthy (green)
  6-15:  Minor rot (yellow) -- schedule cleanup
  16-30: Significant rot (orange) -- clean up soon
  31+:   Critical rot (red) -- clean up now
```

### Remediation Plan

6.1. Generate prioritized fix list:

| Priority | Fix | Effort | Impact |
|----------|-----|--------|--------|
| P0 | Remove references to deleted files | Low | High |
| P1 | Update stale instructions | Medium | High |
| P2 | Remove orphaned rules | Low | Medium |
| P3 | Extract large CLAUDE.md sections to rules | Medium | Medium |
| P4 | Clean stale memory entries | Low | Low |

6.2. If `fix_automatically` is true, apply P0 fixes automatically.
6.3. Generate a summary report.

---

## Output Format

```yaml
context_rot_audit_result:
  rot_score: 12
  severity: "yellow"
  summary:
    total_checks: 89
    passed: 76
    warnings: 8
    failures: 5
  phases:
    size_audit:
      lines: 234
      status: "growing"
    reference_validation:
      total: 45
      missing: 3
    instruction_staleness:
      total: 23
      stale: 2
    rules_structure:
      total: 6
      orphaned: 1
    auto_memory:
      total: 3
      stale_entries: 1
  remediation:
    auto_fixed: 0
    manual_fixes_needed: 7
    priority_list: [...]
  overall_status: "NEEDS_ATTENTION"
```

---

## Veto Conditions

| Condition | Action |
|-----------|--------|
| No CLAUDE.md and no .claude/ directory | HALT -- nothing to audit |
| Project has no git history (cannot determine staleness) | WARN -- skip staleness checks |
| Rot score exceeds 50 | HALT -- critical rot, needs immediate human attention |
| Auto-fix would modify more than 10 files | HALT -- too many changes, require manual review |
| CLAUDE.md has AIOX-managed sections | WARN -- do not modify managed sections |
