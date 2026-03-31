---
protocol: code-review-ping-pong
type: fix
round: 5
date: "2026-03-31"
fixer: "Claude Opus 4.6"
review_file: round-5.md
commit_sha_before: "0423ca5deb400bee69685b6911a5f4384bd8d5c0"
commit_sha_after: "b1bfa08ab919b21b4f7deb1b408d5cc8afc778ad"
branch: chore/devops-10-improvements
issues_fixed: 3
issues_skipped: 0
issues_total: 3
git_diff_stat: "2 files changed, 18 insertions(+), 8 deletions(-)"
quality_checks:
  lint: skipped
  typecheck: skipped
  tests: skipped
fixes:
  - id: "5.1"
    status: FIXED
    file: "engine/checklist.md"
    description: "Substituída validação pack-only por resolução em cascata (pack → quest-log sub-item → abort) nos 3 fluxos: check, skip e unused. Sub-itens herdam fase/lock do parent."
    deviation: "none"
  - id: "5.2"
    status: FIXED
    file: "engine/guide.md"
    description: "Edge case 'quest-log item not in pack' agora distingue órfãos legados (ignorar) de sub-itens válidos (exibir aninhados sob o parent com indentação)."
    deviation: "none"
  - id: "5.3"
    status: FIXED
    file: "engine/guide.md"
    description: "Algoritmo-resumo §2 alinhado com is_phase_unlocked: aceita 'done' ou 'unused' para itens required, e exige verify_phase_integration() antes de liberar próximo world."
    deviation: "none"
preserved:
  - "engine/ceremony.md — sem issues nesta rodada"
  - "engine/scanner.md — sem issues nesta rodada"
  - "engine/xp-system.md — sem issues nesta rodada"
  - "SKILL.md — sem issues nesta rodada"
---

# Code Review Ping-Pong — Round 5 Fix Report

## Summary

3 issues corrigidas (1 HIGH, 2 MEDIUM). Tema central: sub-itens criados via `/quest sub` existiam no quest-log mas não tinham caminho de conclusão nem visibilidade no status view, e o algoritmo-resumo de unlock divergia da implementação normativa.

### Anti-Whack-a-Mole

O padrão da issue 5.1 (validação exclusiva contra o pack) aparecia em **3 pontos** do checklist.md (check linha 210, skip linha 233, unused linha 249). Todos foram corrigidos na mesma passada.

---

## Fixes

### Fix for Issue 5.1

**Severity:** HIGH
**File:** `engine/checklist.md` (3 pontos: check, skip, unused)

**Problema:** Os fluxos `check`, `skip` e `unused` validavam IDs exclusivamente contra os itens do pack. Sub-itens criados via `/quest sub` vivem apenas no quest-log, então não podiam ser marcados como `done`, `skipped` ou `unused` — a feature nascia sem caminho de conclusão.

**Correção:** Substituída a validação `exists in pack` por resolução em cascata:
1. Se o ID existe no pack → usa direto
2. Se o ID existe no quest-log e é sub-item válido (`sub_of` ou 3+ partes) → resolve o parent para herdar fase/lock
3. Caso contrário → abort com mensagem atualizada

Aplicado nos 3 fluxos (check, skip, unused) para consistência.

### Fix for Issue 5.2

**Severity:** MEDIUM
**File:** `engine/guide.md` (edge cases §8)

**Problema:** A regra "quest-log item not in pack: ignore it" descartava sub-itens válidos do status view, contradizendo a documentação de UI em checklist.md §7.5 que define sub-itens como linhas aninhadas na CLI.

**Correção:** A regra agora distingue dois casos:
- Itens órfãos legados → continua ignorando
- Sub-itens válidos (detectados via `sub_of` ou ID de 3+ partes) → exibir aninhados sob o parent com indentação visual

### Fix for Issue 5.3

**Severity:** MEDIUM
**File:** `engine/guide.md` (algoritmo §2)

**Problema:** O pseudo-fluxo introdutório dizia que phase N desbloqueia quando "ALL required items are done", omitindo que `unused` também satisfaz a condição e que `verify_phase_integration()` é obrigatória. Isso podia levar um LLM a bloquear worlds legitimamente abertos ou pular o Integration Gate.

**Correção:** Algoritmo-resumo alinhado com `is_phase_unlocked()`:
- Aceita `done` **ou** `unused` para itens required
- Exige `verify_phase_integration()` para o phase anterior (com referência a §2.5)

---

## Skipped Issues

Nenhuma issue foi pulada nesta rodada.
