# Recommendations: Entity Registry Governance

## Next Steps para @pm e @dev

### Recomendacao 1: Dividir NOG-16 em 3 Stories Incrementais

A story NOG-16 original ("Dependency Quality Filters") e muito limitada. Com base na pesquisa, recomendamos 3 stories incrementais:

---

### Story NOG-16A: Scan Config Expansion + Sentinel Filter (P0 — Maior impacto)

**Scope:** Expandir SCAN_CONFIG para cobrir directories faltantes + filtro de sentinels

**Tasks:**
1. Adicionar ao SCAN_CONFIG:
   - `{ category: 'infra-scripts', basePath: '.aios-core/infrastructure/scripts', glob: '**/*.js', type: 'script' }`
   - `{ category: 'infra-tools', basePath: '.aios-core/infrastructure/tools', glob: '**/*.{yaml,yml,md}', type: 'tool' }`
   - `{ category: 'product-checklists', basePath: '.aios-core/product/checklists', glob: '**/*.md', type: 'checklist' }`
   - `{ category: 'product-data', basePath: '.aios-core/product/data', glob: '**/*.{yaml,yml,md}', type: 'data' }`
2. Implementar `SENTINEL_VALUES` filter (N/A, none, TBD, TODO)
3. Implementar `isNoise()` filter para natural language fragments
4. Testes para novos SCAN_CONFIG + filters
5. Regenerar registry e medir metricas

**Impacto estimado:** 563 → ~666 entidades, 52% → ~85% resolution rate

**Atencao:** Ao adicionar `infra-scripts` (87 files), havera **colisao de entity IDs** com os scripts ja escaneados em `development/scripts/`. Exemplos: `backup-manager` existe em ambos. O scanner ja tem dedup detection — os duplicados serao logados e o segundo skipado. Pode ser necessario prefixar IDs ou usar paths como IDs.

---

### Story NOG-16B: Dependency Classification + Lifecycle Tags (P1)

**Scope:** Classificar deps nao resolvidas + adicionar lifecycle field

**Tasks:**
1. Implementar dep classification (pos-scan):
   - `resolved-internal`: mapeia para entidade no registry
   - `external-tool`: match contra EXTERNAL_TOOLS set (coderabbit, git, etc.)
   - `planned`: referencia a modulo/script que nao existe no disco
   - `noise`: filtered out (nao persiste no registry)
2. Adicionar campo `lifecycle` ao registry com auto-deteccao:
   - `production`: usedBy > 0
   - `orphan`: 0 deps AND 0 usedBy
   - `experimental`: default para novos
   - `deprecated`: pattern match no nome (`old-`, `backup-`, keywords)
3. Classificar deps como `dependencies` (internal) e `externalDeps` (tools) no registry
4. Testes
5. Regenerar registry com novos campos

**Schema proposto:**

```yaml
entities:
  tasks:
    dev-develop-story:
      path: .aios-core/development/tasks/dev-develop-story.md
      type: task
      lifecycle: production        # NEW: auto-detected
      purpose: "..."
      keywords: [...]
      dependencies: [...]          # Only resolved-internal
      externalDeps: [...]          # NEW: external tools
      plannedDeps: [...]           # NEW: unresolved but intentional
      usedBy: [...]
      adaptability:
        score: 0.8
```

---

### Story NOG-16C: Graph Filtering + Focus Mode (P2)

**Scope:** Melhorar graph dashboard com filtros interativos

**Tasks:**
1. Implementar vis-network DataView filtering:
   - Toggle por categoria (tasks, scripts, modules, etc.)
   - Toggle por lifecycle (production, orphan, deprecated, experimental)
   - Hide orphans checkbox
   - Search por nome
2. Visual differentiation por lifecycle:
   - `production`: cor normal, opacity 1.0
   - `experimental`: borda tracejada, opacity 0.8
   - `deprecated`: cinza, opacity 0.5
   - `orphan`: cinza claro, opacity 0.3
3. Focus mode: click em entidade mostra apenas vizinhos (1-2 hops)
4. Performance: `hideEdgesOnDrag`, `hideEdgesOnZoom` para 600+ nodes
5. Export JSON: botao para exportar graph data

