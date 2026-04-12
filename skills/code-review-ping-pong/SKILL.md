---
name: code-review-ping-pong
description: "Cross-AI code review protocol between Codex (reviewer), Claude Code (fixer), and Gemini (auditor). Ping-pong cycle with optional audit: Codex reviews, Claude fixes, Gemini audits both. Repeat until 10/10. Triggers: pingpong, code-review-ping-pong, bate-bola, cross-review."

version: 1.0.0
category: development
tags: [SKILL]
---

# Code Review Ping-Pong v3.1 — Cross-AI Review Protocol

A protocol where three AIs collaborate through shared files with structured metadata.
One reviews, another fixes, a third audits. They alternate until the code reaches 10/10.

## Architecture

### Standard Flow (2 agents)
```
Codex (REVIEW) → round-1.md → Claude Code (FIX) → round-1-fixed.md → loop until PERFECT
```

### Full Flow (3 agents, with Gemini audit)
```
Codex (REVIEW)       Claude Code (FIX)       Gemini (AUDIT)
     |                      |                      |
     |-- round-1.md ------->|                      |
     |                      |-- round-1-fixed.md   |
     |                      |--------------------->|
     |                      |       round-1-audit.md
     |<--------------------------------------------|
     |                      |                      |
     |-- round-2.md ------->|                      |
     ...                   ...                    ...
     |-- round-N.md [PERFECT]                      |
```

The AUDIT mode is **optional**. It can run after any fix round, or only when requested.
When active, Gemini reads ALL previous rounds and provides a cross-cutting analysis that
the reviewer and fixer may have missed.

**Communication channel:** `.code-review-ping-pong/` directory at project root.

## Handoff Contract

The protocol is a **turn-based state machine**, not just a set of loose prompts.
After every REVIEW, FIX, or AUDIT execution, the current agent MUST leave the cycle in
a state that makes the next move unambiguous for both the user and the next agent.

This is mandatory:

1. **Write the round file** for the current mode (`round-{N}.md`, `round-{N}-fixed.md`, or `round-{N}-audit.md`).
2. **Write or overwrite** `.code-review-ping-pong/next-step.md` with the exact next action.
3. **Show the handoff banner** in the chat response.
4. **State explicitly**:
   - current state of the cycle
   - whose turn it is now
   - exact command/mode to run next
   - exact file that should exist after that next step
5. **Emit a copy-paste handoff block** for the next agent, so the operator can paste one message and continue the cycle with no ambiguity. **Skip this step when the cycle is COMPLETE** (`next_agent: NONE`) — there is no next agent to hand off to.

The user should never have to infer whether the cycle is waiting on REVIEW, FIX, or AUDIT.
If the expected next artifact does not exist, the current agent MUST say so plainly.

### Copy-paste handoff block (MANDATORY — except when cycle is COMPLETE)

After the banner and status block, every mode MUST include a copy-pasteable handoff message
for the next agent. This block is mandatory and must be self-contained.

**Exception:** When the cycle is COMPLETE (`cycle_state: COMPLETE`, `next_agent: NONE`), do NOT
emit the copy-paste block. There is no next agent to paste to. Show only the 🏆 banner,
the status block, and the numbered options.

Use this exact structure (the box banner + "FIM DO BLOCO" delimiter are MANDATORY):

````text
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ 📋 COPIE O BLOCO ABAIXO → COLE NO {NEXT_AGENT}   ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

ative a skill code-review-ping-pong em modo {REVIEW | FIX | AUDIT | CRITICA}.

Contexto:
- Projeto: {project_name}
- Diretório de rounds: {.code-review-ping-pong/ | .code-review-ping-pong/scopes/{name}/}
- Artefato anterior: {latest_relevant_artifact}
- Escopo: {story ativa | session.md | escopo explícito}
- Scope: {scope_name | root}
- Branch: {branch}

{instruction sentence telling the next agent what to read first and what artifact to create next}

━━━━━━━━━━━━━━━━ FIM DO BLOCO ━━━━━━━━━━━━━━━━━━━
````

Rules:
- The block MUST tell the next agent what file to read first.
- The block MUST tell the next agent what file to create next.
- If there is a previous score, include it.
- If a fix round resolved all listed issues, say so explicitly.
- Do not use vague instructions like "continue daí" or "seguir o fluxo".

### `next-step.md` format (MANDATORY)

Every mode MUST leave `.code-review-ping-pong/next-step.md` in this exact structure:

````markdown
# Next Step

- current_round: {N}
- current_mode: {REVIEW | FIX | AUDIT | CRITICA}
- cycle_state: {WAITING_FOR_FIX | WAITING_FOR_REVIEW | WAITING_FOR_AUDIT | WAITING_FOR_CRITICA | COMPLETE}
- next_agent: {🟠 CLAUDE CODE | 🟢 CODEX | 🔵 GEMINI | NONE}
- next_mode: {fix mode | review mode | audit mode | critica | none}
- expected_artifact: {.code-review-ping-pong/round-{N}-fixed.md | .code-review-ping-pong/round-{N+1}.md | .code-review-ping-pong/round-{N}-audit.md | critica.md | none}
- scope: {scope_name | root}
- critica_status: {pending | approved | skipped}
- critica_skipped_by: {user | orchestrator | none}  # only when critica_status: skipped
- critica_skip_reason: {"--no-critica flag" | "user override" | none}  # only when critica_status: skipped
- blocking_reason: {short reason}

## Operator Prompt

Abra o {agent} e rode: {mode}
````

If the cycle is complete, `next_agent` must be `NONE`, `next_mode` must be `none`,
and `expected_artifact` must be `none`.

## File Format — Hybrid Markdown + YAML

Every round file (review, fix, and audit) MUST start with a YAML frontmatter block.
This block is the machine-readable contract. The Markdown body below it is for humans.

The YAML frontmatter is the **source of truth** for parsing. When reading a round file,
extract data from the YAML block first, then use the Markdown body for context.

Templates with the exact format: `references/review-template.md`, `references/fix-template.md`, `references/audit-template.md`, and `references/critica-template.md`.

## Modes

Detect mode from user input or arguments. Four modes exist: REVIEW, FIX, AUDIT, and CRITICA.

---

