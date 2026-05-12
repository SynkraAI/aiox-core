const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const { parse } = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const SecurityChecker = require('./security-checker');

/**
 * Analyzes meta-agent capabilities and identifies improvement opportunities
 */
class CapabilityAnalyzer {
  constructor(options = {}) {
    this.rootPath = options.rootPath || process.cwd();
    this.coreDir = path.join(this.rootPath, 'aiox-core');
    this.security = new SecurityChecker();
    
    // Capability categories
    this.categories = {
      error_handling: {
        weight: 0.2,
        metrics: ['try_catch_coverage', 'error_context', 'retry_logic', 'graceful_degradation'],
      },
      performance: {
        weight: 0.15,
        metrics: ['async_operations', 'caching', 'algorithm_efficiency', 'resource_usage'],
      },
      modularity: {
        weight: 0.15,
        metrics: ['function_size', 'coupling', 'cohesion', 'reusability'],
      },
      testing: {
        weight: 0.2,
        metrics: ['test_coverage', 'test_quality', 'edge_cases', 'mocking_strategy'],
      },
      documentation: {
        weight: 0.1,
        metrics: ['jsdoc_coverage', 'inline_comments', 'readme_quality', 'examples'],
      },
      security: {
        weight: 0.1,
        metrics: ['input_validation', 'sanitization', 'auth_checks', 'audit_trail'],
      },
      user_experience: {
        weight: 0.1,
        metrics: ['feedback_quality', 'error_messages', 'progress_tracking', 'help_text'],
      },
    };
  }

  /**
   * Analyze current capabilities
   * @param {Object} options - Analysis options
   * @returns {Promise<Object>} Capability analysis
   */
  async analyzeCapabilities(options = {}) {
    const { target_areas = Object.keys(this.categories), currentImplementation } = options;
    
    console.log(chalk.blue('🔍 Analyzing current capabilities...'));
    
    const analysis = {
      timestamp: new Date().toISOString(),
      overall_score: 0,
      categories: {},
      improvement_opportunities: [],
      strengths: [],
      weaknesses: [],
    };

    // Analyze each category
    for (const category of target_areas) {
      if (!this.categories[category]) continue;
      
      const categoryAnalysis = await this.analyzeCategory(category, currentImplementation);
      analysis.categories[category] = categoryAnalysis;
      
      // Identify strengths and weaknesses
      if (categoryAnalysis.score >= 8) {
        analysis.strengths.push({
          category,
          score: categoryAnalysis.score,
          highlights: categoryAnalysis.highlights,
        });
      } else if (categoryAnalysis.score < 6) {
        analysis.weaknesses.push({
          category,
          score: categoryAnalysis.score,
          issues: categoryAnalysis.issues,
        });
      }
      
      // Add improvement opportunities
      analysis.improvement_opportunities.push(...categoryAnalysis.opportunities);
    }

    // Calculate overall score
    analysis.overall_score = this.calculateOverallScore(analysis.categories);
    
    // Sort opportunities by impact
    analysis.improvement_opportunities.sort((a, b) => b.impact - a.impact);
    
    return analysis;
  }

  /**
   * Analyze a specific capability category
   * @private
   */
  async analyzeCategory(category, basePath) {
    const categoryDef = this.categories[category];
    const analysis = {
      category,
      score: 0,
      metrics: {},
      issues: [],
      highlights: [],
      opportunities: [],
    };

    // Analyze each metric
    for (const metric of categoryDef.metrics) {
      const metricResult = await this.analyzeMetric(category, metric, basePath);
      analysis.metrics[metric] = metricResult;
      
      if (metricResult.score < 6) {
        analysis.issues.push({
          metric,
          score: metricResult.score,
          description: metricResult.description,
        });
        
        // Generate improvement opportunity
        if (metricResult.improvement) {
          analysis.opportunities.push({
            category,
            metric,
            description: metricResult.improvement,
            impact: (10 - metricResult.score) * categoryDef.weight,
            effort: metricResult.effort || 'medium',
            risk: metricResult.risk || 'low',
          });
        }
      } else if (metricResult.score >= 8) {
        analysis.highlights.push({
          metric,
          score: metricResult.score,
          description: metricResult.description,
        });
      }
    }

    // Calculate category score
    const metricScores = Object.values(analysis.metrics).map(m => m.score);
    analysis.score = metricScores.reduce((sum, score) => sum + score, 0) / metricScores.length;
    
    return analysis;
  }

  /**
   * Analyze a specific metric
   * @private
   */
  async analyzeMetric(category, metric, basePath) {
    const methodName = `analyze_${category}_${metric}`.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
    
    // Use specific analyzer if available
    if (typeof this[methodName] === 'function') {
      return await this[methodName](basePath);
    }
    
    // Default metric analysis
    return this.defaultMetricAnalysis(category, metric);
  }

