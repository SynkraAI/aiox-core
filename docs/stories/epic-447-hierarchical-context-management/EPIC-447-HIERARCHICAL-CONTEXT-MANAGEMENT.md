# Epic 447: Hierarchical Context Management

## Metadata

| Campo | Valor |
|-------|-------|
| Epic ID | 447 |
| Status | Ready |
| Source Issue | #447 |
| Issue URL | https://github.com/SynkraAI/aiox-core/issues/447 |
| Repository | SynkraAI/aiox-core |
| Priority | P3 |
| Area | Core runtime, SYNAPSE context, memory |

## Objetivo

Implementar uma superfície canônica de gerenciamento hierárquico de contexto no `aiox-core`, permitindo que agentes de longa duração comprimam histórico, preservem decisões relevantes e evitem estouro de janela de contexto sem descartar silenciosamente o raciocínio anterior.

## Problema

Execuções longas de agentes acumulam mensagens e eventualmente atingem limites de contexto do modelo. O repositório já possui estimativa de contexto, brackets SYNAPSE e ponte de memória, mas ainda não há uma API dedicada para manter `short_term_memory` e `long_term_memory` com sumarização incremental de conversas de agente.

## Code Reality

- `.aiox-core/core/synapse/context/context-tracker.js` já calcula brackets, orçamento de tokens e status FRESH/MODERATE/DEPLETED/CRITICAL.
- `.aiox-core/core/synapse/utils/tokens.js` já oferece `estimateTokens()` por heurística `chars / 4`.
- `.aiox-core/core/synapse/memory/memory-bridge.js` já faz retrieval bracket-aware de memórias, mas é consumer-only e não gerencia histórico ativo.
- `.aiox-core/core/orchestration/context-manager.js` já persiste estado de workflow, mas não é um gerenciador de janela de contexto de LLM.
- Não existe hoje uma classe `HierarchicalContextManager` ou API equivalente.

## Escopo

- Criar API de gerenciamento hierárquico de mensagens para loops de agente.
- Suportar tokenizer e summarizer injetáveis, com fallback para `estimateTokens()`.
- Mover mensagens antigas para resumo de longo prazo quando um threshold configurável for atingido.
- Preservar metadata de mensagens e emitir eventos/telemetria básica de swap.
- Manter compatibilidade total com APIs existentes de SYNAPSE, MemoryBridge e orchestration.

## Fora de Escopo

- Criar banco vetorial novo.
- Migrar todos os loops de agente existentes em massa.
- Fazer chamada real para provedor externo nos testes.
- Substituir `MemoryBridge` ou `SynapseMemoryProvider`.
- Exigir uma dependência de tokenizer nova sem justificativa e testes de fallback.

## Stories

| Story | Título | Status | Prioridade | Ordem |
|-------|--------|--------|------------|-------|
| 447.1 | Hierarchical Context Manager Contract | Ready | P3 | 1 |

## Ordem de Execução

1. Validar `STORY-447.1-HIERARCHICAL-CONTEXT-MANAGER-CONTRACT.md` com `@po *validate-story-draft`.
2. Implementar a API de contexto hierárquico com testes focados.
3. Revisar integração com SYNAPSE e memory surfaces existentes antes de qualquer adoção ampla em loops de agente.

## Validation Gates

- `npm test -- --runTestsByPath tests/synapse/context-tracker.test.js tests/synapse/memory-bridge.test.js tests/core/orchestration/context-manager.test.js`
- Testes novos da story para `HierarchicalContextManager`.
- `npm run lint`
- `npm run typecheck`
- `npm run validate:manifest`, se arquivos de core forem adicionados ao pacote instalável.
