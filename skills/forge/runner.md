# Forge Runner — Execution Engine

> The heart of Forge. A state machine that orchestrates AIOS agents phase by phase.

---

## 1. Runner Lifecycle

```
INIT -> PHASE_0 -> PHASE_3 -> PHASE_5 -> COMPLETE
                      |
                      +-- (per story) -> SDC subloop
                      |     SM -> PO -> DEV -> QA
                      |                  |
                      |           FAIL -> RETRY (max 3)
                      |           FAIL 3x -> ESCALATE
                      +-- CHECKPOINT (every N stories)
```

For FULL_APP mode, the lifecycle expands to:
```
INIT -> PHASE_0 -> PHASE_1 -> PHASE_2 -> PHASE_3 -> PHASE_4 -> PHASE_5 -> COMPLETE
```

---

## 1.1 State Validation (runs once before Phase 1)

Antes de entrar na primeira fase de execução (Phase 1 para FULL_APP, Phase 3 para SINGLE_FEATURE/BUG_FIX), validar que o state.json tem os campos mínimos obrigatórios.

**Exceção: QUICK mode** — skip state validation inteiramente. QUICK mode não gera `discovery` nem `tech_decisions` (Phase 0 é Context Snap automático, sem perguntas). Campos obrigatórios para QUICK são apenas: `run_id`, `mode`, `status`. O runner DEVE detectar `mode == "QUICK"` e pular esta seção.

**Campos obrigatórios para modos não-QUICK (HALT se ausente):**
- `run_id` — identificador do run
- `mode` — modo de execução. **Valores válidos:** FULL_APP, SINGLE_FEATURE, BUG_FIX, QUICK, BROWNFIELD, DESIGN_SYSTEM, LANDING_PAGE, CLONE_SITE, SQUAD_UPGRADE, DRY_RUN, REPLAY, TEMPLATE, STRESS_TEST. Se o valor não estiver nesta lista: HALT com `"Mode inválido: '{mode}'. Valores válidos: {lista}."`.
- `status` — deve ser "running". **Valores válidos:** running, completed, converted, saved, cancelled. Se o valor não estiver nesta lista: HALT.
- `discovery` — respostas do Phase 0
- `tech_decisions` — stack técnica (deve incluir `architecture` e `repo_structure`)

**Validação de `tech_decisions.repo_structure`:**
- Se `repo_structure` ausente mas `architecture` presente: derivar automaticamente usando regra do `tech-decisions-guide.md` (`separated_api` → `monorepo_workspaces`, `monorepo` → `monorepo_workspaces`, `fullstack_together` → `single_package`). Salvar no state.json e prosseguir (backwards compatible com runs antigos).
- Se ambos ausentes: HALT normalmente (tech_decisions incompleto).

**Campos obrigatórios se `mode` = FULL_APP:**
- `mvp` — escopo MVP definido
- `core_atom` — risco técnico avaliado

**Campos opcionais com uso ativo:**
- `source_dry_run` — se presente, significa que este run veio de um DRY_RUN convertido. Nesse caso:
  1. Mostrar: `"🔄 Run convertido de dry-run {source_dry_run.run_id}"`
  2. Na Phase 4 (Integration), comparar `source_dry_run.simulation_estimate.stories` com o total real de stories. Se divergência > 50%, registrar como learning para o forge-memory (calibra estimativas futuras).
- `discovery.market_research` — se presente com `executed: true`:
  1. Verificar que `research_folder` existe no filesystem
  2. Se pasta não existe: log WARNING `"Pasta de pesquisa não encontrada: {path}"` mas NÃO bloquear (pesquisa pode ter sido movida/renomeada)
  3. Carregar classificação de soluções (solutions, table_stakes, gaps, recommendation) para injeção no contexto do Phase 1 (@pm)

Se algum campo obrigatório estiver ausente: **HALT** com mensagem `"State incompleto: campo '{field}' ausente. Run não pode prosseguir."` — não tentar adivinhar ou preencher com defaults.