  /**
   * Analyze error handling try-catch coverage
   * @private
   */
  async analyzeErrorHandlingTryCatchCoverage(basePath) {
    const files = await this.getJavaScriptFiles(basePath || this.coreDir);
    let totalFunctions = 0;
    let functionsWithTryCatch = 0;
    const asyncWithoutTryCatch = [];

    for (const file of files) {
      try {
        const content = await fs.readFile(file, 'utf-8');
        const ast = parse(content, {
          sourceType: 'module',
          plugins: ['jsx'],
        });

        traverse(ast, {
          Function(path) {
            totalFunctions++;
            const isAsync = path.node.async;
            let hasTryCatch = false;

            path.traverse({
              TryStatement() {
                hasTryCatch = true;
              },
            });

            if (hasTryCatch) {
              functionsWithTryCatch++;
            } else if (isAsync) {
              asyncWithoutTryCatch.push({
                file: path.relative(this.rootPath, file),
                line: path.node.loc?.start.line,
              });
            }
          },
        });
      } catch (error) {
        // Skip files that can't be parsed
      }
    }

    const coverage = totalFunctions > 0 ? (functionsWithTryCatch / totalFunctions) * 100 : 0;
    const score = Math.min(10, coverage / 10);

    return {
      score,
      description: `Try-catch coverage: ${coverage.toFixed(1)}% (${functionsWithTryCatch}/${totalFunctions} functions)`,
      improvement: asyncWithoutTryCatch.length > 0 
        ? `Add try-catch blocks to ${asyncWithoutTryCatch.length} async functions`
        : null,
      effort: asyncWithoutTryCatch.length > 10 ? 'high' : 'medium',
      risk: 'low',
      details: { asyncWithoutTryCatch: asyncWithoutTryCatch.slice(0, 5) },
    };
  }

