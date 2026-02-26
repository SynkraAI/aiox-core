# Deep Research Prompt

## Sub-Queries Decomposed

```json
{
  "main_topic": "Entity registry governance, dependency resolution, and graph filtering for code intelligence systems",
  "sub_queries": [
    "Nx project graph architecture dependency resolution filtering nodes 2025 2026",
    "Backstage software catalog entity lifecycle states deprecated experimental YAML metadata",
    "vis-network large graph filtering hide nodes interactive controls JavaScript 500+ nodes layout",
    "monorepo dependency classification taxonomy internal external phantom planned dependencies",
    "code intelligence dependency graph orphan detection stale node handling governance patterns",
    "YAML registry incremental enrichment metadata schema validation bloat prevention patterns"
  ],
  "search_strategy": "parallel"
}
```

## Worker Dispatch

5 parallel Haiku workers dispatched:
1. **Worker 1**: Nx project graph architecture (3 HIGH sources)
2. **Worker 2**: Backstage catalog lifecycle (2 HIGH sources)
3. **Worker 3**: vis-network filtering (3 HIGH sources)
4. **Worker 4**: Dependency classification taxonomy (3 HIGH sources)
5. **Worker 5**: Orphan detection + registry governance (6 HIGH/MEDIUM sources)

## Sources Collected

| Source | Credibility | Worker |
|--------|-------------|--------|
| nx.dev/docs/extending-nx/project-graph-plugins | HIGH | 1 |
| nx.dev/docs/features/explore-graph | HIGH | 1 |
| nx.dev/blog/nx-2026-roadmap | HIGH | 1 |
| backstage.io/docs/features/software-catalog/descriptor-format/ | HIGH | 2 |
| backstage.io/docs/features/software-catalog/life-of-an-entity/ | HIGH | 2 |
| visjs.github.io/vis-network/docs/ | HIGH | 3 |
| visjs.github.io/vis-network/examples/network/data/dynamicFiltering.html | HIGH | 3 |
| rushjs.io/pages/advanced/phantom_deps/ | HIGH | 4 |
| nx.dev/docs/concepts/decisions/dependency-management | HIGH | 4 |
| docs.datahub.com/docs/metadata-modeling/metadata-model | HIGH | 5 |
| github.com/23andMe/Yamale | HIGH | 5 |
| understandlegacycode.com/blog/safely-restructure-codebase-with-dependency-graphs/ | HIGH | 5 |