### Mode: REVIEW (Codex runs this)

Codex always initiates the cycle. This mode analyzes code and writes findings.

#### Steps

1. **Require scope** — Resolve scope using this priority chain:
   1. **Story** — Check `docs/stories/active/` for an active story. If one exists and is relevant, its File List and Acceptance Criteria define the scope. The story is the source of truth.
   2. **session.md** — Check `.code-review-ping-pong/session.md`. Use the scope defined there. This complements (not replaces) a story.
   3. **Explicit user input** — If user specified files/features, use those.
   4. **None of the above** — **Ask the user** for scope before proceeding. Never default to arbitrary `git diff` or full project scan.
2. **Detect round number** — Glob `.code-review-ping-pong/round-*.md` (excluding `*-fixed.md`) to find the highest N. New round = N+1. If no files exist, start at round 1.
   - **Round limit (soft 10, hard 15):**
     - If N >= 10: warn "Round {N} — o escopo pode estar muito amplo. Considere dividir." Proceed.
     - If N >= 15: **HALT** — "Limite de rounds atingido (15). Divida o escopo ou use `--force` para continuar." Do NOT proceed without explicit user confirmation.
3. **Anchor to git state** — Run `git rev-parse --short HEAD` and `git branch --show-current` to capture the exact code state being reviewed.
4. **If previous round exists** — Read `round-{prev}-fixed.md` to understand what was fixed. Check for regressions introduced by the fixes.
5. **Analyze code** — Review all files in scope for:
   - Bugs and logic errors
   - Security vulnerabilities
   - Performance issues
   - Code style and readability
   - Missing error handling
   - Test coverage gaps
   - Architecture and design patterns
6. **Score the code** — Assign a score from 1 to 10 based on overall quality.
7. **Write findings** — Create `.code-review-ping-pong/round-{N}.md` using the template from `references/review-template.md`. The YAML frontmatter is mandatory.
8. **Validate** — Run `node .code-review-ping-pong/validate.cjs round-{N}.md` if the script exists. Fix any validation errors before finishing.
9. **Verdict**:
   - Score < 10 → verdict `CONTINUE` → cycle_state `WAITING_FOR_FIX`
   - Score = 10 → verdict `PERFECT` → cycle_state **`WAITING_FOR_CRITICA`** (NOT COMPLETE — critica MUST run first, see "Critica Phase" section)
10. **Prompt next action** — Display the appropriate handoff banner (see "Handoff Banners" section), then present numbered options:
    - If `CONTINUE`: show CLAUDE CODE banner, then:
      ```
      🎯 Round {N} review completa. Score: {X}/10. {Y} issues encontradas.

      📍 Estado atual: WAITING_FOR_FIX
      👤 Próximo agente: 🟠 CLAUDE CODE
      ⚡ Próximo comando: fix mode
      📄 Próximo arquivo esperado: .code-review-ping-pong/round-{N}-fixed.md

      ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
      ┃ 📋 COPIE O BLOCO ABAIXO → COLE NO 🟠 CLAUDE CODE ┃
      ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

      ative a skill code-review-ping-pong em modo FIX.

      Contexto:
      - Projeto: {project_name}
      - Diretório de rounds: .code-review-ping-pong/
      - Artefato anterior: round-{N}.md
      - Score anterior: {X}/10
      - Escopo: {story ativa | session.md | escopo explícito}
      - Branch: {branch}

      Leia round-{N}.md para entender os findings, aplique as correções no código atual e gere .code-review-ping-pong/round-{N}-fixed.md.

      ━━━━━━━━━━━━━━━━ FIM DO BLOCO ━━━━━━━━━━━━━━━━━━━

      1. Mandar pro Claude Code corrigir (rodar FIX mode)
      2. Ver detalhes da review (round-{N}.md)
      3. Ajustar escopo e re-revisar
      ```
    - If `PERFECT`: **DO NOT set cycle_state to COMPLETE yet.** The critica phase MUST run first (see "Critica Phase" section). Show CRITICA banner:
      ```
      🏆 Código 10/10! Agora a crítica obrigatória antes de encerrar.

      📍 Estado atual: WAITING_FOR_CRITICA
      👤 Próximo agente: 🟠 CLAUDE CODE
      ⚡ Próximo comando: critica
      📄 Próximo arquivo esperado: critica.md

      ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
      ┃ 📋 COPIE O BLOCO ABAIXO → COLE NO 🟠 CLAUDE CODE ┃
      ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

      ative a skill code-review-ping-pong em modo CRITICA.

      Contexto:
      - Projeto: {project_name}
      - Diretório de rounds: {rounds_dir}
      - Round PERFECT: round-{N}.md (10/10)
      - Escopo: {story ativa | session.md | escopo explícito}
      - Scope: {scope_name | root}
      - Branch: {branch}

      Leia TODOS os rounds anteriores e o código atual. Execute a crítica
      obrigatória (5 seções: blind spots, citation verification, red team,
      minimum scope, ripple effect) e gere critica.md.

      ━━━━━━━━━━━━━━━━ FIM DO BLOCO ━━━━━━━━━━━━━━━━━━━

      1. Mandar pro Claude Code rodar crítica (obrigatório)
      2. Pular crítica e encerrar (--no-critica)
      3. Ver histórico completo dos rounds
      ```

      **next-step.md MUST be:**
      ```yaml
      cycle_state: WAITING_FOR_CRITICA
      next_agent: CLAUDE CODE
      next_mode: critica
      expected_artifact: critica.md
      critica_status: pending
      ```

      **NEVER set cycle_state to COMPLETE on PERFECT.** Only CRITICA (APPROVED) or user choosing `--no-critica` can set COMPLETE. This is NON-NEGOTIABLE.

#### Rules for REVIEW mode

- Be specific: include file path, line number, and code snippet for every issue.
- Acknowledge what is good — the fixer must know what NOT to change.
- Do not invent issues to lower the score. If the code is genuinely good, score it high.
- Report ALL issues found, including regressions from previous fixes. Honesty over narrative.
- **Issue cap (15 per round):** If more than 15 issues are found, focus on CRITICAL and HIGH first. Report remaining MEDIUM/LOW as "deferred to next round" in a summary line. This prevents context overflow during FIX mode.
- When scoring 10/10, explicitly confirm: "No remaining issues. Code is production-ready."
- Always read the previous fix report before starting a new review.
- The YAML `issues` array is the source of truth. The Markdown body elaborates but must match.

