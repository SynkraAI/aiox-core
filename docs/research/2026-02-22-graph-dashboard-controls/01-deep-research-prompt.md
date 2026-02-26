# Deep Research Prompt

## Decomposed Sub-Queries

Generated via extended thinking analysis of the original query.

### Sub-Query 1: vis-network Physics API Controls
> "vis-network physics API runtime configuration sliders barnesHut gravitationalConstant springLength springConstant damping centralGravity interactive controls"

**Angle**: Direct API mapping for our existing vis-network implementation.

### Sub-Query 2: Obsidian Graph View Implementation
> "Obsidian graph view implementation Pixi.js force sliders center force repel force link force link distance depth filter architecture"

**Angle**: Reverse-engineering Obsidian's UX patterns for graph controls.

### Sub-Query 3: Multi-Level Neighborhood Expansion Algorithms
> "graph visualization multi-level neighborhood expansion BFS depth limit vis-network getConnectedNodes cytoscape bfs progressive disclosure nth degree connections"

**Angle**: Algorithm and UX patterns for exploring graph neighborhoods.

### Sub-Query 4: Library Comparison (Cytoscape vs vis-network vs Sigma.js)
> "cytoscape.js vs vis-network vs sigma.js comparison performance features graph visualization 2025 2026 WebGL canvas"

**Angle**: Devil's advocate — should we stay with vis-network or migrate?

### Sub-Query 5: Graph Control Panel UI Patterns
> "graph visualization control panel UI patterns Neo4j Bloom sidebar minimap node sizing centrality layout algorithm switching export capabilities"

**Angle**: Expert-level UX patterns from production graph tools.

## Search Strategy

- **Parallel**: All 5 sub-queries dispatched simultaneously via Haiku workers
- **Max deep reads per worker**: 3
- **Tools**: WebSearch + WebFetch
- **Coverage target**: >= 80%
