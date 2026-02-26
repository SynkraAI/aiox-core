# Story: CODEINTEL-RP-001 — Code-Intel RegistryProvider

---

## Community Origin

- **Source:** Backlog item 1740200000001
- **Created By:** @architect (Aria)
- **Promoted By:** @po (Pax) — GO com condicoes (2026-02-23)

---

## Status

**Current:** Ready for Review
**Sprint:** TBD (standalone, next available)

---

## Executor Assignment

| Role | Agent | Responsibility |
|------|-------|---------------|
| **Executor** | @dev (Dex) | Implementation |
| **Quality Gate** | @architect (Aria) | Architecture review, provider contract validation |
| **QA** | @qa (Quinn) | Test coverage, regression validation |

---

## Story

**As a** AIOS framework user,
**I want** a native RegistryProvider for code-intel that uses Entity Registry as data source,
**So that** all 15+ tasks invoking code-intel helpers get real data (instead of `null`) without requiring an MCP server, enabling zero-latency code intelligence for ~70% of use cases.

### Context

- Code-intel has 6 helpers (dev, qa, planning, story, creation, devops) invoked by 15+ tasks
- ALL calls currently return `null` because no MCP provider is configured for most users
- System has graceful fallback (circuit breaker, session cache) — works without provider, but with zero data
- Entity Registry (`.aios-core/data/entity-registry.yaml`) has 737 entities across 14 categories with path, layer, type, purpose, keywords, usedBy, dependencies
- Epic TOK established 3-Tier Tool Mesh: T1 Always (native), T2 Deferred, T3 External (MCP)
- RegistryProvider is T1 (always loaded, PTC-eligible per ADR-3)
- Code Graph MCP remains T3 premium provider for AST-deep analysis

### Architecture Reference

- **Provider Interface:** `.aios-core/core/code-intel/providers/provider-interface.js` — 8 abstract primitives
- **Client:** `.aios-core/core/code-intel/code-intel-client.js` — circuit breaker, session cache, provider registry
- **Existing Provider:** `.aios-core/core/code-intel/providers/code-graph-provider.js` — MCP adapter pattern
- **Entity Registry:** `.aios-core/data/entity-registry.yaml` — 737 entities, 14 categories
- **Index:** `.aios-core/core/code-intel/index.js` — singleton client, enricher, convenience functions

---

## Acceptance Criteria

### AC1: RegistryProvider Class
- [ ] `RegistryProvider` extends `CodeIntelProvider` from `provider-interface.js`
- [ ] Constructor loads entity-registry.yaml and builds in-memory index
- [ ] Provider name is `'registry'`
- [ ] Lazy-loads registry on first call (not constructor) to avoid startup overhead

### AC2: Implement 5 Core Primitives
- [ ] `findDefinition(symbol)` — Matches entity by name/path/keywords, returns `{file, line, column, context}`
- [ ] `findReferences(symbol)` — Searches `usedBy` and `dependencies` fields across all entities, returns array of `{file, line, context}`
- [ ] `analyzeDependencies(path)` — Resolves dependency graph from entity `dependencies` field, returns `{nodes, edges}`
- [ ] `analyzeCodebase(path)` — Returns structural overview from entity categories/layers, returns `{files, structure, patterns}`
- [ ] `getProjectStats(options)` — Aggregates entity counts by category/layer, returns `{files, lines, languages}`

### AC3: Non-Implemented Primitives Return Null
- [ ] `findCallers(symbol)` returns `null` (requires AST — MCP only)
- [ ] `findCallees(symbol)` returns `null` (requires AST — MCP only)
- [ ] `analyzeComplexity(path)` returns `null` (requires AST — MCP only)

### AC4: Client Registration
- [ ] `CodeIntelClient._registerDefaultProviders()` registers RegistryProvider as first provider
- [ ] RegistryProvider has higher priority than CodeGraphProvider (fallback chain: Registry first, MCP second)
- [ ] `isCodeIntelAvailable()` returns `true` when RegistryProvider is registered (even without MCP)

### AC5: Pattern-Based Matching
- [ ] Symbol lookup uses fuzzy matching: exact name > path contains > keywords contains
- [ ] Case-insensitive matching for symbol names
- [ ] Results sorted by match quality (exact > partial > keyword)

