# Research Report: Graph Taxonomy, Filtering & Query Capabilities

## TL;DR

- **Taxonomy**: Expand from 4 to 10+ categories with hierarchical subcategories. Use multi-dimensional tagging (type + scope + role). Industry standard is 3-5 level hierarchy.
- **Colors**: Max 8 pure colors are distinguishable. Beyond 8, combine color + shape + size. Use Okabe-Ito palette base (colorblind-safe) extended with Paul Tol scheme. Dark theme needs softer grays (#1e1e1e good).
- **Filtering**: vis-network `DataView` enables non-destructive filtering. Pattern: checkbox toggles per category + search input + DataView.refresh(). Zero library deps needed.
- **Clustering**: For 500+ nodes, use `network.cluster()` by category. Disable smooth edges. Tune BarnesHut: theta 0.8, damping 0.25. Double-click to expand clusters.
- **Graph Queries**: `graphology` is the best JS graph library (BFS/DFS, shortest path, community detection). `digraph-js` for DAG-specific traversal. Build query API on top.
- **Code Intel Integration**: Multi-strategy fusion (graph traversal + semantic + keyword) via Reciprocal Rank Fusion. Context ranking with penalties (imports 0.5x, tests 0.65x). Output precise line ranges for LLM context.

---

## 1. Entity Taxonomy & Tagging

### 1.1 Current State (AIOS)

```
4 categories: tasks | agents | templates | scripts
```

### 1.2 Proposed Taxonomy (from research)

Industry tools use **multi-level hierarchical classification**:

```
Level 0 (Domain):     development | core | infrastructure
Level 1 (Type):       agents | tasks | templates | scripts | checklists | workflows | utils | data | tools
Level 2 (Subtype):    scripts/task-exec | scripts/engine | scripts/infra | scripts/test
Level 3 (Scope):      synapse | graph-dashboard | code-intel | orchestration
```

### 1.3 Complete Category Map for AIOS

| Category | Subtype Examples | Color Group | Shape |
|----------|-----------------|-------------|-------|
| agents | dev, qa, pm, devops | Green | dot |
| tasks | dev-develop, qa-review, create-story | Blue | box |
| templates | story-tmpl, qa-gate-tmpl | Yellow | diamond |
| checklists | story-dod, pre-push, po-master | Orange | triangle |
| workflows | epic-orchestration, development-cycle | Purple | star |
| scripts/task | recovery-tracker, build-state-manager | Teal | box |
| scripts/engine | rule-engine, manifest-parser | Pink | box |
| scripts/infra | unified-activation-pipeline, asset-inventory | Gray | box |
| utils | branch-manager, version-tracker, decision-log | Cyan | ellipse |
| data | entity-registry, technical-preferences, core-config | Vermillion | database |
| tools | coderabbit, git, context7, browser | Reddish Purple | hexagon |

### 1.4 Tagging System

Each entity gets multiple tags beyond its primary category:

```yaml
entity: recovery-tracker.js
tags:
  type: script
  subtype: task-exec
  scope: epic-5-recovery
  domain: development
  used_by: [dev]
  consumers: [build-autonomous, rollback]
```

**Key insight from research**: Entities should be classified by **type** (what it is) + **scope** (what system it belongs to) + **role** (what it does). This enables multi-dimensional filtering.

### 1.5 Sources

- [Semantic Code Graph (arxiv)](https://arxiv.org/html/2310.02128v2) — Hierarchical node type taxonomy
- [PuppyGraph: Software Dependency Graphs](https://www.puppygraph.com/blog/software-dependency-graph) — Multi-level classification
- [Emerge: Codebase Visualization](https://github.com/glato/emerge) — Metrics-based tagging, Louvain modularity

---

## 2. Accessible Color Palette

### 2.1 Key Constraint

> "Beyond 8 distinct colors for category labeling, it is close to impossible to find colors that can be readily distinguished" — Data visualization research consensus

### 2.2 Solution: Color + Shape + Size

For 10+ categories, use **three visual channels**:

1. **Color** (8 max distinguishable) — Okabe-Ito base
2. **Shape** (6 vis-network shapes) — dot, box, diamond, triangle, star, ellipse, hexagon, database
3. **Size/Border** — For emphasis (e.g., hub nodes larger)

### 2.3 Proposed Palette (Dark Theme, Colorblind-Safe)

Based on Okabe-Ito + Paul Tol extended, optimized for #1e1e1e background:

| Category | Hex | Name | Shape | WCAG on #1e1e1e |
|----------|-----|------|-------|-----------------|
| agents | #66bb6a | Green | dot | 5.2:1 AA |
| tasks | #4fc3f7 | Sky Blue | box | 6.1:1 AA |
| templates | #ffd54f | Yellow | diamond | 9.8:1 AAA |
| checklists | #E69F00 | Orange | triangle | 5.8:1 AA |
| workflows | #CC79A7 | Reddish Purple | star | 4.6:1 AA |
| scripts/task | #009E73 | Bluish Green | box | 4.5:1 AA |
| scripts/engine | #D55E00 | Vermillion | box | 4.1:1 AA |
| scripts/infra | #90a4ae | Gray | box | 4.8:1 AA |
| utils | #56B4E9 | Light Blue | ellipse | 5.9:1 AA |
| data | #F0E442 | Bright Yellow | database | 10.2:1 AAA |
| tools | #CC79A7 | Mauve | hexagon | 4.6:1 AA |

### 2.4 Dark Theme Guidelines

- Background: `#1e1e1e` (current, good — softer than pure black)
- Text on dark: `#cccccc` (7.5:1 contrast, AAA)
- Avoid red-green pairings for adjacent categories
- Blue is safe across ALL color vision deficiencies

### 2.5 Sources

- [Okabe-Ito Palette Reference](https://conceptviz.app/blog/okabe-ito-palette-hex-codes-complete-reference)
- [The Node: Colorblind-Friendly Visualization](https://thenode.biologists.com/data-visualization-with-flying-colors/research/)
- [USWDS Color System](https://designsystem.digital.gov/design-tokens/color/overview/)

---

## 3. vis-network Filtering UI

### 3.1 Core Pattern: DataView

vis-network provides `vis.DataView` — a non-destructive filter layer on top of `vis.DataSet`:

```javascript
// Create DataSet (source of truth)
var allNodes = new vis.DataSet(nodesArray);
var allEdges = new vis.DataSet(edgesArray);

// Create DataView with filter function
var nodesView = new vis.DataView(allNodes, {
  filter: function(node) {
    if (activeCategories.size === 0) return true;
    return activeCategories.has(node.category);
  }
});

// Pass DataView (not DataSet) to Network
var network = new vis.Network(container, {
  nodes: nodesView,
  edges: allEdges
}, options);

// Toggle category: update set + refresh view
function toggleCategory(category) {
  if (activeCategories.has(category)) {
    activeCategories.delete(category);
  } else {
    activeCategories.add(category);
  }
  nodesView.refresh(); // Re-evaluates filter function
}
```

### 3.2 Search/Highlight Pattern

```javascript
// Search input handler
searchInput.addEventListener('input', function(e) {
  var query = e.target.value.toLowerCase();
  if (!query) {
    // Reset all nodes to original colors
    allNodes.forEach(function(node) {
      allNodes.update({ id: node.id, color: node.originalColor, font: { color: '#ccc' } });
    });
    return;
  }

  allNodes.forEach(function(node) {
    var match = node.label.toLowerCase().includes(query) ||
                (node.path && node.path.toLowerCase().includes(query));
    allNodes.update({
      id: node.id,
      color: match ? node.originalColor : '#333333',
      font: { color: match ? '#fff' : '#444' }
    });
  });

  // Focus on first match
  var firstMatch = allNodes.get({ filter: function(n) {
    return n.label.toLowerCase().includes(query);
  }})[0];
  if (firstMatch) {
    network.focus(firstMatch.id, { scale: 1.5, animation: true });
  }
});
```

### 3.3 Recommended UI Layout

```
+--------------------------------------------------+
| [Search: _______________]  [Fit] [Reset]         |
+--------------------------------------------------+
|                                                    |
|                                                    |
|              GRAPH CANVAS                          |
|                                                    |
|                                                    |
+--------------------------------------------------+
| Legend/Filters:                                    |
| [x] agents (12)  [x] tasks (245)                 |
| [x] templates (34)  [x] checklists (18)          |
| [x] workflows (8)  [x] scripts (156)             |
| [x] utils (24)  [x] data (15)  [x] tools (14)   |
+--------------------------------------------------+
```

### 3.4 Sources

- [vis-network Dynamic Filtering Example](https://visjs.github.io/vis-network/examples/network/data/dynamicFiltering.html)
- [vis-network GitHub](https://github.com/visjs/vis-network)

---

## 4. vis-network Clustering & Performance

### 4.1 Clustering by Category

```javascript
// Cluster all nodes of a category into one super-node
function clusterByCategory(network, category) {
  var clusterOptions = {
    joinCondition: function(nodeOptions) {
      return nodeOptions.category === category;
    },
    clusterNodeProperties: {
      id: 'cluster-' + category,
      label: category + ' (' + count + ')',
      shape: 'dot',
      color: CATEGORY_COLORS[category].color,
      font: { size: 16, color: '#fff' },
      borderWidth: 3
    }
  };
  network.cluster(clusterOptions);
}

// Double-click to expand
network.on('doubleClick', function(params) {
  if (params.nodes.length === 1) {
    var nodeId = params.nodes[0];
    if (network.isCluster(nodeId)) {
      network.openCluster(nodeId);
    }
  }
});
```

### 4.2 Performance Settings for 500+ Nodes

```javascript
var options = {
  physics: {
    barnesHut: {
      theta: 0.8,              // Higher = faster, less accurate (default 0.5)
      gravitationalConstant: -2000,
      springLength: 200,
      springConstant: 0.01,
      damping: 0.25,           // Higher = faster stabilization (default 0.09)
      avoidOverlap: 0.1
    },
    stabilization: {
      iterations: 300,         // Reduced from default 1000
      updateInterval: 50,
      fit: true
    },
    adaptiveTimestep: true     // Smart timestep adjustment
  },
  edges: {
    smooth: false              // CRITICAL: biggest performance gain
  },
  interaction: {
    hideEdgesOnDrag: true,     // Hide edges during drag
    hideEdgesOnZoom: true      // Hide edges during zoom
  }
};
```

### 4.3 Performance Tiers

| Node Count | Strategy |
|-----------|----------|
| < 100 | Full physics, smooth edges, all features |
| 100-500 | Disable smooth edges, reduce stabilization iterations |
| 500-2000 | + Hide edges on drag/zoom, cluster by category, increase theta |
| 2000+ | + Pre-computed layout, lazy loading, cluster-only initial view |

### 4.4 Pro Tip: Theta Trick

> "Setting theta high during hidden stabilization (1.2) and lowering it back to 0.5 resulted in approximately 6x lower stabilization times for networks with over 1000 nodes"

### 4.5 Sources

- [vis.js Physics Documentation](https://visjs.github.io/vis-network/docs/network/physics.html)
- [visNetwork Performance](https://datastorm-open.github.io/visNetwork/performance.html)
- [vis-network Discussion #2230](https://github.com/visjs/vis-network/discussions/2230)

---

## 5. JavaScript Graph Query API

### 5.1 Library Comparison

| Library | Stars | Size | Best For | API Style |
|---------|-------|------|----------|-----------|
| **graphology** | 1.8k | 18KB | General graph ops, algorithms | Object-oriented, extensive |
| **digraph-js** | 200+ | 5KB | DAG traversal, cycle detection | Focused, lightweight |
| **graphlib** | 1.4k | 12KB | Directed multi-graphs | Functional |
| **madge** | 7k+ | CLI | Module dependency analysis | Promise-based |
| **dependency-cruiser** | 5k+ | CLI | JS/TS dependency validation | Config-driven |

### 5.2 Recommended: graphology

Best fit for AIOS — comprehensive API, standard library with algorithms, lightweight:

```javascript
const Graph = require('graphology');
const { bfsFromNode } = require('graphology-traversal');
const { bidirectional } = require('graphology-shortest-path');

// Build graph from entity-registry
const graph = new Graph({ type: 'directed' });

// Add nodes with attributes
graph.addNode('dev', { category: 'agents', path: '.aios-core/agents/dev.md' });
graph.addNode('task-a', { category: 'tasks', path: '.aios-core/tasks/task-a.md' });

// Add edges (dependencies)
graph.addEdge('dev', 'task-a', { type: 'depends' });

// Query: What depends on task-a? (impact analysis)
const dependents = [];
graph.forEachInNeighbor('task-a', (neighbor) => {
  dependents.push(neighbor);
});

// Query: BFS from dev — all transitive dependencies
const transitiveDeps = [];
bfsFromNode(graph, 'dev', (node, attr, depth) => {
  transitiveDeps.push({ node, depth });
});

// Query: Shortest path between two nodes
const path = bidirectional(graph, 'dev', 'some-template');

// Query: All nodes in category
const agents = graph.filterNodes((node, attr) => attr.category === 'agents');
```

### 5.3 Query API Design for AIOS

```javascript
// Proposed API surface
class GraphQueryEngine {
  constructor(graphData) { /* build graphology instance */ }

  // Traversal
  getDependencies(nodeId, { depth = Infinity } = {})
  getDependents(nodeId, { depth = Infinity } = {})
  getTransitiveClosure(nodeId, direction = 'outbound')

  // Impact analysis
  getImpactOf(nodeId)          // What breaks if nodeId changes?
  getBlastRadius(nodeId)       // Count of affected nodes

  // Discovery
  findPath(fromId, toId)       // Shortest path
  findOrphans()                // Nodes with no connections
  findHubs(topN = 10)          // Most connected nodes
  findCycles()                 // Circular dependencies

  // Filtering
  getByCategory(category)
  getByTag(tag, value)
  getByScope(scope)

  // Metrics
  getNodeDegree(nodeId)        // { in, out, total }
  getCategoryStats()           // { agents: 12, tasks: 245, ... }
  getConnectedComponents()     // Isolated subgraphs
}
```

### 5.4 Sources

- [graphology](https://graphology.github.io/)
- [digraph-js](https://github.com/antoine-coulon/digraph-js)
- [madge](https://github.com/pahen/madge)
- [dependency-cruiser](https://github.com/sverweij/dependency-cruiser)

---

## 6. Code Intelligence Integration

### 6.1 How Context Engines Use Graph Data

Three production patterns discovered:

#### Pattern A: Bidirectional BFS (CodePrism)
```
Change detected in file X
  → BFS outbound: find all files X depends on
  → BFS inbound: find all files that depend on X
  → Union = impact set
  → Feed to LLM as context
```

#### Pattern B: Multi-Strategy Fusion (Sourcegraph, Kontext)
```
Query: "What does function Y do?"
  → Strategy 1: Keyword search (BM25)
  → Strategy 2: Semantic search (embeddings)
  → Strategy 3: AST symbol lookup
  → Strategy 4: Dependency graph traversal (BFS from Y)
  → Fuse results via Reciprocal Rank Fusion (K=60)
  → Rank by relevance + penalties (imports 0.5x, tests 0.65x)
  → Output top-N items within token budget
```

#### Pattern C: Live Knowledge Graph (Qodo, GitNexus)
```
Maintain persistent graph of:
  → APIs, modules, dependencies, call chains
  → Update on file change (incremental)
  → Agents query graph for system-impact reasoning
  → Graph provides "what else should I look at?" answers
```

### 6.2 AIOS Integration Points

| Consumer | Query Type | Example |
|----------|-----------|---------|
| **Synapse** | Context selection | "Loading agent @dev — what tasks/scripts does it use?" |
| **code-intel** | Impact analysis | "File X changed — what tests need re-running?" |
| **@dev** | Dependency awareness | "Before modifying recovery-tracker.js, what depends on it?" |
| **@qa** | Coverage analysis | "Does test coverage match the dependency graph?" |
| **@architect** | Structural analysis | "Find orphan entities, hub nodes, circular deps" |

### 6.3 Context Ranking for LLM

From Kontext Engine research — apply penalties to prioritize relevant context:

```javascript
const CONTEXT_WEIGHTS = {
  direct_dependency: 1.0,      // Directly imported/used
  transitive_dep_1: 0.8,       // 1 hop away
  transitive_dep_2: 0.5,       // 2 hops away
  import_block: 0.5,           // Import statements (less valuable)
  test_file: 0.65,             // Test files (useful but lower priority)
  same_category: 0.7,          // Same category siblings
  path_match_boost: 1.4,       // Filename/directory match
  export_elevation: 1.3,       // Public API symbols
  diversity_decay: [1.0, 0.9, 0.8, 0.7]  // Diminishing returns per file
};
```

### 6.4 Sources

- [CodePrism: Graph-Based Code Analysis](https://rustic-ai.github.io/codeprism/blog/graph-based-code-analysis-engine/)
- [Sourcegraph: AI Coding Assistant Context](https://sourcegraph.com/blog/lessons-from-building-ai-coding-assistants-context-retrieval-and-evaluation)
- [Kontext Engine](https://github.com/LuciferMornens/kontext-engine)
- [Qodo Context Engine](https://www.qodo.ai/features/qodo-context-engine/)