---

## Padroes Recomendados (da Pesquisa)

### 1. Backstage Lifecycle Pattern

Adotar o modelo Backstage de 3+1 estados:
- `experimental` → `production` → `deprecated`
- `orphan` como estado auto-detectado (annotation, nao lifecycle)

### 2. Nx Discovery Pattern

O SCAN_CONFIG e equivalente ao Nx `createNodesV2`. Para escalar:
- Mover config para YAML externo (scan-config.yaml)
- Suportar globs em multiplos base paths
- Incremental: processar apenas files modificados

### 3. DataHub Aspect Pattern

Registry fields devem ser tratados como aspects independentes:
- `lifecycle` pode ser atualizado sem re-escanear deps
- `checksum` pode ser atualizado sem re-extrair keywords
- Permite enrichment parcial e incremental

### 4. Rush Phantom Detection

Implementar phantom dependency detection:
- Pos-scan, verificar cada dep contra:
  1. nameIndex (entidades no registry)
  2. Filesystem (arquivo existe no disco?)
  3. EXTERNAL_TOOLS set
- Classificar resultado: resolved, phantom, external, noise

### 5. vis-network DataView

Usar DataView para filtering sem modificar dados source:

```javascript
// REFERENCIA — nao production code
const nodesView = new vis.DataView(nodes, {
  filter: function(item) {
    if (hiddenLifecycles.has(item.lifecycle)) return false;
    if (hiddenCategories.has(item.group)) return false;
    if (hideOrphans && item.isOrphan) return false;
    return true;
  }
});
```

---

## Riscos e Alertas

### Entity ID Collision

Ao adicionar `infrastructure/scripts/` ao scan, havera colisao com `development/scripts/`:
- `backup-manager` existe em ambos
- O scanner usa `extractEntityId()` que retorna apenas o basename
- **Solucao**: Prefixar IDs com categoria (e.g., `infra/backup-manager`) OU usar path relativo como ID

### Registry Size Growth

De 563 para ~666 entidades (18% growth). Graph performance:
- vis-network handles 1000+ nodes com barnesHut
- Performance concern a partir de 2000+ nodes
- Clustering por categoria pode ser necessario no futuro

### Backward Compatibility

Novos campos (`lifecycle`, `externalDeps`, `plannedDeps`) devem ser opcionais para nao quebrar consumers existentes.

---

## Ordem de Implementacao Recomendada

```
NOG-16A (Scan Config + Sentinel Filter)
  → Maior impacto: 52% → ~85% resolution
  → Prerequisito para lifecycle detection

NOG-16B (Classification + Lifecycle)
  → Requer NOG-16A (precisa de entidades corretas)
  → Habilita graph filtering

NOG-16C (Graph Filtering + Focus)
  → Requer NOG-16B (precisa de lifecycle tags)
  → UX improvement
```

**Total estimado:** NOG-16A (3pts) + NOG-16B (3pts) + NOG-16C (3pts) = 9 pontos

---

## Sources

- [Nx Project Graph Plugins](https://nx.dev/docs/extending-nx/project-graph-plugins)
- [Nx Graph Exploration](https://nx.dev/docs/features/explore-graph)
- [Nx 2026 Roadmap — Lazy Graph Hydration](https://nx.dev/blog/nx-2026-roadmap)
- [Backstage Descriptor Format](https://backstage.io/docs/features/software-catalog/descriptor-format/)
- [Backstage Life of an Entity](https://backstage.io/docs/features/software-catalog/life-of-an-entity/)
- [Rush Phantom Dependencies](https://rushjs.io/pages/advanced/phantom_deps/)
- [Nx Dependency Management](https://nx.dev/docs/concepts/decisions/dependency-management)
- [DataHub Metadata Model](https://docs.datahub.com/docs/metadata-modeling/metadata-model)
- [Yamale YAML Schema Validator](https://github.com/23andMe/Yamale)
- [vis-network Documentation](https://visjs.github.io/vis-network/docs/)
- [vis-network Dynamic Filtering Example](https://visjs.github.io/vis-network/examples/network/data/dynamicFiltering.html)
