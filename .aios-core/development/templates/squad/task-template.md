---
task: {{COMPONENTNAME}}
responsavel: "@{{AGENTID}}"
responsavel_type: Agent
atomic_layer: Task
elicit: false

Entrada:
  - campo: input_param
    tipo: string
    origem: User Input
    obrigatorio: true
    validacao: "Describe validation rules"

Saida:
  - campo: result
    tipo: object
    destino: Return value
    persistido: false

Checklist:
  - "[ ] Step 1: Describe first step"
  - "[ ] Step 2: Describe second step"
  - "[ ] Step 3: Describe third step"
---

# {{COMPONENTNAME}}

## Purpose

{{DESCRIPTION}}

{{#IF STORYID}}
## Story Reference

- **Story:** {{STORYID}}
- **Squad:** {{SQUADNAME}}
{{/IF}}

## Pre-Conditions

```yaml
pre-conditions:
  - [ ] Pre-condition 1
    tipo: pre-condition
    blocker: true
    validacao: |
      Describe what to validate
    error_message: "Error message if pre-condition fails"
```

{{#IF CODE_INTEL_AVAILABLE}}
## Code Intelligence Duplicate Check

> Auto-check when code intelligence provider is available.
> This step is advisory only — it never blocks task creation.
> This section can be safely removed if not needed.

Before proceeding, verify no similar task already exists:

```javascript
const { checkDuplicateArtefact } = require('.aios-core/core/code-intel/helpers/creation-helper');
const result = await checkDuplicateArtefact('{{COMPONENTNAME}}', '{{DESCRIPTION}}');
if (result) {
  console.warn(result.warning);
  // Advisory: "Similar task exists: {task-name}. Consider extending instead of creating."
}
```

- **Duplicates Found:** {{DUPLICATE_WARNING}}
{{/IF}}

## Execution Steps

### Step 1: Initialize

```javascript
// Implementation here
const { Dependency } = require('./path/to/dependency');

async function step1() {
  // Step 1 logic
}
```

### Step 2: Process

```javascript
async function step2() {
  // Step 2 logic
}
```

### Step 3: Complete

```javascript
async function step3() {
  // Step 3 logic
  return {
    success: true,
    data: {},
  };
}
```

## Error Handling

### Error 1: Description

```yaml
error: ERROR_CODE
cause: Description of cause
resolution: How to resolve
recovery: Suggested recovery action
```

## Post-Conditions

```yaml
post-conditions:
  - [ ] Result is valid
    tipo: post-condition
    blocker: true
    validacao: |
      Describe validation
    error_message: "Error message if post-condition fails"
```

## Metadata

```yaml
{{#IF STORYID}}
story: {{STORYID}}
{{/IF}}
version: 1.0.0
created: {{CREATEDAT}}
updated: {{CREATEDAT}}
author: squad-creator
tags:
  - {{SQUADNAME}}
  - {{COMPONENTNAME}}
```

---

*Task definition created by squad-creator*