### AC6: Cache Integration
- [ ] RegistryProvider results go through existing session cache (TTL 5min) in CodeIntelClient
- [ ] Entity registry file is loaded once and cached in-memory (not re-parsed per call)
- [ ] Cache invalidation: registry reloaded if file mtime changes (stat check, not watcher)

### AC7: PTC Eligibility
- [ ] RegistryProvider marked as `ptc_eligible: true` in tool-registry.yaml
- [ ] Tier classification: T1 (Always loaded)
- [ ] No MCP dependency — fully native JavaScript

### AC8: Helper Functions Work
- [x] `dev-helper.js` `checkBeforeWriting()` returns real data with RegistryProvider
- [x] `dev-helper.js` `suggestReuse()` returns real data with RegistryProvider
- [x] `qa-helper.js` `getBlastRadius()` returns real data with RegistryProvider
- [x] `qa-helper.js` `getReferenceImpact()` returns real data with RegistryProvider
- [x] `planning-helper.js` `getDependencyGraph()` returns real data with RegistryProvider
- [x] `planning-helper.js` `getCodebaseOverview()` returns real data with RegistryProvider
- [x] `story-helper.js` `suggestRelevantFiles()` returns real data with RegistryProvider

### AC9: Graceful Degradation
- [ ] If entity-registry.yaml is missing or malformed, RegistryProvider returns `null` for all calls (no crash)
- [ ] If entity-registry.yaml is empty, returns empty results (not errors)
- [ ] Circuit breaker in CodeIntelClient still works with RegistryProvider

### AC10: Entity Name Disambiguation (Codex Go-Condition 1)
- [ ] `byName` index handles 35 duplicate entity names without data loss (use `Map<string, Array<Entity>>` or composite key `name+type+layer`)
- [ ] Fuzzy match returns all candidates for ambiguous names, scored by relevance (exact+type > exact > partial)
- [ ] Deterministic tie-breaking: prefer L1 > L2 > L3 > L4, then alphabetical path
- [ ] Unit tests cover: `yaml-validator` (4 entries), `index` (3 entries), `backup-manager` (3 entries)

### AC11: Provider Detection Contract (Codex Go-Condition 2)
- [ ] `_detectProvider()` in `CodeIntelClient` supports native providers without `mcpCallFn`
- [ ] Add `isAvailable()` method to `CodeIntelProvider` base class (default: `false`)
- [ ] `CodeGraphProvider.isAvailable()` returns `true` when `mcpCallFn` is configured
- [ ] `RegistryProvider.isAvailable()` returns `true` when registry is loaded (non-empty)
- [ ] `_detectProvider()` uses `provider.isAvailable()` instead of checking `mcpCallFn` directly

### AC12: Unresolved Dependency Handling (Codex Go-Condition 3)
- [ ] `analyzeDependencies()` handles dependency edges that reference non-existent entities (~10.6% of edges)
- [ ] Unresolved edges included in output as `{node: name, resolved: false}` (not silently dropped)
- [ ] Graph output includes `unresolvedCount` field for transparency
- [ ] Unit test covers: entity with 3 deps where 1 is unresolvable

### AC13: Measurable Success Gate (Codex Go-Condition 4)
- [ ] After implementation, `isCodeIntelAvailable()` returns `true` in fresh session without MCP
- [ ] Helper null-rate drops from 100% to <30% (at least 5/7 helpers return non-null data)
- [ ] No performance regression: RegistryProvider call latency < 50ms (in-memory index)

### AC14: Zero Regression
- [x] All existing code-intel tests pass (2 test files updated to explicitly disable RegistryProvider in no-provider scenarios — backward-compatible change, not behavioral modification)
- [x] Existing helpers work identically when MCP is unavailable (now with registry data instead of null) — validated by 11 integration tests in helpers-with-registry.test.js
- [x] Provider-interface.js contract extended (not broken): `isAvailable()` added with default `return false` — fully backward-compatible, no existing code affected

---

## CodeRabbit Integration

### Story Type Analysis

- **Primary Type:** Code/Features/Logic (new provider implementation)
- **Complexity:** Medium-High (extends existing architecture, 5 primitives, integration with client)
- **Secondary Types:** Testing (unit + integration), Configuration (tool-registry update)

### Specialized Agent Assignment

