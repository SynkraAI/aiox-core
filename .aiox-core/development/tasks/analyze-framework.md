# Task: Analyze Framework

## Description
Performs comprehensive analysis of the Synkra AIOX framework to identify improvement opportunities, performance bottlenecks, component redundancies, and usage patterns.

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
task: analyzeFramework()
responsável: Aria (Visionary)
responsavel_type: Agente
atomic_layer: Strategy

**Entrada:**
- campo: target
  tipo: string
  origem: User Input
  obrigatório: true
  validação: Valid path or identifier

- campo: options
  tipo: object
  origem: config
  obrigatório: false
  validação: Analysis configuration

- campo: depth
  tipo: number
  origem: User Input
  obrigatório: false
  validação: Default: 1 (0-3)

**Saída:**
- campo: analysis_report
  tipo: object
  destino: File (.ai/*.json)
  persistido: true

- campo: findings
  tipo: array
  destino: Memory
  persistido: false

- campo: metrics
  tipo: object
  destino: Memory
  persistido: false
```

---

## Pre-Conditions

**Purpose:** Validate prerequisites BEFORE task execution (blocking)

**Checklist:**

```yaml
pre-conditions:
  - [ ] Target exists and is accessible; analysis tools available
    tipo: pre-condition
    blocker: true
    validação: |
      Check target exists and is accessible; analysis tools available
    error_message: "Pre-condition failed: Target exists and is accessible; analysis tools available"
```

---

## Post-Conditions

**Purpose:** Validate execution success AFTER task completes

**Checklist:**

```yaml
post-conditions:
  - [ ] Analysis complete; report generated; no critical issues
    tipo: post-condition
    blocker: true
    validação: |
      Verify analysis complete; report generated; no critical issues
    error_message: "Post-condition failed: Analysis complete; report generated; no critical issues"
```

---

## Acceptance Criteria

**Purpose:** Definitive pass/fail criteria for task completion

**Checklist:**

```yaml
acceptance-criteria:
  - [ ] Analysis accurate; all targets covered; report complete
    tipo: acceptance-criterion
    blocker: true
    validação: |
      Assert analysis accurate; all targets covered; report complete
    error_message: "Acceptance criterion not met: Analysis accurate; all targets covered; report complete"
```

---

## Tools

**External/shared resources used by this task:**

- **Tool:** code-analyzer
  - **Purpose:** Static code analysis and metrics
  - **Source:** .aiox-core/utils/code-analyzer.js

- **Tool:** file-system
  - **Purpose:** Recursive directory traversal
  - **Source:** Node.js fs module

---

## Scripts

**Agent-specific code for this task:**

- **Script:** analyze-codebase.js
  - **Purpose:** Codebase analysis and reporting
  - **Language:** JavaScript
  - **Location:** .aiox-core/scripts/analyze-codebase.js

---

## Error Handling

**Strategy:** fallback

**Common Errors:**

1. **Error:** Target Not Accessible
   - **Cause:** Path does not exist or permissions denied
   - **Resolution:** Verify path and check permissions
   - **Recovery:** Skip inaccessible paths, continue with accessible ones

2. **Error:** Analysis Timeout
   - **Cause:** Analysis exceeds time limit for large codebases
   - **Resolution:** Reduce analysis depth or scope
   - **Recovery:** Return partial results with timeout warning

3. **Error:** Memory Limit Exceeded
   - **Cause:** Large codebase exceeds memory allocation
   - **Resolution:** Process in batches or increase memory limit
   - **Recovery:** Graceful degradation to summary analysis

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
  - analysis
  - metrics
updated_at: 2025-11-17
```

---


## Type
Analysis Task

## Complexity
High

## Categories
- framework-analysis
- performance-optimization
- code-quality

## Dependencies
- component-search.js (for component discovery)
- usage-analytics.js (for usage pattern analysis)
- performance-analyzer.js (for bottleneck detection)
- redundancy-analyzer.js (for overlap detection)
- improvement-engine.js (for suggestion generation)

## Parameters
- `scope` (string, optional): Analysis scope - 'full', 'agents', 'tasks', 'workflows', 'utils' (default: 'full')
- `output_format` (string, optional): Output format - 'detailed', 'summary', 'json' (default: 'detailed')
- `include_metrics` (boolean, optional): Include performance metrics (default: true)
- `include_suggestions` (boolean, optional): Include improvement suggestions (default: true)
- `save_report` (boolean, optional): Save report to file (default: true)

## Implementation

```javascript
const FrameworkAnalyzer = require('../scripts/framework-analyzer');
const UsageAnalytics = require('../scripts/usage-analytics');
const PerformanceAnalyzer = require('../scripts/performance-analyzer');
// const RedundancyAnalyzer = require('../scripts/redundancy-analyzer'); // Archived - Story 3.1.4
const ImprovementEngine = require('../scripts/improvement-engine');
const fs = require('fs').promises;
const path = require('path');
const chalk = require('chalk');

module.exports = {
  name: 'analyze-framework',
  description: 'Performs comprehensive framework analysis with improvement recommendations',
  
  async execute(params) {
    const {
      scope = 'full',
      output_format = 'detailed',
      include_metrics = true,
      include_suggestions = true,
      save_report = true
    } = params;

    console.log(chalk.blue('🔍 Starting framework analysis...'));
    console.log(chalk.gray(`   Scope: ${scope}`));
    console.log(chalk.gray(`   Format: ${output_format}`));

    const analysis = {
      timestamp: new Date().toISOString(),
      scope,
      framework_info: {},
      component_analysis: {},
      usage_analytics: {},
      performance_analysis: {},
      redundancy_analysis: {},
      improvement_suggestions: [],
      summary: {}
    };

    try {
      // Initialize analyzers
      const frameworkAnalyzer = new FrameworkAnalyzer({ rootPath: process.cwd() });
      const usageAnalytics = new UsageAnalytics({ rootPath: process.cwd() });
      const performanceAnalyzer = new PerformanceAnalyzer({ rootPath: process.cwd() });
      // const redundancyAnalyzer = new RedundancyAnalyzer({ rootPath: process.cwd() }); // Archived - Story 3.1.4
      const improvementEngine = new ImprovementEngine({ rootPath: process.cwd() });

      // Step 1: Discover and catalog framework components
      console.log(chalk.blue('📊 Discovering framework components...'));
      analysis.framework_info = await frameworkAnalyzer.analyzeFrameworkStructure(scope);
      
      console.log(chalk.gray(`   Found: ${analysis.framework_info.total_components} components`));
      console.log(chalk.gray(`   Agents: ${analysis.framework_info.agents?.length || 0}`));
      console.log(chalk.gray(`   Tasks: ${analysis.framework_info.tasks?.length || 0}`));
      console.log(chalk.gray(`   Workflows: ${analysis.framework_info.workflows?.length || 0}`));
      console.log(chalk.gray(`   Utils: ${analysis.framework_info.utils?.length || 0}`));

      // Step 2: Analyze component usage patterns
      console.log(chalk.blue('📈 Analyzing usage patterns...'));
      analysis.usage_analytics = await usageAnalytics.analyzeUsagePatterns(
        analysis.framework_info.components
      );

      // Step 3: Performance bottleneck detection
      if (include_metrics) {
        console.log(chalk.blue('⚡ Detecting performance bottlenecks...'));
        analysis.performance_analysis = await performanceAnalyzer.analyzePerformance(
          analysis.framework_info.components
        );
      }

      // Step 4: Redundancy and overlap analysis
      // console.log(chalk.blue('🔄 Analyzing redundancies and overlaps...'));
      // analysis.redundancy_analysis = await redundancyAnalyzer.analyzeRedundancy(
      //   analysis.framework_info.components
      // ); // Archived - Story 3.1.4

      // Step 5: Generate improvement suggestions
      if (include_suggestions) {
        console.log(chalk.blue('💡 Generating improvement suggestions...'));
        analysis.improvement_suggestions = await improvementEngine.generateSuggestions({
          components: analysis.framework_info.components,
          usage: analysis.usage_analytics,
          performance: analysis.performance_analysis
          // redundancy: analysis.redundancy_analysis // Archived - Story 3.1.4
        });
      }

      // Step 6: Generate summary
      analysis.summary = this.generateSummary(analysis);

      // Step 7: Format and display results
      await this.displayResults(analysis, output_format);

      // Step 8: Save report
      if (save_report) {
        const reportPath = await this.saveReport(analysis);
        console.log(chalk.green(`📋 Report saved: ${reportPath}`));
      }

      console.log(chalk.green('✅ Framework analysis completed'));
      
      return {
        success: true,
        analysis,
        suggestions_count: analysis.improvement_suggestions.length,
        critical_issues: analysis.summary.critical_issues || 0,
        performance_score: analysis.summary.performance_score || 'N/A'
      };

    } catch (error) {
      console.error(chalk.red(`Framework analysis failed: ${error.message}`));
      
      return {
        success: false,
        error: error.message,
        partial_analysis: analysis
      };
    }
  },

  /**
   * Generate analysis summary
   */
  generateSummary(analysis) {
    const summary = {
      total_components: analysis.framework_info.total_components || 0,
      health_score: 0,
      critical_issues: 0,
      warnings: 0,
      recommendations: 0,
      performance_score: 'N/A',
      redundancy_level: 'low',
      usage_efficiency: 0,
      top_concerns: [],
      strengths: []
    };

    // Calculate health score
    let healthPoints = 100;
    
    if (analysis.redundancy_analysis.redundant_components) {
      const redundancyPenalty = analysis.redundancy_analysis.redundant_components.length * 5;
      healthPoints -= redundancyPenalty;
      summary.critical_issues += analysis.redundancy_analysis.redundant_components.length;
    }

    if (analysis.performance_analysis.bottlenecks) {
      const performancePenalty = analysis.performance_analysis.bottlenecks.length * 10;
      healthPoints -= performancePenalty;
      summary.critical_issues += analysis.performance_analysis.bottlenecks.length;
    }

    if (analysis.usage_analytics.unused_components) {
      const unusedPenalty = analysis.usage_analytics.unused_components.length * 3;
      healthPoints -= unusedPenalty;
      summary.warnings += analysis.usage_analytics.unused_components.length;
    }

    summary.health_score = Math.max(0, Math.min(100, healthPoints));
    summary.recommendations = analysis.improvement_suggestions.length;

    // Performance score
    if (analysis.performance_analysis.overall_score) {
      summary.performance_score = analysis.performance_analysis.overall_score;
    }

    // Usage efficiency
    if (analysis.usage_analytics.efficiency_score) {
      summary.usage_efficiency = analysis.usage_analytics.efficiency_score;
    }

    // Redundancy level
    if (analysis.redundancy_analysis.redundancy_level) {
      summary.redundancy_level = analysis.redundancy_analysis.redundancy_level;
    }

    // Top concerns
    if (analysis.performance_analysis.bottlenecks?.length > 0) {
      summary.top_concerns.push('Performance bottlenecks detected');
    }
    
    if (analysis.redundancy_analysis.redundant_components?.length > 0) {
      summary.top_concerns.push('Code redundancy found');
    }
    
    if (analysis.usage_analytics.unused_components?.length > 0) {
      summary.top_concerns.push('Unused components detected');
    }

    // Strengths
    if (summary.health_score >= 90) {
      summary.strengths.push('Overall framework health excellent');
    }
    
    if (summary.performance_score >= 8) {
      summary.strengths.push('Good performance characteristics');
    }
    
    if (summary.usage_efficiency >= 85) {
      summary.strengths.push('High component utilization');
    }

    return summary;
  },

  /**
   * Display analysis results
   */
  async displayResults(analysis, format) {
    switch (format) {
      case 'summary':
        this.displaySummary(analysis);
        break;
      case 'json':
        console.log(JSON.stringify(analysis, null, 2));
        break;
      case 'detailed':
      default:
        this.displayDetailed(analysis);
        break;
    }
  },

  /**
   * Display summary format
   */
  displaySummary(analysis) {
    const { summary } = analysis;
    
    console.log(chalk.bold('\n📊 Framework Analysis Summary'));
    console.log(chalk.gray('─'.repeat(50)));
    
    // Health score with color coding
    const healthColor = summary.health_score >= 80 ? 'green' : 
                       summary.health_score >= 60 ? 'yellow' : 'red';
    console.log(`Health Score: ${chalk[healthColor](summary.health_score + '/100')}`);
    
    console.log(`Components: ${summary.total_components}`);
    console.log(`Critical Issues: ${chalk.red(summary.critical_issues)}`);
    console.log(`Warnings: ${chalk.yellow(summary.warnings)}`);
    console.log(`Recommendations: ${chalk.blue(summary.recommendations)}`);
    
    if (summary.performance_score !== 'N/A') {
      console.log(`Performance: ${chalk.cyan(summary.performance_score + '/10')}`);
    }
    
    console.log(`Usage Efficiency: ${chalk.cyan(summary.usage_efficiency + '%')}`);
    console.log(`Redundancy Level: ${chalk.magenta(summary.redundancy_level)}`);

    // Top concerns
    if (summary.top_concerns.length > 0) {
      console.log('\n🚨 Top Concerns:');
      summary.top_concerns.forEach(concern => {
        console.log(`  • ${chalk.red(concern)}`);
      });
    }

    // Strengths
    if (summary.strengths.length > 0) {
      console.log('\n✅ Strengths:');
      summary.strengths.forEach(strength => {
        console.log(`  • ${chalk.green(strength)}`);
      });
    }
  },

  /**
   * Display detailed format
   */
  displayDetailed(analysis) {
    this.displaySummary(analysis);
    
    // Component breakdown
    console.log(chalk.bold('\n📋 Component Analysis'));
    console.log(chalk.gray('─'.repeat(50)));
    
    if (analysis.framework_info.agents) {
      console.log(`Agents (${analysis.framework_info.agents.length}):`);
      analysis.framework_info.agents.slice(0, 5).forEach(agent => {
        console.log(`  • ${chalk.cyan(agent.name)} - ${agent.description || 'No description'}`);
      });
      if (analysis.framework_info.agents.length > 5) {
        console.log(`  ... and ${analysis.framework_info.agents.length - 5} more`);
      }
    }

    // Performance issues
    if (analysis.performance_analysis.bottlenecks?.length > 0) {
      console.log(chalk.bold('\n⚡ Performance Bottlenecks'));
      console.log(chalk.gray('─'.repeat(50)));
      
      analysis.performance_analysis.bottlenecks.slice(0, 3).forEach(bottleneck => {
        console.log(`  • ${chalk.red(bottleneck.component)}: ${bottleneck.issue}`);
        console.log(`    Impact: ${chalk.yellow(bottleneck.impact)} | Effort: ${bottleneck.effort}`);
      });
    }

    // Redundancy issues
    if (analysis.redundancy_analysis.redundant_components?.length > 0) {
      console.log(chalk.bold('\n🔄 Redundant Components'));
      console.log(chalk.gray('─'.repeat(50)));
      
      analysis.redundancy_analysis.redundant_components.slice(0, 3).forEach(redundancy => {
        console.log(`  • ${chalk.red(redundancy.component1)} ↔️ ${redundancy.component2}`);
        console.log(`    Similarity: ${chalk.yellow(redundancy.similarity + '%')} | Type: ${redundancy.type}`);
      });
    }

    // Top suggestions
    if (analysis.improvement_suggestions.length > 0) {
      console.log(chalk.bold('\n💡 Top Improvement Suggestions'));
      console.log(chalk.gray('─'.repeat(50)));
      
      analysis.improvement_suggestions
        .sort((a, b) => (b.priority_score || 0) - (a.priority_score || 0))
        .slice(0, 5)
        .forEach((suggestion, index) => {
          const priorityColor = suggestion.priority === 'high' ? 'red' : 
                               suggestion.priority === 'medium' ? 'yellow' : 'gray';
          console.log(`  ${index + 1}. ${chalk[priorityColor](suggestion.title)}`);
          console.log(`     ${suggestion.description}`);
          console.log(`     Impact: ${chalk.cyan(suggestion.impact)} | Effort: ${suggestion.effort}`);
        });
    }
  },

  /**
   * Save analysis report
   */
  async saveReport(analysis) {
    const reportsDir = path.join(process.cwd(), '.aiox', 'reports');
    await fs.mkdir(reportsDir, { recursive: true });
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportPath = path.join(reportsDir, `framework-analysis-${timestamp}.json`);
    
    await fs.writeFile(reportPath, JSON.stringify(analysis, null, 2));
    
    // Also save a human-readable summary
    const summaryPath = path.join(reportsDir, `framework-analysis-summary-${timestamp}.md`);
    const summaryContent = this.generateMarkdownSummary(analysis);
    await fs.writeFile(summaryPath, summaryContent);
    
    return reportPath;
  },

  /**
   * Generate markdown summary
   */
  generateMarkdownSummary(analysis) {
    const { summary } = analysis;
    
    return `# Framework Analysis Report

**Generated:** ${new Date(analysis.timestamp).toLocaleString()}
**Scope:** ${analysis.scope}

## Summary

- **Health Score:** ${summary.health_score}/100
- **Components:** ${summary.total_components}
- **Critical Issues:** ${summary.critical_issues}
- **Warnings:** ${summary.warnings}
- **Recommendations:** ${summary.recommendations}
- **Performance Score:** ${summary.performance_score}
- **Usage Efficiency:** ${summary.usage_efficiency}%
- **Redundancy Level:** ${summary.redundancy_level}

## Top Concerns

${summary.top_concerns.map(concern => `- ${concern}`).join('\n') || 'None identified'}

## Strengths

${summary.strengths.map(strength => `- ${strength}`).join('\n') || 'None identified'}

## Key Metrics

### Component Distribution
- Agents: ${analysis.framework_info.agents?.length || 0}
- Tasks: ${analysis.framework_info.tasks?.length || 0}
- Workflows: ${analysis.framework_info.workflows?.length || 0}
- Utils: ${analysis.framework_info.utils?.length || 0}

### Performance Analysis
${analysis.performance_analysis.bottlenecks?.length > 0 ? 
  `**Bottlenecks Found:** ${analysis.performance_analysis.bottlenecks.length}\n\n` +
  analysis.performance_analysis.bottlenecks.slice(0, 3).map(b => 
    `- **${b.component}:** ${b.issue} (Impact: ${b.impact})`
  ).join('\n') : 'No significant bottlenecks detected'}

### Redundancy Analysis
${analysis.redundancy_analysis.redundant_components?.length > 0 ?
  `**Redundant Components:** ${analysis.redundancy_analysis.redundant_components.length}\n\n` +
  analysis.redundancy_analysis.redundant_components.slice(0, 3).map(r =>
    `- **${r.component1}** ↔️ **${r.component2}** (${r.similarity}% similar)`
  ).join('\n') : 'No significant redundancy detected'}

## Top Improvement Suggestions

${analysis.improvement_suggestions.slice(0, 5).map((suggestion, index) => 
  `${index + 1}. **${suggestion.title}** (${suggestion.priority})
   - ${suggestion.description}
   - Impact: ${suggestion.impact} | Effort: ${suggestion.effort}`
).join('\n\n') || 'No suggestions generated'}

---
*Report generated by AIOX Framework Analyzer*
`;
  }
};
```

## Usage Examples

### Basic Analysis
```bash
*analyze-framework
```

### Scope-specific Analysis
```bash
*analyze-framework scope=agents
*analyze-framework scope=utils include_suggestions=false
```

### Summary Output
```bash
*analyze-framework output_format=summary
```

### Performance-focused Analysis
```bash
*analyze-framework include_metrics=true output_format=detailed
```

## Expected Output

The analysis provides:

1. **Framework Structure Overview**: Complete inventory of components
2. **Usage Analytics**: Pattern analysis and utilization metrics
3. **Performance Analysis**: Bottleneck identification and recommendations
4. **Redundancy Detection**: Overlapping functionality identification
5. **Improvement Suggestions**: Prioritized recommendations for enhancement
6. **Health Score**: Overall framework quality assessment
7. **Detailed Reports**: JSON and Markdown formats for future reference

## Security Considerations

- Read-only analysis - no modifications made to framework
- Safe file system scanning with permission checks
- Memory usage monitoring for large codebases
- Configurable analysis depth to prevent performance issues

## Integration

Works seamlessly with:
- `*improve-self` command for implementing suggestions
- Memory layer for storing analysis history
- Version control for tracking improvements
- Component modification tools for applying changes 