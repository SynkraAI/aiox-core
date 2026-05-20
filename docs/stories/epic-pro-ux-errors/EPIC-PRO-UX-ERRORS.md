# Epic PRO-UX-ERRORS: AIOX Pro CLI Error UX Bridge

## Metadata

| Campo | Valor |
|-------|-------|
| Epic ID | PRO-UX-ERRORS |
| Status | Draft |
| Created | 2026-05-18 |
| Owner | rafael@utidasideias.com.br |
| Points | 13 |
| Priority | P1 |
| Parent | EPIC-AIOX-ERROR-GOVERNANCE (provides AIOXError + ErrorRegistry — done) |
| Companion | aios-license-server/docs/epics/EPIC-PRO-16-ERROR-ENVELOPE-EXTENSION.md (server-side, paired) |

## Objetivo

Refatorar o `aiox-pro-cli` (em `packages/aiox-pro-cli/`) para consumir o envelope `ApiError` estendido pelo EPIC-PRO-16, instanciar `AIOXError` via um Pro-specific registry que estende `defaultErrorRegistry`, e renderizar UX clara em PT-BR com recovery condicional — eliminando o problema observado no caso Robert (2026-05-18, costa.wanderl@gmail.com) onde HTTP codes crus levavam alunos a horas de tentativa-erro client-side.

Este EPIC é a **outra metade** do par cross-repo com `EPIC-PRO-16-ERROR-ENVELOPE-EXTENSION`. Server entrega contrato estendido; este EPIC entrega o consumer.

## Escopo

- Reuso de `AIOXError`, `ErrorRegistry`, `normalizeError`, `serializeError` (já em `.aiox-core/core/errors/`)
- Criação de Pro-specific registry (`pro-error-registry.js`) que estende `defaultErrorRegistry` com 5 definitions (1 por code do top-5 do EPIC-PRO-16)
- Mapping das categorias do license-server (`auth/install/rate/system`) para as categorias **EXISTENTES E CONGELADAS** em `aiox-core/.aiox-core/core/errors/constants.js`:
  - License-server `auth` → `ErrorCategory.PERMISSION`
  - License-server `rate` → `ErrorCategory.NETWORK`
  - License-server `install` → `ErrorCategory.EXTERNAL_EXECUTOR`
  - License-server `system` → `ErrorCategory.UNKNOWN`
- Bridge layer no CLI: consome envelope, monta `AIOXError`, exibe `userMessage` (PT-BR) + `recovery` (array de passos) + `support_code` técnico no rodapé
- Recovery conditional actions baseado em `recovery_hint`:
  - `wait_and_retry` → contador visual
  - `contact_support_*` → exibe `support_code` + canal
  - `retry_install_cache_clean` → executa cleanup OS-aware (PowerShell vs bash detection)
- Fallback gracioso para envelopes legacy (sem campos novos) — CLI funciona mesmo se o server release atrasar

## Fora de Escopo

- Refatorar TODOS os erros do CLI — apenas os 5 do top-5 (mesmos do EPIC-PRO-16)
- i18n (apenas PT-BR neste MVP)
- Telemetria de error rates client-side (provavelmente útil, mas EPIC-168 observability owns)
- Migration de erros não-Pro do CLI (escopo restrito ao fluxo Pro install + activate)
- Mudanças na UI/UX gráfica do dashboard — escopo é CLI text-only

## Stories

| Story | Título | Pts | Status |
|-------|--------|-----|--------|
| PRO-UX.1 | Pro CLI bridge — envelope consumer + pro-error-registry + AIOXError instantiation | 8 | Draft — blocked by aios-license-server/STORY-PRO-16.1 |
| PRO-UX.2 | PT-BR registry definitions + recovery conditional actions + OS-aware cleanup | 5 | Draft — blocked by PRO-UX.1 |

**Total: 13pts.**

## Architecture Bridge

```
┌─────────────────────────────────────────┐
│  aios-license-server (EPIC-PRO-16)      │
│  ApiError envelope:                      │
│  { error: { code, message, message_pt,  │
│             recovery_hint, support_code }}│
└─────────────────┬───────────────────────┘
                  │ HTTP response
                  ▼
┌─────────────────────────────────────────┐
│  aiox-pro-cli (THIS EPIC)               │
│  1. Parse envelope                       │
│  2. Lookup code in proErrorRegistry      │
│  3. new AIOXError({code, userMessage,    │
│     recovery, metadata: { support_code }})│
│  4. Render UX condicional por recovery   │
└─────────────────────────────────────────┘
```