---

## 2. Execution Protocol (for EACH phase)

### Step 0: State Validation Gate (ONCE — before first execution phase)

**Quando executar:** Exatamente UMA vez, antes de entrar na primeira fase de execução real:
- FULL_APP → antes de Phase 1
- SINGLE_FEATURE / BUG_FIX → antes de Phase 3
- RESUME → antes de retomar a fase interrompida

**O que fazer:** Executar a validação descrita em Section 1.1. Se HALT: não prosseguir. Se PASS: marcar `state_validated: true` em state.json e nunca re-executar.

**Referência cruzada:** Esta é a ÚNICA chamada de Section 1.1. Se Section 1.1 não for executada aqui, ela não será executada em lugar nenhum.

### Step 1: Enter Phase
1. Read the phase file from `{FORGE_HOME}/phases/phase-{N}-{name}.md`
2. Show phase header (from personality.md)
3. Show progress indicator with updated status
4. Update state.json: `phases.{N}.status = "running"`, `current_phase = N`
5. **Fire hook: `before:phase:{N}`** — execute all subscribed plugins in priority order (see Section 2.5)

### Step 2: Execute Phase
1. Follow the phase file instructions exactly
2. For agent dispatch: use the Agent Dispatch Protocol (SKILL.md Section 5)
   - **Fire hook: `on:agent-dispatch`** before dispatching each agent
   - **Fire hook: `on:agent-return`** after each agent returns
3. For checkpoints: **fire hook: `on:checkpoint`**, then show checkpoint format and wait for user input

### Step 3: Exit Phase
1. Verify phase outputs exist (files created, validations passed)
2. **Fire hook: `after:phase:{N}`** — execute all subscribed plugins in priority order
3. Update state.json: `phases.{N}.status = "completed"`, `phases.{N}.completed_at = now`
4. Show handoff visual if next phase involves a different agent
5. Proceed to next phase

---

## 2.5. Plugin System

The Forge Plugin System loads and fires plugins automatically. Plugins are YAML files in `{FORGE_HOME}/plugins/` that subscribe to lifecycle hooks. The user never interacts with plugins directly.

### Boot Sequence (runs once at start of every Forge run)

1. **Discover:** Glob `{FORGE_HOME}/plugins/*.yaml`
1.5. **Parse with guard:** Para cada arquivo YAML, tentar parsear. Se o parse falhar (YAML inválido): log warning `"⚠️ Plugin '{filename}' com YAML inválido — ignorando."` e skip esse plugin. NUNCA crashar por causa de um plugin corrompido.
2. **Filter:** Remove plugins where `activation.enabled = false`
3. **Filter by mode:** Remove plugins where current Forge mode is not in `activation.modes` (skip this filter if `modes` is omitted — plugin is active for all modes)
4. **Sort:** Order remaining plugins by `priority` ascending (lower = first). Same priority → alphabetical by name.
5. **Build registry:** Create a map from hook name → ordered list of subscribed plugins

If `{FORGE_HOME}/plugins/` does not exist or is empty, skip the entire plugin system and use legacy behavior. This ensures backwards compatibility.

### Boot Log (OBRIGATÓRIO — visível ao usuário)

Após o boot, mostrar um resumo compacto dos plugins carregados:

```
  ⚡ Plugins: {N} ativos — {lista de nomes separados por vírgula}
```

Exemplo: `⚡ Plugins: 5 ativos — lifecycle, ecosystem-scanner, forge-memory, forge-feedback, quest-sync`

Se nenhum plugin carregou: `⚡ Plugins: modo legado (nenhum plugin encontrado)`

Isso dá visibilidade ao usuário de que o plugin system está funcionando e quais plugins estão influenciando o run.

### Firing Protocol (runs at each hook point)

When a hook fires (e.g., `before:phase:3`):

