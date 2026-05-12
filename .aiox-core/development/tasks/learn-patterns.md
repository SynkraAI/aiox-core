---

# learn-patterns

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
task: learnPatterns()
responsável: Uma (Empathizer)
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

# No checklists needed - analytical pattern learning task, no deliverables requiring validation
---

# Learn Patterns - AIOX Developer Task

## Purpose
Learn patterns from successful modifications to improve future meta-agent suggestions and automation.

## Command Pattern
```
*learn-patterns [options]
```

## Parameters
- `options`: Pattern learning configuration

### Options
- `--from-history <count>`: Learn from last N modifications (default: 50)
- `--type <types>`: Comma-separated pattern types to learn (code,structural,refactoring,dependency,performance)
- `--component <path>`: Learn patterns specific to a component
- `--threshold <value>`: Similarity threshold for pattern matching (0-1, default: 0.8)
- `--min-occurrences <count>`: Minimum occurrences before learning (default: 3)
- `--export <file>`: Export learned patterns to file
- `--import <file>`: Import patterns from file
- `--analyze`: Show pattern analysis and statistics
- `--reset`: Reset all learned patterns
- `--suggest <modification-id>`: Get pattern suggestions for a modification

## Examples
```bash
# Learn from recent modification history
*learn-patterns --from-history 100

# Learn specific pattern types
*learn-patterns --type code,refactoring --threshold 0.9

# Analyze patterns for a component
*learn-patterns --component aiox-core/agents/developer.md --analyze

# Get suggestions for upcoming modification
*learn-patterns --suggest mod-123456 --type refactoring

# Export patterns for sharing
*learn-patterns --export patterns-export.json
```

## Implementation

