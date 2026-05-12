---

## Execution Modes

**Choose your execution mode:**

### 1. YOLO Mode - Fast, Autonomous (0-1 prompts)
- Autonomous decision making with logging
- Minimal user interaction
- **Best for:** Simple, deterministic tasks

### 2. Interactive Mode - Balanced, Educational (5-10 prompts) **[DEFAULT]**
- Explicit decision checkpoints
- Educational explanations
- **Best for:** Learning, complex decisions

### 3. Pre-Flight Planning - Comprehensive Upfront Planning
- Task analysis phase (identify all ambiguities)
- Zero ambiguity execution
- **Best for:** Ambiguous requirements, critical work

**Parameter:** `mode` (optional, default: `interactive`)

---

## Task Definition (AIOX Task Format V1.0)

```yaml
task: deprecateComponent()
responsável: Dex (Builder)
responsavel_type: Agente
atomic_layer: Molecule

**Entrada:**
- campo: task
  tipo: string
  origem: User Input
  obrigatório: true
  validação: Must be registered task

- campo: parameters
  tipo: object
  origem: User Input
  obrigatório: false
  validação: Valid task parameters

- campo: mode
  tipo: string
  origem: User Input
  obrigatório: false
  validação: yolo|interactive|pre-flight

**Saída:**
- campo: execution_result
  tipo: object
  destino: Memory
  persistido: false

- campo: logs
  tipo: array
  destino: File (.ai/logs/*)
  persistido: true

- campo: state
  tipo: object
  destino: State management
  persistido: true
```

---

## Pre-Conditions

**Purpose:** Validate prerequisites BEFORE task execution (blocking)

**Checklist:**

```yaml
pre-conditions:
  - [ ] Task is registered; required parameters provided; dependencies met
    tipo: pre-condition
    blocker: true
    validação: |
      Check task is registered; required parameters provided; dependencies met
    error_message: "Pre-condition failed: Task is registered; required parameters provided; dependencies met"
```

---

## Post-Conditions

**Purpose:** Validate execution success AFTER task completes

**Checklist:**

```yaml
post-conditions:
  - [ ] Task completed; exit code 0; expected outputs created
    tipo: post-condition
    blocker: true
    validação: |
      Verify task completed; exit code 0; expected outputs created
    error_message: "Post-condition failed: Task completed; exit code 0; expected outputs created"
```

---

## Acceptance Criteria

**Purpose:** Definitive pass/fail criteria for task completion

**Checklist:**

```yaml
acceptance-criteria:
  - [ ] Task completed as expected; side effects documented
    tipo: acceptance-criterion
    blocker: true
    validação: |
      Assert task completed as expected; side effects documented
    error_message: "Acceptance criterion not met: Task completed as expected; side effects documented"
```

---

## Tools

**External/shared resources used by this task:**

- **Tool:** task-runner
  - **Purpose:** Task execution and orchestration
  - **Source:** .aiox-core/core/task-runner.js

- **Tool:** logger
  - **Purpose:** Execution logging and error tracking
  - **Source:** .aiox-core/utils/logger.js

---

## Scripts

**Agent-specific code for this task:**

- **Script:** execute-task.js
  - **Purpose:** Generic task execution wrapper
  - **Language:** JavaScript
  - **Location:** .aiox-core/scripts/execute-task.js

---

## Error Handling

**Strategy:** retry

**Common Errors:**

1. **Error:** Task Not Found
   - **Cause:** Specified task not registered in system
   - **Resolution:** Verify task name and registration
   - **Recovery:** List available tasks, suggest similar

2. **Error:** Invalid Parameters
   - **Cause:** Task parameters do not match expected schema
   - **Resolution:** Validate parameters against task definition
   - **Recovery:** Provide parameter template, reject execution

3. **Error:** Execution Timeout
   - **Cause:** Task exceeds maximum execution time
   - **Resolution:** Optimize task or increase timeout
   - **Recovery:** Kill task, cleanup resources, log state

---

## Performance

**Expected Metrics:**

