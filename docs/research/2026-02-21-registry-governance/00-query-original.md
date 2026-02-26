# Query Original

## Contexto

Entity registry governance, dependency resolution, and graph filtering para o AIOS framework.

O entity-registry.yaml possui 563 entidades em 10 categorias, populado por `populate-entity-registry.js`. O registry alimenta um dashboard vis-network. Apos implementar semantic extractors (NOG-15), foram descobertos problemas estruturais profundos.

## 5 Problemas Identificados

### P1: Diretorios Nao Escaneados
- `.aios-core/infrastructure/scripts/` (87 JS scripts) — NAO escaneado
- `.aios-core/product/checklists/` (16 MD files) — NAO escaneado
- `.aios-core/infrastructure/tools/` — NAO escaneado
- `.aios-core/product/data/` — NAO escaneado
- Causa 50%+ das dependencias "nao resolvidas"

### P2: Classificacao de Dependencias
- 750 deps nao resolvidas total
- 111x sentinel (`N/A`)
- 28x external tools (coderabbit, git)
- 23x natural language fragments
- 99x conceptual references (modulos planejados)
- 344x file references a scripts fora do scan config

### P3: Lifecycle de Entidades
- 67/563 entidades orfas (0 deps, 0 usedBy)
- Sem estados de lifecycle (active, deprecated, planned)
- Graph renderiza todas entidades igualmente

### P4: Governanca do Registry
- Tensao "escanear tudo" vs "subset curado"
- Sem validacao contra bloat
- Sem auto-deteccao de deprecated/experimental

### P5: Qualidade do Graph
- 563 nos renderizados sem filtro
- Sem filtragem interativa
- Sem subgraph views

## Inferred Context

```json
{
  "focus": "technical",
  "temporal": "current",
  "domain": ["JavaScript", "Node.js", "YAML", "vis-network", "D3", "monorepo-tools"],
  "skip_clarification": true
}
```
