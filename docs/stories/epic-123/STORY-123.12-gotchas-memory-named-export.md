# STORY-123.12: Corrigir consumidores do named export GotchasMemory

Status: Done

Issue: #517
PR relacionado: #521

## Contexto

O issue #517 identificou que `gotchas-memory.js` exporta `GotchasMemory` como named export, mas alguns consumidores importavam o módulo inteiro como se fosse a classe. Isso fazia `new GotchasMemory()` lançar `TypeError: GotchasMemory is not a constructor`, quebrando a instanciação padrão de componentes que deveriam carregar gotchas automaticamente.

## Acceptance Criteria

- [x] AC1. `IdeationEngine` instancia `GotchasMemory` automaticamente sem depender de injeção explícita.
- [x] AC2. `ContextInjector` instancia `GotchasMemory` automaticamente sem depender de injeção explícita.
- [x] AC3. `SubagentDispatcher` instancia `GotchasMemory` automaticamente sem depender de injeção explícita.
- [x] AC4. Há teste automatizado cobrindo os consumidores reais do named export.
- [x] AC5. A correção é publicada como patch `5.1.8`.

## Tasks

- [x] Corrigir imports de `GotchasMemory` para destructuring.
- [x] Adicionar regressão para os três consumidores.
- [x] Atualizar versão, registry e manifesto de instalação.
- [x] Rodar gates locais antes do PR.

## Dev Notes

- O PR #521 continha a intenção correta, mas carregava mudanças antigas amplas e conflitantes; a correção foi reaplicada em branch limpa baseada na `main`.
- A investigação encontrou o mesmo padrão quebrado também em `ContextInjector` e `SubagentDispatcher`, além de `IdeationEngine`.

## File List

- [docs/stories/epic-123/STORY-123.12-gotchas-memory-named-export.md](./STORY-123.12-gotchas-memory-named-export.md)
- [.aiox-core/core/ideation/ideation-engine.js](../../../.aiox-core/core/ideation/ideation-engine.js)
- [.aiox-core/core/execution/context-injector.js](../../../.aiox-core/core/execution/context-injector.js)
- [.aiox-core/core/execution/subagent-dispatcher.js](../../../.aiox-core/core/execution/subagent-dispatcher.js)
- [tests/core/gotchas-memory-imports.test.js](../../../tests/core/gotchas-memory-imports.test.js)
- [.aiox-core/data/entity-registry.yaml](../../../.aiox-core/data/entity-registry.yaml)
- [.aiox-core/install-manifest.yaml](../../../.aiox-core/install-manifest.yaml)
- [package.json](../../../package.json)
- [package-lock.json](../../../package-lock.json)