---

### Mode: FIX (Claude Code runs this)

Claude Code responds to reviews. This mode reads findings and implements fixes.

#### Steps

1. **Find latest review** — Glob `.code-review-ping-pong/round-*.md` (excluding `*-fixed.md`). Identify the highest-numbered round file.
2. **Guard: no review found** — If no round file exists or directory is empty:
   - Output: "Nenhuma review encontrada em `.code-review-ping-pong/`. Peça ao Codex para iniciar com mode REVIEW primeiro."
   - Stop execution.
3. **Guard: already perfect** — Read the YAML frontmatter. If `verdict: PERFECT`:
   - Check `next-step.md`: if `cycle_state: COMPLETE` (critica was approved or `--no-critica` was passed), output: "Ciclo já encerrado. Nada a corrigir." and stop.
   - Otherwise, output: "Código atingiu 10/10! A fase de CRITICA obrigatória ainda não foi executada." and instruct the operator to run CRITICA mode instead.
   - Do NOT claim the cycle is complete — only `cycle_state: COMPLETE` in `next-step.md` indicates that.
4. **Guard: already fixed** — If `round-{N}-fixed.md` already exists for the latest round:
   - **Integrity check:** If the file exists but is empty (0 bytes) or has no YAML frontmatter, treat as corrupted: warn "round-{N}-fixed.md está corrompido (vazio ou sem YAML). Deletando para permitir retry." Delete the file and proceed with FIX normally.
   - If the file exists and is valid: Output "Round {N} já foi corrigido. Peça ao Codex para rodar REVIEW novamente." Stop execution.
5. **Verify git state** — Compare current `git rev-parse --short HEAD` with the review's `commit_sha`. If they differ, warn: "Cuidado: o código mudou desde a review (review: {sha}, atual: {sha}). Verifique se as issues ainda se aplicam." Proceed with caution but do not block.
6. **Parse issues from YAML** — Extract the `issues` array from the YAML frontmatter. Sort by severity: CRITICAL > HIGH > MEDIUM > LOW.
   - **Guard: missing YAML** — If the round file has no YAML frontmatter (`---` block): Output "round-{N}.md não tem frontmatter YAML válido. Não é possível extrair issues. Peça ao reviewer para corrigir o formato." Stop execution.
7. **Fix issues** — Implement fixes one by one:
   - Read the referenced file and line for each issue.
   - Apply the fix. If the suggested fix is wrong or incomplete, use better judgment but document the deviation.
   - After each fix, verify the file has no syntax errors.
   - **ANTI-WHACK-A-MOLE (OBRIGATÓRIO):** For EACH issue, before fixing only the cited file, grep/search for the SAME bug pattern across ALL files in scope (session.md). If the same pattern exists in other files, fix ALL of them at once. If the pattern repeats in 5+ files, consider creating a shared abstraction (hook, utility) instead of copy-pasting the fix. Document extra files fixed in the fix description.
8. **Run quality checks** — Execute available quality commands:
   - `npm run lint` (if package.json exists with lint script)
   - `npm run typecheck` (if available)
   - `npm test` (if available)
   - If any fail, fix the failures before proceeding.
9. **Capture git state** — Run `git diff --stat HEAD`. Put only the **last summary line** (e.g. "3 files changed, 25 insertions(+), 8 deletions(-)") into the `git_diff_stat` YAML field (must be single-line). List changed files in `files_changed` array.
10. **Write fix report** — Create `.code-review-ping-pong/round-{N}-fixed.md` using the template from `references/fix-template.md`. The YAML frontmatter is mandatory.
11. **Write handoff file** — Create or overwrite `.code-review-ping-pong/next-step.md` indicating `WAITING_FOR_REVIEW`, next agent `CODEX`, next mode `review mode`, and expected artifact `.code-review-ping-pong/round-{N+1}.md`.
12. **Validate** — Run `node .code-review-ping-pong/validate.cjs round-{N}-fixed.md` if the script exists.
13. **Prompt next action** — Display the CODEX handoff banner (see "Handoff Banners" section), then present options:
    ```
    🔧 Round {N} corrigido. ✅ {X} fixed, ⚠️ {Y} skipped. Quality checks: {status}.

    📍 Estado atual: WAITING_FOR_REVIEW
    👤 Próximo agente: 🟢 CODEX
    ⚡ Próximo comando: review mode
    📄 Próximo arquivo esperado: .code-review-ping-pong/round-{N+1}.md

    ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
    ┃ 📋 COPIE O BLOCO ABAIXO → COLE NO 🟢 CODEX       ┃
    ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

    ative a skill code-review-ping-pong em modo REVIEW.

    Contexto:
    - Projeto: {project_name}
    - Diretório de rounds: .code-review-ping-pong/
    - Artefato anterior: round-{N}-fixed.md
    - Round anterior: round-{N}-fixed.md ({X} issues fixed, {Y} skipped)
    - Escopo: {story ativa | session.md | escopo explícito}
    - Branch: {branch}

    Leia round-{N}-fixed.md para entender o que foi corrigido, depois revise o código atual e gere .code-review-ping-pong/round-{N+1}.md.

    IMPORTANTE — Apresentação do resultado:
    Ao finalizar, NÃO responda apenas "Escrevi o round em...". Apresente com cerimônia:
    1. Banner: 🎯 Round {N+1} review completa. Score: X/10. Y issues encontradas.
    2. Status block: 📍 Estado atual | 👤 Próximo agente | ⚡ Próximo comando | 📄 Próximo arquivo
    3. Bloco copy-paste para o Claude Code com banner ┏━━━┓ "COPIE → COLE NO 🟠 CLAUDE CODE",
       incluindo: modo FIX, contexto completo (projeto, rounds dir, artefato, score, escopo,
       scope, branch), instrução específica, e ━━━ FIM DO BLOCO ━━━
    4. Opções numeradas (1. Fix, 2. Ver review, 3. Ajustar escopo)
    Se score = 10, verdict é PERFECT e próximo passo é CRITICA (não FIX).

    ━━━━━━━━━━━━━━━━ FIM DO BLOCO ━━━━━━━━━━━━━━━━━━━

    1. Mandar pro Codex revisar (rodar REVIEW round {N+1})
    2. Mandar pro Gemini auditar (rodar AUDIT — opcional)
    3. Ver detalhes do fix report (round-{N}-fixed.md)
    4. Resetar ciclo (apagar rounds e recomeçar)
    ```
    Note: if user picks option 2 (AUDIT), update `next-step.md` with these exact values before showing the GEMINI banner:
    ```yaml
    cycle_state: WAITING_FOR_AUDIT
    next_agent: GEMINI
    next_mode: audit mode
    expected_artifact: .code-review-ping-pong/round-{N}-audit.md
    ```
    Then show the GEMINI banner and the AUDIT handoff block.

