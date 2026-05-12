# Task: Optimize Context Window Usage

**Task ID:** CCM-CONFIG-004
**Version:** 1.0.0
**Command:** `*optimize-context`
**Orchestrator:** Sigil (config-engineer)
**Purpose:** Optimize context window usage by analyzing CLAUDE.md size, moving detailed instructions to conditional `.claude/rules/`, configuring auto-compaction, and reviewing auto-memory files for efficiency.

---

## Overview

```
  +------------------+     +------------------+     +------------------+
  | 1. Analyze       | --> | 2. Move Detailed | --> | 3. Configure     |
  |    CLAUDE.md     |     |    Instructions  |     |    Conditional   |
  |    Size          |     |    to rules/     |     |    Loading       |
  +------------------+     +------------------+     +------------------+
       |                                                    |
       v                                                    v
  +------------------+     +------------------+     +------------------+
  | 4. Review Auto-  | --> | 5. Configure     | --> |    BUDGET        |
  |    Memory Files  |     |    Compaction    |     |    REPORT        |
  +------------------+     +------------------+     +------------------+
```

---

## Inputs

| Field | Type | Source | Required | Validation |
|-------|------|--------|----------|------------|
| project_root | string | Working directory | Yes | Must contain CLAUDE.md or .claude/CLAUDE.md |
| target_lines | number | User parameter | No | Target max lines for CLAUDE.md (default: 200) |
| dry_run | boolean | User parameter | No | If true, only report without making changes |

---

## Preconditions

- At least one CLAUDE.md file exists (project root or .claude/)
- Read access to .claude/rules/ directory
- Read access to auto-memory directory (~/.claude/projects/)

---

## Execution Phases

### Phase 1: Analyze CLAUDE.md Size

1. Locate all CLAUDE.md files:
   - `./CLAUDE.md` (project root)
   - `./.claude/CLAUDE.md` (claude directory)
   - `./CLAUDE.local.md` (local overrides)
   - `~/.claude/CLAUDE.md` (user-level)
2. For each file, measure:
   - Total line count
   - Section count (by markdown headers)
   - Estimated token count (lines x ~4 tokens average)
   - @import count and what they reference
3. Categorize content sections by purpose:
   - **Core instructions** (must stay): Project overview, key commands, agent system
   - **Conditional content** (can move to rules/): Framework-specific, path-scoped
   - **Reference material** (should use @imports): Architecture docs, API specs
   - **Redundant content** (can remove): Duplicated across files, outdated
4. Generate the analysis table:

| Section | Lines | Category | Recommendation |
|---------|-------|----------|----------------|
| {header} | {N} | {core/conditional/reference/redundant} | {keep/move/import/remove} |

### Phase 2: Move Detailed Instructions to .claude/rules/

For each section categorized as "conditional":

1. Identify the file paths this section applies to:
   - API instructions -> `src/api/**`, `server/**`
   - Component patterns -> `src/components/**/*.tsx`
   - Test conventions -> `tests/**`, `**/*.test.*`
   - Database rules -> `migrations/**`, `supabase/**`
2. Create a new `.claude/rules/{section-name}.md` file:
   - Add `paths:` YAML frontmatter with appropriate glob patterns
   - Move the section content into the rule file
   - Preserve formatting and code examples
3. Remove the moved section from CLAUDE.md
4. Add a brief reference comment where the section was:
   ```markdown
   <!-- API conventions: see .claude/rules/api-conventions.md -->
   ```

### Phase 3: Configure Conditional Loading

1. Verify all new rule files have proper frontmatter:
   ```yaml
   ---
   paths:
     - "src/api/**/*.ts"
   ---
   ```
2. Test glob patterns match actual project files
3. Organize rules into subdirectories if many rules exist:
   ```
   .claude/rules/
     frontend/
       component-patterns.md
       styling-rules.md
     backend/
       api-conventions.md
       database-rules.md
     testing/
       test-patterns.md
   ```