1. Look up the hook in the registry. Check both the specific hook (`before:phase:3`) and the wildcard (`before:phase:*`). Merge results, maintaining priority order.
2. For each subscribed plugin, in priority order:
   a. Check `filter` conditions if present (e.g., `filter.phases`). Skip if no match.
   b. If `source` is defined: read the source file (or just the `section` heading if specified).
   c. Execute the `action` described in the plugin's `description` or `source` file.
   d. If action is `validate` and fails:
      - `severity: recommended` → log as CONCERNS, continue (soft veto)
      - `severity: optional` → log as INFO, continue (no veto)
   e. Write any results to `state.json` under `plugins.{state_key}` namespace.

### Plugin State in state.json

Plugin data lives under a dedicated namespace to avoid conflicts:

```json
{
  "plugins": {
    "lifecycle": { "last_checkpoint": { "phase": 0, "choice": 1 } },
    "ecosystem_scan": { "context_items": 3 },
    "quest_sync": { "stories_completed": 4, "run_completed": false }
  }
}
```

### Reference

Full schema, hook taxonomy, priority ranges, and creation guide: `{FORGE_HOME}/plugins/SCHEMA.md`

---

## 3. SDC Subloop (Story Development Cycle — Phase 3)

For each story in priority order:

### 3.0 Parallel Execution Mode (Optional)

**Prerequisite:** `config.parallel.enabled = true` AND `phases.2.dependency_graph` exists in state.json.

If both conditions are met:
1. Read `dependency_graph.levels` from state.json
2. For each dependency level with **2+ stories**: these stories are parallelizable
3. Enter Parallel SDC mode: read `{FORGE_HOME}/forge-parallel.md` for the full protocol
4. Parallel stories execute in git worktrees, merge results, run veto checks on merged code

If conditions are NOT met: use standard sequential SDC below (no change from current behavior).

**Reference:** `{FORGE_HOME}/forge-parallel.md` for complete worktree, merge, and conflict resolution protocol.

---

### 3.1 Story Creation (@sm)

Dispatch @sm via Agent tool with:
- Agent: `{AIOS_HOME}/.aios-core/development/agents/aios-sm.md`
- Task: `{AIOS_HOME}/.aios-core/development/tasks/create-next-story.md`
- Input: Epic/PRD from Phase 1 (or user description for SINGLE_FEATURE)
- Output: Story file at `docs/stories/active/{run_id}/{id}.story.md`

### 3.2 Story Validation (@po)

Dispatch @po via Agent tool with:
- Agent: `{AIOS_HOME}/.aios-core/development/agents/aios-po.md`
- Task: `{AIOS_HOME}/.aios-core/development/tasks/validate-next-story.md`
- Input: Story file from 3.1
- Veto: Score < 7/10 -> return to @sm with feedback (max 2 retries)
- Output: Story status updated to "Ready"

### 3.3 Implementation (@dev)

Dispatch @dev via Agent tool with:
- Agent: `{AIOS_HOME}/.aios-core/development/agents/aios-dev.md`
- Task: `{AIOS_HOME}/.aios-core/development/tasks/dev-develop-story.md`
- Mode: YOLO (autonomous)
- Input: Story file (status: Ready) + project context
- Output: Code changes, story status "In Progress" -> "In Review"

### 3.4 Quality Gate (@qa)

Dispatch @qa via Agent tool with:
- Agent: `{AIOS_HOME}/.aios-core/development/agents/aios-qa.md`
- Task: `{AIOS_HOME}/.aios-core/development/tasks/qa-review-story.md`
- Input: Story file + code changes from @dev
- Decision:
  - **PASS** -> Mark story Done, proceed to next story
  - **FAIL** -> Enter Error Recovery (Section 4)

### 3.5 Progress Tracking

After each story completes:
1. Update state.json: `phases.3.stories_completed += 1`
2. **Fire hook: `on:story-complete`** — plugins log metrics, trigger cross-story validations
3. Show mini progress: `"Story {N}/{total} done ✅"`
4. Every `config.checkpoint_interval` stories (default: 3): show CHECKPOINT