---

### Mode: AUDIT (Gemini runs this)

Gemini provides cross-cutting analysis after a fix round. This mode reads ALL previous rounds
and surfaces patterns that the reviewer and fixer may have missed.

The audit is **optional** — it can be triggered after any fix, or skipped entirely.
Gemini's large context window makes it ideal for reading the full round history at once.

#### Steps

1. **Read all rounds** — Read every `round-*.md` and `round-*-fixed.md` in `.code-review-ping-pong/`, ordered by round number. Also read `session.md` if it exists.
2. **Read current code** — Read all files listed in `files_in_scope` from the latest review.
3. **Cross-cutting analysis** — Look for patterns that per-round review misses:
   - **Recurring issues** — Same type of bug appearing across rounds (symptom of a deeper problem)
   - **Fix quality** — Are fixes actually solving the root cause or just patching symptoms?
   - **Regressions** — Did any fix introduce new problems that the next review missed?
   - **Architecture gaps** — Structural issues that only become visible when looking at the full picture
   - **Blind spots** — Areas of code in scope that were never reviewed or always skipped
   - **Review drift** — Is the reviewer being too lenient or too strict over time?
4. **Score the process** — Assign a process health score from 1 to 10 (separate from the code score).
5. **Write audit report** — Create `.code-review-ping-pong/round-{N}-audit.md` where N is the latest round number. Use the template from `references/audit-template.md`. The YAML frontmatter is mandatory.
6. **Write handoff file** — Create or overwrite `.code-review-ping-pong/next-step.md` indicating `WAITING_FOR_REVIEW`, next agent `CODEX`, next mode `review mode`, and expected artifact `.code-review-ping-pong/round-{N+1}.md`.
7. **Validate** — Run `node .code-review-ping-pong/validate.cjs round-{N}-audit.md` if the script exists.
8. **Prompt next action** — Display the CODEX handoff banner (see "Handoff Banners" section), then present options:
   ```
   🔍 Audit do round {N} completo. 📊 Process health: {X}/10. {Y} findings.

   📍 Estado atual: WAITING_FOR_REVIEW
   👤 Próximo agente: 🟢 CODEX
   ⚡ Próximo comando: review mode
   📄 Próximo arquivo esperado: .code-review-ping-pong/round-{N+1}.md

   ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
   ┃ 📋 COPIE O BLOCO ABAIXO → COLE NO 🟢 CODEX       ┃
   ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

   ative a skill code-review-ping-pong em modo REVIEW.

   Contexto:
   - Projeto: {project_name}
   - Diretório de rounds: .code-review-ping-pong/
   - Artefato anterior: round-{N}-audit.md
   - Process health anterior: {X}/10
   - Escopo: {story ativa | session.md | escopo explícito}
   - Branch: {branch}

   Leia round-{N}-audit.md e os artefatos anteriores necessários, depois revise o código atual e gere .code-review-ping-pong/round-{N+1}.md.

   IMPORTANTE — Apresentação do resultado:
   Ao finalizar, NÃO responda apenas "Escrevi o round em...". Apresente com cerimônia:
   1. Banner: 🎯 Round {N+1} review completa. Score: X/10. Y issues encontradas.
   2. Status block: 📍 Estado atual | 👤 Próximo agente | ⚡ Próximo comando | 📄 Próximo arquivo
   3. Bloco copy-paste para o Claude Code com banner ┏━━━┓ "COPIE → COLE NO 🟠 CLAUDE CODE",
      incluindo: modo FIX, contexto completo (projeto, rounds dir, artefato, score, escopo,
      scope, branch), instrução específica, e ━━━ FIM DO BLOCO ━━━
   4. Opções numeradas (1. Fix, 2. Ver review, 3. Ajustar escopo)
   Se score = 10, verdict é PERFECT e próximo passo é CRITICA (não FIX).

   ━━━━━━━━━━━━━━━━ FIM DO BLOCO ━━━━━━━━━━━━━━━━━━━

   1. Mandar pro Codex revisar com os findings do audit
   2. Ver detalhes do audit (round-{N}-audit.md)
   3. Ignorar audit e continuar ciclo normal
   ```

#### Rules for AUDIT mode

- Read ALL rounds, not just the latest. The value of audit is the big picture.
- Do not duplicate issues already found by the reviewer. Focus on what was MISSED.
- Be honest about process health. If reviewer and fixer are doing well, say so.
- The `new_issues` array in YAML contains issues the audit found that no review caught. These MUST be addressed in the next review round.
- Audit findings are advisory for the fixer but mandatory for the reviewer to acknowledge.

---

## File Structure

All files live in `.code-review-ping-pong/` at the project root.

| File | Author | Purpose |
|------|--------|---------|
| `session.md` | User / Agent | Scope, goals, constraints (auto-generated in multi-stage mode) |
| `round-{N}.md` | Reviewer (Codex) | Review with YAML metadata + Markdown detail |
| `round-{N}-fixed.md` | Fixer (Claude Code) | Fix report with YAML metadata + Markdown detail |
| `round-{N}-audit.md` | Auditor (Gemini) | Cross-cutting audit with process health score |
| `next-step.md` | Current agent | Single source of truth for the exact next move in the cycle |
| `validate.cjs` | Auto-generated | Validates round files and multi-stage YAML |
| `multi-stage.cjs` | Auto-generated | Multi-stage orchestration script |
| `stages.yml` | User | Multi-stage config (optional — activates multi-stage mode) |
| `progress.yml` | Agent (auto-generated) | Cross-stage progress tracker |
| `critica.md` | Fixer (Claude Code) | Mandatory critica after PERFECT (5 focused checks) |
| `scopes/{name}/` | Orchestrator | Isolated scope directory (via --scope) |
| `archive/{name}-{date}/` | Orchestrator | Auto-archived completed scopes |
| `archive/stage-{id}-{slug}/` | Agent | Archived rounds from completed stages |
| `archive/stage-{id}-{slug}/summary.yml` | Agent | Final stats for completed stage |

