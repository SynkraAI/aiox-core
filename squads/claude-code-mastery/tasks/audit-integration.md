# Task: Audit Existing Claude Code Integration

**Task ID:** CCM-PI-002
**Version:** 1.0.0
**Command:** `*audit-integration`
**Agent:** Conduit (project-integrator)
**Purpose:** Audit an existing Claude Code integration in a project, checking completeness, consistency, health, and generating an actionable score with recommendations.

---

## Overview

```
  Target Project
       |
       v
  +--------------------+
  | 1. Check .claude/   |
  |    Completeness     |
  +--------------------+
       |
       v
  +--------------------+
  | 2. Validate Settings|
  |    Consistency      |
  +--------------------+
       |
       v
  +--------------------+
  | 3. Check Rule       |
  |    Coverage         |
  +--------------------+
       |
       v
  +--------------------+
  | 4. Verify Hook      |
  |    Health           |
  +--------------------+
       |
       v
  +--------------------+
  | 5. Test MCP         |
  |    Connectivity     |
  +--------------------+
       |
       v
  +--------------------+
  | 6. Generate Score   |
  |    & Recommendations|
  +--------------------+
```

---

## Inputs

| Field | Type | Source | Required | Validation |
|-------|------|--------|----------|------------|
| project_path | string | User or cwd | Yes | Must contain .claude/ directory |
| deep_scan | boolean | User | No | Default false; true scans all source files for consistency |

---

## Preconditions

- `.claude/` directory exists in the target project
- Read access to all project files

---

## Execution Phases

### Phase 1: Check .claude/ Completeness

Scan the `.claude/` directory and check for expected components:

| Component | Required | Path | Weight |
|-----------|----------|------|--------|
| CLAUDE.md | Yes | `.claude/CLAUDE.md` | 25 |
| settings.json | Yes | `.claude/settings.json` | 20 |
| settings.local.json | Recommended | `.claude/settings.local.json` | 5 |
| rules/ directory | Recommended | `.claude/rules/` | 15 |
| At least 1 rule file | Recommended | `.claude/rules/*.md` | 10 |
| commands/ directory | Optional | `.claude/commands/` | 5 |
| skills/ directory | Optional | `.claude/skills/` | 5 |

For each component, record: present/missing, file size, last modified date.

### Phase 2: Validate Settings Consistency

Parse `.claude/settings.json` and check:

1. **JSON validity**: parseable without errors
2. **Permission coherence**: no contradictions between allow and deny rules
3. **Path accuracy**: all referenced paths in deny/allow actually exist
4. **Dangerous gaps**: common dangerous commands not explicitly denied
   - `rm -rf /`, `git push --force`, `DROP TABLE`, `sudo`
5. **Overly permissive**: check for `bash("*")` or wildcard allows
6. **AIOX compatibility**: if AIOX project, verify L1/L2 protection rules present

Flag each finding as: PASS, WARN, FAIL.

### Phase 3: Check Rule Coverage

For each rule file in `.claude/rules/`:

1. Validate frontmatter format (paths: array present if contextual)
2. Check rule content is non-empty and actionable
3. Verify path globs in frontmatter match actual project files
4. Identify coverage gaps:
   - Source code edited but no coding-standards rule
   - Tests present but no testing rule
   - CI/CD files present but no workflow rule
   - Database files present but no database rule

### Phase 4: Verify Hook Health

Check hook configuration and health:

1. **Registration**: Are hooks registered in settings.json or ~/.claude/settings.json?
2. **File existence**: Do referenced hook scripts exist?
3. **Syntax**: Can hook scripts be parsed without errors?
4. **Permissions**: Are hook scripts executable?
5. **Timeout risk**: Do hooks have operations that could hang (network calls without timeout)?

For each hook, classify as: HEALTHY, DEGRADED, BROKEN, MISSING.

### Phase 5: Test MCP Connectivity

If MCP servers are configured:

1. List all configured MCP servers from settings
2. For each server, check:
   - Configuration is complete (command, args, env present)
   - Binary/command exists on PATH
   - No obvious credential issues (empty env vars)
3. Categorize: CONNECTED, CONFIGURED, MISCONFIGURED, MISSING

If no MCP configured, note as N/A with recommendation.

### Phase 6: Generate Score and Recommendations

Calculate integration health score (0-100):

```
Score = sum(component_weight * component_score) / max_possible_score * 100

Where component_score:
  PASS = 1.0
  WARN = 0.5
  FAIL = 0.0
  N/A  = excluded from calculation
```

**Grade thresholds:**
| Score | Grade | Label |
|-------|-------|-------|
| 90-100 | A | Excellent integration |
| 75-89 | B | Good, minor improvements possible |
| 60-74 | C | Functional, notable gaps |
| 40-59 | D | Significant issues, recommend remediation |
| 0-39 | F | Critical gaps, integration not effective |

---

## Output Format

```markdown
## Claude Code Integration Audit

**Project:** {project_path}
**Date:** {YYYY-MM-DD}
**Score:** {score}/100 (Grade: {grade})

### Component Status

| Component | Status | Details |
|-----------|--------|---------|
| CLAUDE.md | PASS/WARN/FAIL | {detail} |
| settings.json | PASS/WARN/FAIL | {detail} |
| Rules | PASS/WARN/FAIL | {N} files, {coverage}% coverage |
| Hooks | PASS/WARN/FAIL/N/A | {N} healthy, {N} broken |
| MCP | PASS/WARN/FAIL/N/A | {N} connected |

### Findings

#### Critical (Must Fix)
1. {finding} -- {recommendation}

#### Warnings (Should Fix)
1. {finding} -- {recommendation}

#### Info (Nice to Have)
1. {finding} -- {recommendation}

### Quick Fixes

{Numbered list of commands or actions to fix top issues}
```

---

## Veto Conditions

- **NEVER** modify any project files during audit -- this is read-only analysis
- **NEVER** execute hook scripts to test them -- only static analysis
- **NEVER** attempt MCP connections that could trigger side effects
- **NEVER** report credentials or secrets found in configuration files

---

## Completion Criteria

- [ ] All 6 phases executed
- [ ] Score calculated with weighted components
- [ ] Grade assigned from threshold table
- [ ] Critical findings listed with specific recommendations
- [ ] Quick fixes provided for top issues
- [ ] Audit report presented in standard format
