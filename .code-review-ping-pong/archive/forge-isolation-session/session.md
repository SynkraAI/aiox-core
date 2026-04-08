# Ping-Pong Session

## Scope
- files:
  - skills/forge/phases/phase-0-discovery.md
  - skills/forge/phases/phase-2-stories.md
  - skills/forge/phases/phase-3-build.md
  - skills/forge/runner.md
  - skills/forge/workflows/quick.md
  - skills/forge/workflows/bug-fix.md

## Goals
- Verificar que TODAS as referências a `docs/stories/active/` nos arquivos de execução do Forge agora usam `{run_id}/`
- Confirmar que não ficou nenhuma referência hardcoded sem o `{run_id}` que deveria ter sido alterada
- Verificar consistência entre os 6 arquivos (mesmo padrão em todos)
- Checar que referências legítimas sem `{run_id}` (brownfield scan, scaffold placeholder) foram corretamente preservadas
- Verificar que o completion protocol (runner.md) move subpasta inteira e não arquivos individuais
- Verificar pt-BR quality (acentuação) nos trechos modificados
- Checar que os exemplos de state.json em phase-2 usam o novo path pattern

## Constraints
- Foco nas mudanças de isolamento de stories por run_id
- Não modificar a arquitetura geral do Forge
- Referências em docs históricos (FORGE-SCAFFOLD-PLAN.md etc.) NÃO devem ser alteradas
- brownfield.md scan e forge-scaffold.md placeholder devem permanecer sem {run_id}
