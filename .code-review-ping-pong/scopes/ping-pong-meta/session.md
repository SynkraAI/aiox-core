# Ping-Pong Session — Code Review Ping-Pong (Meta-Teste)

## Scope
- files:
  - skills/code-review-ping-pong/SKILL.md
  - skills/code-review-ping-pong/references/review-template.md
  - skills/code-review-ping-pong/references/fix-template.md
  - skills/code-review-ping-pong/references/audit-template.md

## Goals
- O skill funciona como documentado? Instruções são claras e sem ambiguidade?
- State machine (REVIEW → FIX → AUDIT → loop) tem gaps ou estados impossíveis?
- Templates cobrem todos os campos necessários? YAML frontmatter é consistente?
- Handoff blocks são copy-pasteable e contêm contexto suficiente?
- Scoped sessions: a documentação explica claramente como usar --scope?
- Validator (validate.cjs) e orchestrator (orchestrate.cjs): referenciados corretamente?
- Edge cases cobertos: o que acontece se round-N.md não existe? Score já é 10/10 no round 1?
- Texto pt-BR com acentuação completa (Artigo VII)
- Contradições internas (SKILL.md vs templates vs next-step.md spec)

## Constraints
- São arquivos markdown — skill definition + templates de referência
- Meta-teste: estamos usando o skill para revisar ele mesmo
- Foco: coerência interna, completude, usabilidade cross-agent (Codex, Claude, Gemini)
