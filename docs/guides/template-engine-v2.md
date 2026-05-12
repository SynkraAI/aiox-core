# Template Engine v2.0

> **EN** | [PT](../pt/guides/template-engine-v2.md) | [ES](../es/guides/template-engine-v2.md)

---

> Document generation and variable substitution engine for Synkra AIOX.

**Version:** 2.0
**Last Updated:** 2025-12-05

---

## Overview

The Template Engine provides a consistent way to generate documents (PRDs, ADRs, Stories, etc.) with variable substitution, conditionals, and loops. It powers all document generation tasks in AIOX.

### Key Features

| Feature      | Syntax                                  | Description                     |
| ------------ | --------------------------------------- | ------------------------------- |
| Variables    | `{{VAR_NAME}}`                          | Simple variable substitution    |
| Conditionals | `{{#IF_CONDITION}}...{{/IF_CONDITION}}` | Conditional blocks              |
| Loops        | `{{#EACH_ITEMS}}...{{/EACH_ITEMS}}`     | Iterate over arrays             |
| Nested Paths | `{{user.name}}`                         | Access nested object properties |
| Escaping     | `\{{literal}}`                          | Prevent template processing     |

---

## Quick Start

### Basic Usage

```javascript
const TemplateEngine = require('./.aiox-core/infrastructure/scripts/template-engine');

const engine = new TemplateEngine();

const template = `
# {{TITLE}}

Created by: {{AUTHOR}}
Date: {{DATE}}

## Summary
{{SUMMARY}}
`;

const variables = {
  TITLE: 'My Document',
  AUTHOR: 'Dex (@dev)',
  DATE: '2025-12-05',
  SUMMARY: 'This is a generated document.',
};

const output = engine.process(template, variables);
console.log(output);
```

### Output

```markdown
# My Document

Created by: Dex (@dev)
Date: 2025-12-05

## Summary

This is a generated document.
```

---

## API Reference

### TemplateEngine Class

```javascript
const TemplateEngine = require('./.aiox-core/infrastructure/scripts/template-engine');
const engine = new TemplateEngine();
```

### Methods

#### `process(template, variables)`

Process a template string with given variables.

**Parameters:**

- `template` (string) - Template string with placeholders
- `variables` (Object) - Key-value pairs for substitution

**Returns:** `string` - Processed template

```javascript
const result = engine.process('Hello, {{NAME}}!', { NAME: 'World' });
// Returns: "Hello, World!"
```

#### `loadAndProcess(templatePath, variables)`

Load a template file and process it.

**Parameters:**

- `templatePath` (string) - Path to template file
- `variables` (Object) - Variables to substitute

**Returns:** `Promise<string>` - Processed template

```javascript
const result = await engine.loadAndProcess('.aiox-core/product/templates/story-tmpl.md', {
  STORY_ID: '3.12',
  TITLE: 'Documentation',
});
```

#### `validateTemplate(template, requiredVars)`

Validate that a template has all required placeholders.

**Parameters:**

- `template` (string) - Template to validate
- `requiredVars` (string[]) - List of required variable names

**Returns:** `Object` - `{ valid: boolean, missing: string[], found: string[] }`

```javascript
const validation = engine.validateTemplate(template, ['TITLE', 'DATE']);
if (!validation.valid) {
  console.error('Missing variables:', validation.missing);
}
```

#### `getTemplateVariables(template)`

Extract all variables used in a template.

**Parameters:**

- `template` (string) - Template to analyze

**Returns:** `Object` - `{ simple: string[], conditionals: string[], loops: string[] }`

```javascript
const vars = engine.getTemplateVariables(template);
console.log('Variables needed:', vars.simple);
console.log('Conditionals:', vars.conditionals);
console.log('Loop variables:', vars.loops);
```

#### `escapeInput(input)`

Escape special characters in user input to prevent injection.

**Parameters:**

- `input` (string) - User input to escape

**Returns:** `string` - Escaped input

```javascript
const safeInput = engine.escapeInput(userProvidedValue);
```

---

## Template Syntax

### Simple Variables

```markdown
# {{TITLE}}

Author: {{AUTHOR}}
Version: {{VERSION}}
```

### Nested Variables

Access nested object properties with dot notation:

```markdown
Project: {{project.name}}
Owner: {{project.owner.name}}
Email: {{project.owner.email}}
```

```javascript
const variables = {
  project: {
    name: 'AIOX',
    owner: {
      name: 'Pedro',
      email: 'pedro@example.com',
    },
  },
};
```

### Conditionals

Include content only if a variable is truthy:

```markdown
{{#IF_HAS_DEPENDENCIES}}

## Dependencies

This project depends on:
{{DEPENDENCIES}}
{{/IF_HAS_DEPENDENCIES}}
```

```javascript
const variables = {
  HAS_DEPENDENCIES: true,
  DEPENDENCIES: '- react\n- typescript',
};
```

### Loops

Iterate over arrays:

```markdown
## Tasks

{{#EACH_TASKS}}

- [ ] {{ITEM.title}} ({{ITEM.priority}})
      {{/EACH_TASKS}}
```

```javascript
const variables = {
  TASKS: [
    { title: 'Write docs', priority: 'HIGH' },
    { title: 'Add tests', priority: 'MEDIUM' },
    { title: 'Review code', priority: 'LOW' },
  ],
};
```

**Loop Context Variables:**