```yaml
duration_expected: 2-5 min (estimated)
cost_estimated: $0.001-0.003
token_usage: ~1,000-3,000 tokens
```

**Optimization Notes:**
- Parallelize independent operations; reuse atom results; implement early exits

---

## Metadata

```yaml
story: N/A
version: 1.0.0
dependencies:
  - N/A
tags:
  - automation
  - workflow
updated_at: 2025-11-17
```

---

tools:
  - github-cli
# TODO: Create deprecation-checklist.md for validation (follow-up story needed)
# checklists:
#   - deprecation-checklist.md
---

# Deprecate Component - AIOX Developer Task

## Purpose
Mark framework components as deprecated with timeline management and migration path generation.

## Command Pattern
```
*deprecate-component <component-type> <component-name> [options]
```

## Parameters
- `component-type`: Type of component (agent, task, workflow, util)
- `component-name`: Name/ID of the component to deprecate
- `options`: Deprecation configuration and timeline

### Options
- `--removal-version <version>`: Target version for removal (default: next major)
- `--replacement <name>`: Replacement component name
- `--reason <text>`: Deprecation reason
- `--migration-guide <path>`: Path to migration guide
- `--immediate`: Mark for immediate deprecation warnings
- `--timeline <months>`: Deprecation timeline in months (default: 6)
- `--severity <level>`: Deprecation severity (low, medium, high, critical)

## Examples
```bash
# Deprecate an agent with replacement
*deprecate-component agent weather-fetcher --replacement weather-service --reason "Performance optimization" --timeline 3

# Deprecate a utility with migration guide
*deprecate-component util old-logger --replacement @aiox/logger --migration-guide docs/migration/logger.md --severity high

# Immediate deprecation for security issue
*deprecate-component task insecure-parser --immediate --reason "Security vulnerability" --severity critical

# Deprecate workflow with custom removal version
*deprecate-component workflow legacy-processor --removal-version 3.0.0 --timeline 12
```

## Implementation