`proErrorRegistry` estende `defaultErrorRegistry` (em `.aiox-core/core/errors/error-registry.js`), respeitando todas as invariantes:
- Códigos únicos (no overlap com defaults)
- Categorias do `ErrorCategory` congelado (mapping acima)
- `userMessage` = string PT-BR (não `message_pt` paralelo)
- `recovery` = array de strings (não `recovery_hint` string única)
- `recovery_hint` do envelope vira chave de UX render no CLI, não campo da `AIOXError`

## Mapping: envelope → AIOXError

| Envelope field (server) | AIOXError prop (client) | Conversão |
|---|---|---|
| `error.code` | `code` | direto (sem prefixo `AIOX_`) |
| `error.message_pt` | `userMessage` | direto se presente, fallback para registry definition |
| `error.recovery_hint` | NÃO mapeia direto — usado pra escolher `recovery` array do registry | switch case no consumer |
| `error.support_code` | `metadata.support_code` | direto |
| `error.message` | `metadata.serverMessage` (EN técnico, oculto do aluno) | direto |
| `error.details` | `metadata.serverDetails` | direto |
| http_status | `metadata.httpStatus` | direto |

`retryable` é derivado da Registry definition (declarativo), NÃO de `recovery_hint`.

## Backward Compat

Fallback gracioso: se o envelope NÃO contém `message_pt`/`recovery_hint`/`support_code` (server release atrasou), o CLI:
1. Consulta `proErrorRegistry.lookup(code)` para obter `userMessage` local
2. Não exibe `support_code` (aluno reporta via email padrão)
3. Recovery default = array genérico ("Tente de novo em 5 min. Se persistir, contate o suporte.")

## Anchor Incident

**Robert / costa.wanderl@gmail.com / 2026-05-18 13:14 UTC** — bateu `HTTP 403` em `npx -y -p @aiox-squads/core@latest aiox install`. CLI mostrou:

```
✗ Falha na ativação: HTTP 403
✗ HTTP 403
i Preciso de ajuda? Execute: npx -y @aiox-squads/aiox-pro-cli@latest recover
```

Causa real: `SEAT_LIMIT_EXCEEDED` (server retornou `error.code` mas CLI ignorou). Aluno gastou ~30min rodando `find/rm` em PowerShell (comandos bash sugeridos por nós em chat — outro problema). Operador resolveu via `/pro-ops reset-seats`.

Pós-EPIC esperado:

```
✗ Você já ativou em todas as 3 máquinas permitidas.

Para resolver:
  1. Pegue o código de suporte abaixo
  2. Cole no chat com o suporte
  3. Após confirmação, rode o comando de instalação novamente

Código de suporte: 20260518T191234Z-a1b2c3d4
Suporte: https://suporte.aiox.dev

(detalhes técnicos: SEAT_LIMIT_EXCEEDED — HTTP 403)
```

Tempo aluno: 0min de tentativa errada. Tempo operador: 30s (1 lookup via support_code).

## Stories File List

| File | Type |
|------|------|
| `docs/stories/epic-pro-ux-errors/EPIC-PRO-UX-ERRORS.md` | This epic |
| `docs/stories/epic-pro-ux-errors/STORY-PRO-UX.1-CLI-BRIDGE-AND-PRO-REGISTRY.md` | Story |
| `docs/stories/epic-pro-ux-errors/STORY-PRO-UX.2-PT-BR-MAPPING-AND-RECOVERY.md` | Story |
| `.aiox-core/core/errors/pro-error-registry.js` (created in PRO-UX.1) | Implementation |
| `packages/aiox-pro-cli/src/error-bridge.js` (created in PRO-UX.1) | Implementation |

## Dependencies

- ✅ `EPIC-AIOX-ERROR-GOVERNANCE` (Done) — `AIOXError` + `ErrorRegistry` infrastructure
- ⚠️ `aios-license-server/EPIC-PRO-16` (Draft, this session) — server contract MUST land first OR CLI ships com fallback only (degraded UX até server pronto)
- ⚠️ `STORY-PRO-13.6 PRO-ARTIFACT-SIGNED-URL` (in aios-license-server) — touches install path, coordenar para evitar merge conflict

## Human Gates

| Gate | Quem decide | Quando |
|---|---|---|
| G1 — ADR do envelope contract | @architect | Provided by EPIC-PRO-16 (server-side gate) |
| G2 — Threat model PT-BR strings | @dev + Rafael | Antes de PRO-UX.2 mergear |
| G3 — Final PT-BR copy review | Rafael (quality bar) | Antes de PRO-UX.2 mergear |
| G4 — Client release pós-server | @devops | Antes do `aiox-pro-cli` major bump |

## Success Metrics

- **Pre:** caso Robert (2026-05-18) tipo: aluno gasta 30min, operador 5min, total 1 ticket / 4-5 round-trips
- **Post:** mesmo caso = aluno 0min de tentativa errada, operador 30s, 1 round-trip
