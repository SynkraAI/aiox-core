# STORY-123.14: Alinhar ownership de lifecycle com QA gate

## Status

Done

## Story

Como operador do ciclo de desenvolvimento AIOX, quero que a regra `story-lifecycle.md` atribua as transições finais de status ao agente correto, para que `@devops` não seja tratado como responsável por mutar story status depois do QA gate.

## Acceptance Criteria

- [x] AC1. `@dev` aparece como responsável por `Ready → InProgress` e `InProgress → InReview`.
- [x] AC2. `@qa` aparece como responsável por `InReview → Done` em PASS/CONCERNS/WAIVED.
- [x] AC3. `@qa` aparece como responsável por `InReview → InProgress` em FAIL.
- [x] AC4. A regra deixa explícito que `@devops` só atua depois que o status já reflete o resultado do QA gate.
- [x] AC5. A versão do pacote é atualizada para publicação patch.

## Tasks

- [x] Corrigir `.claude/rules/story-lifecycle.md`.
- [x] Bump de patch para `@aiox-squads/core@5.1.10`.
- [x] Validar markdown/rules e pacote antes do PR.

## Dev Notes

- Esta story completa a parte única do PR histórico #543 que não foi coberta pelo recorte #656.
- #656 já incorporou os task files procedurais; este ajuste alinha a regra contextual com o comportamento imperativo atual.

## Validation

- `git diff --check` -> PASS.
- `node -e "..."` version assertion -> PASS (`package.json`, `package-lock.json` root and package entry all `5.1.10`).
- Lifecycle rule assertion script -> PASS.
- `npm run validate:manifest` -> PASS.
- `npm run validate:semantic-lint` -> PASS.
- `npm run validate:publish` -> PASS.
- `npm run lint -- --quiet` -> PASS.
- `npm run typecheck` -> PASS.
- `npm test -- tests/synapse/generate-constitution.test.js --runInBand --forceExit` -> PASS, 1 suite / 29 tests.
- `npm run test:ci` -> PASS, 315 suites / 7.846 tests, 149 skipped.

## File List

- `.claude/rules/story-lifecycle.md`
- `docs/stories/epic-123/STORY-123.14-story-lifecycle-qa-ownership.md`
- `package.json`
- `package-lock.json`
