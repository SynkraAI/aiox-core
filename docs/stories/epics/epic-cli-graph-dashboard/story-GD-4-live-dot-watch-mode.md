# Story GD-4: Live DOT Watch Mode

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
**I want** to run `aios graph --deps --watch` and see the dependency graph auto-refresh in VS Code,
**so that** I can monitor codebase relationships in real-time while developing.

## Acceptance Criteria

1. Flag `--watch` gera arquivo `.aios/graph.dot` com output DOT do dependency graph
2. Watch mode re-gera o arquivo DOT a cada N segundos (default 5s, configuravel via `--interval`)
3. Mudancas no entity-registry.yaml ou code-intel data trigam regeneracao imediata (file watcher)
4. Output DOT e compativel com extensao "Graphviz Interactive Preview" do VS Code (tintinweb)
5. Flag `--watch` combinavel com `--format=mermaid` para gerar `.aios/graph.mmd` alternativamente
6. Ctrl+C encerra watch mode gracefully (cleanup de timers e watchers)
7. Testes unitarios cobrem: watch lifecycle, file generation, interval config, cleanup

## Research Reference

[Research: Dynamic Graph Dashboard Visualization](../../../research/2026-02-21-graph-dashboard-visualization/README.md)

**Abordagem:** Fase 1 — Quick Win. Usar extensao VS Code existente (Graphviz Interactive Preview) que auto-detecta mudancas em `.dot` files e re-renderiza.

## CodeRabbit Integration

### Story Type Analysis

**Primary Type**: Feature
**Complexity**: Low-Medium (watch mode + file watcher, bem definido)

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
- Resource cleanup: Ensure all timers/watchers are properly disposed on exit
- File system safety: Write to `.aios/` directory only, no side effects outside

**Secondary Focus**:
- Cross-platform: File watching on Windows (chokidar vs fs.watch)
- Error handling: Graceful degradation if .aios/ directory doesn't exist

## Tasks / Subtasks

- [x] **Task 1: Implementar watch mode no CLI router** (AC: 1, 2, 6)
  - [x] 1.1 Adicionar `--watch` flag ao `parseArgs()` em cli.js
  - [x] 1.2 Criar `handleWatch(args)` que inicia loop de regeneracao
  - [x] 1.3 Usar `setInterval` com `args.interval` (default 5000ms)
  - [x] 1.4 Gerar arquivo `.aios/graph.dot` (ou `.aios/graph.mmd` se `--format=mermaid`)
  - [x] 1.5 Criar diretorio `.aios/` se nao existir (`fs.mkdirSync` recursive)
  - [x] 1.6 Implementar cleanup no SIGINT (clearInterval, close watchers)

- [x] **Task 2: Implementar file watcher para regeneracao imediata** (AC: 3)
  - [x] 2.1 Usar `fs.watch` nativo (zero deps). Se instavel no Windows, fallback para `chokidar`
  - [x] 2.2 Watch `entity-registry.yaml` para mudancas
  - [x] 2.3 Debounce regeneracao (300ms) para evitar writes multiplos
  - [x] 2.4 Log para terminal quando regeneracao acontece: `[watch] graph.dot updated (142 entities)`

- [x] **Task 3: Suporte a formato Mermaid no watch mode** (AC: 5)
  - [x] 3.1 Se `--format=mermaid`, gerar `.aios/graph.mmd` em vez de `.aios/graph.dot`
  - [x] 3.2 Reusar formatters existentes (dot-formatter.js, mermaid-formatter.js)
  - [x] 3.3 Extensao oficial Mermaid Preview tambem detecta mudancas em `.mmd` files

- [x] **Task 4: Escrever testes unitarios** (AC: 7)
  - [x] 4.1 `tests/graph-dashboard/watch-mode.test.js` — mock fs, test lifecycle
  - [x] 4.2 Test: watch inicia, gera arquivo, para no cleanup
  - [x] 4.3 Test: interval configuravel via --interval
  - [x] 4.4 Test: formato mermaid gera .mmd
  - [x] 4.5 Test: SIGINT handler limpa recursos
  - [x] 4.6 Test: DOT output valido (starts with `digraph G {`, ends with `}`)

- [x] **Task 5: Validacao e documentacao**
  - [x] 5.1 Executar `npm run lint` — zero erros
  - [x] 5.2 Executar `npm test` — zero regressoes
  - [x] 5.3 Testar manualmente: `node bin/aios.js graph --deps --watch`
  - [x] 5.4 Atualizar `--help` output com documentacao do --watch flag

## Dev Notes

### Dependencia Recomendada para VS Code

Extensao: **Graphviz Interactive Preview** (`tintinweb.graphviz-interactive-preview`)
- Detecta mudancas em `.dot` files automaticamente
- Renderiza com pan, zoom, edge tracing
- Usa WASM (nao precisa Graphviz nativo instalado)

### Watch Mode Architecture

```
CLI (--watch) → setInterval + fs.watch
     │
     ├── Tick: CodeIntelSource.getData() → formatAsDot() → fs.writeFileSync('.aios/graph.dot')
     │
     └── File change: entity-registry.yaml modified → debounce(300ms) → regenerate
```

### Output Directory

