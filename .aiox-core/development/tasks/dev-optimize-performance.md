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
task: devOptimizePerformance()
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

# Optimize Performance - AIOX Developer Task

## Purpose
Analyze code for performance bottlenecks and suggest optimizations to improve runtime performance, memory usage, and scalability.

## Command Pattern
```
*optimize-performance <path> [options]
```

## Parameters
- `path`: File or directory path to analyze
- `options`: Performance analysis configuration

### Options
- `--patterns <types>`: Comma-separated optimization patterns to check
- `--profile`: Enable runtime profiling (if applicable)
- `--threshold <level>`: Minimum impact threshold for suggestions (low/medium/high)
- `--report <file>`: Generate performance report
- `--apply <optimization-id>`: Apply specific optimization
- `--recursive`: Analyze directories recursively
- `--exclude <patterns>`: Exclude file patterns
- `--focus <category>`: Focus on specific category (algorithm/memory/async/database/bundle/react)

## Optimization Patterns
- `algorithm_complexity`: High time complexity algorithms
- `loop_optimization`: Nested loops and iterations
- `memory_usage`: Memory consumption and leaks
- `async_operations`: Async/await patterns
- `caching`: Memoization opportunities
- `database_queries`: N+1 and query optimization
- `bundle_size`: JavaScript bundle optimization
- `react_performance`: React-specific optimizations
- `string_operations`: String manipulation
- `object_operations`: Object creation and access

## Examples
```bash
# Analyze single file
*optimize-performance aiox-core/scripts/data-processor.js

# Analyze directory with specific patterns
*optimize-performance aiox-core/agents --patterns algorithm_complexity,async_operations --recursive

# Generate performance report
*optimize-performance . --recursive --report performance-report.json

# Focus on database optimizations
*optimize-performance aiox-core/services --focus database --recursive

# Apply specific optimization
*optimize-performance aiox-core/scripts/calculator.js --apply opt-001
```

## Implementation

