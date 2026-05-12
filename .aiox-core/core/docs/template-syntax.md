# Template Variable Syntax Guide

## Overview

The Synkra AIOX template system uses a simple yet powerful variable substitution syntax that allows for dynamic content generation in agents, tasks, and workflows.

## Basic Variable Substitution

Variables are enclosed in double curly braces:

```
{{VARIABLE_NAME}}
```

### Example:
```yaml
agent:
  name: {{AGENT_NAME}}
  title: {{AGENT_TITLE}}
  icon: {{AGENT_ICON}}
```

## Conditional Blocks

Conditionals allow content to be included or excluded based on boolean variables:

```
{{#IF_VARIABLE}}
Content to include if VARIABLE is true
{{/IF_VARIABLE}}
```

### Example:
```yaml
{{#IF_SECURITY}}
security:
  level: {{SECURITY_LEVEL}}
  requiresApproval: {{REQUIRES_APPROVAL}}
{{/IF_SECURITY}}
```

## Loops

Loops iterate over arrays to generate repeated content:

```
{{#EACH_ITEMS}}
  - {{ITEM}}
{{/EACH_ITEMS}}
```

### Loop Variables:
- `{{ITEM}}` - Current item value
- `{{INDEX}}` - Current item index (0-based)
- `{{#IF_FIRST}}` - True for first item
- `{{#IF_LAST}}` - True for last item
- `{{#UNLESS_LAST}}` - True for all except last item

### Example with Objects:
```yaml
commands:
{{#EACH_COMMANDS}}
  - name: {{COMMAND_NAME}}
    description: {{COMMAND_DESCRIPTION}}
    {{#IF_COMMAND_PARAMS}}
    parameters:
    {{#EACH_COMMAND_PARAMS}}
      - {{PARAM_NAME}}: {{PARAM_TYPE}}
    {{/EACH_COMMAND_PARAMS}}
    {{/IF_COMMAND_PARAMS}}
{{/EACH_COMMANDS}}
```

## Nested Structures

Templates support nested conditionals and loops:

```yaml
{{#IF_WORKFLOWS}}
workflows:
{{#EACH_WORKFLOWS}}
  - id: {{WORKFLOW_ID}}
    name: {{WORKFLOW_NAME}}
    {{#IF_WORKFLOW_STEPS}}
    steps:
    {{#EACH_WORKFLOW_STEPS}}
      - name: {{STEP_NAME}}
        task: {{STEP_TASK}}
        {{#IF_STEP_CONDITION}}
        condition: {{STEP_CONDITION}}
        {{/IF_STEP_CONDITION}}
    {{/EACH_WORKFLOW_STEPS}}
    {{/IF_WORKFLOW_STEPS}}
{{/EACH_WORKFLOWS}}
{{/IF_WORKFLOWS}}
```

## Special Characters

### Escaping Braces
To include literal braces in your output, escape them with backslashes:

```
This is a literal \{{variable}} that won't be replaced
```

### Handling Quotes
Variables containing quotes are automatically handled:

```yaml
description: "{{DESCRIPTION}}"
```

If `DESCRIPTION` contains quotes, they will be properly escaped.

## Variable Naming Conventions

1. **Use UPPERCASE_WITH_UNDERSCORES** for all variables
2. **Conditional variables** should start with `IF_`
3. **Loop variables** should start with `EACH_`
4. **Boolean negation** uses `UNLESS_`

### Standard Variable Prefixes:
- `IF_` - Boolean conditions
- `EACH_` - Array iterations
- `UNLESS_` - Negative conditions
- `HAS_` - Existence checks
- `IS_` - State checks

## Common Template Variables

### Agent Templates:
- `AGENT_NAME` - Lowercase hyphenated name
- `AGENT_TITLE` - Human-readable title
- `AGENT_ID` - Unique identifier
- `AGENT_ICON` - Emoji or icon
- `WHEN_TO_USE` - Usage description
- `EACH_COMMANDS` - Command array
- `IF_PERSONA` - Has persona configuration
- `PERSONA_TONE` - Communication tone
- `PERSONA_VERBOSITY` - Response detail level

