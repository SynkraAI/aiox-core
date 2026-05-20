# Story PRO-UX.2: PT-BR Registry Definitions + Recovery Conditional Actions + OS-aware Cleanup

## Metadata

| Campo | Valor |
|-------|-------|
| Story ID | PRO-UX.2 |
| Epic | PRO-UX-ERRORS |
| Status | Ready |
| Executor | @dev |
| Quality Gate | @qa |
| Points | 5 |
| Priority | P1 |
| Created | 2026-05-18 |
| Blocked By | PRO-UX.1 (registry skeleton + bridge layer) |

## Objetivo

Preencher os 5 entries do `PRO_ERROR_DEFINITIONS` com `userMessage` (PT-BR) e `recovery` arrays finais, implementar render conditional baseado em `recovery_hint`, e entregar cleanup OS-aware para o caso `retry_install_cache_clean` (PowerShell vs bash detection).

## Context

PRO-UX.1 entregou a bridge técnica e o registry skeleton. Esta story preenche o conteúdo PT-BR final (revisado pelo Rafael em G3) e ativa as recovery actions condicionais que diferem por `recovery_hint`.

Caso anchor (Robert, 2026-05-18) tinha um problema duplo: (1) mensagem opaca [resolvido em PRO-UX.1] e (2) o "recovery" sugerido pelo CLI era genérico (`npx -y @aiox-squads/aiox-pro-cli@latest recover`) e levou o aluno a rodar comandos bash em PowerShell, agravando o problema. Esta story garante que cada `recovery_hint` dispara o caminho correto **e** OS-aware.

References:
- `STORY-PRO-UX.1-CLI-BRIDGE-AND-PRO-REGISTRY.md` (predecessor)
- `EPIC-PRO-UX-ERRORS.md` (parent — mapping table de UX final)
- `.aiox-core/core/errors/pro-error-registry.js` (created in PRO-UX.1)
- `packages/aiox-pro-cli/src/error-bridge.js` (created in PRO-UX.1)

## Acceptance Criteria

- **AC1:** **Pre-gate** — `PRO-UX.1` deve estar `Done`. Confirmar via:
  - `.aiox-core/core/errors/pro-error-registry.js` existe com 5 definitions
  - `packages/aiox-pro-cli/src/error-bridge.js` existe com `parseEnvelopeToAIOXError`
  - Tests da PRO-UX.1 passam

- **AC2:** Os 5 entries de `PRO_ERROR_DEFINITIONS` em `.aiox-core/core/errors/pro-error-registry.js` têm `userMessage` PT-BR FINAL (não placeholder). Strings DEVEM passar por G3 (Rafael copy review) antes do merge:

  | Code | `userMessage` (proposta inicial — Rafael revisa em G3) |
  |---|---|
  | `SEAT_LIMIT_EXCEEDED` | "Você já ativou em todas as 3 máquinas permitidas." |
  | `NOT_A_BUYER` | "Sua licença Pro não está ativa." |
  | `REVOKED_KEY` | "Sua licença Pro foi revogada." |
  | `RATE_LIMITED` | "Muitas tentativas em sequência." |
  | `PRO_ARTIFACT_UNAVAILABLE` | "Erro ao baixar componente Pro." |

  **Gate humano:** PR fica blocked merge até Rafael aprovar strings finais em PR comment (G3 documented).

- **AC3:** Os 5 entries têm `recovery` array (passos PT-BR acionáveis). Proposta inicial:

  | Code | `recovery` array (Rafael aprova em G3) |
  |---|---|
  | `SEAT_LIMIT_EXCEEDED` | `["Pegue o código de suporte abaixo", "Cole no chat com o suporte", "Após confirmação, rode o comando de instalação novamente"]` |
  | `NOT_A_BUYER` | `["Pegue o código de suporte abaixo", "Cole no chat com o suporte", "Aguarde verificação da sua compra"]` |
  | `REVOKED_KEY` | `["Pegue o código de suporte abaixo", "Cole no chat com o suporte", "Aguarde retorno do financeiro"]` |
  | `RATE_LIMITED` | `["Aguarde 5 minutos", "Tente o comando novamente"]` |
  | `PRO_ARTIFACT_UNAVAILABLE` | `["Aguarde 5 minutos (servidor pode estar reiniciando)", "Rode \`aiox install --recover-cache\` para limpar cache local", "Tente novamente"]` |

