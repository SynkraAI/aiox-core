# Research Report: Entity Registry Governance

## Executive Summary

A analise de 5 sistemas maduros (Nx, Backstage, DataHub, Rush, vis-network) revela que o problema do AIOS entity-registry nao e apenas "filtrar N/A" — e uma questao de **arquitetura de governanca** que envolve 4 camadas: discovery, classification, lifecycle e visualization.

**Insight principal:** 72% das dependencias "nao resolvidas" (344/750) sao causadas por **diretorios nao escaneados** (`infrastructure/scripts/`, `product/checklists/`), nao por noise. Resolver o scan config elimina a maioria do problema antes de qualquer filtragem sofisticada.

---

## 1. Discovery: Como Sistemas Maduros Descobrem Entidades

### Nx: Plugin-Based Discovery (createNodesV2)

O Nx usa um sistema de plugins onde cada plugin define **file patterns** para identificar projetos:

```typescript
// Plugin exports:
export const createNodesV2 = (filePatterns, config, context) => {
  // Returns tuples: [configFile, { projects: { ... } }]
};
export const createDependencies = (_, __, context) => {
  // Returns DependencySpec[]
};
```

**Padroes relevantes:**
- **File-pattern based**: Plugins recebem `filesToProcess` (changed files only) para analise incremental
- **Shallow merging**: Properties de multiplos plugins sao merged (targets, tags, implicitDependencies)
- **Lazy hydration** (2026): Grafo minimo que expande nodes sob demanda — evita carregar tooling de linguagens nao usadas

**Aplicabilidade ao AIOS:** O `SCAN_CONFIG` atual e uma versao simplificada do pattern Nx. Falta:
1. Diretorios `infrastructure/` e `product/` no config
2. Pattern incremental (filesToProcess vs full scan)
3. Plugin extensibility (adicionar providers sem mudar core)

### Backstage: Provider-Based Ingestion

Backstage separa a **descoberta** (ingestion providers) do **processamento** (processor pipeline):

```
Ingestion Provider → Entity → Processing Pipeline → Stitching → Catalog
```

**Padroes relevantes:**
- Providers emitem entidades; processadores validam/enriquecem
- Entidades que param de ser emitidas sao **orfanadas** automaticamente
- `backstage.io/orphan: 'true'` annotation adicionada automaticamente
- Config `orphanStrategy: keep` preserva orfaos (default: remove)

**Aplicabilidade ao AIOS:** O scanner faz discovery + processing num passo so. Separar seria overengineering, mas a **deteccao de orfaos** e diretamente aplicavel.

---

## 2. Classificacao de Dependencias

### Taxonomia Consensual (Cross-System)

| Tipo | Descricao | Exemplos AIOS | Acao |
|------|-----------|--------------|------|
| **resolved-internal** | Dep que mapeia para entidade no registry | `dev-develop-story` → task | Manter, mostrar no graph |
| **external-tool** | Ferramenta externa, nao e entidade do framework | `coderabbit`, `git`, `supabase` | Taggear como `external`, opcional no graph |
| **phantom** | Referencia a arquivo/modulo que deveria existir mas nao existe | `execute-task.js`, `task-runner.js` | **Prioridade**: verificar se deveria estar no SCAN_CONFIG |
| **planned** | Modulo conceitual futuro | `code-intel`, `permissions` | Taggear como `planned`, dim no graph |
| **sentinel** | Valor placeholder sem significado | `N/A`, `none`, `TBD` | **Filtrar** (remover do registry) |
| **noise** | Texto capturado por regex que nao e referencia real | `Docker MCP Toolkit`, `filesystem access` | **Filtrar** (remover do registry) |

### Rush: Phantom Dependencies

Rush define phantom deps como "packages that code uses but aren't declared in package.json". A deteccao funciona via:
- Symlinking strategy que garante apenas deps declaradas em node_modules
- Parent folder scanning para detectar phantoms hoisted

**Aplicabilidade ao AIOS:** O conceito de "phantom" se aplica diretamente — `execute-task.js` referenciado por 49 tasks mas **nao existe no disco** (nem no SCAN_CONFIG). E um phantom real — provavelmente um modulo planejado.

