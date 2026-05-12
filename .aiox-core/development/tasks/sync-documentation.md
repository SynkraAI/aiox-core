# sync-documentation

**Task ID:** `sync-documentation`  
**Version:** 2.0.0  
**Status:** Active

---

## Purpose

Automatically synchronize documentation with code changes to ensure documentation stays up-to-date with implementation.

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

**Valid values:** `yolo`, `interactive`, `preflight`

---

## Task Definition (AIOX Task Format V1.0)

```yaml
task: syncDocumentation()
responsável: Morgan (Strategist)
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

## Step-by-Step Execution

### Step 1: Parse Parameters

**Purpose:** Parse and validate command-line parameters

**Actions:**
1. Parse command-line options (--component, --all, --check, etc.)
2. Validate sync strategies
3. Set default values
4. Validate file paths if provided

**Validation:**
- Parameters are valid
- Strategies are supported
- File paths exist (if specified)

---

### Step 2: Initialize Dependencies

**Purpose:** Set up documentation synchronizer and required tools

**Actions:**
1. Load DocumentationSynchronizer module
2. Initialize synchronizer with root path
3. Set up event listeners
4. Verify all dependencies available

**Validation:**
- Synchronizer initialized successfully
- Event listeners registered
- Dependencies available

---

### Step 3: Execute Requested Action

**Purpose:** Execute the requested synchronization action

**Actions:**
1. Determine action type (check, sync, auto-sync, report)
2. Execute corresponding method
3. Handle errors gracefully
4. Return results

**Validation:**
- Action executed successfully
- Results returned
- Errors handled appropriately

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
    rollback: false
    error_message: "Post-condition failed: Task completed; exit code 0; expected outputs created"
```

---

## Acceptance Criteria

**Purpose:** Validate story requirements AFTER workflow (non-blocking, can be manual)

**Checklist:**

```yaml
acceptance-criteria:
  - [ ] Task completed as expected; side effects documented
    tipo: acceptance-criterion
    blocker: false
    story: N/A
    manual_check: false
    validação: |
      Assert task completed as expected; side effects documented
    error_message: "Acceptance criterion not met: Task completed as expected; side effects documented"
```

---

## Tools (External/Shared)

**Purpose:** Catalog reusable tools used by multiple agents

```yaml
**Tools:**
- task-runner:
    version: latest
    used_for: Task execution and orchestration
    shared_with: [dev, qa, po]
    cost: $0

- logger:
    version: latest
    used_for: Execution logging and error tracking
    shared_with: [dev, qa, po, sm]
    cost: $0
```

---

## Scripts (Agent-Specific)

**Purpose:** Agent-specific code for this task

```yaml
**Scripts:**
- execute-task.js:
    description: Generic task execution wrapper
    language: JavaScript
    location: .aiox-core/scripts/execute-task.js

- documentation-synchronizer.js:
    description: Core documentation synchronization engine
    language: JavaScript
    location: .aiox-core/scripts/documentation-synchronizer.js
```

---

## Error Handling

**Strategy:** fallback

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
story: STORY-6.1.7.2
version: 2.0.0
dependencies:
  - N/A
tags:
  - automation
  - workflow
updated_at: 2025-01-17
```

## Command Pattern
```
*sync-documentation [options]
```

## Parameters
- `options`: Documentation synchronization configuration

### Options
- `--component <path>`: Sync documentation for specific component
- `--all`: Sync all registered components
- `--check`: Check for out-of-sync documentation without updating
- `--strategies <types>`: Comma-separated sync strategies (jsdoc,markdown,schema,api,examples)
- `--auto-sync`: Enable automatic synchronization monitoring
- `--report <file>`: Generate synchronization report
- `--force`: Force synchronization even if up-to-date
- `--interactive`: Interactive mode for reviewing changes

## Examples
```bash
# Check documentation status
*sync-documentation --check

# Sync specific component
*sync-documentation --component aiox-core/scripts/pattern-learner.js

# Sync all components with specific strategies
*sync-documentation --all --strategies jsdoc,examples

# Enable auto-sync monitoring
*sync-documentation --auto-sync

# Generate sync report
*sync-documentation --report sync-report.json

# Interactive sync review
*sync-documentation --all --interactive
```

## Implementation

```javascript
const fs = require('fs').promises;
const path = require('path');
const chalk = require('chalk');
const inquirer = require('inquirer');

class SyncDocumentationTask {
  constructor() {
    this.taskName = 'sync-documentation';
    this.description = 'Synchronize documentation with code changes';
    this.rootPath = process.cwd();
    this.documentationSynchronizer = null;
    this.syncResults = [];
  }

