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
task: devSuggestRefactoring()
responsável: Dex (Builder)
responsavel_type: Agente
atomic_layer: Strategy

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
duration_expected: 5-20 min (estimated)
cost_estimated: $0.003-0.015
token_usage: ~2,000-8,000 tokens
```

**Optimization Notes:**
- Iterative analysis with depth limits; cache intermediate results; batch similar operations

---

## Metadata

```yaml
story: N/A
version: 1.0.0
dependencies:
  - N/A
tags:
  - development
  - code
updated_at: 2025-11-17
```

---

checklists:
  - dev-master-checklist.md
---

# Suggest Refactoring - AIOX Developer Task

## Purpose
Analyze code and suggest automated refactoring opportunities to improve code quality, maintainability, and performance.

## Command Pattern
```
*suggest-refactoring <path> [options]
```

## Parameters
- `path`: File or directory path to analyze
- `options`: Refactoring analysis configuration

### Options
- `--patterns <types>`: Comma-separated refactoring patterns to check
- `--threshold <level>`: Minimum impact threshold (1-10, default: 3)
- `--limit <count>`: Maximum suggestions per file (default: 10)
- `--apply <id>`: Apply specific suggestion by ID
- `--apply-all`: Apply all suggestions with confirmation
- `--export <file>`: Export suggestions to file
- `--recursive`: Analyze directories recursively
- `--exclude <patterns>`: Exclude file patterns (e.g., "*.test.js")
- `--dry-run`: Show what would be changed without applying

## Refactoring Patterns
- `extract_method`: Extract long methods into smaller ones
- `extract_variable`: Extract complex expressions
- `introduce_parameter_object`: Group related parameters
- `replace_conditional`: Replace conditionals with polymorphism
- `inline_temp`: Inline single-use variables
- `remove_dead_code`: Remove unreachable code
- `consolidate_duplicates`: Extract duplicate code
- `simplify_conditionals`: Flatten nested conditionals
- `replace_magic_numbers`: Extract constants
- `decompose_class`: Split large classes

## Examples
```bash
# Analyze single file
*suggest-refactoring aiox-core/scripts/complex-utility.js

# Analyze directory with specific patterns
*suggest-refactoring aiox-core/agents --patterns extract_method,decompose_class --recursive

# Apply high-impact suggestions
*suggest-refactoring aiox-core/utils --threshold 7 --apply-all

# Export suggestions for review
*suggest-refactoring . --recursive --export refactoring-report.json

# Dry run to see changes
*suggest-refactoring aiox-core/agents/developer.md --apply ref-001 --dry-run
```

## Implementation

```javascript
const fs = require('fs').promises;
const path = require('path');
const chalk = require('chalk');
const inquirer = require('inquirer');
const glob = require('glob').promises;

class SuggestRefactoringTask {
  constructor() {
    this.taskName = 'suggest-refactoring';
    this.description = 'Suggest automated refactoring opportunities';
    this.rootPath = process.cwd();
    this.refactoringSuggester = null;
    this.suggestions = [];
    this.appliedRefactorings = [];
  }

  async execute(params) {
    try {
      console.log(chalk.blue('🔧 AIOX Refactoring Analysis'));
      console.log(chalk.gray('Analyzing code for refactoring opportunities\n'));

      // Parse parameters
      const config = await this.parseParameters(params);
      
      // Initialize dependencies
      await this.initializeDependencies();

      // Get files to analyze
      const files = await this.getFilesToAnalyze(config);
      
      if (files.length === 0) {
        console.log(chalk.yellow('No files found to analyze'));
        return { success: true, suggestions: [] };
      }

      console.log(chalk.gray(`Found ${files.length} files to analyze\n`));

      // Execute based on mode
      if (config.apply) {
        // Apply specific suggestion
        await this.applySuggestion(config.apply, config);
      } else if (config.applyAll) {
        // Analyze and apply all suggestions
        await this.analyzeFiles(files, config);
        await this.applyAllSuggestions(config);
      } else {
        // Just analyze and show suggestions
        await this.analyzeFiles(files, config);
        await this.displaySuggestions(config);
      }

      // Export if requested
      if (config.export) {
        await this.exportSuggestions(config.export);
      }

      return {
        success: true,
        filesAnalyzed: files.length,
        totalSuggestions: this.suggestions.length,
        appliedRefactorings: this.appliedRefactorings.length
      };

    } catch (error) {
      console.error(chalk.red(`\n❌ Refactoring analysis failed: ${error.message}`));
      throw error;
    }
  }

