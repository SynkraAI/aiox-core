const fs = require('fs').promises;
const path = require('path');
const chalk = require('chalk');

/**
 * Dependency impact analyzer for Synkra AIOX framework
 * Analyzes how component modifications affect dependent components
 */
class DependencyImpactAnalyzer {
  constructor(options = {}) {
    this.rootPath = options.rootPath || process.cwd();
    this.dependencyGraph = new Map();
    this.reverseDependencyGraph = new Map();
    this.componentRegistry = new Map();
    this.analysisCache = new Map();
    this.maxAnalysisDepth = 10;
  }

  /**
   * Initialize the dependency analyzer
   */
  async initialize() {
    try {
      console.log(chalk.gray('Initializing dependency impact analyzer...'));
      
      // Build comprehensive dependency graph
      await this.buildDependencyGraph();
      
      // Build reverse dependency graph for impact analysis
      await this.buildReverseDependencyGraph();
      
      // Register all components for quick lookup
      await this.registerAllComponents();
      
      console.log(chalk.green('✅ Dependency impact analyzer initialized'));
      console.log(chalk.gray(`   Components registered: ${this.componentRegistry.size}`));
      console.log(chalk.gray(`   Dependencies mapped: ${this.dependencyGraph.size}`));
      
      return true;
      
    } catch (error) {
      console.error(chalk.red(`Failed to initialize dependency analyzer: ${error.message}`));
      throw error;
    }
  }

  /**
   * Analyze dependency impact of a component modification
   */
  async analyzeDependencyImpact(targetComponent, options = {}) {
    const analysisId = `impact-${Date.now()}`;
    
    try {
      console.log(chalk.blue(`🔍 Analyzing dependency impact for: ${targetComponent.path}`));
      
      const config = {
        depth: options.depth || 'medium',
        includeTests: options.includeTests || false,
        excludeExternal: options.excludeExternal || false,
        modificationType: options.modificationType || 'modify',
        ...options,
      };

      // Determine analysis depth
      const maxDepth = this.getAnalysisDepth(config.depth);
      
      // Find all components that depend on the target
      const directDependents = await this.findDirectDependents(targetComponent);
      
      // Perform recursive dependency analysis
      const affectedComponents = await this.analyzeRecursiveDependencies(
        targetComponent, 
        directDependents, 
        maxDepth, 
        config,
      );
      
      // Calculate impact scores for each affected component
      const scoredComponents = await this.calculateImpactScores(
        targetComponent, 
        affectedComponents, 
        config,
      );
      
      // Categorize impact by severity
      const impactCategories = this.categorizeImpactBySeverity(scoredComponents);
      
      // Generate dependency recommendations
      const recommendations = await this.generateDependencyRecommendations(
        targetComponent, 
        scoredComponents, 
        config,
      );

      const result = {
        analysisId: analysisId,
        targetComponent: {
          path: targetComponent.path,
          type: targetComponent.type,
        },
        analysisConfig: config,
        affectedComponents: scoredComponents,
        impactCategories: impactCategories,
        recommendations: recommendations,
        statistics: {
          totalComponents: scoredComponents.length,
          directDependents: directDependents.length,
          highImpactComponents: scoredComponents.filter(c => c.impactScore >= 8).length,
          mediumImpactComponents: scoredComponents.filter(c => c.impactScore >= 5 && c.impactScore < 8).length,
          lowImpactComponents: scoredComponents.filter(c => c.impactScore < 5).length,
        },
        analysisTimestamp: new Date().toISOString(),
      };

      // Cache analysis results
      this.analysisCache.set(analysisId, result);
      
      console.log(chalk.green('✅ Dependency analysis completed'));
      console.log(chalk.gray(`   Affected components: ${result.statistics.totalComponents}`));
      console.log(chalk.gray(`   High impact: ${result.statistics.highImpactComponents}`));
      
      return result;
      
    } catch (error) {
      console.error(chalk.red(`Dependency analysis failed: ${error.message}`));
      throw error;
    }
  }