### Nx: @nx/dependency-checks

Nx usa ESLint rule que automaticamente detecta e corrige mismatches entre deps declaradas e usadas. Pattern: **validacao na fonte** (no momento do scan, nao pos-scan).

---

## 3. Entity Lifecycle (Backstage Model)

### spec.lifecycle Field

Backstage define 3 estados de lifecycle via campo `spec.lifecycle`:

```yaml
apiVersion: backstage.io/v1alpha1
kind: Component
metadata:
  name: my-service
  annotations:
    backstage.io/orphan: 'true'  # Auto-set when parent stops emitting
spec:
  lifecycle: production  # experimental | production | deprecated
  owner: team-platform
```

**3 estados:**

| Estado | Significado | Graph Rendering |
|--------|-------------|-----------------|
| `experimental` | Early stage, nao-production | Dim, borda tracejada |
| `production` | Estavel, mantido, owned | Normal (full color, full opacity) |
| `deprecated` | End-of-life, pode desaparecer | Cinza, opacity reduzida |

**Padroes adicionais:**
- **Orphan detection**: Automatico via annotation quando provider para de emitir entidade
- **Status field**: Read-only, populado por processors com type/level/message/error
- **Labels**: Classificacao queries com domain prefix (e.g., `team: platform`)
- **Tags**: Free-form classification (e.g., `web`, `api`, `internal`)

### Aplicabilidade ao AIOS

O entity-registry.yaml pode adotar um campo `lifecycle`:

```yaml
entities:
  tasks:
    dev-develop-story:
      path: .aios-core/development/tasks/dev-develop-story.md
      type: task
      lifecycle: production    # NEW
      purpose: "..."
      keywords: [...]
      dependencies: [...]
      usedBy: [...]
```

**Auto-deteccao de lifecycle:**
- `production`: usedBy > 0 AND dependencies resolvidas > 50%
- `experimental`: criado recentemente AND usedBy == 0
- `deprecated`: nome contendo patterns (`old-`, `backup-`, `deprecated`)
- `orphan`: 0 deps AND 0 usedBy (auto-detected)

---

## 4. Registry Governance (DataHub Model)

### Aspect-Based Architecture

DataHub trata metadata como **aspects** — unidades atomicas de escrita que podem ser atualizadas independentemente:

```
Entity → [Aspect1, Aspect2, Aspect3, ...]
         (lifecycle) (keywords) (checksum)
```

**Padroes relevantes:**
- Cada aspect pode ser atualizado sem tocar os outros
- Validacao na ingestao contra schema (PDL schemas)
- Key aspects restritos a STRING/ENUM (previne bloat)
- Strict mode rejeita campos nao-mapeados

### Yamale: Schema Validation para YAML

Yamale (23andMe) oferece validacao de YAML com constraints:

```yaml
# Schema
name: str(min=1, max=63)
type: enum('task', 'module', 'script', 'template', 'agent', 'checklist', 'data', 'workflow', 'util', 'tool')
lifecycle: enum('production', 'experimental', 'deprecated', 'orphan', required=False)
dependencies: list(str(), required=False)
```

**Padroes relevantes:**
- `str(min/max)`: Previne nomes vazios ou excessivamente longos
- `enum()`: Restricao a valores validos
- `list(min/max)`: Controle de cardinalidade
- Modular includes via `---` separator (schema fragments reutilizaveis)
- Strict mode (default) rejeita campos extras

### Aplicabilidade ao AIOS

1. **Schema validation**: Validar registry apos geracao (rejeitar entidades com campos invalidos)
2. **Bloat prevention**: Rejeitar entidades sem `purpose` ou com keywords vazias
3. **Incremental enrichment**: Atualizar `lifecycle` e `checksum` sem re-escanear tudo

---

## 5. Graph Visualization (vis-network)

### DataView Filtering

vis-network oferece `DataView` para filtrar nodes sem modificar dados source:

```javascript
const nodesView = new vis.DataView(nodes, {
  filter: function(item) {
    // Filter by lifecycle
    if (hiddenLifecycles.includes(item.lifecycle)) return false;
    // Filter by category
    if (hiddenCategories.includes(item.category)) return false;
    // Filter orphans
    if (hideOrphans && item.deps === 0 && item.usedBy === 0) return false;
    return true;
  }
});

// After filter changes:
nodesView.refresh();
```

### Performance com 500+ Nodes

| Tecnica | Quando Usar |
|---------|------------|
| `hideEdgesOnDrag: true` | Sempre (melhora drag performance) |
| `hideEdgesOnZoom: true` | Grafos > 300 edges |
| `hideNodesOnDrag: true` | Grafos > 500 nodes |
| Clustering automatico | > 100 nodes por categoria |
| Clustering by zoom level | Grafos hierarquicos |

### Layout Algorithms

| Algoritmo | Nodes | Uso |
|-----------|-------|-----|
| barnesHut | < 1000 | Default, bom para grafos gerais |
| forceAtlas2 | 1000-5000 | Melhor clustering visual |
| hierarchical | < 500 | Quando ha hierarquia clara |
| repulsion | < 200 | Pequenos subgrafos |

### Nx Graph Features (Referencia)

O graph do Nx oferece:
- **Focus mode**: `nx graph --focus <project>` — mostra apenas vizinhos
- **Search**: Filtro por nome
- **Composite nodes**: Agrupamento por pasta, expandivel
- **JSON export**: `nx graph --file=output.json` para integracao externa

---

## 6. Analise de Dados AIOS (Real)

### Distribuicao de Deps Nao Resolvidas (750 total)

```
SENTINEL (N/A):          111 (14.8%) → FILTER
EXTERNAL_TOOL:            28 (3.7%)  → TAG
FILE_REF_MISSING:        344 (45.9%) → SCAN CONFIG FIX (87 infra scripts + 16 product checklists)
CHECKLIST_REF:            54 (7.2%)  → SCAN CONFIG FIX (product/checklists/)
UTIL_REF:                 50 (6.7%)  → SCAN CONFIG FIX (infrastructure/scripts/)
EXTERNAL_CONCEPT:         23 (3.1%)  → FILTER
MODULE_CONCEPT:           99 (13.2%) → TAG as planned
COMMENT_NOISE:             3 (0.4%)  → FILTER
MIXED:                    38 (5.0%)  → REVIEW case-by-case
```

### Impacto do Scan Config Fix

Se adicionarmos `infrastructure/scripts/` e `product/checklists/` ao SCAN_CONFIG:

| Metrica | Antes | Depois (estimado) |
|---------|-------|-------------------|
| Total entities | 563 | ~666 (+87 infra scripts, +16 product checklists) |
| Total deps | 1570 | ~1570 (mesmos) |
| Resolved deps | 820 (52%) | ~1200+ (~76%) |
| Unresolved deps | 750 (48%) | ~370 (~24%) |

Adicionar sentinel filter + noise filter reduziria para ~230 unresolved (~15%), quase todos `planned` ou `external`.

---

## Decision Matrix

| Problema | Solucao | Prioridade | Impacto |
|----------|---------|-----------|---------|
| P1: Missing scan dirs | Add 4+ SCAN_CONFIG entries | **P0** (maior impacto) | -448 unresolved deps |
| P2: Sentinel values | isSentinel() filter | P1 | -111 unresolved deps |
| P2: Noise (NL text) | isNoise() filter | P1 | -26 unresolved deps |
| P2: External tools | Tag as `external-tool` | P2 | Melhor graph semantics |
| P2: Planned modules | Tag as `planned` | P2 | Melhor graph semantics |
| P3: Lifecycle states | Add `lifecycle` field | P2 | Graph filtering habilitado |
| P3: Orphan detection | Auto-detect (0 deps + 0 usedBy) | P2 | 67 entities classified |
| P4: Schema validation | Post-scan validation pass | P3 | Previne future bloat |
| P5: Graph filtering | vis-network DataView | P3 | UX improvement |
| P5: Focus mode | Subgraph by entity | P3 | UX improvement |
