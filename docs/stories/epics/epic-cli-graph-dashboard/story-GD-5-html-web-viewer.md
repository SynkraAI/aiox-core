# Story GD-5: HTML Web Viewer com vis-network

## Status

Ready for Review

## Executor Assignment

```yaml
executor: "@dev"
quality_gate: "@qa"
quality_gate_tools: ["jest", "eslint", "coderabbit"]
```

## Story

**As a** developer using AIOS,
**I want** to run `aios graph --deps --format=html` and see an interactive graph in my browser,
**so that** I can explore dependencies visually with drag, zoom, and physics simulation.

## Acceptance Criteria

1. Flag `--format=html` gera arquivo HTML self-contained em `.aios/graph.html`
2. HTML inclui vis-network via CDN (standalone UMD build) para renderizacao interativa
3. Grafo renderiza com physics simulation (force-directed layout), drag de nodes, zoom e pan
4. Nodes sao coloridos por categoria (tasks=azul, agents=verde, templates=amarelo, scripts=cinza)
5. Ao clicar num node, mostra tooltip com: path, type, dependencies count
6. Browser abre automaticamente apos gerar o arquivo (cross-platform: Windows/Mac/Linux)
7. HTML funciona offline apos primeiro load (vis-network cached pelo browser)
8. Testes unitarios cobrem: HTML generation, data embedding, node/edge mapping

## Research Reference

[Research: Dynamic Graph Dashboard Visualization](../../../research/2026-02-21-graph-dashboard-visualization/README.md)

**Abordagem:** Fase 2 — Web Viewer. vis-network tem data format `{ nodes, edges }` identico ao nosso JSON. Standalone UMD build para HTML embedding sem build step.

## CodeRabbit Integration

### Story Type Analysis

**Primary Type**: Feature
**Complexity**: Medium (HTML template + vis-network integration + cross-platform open)

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
- Security: HTML generation nao deve permitir XSS via labels de nodes (sanitizar)
- Data integrity: JSON embedding no HTML deve escapar caracteres especiais

**Secondary Focus**:
- Cross-platform: `open` npm package para abrir browser em Windows/Mac/Linux
- Performance: Grafos com 500+ nodes devem renderizar em < 3s

## Tasks / Subtasks