  /**
   * Analyze error context quality
   * @private
   */
  async analyzeErrorHandlingErrorContext(basePath) {
    const files = await this.getJavaScriptFiles(basePath || this.coreDir);
    let totalErrors = 0;
    let contextualErrors = 0;
    const poorErrors = [];

    for (const file of files) {
      try {
        const content = await fs.readFile(file, 'utf-8');
        const errorMatches = content.match(/throw\s+new\s+Error\([^)]+\)/g) || [];
        
        errorMatches.forEach(match => {
          totalErrors++;
          // Check if error includes context (variables, state, etc.)
          if (match.includes('${') || match.includes('+') || match.match(/Error\([^'"]+['"]\s*\+/)) {
            contextualErrors++;
          } else {
            poorErrors.push({
              file: path.relative(this.rootPath, file),
              error: match.substring(0, 50),
            });
          }
        });
      } catch (error) {
        // Skip files that can't be analyzed
      }
    }

    const contextRate = totalErrors > 0 ? (contextualErrors / totalErrors) * 100 : 100;
    const score = Math.min(10, contextRate / 10);

    return {
      score,
      description: `Error context quality: ${contextRate.toFixed(1)}% contextual errors`,
      improvement: poorErrors.length > 0
        ? `Enhance ${poorErrors.length} error messages with context`
        : null,
      effort: 'low',
      risk: 'low',
      details: { poorErrors: poorErrors.slice(0, 5) },
    };
  }

  /**
   * Analyze retry logic implementation
   * @private
   */
  async analyzeErrorHandlingRetryLogic(basePath) {
    const files = await this.getJavaScriptFiles(basePath || this.coreDir);
    let retryPatterns = 0;
    let networkOperations = 0;
    const missingRetry = [];

    for (const file of files) {
      try {
        const content = await fs.readFile(file, 'utf-8');
        
        // Look for retry patterns
        if (content.match(/retry|retries|attempt|maxAttempts/i)) {
          retryPatterns++;
        }
        
        // Look for network operations
        const networkOps = content.match(/fetch|axios|request|http\.|https\./g) || [];
        networkOperations += networkOps.length;
        
        // Check if network operations have retry
        if (networkOps.length > 0 && !content.match(/retry|retries|attempt/i)) {
          missingRetry.push({
            file: path.relative(this.rootPath, file),
            operations: networkOps.length,
          });
        }
      } catch (error) {
        // Skip files
      }
    }

    const score = retryPatterns > 0 ? Math.min(10, 5 + (retryPatterns * 0.5)) : 3;

    return {
      score,
      description: `Retry logic found in ${retryPatterns} files`,
      improvement: missingRetry.length > 0
        ? `Add retry logic to ${missingRetry.length} files with network operations`
        : null,
      effort: 'medium',
      risk: 'low',
      details: { missingRetry: missingRetry.slice(0, 5) },
    };
  }

  /**
   * Generate improvement plan based on analysis
   * @param {Object} params - Plan generation parameters
   * @returns {Promise<Object>} Improvement plan
   */
  async generateImprovementPlan(params) {
    const { analysis, request, constraints = {} } = params;
    
    console.log(chalk.blue('📋 Generating improvement plan...'));
    
    const plan = {
      id: `self-imp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      request,
      target_areas: [],
      changes: [],
      affectedFiles: [],
      estimatedImpact: 0,
      estimatedEffort: 0,
      riskLevel: 'low',
    };

    // Filter opportunities based on request and constraints
    let opportunities = analysis.improvement_opportunities;
    
    if (constraints.max_files) {
      opportunities = opportunities.slice(0, constraints.max_files);
    }

    // Generate changes for each opportunity
    for (const opportunity of opportunities) {
      const change = await this.generateChange(opportunity, analysis);
      if (change) {
        plan.changes.push(change);
        plan.target_areas.push(opportunity.category);
        plan.affectedFiles.push(...change.files);
        plan.estimatedImpact += opportunity.impact;
      }
    }

    // Deduplicate
    plan.target_areas = [...new Set(plan.target_areas)];
    plan.affectedFiles = [...new Set(plan.affectedFiles)];
    
    // Calculate effort and risk
    plan.estimatedEffort = this.calculateEffort(plan.changes);
    plan.riskLevel = this.calculateRiskLevel(plan.changes);

    return plan;
  }

  /**
   * Generate specific change for an opportunity
   * @private
   */
  async generateChange(opportunity, analysis) {
    const change = {
      id: `change-${Date.now()}-${Math.random().toString(36).substring(2, 4)}`,
      category: opportunity.category,
      metric: opportunity.metric,
      description: opportunity.description,
      type: 'enhancement',
      files: [],
      modifications: [],
      tests: [],
      impact: opportunity.impact,
      risk: opportunity.risk,
    };

    // Generate specific modifications based on metric
    switch (`${opportunity.category}_${opportunity.metric}`) {
      case 'error_handling_try_catch_coverage':
        const details = analysis.categories.error_handling.metrics.try_catch_coverage.details;
        if (details && details.asyncWithoutTryCatch) {
          for (const location of details.asyncWithoutTryCatch.slice(0, 5)) {
            change.files.push(location.file);
            change.modifications.push({
              file: location.file,
              line: location.line,
              type: 'wrap_in_try_catch',
              description: 'Add try-catch block to async function',
            });
          }
        }
        break;

      case 'error_handling_error_context':
        const errorDetails = analysis.categories.error_handling.metrics.error_context.details;
        if (errorDetails && errorDetails.poorErrors) {
          for (const error of errorDetails.poorErrors.slice(0, 5)) {
            change.files.push(error.file);
            change.modifications.push({
              file: error.file,
              type: 'enhance_error_message',
              description: 'Add context to error message',
              pattern: error.error,
            });
          }
        }
        break;

      default:
        // Generic improvement
        change.modifications.push({
          type: 'generic_improvement',
          description: opportunity.description,
        });
    }

    // Add test requirements
    change.tests = change.files.map(file => ({
      file: file.replace('.js', '.test.js'),
      type: 'unit',
      coverage: 'new_functionality',
    }));

    return change;
  }

  /**
   * Calculate overall score from category scores
   * @private
   */
  calculateOverallScore(categories) {
    let weightedSum = 0;
    let totalWeight = 0;

    Object.entries(categories).forEach(([name, analysis]) => {
      const weight = this.categories[name]?.weight || 0.1;
      weightedSum += analysis.score * weight;
      totalWeight += weight;
    });

    return totalWeight > 0 ? (weightedSum / totalWeight).toFixed(2) : 0;
  }

  /**
   * Calculate total effort for changes
   * @private
   */
  calculateEffort(changes) {
    const effortMap = { low: 1, medium: 2, high: 3 };
    const totalEffort = changes.reduce((sum, change) => {
      return sum + (effortMap[change.risk] || 2);
    }, 0);
    
    if (totalEffort <= 5) return 'low';
    if (totalEffort <= 15) return 'medium';
    return 'high';
  }

  /**
   * Calculate risk level for changes
   * @private
   */
  calculateRiskLevel(changes) {
    const hasHighRisk = changes.some(c => c.risk === 'high');
    const mediumRiskCount = changes.filter(c => c.risk === 'medium').length;
    
    if (hasHighRisk || mediumRiskCount > 3) return 'high';
    if (mediumRiskCount > 0) return 'medium';
    return 'low';
  }

  /**
   * Get JavaScript files in directory
   * @private
   */
  async getJavaScriptFiles(dir) {
    const files = [];
    
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
          files.push(...await this.getJavaScriptFiles(fullPath));
        } else if (entry.isFile() && entry.name.endsWith('.js')) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      console.error(`Error reading directory ${dir}: ${error.message}`);
    }
    
    return files;
  }

  /**
   * Default metric analysis for unimplemented metrics
   * @private
   */
  defaultMetricAnalysis(category, metric) {
    return {
      score: 5,
      description: `${metric} analysis not yet implemented`,
      improvement: `Implement ${metric} analysis and improvements`,
      effort: 'medium',
      risk: 'low',
    };
  }
}

module.exports = CapabilityAnalyzer;