| Agent | Role | Justification |
|-------|------|---------------|
| @dev (Dex) | Primary executor | Code implementation + tests |
| @architect (Aria) | Quality gate | Provider contract compliance, architecture pattern |
| @qa (Quinn) | QA review | Test coverage, regression validation |

### Predicted CodeRabbit Findings

| Category | Expected | Severity | Pre-Action |
|----------|----------|----------|------------|
| Error handling | Missing try/catch on YAML parse | MEDIUM | Use safe yaml parser with try/catch |
| Performance | Registry loaded synchronously | HIGH | Use lazy async loading |
| Security | YAML parse allows arbitrary types | MEDIUM | Use `js-yaml` with `JSON_SCHEMA` (safe) |
| Security | Path traversal in entity paths | LOW | Validate no `..` segments in paths |

### Quality Gate Configuration

```yaml
self_healing:
  enabled: true
  type: light
  max_iterations: 2
  severity_filter: [CRITICAL]
  behavior:
    CRITICAL: auto_fix
    HIGH: document_only
    MEDIUM: ignore
    LOW: ignore
```

### Focus Areas

- Provider contract compliance (all 8 primitives handled — 5 implemented, 3 return null)
- YAML parsing security (safe schema, no arbitrary types)
- Cache invalidation correctness (mtime-based reload)
- Graceful degradation (missing/malformed registry)
- Zero regression on existing tests

---

## Tasks / Subtasks

### Task 1: Create RegistryProvider Class
- [x] 1.1 Create `registry-provider.js` in `.aios-core/core/code-intel/providers/`
- [x] 1.2 Extend `CodeIntelProvider` with `name: 'registry'`
- [x] 1.3 Implement lazy registry loading (load on first primitive call)
- [x] 1.4 Parse entity-registry.yaml using `js-yaml` with `JSON_SCHEMA` (safe, no arbitrary types)
- [x] 1.5 Build in-memory index: byName `Map<string, Array<Entity>>` (handles 35 duplicate names), byPath Map, byCategory Map, byKeyword inverted index
- [x] 1.6 Implement `isAvailable()` — returns `true` when registry is loaded and non-empty
- [x] 1.7 Validate entity paths: reject entries with `..` segments (defense-in-depth)

### Task 2: Implement 5 Primitives
- [x] 2.1 `findDefinition(symbol)` — fuzzy match with disambiguation: score all candidates from `byName` array, apply tie-breaking (L1>L2>L3>L4, then alphabetical path), return best match
- [x] 2.2 `findReferences(symbol)` — scan `usedBy` + `dependencies` fields, aggregate all referencing entities
- [x] 2.3 `analyzeDependencies(path)` — build directed graph from entity dependencies field; mark unresolvable edges as `{node, resolved: false}`; include `unresolvedCount` in output
- [x] 2.4 `analyzeCodebase(path)` — aggregate entities by category/layer, produce structure overview
- [x] 2.5 `getProjectStats(options)` — count entities, unique paths, categorize by layer (L1-L4)
- [x] 2.6 Return `null` for `findCallers`, `findCallees`, `analyzeComplexity` (AST-only primitives)

### Task 3: Update Provider Detection Contract + Register in Client
- [x] 3.1 Add `isAvailable()` method to `CodeIntelProvider` base class (default: `return false`)
- [x] 3.2 Override `isAvailable()` in `CodeGraphProvider` — `return typeof this.options.mcpCallFn === 'function'`
- [x] 3.3 Refactor `_detectProvider()` to use `provider.isAvailable()` instead of checking `mcpCallFn` directly
- [x] 3.4 Update `_registerDefaultProviders()` to register RegistryProvider FIRST, then CodeGraphProvider
- [x] 3.5 Ensure provider priority: first `isAvailable() === true` in array order wins
- [x] 3.6 Verify `isCodeIntelAvailable()` returns `true` with RegistryProvider alone (no MCP)

### Task 4: Update Module Index
- [x] 4.1 Export `RegistryProvider` from `index.js`
- [x] 4.2 Add to module documentation

### Task 5: Update Tool Registry
- [x] 5.1 Add RegistryProvider entry to `.aios-core/data/tool-registry.yaml`
- [x] 5.2 Set `tier: 1`, `ptc_eligible: true`, `mcp_required: false`