```javascript
const fs = require('fs').promises;
const path = require('path');
const chalk = require('chalk');
const inquirer = require('inquirer');

class DeprecateComponentTask {
  constructor() {
    this.taskName = 'deprecate-component';
    this.description = 'Mark framework components as deprecated with timeline management';
    this.rootPath = process.cwd();
    this.deprecationManager = null;
    this.usageTracker = null;
    this.componentSearch = null;
  }

  async execute(params) {
    try {
      console.log(chalk.blue('🚫 AIOX Component Deprecation'));
      console.log(chalk.gray('Marking component as deprecated with timeline management\n'));

      // Parse and validate parameters
      const config = await this.parseParameters(params);
      
      // Initialize dependencies
      await this.initializeDependencies();

      // Find target component
      const component = await this.findComponent(config.componentType, config.componentName);
      if (!component) {
        throw new Error(`Component not found: ${config.componentType}/${config.componentName}`);
      }

      // Check current deprecation status
      const currentStatus = await this.checkDeprecationStatus(component);
      if (currentStatus.deprecated && !config.force) {
        console.log(chalk.yellow(`⚠️  Component ${component.name} is already deprecated`));
        
        const { action } = await inquirer.prompt([{
          type: 'list',
          name: 'action',
          message: 'Component is already deprecated. What would you like to do?',
          choices: [
            { name: 'Update deprecation details', value: 'update' },
            { name: 'View current deprecation info', value: 'view' },
            { name: 'Cancel operation', value: 'cancel' }
          ]
        }]);

        if (action === 'cancel') {
          console.log(chalk.gray('Operation cancelled'));
          return;
        } else if (action === 'view') {
          await this.displayDeprecationInfo(component, currentStatus);
          return;
        }
      }

      // Analyze component usage
      console.log(chalk.gray('Analyzing component usage...'));
      const usageAnalysis = await this.analyzeComponentUsage(component);
      
      // Generate deprecation plan
      const deprecationPlan = await this.generateDeprecationPlan(component, config, usageAnalysis);

      // Display deprecation summary
      await this.displayDeprecationSummary(component, deprecationPlan);

      // Request confirmation
      const confirmed = await this.requestConfirmation(deprecationPlan);
      if (!confirmed) {
        console.log(chalk.gray('Deprecation cancelled'));
        return;
      }

      // Execute deprecation
      const deprecationResult = await this.executeDeprecation(component, deprecationPlan);

      // Update documentation
      await this.updateDocumentation(component, deprecationPlan);

      // Generate migration artifacts
      if (deprecationPlan.migrationRequired) {
        await this.generateMigrationArtifacts(component, deprecationPlan);
      }

      // Schedule deprecation tasks
      await this.scheduleDeprecationTasks(component, deprecationPlan);

      // Display success summary
      console.log(chalk.green('\n✅ Component deprecation completed successfully'));
      console.log(chalk.gray(`   Component: ${component.type}/${component.name}`));
      console.log(chalk.gray(`   Deprecation ID: ${deprecationResult.deprecationId}`));
      console.log(chalk.gray(`   Timeline: ${deprecationPlan.timeline} months`));
      console.log(chalk.gray(`   Removal planned: ${deprecationPlan.removalVersion}`));
      
      if (deprecationPlan.usageCount > 0) {
        console.log(chalk.yellow(`   ⚠️  Found ${deprecationPlan.usageCount} usage(s) that need migration`));
      }

      return {
        success: true,
        deprecationId: deprecationResult.deprecationId,
        component: component,
        timeline: deprecationPlan.timeline,
        usageCount: deprecationPlan.usageCount,
        migrationRequired: deprecationPlan.migrationRequired
      };

    } catch (error) {
      console.error(chalk.red(`\n❌ Component deprecation failed: ${error.message}`));
      throw error;
    }
  }

  async parseParameters(params) {
    if (params.length < 2) {
      throw new Error('Usage: *deprecate-component <component-type> <component-name> [options]');
    }

    const config = {
      componentType: params[0],
      componentName: params[1],
      removalVersion: null,
      replacement: null,
      reason: null,
      migrationGuide: null,
      immediate: false,
      timeline: 6,
      severity: 'medium',
      force: false
    };

    // Parse options
    for (let i = 2; i < params.length; i++) {
      const param = params[i];
      
      if (param === '--immediate') {
        config.immediate = true;
      } else if (param === '--force') {
        config.force = true;
      } else if (param.startsWith('--removal-version') && params[i + 1]) {
        config.removalVersion = params[++i];
      } else if (param.startsWith('--replacement') && params[i + 1]) {
        config.replacement = params[++i];
      } else if (param.startsWith('--reason') && params[i + 1]) {
        config.reason = params[++i];
      } else if (param.startsWith('--migration-guide') && params[i + 1]) {
        config.migrationGuide = params[++i];
      } else if (param.startsWith('--timeline') && params[i + 1]) {
        config.timeline = parseInt(params[++i]) || 6;
      } else if (param.startsWith('--severity') && params[i + 1]) {
        config.severity = params[++i];
      }
    }

    // Validate component type
    const validTypes = ['agent', 'task', 'workflow', 'util'];
    if (!validTypes.includes(config.componentType)) {
      throw new Error(`Invalid component type: ${config.componentType}. Must be one of: ${validTypes.join(', ')}`);
    }

    // Validate severity
    const validSeverities = ['low', 'medium', 'high', 'critical'];
    if (!validSeverities.includes(config.severity)) {
      throw new Error(`Invalid severity: ${config.severity}. Must be one of: ${validSeverities.join(', ')}`);
    }

    return config;
  }

  async initializeDependencies() {
    try {
      // Initialize deprecation manager
      // const DeprecationManager = require('../scripts/deprecation-manager'); // Archived in Story 3.18
      // this.deprecationManager = new DeprecationManager({ rootPath: this.rootPath });
      // await this.deprecationManager.initialize();

      // Initialize usage tracker
      // const UsageTracker = require('../scripts/usage-tracker'); // Archived in Story 3.18
      // this.usageTracker = new UsageTracker({ rootPath: this.rootPath });

      // Initialize component search
      const ComponentSearch = require('../scripts/component-search');
      this.componentSearch = new ComponentSearch({ rootPath: this.rootPath });

    } catch (error) {
      throw new Error(`Failed to initialize dependencies: ${error.message}`);
    }
  }

  async findComponent(componentType, componentName) {
    const component = await this.componentSearch.findComponent(componentType, componentName);
    
    if (!component) {
      // Suggest similar components
      const suggestions = await this.componentSearch.findSimilarComponents(componentType, componentName);
      if (suggestions.length > 0) {
        console.log(chalk.yellow('\nDid you mean one of these?'));
        suggestions.forEach(suggestion => {
          console.log(chalk.gray(`  - ${suggestion.type}/${suggestion.name}`));
        });
      }
      return null;
    }

    return component;
  }

  async checkDeprecationStatus(component) {
    return await this.deprecationManager.getDeprecationStatus(component.id);
  }

  async analyzeComponentUsage(component) {
    const usageAnalysis = await this.usageTracker.analyzeComponentUsage(component.id, {
      includeTests: false,
      includeDocs: false,
      scanDepth: 'full'
    });

    return {
      usageCount: usageAnalysis.total_references,
      usageLocations: usageAnalysis.usage_locations,
      dependentComponents: usageAnalysis.dependent_components,
      externalReferences: usageAnalysis.external_references
    };
  }

  async generateDeprecationPlan(component, config, usageAnalysis) {
    const plan = {
      componentId: component.id,
      componentType: component.type,
      componentName: component.name,
      deprecationTimestamp: new Date().toISOString(),
      removalVersion: config.removalVersion || await this.calculateRemovalVersion(config.timeline),
      replacement: config.replacement,
      reason: config.reason || 'Component deprecated',
      migrationGuide: config.migrationGuide,
      immediate: config.immediate,
      timeline: config.timeline,
      severity: config.severity,
      usageCount: usageAnalysis.usageCount,
      migrationRequired: usageAnalysis.usageCount > 0,
      affectedComponents: usageAnalysis.dependentComponents,
      deprecationActions: [],
      notifications: []
    };

    // Generate deprecation actions
    plan.deprecationActions = await this.generateDeprecationActions(component, plan, usageAnalysis);

    // Generate notification plan
    plan.notifications = this.generateNotificationPlan(plan);

    return plan;
  }

  async calculateRemovalVersion(timelineMonths) {
    // Get current version from package.json or version tracker
    try {
      const packagePath = path.join(this.rootPath, 'package.json');
      const packageContent = await fs.readFile(packagePath, 'utf-8');
      const packageInfo = JSON.parse(packageContent);
      const currentVersion = packageInfo.version || '1.0.0';
      
      // Calculate removal version based on timeline
      const [major, minor, patch] = currentVersion.split('.').map(Number);
      
      if (timelineMonths >= 12) {
        return `${major + 1}.0.0`;
      } else if (timelineMonths >= 6) {
        return `${major}.${minor + 1}.0`;
      } else {
        return `${major}.${minor}.${patch + 10}`;
      }
    } catch (error) {
      return '2.0.0'; // Fallback version
    }
  }

  async generateDeprecationActions(component, plan, usageAnalysis) {
    const actions = [];

    // Add deprecation metadata
    actions.push({
      type: 'add_deprecation_metadata',
      description: 'Add deprecation metadata to component',
      target: component.filePath,
      metadata: {
        deprecated: true,
        deprecatedSince: plan.deprecationTimestamp,
        removalPlanned: plan.removalVersion,
        replacement: plan.replacement,
        reason: plan.reason
      }
    });

    // Add deprecation comments/warnings
    actions.push({
      type: 'add_deprecation_warnings',
      description: 'Add deprecation warnings to component code',
      target: component.filePath,
      warningType: component.type === 'agent' ? 'yaml_comment' : 'code_comment'
    });

    // Update component registration
    if (component.registrationFile) {
      actions.push({
        type: 'update_component_registry',
        description: 'Mark component as deprecated in registry',
        target: component.registrationFile,
        deprecationStatus: true
      });
    }

    // Generate usage warnings
    if (usageAnalysis.usageCount > 0) {
      for (const usage of usageAnalysis.usageLocations) {
        actions.push({
          type: 'add_usage_warning',
          description: `Add deprecation warning at usage site: ${usage.file}`,
          target: usage.file,
          line: usage.line,
          warningMessage: this.generateUsageWarning(component, plan)
        });
      }
    }

    return actions;
  }

  generateUsageWarning(component, plan) {
    let warning = `DEPRECATED: ${component.type}/${component.name} is deprecated`;
    
    if (plan.replacement) {
      warning += ` - use ${plan.replacement} instead`;
    }
    
    if (plan.removalVersion) {
      warning += ` (removal planned in ${plan.removalVersion})`;
    }
    
    return warning;
  }

  generateNotificationPlan(plan) {
    const notifications = [];

    // Immediate notification for high/critical severity
    if (plan.severity === 'high' || plan.severity === 'critical') {
      notifications.push({
        type: 'immediate_alert',
        message: `High priority deprecation: ${plan.componentType}/${plan.componentName}`,
        channels: ['console', 'log']
      });
    }

    // Timeline-based notifications
    if (plan.timeline >= 6) {
      notifications.push({
        type: 'scheduled_reminder',
        schedule: 'monthly',
        message: `Reminder: ${plan.componentName} deprecation (${plan.timeline} months remaining)`
      });
    }

    // Pre-removal warning
    notifications.push({
      type: 'pre_removal_warning',
      schedule: '1_month_before_removal',
      message: `Final warning: ${plan.componentName} will be removed in ${plan.removalVersion}`
    });

    return notifications;
  }

  async displayDeprecationSummary(component, plan) {
    console.log(chalk.blue('\n📋 Deprecation Summary'));
    console.log(chalk.gray('━'.repeat(50)));
    
    console.log(`Component: ${chalk.white(component.type)}/${chalk.white(component.name)}`);
    console.log(`Location: ${chalk.gray(component.filePath)}`);
    console.log(`Reason: ${chalk.yellow(plan.reason)}`);
    console.log(`Severity: ${this.getSeverityColor(plan.severity)(plan.severity)}`);
    console.log(`Timeline: ${chalk.white(plan.timeline)} months`);
    console.log(`Removal Version: ${chalk.white(plan.removalVersion)}`);
    
    if (plan.replacement) {
      console.log(`Replacement: ${chalk.green(plan.replacement)}`);
    }
    
    if (plan.usageCount > 0) {
      console.log(`\n${chalk.yellow('⚠️  Usage Analysis:')}`);
      console.log(`  Found ${chalk.white(plan.usageCount)} usage(s) across ${plan.affectedComponents.length} component(s)`);
    }
    
    console.log(`\n${chalk.blue('Planned Actions:')}`);
    plan.deprecationActions.forEach((action, index) => {
      console.log(`  ${index + 1}. ${action.description}`);
    });
  }

  getSeverityColor(severity) {
    const colors = {
      low: chalk.green,
      medium: chalk.yellow,
      high: chalk.orange || chalk.yellow,
      critical: chalk.red
    };
    return colors[severity] || chalk.white;
  }

  async requestConfirmation(plan) {
    const { confirmed } = await inquirer.prompt([{
      type: 'confirm',
      name: 'confirmed',
      message: `Proceed with deprecating ${plan.componentType}/${plan.componentName}?`,
      default: false
    }]);

    return confirmed;
  }

  async executeDeprecation(component, plan) {
    const deprecationId = `dep-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    
    console.log(chalk.gray('\nExecuting deprecation actions...'));

    const results = {
      deprecationId,
      actionsExecuted: 0,
      actionsFailed: 0,
      errors: []
    };

    for (const action of plan.deprecationActions) {
      try {
        await this.executeDeprecationAction(action);
        results.actionsExecuted++;
        console.log(chalk.gray(`  ✓ ${action.description}`));
      } catch (error) {
        results.actionsFailed++;
        results.errors.push({
          action: action.type,
          error: error.message
        });
        console.log(chalk.red(`  ✗ ${action.description}: ${error.message}`));
      }
    }

    // Record deprecation in system
    await this.deprecationManager.recordDeprecation(component.id, {
      deprecationId,
      timestamp: plan.deprecationTimestamp,
      plan: plan,
      results: results
    });

    return results;
  }

  async executeDeprecationAction(action) {
    switch (action.type) {
      case 'add_deprecation_metadata':
        return await this.addDeprecationMetadata(action.target, action.metadata);
      
      case 'add_deprecation_warnings':
        return await this.addDeprecationWarnings(action.target, action.warningType);
      
      case 'update_component_registry':
        return await this.updateComponentRegistry(action.target, action.deprecationStatus);
      
      case 'add_usage_warning':
        return await this.addUsageWarning(action.target, action.line, action.warningMessage);
      
      default:
        throw new Error(`Unknown deprecation action type: ${action.type}`);
    }
  }

  async addDeprecationMetadata(filePath, metadata) {
    // Implementation depends on file type
    // For now, add to a separate metadata file
    const metadataPath = path.join(path.dirname(filePath), '.deprecation-metadata.json');
    
    let existingMetadata = {};
    try {
      const content = await fs.readFile(metadataPath, 'utf-8');
      existingMetadata = JSON.parse(content);
    } catch (error) {
      // File doesn't exist, start fresh
    }

    existingMetadata[path.basename(filePath)] = metadata;
    
    await fs.writeFile(metadataPath, JSON.stringify(existingMetadata, null, 2));
  }

  async addDeprecationWarnings(filePath, warningType) {
    const content = await fs.readFile(filePath, 'utf-8');
    
    if (warningType === 'yaml_comment') {
      // Add YAML comment for agent files
      const warningComment = '# DEPRECATED: This agent is deprecated and will be removed in a future version\n';
      const updatedContent = warningComment + content;
      await fs.writeFile(filePath, updatedContent);
    } else {
      // Add code comment for other files
      const warningComment = '// DEPRECATED: This component is deprecated and will be removed in a future version\n';
      const updatedContent = warningComment + content;
      await fs.writeFile(filePath, updatedContent);
    }
  }

  async updateComponentRegistry(registryPath, deprecationStatus) {
    // Update component registry to mark as deprecated
    // Implementation would depend on registry format
    console.log(chalk.gray(`Would update registry at ${registryPath}`));
  }

  async addUsageWarning(filePath, lineNumber, warningMessage) {
    // Add deprecation warning comment near usage
    console.log(chalk.gray(`Would add warning to ${filePath}:${lineNumber}: ${warningMessage}`));
  }

  async updateDocumentation(component, plan) {
    // Update component documentation with deprecation notice
    const docsPath = this.findComponentDocumentation(component);
    if (docsPath) {
      // Add deprecation notice to documentation
      console.log(chalk.gray(`Updating documentation at ${docsPath}`));
    }
  }

  async generateMigrationArtifacts(component, plan) {
    if (!plan.replacement) return;

    // Generate migration guide
    const migrationGuidePath = path.join(
      this.rootPath, 
      'docs', 
      'migrations', 
      `${component.name}-to-${plan.replacement}.md`
    );

    const migrationGuideContent = this.generateMigrationGuideContent(component, plan);
    
    await fs.mkdir(path.dirname(migrationGuidePath), { recursive: true });
    await fs.writeFile(migrationGuidePath, migrationGuideContent);

    console.log(chalk.gray(`Generated migration guide: ${migrationGuidePath}`));
  }

  generateMigrationGuideContent(component, plan) {
    return `# Migration Guide: ${component.name} → ${plan.replacement}

## Overview
The ${component.type} \`${component.name}\` has been deprecated and will be removed in version ${plan.removalVersion}.

## Reason for Deprecation
${plan.reason}

## Migration Steps
1. Replace usage of \`${component.name}\` with \`${plan.replacement}\`
2. Update any configuration references
3. Test the replacement functionality
4. Remove any deprecated imports/references

## Timeline
- Deprecated: ${new Date(plan.deprecationTimestamp).toLocaleDateString()}
- Removal planned: Version ${plan.removalVersion}
- Timeline: ${plan.timeline} months

## Need Help?
If you encounter issues during migration, please refer to the documentation or contact support.
`;
  }

  async scheduleDeprecationTasks(component, plan) {
    // Schedule future tasks for deprecation timeline
    const tasks = [
      {
        type: 'deprecation_reminder',
        scheduledFor: this.calculateReminderDate(plan.timeline),
        component: component.id,
        message: `Deprecation reminder for ${component.name}`
      },
      {
        type: 'removal_preparation',
        scheduledFor: this.calculateRemovalDate(plan.timeline),
        component: component.id,
        message: `Prepare for removal of ${component.name}`
      }
    ];

    for (const task of tasks) {
      await this.deprecationManager.scheduleTask(task);
    }
  }

  calculateReminderDate(timelineMonths) {
    const reminderDate = new Date();
    reminderDate.setMonth(reminderDate.getMonth() + Math.floor(timelineMonths / 2));
    return reminderDate.toISOString();
  }

  calculateRemovalDate(timelineMonths) {
    const removalDate = new Date();
    removalDate.setMonth(removalDate.getMonth() + timelineMonths);
    return removalDate.toISOString();
  }

  findComponentDocumentation(component) {
    // Find documentation file for component
    return null; // Placeholder
  }

  async displayDeprecationInfo(component, deprecationStatus) {
    console.log(chalk.blue('\n📋 Current Deprecation Status'));
    console.log(chalk.gray('━'.repeat(50)));
    
    console.log(`Component: ${component.type}/${component.name}`);
    console.log(`Deprecated Since: ${new Date(deprecationStatus.deprecatedSince).toLocaleDateString()}`);
    console.log(`Removal Planned: ${deprecationStatus.removalVersion}`);
    console.log(`Reason: ${deprecationStatus.reason}`);
    
    if (deprecationStatus.replacement) {
      console.log(`Replacement: ${deprecationStatus.replacement}`);
    }
  }
}

