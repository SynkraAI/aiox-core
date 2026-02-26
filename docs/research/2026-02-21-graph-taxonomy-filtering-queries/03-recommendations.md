# Recommendations & Next Steps

## Decision Matrix: What to Implement When

| Feature | Priority | Effort | Impact | Dependency |
|---------|----------|--------|--------|------------|
| **Expand taxonomy to 10+ categories** | P0 | Small | High | None — data layer change |
| **Color palette (Okabe-Ito extended)** | P0 | Small | High | Taxonomy expansion |
| **Node deduplication** | P0 | Done | High | Already fixed in html-formatter |
| **DataView filtering (category toggles)** | P1 | Medium | High | Taxonomy expansion |
| **Search/highlight input** | P1 | Medium | High | None |
| **Clustering by category** | P2 | Medium | Medium | Taxonomy expansion |
| **GraphQueryEngine (graphology)** | P2 | Large | Very High | None — standalone module |
| **Synapse integration** | P3 | Large | Very High | GraphQueryEngine |
| **Impact analysis queries** | P3 | Medium | High | GraphQueryEngine |
| **Context ranking for LLM** | P3 | Large | Very High | GraphQueryEngine + code-intel |

## Recommended Approach: 3 Phases

### Phase 1: Taxonomy & Colors (Stories GD-7 or enhancement to GD-5)

**What**: Expand CATEGORY_COLORS from 4 to 10+ categories. Update CodeIntelSource to emit proper categories for checklists, workflows, utils, data, tools, and script subtypes.

**Palette** (Okabe-Ito extended, colorblind-safe, dark theme):
```javascript
const CATEGORY_COLORS = {
  agents:          { color: '#66bb6a', shape: 'dot' },
  tasks:           { color: '#4fc3f7', shape: 'box' },
  templates:       { color: '#ffd54f', shape: 'diamond' },
  checklists:      { color: '#E69F00', shape: 'triangle' },
  workflows:       { color: '#CC79A7', shape: 'star' },
  'scripts/task':  { color: '#009E73', shape: 'box' },
  'scripts/engine':{ color: '#D55E00', shape: 'box' },
  'scripts/infra': { color: '#90a4ae', shape: 'box' },
  utils:           { color: '#56B4E9', shape: 'ellipse' },
  data:            { color: '#F0E442', shape: 'database' },
  tools:           { color: '#b39ddb', shape: 'hexagon' },
};
```

**Effort**: 2-4 hours
**Files**: `html-formatter.js`, `code-intel-source.js`, `entity-registry.yaml`

### Phase 2: Filtering & Search (New Story GD-8 or similar)

**What**: Add interactive filtering UI to HTML viewer:
- Category toggle checkboxes (bottom bar)
- Search input (top bar) with highlight + focus
- Fit/Reset buttons
- Node count per category in legend

**Key pattern**: `vis.DataView` with `filter` function + `nodesView.refresh()`

**Effort**: 4-6 hours
**Files**: `html-formatter.js` (HTML template expansion)

### Phase 3: Graph Query Engine (New Epic or Story)

**What**: Build `GraphQueryEngine` using `graphology` library:
- `getDependencies()`, `getDependents()`, `getImpactOf()`
- `findOrphans()`, `findHubs()`, `findCycles()`
- `getByCategory()`, `getByTag()`
- CLI: `aios graph --query "impact dev"`, `aios graph --query "deps task-a"`
- Synapse integration: context engine queries graph for smart context selection

**Effort**: 1-2 sprints (significant but high-impact)
**Files**: New module `graph-dashboard/query-engine.js`, CLI extensions

**npm dependency**: `graphology` + `graphology-traversal` + `graphology-shortest-path`

## Key Technical Decisions

### D1: graphology over graphlib

| Criteria | graphology | graphlib |
|----------|-----------|---------|
| Active maintenance | Yes (2024+) | Stale (2019) |
| Standard library | Extensive (traversal, path, community) | Basic |
| TypeScript | Yes | No |
| Size | 18KB | 12KB |
| **Verdict** | **Winner** | Deprecated |

### D2: DataView filtering over DOM manipulation

`vis.DataView` is the official vis-network pattern for filtering. It's non-destructive (original data preserved), performant (filter runs on refresh only), and integrates natively with the network renderer.

### D3: Color + Shape + Size for 10+ categories

Pure color alone cannot distinguish 10+ categories (research consensus: max 8). Using three visual channels (color, shape, optional size for hub nodes) makes all categories distinguishable even for colorblind users.

### D4: Script subcategorization by directory

Scripts are classified by their parent directory and usage context:
- `.aios-core/development/scripts/` → `scripts/task` (task execution)
- `.aios-core/core/*/` → `scripts/engine` (engine/core scripts)
- `.aios-core/infrastructure/` → `scripts/infra` (infrastructure)

This avoids manual tagging — the path determines the subtype.

## What NOT to Do

- **Don't add graphology to Phase 1** — taxonomy/colors don't need it
- **Don't build a full query language** — simple method API is sufficient for AIOS
- **Don't use Neo4j or any graph database** — in-memory graphology is fast enough for <5000 nodes
- **Don't implement WebSocket live-server** — meta-refresh is fine for MVP watch mode
- **Don't break the existing 4-category tests** — extend, don't replace (backward compatible)

## Next Steps

1. **@pm or @po**: Create stories for Phase 1 (taxonomy) and Phase 2 (filtering) in the epic-cli-graph-dashboard epic
2. **@dev**: Implement Phase 1 first (small, high-impact, unblocks Phase 2)
3. **@architect**: Design GraphQueryEngine API surface for Phase 3 before implementation
4. **@qa**: Update test suite to cover 10+ categories after Phase 1

---

*Research conducted: 2026-02-21*
*Pipeline: Tech Search (6 Haiku workers, 1 wave, 26 sources)*
*Researcher: Quinn (@qa) — advisory capacity*
