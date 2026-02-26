# Research Report: CLI Graph Dashboard

## Executive Summary

A pesquisa identificou um ecossistema maduro de bibliotecas Node.js para construir dashboards CLI com visualizacao de grafos. Nao existe ferramenta pronta que resolva o caso de uso do AIOS (visualizar dependency graph do code-intel no terminal), mas a combinacao de bibliotecas existentes viabiliza a construcao com esforco moderado.

---

## 1. TUI Dashboard Frameworks

### 1.1 Blessed + blessed-contrib (Recomendado para AIOS)

| Aspecto | Detalhe |
|---------|---------|
| **Repo** | github.com/chjj/blessed + github.com/yaronn/blessed-contrib |
| **Abordagem** | Widget-based, imperativo |
| **Widgets** | Line chart, bar chart, sparkline, gauge, donut, tree, table, map, LCD, log |
| **Layout** | Grid system (rows x cols) |
| **Interatividade** | Mouse + keyboard, expand/collapse em tree |
| **Real-time** | `screen.render()` para updates |
| **Status** | Original unmaintained, forks ativos (neo-blessed, reblessed) |

**Por que e melhor para AIOS:**
- Widget `tree` nativo com expand/collapse (perfeito para dependency graph)
- Grid layout para dashboard multi-painel
- Sparklines para metricas (cache hits, latency)
- Leve, funciona over SSH

```javascript
// Exemplo: Dashboard com blessed-contrib
const blessed = require('blessed');
const contrib = require('blessed-contrib');

const screen = blessed.screen();
const grid = new contrib.grid({ rows: 12, cols: 12, screen });

// Tree widget para dependency graph
const tree = grid.set(0, 0, 8, 6, contrib.tree, {
  label: 'Dependency Graph',
  style: { text: 'green', border: { fg: 'cyan' } }
});

// Sparkline para metricas
const spark = grid.set(0, 6, 4, 6, contrib.sparkline, {
  label: 'Cache Hit Rate',
  style: { fg: 'blue' }
});

// Line chart para latency
const line = grid.set(8, 0, 4, 12, contrib.line, {
  label: 'Capability Latency (ms)',
  style: { line: 'yellow', baseline: 'black' }
});

tree.setData({
  extended: true,
  children: {
    'code-intel-client': {
      children: {
        'findReferences': {},
        'analyzeDependencies': {},
        'findCallers': {}
      }
    }
  }
});

screen.render();
```

### 1.2 Ink (React-based TUI)

| Aspecto | Detalhe |
|---------|---------|
| **Repo** | github.com/vadimdemedes/ink |
| **Abordagem** | React components + JSX + Flexbox (Yoga) |
| **Widgets** | Via @inkjs/ui (spinner, select, progress) — menos graficos que blessed-contrib |
| **Layout** | Flexbox |
| **Real-time** | React state + hooks |
| **Status** | Ativamente mantido |

**Quando preferir Ink:**
- Time ja usa React
- UI mais simples (sem graficos complexos)
- Preferencia por declarativo sobre imperativo

```javascript
// Exemplo: Ink TUI
import React, { useState, useEffect } from 'react';
import { render, Box, Text } from 'ink';

const Dashboard = () => {
  const [metrics, setMetrics] = useState({ hits: 0, misses: 0 });

  return (
    <Box flexDirection="column">
      <Text bold>Code Intelligence Dashboard</Text>
      <Box marginTop={1}>
        <Text color="green">Cache Hits: {metrics.hits}</Text>
        <Text color="red"> Misses: {metrics.misses}</Text>
      </Box>
    </Box>
  );
};

render(<Dashboard />);
```

**Limitacao:** Sem widgets de grafico nativos. Precisaria de biblioteca adicional ou rendering ASCII manual.

### 1.3 Comparacao

| Feature | blessed-contrib | Ink |
|---------|----------------|-----|
| Charts (line, bar, spark) | Nativo | Nao nativo |
| Tree widget interativo | Nativo | Manual |
| Dependency graph | Via tree widget | Manual |
| Layout system | Grid (rows x cols) | Flexbox |
| API style | Imperativo | React/JSX |
| Maintenance | Forks ativos | Ativo |
| Learning curve | Moderada | Baixa (se sabe React) |

---

## 2. Graph Visualization Libraries

### 2.1 d3-dag (DAG Layout)

| Aspecto | Detalhe |
|---------|---------|
| **Repo** | github.com/erikbrinkman/d3-dag |
| **Funcao** | Computa LAYOUT de DAGs (coordenadas x,y para nos e edges) |
| **Algoritmos** | Sugiyama (geral), Zherebko (linear), Grid (topologico) |
| **Output** | Coordenadas — precisa de renderer separado |
| **Node.js** | Compativel via npm |

**Uso para AIOS:** Computar layout do dependency graph, depois renderizar via blessed-contrib ou ASCII art manual.

```javascript
import * as d3 from 'd3-dag';

// Dados do code-intel analyzeDependencies
const data = [
  { id: 'code-intel-client', parentIds: [] },
  { id: 'code-graph-provider', parentIds: ['code-intel-client'] },
  { id: 'dev-helper', parentIds: ['code-intel-client'] },
  { id: 'qa-helper', parentIds: ['code-intel-client'] },
];

const dag = d3.dagStratify()(data);
const layout = d3.sugiyama().size([80, 24]); // terminal cols x rows
const result = layout(dag);
// result.nodes() tem coordenadas x, y para cada no
```

