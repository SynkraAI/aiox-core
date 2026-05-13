# STORY-123.7: Corrigir governança e distribuição de subagents nativos Claude

Status: Done

Issue: #604

## Contexto

O issue #604 apontou lacunas nos subagents nativos em `.claude/agents/`: hook de autoridade não registrado em runtime, frontmatter fora do formato suportado pelo Claude Code, uso inválido da ferramenta `Task` em subagents e ausência de distribuição dos subagents pelo installer.

## Acceptance Criteria

- [x] AC1. `.claude/settings.json` registra um hook `PreToolUse` para `Bash` capaz de bloquear operações remotas exclusivas do `@devops`.
- [x] AC2. Todos os subagents com `permissionMode: bypassPermissions` e acesso a `Bash`, exceto o próprio `aiox-devops`, carregam o hook de autoridade.
- [x] AC3. Os 29 subagents nativos têm frontmatter válido com `name`, `description` e `color`; nenhum declara `Task` em `tools`.
- [x] AC4. O installer copia `.claude/agents/` e registra o hook de autoridade em `.claude/settings.local.json`.
- [x] AC5. Há testes automatizados cobrindo schema, hook, registro em settings e distribuição pelo installer.

## Tasks

- [x] Criar hook cross-platform `enforce-git-push-authority.cjs`.
- [x] Atualizar `.claude/settings.json` e documentação de hooks.
- [x] Corrigir frontmatter dos subagents nativos.
- [x] Atualizar metadata/gerador do installer para copiar `.claude/agents/`.
- [x] Adicionar testes de governança e installer.
- [x] Rodar gates locais.

## Dev Notes

- Fonte oficial consultada: Claude Code Docs, página “Criar subagentes personalizados”.
- O campo `color` é suportado e aceita `red`, `blue`, `green`, `yellow`, `purple`, `orange`, `pink` ou `cyan`.
- Subagents não podem gerar outros subagents; por isso `Task` foi removido de `tools` nos arquivos em `.claude/agents/`.
- O `aiox-devops` fica sem o hook em frontmatter porque é o agente autorizado para operações remotas; o hook de projeto permite o mesmo fluxo quando `AIOX_ACTIVE_AGENT=devops`.
- Validações locais: `npm test -- packages/installer/tests/unit/artifact-copy-pipeline/artifact-copy-pipeline.test.js tests/claude/subagent-governance.test.js tests/unit/wizard/ide-config-generator.test.js --runInBand`, `npm run test:ci`, `npm run validate:manifest`, `npm run lint -- --quiet`, `npm run typecheck`, `npm run validate:publish`, `git diff --check`, smoke local do tarball/installer.

## File List

- [docs/stories/epic-123/STORY-123.7-subagent-governance-distribution.md](./STORY-123.7-subagent-governance-distribution.md)
- [.claude/agents/](../../../.claude/agents/)
- [.claude/hooks/enforce-git-push-authority.cjs](../../../.claude/hooks/enforce-git-push-authority.cjs)
- [.claude/hooks/enforce-git-push-authority.sh](../../../.claude/hooks/enforce-git-push-authority.sh)
- [.claude/hooks/README.md](../../../.claude/hooks/README.md)
- [.claude/settings.json](../../../.claude/settings.json)
- [.aiox-core/install-manifest.yaml](../../../.aiox-core/install-manifest.yaml)
- [package.json](../../../package.json)
- [package-lock.json](../../../package-lock.json)
- [packages/installer/src/config/ide-configs.js](../../../packages/installer/src/config/ide-configs.js)
- [packages/installer/src/wizard/ide-config-generator.js](../../../packages/installer/src/wizard/ide-config-generator.js)
- [packages/installer/tests/unit/artifact-copy-pipeline/artifact-copy-pipeline.test.js](../../../packages/installer/tests/unit/artifact-copy-pipeline/artifact-copy-pipeline.test.js)
- [tests/claude/subagent-governance.test.js](../../../tests/claude/subagent-governance.test.js)
- [tests/unit/wizard/ide-config-generator.test.js](../../../tests/unit/wizard/ide-config-generator.test.js)
