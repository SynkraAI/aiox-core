# Task: Multi-Project Claude Code Setup

**Task ID:** CCM-PI-004
**Version:** 1.0.0
**Command:** `*multi-project-setup`
**Agent:** Conduit (project-integrator)
**Purpose:** Set up Claude Code for multiple related projects, configuring shared user settings, project-specific overrides, shared MCP servers, and cross-project rules.

---

## Overview

```
  Multiple Projects
       |
       v
  +-----------------------+
  | 1. Analyze Project    |
  |    Relationships      |
  +-----------------------+
       |
       v
  +-----------------------+
  | 2. Configure Shared   |
  |    User Settings      |
  +-----------------------+
       |
       v
  +-----------------------+
  | 3. Create Per-Project |
  |    Settings           |
  +-----------------------+
       |
       v
  +-----------------------+
  | 4. Set Up Shared      |
  |    MCP Servers        |
  +-----------------------+
       |
       v
  +-----------------------+
  | 5. Configure Shared   |
  |    Rules              |
  +-----------------------+
       |
       v
  +-----------------------+
  | 6. Verify Cross-      |
  |    Project Coherence  |
  +-----------------------+
```

---

## Inputs

| Field | Type | Source | Required | Validation |
|-------|------|--------|----------|------------|
| projects | object[] | User | Yes | Array of {path, name, type} for each project |
| relationship | enum | User | Yes | `monorepo`, `polyrepo-shared-stack`, `polyrepo-independent`, `workspace` |
| shared_tools | string[] | User | No | Tools used across all projects (e.g., "eslint", "jest", "docker") |

---

## Preconditions

- All listed project directories exist and are accessible
- User has write access to `~/.claude/` (user-level config)
- Each project has been initialized with git

---

## Execution Phases

### Phase 1: Analyze Project Relationships

For each project, determine:

1. **Language and framework**: detect from package.json, Cargo.toml, pyproject.toml, etc.
2. **Shared dependencies**: which packages appear across projects
3. **Shared patterns**: naming conventions, directory structure similarities
4. **Communication patterns**: do projects import from each other (monorepo), share APIs (microservices), or operate independently
5. **Git topology**: single repo with multiple packages vs separate repositories

Build a relationship map:
```
Project A (Next.js frontend) --imports--> shared-lib
Project B (Node.js API)      --imports--> shared-lib
Project C (Python ML)        --independent--
shared-lib (TypeScript)      --consumed-by--> A, B
```

### Phase 2: Configure Shared User Settings

Create or update `~/.claude/settings.json`:

1. **Global permissions**: commands safe across all projects
   - `git status`, `git diff`, `git log`
   - Language-agnostic linters and formatters
2. **Global denies**: dangerous commands regardless of project
   - `rm -rf /`, `sudo`, `DROP DATABASE`, `git push --force`
3. **Global preferences**: settings that apply everywhere
   - Output format preferences
   - Default model configuration

Create or update `~/.claude/CLAUDE.md` (user-level):
- Developer identity and preferences
- Cross-project conventions (commit style, PR format)
- Keep under 50 lines -- project-specific content goes in project CLAUDE.md

### Phase 3: Create Per-Project Settings

For each project, generate `.claude/settings.json`:

1. **Project-specific allows**: build/test/lint commands for that stack
   - Frontend: `npm run dev`, `npm run build`, `npx next`
   - Backend: `npm run start:dev`, `npm run migrate`
   - Python: `python -m pytest`, `pip install`
2. **Project-specific denies**: protect that project's critical paths
3. **additionalDirectories**: if projects reference each other
   ```json
   {
     "additionalDirectories": ["../shared-lib"]
   }
   ```
4. **Project CLAUDE.md**: project-specific context, build commands, structure

Ensure no conflicts between user-level and project-level settings.

### Phase 4: Set Up Shared MCP Servers

Configure MCP servers that serve multiple projects:

1. **Identify shared needs**: which MCPs benefit all projects
   - Context7: documentation lookup (universal)
   - EXA: web search (universal)
   - Database: shared if projects use same DB
2. **Configure at user level**: add shared MCPs to `~/.claude/settings.json`
3. **Configure project-specific MCPs**: in each project's settings
4. **Avoid duplication**: same MCP should not be configured at both levels

### Phase 5: Configure Shared Rules

Create rules that apply across projects:

1. **User-level rules** (`~/.claude/rules/`): team conventions
   - Commit message format
   - Code review checklist
   - Documentation standards
2. **Project-level rules** (`.claude/rules/`): project-specific
   - Coding standards for that language/framework
   - Testing requirements for that project
   - Architecture constraints
3. **Shared rule templates**: for consistency across new projects

### Phase 6: Verify Cross-Project Coherence

Run verification across all projects:

1. **No conflicts**: user-level and project-level settings do not contradict
2. **Complete coverage**: every project has CLAUDE.md + settings.json
3. **MCP consistency**: shared MCPs accessible from all projects
4. **Rule consistency**: no contradictory rules across projects
5. **Path accuracy**: additionalDirectories point to valid paths

---

## Output Format

```markdown
## Multi-Project Setup Report

**Projects:** {N} projects configured
**Relationship:** {relationship}
**Date:** {YYYY-MM-DD}

### Project Map

| Project | Type | Stack | MCP Servers | Rules |
|---------|------|-------|-------------|-------|
| {name} | {type} | {stack} | {N} | {N} |

### Shared Configuration

- User settings: ~/.claude/settings.json ({N} allows, {N} denies)
- User CLAUDE.md: ~/.claude/CLAUDE.md ({N} lines)
- Shared MCPs: {list}
- Shared rules: {list}

### Per-Project Configuration

**{project_name}:**
- .claude/CLAUDE.md: {N} lines
- .claude/settings.json: {N} allows, {N} denies
- .claude/rules/: {N} files
- additionalDirectories: {list or "none"}

### Cross-Project Verification

| Check | Status |
|-------|--------|
| No setting conflicts | PASS/FAIL |
| All projects configured | PASS/FAIL |
| MCP consistency | PASS/FAIL |
| Rule consistency | PASS/FAIL |
| Path accuracy | PASS/FAIL |
```

---

## Veto Conditions

- **NEVER** overwrite existing user-level settings without confirmation
- **NEVER** add project paths to additionalDirectories without verifying they exist
- **NEVER** configure MCP servers that require credentials without user providing them
- **NEVER** modify settings of projects not listed in the input

---

## Completion Criteria

- [ ] Project relationships analyzed and mapped
- [ ] Shared user settings configured at ~/.claude/
- [ ] Per-project settings created for each project
- [ ] Shared MCP servers configured without duplication
- [ ] Cross-project rules established
- [ ] Coherence verification passed
- [ ] Setup report delivered