  /**
   * Build comprehensive dependency graph from all components
   */
  async buildDependencyGraph() {
    const componentTypes = ['agents', 'tasks', 'workflows', 'utils'];
    
    for (const type of componentTypes) {
      const typeDir = path.join(this.rootPath, 'aiox-core', type);
      
      try {
        const files = await fs.readdir(typeDir);
        
        for (const file of files) {
          const filePath = path.join(typeDir, file);
          const stats = await fs.stat(filePath);
          
          if (stats.isFile()) {
            await this.analyzeDependenciesForFile(filePath, type.slice(0, -1));
          }
        }
      } catch (error) {
        // Directory doesn't exist, skip
        continue;
      }
    }

    // Also analyze test files if requested
    await this.analyzeTestDependencies();
  }

  /**
   * Analyze dependencies for a specific file
   */
  async analyzeDependenciesForFile(filePath, componentType) {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const relativePath = path.relative(this.rootPath, filePath);
      
      const dependencies = this.extractDependenciesFromContent(content, filePath);
      
      // Store in dependency graph
      this.dependencyGraph.set(relativePath, {
        path: relativePath,
        type: componentType,
        dependencies: dependencies,
        lastAnalyzed: new Date().toISOString(),
      });
      
    } catch (error) {
      console.warn(chalk.yellow(`Failed to analyze dependencies for ${filePath}: ${error.message}`));
    }
  }

  /**
   * Extract dependencies from file content
   */
  extractDependenciesFromContent(content, filePath) {
    const dependencies = {
      internal: [],
      external: [],
      framework: [],
      tests: [],
    };

    // Extract require statements
    const requireMatches = content.match(/require\s*\(\s*['"](.*?)['"]\s*\)/g) || [];
    requireMatches.forEach(match => {
      const dep = match.match(/require\s*\(\s*['"](.*?)['"]\s*\)/)[1];
      this.categorizeDependency(dep, dependencies, filePath);
    });

    // Extract import statements
    const importMatches = content.match(/import\s+.*?\s+from\s+['"](.*?)['"]/g) || [];
    importMatches.forEach(match => {
      const dep = match.match(/from\s+['"](.*?)['"]/)[1];
      this.categorizeDependency(dep, dependencies, filePath);
    });

    // Extract AIOX-specific references
    const agentRefs = content.match(/agent[_-]?name\s*[:=]\s*['"](.*?)['"]/gi) || [];
    agentRefs.forEach(match => {
      const agentName = match.match(/['"](.*?)['"]/)[1];
      dependencies.framework.push(`agents/${agentName}`);
    });

    const taskRefs = content.match(/task[_-]?name\s*[:=]\s*['"](.*?)['"]/gi) || [];
    taskRefs.forEach(match => {
      const taskName = match.match(/['"](.*?)['"]/)[1];
      dependencies.framework.push(`tasks/${taskName}`);
    });

    // Extract workflow references
    const workflowRefs = content.match(/workflow[_-]?name\s*[:=]\s*['"](.*?)['"]/gi) || [];
    workflowRefs.forEach(match => {
      const workflowName = match.match(/['"](.*?)['"]/)[1];
      dependencies.framework.push(`workflows/${workflowName}`);
    });

    return dependencies;
  }

  /**
   * Categorize a dependency by type
   */
  categorizeDependency(dep, dependencies, filePath) {
    if (dep.startsWith('./') || dep.startsWith('../')) {
      // Resolve relative path to absolute
      const resolvedPath = path.resolve(path.dirname(filePath), dep);
      const relativePath = path.relative(this.rootPath, resolvedPath);
      dependencies.internal.push(relativePath);
    } else if (dep.includes('aiox-core/') || dep.includes('/aiox-core/')) {
      dependencies.framework.push(dep);
    } else if (dep.includes('test') || dep.includes('spec')) {
      dependencies.tests.push(dep);
    } else if (!dep.startsWith('node:') && !dep.startsWith('fs') && !dep.startsWith('path')) {
      dependencies.external.push(dep);
    }
  }

  /**
   * Build reverse dependency graph for impact analysis
   */
  async buildReverseDependencyGraph() {
    for (const [componentPath, componentData] of this.dependencyGraph) {
      const allDeps = [
        ...componentData.dependencies.internal,
        ...componentData.dependencies.framework,
      ];

      for (const dep of allDeps) {
        if (!this.reverseDependencyGraph.has(dep)) {
          this.reverseDependencyGraph.set(dep, []);
        }
        
        this.reverseDependencyGraph.get(dep).push({
          path: componentPath,
          type: componentData.type,
          dependencyType: componentData.dependencies.internal.includes(dep) ? 'internal' : 'framework',
        });
      }
    }
  }

  /**
   * Register all components for quick lookup
   */
  async registerAllComponents() {
    for (const [componentPath, componentData] of this.dependencyGraph) {
      this.componentRegistry.set(componentPath, {
        path: componentPath,
        type: componentData.type,
        dependencies: componentData.dependencies,
        dependents: this.reverseDependencyGraph.get(componentPath) || [],
      });
    }
  }

  /**
   * Find components that directly depend on the target
   */
  async findDirectDependents(targetComponent) {
    const dependents = [];
    const targetPath = targetComponent.path;
    
    // Check reverse dependency graph
    if (this.reverseDependencyGraph.has(targetPath)) {
      dependents.push(...this.reverseDependencyGraph.get(targetPath));
    }

    // Also check for components that might reference this component by name
    const componentName = path.basename(targetPath, path.extname(targetPath));
    for (const [componentPath, componentData] of this.dependencyGraph) {
      if (componentPath === targetPath) continue;
      
      const content = await this.getComponentContent(componentPath);
      if (content && this.containsReferenceTo(content, componentName, targetComponent.type)) {
        dependents.push({
          path: componentPath,
          type: componentData.type,
          dependencyType: 'reference',
        });
      }
    }

    return dependents;
  }

  /**
   * Perform recursive dependency analysis
   */
  async analyzeRecursiveDependencies(targetComponent, directDependents, maxDepth, config) {
    const visited = new Set();
    const affectedComponents = [];
    const queue = directDependents.map(dep => ({ ...dep, depth: 1 }));
    
    visited.add(targetComponent.path);
    
    while (queue.length > 0 && affectedComponents.length < 1000) { // Safety limit
      const current = queue.shift();
      
      if (visited.has(current.path) || current.depth > maxDepth) {
        continue;
      }
      
      visited.add(current.path);
      affectedComponents.push(current);
      
      // Find dependents of current component
      const currentDependents = await this.findDirectDependents(current);
      
      for (const dependent of currentDependents) {
        if (!visited.has(dependent.path)) {
          queue.push({ ...dependent, depth: current.depth + 1 });
        }
      }
    }

    return affectedComponents;
  }

  /**
   * Calculate impact scores for affected components
   */
  async calculateImpactScores(targetComponent, affectedComponents, config) {
    const scoredComponents = [];
    
    for (const component of affectedComponents) {
      const impactScore = await this.calculateComponentImpactScore(
        targetComponent, 
        component, 
        config,
      );
      
      scoredComponents.push({
        ...component,
        impactScore: impactScore.score,
        impactFactors: impactScore.factors,
        severity: this.categorizeImpactSeverity(impactScore.score),
        reason: impactScore.primaryReason,
      });
    }
    
    return scoredComponents.sort((a, b) => b.impactScore - a.impactScore);
  }

  /**
   * Calculate impact score for a specific component
   */
  async calculateComponentImpactScore(targetComponent, affectedComponent, config) {
    const factors = {
      dependencyType: 0,
      componentCriticality: 0,
      modificationRisk: 0,
      propagationDepth: 0,
      usageFrequency: 0,
    };

    // Factor 1: Dependency type weight
    switch (affectedComponent.dependencyType) {
      case 'internal':
        factors.dependencyType = 3;
        break;
      case 'framework':
        factors.dependencyType = 2;
        break;
      case 'reference':
        factors.dependencyType = 1;
        break;
    }

    // Factor 2: Component criticality (based on type and usage)
    factors.componentCriticality = this.assessComponentCriticality(affectedComponent);

    // Factor 3: Modification risk based on modification type
    factors.modificationRisk = this.assessModificationRisk(config.modificationType);

    // Factor 4: Propagation depth penalty
    factors.propagationDepth = Math.max(0, 3 - (affectedComponent.depth || 1));

    // Factor 5: Usage frequency (estimate based on dependents)
    const componentData = this.componentRegistry.get(affectedComponent.path);
    if (componentData) {
      factors.usageFrequency = Math.min(3, componentData.dependents.length / 5);
    }

    // Calculate weighted score (0-10 scale)
    const totalScore = Object.values(factors).reduce((sum, factor) => sum + factor, 0);
    const normalizedScore = Math.min(10, Math.round((totalScore / 15) * 10));

    // Determine primary reason for impact
    const primaryReason = this.determinePrimaryImpactReason(factors, config);

    return {
      score: normalizedScore,
      factors: factors,
      primaryReason: primaryReason,
    };
  }

  /**
   * Assess component criticality
   */
  assessComponentCriticality(component) {
    // Higher criticality for core framework components
    if (component.type === 'util' && component.path.includes('core')) {
      return 3;
    }
    
    if (component.type === 'agent' || component.type === 'workflow') {
      return 2;
    }
    
    if (component.type === 'task') {
      return 1.5;
    }
    
    return 1;
  }

  /**
   * Assess modification risk
   */
  assessModificationRisk(modificationType) {
    switch (modificationType) {
      case 'remove':
        return 4;
      case 'deprecate':
        return 3;
      case 'refactor':
        return 2;
      case 'modify':
        return 1;
      default:
        return 1;
    }
  }

  /**
   * Determine primary reason for impact
   */
  determinePrimaryImpactReason(factors, config) {
    const maxFactor = Math.max(...Object.values(factors));
    
    if (factors.modificationRisk === maxFactor && config.modificationType === 'remove') {
      return 'Component removal will break dependent functionality';
    }
    
    if (factors.componentCriticality === maxFactor) {
      return 'Critical component with high framework dependency';
    }
    
    if (factors.dependencyType === maxFactor) {
      return 'Direct internal dependency requiring code changes';
    }
    
    if (factors.usageFrequency === maxFactor) {
      return 'Widely used component affecting multiple dependents';
    }
    
    return 'Component modification may require updates';
  }

  /**
   * Categorize impact by severity
   */
  categorizeImpactBySeverity(scoredComponents) {
    return {
      critical: scoredComponents.filter(c => c.impactScore >= 9),
      high: scoredComponents.filter(c => c.impactScore >= 7 && c.impactScore < 9),
      medium: scoredComponents.filter(c => c.impactScore >= 4 && c.impactScore < 7),
      low: scoredComponents.filter(c => c.impactScore < 4),
    };
  }

  /**
   * Categorize impact severity
   */
  categorizeImpactSeverity(score) {
    if (score >= 9) return 'critical';
    if (score >= 7) return 'high';
    if (score >= 4) return 'medium';
    return 'low';
  }

  /**
   * Generate dependency recommendations
   */
  async generateDependencyRecommendations(targetComponent, scoredComponents, config) {
    const recommendations = [];
    
    const criticalComponents = scoredComponents.filter(c => c.impactScore >= 9);
    const highImpactComponents = scoredComponents.filter(c => c.impactScore >= 7 && c.impactScore < 9);
    
    // Critical impact recommendations
    if (criticalComponents.length > 0) {
      recommendations.push({
        priority: 'critical',
        title: 'Review Critical Impact Components',
        description: `${criticalComponents.length} components have critical dependency on the target. Consider gradual migration or deprecation strategy.`,
        affectedComponents: criticalComponents.slice(0, 5).map(c => c.path),
        actionRequired: true,
      });
    }
    
    // High impact recommendations
    if (highImpactComponents.length > 0) {
      recommendations.push({
        priority: 'high',
        title: 'Update High Impact Components',
        description: `${highImpactComponents.length} components require updates to maintain compatibility.`,
        affectedComponents: highImpactComponents.slice(0, 5).map(c => c.path),
        actionRequired: true,
      });
    }
    
    // Modification-specific recommendations
    if (config.modificationType === 'remove') {
      recommendations.push({
        priority: 'critical',
        title: 'Plan Component Removal Strategy',
        description: 'Removing this component requires careful migration of all dependent functionality.',
        actionRequired: true,
        suggestedActions: [
          'Create migration guide for dependent components',
          'Implement deprecation warnings in advance',
          'Provide alternative component recommendations',
          'Test all dependent components after removal',
        ],
      });
    }
    
    if (config.modificationType === 'refactor') {
      recommendations.push({
        priority: 'medium',
        title: 'Coordinate Refactoring Changes',
        description: 'Refactoring may require interface updates in dependent components.',
        actionRequired: false,
        suggestedActions: [
          'Review and update component interfaces',
          'Update documentation for API changes',
          'Run comprehensive testing on dependent components',
        ],
      });
    }

    // Testing recommendations
    if (scoredComponents.length > 5) {
      recommendations.push({
        priority: 'medium',
        title: 'Comprehensive Testing Required',
        description: `Large impact scope (${scoredComponents.length} components) requires extensive testing.`,
        actionRequired: true,
        suggestedActions: [
          'Run full integration test suite',
          'Perform regression testing on affected components',
          'Consider staged rollout approach',
        ],
      });
    }

    return recommendations;
  }

  /**
   * Analyze test dependencies
   */
  async analyzeTestDependencies() {
    const testDir = path.join(this.rootPath, 'tests');
    
    try {
      await this.analyzeDirectoryRecursively(testDir, 'test');
    } catch (error) {
      // Tests directory doesn't exist, skip
    }
  }

  /**
   * Analyze directory recursively for dependencies
   */
  async analyzeDirectoryRecursively(dir, componentType) {
    try {
      const files = await fs.readdir(dir);
      
      for (const file of files) {
        const filePath = path.join(dir, file);
        const stats = await fs.stat(filePath);
        
        if (stats.isDirectory()) {
          await this.analyzeDirectoryRecursively(filePath, componentType);
        } else if (stats.isFile() && (file.endsWith('.js') || file.endsWith('.md'))) {
          await this.analyzeDependenciesForFile(filePath, componentType);
        }
      }
    } catch (error) {
      // Skip directories that can't be read
    }
  }

  /**
   * Get component content
   */
  async getComponentContent(componentPath) {
    try {
      const fullPath = path.resolve(this.rootPath, componentPath);
      return await fs.readFile(fullPath, 'utf-8');
    } catch (error) {
      return null;
    }
  }

  /**
   * Check if content contains reference to component
   */
  containsReferenceTo(content, componentName, componentType) {
    const patterns = [
      new RegExp(`${componentName}`, 'i'),
      new RegExp(`${componentType}[_-]?name.*${componentName}`, 'i'),
      new RegExp(`require.*${componentName}`, 'i'),
      new RegExp(`import.*${componentName}`, 'i'),
    ];
    
    return patterns.some(pattern => pattern.test(content));
  }

  /**
   * Get analysis depth from config
   */
  getAnalysisDepth(depth) {
    switch (depth) {
      case 'shallow':
        return 2;
      case 'medium':
        return 4;
      case 'deep':
        return 8;
      default:
        return 4;
    }
  }

  /**
   * Get cached analysis
   */
  getCachedAnalysis(analysisId) {
    return this.analysisCache.get(analysisId);
  }

  /**
   * Clear analysis cache
   */
  clearCache() {
    this.analysisCache.clear();
    console.log(chalk.gray('Dependency analysis cache cleared'));
  }

  /**
   * Get analysis statistics
   */
  getAnalysisStats() {
    return {
      totalComponents: this.componentRegistry.size,
      totalDependencies: this.dependencyGraph.size,
      averageDependencies: Array.from(this.dependencyGraph.values()).reduce((sum, comp) => {
        const totalDeps = comp.dependencies.internal.length + 
                         comp.dependencies.framework.length + 
                         comp.dependencies.external.length;
        return sum + totalDeps;
      }, 0) / this.dependencyGraph.size,
      cachedAnalyses: this.analysisCache.size,
    };
  }
}

module.exports = DependencyImpactAnalyzer;