  async execute(params) {
    try {
      console.log(chalk.blue('📚 AIOX Documentation Synchronization'));
      console.log(chalk.gray('Keeping documentation in sync with code\n'));

      // Parse parameters
      const config = await this.parseParameters(params);
      
      // Initialize dependencies
      await this.initializeDependencies();

      // Execute requested action
      let result;
      
      if (config.check) {
        result = await this.checkSyncStatus(config);
      } else if (config.autoSync) {
        result = await this.enableAutoSync(config);
      } else if (config.report) {
        result = await this.generateReport(config.report);
      } else if (config.component) {
        result = await this.syncComponent(config.component, config);
      } else if (config.all) {
        result = await this.syncAllComponents(config);
      } else {
        // Default: show sync status
        result = await this.showSyncStatus();
      }

      return {
        success: true,
        ...result
      };

    } catch (error) {
      console.error(chalk.red(`\n❌ Documentation sync failed: ${error.message}`));
      throw error;
    }
  }

  async parseParameters(params) {
    const config = {
      component: null,
      all: false,
      check: false,
      strategies: ['jsdoc', 'markdown', 'schema', 'api', 'examples'],
      autoSync: false,
      report: null,
      force: false,
      interactive: false
    };

    for (let i = 0; i < params.length; i++) {
      const param = params[i];

      if (param === '--all') {
        config.all = true;
      } else if (param === '--check') {
        config.check = true;
      } else if (param === '--auto-sync') {
        config.autoSync = true;
      } else if (param === '--force') {
        config.force = true;
      } else if (param === '--interactive') {
        config.interactive = true;
      } else if (param.startsWith('--component') && params[i + 1]) {
        config.component = params[++i];
      } else if (param.startsWith('--strategies') && params[i + 1]) {
        config.strategies = params[++i].split(',').map(s => s.trim());
      } else if (param.startsWith('--report') && params[i + 1]) {
        config.report = params[++i];
      }
    }

    // Validate strategies
    const validStrategies = ['jsdoc', 'markdown', 'schema', 'api', 'examples'];
    for (const strategy of config.strategies) {
      if (!validStrategies.includes(strategy)) {
        throw new Error(`Invalid sync strategy: ${strategy}`);
      }
    }

    return config;
  }

  async initializeDependencies() {
    try {
      const DocumentationSynchronizer = require('../scripts/documentation-synchronizer');
      this.documentationSynchronizer = new DocumentationSynchronizer({ 
        rootPath: this.rootPath,
        autoSync: false // We'll manage auto-sync manually
      });

      // Initialize synchronizer
      await this.documentationSynchronizer.initialize();

      // Listen to events
      this.documentationSynchronizer.on('synchronized', (data) => {
        this.syncResults.push(data);
      });

      this.documentationSynchronizer.on('error', (data) => {
        console.error(chalk.red(`Sync error: ${data.error.message}`));
      });

    } catch (error) {
      throw new Error(`Failed to initialize dependencies: ${error.message}`);
    }
  }

  async checkSyncStatus(config) {
    console.log(chalk.blue('🔍 Checking documentation sync status...\n'));

    const components = this.documentationSynchronizer.syncedComponents;
    const outOfSync = [];
    const upToDate = [];

    for (const [componentPath, component] of components) {
      try {
        const stats = await fs.stat(componentPath);
        const lastModified = stats.mtime.toISOString();
        
        if (!component.lastSync || lastModified > component.lastSync) {
          outOfSync.push({
            component: componentPath,
            doc: component.docPath,
            lastModified,
            lastSync: component.lastSync
          });
        } else {
          upToDate.push({
            component: componentPath,
            doc: component.docPath
          });
        }
      } catch (error) {
        console.warn(chalk.yellow(`Cannot check: ${componentPath}`));
      }
    }

    // Display results
    if (outOfSync.length > 0) {
      console.log(chalk.yellow(`📋 Out of sync (${outOfSync.length}):\n`));
      
      for (const item of outOfSync) {
        console.log(chalk.red('  ⚠️ ') + path.relative(this.rootPath, item.component));
        console.log(chalk.gray(`     Doc: ${path.relative(this.rootPath, item.doc)}`));
        console.log(chalk.gray(`     Last modified: ${this.formatDate(item.lastModified)}`));
        if (item.lastSync) {
          console.log(chalk.gray(`     Last sync: ${this.formatDate(item.lastSync)}`));
        } else {
          console.log(chalk.gray(`     Last sync: Never`));
        }
        console.log('');
      }
    }

    if (upToDate.length > 0) {
      console.log(chalk.green(`✅ Up to date (${upToDate.length}):\n`));
      
      const shown = Math.min(5, upToDate.length);
      for (let i = 0; i < shown; i++) {
        const item = upToDate[i];
        console.log(chalk.green('  ✓ ') + path.relative(this.rootPath, item.component));
      }
      
      if (upToDate.length > shown) {
        console.log(chalk.gray(`  ... and ${upToDate.length - shown} more`));
      }
    }

    console.log(chalk.blue('\n📊 Summary:'));
    console.log(`  Total components: ${components.size}`);
    console.log(`  Out of sync: ${chalk.yellow(outOfSync.length)}`);
    console.log(`  Up to date: ${chalk.green(upToDate.length)}`);

    if (outOfSync.length > 0) {
      console.log(chalk.yellow('\n💡 Run with --all to sync all out-of-date documentation'));
    }

    return {
      totalComponents: components.size,
      outOfSync: outOfSync.length,
      upToDate: upToDate.length
    };
  }

