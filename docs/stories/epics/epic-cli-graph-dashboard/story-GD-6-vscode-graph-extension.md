# Story GD-6: VS Code Graph Viewer Extension (Cytoscape.js)

## Status

Ready

## Executor Assignment

```yaml
executor: "@dev"
quality_gate: "@qa"
quality_gate_tools: ["jest", "eslint", "coderabbit"]
```

## Story

**As a** developer using AIOS in VS Code,
**I want** a dedicated graph viewer panel that auto-refreshes when my codebase changes,
**so that** I can monitor dependencies, blast radius, and entity relationships without leaving the editor.

## Acceptance Criteria

1. Extensao VS Code `aios-graph-viewer` registra comando `AIOS: Open Graph Viewer` na command palette
2. Comando abre Webview panel com grafo interativo renderizado por Cytoscape.js
3. Grafo carrega dados de `.aios/graph.json` (gerado pelo CLI) ou executa `aios graph --deps --format=json` diretamente
4. File watcher em `.aios/graph.json` detecta mudancas e atualiza grafo via `postMessage` sem recarregar webview
5. Nodes sao coloridos por categoria com layout dagre (hierarchical, ideal para DAGs de dependencia)
6. Click em node mostra side panel com: path, type, dependencies, dependents, blast radius estimate
7. Busca por node name via input field no topo do webview
8. Tema do webview alinha com tema ativo do VS Code (dark/light)
9. Extensao publicavel no VS Code Marketplace (package.json, icon, README)
10. Testes unitarios cobrem: extension activation, command registration, data loading, webview messaging

## Research Reference

[Research: Dynamic Graph Dashboard Visualization](../../../research/2026-02-21-graph-dashboard-visualization/README.md)

**Abordagem:** Fase 3 — Custom VS Code Extension. Cytoscape.js (10.9K stars, releases mensais) com dagre layout para DAGs. Padrao validado por ZenML e CodeVisualizer em producao.

## CodeRabbit Integration

### Story Type Analysis

**Primary Type**: Feature (VS Code Extension)
**Complexity**: High (extension scaffolding + webview + Cytoscape + file watcher + theme integration)

### Quality Gate Tasks

- [ ] Pre-Commit (@dev): Run `coderabbit --prompt-only -t uncommitted` before marking story complete
- [ ] Pre-PR (@devops): Run `coderabbit --prompt-only --base main` before creating pull request

### Self-Healing Configuration

**Expected Self-Healing**:
- Primary Agent: @dev (light mode)
- Max Iterations: 2
- Timeout: 15 minutes
- Severity Filter: CRITICAL, HIGH

### CodeRabbit Focus Areas

**Primary Focus**:
- Security: Webview CSP (Content Security Policy) deve restringir scripts inline
- Performance: Grafos com 500+ nodes devem renderizar em < 3s

**Secondary Focus**:
- VS Code API: Usar `retainContextWhenHidden: true` para preservar estado do grafo
- Bundling: Cytoscape.js deve ser bundled com extensao (nao CDN) para offline use

## Tasks / Subtasks

- [ ] **Task 1: Scaffold extensao VS Code** (AC: 1, 9)
  - [ ] 1.1 Criar diretorio `packages/vscode-graph-viewer/`
  - [ ] 1.2 Inicializar manualmente (package.json com `engines.vscode`, tsconfig, esbuild config)
  - [ ] 1.3 Configurar `activationEvents`: `onCommand:aios.openGraphViewer`
  - [ ] 1.4 Registrar comando `AIOS: Open Graph Viewer` em `contributes.commands`
  - [ ] 1.5 Adicionar icon (usar SVG simples do grafo) e README para marketplace
  - [ ] 1.6 Configurar `.vscodeignore` para excluir source files do package

- [ ] **Task 2: Implementar Webview Panel** (AC: 2, 8)
  - [ ] 2.1 Criar `src/extension.ts` com `registerCommand` que abre `WebviewPanel`
  - [ ] 2.2 Configurar `retainContextWhenHidden: true`
  - [ ] 2.3 Bundlar Cytoscape.js + cytoscape-dagre como webview assets
  - [ ] 2.4 Criar `webview/index.html` com Cytoscape container
  - [ ] 2.5 Implementar CSP: `default-src 'none'; script-src ${webview.cspSource}; style-src ${webview.cspSource}`
  - [ ] 2.6 Detectar tema VS Code (dark/light) e aplicar palette correspondente

- [ ] **Task 3: Data Loading e File Watcher** (AC: 3, 4)
  - [ ] 3.1 No extension host: ler `.aios/graph.json` via `vscode.workspace.fs.readFile` (API nativa VS Code)
  - [ ] 3.2 Criar funcao `transformToCytoscape(graphData)` que converte nosso JSON para formato Cytoscape
  - [ ] 3.3 Transformacao: nodes → `{ data: {id, label, category} }`, edges → `{ data: {id, source, target} }` (rename from→source, to→target)
  - [ ] 3.4 Enviar dados para webview via `panel.webview.postMessage({ type: 'updateGraph', elements })`
  - [ ] 3.5 Criar `vscode.workspace.createFileSystemWatcher('**/.aios/graph.json')` para detectar mudancas
  - [ ] 3.6 On change: re-ler JSON, re-transformar, re-enviar postMessage (webview atualiza sem reload)
  - [ ] 3.7 Fallback: se `.aios/graph.json` nao existe, executar `aios graph --deps --format=json --output .aios/graph.json` via Terminal API
  - [ ] 3.8 Dispose watcher no `deactivate()` da extensao