### 2.2 asciichart (Line Charts ASCII)

| Aspecto | Detalhe |
|---------|---------|
| **Repo** | github.com/kroitor/asciichart |
| **Funcao** | Renderiza line charts em ASCII puro |
| **Deps** | Zero |
| **Output** | String ASCII direto no console |
| **Uso** | Metricas de latency, cache hits, etc. |

```javascript
const asciichart = require('asciichart');

// Latency data do code-intel client
const latencies = [12, 15, 8, 22, 45, 18, 9, 11, 14, 20];
console.log(asciichart.plot(latencies, { height: 8 }));

// Output:
//  45.00 ┤    ╭╮
//  38.33 ┤    ││
//  31.67 ┤    ││
//  25.00 ┤    ││
//  18.33 ┤ ╭╮ │╰─╮
//  11.67 ┤╭╯╰╮│  ╰╮╭╮
//   5.00 ┼╯  ╰╯   ╰╯╰
```

### 2.3 Dependency Graph CLI Tools

| Tool | Funcao | Terminal Output | Graph Type |
|------|--------|----------------|------------|
| **madge** | Module dependency analysis | Nested text lists | File-level imports |
| **dependency-cruiser** | Rule-based dep analysis | DOT → SVG/HTML | Module-level |

**Nota:** Estas ferramentas analisam `require()`/`import` no codigo-fonte. O code-intel do AIOS opera em nivel diferente (entity registry, capabilities, agent relationships). Nao sao diretamente aplicaveis mas o formato de output (DOT) pode ser util.

---

## 3. Graph Rendering no Terminal — Abordagens

### 3.1 Tree Widget (blessed-contrib)
- Melhor para: Dependency trees hierarquicos
- Interatividade: Expand/collapse com Enter
- Dados: `setData({ children: {...} })`
- Limitacao: Nao renderiza ciclos (DAG com multiplos pais)

### 3.2 ASCII Box Drawing Manual
- Melhor para: DAGs customizados, blast radius visualization
- Tecnica: Usar d3-dag para layout → converter coordenadas em ASCII box characters
- Caracteres: `┌ ┐ └ ┘ ─ │ ├ ┤ ┬ ┴ ┼ → ←`
- Esforco: Medio-alto

### 3.3 DOT → Terminal
- Melhor para: Grafos complexos que ja existem em DOT format
- Tecnica: `graph-easy` converte DOT para ASCII art
- Dep externa: Perl (`graph-easy` e um modulo Perl)

### 3.4 Mermaid CLI
- Melhor para: Gerar imagens de grafos para docs
- Tecnica: `mmdc` (mermaid-cli) gera SVG/PNG de diagramas Mermaid
- Nao e terminal-native mas pode complementar

---

## 4. Dados Disponiveis no code-intel

O modulo `code-intel` ja tem todos os dados necessarios:

| Capability | Dado | Visualizacao |
|-----------|------|-------------|
| `analyzeDependencies` | `{ nodes, edges }` | DAG / Tree widget |
| `findReferences` | `[{ file, line }]` | Reference list / sparkline |
| `findCallers` / `findCallees` | Call graph | Tree widget |
| `analyzeComplexity` | Complexity metrics | Bar chart / gauge |
| `getProjectStats` | File counts, lines | Table / LCD display |
| `assessImpact` (enricher) | Blast radius | Heat map / risk gauge |
| `detectDuplicates` (enricher) | Similar entities | Highlighted list |
| Client metrics | Cache hits, latency | Sparkline / line chart |

---

## 5. Decision Matrix

| Criterio | blessed-contrib | Ink + custom | asciichart standalone |
|----------|----------------|--------------|----------------------|
| Grafos interativos | SIM (tree widget) | Manual | NAO |
| Charts (line, bar) | SIM (nativo) | Manual | SIM (line only) |
| Dashboard multi-painel | SIM (grid) | SIM (flexbox) | NAO |
| Real-time updates | SIM (screen.render) | SIM (React state) | Print only |
| Zero deps | NAO (blessed) | NAO (ink, react) | SIM |
| Maintenance risk | Medio (forks) | Baixo (ativo) | Baixo |
| Esforco implementacao | Baixo-Medio | Medio-Alto | Baixo |
| CLI First compliance | SIM | SIM | SIM |

---

## Sources

- [asciichart - GitHub](https://github.com/kroitor/asciichart)
- [blessed-contrib - GitHub](https://github.com/yaronn/blessed-contrib)
- [madge - GitHub](https://github.com/pahen/madge)
- [dependency-cruiser - npm](https://www.npmjs.com/package/dependency-cruiser)
- [d3-dag - GitHub](https://github.com/erikbrinkman/d3-dag)
- [Cytoscape.js](https://js.cytoscape.org/)
- [Ink - GitHub](https://github.com/vadimdemedes/ink)
- [Building Terminal Interfaces with Node.js](https://blog.openreplay.com/building-terminal-interfaces-nodejs/)
