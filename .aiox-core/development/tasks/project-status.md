# Task: Project Status — Full Panorama

> **Command:** `*status`
> **Agent:** @aiox-master, @po, @sm
> **Purpose:** Display accurate, real-time panorama of all epics and stories
> **Created:** 2026-03-05

---

## Purpose

Display a comprehensive, **100% accurate** panorama of all epics and stories in the project. The status of each story is read directly from its **source of truth** — the `## Status` field in each story file — never inferred from epic metadata, git history, or cached data.

---

## Usage

```bash
# Full panorama (all epics, all stories)
*status

# Single epic
*status epic-7

# Summary only (no story details)
*status --summary
```

### Arguments

| Argument  | Required | Description                            |
| --------- | -------- | -------------------------------------- |
| epic-id   | No       | Show only specific epic (e.g. epic-7)  |
| --summary | No       | Show only epic-level counts            |

---

## CRITICAL RULES

### Rule 1: Source of Truth

The **ONLY** source of truth for story status is the `## Status` field in each story file (`docs/stories/{N}.{M}.*.md`). **NEVER** use:

- ❌ Epic file metadata (`status: "In Progress (1/2 done)"`)
- ❌ Git log or gitStatus snapshot from system prompt
- ❌ Cached data from previous reads in the conversation
- ❌ Subagent summaries that don't read every story file
- ❌ Assumptions based on which stories have files vs not

### Rule 2: Read Every File

Every execution of `*status` MUST read the `## Status` field from **every** story file that exists. No shortcuts, no sampling, no relying on epic summaries.

### Rule 3: Divergence Detection

If an epic file's progress count (e.g., "1/2 done") does not match the actual status of its stories, **flag the divergence** visually with ⚠️ and suggest updating the epic file.

---

## Workflow

```yaml
steps:
  - name: Discover Epics
    action: |
      Glob: docs/stories/epic-*.md
      Read each epic file to extract:
        - epic_id, title, status (from metadata block)
        - Story references (from ## Stories section)

  - name: Discover Stories
    action: |
      Glob: docs/stories/[0-9]*.md
      This finds ALL story files (e.g., 7.1.*.md, 8.3.*.md, 9.1.*.md)

  - name: Read Story Status (MANDATORY)
    action: |
      For EACH story file found in Step 2:
        Read the file and extract:
          - Story title: first line starting with "# "
          - Status: the line immediately after "## Status" heading,
            trimmed of "**" markers and whitespace.
            Do NOT rely on fixed line numbers — the Status section
            position may vary across story templates.
        Map story to its epic (first number = epic_id)
    critical: true
    note: |
      This step CANNOT be skipped or delegated to a subagent
      that might use cached data. Each file MUST be read fresh.

  - name: Cross-Reference & Detect Divergence
    action: |
      Normalize status values before counting:
        - "Ready" | "Ready for Dev" | "Ready to Start" → Ready
        - "InProgress" | "In Progress" → InProgress
        - "InReview" | "In Review" | "Ready for Review" → InReview
        - "Done" | "Complete" | "Completed" → Done
        - "Draft" → Draft
        - Anything else → Unknown (flag with ⚠️)
      For each epic:
        - Count stories by normalized status (Done, Ready, Draft, InProgress, etc.)
        - Compare with epic file's stated progress
        - If mismatch: mark with ⚠️ DIVERGENCE flag
      For stories referenced in epics but without story files:
        - Mark as "📄 No story file"

  - name: Format Output
    action: |
      Display formatted panorama with:
        - Epic-level summary table (all epics)
        - Story-level detail per epic (status from source of truth)
        - Divergence warnings (if any)
        - Quality metrics (test count, lint, typecheck — from last known)
        - Next steps recommendation
```

---

## Output Format

### Full Panorama

