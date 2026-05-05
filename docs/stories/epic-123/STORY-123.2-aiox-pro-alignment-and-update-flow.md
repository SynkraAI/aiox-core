# Story 123.2: Alinhamento definitivo de `aiox-pro` e fluxo explícito de atualização

## Status

- [x] Rascunho
- [x] Em revisão
- [ ] Concluída

## Contexto

Após o rename do repositório Pro para `aiox-pro`, ainda existe drift entre:

- URL do submódulo e workflows de sync
- nome do pacote npm (`@aios-fullstack/pro` publicado vs `@aiox-fullstack/pro` desejado)
- comandos de instalação e atualização do Pro
- documentação e referências internas

Sem um caminho explícito de atualização, o reinstall do `aiox-core` pode reaplicar o bundle embutido sem buscar a versão Pro mais recente publicada.

## Objetivo

Padronizar a superfície do Pro em torno de `aiox-pro`, manter compatibilidade transitória com o pacote legado `@aios-fullstack/pro`, e oferecer um comando explícito para atualizar o Pro via npm com re-scaffold dos assets.

## Acceptance Criteria

- [x] AC1. `aiox-core` e `aiox-pro` referenciam o repositório `SynkraAI/aiox-pro` em workflows, metadados e documentação operacional.
- [x] AC2. O carregamento, instalação e verificação do Pro aceitam `@aiox-fullstack/pro` como nome canônico e `@aios-fullstack/pro` como fallback de compatibilidade.
- [x] AC3. Existe um comando explícito de atualização do Pro que instala a versão mais recente disponível no npm e re-scaffolda os assets sem exigir reinstall do `aiox-core`.
- [x] AC4. A story documenta os arquivos alterados e o estado de transição entre o pacote legado e o canônico.

## Tasks

- [x] Integrar a implementação existente de `aiox pro update` no `aiox-core`
- [x] Ajustar workflows e referências de repo para `aiox-pro`
- [x] Padronizar o pacote e a documentação do repositório Pro renomeado
- [x] Validar instalação, update e sync localmente

## Notas de Implementação

- Repositório canônico: `SynkraAI/aiox-pro`
- Pacote canônico desejado: `@aiox-fullstack/pro`
- Pacote legado ainda publicado: `@aios-fullstack/pro`
- Estratégia de migração: canônico + fallback, sem quebrar installs existentes
- Publicação npm: o código já aceita o nome canônico; a publicação de `@aiox-fullstack/pro` depende da permissão correta no org mantenedor do npm.

## File List

- [.aiox-core/cli/commands/pro/index.js](../../../.aiox-core/cli/commands/pro/index.js)
- [.aiox-core/core/pro/pro-updater.js](../../../.aiox-core/core/pro/pro-updater.js)
- [.aiox-core/install-manifest.yaml](../../../.aiox-core/install-manifest.yaml)
- [.github/workflows/pro-integration.yml](../../../.github/workflows/pro-integration.yml)
- [.github/workflows/publish-pro.yml](../../../.github/workflows/publish-pro.yml)
- [.github/workflows/sync-pro-submodule.yml](../../../.github/workflows/sync-pro-submodule.yml)
- [.gitmodules](../../../.gitmodules)
- [README.md](../../../README.md)
- [README.en.md](../../../README.en.md)
- [bin/aiox.js](../../../bin/aiox.js)
- [bin/utils/pro-detector.js](../../../bin/utils/pro-detector.js)
- [docs/guides/pro/install-gate-setup.md](../../../docs/guides/pro/install-gate-setup.md)
- [docs/stories/epic-123/STORY-123.1-pro-sync-automation.md](./STORY-123.1-pro-sync-automation.md)
- [docs/stories/epic-123/STORY-123.2-aiox-pro-alignment-and-update-flow.md](./STORY-123.2-aiox-pro-alignment-and-update-flow.md)
- [packages/aiox-pro-cli/bin/aiox-pro.js](../../../packages/aiox-pro-cli/bin/aiox-pro.js)
- [packages/installer/src/pro/pro-scaffolder.js](../../../packages/installer/src/pro/pro-scaffolder.js)
- [packages/installer/src/wizard/i18n.js](../../../packages/installer/src/wizard/i18n.js)
- [packages/installer/src/wizard/pro-setup.js](../../../packages/installer/src/wizard/pro-setup.js)
- [pro](../../../pro)
- [tests/pro/pro-detector.test.js](../../../tests/pro/pro-detector.test.js)
- [tests/pro/pro-updater.test.js](../../../tests/pro/pro-updater.test.js)

## Evidências Externas

- PR mergeada do repositório Pro renomeado: `SynkraAI/aiox-pro#7`
