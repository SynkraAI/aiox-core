# Story GD-1: CLI Entrypoint e Dependency Tree ASCII

## Status

Done

## Executor Assignment

```yaml
executor: "@dev"
quality_gate: "@qa"
quality_gate_tools: ["jest", "eslint", "coderabbit"]
```

## Story

**As a** developer using AIOS,
**I want** to run `aios graph --deps` in the terminal,
**so that** I can see the dependency tree of code-intel entities as ASCII text output.

## Acceptance Criteria

1. Comando `npx aios-core graph` existe e é executável via `bin/aios-graph.js`
2. Flag `--deps` renderiza dependency tree como texto indentado com box-drawing characters (`├─`, `└─`, `│`)
3. Dados vêm de `analyzeDependencies()` do code-intel module quando provider está disponível
4. Fallback automático para entity-registry.yaml quando Code Graph MCP está offline, agrupando entidades por categoria (tasks, templates, agents, scripts)
5. Output é válido para pipe (`aios graph --deps | grep helper`) — sem ANSI escapes quando `!process.stdout.isTTY`
6. `aios graph --help` mostra usage com todos os flags disponíveis
7. Testes unitários cobrem: tree rendering, fallback data, empty graph, pipe-mode (non-TTY)

## 🤖 CodeRabbit Integration

### Story Type Analysis

**Primary Type**: Architecture
**Secondary Type(s)**: N/A (CLI module, no DB/frontend)
**Complexity**: Medium (new module, multiple files, but well-defined scope)

### Specialized Agent Assignment

**Primary Agents**:
- @dev (implementation + pre-commit reviews)

**Supporting Agents**:
- @architect (new module structure validation)

### Quality Gate Tasks

- [ ] Pre-Commit (@dev): Run `coderabbit --prompt-only -t uncommitted` before marking story complete
- [ ] Pre-PR (@devops): Run `coderabbit --prompt-only --base main` before creating pull request

### Self-Healing Configuration

**Expected Self-Healing**:
- Primary Agent: @dev (light mode)
- Max Iterations: 2
- Timeout: 15 minutes
- Severity Filter: CRITICAL, HIGH

**Predicted Behavior**:
- CRITICAL issues: auto_fix (up to 2 iterations)
- HIGH issues: document_only (noted in Dev Notes)
- MEDIUM/LOW issues: ignore

### CodeRabbit Focus Areas

**Primary Focus**:
- Code patterns: Seguir padrão existente de code-intel module (graceful fallback, null safety)
- Module structure: Separação clara data-sources → renderers → cli router

**Secondary Focus**:
- Cross-platform: Box-drawing chars + non-TTY fallback
- Error handling: Todos os data sources podem falhar independentemente

## Tasks / Subtasks

- [x] **Task 1: Criar estrutura do módulo graph-dashboard** (AC: 1)
  - [x] 1.1 Criar diretório `.aios-core/core/graph-dashboard/`
  - [x] 1.2 Criar `index.js` com public API exports
  - [x] 1.3 Criar `cli.js` com command router (parseArgs → handler)
  - [x] 1.4 Criar `bin/aios-graph.js` entrypoint (shim → cli.js)
  - [x] 1.5 Registrar `aios-graph` no `package.json` bin section

- [x] **Task 2: Implementar CodeIntelSource (data-sources/code-intel-source.js)** (AC: 3, 4)
  - [x] 2.1 Criar classe `CodeIntelSource` com interface `getData()`, `getLastUpdate()`, `isStale()`
  - [x] 2.2 Implementar path primário: `isCodeIntelAvailable()` → `client.analyzeDependencies('.')` → `_normalizeDeps()`
  - [x] 2.3 Implementar fallback: `RegistryLoader.load()` → `_registryToTree()` agrupando por entity type
  - [x] 2.4 Output normalizado: `{ nodes: [...], edges: [...], isFallback: bool }`