module.exports = DeprecateComponentTask;
```

## Validation Rules

### Input Validation
- Component type must be valid (agent, task, workflow, util)
- Component must exist in the framework
- Severity must be valid level
- Timeline must be positive number

### Safety Checks
- Warn if component has high usage
- Require confirmation for critical components
- Prevent accidental deprecation of core components

### Deprecation Requirements
- Must specify removal timeline
- Should provide replacement when available
- Must include deprecation reason
- Should generate migration artifacts

## Integration Points

### Deprecation Manager
- Records deprecation metadata
- Tracks deprecation timeline
- Manages scheduled tasks
- Provides deprecation status

### Usage Tracker
- Analyzes component usage across codebase
- Identifies dependent components
- Tracks usage patterns over time
- Provides impact analysis

### Migration Generator
- Creates migration guides
- Generates replacement suggestions
- Provides automated migration scripts
- Tracks migration progress

## Output Structure

### Success Response
```json
{
  "success": true,
  "deprecationId": "dep-1234567890-abc123",
  "component": {
    "type": "agent",
    "name": "weather-fetcher",
    "filePath": "/path/to/component"
  },
  "timeline": 6,
  "usageCount": 3,
  "migrationRequired": true
}
```

### Error Response
```json
{
  "success": false,
  "error": "Component not found: agent/invalid-name",
  "suggestions": ["weather-service", "weather-api"]
}
```

## Security Considerations
- Validate all file paths to prevent directory traversal
- Sanitize user input for deprecation reasons
- Require appropriate permissions for component modification
- Log all deprecation actions for audit trail 