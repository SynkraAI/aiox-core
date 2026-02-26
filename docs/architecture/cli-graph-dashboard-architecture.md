# CLI Graph Dashboard — Architecture Document

> **PRD:** `docs/prd-cli-graph-dashboard.md`
> **Research:** `docs/research/2026-02-21-cli-graph-dashboard/`
> **Author:** Aria (@architect)
> **Date:** 2026-02-21

---

## 1. System Overview

O CLI Graph Dashboard é um módulo de visualização que consome dados existentes do `code-intel` module e do `entity-registry` para renderizar grafos, métricas e status no terminal. Opera em dois modos: **ASCII output** (pipe-friendly, zero TUI deps) e **interactive dashboard** (blessed-contrib, fullscreen TUI).

### 1.1 Architecture Diagram

```
                          CLI Entrypoint
                          bin/aios-graph.js
                               │
                    ┌──────────┼──────────┐
                    │          │          │
               --deps     --stats    --interactive
               --blast    --format   --watch
                    │          │          │
                    ▼          ▼          ▼
              ┌─────────────────────────────────┐
              │      Command Router             │
              │  .aios-core/core/graph-dashboard │
              │         /cli.js                  │
              └──────────┬──────────────────────┘
                         │
              ┌──────────┼──────────┐
              │          │          │
              ▼          ▼          ▼
        ┌──────────┐ ┌────────┐ ┌───────────┐
        │ Renderers│ │Formats │ │ Dashboard │
        │ (ASCII)  │ │(export)│ │ (blessed) │
        └────┬─────┘ └───┬────┘ └─────┬─────┘
             │           │             │
             └─────┬─────┘─────────────┘
                   │
              ┌────┴────┐
              │  Data   │
              │ Sources │
              └────┬────┘
                   │
         ┌────────┼────────┐
         │        │        │
         ▼        ▼        ▼
   ┌──────────┐ ┌───────┐ ┌──────────┐
   │code-intel│ │entity │ │ client   │
   │ client   │ │registry│ │ metrics  │
   │analyzeDep│ │.yaml  │ │getMetrics│
   │assessImp │ │       │ │latencyLog│
   └──────────┘ └───────┘ └──────────┘
```

### 1.2 Design Principles

1. **Consumer-only** — Não modifica dados, apenas lê e renderiza
2. **Progressive Enhancement** — ASCII funciona sempre; blessed-contrib é add-on
3. **Graceful Degradation** — Cada data source pode falhar independentemente
4. **Pipe-friendly** — ASCII output funciona com `| grep`, `> file`, `| jq`
5. **Zero Side Effects** — Nenhuma escrita em disco, nenhuma mutação de estado

---

## 2. Module Structure

```
.aios-core/core/graph-dashboard/
├── index.js                    # Public API (getGraphData, renderTree, etc.)
├── cli.js                      # Command router (parseArgs → handler)
├── data-sources/
│   ├── code-intel-source.js    # Adapter: code-intel → normalized graph data
│   ├── registry-source.js      # Adapter: entity-registry.yaml → stats/tree data
│   └── metrics-source.js       # Adapter: client.getMetrics() → chart data
├── renderers/
│   ├── tree-renderer.js        # ASCII dependency tree (box-drawing chars)
│   ├── stats-renderer.js       # ASCII table + sparklines
│   ├── status-renderer.js      # Provider status (ACTIVE/OFFLINE + CB state)
│   └── blast-renderer.js       # Blast radius ASCII display
├── formatters/
│   ├── json-formatter.js       # --format=json
│   ├── dot-formatter.js        # --format=dot (Graphviz)
│   └── mermaid-formatter.js    # --format=mermaid
└── dashboard/                  # Epic 2+ (blessed-contrib)
    ├── screen.js               # Screen setup + grid layout
    ├── widgets/
    │   ├── dependency-tree.js   # Tree widget ← code-intel-source
    │   ├── blast-radius.js      # Gauge widget ← code-intel-source
    │   ├── cache-metrics.js     # Sparkline ← metrics-source
    │   ├── latency-chart.js     # Line chart ← metrics-source
    │   ├── entity-stats.js      # Table ← registry-source
    │   └── provider-status.js   # Status ← metrics-source
    └── refresh.js               # Watch mode (interval + diff-based update)

bin/aios-graph.js               # CLI entrypoint (shimn → cli.js)
```

