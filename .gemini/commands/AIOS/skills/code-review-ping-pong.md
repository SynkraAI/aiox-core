---
name: code-review-ping-pong
description: >-
  Protocolo cross-AI de revisão de código entre Codex (revisor), Claude Code
  (corretor) e Gemini (auditor). Ciclo ping-pong com rodadas numeradas:
  Codex revisa → Claude corrige → Gemini audita. Repete até nota 10/10.
  Modos: REVIEW, FIX, AUDIT. Comunicação via `.code-review-ping-pong/`.
risk: safe
source: opensquad
paths:
  - "skills/code-review-ping-pong/"
lazy_load: true
context_budget: 800
---

# Code Review Ping-Pong

Protocolo onde três AIs colaboram através de arquivos compartilhados com metadados estruturados. Um revisa, outro corrige, um terceiro audita. Alternam até o código atingir 10/10.

## When to Use This Skill

- Revisão de código que exige múltiplas rodadas e perspectivas diferentes
- Quando quer auditoria cruzada entre diferentes modelos de IA
- Ciclos de melhoria de qualidade com histórico rastreável
- Revisão colaborativa antes de PRs críticos ou deploys

## Do NOT Use This Skill When

- Revisão rápida de um único arquivo (use `/AIOS:skills:code-refactoring-refactor-clean` diretamente)
- Não há escopo definido e o usuário não pode fornecer um
- O código já está em produção e não pode ser alterado

## Discovery Questions

Perguntas a fazer antes de executar. Use AskUserQuestion. Pule se o usuário já forneceu o contexto.

1. **Qual é o escopo? (arquivos, feature, story ativa)** — (sem escopo o revisor não sabe o que analisar)
2. **Quer usar o fluxo de 2 AIs (Codex + Claude) ou 3 AIs (+ Gemini audit)?** — (o audit é opcional mas agrega valor em ciclos longos)
3. **Existe uma story ativa em `docs/stories/active/`?** — (a story é a fonte de verdade do escopo e dos ACs)

## Prerequisites

- Diretório `.code-review-ping-pong/` criado na raiz do projeto
- `session.md` com escopo definido (ou story ativa em `docs/stories/active/`)
- `validate.cjs` copiado de `skills/code-review-ping-pong/scripts/validate.cjs`

## Workflow

### Fluxo Padrão (2 AIs)

```
Codex (REVIEW) → round-1.md → Claude Code (FIX) → round-1-fixed.md → loop até PERFECT
```

### Fluxo Completo (3 AIs, com audit Gemini)

```
Codex REVIEW → round-N.md → Claude FIX → round-N-fixed.md → Gemini AUDIT → round-N-audit.md → loop
```

### Modos

| Modo | Executor | O que faz |
|------|----------|-----------|
| REVIEW | Codex | Analisa código, atribui score 1-10, lista issues em YAML |
| FIX | Claude Code | Lê issues, aplica correções, roda lint/tests, gera fix report |
| AUDIT | Gemini | Lê TODOS os rounds, detecta padrões recorrentes e blind spots |

### Formato dos Arquivos

Cada round file usa frontmatter YAML + corpo Markdown. O YAML é o contrato para parsing automático; o Markdown é para humanos.

| Arquivo | Autor | Propósito |
|---------|-------|-----------|
| `session.md` | Usuário | Escopo, metas, restrições |
| `round-{N}.md` | Codex | Review com YAML + Markdown |
| `round-{N}-fixed.md` | Claude Code | Fix report com YAML + Markdown |
| `round-{N}-audit.md` | Gemini | Análise cruzada com process health score |

### Encerramento

- Score < 10 → verdict `CONTINUE` → próximo round
- Score = 10 → verdict `PERFECT` → ciclo encerrado
- Cada modo termina com banner de handoff indicando quem é o próximo

## Best Practices

- **Escopo é obrigatório.** Sem `session.md` ou story ativa, perguntar ao usuário antes de prosseguir
- **YAML é o contrato**, Markdown é a explicação — sempre parsear YAML primeiro
- **Âncora git:** ambos os lados registram `commit_sha` para garantir que estão revisando/corrigindo o mesmo código
- **3 a 5 rounds é o normal.** Se round 7+ ainda tem issues, o escopo está amplo demais
- **Reset requer confirmação explícita** antes de apagar qualquer arquivo de round
- Adicionar `.code-review-ping-pong/` ao `.gitignore` se os rounds não devem ser commitados

## Severity Emojis (MANDATORY in all output)

| Severity | Emoji | Example |
|----------|-------|---------|
| CRITICAL | 🔴 | 🔴 **Critical:** race condition in... |
| HIGH | 🟠 | 🟠 **High:** validation accepts malformed... |
| MEDIUM | 🟡 | 🟡 **Medium:** missing error boundary... |
| LOW | 🟢 | 🟢 **Low:** inconsistent naming... |

Also use: ✅ (good/fixed), ❌ (failed), ⚠️ (warning/skipped), 📋 (scope), 🎯 (score), 📊 (summary)

## Status Block (MANDATORY before options)

Every mode MUST print this status block with emojis:

```
📍 Estado atual: {WAITING_FOR_FIX | WAITING_FOR_REVIEW | WAITING_FOR_AUDIT | COMPLETE}
👤 Próximo agente: {CLAUDE CODE | CODEX | GEMINI | NONE}
⚡ Próximo comando: {fix mode | review mode | audit mode | none}
📄 Próximo arquivo esperado: {path | none}
```

## Handoff Copy-Paste Block (MANDATORY)

After status block, ALWAYS include a visually distinct copy-paste block:

```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ 📋 COPIE O BLOCO ABAIXO → COLE NO {NEXT_AGENT}   ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

{handoff content}

━━━━━━━━━━━━━━━━ FIM DO BLOCO ━━━━━━━━━━━━━━━━━━━
```

## Handoff Banners

Cada modo DEVE terminar com o banner correto (copiar exatamente):

```
🟢 PRÓXIMO: CODEX (REVIEW)   — Abra o Codex e rode: review mode
🟣 PRÓXIMO: CLAUDE CODE (FIX) — Abra o Claude e rode: fix mode
🔵 PRÓXIMO: GEMINI (AUDIT)   — Abra o Gemini e rode: audit mode
🏆 CICLO COMPLETO: 10/10      — Nada mais a fazer
```

## References

- `skills/code-review-ping-pong/references/review-template.md` — template REVIEW
- `skills/code-review-ping-pong/references/fix-template.md` — template FIX
- `skills/code-review-ping-pong/references/audit-template.md` — template AUDIT
- `skills/code-review-ping-pong/scripts/validate.cjs` — validador de round files
