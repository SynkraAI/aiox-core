# Research Report: Graph Dashboard Interactive Controls

## TL;DR

vis-network has a complete physics API that maps directly to Obsidian-style sliders. Multi-level neighborhood expansion is implementable with iterative BFS using `getConnectedNodes()`. No library migration needed — vis-network covers all our requirements. The investment should focus on a control panel UI (HTML sliders + event listeners) and a depth-based expansion system with opacity differentiation.

---

## 1. Physics Controls (Obsidian-Style Sliders)

### 1.1 How Obsidian Does It

Obsidian's graph view (Electron app) provides 4 force sliders:

| Slider | Obsidian Name | Physics Concept |
|--------|--------------|-----------------|
| Center force | Center force | How strongly nodes pull toward center |
| Repel force | Repel force | How strongly nodes push apart (Coulomb's Law) |
| Link force | Link force | How strongly connected nodes attract (Hooke's Law) |
| Link distance | Link distance | Ideal rest length between connected nodes |

Obsidian uses **Pixi.js** (WebGL renderer) with a custom force simulation, NOT D3-force or vis-network. The UI is a simple sidebar with range sliders.

### 1.2 vis-network Physics API (Direct Mapping)

vis-network provides runtime physics configuration via `network.setOptions()`:

```javascript
network.setOptions({
  physics: {
    enabled: true,
    solver: 'barnesHut',  // Default, best for 500-1000 nodes
    barnesHut: {
      gravitationalConstant: -2000,  // Center force (negative = attract)
      centralGravity: 0.3,           // Center force strength
      springLength: 95,              // Link distance (rest length)
      springConstant: 0.04,          // Link force (spring stiffness)
      damping: 0.09,                 // Friction/settling speed
      avoidOverlap: 0               // Node overlap prevention
    },
    stabilization: {
      enabled: true,
      iterations: 1000,
      updateInterval: 25
    },
    timestep: 0.5,
    adaptiveTimestep: true
  }
});
```

### 1.3 Obsidian → vis-network Parameter Mapping

| Obsidian Slider | vis-network Parameter | Range | Default |
|----------------|----------------------|-------|---------|
| Center force | `barnesHut.centralGravity` | 0.0 — 1.0 | 0.3 |
| Repel force | `barnesHut.gravitationalConstant` | -30000 — 0 | -2000 |
| Link force | `barnesHut.springConstant` | 0.0 — 1.0 | 0.04 |
| Link distance | `barnesHut.springLength` | 0 — 500 | 95 |

**Additional useful parameters:**
| Extra Control | Parameter | Range | Default |
|--------------|-----------|-------|---------|
| Damping | `barnesHut.damping` | 0.01 — 1.0 | 0.09 |
| Overlap prevention | `barnesHut.avoidOverlap` | 0.0 — 1.0 | 0 |
| Simulation speed | `physics.timestep` | 0.01 — 1.0 | 0.5 |
| Physics on/off | `physics.enabled` | boolean | true |

### 1.4 Available Solvers

| Solver | Best For | Performance |
|--------|----------|-------------|
| `barnesHut` | General (our case, 712 nodes) | O(n log n) |
| `forceAtlas2Based` | Large graphs, community detection | O(n log n) |
| `repulsion` | Small graphs (<200 nodes) | O(n^2) |
| `hierarchicalRepulsion` | Tree structures | O(n^2) |

### 1.5 Implementation Pattern

```javascript
// Slider HTML
const sliders = [
  { id: 'centerForce', label: 'Center Force', min: 0, max: 1, step: 0.05, default: 0.3 },
  { id: 'repelForce', label: 'Repel Force', min: -30000, max: 0, step: 500, default: -2000 },
  { id: 'linkForce', label: 'Link Force', min: 0, max: 1, step: 0.01, default: 0.04 },
  { id: 'linkDistance', label: 'Link Distance', min: 10, max: 500, step: 5, default: 95 },
];

// Event handler (debounced for performance)
function updatePhysics(paramName, value) {
  const opts = { physics: { barnesHut: {} } };
  switch(paramName) {
    case 'centerForce': opts.physics.barnesHut.centralGravity = value; break;
    case 'repelForce': opts.physics.barnesHut.gravitationalConstant = value; break;
    case 'linkForce': opts.physics.barnesHut.springConstant = value; break;
    case 'linkDistance': opts.physics.barnesHut.springLength = value; break;
  }
  network.setOptions(opts);
}
```

### 1.6 Performance Considerations

- **712 nodes**: barnesHut handles this well (tested up to ~5000 nodes)
- **Slider updates**: Debounce at 50-100ms to avoid excessive redraws
- **stabilization**: Disable `stabilization.enabled` for live slider interaction
- After slider change, physics engine automatically re-simulates

---

## 2. Multi-Level Neighborhood Expansion

### 2.1 Current State

Our dashboard has focus mode: double-click a node → show direct neighbors (1st degree). We want to extend this to Nth degree.

### 2.2 Algorithm: Iterative BFS with Depth Limit

```javascript
function getNeighborsAtDepth(network, nodeId, maxDepth) {
  const visited = new Set([nodeId]);
  const levels = new Map(); // nodeId → depth
  levels.set(nodeId, 0);
  let currentLevel = [nodeId];

  for (let depth = 1; depth <= maxDepth; depth++) {
    const nextLevel = [];
    for (const current of currentLevel) {
      const neighbors = network.getConnectedNodes(current);
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          levels.set(neighbor, depth);
          nextLevel.push(neighbor);
        }
      }
    }
    currentLevel = nextLevel;
  }

  return { visited, levels };
}
```

### 2.3 Visual Differentiation by Depth

| Depth | Opacity | Border | Size Modifier |
|-------|---------|--------|---------------|
| 0 (selected) | 1.0 | gold strong | 1.2x |
| 1st degree | 1.0 | gold | 1.0x |
| 2nd degree | 0.7 | subtle | 0.9x |
| 3rd degree | 0.4 | subtle | 0.8x |
| Hidden | 0.1 | none | 0.7x |

### 2.4 Reference Implementations

**Obsidian**: Has a "depth" slider (1-5) that filters nodes by minimum connection depth from any node in the vault. Different from per-node expansion but same UX concept.

**Neo4j Bloom**: "Expand" button on selected node shows 1st degree. Can click again for 2nd degree. Progressive disclosure pattern.

**Gephi**: "Ego Network" filter — select node, set depth, shows subgraph. Coloring by "Modularity" for community detection.

**Cytoscape.js**: Built-in BFS algorithm:
```javascript
const bfs = cy.elements().bfs({
  roots: '#selectedNode',
  visit: function(v, e, u, i, depth) {
    v.data('depth', depth);  // Annotate each node with its depth
  },
  directed: false
});
```

### 2.5 UX Pattern: Depth Selector

```
[Focus Node: entity-registry]
Depth: [1] [2] [3] [All]  ← Toggle buttons
Nodes shown: 12 / 712
```

- Clicking a depth level triggers BFS and updates node visibility/opacity
- "All" removes depth filter and shows entire graph
- Animated transition: nodes fade in/out with CSS transitions
- Edge count shown for each depth level

### 2.6 Edge Handling

Edges should be visible only when BOTH connected nodes are visible:
```javascript
function updateEdgeVisibility(edges, visibleNodes) {
  edges.forEach(edge => {
    const fromVisible = visibleNodes.has(edge.from);
    const toVisible = visibleNodes.has(edge.to);
    edge.hidden = !(fromVisible && toVisible);
  });
}
```

---

## 3. Advanced Graph Controls

### 3.1 Node Sizing by Metric

Available metrics (in order of usefulness for our dashboard):

| Metric | What It Shows | Complexity | Relevance |
|--------|--------------|------------|-----------|
| **Degree centrality** | Number of connections | O(1) per node | HIGH — shows most connected entities |
| **In/Out degree** | Directional connections | O(1) per node | HIGH — shows dependencies vs dependents |
| **Betweenness centrality** | Bridge nodes | O(V*E) | MEDIUM — computationally expensive for 712 nodes |
| **PageRank** | Importance propagation | O(V+E) per iteration | LOW — overkill for our use case |
| **Clustering coefficient** | How clustered neighbors are | O(V*k^2) | LOW — less useful for dependency graphs |

**Implementation for degree centrality:**
```javascript
function sizeByDegree(nodes, edges) {
  const degree = {};
  edges.forEach(e => {
    degree[e.from] = (degree[e.from] || 0) + 1;
    degree[e.to] = (degree[e.to] || 0) + 1;
  });
  const maxDeg = Math.max(...Object.values(degree));
  nodes.forEach(n => {
    const d = degree[n.id] || 0;
    n.size = 10 + (d / maxDeg) * 30; // Scale 10-40
  });
}
```

### 3.2 Layout Algorithm Switching

vis-network supports multiple layouts:

| Layout | vis-network Config | Best For |
|--------|-------------------|----------|
| **Force-directed** | `physics: { solver: 'barnesHut' }` | General (default) |
| **Hierarchical** | `layout: { hierarchical: { direction: 'UD' } }` | Dependency trees |
| **Circular** | Custom positioning with `Math.cos/sin` | Overview, small graphs |
| **Random** | `layout: { randomSeed: N }` | Fresh start |

**Hierarchical is particularly useful** for our dependency graph:
```javascript
network.setOptions({
  layout: {
    hierarchical: {
      direction: 'UD',          // Up-Down
      sortMethod: 'directed',   // Follow dependency direction
      levelSeparation: 150,
      nodeSpacing: 100,
      treeSpacing: 200
    }
  }
});
```

### 3.3 Minimap / Overview Panel

Two approaches for vis-network:

**Approach 1: Second canvas (simple)**
```javascript
// Create a second, smaller vis-network with same data
const minimap = new vis.Network(minimapContainer, data, {
  interaction: { dragNodes: false, zoomView: false },
  physics: { enabled: false },
  nodes: { size: 2 },
  edges: { width: 0.5 }
});
// Sync viewport rectangle
network.on('zoom', () => updateMinimapViewport());
network.on('dragEnd', () => updateMinimapViewport());
```

**Approach 2: Canvas thumbnail (performant)**
- Render graph to offscreen canvas at low resolution
- Draw viewport rectangle overlay
- Click on minimap to pan

### 3.4 Export Capabilities

| Format | Method | Use Case |
|--------|--------|----------|
| PNG | `network.canvas.toDataURL('image/png')` | Screenshots, reports |
| SVG | Custom rendering from node/edge data | Print quality |
| JSON | Serialize `nodes.get()` + `edges.get()` | Data backup |
| HTML | Already have — `html-formatter.js` output | Sharing |

### 3.5 Clustering / Community Detection

vis-network has built-in clustering:
```javascript
// Cluster by category (we already have this data)
const categories = [...new Set(nodes.map(n => n.category))];
categories.forEach(cat => {
  network.cluster({
    joinCondition: (nodeOptions) => nodeOptions.category === cat,
    clusterNodeProperties: {
      label: `${cat} (${count})`,
      shape: 'dot',
      size: 25
    }
  });
});
```

### 3.6 Additional Controls from Reference Projects

From Neo4j Bloom:
- **Search with natural language** (stretch goal)
- **Scene management** — save/load different graph views
- **Perspective switching** — different property views of same graph

From Gephi:
- **Statistics panel** — graph metrics (density, diameter, modularity)
- **Timeline** — filter nodes by temporal attribute
- **Data laboratory** — spreadsheet view of nodes/edges

From Nx:
- **Affected** — show what a change affects (relevant for our dependency graph)
- **Grouping** — group by directory/category/lifecycle

---

## 4. Library Comparison: Should We Migrate?

### 4.1 Comparison Matrix

| Feature | vis-network | Cytoscape.js | Sigma.js |
|---------|-------------|-------------|----------|
| **Downloads/month** | 438K | 3.29M | 86K |
| **Renderer** | Canvas | Canvas/WebGL | WebGL |
| **Performance (1K nodes)** | Good | Good | Excellent |
| **Performance (10K nodes)** | Slow | Moderate | Good |
| **Built-in layouts** | 4 | 70+ | 5 |
| **BFS/graph algorithms** | Manual | Built-in | Manual |
| **Clustering** | Built-in | Extension | Extension |
| **CSS-like selectors** | No | Yes | No |
| **TypeScript** | Types available | Full TS | Full TS |
| **Learning curve** | Low | Medium | Medium |
| **Our current investment** | 10 stories (GD-1 to GD-10) | 0 | 0 |

### 4.2 Recommendation: Stay with vis-network

**Reasons:**
1. **Sunk cost is real**: 10 stories of implementation, 591 lines of formatter, 576 lines of tests
2. **vis-network covers our needs**: Physics API, clustering, hierarchical layout — all available
3. **Our scale (712 nodes) is within vis-network's sweet spot**: Performance issues start at ~5000+
4. **Migration cost**: Would require rewriting html-formatter.js entirely, all tests, and all 10 stories of work
5. **Cytoscape.js advantages (70+ layouts, BFS) can be replicated** with small custom code in vis-network

**When to reconsider:**
- If entity count exceeds 5000 nodes → consider sigma.js for WebGL rendering
- If we need graph algorithms (shortest path, PageRank, community detection) → consider cytoscape.js
- For now, manual BFS is trivial to implement (see Section 2.2)

---

## 5. Performance Considerations for 500-1000 Nodes

### 5.1 Benchmarks from Research

| Library | 500 nodes | 1000 nodes | 5000 nodes |
|---------|-----------|------------|------------|
| vis-network | <1s init, smooth | 1-2s init, smooth | 5-10s init, sluggish |
| Cytoscape.js | <1s | <1s | 2-3s |
| Sigma.js (WebGL) | <0.5s | <0.5s | <1s |

### 5.2 Optimization Techniques for vis-network

1. **Disable physics after stabilization**: `network.once('stabilized', () => network.setOptions({physics: false}))`
2. **Use `improvedLayout: false`** for faster initial layout
3. **Reduce `stabilization.iterations`** from 1000 to 500
4. **Use `adaptiveTimestep: true`** (already default)
5. **Batch DataSet updates**: `nodes.update([...changes])` not individual updates
6. **Hide labels at low zoom**: `nodes: { font: { size: 14, vadjust: 0, face: 'monospace' }, scaling: { label: { enabled: true, min: 8, max: 20, drawThreshold: 8 } } }`
7. **Web Worker for BFS**: If depth > 3 with 700+ nodes, offload to worker

---

## 6. Summary of Key Code Patterns

### 6.1 Physics Control Panel (Complete Pattern)

```html
<div id="physics-controls" style="padding: 12px;">
  <h3 style="margin: 0 0 8px">Physics</h3>
  <label>Center Force: <span id="cf-val">0.3</span></label>
  <input type="range" id="centerForce" min="0" max="1" step="0.05" value="0.3">

  <label>Repel Force: <span id="rf-val">-2000</span></label>
  <input type="range" id="repelForce" min="-30000" max="0" step="500" value="-2000">

  <label>Link Force: <span id="lf-val">0.04</span></label>
  <input type="range" id="linkForce" min="0" max="1" step="0.01" value="0.04">

  <label>Link Distance: <span id="ld-val">95</span></label>
  <input type="range" id="linkDistance" min="10" max="500" step="5" value="95">

  <button id="resetPhysics">Reset</button>
  <button id="togglePhysics">Pause Physics</button>
</div>
```

### 6.2 Depth Expansion (Complete Pattern)

```javascript
function expandToDepth(network, nodeId, maxDepth, allNodes, allEdges) {
  const { visited, levels } = getNeighborsAtDepth(network, nodeId, maxDepth);

  allNodes.forEach(node => {
    if (visited.has(node.id)) {
      const depth = levels.get(node.id);
      node.opacity = 1.0 - (depth * 0.2);  // 1.0, 0.8, 0.6, 0.4
      node.hidden = false;
    } else {
      node.opacity = 0.1;
      node.hidden = true; // or keep visible but dimmed
    }
  });

  allEdges.forEach(edge => {
    edge.hidden = !(visited.has(edge.from) && visited.has(edge.to));
  });
}
```

### 6.3 Layout Switcher (Complete Pattern)

```javascript
const layouts = {
  'force': { physics: { enabled: true, solver: 'barnesHut' }, layout: { hierarchical: { enabled: false } } },
  'hierarchical': { physics: { enabled: false }, layout: { hierarchical: { enabled: true, direction: 'UD', sortMethod: 'directed' } } },
  'circular': null,  // Custom positioning
};

function switchLayout(name) {
  if (name === 'circular') {
    const nodes = network.body.data.nodes.get();
    const n = nodes.length;
    nodes.forEach((node, i) => {
      const angle = (2 * Math.PI * i) / n;
      node.x = 500 * Math.cos(angle);
      node.y = 500 * Math.sin(angle);
    });
    network.body.data.nodes.update(nodes);
    network.setOptions({ physics: { enabled: false } });
  } else {
    network.setOptions(layouts[name]);
  }
}
```
