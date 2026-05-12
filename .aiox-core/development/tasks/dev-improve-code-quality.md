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
task: devImproveCodeQuality()
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

# No checklists needed - this task performs automated code refactoring, validation is through linting and testing
tools:
  - github-cli
---

# Improve Code Quality - AIOX Developer Task

## Purpose
Automatically improve code quality across multiple dimensions including formatting, linting, modern syntax, and best practices.

## Command Pattern
```
*improve-code-quality <path> [options]
```

## Parameters
- `path`: File or directory path to improve
- `options`: Code improvement configuration

### Options
- `--patterns <types>`: Comma-separated improvement patterns to apply
- `--auto-fix`: Automatically apply all safe improvements
- `--preview`: Show changes before applying
- `--exclude <patterns>`: Exclude file patterns (e.g., "*.test.js")
- `--recursive`: Process directories recursively
- `--config <file>`: Use custom configuration file
- `--report <file>`: Generate improvement report
- `--threshold <level>`: Minimum confidence for auto-fix (0-1, default: 0.8)
- `--backup`: Create backups before applying changes

## Improvement Patterns
- `formatting`: Code formatting with Prettier
- `linting`: ESLint fixes and rule compliance
- `modern-syntax`: ES6+ syntax upgrades
- `imports`: Import organization and optimization
- `dead-code`: Dead code elimination
- `naming`: Naming convention improvements
- `error-handling`: Error handling patterns
- `async-await`: Promise to async/await conversion
- `type-safety`: Type annotations and safety
- `documentation`: JSDoc generation and updates

## Examples
```bash
# Improve single file with preview
*improve-code-quality aiox-core/scripts/legacy-utility.js --preview

# Auto-fix all safe improvements in directory
*improve-code-quality aiox-core/agents --auto-fix --recursive

# Apply specific patterns
*improve-code-quality aiox-core/utils --patterns formatting,modern-syntax,async-await

# Generate improvement report
*improve-code-quality . --recursive --report quality-report.json

# Use custom configuration
*improve-code-quality aiox-core --config .aiox/quality-config.json
```

## Implementation