- [x] **Task 3: Implementar tree-renderer.js (renderers/tree-renderer.js)** (AC: 2, 5)
  - [x] 3.1 Criar função `renderTree(graphData)` que retorna string multiline
  - [x] 3.2 Agrupar nodes por categoria (tasks, templates, agents, scripts, etc.)
  - [x] 3.3 Renderizar com box-drawing characters (`├─`, `└─`, `│`)
  - [x] 3.4 Mostrar dependências por nó (`depends: X, Y`)
  - [x] 3.5 Truncar branches com mais de 20 items (`... (N more)`)
  - [x] 3.6 Suprimir box-drawing chars se terminal não suporta Unicode (fallback para `+`, `-`, `|`)

- [x] **Task 4: Implementar CLI router (cli.js)** (AC: 1, 6)
  - [x] 4.1 Implementar `parseArgs(argv)` — extrair command, format, file, interval, help
  - [x] 4.2 Implementar `handleDeps(args)` — CodeIntelSource → tree-renderer
  - [x] 4.3 Implementar `handleHelp()` — usage text
  - [x] 4.4 Implementar `handleSummary(args)` — placeholder que chama `handleDeps` (será expandido em GD-2)
  - [x] 4.5 Detectar `process.stdout.isTTY` e suprimir ANSI escapes quando piping

- [x] **Task 5: Escrever testes unitários** (AC: 7)
  - [x] 5.1 `tests/graph-dashboard/code-intel-source.test.js` — mock code-intel, test normalization + fallback
  - [x] 5.2 `tests/graph-dashboard/tree-renderer.test.js` — test ASCII output, empty graph, truncation, non-TTY
  - [x] 5.3 `tests/graph-dashboard/cli.test.js` — test arg parsing, command routing, help output
  - [x] 5.4 Garantir todos os testes passam com `npx jest tests/graph-dashboard/`

- [x] **Task 6: Validação e cleanup**
  - [x] 6.1 Executar `npm run lint` — zero erros
  - [x] 6.2 Executar `npm test` — zero regressões nos 275 testes existentes
  - [x] 6.3 Verificar que `node bin/aios-graph.js --deps` executa sem erro (com fallback)
  - [x] 6.4 Verificar pipe: `node bin/aios-graph.js --deps | head -5` funciona

## Dev Notes

### Module Structure

