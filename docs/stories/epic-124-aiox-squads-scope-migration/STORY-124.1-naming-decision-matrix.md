# Story 124.1: Package naming decision matrix

| Field | Value |
|-------|-------|
| Story ID | 124.1 |
| Epic | [124 — aiox-squads scope migration](./EPIC-124-AIOX-SQUADS-SCOPE-MIGRATION.md) |
| Status | Done |
| Executor | @pm |
| Quality Gate | @po |
| Points | 2 |
| Priority | P0 (blocker da Phase 2) |
| Story Order | 1 |

## Status

- [x] Rascunho
- [x] Em revisão (APPROVED by @po — 2026-05-06, score 9.5/10)
- [x] Concluída

## Story Narrative

**As a** project sponsor,
**I want** os nomes finais de cada package no novo scope `@aiox-squads/*` decididos e documentados,
**so that** as stories de publish (124.3, 124.4, 124.5) executem sem ambiguidade ou rework.

## Contexto

Epic 124 estabelece migração para `@aiox-squads/*` mas deixa nomes de package finais em aberto pra alguns casos. Decisões já fechadas (Epic seção 10): `@aiox-squads/core` (5.1.0), bin name preserva `aiox-pro`. Decisões pendentes: nome final dos 3 packages do monorepo (`installer`, `aiox-pro-cli`, `aiox-install`) — opções como `@aiox-squads/installer` vs `@aiox-squads/aiox-installer`, e similar pros outros 2.

## Acceptance Criteria

- [x] AC1. Documento `naming-decision-matrix.md` criado em `docs/stories/epic-124-aiox-squads-scope-migration/` com tabela de mapeamento (origem → destino) para todos os 4 packages-alvo (core + 3 monorepo)
- [x] AC2. Cada decisão tem rationale (1-2 linhas) explicando trade-off (brevidade vs clareza)
- [x] AC3. Peer-dependency map atualizado: quais packages depend de quais após o rename
- [x] AC4. Bin commands listados explicitamente (quais permanecem, quais mudam) — confirma `aiox-core` e `aiox-pro` preservados
- [x] AC5. Validação com sponsor (Rafael) registrada via comentário inline ou aprovação no PR

## Tasks

- [x] Listar nomes atuais de cada package via `jq -r .name packages/*/package.json`
- [x] Para cada, propor 2-3 nomes candidatos sob `@aiox-squads/*`
- [x] Construir tabela com colunas: origem | candidato 1 | candidato 2 | recomendação | rationale
- [x] Mapear peer-dependencies entre packages do monorepo (quem importa de quem)
- [x] Documentar lista de bin commands com decisão de manter/renomear
- [x] Submit pra sponsor approval (inline comment ou async)

## Execution

- Output: `docs/stories/epic-124-aiox-squads-scope-migration/naming-decision-matrix.md`
- Sem código executado — story de design/decisão

## File List

- [docs/stories/epic-124-aiox-squads-scope-migration/STORY-124.1-naming-decision-matrix.md](./STORY-124.1-naming-decision-matrix.md)
- [docs/stories/epic-124-aiox-squads-scope-migration/naming-decision-matrix.md](./naming-decision-matrix.md) — NEW

## Dependencies

- **Blocks:** 124.3, 124.4, 124.5 (publish stories precisam dos nomes finais)
- **Blocked by:** none

## Definition of Done

- [x] Tabela completa para 4 packages-alvo
- [x] Sponsor aprovação registrada
- [x] Story aprovada por @po via `*validate-story-draft`
