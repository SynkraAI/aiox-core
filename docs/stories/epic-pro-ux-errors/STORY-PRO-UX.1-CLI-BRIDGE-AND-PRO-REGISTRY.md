# Story PRO-UX.1: Pro CLI Bridge — envelope consumer + pro-error-registry + AIOXError instantiation

## Metadata

| Campo | Valor |
|-------|-------|
| Story ID | PRO-UX.1 |
| Epic | PRO-UX-ERRORS |
| Status | Ready |
| Executor | @dev |
| Quality Gate | @qa |
| Points | 8 |
| Priority | P1 |
| Created | 2026-05-18 |
| Blocked By | aios-license-server/STORY-PRO-16.1 (envelope schema) |
| Blocks | PRO-UX.2 |

## Objetivo

Implementar a bridge layer no `aiox-pro-cli` que consome o envelope `ApiError` estendido (do EPIC-PRO-16) e instancia `AIOXError` via um Pro-specific registry, reusando a infraestrutura canônica do `.aiox-core/core/errors/` sem duplicação. Esta story entrega o consumer técnico; PT-BR strings finais e recovery actions condicionais ficam em PRO-UX.2.

## Context

A infraestrutura canônica de erros do `aiox-core` existe desde EPIC-AIOX-ERROR-GOVERNANCE (Done, 2026-05):
- `AIOXError` em `.aiox-core/core/errors/aiox-error.js` — campos `code`, `category`, `severity`, `retryable`, `userMessage`, `recovery` (array), `metadata`, `exitCode`
- `ErrorRegistry` em `.aiox-core/core/errors/error-registry.js` — taxonomy de codes com lookup seguro
- `defaultErrorRegistry` populado com `CORE_ERROR_DEFINITIONS` (configuration, validation, filesystem, network, etc — 11 categorias congeladas)

Esta story estende a infra com codes Pro-specific e a usa do CLI Pro, sem mexer no core.

References:
- Parent ADR: `docs/architecture/adr/ADR-ERROR-GOVERNANCE-CONTRACT.md`
- AIOXError source: `.aiox-core/core/errors/aiox-error.js`
- ErrorRegistry source: `.aiox-core/core/errors/error-registry.js`
- Categories (congeladas): `.aiox-core/core/errors/constants.js:1-13`
- Server contract (companion): `aios-license-server/docs/stories/STORY-PRO-16.1-...`
- CLI target: `packages/aiox-pro-cli/src/`

## Acceptance Criteria

- **AC1:** **Pre-gate** — `aios-license-server/STORY-PRO-16.1` deve estar `Done`. Confirmar via:
  - Endpoint staging do license-server retorna `{ error: { code, message, message_pt?, recovery_hint?, support_code?, details? } }` com campos novos opcionais quando aplicável
  - ADR `aios-license-server/docs/decisions/PRO-16-error-envelope-extension.md` está `Accepted`
  - Se PRO-16.2/16.3 ainda não mergearam, esta story funciona com fallback gracioso (AC7)

- **AC2:** `aiox-core/.aiox-core/core/errors/pro-error-registry.js` criado exportando `proErrorRegistry` (instância de `ErrorRegistry`) + `PRO_ERROR_DEFINITIONS` (array). Skeleton:
  ```js
  const { ErrorRegistry } = require('./error-registry');
  const { ErrorCategory, ErrorSeverity } = require('./constants');

  const PRO_ERROR_DEFINITIONS = [
    {
      code: 'SEAT_LIMIT_EXCEEDED',
      category: ErrorCategory.PERMISSION,
      severity: ErrorSeverity.ERROR,
      retryable: false,
      userMessage: 'PLACEHOLDER — final em STORY-PRO-UX.2',
      recovery: ['PLACEHOLDER'],
      exitCode: 13,
    },
    {
      code: 'NOT_A_BUYER',
      category: ErrorCategory.PERMISSION,
      severity: ErrorSeverity.ERROR,
      retryable: false,
      userMessage: 'PLACEHOLDER',
      recovery: ['PLACEHOLDER'],
      exitCode: 13,
    },
    {
      code: 'REVOKED_KEY',
      category: ErrorCategory.PERMISSION,
      severity: ErrorSeverity.ERROR,
      retryable: false,
      userMessage: 'PLACEHOLDER',
      recovery: ['PLACEHOLDER'],
      exitCode: 13,
    },
    {
      code: 'RATE_LIMITED',
      category: ErrorCategory.NETWORK,
      severity: ErrorSeverity.WARNING,
      retryable: true,
      userMessage: 'PLACEHOLDER',
      recovery: ['PLACEHOLDER'],
    },
    {
      code: 'PRO_ARTIFACT_UNAVAILABLE',
      category: ErrorCategory.EXTERNAL_EXECUTOR,
      severity: ErrorSeverity.ERROR,
      retryable: true,
      userMessage: 'PLACEHOLDER',
      recovery: ['PLACEHOLDER'],
    },
  ];

  const proErrorRegistry = new ErrorRegistry(PRO_ERROR_DEFINITIONS);

  module.exports = { proErrorRegistry, PRO_ERROR_DEFINITIONS };
  ```
  Placeholders preenchidos com PT-BR final em PRO-UX.2.

