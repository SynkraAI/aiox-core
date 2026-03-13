# Story REFACTOR-1: Consolidar Phone Resolver e WhatsApp Utils

**Status:** Ready for Review

**Executor:** @dev
**Quality Gate:** @qa
**Quality Gate Tools:** `npm test`, `npm run lint`

**Epic:** Code Deduplication (Cross-Squad Audit 2026-03-13)

---

## Story

**As a** desenvolvedor do Ensinio Prospector,
**I want** extrair a lógica duplicada de phone resolution e geração de links WhatsApp para módulos centralizados,
**so that** correções e melhorias se propaguem automaticamente para todos os scripts, sem manter 8 cópias do mesmo código.

---

## Context

Auditoria de 2026-03-13 identificou:
- **Phone resolution** (fuzzy matching NFD + exact + first-name): duplicado em 3 scripts (~90 linhas)
- **WhatsApp link generation**: duplicado em 5 scripts com 3 formatos de URL diferentes (~50 linhas)
- **Phone normalization**: `packages/ensinio-whatsapp-parser/` existe mas NÃO é usado pelos scripts

Arquivos afetados:
- `squads/ensinio-whatsapp-prospector/scripts/generate-sheets-csv.js` (linhas 46-90)
- `squads/ensinio-whatsapp-prospector/scripts/generate-sheets-paste.js` (linhas 31-65)
- `squads/ensinio-whatsapp-prospector/scripts/populate-sheet-v5.js` (linhas 77-137)
- `squads/ensinio-whatsapp-prospector/scripts/sync-ghl-v5.js` (linha 206)
- `scripts/send-whatsapp-manual.js` (linhas 40-43)

---

## Acceptance Criteria

1. **Phone Resolver criado**
   - Arquivo: `squads/ensinio-whatsapp-prospector/lib/phone-resolver.js`
   - Exporta: `resolvePhoneFromBook(name, phoneBook, opts)`
   - Algoritmo: exact match → NFD normalize → multi-part fuzzy → first-name fallback
   - Integra com `normalizePhoneNumber()` de `packages/ensinio-whatsapp-parser/`
   - Retorna `{ phone, method, notes }` (method indica qual match foi usado)

2. **WhatsApp Utils criado**
   - Arquivo: `squads/ensinio-whatsapp-prospector/lib/whatsapp-utils.js`
   - Exporta: `generateWhatsAppLink(phone, message, opts)`
   - `opts.format`: `'wa.me'` (default) | `'web'` | `'api'`
   - Limpa phone (remove tudo exceto dígitos e +)
   - Retorna string vazia se phone inválido

