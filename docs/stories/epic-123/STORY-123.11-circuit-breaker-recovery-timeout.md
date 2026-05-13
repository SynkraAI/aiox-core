# STORY-123.11: Preservar timeout de recuperação do CircuitBreaker em OPEN

Status: Done

Issue: #469
PR relacionado: #618

## Contexto

O issue #469 descreve um bug no `CircuitBreaker`: chamadas repetidas a `recordFailure()` enquanto o circuito já está `OPEN` atualizam `lastFailureTime`, reiniciando indefinidamente a janela de recuperação. Isso impede a transição para `HALF_OPEN` enquanto as falhas continuam chegando.

## Acceptance Criteria

- [x] AC1. Falhas registradas enquanto o circuito está `OPEN` continuam incrementando `failureCount`.
- [x] AC2. Falhas registradas enquanto o circuito está `OPEN` não atualizam `lastFailureTime`.
- [x] AC3. O circuito transiciona para `HALF_OPEN` após o timeout original, mesmo com falhas subsequentes durante `OPEN`.
- [x] AC4. Há teste automatizado determinístico cobrindo a regressão do issue #469.
- [x] AC5. A correção é publicada como patch `5.1.7`.

## Tasks

- [x] Ajustar `recordFailure()` para preservar o marco temporal original quando o estado já é `OPEN`.
- [x] Adicionar regressão na suíte de verification gates.
- [x] Atualizar versão e manifesto de instalação.
- [x] Rodar gates locais antes do PR.

## Dev Notes

- O PR #618 continha a intenção correta, mas estava atrás da `main` e sem a bateria atual de validação; a correção foi reaplicada em branch nova baseada na `main`.
- O comportamento em `CLOSED` e `HALF_OPEN` permanece igual: falhas nesses estados ainda atualizam `lastFailureTime`.

## File List

- [docs/stories/epic-123/STORY-123.11-circuit-breaker-recovery-timeout.md](./STORY-123.11-circuit-breaker-recovery-timeout.md)
- [.aiox-core/core/ids/circuit-breaker.js](../../../.aiox-core/core/ids/circuit-breaker.js)
- [tests/core/ids/verification-gates.test.js](../../../tests/core/ids/verification-gates.test.js)
- [.aiox-core/install-manifest.yaml](../../../.aiox-core/install-manifest.yaml)
- [package.json](../../../package.json)
- [package-lock.json](../../../package-lock.json)
