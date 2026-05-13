# Story 124.2: npm `@aiox-squads` org provisioning + CI tokens

| Field | Value |
|-------|-------|
| Story ID | 124.2 |
| Epic | [124 — aiox-squads scope migration](./EPIC-124-AIOX-SQUADS-SCOPE-MIGRATION.md) |
| Status | In Progress |
| Executor | @devops |
| Quality Gate | @po |
| Points | 3 |
| Priority | P0 (blocker da Phase 2) |
| Story Order | 2 |

## Status

- [x] Rascunho
- [x] Em revisão (APPROVED by @po — 2026-05-06, score 9.5/10)
- [ ] Concluída

## Story Narrative

**As a** @devops engineer,
**I want** a org `@aiox-squads` no npm provisionada com tokens publish e maintainers convidados,
**so that** stories 124.3-124.5 publiquem com permissions corretas e CI workflows tenham auth funcional.

## Contexto

Epic 124 Decisão 1: Rafael Costa é OrgAdmin. Decisão fechada — sem dependência externa pra criação. Org está vazia hoje (`{}` em lookup). Token NPM_TOKEN necessário em GitHub Secrets pra workflows de publish (`publish-pro.yml`).

## Acceptance Criteria

- [x] AC1. Org `@aiox-squads` ativa no npm com Rafael Costa (rafaelscosta) como Owner
- [ ] AC2. Maintainers convidados: `Pedrovaleriolopez`, `oalanicolas` (publish role) — convites enviados (aceitação async)
- [x] AC3. Publish token validado com scope `@aiox-squads` + permissão "Read and Publish"
- [x] AC4. Token salvo em GitHub Secrets do `SynkraAI/aiox-core` como `NPM_TOKEN_AIOX_SQUADS`
- [x] AC5. Token salvo em GitHub Secrets do `SynkraAI/aiox-pro` (para Story 124.4 cross-repo) como `NPM_TOKEN_AIOX_SQUADS`
- [x] AC6. Documento `docs/PUBLISHING.md` criado com protocolo: pré-requisitos, comandos, rollback, troubleshooting
- [x] AC7. Smoke test via `npm whoami --registry=https://registry.npmjs.org/` confirma token válido
- [x] AC8. Tokens pre-existentes do sponsor confirmados acessíveis e documentados em `docs/PUBLISHING.md`:
  - **`@aios-fullstack` maintainer token** (necessário para Story 124.8 + 124.9 — `npm deprecate` em packages legacy)
  - **`aiox-core` (sem scope) author token** (necessário para Story 124.10 — `npm deprecate` no package sem scope)
  - Ambos resolvíveis via `~/.npmrc` do Rafael Costa post-`npm login` (já configurado em sessão de 2026-05-06). Documentar fallback se algum token expirou: re-login → confirm via `npm whoami` → confirm maintainer status via `npm access list packages <scope>`

## Tasks

- [x] Acessar https://www.npmjs.com/org/create e criar `@aiox-squads`
- [ ] Confirmar billing (org grátis vs pago — confirmar com Rafael se aplicável)
- [ ] Convidar Pedrovaleriolopez + oalanicolas via Settings → Members
- [x] Validar publish token existente: package/org write em `@aiox-squads`, `bypass_2fa: true`, expira em 2026-08-04
- [x] Adicionar token aos secrets dos 2 repos via `gh secret set NPM_TOKEN_AIOX_SQUADS --repo SynkraAI/aiox-core` (e aiox-pro)
- [x] Escrever `docs/PUBLISHING.md` com seções: Prerequisites, Publish flow, Rollback, FAQ
- [x] Smoke test: `NPM_TOKEN=<token> npm whoami` retorna `rafaelscosta`
- [x] Documentar em `docs/PUBLISHING.md`: tokens pré-existentes do `@aios-fullstack` (maintainer) e `aiox-core` (author) e como invocá-los nas stories de deprecation 124.8/9/10
- [x] Smoke test legacy tokens: `npm access list packages aios-fullstack` retorna 7 packages OK; `npm view aiox-core version` accessible com auth

## Execution

- Comandos: `npm org create`, `gh secret set`, `npm whoami`
- Validação: lookup `npm view @aiox-squads/test-package` (será 404 — esperado, org existe sem packages)
- Evidência 2026-05-06:
  - `npm whoami` retornou `rafaelscosta`.
  - `npm token list --json` confirmou token de publish com acesso a `@aiox-squads` e `bypass_2fa: true`.
  - Smoke test com `.npmrc` temporário retornou `rafaelscosta`.
  - `gh secret list --repo SynkraAI/aiox-core` lista `NPM_TOKEN_AIOX_SQUADS`.
  - `gh secret list --repo SynkraAI/aiox-pro` lista `NPM_TOKEN_AIOX_SQUADS`.
  - Convites de maintainers via `npm org set` ficaram bloqueados por `EOTP`/browser auth da npm; resolver manualmente em Settings → Members ou repetir o comando após concluir o fluxo interativo.

## File List

- [docs/stories/epic-124-aiox-squads-scope-migration/STORY-124.2-npm-org-provisioning.md](./STORY-124.2-npm-org-provisioning.md)
- [docs/PUBLISHING.md](../../../docs/PUBLISHING.md) — NEW

## Dependencies

- **Blocks:** 124.3, 124.4, 124.5 (publishes precisam de auth)
- **Blocked by:** 124.1 (precisamos dos nomes finais antes de testar publish)

## Definition of Done

- [ ] Org ativa + 3 maintainers + token funcional
- [x] Tokens em GitHub Secrets dos 2 repos
- [x] PUBLISHING.md completo
- [x] Smoke test verde
