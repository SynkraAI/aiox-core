---
name: code-review-ping-pong
description: "Cross-AI code review protocol between Codex (reviewer), Claude Code (fixer), and Gemini (auditor). Ping-pong cycle with optional audit: Codex reviews, Claude fixes, Gemini audits both. Repeat until 10/10. Triggers: pingpong, code-review-ping-pong, bate-bola, cross-review."
---

# Code Review Ping-Pong v3 — Cross-AI Review Protocol

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
5. **Emit a copy-paste handoff block** for the next agent, so the operator can paste one message and continue the cycle with no ambiguity.

The user should never have to infer whether the cycle is waiting on REVIEW, FIX, or AUDIT.
If the expected next artifact does not exist, the current agent MUST say so plainly.

### Copy-paste handoff block (MANDATORY)

After the banner and status block, every mode MUST include a copy-pasteable handoff message
for the next agent. This block is mandatory and must be self-contained.

Use this exact structure (the box banner + "FIM DO BLOCO" delimiter are MANDATORY):

````text
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ 📋 COPIE O BLOCO ABAIXO → COLE NO {NEXT_AGENT}   ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

ative a skill code-review-ping-pong em modo {REVIEW | FIX | AUDIT}.

Contexto:
- Projeto: {project_name}
- Diretório de rounds: .code-review-ping-pong/
- Artefato anterior: {latest_relevant_artifact}
- Escopo: {story ativa | session.md | escopo explícito}
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
- current_mode: {REVIEW | FIX | AUDIT}
- cycle_state: {WAITING_FOR_FIX | WAITING_FOR_REVIEW | WAITING_FOR_AUDIT | COMPLETE}
- next_agent: {CLAUDE CODE | CODEX | GEMINI | NONE}
- next_mode: {fix mode | review mode | audit mode | none}
- expected_artifact: {.code-review-ping-pong/round-{N}-fixed.md | .code-review-ping-pong/round-{N+1}.md | .code-review-ping-pong/round-{N}-audit.md | none}
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

Templates with the exact format: `references/review-template.md`, `references/fix-template.md`, and `references/audit-template.md`.

## Modes

Detect mode from user input or arguments. Three modes exist: REVIEW, FIX, and AUDIT.

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
   - Score < 10 → verdict `CONTINUE`
   - Score = 10 → verdict `PERFECT` (cycle ends)
10. **Prompt next action** — Display the appropriate handoff banner (see "Handoff Banners" section), then present numbered options:
    - If `CONTINUE`: show CLAUDE CODE banner, then:
      ```
      🎯 Round {N} review completa. Score: {X}/10. {Y} issues encontradas.

      📍 Estado atual: WAITING_FOR_FIX
      👤 Próximo agente: CLAUDE CODE
      ⚡ Próximo comando: fix mode
      📄 Próximo arquivo esperado: .code-review-ping-pong/round-{N}-fixed.md

      ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
      ┃ 📋 COPIE O BLOCO ABAIXO → COLE NO CLAUDE CODE   ┃
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
    - If `PERFECT`: show COMPLETE banner, then:
      ```
      🏆 Código 10/10! Ciclo completo em {N} rounds.

      📍 Estado atual: COMPLETE
      👤 Próximo agente: NONE
      ⚡ Próximo comando: none
      📄 Próximo arquivo esperado: none

      1. Encerrar (nada mais a fazer)
      2. Ver histórico completo dos rounds
      3. Iniciar novo ciclo com escopo diferente
      ```

#### Rules for REVIEW mode

- Be specific: include file path, line number, and code snippet for every issue.
- Acknowledge what is good — the fixer must know what NOT to change.
- Do not invent issues to lower the score. If the code is genuinely good, score it high.
- Report ALL issues found, including regressions from previous fixes. Honesty over narrative.
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
   - Output: "Código já está 10/10! Nada a corrigir. O ciclo está completo."
   - Stop execution.
4. **Guard: already fixed** — If `round-{N}-fixed.md` already exists for the latest round:
   - Output: "Round {N} já foi corrigido. Peça ao Codex para rodar REVIEW novamente."
   - Stop execution.
5. **Verify git state** — Compare current `git rev-parse --short HEAD` with the review's `commit_sha`. If they differ, warn: "Cuidado: o código mudou desde a review (review: {sha}, atual: {sha}). Verifique se as issues ainda se aplicam." Proceed with caution but do not block.
6. **Parse issues from YAML** — Extract the `issues` array from the YAML frontmatter. Sort by severity: CRITICAL > HIGH > MEDIUM > LOW.
7. **Fix issues** — Implement fixes one by one:
   - Read the referenced file and line for each issue.
   - Apply the fix. If the suggested fix is wrong or incomplete, use better judgment but document the deviation.
   - After each fix, verify the file has no syntax errors.
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
    👤 Próximo agente: CODEX
    ⚡ Próximo comando: review mode
    📄 Próximo arquivo esperado: .code-review-ping-pong/round-{N+1}.md

    ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
    ┃ 📋 COPIE O BLOCO ABAIXO → COLE NO CODEX          ┃
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

    ━━━━━━━━━━━━━━━━ FIM DO BLOCO ━━━━━━━━━━━━━━━━━━━

    1. Mandar pro Codex revisar (rodar REVIEW round {N+1})
    2. Mandar pro Gemini auditar (rodar AUDIT — opcional)
    3. Ver detalhes do fix report (round-{N}-fixed.md)
    4. Resetar ciclo (apagar rounds e recomeçar)
    ```
    Note: if user picks option 2, show the GEMINI banner instead.

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
   👤 Próximo agente: CODEX
   ⚡ Próximo comando: review mode
   📄 Próximo arquivo esperado: .code-review-ping-pong/round-{N+1}.md

   ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
   ┃ 📋 COPIE O BLOCO ABAIXO → COLE NO CODEX          ┃
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
| `session.md` | User | Scope, goals, constraints (recommended) |
| `round-{N}.md` | Reviewer (Codex) | Review with YAML metadata + Markdown detail |
| `round-{N}-fixed.md` | Fixer (Claude Code) | Fix report with YAML metadata + Markdown detail |
| `round-{N}-audit.md` | Auditor (Gemini) | Cross-cutting audit with process health score |
| `next-step.md` | Current agent | Single source of truth for the exact next move in the cycle |
| `validate.cjs` | Auto-generated | Validates round file YAML structure |

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

