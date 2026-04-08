# Ping-Pong Session — Forge SDD Improvements

## Scope
- files:
  - skills/forge/plugins/context-hygiene.yaml
  - skills/forge/context-hygiene.md
  - skills/forge/workflows/stamp.md
  - skills/forge/plugins/stamp-inject.yaml
  - skills/forge/phases/phase-1-spec.md
  - skills/forge/SKILL.md
  - skills/forge/config.yaml
  - skills/forge/runner.md

## Goals
- Coerência entre novos plugins e o plugin schema existente (SCHEMA.md)
- Coerência entre novos workflows e os workflows existentes
- Referências cruzadas corretas (SKILL.md ↔ workflows ↔ phases ↔ plugins)
- Instruções claras e sem ambiguidade nos markdowns
- Sem contradições com regras existentes do Forge (Constitution, runner.md)
- Hooks corretos nos plugins YAML (eventos existentes, filtros válidos)
- Fluxos sem gaps (o que acontece em edge cases?)
- Texto pt-BR com acentuação completa (Artigo VII)

## Constraints
- São arquivos markdown e YAML — não tem código executável
- Os 4 arquivos novos + 4 arquivos modificados formam 3 melhorias SDD:
  1. Context Hygiene (plugin + companion md + config)
  2. Docs Research obrigatória (phase-1-spec.md)
  3. Stamp Command (workflow + plugin + SKILL.md)
- Foco: instruções pros agentes LLM, não código compilável