```javascript
const fs = require('fs').promises;
const path = require('path');
const chalk = require('chalk');
const inquirer = require('inquirer');
const glob = require('glob').promises;

class OptimizePerformanceTask {
  constructor() {
    this.taskName = 'optimize-performance';
    this.description = 'Analyze and optimize code performance';
    this.rootPath = process.cwd();
    this.performanceOptimizer = null;
    this.analysisResults = [];
    this.appliedOptimizations = [];
  }

  async execute(params) {
    try {
      console.log(chalk.blue('⚡ AIOX Performance Optimization'));
      console.log(chalk.gray('Analyzing code for performance improvements\n'));

      // Parse parameters
      const config = await this.parseParameters(params);
      
      // Initialize dependencies
      await this.initializeDependencies();

      // Get files to analyze
      const files = await this.getFilesToAnalyze(config);
      
      if (files.length === 0) {
        console.log(chalk.yellow('No files found to analyze'));
        return { success: true, results: [] };
      }

      console.log(chalk.gray(`Found ${files.length} files to analyze\n`));

      // Execute based on mode
      if (config.apply) {
        // Apply specific optimization
        await this.applyOptimization(config.apply, config);
      } else {
        // Analyze files
        await this.analyzeFiles(files, config);
        
        // Display results
        await this.displayResults(config);
        
        // Generate report if requested
        if (config.report) {
          await this.generateReport(config.report);
        }
      }

      return {
        success: true,
        filesAnalyzed: files.length,
        totalIssues: this.getTotalIssues(),
        criticalIssues: this.getCriticalIssues()
      };

    } catch (error) {
      console.error(chalk.red(`\n❌ Performance optimization failed: ${error.message}`));
      throw error;
    }
  }

  async parseParameters(params) {
    if (params.length < 1) {
      throw new Error('Usage: *optimize-performance <path> [options]');
    }

    const config = {
      targetPath: params[0],
      patterns: null,
      profile: false,
      threshold: 'low',
      report: null,
      apply: null,
      recursive: false,
      exclude: [],
      focus: null
    };

    // Parse options
    for (let i = 1; i < params.length; i++) {
      const param = params[i];
      
      if (param === '--profile') {
        config.profile = true;
      } else if (param === '--recursive') {
        config.recursive = true;
      } else if (param.startsWith('--patterns') && params[i + 1]) {
        config.patterns = params[++i].split(',').map(p => p.trim());
      } else if (param.startsWith('--threshold') && params[i + 1]) {
        config.threshold = params[++i];
      } else if (param.startsWith('--report') && params[i + 1]) {
        config.report = params[++i];
      } else if (param.startsWith('--apply') && params[i + 1]) {
        config.apply = params[++i];
      } else if (param.startsWith('--exclude') && params[i + 1]) {
        config.exclude = params[++i].split(',').map(e => e.trim());
      } else if (param.startsWith('--focus') && params[i + 1]) {
        config.focus = params[++i];
      }
    }

    // Validate threshold
    if (!['low', 'medium', 'high'].includes(config.threshold)) {
      throw new Error('Threshold must be: low, medium, or high');
    }

    return config;
  }

  async initializeDependencies() {
    try {
      const PerformanceOptimizer = require('../scripts/performance-optimizer');
      this.performanceOptimizer = new PerformanceOptimizer({ 
        rootPath: this.rootPath,
        enableProfiling: true
      });

      // Listen to events
      this.performanceOptimizer.on('analyzed', (analysis) => {
        this.analysisResults.push(analysis);
      });

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
    // Skip test files unless analyzing tests
    if (filePath.includes('.test.') || filePath.includes('.spec.')) {
      return false;
    }
    
    // Skip minified files
    if (filePath.includes('.min.')) {
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
    
    return true;
  }

  async analyzeFiles(files, config) {
    console.log(chalk.blue('🔍 Analyzing performance...'));
    
    const progressInterval = Math.max(1, Math.floor(files.length / 20));
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      try {
        const analysis = await this.performanceOptimizer.analyzePerformance(file, {
          patterns: config.patterns,
          enableProfiling: config.profile
        });
        
        // Filter by threshold
        if (analysis.issues && analysis.issues.length > 0) {
          analysis.issues = this.filterByThreshold(analysis.issues, config.threshold);
        }
        
        // Filter by focus category
        if (config.focus && analysis.issues) {
          analysis.issues = analysis.issues.filter(issue => 
            issue.category === config.focus
          );
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

  filterByThreshold(issues, threshold) {
    const thresholdMap = {
      low: ['low', 'medium', 'high', 'critical'],
      medium: ['medium', 'high', 'critical'],
      high: ['high', 'critical']
    };
    
    const allowedImpacts = thresholdMap[threshold];
    
    return issues.filter(issue => 
      allowedImpacts.includes(issue.impact) || 
      allowedImpacts.includes(issue.severity)
    );
  }

  async displayResults(config) {
    const totalIssues = this.getTotalIssues();
    
    if (totalIssues === 0) {
      console.log(chalk.green('✅ No performance issues found!'));
      console.log(chalk.gray('Your code is already well optimized.'));
      return;
    }

    console.log(chalk.blue(`\n📊 Performance Analysis Results\n`));
    console.log(chalk.gray('Found ') + chalk.yellow(totalIssues) + chalk.gray(' optimization opportunities\n'));

    // Group by category
    const byCategory = this.groupByCategory();
    
    // Display by category
    for (const [category, results] of Object.entries(byCategory)) {
      console.log(chalk.blue(`\n${this.getCategoryIcon(category)} ${this.getCategoryName(category)}`));
      console.log(chalk.gray('─'.repeat(50)));
      
      for (const result of results) {
        this.displayFileResults(result);
      }
    }

    // Show performance scores
    this.displayPerformanceScores();

    // Show top recommendations
    this.displayTopRecommendations();

    // Show next steps
    console.log(chalk.blue('\n📌 Next Steps:'));
    console.log('1. Review critical issues first');
    console.log('2. Apply optimizations incrementally');
    console.log('3. Test after each optimization');
    console.log('4. Monitor performance improvements');
    if (config.report) {
      console.log(`5. View detailed report: ${config.report}`);
    }
  }

  displayFileResults(result) {
    const relativePath = path.relative(this.rootPath, result.filePath);
    
    console.log(`\n📄 ${chalk.blue(relativePath)}`);
    
    if (result.metrics?.performanceScore !== undefined) {
      const score = result.metrics.performanceScore;
      const scoreColor = score >= 80 ? chalk.green : score >= 60 ? chalk.yellow : chalk.red;
      console.log(`   Performance Score: ${scoreColor(score + '/100')}`);
    }
    
    // Display issues
    for (const issue of result.issues) {
      this.displayIssue(issue);
      
      // Display suggestions for this issue
      const suggestion = result.suggestions?.find(s => 
        s.issueId === issue.id || s.pattern === issue.pattern
      );
      
      if (suggestion) {
        this.displaySuggestion(suggestion);
      }
    }
  }

  displayIssue(issue) {
    const impactColors = {
      critical: chalk.red,
      high: chalk.red,
      medium: chalk.yellow,
      low: chalk.gray
    };
    
    const impactColor = impactColors[issue.impact || issue.severity] || chalk.gray;
    
    console.log(`\n   ${impactColor(`[${(issue.impact || issue.severity || 'info').toUpperCase()}]`)} ${issue.description}`);
    
    if (issue.location) {
      console.log(chalk.gray(`   Location: Line ${issue.location.start?.line || '?'}`));
    }
    
    if (issue.type) {
      console.log(chalk.gray(`   Type: ${issue.type}`));
    }
  }

  displaySuggestion(suggestion) {
    console.log(chalk.green('   💡 Suggestion:'));
    
    if (suggestion.optimizations) {
      for (const opt of suggestion.optimizations) {
        console.log(`      - ${opt.description}`);
        
        if (opt.code) {
          console.log(chalk.gray('        Example:'));
          const codeLines = opt.code.split('\n');
          for (const line of codeLines) {
            console.log(chalk.gray(`          ${line}`));
          }
        }
        
        if (opt.improvement) {
          console.log(chalk.green(`        → ${opt.improvement}`));
        }
      }
    }
    
    if (suggestion.estimatedImprovement) {
      console.log(chalk.green(`      Estimated improvement: ${suggestion.estimatedImprovement}`));
    }
  }

  groupByCategory() {
    const grouped = {};
    
    for (const result of this.analysisResults) {
      if (!result.issues || result.issues.length === 0) continue;
      
      for (const issue of result.issues) {
        const category = issue.category || 'other';
        
        if (!grouped[category]) {
          grouped[category] = [];
        }
        
        // Find or create file entry
        let fileEntry = grouped[category].find(r => r.filePath === result.filePath);
        if (!fileEntry) {
          fileEntry = {
            filePath: result.filePath,
            issues: [],
            suggestions: result.suggestions || [],
            metrics: result.metrics
          };
          grouped[category].push(fileEntry);
        }
        
        fileEntry.issues.push(issue);
      }
    }
    
    return grouped;
  }

  getCategoryIcon(category) {
    const icons = {
      algorithm: '🔄',
      memory: '💾',
      async: '⚡',
      database: '🗄️',
      bundle: '📦',
      react: '⚛️',
      caching: '💰',
      framework: '🏗️',
      other: '🔧'
    };
    
    return icons[category] || icons.other;
  }

  getCategoryName(category) {
    const names = {
      algorithm: 'Algorithm Optimization',
      memory: 'Memory Usage',
      async: 'Async Operations',
      database: 'Database Queries',
      bundle: 'Bundle Size',
      react: 'React Performance',
      caching: 'Caching Opportunities',
      framework: 'Framework-Specific',
      other: 'Other Optimizations'
    };
    
    return names[category] || category;
  }

  displayPerformanceScores() {
    console.log(chalk.blue('\n📈 Performance Summary'));
    console.log(chalk.gray('─'.repeat(50)));
    
    let totalScore = 0;
    let fileCount = 0;
    
    for (const result of this.analysisResults) {
      if (result.metrics?.performanceScore !== undefined) {
        totalScore += result.metrics.performanceScore;
        fileCount++;
      }
    }
    
    if (fileCount > 0) {
      const avgScore = Math.round(totalScore / fileCount);
      const scoreColor = avgScore >= 80 ? chalk.green : avgScore >= 60 ? chalk.yellow : chalk.red;
      
      console.log(`Average Performance Score: ${scoreColor(avgScore + '/100')}`);
      console.log(`Files Analyzed: ${fileCount}`);
    }
    
    // Issue breakdown
    const criticalCount = this.getCriticalIssues();
    const highCount = this.getIssuesByImpact('high');
    const mediumCount = this.getIssuesByImpact('medium');
    const lowCount = this.getIssuesByImpact('low');
    
    console.log('\nIssue Breakdown:');
    if (criticalCount > 0) console.log(chalk.red(`  Critical: ${criticalCount}`));
    if (highCount > 0) console.log(chalk.red(`  High: ${highCount}`));
    if (mediumCount > 0) console.log(chalk.yellow(`  Medium: ${mediumCount}`));
    if (lowCount > 0) console.log(chalk.gray(`  Low: ${lowCount}`));
  }

  displayTopRecommendations() {
    console.log(chalk.blue('\n🎯 Top Recommendations'));
    console.log(chalk.gray('─'.repeat(50)));
    
    const recommendations = this.getTopRecommendations();
    
    if (recommendations.length === 0) {
      console.log(chalk.gray('No specific recommendations'));
      return;
    }
    
    for (let i = 0; i < Math.min(5, recommendations.length); i++) {
      const rec = recommendations[i];
      console.log(`\n${i + 1}. ${rec.title}`);
      console.log(chalk.gray(`   ${rec.description}`));
      if (rec.files) {
        console.log(chalk.gray(`   Files affected: ${rec.files.length}`));
      }
    }
  }

  getTopRecommendations() {
    const recommendations = [];
    const byCategory = this.groupByCategory();
    
    // Algorithm complexity issues
    if (byCategory.algorithm?.length > 0) {
      const highComplexity = byCategory.algorithm.filter(r => 
        r.issues.some(i => i.type === 'high_complexity' && i.severity === 'critical')
      );
      
      if (highComplexity.length > 0) {
        recommendations.push({
          title: 'Optimize High-Complexity Algorithms',
          description: 'Several functions have O(n²) or worse complexity. Consider using more efficient algorithms.',
          priority: 'critical',
          files: highComplexity
        });
      }
    }
    
    // Async issues
    if (byCategory.async?.length > 0) {
      const sequentialAwaits = byCategory.async.filter(r => 
        r.issues.some(i => i.type === 'sequential_awaits')
      );
      
      if (sequentialAwaits.length > 0) {
        recommendations.push({
          title: 'Parallelize Async Operations',
          description: 'Use Promise.all to run independent async operations in parallel.',
          priority: 'high',
          files: sequentialAwaits
        });
      }
    }
    
    // Database issues
    if (byCategory.database?.length > 0) {
      const nPlusOne = byCategory.database.filter(r => 
        r.issues.some(i => i.type === 'n_plus_one')
      );
      
      if (nPlusOne.length > 0) {
        recommendations.push({
          title: 'Fix N+1 Query Problems',
          description: 'Database queries in loops cause performance degradation. Use JOINs or batch loading.',
          priority: 'critical',
          files: nPlusOne
        });
      }
    }
    
    // Memory issues
    if (byCategory.memory?.length > 0) {
      recommendations.push({
        title: 'Optimize Memory Usage',
        description: 'Review memory allocations and potential leaks. Consider using more efficient data structures.',
        priority: 'medium',
        files: byCategory.memory
      });
    }
    
    // Caching opportunities
    if (byCategory.caching?.length > 0) {
      recommendations.push({
        title: 'Implement Caching',
        description: 'Add memoization or caching for expensive repeated operations.',
        priority: 'medium',
        files: byCategory.caching
      });
    }
    
    // Sort by priority
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    recommendations.sort((a, b) => 
      priorityOrder[a.priority] - priorityOrder[b.priority]
    );
    
    return recommendations;
  }

  async applyOptimization(optimizationId, config) {
    console.log(chalk.blue(`\n🔧 Applying optimization: ${optimizationId}`));
    
    // Find the optimization in results
    let targetOptimization = null;
    let targetFile = null;
    
    for (const result of this.analysisResults) {
      const suggestion = result.suggestions?.find(s => 
        s.issueId === optimizationId || s.id === optimizationId
      );
      
      if (suggestion) {
        targetOptimization = suggestion;
        targetFile = result.filePath;
        break;
      }
    }
    
    if (!targetOptimization) {
      throw new Error(`Optimization not found: ${optimizationId}`);
    }
    
    console.log(chalk.gray(`File: ${path.relative(this.rootPath, targetFile)}`));
    console.log(chalk.gray(`Type: ${targetOptimization.type || 'General optimization'}`));
    
    // Show optimization details
    if (targetOptimization.optimizations) {
      console.log(chalk.blue('\nOptimizations to apply:'));
      for (const opt of targetOptimization.optimizations) {
        console.log(`  - ${opt.description}`);
      }
    }
    
    // Confirm application
    const { confirm } = await inquirer.prompt([{
      type: 'confirm',
      name: 'confirm',
      message: 'Apply this optimization?',
      default: true
    }]);
    
    if (!confirm) {
      console.log(chalk.gray('Optimization cancelled'));
      return;
    }
    
    // Apply the optimization
    try {
      const result = await this.performanceOptimizer.applyOptimization(
        targetFile,
        targetOptimization
      );
      
      if (result.success) {
        console.log(chalk.green('✅ Optimization applied successfully'));
        
        // Show changes
        for (const change of result.changes) {
          console.log(chalk.gray(`  - ${change.description}`));
        }
        
        this.appliedOptimizations.push({
          file: targetFile,
          optimization: targetOptimization,
          result,
          timestamp: new Date().toISOString()
        });
      } else {
        console.error(chalk.red(`Failed to apply optimization: ${result.error}`));
      }
    } catch (error) {
      console.error(chalk.red(`Error applying optimization: ${error.message}`));
    }
  }

  async generateReport(reportPath) {
    console.log(chalk.blue('\n📤 Generating performance report...'));
    
    const report = await this.performanceOptimizer.generateOptimizationReport();
    
    // Add analysis results
    report.analysisResults = this.analysisResults.map(r => ({
      file: path.relative(this.rootPath, r.filePath),
      performanceScore: r.metrics?.performanceScore,
      issues: r.issues.length,
      criticalIssues: r.issues.filter(i => 
        i.impact === 'critical' || i.severity === 'critical'
      ).length,
      suggestions: r.suggestions?.length || 0
    }));
    
    // Add applied optimizations
    report.appliedOptimizations = this.appliedOptimizations;
    
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
    console.log(chalk.green(`✅ Report generated: ${reportPath}`));
    
    // Show report summary
    console.log(chalk.blue('\n📊 Report Summary:'));
    console.log(`  Files analyzed: ${report.summary.filesAnalyzed}`);
    console.log(`  Total issues: ${report.summary.totalIssues}`);
    console.log(`  Critical issues: ${report.summary.criticalIssues}`);
    console.log(`  Optimizations applied: ${report.summary.optimizationsApplied}`);
  }

  getTotalIssues() {
    return this.analysisResults.reduce((total, result) => 
      total + (result.issues?.length || 0), 0
    );
  }

  getCriticalIssues() {
    return this.analysisResults.reduce((total, result) => 
      total + (result.issues?.filter(i => 
        i.impact === 'critical' || i.severity === 'critical'
      ).length || 0), 0
    );
  }

  getIssuesByImpact(impact) {
    return this.analysisResults.reduce((total, result) => 
      total + (result.issues?.filter(i => 
        i.impact === impact || i.severity === impact
      ).length || 0), 0
    );
  }
}

module.exports = OptimizePerformanceTask;
```