- `{{ITEM}}` - Current item
- `{{INDEX}}` - Current index (0-based)
- `{{FIRST}}` - Boolean, true if first item
- `{{LAST}}` - Boolean, true if last item

### Escaping

Prevent template processing with backslash:

```markdown
To use variables, write \{{VARIABLE_NAME}}.
```

Output: `To use variables, write {{VARIABLE_NAME}}.`

---

## Supported Templates

### Document Templates

| Template  | Location                    | Purpose                         |
| --------- | --------------------------- | ------------------------------- |
| **PRD**   | `templates/prd-tmpl.md`     | Product Requirements Document   |
| **ADR**   | `templates/adr-tmpl.md`     | Architecture Decision Record    |
| **PMDR**  | `templates/pmdr-tmpl.md`    | Process Mapping Decision Record |
| **DBDR**  | `templates/dbdr-tmpl.md`    | Database Design Record          |
| **Story** | `templates/story-tmpl.yaml` | User Story                      |
| **Epic**  | `templates/epic-tmpl.md`    | Epic Definition                 |
| **Task**  | `templates/task-tmpl.md`    | Task Definition                 |

### Template Location

All templates are stored in:

```
.aiox-core/product/templates/
```

---

## Creating Custom Templates

### Step 1: Create Template File

```markdown
# {{COMPONENT_NAME}}

**Type:** {{COMPONENT_TYPE}}
**Created:** {{DATE}}
**Author:** {{AUTHOR}}

## Description

{{DESCRIPTION}}

{{#IF_HAS_PROPS}}

## Properties

| Name | Type | Default | Description |
| ---- | ---- | ------- | ----------- |

{{#EACH_PROPS}}
| {{ITEM.name}} | {{ITEM.type}} | {{ITEM.default}} | {{ITEM.description}} |
{{/EACH_PROPS}}
{{/IF_HAS_PROPS}}

{{#IF_HAS_EXAMPLES}}

## Examples

{{EXAMPLES}}
{{/IF_HAS_EXAMPLES}}
```

### Step 2: Define Template Schema

Create a schema file (optional but recommended):

```yaml
# my-template.schema.yaml
name: component-template
version: '1.0'
description: Template for component documentation

variables:
  required:
    - COMPONENT_NAME
    - COMPONENT_TYPE
    - DATE
    - AUTHOR
    - DESCRIPTION
  optional:
    - HAS_PROPS
    - PROPS
    - HAS_EXAMPLES
    - EXAMPLES

validation:
  COMPONENT_TYPE:
    enum: [React, Vue, Angular, Vanilla]
  DATE:
    format: date
```

### Step 3: Use in Task

```javascript
const engine = new TemplateEngine();

// Load template
const template = await fs.readFile('templates/component-tmpl.md', 'utf8');

// Validate required variables
const validation = engine.validateTemplate(template, ['COMPONENT_NAME', 'DATE']);
if (!validation.valid) {
  throw new Error(`Missing variables: ${validation.missing.join(', ')}`);
}

// Process
const output = engine.process(template, {
  COMPONENT_NAME: 'Button',
  COMPONENT_TYPE: 'React',
  DATE: new Date().toISOString().split('T')[0],
  AUTHOR: 'Dex',
  DESCRIPTION: 'A reusable button component',
  HAS_PROPS: true,
  PROPS: [
    { name: 'variant', type: 'string', default: 'primary', description: 'Button style' },
    { name: 'size', type: 'string', default: 'medium', description: 'Button size' },
  ],
  HAS_EXAMPLES: false,
});
```

---

## Best Practices

### 1. Use Meaningful Variable Names

```markdown
<!-- Good -->

{{STORY_TITLE}}
{{ACCEPTANCE_CRITERIA}}
{{AUTHOR_NAME}}

<!-- Bad -->

{{T}}
{{AC}}
{{N}}
```

### 2. Provide Sensible Defaults

```javascript
const variables = {
  TITLE: title || 'Untitled',
  DATE: date || new Date().toISOString().split('T')[0],
  VERSION: version || '1.0',
};
```

### 3. Validate Before Processing

```javascript
const validation = engine.validateTemplate(template, requiredVars);
if (!validation.valid) {
  console.error('Missing:', validation.missing);
  return; // Don't process invalid templates
}
```

### 4. Escape User Input

```javascript
// Always escape user-provided content
const safeInput = engine.escapeInput(userInput);
const output = engine.process(template, { USER_CONTENT: safeInput });
```

### 5. Use Conditionals for Optional Sections

```markdown
{{#IF_HAS_NOTES}}

## Notes

{{NOTES}}
{{/IF_HAS_NOTES}}
```

---

## Troubleshooting

### Common Issues

| Issue                      | Solution                                           |
| -------------------------- | -------------------------------------------------- |
| Variable not replaced      | Check spelling matches exactly (case-sensitive)    |
| Loop produces empty output | Ensure variable is an array, not undefined         |
| Conditional always false   | Check variable is truthy (not empty string/0/null) |
| Template injection         | Use `escapeInput()` for user-provided values       |

### Debug Mode

```javascript
// Get all variables in template
const vars = engine.getTemplateVariables(template);
console.log('Expected variables:', vars);

// Validate against your data
const validation = engine.validateTemplate(template, Object.keys(yourVariables));
console.log('Validation result:', validation);
```

---

## Related Documentation

- [Quality Gates Guide](./quality-gates.md)

---

_Synkra AIOX Template Engine v2.0_