  async parseParameters(params) {
    if (params.length < 1) {
      throw new Error('Usage: *suggest-refactoring <path> [options]');
    }

    const config = {
      targetPath: params[0],
      patterns: null,
      threshold: 3,
      limit: 10,
      apply: null,
      applyAll: false,
      export: null,
      recursive: false,
      exclude: [],
      dryRun: false
    };

    // Parse options
    for (let i = 1; i < params.length; i++) {
      const param = params[i];
      
      if (param === '--recursive') {
        config.recursive = true;
      } else if (param === '--apply-all') {
        config.applyAll = true;
      } else if (param === '--dry-run') {
        config.dryRun = true;
      } else if (param.startsWith('--patterns') && params[i + 1]) {
        config.patterns = params[++i].split(',').map(p => p.trim());
      } else if (param.startsWith('--threshold') && params[i + 1]) {
        config.threshold = parseInt(params[++i]);
      } else if (param.startsWith('--limit') && params[i + 1]) {
        config.limit = parseInt(params[++i]);
      } else if (param.startsWith('--apply') && params[i + 1]) {
        config.apply = params[++i];
      } else if (param.startsWith('--export') && params[i + 1]) {
        config.export = params[++i];
      } else if (param.startsWith('--exclude') && params[i + 1]) {
        config.exclude = params[++i].split(',').map(e => e.trim());
      }
    }

    // Validate threshold
    if (config.threshold < 1 || config.threshold > 10) {
      throw new Error('Threshold must be between 1 and 10');
    }

    return config;
  }

  async initializeDependencies() {
    try {
      const RefactoringSuggester = require('../scripts/refactoring-suggester');
      this.refactoringSuggester = new RefactoringSuggester({ rootPath: this.rootPath });

    } catch (error) {
      throw new Error(`Failed to initialize dependencies: ${error.message}`);
    }
  }

  async getFilesToAnalyze(config) {
    const targetPath = path.resolve(this.rootPath, config.targetPath);
    const files = [];

    try {
      const stats = await fs.stat(targetPath);
      
      if (stats.isFile()) {
        // Single file
        if (this.shouldAnalyzeFile(targetPath, config)) {
          files.push(targetPath);
        }
      } else if (stats.isDirectory()) {
        // Directory
        const pattern = config.recursive ? '**/*.{js,jsx,ts,tsx}' : '*.{js,jsx,ts,tsx}';
        const globPattern = path.join(targetPath, pattern);
        
        const matches = await glob(globPattern, {
          ignore: config.exclude.map(e => path.join(targetPath, '**', e)),
          nodir: true
        });
        
        for (const match of matches) {
          if (this.shouldAnalyzeFile(match, config)) {
            files.push(match);
          }
        }
      }
    } catch (error) {
      console.warn(chalk.yellow(`Cannot access ${targetPath}: ${error.message}`));
    }

    return files;
  }

  shouldAnalyzeFile(filePath, config) {
    // Skip test files unless explicitly included
    if (filePath.includes('.test.') || filePath.includes('.spec.')) {
      return false;
    }
    
    // Skip minified files
    if (filePath.includes('.min.')) {
      return false;
    }
    
    // Skip node_modules
    if (filePath.includes('node_modules')) {
      return false;
    }
    
    // Check file extension
    const ext = path.extname(filePath);
    return ['.js', '.jsx', '.ts', '.tsx'].includes(ext);
  }

