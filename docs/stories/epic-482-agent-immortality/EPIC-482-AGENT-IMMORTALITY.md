# Epic 482: Agent Immortality Protocol

## Metadata

| Campo | Valor |
|-------|-------|
| Epic ID | 482 |
| Source Issue | #482 |
| Issue URL | https://github.com/SynkraAI/aiox-core/issues/482 |
| Status | Ready for Review |
| Priority | P2 |
| Repository | SynkraAI/aiox-core |

## Objetivo

Implementar uma base de resiliência que transforme falhas fatais de agentes em contexto de recuperação compacto, persistente e reutilizável pela próxima execução.

## Evidência de triagem

- Issue #482 segue aberto e é o único issue vivo após o merge do #717.
- PR #576 está fechado sem merge e sem commits recuperáveis pela API do PR.
- PR #590 está fechado sem merge; continha uma implementação grande de `agent-immortality.js`, mas não entrou na `main`.
- `main` já possui `CircuitBreaker` e `GotchasMemory`, mas não possui Autopsy Engine, Reincarnation Queue, State Commit delta nem Evolution Log.
- O anexo `Autopsy.Engine.js` é TypeScript/protótipo; a entrega precisa ser CommonJS, determinística e compatível com a estrutura atual.

## Slice aprovado

Story 482.1 entrega a fundação de Phase 1:

- Autopsy Engine.
- Reincarnation Queue.
- State Commit delta.
- Evolution Log.
- Integração opcional com GotchasMemory.

Heartbeat/auto-revival contínuo fica fora deste slice para evitar reintroduzir um PR antigo grande sem validação incremental.
