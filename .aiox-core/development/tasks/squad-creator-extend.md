---
task: extendSquad()
responsavel: "@squad-creator"
responsavel_type: Agent
atomic_layer: Task
elicit: true

Entrada:
  - campo: squad_name
    tipo: string
    origem: User Input
    obrigatorio: true
    validacao: Squad must exist in ./squads/ directory

  - campo: component_type
    tipo: string
    origem: User Input
    obrigatorio: true
    validacao: "agent | task | workflow | checklist | template | tool | script | data"

  - campo: component_name
    tipo: string
    origem: User Input
    obrigatorio: true
    validacao: "kebab-case, no special characters"

  - campo: agent_id
    tipo: string
    origem: User Input
    obrigatorio: false
    validacao: "Required for tasks - must exist in squad's agents/"

  - campo: story_id
    tipo: string
    origem: User Input
    obrigatorio: false
    validacao: "Format: SQS-XX (optional traceability)"

Saida:
  - campo: created_file
    tipo: string
    destino: Squad directory
    persistido: true

  - campo: updated_manifest
    tipo: boolean
    destino: squad.yaml
    persistido: true

  - campo: validation_result
    tipo: object
    destino: Console
    persistido: false

Checklist:
  - "[ ] Validate squad exists"
  - "[ ] Collect component type"
  - "[ ] Collect component name and metadata"
  - "[ ] Create file from template"
  - "[ ] Update squad.yaml manifest"
  - "[ ] Run validation"
  - "[ ] Display result and next steps"
---

# Extend Squad Task

## Purpose

Add new components to an existing squad with automatic manifest updates and validation. This task enables incremental squad improvement without manual file manipulation.

## Story Reference

- **Story:** SQS-11 - Squad Analyze & Extend
- **Epic:** SQS - Squad System Enhancement

## Pre-Conditions

```yaml
pre-conditions:
  - [ ] Squad exists in ./squads/ directory
    tipo: pre-condition
    blocker: true
    validacao: |
      Check if squad directory exists with valid manifest
    error_message: "Squad not found. Use *list-squads to see available squads."

  - [ ] Component name is valid kebab-case
    tipo: pre-condition
    blocker: true
    validacao: |
      Must match /^[a-z][a-z0-9-]*[a-z0-9]$/
    error_message: "Invalid component name. Use kebab-case (e.g., my-component)"
```

## Elicitation Flow (Interactive Mode)

```
@squad-creator

*extend-squad my-squad

? What would you like to add?
  1. Agent - New agent persona
  2. Task - New task for an agent
  3. Workflow - Multi-step workflow
  4. Checklist - Validation checklist
  5. Template - Document template
  6. Tool - Custom tool (JavaScript)
  7. Script - Automation script
  8. Data - Static data file (YAML)

> 2

? Task name: process-data
? Which agent owns this task?
  1. lead-agent
  2. helper-agent
> 1
? Task description (optional): Process incoming data and generate output
? Link to story? (leave blank to skip): SQS-11

Creating task...
  Created: tasks/lead-agent-process-data.md
  Updated: squad.yaml (added to components.tasks)
  Validation: PASS

Next steps:
  1. Edit tasks/lead-agent-process-data.md
  2. Add entrada/saida/checklist
  3. Run: *validate-squad my-squad
```

## Direct Mode (Flags)

```bash
# Add agent directly
*extend-squad my-squad --add agent --name analytics-agent

# Add task with agent linkage
*extend-squad my-squad --add task --name process-data --agent lead-agent

# Add workflow with story reference
*extend-squad my-squad --add workflow --name daily-processing --story SQS-11

# Add all component types
*extend-squad my-squad --add template --name report-template
*extend-squad my-squad --add tool --name data-validator
*extend-squad my-squad --add checklist --name quality-checklist
*extend-squad my-squad --add script --name migration-helper
*extend-squad my-squad --add data --name config-data
```

## Execution Steps

### Step 1: Validate Squad Exists

```javascript
const { SquadLoader } = require('../scripts/squad/squad-loader');
const loader = new SquadLoader();

const squadPath = path.join('./squads', squadName);
const exists = await loader.squadExists(squadName);

if (!exists) {
  throw new Error(`Squad "${squadName}" not found`);
}
```

### Step 2: Collect Component Info

```javascript
// Interactive mode
if (!componentType) {
  componentType = await promptComponentType();
}

if (!componentName) {
  componentName = await promptComponentName(componentType);
}

// Validate name format
if (!isValidKebabCase(componentName)) {
  throw new Error('Component name must be kebab-case');
}

// For tasks, require agent
if (componentType === 'task' && !agentId) {
  const agents = await listAgents(squadPath);
  agentId = await promptAgentSelection(agents);
}
```

### Step 3: Create Component File

```javascript
const { SquadExtender } = require('../scripts/squad/squad-extender');
const extender = new SquadExtender();

const result = await extender.addComponent(squadPath, {
  type: componentType,
  name: componentName,
  agentId: agentId,
  storyId: storyId,
  description: description
});

// result = {
//   filePath: 'squads/my-squad/tasks/lead-agent-process-data.md',
//   created: true,
//   templateUsed: 'task-template.md'
// }
```

