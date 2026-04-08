# Context Hygiene — Phase Summary Protocol

> Inspired by Spec-Driven Development (SDD): compress information at each stage, transfer only what matters.

---

## 1. Summary Generation

**When:** Fires on `after:phase:*` — after every phase completes.

### What to Read

For the completed phase N, gather:
1. `state.json → phases.{N}` — status, paths, scores, counts
2. Files created during the phase:
   - Phase 0: `state.json → discovery`, `state.json → tech_decisions`
   - Phase 1: `spec/prd.md`, `spec/architecture.md`, `spec/research.md`, `spec/docs-validation.md`
   - Phase 2: `stories/*.md` (count + titles only), `state.json → phases.2.dependency_graph`
   - Phase 3: `build-log/` (count completed/failed), `state.json → phases.3.stories_completed`
   - Phase 4: QA results, process audit score, quality audit score
   - Phase 5: PR URL, deploy status

### Summary Format (MANDATORY)

```markdown
## Phase {N} Summary — {phase_name}

- **Decisões:** {max 3 bullets with key decisions made}
- **Artefatos:** {file paths created, max 5}
- **Riscos:** {identified risks or concerns, max 2}
- **Próximo precisa saber:** {critical context the next phase needs, max 3 bullets}
```

**Rules:**
- Max 10 lines total (excluding header)
- Portuguese for content, English for file paths
- Be specific: "Next.js 15 + Prisma + PostgreSQL" not "tech stack decided"
- Include numbers: "8 stories (5 MVP + 3 post-MVP)" not "stories created"

### Where to Save

1. **state.json** — `phases.{N}.summary` as a string (the full markdown block)
2. **File** — `.aios/forge-runs/{run_id}/phase-{N}-summary.md` (for injection after /clear)

### /clear Suggestion (Heavy Phases Only)

Read `config.yaml → context_hygiene.heavy_phases` (default: `[1, 3]`).

If the completed phase is in the heavy list, show:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Context Hygiene — Phase {N} completa
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Essa fase gerou bastante contexto.
  Para manter a qualidade das próximas fases:

  1. /clear
  2. /forge resume

  O resumo da fase está salvo em:
  .aios/forge-runs/{run_id}/phase-{N}-summary.md

  Nada se perde. O Forge retoma de onde parou
  com todas as decisões anteriores injetadas.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Important:** This is a SUGGESTION, not a block. If the user continues without /clear, proceed normally. The summaries are still saved and will be available on resume.

---

## 2. Summary Injection

**When:** Fires on `before:phase:*` — before entering any new phase.

### Protocol

1. Glob `.aios/forge-runs/{run_id}/phase-*-summary.md`
2. Filter: only phases M where M < N (current phase number)
3. Sort by phase number ascending
4. Build the "Phase Memory Briefing" block:

```markdown
--- PHASE MEMORY BRIEFING ---

{Content of phase-0-summary.md}

{Content of phase-1-summary.md}

{... up to phase N-1}

--- END BRIEFING ---
```

5. Enforce `config.yaml → context_hygiene.briefing_max_lines` (default: 30 lines total)
   - If total exceeds limit: keep most recent phases, truncate oldest
   - Priority: Phase N-1 (most recent) > Phase N-2 > ... > Phase 0
6. Inject at the START of the phase context, before any agent dispatch

### Edge Cases

- **No summary files exist:**
  - Se é a primeira fase (N=0 ou N=1): skip silencioso (esperado, nada anterior existe)
  - Se N>1 e nenhum summary encontrado: log WARNING "Summaries de fases anteriores não encontrados. Phase Memory Briefing pode estar incompleto." e prosseguir
- **Corrupted summary file**: log warning com path do arquivo, skip esse arquivo, continuar com os outros
- **Resume after /clear**: this is the PRIMARY use case — summaries bridge the context gap

---

## 3. Agent Context Injection

**When:** Fires on `on:agent-dispatch` for phases 1-5.

### Relevance Matrix

| Agent | Relevant Summaries | Why |
|-------|--------------------|-----|
| @pm (Morgan) | Phase 0 | Discovery decisions, user requirements |
| @architect (Aria) | Phase 0 | Scope, constraints, tech preferences |
| @analyst (Atlas) | Phase 0 | Domain context, research scope |
| @sm (River) | Phase 1 | Spec decisions, architecture, MVP scope |
| @po (Pax) | Phase 1 | Spec context for story validation |
| @dev (Dex) | Phase 1 + Phase 2 | Architecture decisions + story context |
| @qa | Phase 3 | What was built, known issues, test coverage |
| @devops (Gage) | Phase 4 | Quality gate results, integration status |

### Injection Format

```
--- Context from previous phases ---
{Filtered summary content, max 10 lines per summary}
--- End context ---
```

### Rules

- Max 10 lines per summary injected (trim "Riscos" first if over limit)
- Only inject summaries that are RELEVANT to the agent's role (use matrix above)
- If no relevant summaries exist: skip injection silently
- NEVER inject the summary of the CURRENT phase (it hasn't completed yet)