## Bootstrapping

To start a new ping-pong cycle:

1. Create `.code-review-ping-pong/` directory if it does not exist.
2. **If a story exists** — the story's File List and ACs are the primary scope. No extra config needed.
3. **Otherwise** — create `.code-review-ping-pong/session.md` with scope:
   ```markdown
   # Ping-Pong Session

   ## Scope
   - files: [src/auth/*.ts, src/middleware/session.ts]
   - story: docs/stories/active/story-2.3.md (optional link)

   ## Goals
   - Production-ready auth module
   - No security vulnerabilities

   ## Constraints
   - Do not modify src/database/ (separate concern)
   ```
4. Copy `validate.cjs` from `scripts/validate.cjs` in this skill to `.code-review-ping-pong/validate.cjs`.
5. Run REVIEW mode from Codex.

To reset a cycle: delete all `round-*.md` files in `.code-review-ping-pong/`.

### Scoped Sessions

When reviewing multiple modules from the same project root (e.g., different skills
inside `aios-core`), use `--scope` to isolate rounds in separate subdirectories.

**Usage (orchestrator):**
```bash
node orchestrate.cjs --scope forge    # rounds in scopes/forge/
node orchestrate.cjs --scope quest    # rounds in scopes/quest/ (parallel)
```

**Usage (manual):**
```
pingpong --scope forge
```

**Directory structure:**
```
.code-review-ping-pong/
├── scopes/
│   ├── forge/
│   │   ├── session.md
│   │   ├── next-step.md
│   │   ├── round-1.md
│   │   ├── round-1-fixed.md
│   │   └── critica.md
│   └── quest/
│       ├── session.md
│       └── next-step.md
├── archive/
│   └── forge-2026-04-08/
├── session.md              ← legacy mode (no --scope)
└── validate.cjs            ← shared
```

**Rules:**
- Without `--scope`, everything works exactly as before (backward compatible).
- Each scope has its own `session.md`, `next-step.md`, and round files.
- `validate.cjs` is shared — looked up in the root `.code-review-ping-pong/`.
- Archives go to `.code-review-ping-pong/archive/{scope}-{date}/`.
- If `scopes/` exists and no `--scope` is passed, the orchestrator warns about active scopes.

**Step 0 — Detect Scoped Mode (ALL modes, manual execution):**

When running in manual mode (not via orchestrator), agents MUST check for scopes:

```
0b. Detect scoped mode — Check if `.code-review-ping-pong/scopes/` exists.
    - If YES: list subdirectories (active scopes).
      - If user specified scope → use that scope's directory for all round operations.
      - If user did NOT specify → ask: "Qual scope? Ativos: forge, quest"
    - If NO: proceed with root directory (legacy mode).
```

### Multi-Stage Bootstrapping

To start a multi-stage review of a large codebase:

1. Create `.code-review-ping-pong/` directory if it does not exist.
2. Copy `validate.cjs` and `multi-stage.cjs` from `scripts/` in this skill.
3. Create `stages.yml` using the template from `references/stages-template.yml`.
   - Define all stages with their files, goals, and constraints.
   - Set the first stage to `status: active`, all others to `pending`.
4. Validate: `node validate.cjs stages.yml`
5. Initialize: `node multi-stage.cjs init` (generates `session.md` from active stage)
6. Run REVIEW mode — step 0 will detect `stages.yml` and use the generated `session.md`.

**Multi-stage script commands:**
```bash
node multi-stage.cjs status            # Show all stages and current state
node multi-stage.cjs init              # Generate session.md from active stage
node multi-stage.cjs activate <id>     # Activate a stage (deactivates current)
node multi-stage.cjs archive           # Archive completed stage (must be 10/10)
node multi-stage.cjs progress          # Regenerate progress.yml
```

## Tips

- **Scope is mandatory.** Without session.md or explicit scope, the reviewer must ask before proceeding.
- **3-5 rounds is typical.** If round 7+ still has issues, the scope may be too broad.
- **Git anchoring prevents drift.** Both sides record commit_sha to ensure they review/fix the same code.
- **YAML is the contract, Markdown is the explanation.** Parse YAML for automation, read Markdown for context.
- **Add `.code-review-ping-pong/` to `.gitignore`** if review files should not be committed.

---

## Critica Phase (Mandatory Post-PERFECT — NON-NEGOTIABLE)

**REGRA CRÍTICA (reforço):** Quando o reviewer atinge PERFECT (10/10), ele DEVE setar `cycle_state: WAITING_FOR_CRITICA` e `next_agent: CLAUDE CODE`. NUNCA setar COMPLETE diretamente. A critica é obrigatória — só `--no-critica` explícito do usuário pode pular.

After reaching PERFECT (10/10), the cycle does **NOT** archive immediately.
A mandatory critica phase runs first — a focused subset of `/critica` tailored for code review.

### Flow

```
REVIEW → FIX → [AUDIT] → ... → PERFECT (10/10)
                                    ↓
                              CRITICA (mandatory)
                                    ↓
                           ┌─ APPROVED → ARCHIVE
                           └─ NEEDS_WORK → new REVIEW round
```

### Mode: CRITICA (Claude Code runs this — MANDATORY after PERFECT)

Claude Code executes the critica after PERFECT is reached. This mode reads ALL rounds and validates the review quality.

#### Steps

