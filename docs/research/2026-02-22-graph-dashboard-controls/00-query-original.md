# Original Query

## User Request

> Precisamos fazer um tech-search para continuar o desenvolvimento incremental desse dashboard e entender como o Obsidian por exemplo tem uma barra para afastar ou aproximar um node do outro. E tambem controle de forca das ligacoes. Pesquisar papers, projetos que usam sistemas parecidos com o nosso e tenha todo o tipo de controle, filtro e etc. E tambem poder a partir de um node visualizar todo o primeiro nivel vinculado a ele mas poder trocar para ver ate segundo nivel, terceiro nivel e assim por diante.

## Inferred Context

```json
{
  "focus": "technical",
  "temporal": "recent",
  "domain": ["vis-network", "D3", "JavaScript", "graph-visualization"],
  "skip_clarification": true
}
```

## Current System Context

- **Dashboard**: CLI Graph Dashboard (Epic CLI Graph Dashboard)
- **Technology**: vis-network, pure HTML/JS, no framework
- **Scale**: 712 entities from AIOS entity registry
- **Current features**: Category filters, lifecycle filters, search, focus mode (double-click = direct neighbors)
- **Completed stories**: GD-1 through GD-10

## Research Objectives

1. **Physics Controls (Obsidian-style)**: Sliders for center force, repel force, link force, link distance
2. **Multi-Level Neighborhood Expansion**: Toggle 1st/2nd/3rd/nth degree connections from a selected node
3. **Advanced Graph Controls**: Node sizing by centrality, layout switching, minimap, export, clustering
4. **Reference Projects**: Obsidian, Neo4j Bloom, Gephi, Cytoscape.js, Sigma.js, Nx
