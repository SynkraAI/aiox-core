# Phase 3: Build Loop

> Implementation + QA per story, with error recovery

---

## Purpose

Aqui é onde o código nasce. Pense nessa fase como a linha de montagem: cada story entra como matéria-prima e sai como feature pronta e testada. Se algo der errado, o GPS recalcula — não volta pro início.

---

## Execution Steps

### Step 0: Enter Phase (MANDATORY)

Execute runner.md Section 2, Step 1 ("Enter Phase") para N=3 antes de prosseguir.

### Step 1: Core Atom Proof of Life (FIRST — before any other story)

**Check state.json for `core_atom` field:**

- If `core_atom.risk_level` is "high" or "medium":
  - **Story 0.0 é OBRIGATÓRIA e BLOQUEANTE**
  - Nenhuma outra story pode ser implementada até Story 0.0 passar

**Story 0.0 — Proof of Life:**

```markdown
# Story 0.0: Core Atom — Proof of Life

## Objetivo
Provar que o Core Atom funciona antes de construir qualquer outra coisa.

## Core Atom
{{CORE_ATOM_DESCRIPTION}}

## Acceptance Criteria
- [ ] Implementar APENAS o Core Atom (nada mais)
- [ ] Criar script CLI para testar: `scripts/proof-of-life.js`
- [ ] Executar PoL e documentar resultado
- [ ] PoL passou 3x consecutivas

## Proof of Life Test
Comando: `{{POL_COMMAND}}`
Input: {{POL_INPUT}}
Output esperado: {{POL_EXPECTED_OUTPUT}}

## Go/No-Go
- [ ] PoL passou → CONTINUAR para próximas stories
- [ ] PoL falhou → PARAR e repensar abordagem
```

**Execution:**

1. Dispatch @dev com Story 0.0
2. @dev implementa APENAS o Core Atom
3. @dev roda o PoL 3x
4. Se PASSOU:
   ```
   ✅ Proof of Life PASSOU (3/3)
   Core Atom validado. Liberando próximas stories.
   ```
   - Marcar `core_atom.validated = true` no state.json
   - Continuar para Step 2

5. Se FALHOU:
   ```
   ❌ Proof of Life FALHOU

   O Core Atom não funcionou. Isso significa que a abordagem atual
   pode não ser viável. Antes de continuar:

   1. Investigar o problema
   2. Tentar abordagem alternativa
   3. Pivotar (mudar a estratégia)
   4. Cancelar o projeto
   ```
   - CHECKPOINT obrigatório — não continuar sem decisão do usuário
   - Se "Investigar": dispatch @architect para analisar
   - Se "Alternativa": voltar para Phase 1 com nova abordagem
   - Se "Pivotar": voltar para Phase 0
   - Se "Cancelar": encerrar run

**Skip if:**
- `core_atom.risk_level` is "low" ou "none"
- `core_atom` is "CRUD padrão"
- BUG_FIX mode

### Step 2: Determine Stories to Build

**SINGLE_FEATURE mode:**
- Create ONE story from the user's feature description
- Use @sm to draft, @po to validate (inline, not subagent — fast)

**FULL_APP mode:**
- Stories already exist from Phase 2
- Read story list from state.json: `phases.2.stories`
- Read dependency graph from state.json: `phases.2.dependency_graph`
- **Separar em dois grupos: MVP (`mvp: true`) e Post-MVP (`mvp: false`)**
- **Executar MVP stories PRIMEIRO**
- **Ordering: use dependency graph levels (topological sort), NOT simple priority**
  - For each dependency level (0, 1, 2, ...):
    - Execute stories at this level in priority order
    - Before starting each story: verify ALL stories in its `depends_on` array have status "Done"
    - If a dependency is not Done: skip this story, move to next eligible story at this level
    - Stories at the same level with no mutual dependencies are parallelizable (see Feature 7)
  - If dependency_graph is not present (older runs, SINGLE_FEATURE): fall back to simple priority order
- Story 0.0 (Proof of Life) já foi feita no Step 1
- Post-MVP stories SÓ começam após MVP Gate (Step 2b)

**BUG_FIX mode:**
- Skip story creation
- Go directly to @dev with the bug description
- Minimal SDC: @dev -> @qa -> done

### Step 2: Story Development Cycle (per story)

For each story, execute the SDC subloop:

#### 2.1 — Story Creation (@sm)