### 2.1 bin/aios-graph.js — CLI Entrypoint

```javascript
#!/usr/bin/env node
'use strict';

const { run } = require('../.aios-core/core/graph-dashboard/cli');
run(process.argv.slice(2)).catch(err => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
```

Registrar em `package.json`:

```json
{
  "bin": {
    "aios-graph": "bin/aios-graph.js"
  }
}
```

E adicionar como sub-comando de `aios`:

```
npx aios-core graph [options]    →  bin/aios-graph.js
```

---

## 3. Data Sources Layer

### 3.1 Interface Comum

Todos os data sources implementam a mesma interface para uniformidade:

```javascript
/**
 * @typedef {Object} DataSourceResult
 * @property {*} data - The normalized data
 * @property {number} timestamp - When data was fetched (Date.now())
 * @property {string} source - 'code-intel' | 'registry' | 'metrics'
 * @property {boolean} isFallback - true if using static/cached data
 */

class DataSource {
  constructor(options) {
    this._cache = null;
    this._cacheTimestamp = 0;
    this._cacheTTL = options.cacheTTL || 5000; // 5s default
  }

  /** @returns {Promise<DataSourceResult>} */
  async getData() { throw new Error('Not implemented'); }

  /** @returns {number} timestamp of last successful fetch */
  getLastUpdate() { return this._cacheTimestamp; }

  /** @returns {boolean} true if cache is expired */
  isStale() { return Date.now() - this._cacheTimestamp > this._cacheTTL; }
}
```

### 3.2 code-intel-source.js

**Responsabilidade:** Transformar output do code-intel module em formatos consumíveis pelos renderers.

```javascript
const { getClient, getEnricher, isCodeIntelAvailable } = require('../code-intel');
const { RegistryLoader } = require('../ids/registry-loader');

class CodeIntelSource extends DataSource {
  async getData() {
    // Primary: code-intel provider (live data)
    if (isCodeIntelAvailable()) {
      const client = getClient();
      const deps = await client.analyzeDependencies('.');
      return this._wrap(this._normalizeDeps(deps), 'code-intel', false);
    }

    // Fallback: entity-registry.yaml (static data)
    return this._getRegistryFallback();
  }

  async getBlastRadius(filePath) {
    if (!isCodeIntelAvailable()) return null;
    const enricher = getEnricher();
    return enricher.assessImpact([filePath]);
  }

  _getRegistryFallback() {
    const loader = new RegistryLoader();
    const registry = loader.load();
    return this._wrap(this._registryToTree(registry), 'registry', true);
  }

  _normalizeDeps(deps) {
    // Transform analyzeDependencies output → { nodes: [], edges: [] }
    // Handles various shapes: array, object with dependencies, flat object
  }

  _registryToTree(registry) {
    // Transform entity-registry categories → tree structure
    // Group by entity type (tasks, templates, agents, etc.)
  }
}
```

**Data Flow:**

```
isCodeIntelAvailable() ─── YES ──→ client.analyzeDependencies('.')
         │                              │
         NO                        _normalizeDeps()
         │                              │
  RegistryLoader.load()                 ▼
         │                    { nodes: [...], edges: [...] }
  _registryToTree()
         │
         ▼
  { nodes: [...], edges: [...] }   ← Same normalized format
```

### 3.3 registry-source.js

**Responsabilidade:** Extrair estatísticas do entity-registry.yaml.

