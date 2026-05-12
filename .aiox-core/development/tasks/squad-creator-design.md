---
task: Design Squad from Documentation
responsavel: "@squad-creator"
responsavel_type: agent
atomic_layer: task
elicit: true
Entrada: |
  - docs: Documentation sources (text, files, or verbal description)
  - domain: Optional domain hint to guide analysis
  - output_path: Where to save blueprint (default: ./squads/.designs/)
Saida: |
  - blueprint_path: Path to generated squad-design.yaml
  - summary: Human-readable summary of recommendations
  - confidence: Overall confidence score (0-1)
Checklist:
  - "[ ] Collect documentation input"
  - "[ ] Analyze domain and extract concepts"
  - "[ ] Generate agent recommendations"
  - "[ ] Generate task recommendations"
  - "[ ] Present recommendations for refinement"
  - "[ ] Apply user adjustments"
  - "[ ] Generate blueprint file"
  - "[ ] Display next steps"
---

# *design-squad

Analyzes documentation and guides the user through designing a squad structure with intelligent recommendations for agents and tasks.

## Usage

```bash
@squad-creator

*design-squad
# → Interactive mode, prompts for documentation

*design-squad --docs ./docs/prd/my-project.md
# → Analyzes specific file

*design-squad --docs ./docs/prd/my-project.md,./docs/specs/api.yaml
# → Analyzes multiple files

*design-squad --domain "e-commerce order management"
# → Uses domain hint for guidance
```

## Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--docs` | string | - | Comma-separated paths to documentation files |
| `--domain` | string | - | Domain hint to guide analysis |
| `--output` | string | ./squads/.designs/ | Output directory for blueprint |
| `--quick` | flag | false | Accept all recommendations without review |
| `--verbose` | flag | false | Show detailed analysis output |

## Interactive Flow

### Phase 1: Documentation Input

```
? How would you like to provide documentation?
  1. Paste text directly
  2. Provide file paths
  3. Describe the domain verbally
  > 2

? Documentation file paths (comma-separated):
  > ./docs/prd/my-project.md, ./docs/specs/api.yaml

Analyzing documentation...
```

### Phase 2: Domain Confirmation

```
Based on your documentation, I identified:

Domain: Order Management System
Key Entities: Order, Customer, Product, Payment, Shipment
Main Workflows:
  1. order-creation
  2. payment-processing
  3. inventory-check
  4. shipment-tracking

Is this correct? [Y/n/Adjust]
> Y
```

### Phase 3: Agent Review

```
Recommended Agent 1 of 3:

  ID: order-manager
  Role: Manages order lifecycle from creation to fulfillment
  Commands: *create-order, *update-order, *cancel-order
  Confidence: 92%

  [A]ccept / [R]eject / [M]odify / [S]kip to tasks
> A

Recommended Agent 2 of 3:
...
```

### Phase 4: Task Review

```
Tasks for order-manager:

  1. create-order.md (90% confidence)
     Entrada: customer_id, items[], payment_method
     Saida: order_id, status, total

  2. update-order.md (85% confidence)
     Entrada: order_id, updates{}
     Saida: updated_order, changelog

  [A]ccept all / Review [1-2] / [R]eject all
> A
```

### Phase 5: Custom Additions

```
Would you like to add any agents or tasks not recommended?

  [A]dd agent / Add [T]ask / [C]ontinue to blueprint
> C
```

### Phase 6: Blueprint Generation

```
Generating blueprint...

Summary:
  Agents: 3 (3 recommended, 0 added)
  Tasks: 8 (7 recommended, 1 added)
  User adjustments: 2
  Overall confidence: 88%

Saved: ./squads/.designs/order-management-squad-design.yaml

Next steps:
  1. Review blueprint: cat ./squads/.designs/order-management-squad-design.yaml
  2. Create squad: *create-squad order-management --from-design
  3. Or edit blueprint manually before creation
```

## Analysis Pipeline

