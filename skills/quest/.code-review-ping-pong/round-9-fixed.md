---
protocol: code-review-ping-pong
type: fix
round: 9
date: "2026-03-31"
fixer: "Claude Opus 4.6"
review_file: round-9.md
commit_sha_before: "baf7b940c1f25158e776c79ab087dec663c860f3"
commit_sha_after: "f3cbf5a89a8f76cef05a370c0aa2e11631170f39"
branch: chore/devops-10-improvements
issues_fixed: 2
issues_skipped: 0
issues_total: 2
git_diff_stat: "5 files changed, 5 insertions(+), 1 deletion(-)"
quality_checks:
  lint: skipped
  typecheck: skipped
  tests: skipped
fixes:
  - id: "9.1"
    status: FIXED
    file: "engine/ceremony.md"
    description: "Regra de DONE agora exige que TODOS os required items tenham scan_rule definido E todos avaliem true. Se qualquer required não tiver scan_rule, a fase não pode ser DONE."
    deviation: "none"
  - id: "9.2"
    status: FIXED
    file: "engine/scanner.md"
    description: "Adicionado pack.keywords ao schema §3.2 e keywords aos 3 packs existentes (app-development, squad-upgrade, design-system-forge)."
    deviation: "none"
preserved:
  - "engine/guide.md — sem alterações necessárias, scan_rule ali é para avaliação item-a-item, não para status de fase"
  - "engine/checklist.md — scan_rule usado para detecção de itens individuais, lógica diferente do DONE de fase"
  - "engine/xp-system.md — referência a scan_rule é para contagem de auto-detected, não para status de fase"
---

# Code Ping-Pong — Round 9 Fix Report

## Summary

2 issues MEDIUM corrigidas. Ambas envolviam lacunas entre o contrato documentado e o comportamento real do engine.

---

## Fixes Applied

### Fix for Issue 9.1

**World Map pode marcar fase como DONE ignorando itens obrigatórios sem scan_rule**

**Problema:** A regra em `ceremony.md:246` dizia que uma fase é DONE se todos os required items **com** `scan_rule` avaliam true. Isso significa que itens obrigatórios sem `scan_rule` eram ignorados — a fase podia aparecer como concluída sem evidência de que todo o trabalho existia.

**Correção:** Alterada a regra para exigir cobertura completa: TODOS os required items da fase DEVEM ter `scan_rule` definido, E todos devem avaliar true. Se qualquer required não tiver `scan_rule`, a fase não pode ser marcada como DONE (permanece CURRENT ou FUTURE).

**Anti-whack-a-mole:** Busquei o padrão `scan_rule.*DONE` e `DONE.*scan_rule` em todos os arquivos do escopo. A lógica de fase-DONE só existe em `ceremony.md:246`. Os outros usos de `scan_rule` em `checklist.md`, `guide.md` e `xp-system.md` são para detecção individual de itens (diferente semântico), portanto não afetados.

**File:** `engine/ceremony.md:246`

---

### Fix for Issue 9.2

**Fluxo de args.text depende de pack.keywords mas o contrato e os packs não expõem esse campo**

**Problema:** O scanner em §6 (line 351-354) descrevia seleção por texto livre via `pack.keywords`, mas o schema validado em §3.2 não documentava esse campo, e nenhum pack o definia. O caminho de text-match ficava órfão.

**Correção em 2 partes:**

1. **Schema (scanner.md §3.2):** Adicionado `keywords: [string]` como campo OPTIONAL no bloco `pack:`, com comentário referenciando §6.

2. **Packs existentes:** Adicionado `keywords` aos 3 packs:
   - `app-development.yaml`: `["app", "application", "build", "deploy", "desenvolvimento", "software", "projeto"]`
   - `squad-upgrade.yaml`: `["squad", "upgrade", "agente", "agentes", "orquestração"]`
   - `design-system-forge.yaml`: `["design", "design system", "tokens", "componentes", "ui", "visual"]`

**Anti-whack-a-mole:** Busquei `pack.keywords` em todos os arquivos. O campo só é referenciado em `scanner.md:354` (uso) e agora em `scanner.md:64` (schema). Nenhum outro módulo consome keywords.

**Files:** `engine/scanner.md:64`, `packs/app-development.yaml`, `packs/squad-upgrade.yaml`, `packs/design-system-forge.yaml`

---

## Quality Checks

| Check | Result | Notes |
|-------|--------|-------|
| lint | skipped | Projeto é documentação Markdown, sem linter configurado |
| typecheck | skipped | Sem TypeScript no escopo |
| tests | skipped | Sem test suite para engine docs |

---

## Regression Check

- Round 8 fixes (NOT operator em scanner, edge cases de final victory em guide) permanecem intactos
- Nenhum arquivo previamente corrigido foi modificado neste round (ceremony.md não tinha fix anterior)