- **AC3:** Categorias usadas em `PRO_ERROR_DEFINITIONS` confirmadas como pertencentes ao `ErrorCategory` existente em `.aiox-core/core/errors/constants.js`:
  - `SEAT_LIMIT_EXCEEDED` → `PERMISSION`
  - `NOT_A_BUYER` → `PERMISSION`
  - `REVOKED_KEY` → `PERMISSION`
  - `RATE_LIMITED` → `NETWORK`
  - `PRO_ARTIFACT_UNAVAILABLE` → `EXTERNAL_EXECUTOR`

  Implementação NÃO importa `ErrorCategory.AUTH` ou similar (não existe). Teste a verificar esse mapping (AC7).

- **AC4:** `proErrorRegistry` instância passa `assertUnique()` test e `list()` retorna exatamente 5 entries. Constructor NÃO joga erro (nenhum code do top-5 colide com codes do `CORE_ERROR_DEFINITIONS` do `defaultErrorRegistry`).

- **AC5:** `packages/aiox-pro-cli/src/error-bridge.js` criado exportando `parseEnvelopeToAIOXError(envelope, options)`:
  ```js
  const { AIOXError } = require('../../../.aiox-core/core/errors');
  const { proErrorRegistry } = require('../../../.aiox-core/core/errors/pro-error-registry');
  const { defaultErrorRegistry } = require('../../../.aiox-core/core/errors/error-registry');

  /**
   * Converte envelope HTTP do license-server em AIOXError estruturado.
   * Fallback 3-tier:
   *   1. envelope.error.message_pt (server populou)
   *   2. registryDefinition.userMessage (PT-BR local)
   *   3. envelope.error.message (server EN técnico)
   */
  function parseEnvelopeToAIOXError(envelope, options = {}) {
    const httpStatus = options.httpStatus;
    const errorBody = envelope && envelope.error;

    if (!errorBody || !errorBody.code) {
      // Envelope malformado — fallback to UNKNOWN
      return new AIOXError('Erro inesperado ao consultar o servidor.', {
        code: 'AIOX_UNKNOWN_ERROR',
        metadata: { httpStatus, malformedEnvelope: true },
      });
    }

    const code = errorBody.code;
    // Tier 1: Pro registry
    let definition = proErrorRegistry.has(code) ? proErrorRegistry.lookup(code) : null;
    // Tier 2: default registry
    if (!definition) {
      definition = defaultErrorRegistry.has(code) ? defaultErrorRegistry.lookup(code) : null;
    }
    // Tier 3: unknown fallback
    if (!definition) {
      definition = defaultErrorRegistry.lookup('AIOX_UNKNOWN_ERROR');
    }

    const userMessage =
      errorBody.message_pt ||
      definition.userMessage ||
      errorBody.message ||
      'Erro inesperado.';

    return new AIOXError(userMessage, {
      code,
      category: definition.category,
      severity: definition.severity,
      retryable: definition.retryable,
      recovery: definition.recovery,
      exitCode: definition.exitCode,
      metadata: {
        support_code: errorBody.support_code,
        recovery_hint: errorBody.recovery_hint,
        serverMessage: errorBody.message,
        serverDetails: errorBody.details,
        httpStatus,
      },
    });
  }

  module.exports = { parseEnvelopeToAIOXError };
  ```

- **AC6:** CLI entry points `packages/aiox-pro-cli/bin/aiox-pro.js` e `packages/aiox-pro-cli/src/recover.js` (paths confirmados via `ls packages/aiox-pro-cli/{bin,src}`) capturam responses HTTP do license-server e passam pelo `parseEnvelopeToAIOXError` antes de exibir output. ESCOPO: as chamadas que recebem 4xx/5xx do license-server.

