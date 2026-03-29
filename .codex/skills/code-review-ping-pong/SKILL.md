---
name: code-review-ping-pong
description: "Cross-AI code review protocol. Codex runs REVIEW mode: analyzes code, writes structured findings with YAML frontmatter to .code-review-ping-pong/round-N.md. Claude Code runs FIX mode. Cycle repeats until 10/10."
---

# Code Ping-Pong — Codex REVIEW Mode

This skill activates REVIEW mode. Codex analyzes code and writes structured findings.
The counterpart (Claude Code) reads the findings and implements fixes.

## Protocol

Communication happens via `.code-review-ping-pong/` directory at project root.
Every round file uses **hybrid format**: YAML frontmatter (machine-readable) + Markdown body (human-readable).

## REVIEW Steps

1. **Require scope** — Resolve using priority chain:
   1. **Story** — Check `docs/stories/active/` for active story. If found and relevant, its File List and ACs define scope. Story is source of truth.
   2. **session.md** — Read `.code-review-ping-pong/session.md` if it exists. Complements story, does not replace it.
   3. **User input** — Use files/features specified by user.
   4. **None** — Ask user for scope. Never default to arbitrary git diff or full project scan.

2. **Detect round** — List `.code-review-ping-pong/round-*.md` files (exclude `*-fixed.md`). Find highest N. New round = N+1. If none exist, start at 1.

3. **Anchor git state** — Run:
   ```bash
   git rev-parse --short HEAD
   git branch --show-current
   ```
   Record both in the YAML frontmatter.

4. **Check previous fix** — If `round-{N-1}-fixed.md` exists, read it. Check whether fixes introduced regressions.

5. **Analyze code** — Review all in-scope files for: bugs, security, performance, readability, error handling, test coverage, architecture.

6. **Score** — 1 to 10. Be honest. Do not omit issues.

7. **Write round file** — Create `.code-review-ping-pong/round-{N}.md` with this exact structure:

```markdown
---
protocol: code-review-ping-pong
type: review
round: {N}
date: "{YYYY-MM-DD}"
reviewer: "Codex"
commit_sha: "{from git rev-parse --short HEAD}"
branch: "{from git branch --show-current}"
based_on_fix: "{round-{N-1}-fixed.md | null}"
files_in_scope:
  - "path/to/file1"
  - "path/to/file2"
score: {1-10}
verdict: "{CONTINUE | PERFECT}"
issues:
  - id: "{N}.1"
    severity: "{CRITICAL | HIGH | MEDIUM | LOW}"
    title: "{short title}"
    file: "path/to/file"
    line: {number}
    suggestion: "{one-line fix}"
---

# Code Ping-Pong — Round {N} Review

## 🎯 Score: {X}/10 — {CONTINUE | PERFECT}

## Issues

### {🔴|🟠|🟡|🟢} {SEVERITY}

#### {🔴|🟠|🟡|🟢} Issue {N}.1 — {title}
- **File:** `path/to/file`
- **Line:** {number}
- **Code:** (snippet)
- **Problem:** (description)
- **Suggestion:** (code fix)

## ⚠️ Regressions
- (issues introduced by previous fixes, or "None")

## ✅ What Is Good
- (things that must NOT change)

## 📊 Summary
- Total: {X}, 🔴 CRITICAL: {X}, 🟠 HIGH: {X}, 🟡 MEDIUM: {X}, 🟢 LOW: {X}
- Regressions: {count or "none"}
```

8. **Validate** — If `.code-review-ping-pong/validate.cjs` exists, run `node .code-review-ping-pong/validate.cjs round-{N}.md`.

9. **Verdict and next action** — Display the appropriate handoff banner, then present options:
   - If `CONTINUE`: show CLAUDE CODE banner, then options:
     ```
     ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
     ┃ 🟣 PRÓXIMO: CLAUDE CODE (FIX)        ┃
     ┃ 👉 Abra o Claude e rode: fix mode    ┃
     ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

     🎯 Round {N} review completa. Score: {X}/10. {Y} issues encontradas.

     📍 Estado atual: WAITING_FOR_FIX
     👤 Próximo agente: CLAUDE CODE
     ⚡ Próximo comando: fix mode
     📄 Próximo arquivo esperado: .code-review-ping-pong/round-{N}-fixed.md

     ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
     ┃ 📋 COPIE O BLOCO ABAIXO → COLE NO CLAUDE CODE    ┃
     ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

     ative a skill code-review-ping-pong em modo FIX.

     Contexto:
     - Projeto: {project_name}
     - Diretório de rounds: .code-review-ping-pong/
     - Artefato anterior: round-{N}.md
     - Score anterior: {X}/10
     - Escopo: .code-review-ping-pong/session.md
     - Branch: {branch}

     Leia .code-review-ping-pong/round-{N}.md para entender os findings, aplique as correções no código atual e gere .code-review-ping-pong/round-{N}-fixed.md.

     ━━━━━━━━━━━━━━━━ FIM DO BLOCO ━━━━━━━━━━━━━━━━━━━

     1. Mandar pro Claude Code corrigir (rodar FIX mode)
     2. Ver detalhes da review (round-{N}.md)
     3. Ajustar escopo e re-revisar
     ```
   - If `PERFECT`: show COMPLETE banner, then options:
     ```
     ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
     ┃ 🏆 CICLO COMPLETO: 10/10             ┃
     ┃ ✅ Nada mais a fazer                 ┃
     ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

     🏆 Código 10/10! Ciclo completo em {N} rounds.

     📍 Estado atual: COMPLETE
     👤 Próximo agente: NONE
     ⚡ Próximo comando: none
     📄 Próximo arquivo esperado: none

     1. Encerrar (nada mais a fazer)
     2. Ver histórico completo dos rounds
     3. Iniciar novo ciclo com escopo diferente
     ```

## Severity Emojis (MANDATORY in all output)

| Severity | Emoji | Example |
|----------|-------|---------|
| CRITICAL | 🔴 | 🔴 **Critical:** race condition in... |
| HIGH | 🟠 | 🟠 **High:** validation accepts malformed... |
| MEDIUM | 🟡 | 🟡 **Medium:** missing error boundary... |
| LOW | 🟢 | 🟢 **Low:** inconsistent naming... |

Also use: ✅ (good/fixed), ❌ (failed), ⚠️ (warning/skipped), 📋 (scope), 🎯 (score), 📊 (summary)

## Rules

- YAML `issues` array MUST match Markdown issues exactly.
- Every issue needs: file, line, code snippet, suggestion.
- Report ALL issues including regressions. Never omit to maintain a "fewer issues" narrative.
- `commit_sha`, `branch`, `files_in_scope` are mandatory.
- "What Is Good" section is mandatory.
- If PERFECT, `issues` must be empty array `[]`.

## Full Protocol Reference

The complete protocol with both modes (REVIEW + FIX) is at `skills/code-review-ping-pong/SKILL.md`.
Templates at `skills/code-review-ping-pong/references/review-template.md` and `fix-template.md`.
Validator at `skills/code-review-ping-pong/scripts/validate.cjs`.