  async analyzeFiles(files, config) {
    console.log(chalk.blue('🔍 Analyzing files...'));
    
    const progressInterval = Math.max(1, Math.floor(files.length / 20));
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      try {
        const result = await this.refactoringSuggester.analyzeCode(file, {
          patterns: config.patterns
        });
        
        if (result.suggestions && result.suggestions.length > 0) {
          // Filter by threshold and limit
          const filteredSuggestions = result.suggestions
            .filter(s => s.impact >= config.threshold)
            .slice(0, config.limit);
          
          // Add to global suggestions with unique IDs
          for (const suggestion of filteredSuggestions) {
            suggestion.id = `ref-${this.suggestions.length + 1}`;
            suggestion.file = path.relative(this.rootPath, file);
            this.suggestions.push(suggestion);
          }
        }
        
        // Show progress
        if (i % progressInterval === 0) {
          const progress = Math.floor((i / files.length) * 100);
          process.stdout.write(`\rProgress: ${progress}%`);
        }
        
      } catch (error) {
        console.warn(chalk.yellow(`\nFailed to analyze ${file}: ${error.message}`));
      }
    }
    
    console.log('\rProgress: 100%\n');
  }

  async displaySuggestions(config) {
    if (this.suggestions.length === 0) {
      console.log(chalk.yellow('No refactoring suggestions found above threshold'));
      return;
    }

    console.log(chalk.blue(`\n📋 Found ${this.suggestions.length} refactoring suggestions:\n`));

    // Group by file
    const byFile = {};
    for (const suggestion of this.suggestions) {
      if (!byFile[suggestion.file]) {
        byFile[suggestion.file] = [];
      }
      byFile[suggestion.file].push(suggestion);
    }

    // Display suggestions
    for (const [file, suggestions] of Object.entries(byFile)) {
      console.log(chalk.blue(`\n📄 ${file}`));
      console.log(chalk.gray('─'.repeat(50)));
      
      for (const suggestion of suggestions) {
        this.displaySuggestion(suggestion);
      }
    }

    // Show statistics
    this.displayStatistics();

    // Show next steps
    console.log(chalk.blue('\n📌 Next Steps:'));
    console.log('1. Review suggestions carefully');
    console.log(`2. Apply specific suggestion: *suggest-refactoring ${config.targetPath} --apply <id>`);
    console.log(`3. Apply all suggestions: *suggest-refactoring ${config.targetPath} --apply-all`);
    console.log(`4. Export for team review: *suggest-refactoring ${config.targetPath} --export report.json`);
  }

  displaySuggestion(suggestion) {
    const priorityColors = {
      high: chalk.red,
      medium: chalk.yellow,
      low: chalk.gray
    };
    
    const priorityColor = priorityColors[suggestion.priority] || chalk.gray;
    
    console.log(`\n${chalk.gray(suggestion.id)} ${priorityColor(`[${suggestion.priority.toUpperCase()}]`)} ${suggestion.description}`);
    console.log(`   ${chalk.gray('Location:')} Lines ${suggestion.location.start}-${suggestion.location.end}`);
    console.log(`   ${chalk.gray('Impact:')} ${this.formatImpact(suggestion.impact)}`);
    console.log(`   ${chalk.gray('Type:')} ${suggestion.pattern}`);
    console.log(`   ${chalk.gray('Details:')} ${suggestion.details}`);
    
    if (suggestion.suggestedRefactoring && suggestion.suggestedRefactoring.action) {
      console.log(`   ${chalk.gray('Action:')} ${suggestion.suggestedRefactoring.action}`);
    }
  }

  formatImpact(impact) {
    const bar = '█'.repeat(impact) + '░'.repeat(10 - impact);
    
    if (impact >= 8) {
      return chalk.red(bar) + ` (${impact}/10)`;
    } else if (impact >= 5) {
      return chalk.yellow(bar) + ` (${impact}/10)`;
    } else {
      return chalk.gray(bar) + ` (${impact}/10)`;
    }
  }

  async applySuggestion(suggestionId, config) {
    const suggestion = this.suggestions.find(s => s.id === suggestionId);
    
    if (!suggestion) {
      // Try to load from previous analysis
      const loaded = await this.loadSuggestion(suggestionId);
      if (!loaded) {
        throw new Error(`Suggestion not found: ${suggestionId}`);
      }
      suggestion = loaded;
    }

    console.log(chalk.blue('\n🔧 Applying Refactoring'));
    console.log(chalk.gray('─'.repeat(50)));
    this.displaySuggestion(suggestion);

    if (config.dryRun) {
      console.log(chalk.yellow('\n⚠️ DRY RUN - No changes will be made'));
      await this.showRefactoringPreview(suggestion);
      return;
    }

    // Confirm application
    const { confirm } = await inquirer.prompt([{
      type: 'confirm',
      name: 'confirm',
      message: 'Apply this refactoring?',
      default: true
    }]);

    if (!confirm) {
      console.log(chalk.gray('Refactoring cancelled'));
      return;
    }

    // Apply the refactoring
    try {
      const result = await this.refactoringSuggester.applySuggestion(suggestion);
      
      if (result.success) {
        console.log(chalk.green('✅ Refactoring applied successfully'));
        this.appliedRefactorings.push({
          suggestion,
          result,
          timestamp: new Date().toISOString()
        });
        
        // Show changes
        for (const change of result.changes) {
          console.log(chalk.gray(`   - ${change.description}`));
        }
      } else {
        console.error(chalk.red(`Failed to apply refactoring: ${result.error}`));
      }
    } catch (error) {
      console.error(chalk.red(`Error applying refactoring: ${error.message}`));
    }
  }

  async applyAllSuggestions(config) {
    if (this.suggestions.length === 0) {
      console.log(chalk.yellow('No suggestions to apply'));
      return;
    }

    console.log(chalk.blue(`\n🔧 Applying ${this.suggestions.length} refactorings`));
    
    // Group by type for better user experience
    const byType = {};
    for (const suggestion of this.suggestions) {
      if (!byType[suggestion.type]) {
        byType[suggestion.type] = [];
      }
      byType[suggestion.type].push(suggestion);
    }

    // Show summary
    console.log(chalk.gray('\nRefactorings by type:'));
    for (const [type, suggestions] of Object.entries(byType)) {
      console.log(`  ${type}: ${suggestions.length}`);
    }

    if (config.dryRun) {
      console.log(chalk.yellow('\n⚠️ DRY RUN - No changes will be made'));
      return;
    }

    // Confirm batch application
    const { confirmAll } = await inquirer.prompt([{
      type: 'confirm',
      name: 'confirmAll',
      message: `Apply all ${this.suggestions.length} refactorings?`,
      default: false
    }]);

    if (!confirmAll) {
      // Ask for individual confirmation
      await this.applySelectiveSuggestions(config);
      return;
    }

    // Apply all suggestions
    let applied = 0;
    let failed = 0;

    for (const suggestion of this.suggestions) {
      try {
        console.log(chalk.gray(`\nApplying ${suggestion.id}: ${suggestion.description}`));
        
        const result = await this.refactoringSuggester.applySuggestion(suggestion);
        
        if (result.success) {
          applied++;
          this.appliedRefactorings.push({
            suggestion,
            result,
            timestamp: new Date().toISOString()
          });
        } else {
          failed++;
          console.error(chalk.red(`  Failed: ${result.error}`));
        }
      } catch (error) {
        failed++;
        console.error(chalk.red(`  Error: ${error.message}`));
      }
    }

    console.log(chalk.blue('\n📊 Application Summary:'));
    console.log(chalk.green(`  ✅ Applied: ${applied}`));
    if (failed > 0) {
      console.log(chalk.red(`  ❌ Failed: ${failed}`));
    }
  }

  async applySelectiveSuggestions(config) {
    const choices = this.suggestions.map(s => ({
      name: `${s.id} - ${s.description} (${s.file})`,
      value: s.id,
      checked: s.impact >= 7 // Pre-check high impact
    }));

    const { selected } = await inquirer.prompt([{
      type: 'checkbox',
      name: 'selected',
      message: 'Select refactorings to apply:',
      choices,
      pageSize: 15
    }]);

    if (selected.length === 0) {
      console.log(chalk.gray('No refactorings selected'));
      return;
    }

    // Apply selected suggestions
    for (const id of selected) {
      const suggestion = this.suggestions.find(s => s.id === id);
      await this.applySuggestion(id, config);
    }
  }

  async showRefactoringPreview(suggestion) {
    console.log(chalk.blue('\n📝 Refactoring Preview:'));
    
    // This would show actual code changes
    // For now, show the refactoring plan
    if (suggestion.suggestedRefactoring) {
      console.log(chalk.gray(JSON.stringify(suggestion.suggestedRefactoring, null, 2)));
    }
  }

  async loadSuggestion(suggestionId) {
    // Try to load from cache or previous export
    const cacheFile = path.join(this.rootPath, '.aiox', 'refactoring', `${suggestionId}.json`);
    
    try {
      const content = await fs.readFile(cacheFile, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      return null;
    }
  }

  async exportSuggestions(exportPath) {
    console.log(chalk.blue('\n📤 Exporting suggestions...'));
    
    const exportData = {
      version: 1,
      exportDate: new Date().toISOString(),
      analysisPath: this.rootPath,
      totalSuggestions: this.suggestions.length,
      statistics: this.refactoringSuggester.getStatistics(),
      suggestions: this.suggestions.map(s => ({
        ...s,
        file: s.file || s.filePath
      }))
    };

    await fs.writeFile(exportPath, JSON.stringify(exportData, null, 2));
    console.log(chalk.green(`✅ Exported ${this.suggestions.length} suggestions to: ${exportPath}`));
  }

  displayStatistics() {
    const stats = this.refactoringSuggester.getStatistics();
    
    console.log(chalk.blue('\n📊 Refactoring Statistics:'));
    console.log(chalk.gray('─'.repeat(50)));
    
    console.log(`Total suggestions: ${stats.totalSuggestions}`);
    console.log(`Average impact: ${stats.averageImpact}/10`);
    
    console.log('\nBy priority:');
    for (const [priority, count] of Object.entries(stats.byPriority)) {
      console.log(`  ${priority}: ${count}`);
    }
    
    console.log('\nBy type:');
    const sortedTypes = Object.entries(stats.byType)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);
    
    for (const [type, count] of sortedTypes) {
      console.log(`  ${type}: ${count}`);
    }
  }
}