1. **Detect scope** — Same as REVIEW/FIX: check for scoped directory (`scopes/{name}/`) or root.
2. **Read all rounds** — Read every `round-*.md` and `round-*-fixed.md` in the rounds directory, ordered by round number. Also read `session.md` if exists.
3. **Read current code** — Read all files listed in `files_in_scope` from the PERFECT round.
4. **Execute 5-section analysis:**

   **Phase 1 — Question:**
   1. **Blind spots** — what did the review NOT consider?
   2. **Citation verification** — each fix must trace to a real code change. No source = retract claim.
   3. **Red team (3 attacks)** — adversarial vectors against the reviewed code.

   **Phase 2 — Discipline:**
   4. **Minimum scope** — did fixes touch only what was necessary?
   5. **Ripple effect** — did any fix alter an interface/type/contract without listing impact?

5. **Assign verdict:**
   - **APPROVED** — no critical problems found.
   - **NEEDS_WORK** — problems found. List specific issues.
6. **Write critica file** — Create `critica.md` (or `scopes/{name}/critica.md` if scoped) using the template from `references/critica-template.md`. The YAML frontmatter is mandatory.
7. **Write next-step.md:**
   - If **APPROVED**: `cycle_state: COMPLETE`, `next_agent: NONE`, `critica_status: approved`
   - If **NEEDS_WORK**: `cycle_state: WAITING_FOR_REVIEW`, `next_agent: CODEX`, `critica_status: pending`, list critica issues for next review
8. **Prompt next action:**
   - If **APPROVED**: show 🏆 COMPLETE banner. Do NOT show copy-paste handoff block (cycle is done).
     ```
     🏆 Código 10/10 + Crítica aprovada! Ciclo completo em {N} rounds.

     📍 Estado atual: COMPLETE
     👤 Próximo agente: NONE
     ⚡ Próximo comando: none
     📄 Próximo arquivo esperado: none

     1. Encerrar (nada mais a fazer)
     2. Ver histórico completo dos rounds
     3. Iniciar novo ciclo com escopo diferente
     ```
   - If **NEEDS_WORK**: show CODEX banner with copy-paste handoff block.
     ```
     ⚠️ Crítica encontrou problemas. Novo round necessário.

     📍 Estado atual: WAITING_FOR_REVIEW
     👤 Próximo agente: 🟢 CODEX
     ⚡ Próximo comando: review mode
     📄 Próximo arquivo esperado: round-{N+1}.md

     ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
     ┃ 📋 COPIE O BLOCO ABAIXO → COLE NO 🟢 CODEX       ┃
     ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

     ative a skill code-review-ping-pong em modo REVIEW.

     Contexto:
     - Projeto: {project_name}
     - Diretório de rounds: {rounds_dir}
     - Artefato anterior: critica.md (NEEDS_WORK, {N} issues)
     - Escopo: {story ativa | session.md | escopo explícito}
     - Scope: {scope_name | root}
     - Branch: {branch}

     Leia critica.md para entender os problemas encontrados, depois revise
     o código atual focando nos issues da crítica e gere round-{N+1}.md.

     IMPORTANTE — Apresentação do resultado:
     Ao finalizar, NÃO responda apenas "Escrevi o round em...". Apresente com cerimônia:
     1. Banner: 🎯 Round {N+1} review completa. Score: X/10. Y issues encontradas.
     2. Status block: 📍 Estado atual | 👤 Próximo agente | ⚡ Próximo comando | 📄 Próximo arquivo
     3. Bloco copy-paste para o Claude Code com banner ┏━━━┓ "COPIE → COLE NO 🟠 CLAUDE CODE",
        incluindo: modo FIX, contexto completo (projeto, rounds dir, artefato, score, escopo,
        scope, branch), instrução específica, e ━━━ FIM DO BLOCO ━━━
     4. Opções numeradas (1. Fix, 2. Ver review, 3. Ajustar escopo)
     Se score = 10, verdict é PERFECT e próximo passo é CRITICA (não FIX).

     ━━━━━━━━━━━━━━━━ FIM DO BLOCO ━━━━━━━━━━━━━━━━━━━

     1. Mandar pro Codex revisar com findings da crítica
     2. Ver detalhes da crítica (critica.md)
     3. Ignorar crítica e encerrar (--no-critica)
     ```

#### Rules for CRITICA mode

- Read ALL rounds, not just the PERFECT one. Context matters.
- The 5 sections are focused — do NOT expand to the full `/critica` skill (10+ sections).
- Citation verification is strict: if a fix report claims "fixed X" but no code change matches, retract.
- Red team attacks should be realistic, not theoretical.
- If verdict is APPROVED, explicitly confirm: "Nenhum problema crítico encontrado. Ciclo encerrado."

### Escape hatch

```bash
node orchestrate.cjs --no-critica    # skip critica, archive immediately on PERFECT
pingpong --no-critica                # same via shell wrapper
```

### Integration with /critica skill

The ping-pong critica is a **focused subset** of the full `/critica` skill.
You do NOT need to run `/critica` manually after ping-pong — it runs automatically.
The full `/critica` skill has 10+ sections; ping-pong uses only the 5 most relevant for code review.

---

## Multi-Stage Protocol

For large codebases, a single scope is too broad. The multi-stage protocol allows splitting
a full code review into independent stages, each with its own scope and cycle.

### Activation

Multi-stage mode is **activated by the presence of `stages.yml`** in `.code-review-ping-pong/`.
If `stages.yml` does not exist, everything works exactly as before (backwards compatible).

### `stages.yml` Format

Created by the user. Defines all stages, their scopes, and status.

```yaml
protocol: code-review-ping-pong
version: 1
project: "{project name}"
created: "{YYYY-MM-DD}"

stages:
  - id: 1
    slug: "{url-safe-short-name}"
    name: "{Stage Display Name}"
    description: "{one-line description}"
    status: active          # pending | active | complete
    files:
      - "{path/to/file1.ts}"
      - "{path/to/file2.ts}"
    goals:
      - "{goal 1}"
    constraints:
      - "{constraint 1}"
  - id: 2
    slug: "{url-safe-short-name}"
    name: "{Stage Display Name}"
    description: "{one-line description}"
    status: pending
    files:
      - "{path/to/file3.ts}"
    goals:
      - "{goal 1}"
    constraints: []
```

**Rules:**
- Only **one stage** can have `status: active` at a time.
- `id` is an integer, sequential, immutable. Never reuse IDs.
- `slug` is URL-safe, immutable. Used in archive directory names.
- `status` flow: `pending` → `active` → `complete`. Only move forward.
- `files` must be non-empty for every stage.
- Template: `references/stages-template.yml`
- Validate: `node validate.cjs stages.yml`

