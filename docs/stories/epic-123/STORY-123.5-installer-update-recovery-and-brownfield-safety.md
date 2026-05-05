# Story 123.5: Recovery do update e segurança brownfield no installer

## Status

- [x] Rascunho
- [x] Em revisão
- [x] Concluída

## Contexto

O fluxo público de atualização do AIOX está quebrado em dois caminhos críticos:

- `aiox update` instala o pacote novo via npm, mas não sincroniza o `.aiox-core` do projecto antes da validação, causando rollback com manifest antigo.
- `aiox install --force` continua perigoso em brownfield: `--dry-run` é ignorado e ficheiros mutáveis de projecto, como `core-config.yaml`, `MEMORY.md` e regras custom de `.claude/settings.json`, podem ser sobrescritos.

Isto bloqueia upgrades públicos e viola as garantias de segurança/configuração do framework em projectos existentes.

## Objetivo

Restabelecer um caminho seguro e reproduzível para instalar e atualizar o framework em projectos brownfield, sem rollback falso-positivo nem overwrite destrutivo de configuração local.

## Acceptance Criteria

- [x] AC1. `aiox update` sincroniza o `.aiox-core` do pacote recém-instalado para o projecto antes da validação e deixa de falhar por carregar manifest antigo.
- [x] AC2. O updater usa metadata suficiente para distinguir ficheiros de framework alterados pelo release de ficheiros customizados pelo utilizador, preservando customizações locais durante o sync.
- [x] AC3. `aiox install --dry-run` não escreve ficheiros nem executa bootstrap/sync, mesmo com `--quiet` e `--force`.
- [x] AC4. O install brownfield deixa de sobrescrever cegamente `.claude/settings.json`, `.aiox-core/core-config.yaml`, `.env.example` e `development/agents/*/MEMORY.md`.
- [x] AC5. `aiox validate` expõe um modo explícito para saltar verificação de assinatura em cenários de recovery/documented break-glass.
- [x] AC6. Há testes automatizados cobrindo os regressions de update, dry-run e preservação brownfield.

## Tasks

- [x] Corrigir o sync pós-`npm install` no updater e reaproveitar manifest/source package na validação
- [x] Endurecer persistência de manifest/version metadata para brownfield upgrades
- [x] Implementar guard global de `dryRun` no wizard modular
- [x] Preservar e/ou fazer merge dos ficheiros mutáveis de brownfield reportados no issue
- [x] Adicionar testes de regressão para updater, wizard/install e settings merge

## Execution

- Validar localmente com `npm run lint`, `npm run typecheck`, `npm test`
- Smoke test manual em projeto brownfield publicado `5.0.4 -> 5.0.7`, incluindo preservação de `MEMORY.md` customizado
- Regressions adicionais corrigidos durante smoke test final:
  - preservação de `permissions.allow/deny` em `.claude/settings.json` mesmo quando o gerador não produz regras novas
  - seleção do manifest instalado mais completo a partir do package anterior para evitar overwrite falso de ficheiros mutáveis
- `npm run lint` ✓
- `npm run typecheck` ✓
- `npm test` ✓

## File List

- [docs/stories/epic-123/STORY-123.5-installer-update-recovery-and-brownfield-safety.md](./STORY-123.5-installer-update-recovery-and-brownfield-safety.md)
- [.aiox-core/cli/commands/validate/index.js](/Users/rafaelcosta/Projects/AIOX/aiox-core/.aiox-core/cli/commands/validate/index.js)
- [.aiox-core/infrastructure/scripts/generate-settings-json.js](/Users/rafaelcosta/Projects/AIOX/aiox-core/.aiox-core/infrastructure/scripts/generate-settings-json.js)
- [packages/installer/src/config/configure-environment.js](/Users/rafaelcosta/Projects/AIOX/aiox-core/packages/installer/src/config/configure-environment.js)
- [packages/installer/src/installer/aiox-core-installer.js](/Users/rafaelcosta/Projects/AIOX/aiox-core/packages/installer/src/installer/aiox-core-installer.js)
- [packages/installer/src/installer/brownfield-upgrader.js](/Users/rafaelcosta/Projects/AIOX/aiox-core/packages/installer/src/installer/brownfield-upgrader.js)
- [packages/installer/src/updater/index.js](/Users/rafaelcosta/Projects/AIOX/aiox-core/packages/installer/src/updater/index.js)
- [packages/installer/src/wizard/ide-config-generator.js](/Users/rafaelcosta/Projects/AIOX/aiox-core/packages/installer/src/wizard/ide-config-generator.js)
- [packages/installer/src/wizard/index.js](/Users/rafaelcosta/Projects/AIOX/aiox-core/packages/installer/src/wizard/index.js)
- [tests/installer/aiox-core-installer.test.js](/Users/rafaelcosta/Projects/AIOX/aiox-core/tests/installer/aiox-core-installer.test.js)
- [tests/installer/brownfield-upgrader.test.js](/Users/rafaelcosta/Projects/AIOX/aiox-core/tests/installer/brownfield-upgrader.test.js)
- [tests/installer/configure-environment-brownfield.test.js](/Users/rafaelcosta/Projects/AIOX/aiox-core/tests/installer/configure-environment-brownfield.test.js)
- [tests/installer/generate-settings-json.test.js](/Users/rafaelcosta/Projects/AIOX/aiox-core/tests/installer/generate-settings-json.test.js)
- [packages/installer/tests/unit/generate-settings-json/generate-settings-json.test.js](/Users/rafaelcosta/Projects/AIOX/aiox-core/packages/installer/tests/unit/generate-settings-json/generate-settings-json.test.js)
- [tests/updater/aiox-updater.test.js](/Users/rafaelcosta/Projects/AIOX/aiox-core/tests/updater/aiox-updater.test.js)
- [tests/wizard/integration.test.js](/Users/rafaelcosta/Projects/AIOX/aiox-core/tests/wizard/integration.test.js)
