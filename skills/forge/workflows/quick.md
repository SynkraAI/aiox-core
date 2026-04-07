# Workflow: Quick

> Descreve. Constrói. Checa. Entrega. Sem cerimônia.

---

## When to Use

- User runs `/forge quick "add dark mode toggle"` or `/forge q "add X"`
- User wants fast-track implementation with zero ceremony
- Scope: 1 story, single focused change, existing project only
- NOT for: greenfield apps, multi-story features, tasks needing research

---

## Pipeline

```
Phase 0 (Context Snap) -> Phase 3 (Build + Check) -> Phase 5 (Deploy)
```

Phase 0 is AUTOMATIC (no questions, no checkpoint).
Phase 3 is COMPRESSED (story auto-created, no @sm/@po dispatch, no @qa dispatch).
Phase 5 keeps the deploy checkpoint (Article II compliance).

---

## Execution

### Phase 0: Context Snap (AUTOMATIC — zero questions)

DO NOT read `phase-0-discovery.md`. Quick mode replaces Phase 0 entirely.

1. Show banner (`personality.md`) with `⚡ QUICK MODE` indicator
2. **Project detection** (MANDATORY — quick mode ONLY works in existing projects):
   - Read `package.json` (or `Cargo.toml`, `go.mod`, `requirements.txt`) → stack, scripts
   - Run `ls` top-level → folder structure
   - Run `git log -3 --oneline` → recent context
   - Read `.aios/memory/project-context.md` if exists → known context
3. If NO existing project detected:
   - BLOCK: "⚡ Quick mode precisa de um projeto existente. Quer rodar `/forge feature` ao invés?"
   - STOP execution
4. **Guardrails** — check if description is too complex for quick mode:
   - If description contains 3+ distinct features joined by "e"/"and" ("add auth AND dashboard AND API"):
     - Warn: "Isso parece grande demais pra quick mode. Quer rodar `/forge feature` pra ter mais estrutura?"
     - If user insists ("só faz", "vai"): proceed anyway
   - If description contains research words ("investigate", "figure out", "explore", "pesquisar"):
     - Warn: "Isso parece precisar de pesquisa. Quer rodar `/forge feature`?"
     - If user insists: proceed anyway
5. Skip ecosystem scan entirely (too slow for quick mode)
6. Initialize run:
   - Create run folder: `.aios/forge-runs/forge-{slug}-{YYYYMMDD-HHmm}/`
   - Create `state.json` with `mode: "QUICK"`, `quick_mode: true`
   - Create `.aios/forge-runs/.lock`
7. Proceed immediately to Phase 3

**Duration target:** < 15 seconds.

### Phase 3: Build + Check (COMPRESSED)

DO NOT read `phase-3-build.md`. Quick mode has its own build logic.
DO NOT dispatch @sm or @po. Story is auto-generated inline by Forge.

#### Step 1: Auto-Generate Story (Article III compliance)

Create a minimal story file at `docs/stories/active/` using next available `Q.{N}` ID:

```markdown
# Story Q.{N}: quick: {user description}

## Type
quick

## Description
{user description — verbatim from command}

## Acceptance Criteria
- [ ] Feature implemented as described
- [ ] No regressions introduced
- [ ] Lint passes
- [ ] TypeCheck passes (if applicable)
- [ ] Tests pass (if applicable)

## Status: Ready
## Priority: P1
## Created by: Forge Quick Mode (auto-generated)
```

Notes:
- Story ID uses `Q.{N}` prefix to avoid collision with regular numbering (1.1, 1.2, etc.)
- No @sm dispatch — user's description IS the story
- No @po validation — AC is standardized and objective
- This is constitutional compliance only. Forge creates the metadata, @dev writes the code.

#### Step 2: Dispatch @dev (YOLO mode)

1. Read agent file: `{AIOS_HOME}/.aios-core/development/agents/aios-dev.md`
2. Read task file: `{AIOS_HOME}/.aios-core/development/tasks/dev-develop-story.md`
3. Dispatch @dev via Agent tool (`subagent_type: aiox-dev`):
   - Story file from Step 1
   - Project context from Phase 0 snap (package.json summary, folder structure)
   - User's original description (verbatim)
   - Mode: YOLO (autonomous, no human interaction)
4. NO ecosystem context injection (skipped for speed)

#### Step 3: Veto Conditions (automatic — Article V compliance)

Run quality checks based on detected project scripts:
1. `npm run lint` (or equivalent from package.json)
2. `npm run typecheck` (if script exists)
3. `npm test` (if script exists)

**If ANY check fails:**
- Re-dispatch @dev with the error output (max 2 retries)
- After 2 failed retries: CHECKPOINT — ask user what to do:
  1. "Tentar mais uma vez"
  2. "Deployar mesmo assim (skip checks)"
  3. "Cancelar"

**If ALL checks pass:** proceed automatically (no checkpoint).

#### Step 4: Quick QA (automated — no @qa dispatch)

Instead of dispatching @qa as subagent, run automated verification:
- Verify all veto conditions passed in Step 3
- Mark story AC checkboxes as done
- Update story status to `Done`
- Log result in `state.json`

This is intentionally faster than full @qa. The veto conditions already enforce Article V.
If the user wants thorough review, they should use `/forge feature`.

### Phase 5: Deploy

Read `{FORGE_HOME}/phases/phase-5-deploy.md`:
1. **CHECKPOINT:** "⚡ Pronto. Deployar?"
2. @devops: commit with `quick: {description}` + push + PR
3. Completion banner with ⚡ Quick Mode indicator
4. Clean up: remove `.aios/forge-runs/.lock`, update `state.json` status to `completed`

---

## Agent Mapping

| Phase | Primary Agent | Supporting |
|-------|---------------|------------|
| 0 - Context Snap | (Forge core) | — |
| 3 - Build + Check | @dev | — |
| 5 - Deploy | @devops | — |

Note: @sm, @po, and @qa are NOT used in quick mode.

---

## Progress Display

```
  ✅ Snap  ->  🔄 Build  ->  ○ Ship
```

---

## Typical Duration

- Phase 0: ~10-15 seconds (auto, no questions)
- Phase 3: 3-10 minutes (depends on complexity)
- Phase 5: 1-2 minutes (push + PR)

Total: ~5-12 minutes. Fastest Forge workflow.

---

## Constitutional Compliance

| Article | How Quick Mode Complies |
|---------|----------------------|
| II — Agent Authority | @devops still owns push/PR in Phase 5 |
| III — Story-Driven | Story auto-created before @dev starts (precedent: bug-fix.md) |
| IV — No Invention | Description comes from user, verbatim |
| V — Quality First | Veto conditions run automatically (lint + typecheck + test) |

---

## Error Recovery (simplified)

Quick mode uses a simplified error recovery (no @architect or @data-engineer escalation):

| Error Type | Action |
|------------|--------|
| Lint/typecheck/test failure | Retry @dev up to 2x, then CHECKPOINT |
| Same error repeated 2x | HALT immediately + offer: "Isso parece complexo demais pra quick mode. Quer mudar pra `/forge feature`?" |
| @dev blocked | CHECKPOINT — ask user |
| Generic error | Retry @dev 1x, then HALT |

Lower threshold than normal modes — if it's complex enough to fail twice, it's not a quick task.
