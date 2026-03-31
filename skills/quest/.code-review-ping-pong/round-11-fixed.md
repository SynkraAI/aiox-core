---
protocol: code-review-ping-pong
type: fix
round: 11
date: "2026-03-31"
fixer: "Claude Opus 4.6"
review_file: round-11.md
commit_sha_before: "8eed7d45fe626cacf0a1bc04e75b2875c4fa62e1"
commit_sha_after: "987a56a2c"
branch: chore/devops-10-improvements
issues_fixed: 3
issues_skipped: 0
issues_total: 3
git_diff_stat: "2 files changed, 6 insertions(+), 2 deletions(-)"
quality_checks:
  lint: skipped
  typecheck: skipped
  tests: skipped
fixes:
  - id: "11.1"
    status: FIXED
    file: "engine/scanner.md"
    description: "Pack override §5 agora roteia para §6.5 Post-selection Gates em vez de retornar imediatamente. Garante que prerequisites e expansion-pack constraints sejam sempre verificados."
    deviation: "none"
  - id: "11.2"
    status: FIXED
    file: "engine/checklist.md"
    description: "Adicionados hero_name (REQUIRED) e hero_title (empty string se opt-out) ao meta block da §2 Create Quest-log."
    deviation: "none"
  - id: "11.3"
    status: FIXED
    file: "engine/checklist.md"
    description: "Substituído hardcoded 'app-development' por pack.id do pack carregado na tabela de migração §7."
    deviation: "none"
preserved:
  - "engine/ceremony.md — nenhuma issue neste arquivo"
  - "engine/guide.md — nenhuma issue neste arquivo"
  - "engine/xp-system.md — nenhuma issue neste arquivo"
  - "SKILL.md — nenhuma issue neste arquivo"
---

# Code Ping-Pong — Round 11 Fix Report

## Summary

3 issues corrigidas (2 HIGH + 1 MEDIUM), 0 skipped. Todas as correções são em arquivos de engine (markdown spec), sem código executável — quality checks (lint/typecheck/tests) não se aplicam.

## Anti-Whack-a-Mole Scan

Antes de cada fix, grep por padrões similares em todo o escopo:

- **"return immediately" / "skip detection"**: único ponto em `scanner.md:301`. Nenhuma duplicata.
- **hero_name/hero_title ausentes em meta blocks**: a §2 era o único ponto de criação do meta block. `ceremony.md` coleta corretamente, `guide.md` consome corretamente — o gap era apenas na §2 do checklist.
- **"app-development" hardcoded**: `checklist.md:355` era o único uso indevido. Outros usos em `scanner.md` (exemplos não-normativos), `ceremony.md` (exemplos de títulos), e `packs/*.yaml` (definição legítima) são corretos.

---

## Fixes Applied

### Fix for Issue 11.1

**Severity:** HIGH
**File:** `engine/scanner.md` — Section 5 (Pack Override)

**Problem:** O step 3 do override instruía "return immediately as selected pack (skip detection)", o que bypassava os post-selection gates da §6.5 (prerequisites + expansion pack). Isso contradiz a regra da §6.5 que diz "via auto-detection, user choice, **or override**".

**Fix:** Alterado step 3 de "return immediately" para "proceed to §6.5 Post-selection Gates (skip detection, but NOT the gates)". Adicionada nota explícita clarificando que o override pula auto-detection (§4) e decision logic (§6), mas DEVE passar pelos gates antes de retornar.

**Before:**
```
3. If valid → **return immediately** as selected pack (skip detection)
```

**After:**
```
3. If valid → **proceed to §6.5 Post-selection Gates** (skip detection, but NOT the gates)

> **Important:** The override skips auto-detection (Section 4) and decision logic (Section 6),
> but the pack MUST still pass the post-selection gates (§6.5) before being returned.
```

---

### Fix for Issue 11.2

**Severity:** HIGH
**File:** `engine/checklist.md` — Section 2 (Create Quest-log)

**Problem:** O meta block criado pela §2 não incluía `hero_name` nem `hero_title`, embora ambos fossem campos obrigatórios no schema da §1 e fossem coletados pela `ceremony.md`. Isso gerava um quest-log inválido que quebrava o contrato com `guide.md` (que usa `hero_name` em todas as interações).

**Fix:** Adicionados dois campos ao meta block:
- `hero_name`: valor coletado pela ceremony (REQUIRED — não criar quest-log sem ele)
- `hero_title`: valor coletado pela ceremony (empty string `""` se o usuário optou por não usar)

**Before:**
```
- pack_version: value of pack.version from the pack YAML
- created: current datetime (ISO 8601 UTC)
```

**After:**
```
- pack_version: value of pack.version from the pack YAML
- hero_name: value collected by ceremony (REQUIRED — do not create quest-log without it)
- hero_title: value collected by ceremony (empty string "" if user opted out)
- created: current datetime (ISO 8601 UTC)
```

---

### Fix for Issue 11.3

**Severity:** MEDIUM
**File:** `engine/checklist.md` — Section 7 (Migration)

**Problem:** A tabela de migração forçava `meta.pack = "app-development"` para todo projeto legado, ignorando o pack selecionado/detectado pelo scanner. Projetos migrando para outro pack teriam identidade errada.

**Fix:** Substituído o valor hardcoded pelo pack.id do pack carregado na sessão.

**Before:**
```
| — | `meta.pack` = `"app-development"` |
```

**After:**
```
| — | `meta.pack` = pack.id from the currently loaded pack |
```