  async syncComponent(componentPath, config) {
    const fullPath = path.resolve(this.rootPath, componentPath);
    
    console.log(chalk.blue(`🔄 Syncing documentation for: ${componentPath}\n`));

    try {
      const changes = await this.documentationSynchronizer.synchronizeComponent(fullPath, {
        strategies: config.strategies,
        force: config.force
      });

      if (changes.length === 0) {
        console.log(chalk.green('✅ Documentation is already up to date'));
        return { synced: 0 };
      }

      // Display changes
      await this.displaySyncChanges(changes, config);

      return {
        synced: 1,
        changes: changes.length
      };

    } catch (error) {
      console.error(chalk.red(`Failed to sync: ${error.message}`));
      return { synced: 0, error: error.message };
    }
  }

  async syncAllComponents(config) {
    const components = Array.from(this.documentationSynchronizer.syncedComponents.entries());
    
    console.log(chalk.blue(`🔄 Syncing ${components.length} components...\n`));

    const results = {
      synced: 0,
      skipped: 0,
      failed: 0,
      totalChanges: 0
    };

    for (const [componentPath, component] of components) {
      try {
        // Check if needs sync
        if (!config.force) {
          const stats = await fs.stat(componentPath);
          const lastModified = stats.mtime.toISOString();
          
          if (component.lastSync && lastModified <= component.lastSync) {
            results.skipped++;
            continue;
          }
        }

        console.log(chalk.gray(`\nSyncing: ${path.relative(this.rootPath, componentPath)}`));
        
        const changes = await this.documentationSynchronizer.synchronizeComponent(componentPath, {
          strategies: config.strategies
        });

        if (changes.length > 0) {
          results.synced++;
          results.totalChanges += changes.length;
          
          if (config.interactive) {
            await this.displaySyncChanges(changes, config);
          } else {
            console.log(chalk.green(`  ✅ Applied ${changes.length} changes`));
          }
        } else {
          results.skipped++;
        }

      } catch (error) {
        results.failed++;
        console.error(chalk.red(`  ❌ Failed: ${error.message}`));
      }
    }

    // Display summary
    console.log(chalk.blue('\n📊 Synchronization Summary:'));
    console.log(chalk.green(`  ✅ Synced: ${results.synced}`));
    console.log(chalk.gray(`  ⏭️  Skipped: ${results.skipped}`));
    if (results.failed > 0) {
      console.log(chalk.red(`  ❌ Failed: ${results.failed}`));
    }
    console.log(`  Total changes: ${results.totalChanges}`);

    return results;
  }

  async displaySyncChanges(changes, config) {
    console.log(chalk.blue('📝 Changes applied:\n'));

    for (const strategyChanges of changes) {
      if (!strategyChanges.success) {
        console.log(chalk.red(`❌ ${strategyChanges.strategy}: ${strategyChanges.error}`));
        continue;
      }

      console.log(chalk.yellow(`${strategyChanges.strategy}:`));
      
      for (const change of strategyChanges.changes) {
        console.log(`  - ${change.description}`);
        
        if (config.interactive && change.type === 'updated') {
          // Show diff preview
          console.log(chalk.gray('    Preview of changes...'));
        }
      }
    }
  }

  async enableAutoSync(config) {
    console.log(chalk.blue('🔄 Enabling automatic documentation sync...\n'));

    // Configure auto-sync
    this.documentationSynchronizer.options.autoSync = true;
    this.documentationSynchronizer.options.syncInterval = 60000; // 1 minute
    
    // Start auto-sync
    await this.documentationSynchronizer.startAutoSync();

    console.log(chalk.green('✅ Auto-sync enabled'));
    console.log(chalk.gray('Documentation will be checked every minute for changes'));
    console.log(chalk.gray('Press Ctrl+C to stop auto-sync'));

    // Set up monitoring
    this.documentationSynchronizer.on('auto-sync', (data) => {
      if (data.changes.length > 0) {
        console.log(chalk.blue(`\n[${this.formatTime(new Date())}] Auto-sync detected changes:`));
        
        for (const change of data.changes) {
          console.log(`  - ${path.relative(this.rootPath, change.componentPath)}`);
        }
      }
    });

    // Keep process running
    await new Promise((resolve) => {
      process.on('SIGINT', () => {
        console.log(chalk.yellow('\n\nStopping auto-sync...'));
        this.documentationSynchronizer.stopAutoSync();
        resolve();
      });
    });

    return {
      autoSyncEnabled: true
    };
  }

