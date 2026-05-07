# STORY-123.10: Corrigir resolução de dependências dos scripts de squads Pro

Status: Done

PR relacionado: #624

## Contexto

O PR #624 propôs corrigir scripts em `squads/` que falhavam com `Cannot find module 'js-yaml'` quando executados a partir da raiz do projeto instalado. A proposta original alterava apenas o installer legado (`bin/aiox-init.js`), mas o fluxo atual usa o wizard v4 e copia os squads Pro por `packages/installer/src/pro/pro-scaffolder.js`.

## Acceptance Criteria

- [x] AC1. Scripts copiados para `squads/` conseguem resolver dependências instaladas em `.aiox-core/node_modules`.
- [x] AC2. O link `node_modules -> .aiox-core/node_modules` só é criado quando o projeto ainda não possui `node_modules`.
- [x] AC3. Projetos com `node_modules` próprio não são sobrescritos.
- [x] AC4. A correção cobre o scaffolder Pro atual e mantém o fallback legado alinhado com o PR #624.
- [x] AC5. Há testes automatizados para criação do link, idempotência e resolução de `js-yaml` a partir de um script de squad.

## Tasks

- [x] Adicionar helper idempotente de link de dependências no installer core.
- [x] Integrar o helper ao scaffolder Pro.
- [x] Alinhar o fallback legado `bin/aiox-init.js`.
- [x] Adicionar regressões em `tests/installer`.
- [x] Rodar gates locais e preparar patch `5.1.6`.

## Dev Notes

- O wizard v4 removeu o antigo fluxo comunitário de instalação direta de squads; a superfície ativa com scripts em `squads/` é o conteúdo Pro scaffoldado.
- O link é não destrutivo: se `node_modules` já existir no projeto, a instalação não altera a árvore de dependências do usuário.

## File List

- [docs/stories/epic-123/STORY-123.10-squad-dependency-resolution.md](./STORY-123.10-squad-dependency-resolution.md)
- [bin/aiox-init.js](../../../bin/aiox-init.js)
- [packages/installer/src/installer/aiox-core-installer.js](../../../packages/installer/src/installer/aiox-core-installer.js)
- [packages/installer/src/pro/pro-scaffolder.js](../../../packages/installer/src/pro/pro-scaffolder.js)
- [tests/installer/aiox-core-installer.test.js](../../../tests/installer/aiox-core-installer.test.js)
- [tests/installer/pro-scaffolder.test.js](../../../tests/installer/pro-scaffolder.test.js)
