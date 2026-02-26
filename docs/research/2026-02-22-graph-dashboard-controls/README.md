# Graph Dashboard Interactive Controls — Research

**Date:** 2026-02-22
**Researcher:** Claude Opus 4.6 (Tech Search Pipeline)
**Epic:** CLI Graph Dashboard
**Status:** Complete

## TL;DR

vis-network tem API completa de fisica que mapeia diretamente para sliders estilo Obsidian. Multi-level neighborhood expansion e implementavel com BFS iterativo usando `getConnectedNodes()`. Nao precisa migrar de biblioteca — vis-network cobre todos os requisitos para nossa escala (712 entidades). O investimento deve focar em: (1) painel de controles de fisica com sliders, (2) sistema de expansao por profundidade com diferenciacao visual por opacidade.

## Research Files

| File | Content |
|------|---------|
| [00-query-original.md](./00-query-original.md) | Query original + contexto inferido |
| [01-deep-research-prompt.md](./01-deep-research-prompt.md) | 5 sub-queries decompostas |
| [02-research-report.md](./02-research-report.md) | Relatorio completo de pesquisa |
| [03-recommendations.md](./03-recommendations.md) | Recomendacoes e proximos passos |

## Key Findings

### Physics Controls
- vis-network `barnesHut` solver mapeia 1:1 com sliders do Obsidian
- 4 parametros principais: `centralGravity`, `gravitationalConstant`, `springConstant`, `springLength`
- Atualizacao em tempo real via `network.setOptions()` — sem rebuild necessario

### Multi-Level Expansion
- BFS iterativo com `getConnectedNodes()` — O(V+E) por expansao
- Diferenciacao visual: opacidade decrescente por nivel (1.0, 0.8, 0.6, 0.4)
- Padroes de referencia: Neo4j Bloom (expand button), Obsidian (depth slider), Gephi (ego network)

### Library Decision
- **Ficar com vis-network** — 10 stories de investimento, escala adequada
- Reconsiderar apenas se entidades > 5000 (migrar para sigma.js/WebGL)

## Suggested Stories

| Story | Priority | Scope |
|-------|----------|-------|
| GD-11: Physics Control Panel | P0 | 4 sliders + reset + pause |
| GD-12: Multi-Level Depth Expansion | P0 | BFS + depth selector + opacity |
| GD-13: Graph Metrics & Layout | P1 | Node sizing + layout switcher |
| GD-14: Export & Minimap | P2 | PNG export + minimap panel |
| GD-15: Clustering & Statistics | P2-P3 | Category clustering + stats |

## Sources

5 parallel Haiku workers, 12+ web sources including vis-network docs, Obsidian graph analysis, Cytoscape.js docs, Neo4j Bloom patterns, Sigma.js benchmarks.
