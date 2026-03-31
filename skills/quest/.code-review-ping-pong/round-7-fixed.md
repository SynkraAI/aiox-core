---
protocol: code-review-ping-pong
type: fix
round: 7
date: "2026-03-31"
fixer: "Claude Opus 4.6"
review_file: round-7.md
commit_sha_before: "ddf92d59ca1c5eef277b6ffe40645a217393dc70"
commit_sha_after: "9456aa14bba89bc7d3d42cf42b24ff765e15a5f2"
branch: chore/devops-10-improvements
issues_fixed: 3
issues_skipped: 0
issues_total: 3
git_diff_stat: "2 files changed, 9 insertions(+), 7 deletions(-)"
quality_checks:
  lint: skipped
  typecheck: skipped
  tests: skipped
fixes:
  - id: "7.1"
    status: FIXED
    file: "engine/guide.md"
    description: "Tabela de phase state em §5 agora deriva LOCKED/CURRENT do predicado is_phase_unlocked() do §2, incluindo Integration Gate. Adicionada nota CRITICAL explicando que para rendering puro (sem interação), checar quest_log.integration_results[phase_index].passed."
    deviation: "none"
  - id: "7.2"
    status: FIXED
    file: "engine/guide.md"
    description: "World Complete (§4.2) e Final Victory (§4.5) agora referenciam resolved_items (pack items + sub-itens válidos) para cálculo de completude, alinhado com xp-system.md §2.0."
    deviation: "none"
  - id: "7.3"
    status: FIXED
    file: "SKILL.md"
    description: "argument-hint atualizado de 'check | skip | scan | status' para incluir 'unused <id>' e 'sub <parent_id> <label>', alinhando com os comandos documentados no Command Routing."
    deviation: "none"
preserved:
  - "engine/ceremony.md — sem issues nesta rodada"
  - "engine/checklist.md — sem issues nesta rodada"
  - "engine/scanner.md — sem issues nesta rodada"
  - "engine/xp-system.md — sem issues nesta rodada"
---

# Code Review Ping-Pong — Round 7 Fix Report

## Summary

3 issues corrigidas (1 HIGH, 1 MEDIUM, 1 LOW). Tema central: drift entre o predicado de unlock usado na progressão real (§2) e o que o status view renderizava (§5), e celebrações de completude que ignoravam sub-itens já reconhecidos pelo xp-system como trabalho real.

### Anti-Whack-a-Mole

- **7.1 — status view phase state:** Grep por `Previous phase has pending required items` confirmou que o padrão simplificado existia apenas na tabela de §5 (linha 561). A tabela de State Labels em §6 (linha 622) usa termos genéricos ("unlocked", "Locked") que referenciam o conceito já definido em §5 — agora correto. Nenhum outro ponto no escopo derivava phase state de forma divergente.
- **7.2 — "ALL items in a phase":** Grep por `ALL items in a phase` e `pending items in any phase` confirmou que o padrão aparecia apenas em guide.md §4.2 (linha 327) e §4.5 (linha 389). Ambos corrigidos. O xp-system.md já usava `resolved_items` corretamente desde round 6.
- **7.3 — argument-hint:** Grep por `argument-hint` confirmou que existe apenas em SKILL.md linha 5. Corrigido.

---

## Fixes

### Fix for Issue 7.1

**Severity:** HIGH
**File:** `engine/guide.md` (§5, tabela de Rules)
**What changed:** A tabela de phase state agora usa `is_phase_unlocked()` como predicado canônico, incluindo tanto a condição de required items quanto o Integration Gate. Adicionada nota CRITICAL explicando que em contexto de rendering puro (sem interação com o usuário), o gate é verificado via `quest_log.integration_results[phase_index].passed` — se a entrada não existe ou `passed == false`, a fase permanece LOCKED.
**Why:** O status view mostrava fases como desbloqueadas quando os required items estavam done, mesmo que o Integration Gate tivesse falhado. Isso criava drift entre o que `/quest status` comunicava e o que a progressão real permitia.

### Fix for Issue 7.2

**Severity:** MEDIUM
**File:** `engine/guide.md` (§4.2 World Complete + §4.5 Final Victory)
**What changed:** Ambas as celebrações agora referenciam `resolved_items` (pack items + valid sub-items) para determinar completude. O guard de World Complete verifica `pending_count_in_resolved_items_for_phase > 0` em vez de apenas pack items. Final Victory verifica `resolved_items` across all phases.
**Why:** Sub-itens válidos são trabalho real reconhecido pelo xp-system (entram em XP, counters, streak, achievements). Celebrar World Complete enquanto sub-itens estão pendentes contradizia o contrato de `resolved_items` do §2.0.

### Fix for Issue 7.3

**Severity:** LOW
**File:** `SKILL.md` (linha 5, frontmatter)
**What changed:** `argument-hint` atualizado de `"check <id> | skip <id> | scan | status"` para `"check <id> | skip <id> | unused <id> | sub <parent_id> <label> | scan | status"`.
**Why:** `unused` e `sub` já estavam documentados no Command Routing (linhas 112-113) mas não apareciam no hint, criando drift entre a interface resumida e o roteamento real.