**Skip if:** stories already exist (FULL_APP) or BUG_FIX mode.

Dispatch @sm:
- Read `{AIOS_HOME}/.aios-core/development/agents/aios-sm.md`
- Read `{AIOS_HOME}/.aios-core/development/tasks/create-next-story.md`
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
- Read `{AIOS_HOME}/.aios-core/development/agents/aios-po.md`
- Read `{AIOS_HOME}/.aios-core/development/tasks/validate-next-story.md`
- Input: Story file from 2.1
- Veto: Score < 7/10
  - If veto: return to @sm with @po's feedback
  - Max 2 SM-PO iterations
  - After 2: proceed anyway (PO marks concerns but approves)
- Output: Story status = "Ready"

#### 2.3 — Implementation (@dev)

Dispatch @dev:
- Read `{AIOS_HOME}/.aios-core/development/agents/aios-dev.md`
- Read `{AIOS_HOME}/.aios-core/development/tasks/dev-develop-story.md`
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
- Read `{AIOS_HOME}/.aios-core/development/agents/aios-qa.md`
- Read `{AIOS_HOME}/.aios-core/development/tasks/qa-review-story.md`
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

  ✅ {N} stories concluídas de {total}
  ⚠️ {errors} erros encontrados e resolvidos
  ⏭️ Próximas: {next 3 story titles}

  1. Continuar
  2. Pausar e revisar o que foi feito
  3. Parar aqui (salvo o progresso)
```

### Step 2b: MVP Gate (MANDATORY — FULL_APP only)

**Quando TODAS as stories MVP forem completadas, PARAR e apresentar o MVP Gate.**

Este é o checkpoint mais importante do pipeline inteiro. É como o test drive antes de entregar o carro — o motor funciona, a direção responde, os freios seguram. Só depois de confirmar que anda é que você instala o som premium e o teto solar.

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  🎯 MVP GATE — Momento da verdade
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  ✅ MVP completo! {M} stories implementadas.
  📋 O que foi construído:
  {lista de stories MVP com título}

  ⏸️ Post-MVP pendente: {K} stories
  {lista de stories post-MVP com título}

  ━━━ O QUE FAZER AGORA? ━━━

  1. 🚀 **Deploy MVP**
     Fazer deploy do que tem agora. Post-MVP fica pra depois.
  2. ➡️ **Continuar pro post-MVP**
     MVP tá bom, quero continuar construindo as features extras.
  3. 🔍 **Revisar MVP primeiro**
     Quero testar/validar antes de decidir.
  4. ✏️ **Ajustar escopo**
     Mover stories entre MVP e post-MVP.
  5. 🛑 **Parar aqui**
     Salvar progresso e encerrar.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Comportamento por opção:**

- **Opção 1 (Deploy MVP):** Pular stories post-MVP, ir direto para Phase 4 (Integration) → Phase 5 (Deploy). Post-MVP stories ficam salvas no state.json para um run futuro.
- **Opção 2 (Continuar):** Executar stories post-MVP no mesmo SDC loop.
- **Opção 3 (Revisar):** CHECKPOINT — esperar feedback do usuário. Se tiver bugs/ajustes, criar stories de fix e executar antes de prosseguir.
- **Opção 4 (Ajustar):** Mostrar todas as stories e permitir mover entre MVP/post-MVP. Re-executar Step 2b com novo escopo.
- **Opção 5 (Parar):** Salvar state.json com `mvp.validated = true` e status do run como "paused_at_mvp".

**Regra NON-NEGOTIABLE:** O MVP Gate é OBRIGATÓRIO quando `mvp.mode` != "all" E existem stories post-MVP. Se `mvp.mode` == "all", PULAR o gate (todas as stories são MVP, não faz sentido parar no meio).

**Update state.json após MVP Gate:**
```json
{
  "mvp": {
    "validated": true,
    "validated_at": "2026-04-01T15:00:00Z",
    "decision": "deploy|continue|review|adjust|stop"
  }
}
```

---

### Step 3: All Stories Complete

When all stories are done (MVP + post-MVP, ou só MVP se usuário escolheu deploy):
1. Update state.json: `phases.3.status = "completed"`
2. Show summary:
```
  Build Loop completo!
  ✅ {N} stories implementadas
  ⚠️ {errors} erros resolvidos
  ⏭️ Próximo: Deploy
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
