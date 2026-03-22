# Phase 3: Build Loop

> Implementation + QA per story, with error recovery

---

## Purpose

Aqui e onde o codigo nasce. Pense nessa fase como a linha de montagem: cada story entra como materia-prima e sai como feature pronta e testada. Se algo der errado, o GPS recalcula — nao volta pro inicio.

---

## Execution Steps

### Step 1: Determine Stories to Build

**SINGLE_FEATURE mode:**
- Create ONE story from the user's feature description
- Use @sm to draft, @po to validate (inline, not subagent — fast)

**FULL_APP mode:**
- Stories already exist from Phase 2
- Read story list from state.json: `phases.2.stories`
- Execute in priority order

**BUG_FIX mode:**
- Skip story creation
- Go directly to @dev with the bug description
- Minimal SDC: @dev -> @qa -> done

### Step 2: Story Development Cycle (per story)

For each story, execute the SDC subloop:

#### 2.1 — Story Creation (@sm)

**Skip if:** stories already exist (FULL_APP) or BUG_FIX mode.

Dispatch @sm:
- Read `.aios-core/development/agents/aios-sm.md`
- Read `.aios-core/development/tasks/create-next-story.md`
- Input: feature description + project context
- Inject ecosystem context: relevant skills for this domain
- Output: Story file created at `docs/stories/active/`

Show handoff:
```
  ┌─────────┐         ┌─────────┐
  │  @sm    │  ──→→→  │  @po    │
  │ River   │  story  │ Pax     │
  │  ✅     │  criada │  🔄     │
  └─────────┘         └─────────┘
```

#### 2.2 — Story Validation (@po)

**Skip if:** BUG_FIX mode.

Dispatch @po:
- Read `.aios-core/development/agents/aios-po.md`
- Read `.aios-core/development/tasks/validate-next-story.md`
- Input: Story file from 2.1
- Veto: Score < 7/10
  - If veto: return to @sm with @po's feedback
  - Max 2 SM-PO iterations
  - After 2: proceed anyway (PO marks concerns but approves)
- Output: Story status = "Ready"

#### 2.3 — Implementation (@dev)

Dispatch @dev:
- Read `.aios-core/development/agents/aios-dev.md`
- Read `.aios-core/development/tasks/dev-develop-story.md`
- Mode: YOLO (autonomous)
- Input:
  - Story file (status: Ready)
  - Project context from state.json
  - **Ecosystem context**: inject skills from context-pack relevant to this story
    - Example: if story involves React components, inject `nextjs-react-expert`
    - Example: if story involves copy/text, inject relevant mind frameworks
  - Architecture docs (if FULL_APP, from Phase 1)
- Output: Code changes, story status "In Review"

Show progress:
```
  🔨 @dev implementando story {id}: "{title}"...
```

#### 2.4 — Veto Conditions (automatic, before QA)

Run quality checks via Bash:
1. `npm run lint` — must pass with 0 errors
2. `npm run typecheck` — must pass with 0 errors
3. `npm test` — must pass (if tests exist)

If ANY check fails:
1. Show what failed (from personality.md error format)
2. Re-dispatch @dev with the specific error output
3. Max 2 veto fix attempts
4. After 2: proceed to @qa anyway

#### 2.5 — Quality Gate (@qa)

Dispatch @qa:
- Read `.aios-core/development/agents/aios-qa.md`
- Read `.aios-core/development/tasks/qa-review-story.md`
- Input: Story file + code changes
- Decision:
  - **APPROVED** -> Story Done ✅
  - **CONCERNS** -> Story Done with notes ✅ (minor issues logged)
  - **FAIL** -> Enter Error Recovery (runner.md Section 4)

#### 2.6 — Story Complete

1. Mark story as Done in state.json
2. Show: `"✅ Story {N}/{total}: {title} — Done"`
3. Check if checkpoint needed (every `config.checkpoint_interval` stories)
4. If checkpoint:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  🔴 CHECKPOINT — Progresso do Build
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  ✅ {N} stories concluidas de {total}
  ⚠️ {errors} erros encontrados e resolvidos
  ⏭️ Proximas: {next 3 story titles}

  1. Continuar
  2. Pausar e revisar o que foi feito
  3. Parar aqui (salvo o progresso)
```

### Step 3: All Stories Complete

When all stories are done:
1. Update state.json: `phases.3.status = "completed"`
2. Show summary:
```
  Build Loop completo!
  ✅ {N} stories implementadas
  ⚠️ {errors} erros resolvidos
  ⏭️ Proximo: Deploy
```
3. Proceed to Phase 5 (or Phase 4 for FULL_APP)

---

## Error Recovery Integration

When @qa returns FAIL, the runner (runner.md Section 4) analyzes the error type and routes accordingly. This phase file does NOT handle error recovery directly — it delegates to the runner's Error Recovery Tree.

The runner will either:
- Re-dispatch @dev (generic error)
- Dispatch @architect (architecture error)
- Dispatch @data-engineer (DB error)
- CHECKPOINT the user (ambiguous requirement)
- HALT (stuck after 3x)

After recovery, execution returns to step 2.5 (re-run @qa).

---

## Outputs

- All stories implemented and marked Done
- Code changes committed locally (NOT pushed — that's Phase 5)
- Build log in state.json with per-story results
- Error log with all errors and resolutions