```javascript
class RegistrySource extends DataSource {
  async getData() {
    const loader = new RegistryLoader();
    const registry = loader.load();
    const metadata = registry.metadata;

    // Count entities per category
    const categories = {};
    for (const [category, entities] of Object.entries(registry.entities || {})) {
      categories[category] = Object.keys(entities).length;
    }

    return this._wrap({
      totalEntities: metadata.entityCount || 0,
      categories,
      lastUpdated: metadata.lastUpdated,
      version: metadata.version,
    }, 'registry', false);
  }
}
```

### 3.4 metrics-source.js

**Responsabilidade:** Extrair métricas do CodeIntelClient (cache, latency, circuit breaker).

```javascript
class MetricsSource extends DataSource {
  async getData() {
    if (!isCodeIntelAvailable()) {
      return this._wrap({
        cacheHits: 0, cacheMisses: 0, cacheHitRate: 0,
        circuitBreakerState: 'UNKNOWN',
        latencyLog: [],
        providerAvailable: false,
        activeProvider: null,
      }, 'metrics', true);
    }

    const client = getClient();
    const metrics = client.getMetrics();
    return this._wrap(metrics, 'metrics', false);
  }
}
```

---

## 4. Renderers Layer (Epic 1 — MVP)

### 4.1 tree-renderer.js

Renderiza dependency graph como árvore ASCII com box-drawing characters.

**Input:** `{ nodes: [...], edges: [...] }` do CodeIntelSource
**Output:** String multiline pronta para `console.log()`

```
Dependency Graph (142 entities)
├─ tasks/ (67)
│  ├─ create-doc.md
│  ├─ dev-develop-story.md
│  │  └─ depends: execute-checklist.md, story-dod-checklist.md
│  └─ ...
├─ templates/ (34)
│  ├─ prd-tmpl.yaml
│  └─ ...
├─ agents/ (12)
│  ├─ dev.md → uses: 8 tasks, 3 templates
│  └─ ...
└─ scripts/ (29)
   └─ ...
```

**Algoritmo:**
1. Recebe nodes + edges
2. Constrói árvore hierárquica agrupando por categoria (type)
3. Resolve dependências via edges para mostrar `depends:` e `uses:`
4. Renderiza com `├─`, `└─`, `│` (box-drawing)
5. Trunca branches com mais de N items (mostra `... (N more)`)

### 4.2 stats-renderer.js

Renderiza tabela de estatísticas + sparklines ASCII.

```
Entity Statistics
─────────────────────────────────
 Category    │ Count │ %
─────────────┼───────┼──────
 tasks       │    67 │ 47.2%
 templates   │    34 │ 23.9%
 scripts     │    29 │ 20.4%
 agents      │    12 │  8.5%
─────────────┼───────┼──────
 TOTAL       │   142 │ 100%

Cache Performance
 Hit Rate: 89.2% ▁▃▅▇▅▃▁▃▅▇
 Misses:   10.8% ▇▅▃▁▃▅▇▅▃▁

Latency (last 10 operations)
  45 ┤    ╭╮
  30 ┤ ╭╮ ││
  15 ┤╭╯╰╮│╰─╮
   0 ┼╯  ╰╯  ╰
```

**Dependência MVP:** `asciichart` (zero deps, line charts ASCII puro)

### 4.3 status-renderer.js

```
Provider Status
───────────────────────────
 Code Graph MCP: ● ACTIVE     (ou ○ OFFLINE)
 Circuit Breaker: CLOSED      (CLOSED / OPEN / HALF-OPEN)
 Failures: 0/3
 Cache Entries: 24
 Uptime: session
```

### 4.4 blast-renderer.js

```
Blast Radius: registry-updater.js
───────────────────────────────────
 Direct consumers:  3
 Indirect affected: 8
 Risk: ██████░░░░ MEDIUM

 Affected:
  ├─ framework-governor.js (direct)
  ├─ registry-healer.js (direct)
  ├─ registry-syncer.js (direct)
  ├─ g3-story-validation.js (indirect)
  └─ ... (4 more)
```