### Step 4: Update Manifest

```javascript
const manifestUpdated = await extender.updateManifest(squadPath, {
  type: componentType,
  file: result.fileName
});

// Creates backup before updating
// Adds to components.{type}[]
// Preserves YAML formatting
```

### Step 5: Validate

```javascript
const { SquadValidator } = require('../scripts/squad/squad-validator');
const validator = new SquadValidator();

const validationResult = await validator.validate(squadPath);

if (!validationResult.valid) {
  console.log('Validation errors:', validationResult.errors);
  console.log('Suggestions:', validationResult.suggestions);
}
```

### Step 6: Display Result

```javascript
console.log(`
Creating ${componentType}...
  Created: ${result.relativePath}
  Updated: squad.yaml (added to components.${componentType}s)
  Validation: ${validationResult.valid ? 'PASS' : 'FAIL'}

Next steps:
  1. Edit ${result.relativePath}
  2. ${getNextStepHint(componentType)}
  3. Run: *validate-squad ${squadName}
`);
```

## Component Templates

Each component type uses a template from `.aiox-core/development/templates/squad/`:

| Type | Template | Key Fields |
|------|----------|------------|
| agent | agent-template.md | name, id, role, commands |
| task | task-template.md | responsavel, entrada, saida, checklist |
| workflow | workflow-template.md | steps, conditions, triggers |
| checklist | checklist-template.md | items, categories |
| template | template-template.md | placeholders, structure |
| tool | tool-template.js | functions, exports |
| script | script-template.js | main, helpers |
| data | data-template.yaml | schema, content |

## Error Handling

### Error 1: Squad Not Found

```yaml
error: SQUAD_NOT_FOUND
cause: Squad directory does not exist
resolution: Use *list-squads to see available squads
recovery: Suggest *create-squad to create new squad
```

### Error 2: Invalid Component Name

```yaml
error: INVALID_COMPONENT_NAME
cause: Name does not match kebab-case pattern
resolution: Use lowercase letters, numbers, and hyphens only
recovery: Suggest valid name format
```

### Error 3: Component Already Exists

```yaml
error: COMPONENT_EXISTS
cause: File already exists in squad directory
resolution: Use --force to overwrite, or choose different name
recovery: Show existing file path
```

### Error 4: Agent Not Found (for tasks)

```yaml
error: AGENT_NOT_FOUND
cause: Specified agent does not exist in squad
resolution: Create agent first with --add agent
recovery: List available agents
```

### Error 5: Manifest Update Failed

```yaml
error: MANIFEST_UPDATE_FAILED
cause: Could not update squad.yaml
resolution: Check file permissions and YAML syntax
recovery: Restore from backup (.squad.yaml.bak)
```

## Security Considerations

### Path Traversal Prevention

```javascript
// Validate component name - no path separators
if (componentName.includes('/') || componentName.includes('\\') || componentName.includes('..')) {
  throw new Error('Invalid component name - path traversal not allowed');
}
```

### Overwrite Protection

```javascript
if (await fs.access(targetPath).then(() => true).catch(() => false)) {
  if (!force) {
    throw new Error(`File already exists: ${targetPath}. Use --force to overwrite`);
  }
}
```

### Backup Before Update

```javascript
const backupPath = manifestPath + '.bak';
await fs.copyFile(manifestPath, backupPath);
```

## Post-Conditions

```yaml
post-conditions:
  - [ ] Component file created in correct directory
    tipo: post-condition
    blocker: true
    validacao: |
      Verify file exists and contains valid content
    error_message: "Component file was not created successfully"

  - [ ] Manifest updated with new component
    tipo: post-condition
    blocker: true
    validacao: |
      Verify squad.yaml contains new entry
    error_message: "Manifest was not updated"

  - [ ] Validation passes
    tipo: post-condition
    blocker: false
    validacao: |
      Squad passes validation after extension
    error_message: "Squad validation failed after extension"
```

## Dependencies

- **Scripts:**
  - `.aiox-core/development/scripts/squad/squad-loader.js`
  - `.aiox-core/development/scripts/squad/squad-extender.js`
  - `.aiox-core/development/scripts/squad/squad-validator.js`

- **Templates:**
  - `.aiox-core/development/templates/squad/agent-template.md`
  - `.aiox-core/development/templates/squad/task-template.md`
  - `.aiox-core/development/templates/squad/workflow-template.md`
  - `.aiox-core/development/templates/squad/checklist-template.md`
  - `.aiox-core/development/templates/squad/template-template.md`
  - `.aiox-core/development/templates/squad/tool-template.js`
  - `.aiox-core/development/templates/squad/script-template.js`
  - `.aiox-core/development/templates/squad/data-template.yaml`

- **Tools:**
  - js-yaml (YAML parsing)
  - fs (file system operations)

## Metadata

```yaml
story: SQS-11
version: 1.0.0
created: 2025-12-26
updated: 2025-12-26
author: Dex (dev)
tags:
  - squad
  - extension
  - components
  - templates
```

---

*Task definition for *extend-squad command*
