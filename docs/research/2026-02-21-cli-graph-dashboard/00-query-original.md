# Query Original

## User Query
"para criar o dashboard cli para ver os graphos dinamicos no cli"

## Inferred Context
- **Focus:** Technical — CLI dashboard for graph visualization
- **Domain:** CLI TUI, graph visualization, terminal rendering, dependency graphs, code intelligence
- **Temporal:** Recent (2025-2026)
- **Project Context:** AIOS Code Intelligence epic (NOGIC) — 275 tests passing, 8 stories done, code-intel module com 8 capabilities primitivas + 5 compostas. Dados existem mas nao ha visualizacao.

## What Already Exists
```
.aios-core/core/code-intel/
├── code-intel-client.js    # 8 capabilities (findReferences, analyzeDependencies, etc.)
├── code-intel-enricher.js  # 5 compostas (assessImpact, detectDuplicates, etc.)
└── helpers/                # 6 helpers por agente (dev, qa, planning, story, devops, creation)
```

## What's Missing
- Nenhuma visualizacao de grafo no terminal
- Nenhum dashboard CLI para inspecionar dependency graph, blast radius, entity relationships
- Dados fluem internamente para agentes mas nao sao visiveis ao usuario
