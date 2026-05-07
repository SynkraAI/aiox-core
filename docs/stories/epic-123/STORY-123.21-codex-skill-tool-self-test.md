# STORY-123.21: Self-test determinístico para skills Codex via Skill tool

## Status

Done

## Story

Como mantenedor do AIOX Core, quero um modo de self-test para skills Codex geradas a partir dos agentes core, para validar skills acionadas pelo Skill tool sem depender de protocolo ping-pong ou execução manual.

## Acceptance Criteria

- [x] AC1. O validador de skills Codex expõe um modo `--self-test` para executar checks determinísticos além da paridade estática.
- [x] AC2. O self-test simula payloads do Skill tool e confirma que cada skill gerada resolve para o skill id esperado.
- [x] AC3. O self-test valida frontmatter, caminho source-of-truth e comando de greeting necessários para ativação do agente.
- [x] AC4. Falhas de self-test aparecem no resultado do validador com mensagens acionáveis.
- [x] AC5. Há cobertura automatizada para sucesso, falha de source path e normalização de payload Skill.
- [x] AC6. Validações locais antes de PR são concluídas.

## Tasks

- [x] Investigar o issue #622 e localizar a superfície funcional em `codex-skills-sync/validate.js`.
- [x] Adicionar helpers de frontmatter, payload Skill e execução de self-tests.
- [x] Integrar o modo `--self-test` ao validador e ao script npm.
- [x] Documentar o novo comando no README do sync de skills Codex.
- [x] Adicionar testes unitários do self-test.
- [x] Rodar testes focados e validadores relevantes.
- [x] Preparar artefatos para PR após validação.

## Dev Notes

- O relatório temporário citado no issue #622 não estava mais disponível em `/tmp`, então a correção foi guiada pela descrição do issue e pelas superfícies existentes de sync/validação de skills Codex.
- A correção não invoca um Skill tool real. Ela cria um harness determinístico para validar o contrato que esse tool consumiria: frontmatter, skill id, source-of-truth e greeting command.
- O escopo ficou no `aiox-core`; o submódulo `pro/` não foi alterado.

## Validation

- `node -c .aiox-core/infrastructure/scripts/codex-skills-sync/validate.js` -> PASS.
- `npm test -- tests/unit/codex-skills-validate.test.js --runInBand --forceExit` -> PASS, 1 suite / 10 tests.
- `npm run validate:codex-skills:self-test` -> PASS, 12 skills checked / 12 self-tests passed.
- `npm run generate:manifest` -> PASS, 1.103 files, manifest v5.1.15.
- `npm run validate:manifest` -> PASS.
- `npm run lint -- --quiet` -> PASS.
- `npm run typecheck` -> PASS.
- `npm run test:ci` -> PASS, 317 suites / 7.870 tests / 149 skipped.

## File List

- `.aiox-core/infrastructure/scripts/codex-skills-sync/validate.js`
- `.aiox-core/infrastructure/scripts/codex-skills-sync/README.md`
- `.aiox-core/install-manifest.yaml`
- `package.json`
- `tests/unit/codex-skills-validate.test.js`
- `docs/stories/epic-123/STORY-123.21-codex-skill-tool-self-test.md`
