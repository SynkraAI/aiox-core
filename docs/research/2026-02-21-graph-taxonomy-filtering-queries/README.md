# Research: Graph Taxonomy, Filtering & Query Capabilities

**Date:** 2026-02-21
**Pipeline:** Tech Search (6 Haiku workers, 1 wave)
**Coverage Score:** 90/100

## TL;DR

Research into three areas for the AIOS Graph Dashboard:

1. **Taxonomy**: Expand from 4 to 10+ entity categories with hierarchical subcategories and multi-dimensional tagging. Scripts need subcategorization (task/engine/infra).

2. **Graph UX**: Use `vis.DataView` for non-destructive filtering with category toggles and search. For 500+ nodes: disable smooth edges, increase BarnesHut theta, enable clustering by category.

3. **Query API**: Build `GraphQueryEngine` using `graphology` library for dependency traversal, impact analysis, and Synapse integration. Multi-strategy fusion (graph + semantic + keyword) for code intelligence context selection.

## Files

| File | Content |
|------|---------|
| [00-query-original.md](00-query-original.md) | Original question + context |
| [01-deep-research-prompt.md](01-deep-research-prompt.md) | Sub-queries + worker stats |
| [02-research-report.md](02-research-report.md) | Complete findings (6 sections) |
| [03-recommendations.md](03-recommendations.md) | Recommendations + 3-phase plan |

## Key Sources (26 total)

- [Semantic Code Graph (arxiv)](https://arxiv.org/html/2310.02128v2)
- [Okabe-Ito Palette](https://conceptviz.app/blog/okabe-ito-palette-hex-codes-complete-reference)
- [vis-network Dynamic Filtering](https://visjs.github.io/vis-network/examples/network/data/dynamicFiltering.html)
- [vis.js Physics Docs](https://visjs.github.io/vis-network/docs/network/physics.html)
- [graphology](https://graphology.github.io/)
- [Sourcegraph: AI Context Retrieval](https://sourcegraph.com/blog/lessons-from-building-ai-coding-assistants-context-retrieval-and-evaluation)
- [Kontext Engine](https://github.com/LuciferMornens/kontext-engine)
- [CodePrism: Graph-Based Analysis](https://rustic-ai.github.io/codeprism/blog/graph-based-code-analysis-engine/)

## Actionable Recommendations

| Phase | What | Effort | Priority |
|-------|------|--------|----------|
| 1 | Taxonomy expansion + Okabe-Ito palette | 2-4h | P0 |
| 2 | DataView filtering + search UI | 4-6h | P1 |
| 3 | GraphQueryEngine (graphology) + Synapse | 1-2 sprints | P2 |