4. Remove any existing always-on rules that should be conditional

### Phase 4: Review Auto-Memory Files

1. Check the auto-memory directory:
   - `~/.claude/projects/{project-hash}/memory/`
2. If auto-memory files exist:
   - List all memory files and their sizes
   - Check for outdated or irrelevant memories
   - Flag memories that duplicate CLAUDE.md content
   - Suggest cleanup of stale memories
3. If auto-memory is not active:
   - Inform the user about auto-memory (Claude creates it automatically)
   - No action needed

### Phase 5: Configure Compaction

1. Assess the current compaction settings:
   - Check for `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE` env variable
   - Default trigger is ~95% context capacity
2. Recommend compaction threshold based on project size:

| Project Size | CLAUDE.md Lines | Recommended PCT | Rationale |
|-------------|----------------|-----------------|-----------|
| Small (<100 files) | <100 | Default (95%) | Rarely hits limit |
| Medium (100-500 files) | 100-200 | 80% | Some headroom needed |
| Large (500+ files) | 200+ | 50-60% | Frequent compaction needed |

3. Check for PreCompact hook:
   - If missing: recommend adding one for context preservation
   - If present: verify it has reasonable timeout (5-10 seconds)
4. Check `CLAUDE_CODE_MAX_OUTPUT_TOKENS` setting:
   - Default: 32000, Maximum: 64000
   - Higher values reduce available context window
   - Recommend default unless user needs long outputs

---

## Output Format

```markdown
## Context Optimization Report

**Project:** {project-name}
**Date:** {YYYY-MM-DD}
**Mode:** {dry-run | applied}

### CLAUDE.md Analysis

| Metric | Before | After | Change |
|--------|--------|-------|--------|
| Total lines | {N} | {N} | {-N (-X%)} |
| Sections | {N} | {N} | {-N} |
| Est. tokens | {N} | {N} | {-N (-X%)} |
| @imports | {N} | {N} | {+N} |

### Content Redistribution

| Section | Lines | Action | Destination |
|---------|-------|--------|-------------|
| {section} | {N} | {moved/imported/removed/kept} | {.claude/rules/X.md | @import | --} |

### Context Budget

| Component | Lines | Tokens (est.) | Loading |
|-----------|-------|---------------|---------|
| CLAUDE.md | {N} | {N} | Always |
| .claude/rules/ (total) | {N} | {N} | Conditional |
| Auto-memory | {N} | {N} | Always |
| **Total always-loaded** | {N} | {N} | -- |

### Compaction Settings

- **Current trigger:** {N}% (default | override)
- **Recommended trigger:** {N}%
- **PreCompact hook:** {configured | missing}
- **Max output tokens:** {N}

### Savings Summary

- **Context saved per interaction:** ~{N} tokens ({X}% reduction)
- **Conditional content:** {N} lines loaded only when relevant
- **Files optimized:** {N}
```

---

## Veto Conditions

- **NEVER** delete content from CLAUDE.md without moving it to .claude/rules/ or confirming with the user that it is redundant.
- **NEVER** set CLAUDE_AUTOCOMPACT_PCT_OVERRIDE below 30. Values too low cause excessive compaction that degrades session quality.
- **NEVER** create always-on rules for content that is path-specific. Always use paths: frontmatter for conditional loading.
- **NEVER** modify auto-memory files directly. They are managed by Claude Code automatically.
- **NEVER** reduce CLAUDE.md below a functional minimum. Core instructions (project overview, key commands, essential conventions) must remain.

---

## Completion Criteria

- [ ] All CLAUDE.md files analyzed with line counts and section categorization
- [ ] Conditional content identified and moved to .claude/rules/
- [ ] Glob patterns validated against project structure
- [ ] Auto-memory files reviewed for staleness
- [ ] Compaction threshold recommended with rationale
- [ ] Before/after comparison generated showing token savings