### `progress.yml` Format

**Auto-generated** by the agent at the end of every REVIEW, FIX, or AUDIT round.
Do NOT edit manually — it is regenerated from `stages.yml` + round files + archive.

```yaml
protocol: code-review-ping-pong
updated: "{YYYY-MM-DD}"

summary:
  total_stages: 9
  completed: 1
  active: 1
  pending: 7
  completion_pct: 11
  total_issues_found: 15
  total_issues_fixed: 15
  total_rounds: 4

stages:
  - id: 1
    slug: scraping-apify
    status: complete
    final_score: 10
    rounds: 4
    issues_found: 15
    issues_fixed: 15
    archived_at: "2026-03-29"
    archive_path: archive/stage-1-scraping-apify/
  - id: 2
    slug: workers
    status: active
    current_round: 2
    latest_score: 8
    issues_found: 7
    issues_fixed: 5
```

**Rules:**
- `completion_pct` = `floor(completed / total_stages * 100)`
- `completed + active + pending` must equal `total_stages`
- Template: `references/progress-template.yml`
- Validate: `node validate.cjs progress.yml`

### Archiving

When a stage reaches **10/10** (verdict `PERFECT`), the mandatory CRITICA phase runs first (see "Critica Phase" section). Archive happens ONLY after CRITICA returns APPROVED (or user explicitly passes `--no-critica`). **NEVER archive on PERFECT directly — CRITICA is NON-NEGOTIABLE, including in multi-stage mode.**

After CRITICA APPROVED, archive via the helper script: `node multi-stage.cjs archive`

**Steps:**

1. Create directory `archive/stage-{id}-{slug}/`
2. Move all `round-*.md` from root into the archive
3. Move `session.md` into the archive (it was auto-generated for this stage)
4. Generate `archive/stage-{id}-{slug}/summary.yml` with final stats
5. Update `stages.yml`: set the stage's status to `complete`
6. Regenerate `progress.yml`
7. **Write a new `next-step.md` in root** using the protocol's mandatory format:
   ```markdown
   # Next Step

   - current_round: {N}
   - current_mode: REVIEW
   - cycle_state: COMPLETE
   - next_agent: NONE
   - next_mode: none
   - expected_artifact: none
   - blocking_reason: Stage {id} ({name}) complete and archived

   ## Operator Prompt

   Stage {id} finalizado. Próximo stage pendente: {next_id} — {next_name}.
   Rode: `node multi-stage.cjs activate {next_id}`
   ```
   This uses `cycle_state: COMPLETE` with `next_agent: NONE` — the standard
   protocol values for a finished cycle. The Operator Prompt section tells the
   user how to proceed to the next stage.

**Archive summary format (`summary.yml`):**

```yaml
protocol: code-review-ping-pong
type: stage-summary
stage_id: 1
stage_slug: scraping-apify
stage_name: "Scraping — Apify Adapter"
completed_at: "2026-03-29"
total_rounds: 4
final_score: 10
total_issues_found: 15
total_issues_fixed: 15
total_issues_skipped: 0
files_in_scope:
  - src/modules/scraping/apify/actors.ts
rounds:
  - file: round-1.md
    type: review
    score: 7
    issues: 6
  - file: round-1-fixed.md
    type: fix
    fixed: 6
    skipped: 0
```

- `final_score` must be 10 (stage was PERFECT)
- Template: `references/stage-summary-template.yml`
- Validate: `node validate.cjs archive/stage-{id}-{slug}/summary.yml`

**Resulting directory tree:**

```
.code-review-ping-pong/
  stages.yml              ← stage config (user-managed)
  progress.yml            ← auto-generated tracker
  validate.cjs            ← copied from skill
  multi-stage.cjs         ← copied from skill
  session.md              ← auto-generated from active stage
  round-1.md              ← active stage's round files
  round-1-fixed.md
  archive/
    stage-1-scraping-apify/
      summary.yml
      session.md
      round-1.md
      round-1-fixed.md
      round-2.md
      round-2-fixed.md
      round-3.md           ← the PERFECT round
```

### Step 0 — Detect Multi-Stage Mode (ALL modes)

Every mode (REVIEW, FIX, AUDIT) MUST insert this step **before step 1**:

```
0. Detect multi-stage mode — Check if `.code-review-ping-pong/stages.yml` exists.
   - If YES: read it. Find the stage with status: active.
     - No active stage found → tell user:
       "Nenhum stage ativo. Rode: node multi-stage.cjs activate <id>"
       Stop execution.
     - Active stage found → run `node multi-stage.cjs init` (or generate
       session.md manually from the stage's files, goals, and constraints).
       Proceed with step 1 using this session.md as scope.
   - If NO: proceed with existing logic (legacy single-cycle mode).
```

**Implementation:** The `multi-stage.cjs` script handles session.md generation,
archiving, and progress tracking operationally. Agents can call the script
directly or perform the equivalent file operations manually.

### REVIEW Mode — Additional Step on PERFECT (multi-stage only)

When verdict is `PERFECT` and multi-stage mode is active, **after writing the PERFECT round file**:

1. Run `node multi-stage.cjs archive` (or perform the archiving steps manually)
2. Display the **Stage Complete** banner (see below)
3. Add an option to the numbered prompt: "Ativar próximo stage"

### FIX and AUDIT Modes — Additional Final Step (multi-stage only)

After writing the fix/audit report, **regenerate `progress.yml`** by running
`node multi-stage.cjs progress` (or performing the equivalent: read stages.yml,
scan round files, scan archives, write progress.yml).

### AUDIT Mode — Cross-Stage Analysis (optional)

In multi-stage mode, the auditor may optionally read archived stages' rounds
for deeper cross-stage pattern analysis. This is advisory — the auditor should
mention if the same type of issue appears across different stages.

### Handoff Banners — Multi-Stage Addition

When multi-stage mode is active, add a stage line to ALL handoff banners:

```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ 🟢 PRÓXIMO: CODEX (REVIEW)           ┃
┃ 📋 Stage 2/9: Workers                ┃
┃ 👉 Abra o Codex e rode: review mode  ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
```