- **AC7:** Tests em `packages/aiox-pro-cli/src/__tests__/error-bridge.test.js`:
  - `test('parseEnvelopeToAIOXError: envelope completo com support_code retorna AIOXError com tudo populated')` — fixture `SEAT_LIMIT_EXCEEDED` com todos os campos novos
  - `test('parseEnvelopeToAIOXError: envelope legacy sem campos novos usa registry userMessage')` — fixture só com `code` + `message` (server pre-PRO-16.2)
  - `test('parseEnvelopeToAIOXError: code desconhecido cai no AIOX_UNKNOWN_ERROR')` — fixture com `code: 'FOO_BAR'`
  - `test('parseEnvelopeToAIOXError: envelope malformado retorna AIOXError default')` — fixture `null`, `{}`, `{ error: null }`
  - `test('parseEnvelopeToAIOXError: 3-tier fallback: message_pt > registry.userMessage > message')` — 3 fixtures cobrindo cada tier
  - `test('proErrorRegistry: assertUnique passa')` — sanity check
  - `test('proErrorRegistry: list retorna 5 entries com categories válidas')` — confirma AC3
  - `test('proErrorRegistry + defaultErrorRegistry: nenhum overlap de codes')` — iterar codes e verificar disjoint sets

- **AC8:** Tests rodam via `npm test` no scope de `aiox-core`. `npm run lint` + `npm run typecheck` passam.

- **AC9:** Integration test (STRETCH GOAL — pode ser mock se staging não acessível) em `packages/aiox-pro-cli/src/__tests__/error-bridge-integration.test.js`:
  - Mock HTTP fetch retornando envelope realista de `SEAT_LIMIT_EXCEEDED`
  - Assertar que CLI flow renderiza `userMessage` PT-BR (placeholder OK) ao invés de "HTTP 403"
  - Marcar como `test.skip` se for muito custoso — não bloqueia merge

## Tasks

- [ ] T1: Confirmar pre-gate AC1 — verificar que `aios-license-server/src/lib/errors.ts` no main/develop contém o tipo `RecoveryHint` e os campos novos em `ApiError`
- [ ] T2: Criar `.aiox-core/core/errors/pro-error-registry.js` com `PRO_ERROR_DEFINITIONS` skeleton (AC2)
- [ ] T3: Confirmar mapeamento de categorias (AC3) abrindo `.aiox-core/core/errors/constants.js` e validando que `PERMISSION`, `NETWORK`, `EXTERNAL_EXECUTOR` existem
- [ ] T4: Criar `packages/aiox-pro-cli/src/error-bridge.js` com `parseEnvelopeToAIOXError` (AC5)
- [ ] T5: Identificar TODAS as chamadas HTTP a license-server em `aiox-pro-cli` (grep por `fetch`/`axios`/`http`) e wrappar com `parseEnvelopeToAIOXError` (AC6) — não é refactor amplo, só os fluxos de install/activate
- [ ] T6: Implementar tests em `__tests__/error-bridge.test.js` (AC7) — 8 tests
- [ ] T7: Adicionar entity registry entry para `.aiox-core/core/errors/pro-error-registry.js` (rodar `node .aiox-core/core/ids/registry-updater.js --files .aiox-core/core/errors/pro-error-registry.js`) — segue padrão de STORY-AIOX-ERROR.1
- [ ] T8: `npm run lint` + `npm run typecheck` + `npm test` passa (AC8)
- [ ] T9: (Stretch) Integration test mock (AC9)
- [ ] T10: Atualizar `.aiox-core/install-manifest.yaml` se hook regenerar — confirmar diff é benigno antes de commit (segue pattern STORY-AIOX-ERROR.1)
- [ ] T11: Atualizar Dev Agent Record + Change Log

## Dev Notes

### Files de referência

- AIOXError class: `aiox-core/.aiox-core/core/errors/aiox-error.js`
- ErrorRegistry class: `aiox-core/.aiox-core/core/errors/error-registry.js`
- Constants congeladas: `aiox-core/.aiox-core/core/errors/constants.js`
- Core registry definitions: `aiox-core/.aiox-core/core/errors/constants.js:24-130` (`CORE_ERROR_DEFINITIONS`)
- CLI entry points: `aiox-core/packages/aiox-pro-cli/bin/aiox-pro.js` + `aiox-core/packages/aiox-pro-cli/src/recover.js`
- Server envelope shape (cross-repo reference): `aios-license-server/src/lib/errors.ts`
- Predecessor story: `aiox-core/docs/stories/epic-error-governance/STORY-AIOX-ERROR.1-CORE-CONTRACT.md`

### Code naming convention

- Codes Pro-specific NÃO usam prefixo `AIOX_` — eles espelham `ErrorCodes` do license-server (`SEAT_LIMIT_EXCEEDED`, etc). O regex de validation em `ErrorRegistry._normalizeDefinition` (`/^[A-Z0-9_]+$/`) aceita.
- Decision documentada no ADR-ERROR-GOVERNANCE-CONTRACT amendment futuro (ou no header comment do `pro-error-registry.js`).

