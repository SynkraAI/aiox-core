# Recommendations: CLI Graph Dashboard for AIOS Code Intelligence

## Recomendacao Principal

**Usar `blessed` + `blessed-contrib`** para construir um CLI dashboard interativo que consome dados do modulo `code-intel`.

### Justificativa
1. **Tree widget nativo** — perfeito para dependency graph (expand/collapse interativo)
2. **Grid layout** — dashboard multi-painel com graficos, metricas, e tree num so ecrã
3. **Widgets ricos** — sparkline, line chart, bar chart, gauge, table, log — tudo nativo
4. **CLI First** — roda 100% no terminal, funciona over SSH, zero UI web necessaria
5. **Esforco moderado** — integracao com code-intel e direta (dados ja existem)

### Stack Recomendado

| Componente | Biblioteca | Funcao |
|-----------|-----------|--------|
| TUI Framework | `blessed` (ou `neo-blessed`) | Screen, layout, eventos |
| Dashboard Widgets | `blessed-contrib` | Tree, charts, sparklines, gauges |
| DAG Layout | `d3-dag` (opcional) | Computar layout para grafos complexos |
| ASCII Charts simples | `asciichart` (opcional) | Line charts standalone sem blessed |

### Exemplo de Dashboard Conceitual

```
┌─ Dependency Graph ──────────────┬─ Entity Stats ──────────┐
│ ▼ code-intel-client             │ Entities: 142           │
│   ├─ code-graph-provider        │ Categories: 8           │
│   ├─ ▼ helpers/                 │ Last Updated: 2m ago    │
│   │   ├─ dev-helper             │                         │
│   │   ├─ qa-helper              ├─ Cache ─────────────────┤
│   │   ├─ planning-helper        │ Hits: ▁▃▅▇▅▃▁▃▅▇ 89%   │
│   │   ├─ story-helper           │ Miss: ▇▅▃▁▃▅▇▅▃▁ 11%   │
│   │   ├─ devops-helper          │                         │
│   │   └─ creation-helper        ├─ Latency (ms) ─────────┤
│   └─ registry-syncer            │  45 ┤    ╭╮             │
│ ▼ ids/                          │  30 ┤ ╭╮ ││             │
│   ├─ registry-updater           │  15 ┤╭╯╰╮│╰─╮           │
│   └─ registry-loader            │   0 ┼╯  ╰╯  ╰           │
├─ Blast Radius ──────────────────┼─ Provider Status ───────┤
│ registry-updater.js             │ Code Graph MCP: ● ACTIVE│
│  → 3 direct consumers          │ Circuit Breaker: CLOSED  │
│  → 8 indirect affected          │ Failures: 0/3           │
│  Risk: ██████░░░░ MEDIUM        │ Uptime: 2h 14m          │
└─────────────────────────────────┴─────────────────────────┘
```

---

## Arquitetura Proposta

```
bin/aios-graph.js              # CLI entrypoint
  └── src/dashboard/
        ├── index.js            # Screen setup + grid layout
        ├── widgets/
        │   ├── dependency-tree.js   # Tree widget ← analyzeDependencies
        │   ├── blast-radius.js      # Gauge widget ← assessImpact
        │   ├── cache-metrics.js     # Sparkline ← client.getMetrics()
        │   ├── latency-chart.js     # Line chart ← client._latencyLog
        │   ├── entity-stats.js      # Table ← registry-loader
        │   └── provider-status.js   # Status ← isCodeIntelAvailable + CB state
        └── data-sources/
            ├── code-intel-source.js  # Adapter: code-intel → widget data format
            └── registry-source.js    # Adapter: entity-registry → widget data
```

### Data Flow

```
code-intel module                 dashboard widgets
┌──────────────────┐         ┌───────────────────┐
│ analyzeDependencies ──────→│ dependency-tree    │
│ assessImpact     ──────→│ blast-radius       │
│ client.getMetrics ──────→│ cache-metrics      │
│ client._latencyLog ─────→│ latency-chart      │
│ isCodeIntelAvailable ───→│ provider-status    │
└──────────────────┘         └───────────────────┘

entity-registry.yaml ──────→ entity-stats widget
```

---

## Opcoes de Implementacao

### Opcao A: CLI Command (`aios graph`) — Recomendado

```bash
npx aios-core graph                    # Dashboard completo
npx aios-core graph --deps             # Apenas dependency tree
npx aios-core graph --blast <file>     # Blast radius de um arquivo
npx aios-core graph --stats            # Entity stats + metricas
npx aios-core graph --watch            # Real-time mode
```

**Prioridade:** Alinhado com CLI First (Artigo I da Constitution).

### Opcao B: Agente Command (`@dev *graph`)

```
@dev *graph deps          # Dependency tree interativo
@dev *graph blast file.js # Blast radius visual
@qa  *graph coverage      # Test coverage heat map
```

**Prioridade:** Complementar a Opcao A.

### Opcao C: Output simples (sem TUI)

```bash
npx aios-core graph --format=ascii     # ASCII art estilo madge
npx aios-core graph --format=dot       # DOT format para Graphviz
npx aios-core graph --format=json      # JSON para processamento
npx aios-core graph --format=mermaid   # Mermaid para docs
```

**Prioridade:** Pode ser o MVP — sem dependencia de blessed.

---

## Faseamento Sugerido

| Fase | Scope | Esforco | Deps |
|------|-------|---------|------|
| **MVP** | `aios graph --format=ascii` — output texto do dependency tree | 2 pts | Nenhuma nova |
| **V1** | Dashboard interativo blessed-contrib (tree + stats + status) | 5 pts | blessed, blessed-contrib |
| **V2** | Real-time mode (`--watch`) + blast radius visual + latency chart | 3 pts | V1 |
| **V3** | Agent commands (`*graph`) + multiple output formats (DOT, Mermaid) | 3 pts | V1 |

**Total estimado:** 13 pontos (2-3 sprints)

---

## Riscos

| Risco | Prob | Impacto | Mitigacao |
|-------|------|---------|-----------|
| blessed unmaintained | Media | Alto | Usar neo-blessed fork; Ink como plano B |
| Code Graph MCP offline | Alta | Medio | Fallback para dados do entity-registry (estaticos) |
| Terminal size variations | Baixa | Baixo | Responsive grid layout do blessed-contrib |
| Windows terminal compatibility | Media | Medio | Testar em Windows Terminal + PowerShell; blessed suporta Windows |

---

## Next Steps

> **IMPORTANT:** Implementation is not the scope of this research. Use the following agents:

1. **@pm** — Criar PRD para "CLI Graph Dashboard" epic baseado neste research
2. **@architect** — Definir arquitetura detalhada (data sources, widget composition, output formats)
3. **@sm** — Criar stories seguindo faseamento sugerido (MVP → V1 → V2 → V3)
4. **@dev** — Implementar apos stories validadas por @po

### Dependencies para Instalar (quando implementar)

```bash
# Dashboard TUI (V1+)
npm install blessed blessed-contrib

# DAG Layout (opcional, V2+)
npm install d3-dag

# ASCII Charts standalone (MVP)
npm install asciichart
```