  async generateReport(reportPath) {
    console.log(chalk.blue('📊 Generating synchronization report...\n'));

    const report = await this.documentationSynchronizer.generateSyncReport();
    
    // Add sync results
    report.syncResults = this.syncResults;
    
    // Save report
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
    
    console.log(chalk.green(`✅ Report generated: ${reportPath}`));
    
    // Display summary
    console.log(chalk.blue('\n📋 Report Summary:'));
    console.log(`  Total components: ${report.summary.totalComponents}`);
    console.log(`  Total documentation: ${report.summary.totalDocumentation}`);
    console.log(`  Sync history entries: ${report.summary.syncHistory}`);
    
    if (report.summary.lastSync) {
      console.log(`  Last sync: ${this.formatDate(report.summary.lastSync)}`);
    }

    return {
      reportGenerated: true,
      reportPath
    };
  }

  async showSyncStatus() {
    const components = this.documentationSynchronizer.syncedComponents;
    const docs = this.documentationSynchronizer.documentationIndex;

    console.log(chalk.blue('📚 Documentation Sync Status\n'));

    console.log(chalk.gray('Registered components:'));
    console.log(`  Components with docs: ${components.size}`);
    console.log(`  Documentation files: ${docs.size}`);
    
    // Show sync strategies
    console.log(chalk.gray('\nActive sync strategies:'));
    for (const [name, strategy] of this.documentationSynchronizer.syncStrategies) {
      console.log(`  - ${name}: ${strategy.description}`);
    }

    // Recent sync history
    const history = this.documentationSynchronizer.syncHistory.slice(-5);
    if (history.length > 0) {
      console.log(chalk.gray('\nRecent synchronizations:'));
      for (const entry of history) {
        console.log(`  ${this.formatDate(entry.timestamp)} - ${path.basename(entry.componentPath)}`);
      }
    }

    console.log(chalk.blue('\n📌 Commands:'));
    console.log('  Check status: *sync-documentation --check');
    console.log('  Sync all: *sync-documentation --all');
    console.log('  Enable auto-sync: *sync-documentation --auto-sync');
    console.log('  Generate report: *sync-documentation --report <file>');

    return {
      status: 'ready',
      components: components.size,
      documentation: docs.size
    };
  }

  formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    
    // Less than 1 hour
    if (diff < 3600000) {
      const minutes = Math.floor(diff / 60000);
      return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    }
    
    // Less than 24 hours
    if (diff < 86400000) {
      const hours = Math.floor(diff / 3600000);
      return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    }
    
    // Less than 7 days
    if (diff < 604800000) {
      const days = Math.floor(diff / 86400000);
      return `${days} day${days !== 1 ? 's' : ''} ago`;
    }
    
    // Otherwise show date
    return date.toLocaleDateString();
  }

  formatTime(date) {
    return date.toLocaleTimeString();
  }
}

module.exports = SyncDocumentationTask;
```

## Integration Points

### Documentation Synchronizer
- Core synchronization engine
- Multi-strategy sync support
- Automatic change detection
- Real-time monitoring

### Sync Strategies
- **JSDoc**: Sync code comments with markdown
- **Markdown**: Update documentation sections
- **Schema**: Sync YAML/JSON schemas
- **API**: Update API documentation
- **Examples**: Validate and update code examples

### Documentation Sources
- Markdown files (.md)
- YAML manifests (.yaml, .yml)
- JSON schemas (.json)
- README files
- Inline documentation

### Code Sources
- JavaScript files (.js, .jsx)
- TypeScript files (.ts, .tsx)
- Task definitions
- Agent manifests
- Workflow configurations

## Synchronization Workflow

### Detection Phase
1. Monitor file changes
2. Identify linked documentation
3. Detect content differences
4. Calculate sync requirements
5. Prioritize updates

### Analysis Phase
1. Parse code changes
2. Extract documentation elements
3. Compare with existing docs
4. Identify gaps and conflicts
5. Generate sync plan

### Update Phase
1. Apply sync strategies
2. Update documentation files
3. Preserve formatting
4. Validate changes
5. Record sync history

## Best Practices

### Documentation Structure
- Keep docs near code
- Use consistent naming
- Link explicitly in docs
- Maintain clear sections
- Update examples regularly

### Sync Configuration
- Choose appropriate strategies
- Set reasonable intervals
- Review changes regularly
- Monitor sync history
- Handle conflicts gracefully

### Quality Assurance
- Validate after sync
- Test code examples
- Check API accuracy
- Verify schema alignment
- Maintain version history

## Security Considerations
- Validate file paths
- Prevent injection in docs
- Protect sensitive information
- Audit sync operations
- Control write permissions 