---

## 4. Error Recovery Tree

When an error occurs in Phase 3 (Build Loop):

1. **Fire hook: `on:error`** — plugins log the error, inject recovery context, and display error banners
2. Then analyze the error and route intelligently:

### Detection

Parse the Agent tool response for error signals:
- Output contains "architecture", "design pattern", "wrong abstraction" -> **ARCHITECTURE_ERROR**
- Output contains "migration", "schema", "database", "RLS", "query" -> **DB_ERROR**
- Output contains "unclear", "ambiguous", "not sure if", "should this" -> **REQUIREMENT_ERROR**
- Same error message appears 3 times -> **STUCK**
- Any other error -> **GENERIC_ERROR**

### Routing

```
ARCHITECTURE_ERROR:
  1. Show error banner (personality.md)
  2. Dispatch @architect with the specific issue
  3. @architect provides design guidance
  4. Re-dispatch @dev with architect's guidance
  5. If still fails -> CHECKPOINT (ask user)

DB_ERROR:
  1. Show error banner
  2. Dispatch @data-engineer with the specific DB issue
  3. @data-engineer creates/fixes migration or schema
  4. Re-dispatch @dev with updated schema
  5. If still fails -> CHECKPOINT (ask user)

REQUIREMENT_ERROR:
  1. Show CHECKPOINT with the ambiguity
  2. Ask user to clarify
  3. If user doesn't know -> dispatch @po to refine the story AC
  4. Re-dispatch @dev with clarified requirement

STUCK (same error 3x):
  1. HALT execution
  2. Show diagnostic:
     - What was attempted (3 times)
     - What failed each time
     - Possible causes
  3. Offer options (TODAS obrigatórias — nunca omitir):
     a. "Chamar @architect pra analisar o problema"
     b. "Pular essa story (marcar como SKIPPED) e continuar com a próxima"
     c. "Parar aqui e salvar progresso"
  4. If user chooses (b): mark story as SKIPPED in state.json, log reason, proceed

GENERIC_ERROR:
  1. Retry @dev with error context (max 3 retries)
  2. After 3 retries -> escalate to @aios-master
  3. @aios-master operates with Agent Authority guardrails:
     - CANNOT do git push (that's @devops)
     - CANNOT delete files without confirmation
     - CAN modify code, config, and dependencies
     - Max 1 attempt
  4. If @aios-master fails -> HALT + offer same 3 options as STUCK (a, b, c)
     Option (b) "pular story" MUST always be available — never leave user without exit
```

### Error Log

Every error is logged in state.json:
```json
{
  "errors": [
    {
      "phase": 3,
      "story_id": "1.2",
      "type": "GENERIC_ERROR",
      "message": "npm run typecheck failed: Property 'x' does not exist",
      "retry_count": 1,
      "escalated_to": null,
      "resolved": true,
      "timestamp": "2026-03-21T15:30:00Z"
    }
  ]
}
```

---

## 5. Veto Conditions (automatic quality gates)

Before moving to the next story in Phase 3, automatically verify.
After each veto check result, **fire hook: `on:veto`** — plugins can add checks or log results.

### Hard Vetos (BLOCK — nunca prosseguir sem resolver)

| Check | Command | Veto If | Action |
|-------|---------|---------|--------|
| Lint | `npm run lint` | Any errors | Re-dispatch @dev, max 3 retries, then CHECKPOINT |
| TypeCheck | `npm run typecheck` | Any errors | Re-dispatch @dev, max 3 retries, then CHECKPOINT |
| Tests | `npm test` | Any failures | Re-dispatch @dev, max 3 retries, then CHECKPOINT |

Hard vetos NUNCA são ultrapassados automaticamente. Após 3 retries, CHECKPOINT com opções:
- "Corrigir manualmente"
- "Pular story (SKIPPED)"
- "Parar aqui"