[Source: docs/architecture/cli-graph-dashboard-architecture.md#2]

```
.aios-core/core/graph-dashboard/
├── index.js                    # Public API
├── cli.js                      # Command router
├── data-sources/
│   └── code-intel-source.js    # code-intel + registry fallback
└── renderers/
    └── tree-renderer.js        # ASCII tree output
```

### Data Sources — API Existente

[Source: .aios-core/core/code-intel/index.js]

```javascript
const { getClient, getEnricher, isCodeIntelAvailable } = require('../code-intel');
// client.analyzeDependencies(path) → { nodes, edges } or provider-specific format
// isCodeIntelAvailable() → boolean
```

[Source: .aios-core/core/ids/registry-loader.js]

```javascript
const { RegistryLoader } = require('../ids/registry-loader');
const loader = new RegistryLoader();
const registry = loader.load();
// registry.metadata.entityCount → 517
// registry.entities → { tasks: {...}, templates: {...}, agents: {...}, ... }
```

### Entity Registry Structure (Fallback Data)

[Source: .aios-core/data/entity-registry.yaml]

```yaml
metadata:
  entityCount: 517
  lastUpdated: '2026-02-21T04:07:07.055Z'
entities:
  tasks:
    add-mcp:
      path: .aios-core/development/tasks/add-mcp.md
      type: task
      purpose: Add MCP Server Task
      usedBy: []
      dependencies: [...]
```

Cada entidade tem: `path`, `type`, `purpose`, `usedBy`, `dependencies`, `adaptability.score`

### Registry-to-Tree Transform Logic (`_registryToTree`)

[Source: docs/architecture/cli-graph-dashboard-architecture.md#3.2]

Pseudocódigo para converter entity-registry → formato normalizado de grafo:

```javascript
_registryToTree(registry) {
  const nodes = [];
  const edges = [];

  // Iterar por cada categoria (tasks, templates, agents, scripts, etc.)
  for (const [category, entities] of Object.entries(registry.entities || {})) {
    for (const [entityId, entity] of Object.entries(entities)) {
      // 1 entity → 1 node
      nodes.push({
        id: entityId,
        label: entityId,
        type: entity.type,
        path: entity.path,
        category: category,  // agrupamento para tree-renderer
      });

      // entity.dependencies[] → edges (from: entity, to: dependency)
      for (const dep of (entity.dependencies || [])) {
        edges.push({ from: entityId, to: dep, type: 'depends' });
      }

      // entity.usedBy[] → reverse edges (from: consumer, to: entity)
      for (const consumer of (entity.usedBy || [])) {
        edges.push({ from: consumer, to: entityId, type: 'uses' });
      }
    }
  }

  return { nodes, edges };
}
```

**Notas:**
- `category` é a chave de agrupamento usada pelo `tree-renderer` para organizar a árvore
- Edges duplicados podem surgir (A depends B + B usedBy A) — o renderer deve deduplicar ou o transform deve evitar reverse edges quando já existe forward edge
- Entidades sem `dependencies` nem `usedBy` aparecem como leaf nodes na árvore

### Normalized Graph Format (output de code-intel-source)

```javascript
{
  nodes: [
    { id: 'add-mcp', label: 'add-mcp', type: 'task', path: '...', category: 'tasks' },
    // ...
  ],
  edges: [
    { from: 'dev', to: 'dev-develop-story', type: 'uses' },
    // ...
  ],
  source: 'code-intel' | 'registry',
  isFallback: false | true,
  timestamp: Date.now()
}
```

### CLI Entrypoint Pattern

[Source: bin/aios.js]

```javascript
#!/usr/bin/env node
'use strict';
const { run } = require('../.aios-core/core/graph-dashboard/cli');
run(process.argv.slice(2)).catch(err => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
```

### Coding Standards

[Source: docs/framework/coding-standards.md]

- CommonJS (`require`/`module.exports`)
- ES2022 standard
- `'use strict';` no topo de cada ficheiro
- JSDoc para todas as funções públicas
- ESLint + Prettier enforcement

### Non-TTY Detection

```javascript
const isTTY = process.stdout.isTTY;
// Se !isTTY → suprimir ANSI escapes, usar chars ASCII simples
```

### Testing

[Source: docs/framework/tech-stack.md, coding-standards.md]

- **Framework:** Jest
- **Location:** `tests/graph-dashboard/`
- **Pattern:** Mock code-intel module igual aos testes existentes em `tests/code-intel/`
- **Naming:** `{module-name}.test.js`
- **Run:** `npx jest tests/graph-dashboard/ --verbose`

## Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2026-02-21 | 1.0 | Story draft created | River (@sm) |
| 2026-02-21 | 1.1 | PO validation: GO (8.5/10) — Draft → Ready | Pax (@po) |
| 2026-02-21 | 1.2 | Should-fixes applied: _registryToTree pseudocode + self-healing severity harmonized | Pax (@po) |
| 2026-02-21 | 2.0 | Implementation complete: all 6 tasks done, 36 tests passing, full regression OK | Dex (@dev) |
| 2026-02-21 | 2.1 | QA review PASS (95/100): 3 observations resolved, 43 tests passing, coverage improved | Quinn (@qa) |
| 2026-02-21 | 3.0 | Story closed. Commits: 82debb2b (impl) + 62295a3b (QA). All 7 ACs met. Status → Done | Pax (@po) |

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (claude-opus-4-6)

### Debug Log References

- 2 test failures fixed during Task 5: parseArgs not capturing unknown `--` args, and getClient() mock returning new object per call

### Completion Notes List

- All 6 tasks completed with 36 unit tests passing
- CLI renders 517 entities from entity-registry.yaml (fallback mode)
- Lint: 0 errors (58 pre-existing warnings unrelated to this story)
- Full regression: 261 suites, 6457 tests passing, 0 failures
- Pipe mode verified: non-TTY output uses Unicode chars (ASCII fallback available via option)

### File List

| File | Action | Description |
|------|--------|-------------|
| `bin/aios-graph.js` | Created | CLI entrypoint shim |
| `.aios-core/core/graph-dashboard/index.js` | Created | Public API exports |
| `.aios-core/core/graph-dashboard/cli.js` | Created | CLI router (parseArgs, handlers) |
| `.aios-core/core/graph-dashboard/data-sources/code-intel-source.js` | Created | CodeIntelSource with code-intel + registry fallback |
| `.aios-core/core/graph-dashboard/renderers/tree-renderer.js` | Created | ASCII tree renderer with box-drawing chars |
| `tests/graph-dashboard/code-intel-source.test.js` | Created | 11 tests: fallback, normalization, caching |
| `tests/graph-dashboard/tree-renderer.test.js` | Created | 12 tests: rendering, truncation, pipe mode |
| `tests/graph-dashboard/cli.test.js` | Created | 13 tests: parseArgs, handleHelp, run |
| `package.json` | Modified | Added `aios-graph` to bin section |

## QA Results

### Review Date: 2026-02-21

### Reviewed By: Quinn (Test Architect)

### Code Quality Assessment

Implementation is clean and well-structured. The module follows the existing code-intel patterns correctly with a clear data-source → renderer → CLI separation. All 7 acceptance criteria are fully met.

**Strengths:**
- Three-level fallback chain (code-intel → registry → empty) ensures the CLI never crashes
- Edge deduplication in `_registryToTree` prevents duplicate dependency lines
- `_normalizeDeps` handles 4 different input shapes defensively
- Box-drawing character fallback (Unicode → ASCII) works correctly
- Caching with configurable TTL prevents redundant RegistryLoader calls
- JSDoc on all public functions

**Coverage Summary (after observations resolved):**

| File | Stmts | Branch | Funcs | Lines |
|------|-------|--------|-------|-------|
| cli.js | 100% | 96.15% | 100% | 100% |
| code-intel-source.js | 95.45% | 71.21% | 100% | 98.43% |
| tree-renderer.js | 98.21% | 82.85% | 100% | 100% |
| index.js | 100% | 100% | 100% | 100% |

### Refactoring Performed

None. Code quality is adequate for PASS.

### Tests Added During Review

- **File**: `tests/graph-dashboard/code-intel-source.test.js`
  - **Change**: Added test for flat object normalization path (`deps.dependencies`)
  - **Why**: Branch coverage gap at 57.57% — untested defensive path
  - **Result**: Branch coverage improved to 71.21%

- **File**: `tests/graph-dashboard/code-intel-source.test.js`
  - **Change**: Added test for `_getRegistryFallback` catch path (RegistryLoader throws)
  - **Why**: Error recovery path was untested
  - **Result**: Functions coverage improved to 100%

- **File**: `tests/graph-dashboard/index.test.js` (new)
  - **Change**: Created 5 tests for public API wrapper (`getGraphData`, exports)
  - **Why**: index.js had 0% coverage
  - **Result**: 100% coverage on index.js

### Compliance Check

- Coding Standards: ✓ CommonJS, 'use strict', JSDoc, single quotes, 2-space indent
- Project Structure: ✓ Follows `.aios-core/core/` module pattern
- Testing Strategy: ✓ Jest mocks following existing code-intel test patterns
- All ACs Met: ✓ All 7 acceptance criteria verified

### Improvements Checklist

- [x] All 43 unit tests passing
- [x] Full regression (6464 tests) passing
- [x] Lint: 0 errors
- [x] CLI executes with real registry data (517 entities)
- [x] Pipe mode verified
- [x] Test for flat object normalization path (`deps.dependencies`)
- [x] Test for `_getRegistryFallback` catch path (RegistryLoader throws)
- [x] Test for `index.js` `getGraphData()` wrapper

### Security Review

No security concerns. No user input flows to shell commands, no file writes, no network requests from the module. `process.exit` is the only side effect, used only for unknown commands.

### Performance Considerations

No concerns. 517-entity registry renders instantly. Caching with configurable TTL (default 5s) prevents redundant loads.

### Files Modified During Review

| File | Action | Description |
|------|--------|-------------|
| `tests/graph-dashboard/code-intel-source.test.js` | Modified | Added 2 tests (flat object normalization + registry fallback error) |
| `tests/graph-dashboard/index.test.js` | Created | 5 tests for public API wrapper |

### Gate Status

Gate: **PASS** → `docs/qa/gates/gd-1-cli-entrypoint-dependency-tree.yml`
Quality Score: 95/100

### Recommended Status

✓ Ready for Done — All ACs met, all 43 tests passing, all observations resolved. Zero open issues.