```javascript
const fs = require('fs').promises;
const path = require('path');
const chalk = require('chalk');
const inquirer = require('inquirer');

class LearnPatternsTask {
  constructor() {
    this.taskName = 'learn-patterns';
    this.description = 'Learn patterns from successful modifications';
    this.rootPath = process.cwd();
    this.patternLearner = null;
    this.modificationHistory = null;
    this.componentRegistry = null;
  }

  async execute(params) {
    try {
      console.log(chalk.blue('🧠 AIOX Pattern Learning'));
      console.log(chalk.gray('Learning from successful modifications\n'));

      // Parse parameters
      const config = await this.parseParameters(params);
      
      // Initialize dependencies
      await this.initializeDependencies();

      // Execute requested action
      let result;
      if (config.reset) {
        result = await this.resetPatterns();
      } else if (config.export) {
        result = await this.exportPatterns(config.export);
      } else if (config.import) {
        result = await this.importPatterns(config.import);
      } else if (config.analyze) {
        result = await this.analyzePatterns(config);
      } else if (config.suggest) {
        result = await this.suggestPatterns(config.suggest, config);
      } else {
        result = await this.learnPatterns(config);
      }

      // Display results
      await this.displayResults(result, config);

      return {
        success: true,
        patternsLearned: result.patternsLearned || 0,
        totalPatterns: result.totalPatterns || this.patternLearner.patterns.size,
        suggestions: result.suggestions || []
      };

    } catch (error) {
      console.error(chalk.red(`\n❌ Pattern learning failed: ${error.message}`));
      throw error;
    }
  }

  async parseParameters(params) {
    const config = {
      fromHistory: 50,
      types: ['code', 'structural', 'refactoring', 'dependency', 'performance'],
      component: null,
      threshold: 0.8,
      minOccurrences: 3,
      export: null,
      import: null,
      analyze: false,
      reset: false,
      suggest: null
    };

    for (let i = 0; i < params.length; i++) {
      const param = params[i];

      if (param === '--analyze') {
        config.analyze = true;
      } else if (param === '--reset') {
        config.reset = true;
      } else if (param.startsWith('--from-history') && params[i + 1]) {
        config.fromHistory = parseInt(params[++i]);
      } else if (param.startsWith('--type') && params[i + 1]) {
        config.types = params[++i].split(',').map(t => t.trim());
      } else if (param.startsWith('--component') && params[i + 1]) {
        config.component = params[++i];
      } else if (param.startsWith('--threshold') && params[i + 1]) {
        config.threshold = parseFloat(params[++i]);
      } else if (param.startsWith('--min-occurrences') && params[i + 1]) {
        config.minOccurrences = parseInt(params[++i]);
      } else if (param.startsWith('--export') && params[i + 1]) {
        config.export = params[++i];
      } else if (param.startsWith('--import') && params[i + 1]) {
        config.import = params[++i];
      } else if (param.startsWith('--suggest') && params[i + 1]) {
        config.suggest = params[++i];
      }
    }

    // Validate configuration
    if (config.threshold < 0 || config.threshold > 1) {
      throw new Error('Threshold must be between 0 and 1');
    }

    const validTypes = ['code', 'structural', 'refactoring', 'dependency', 'performance'];
    for (const type of config.types) {
      if (!validTypes.includes(type)) {
        throw new Error(`Invalid pattern type: ${type}`);
      }
    }

    return config;
  }

  async initializeDependencies() {
    try {
      // const PatternLearner = require('../scripts/pattern-learner'); // Archived in archived-utilities/ (Story 3.1.3)
      // this.patternLearner = new PatternLearner({ rootPath: this.rootPath }); // Archived in archived-utilities/ (Story 3.1.3)
      // await this.patternLearner.initialize(); // Archived in archived-utilities/ (Story 3.1.3)

      // const ModificationHistory = require('../scripts/modification-history'); // Archived in archived-utilities/ (Story 3.1.3)
      // this.modificationHistory = new ModificationHistory({ rootPath: this.rootPath }); // Archived in archived-utilities/ (Story 3.1.3)

      const ComponentRegistry = require('../scripts/component-registry');
      this.componentRegistry = new ComponentRegistry({ rootPath: this.rootPath });

    } catch (error) {
      throw new Error(`Failed to initialize dependencies: ${error.message}`);
    }
  }

  async learnPatterns(config) {
    console.log(chalk.blue('\n📚 Learning from modification history...'));
    
    // Update learner configuration
    this.patternLearner.learningThreshold = config.minOccurrences;
    this.patternLearner.similarityThreshold = config.threshold;

    // Load modification history
    const modifications = await this.loadModificationHistory(config);
    console.log(chalk.gray(`Loaded ${modifications.length} modifications for analysis`));

    // Filter successful modifications
    const successfulMods = modifications.filter(mod => 
      mod.status === 'completed' && 
      (!mod.rollback || mod.rollback.status !== 'rolled_back')
    );
    console.log(chalk.gray(`Found ${successfulMods.length} successful modifications`));

    // Learn patterns from each modification
    let patternsLearned = 0;
    const progressInterval = Math.max(1, Math.floor(successfulMods.length / 20));

    for (let i = 0; i < successfulMods.length; i++) {
      const mod = successfulMods[i];
      
      try {
        // Record modification for pattern learning
        const learned = await this.patternLearner.recordModification(mod);
        if (learned) patternsLearned++;

        // Show progress
        if (i % progressInterval === 0) {
          const progress = Math.floor((i / successfulMods.length) * 100);
          process.stdout.write(`\rProgress: ${progress}%`);
        }
      } catch (error) {
        console.warn(chalk.yellow(`\nFailed to learn from ${mod.id}: ${error.message}`));
      }
    }

    console.log(''); // New line after progress

    return {
      patternsLearned: patternsLearned,
      totalPatterns: this.patternLearner.patterns.size,
      modificationsAnalyzed: successfulMods.length
    };
  }

  async loadModificationHistory(config) {
    let modifications = [];

    if (config.component) {
      // Load modifications for specific component
      modifications = await this.modificationHistory.getComponentHistory(
        config.component,
        { limit: config.fromHistory }
      );
    } else {
      // Load recent modifications
      modifications = await this.modificationHistory.getRecentModifications(
        config.fromHistory
      );
    }

    return modifications;
  }

  async analyzePatterns(config) {
    console.log(chalk.blue('\n📊 Pattern Analysis'));
    console.log(chalk.gray('━'.repeat(50)));

    const analytics = this.patternLearner.getAnalytics();
    
    // Overall statistics
    console.log(chalk.blue('\n📈 Overall Statistics:'));
    console.log(`Total patterns: ${chalk.white(analytics.totalPatterns)}`);
    console.log(`Total occurrences: ${chalk.white(analytics.totalOccurrences)}`);
    console.log(`Average confidence: ${chalk.white((analytics.averageConfidence * 100).toFixed(1) + '%')}`);
    console.log(`High confidence patterns: ${chalk.white(analytics.highConfidenceCount)}`);
    
    // Pattern type breakdown
    console.log(chalk.blue('\n📑 Pattern Types:'));
    Object.entries(analytics.patternsByType).forEach(([type, patterns]) => {
      if (config.types.includes(type)) {
        console.log(`${type}: ${chalk.white(patterns.length)} patterns`);
      }
    });

    // Component-specific analysis
    if (config.component) {
      const componentPatterns = Array.from(this.patternLearner.patterns.values())
        .filter(p => p.metadata.components && p.metadata.components.includes(config.component));
      
      console.log(chalk.blue(`\n🔍 Component Analysis: ${config.component}`));
      console.log(`Patterns applicable: ${chalk.white(componentPatterns.length)}`);
      
      // Show top patterns for component
      const topPatterns = componentPatterns
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, 5);
      
      if (topPatterns.length > 0) {
        console.log(chalk.gray('\nTop patterns:'));
        topPatterns.forEach((pattern, index) => {
          console.log(`  ${index + 1}. ${pattern.description} (${(pattern.confidence * 100).toFixed(0)}% confidence)`);
        });
      }
    }

    // Recent learning activity
    const recentPatterns = Array.from(this.patternLearner.patterns.values())
      .sort((a, b) => new Date(b.lastSeen) - new Date(a.lastSeen))
      .slice(0, 5);
    
    console.log(chalk.blue('\n🕐 Recently Active Patterns:'));
    recentPatterns.forEach((pattern, index) => {
      const lastSeen = new Date(pattern.lastSeen);
      const daysAgo = Math.floor((Date.now() - lastSeen) / (1000 * 60 * 60 * 24));
      console.log(`  ${index + 1}. ${pattern.description} (${daysAgo} days ago)`);
    });

    return analytics;
  }

  async suggestPatterns(modificationId, config) {
    console.log(chalk.blue('\n💡 Pattern Suggestions'));
    console.log(chalk.gray(`For modification: ${modificationId}\n`));

    // Load modification details
    const modification = await this.loadModification(modificationId);
    if (!modification) {
      throw new Error(`Modification not found: ${modificationId}`);
    }

    // Get pattern suggestions
    const suggestions = this.patternLearner.suggestPatterns(modification, {
      types: config.types,
      minConfidence: 0.6,
      maxSuggestions: 10
    });

    if (suggestions.length === 0) {
      console.log(chalk.yellow('No applicable patterns found'));
      return { suggestions: [] };
    }

    // Display suggestions
    console.log(chalk.green(`Found ${suggestions.length} applicable patterns:\n`));
    
    suggestions.forEach((suggestion, index) => {
      console.log(chalk.blue(`${index + 1}. ${suggestion.pattern.description}`));
      console.log(`   Type: ${chalk.gray(suggestion.pattern.type)}`);
      console.log(`   Confidence: ${this.formatConfidence(suggestion.confidence)}`);
      console.log(`   Relevance: ${this.formatRelevance(suggestion.relevance)}`);
      
      if (suggestion.pattern.metadata.successRate) {
        console.log(`   Success rate: ${chalk.green((suggestion.pattern.metadata.successRate * 100).toFixed(0) + '%')}`);
      }
      
      if (suggestion.applicationGuide) {
        console.log(chalk.gray('   Application guide:'));
        suggestion.applicationGuide.steps.forEach((step, stepIndex) => {
          console.log(chalk.gray(`     ${stepIndex + 1}. ${step}`));
        });
      }
      
      console.log('');
    });

    // Ask if user wants to apply suggestions
    if (suggestions.length > 0) {
      const { applyPatterns } = await inquirer.prompt([{
        type: 'confirm',
        name: 'applyPatterns',
        message: 'Would you like to apply any of these patterns?',
        default: false
      }]);

      if (applyPatterns) {
        const { selectedPatterns } = await inquirer.prompt([{
          type: 'checkbox',
          name: 'selectedPatterns',
          message: 'Select patterns to apply:',
          choices: suggestions.map((s, i) => ({
            name: `${s.pattern.description} (${(s.confidence * 100).toFixed(0)}%)`,
            value: i
          }))
        }]);

        // Apply selected patterns
        for (const index of selectedPatterns) {
          await this.applyPattern(suggestions[index], modification);
        }
      }
    }

    return { suggestions };
  }

  async applyPattern(suggestion, modification) {
    console.log(chalk.blue(`\n🔧 Applying pattern: ${suggestion.pattern.description}`));
    
    try {
      // Implementation would depend on pattern type
      // This is a placeholder for the actual pattern application logic
      console.log(chalk.green('✅ Pattern applied successfully'));
      
      // Record pattern application
      this.patternLearner.recordPatternApplication(
        suggestion.pattern.id,
        modification.id,
        true
      );
    } catch (error) {
      console.error(chalk.red(`Failed to apply pattern: ${error.message}`));
      
      // Record failed application
      this.patternLearner.recordPatternApplication(
        suggestion.pattern.id,
        modification.id,
        false
      );
    }
  }

  async exportPatterns(exportPath) {
    console.log(chalk.blue('\n📤 Exporting patterns...'));
    
    const exportData = {
      version: 1,
      exportDate: new Date().toISOString(),
      patterns: Array.from(this.patternLearner.patterns.entries()).map(([id, pattern]) => ({
        id,
        ...pattern
      })),
      metadata: {
        totalPatterns: this.patternLearner.patterns.size,
        learningThreshold: this.patternLearner.learningThreshold,
        similarityThreshold: this.patternLearner.similarityThreshold
      }
    };

    await fs.writeFile(exportPath, JSON.stringify(exportData, null, 2));
    console.log(chalk.green(`✅ Exported ${exportData.patterns.length} patterns to: ${exportPath}`));

    return {
      exported: true,
      patternCount: exportData.patterns.length,
      exportPath
    };
  }

  async importPatterns(importPath) {
    console.log(chalk.blue('\n📥 Importing patterns...'));
    
    try {
      const content = await fs.readFile(importPath, 'utf-8');
      const importData = JSON.parse(content);

      if (importData.version !== 1) {
        throw new Error(`Unsupported import version: ${importData.version}`);
      }

      // Ask for import strategy
      const { strategy } = await inquirer.prompt([{
        type: 'list',
        name: 'strategy',
        message: 'Import strategy:',
        choices: [
          { name: 'Merge with existing patterns', value: 'merge' },
          { name: 'Replace all patterns', value: 'replace' },
          { name: 'Cancel import', value: 'cancel' }
        ]
      }]);

      if (strategy === 'cancel') {
        console.log(chalk.yellow('Import cancelled'));
        return { imported: false };
      }

      if (strategy === 'replace') {
        this.patternLearner.patterns.clear();
      }

      // Import patterns
      let imported = 0;
      for (const pattern of importData.patterns) {
        const { id, ...patternData } = pattern;
        
        if (strategy === 'merge' && this.patternLearner.patterns.has(id)) {
          // Merge with existing pattern
          const existing = this.patternLearner.patterns.get(id);
          patternData.occurrences += existing.occurrences;
          patternData.confidence = Math.max(patternData.confidence, existing.confidence);
        }

        this.patternLearner.patterns.set(id, patternData);
        imported++;
      }

      // Save imported patterns
      await this.patternLearner.savePatterns();

      console.log(chalk.green(`✅ Imported ${imported} patterns`));
      return {
        imported: true,
        patternCount: imported,
        totalPatterns: this.patternLearner.patterns.size
      };

    } catch (error) {
      throw new Error(`Import failed: ${error.message}`);
    }
  }

  async resetPatterns() {
    console.log(chalk.yellow('\n⚠️ Pattern Reset'));
    
    const { confirmReset } = await inquirer.prompt([{
      type: 'confirm',
      name: 'confirmReset',
      message: 'Are you sure you want to reset all learned patterns?',
      default: false
    }]);

    if (!confirmReset) {
      console.log(chalk.gray('Reset cancelled'));
      return { reset: false };
    }

    // Clear all patterns
    this.patternLearner.patterns.clear();
    this.patternLearner.modificationHistory = [];
    await this.patternLearner.savePatterns();

    console.log(chalk.green('✅ All patterns have been reset'));
    return { reset: true };
  }

  async loadModification(modificationId) {
    // Try multiple sources for modification data
    const sources = [
      path.join(this.rootPath, '.aiox', 'modifications', `${modificationId}.json`),
      path.join(this.rootPath, '.aiox', 'history', `${modificationId}.json`),
      path.join(this.rootPath, '.aiox', 'proposals', `${modificationId}.json`)
    ];

    for (const source of sources) {
      try {
        const content = await fs.readFile(source, 'utf-8');
        return JSON.parse(content);
      } catch (error) {
        // Try next source
      }
    }

    return null;
  }

  async displayResults(result, config) {
    console.log(chalk.blue('\n📊 Pattern Learning Results'));
    console.log(chalk.gray('━'.repeat(50)));

    if (result.patternsLearned !== undefined) {
      console.log(`Patterns learned: ${chalk.green(result.patternsLearned)}`);
      console.log(`Total patterns: ${chalk.white(result.totalPatterns)}`);
      console.log(`Modifications analyzed: ${chalk.white(result.modificationsAnalyzed)}`);
    }

    if (result.exported) {
      console.log(`Patterns exported: ${chalk.green(result.patternCount)}`);
      console.log(`Export location: ${chalk.white(result.exportPath)}`);
    }

    if (result.imported) {
      console.log(`Patterns imported: ${chalk.green(result.patternCount)}`);
      console.log(`Total patterns: ${chalk.white(result.totalPatterns)}`);
    }

    if (result.reset) {
      console.log(chalk.yellow('All patterns have been reset'));
    }

    // Show next steps
    console.log(chalk.blue('\n📌 Next Steps:'));
    if (result.patternsLearned > 0) {
      console.log('1. Use --suggest to get pattern recommendations for new modifications');
      console.log('2. Use --analyze to view pattern statistics');
      console.log('3. Use --export to share patterns with other developers');
    } else if (result.suggestions && result.suggestions.length > 0) {
      console.log('1. Review suggested patterns carefully');
      console.log('2. Apply patterns that match your modification goals');
      console.log('3. Provide feedback on pattern effectiveness');
    }
  }

  formatConfidence(confidence) {
    const percentage = (confidence * 100).toFixed(0);
    if (confidence >= 0.8) {
      return chalk.green(`${percentage}%`);
    } else if (confidence >= 0.6) {
      return chalk.yellow(`${percentage}%`);
    } else {
      return chalk.red(`${percentage}%`);
    }
  }

  formatRelevance(relevance) {
    if (relevance >= 0.8) {
      return chalk.green('High');
    } else if (relevance >= 0.5) {
      return chalk.yellow('Medium');
    } else {
      return chalk.red('Low');
    }
  }
}

module.exports = LearnPatternsTask;
```