```javascript
const fs = require('fs').promises;
const path = require('path');
const chalk = require('chalk');
const inquirer = require('inquirer');
const glob = require('glob').promises;

class ImproveCodeQualityTask {
  constructor() {
    this.taskName = 'improve-code-quality';
    this.description = 'Automatically improve code quality';
    this.rootPath = process.cwd();
    this.codeQualityImprover = null;
    this.improvements = [];
    this.appliedImprovements = [];
  }

  async execute(params) {
    try {
      console.log(chalk.blue('🎨 AIOX Code Quality Improvement'));
      console.log(chalk.gray('Analyzing and improving code quality\n'));

      // Parse parameters
      const config = await this.parseParameters(params);
      
      // Initialize dependencies
      await this.initializeDependencies();

      // Get files to improve
      const files = await this.getFilesToImprove(config);
      
      if (files.length === 0) {
        console.log(chalk.yellow('No files found to improve'));
        return { success: true, improvements: [] };
      }

      console.log(chalk.gray(`Found ${files.length} files to analyze\n`));

      // Analyze files for improvements
      await this.analyzeFiles(files, config);

      // Execute based on mode
      if (config.autoFix) {
        await this.applyImprovements(config);
      } else if (config.preview) {
        await this.previewImprovements(config);
      } else {
        await this.interactiveImprovement(config);
      }

      // Generate report if requested
      if (config.report) {
        await this.generateReport(config.report);
      }

      return {
        success: true,
        filesAnalyzed: files.length,
        totalImprovements: this.improvements.length,
        appliedImprovements: this.appliedImprovements.length
      };

    } catch (error) {
      console.error(chalk.red(`\n❌ Code quality improvement failed: ${error.message}`));
      throw error;
    }
  }

  async parseParameters(params) {
    if (params.length < 1) {
      throw new Error('Usage: *improve-code-quality <path> [options]');
    }

    const config = {
      targetPath: params[0],
      patterns: ['formatting', 'linting', 'modern-syntax', 'imports', 'naming'],
      autoFix: false,
      preview: false,
      exclude: [],
      recursive: false,
      configFile: null,
      report: null,
      threshold: 0.8,
      backup: true
    };

    // Parse options
    for (let i = 1; i < params.length; i++) {
      const param = params[i];
      
      if (param === '--auto-fix') {
        config.autoFix = true;
      } else if (param === '--preview') {
        config.preview = true;
      } else if (param === '--recursive') {
        config.recursive = true;
      } else if (param === '--backup') {
        config.backup = true;
      } else if (param.startsWith('--patterns') && params[i + 1]) {
        config.patterns = params[++i].split(',').map(p => p.trim());
      } else if (param.startsWith('--exclude') && params[i + 1]) {
        config.exclude = params[++i].split(',').map(e => e.trim());
      } else if (param.startsWith('--config') && params[i + 1]) {
        config.configFile = params[++i];
      } else if (param.startsWith('--report') && params[i + 1]) {
        config.report = params[++i];
      } else if (param.startsWith('--threshold') && params[i + 1]) {
        config.threshold = parseFloat(params[++i]);
      }
    }

    // Load custom configuration if provided
    if (config.configFile) {
      await this.loadCustomConfig(config);
    }

    // Validate threshold
    if (config.threshold < 0 || config.threshold > 1) {
      throw new Error('Threshold must be between 0 and 1');
    }

    return config;
  }

  async loadCustomConfig(config) {
    try {
      const content = await fs.readFile(config.configFile, 'utf-8');
      const customConfig = JSON.parse(content);
      
      // Merge custom config
      Object.assign(config, {
        patterns: customConfig.patterns || config.patterns,
        threshold: customConfig.threshold || config.threshold,
        exclude: customConfig.exclude || config.exclude,
        // Add pattern-specific configurations
        patternConfig: customConfig.patternConfig || {}
      });
    } catch (error) {
      console.warn(chalk.yellow(`Failed to load custom config: ${error.message}`));
    }
  }

  async initializeDependencies() {
    try {
      const CodeQualityImprover = require('../scripts/code-quality-improver');
      this.codeQualityImprover = new CodeQualityImprover({ rootPath: this.rootPath });

    } catch (error) {
      throw new Error(`Failed to initialize dependencies: ${error.message}`);
    }
  }

  async getFilesToImprove(config) {
    const targetPath = path.resolve(this.rootPath, config.targetPath);
    const files = [];

    try {
      const stats = await fs.stat(targetPath);
      
      if (stats.isFile()) {
        // Single file
        if (this.shouldProcessFile(targetPath, config)) {
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
          if (this.shouldProcessFile(match, config)) {
            files.push(match);
          }
        }
      }
    } catch (error) {
      console.warn(chalk.yellow(`Cannot access ${targetPath}: ${error.message}`));
    }

    return files;
  }

  shouldProcessFile(filePath, config) {
    // Skip test files unless explicitly included
    if (!config.includeTests && (filePath.includes('.test.') || filePath.includes('.spec.'))) {
      return false;
    }
    
    // Skip build artifacts
    if (filePath.includes('/dist/') || filePath.includes('/build/')) {
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
    console.log(chalk.blue('🔍 Analyzing code quality...'));
    
    const progressInterval = Math.max(1, Math.floor(files.length / 20));
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      try {
        // Create backup if requested
        if (config.backup) {
          await this.createBackup(file);
        }

        // Analyze file for improvements
        const analysis = await this.codeQualityImprover.analyzeFile(file, {
          patterns: config.patterns,
          patternConfig: config.patternConfig
        });
        
        if (analysis.improvements && analysis.improvements.length > 0) {
          // Filter by confidence threshold
          const filteredImprovements = analysis.improvements.filter(
            imp => imp.confidence >= config.threshold
          );
          
          // Add to improvements list
          for (const improvement of filteredImprovements) {
            improvement.file = path.relative(this.rootPath, file);
            improvement.id = `imp-${this.improvements.length + 1}`;
            this.improvements.push(improvement);
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

  async createBackup(filePath) {
    const backupDir = path.join(this.rootPath, '.aiox', 'backups', 'code-quality');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const relativePath = path.relative(this.rootPath, filePath);
    const backupPath = path.join(backupDir, timestamp, relativePath);
    
    await fs.mkdir(path.dirname(backupPath), { recursive: true });
    await fs.copyFile(filePath, backupPath);
  }

  async applyImprovements(config) {
    console.log(chalk.blue('\n🔧 Applying improvements...'));
    
    if (this.improvements.length === 0) {
      console.log(chalk.yellow('No improvements to apply'));
      return;
    }

    // Group improvements by file
    const byFile = this.groupImprovementsByFile();
    
    let applied = 0;
    let failed = 0;
    
    for (const [file, improvements] of Object.entries(byFile)) {
      try {
        console.log(chalk.gray(`\nImproving ${file}...`));
        
        const result = await this.codeQualityImprover.applyImprovements(
          path.join(this.rootPath, file),
          improvements
        );
        
        if (result.success) {
          applied += result.appliedCount;
          this.appliedImprovements.push(...improvements.filter(
            imp => result.applied.includes(imp.id)
          ));
          
          // Show applied improvements
          for (const improvement of improvements) {
            if (result.applied.includes(improvement.id)) {
              console.log(chalk.green(`  ✅ ${improvement.description}`));
            }
          }
        } else {
          failed++;
          console.error(chalk.red(`  Failed: ${result.error}`));
        }
      } catch (error) {
        failed++;
        console.error(chalk.red(`  Error: ${error.message}`));
      }
    }
    
    // Show summary
    console.log(chalk.blue('\n📊 Improvement Summary:'));
    console.log(chalk.green(`  ✅ Applied: ${applied}`));
    if (failed > 0) {
      console.log(chalk.red(`  ❌ Failed: ${failed}`));
    }
  }

  async previewImprovements(config) {
    if (this.improvements.length === 0) {
      console.log(chalk.yellow('No improvements found'));
      return;
    }

    console.log(chalk.blue(`\n📋 Found ${this.improvements.length} improvements:\n`));

    // Group by file
    const byFile = this.groupImprovementsByFile();

    for (const [file, improvements] of Object.entries(byFile)) {
      console.log(chalk.blue(`\n📄 ${file}`));
      console.log(chalk.gray('─'.repeat(50)));
      
      for (const improvement of improvements) {
        this.displayImprovement(improvement);
      }
    }

    // Show pattern statistics
    this.displayStatistics();

    // Show next steps
    console.log(chalk.blue('\n📌 Next Steps:'));
    console.log(`1. Apply all improvements: *improve-code-quality ${config.targetPath} --auto-fix`);
    console.log(`2. Interactive selection: *improve-code-quality ${config.targetPath}`);
    console.log(`3. Generate report: *improve-code-quality ${config.targetPath} --report quality-report.json`);
  }

  async interactiveImprovement(config) {
    if (this.improvements.length === 0) {
      console.log(chalk.yellow('No improvements found'));
      return;
    }

    console.log(chalk.blue(`\n📋 Found ${this.improvements.length} improvements`));

    // Group by file for better UX
    const byFile = this.groupImprovementsByFile();

    for (const [file, improvements] of Object.entries(byFile)) {
      console.log(chalk.blue(`\n📄 ${file}`));
      
      const choices = improvements.map(imp => ({
        name: `${imp.pattern}: ${imp.description}`,
        value: imp.id,
        checked: imp.confidence >= 0.9 // Pre-check high confidence
      }));

      const { selected } = await inquirer.prompt([{
        type: 'checkbox',
        name: 'selected',
        message: 'Select improvements to apply:',
        choices,
        pageSize: 10
      }]);

      if (selected.length > 0) {
        const selectedImprovements = improvements.filter(
          imp => selected.includes(imp.id)
        );
        
        try {
          const result = await this.codeQualityImprover.applyImprovements(
            path.join(this.rootPath, file),
            selectedImprovements
          );
          
          if (result.success) {
            console.log(chalk.green(`✅ Applied ${result.appliedCount} improvements`));
            this.appliedImprovements.push(...selectedImprovements);
          } else {
            console.error(chalk.red(`Failed: ${result.error}`));
          }
        } catch (error) {
          console.error(chalk.red(`Error: ${error.message}`));
        }
      }
    }
  }

  groupImprovementsByFile() {
    const byFile = {};
    
    for (const improvement of this.improvements) {
      if (!byFile[improvement.file]) {
        byFile[improvement.file] = [];
      }
      byFile[improvement.file].push(improvement);
    }
    
    return byFile;
  }

  displayImprovement(improvement) {
    const confidenceColor = improvement.confidence >= 0.9 ? chalk.green :
                          improvement.confidence >= 0.7 ? chalk.yellow :
                          chalk.gray;
    
    console.log(`\n${chalk.gray(improvement.id)} ${chalk.blue(`[${improvement.pattern}]`)} ${improvement.description}`);
    console.log(`   ${chalk.gray('Confidence:')} ${confidenceColor((improvement.confidence * 100).toFixed(0) + '%')}`);
    console.log(`   ${chalk.gray('Location:')} Line ${improvement.location.start}${improvement.location.end !== improvement.location.start ? `-${improvement.location.end}` : ''}`);
    
    if (improvement.details) {
      console.log(`   ${chalk.gray('Details:')} ${improvement.details}`);
    }
    
    if (improvement.preview) {
      console.log(chalk.gray('   Preview:'));
      console.log(chalk.red(`     - ${improvement.preview.before}`));
      console.log(chalk.green(`     + ${improvement.preview.after}`));
    }
  }

  async generateReport(reportPath) {
    console.log(chalk.blue('\n📤 Generating quality report...'));
    
    const report = {
      version: 1,
      timestamp: new Date().toISOString(),
      summary: {
        filesAnalyzed: new Set(this.improvements.map(i => i.file)).size,
        totalImprovements: this.improvements.length,
        appliedImprovements: this.appliedImprovements.length,
        patterns: this.getPatternStatistics()
      },
      improvements: this.improvements.map(imp => ({
        ...imp,
        applied: this.appliedImprovements.some(a => a.id === imp.id)
      })),
      files: this.getFileStatistics()
    };

    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
    console.log(chalk.green(`✅ Report generated: ${reportPath}`));
  }

  getPatternStatistics() {
    const stats = {};
    
    for (const improvement of this.improvements) {
      if (!stats[improvement.pattern]) {
        stats[improvement.pattern] = {
          total: 0,
          applied: 0,
          averageConfidence: 0
        };
      }
      
      stats[improvement.pattern].total++;
      stats[improvement.pattern].averageConfidence += improvement.confidence;
      
      if (this.appliedImprovements.some(a => a.id === improvement.id)) {
        stats[improvement.pattern].applied++;
      }
    }
    
    // Calculate averages
    for (const pattern of Object.keys(stats)) {
      stats[pattern].averageConfidence /= stats[pattern].total;
    }
    
    return stats;
  }

  getFileStatistics() {
    const fileStats = {};
    
    for (const improvement of this.improvements) {
      if (!fileStats[improvement.file]) {
        fileStats[improvement.file] = {
          improvements: 0,
          applied: 0,
          patterns: new Set()
        };
      }
      
      fileStats[improvement.file].improvements++;
      fileStats[improvement.file].patterns.add(improvement.pattern);
      
      if (this.appliedImprovements.some(a => a.id === improvement.id)) {
        fileStats[improvement.file].applied++;
      }
    }
    
    // Convert sets to arrays
    for (const file of Object.keys(fileStats)) {
      fileStats[file].patterns = Array.from(fileStats[file].patterns);
    }
    
    return fileStats;
  }

  displayStatistics() {
    const patternStats = this.getPatternStatistics();
    
    console.log(chalk.blue('\n📊 Pattern Statistics:'));
    
    const sortedPatterns = Object.entries(patternStats)
      .sort(([,a], [,b]) => b.total - a.total);
    
    for (const [pattern, stats] of sortedPatterns) {
      console.log(`  ${pattern}: ${stats.total} improvements (${(stats.averageConfidence * 100).toFixed(0)}% avg confidence)`);
    }
  }
}

module.exports = ImproveCodeQualityTask;
```