### Stage Complete Banner (new)

When a stage reaches 10/10 in multi-stage mode:

```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ ✅ STAGE COMPLETE: {name} (10/10)           ┃
┃ 📊 Progresso: {X}/{Y} stages ({Z}%)        ┃
┃ 📁 Arquivado em: archive/stage-{id}-{slug}/ ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
```

### All Stages Complete Banner (new)

When the last stage reaches 10/10:

```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ 🏆 ALL STAGES COMPLETE: {Y}/{Y} (100%)        ┃
┃ ✅ Full codebase review done                   ┃
┃ 📊 {total_issues} issues found, {fixed} fixed  ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
```

### Multi-Stage Tips

- **Keep stages focused.** 5-15 files per stage is ideal. More than 20 files risks too many issues per round.
- **Group by domain.** Stage boundaries should follow module/layer boundaries in the codebase.
- **Order matters.** Review foundational layers first (db, lib) before higher layers (api, components) so fixes propagate correctly.
- **One active at a time.** Complete a stage before starting the next. This prevents context fragmentation.
- **Archive is read-only.** Never modify files in `archive/`. They are historical records.
- **3-5 rounds per stage is typical.** If a stage exceeds 7 rounds, consider splitting it into smaller stages.

---

## User Interaction Rule

Every mode MUST end with a prompt presenting numbered options.
- **Claude Code:** use `AskUserQuestion` tool.
- **Codex / other platforms:** fall back to a numbered text prompt in the response. The user replies with the number.
- The user should never need to type a free-form command — just pick a number.
- **Reset (whichever option number it is) requires explicit confirmation** before deleting any files. Present a second prompt: "Tem certeza? Isso apaga todo o histórico de rounds. (sim/não)"
- Before the numbered options, every response MUST print a 4-line status block exactly in this shape:
  ```
  📍 Estado atual: {WAITING_FOR_FIX | WAITING_FOR_REVIEW | WAITING_FOR_AUDIT | WAITING_FOR_CRITICA | COMPLETE}
  👤 Próximo agente: {🟠 CLAUDE CODE | 🟢 CODEX | 🔵 GEMINI | NONE}
  ⚡ Próximo comando: {fix mode | review mode | audit mode | critica | none}
  📄 Próximo arquivo esperado: {path | critica.md | none}
  ```
- If the expected next artifact does not exist yet, say explicitly: `Artefato pendente: {path} ainda não existe.`
- If the expected next artifact already exists, say explicitly: `Artefato encontrado: {path}.`
- After the status block, include the copy-paste handoff block only when `next_agent` is not `NONE`.

## Handoff Banners (MANDATORY)

Every mode MUST end with a handoff banner indicating whose turn is next.
These banners are mandatory and must be displayed BEFORE the numbered options.
Copy them exactly — they must be visually unmistakable.

**IMPORTANT:** When the cycle is COMPLETE (🏆 banner), do NOT emit the copy-paste handoff
block. The copy-paste block only exists to hand off to a next agent — when `next_agent`
is `NONE`, there is no one to hand off to. Show only the banner, status block, and options.

### When it's CODEX's turn:

```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ 🟢 PRÓXIMO: CODEX (REVIEW)           ┃
┃ 👉 Abra o Codex e rode: review mode  ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
```

### When it's CLAUDE CODE's turn (FIX):

```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ 🟠 PRÓXIMO: CLAUDE CODE (FIX)        ┃
┃ 👉 Abra o Claude e rode: fix mode    ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
```

### When it's CLAUDE CODE's turn (CRITICA):

```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ 🟠 PRÓXIMO: CLAUDE CODE (CRITICA)    ┃
┃ 👉 Abra o Claude e rode: critica     ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
```

### When it's GEMINI's turn:

```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ 🔵 PRÓXIMO: GEMINI (AUDIT)           ┃
┃ 👉 Abra o Gemini e rode: audit mode  ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
```

### When cycle is COMPLETE:

```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ 🏆 CICLO COMPLETO: 10/10             ┃
┃ ✅ Nada mais a fazer                 ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
```

### Color code
- 🟢 = Codex (REVIEW)
- 🟣 = Claude Code (FIX)
- 🔵 = Gemini (AUDIT)
- 🟣 = Claude Code (CRITICA)
- 🏆 = COMPLETE (após crítica aprovada)

---

## Meta-Teste Recomendado

Para validar este skill, rode um ciclo ping-pong no próprio SKILL.md + templates (scope: ping-pong-meta).
O meta-teste é especialmente valioso porque corrige inconsistências internas durante a execução,
garantindo que o skill esteja auto-consistente antes de revisar código de terceiros.

Ao criar o session.md para o meta-teste, inclua sempre:
- Contratos de handoff: nomenclaturas, schemas e targets downstream são consistentes e verificáveis?

---

### Severity emojis (MANDATORY in all output)

Use these emojis BEFORE every severity label — in findings, summaries, and status lines:

| Severity | Emoji | Example |
|----------|-------|---------|
| CRITICAL | 🔴 | 🔴 **Critical:** race condition in... |
| HIGH | 🟠 | 🟠 **High:** validation accepts malformed... |
| MEDIUM | 🟡 | 🟡 **Medium:** missing error boundary... |
| LOW | 🟢 | 🟢 **Low:** inconsistent naming... |

Also use emojis in these contexts:
- ✅ = issue fixed, check passed, positive observation
- ❌ = issue not fixed, check failed
- ⚠️ = warning, partial fix, deviation
- 📋 = scope/files reference
- 🎯 = score line
- 📊 = summary stats

## References

- `references/review-template.md` — Template for REVIEW mode (YAML + Markdown)
- `references/fix-template.md` — Template for FIX mode (YAML + Markdown)
- `references/audit-template.md` — Template for AUDIT mode (YAML + Markdown)
- `references/stages-template.yml` — Template for `stages.yml` (multi-stage config)
- `references/progress-template.yml` — Template for `progress.yml` (auto-generated tracker)
- `references/stage-summary-template.yml` — Template for archive `summary.yml`
- `scripts/validate.cjs` — Validates round files, stages, progress, and stage-summary
- `scripts/multi-stage.cjs` — Multi-stage orchestration (init, activate, archive, progress, status)