### Soft Vetos (podem prosseguir com concerns documentados)

| Check | Veto If | Action |
|-------|---------|--------|
| Story AC | AC checkbox unchecked | Warn @dev, retry 1x, after: proceed with concerns |
| PO Score | Score 5-6/10 | Proceed with concerns noted in state.json |

### PO Score Hard Veto

| Score | Action |
|-------|--------|
| >= 7/10 | Pass — prosseguir |
| 5-6/10 | Soft veto — prosseguir com concerns |
| < 5/10 | **Hard veto** — BLOQUEIA. Volta pro @sm, max 2 retries, depois CHECKPOINT |

---

## 6. Resume Protocol

### 6.0 Run Status Model

O campo `status` no state.json aceita estes valores:

| Status | Significado | Resumable? | Aparece em listagens? |
|--------|------------|------------|----------------------|
| `running` | Run em execução ativa | SIM | SIM (run ativo) |
| `completed` | Run finalizado com sucesso | NÃO | NÃO (histórico) |
| `converted` | DRY_RUN que foi convertido em run real | NÃO | NÃO (referência via `source_dry_run` no run real) |
| `saved` | DRY_RUN cujo relatório foi exportado | NÃO | SIM (como "simulação salva") |
| `cancelled` | DRY_RUN cancelado pelo usuário | NÃO | NÃO |

**Regra para listagens e filtros:**
- "Runs ativos/interrompidos" = `status == "running"` (APENAS)
- "Runs completos" = `status == "completed"`
- Ignore `converted` e `cancelled` em qualquer listagem ao usuário
- `saved` aparece em listagens como referência, mas NÃO é resumable

**Regra para `status != "completed"` checks:**
- Em `phase-0-discovery.md` Step 3 e `SKILL.md` §3 Step 4: ao listar runs interrompidos, filtrar APENAS `status == "running"`. Não mostrar `converted`/`saved`/`cancelled` como "interrompidos".

### 6.1 Resume Execution

When resuming an interrupted run (`status == "running"`):

1. Read `.aios/forge-runs/{run_id}/state.json` **with validation:**
   - Parse JSON inside try/catch
   - If JSON is invalid/corrupted: show "State do run `{run_id}` está corrompido. Quer começar um novo run ou tentar recuperar?"
   - If recover: try to read last valid phase from build-log/ files
   - If start new: archive corrupted folder as `{run_id}-corrupted/` and proceed fresh
2. **Run State Validation Gate** (Section 2, Step 0) — valida campos obrigatórios antes de retomar
3. Show: "Retomando run `{run_id}` — parado na Phase {N}"
4. Show progress indicator with current state
5. Jump to `current_phase` and continue from where it stopped
6. If Phase 3: check `stories_completed` to know which story to continue from

### State Write Safety

ALL state.json writes MUST use atomic pattern:
1. Write to `.aios/forge-runs/{run_id}/state.json.tmp`
2. Rename `.tmp` to `.json` (atomic on POSIX)
3. This prevents corruption from crashes mid-write

---

## 7. Completion Protocol

After all phases complete:

1. **Fire hook: `after:deploy`** — ONLY if Phase 5 actually deployed (push + PR created). Does NOT fire if user chose "don't deploy" or run was paused. This hook triggers post-deploy monitoring (forge-watch plugin).
2. **Fire hook: `after:run`** — plugins perform final validations, sync status, and cleanup
3. Update state.json: `status = "completed"`, `completed_at = now` (atomic write)
4. **Remove lock file:** Delete `.aios/forge-runs/.lock`
3. **Move stories:** Move `docs/stories/active/{run_id}/` to `docs/stories/done/{run_id}/` (subpasta inteira, não arquivos individuais)
4. Show completion banner (personality.md) with:
   - Run ID
   - Number of stories implemented (including SKIPPED count if any)
   - PR URL (if deployed)
   - Total errors encountered and resolved
5. If in a project with memory: save run summary to feedback memory