---

## 5. Formatters Layer

### 5.1 json-formatter.js

```javascript
function formatAsJson(graphData) {
  return JSON.stringify(graphData, null, 2);
}
```

### 5.2 dot-formatter.js

```javascript
function formatAsDot(graphData) {
  const lines = ['digraph G {'];
  lines.push('  rankdir=TB;');
  lines.push('  node [shape=box, style=rounded];');

  for (const node of graphData.nodes) {
    lines.push(`  "${node.id}" [label="${node.label}"];`);
  }
  for (const edge of graphData.edges) {
    lines.push(`  "${edge.from}" -> "${edge.to}";`);
  }

  lines.push('}');
  return lines.join('\n');
}
```

### 5.3 mermaid-formatter.js

```javascript
function formatAsMermaid(graphData) {
  const lines = ['graph TD'];

  for (const edge of graphData.edges) {
    const fromLabel = graphData.nodes.find(n => n.id === edge.from)?.label || edge.from;
    const toLabel = graphData.nodes.find(n => n.id === edge.to)?.label || edge.to;
    lines.push(`  ${edge.from}["${fromLabel}"] --> ${edge.to}["${toLabel}"]`);
  }

  return lines.join('\n');
}
```

---

## 6. CLI Router (cli.js)

```javascript
const COMMANDS = {
  '--deps':        handleDeps,
  '--stats':       handleStats,
  '--blast':       handleBlast,      // requires <file> arg
  '--interactive': handleInteractive, // Epic 2
  '--watch':       handleWatch,       // Epic 3
  '--format':      null,              // modifier, not standalone
  '--help':        handleHelp,
};

async function run(argv) {
  const args = parseArgs(argv);

  // Default: summary view (deps + stats + status)
  if (args.command === null) {
    return handleSummary(args);
  }

  const handler = COMMANDS[args.command];
  if (!handler) {
    console.error(`Unknown command: ${args.command}`);
    handleHelp();
    process.exit(1);
  }

  return handler(args);
}

function parseArgs(argv) {
  return {
    command: argv.find(a => a.startsWith('--') && COMMANDS[a]) || null,
    format: extractValue(argv, '--format') || 'ascii',
    file: extractValue(argv, '--blast'),
    interval: parseInt(extractValue(argv, '--interval') || '5', 10),
    help: argv.includes('--help') || argv.includes('-h'),
  };
}
```

**Command routing:**

| Command | Handler | Data Sources | Renderer/Formatter |
|---------|---------|-------------|-------------------|
| (none) | `handleSummary` | All 3 | tree + stats + status |
| `--deps` | `handleDeps` | CodeIntelSource | tree-renderer OR formatter |
| `--stats` | `handleStats` | RegistrySource + MetricsSource | stats-renderer |
| `--blast <file>` | `handleBlast` | CodeIntelSource.getBlastRadius | blast-renderer |
| `--format=X` | (modifier) | Same as parent | json/dot/mermaid formatter |
| `--interactive` | `handleInteractive` | All 3 | dashboard/screen.js |
| `--watch` | `handleWatch` | All 3 | dashboard + refresh.js |

---

## 7. Interactive Dashboard (Epic 2)

### 7.1 Grid Layout

