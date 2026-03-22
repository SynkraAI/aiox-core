# Phase 2: Story Factory

> Transformando spec em receitas executaveis

---

## Purpose

A spec diz O QUE construir. As stories dizem COMO, passo a passo. Pense nas stories como receitas de cozinha: cada uma tem ingredientes (AC), modo de preparo (tasks), e a foto do prato pronto (Definition of Done). O @sm e o chef que escreve as receitas, e o @po e o critico que prova e diz se ficou bom.

---

## Execution Steps

### Step 1: Story Creation (@sm)

Dispatch @sm via Agent tool:
- Agent: `.aios-core/development/agents/aios-sm.md`
- Task: `.aios-core/development/tasks/create-next-story.md`
- Input:
  - Final spec from Phase 1: `.aios/forge-runs/{run_id}/spec/spec-final.md`
  - Architecture document: `.aios/forge-runs/{run_id}/spec/architecture.md`
  - Epic definition (extracted from spec)
- Instructions:
  - Create stories ONE BY ONE, not all at once
  - Each story must have: title, description (As a/I want/So that), AC, tasks, dev notes
  - Follow the story template at `.aios-core/product/templates/story-tmpl.yaml`
  - Save each story to `docs/stories/active/`
  - Suggest priority order based on dependencies

Show progress:
```
  🔄 @sm (River) criando stories a partir da spec...
  Cada story e uma receita: ingredientes claros,
  modo de preparo passo a passo, foto do prato pronto.
```

### Step 2: Story Validation (@po — per story)

For EACH story created by @sm:

Dispatch @po:
- Agent: `.aios-core/development/agents/aios-po.md`
- Task: `.aios-core/development/tasks/validate-next-story.md`
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
  ✅ Story 1.1: "Autenticacao de usuario" — 9/10
  ✅ Story 1.2: "Feed de posts" — 8/10
  ⚠️ Story 1.3: "Sistema de likes" — 6/10 → refazendo...
  ✅ Story 1.3: "Sistema de likes" (v2) — 8/10
```

### Step 3: Priority & Dependency Check

After all stories are created and validated:

1. List all stories with their dependencies
2. Suggest execution order based on:
   - Technical dependencies (DB schema before API, API before UI)
   - Business value (core features first)
   - Complexity (simpler stories first to build momentum)

### Step 4: CHECKPOINT

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  🔴 CHECKPOINT — Story Factory Complete
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  📋 {N} stories criadas e validadas:

  Ordem de execucao:
  1. 📦 Story 1.1: "{title}" (base — sem dependencias)
  2. 📦 Story 1.2: "{title}" (depende de 1.1)
  3. 📦 Story 1.3: "{title}" (depende de 1.1)
  ...

  1. Aprovar e comecar a implementacao
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
        { "id": "1.1", "title": "Autenticacao", "priority": 1, "po_score": 9, "path": "docs/stories/active/1.1.story.md" },
        { "id": "1.2", "title": "Feed de posts", "priority": 2, "po_score": 8, "path": "docs/stories/active/1.2.story.md" }
      ],
      "total_stories": 8,
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