## Integration Points

### Performance Optimizer
- Core analysis engine
- Pattern detection system
- Optimization suggestion generator
- Runtime profiling capability

### Analysis Categories
- **Algorithm**: Time complexity, nested loops
- **Memory**: Allocations, leaks, data structures
- **Async**: Promise patterns, parallelization
- **Database**: Query optimization, N+1 problems
- **Bundle**: Import optimization, tree-shaking
- **React**: Component rendering, memoization
- **Caching**: Memoization opportunities

### Metrics Collection
- Static code analysis
- Complexity calculations
- Performance scoring
- Impact assessment

## Performance Analysis Workflow

### Detection Phase
1. Parse source code into AST
2. Run pattern detectors
3. Calculate complexity metrics
4. Identify bottlenecks
5. Score performance impact

### Analysis Phase
1. Evaluate issue severity
2. Group related issues
3. Generate optimization suggestions
4. Estimate improvements
5. Prioritize recommendations

### Optimization Phase
1. Review suggestions
2. Validate safety
3. Apply transformations
4. Test results
5. Measure improvements

## Best Practices

### Performance Analysis
- Start with critical issues
- Focus on hot paths
- Measure before and after
- Test optimizations thoroughly
- Consider trade-offs

### Optimization Strategy
- Profile first, optimize second
- Target biggest bottlenecks
- Preserve code readability
- Document optimizations
- Monitor regression

### Continuous Improvement
- Regular performance audits
- Automated performance tests
- Track metrics over time
- Share optimization patterns
- Build performance culture

## Security Considerations
- Validate optimization safety
- Preserve functionality
- Avoid premature optimization
- Test edge cases
- Monitor side effects 