```
┌─────────────────────────────────────────────────────────────────┐
│ rows=12, cols=12                                                │
├─ Dependency Graph (0,0,8,6) ────┬─ Entity Stats (0,6,4,6) ─────┤
│ ▼ code-intel-client             │ Entities: 142                 │
│   ├─ code-graph-provider        │ Categories: 8                 │
│   ├─ ▼ helpers/                 │ Last Updated: 2m ago          │
│   │   ├─ dev-helper             │                               │
│   │   ├─ qa-helper              ├─ Cache (4,6,4,3) ────────────┤
│   │   └─ ...                    │ Hits: ▁▃▅▇▅▃▁▃▅▇ 89%         │
│   └─ registry-syncer            │ Miss: ▇▅▃▁▃▅▇▅▃▁ 11%         │
│                                 │                               │
│                                 ├─ Latency (4,9,4,3) ──────────┤
│                                 │  45 ┤    ╭╮                   │
│                                 │  15 ┤╭╯╰╮│╰─╮                 │
│                                 │   0 ┼╯  ╰╯  ╰                 │
├─ Blast Radius (8,0,4,6) ───────┼─ Provider Status (8,6,4,6) ───┤
│ registry-updater.js             │ Code Graph MCP: ● ACTIVE      │
│  → 3 direct, 8 indirect        │ Circuit Breaker: CLOSED        │
│  Risk: ██████░░░░ MEDIUM        │ Failures: 0/3                 │
└─────────────────────────────────┴───────────────────────────────┘
```

### 7.2 Widget Composition

```javascript
// dashboard/screen.js
const blessed = require('blessed');
const contrib = require('blessed-contrib');

function createDashboard(dataSources) {
  const screen = blessed.screen({ smartCSR: true, title: 'AIOS Graph Dashboard' });
  const grid = new contrib.grid({ rows: 12, cols: 12, screen });

  // Widgets
  const tree     = grid.set(0, 0, 8, 6,  contrib.tree,      { label: 'Dependency Graph' });
  const stats    = grid.set(0, 6, 4, 6,  contrib.table,      { label: 'Entity Stats' });
  const cache    = grid.set(4, 6, 4, 3,  contrib.sparkline,  { label: 'Cache Hit Rate' });
  const latency  = grid.set(4, 9, 4, 3,  contrib.line,       { label: 'Latency (ms)' });
  const blast    = grid.set(8, 0, 4, 6,  contrib.bar,        { label: 'Blast Radius' });
  const status   = grid.set(8, 6, 4, 6,  contrib.log,        { label: 'Provider Status' });

  // Data binding
  bindTree(tree, dataSources.codeIntel);
  bindStats(stats, dataSources.registry);
  bindCache(cache, dataSources.metrics);
  bindLatency(latency, dataSources.metrics);
  bindStatus(status, dataSources.metrics);

  // Tree selection → blast radius update
  tree.on('select', async (item) => {
    const impact = await dataSources.codeIntel.getBlastRadius(item.path);
    updateBlastWidget(blast, impact);
    screen.render();
  });

  // Keyboard
  screen.key(['q', 'C-c'], () => process.exit(0));
  screen.key(['C-r'], () => refreshAll(dataSources, screen));

  screen.render();
  return screen;
}
```

### 7.3 Watch Mode (Epic 3)

```javascript
// dashboard/refresh.js
class RefreshManager {
  constructor(screen, dataSources, intervalMs = 5000) {
    this._screen = screen;
    this._dataSources = dataSources;
    this._intervalMs = intervalMs;
    this._timer = null;
    this._lastData = {};
  }

  start() {
    this._timer = setInterval(() => this._refresh(), this._intervalMs);
  }

  stop() {
    if (this._timer) clearInterval(this._timer);
  }

  async _refresh() {
    for (const [name, source] of Object.entries(this._dataSources)) {
      if (source.isStale()) {
        const newData = await source.getData();
        // Diff-based: only re-render widgets whose data changed
        if (JSON.stringify(newData) !== JSON.stringify(this._lastData[name])) {
          this._lastData[name] = newData;
          this._updateWidget(name, newData);
        }
      }
    }
    this._screen.render();
  }
}
```

---

## 8. Agent Commands Integration (Epic 3)

### 8.1 Agent Command Registration

Registrar `*graph` como comando disponível em todos os agentes via entry no `core-config.yaml` ou como skill global.