## Tips

- **Scope is mandatory.** Without session.md or explicit scope, the reviewer must ask before proceeding.
- **3-5 rounds is typical.** If round 7+ still has issues, the scope may be too broad.
- **Git anchoring prevents drift.** Both sides record commit_sha to ensure they review/fix the same code.
- **YAML is the contract, Markdown is the explanation.** Parse YAML for automation, read Markdown for context.
- **Add `.code-review-ping-pong/` to `.gitignore`** if review files should not be committed.

## User Interaction Rule

Every mode MUST end with a prompt presenting numbered options.
- **Claude Code:** use `AskUserQuestion` tool.
- **Codex / other platforms:** fall back to a numbered text prompt in the response. The user replies with the number.
- The user should never need to type a free-form command — just pick a number.
- **Reset (whichever option number it is) requires explicit confirmation** before deleting any files. Present a second prompt: "Tem certeza? Isso apaga todo o histórico de rounds. (sim/não)"
- Before the numbered options, every response MUST print a 4-line status block exactly in this shape:
  ```
  📍 Estado atual: {WAITING_FOR_FIX | WAITING_FOR_REVIEW | WAITING_FOR_AUDIT | COMPLETE}
  👤 Próximo agente: {CLAUDE CODE | CODEX | GEMINI | NONE}
  ⚡ Próximo comando: {fix mode | review mode | audit mode | none}
  📄 Próximo arquivo esperado: {path | none}
  ```
- If the expected next artifact does not exist yet, say explicitly: `Artefato pendente: {path} ainda não existe.`
- If the expected next artifact already exists, say explicitly: `Artefato encontrado: {path}.`
- After the status block, every response MUST also include the `Cole isso no ...` block for the next agent.

## Handoff Banners (MANDATORY)

Every mode MUST end with a handoff banner indicating whose turn is next.
These banners are mandatory and must be displayed BEFORE the numbered options.
Copy them exactly — they must be visually unmistakable.

### When it's CODEX's turn:

```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ 🟢 PRÓXIMO: CODEX (REVIEW)           ┃
┃ 👉 Abra o Codex e rode: review mode  ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
```

### When it's CLAUDE CODE's turn:

```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ 🟣 PRÓXIMO: CLAUDE CODE (FIX)        ┃
┃ 👉 Abra o Claude e rode: fix mode    ┃
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
- 🏆 = PERFECT (fim)

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
- `scripts/validate.cjs` — Round file validator (copy to `.code-review-ping-pong/`)
