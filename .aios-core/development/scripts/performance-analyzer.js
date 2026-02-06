const fs = require('fs').promises;
const path = require('path');
const chalk = require('chalk');

/**
 * Performance bottleneck analyzer for AIOS-FULLSTACK framework
 * Identifies performance issues and optimization opportunities
 */
class PerformanceAnalyzer {
  constructor(options = {}) {
    this.rootPath = options.rootPath || process.cwd();
    this.thresholds = {
      fileSize: 50 * 1024, // 50KB
      functionLength: 50, // lines
      cyclomaticComplexity: 10,
      nestingDepth: 5,
      importCount: 20,
      unusedCode: 0.1 // 10% unused code ratio
    };
    this.performancePatterns = {
      // Sync operations that should be async
      syncOperations: [
        /fs\.readFileSync/g,
        /fs\.writeFileSync/g,
        /fs\.existsSync/g,
        /JSON\.parse\(\s*fs\.readFileSync/g
      ],
      // Memory-intensive patterns
      memoryIssues: [
        /\.map\(\s*.*\.map\(/g, // Nested maps
        /new Array\(\d{4,}\)/g, // Large arrays
        /JSON\.stringify.*JSON\.parse/g, // Unnecessary serialization
        /require\(\s*['"`][^'"`]+\.json['"`]\s*\)/g // Large JSON imports
      ],
      // Performance anti-patterns
      antiPatterns: [
        /console\.log/g, // Console logs in production
        /debugger/g, // Debugger statements
        /setTimeout\(\s*.*,\s*0\s*\)/g, // Unnecessary setTimeout
        /setInterval\(\s*.*,\s*[0-9]{1,2}\s*\)/g // High-frequency intervals
      ],
      // Inefficient loops
      inefficientLoops: [
        /for\s*\(\s*.*\.length\s*;/g, // Length calculated in loop condition
        /while\s*\(\s*true\s*\)/g, // Infinite loops
        /forEach.*forEach/g // Nested forEach
      ]
    };
  }

  /**
   * Analyze performance across all components
   */
  async analyzePerformance(components) {
    const analysis = {
      timestamp: new Date().toISOString(),
      overall_score: 0,
      bottlenecks: [],
      optimization_opportunities: [],
      memory_issues: [],
      async_opportunities: [],
      code_quality_issues: [],
      file_size_issues: [],
      complexity_issues: [],
      recommendations: [],
      metrics: {
        total_files_analyzed: 0,
        total_issues_found: 0,
        critical_issues: 0,
        high_priority_issues: 0,
        medium_priority_issues: 0,
        low_priority_issues: 0
      }
    };

    try {
      console.log(chalk.blue('🔍 Analyzing performance bottlenecks...'));

      // Analyze each component
      for (const component of components) {
        const componentAnalysis = await this.analyzeComponentPerformance(component);
        
        // Aggregate results
        analysis.bottlenecks.push(...componentAnalysis.bottlenecks);
        analysis.optimization_opportunities.push(...componentAnalysis.optimizations);
        analysis.memory_issues.push(...componentAnalysis.memory_issues);
        analysis.async_opportunities.push(...componentAnalysis.async_opportunities);
        analysis.code_quality_issues.push(...componentAnalysis.quality_issues);
        analysis.file_size_issues.push(...componentAnalysis.file_size_issues);
        analysis.complexity_issues.push(...componentAnalysis.complexity_issues);
        
        analysis.metrics.total_files_analyzed++;
      }

      // Calculate overall metrics
      analysis.overall_score = this.calculateOverallScore(analysis);
      analysis.metrics.total_issues_found = this.countTotalIssues(analysis);
      analysis.metrics = this.calculateIssuePriorities(analysis);
      analysis.recommendations = this.generatePerformanceRecommendations(analysis);

      console.log(chalk.green(`✅ Performance analysis completed`));
      console.log(chalk.gray(`   Files analyzed: ${analysis.metrics.total_files_analyzed}`));
      console.log(chalk.gray(`   Issues found: ${analysis.metrics.total_issues_found}`));
      console.log(chalk.gray(`   Overall score: ${analysis.overall_score}/10`));

      return analysis;

    } catch (error) {
      console.error(chalk.red(`Performance analysis failed: ${error.message}`));
      throw error;
    }
  }

  /**
   * Analyze performance for a single component
   */
  async analyzeComponentPerformance(component) {
    const analysis = {
      component_id: component.id,
      component_type: component.type,
      bottlenecks: [],
      optimizations: [],
      memory_issues: [],
      async_opportunities: [],
      quality_issues: [],
      file_size_issues: [],
      complexity_issues: []
    };

    try {
      // Only analyze JavaScript files and executable components
      if (!this.shouldAnalyzeComponent(component)) {
        return analysis;
      }

      const filePath = path.join(this.rootPath, component.file_path);
      const content = await fs.readFile(filePath, 'utf-8');
      const stats = await fs.stat(filePath);

      // File size analysis
      if (stats.size > this.thresholds.fileSize) {
        analysis.file_size_issues.push({
          component: component.id,
          issue: `Large file size: ${this.formatBytes(stats.size)}`,
          severity: stats.size > this.thresholds.fileSize * 2 ? 'high' : 'medium',
          recommendation: 'Consider breaking down into smaller modules',
          impact: 'high',
          effort: 'medium'
        });
      }

      // Synchronous operations analysis
      const syncIssues = this.findSyncOperations(content, component);
      analysis.async_opportunities.push(...syncIssues);

      // Memory usage analysis
      const memoryIssues = this.findMemoryIssues(content, component);
      analysis.memory_issues.push(...memoryIssues);

      // Performance anti-patterns
      const antiPatterns = this.findAntiPatterns(content, component);
      analysis.quality_issues.push(...antiPatterns);

      // Loop efficiency analysis
      const loopIssues = this.findLoopIssues(content, component);
      analysis.bottlenecks.push(...loopIssues);

      // Function complexity analysis
      const complexityIssues = this.analyzeComplexity(content, component);
      analysis.complexity_issues.push(...complexityIssues);

      // Import/require analysis
      const importIssues = this.analyzeImports(content, component);
      analysis.optimizations.push(...importIssues);

      // Dead code analysis
      const deadCodeIssues = await this.findDeadCode(content, component);
      analysis.optimizations.push(...deadCodeIssues);

    } catch (error) {
      console.warn(chalk.yellow(`Failed to analyze performance for ${component.id}: ${error.message}`));
    }

    return analysis;
  }

  /**
   * Find synchronous operations that should be async
   */
  findSyncOperations(content, component) {
    const issues = [];
    const lines = content.split('\n');

    this.performancePatterns.syncOperations.forEach(pattern => {
      lines.forEach((line, index) => {
        const matches = line.match(pattern);
        if (matches) {
          matches.forEach(match => {
            issues.push({
              component: component.id,
              issue: `Synchronous operation: ${match}`,
              line: index + 1,
              context: line.trim(),
              severity: 'high',
              recommendation: 'Convert to async equivalent',
              impact: 'high',
              effort: 'low'
            });
          });
        }
      });
    });

    return issues;
  }

  /**
   * Find memory-intensive patterns
   */
  findMemoryIssues(content, component) {
    const issues = [];
    const lines = content.split('\n');

    this.performancePatterns.memoryIssues.forEach(pattern => {
      lines.forEach((line, index) => {
        const matches = line.match(pattern);
        if (matches) {
          matches.forEach(match => {
            let severity = 'medium';
            let recommendation = 'Optimize memory usage';
            
            if (match.includes('new Array')) {
              severity = 'high';
              recommendation = 'Use array literals or streaming for large datasets';
            } else if (match.includes('JSON.stringify.*JSON.parse')) {
              recommendation = 'Use direct object assignment or deep clone utilities';
            } else if (match.includes('.map(.*map(')) {
              recommendation = 'Combine operations or use more efficient iteration';
            }

            issues.push({
              component: component.id,
              issue: `Memory-intensive pattern: ${match}`,
              line: index + 1,
              context: line.trim(),
              severity,
              recommendation,
              impact: 'medium',
              effort: 'medium'
            });
          });
        }
      });
    });

    return issues;
  }

  /**
   * Find performance anti-patterns
   */
  findAntiPatterns(content, component) {
    const issues = [];
    const lines = content.split('\n');

    this.performancePatterns.antiPatterns.forEach(pattern => {
      lines.forEach((line, index) => {
        const matches = line.match(pattern);
        if (matches) {
          matches.forEach(match => {
            let severity = 'low';
            let recommendation = 'Remove or optimize';
            
            if (match.includes('console.log')) {
              recommendation = 'Remove console.log statements from production code';
            } else if (match.includes('debugger')) {
              severity = 'medium';
              recommendation = 'Remove debugger statements';
            } else if (match.includes('setTimeout')) {
              recommendation = 'Use proper async/await or promises instead';
            }

            issues.push({
              component: component.id,
              issue: `Performance anti-pattern: ${match}`,
              line: index + 1,
              context: line.trim(),
              severity,
              recommendation,
              impact: 'low',
              effort: 'low'
            });
          });
        }
      });
    });

    return issues;
  }

  /**
   * Find inefficient loop patterns
   */
  findLoopIssues(content, component) {
    const issues = [];
    const lines = content.split('\n');

    this.performancePatterns.inefficientLoops.forEach(pattern => {
      lines.forEach((line, index) => {
        const matches = line.match(pattern);
        if (matches) {
          matches.forEach(match => {
            let severity = 'medium';
            let recommendation = 'Optimize loop structure';
            
            if (match.includes('.length')) {
              recommendation = 'Cache array length in variable before loop';
            } else if (match.includes('while(true)')) {
              severity = 'high';
              recommendation = 'Add proper exit condition to prevent infinite loops';
            } else if (match.includes('forEach.*forEach')) {
              recommendation = 'Consider using nested for loops or array methods like flatMap';
            }

            issues.push({
              component: component.id,
              issue: `Inefficient loop: ${match}`,
              line: index + 1,
              context: line.trim(),
              severity,
              recommendation,
              impact: 'medium',
              effort: 'low'
            });
          });
        }
      });
    });

    return issues;
  }

  /**
   * Analyze function complexity
   */
  analyzeComplexity(content, component) {
    const issues = [];
    const functions = this.extractFunctions(content);

    functions.forEach(func => {
      // Check function length
      if (func.lines > this.thresholds.functionLength) {
        issues.push({
          component: component.id,
          issue: `Long function: ${func.name} (${func.lines} lines)`,
          line: func.startLine,
          severity: func.lines > this.thresholds.functionLength * 2 ? 'high' : 'medium',
          recommendation: 'Break down into smaller functions',
          impact: 'medium',
          effort: 'medium'
        });
      }

      // Check cyclomatic complexity
      if (func.complexity > this.thresholds.cyclomaticComplexity) {
        issues.push({
          component: component.id,
          issue: `High complexity: ${func.name} (complexity: ${func.complexity})`,
          line: func.startLine,
          severity: func.complexity > this.thresholds.cyclomaticComplexity * 1.5 ? 'high' : 'medium',
          recommendation: 'Reduce conditional complexity',
          impact: 'high',
          effort: 'high'
        });
      }

      // Check nesting depth
      if (func.nestingDepth > this.thresholds.nestingDepth) {
        issues.push({
          component: component.id,
          issue: `Deep nesting: ${func.name} (depth: ${func.nestingDepth})`,
          line: func.startLine,
          severity: 'medium',
          recommendation: 'Reduce nesting depth using early returns or guard clauses',
          impact: 'medium',
          effort: 'medium'
        });
      }
    });

    return issues;
  }

  /**
   * Analyze imports and requires
   */
  analyzeImports(content, component) {
    const issues = [];
    const imports = this.extractImports(content);

    if (imports.length > this.thresholds.importCount) {
      issues.push({
        component: component.id,
        issue: `Too many imports: ${imports.length}`,
        severity: 'medium',
        recommendation: 'Consider breaking down module or using dynamic imports',
        impact: 'low',
        effort: 'medium'
      });
    }

    // Find unused imports (basic heuristic)
    const unusedImports = imports.filter(imp => {
      const usage = content.split(imp.name).length - 1;
      return usage <= 1; // Only appears in import statement
    });

    if (unusedImports.length > 0) {
      issues.push({
        component: component.id,
        issue: `Unused imports: ${unusedImports.map(i => i.name).join(', ')}`,
        severity: 'low',
        recommendation: 'Remove unused imports',
        impact: 'low',
        effort: 'low'
      });
    }

    return issues;
  }

  /**
   * Find dead code (unused functions, variables)
   */
  async findDeadCode(content, component) {
    const issues = [];
    
    // This is a simplified implementation
    // A full implementation would analyze the entire codebase for usage
    const functions = this.extractFunctions(content);
    const exports = this.extractExports(content);
    
    // Check for functions that are defined but never called within the file
    functions.forEach(func => {
      if (!func.name.startsWith('_') && !exports.includes(func.name)) {
        const usage = content.split(func.name).length - 1;
        if (usage <= 1) { // Only appears in definition
          issues.push({
            component: component.id,
            issue: `Potentially unused function: ${func.name}`,
            line: func.startLine,
            severity: 'low',
            recommendation: 'Remove if truly unused or export if needed elsewhere',
            impact: 'low',
            effort: 'low'
          });
        }
      }
    });

    return issues;
  }

  /**
   * Extract function information from code
   */
  extractFunctions(content) {
    const functions = [];
    const lines = content.split('\n');
    const functionRegex = /(?:function\s+(\w+)|(\w+)\s*[:=]\s*(?:async\s+)?function|(?:async\s+)?(\w+)\s*\([^)]*\)\s*(?:=>|{))/g;

    lines.forEach((line, index) => {
      const matches = [...line.matchAll(functionRegex)];
      matches.forEach(match => {
        const name = match[1] || match[2] || match[3] || 'anonymous';
        
        // Calculate function metrics (simplified)
        const funcInfo = {
          name,
          startLine: index + 1,
          lines: this.estimateFunctionLength(lines, index),
          complexity: this.estimateComplexity(lines, index),
          nestingDepth: this.estimateNestingDepth(lines, index)
        };

        functions.push(funcInfo);
      });
    });

    return functions;
  }

  /**
   * Extract import information
   */
  extractImports(content) {
    const imports = [];
    const importRegex = /(?:import\s+(?:(\w+)|\{([^}]+)\}|.*)\s+from\s+['"`]([^'"`]+)['"`]|const\s+(?:(\w+)|\{([^}]+)\})\s*=\s*require\(['"`]([^'"`]+)['"`]\))/g;

    const matches = [...content.matchAll(importRegex)];
    matches.forEach(match => {
      const defaultImport = match[1] || match[4];
      const namedImports = match[2] || match[5];
      const source = match[3] || match[6];

      if (defaultImport) {
        imports.push({ name: defaultImport, source, type: 'default' });
      }

      if (namedImports) {
        namedImports.split(',').forEach(name => {
          imports.push({ name: name.trim(), source, type: 'named' });
        });
      }
    });

    return imports;
  }

  /**
   * Extract export information
   */
  extractExports(content) {
    const exports = [];
    const exportRegex = /(?:export\s+(?:default\s+)?(?:function\s+(\w+)|class\s+(\w+)|(?:const|let|var)\s+(\w+))|module\.exports\s*=\s*(\w+))/g;

    const matches = [...content.matchAll(exportRegex)];
    matches.forEach(match => {
      const name = match[1] || match[2] || match[3] || match[4];
      if (name) exports.push(name);
    });

    return exports;
  }

  /**
   * Estimate function length (simplified)
   */
  estimateFunctionLength(lines, startIndex) {
    let braceCount = 0;
    let lineCount = 0;
    let inFunction = false;

    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i];
      lineCount++;

      // Count braces to find function end
      for (const char of line) {
        if (char === '{') {
          braceCount++;
          inFunction = true;
        } else if (char === '}') {
          braceCount--;
          if (inFunction && braceCount === 0) {
            return lineCount;
          }
        }
      }

      // Safety limit
      if (lineCount > 200) break;
    }

    return lineCount;
  }

  /**
   * Estimate cyclomatic complexity (simplified)
   */
  estimateComplexity(lines, startIndex) {
    let complexity = 1; // Base complexity
    const complexityKeywords = ['if', 'else', 'while', 'for', 'switch', 'case', 'catch', '&&', '||', '?'];
    
    const functionLines = lines.slice(startIndex, startIndex + this.estimateFunctionLength(lines, startIndex));
    
    functionLines.forEach(line => {
      complexityKeywords.forEach(keyword => {
        const matches = line.match(new RegExp(`\\b${keyword}\\b`, 'g'));
        if (matches) {
          complexity += matches.length;
        }
      });
    });

    return complexity;
  }

  /**
   * Estimate nesting depth (simplified)
   */
  estimateNestingDepth(lines, startIndex) {
    let maxDepth = 0;
    let currentDepth = 0;
    
    const functionLines = lines.slice(startIndex, startIndex + this.estimateFunctionLength(lines, startIndex));
    
    functionLines.forEach(line => {
      for (const char of line) {
        if (char === '{') {
          currentDepth++;
          maxDepth = Math.max(maxDepth, currentDepth);
        } else if (char === '}') {
          currentDepth--;
        }
      }
    });

    return maxDepth;
  }

  /**
   * Calculate overall performance score
   */
  calculateOverallScore(analysis) {
    let score = 10;
    const penalties = {
      critical: 2,
      high: 1,
      medium: 0.5,
      low: 0.1
    };

    // Apply penalties based on issue severity
    [...analysis.bottlenecks, ...analysis.memory_issues, ...analysis.async_opportunities,
     ...analysis.code_quality_issues, ...analysis.file_size_issues, ...analysis.complexity_issues]
      .forEach(issue => {
        score -= penalties[issue.severity] || 0.1;
      });

    return Math.max(0, Math.round(score * 10) / 10);
  }

  /**
   * Count total issues
   */
  countTotalIssues(analysis) {
    return analysis.bottlenecks.length +
           analysis.memory_issues.length +
           analysis.async_opportunities.length +
           analysis.code_quality_issues.length +
           analysis.file_size_issues.length +
           analysis.complexity_issues.length;
  }

  /**
   * Calculate issue priorities
   */
  calculateIssuePriorities(analysis) {
    const metrics = analysis.metrics;
    const allIssues = [
      ...analysis.bottlenecks,
      ...analysis.memory_issues,
      ...analysis.async_opportunities,
      ...analysis.code_quality_issues,
      ...analysis.file_size_issues,
      ...analysis.complexity_issues
    ];

    metrics.critical_issues = allIssues.filter(i => i.severity === 'critical').length;
    metrics.high_priority_issues = allIssues.filter(i => i.severity === 'high').length;
    metrics.medium_priority_issues = allIssues.filter(i => i.severity === 'medium').length;
    metrics.low_priority_issues = allIssues.filter(i => i.severity === 'low').length;

    return metrics;
  }

  /**
   * Generate performance recommendations
   */
  generatePerformanceRecommendations(analysis) {
    const recommendations = [];

    // Critical issues
    if (analysis.metrics.critical_issues > 0) {
      recommendations.push({
        priority: 'critical',
        category: 'immediate_action',
        message: `${analysis.metrics.critical_issues} critical performance issues require immediate attention`,
        action: 'Fix critical bottlenecks before deployment'
      });
    }

    // High severity issues
    if (analysis.metrics.high_priority_issues > 5) {
      recommendations.push({
        priority: 'high',
        category: 'performance',
        message: `${analysis.metrics.high_priority_issues} high-priority performance issues detected`,
        action: 'Address synchronous operations and complexity issues'
      });
    }

    // Memory issues
    if (analysis.memory_issues.length > 0) {
      recommendations.push({
        priority: 'medium',
        category: 'memory',
        message: `${analysis.memory_issues.length} memory optimization opportunities found`,
        action: 'Implement memory-efficient patterns and data structures'
      });
    }

    // File size issues
    if (analysis.file_size_issues.length > 0) {
      recommendations.push({
        priority: 'medium',
        category: 'modularity',
        message: `${analysis.file_size_issues.length} files are too large`,
        action: 'Break down large files into smaller, focused modules'
      });
    }

    // Overall score
    if (analysis.overall_score < 7) {
      recommendations.push({
        priority: 'high',
        category: 'general',
        message: `Overall performance score is ${analysis.overall_score}/10`,
        action: 'Comprehensive performance review and optimization needed'
      });
    }

    return recommendations;
  }

  /**
   * Check if component should be analyzed
   */
  shouldAnalyzeComponent(component) {
    const analyzableTypes = ['utility', 'task'];
    const analyzableExtensions = ['.js', '.mjs', '.ts'];
    
    if (!analyzableTypes.includes(component.type)) {
      return false;
    }

    if (component.file_path) {
      const ext = path.extname(component.file_path).toLowerCase();
      return analyzableExtensions.includes(ext);
    }

    return false;
  }

  /**
   * Format bytes for display
   */
  formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

module.exports = PerformanceAnalyzer;