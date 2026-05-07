# STORY-123.15: Alinhar package completeness ao contrato Pro atual

## Status

Done

## Story

Como release manager do AIOX Core, quero que o validador de completude do pacote reflita o contrato atual de publicação, para que ele não bloqueie falsamente releases que incluem o runtime de entitlement Pro exigido pelo próprio publish safety gate.

## Acceptance Criteria

- [x] AC1. `scripts/validate-package-completeness.js` não trata `pro/` como leak genérico.
- [x] AC2. O validador exige `pro/license/license-api.js`, alinhado ao `validate:publish`.
- [x] AC3. O validador continua bloqueando conteúdo local/private como `.env`, `.git/`, `node_modules/`, `.aiox/` e `tests/`.
- [x] AC4. O script passa localmente junto com `validate:publish`.

## Tasks

- [x] Atualizar `scripts/validate-package-completeness.js`.
- [x] Rodar `node scripts/validate-package-completeness.js`.
- [x] Rodar `npm run validate:publish`.

## Dev Notes

- `validate:publish` já exige `pro/` populado e `pro/license/license-api.js` presente. O validador de completude estava herdando um contrato antigo e acusava falso leak.
- Este ajuste não amplia o conteúdo publicado; apenas alinha o script ao `files[]` atual de `package.json`.

## Validation

- `node -c scripts/validate-package-completeness.js` -> PASS.
- `node scripts/validate-package-completeness.js` -> PASS, 30/30 checks.
- `npm run validate:publish` -> PASS.
- `npm run validate:semantic-lint` -> PASS.
- `npm run lint -- --quiet` -> PASS.
- `npm run typecheck` -> PASS.
- `npm run test:ci` -> PASS, 315 suites / 7.846 tests, 149 skipped.

## File List

- `scripts/validate-package-completeness.js`
- `docs/stories/epic-123/STORY-123.15-package-completeness-pro-contract.md`
