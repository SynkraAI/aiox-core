# Phase 2: Story Factory

> Transformando spec em receitas executáveis

---

## Purpose

A spec diz O QUE construir. As stories dizem COMO, passo a passo. Pense nas stories como receitas de cozinha: cada uma tem ingredientes (AC), modo de preparo (tasks), e a foto do prato pronto (Definition of Done). O @sm é o chef que escreve as receitas, e o @po é o crítico que prova e diz se ficou bom.

---

## Execution Steps

### Step 0: Enter Phase (MANDATORY)

Execute runner.md Section 2, Step 1 ("Enter Phase") para N=2 antes de prosseguir.

### Step 1: Story Creation (@sm)

Dispatch @sm via Agent tool:
- Agent: `{AIOS_HOME}/.aios-core/development/agents/aios-sm.md`
- Task: `{AIOS_HOME}/.aios-core/development/tasks/create-next-story.md`
- Input:
  - Final spec from Phase 1: `.aios/forge-runs/{run_id}/spec/spec-final.md`
  - Architecture document: `.aios/forge-runs/{run_id}/spec/architecture.md`
  - Epic definition (extracted from spec)
- Instructions:
  - Create stories ONE BY ONE, not all at once
  - Each story must have: title, description (As a/I want/So that), AC, tasks, dev notes
  - **Each story MUST be tagged as `mvp: true` or `mvp: false`** based on the MVP Scope from the PRD
  - **Each story MUST declare `depends_on: []`** — list of story IDs that must be completed before this story can start. Base stories (no dependencies) get `depends_on: []`.
  - Follow the story template at `.aios-core/product/templates/story-tmpl.yaml`
  - Save each story to `docs/stories/active/`
  - **MVP stories FIRST**, then post-MVP stories
  - Suggest priority order: MVP stories ordered by dependency → post-MVP stories ordered by value
  - Dependency ordering: DB schema → API/backend → frontend/UI (natural technical flow)

Show progress:
```
  🔄 @sm (River) criando stories a partir da spec...
  Cada story é uma receita: ingredientes claros,
  modo de preparo passo a passo, foto do prato pronto.
```

### Step 2: Story Validation (@po — per story)

For EACH story created by @sm:

Dispatch @po:
- Agent: `{AIOS_HOME}/.aios-core/development/agents/aios-po.md`
- Task: `{AIOS_HOME}/.aios-core/development/tasks/validate-next-story.md`
- Input: Story file
- Validation: 10-point checklist (completeness, clarity, testability, etc.)
- Scoring: Pass >= 7/10

**Veto condition:** Score < 7/10
- If veto: return to @sm with @po's specific feedback
- @sm fixes the story
- @po re-validates
- Max 2 SM-PO iterations per story
- After 2: @po approves with concerns noted

Show per-story result:
```
  ✅ Story 1.1: "Autenticação de usuário" — 9/10
  ✅ Story 1.2: "Feed de posts" — 8/10
  ⚠️ Story 1.3: "Sistema de likes" — 6/10 → refazendo...
  ✅ Story 1.3: "Sistema de likes" (v2) — 8/10
```

### Step 3: MVP Grouping + Priority & Dependency Check

After all stories are created and validated:

1. **Separate stories into two groups: MVP and Post-MVP**
2. **Build dependency graph:**
   - Collect all `depends_on` declarations from every story
   - Run topological sort to determine execution levels
   - **Cycle detection:** if a dependency cycle is found (A depends on B, B depends on A), @sm MUST break the cycle by splitting one of the stories. BLOCK until resolved.
   - Group stories by dependency level:
     - Level 0: stories with `depends_on: []` (base stories, no dependencies)
     - Level 1: stories that depend only on Level 0 stories
     - Level N: stories that depend on stories from levels 0 to N-1
   - **Stories at the same level with no mutual dependencies are parallelizable** (marked for Feature 7: Multi-Agent Parallel)
3. Within each level, order by:
   - MVP first, then post-MVP
   - Business value (core features first)
   - Complexity (simpler stories first to build momentum)
4. **MVP stories SEMPRE vêm antes de post-MVP** — sem exceção
5. Mostrar a divisão explicitamente ao usuário com setas de dependência

**Veto Condition:** Se `mvp.mode` != "all" e NENHUMA story está taggeada como `mvp: true`:
  → BLOQUEAR — alguma story precisa ser MVP
  → Perguntar ao usuário qual é MVP

**Veto Condition:** Se dependency graph tem ciclos:
  → BLOQUEAR — @sm deve quebrar o ciclo antes de prosseguir

### Step 4: CHECKPOINT

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  🔴 CHECKPOINT — Story Factory Complete
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  📋 {N} stories criadas e validadas:

  ━━━ MVP ({M} stories) ━━━
  Level 0: 🎯 Story 1.1: "{title}" (base)
  Level 1: 🎯 Story 1.2: "{title}" (← 1.1) | 🎯 Story 1.4: "{title}" (base) ← paralelizáveis!
  Level 2: 🎯 Story 1.3: "{title}" (← 1.1, 1.2)

  ━━━ POST-MVP ({K} stories) ━━━
  4. 📦 Story 2.1: "{title}"
  5. 📦 Story 2.2: "{title}"
  ...

  1. Aprovar e começar a implementação
  2. Reordenar prioridades
  3. Adicionar/remover stories
  4. Parar aqui (salvo o progresso)
```

### Step 5: Update State

Save to state.json:
```json
{
  "phases": {
    "2": {
      "status": "completed",
      "stories": [
        { "id": "1.1", "title": "Autenticação", "priority": 1, "po_score": 9, "mvp": true, "depends_on": [], "path": "docs/stories/active/1.1.story.md" },
        { "id": "1.2", "title": "Feed de posts", "priority": 2, "po_score": 8, "mvp": true, "depends_on": ["1.1"], "path": "docs/stories/active/1.2.story.md" },
        { "id": "1.4", "title": "Landing page", "priority": 4, "po_score": 8, "mvp": false, "depends_on": [], "path": "docs/stories/active/1.4.story.md" },
        { "id": "2.1", "title": "Sistema de likes", "priority": 3, "po_score": 8, "mvp": false, "depends_on": ["1.1", "1.2"], "path": "docs/stories/active/2.1.story.md" }
      ],
      "dependency_graph": {
        "levels": [["1.1", "1.4"], ["1.2"], ["2.1"]],
        "has_cycles": false
      },
      "total_stories": 8,
      "mvp_stories": 5,
      "post_mvp_stories": 3,
      "avg_po_score": 8.2
    }
  }
}
```

---

## Outputs

- Story files at `docs/stories/active/{epicNum}.{storyNum}.story.md`
- Priority order confirmed by user
- All stories validated by @po (>= 7/10)
- State updated with story list and order

---

## Veto Conditions

| Check | Threshold | Action if triggered |
|-------|-----------|---------------------|
| PO validation score | < 7/10 | Return to @sm with feedback (max 2x) |
| Story has no AC | 0 AC | BLOCK — @sm must add AC |
| Story duplicates another | Overlap > 80% | Merge or remove duplicate |
| Story scope too large | > 8 AC | Split into 2 stories |
