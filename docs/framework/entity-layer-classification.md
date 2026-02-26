# Entity Layer Classification (L1-L4)

Classification rules for the AIOS entity registry boundary layers.

## Layer Model

| Layer | Name | Mutability | Description |
|-------|------|------------|-------------|
| **L1** | Framework Core | Immutable | Core modules, CLI executables, constitution |
| **L2** | Framework Templates | Extend-only | Tasks, templates, checklists, workflows, infrastructure |
| **L3** | Project Config | Customizable | Data files, agent MEMORY.md, .claude/ config, *-config.yaml |
| **L4** | Project Runtime | Dynamic | Docs, stories, packages, tests, squads (fallback) |

## Classification Rules

Rules are evaluated in order. **First match wins.**

| Priority | Layer | Path Pattern | Examples |
|----------|-------|-------------|----------|
| 1 | L1 | `.aios-core/core/**` | ids/index.js, utils/helpers.js |
| 2 | L1 | `bin/**` | aios.js, aios-init.js |
| 3 | L1 | `.aios-core/constitution.md` | (exact match) |
| 4 | L3 | `.aios-core/data/**` | entity-registry.yaml |
| 5 | L3 | `**/MEMORY.md` | agents/dev/MEMORY.md |
| 6 | L3 | `.claude/**` | CLAUDE.md, settings.json |
| 7 | L3 | `core-config.yaml`, `project-config.yaml` | (exact match) |
| 8 | L3 | `*-config.yaml` (root only) | custom-config.yaml |
| 9 | L2 | `.aios-core/development/**` | tasks/, templates/, agents/ |
| 10 | L2 | `.aios-core/infrastructure/**` | scripts/, tools/ |
| 11 | L2 | `.aios-core/product/**` | templates/, checklists/ |
| 12 | L4 | Everything else | docs/, tests/, packages/ |

**Important:** Rule 5 (MEMORY.md) must come before Rule 9 (development/) so that `agents/dev/MEMORY.md` classifies as L3 instead of L2.

## SCAN_CONFIG to Layer Mapping

| SCAN_CONFIG Category | basePath | Layer |
|---------------------|----------|-------|
| modules | .aios-core/core | L1 |
| utils | .aios-core/core/utils | L1 |
| tasks | .aios-core/development/tasks | L2 |
| templates | .aios-core/product/templates | L2 |
| scripts | .aios-core/development/scripts | L2 |
| checklists | .aios-core/development/checklists | L2 |
| workflows | .aios-core/development/workflows | L2 |
| tools | .aios-core/development/tools | L2 |
| infra-scripts | .aios-core/infrastructure/scripts | L2 |
| infra-tools | .aios-core/infrastructure/tools | L2 |
| product-checklists | .aios-core/product/checklists | L2 |
| product-data | .aios-core/product/data | L2 |
| agents | .aios-core/development/agents | L2 (MEMORY.md = L3) |
| data | .aios-core/data | L3 |

## Usage

```javascript
const { classifyLayer } = require('./.aios-core/core/ids/layer-classifier');

classifyLayer('.aios-core/core/ids/index.js');  // => 'L1'
classifyLayer('.aios-core/development/tasks/create-next-story.md');  // => 'L2'
classifyLayer('.aios-core/data/entity-registry.yaml');  // => 'L3'
classifyLayer('docs/stories/story-1.md');  // => 'L4'
```

## Implementation

- **Module:** `.aios-core/core/ids/layer-classifier.js`
- **Exports:** `classifyLayer(entityPath)`, `LAYER_RULES`
- **Integrated with:** `populate-entity-registry.js`, `registry-updater.js`
- **Preserved by:** `registry-healer.js` (does not strip unknown fields)

## Story Reference

Story BM-5: Entity Registry Layer Classification (L1-L4)
