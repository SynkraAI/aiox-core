# Forge Scaffold — Project Birth Certificate

> Gera `.claude/CLAUDE.md` e `.gitignore` automaticamente antes do @dev começar a codar.
> Pense nisso como a certidao de nascimento do projeto — sem ela, ninguem sabe quem o projeto e.

---

## 1. Generate CLAUDE.md

### When

Hook: `before:phase:3` (antes do Build Loop comecar)

### Pre-check

```
1. Check if {PROJECT_DIR}/.claude/CLAUDE.md exists
2. If EXISTS → go to "Merge Mode"
3. If NOT EXISTS → go to "Create Mode"
```

### Create Mode (new CLAUDE.md)

**Use the centralized template:** Read `{AIOS_HOME}/tools/templates/project-configs/base/.claude/CLAUDE.md`.

This is the single source of truth for CLAUDE.md structure. Both Forge (via this plugin) and `/new-project` (via `copy-project-config.js`) use the same template file, ensuring consistency across all projects.

**Fill placeholders from state.json + Phase 1 output:**

| Placeholder | Source | Fallback |
|---|---|---|
| `{{PROJECT_NAME}}` | `state.json → project.name` | run_id slug |
| `{{DESCRIPTION}}` | `state.json → description` | "(A definir)" |
| `{{STACK_SECTION}}` | Build from `state.json → tech_decisions` (see below) | "- (A definir conforme projeto evolui)" |
| `{{COMMANDS_SECTION}}` | Read `package.json → scripts` and list real commands | Minimal default (see below) |
| `{{MODE}}` | "HYBRID" (external projects are always HYBRID) | "HYBRID" |
| `{{MODE_DESCRIPTION}}` | "Governança local — INDEX, stories e sessions vivem em `.aios/` dentro do projeto." | (from mode) |
| `{{INDEX_PATH}}` | `.aios/INDEX.md` | `.aios/INDEX.md` |
| `{{STORIES_PATH}}` | `.aios/stories/active/` (HYBRID) or `docs/stories/active/` (CENTRALIZED) | `.aios/stories/active/` |
| `{{SESSIONS_PATH}}` | `.aios/sessions/` | `.aios/sessions/` |
| `{{SAVE_LOCATION}}` | `.aios/` (HYBRID) or `docs/projects/{slug}/` (CENTRALIZED) | `.aios/` |
| `{{PROJECT_SLUG}}` | kebab-case of project name | run_id slug |

**Stack section generation (from tech_decisions):**

```markdown
- **Framework:** {framework} {version if known}
- **Database:** {database}
- **ORM:** {orm}
- **Auth:** {auth_strategy}
- **Deploy:** {deploy_target}
- **Arquitetura:** {architecture_label}
- TypeScript strict mode
```

ONLY include lines where we have real data. If no ORM was chosen, omit ORM line.

**Architecture label resolution (from `state.json → tech_decisions.architecture`):**

| `architecture` value | `{architecture_label}` |
|---|---|
| `separated_api` | `Frontend e Backend separados (frontend/ + backend/)` |
| `monorepo` | `Monorepo com workspaces separados (frontend/ + backend/)` |
| `fullstack_together` | `Fullstack (Next.js com API routes)` |
| outro valor | Usar o valor literal |

**Commands section generation (from package.json):**

Read `{PROJECT_DIR}/package.json` → `scripts`. For each real script, add a line:
```markdown
- `npm run dev` — dev server (use port-manager)
- `npm run build` — production build
- `npm run test` — run tests
- `npm run lint` — linter
- `npm run typecheck` — TypeScript check
```

Commands section MUST reflect actual `package.json` scripts. If `test` script doesn't exist, don't include it.

**After filling the template, append project-specific sections if data exists:**

**Project Structure — single source of truth:**

The `## Project Structure` section in CLAUDE.md comes from ONE source only (in priority order):

