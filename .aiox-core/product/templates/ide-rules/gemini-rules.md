# Gemini Rules - Synkra AIOX

Este arquivo define as instrucoes do projeto para Gemini CLI neste repositorio.

<!-- AIOX-MANAGED-START: core -->
## Core Rules

1. Siga a Constitution em `.aiox-core/constitution.md`
2. Priorize `CLI First -> Observability Second -> UI Third`
3. Trabalhe por stories em `docs/stories/`
4. Nao invente requisitos fora dos artefatos existentes
<!-- AIOX-MANAGED-END: core -->

<!-- AIOX-MANAGED-START: quality -->
## Quality Gates

- Rode `npm run lint`
- Rode `npm run typecheck`
- Rode `npm test`
- Atualize checklist e file list da story antes de concluir
<!-- AIOX-MANAGED-END: quality -->

<!-- AIOX-MANAGED-START: codebase -->
## Project Map

- Core framework: `.aiox-core/`
- CLI entrypoints: `bin/`
- Shared packages: `packages/`
- Tests: `tests/`
- Docs: `docs/`
<!-- AIOX-MANAGED-END: codebase -->

<!-- AIOX-MANAGED-START: gemini-integration -->
## Gemini Integration

Fonte de verdade de agentes:
- Canonico: `.aiox-core/development/agents/*.md`
- Espelhado para Gemini: `.gemini/rules/AIOX/agents/*.md`

Hooks e settings:
- Hooks locais: `.gemini/hooks/`
- Settings locais: `.gemini/settings.json`

Sempre que houver drift, execute:
- `npm run sync:ide:gemini`
- `npm run validate:gemini-sync`
- `npm run validate:gemini-integration`
<!-- AIOX-MANAGED-END: gemini-integration -->

<!-- AIOX-MANAGED-START: parity -->
## Multi-IDE Parity

Para garantir paridade entre Claude Code, Codex e Gemini:
- `npm run validate:parity`
- `npm run validate:paths`
<!-- AIOX-MANAGED-END: parity -->

<!-- AIOX-MANAGED-START: activation -->
## Agent Activation

Preferencia de ativacao:
1. Use agentes em `.gemini/rules/AIOX/agents/`
2. Se necessario, use fonte canonica em `.aiox-core/development/agents/`

Ao ativar agente:
- carregar definicao completa do agente
- renderizar greeting via `node .aiox-core/development/scripts/generate-greeting.js <agent-id>`
- manter persona ativa ate `*exit`

Atalhos recomendados no Gemini:
- `/aiox-menu` para listar agentes
- `/aiox-<agent-id>` (ex.: `/aiox-dev`, `/aiox-architect`)
- `/aiox-agent <agent-id>` para launcher generico
<!-- AIOX-MANAGED-END: activation -->

<!-- AIOX-MANAGED-START: commands -->
## Common Commands

- `npm run sync:ide`
- `npm run sync:ide:check`
- `npm run sync:ide:gemini`
- `npm run validate:gemini-sync`
- `npm run validate:gemini-integration`
- `npm run validate:parity`
- `npm run validate:structure`
- `npm run validate:agents`
<!-- AIOX-MANAGED-END: commands -->