- **AC4:** Render layer criada em `packages/aiox-pro-cli/src/render-error.js` exportando `renderError(aioxError)`:
  - Recebe `AIOXError` (vindo de `parseEnvelopeToAIOXError`)
  - Emite output para `process.stderr` ou via writer abstraction
  - Formato EXATO:
    ```
    ✗ {userMessage}

    Para resolver:
      1. {recovery[0]}
      2. {recovery[1]}
      ...

    Código de suporte: {metadata.support_code}    ← omitido se metadata.support_code é undefined
    Suporte: https://suporte.aiox.dev             ← omitido se recovery_hint não começa com "contact_support_"

    ({code} — HTTP {metadata.httpStatus})         ← rodapé técnico, sempre visível
    ```
  - Encoding PT-BR preservado (acentos UTF-8)
  - Exit code = `aioxError.exitCode` se definido, senão `1`

- **AC5:** Recovery conditional actions implementadas em `packages/aiox-pro-cli/src/recovery-actions.js`:
  ```js
  /**
   * Dispatch recovery action baseado em recovery_hint do envelope.
   * Retorna boolean indicando se ação foi disparada (true) ou se UX é apenas informativa (false).
   */
  function executeRecoveryAction(recoveryHint, context) {
    switch (recoveryHint) {
      case 'wait_and_retry':
        return showRetryCountdown(context.waitSeconds || 300);  // 5min default
      case 'retry_install_cache_clean':
        return executeCacheCleanup();  // OS-aware
      case 'contact_support_seat_reset':
      case 'contact_support_grant':
      case 'contact_support_billing':
        return false;  // No automated action — only support_code visibility
      default:
        return false;
    }
  }
  ```

- **AC6:** OS-aware cleanup em `executeCacheCleanup()`:
  ```js
  function getCacheCleanCommands() {
    if (process.platform === 'win32') {
      return [
        // PowerShell — Robert era Windows
        `Get-ChildItem -Path . -Recurse -Filter "pro" -Directory -ErrorAction SilentlyContinue | Where-Object { $_.FullName -match "node_modules\\\\@aiox-squads\\\\pro$" } | Remove-Item -Recurse -Force`,
        `Remove-Item -Recurse -Force $env:USERPROFILE\\.npm\\_npx -ErrorAction SilentlyContinue`,
      ];
    }
    // darwin / linux
    return [
      `find . -maxdepth 5 -path "*/node_modules/@aiox-squads/pro" -type d 2>/dev/null -exec rm -rf {} + 2>/dev/null`,
      `rm -rf ~/.npm/_npx 2>/dev/null`,
    ];
  }
  ```
  CLI executa commands via `child_process.execSync` ou similar, com timeout e error capture. Fail-safe: se cleanup falha, ainda mostra "Tente novamente em alguns minutos" sem crashar.

- **AC7:** Tests em `packages/aiox-pro-cli/src/__tests__/render-error.test.js` (snapshot tests):
  - 5 golden files em `__tests__/__snapshots__/render-error-<code>.snap` cobrindo cada um dos 5 codes
  - Snapshot cobre output exato (incluindo whitespace) renderizado pela `renderError`
  - Snapshot test específico para caso Robert: envelope `SEAT_LIMIT_EXCEEDED` + `support_code: "20260518T193411Z-a1b2c3d4"` → output matching EPIC anchor section

- **AC8:** Tests cross-platform em `packages/aiox-pro-cli/src/__tests__/recovery-actions.test.js`:
  - Mock `process.platform` para `'win32'`, `'darwin'`, `'linux'`
  - Validar que `getCacheCleanCommands()` retorna PowerShell em win32, bash nos outros
  - Validar shape dos comandos (não a execução real — execução é mocked via `child_process` stub)

