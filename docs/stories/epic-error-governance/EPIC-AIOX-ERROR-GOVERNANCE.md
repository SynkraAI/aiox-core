# Epic AIOX-ERROR-GOVERNANCE: Error Governance Contract

## Metadata

| Campo | Valor |
|-------|-------|
| Epic ID | AIOX-ERROR-GOVERNANCE |
| Status | In Progress |
| Source Issue | #701, #621 |
| Parent | #621 |
| Priority | P1 |

## Objetivo

Formalizar e implementar a superfície canônica de erros do `aiox-core` sem
quebrar consumidores existentes, saída de CLI, logs persistidos ou políticas
silenciosas de hooks.

## Escopo Inicial

- ADR do contrato de Error Governance.
- Módulo `.aiox-core/core/errors/`.
- Testes unitários para `AIOXError`, `ErrorRegistry`, serialização,
  normalização e metadata JSON-safe.

## Fora de Escopo Inicial

- Migração ampla de `throw new Error(...)`.
- Alteração de mensagens CLI existentes.
- Alteração de exit codes existentes.
- Alteração de políticas silenciosas de hooks.
- Transformar `ErrorRegistry` em log/event store de runtime.

## Stories

| Story | Título | Status |
|-------|--------|--------|
| AIOX-ERROR.1 | Core Error Contract | Done |
| AIOX-ERROR.2 | Serialization-Sensitive Migration | Done |