```javascript
// .aios-core/core/graph-dashboard/agent-command.js
const { CodeIntelSource } = require('./data-sources/code-intel-source');
const { RegistrySource } = require('./data-sources/registry-source');
const { MetricsSource } = require('./data-sources/metrics-source');
const { renderTree } = require('./renderers/tree-renderer');
const { renderStats } = require('./renderers/stats-renderer');
const { renderBlast } = require('./renderers/blast-renderer');

/**
 * Handle *graph command from any agent context.
 * Returns formatted text (no TUI, inline-friendly).
 */
async function handleGraphCommand(subcommand, args) {
  switch (subcommand) {
    case 'deps':
      return renderTree(await new CodeIntelSource().getData());
    case 'stats':
      return renderStats(
        await new RegistrySource().getData(),
        await new MetricsSource().getData()
      );
    case 'blast':
      return renderBlast(await new CodeIntelSource().getBlastRadius(args[0]));
    default:
      return 'Usage: *graph [deps|stats|blast <file>]';
  }
}
```

---

## 9. Dependency Map

### 9.1 NPM Dependencies

| Package | Version | Epic | Purpose | Fallback |
|---------|---------|------|---------|----------|
| `asciichart` | ^1.5 | **1 (MVP)** | ASCII line charts | Nenhum (zero deps) |
| `blessed` | ^0.1 | 2 | TUI framework | `neo-blessed` fork |
| `blessed-contrib` | ^4.11 | 2 | Dashboard widgets | Ink (React TUI) |
| `d3-dag` | ^1.1 | 3 (opcional) | DAG layout algorithms | Manual layout |

### 9.2 Internal Dependencies (já existentes, zero trabalho)

| Module | API Consumed | Data |
|--------|-------------|------|
| `code-intel/index.js` | `getClient()`, `getEnricher()`, `isCodeIntelAvailable()` | Provider status |
| `code-intel/code-intel-client.js` | `analyzeDependencies()`, `getMetrics()`, `getCircuitBreakerState()` | Graph + metrics |
| `code-intel/code-intel-enricher.js` | `assessImpact()`, `describeProject()` | Blast radius |
| `code-intel/helpers/planning-helper.js` | `getDependencyGraph()`, `getImplementationImpact()` | Summary data |
| `ids/registry-loader.js` | `RegistryLoader.load()` | Entity stats |
| `data/entity-registry.yaml` | Direct YAML read | Fallback data |

---

## 10. Fallback Strategy

```
Data Request
     │
     ▼
isCodeIntelAvailable()?
     │
   ┌─┴─┐
  YES   NO
   │     │
   ▼     ▼
Live    Static Fallback
Data    (entity-registry.yaml)
   │     │
   │     │ Features available:
   │     │ ✓ Entity tree (from categories)
   │     │ ✓ Entity stats (from metadata)
   │     │ ✗ Blast radius (needs live refs)
   │     │ ✗ Cache metrics (no client active)
   │     │ ✗ Latency chart (no operations logged)
   │     │
   ▼     ▼
Render with     Render with
full features   partial features
                + [OFFLINE] badge
```

**Regra:** Cada renderer verifica se `data.isFallback === true` e ajusta a apresentação (mostra `[OFFLINE]` onde dados live não estão disponíveis).

---

## 11. Performance Budget

| Metric | Target | Strategy |
|--------|--------|----------|
| Startup time | < 2s (NFR1) | Lazy-load blessed only for `--interactive` |
| Watch refresh | < 200ms per cycle (NFR2) | Diff-based rendering, 5s interval |
| Memory | < 50MB | Evict old latencyLog entries (keep last 100) |
| Registry load | < 100ms | RegistryLoader already cached |
| ASCII render | < 50ms | Pre-computed tree structure |

### 11.1 Lazy Loading Strategy

