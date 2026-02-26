# Research: Dynamic Graph Dashboard Visualization

> **Date:** 2026-02-21
> **Author:** Gage (@devops) + Tech Research Agent
> **Context:** Epic CLI Graph Dashboard (GD-1/2/3 Done) — next phase: dynamic visualization
> **Decision:** Dashboard is **core AIOS feature** — invest in full visualization stack

---

## Executive Summary

O CLI Graph Dashboard ja produz output em JSON, DOT e Mermaid. A questao e: como renderizar isso de forma dinamica e interativa? Pesquisamos VS Code extensions, web viewers, TUI libs e custom extensions.

**Resultado:** blessed-contrib (planejado na arquitetura original) esta **abandonado**. Recomendamos abordagem incremental em 3 fases.

---

## Achados Criticos

### blessed-contrib — DESCARTADO

| Library | Weekly Downloads | Last Publish | Status |
|---------|-----------------|-------------|--------|
| `blessed` | 837K | ~8 anos atras | Abandonado |
| `blessed-contrib` | 45K | ~3 anos atras | Inativo |
| `neo-blessed` | 13K | Fork sem manutencao | Fragmentado |

**Veredicto:** Nao usar para trabalho novo. Substituir por Ink (TUI) + web viewer (grafos).

---

## Opcoes Pesquisadas

### VS Code Extensions

| Extension | Stars | Format | Live Refresh | Interativo |
|-----------|-------|--------|-------------|------------|
| Graphviz Interactive Preview | 116 | DOT | Sim (file watch) | Zoom, pan, edge trace |
| Mermaid Preview (oficial) | 220 | Mermaid | Sim (real-time) | Pan/zoom |
| JSON Flow | 46 | JSON tree | Nao | Nao (tree view, nao grafo) |
| JSON Crack | 37K | JSON tree | Sim | Nao (data structure, nao grafo) |

### Web Libraries (HTML self-contained)

| Library | Stars | Format | Esforco | Destaque |
|---------|-------|--------|---------|----------|
| D3.js | 110K | JSON custom | Medium | Gold standard, force-directed |
| vis-network | 3.5K | JSON nodes/edges | **Low** | **Data format identico ao nosso** |
| Cytoscape.js | 10.9K | JSON (minor transform) | Low-Med | Melhor mantido, dagre layouts |
| d3-graphviz | 1.8K | DOT | Medium | Animated transitions entre estados |
| sigma.js | 11.7K | JSON via graphology | Medium | WebGL, melhor para grafos grandes |

### TUI Libraries

| Library | Stars | Status | Uso |
|---------|-------|--------|-----|
| Ink | 35.1K | Excelente (Claude Code, Prisma) | Stats/status panels |
| terminal-kit | 3.3K | Ativo | Alternativa mais leve |

### Custom VS Code Extension

- **Padrao validado:** ZenML (DAG viz), CodeVisualizer (Mermaid webview)
- **Esforco:** 2-4 dias dev
- **Stack:** VS Code Webview API + Cytoscape.js
- **Features:** Command palette, file watcher, postMessage refresh, theme integration

---

## Decisao: Abordagem em 3 Fases

### Fase 1 — Quick Win (Story GD-4)
**Graphviz Interactive Preview + --watch**
- Instalar extensao VS Code existente
- Adicionar `--watch` flag ao CLI que regenera DOT file
- Extensao auto-detecta mudanca e re-renderiza
- **Esforco:** ~4-6h

### Fase 2 — Web Viewer (Story GD-5)
**vis-network HTML Generator**
- Novo formatter `--format=html` que gera HTML self-contained
- vis-network standalone UMD (data format identico ao nosso JSON)
- `open` npm package para abrir no browser
- Live refresh via live-server ou browser-sync
- **Esforco:** ~6-8h

### Fase 3 — VS Code Extension (Story GD-6)
**Custom Extension com Cytoscape.js**
- Extensao AIOS Graph Viewer dedicada
- Webview panel com Cytoscape.js (10.9K stars, releases mensais)
- File watcher + postMessage para live data
- Command palette, sidebar, keybindings
- Theme integration com VS Code
- **Esforco:** ~2-4 dias

---

## Justificativa da Escolha

### Por que vis-network para Fase 2?
- Data format `{ nodes: [{id, label}], edges: [{from, to}] }` e **identico** ao nosso JSON
- Standalone UMD build feito para embedding em HTML
- Physics simulation built-in (clustering, drag, zoom)
- 3.5K stars, 190K downloads/semana

### Por que Cytoscape.js para Fase 3?
- 10.9K stars, releases mensais, patches semanais
- Bioinformatics-grade (testado com grafos enormes)
- Dagre layout ideal para DAGs de dependencia
- 70+ extensions disponiveis
- Padrao validado por ZenML para VS Code extension

### Por que NAO D3.js?
- Overkill para nosso caso (110K stars mas curva de aprendizado alta)
- vis-network e Cytoscape resolvem com menos codigo
- D3 e low-level demais — precisariamos escrever toda a interacao

---

## Referencias

- [Graphviz Interactive Preview](https://marketplace.visualstudio.com/items?itemName=tintinweb.graphviz-interactive-preview)
- [Mermaid Preview](https://marketplace.visualstudio.com/items?itemName=vstirbu.vscode-mermaid-preview)
- [vis-network](https://github.com/visjs/vis-network) — 3.5K stars
- [Cytoscape.js](https://github.com/cytoscape/cytoscape.js) — 10.9K stars
- [D3.js](https://github.com/d3/d3) — 110K stars
- [d3-graphviz](https://github.com/magjac/d3-graphviz) — 1.8K stars
- [sigma.js](https://github.com/jacomyal/sigma.js) — 11.7K stars
- [Ink](https://github.com/vadimdemedes/ink) — 35.1K stars
- [VS Code Webview API](https://code.visualstudio.com/api/extension-guides/webview)
- [ZenML DAG Visualization](https://www.zenml.io/blog/dag-visualization-vscode-extension)

---

*Research by @devops (Gage) + Tech Research Agent — 2026-02-21*