### Task 6: Write Tests (Jest — project standard)
- [x] 6.1 Unit tests for RegistryProvider — all 5 implemented primitives (`tests/unit/code-intel/registry-provider.test.js`)
- [x] 6.2 Unit tests for null return on 3 AST-only primitives
- [x] 6.3 Unit tests for fuzzy matching (exact, partial, keyword) with disambiguation scoring
- [x] 6.4 Unit tests for entity name collisions: `yaml-validator` (4x), `index` (3x), `backup-manager` (3x) — verify all entries preserved, scoring correct
- [x] 6.5 Unit tests for graceful degradation (missing file, malformed YAML, empty registry)
- [x] 6.6 Unit tests for unresolved dependencies: entity with deps where some don't exist in registry — verify `resolved: false` markers and `unresolvedCount`
- [x] 6.7 Unit tests for `isAvailable()` on RegistryProvider and CodeGraphProvider
- [x] 6.8 Unit tests for refactored `_detectProvider()` — native provider detected without `mcpCallFn`
- [x] 6.9 Integration tests — verify helpers return real data with RegistryProvider (`tests/integration/code-intel/registry-provider-integration.test.js`)
- [x] 6.10 Integration test — verify existing tests pass (`npm test` — no regression)
- [x] 6.11 Test cache behavior — registry loaded once, reloaded on mtime change
- [x] 6.12 Performance test — RegistryProvider call latency < 50ms (in-memory index)

### Task 7: Validation
- [x] 7.1 Run full test suite: `npm test` (existing + new, Jest)
- [x] 7.2 Run lint + typecheck: `npm run lint && npm run typecheck`
- [x] 7.3 Verify `isCodeIntelAvailable()` returns `true` in fresh session
- [x] 7.4 Manual smoke test: invoke helper functions, confirm non-null results
- [x] 7.5 Measure token impact: compare session overhead before/after

---

## Dev Notes

### Architecture Pattern
Follow the same adapter pattern as `code-graph-provider.js`:
- Extend `CodeIntelProvider`
- Implement primitives that map to data source
- Use normalization helpers for consistent response format
- Non-implemented primitives inherit `null` from base class

### Entity Registry Schema (per entity)
```yaml
entityName:
  path: relative/path/to/file.js
  layer: L1|L2|L3|L4
  type: task|agent|template|checklist|script|config|...
  purpose: "One-line description"
  keywords: [keyword1, keyword2]
  usedBy: [entity1, entity2]
  dependencies: [dep1, dep2]
  checksum: sha256hash
```

### Key Implementation Details
1. **Fuzzy matching order:** exact entity name → path.includes(symbol) → keywords.includes(symbol)
2. **usedBy/dependencies are entity names** — resolve to paths via the byName index
3. **Registry path:** resolve from `core-config.yaml` → `dataLocation` → `entity-registry.yaml`
4. **Mtime check:** use `fs.statSync()` on registry file, compare to cached mtime
5. **Provider priority in client:** Array order matters — first `provider.isAvailable() === true` wins
6. **CRITICAL — `_detectProvider()` refactor required:** Current code checks `mcpCallFn` only (line 84-85 of code-intel-client.js). Must refactor to use `provider.isAvailable()` polymorphic method. Without this, RegistryProvider will never be detected. (Codex Go-Condition 2)
7. **YAML safe parsing:** Use `js-yaml` with `JSON_SCHEMA` (or `FAILSAFE_SCHEMA`) to prevent arbitrary object instantiation. Never use `DEFAULT_SCHEMA` which allows `!!js/function` and similar unsafe types
8. **Path validation:** Reject entity paths containing `..` segments — registry paths must be relative and within project root (defense-in-depth)
9. **Entity name collisions:** 35 duplicate names across 65 entries (e.g. `yaml-validator` 4x, `index` 3x). `byName` index MUST be `Map<string, Array<Entity>>`, not `Map<string, Entity>`. Disambiguation by scoring: exact name+type match > exact name > layer priority (L1>L2>L3>L4) > alphabetical path. (Codex Go-Condition 1)
10. **Unresolved dependencies:** ~10.6% of dependency edges reference entities not in registry. `analyzeDependencies()` must mark these as `{node: name, resolved: false}` and include `unresolvedCount` in output. (Codex Go-Condition 3)

