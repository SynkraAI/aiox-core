# Phase 1: Spec Pipeline

> PRD + Architecture — a planta da casa

---

## Purpose

Antes de construir, voce precisa da planta. Pense no @pm como o arquiteto que desenha a casa, no @architect como o engenheiro que calcula se a estrutura aguenta, e no @analyst como o cara que pesquisa o bairro antes de comprar o terreno. Sem essa fase, o pedreiro (@dev) decide tudo sozinho — e ai a casa fica torta.

---

## Execution Steps

### Step 1: PRD Creation (@pm)

Dispatch @pm via Agent tool:
- Agent: `.aios-core/development/agents/aios-pm.md`
- Task: spec-gather-requirements + spec-write-spec
- Input:
  - User answers from Phase 0
  - Context pack (minds relevantes para o dominio)
  - App-builder project detection results
  - App-builder tech-stack recommendation
  - App-builder template (if matched): `skills/app-builder/templates/{template}/TEMPLATE.md`
- Output: PRD document saved to `.aios/forge-runs/{run_id}/spec/prd.md`

Show progress:
```
  🔄 @pm (Morgan) esta montando o PRD...
  Pense no PM como o tradutor: ele pega sua ideia
  e transforma numa planta que os engenheiros entendem.
```

### Step 2: Architecture + Research (parallel)

Dispatch in PARALLEL (two Agent tool calls in one message):

**@architect:**
- Agent: `.aios-core/development/agents/aios-architect.md`
- Task: spec-assess-complexity
- Input: PRD from Step 1
- Output: Complexity score + architecture document
- Save to: `.aios/forge-runs/{run_id}/spec/architecture.md`

**@analyst (conditional):**
- Only dispatch if project involves external competition or unfamiliar domain
- Agent: `.aios-core/development/agents/aios-analyst.md`
- Task: research
- Input: PRD + project domain
- Inject: relevant minds from context-pack (ex: @hormozi for growth, @munger for strategy)
- Output: Research brief
- Save to: `.aios/forge-runs/{run_id}/spec/research.md`

Show parallel progress:
```
  ┌──────────────┐    ┌──────────────┐
  │  @architect  │    │  @analyst    │
  │  Aria         │    │  Atlas       │
  │  🔄 design   │    │  🔄 research │
  └──────────────┘    └──────────────┘
```

### Step 3: Spec Finalization (@pm)

Dispatch @pm again:
- Input: PRD + architecture + research (if available)
- Task: Finalize spec with implementation plan
- Output: Final spec with:
  - Epic definition
  - Story breakdown (high-level, detailed stories come in Phase 2)
  - Tech stack confirmed
  - Architecture decisions
- Save to: `.aios/forge-runs/{run_id}/spec/spec-final.md`

### Step 4: Spec Critique (@qa)

Dispatch @qa:
- Agent: `.aios-core/development/agents/aios-qa.md`
- Task: spec-critique
- Input: Final spec
- Scoring: 1-5 scale on completeness, clarity, testability, feasibility
- Veto: Average score < 4.0
  - If veto: return to @pm with @qa's feedback (max 2 iterations)
  - After 2: proceed with concerns noted
- Output: Critique report

### Step 5: CHECKPOINT

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  🔴 CHECKPOINT — Spec Pipeline Complete
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  📋 PRD: {title} ({N} paginas)
  🏗️ Arquitetura: {stack} ({complexity_level})
  📊 Stories previstas: ~{N} stories
  ✅ QA Score: {score}/5.0

  Resumo: {2-3 sentence summary}

  1. Aprovar e criar stories
  2. Ajustar spec (me diz o que mudar)
  3. Parar aqui (salvo o progresso)
```

### Step 6: Update State

Save to state.json:
```json
{
  "phases": {
    "1": {
      "status": "completed",
      "spec_path": ".aios/forge-runs/{run_id}/spec/spec-final.md",
      "architecture_path": ".aios/forge-runs/{run_id}/spec/architecture.md",
      "complexity": "STANDARD",
      "qa_score": 4.2,
      "estimated_stories": 8
    }
  }
}
```

---

## Outputs

- `spec/prd.md` — Product Requirements Document
- `spec/architecture.md` — Architecture decisions + complexity assessment
- `spec/research.md` — Research brief (if applicable)
- `spec/spec-final.md` — Consolidated spec with implementation plan
- User approval to proceed to Phase 2

---

## Ecosystem Context Injection

In this phase, inject from context-pack:
- **Minds with strategic expertise** (if project involves business decisions)
- **App-builder templates** (for stack and scaffolding guidance)
- **Domain-specific skills** (ex: nextjs-react-expert for React projects)

Do NOT inject implementation-level skills yet — those come in Phase 3.
