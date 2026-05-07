# Story 123.1: Automação de sync do Pro entre `aiox-pro` e `aiox-core`

## Status

- [x] Rascunho
- [x] Em revisão
- [ ] Concluída

## Contexto

O fluxo atual permite que novos squads entrem no repositório `aiox-pro` sem serem propagados com previsibilidade para o bundle `pro/` consumido pelo `aiox-core`. O resultado é drift silencioso: o conteúdo existe no GitHub, mas não necessariamente chega ao instalador guiado do Pro.

## Objetivo

Estabelecer um fluxo de sync por fonte única, com `aiox-pro` como origem dos squads Pro e `aiox-core/pro` como espelho controlado por PR automática.

## Acceptance Criteria

- [x] AC1. O `aiox-pro` valida automaticamente que todo squad top-level publicado está presente em `package.json` e em `squads/README.md`.
- [x] AC2. Mudanças compatíveis em `aiox-pro` abrem ou atualizam automaticamente uma PR no `aiox-core` avançando o submódulo `pro`.
- [x] AC3. O `aiox-core` possui um workflow manual/agendado de fallback para reconciliar drift do submódulo `pro`.
- [x] AC4. O plano operacional documenta segredos necessários, branch de sync, e lista dos arquivos alterados.

## Tasks

- [x] Criar validação de publish surface no `aiox-pro`
- [x] Atualizar README/package surface do `aiox-pro`
- [x] Adicionar workflow de sync `aiox-pro` -> `aiox-core`
- [x] Adicionar fallback workflow no `aiox-core`
- [x] Executar validações locais

## Notas de Implementação

- Fonte de verdade: `SynkraAI/aiox-pro`
- Espelho controlado: submódulo `pro` em `SynkraAI/aiox-core`
- Branch de sync: `bot/sync-pro-submodule`
- Segredo esperado no `aiox-pro`: `AIOX_CORE_SYNC_TOKEN`
- Segredo opcional no `aiox-core`: `PRO_SUBMODULE_TOKEN` (necessário se o remoto `pro` for privado)

## File List

- [docs/stories/epic-123/STORY-123.1-pro-sync-automation.md](./STORY-123.1-pro-sync-automation.md)
- [.github/workflows/sync-pro-submodule.yml](../../../.github/workflows/sync-pro-submodule.yml)
- `package.json` (`aiox-pro`)
- `squads/README.md` (`aiox-pro`)
- `scripts/validate-publish-surface.js` (`aiox-pro`)
- `.github/workflows/ci.yml` (`aiox-pro`)
- `.github/workflows/publish.yml` (`aiox-pro`)
- `.github/workflows/sync-aiox-core.yml` (`aiox-pro`)
