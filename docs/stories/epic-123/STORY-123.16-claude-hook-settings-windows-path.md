# STORY-123.16: Tornar comandos de hooks Claude shell-neutral

## Status

Done

## Story

Como mantenedor do AIOX Core em Windows e Unix, quero que o `.claude/settings.json` versionado registre hooks com caminhos relativos neutros de shell, para que o Claude Code não dependa de expansão POSIX como `${CLAUDE_PROJECT_DIR:-.}` ao executar os hooks do próprio repositório.

## Acceptance Criteria

- [x] AC1. Os comandos versionados de `UserPromptSubmit`, `PreCompact` e `PreToolUse` não usam `CLAUDE_PROJECT_DIR` nem expansão `${...}`.
- [x] AC2. Os hooks continuam apontando para os wrappers commitados em `.claude/hooks/`.
- [x] AC3. A governança de `PreToolUse` continua registrando o matcher `Bash`.
- [x] AC4. Há teste automatizado impedindo regressão para sintaxe dependente de shell POSIX.

## Tasks

- [x] Atualizar `.claude/settings.json`.
- [x] Adicionar teste de comando shell-neutral em `tests/claude/subagent-governance.test.js`.
- [x] Rodar validação focada de governança Claude.

## Dev Notes

- Este é o resíduo limpo do PR #551: o installer já usa caminho absoluto em Windows porque `$CLAUDE_PROJECT_DIR` é problemático nessa plataforma, mas o settings commitado ainda usava `${CLAUDE_PROJECT_DIR:-.}`.
- Mantivemos os wrappers atuais (`synapse-wrapper.cjs` e `precompact-wrapper.cjs`) em vez de voltar para os hooks diretos do PR antigo.

## Validation

- `npm test -- tests/claude/subagent-governance.test.js --runInBand --forceExit` -> PASS.
- `git diff --check` -> PASS.
- `npm run validate:semantic-lint` -> PASS.
- `npm run validate:manifest` -> PASS.
- `npm run validate:publish` -> PASS.
- `npm run lint -- --quiet` -> PASS.
- `npm run typecheck` -> PASS.
- `npm run test:ci` -> PASS, 315 suites / 7.847 tests, 149 skipped.

## File List

- `.claude/settings.json`
- `tests/claude/subagent-governance.test.js`
- `docs/stories/epic-123/STORY-123.16-claude-hook-settings-windows-path.md`