module.exports = SuggestRefactoringTask;
```

## Integration Points

### Refactoring Suggester
- Core analysis engine
- Pattern detection
- Suggestion generation
- Refactoring application

### AST Processing
- Code parsing
- Pattern matching
- Code transformation
- Generation

### Pattern Library
- Refactoring patterns
- Detection algorithms
- Application strategies
- Success metrics

### Code Metrics
- Complexity analysis
- Code quality metrics
- Impact calculation
- Priority assignment

## Refactoring Workflow

### Analysis Phase
1. Parse code into AST
2. Calculate code metrics
3. Run pattern detectors
4. Generate suggestions
5. Prioritize by impact
6. **Code Intelligence Blast Radius** (if available):
   - Call `assessRefactoringImpact(candidateFiles)` from `.aiox-core/core/code-intel/helpers/dev-helper`
   - If result is not null, enrich each suggestion with:
     - `blastRadius`: number of affected references
     - `riskLevel`: LOW (<5 refs) | MEDIUM (5-15) | HIGH (>15)
   - If code intelligence not available: suggestions work as before (no blast radius shown)

### Review Phase
1. Display suggestions
2. Group by file/type
3. Show impact analysis (including blast radius and risk level when available)
4. Provide preview
5. Export for review

### Application Phase
1. Confirm changes
2. Create backup
3. Apply transformation
4. Validate result
5. Update metrics

## Best Practices

### Safe Refactoring
- Always backup before changes
- Validate syntax after refactoring
- Run tests after changes
- Use dry-run for preview
- Apply incrementally

### Pattern Selection
- Start with high-impact patterns
- Focus on code hotspots
- Consider team preferences
- Respect coding standards
- Monitor effectiveness

### Continuous Improvement
- Track refactoring success
- Learn from applied patterns
- Update pattern library
- Share successful refactorings
- Measure code quality trends

## Security Considerations
- Validate refactoring safety
- Preserve functionality
- Maintain security patterns
- Audit changes
- Test thoroughly 