3. **Scripts refatorados para importar de lib/**
   - `generate-sheets-csv.js` → importa `resolvePhoneFromBook` + `generateWhatsAppLink`
   - `generate-sheets-paste.js` → importa `resolvePhoneFromBook` + `generateWhatsAppLink`
   - `populate-sheet-v5.js` → importa `resolvePhoneFromBook` + `generateWhatsAppLink`
   - `sync-ghl-v5.js` → importa `normalizePhoneNumber` de `@ensinio/whatsapp-parser`
   - `scripts/send-whatsapp-manual.js` → importa `generateWhatsAppLink`

4. **Output idêntico ao original**
   - Para cada script refatorado, output deve ser byte-identical ao original
   - Testar com dados reais do grupo `ensinio-mentoria-premium`

5. **Testes unitários para os novos módulos**
   - `lib/phone-resolver.test.js`: exact match, fuzzy match, first-name fallback, sem match, acentos
   - `lib/whatsapp-utils.test.js`: 3 formatos de URL, phone inválido, mensagem com caracteres especiais

---

## Tasks / Subtasks

- [x] Criar `squads/ensinio-whatsapp-prospector/lib/phone-resolver.js` (AC: 1)
  - [x] Extrair algoritmo de `generate-sheets-csv.js` como base
  - [x] Adicionar integração com `normalizePhoneNumber()` do package
  - [x] Adicionar campo `method` no retorno
- [x] Criar `squads/ensinio-whatsapp-prospector/lib/whatsapp-utils.js` (AC: 2)
  - [x] Suportar 3 formatos de URL
  - [x] Validação de phone antes de gerar link
- [x] Refatorar 5 scripts para importar de lib/ (AC: 3)
  - [x] `generate-sheets-csv.js`
  - [x] `generate-sheets-paste.js`
  - [x] `populate-sheet-v5.js`
  - [x] `sync-ghl-v5.js`
  - [x] `scripts/send-whatsapp-manual.js`
- [ ] Validar output idêntico com dados reais (AC: 4)
- [x] Criar testes unitários (AC: 5)
  - [x] phone-resolver.test.js (21 tests, all pass)
  - [x] whatsapp-utils.test.js (33 tests, all pass)

---

## Dev Notes

### Source Tree
```
squads/ensinio-whatsapp-prospector/
├── lib/
│   ├── parse-chat-export-impl.js  ← JÁ EXISTE (bom exemplo)
│   ├── phone-resolver.js          ← CRIAR
│   └── whatsapp-utils.js          ← CRIAR
├── scripts/
│   ├── generate-sheets-csv.js     ← REFATORAR
│   ├── generate-sheets-paste.js   ← REFATORAR
│   ├── populate-sheet-v5.js       ← REFATORAR
│   └── sync-ghl-v5.js             ← REFATORAR (só phone normalize)
packages/ensinio-whatsapp-parser/
└── dist/phone-normalizer.js       ← JÁ EXISTE, USAR
scripts/
└── send-whatsapp-manual.js        ← REFATORAR
```

### Padrão de referência
Seguir o mesmo padrão de `lib/parse-chat-export-impl.js` (wrapper com error handling + integração com package).

### Formatos de URL WhatsApp
- `wa.me`: `https://wa.me/{phone}?text={encoded}` (universal, recomendado)
- `web`: `https://web.whatsapp.com/send?phone={phone}&text={encoded}` (desktop)
- `api`: `https://api.whatsapp.com/send?phone={phone}&text={encoded}` (API oficial)

### Testing

- Localização dos testes: `squads/ensinio-whatsapp-prospector/tests/`
- Framework: Jest
- Padrão: mesmo do `packages/ensinio-whatsapp-parser/tests/`

---

## Dev Agent Record

### File List

**Created:**
- `squads/ensinio-whatsapp-prospector/lib/phone-resolver.js` — Phone resolution module with fuzzy matching (exact, fuzzy, first-name)
- `squads/ensinio-whatsapp-prospector/lib/whatsapp-utils.js` — WhatsApp link generation with 3 URL formats (wa.me, web, api)
- `squads/ensinio-whatsapp-prospector/tests/phone-resolver.test.js` — 21 unit tests (100% pass)
- `squads/ensinio-whatsapp-prospector/tests/whatsapp-utils.test.js` — 33 unit tests (100% pass)

**Modified:**
- `squads/ensinio-whatsapp-prospector/scripts/generate-sheets-csv.js` — Import from lib/, removed 45 lines of duplicated logic
- `squads/ensinio-whatsapp-prospector/scripts/generate-sheets-paste.js` — Import from lib/, removed 40 lines of duplicated logic
- `squads/ensinio-whatsapp-prospector/scripts/populate-sheet-v5.js` — Import from lib/, removed 35 lines of duplicated logic (including resolvePhone function)
- `squads/ensinio-whatsapp-prospector/scripts/sync-ghl-v5.js` — Import normalizePhoneNumber from @ensinio/whatsapp-parser
- `scripts/send-whatsapp-manual.js` — Import from lib/, removed generateWhatsAppLink function

### Completion Notes

✅ **AC-1 COMPLETE:** `phone-resolver.js` criado com algoritmo extraído de `generate-sheets-csv.js`. Exporta `resolvePhoneFromBook(name, phoneBook, opts)` com 3 estratégias de matching (exact, fuzzy, first-name). Retorna `{ phone, method, notes }`. Integração opcional com `normalizePhoneNumber()` via `opts.normalize`.

✅ **AC-2 COMPLETE:** `whatsapp-utils.js` criado com suporte para 3 formatos de URL: `wa.me` (default), `web`, `api`. Exporta `generateWhatsAppLink(phone, message, opts)`. Validação de phone antes de gerar link via `isValidPhone()` (mínimo 10 dígitos).

✅ **AC-3 COMPLETE:** 5 scripts refatorados para importar de `lib/`. Total de ~125 linhas de código duplicado removido. Scripts agora usam módulos centralizados.

⏳ **AC-4 PENDING:** Validação de output idêntico depende de dados reais do grupo `ensinio-mentoria-premium`. Não disponível no ambiente de teste.

✅ **AC-5 COMPLETE:** 54 testes unitários criados (21 para phone-resolver, 33 para whatsapp-utils). Todos os testes passam. Cobertura inclui: exact match, fuzzy match, first-name fallback, edge cases, 3 formatos de URL, encoding de caracteres especiais.

### Implementation Summary

**Lines removed:** ~125 linhas de código duplicado
**Lines added:** ~200 linhas em módulos reutilizáveis + 250 linhas de testes
**Test coverage:** 54 tests, 100% pass rate
**Lint status:** ✅ Clean (0 errors, 0 warnings on modified files)

---

## Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2026-03-13 | 1.0 | Story criada a partir de auditoria cross-squad | @sm (River) |
| 2026-03-13 | 1.1 | Implementation complete (AC 1-3, 5) | @dev (Dex) |
