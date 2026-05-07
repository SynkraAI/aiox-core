# Story 123.6: Validate tolera artefatos mutáveis do install

## Status

- [x] Rascunho
- [x] Em implementação
- [x] Concluída

## Contexto

O smoke test do pacote publicado `@aiox-squads/core@5.1.3` confirmou que um install limpo sobe o CLI corretamente, mas `aiox validate --json` reporta `corruptedFiles: 2` logo após o próprio `aiox install --force --quiet`.

Issue GitHub: SynkraAI/aiox-core#663.

## Objetivo

Fazer o validador distinguir arquivos de framework imutáveis de artefatos mutáveis que o instalador gera ou mescla durante a instalação, sem reduzir as validações de path, existência e segurança.

## Acceptance Criteria

- [x] AC1. `aiox validate` não marca `.aiox-core/core-config.yaml` como corrompido quando o próprio instalador gera ou mescla o arquivo.
- [x] AC2. `aiox validate` não marca `.aiox-core/data/entity-registry.yaml` como corrompido quando o bootstrap da registry popula o arquivo.
- [x] AC3. Arquivos mutáveis continuam validados quanto a existência, contenção de path, symlink e tipo regular.
- [x] AC4. Hash/tamanho continuam rígidos para arquivos não mutáveis do framework.
- [x] AC5. Smoke test publicado ou local equivalente termina com `corruptedFiles: 0`.

## Tasks

- [x] Adicionar classificação explícita de artefatos mutáveis no `PostInstallValidator`.
- [x] Ignorar comparação rígida de hash/tamanho apenas para os paths mutáveis conhecidos.
- [x] Cobrir regressão com teste unitário de install manifest pós-mutação.
- [x] Rodar gates locais focados e completos antes de abrir PR.

## Execution

- `npm test -- tests/installer/post-install-validator.test.js --runInBand` ✓
- `node -c packages/installer/src/installer/post-install-validator.js` ✓
- `npm run generate:manifest && npm run validate:manifest` ✓
- Smoke de pacote local `@aiox-squads/core@5.1.4`:
  - `npx --yes aiox --version` → `5.1.4`
  - `npx --yes aiox validate --json` → `status: success`, `validFiles: 1103`, `corruptedFiles: 0`, `issueCount: 0`

## File List

- [docs/stories/epic-123/STORY-123.6-validate-mutable-install-artifacts.md](./STORY-123.6-validate-mutable-install-artifacts.md)
- [.aiox-core/install-manifest.yaml](../../../.aiox-core/install-manifest.yaml)
- [package.json](../../../package.json)
- [package-lock.json](../../../package-lock.json)
- [packages/installer/src/installer/post-install-validator.js](../../../packages/installer/src/installer/post-install-validator.js)
- [tests/installer/post-install-validator.test.js](../../../tests/installer/post-install-validator.test.js)
