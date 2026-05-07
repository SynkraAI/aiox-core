# Squad Activation Strategy — Conditional Consult-First Routing

**Status:** Draft v1.0
**Date:** 2026-05-07
**Author:** @aiox-master (Orion)
**Approval gate:** Eliel M. Alencar
**Source finding:** [`AF-20260507-aiox-master-routing-gap`](../audits/promoted/AF-20260507-aiox-master-routing-gap.yaml)

---

## Problem statement

`@aiox-master` (the framework's primary orchestrator) currently has **no routing logic to consult specialized squads first** before delegating to itself or to YOLO terminals. Concrete consequences observed during EPIC-MVP-CDM-CADASTRO Wave 1.A:

1. Voice-clone squad (Akita, Montano, Kira) **never auto-consulted** even when their domains were directly relevant. Eliel had to explicitly invoke them.
2. `claude-code-mastery` squad (which exists in `aiox-core/squads/`) **never invoked** despite Claude Code questions arising naturally.
3. `audience-engine` squad **never invoked** even when EPIC-MVP-CDM-CADASTRO required understanding of the 9 Públicos doctrine.
4. `db-inventory` cross-project asset **never consulted** before migration writes (root cause of DBOPS-V1 failure).
5. Sessions consume tokens re-discovering knowledge that already exists in dedicated squads/assets.

Kira's parecer formal stated this directly: *"vocês perderam tokens descobrindo o que já existia em db-inventory. Isso é problema de retrieval — a info estava lá mas o orquestrador não consultou no momento certo."*

Eliel's diagnostic: *"todos os plans criados cogitaram em nenhum momento a perfeita integração desses squads, por isso criamos o business-ai-first baseado no aiox e departamentos da minha empresa."*

---

## Design principles (Eliel-stated, Akita-aligned)

1. **Conditional, not unconditional.** Consult-squad-first is for **thematic** tasks. Routine ops (`*status`, `git status`, file moves) must NOT inflate context with squad personas.
2. **Token discipline.** Squad consultation is opt-in per task category. Bad routing burns tokens; good routing saves them.
3. **Heuristic-driven.** Use keyword/intent matching to suggest a squad. The orchestrator suggests; Eliel can override.
4. **Two-way street.** When a project agent learns something a squad should know, that flows back via the Evolution Pipeline (see `evolution-pipeline.md`).
5. **Backward compatible.** Existing `@aiox-master` invocations keep working. The squad routing is additive.

---

## Squad inventory (current)

### Framework-bound squads (in `aiox-core/squads/`)

| Squad | Domain | Entry agent | Use when |
|---|---|---|---|
| `claude-code-mastery` | Claude Code platform: hooks, skills, subagents, MCP, plugins, agent teams | `claude-mastery-chief` | User asks about Claude Code itself, hooks, MCP setup, skill creation, sub-agents, swarm orchestration |

### Project-bound squads (in `<project>/squads/`)

| Squad | Project | Domain | Entry agent | Use when |
|---|---|---|---|---|
| `voice-clones` | business-ai-first | 8 personas curadas (Akita, Montano, Kira-aligned, Hormozi, Conrado, Schoger, Alan, Gilberto, Chase) | varies | User wants formal opinion in style of a curated persona; technical critique; second opinion |
| `audience-engine` | business-ai-first | 9 Públicos doctrine (Conrado Adolpho), RFV, segmentation | (entry agent TBD) | Audience strategy, segmentation, KPI design, dashboard tabs |
| `marketing` | business-ai-first | content, ads, growth | varies | Marketing tasks |
| `vendas` | business-ai-first | SDR, closer, sales analytics | varies | Sales pipeline tasks |
| `cs` | business-ai-first | onboarding, retention, support | varies | Customer success tasks |
| `produto` | business-ai-first | product mgmt, content creation | varies | Product tasks |
| `admin` | business-ai-first | finance, HR, legal, compliance | varies | Admin tasks |
| `ops` | business-ai-first | process mapping, automation, architecture | varies | Operational architecture tasks |

### Cross-project assets (treated as "data squads")

| Asset | Domain | Use when |
|---|---|---|
| `db-inventory` | DB schema dictionary, snapshots, audit reports | ANY task that writes/reads a DB table, view, function, or RLS policy |

---

## Routing matrix for `@aiox-master`

The matrix below extends `@aiox-master`'s YAML definition. It mirrors the pattern found in `claude-mastery-chief` (`triage.routing_matrix`) and adapts it for cross-squad orchestration.

### Conditional triggers (consult squad if at least one keyword matches)

| Squad | Trigger keywords (any match) | Consultation type |
|---|---|---|
| `claude-code-mastery` (entry: `claude-mastery-chief`) | hook, skill, MCP, slash command, sub-agent, plugin, subagent, swarm, claude code, settings.json, permissions, sandbox, IDE integration | suggest invocation; do NOT auto-spawn |
| `voice-clones` | parecer, opinião formal, akita, montano, kira, hormozi, conrado, schoger, second opinion, critique style of, voice of, persona | suggest specific clone(s) by name |
| `db-inventory` (asset) | migration, schema change, RLS, RPC, trigger, view, enum, table, column, CHECK constraint, FK | **MUST READ** dictionary before tool use; not optional |
| `audience-engine` | público, segmento, RFV, 9 públicos, conrado, classificação de cliente, retention cohort | suggest invocation |
| `marketing` | campanha, ad, copy, growth, content strategy | suggest invocation |
| `vendas` | pipeline de vendas, SDR, closer, qualified lead, oportunidade | suggest invocation |
| `cs` | onboarding, retention, churn, support ticket | suggest invocation |
| `admin` | financeiro, RH, legal, compliance, LGPD operacional | suggest invocation |

### Direct-answer domains (no squad consultation)

`@aiox-master` answers directly without invoking squads when the request is:

- Workflow status (`*status`, `*plan`, `*list-components`)
- Routine git operations (`git status`, `git diff`)
- File reads/writes outside `supabase/migrations/`
- Trivial questions (1-2 sentences)
- Meta-framework operations explicitly within @aiox-master scope (`*create agent`, `*modify task`)

### Decision tree (pseudocode)

```text
on user message:
  classify intent → category
  match keywords → squad_candidates[]

  if user explicitly typed @<agent>:
    transform to that agent (existing behavior)
    HALT

  if category in DIRECT_ANSWER_DOMAINS:
    answer directly without squad consultation
    HALT

  if "db-inventory" in squad_candidates:
    enforce: read corresponding dictionary entry BEFORE first tool call
    do NOT block; emit advisory; continue

  if len(squad_candidates) >= 1:
    show user: "Suggested squads to consult: ..."
    let user pick or skip (numbered options)

  proceed with task; if user picked squad, transform to squad entry agent
```

---

## Patch for `@aiox-master.md` (proposed extension)

The following YAML block should be added to `aiox-core/.aiox-core/development/agents/aiox-master.md` after the `core_principles` section. (Mirrored to all `aiox-master.md` instances in `.antigravity/`, `.claude/commands/`, `.codex/`, `.cursor/`.)

```yaml
# ═══════════════════════════════════════════════════════════════════════════════
# SQUAD ACTIVATION & TRIAGE (added 2026-05-07 per ADR-PHASE2-squad-routing)
# ═══════════════════════════════════════════════════════════════════════════════

triage:
  enabled: true
  philosophy: |
    Consult specialized squads BEFORE delegating to YOLO or executing solo,
    when the topic matches their domain. This prevents context loss and
    duplicated effort. Heuristic — not blocking.

  routing_matrix:
    db_operations:
      keywords: [migration, schema, RLS, RPC, trigger, view, enum, table, column, CHECK, FK, supabase/migrations]
      consult: db-inventory
      consult_type: MUST_READ_DICTIONARY
      action: |
        Before first Edit/Write to supabase/migrations/*.sql, locate and read the
        corresponding db-inventory/dictionary/{tables,views,enums}/<name>.md entry.
        If no entry exists, create one BEFORE writing the migration.

    claude_code_platform:
      keywords: [hook, skill, MCP, slash command, sub-agent, subagent, swarm, claude code, settings.json, permissions, sandbox, IDE integration, plugin]
      consult: claude-code-mastery
      consult_type: SUGGEST_INVOCATION
      action: "Suggest @claude-mastery-chief and offer to transform"

    formal_opinion:
      keywords: [parecer, opinião formal, second opinion, critique, akita, montano, kira, hormozi, conrado, schoger]
      consult: voice-clones
      consult_type: SUGGEST_SPECIFIC_CLONE
      action: "Match keyword to specific clone (e.g., akita → @fabio-akita); offer to consult"

    audience_strategy:
      keywords: [público, segmento, RFV, 9 públicos, conrado, classificação cliente, retention cohort]
      consult: audience-engine
      consult_type: SUGGEST_INVOCATION

    marketing:
      keywords: [campanha, ad campaign, copy, growth strategy, content strategy, GTM]
      consult: marketing
      consult_type: SUGGEST_INVOCATION

    sales:
      keywords: [pipeline de vendas, SDR, closer, qualified lead, oportunidade comercial]
      consult: vendas
      consult_type: SUGGEST_INVOCATION

    customer_success:
      keywords: [onboarding cliente, retention plan, churn analysis, support ticket]
      consult: cs
      consult_type: SUGGEST_INVOCATION

    admin_compliance:
      keywords: [financeiro operacional, RH, legal, compliance LGPD, jurídico]
      consult: admin
      consult_type: SUGGEST_INVOCATION

  direct_answer_domains:
    - "Workflow status: *status, *plan, *list-components"
    - "Routine git: git status, git diff, git log"
    - "File reads outside supabase/migrations"
    - "Meta-framework ops within @aiox-master scope"
    - "Trivial questions (1-2 sentences)"

  override:
    user_explicit_agent_call: |
      If user types @<agent> explicitly, transform to that agent immediately.
      Squad routing does NOT intercept explicit user calls.
    user_skip: |
      User can decline a squad suggestion via "skip" or by proceeding with
      another command. Suggestion is recorded but not blocking.

  cost_discipline:
    rule: |
      NEVER load a squad's full agent persona just to "have the option."
      Squad consultation is JIT (just-in-time) — load only when transformation
      is confirmed.
    measure: |
      Each squad-routing event MUST be self-aware of token cost.
      A 5K-token squad load is justifiable for a 50K-token task; not for a
      500-token clarification.
```

---

## Cross-pollination: project agent → squad master

When a project-local agent (e.g., `@aiox-master` in `business-ai-first`) discovers a Claude Code-related improvement (hook pattern, skill convention, settings.json structure), it should propose enhancement to `claude-code-mastery` squad in `aiox-core`.

### Flow

```text
[business-ai-first agent learns X about Claude Code]
        ↓
   Writes AuditFinding (framework_candidate: true)
        ↓
   References claude-code-mastery as target squad
        ↓
   Proposer drafts FrameworkProposal
        ↓
   Eliel approves
        ↓
   PR in aiox-core/squads/claude-code-mastery/
        (e.g., adding new tactic to hooks-architect agent)
        ↓
   business-ai-first pulls aiox-core update
        ↓
   Knowledge propagated to all consumer projects
```

This closes the loop Eliel pointed out: *"o agente deve se juntar ao time do aiox-core para contribuir."*

In effect: **project agents are research scouts; squad masters are knowledge curators.**

---

## Hook proposal: `squad-suggestion-advisor`

Companion to `migration-dictionary-guard.cjs` (already shipping). Lives at `aiox-core/hooks/squad-suggestion-advisor.cjs`.

```javascript
// PreToolUse hook
// Trigger: any user message that contains squad-routing keywords
// Action: emit stderr advisory listing relevant squads
// Mode: advisory (does not block)
// Cost: ~1ms per check; runs only on UserPromptSubmit (not every tool call)
```

(Skeleton in the actual implementation PR; spec only here.)

---

## Migration plan (rollout to consumer projects)

| Step | Owner | When |
|---|---|---|
| 1. PR in aiox-core with: rule + agent patch + hook + this strategy doc | @aiox-master | After Eliel approves |
| 2. business-ai-first pulls aiox-core | Eliel (manual git pull or npm update) | Next session of business-ai-first |
| 3. Verify @aiox-master in business-ai-first now exhibits squad-suggesting behavior | Eliel + @aiox-master | First task of next session |
| 4. Iterate keyword list based on observed misses | @aiox-master (audit findings → proposals) | Continuous |

---

## Anti-patterns (do not do)

| Anti-pattern | Why it's wrong |
|---|---|
| Auto-spawn squad on every keyword | Token waste; user loses agency |
| Block tool execution if squad not consulted | Creates friction in routine work |
| Hardcode squad list in `@aiox-master` (no extensibility) | Squads come and go; matrix must be data-driven |
| Recommend a squad that doesn't exist in current project | Embarrassing; matrix must filter by available squads |
| Squad routing applied to agent-switch handoffs (`@dev` → `@qa`) | That's a different concern — `agent-handoff.md` rule covers it |

---

## Definition of done (for this strategy)

- [ ] FrameworkProposal `PROP-20260507-squad-routing-strategy.yaml` written and approved by Eliel
- [ ] PR in aiox-core merging:
  - [ ] `aiox-core/.claude/rules/squad-activation.md` (synthesizes this doc as rule)
  - [ ] `aiox-core/hooks/squad-suggestion-advisor.cjs` (advisory implementation)
  - [ ] Patch to all `aiox-master.md` instances adding `triage` block
  - [ ] This strategy doc at `aiox-core/governance/squad-activation-strategy.md`
- [ ] business-ai-first pulls aiox-core update
- [ ] First-session validation: @aiox-master suggests `db-inventory` consult before next migration
- [ ] First-session validation: @aiox-master suggests voice-clone when "parecer" keyword appears
- [ ] First-session validation: routine ops do NOT trigger squad suggestions (token discipline check)

---

## Linked artifacts

- [`evolution-pipeline.md`](evolution-pipeline.md) — defines how this strategy itself was promoted to framework
- [`../audits/c-dev-organization-2026-05-07.md`](../audits/c-dev-organization-2026-05-07.md) — workspace audit informing this work
- `business-ai-first/docs/decisions/ADR-DBOPS-V1-vocabulary-contract-failure.md` — original triggering ADR
- `business-ai-first/.aiox/handoffs/handoff-2026-05-07-phase1-to-phase2-data-contract.yaml` — Phase 2 contract referencing this strategy

---

— Orion (`@aiox-master`), respondendo ao gap arquitetural sinalizado por Eliel: o orquestrador principal precisa consultar o squad certo antes de delegar