- [x] **Task 1: Criar html-formatter.js** (AC: 1, 2, 3)
  - [x] 1.1 Criar `.aios-core/core/graph-dashboard/formatters/html-formatter.js`
  - [x] 1.2 Implementar `formatAsHtml(graphData, options)` que retorna string HTML completa
  - [x] 1.3 Incluir vis-network via CDN: `https://unpkg.com/vis-network/standalone/umd/vis-network.min.js`
  - [x] 1.4 Embeddar JSON data inline no HTML (sanitizado)
  - [x] 1.5 Configurar physics simulation: `{ physics: { stabilization: { iterations: 100 } } }`
  - [x] 1.6 Dark theme por default (background #1e1e1e, alinhado com VS Code)

- [x] **Task 2: Implementar node styling por categoria** (AC: 4, 5)
  - [x] 2.1 Mapear categorias para cores: tasks=#4fc3f7, agents=#66bb6a, templates=#ffd54f, scripts=#90a4ae
  - [x] 2.2 Configurar node shapes por tipo (dot para agents, box para tasks, diamond para templates)
  - [x] 2.3 Implementar tooltip on-click com path, type, dependencies count
  - [x] 2.4 Adicionar legenda visual no canto do HTML

- [x] **Task 3: Integrar no CLI router** (AC: 1, 6)
  - [x] 3.1 Adicionar `html` ao `FORMAT_MAP` e `VALID_FORMATS` em cli.js
  - [x] 3.2 Quando `--format=html`: gerar arquivo, escrever em `.aios/graph.html`, abrir browser
  - [x] 3.3 Usar `child_process.exec` com comando nativo para abrir browser (Windows: `start`, macOS: `open`, Linux: `xdg-open`) — zero deps externas
  - [x] 3.4 Fallback: se abertura falhar, printar path do arquivo para usuario abrir manualmente
  - [x] 3.5 Criar diretorio `.aios/` se nao existir (`fs.mkdirSync` recursive)

- [x] **Task 4: Combinacao com --watch (requer GD-4)** (AC: 7)
  - [x] 4.1 Se `--watch --format=html`: regenerar HTML file no intervalo (reusar handleWatch de GD-4)
  - [x] 4.2 Adicionar `<meta http-equiv="refresh" content="5">` no HTML para auto-reload no browser
  - [x] 4.3 Nota: meta-refresh e suficiente para MVP; WebSocket seria over-engineering

- [x] **Task 5: Escrever testes unitarios** (AC: 8)
  - [x] 5.1 `tests/graph-dashboard/html-formatter.test.js`
  - [x] 5.2 Test: HTML output contem vis-network CDN script tag
  - [x] 5.3 Test: JSON data embedded corretamente (parse de volta)
  - [x] 5.4 Test: Nodes tem cores por categoria
  - [x] 5.5 Test: Empty graph gera HTML valido
  - [x] 5.6 Test: Labels com caracteres especiais sao sanitizados (no XSS)

- [x] **Task 6: Validacao end-to-end**
  - [x] 6.1 Executar `npm run lint` — zero erros
  - [x] 6.2 Executar `npm test` — zero regressoes
  - [ ] 6.3 Testar manualmente: `node bin/aios.js graph --deps --format=html`
  - [ ] 6.4 Verificar que HTML abre no browser e grafo renderiza
  - [ ] 6.5 Testar com grafo grande (entity-registry completo, 500+ nodes)

## Dev Notes

### vis-network Data Format

vis-network usa exatamente o mesmo formato que nosso JSON:

```javascript
// Nosso formato (json-formatter output):
{ nodes: [{ id: 'dev', label: 'dev' }], edges: [{ from: 'dev', to: 'task-a' }] }

// vis-network espera:
{ nodes: new vis.DataSet([{ id: 'dev', label: 'dev' }]),
  edges: new vis.DataSet([{ from: 'dev', to: 'task-a' }]) }
```

Unica diferenca: wrapping com `vis.DataSet()`. Zero transformacao de schema.

### CDN URL

```
https://unpkg.com/vis-network/standalone/umd/vis-network.min.js
```

Standalone build inclui tudo (vis-data + vis-network) em um unico arquivo.

### Browser Open (zero deps)

Usar `child_process.exec` com comando nativo do OS:

```javascript
const { exec } = require('child_process');
const platform = process.platform;
const cmd = platform === 'win32' ? 'start' : platform === 'darwin' ? 'open' : 'xdg-open';
exec(`${cmd} ${filePath}`, (err) => {
  if (err) console.log(`Open manually: ${filePath}`);
});
```

Zero dependencias externas. Se no futuro precisar de mais robustez, considerar `open` (sindresorhus, v11).

### HTML Template Skeleton

```html
<!DOCTYPE html>
<html>
<head>
  <title>AIOS Graph Dashboard</title>
  <script src="https://unpkg.com/vis-network/standalone/umd/vis-network.min.js"></script>
  <style>
    body { margin: 0; background: #1e1e1e; }
    #graph { width: 100vw; height: 100vh; }
  </style>
</head>
<body>
  <div id="graph"></div>
  <script>
    var data = { nodes: new vis.DataSet(NODES_JSON), edges: new vis.DataSet(EDGES_JSON) };
    var options = { physics: { stabilization: { iterations: 100 } } };
    new vis.Network(document.getElementById('graph'), data, options);
  </script>
</body>
</html>
```

## Scope

### IN Scope
- HTML formatter com vis-network
- Node styling por categoria
- Tooltips on-click
- Cross-platform browser open
- Auto-refresh basico (meta refresh)

### OUT of Scope
- WebSocket live-server (over-engineering para MVP)
- Server-side rendering
- Dashboard layout com stats/status (so grafo nesta story)

## Complexity & Estimation

**Complexity:** Medium
**Estimation:** 6-8 horas
**Dependencies:** GD-3 (Done) — JSON formatter e CLI router existentes. GD-4 (watch mode) para Task 4.

### Riscos e Mitigacao

| Risco | Probabilidade | Mitigacao |
|-------|--------------|-----------|
| CDN indisponivel (offline) | Media | AC7 cobre: browser cacheia apos primeiro load. Nota no HTML: "requires internet on first load" |
| XSS via labels de nodes | Baixa | Task 1.4 sanitiza JSON embedding. Test 5.6 valida |
| Grafos grandes (500+ nodes) lentos | Media | Physics stabilization com iterations limitadas (Task 1.5). Test 6.5 valida |
| `child_process.exec` bloqueado por antivirus | Baixa | Fallback: print path para usuario (Task 3.4) |

## Testing

```bash
npx jest tests/graph-dashboard/html-formatter.test.js
npm run lint
npm test
```

## Dev Agent Record

### Agent Model Used
Claude Opus 4.6

### Debug Log References
- ESLint: 0 errors, 1 pre-existing warning (handleSummary unused args)
- Jest: 187/187 tests passing (29 new + 158 existing)

### Completion Notes
- html-formatter.js: 130 lines, formatAsHtml with XSS sanitization, category colors, legend, autoRefresh option
- cli.js: added html to FORMAT_MAP/VALID_FORMATS/WATCH_FORMAT_MAP, handleHtmlOutput, openInBrowser (cross-platform)
- Watch mode supports --format=html with meta-refresh auto-reload
- Path quoting in exec for Windows paths with spaces
- Tasks 6.3-6.5 require manual testing (browser open)

### File List
| File | Action | Description |
|------|--------|-------------|
| `.aios-core/core/graph-dashboard/formatters/html-formatter.js` | Created | HTML formatter with vis-network, XSS sanitization, category styling, legend |
| `.aios-core/core/graph-dashboard/cli.js` | Modified | Added html format, handleHtmlOutput, openInBrowser, WATCH_FORMAT_MAP html entry |
| `tests/graph-dashboard/html-formatter.test.js` | Created | 29 unit tests covering HTML gen, sanitization, nodes, edges, legend, XSS, CLI integration |

### Change Log

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-02-21 | @devops (Gage) | Story created from research |
| 1.1 | 2026-02-21 | @po (Pax) | Validated GO. Removed `open` dep (use native exec). Added risks. Task 4 dep on GD-4. Status Draft → Ready |
| 1.2 | 2026-02-21 | @dev (Dex) | Implementation complete. html-formatter + CLI integration + 29 tests. Tasks 6.3-6.5 pending manual testing. |

## QA Results

### Gate Decision: PASS

**Reviewer:** Quinn (@qa)
**Date:** 2026-02-21
**Score:** 8.5/10

### AC Traceability

| AC | Status | Evidence |
|----|--------|----------|
| AC1: `--format=html` gera HTML em `.aios/graph.html` | PASS | `cli.js:131-145`, test FORMAT_MAP/VALID_FORMATS |
| AC2: vis-network via CDN | PASS | `html-formatter.js:107`, test CDN check |
| AC3: Physics simulation, drag, zoom, pan | PASS | `html-formatter.js:122-125`, test stabilization |
| AC4: Nodes coloridos por categoria | PASS | `html-formatter.js:3-8`, test cores por categoria |
| AC5: Tooltip on-click | PASS | `html-formatter.js:43-48`, test tooltip content |
| AC6: Browser abre cross-platform | PARTIAL | `cli.js:151-160` (manual test pending) |
| AC7: Offline apos primeiro load | PARTIAL | CDN cache (manual test pending) |
| AC8: Testes unitarios | PASS | 29 testes cobrindo HTML gen, data, mapping, XSS |

### Security Assessment: PASS

- XSS sanitization: `_sanitize()` escapa &, <, >, ", ' — completo
- JSON embedding: `JSON.stringify` seguro para inline
- Command injection: `filePath` controlado internamente via `path.resolve`
- CDN SRI: Ausente (INFO — aceitavel para ferramenta dev local)

### Test Coverage: 29/29 PASS

- formatAsHtml: 10 testes
- _sanitize: 4 testes
- _buildVisNodes: 4 testes
- _buildVisEdges: 2 testes
- _buildLegend: 2 testes
- CLI integration: 5 testes
- XSS prevention: 2 testes

### Issues Found

| # | Severity | Category | Description |
|---|----------|----------|-------------|
| 1 | LOW | tests | handleHtmlOutput/openInBrowser sem testes unitarios (side effects com fs/exec) |
| 2 | INFO | security | CDN script tag sem SRI (Subresource Integrity) |
| 3 | INFO | code | handleHtmlOutput retorna outputPath mas caller nao usa o valor |

### Manual Testing Pending

- Task 6.3: `node bin/aios.js graph --deps --format=html`
- Task 6.4: Verificar HTML abre no browser e grafo renderiza
- Task 6.5: Testar com grafo grande (500+ nodes)

### Verdict

**PASS** — Implementacao solida. Codigo limpo, XSS sanitizado, 29 testes passando, integracao CLI consistente com GD-1 a GD-4. Issues encontrados sao LOW/INFO e nao bloqueiam merge. Tasks 6.3-6.5 pendentes de teste manual.