### Anti-patterns / NÃO fazer

- **NÃO** criar `ErrorCategory.AUTH`, `INSTALL`, `RATE`, `SYSTEM` — eles NÃO existem no Object.freeze. Mapear pra existentes.
- **NÃO** modificar `aiox-error.js`, `error-registry.js`, `constants.js`, `serializer.js`, `utils.js` — INFRA congelada
- **NÃO** wrappar TODAS as chamadas HTTP do CLI — apenas os fluxos install/activate
- **NÃO** popular `recovery` arrays com strings PT-BR finais aqui — placeholders ficam até PRO-UX.2
- **NÃO** renderizar erro no terminal ainda — esta story é bridge layer. Renderização condicional vai em PRO-UX.2

### Gotchas

- `proErrorRegistry` é uma instância separada de `defaultErrorRegistry`. Lookup tier order é manual (`parseEnvelopeToAIOXError` faz check em sequência). Não tentem mergear em um single registry — semantic separation é importante.
- AIOXError construct path resolve via require relativo do `aiox-pro-cli` package. Confirmar `../../../.aiox-core/core/errors` (3 levels up de `packages/aiox-pro-cli/src/`). Se filesystem layout mudou desde 2026-05-18, ajustar paths.
- Status PRO-16.2/16.3 do license-server NÃO bloqueia esta story totalmente — fallback gracioso garante CLI funciona com envelope legacy. PR pode mergear antes do server.

### CodeRabbit Integration

Pre-merge focus:
- Path resolution correctness (require paths relativos)
- Test coverage de fallback paths
- No breaking change em CLI commands existentes

## Dev Notes

### Mapping de categorias (CRÍTICO — não inventar novas)

Categorias do license-server (conceitos lógicos do server side) → categorias existentes em `aiox-core/.aiox-core/core/errors/constants.js`:

| Server concept | `ErrorCategory.*` to use |
|---|---|
| `SEAT_LIMIT_EXCEEDED` (license auth says "no") | `PERMISSION` |
| `NOT_A_BUYER` (license auth says "no") | `PERMISSION` |
| `REVOKED_KEY` (license auth says "no") | `PERMISSION` |
| `RATE_LIMITED` (throttling) | `NETWORK` |
| `PRO_ARTIFACT_UNAVAILABLE` (npm/tarball fetch fail) | `EXTERNAL_EXECUTOR` |

`AUTH`, `INSTALL`, `RATE`, `SYSTEM` NÃO existem no `ErrorCategory` congelado. Adicionar nova categoria requer **amendment formal ao ADR-ERROR-GOVERNANCE-CONTRACT** — fora do escopo deste EPIC.

### Code naming convention

`proErrorRegistry` aceita codes **sem prefixo `AIOX_`** (ex.: `SEAT_LIMIT_EXCEEDED`) porque eles espelham os codes do license-server (`ErrorCodes` em `src/lib/errors.ts`). O regex de validação no `ErrorRegistry._normalizeDefinition` é `/^[A-Z0-9_]+$/` — sem requirement de prefixo. `SEAT_LIMIT_EXCEEDED` passa.

Mas: documentar no ADR (PRO-16.1) que codes Pro-specific NÃO usam prefixo `AIOX_` e que essa decisão é deliberada (preserva paridade com server-side ErrorCodes).

### `recovery_hint` consumption

`recovery_hint` (string única do envelope) NÃO vira campo da `AIOXError`. Vai para `metadata.recovery_hint` e é consumido pela camada de render (PRO-UX.2) para escolher qual array `recovery` exibir e qual action condicional disparar (wait_and_retry contador / retry_install_cache_clean cleanup / contact_support_* exibe support_code).

### Definitions placeholder (texto final em PRO-UX.2)

```js
// .aiox-core/core/errors/pro-error-registry.js
const { ErrorRegistry } = require('./error-registry');
const { ErrorCategory, ErrorSeverity } = require('./constants');

const PRO_ERROR_DEFINITIONS = [
  {
    code: 'SEAT_LIMIT_EXCEEDED',
    category: ErrorCategory.PERMISSION,
    severity: ErrorSeverity.ERROR,
    retryable: false,
    userMessage: 'TBD by PRO-UX.2',
    recovery: ['TBD by PRO-UX.2'],
    exitCode: 13,
  },
  // ... 4 outras
];

const proErrorRegistry = new ErrorRegistry(PRO_ERROR_DEFINITIONS);
module.exports = { proErrorRegistry, PRO_ERROR_DEFINITIONS };
```

PRO-UX.2 preenche `userMessage` PT-BR e `recovery` arrays. Esta story (PRO-UX.1) entrega skeleton + bridge wiring.