1. **@architect output** (preferred): If `.aios/forge-runs/{run_id}/spec/architecture.md` exists and contains a directory structure, use it verbatim.
2. **Fallback from state.json**: If no architect output, derive from `tech_decisions.repo_structure`:
   - `monorepo_workspaces` → generate `frontend/` + `backend/` + `shared/` layout
   - `single_package` → generate flat layout (no split)
   - Field missing → derive from `architecture` using runner.md derivation rule
3. **Never both.** Do NOT generate a fixed structure AND append the architect's. Pick one.

Append the chosen structure:
```markdown
## Project Structure

{directory_structure — from architect output OR derived from tech_decisions}
```

**Rules:**
- ALWAYS start from the base template — never hardcode a full CLAUDE.md in this file
- If the template file doesn't exist (edge case), fall back to generating inline (backwards compatible)
- Port-manager command is already in the template — no need to add separately

### Merge Mode (existing CLAUDE.md)

When `.claude/CLAUDE.md` already exists:

```
1. Read existing CLAUDE.md fully
2. Parse into sections (by ## headings)
3. For each section in the template:
   a. If section EXISTS in current file → SKIP (never overwrite)
   b. If section MISSING → APPEND at the end
4. Write updated file
```

**Critical:** NEVER overwrite user content. Merge is additive only. If the user wrote custom conventions, those stay untouched.

### Output

- File: `{PROJECT_DIR}/.claude/CLAUDE.md`
- Also create `{PROJECT_DIR}/.claude/` directory if it doesn't exist
- Log: "Generated .claude/CLAUDE.md with {N} sections"

---

## 2. Generate .gitignore

### When

Hook: `before:phase:3` (same timing as CLAUDE.md)

### Pre-check

```
1. Check if {PROJECT_DIR}/.gitignore exists
2. If EXISTS → go to "Patch Mode"
3. If NOT EXISTS → go to "Create Mode"
```

### Create Mode (new .gitignore)

Generate based on `tech_decisions.framework`:

**Base (always included):**

```
# Dependencies
node_modules/

# Environment
.env
.env.local
.env.*.local

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log*

# Coverage
coverage/

# AIOS (runtime only, not committed)
.aios/forge-runs/
.aios/memory/
```

**Framework-specific additions:**

| Framework | Extra entries |
|-----------|-------------|
| Next.js | `.next/`, `out/` |
| Vite/React | `dist/` |
| NestJS | `dist/` |
| Python | `__pycache__/`, `*.pyc`, `.venv/`, `venv/` |
| Go | Binary name from `go.mod` |

### Patch Mode (existing .gitignore)

```
1. Read existing .gitignore
2. Check for CRITICAL missing entries:
   - .env (any form)
   - node_modules/ (if Node project)
   - credentials/ or secrets/
3. If any CRITICAL entry is missing:
   - Append to end with comment: "# Added by Forge (security)"
   - Log warning: "Added missing security entries to .gitignore"
4. If all critical entries present:
   - Do nothing
   - Log: ".gitignore OK — no changes needed"
```

**Critical:** In patch mode, ONLY add security-critical entries. Never restructure or reorganize an existing .gitignore.

### Output

- File: `{PROJECT_DIR}/.gitignore`
- Log: "Generated .gitignore for {framework}" or "Patched .gitignore (added {N} entries)"

---

## 3. State Update

After both operations complete, update `state.json`:

```json
{
  "plugins": {
    "forge_scaffold": {
      "claude_md": {
        "status": "created|merged|skipped",
        "sections": ["Stack", "Commands", "Conventions", "Security"],
        "path": ".claude/CLAUDE.md"
      },
      "gitignore": {
        "status": "created|patched|skipped",
        "entries_added": 0,
        "path": ".gitignore"
      }
    }
  }
}
```

---

## Summary

| Situation | CLAUDE.md Action | .gitignore Action |
|-----------|-----------------|-------------------|
| New project, no files | CREATE full | CREATE full |
| Existing project, no CLAUDE.md | CREATE full | PATCH (add missing) |
| Existing project, has CLAUDE.md | MERGE (add missing sections) | PATCH (add missing) |
| CLAUDE.md + .gitignore complete | SKIP | SKIP |