### Files to Create
| File | Purpose |
|------|---------|
| `.aios-core/core/code-intel/providers/registry-provider.js` | RegistryProvider class |
| `tests/unit/code-intel/registry-provider.test.js` | Unit tests |
| `tests/integration/code-intel/registry-provider-integration.test.js` | Integration tests |

### Files to Modify
| File | Change |
|------|--------|
| `.aios-core/core/code-intel/providers/provider-interface.js` | Add `isAvailable()` method (default: `return false`) |
| `.aios-core/core/code-intel/providers/code-graph-provider.js` | Override `isAvailable()` — `return typeof this.options.mcpCallFn === 'function'` |
| `.aios-core/core/code-intel/code-intel-client.js` | Refactor `_detectProvider()` to use `provider.isAvailable()`, register RegistryProvider first |
| `.aios-core/core/code-intel/index.js` | Export RegistryProvider |
| `.aios-core/data/tool-registry.yaml` | Add RegistryProvider entry (T1, ptc_eligible) |

### Boundary Impact
- All files are in L3 (data) or L1 with allow exceptions — no boundary violations
- `providers/registry-provider.js` is NEW file in L1 path but part of code-intel module (framework contributor mode required since `boundary.frameworkProtection: false` is already set)

### ADR References
- **ADR-3:** PTC native ONLY — RegistryProvider is native, so PTC-eligible
- **ADR-5:** Search for discovery, Examples for accuracy — RegistryProvider enhances discovery
- **ADR-7:** Capability gate per runtime — RegistryProvider always available (no capability gate needed)

---

## Change Log

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-02-23 | @sm (River) | Story created from backlog item 1740200000001. Full architecture context gathered from 12 code-intel files + entity-registry. |
| 1.1 | 2026-02-23 | @sm (River) | Applied PO validation SF-1 (YAML safe schema + path validation in Dev Notes) and SF-2 (expanded CodeRabbit section with Story Type Analysis, Specialized Agents, Focus Areas, severity behavior). |
| 1.2 | 2026-02-23 | @po (Pax) | Applied NH-1: explicit test framework (Jest) in Task 6/7, test file paths, npm commands. Story status: Ready. |
| 2.0 | 2026-02-24 | @po (Pax) | Incorporated Codex Critical Analysis V2 findings. Added AC10-AC13 (disambiguation, provider detection, unresolved deps, success gate). Expanded Tasks 1-3, 6 with 12 new subtasks. Updated Dev Notes with 4 Codex go-conditions. Files to Modify expanded (+2 files). Sizing adjusted to 20-28h. |

---

## Dev Agent Record

### Agent Model Used
- Claude Opus 4.6

### Debug Log References
- N/A

### Completion Notes
- [x] Story implementation started
- [x] All tasks completed (7/7 tasks, 37/37 subtasks)
- [x] All tests passing (56 unit + 20 integration + 275 existing code-intel = 351 total, 0 failures)
- [x] Zero regression: existing fallback.test.js and code-intel-client.test.js updated to explicitly disable RegistryProvider when testing MCP-only scenarios
- [x] Story marked Ready for Review

### File List

**Created:**
| File | Purpose |
|------|---------|
| `.aios-core/core/code-intel/providers/registry-provider.js` | RegistryProvider class — native code-intel using entity-registry.yaml |
| `tests/unit/code-intel/registry-provider.test.js` | 56 unit tests covering all primitives, disambiguation, degradation, cache, performance |
| `tests/integration/code-intel/registry-provider-integration.test.js` | 9 integration tests with real entity-registry.yaml |
| `tests/integration/code-intel/helpers-with-registry.test.js` | 11 integration tests validating AC8 (7 helpers return real data) and AC13 (null-rate <30%) |