- **AC9:** Threat model PT-BR validation (G2): Strings dos 5 codes auth (`NOT_A_BUYER`, `REVOKED_KEY`, `SEAT_LIMIT_EXCEEDED`) não habilitam account enumeration em probe não autenticado. Comentário inline no `pro-error-registry.js` justificando paridade de tom.

- **AC10:** `npm test`, `npm run lint`, `npm run typecheck` passam.

- **AC11:** PR fica blocked até Rafael aprovar strings finais (G3) E threat model (G2). Aprovações documentadas em PR comments.

- **AC12:** EPIC-PRO-UX-ERRORS anchor section atualizada (no `EPIC-PRO-UX-ERRORS.md`): substituir "Pós-EPIC esperado" pelo output FINAL renderizado (após snapshot tests passarem). Story toca o file do EPIC para sincronizar.

## Tasks

- [ ] T1: Confirmar pre-gate AC1
- [ ] T2: Substituir placeholders nos 5 entries de `PRO_ERROR_DEFINITIONS` com `userMessage` + `recovery` PT-BR propostos (AC2, AC3)
- [ ] T3: Criar `packages/aiox-pro-cli/src/render-error.js` com `renderError` (AC4) — começar com fixture-driven dev
- [ ] T4: Criar `packages/aiox-pro-cli/src/recovery-actions.js` com `executeRecoveryAction` + `executeCacheCleanup` + `showRetryCountdown` (AC5, AC6)
- [ ] T5: Wire renderError nos CLI entry points (`bin/aiox-pro.js`, `src/recover.js`) — substituir output cru de erros
- [ ] T6: Tests snapshot em `__tests__/render-error.test.js` (AC7) — gerar golden files inicial, congelar
- [ ] T7: Tests cross-platform em `__tests__/recovery-actions.test.js` (AC8)
- [ ] T8: Adicionar comentários inline justificando threat model paridade (AC9)
- [ ] T9: Solicitar G2 review do @dev (threat model) e G3 review do Rafael (copy)
- [ ] T10: Atualizar `EPIC-PRO-UX-ERRORS.md` anchor section com output final (AC12)
- [ ] T11: `npm test` + `npm run lint` + `npm run typecheck` passam (AC10)
- [ ] T12: Atualizar Dev Agent Record + Change Log

## Dev Notes

### Render output reference

Output esperado para caso Robert (anchor):
```
✗ Você já ativou em todas as 3 máquinas permitidas.

Para resolver:
  1. Pegue o código de suporte abaixo
  2. Cole no chat com o suporte
  3. Após confirmação, rode o comando de instalação novamente

Código de suporte: 20260518T193411Z-a1b2c3d4
Suporte: https://suporte.aiox.dev

(SEAT_LIMIT_EXCEEDED — HTTP 403)
```

Output esperado para `RATE_LIMITED` (sem support_code, sem link suporte):
```
✗ Muitas tentativas em sequência.

Para resolver:
  1. Aguarde 5 minutos
  2. Tente o comando novamente

(RATE_LIMITED — HTTP 429)
```

### Anti-patterns / NÃO fazer

- **NÃO** mexer em `error-bridge.js` (PRO-UX.1 owns) — esta story consome a `AIOXError` produzida lá
- **NÃO** mudar shape do envelope HTTP — server contract owned por PRO-16.x
- **NÃO** acessar `process.stdout` diretamente em render — usar writer abstraction pra testabilidade
- **NÃO** usar libs de cor (chalk, kleur) sem confirmar que CLI já depende delas
- **NÃO** popular telemetria de error rates aqui — EPIC-168 owns
- **NÃO** strip os comments PT-BR de placeholders sem confirmar G3 aprovou

### Gotchas