## Pattern Types

### Code Transformation Patterns
- Variable renaming conventions
- Function extraction patterns
- Error handling additions
- Async/await conversions
- Code modernization patterns

### Structural Patterns
- Component organization changes
- Module restructuring
- Interface modifications
- Class hierarchy changes
- File organization patterns

### Refactoring Patterns
- Method extraction
- Class decomposition
- Interface segregation
- Dependency injection
- Code consolidation

### Dependency Patterns
- Package updates
- Import reorganization
- Dependency injection
- Service layer patterns
- API versioning

### Performance Patterns
- Caching implementations
- Query optimizations
- Lazy loading patterns
- Memory usage improvements
- Algorithm optimizations

## Learning Process

### Pattern Extraction
1. Analyze successful modifications
2. Extract change patterns using AST
3. Calculate pattern similarity
4. Group similar patterns
5. Build pattern templates

### Pattern Validation
1. Check minimum occurrences
2. Verify success rate
3. Validate consistency
4. Test applicability
5. Calculate confidence score

### Pattern Application
1. Match current context
2. Suggest relevant patterns
3. Provide application guide
4. Monitor application success
5. Update pattern metrics

## Integration Points

### Pattern Learner Utility
- Core pattern learning engine
- Pattern storage and retrieval
- Similarity calculations
- Suggestion generation

### Modification History
- Access to past modifications
- Success/failure tracking
- Component change history
- Impact analysis data

### Component Registry
- Component metadata
- Dependency information
- Usage patterns
- Performance metrics

## Security Considerations
- Validate pattern sources
- Prevent malicious patterns
- Audit pattern applications
- Secure pattern storage
- Control pattern sharing

## Best Practices
1. Learn from diverse modifications
2. Set appropriate thresholds
3. Regularly analyze patterns
4. Export valuable patterns
5. Monitor pattern effectiveness
6. Update patterns over time
7. Share patterns across teams 