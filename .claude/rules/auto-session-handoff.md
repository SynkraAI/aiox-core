> **DEPRECATED**: This rule is superseded by `.claude/rules/unified-handoff.md` (3-Tier Unified Handoff System).
> Tier 3 (Cross-Session Handoff) replaces this file's session handoff protocol with automatic hook-based persistence,
> auto-trimming to ~200 lines, and recovery validation.
> This file is kept for reference only. All new behavior follows `unified-handoff.md`.

# Auto Session Handoff — Context Window Protection (DEPRECATED)

## Purpose

Automatically update the project-specific handoff file when context window is depleting, ensuring no work progress is lost between sessions.

## Multi-Project Handoff Files

Each project has its own handoff file in `docs/`:

```
docs/session-handoff-{nome-completo-do-projeto}.md
```

**Convention:** Use the full project name in kebab-case. Examples:
- `docs/session-handoff-brand-system-service.md`
- `docs/session-handoff-pauta-automation.md`
- `docs/session-handoff-aios-core.md`

**Detection:** Identify the active project by the story prefix being worked on (e.g., BSS-* = brand-system-service, PAUTA-* = pauta-automation). If no story is active, use the primary project being discussed.

## Trigger: SYNAPSE Context Bracket

Monitor the percentage in `[CONTEXT BRACKET: [FRESH] (X% remaining)]` injected by SYNAPSE on every message.

### At 30% Remaining — AUTO-SAVE HANDOFF

**Action:** Immediately pause current work and update the active project's handoff file.

Include:
1. Date and session summary (1 line)
2. Stories status table — which stories changed this session
3. New files created/modified (paths only)
4. Test results per story (counts)
5. Technical notes — decisions, gotchas discovered
6. Next step — what the next session should start with
7. "Como Continuar" prompt — ready-to-paste for next session (referencing the correct handoff file)

Do NOT include:
- Full file contents
- Conversation history
- Debug logs or error traces
- Intermediate discarded attempts

After saving, inform the user:
> "Session handoff auto-saved to `docs/session-handoff-{project}.md`. Context at ~30%. You can continue working or start a new session."

### At 15% Remaining — WARN + RECOMMEND NEW SESSION

After ensuring handoff is saved:
> "Context at ~15%. Handoff is saved. Recommend starting a new session — paste the prompt from the handoff file to continue."

### At 5% Remaining — STOP

Do not start new tasks. Ensure handoff is saved. Inform user session should end.

## Handoff File Structure

```
# Session Handoff — {Project Name}
**Date / Ultima sessao / Next**

## Estado Atual do MVP (stories table)
## Codigo — Implementacao (implementation details)
## Quality Gates (test counts)
## Arquivos Novos (file listings per story)
## O que foi feito nesta sessao (numbered work items)
## Proximo Passo (next actions)
## Documentacao Chave (key doc links)
## Como Continuar (ready-to-paste prompt)
```

## Rules

- Do NOT ask permission — this is a safety mechanism, save automatically
- The handoff update should be quick (Read + Write, no lengthy analysis)
- If stories are in-progress when triggered, mark partial state clearly
- This rule has NO `paths:` filter — it applies to ALL work sessions
- Complements SYNAPSE rules 21-25 (context depletion progressive rules)
- If working on multiple projects in one session, update ALL affected handoff files
- Create a new handoff file if one doesn't exist for the active project