## Integration Points

### Code Quality Improver
- Core improvement engine
- Pattern-based analysis
- Safe transformation application
- Multi-tool integration

### Tool Integration
- ESLint for linting fixes
- Prettier for formatting
- jscodeshift for AST transformations
- Custom patterns for specific improvements

### Configuration System
- Pattern-specific configurations
- Custom rule definitions
- Threshold management
- Tool preferences

### Backup System
- Automatic backup creation
- Timestamped storage
- Easy rollback capability
- Cleanup management

## Improvement Workflow

### Analysis Phase
1. Parse source code
2. Run pattern analyzers
3. Calculate confidence scores
4. Generate improvement suggestions
5. Filter by threshold

### Review Phase
1. Display improvements
2. Group by file/pattern
3. Show confidence levels
4. Provide previews
5. Allow selection

### Application Phase
1. Create backups
2. Apply transformations
3. Validate results
4. Update files
5. Track changes

## Best Practices

### Safe Improvements
- Always backup before changes
- Validate syntax after transformation
- Test code after improvements
- Use conservative thresholds
- Apply incrementally

### Pattern Selection
- Start with safe patterns (formatting)
- Progress to more complex transformations
- Respect project conventions
- Consider team preferences
- Monitor results

### Quality Tracking
- Generate regular reports
- Track improvement trends
- Measure code quality metrics
- Identify problem areas
- Celebrate progress

## Security Considerations
- Validate transformation safety
- Prevent code injection
- Maintain functionality
- Preserve sensitive patterns
- Audit all changes 