```text
📊 Status Completo — {Project Name}

Panorama Geral: {done}/{total} stories done ({percentage}%)

═══════════════════════════════════════════════════════

Epic 1 — Foundation & Shell                    3/3 ✅
  ✅ 1.1 Project Scaffold & Database Setup     Done
  ✅ 1.2 Filesystem Scanner Core               Done
  ✅ 1.3 App Shell & Layout                    Done

Epic 7 — Critical Fixes & Data Config         2/2 ✅
  ✅ 7.1 Fix Critical Bugs                     Done
  ✅ 7.2 Squad Origin Corrections              Done
  ⚠️  DIVERGÊNCIA: Epic diz "1/2 done" mas stories indicam 2/2 Done

Epic 9 — Functional Enhancements              0/2
  📄 9.1 (no story file found)
  📄 9.2 (no story file found)

═══════════════════════════════════════════════════════

Qualidade: {test_count} testes | Lint: {status} | TypeCheck: {status}

Próximo: {next story recommendation}
```

### Status Icons

| Icon | Status      | Description                    |
| ---- | ----------- | ------------------------------ |
| ✅   | Done        | Story completed and QA passed  |
| 🔄   | InProgress  | Story being implemented        |
| ⏳   | Ready       | Story validated, ready for dev |
| 📝   | Draft       | Story created, not validated   |
| 🔍   | InReview    | Story in QA review             |
| 📄   | —           | No story file exists           |
| ⚠️   | DIVERGENCE  | Epic metadata doesn't match    |

---

## Divergence Resolution

When divergence is detected, suggest the fix:

```text
⚠️  DIVERGÊNCIA detectada em Epic 7:
    Epic file diz: "In Progress (1/2 stories done)"
    Stories reais: 2/2 Done

    Sugestão: Atualizar epic-7-critical-fixes-data-config.md
      status: "Done (2/2 stories done)"
```

---

## Pre-Conditions

```yaml
pre-conditions:
  - [ ] Directory docs/stories/ exists
    tipo: pre-condition
    blocker: true
    error_message: "No docs/stories/ directory found"
```

---

## Post-Conditions

```yaml
post-conditions:
  - [ ] Every story file in docs/stories/ was read for status
    tipo: post-condition
    blocker: true
    validação: |
      Count of story files read == count of story files found by Glob
    error_message: "Not all story files were read — status may be inaccurate"
```

---

## Anti-Patterns (NEVER DO)

1. **NEVER** rely on epic files for story status — epics are summaries that can be stale
2. **NEVER** use gitStatus snapshot — it's frozen at conversation start
3. **NEVER** delegate to a subagent without explicit instruction to "read the ## Status section of EVERY story file"
4. **NEVER** assume a story doesn't exist without running Glob first
5. **NEVER** report status without having read the actual `## Status` field from the file
6. **NEVER** use git log to infer story completion

---

## Error Handling

**Strategy:** graceful-fallback

**Common Errors:**

1. **Error:** Story file has no Status field
   - **Resolution:** Report as "⚠️ Status field missing"
   - **Recovery:** Flag for manual review

2. **Error:** Epic references story that has no file
   - **Resolution:** Report as "📄 No story file"
   - **Recovery:** Note in output, continue with other stories

3. **Error:** Story file exists but is not referenced in any epic
   - **Resolution:** Report as orphan story
   - **Recovery:** List in "Orphan Stories" section

---

## Performance

```yaml
duration_expected: 10-30 seconds
cost_estimated: $0.001-0.005
token_usage: ~1,000-5,000 tokens
optimization: |
  Read each story file and search for the ## Status section heading.
  Use parallel Read calls for multiple story files.
  Cache nothing — always read fresh.
```

---

## Metadata

```yaml
version: 1.0.0
tags:
  - project-management
  - status
  - panorama
updated_at: 2026-03-05
agents: [aiox-master, po, sm]
```

---

## Related Commands

- `*orchestrate-status {story-id}` — Status de uma story específica em orquestração
- `*build-status {story-id}` — Status de build autônomo
- `*stories-index` — Regenerar índice de stories

---

## User Preferences

- **Full panorama by default:** Always show ALL epics and ALL stories, not just current epic
- **Include progress counts, story statuses, and next steps**

---

_Task criada para resolver o problema de status reporting impreciso — garantindo que `*status` sempre leia a fonte da verdade (story files) ao invés de dados derivados (epic metadata, git log)._