### Task Templates:
- `TASK_ID` - Task identifier
- `TASK_TITLE` - Task title
- `AGENT_NAME` - Associated agent
- `TASK_DESCRIPTION` - Task description
- `EACH_STEPS` - Process steps
- `EACH_PREREQUISITES` - Requirements
- `EACH_INPUTS` - Input parameters

### Workflow Templates:
- `WORKFLOW_ID` - Workflow identifier
- `WORKFLOW_NAME` - Workflow name
- `WORKFLOW_TYPE` - sequential/parallel
- `EACH_STEPS` - Workflow steps
- `TRIGGER_TYPE` - Trigger mechanism

## Advanced Features

### Conditional with Defaults
```yaml
priority: {{#IF_PRIORITY}}{{PRIORITY}}{{/IF_PRIORITY}}{{#UNLESS_PRIORITY}}medium{{/UNLESS_PRIORITY}}
```

### Complex Object Arrays
```yaml
{{#EACH_COMPONENTS}}
- type: {{COMPONENT_TYPE}}
  name: {{COMPONENT_NAME}}
  {{#IF_COMPONENT_CONFIG}}
  config:
    {{#EACH_CONFIG_ITEMS}}
    {{CONFIG_KEY}}: {{CONFIG_VALUE}}
    {{/EACH_CONFIG_ITEMS}}
  {{/IF_COMPONENT_CONFIG}}
{{/EACH_COMPONENTS}}
```

### Preserving Indentation
The template engine preserves indentation within loops:

```yaml
services:
{{#EACH_SERVICES}}
  - name: {{SERVICE_NAME}}
    port: {{SERVICE_PORT}}
    {{#IF_SERVICE_ENV}}
    environment:
    {{#EACH_SERVICE_ENV_VARS}}
      {{ENV_KEY}}: {{ENV_VALUE}}
    {{/EACH_SERVICE_ENV_VARS}}
    {{/IF_SERVICE_ENV}}
{{/EACH_SERVICES}}
```

## Best Practices

1. **Always validate variable names** before template processing
2. **Use meaningful variable names** that describe their content
3. **Group related variables** with common prefixes
4. **Document required vs optional variables** in templates
5. **Test templates with edge cases** (empty arrays, missing values)

## Error Handling

The template engine handles errors gracefully:
- Missing variables are left as-is: `{{MISSING_VAR}}`
- Malformed conditionals are preserved in output
- Empty arrays result in no output for that section
- Null/undefined values are converted to empty strings

## Examples

### Complete Agent Template Example:
```yaml
# {{AGENT_TITLE}}

**Agent ID:** {{AGENT_ID}}  
**Agent Name:** {{AGENT_NAME}}

## When to Use
{{WHEN_TO_USE}}

## Icon
{{AGENT_ICON}}

{{#IF_COMMANDS}}
## Commands
{{#EACH_COMMANDS}}
- `{{COMMAND_NAME}}`: {{COMMAND_DESCRIPTION}}
{{/EACH_COMMANDS}}
{{/IF_COMMANDS}}

{{#IF_PERSONA}}
## Persona
**Tone:** {{PERSONA_TONE}}  
**Verbosity:** {{PERSONA_VERBOSITY}}
{{#IF_PERSONA_INSTRUCTIONS}}

### Special Instructions
{{PERSONA_INSTRUCTIONS}}
{{/IF_PERSONA_INSTRUCTIONS}}
{{/IF_PERSONA}}

{{#IF_SECURITY}}
## Security Configuration
**Level:** {{SECURITY_LEVEL}}  
**Requires Approval:** {{REQUIRES_APPROVAL}}
{{/IF_SECURITY}}
```

## Troubleshooting

### Common Issues:

1. **Variables not replaced**: Check for typos in variable names
2. **Conditionals not working**: Ensure closing tags match opening tags
3. **Loops producing no output**: Verify array variable exists and has items
4. **Indentation issues**: Check that loop content maintains consistent spacing
5. **Escaped characters appearing**: Use double backslashes for literal output

### Debug Mode:
Enable template debugging by setting `DEBUG_TEMPLATES=true` to see:
- Variable resolution process
- Conditional evaluation
- Loop iteration details