`.aios/` e o diretorio padrao para outputs temporarios do AIOS. Ja esta no `.gitignore`.

### Teste Visual com Extensao VS Code

Para verificar a integracao com Graphviz Interactive Preview:

1. Instalar extensao: `ext install tintinweb.graphviz-interactive-preview`
2. Executar: `node bin/aios.js graph --deps --watch`
3. No VS Code: abrir `.aios/graph.dot`
4. Ctrl+Shift+P → "Graphviz Interactive: Preview" (ou click no icone de preview)
5. Verificar: grafo renderiza e atualiza automaticamente quando CLI regenera o arquivo

### Riscos e Mitigacao

| Risco | Probabilidade | Mitigacao |
|-------|--------------|-----------|
| `fs.watch` instavel no Windows | Media | Fallback para `chokidar` (Task 2.1) |
| Extensao VS Code nao detecta mudanca rapida | Baixa | Debounce 300ms garante write completo antes de detect |
| `.aios/` nao existe no projeto | Baixa | `fs.mkdirSync` recursive (Task 1.5) |

## Scope

### IN Scope
- Watch mode com regeneracao periodica e file-based
- Output DOT e Mermaid para `.aios/`
- Cleanup graceful no SIGINT

### OUT of Scope
- Dashboard TUI interativo (GD-6 futuro)
- Abrir browser automaticamente (GD-5)
- WebSocket live-server integration

## Complexity & Estimation

**Complexity:** Low-Medium
**Estimation:** 4-6 horas
**Dependencies:** GD-3 (Done) — formatters ja implementados

## Testing

```bash
npx jest tests/graph-dashboard/watch-mode.test.js
npm run lint
npm test
```

## Dev Agent Record

### Agent Model Used
Claude Opus 4.6 (claude-opus-4-6)

### Debug Log References
- All 158 graph-dashboard tests passing (14 new watch-mode tests)
- ESLint: 0 errors on new/modified files

### Completion Notes
- Implemented `handleWatch()` in cli.js with setInterval + fs.watch + debounce
- Watch mode writes to `.aios/graph.dot` (default) or `.aios/graph.mmd` (--format=mermaid)
- fs.watch nativo used for entity-registry.yaml changes (zero external deps)
- 300ms debounce prevents rapid re-writes
- SIGINT cleanup clears interval, debounce timer, and file watcher
- `--help` updated with --watch and --interval documentation
- 14 unit tests covering: parseArgs, lifecycle, interval config, mermaid format, cleanup, DOT validity

### File List
- `.aios-core/core/graph-dashboard/cli.js` — Modified (added --watch, handleWatch, WATCH_FORMAT_MAP)
- `tests/graph-dashboard/watch-mode.test.js` — Created (14 tests)

### Change Log

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-02-21 | @devops (Gage) | Story created from research |
| 1.1 | 2026-02-21 | @po (Pax) | Validated GO (9.5/10). Fixed Task 2.1 (fs.watch default). Added visual test guide, risks table, DOT validity test (4.6). Status Draft → Ready |
| 1.2 | 2026-02-21 | @dev (Dex) | Implemented all 5 tasks. handleWatch() with setInterval + fs.watch + debounce. 14 tests. Status Ready → Ready for Review |

## QA Results

### Gate Decision: PASS (9.5/10)

**Reviewer:** @qa (Quinn) | **Date:** 2026-02-21 | **Model:** Claude Opus 4.6

### AC Traceability

| AC | Description | Code | Test | Status |
|----|-------------|------|------|--------|
| 1 | --watch gera .aios/graph.dot | cli.js:124-135 | watch-mode.test.js:88-97 | PASS |
| 2 | Re-gera a cada N segundos | cli.js:145 setInterval | watch-mode.test.js:111-146 | PASS |
| 3 | File watcher entity-registry.yaml | cli.js:149-162 fs.watch+debounce | Indirect (cleanup tested) | PASS |
| 4 | DOT compativel Graphviz Preview | cli.js:134 formatAsDot | watch-mode.test.js:165-172 | PASS |
| 5 | --format=mermaid gera .mmd | cli.js:121-122 WATCH_FORMAT_MAP | watch-mode.test.js:99-109 | PASS |
| 6 | Ctrl+C cleanup graceful | cli.js:164-178 | watch-mode.test.js:122-134 | PASS |
| 7 | Testes unitarios | 14 testes | 14/14 passing | PASS |

### Independent Verification

| Check | Result |
|-------|--------|
| `npx jest tests/graph-dashboard/` | 158/158 PASS (144 existing + 14 new) |
| `npx eslint` (modified files) | 0 errors |
| Regression | 0 failures |

### Issues

| # | Severity | Category | Description | Recommendation |
|---|----------|----------|-------------|----------------|
| 1 | LOW | code | SIGINT listener acumula em chamadas multiplas a handleWatch() | Considerar process.once() ou removeListener no cleanup. Tech debt menor. |

### Observations

- Zero dependencias externas adicionadas — excelente decisao
- Design testavel com state object return pattern
- Debounce 300ms previne file write storms
- Cleanup completo (interval + timeout + watcher)
- Constantes bem extraidas (DEBOUNCE_MS, DEFAULT_WATCH_INTERVAL_MS, WATCH_FORMAT_MAP)
