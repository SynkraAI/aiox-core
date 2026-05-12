# Component Creation Guide

## Overview

This guide walks you through creating components in Synkra AIOX using the meta-agent's enhanced template system and interactive workflows.

## Table of Contents

1. [Creating Agents](#creating-agents)
2. [Creating Tasks](#creating-tasks)
3. [Creating Workflows](#creating-workflows)
4. [Batch Component Creation](#batch-component-creation)
5. [Best Practices](#best-practices)
6. [Troubleshooting](#troubleshooting)

## Creating Agents

### Using the Interactive Command

```bash
*create-agent
```

### Interactive Elicitation Process

The meta-agent will guide you through:

1. **Basic Information**
   - Agent name (lowercase-hyphenated)
   - Agent title (human-readable)
   - When to use description

2. **Commands Configuration**
   - Whether to include commands
   - Command names and descriptions
   - Command parameters (optional)

3. **Persona Setup**
   - Communication tone
   - Response verbosity
   - Special instructions

4. **Security Configuration**
   - Security level (low/medium/high)
   - Approval requirements
   - Access restrictions

5. **Advanced Options**
   - Custom icon
   - Tags
   - Dependencies

### Example Session

```
? Agent name (lowercase-hyphenated): data-analyst
? Agent title: Data Analysis Expert
? When should this agent be used?: When users need help analyzing data, creating visualizations, or understanding patterns
? Include commands for this agent? Yes
? Enter commands (comma-separated): *analyze-data, *visualize, *generate-report
? Include persona configuration? Yes
? Persona tone: professional
? Response verbosity: detailed
? Include security configuration? Yes
? Security level: medium
? Require approval for sensitive operations? Yes
```

### Generated Agent Structure

```yaml
# Data Analysis Expert

**Agent ID:** data-analyst  
**Agent Name:** data-analyst

## When to Use
When users need help analyzing data, creating visualizations, or understanding patterns

## Icon
📊

## Commands
- `*analyze-data`: Analyze datasets and identify patterns
- `*visualize`: Create data visualizations
- `*generate-report`: Generate analysis reports

## Persona
**Tone:** professional  
**Verbosity:** detailed

## Security Configuration
**Level:** medium  
**Requires Approval:** true
```

## Creating Tasks

### Using the Interactive Command

```bash
*create-task
```

### Task Elicitation Process

1. **Task Identification**
   - Task ID (verb-noun format)
   - Task title
   - Associated agent

2. **Task Details**
   - Description
   - Context required
   - Prerequisites

3. **Process Steps**
   - Number of steps
   - Step descriptions
   - Validation criteria

4. **Output Configuration**
   - Success/failure formats
   - Error handling

### Example Task Creation

```
? Task ID: analyze-data
? Task title: Analyze Dataset
? Agent name: data-analyst
? Task description: Analyzes provided dataset to identify patterns and insights
? Include process steps? Yes
? How many steps? 3
```

### Generated Task Structure

```markdown
# Task: Analyze Dataset

**Task ID:** analyze-data  
**Agent:** data-analyst  
**Version:** 1.0

## Description
Analyzes provided dataset to identify patterns and insights

## Context Required
- Dataset location or content
- Analysis objectives
- Output format preferences

## Process Flow

### Step 1: Load and Validate Data
Load the dataset and validate its structure.

**Actions:**
- Read data from specified source
- Validate data format
- Check for missing values

### Step 2: Perform Analysis
Execute statistical analysis and pattern detection.

**Actions:**
- Calculate summary statistics
- Identify correlations
- Detect anomalies

### Step 3: Generate Results
Create analysis output in requested format.

**Actions:**
- Format findings
- Create visualizations
- Generate report
```

## Creating Workflows

### Using the Interactive Command

```bash
*create-workflow
```

### Workflow Configuration

1. **Workflow Identity**
   - Workflow ID
   - Workflow name
   - Type (sequential/parallel/conditional)

2. **Trigger Setup**
   - Trigger type (manual/scheduled/event)
   - Trigger conditions

3. **Steps Configuration**
   - Number of steps
   - Step tasks
   - Dependencies

### Example Workflow

```yaml
id: data-pipeline
name: Complete Data Analysis Pipeline
type: sequential

trigger:
  type: manual

steps:
  - id: load-data
    task: load-dataset
    agent: data-analyst
    
  - id: clean-data
    task: clean-data
    agent: data-analyst
    dependsOn: [load-data]
    
  - id: analyze
    task: analyze-data
    agent: data-analyst
    dependsOn: [clean-data]
    
  - id: report
    task: generate-report
    agent: data-analyst
    dependsOn: [analyze]
```

## Batch Component Creation

### Creating a Complete Agent Package

```bash
*create-suite
```

Choose "Complete Agent Package" to create:
- Agent definition
- Associated tasks
- Optional workflow

### Creating Related Components

The batch creator ensures:
- Consistent naming
- Proper dependencies
- Atomic creation (all or nothing)

### Example Suite Creation

```
? What type of suite do you want to create? Complete Agent Package
? Agent name: api-tester
? Agent title: API Testing Specialist
? Agent description: Automated API testing and validation
? Which standard commands to include? analyze, create, test, report
? Include a workflow for this agent? Yes
```

This creates:
- `agents/api-tester.md`
- `tasks/analyze-api.md`
- `tasks/create-api-test.md`
- `tasks/test-api.md`
- `tasks/report-api-results.md`
- `workflows/api-tester-workflow.yaml`

## Best Practices

### Naming Conventions

1. **Agents**: `lowercase-hyphenated-name`
   - Good: `data-analyst`, `api-tester`
   - Bad: `DataAnalyst`, `API_Tester`

2. **Tasks**: `verb-noun` format
   - Good: `analyze-data`, `create-report`
   - Bad: `data-analysis`, `reporting`

3. **Workflows**: `descriptive-name`
   - Good: `data-processing-pipeline`
   - Bad: `workflow1`, `my-workflow`

### Component Dependencies

1. **Always create agents before their tasks**
2. **Define shared tasks in a common agent**
3. **Use dependency resolution for complex setups**

### Security Considerations

1. **Set appropriate security levels**
   - Low: Read-only operations
   - Medium: Modifications with validation
   - High: System-critical operations

2. **Enable approval requirements for:**
   - Data modifications
   - External API calls
   - System configuration changes

### Documentation Standards

1. **Clear descriptions**: Explain what and why
2. **Complete examples**: Show typical usage
3. **Error scenarios**: Document failure modes
4. **Prerequisites**: List all requirements

## Troubleshooting

### Common Issues

#### Component Creation Fails

**Problem**: Security validation error
```
❌ Security check failed: Potential code injection detected
```

**Solution**: 
- Review input for special characters
- Avoid executable code in descriptions
- Use plain text for content

#### Duplicate Component Names

**Problem**: Component already exists
```
❌ Error: Agent 'data-analyst' already exists
```

**Solution**:
- Choose unique names
- Check existing components first
- Use version suffixes if needed

#### Missing Dependencies

**Problem**: Required task not found
```
⚠️ Warning: Task 'analyze-data' references missing agent
```

**Solution**:
- Create dependencies first
- Use batch creation for related components
- Run dependency validation

#### Template Processing Errors

**Problem**: Variables not replaced
```
Generated content contains: {{AGENT_NAME}}
```

**Solution**:
- Check variable names in elicitation
- Verify template file exists
- Enable debug mode for details

### Debug Mode

Enable detailed logging:
```bash
DEBUG=aiox:* *create-agent
```

This shows:
- Template processing steps
- Variable resolution
- Validation checks
- File operations

### Recovery Options

#### Rollback Last Operation
```bash
*undo-last
```

#### List Recent Transactions
```bash
*list-transactions
```

#### Selective Rollback
```bash
*rollback --transaction-id=txn-123
```

### Getting Help

1. **Check component examples**: `aiox-core/agents/examples/`
2. **Review templates**: `aiox-core/templates/`
3. **Run validation**: `*validate-component`
4. **Ask meta-agent**: `*help create-agent`

## Advanced Features

### Custom Templates

Create custom templates in `aiox-core/templates/custom/`:

```yaml
# custom-agent-template.yaml
{{#IF_CUSTOM_FEATURE}}
customFeature:
  enabled: true
  config: {{CUSTOM_CONFIG}}
{{/IF_CUSTOM_FEATURE}}
```

### Session Management

Save and resume elicitation:

```bash
# Save session
*create-agent --save-session=my-agent-session

# Resume later
*create-agent --load-session=my-agent-session
```

### Programmatic Creation

Use configuration files:

```bash
*create-agent --config=agent-config.json
```

Config file format:
```json
{
  "agentName": "automated-agent",
  "agentTitle": "Automated Agent",
  "whenToUse": "For automated tasks",
  "commands": ["*process", "*validate"],
  "personaTone": "concise",
  "securityLevel": "medium"
}
```

## Next Steps

1. **Create your first agent**: Start with a simple agent
2. **Add tasks**: Define agent capabilities
3. **Build workflows**: Combine tasks into processes
4. **Test thoroughly**: Validate all components
5. **Document usage**: Help others use your components