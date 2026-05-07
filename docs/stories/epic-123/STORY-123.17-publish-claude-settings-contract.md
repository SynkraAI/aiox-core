# STORY-123.17: Publicar settings Claude no pacote core

## Status

Done

## Story

Como release manager do AIOX Core, quero que o pacote npm publique o `.claude/settings.json` junto com hooks, regras e agentes Claude, para que correções em settings versionado também cheguem ao artefato consumível.

## Acceptance Criteria

- [x] AC1. `package.json.files` inclui `.claude/settings.json`.
- [x] AC2. `scripts/validate-package-completeness.js` exige `.claude/settings.json` no tarball.
- [x] AC3. `npm pack --dry-run` inclui `.claude/settings.json`.
- [x] AC4. O smoke npm publicado consegue validar os comandos shell-neutral dentro do pacote instalado.

## Tasks

- [x] Atualizar contrato de publicação em `package.json`.
- [x] Atualizar validador de completude do pacote.
- [x] Rodar gates de pacote e validações de release.

## Dev Notes

- A correção de STORY-123.16 chegou ao repositório, mas o smoke mostrou que `.claude/settings.json` não fazia parte do tarball npm. Como o pacote já publica `.claude/CLAUDE.md`, `.claude/hooks/`, `.claude/rules/`, `.claude/agents/`, `.claude/commands/` e `.claude/skills/`, publicar o settings fecha a superfície Claude distribuída.

## Validation

- `git diff --check` -> PASS.
- `node scripts/validate-package-completeness.js` -> PASS, 32/32 required package paths.
- `npm pack --dry-run --json` -> PASS, inclui `.claude/settings.json`.
- `npm run validate:publish` -> PASS.
- `npm run validate:semantic-lint` -> PASS.
- `npm run validate:manifest` -> PASS.
- `npm run lint -- --quiet` -> PASS.
- `npm run typecheck` -> PASS.
- `npm run test:ci` -> PASS, 315 suites / 7.847 tests.

## File List

- `package.json`
- `package-lock.json`
- `scripts/validate-package-completeness.js`
- `docs/stories/epic-123/STORY-123.17-publish-claude-settings-contract.md`