**Modified:**
| File | Change |
|------|--------|
| `.aios-core/core/code-intel/providers/provider-interface.js` | Added `isAvailable()` method to base class (default: `return false`) |
| `.aios-core/core/code-intel/providers/code-graph-provider.js` | Added `isAvailable()` override checking `mcpCallFn` |
| `.aios-core/core/code-intel/code-intel-client.js` | Refactored `_detectProvider()` to use `provider.isAvailable()`, registered RegistryProvider first in `_registerDefaultProviders()` |
| `.aios-core/core/code-intel/index.js` | Added RegistryProvider import and export |
| `.aios-core/data/tool-registry.yaml` | Added `registry-provider` entry (T1, ptc_eligible: true, mcp_required: false) |
| `tests/code-intel/fallback.test.js` | Updated to explicitly disable RegistryProvider in no-provider scenarios |
| `tests/code-intel/code-intel-client.test.js` | Updated to explicitly disable RegistryProvider in MCP-only test scenarios |

---

## QA Results

### Review Date: 2026-02-24

### Reviewed By: Quinn (Test Architect)

### Code Quality Assessment

Implementacao de alta qualidade. O RegistryProvider segue fielmente o adapter pattern do CodeGraphProvider, com lazy loading (mtime-based), safe YAML parsing (JSON_SCHEMA), path traversal defense, e 4 indexes in-memory (byName, byPath, byCategory, byKeyword). Disambiguation scoring e deterministico (L1>L2>L3>L4 + alphabetical path). 516 linhas de codigo limpo, bem documentado, sem issues de seguranca ou performance.

### Refactoring Performed

Nenhum refactoring necessario. Codigo segue patterns existentes e esta limpo.

### Compliance Check

- Coding Standards: PASS — Segue convencoes do projeto (underscore prefix para unused vars, 'use strict', JSDoc)
- Project Structure: PASS — Arquivo criado no local correto (providers/), testes em tests/unit/ e tests/integration/
- Testing Strategy: PASS — 56 unit + 9 integration tests, fixtures YAML, performance tests
- All ACs Met: PASS — AC8 resolvido com 11 testes individuais para helpers, AC14 checkboxes atualizados com notas explicativas

### Improvements Checklist

- [x] Todas as 5 primitives implementadas e testadas
- [x] Disambiguation scoring com 35 duplicates simulados
- [x] Graceful degradation para todos os cenarios
- [x] Path traversal defense
- [x] Safe YAML parsing
- [x] Performance <50ms verificado
- [x] Adicionar testes diretos para cada helper function individualmente (AC8 — resolvido: helpers-with-registry.test.js com 11 testes)
- [ ] Considerar dedup no findReferences() para evitar duplicatas quando entity A.usedBy=[B] e B.dependencies=[A]
- [ ] Substituir `fs.rmdirSync(recursive)` por `fs.rmSync(recursive)` nos testes (deprecated em Node 18+)

### Security Review

PASS — Nenhuma vulnerabilidade encontrada.
- YAML parsing usa `JSON_SCHEMA` (previne `!!js/function` e tipos arbitrarios)
- Path traversal: entidades com `..` no path sao rejeitadas
- Nenhum eval/exec, nenhum input externo nao validado
- Synchronous file I/O usado apenas no lazy loading (aceitavel para provider pattern)

### Performance Considerations

PASS — Performance excelente.
- Lazy loading: registry carregado apenas no primeiro uso
- Mtime-based caching: re-parse apenas quando arquivo muda
- In-memory indexes: O(1) lookup por nome, O(n) para path-contains (aceitavel com 737 entidades)
- Testes confirmam <50ms por chamada (100 iteracoes)

### Files Modified During Review

Nenhum arquivo modificado pelo QA.

### Gate Status

Gate: **PASS** → docs/qa/gates/CODEINTEL-RP-001-code-intel-registryprovider.yml

### Recommended Status

PASS — Ready for Done

**Nota sobre AC14:** Os 2 test files existentes foram modificados para adicionar `registryPath: '/non/existent/registry.yaml'` — isso e necessario e correto (os testes precisam desabilitar RegistryProvider explicitamente ao testar cenarios no-provider). A modificacao nao altera o comportamento dos testes, apenas os adapta ao novo provider. O `isAvailable()` adicionado a provider-interface.js e uma adicao backward-compatible (default `false`), nao uma breaking change.

**Nota sobre AC8:** Os 7 helpers nao foram testados individualmente, mas seus primitives subjacentes (findDefinition, findReferences, analyzeDependencies, analyzeCodebase, getProjectStats) estao totalmente testados. O teste de integracao via `enrichWithCodeIntel()` valida o pipeline end-to-end. Risco residual: LOW.

— Quinn, guardiao da qualidade

---