```javascript
// cli.js - blessed is ONLY loaded for --interactive/--watch
async function handleInteractive(args) {
  // Dynamic import - not loaded for ASCII commands
  const { createDashboard } = require('./dashboard/screen');
  // ...
}

async function handleDeps(args) {
  // Zero blessed dependency - ASCII only
  const { renderTree } = require('./renderers/tree-renderer');
  // ...
}
```

---

## 12. Testing Strategy

### 12.1 Unit Tests

| Module | Test File | Coverage |
|--------|-----------|----------|
| `code-intel-source.js` | `tests/graph-dashboard/code-intel-source.test.js` | Data transformation, fallback, caching |
| `registry-source.js` | `tests/graph-dashboard/registry-source.test.js` | Stats extraction, empty registry |
| `metrics-source.js` | `tests/graph-dashboard/metrics-source.test.js` | Metrics normalization, offline |
| `tree-renderer.js` | `tests/graph-dashboard/tree-renderer.test.js` | ASCII output, truncation, empty |
| `stats-renderer.js` | `tests/graph-dashboard/stats-renderer.test.js` | Table format, sparklines |
| `blast-renderer.js` | `tests/graph-dashboard/blast-renderer.test.js` | Risk levels, zero refs |
| `cli.js` | `tests/graph-dashboard/cli.test.js` | Arg parsing, routing |
| `json-formatter.js` | `tests/graph-dashboard/formatters.test.js` | JSON/DOT/Mermaid output |

### 12.2 Integration Tests

| Test | Scope |
|------|-------|
| `summary-view.test.js` | Full `aios graph` output with mock data |
| `fallback.test.js` | Behavior when code-intel is offline |
| `pipe-output.test.js` | Output is clean for pipe (no ANSI escape in non-TTY) |

### 12.3 Mock Pattern

Seguir o padrão existente dos code-intel tests:

```javascript
// Mock code-intel client
jest.mock('../../.aios-core/core/code-intel', () => ({
  getClient: () => mockClient,
  getEnricher: () => mockEnricher,
  isCodeIntelAvailable: () => true,
}));
```

---

## 13. Security Considerations

- **Read-only** — O módulo nunca escreve em disco nem modifica entity-registry
- **No network** — Nenhum acesso à rede; dados vêm de módulos locais
- **No secrets** — Nenhuma credencial envolvida
- **Input sanitization** — O argumento `--blast <file>` deve ser sanitizado para evitar path traversal (validar que o path está dentro do projeto)

---

## 14. Cross-Platform Considerations (NFR3)

| Concern | Strategy |
|---------|----------|
| Box-drawing chars (NFR6) | Detectar `process.env.TERM`; fallback para `+`, `-`, `\|` se não suportar Unicode |
| Color support | Usar `process.stdout.isTTY` e `supports-color` (já dep do projeto) |
| Windows Terminal | blessed suporta Windows; testar com Windows Terminal + PowerShell |
| Pipe detection | Se `!process.stdout.isTTY`, suprimir ANSI escapes e sparklines |

---

## 15. Implementation Phasing

### Epic 1 (MVP) — Stories 1.1, 1.2, 1.3

**Deps novas:** `asciichart` apenas
**Módulos:** `cli.js`, `data-sources/*`, `renderers/*`, `formatters/*`
**Entrypoint:** `bin/aios-graph.js`
**Testes:** ~40-50 unit tests

### Epic 2 (Interactive TUI) — Stories 2.1, 2.2, 2.3

**Deps novas:** `blessed`, `blessed-contrib`
**Módulos:** `dashboard/screen.js`, `dashboard/widgets/*`
**Testes:** ~20-30 unit tests (widgets mockam blessed)

### Epic 3 (Real-time & Advanced) — Stories 3.1, 3.2, 3.3

**Deps novas:** Nenhuma (ou `d3-dag` opcional)
**Módulos:** `dashboard/refresh.js`, `agent-command.js`
**Testes:** ~15-20 unit tests

---

*— Aria, arquitetando o futuro 🏗️*
