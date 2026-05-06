---
task: Map New Project
responsavel: "@navigator"
responsavel_type: agent
atomic_layer: task
elicit: true
Entrada: |
  - project_description: Text description of the project (free form)
  - domain_hint: Optional domain hint for guidance
Saida: |
  - roadmap_central: .aios/navigator/[project]/roadmap.md
  - roadmap_local: docs/roadmap.md
  - project_metadata: YAML metadata
Checklist:
  - "[ ] Collect project description (free text)"
  - "[ ] Analyze and extract key information"
  - "[ ] Ask complementary questions for gaps"
  - "[ ] Detect project type (greenfield/brownfield)"
  - "[ ] Determine complexity level"
  - "[ ] Map to pipeline phases"
  - "[ ] Generate roadmap from template"
  - "[ ] Sync to both locations"
veto_conditions:
  - "No git repository detected → BLOCK (git init required for hooks and status tracking)"
  - "Roadmap already exists for this project and --force not specified → WARN (suggest *update-roadmap instead)"
  - "Pipeline map missing → BLOCK (cannot map phases without navigator-pipeline-map.yaml)"
  - "User provides empty project description → BLOCK (require at least a brief description)"
---

# *map-project

Map a new project with hybrid input approach (free text + guided questions).

## Usage

```bash
@navigator
*map-project
```

## Workflow

### Step 1: Collect Free-Form Description

```
Descreva seu projeto em poucas palavras ou parágrafos.
Pode ser informal - vou extrair as informações importantes.

Exemplo:
"Quero criar um sistema de gerenciamento de pedidos para e-commerce.
Precisa ter carrinho, pagamento integrado e painel admin."

>
```

### Step 2: Analyze Description

Extract:
- **Entities:** Order, Customer, Product, Payment, Cart, Admin
- **Workflows:** order-creation, payment-processing, cart-management
- **Project type:** Greenfield (new system)
- **Complexity:** Medium (3-5 epics estimated)

### Step 3: Ask Complementary Questions

Only ask about gaps:

```
Detectei algumas informações. Preciso esclarecer:

1. Stack tecnológica preferida?
   > Next.js + Node.js + PostgreSQL

2. Já tem design system / UI kit?
   > Não, vai precisar criar

3. Integrações externas necessárias?
   > Stripe para pagamento, Correios para frete

4. Timeline esperada?
   > 3-4 meses
```

### Step 4: Map to Pipeline

Based on analysis:
- **Phase 1 (Pesquisa):** Market analysis, competitor research
- **Phase 2 (PRD):** Full product requirements
- **Phase 3 (Arquitetura):** Tech stack, database schema, API design
- **Phases 4-10:** Standard pipeline

### Step 5: Generate Roadmap

Use `nav-roadmap-tmpl.md` template with:

```yaml
project_name: "E-commerce Order Management"
project_type: Greenfield
tech_stack: "Next.js, Node.js, PostgreSQL, Stripe"
complexity: Medium
estimated_duration: "3-4 meses (12-16 sprints)"
```

### Step 6: Save & Sync

1. Create directory structure:
```bash
mkdir -p .aios/navigator/ecommerce-order-mgmt/{checkpoints,reports}
```

2. Write roadmap to central:
```
.aios/navigator/ecommerce-order-mgmt/roadmap.md
```

3. Write roadmap to local:
```
docs/roadmap.md
```

4. Run sync script:
```javascript
const { syncRoadmap } = require('.aios-core/development/scripts/navigator/roadmap-sync');
await syncRoadmap('ecommerce-order-mgmt');
```

## Output Example

```markdown
✅ Roadmap criado com sucesso!

**Projeto:** E-commerce Order Management
**Tipo:** Greenfield
**Complexidade:** Medium (3-4 meses)

**Localizações:**
- Central: .aios/navigator/ecommerce-order-mgmt/roadmap.md
- Local: docs/roadmap.md

**Fase atual:** 1 (Pesquisa)
**Próximo passo:** @analyst *brainstorm

Use *where-am-i para ver status detalhado.
Use *auto-navigate para iniciar primeira fase.
```

## Implementation

```javascript
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

async function mapProject(description, options = {}) {
  // 1. Analyze description
  const analysis = await analyzeDescription(description);

  // 2. Ask complementary questions
  const answers = await askComplementaryQuestions(analysis);

  // 3. Detect project type and complexity
  const projectMeta = detectProjectMetadata(analysis, answers);

  // 4. Map to pipeline phases
  const pipelineMap = await loadPipelineMap();
  const phases = mapToPhases(projectMeta, pipelineMap);

  // 5. Generate roadmap
  const roadmap = await generateRoadmap({
    ...projectMeta,
    phases,
    template: 'nav-roadmap-tmpl.md'
  });

  // 6. Save and sync
  await saveRoadmap(roadmap, projectMeta.name);
  await syncRoadmap(projectMeta.name);

  return {
    roadmapPath: `.aios/navigator/${projectMeta.name}/roadmap.md`,
    currentPhase: phases[0],
    nextStep: phases[0].command
  };
}
```

## Related

- **Agent:** @navigator (Vega)
- **Template:** nav-roadmap-tmpl.md
- **Script:** roadmap-sync.js
- **Data:** navigator-pipeline-map.yaml