- Linha "Código de suporte: ..." só aparece quando `metadata.support_code` está presente (envelope estendido pós-PRO-16.3 merge). Pre-merge do PRO-16.3, linha some — esse é o fallback gracioso de PRO-UX.1.
- Linha "Suporte: https://..." só aparece quando `recovery_hint.startsWith('contact_support_')`. Outros hints (`wait_and_retry`, `retry_install_cache_clean`) NÃO mostram link de suporte (auto-recovery).
- OS-aware cleanup commands em Windows usam barra invertida dupla escaped pela TypeScript string. Cuidado com `\\\\` em fontes JS — quatro backslashes no source = duas no runtime string = um literal backslash no PowerShell.
- Robust UTF-8: Node ≥18 lida com PT-BR encoding default; mas se houver lint de spell-check no repo, garantir whitelist de palavras PT (suporte, código, etc).

### CodeRabbit Integration

Pre-merge focus:
- UI/UX consistency: output formatting matches mockup em EPIC anchor
- Cross-platform correctness: PowerShell vs bash commands shape válido
- PT-BR accent preservation (críticos: máquinas, código, não, ativação)
- Snapshot test stability (snapshots não dependem de timestamps ou random)

## Dev Agent Record

_(Preenchido por @dev)_

### Debug Log

### Completion Notes

### File List

## Change Log

_(Preenchido por @dev)_

## Dev Notes

### PT-BR strings (proposta — Rafael revisa em G3)

| Code | `userMessage` | `recovery` (array) |
|---|---|---|
| `SEAT_LIMIT_EXCEEDED` | "Você já ativou em todas as 3 máquinas permitidas." | ["Pegue o código de suporte abaixo", "Cole no chat com o suporte", "Após confirmação, rode o comando de instalação novamente"] |
| `NOT_A_BUYER` | "Sua licença Pro não está ativa." | ["Pegue o código de suporte abaixo", "Cole no chat com o suporte", "Aguarde verificação da sua compra"] |
| `REVOKED_KEY` | "Sua licença Pro foi revogada." | ["Pegue o código de suporte abaixo", "Cole no chat com o suporte", "Aguarde retorno do financeiro"] |
| `RATE_LIMITED` | "Muitas tentativas em sequência." | ["Aguarde 5 minutos", "Tente o comando novamente"] |
| `PRO_ARTIFACT_UNAVAILABLE` | "Erro ao baixar componente Pro." | ["Aguarde 5 minutos (servidor pode estar reiniciando)", "Rode `aiox install --recover-cache` para limpar cache local", "Tente novamente"] |

### OS-aware cleanup (caso `retry_install_cache_clean`)

```js
// packages/aiox-pro-cli/src/recovery-actions.js (created here)
function getCacheCleanCommands() {
  if (process.platform === 'win32') {
    return [
      `Get-ChildItem -Path . -Recurse -Filter "pro" -Directory -ErrorAction SilentlyContinue | Where-Object { $_.FullName -match "node_modules\\\\@aiox-squads\\\\pro$" } | Remove-Item -Recurse -Force`,
      `Remove-Item -Recurse -Force $env:USERPROFILE\\.npm\\_npx -ErrorAction SilentlyContinue`
    ];
  }
  return [
    `find . -maxdepth 5 -path "*/node_modules/@aiox-squads/pro" -type d 2>/dev/null -exec rm -rf {} + 2>/dev/null`,
    `rm -rf ~/.npm/_npx 2>/dev/null`
  ];
}
```

Aluno em Windows recebe PowerShell-compatible (não os `find/rm` bash que quebraram o Robert).

### Render layout (proposta — UX validation em G3)

```
✗ Você já ativou em todas as 3 máquinas permitidas.

Para resolver:
  1. Pegue o código de suporte abaixo
  2. Cole no chat com o suporte
  3. Após confirmação, rode o comando de instalação novamente

Código de suporte: 20260518T191234Z-a1b2c3d4
Suporte: https://suporte.aiox.dev

(SEAT_LIMIT_EXCEEDED — HTTP 403)
```

### Telemetria opcional

Telemetria de `recovery_hint` adoption (quantos alunos usaram `--recover-cache` vs ignoraram) é nice-to-have, mas fora deste MVP. EPIC-168 observability owns o canal.