- [ ] **Task 4: Interatividade do Grafo** (AC: 5, 6, 7)
  - [ ] 4.1 Configurar layout dagre: `{ name: 'dagre', rankDir: 'TB', nodeSep: 50, rankSep: 100 }`
  - [ ] 4.2 Colorir nodes por categoria: tasks=#4fc3f7, agents=#66bb6a, templates=#ffd54f, scripts=#90a4ae
  - [ ] 4.3 On node click: enviar `postMessage` para extension host com node id
  - [ ] 4.4 Extension host resolve detalhes (path, deps, dependents) e responde com `postMessage`
  - [ ] 4.5 Webview renderiza side panel com detalhes do node
  - [ ] 4.6 Implementar search input: filtrar/highlight nodes por label

- [ ] **Task 5: Build e Package** (AC: 9)
  - [ ] 5.1 Configurar webpack/esbuild para bundlar extensao
  - [ ] 5.2 Incluir Cytoscape.js + dagre no bundle
  - [ ] 5.3 Testar com `vsce package` (gera .vsix)
  - [ ] 5.4 Testar instalacao local: `code --install-extension aios-graph-viewer-0.1.0.vsix`

- [ ] **Task 6: Testes** (AC: 10)
  - [ ] 6.1 `tests/vscode-graph-viewer/extension.test.ts` — activation, command registration
  - [ ] 6.2 Test: data transformation JSON → Cytoscape format
  - [ ] 6.3 Test: file watcher triggers postMessage
  - [ ] 6.4 Test: search filter matches nodes
  - [ ] 6.5 Executar `npm run lint` e `npm test` — zero erros

- [ ] **Task 7: Validacao end-to-end**
  - [ ] 7.1 Instalar extensao no VS Code
  - [ ] 7.2 Executar `aios graph --deps --watch` no terminal
  - [ ] 7.3 Abrir command palette → `AIOS: Open Graph Viewer`
  - [ ] 7.4 Verificar que grafo renderiza e atualiza quando --watch regenera JSON
  - [ ] 7.5 Testar click em node, search, zoom/pan
  - [ ] 7.6 Testar com tema light e dark

## Dev Notes

### Cytoscape.js Data Format

```javascript
// Nosso JSON:
{ nodes: [{ id: 'dev', label: 'dev', category: 'agents' }],
  edges: [{ from: 'dev', to: 'task-a' }] }

// Cytoscape espera:
{ elements: [
    { data: { id: 'dev', label: 'dev', category: 'agents' } },           // node
    { data: { id: 'dev-task-a', source: 'dev', target: 'task-a' } }      // edge
  ]
}
```

Transformacao simples: wrap nodes em `{ data: {...} }`, rename `from/to` para `source/target`.

### VS Code Webview Architecture

```
Extension Host (Node.js)          Webview (Browser)
├── extension.ts                  ├── index.html
│   ├── readGraphJson()           │   ├── cytoscape.min.js
│   ├── watchFile()               │   ├── cytoscape-dagre.js
│   └── postMessage(data) ──────→ │   └── app.js
│                                 │       ├── onMessage → cy.json(data)
│   ← postMessage(nodeClick) ────│       └── cy.on('tap', node => ...)
```

### Dependencias npm

```json
{
  "dependencies": {
    "cytoscape": "^3.30.0",
    "cytoscape-dagre": "^2.5.0"
  },
  "devDependencies": {
    "@types/vscode": "^1.85.0",
    "esbuild": "^0.24.0",
    "@vscode/vsce": "^3.0.0"
  }
}
```

### Referencia: ZenML DAG Visualization

ZenML usa exatamente este padrao (React + dagrejs + ReactFlow em webview) para visualizar pipelines. Blog: https://www.zenml.io/blog/dag-visualization-vscode-extension

## Scope

### IN Scope
- VS Code extension com webview + Cytoscape.js
- File watcher para live refresh
- Node interativity (click, search, zoom)
- Theme integration (dark/light)
- Publishable .vsix package

### OUT of Scope
- Marketplace publishing automatico (manual para v1)
- Blast radius widget completo (futuro)
- Stats/metrics panels no webview (so grafo nesta story)
- TUI dashboard (abordagem separada se necessario)

## Complexity & Estimation

**Complexity:** High
**Estimation:** 2-4 dias
**Dependencies:** GD-4 (watch mode gera `.aios/graph.json`) e GD-5 (HTML formatter como referencia de styling)

### Riscos e Mitigacao

| Risco | Probabilidade | Mitigacao |
|-------|--------------|-----------|
| CSP bloqueia Cytoscape no webview | Media | Task 2.5 configura CSP explicitamente com `webview.cspSource` |
| `retainContextWhenHidden` consome muita memoria | Baixa | Aceitavel para MVP; monitor e otimizar se reportado |
| `vsce` deprecated em favor de `@vscode/vsce` | Media | Usar `@vscode/vsce` (package atualizado). Verificar versao no npm |
| Cytoscape layout lento com 500+ nodes | Media | Dagre layout e O(V+E); limitar `maxZoom`, usar `animate: false` no initial render |
| `.aios/graph.json` nao existe ao abrir extensao | Alta | Task 3.7 fallback gera o arquivo automaticamente |

## Testing

```bash
cd packages/vscode-graph-viewer
npm test
npm run lint
vsce package
```

## Dev Agent Record

### Agent Model Used
(to be filled by @dev)

### Debug Log References
(to be filled by @dev)

### Completion Notes
(to be filled by @dev)

### File List
(to be filled by @dev)

### Change Log

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-02-21 | @devops (Gage) | Story created from research |
| 1.1 | 2026-02-21 | @po (Pax) | Validated GO. Used VS Code native APIs (workspace.fs, createFileSystemWatcher). Fixed vsce→@vscode/vsce. Added risks, dispose watcher, .vscodeignore. Detailed Task 3 transform. Status Draft → Ready |

## QA Results
(to be filled by @qa)