```
┌─────────────────────────────────────────────────────────────────────┐
│                     DOMAIN ANALYSIS PIPELINE                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  1. INPUT NORMALIZATION                                              │
│     ├── Parse markdown/yaml/json files                               │
│     ├── Extract text content                                         │
│     └── Merge multiple sources                                       │
│                                                                      │
│  2. ENTITY EXTRACTION                                                │
│     ├── Identify nouns and proper nouns (capitalized terms)          │
│     ├── Detect domain-specific terms (repeated concepts)             │
│     ├── Group related concepts                                       │
│     └── Output: entities[]                                           │
│                                                                      │
│  3. WORKFLOW DETECTION                                               │
│     ├── Identify action verbs (create, update, delete, process)      │
│     ├── Detect sequential processes (steps, flows)                   │
│     ├── Map input → process → output patterns                        │
│     └── Output: workflows[]                                          │
│                                                                      │
│  4. INTEGRATION MAPPING                                              │
│     ├── Detect external system references (API, database, service)   │
│     ├── Identify third-party mentions                                │
│     └── Output: integrations[]                                       │
│                                                                      │
│  5. STAKEHOLDER IDENTIFICATION                                       │
│     ├── Detect user types/roles (admin, user, manager)               │
│     ├── Identify personas mentioned                                  │
│     └── Output: stakeholders[]                                       │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

## Recommendation Engine

```
┌─────────────────────────────────────────────────────────────────────┐
│                   RECOMMENDATION ENGINE                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  AGENT GENERATION:                                                   │
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │ For each major workflow:                                        ││
│  │   → Generate agent with matching role                           ││
│  │   → Derive commands from workflow steps                         ││
│  │   → Calculate confidence based on clarity                       ││
│  │                                                                 ││
│  │ Deduplication:                                                  ││
│  │   → Merge similar agents (>70% overlap)                         ││
│  │   → Consolidate commands                                        ││
│  └─────────────────────────────────────────────────────────────────┘│
│                                                                      │
│  TASK GENERATION:                                                    │
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │ For each agent command:                                         ││
│  │   → Generate task following TASK-FORMAT-SPECIFICATION-V1        ││
│  │   → Derive entrada from workflow inputs                         ││
│  │   → Derive saida from workflow outputs                          ││
│  │   → Generate checklist from workflow steps                      ││
│  └─────────────────────────────────────────────────────────────────┘│
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

## Output: Blueprint Schema

```yaml
# squad-design.yaml
squad:
  name: my-domain-squad
  description: "Generated from documentation analysis"
  domain: domain-name

analysis:
  entities: [Entity1, Entity2, ...]
  workflows: [workflow-1, workflow-2, ...]
  integrations: [API1, Service2, ...]
  stakeholders: [Role1, Role2, ...]

recommendations:
  agents:
    - id: agent-id
      role: "Agent role description"
      commands: [cmd1, cmd2]
      confidence: 0.92
      user_added: false
      user_modified: false

  tasks:
    - name: task-name
      agent: agent-id
      entrada: [input1, input2]
      saida: [output1, output2]
      confidence: 0.88

  template: basic | etl | agent-only | custom
  config_mode: extend | override | none

metadata:
  created_at: "2025-12-18T00:00:00Z"
  source_docs: ["./path/to/doc1.md"]
  user_adjustments: 2
  overall_confidence: 0.87
```

## Integration with *create-squad

After generating a blueprint, use it with *create-squad:

```bash
*create-squad my-domain-squad --from-design ./squads/.designs/my-domain-squad-design.yaml
```

This will:
1. Load the blueprint
2. Validate against schema
3. Generate squad structure with custom agents/tasks from blueprint
4. Skip interactive elicitation (uses blueprint values)

## Error Handling

| Error | Cause | Resolution |
|-------|-------|------------|
| `NO_DOCUMENTATION` | No input provided | Provide docs via --docs or interactively |
| `PARSE_ERROR` | Cannot read/parse file | Check file format (md, yaml, json) |
| `EMPTY_ANALYSIS` | No domain concepts extracted | Provide more detailed documentation |
| `BLUEPRINT_EXISTS` | Blueprint already exists | Use --force to overwrite |

## Implementation

```javascript
const { SquadDesigner } = require('./.aiox-core/development/scripts/squad');

async function designSquad(options) {
  const designer = new SquadDesigner();

  // 1. Collect documentation
  const docs = await designer.collectDocumentation(options);

  // 2. Analyze domain
  const analysis = await designer.analyzeDomain(docs);

  // 3. Generate recommendations
  const recommendations = {
    agents: designer.generateAgentRecommendations(analysis),
    tasks: designer.generateTaskRecommendations(analysis)
  };

  // 4. Interactive refinement (unless --quick)
  if (!options.quick) {
    await designer.interactiveRefinement(recommendations);
  }

  // 5. Generate blueprint
  const blueprint = await designer.generateBlueprint({
    analysis,
    recommendations,
    metadata: {
      source_docs: options.docs,
      created_at: new Date().toISOString()
    }
  });

  // 6. Save blueprint
  const blueprintPath = await designer.saveBlueprint(blueprint, options.output);

  return { blueprintPath, blueprint };
}
```

## Related

- **Agent:** @squad-creator (Craft)
- **Script:** squad-designer.js
- **Schema:** squad-design-schema.json
- **Integration:** *create-squad --from-design
- **Story:** SQS-9 (Squad Designer)
