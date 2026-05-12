const fs = require('fs').promises;
const path = require('path');
const chalk = require('chalk');

/**
 * Usage pattern analyzer for Synkra AIOX framework components
 * Analyzes how components are used throughout the codebase
 */
class UsageAnalytics {
  constructor(options = {}) {
    this.rootPath = options.rootPath || process.cwd();
    this.cacheTimeout = options.cacheTimeout || 300000; // 5 minutes
    this.usageCache = new Map();
    this.patterns = {
      imports: [
        /require\(['"`]([^'"`]+)['"`]\)/g,
        /import .* from ['"`]([^'"`]+)['"`]/g,
        /import\(['"`]([^'"`]+)['"`]\)/g,
      ],
      taskCalls: [
        /\*([a-zA-Z-]+)/g,
        /executeTask\(['"`]([^'"`]+)['"`]\)/g,
      ],
      agentReferences: [
        /aiox-developer/g,
        /meta-agent/g,
        /@agent\s+([a-zA-Z-]+)/g,
      ],
      utilCalls: [
        /require\(['"`]\.\.\/utils\/([^'"`]+)['"`]\)/g,
        /from ['"`]\.\.\/utils\/([^'"`]+)['"`]/g,
      ],
    };
  }

  /**
   * Analyze usage patterns for all components
   */
  async analyzeUsagePatterns(components) {
    const usage = {
      timestamp: new Date().toISOString(),
      component_usage: {},
      hotspots: [],
      unused_components: [],
      popular_components: [],
      usage_trends: {},
      cross_references: {},
      efficiency_score: 0,
      recommendations: [],
    };

    try {
      console.log(chalk.blue('Analyzing component usage patterns...'));

      // Analyze usage for each component
      for (const component of components) {
        const componentUsage = await this.analyzeComponentUsage(component);
        usage.component_usage[component.id] = componentUsage;
      }

      // Calculate derived metrics
      usage.hotspots = this.identifyHotspots(usage.component_usage);
      usage.unused_components = this.findUnusedComponents(usage.component_usage);
      usage.popular_components = this.findPopularComponents(usage.component_usage);
      usage.cross_references = await this.analyzeCrossReferences(components);
      usage.efficiency_score = this.calculateEfficiencyScore(usage);
      usage.recommendations = this.generateUsageRecommendations(usage);

      console.log(chalk.green(`✅ Analyzed usage for ${components.length} components`));
      return usage;

    } catch (error) {
      console.error(chalk.red(`Usage analysis failed: ${error.message}`));
      throw error;
    }
  }

  /**
   * Analyze usage patterns for a single component
   */
  async analyzeComponentUsage(component) {
    const cacheKey = `${component.id}-${component.last_modified}`;
    
    if (this.usageCache.has(cacheKey)) {
      const cached = this.usageCache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data;
      }
    }

    const usage = {
      component_id: component.id,
      type: component.type,
      direct_references: 0,
      indirect_references: 0,
      referencing_files: [],
      usage_contexts: [],
      popularity_score: 0,
      last_used: null,
      usage_frequency: 'never',
      dependency_depth: 0,
      integration_points: [],
    };

    try {
      // Search for direct references
      const directRefs = await this.findDirectReferences(component);
      usage.direct_references = directRefs.count;
      usage.referencing_files = directRefs.files;

      // Search for indirect references
      const indirectRefs = await this.findIndirectReferences(component);
      usage.indirect_references = indirectRefs.count;

      // Analyze usage contexts
      usage.usage_contexts = await this.analyzeUsageContexts(component, directRefs.files);

      // Calculate metrics
      usage.popularity_score = this.calculatePopularityScore(usage);
      usage.last_used = await this.findLastUsageDate(component);
      usage.usage_frequency = this.calculateUsageFrequency(usage);
      usage.dependency_depth = await this.calculateDependencyDepth(component);
      usage.integration_points = await this.findIntegrationPoints(component);

      // Cache the result
      this.usageCache.set(cacheKey, {
        timestamp: Date.now(),
        data: usage,
      });

      return usage;

    } catch (error) {
      console.warn(chalk.yellow(`Failed to analyze usage for ${component.id}: ${error.message}`));
      return usage;
    }
  }

  /**
   * Find direct references to a component
   */
  async findDirectReferences(component) {
    const references = {
      count: 0,
      files: [],
      locations: [],
    };

    try {
      const searchPaths = [
        path.join(this.rootPath, 'aiox-core'),
        path.join(this.rootPath, 'tests'),
        path.join(this.rootPath, 'docs'),
        path.join(this.rootPath, 'examples'),
      ];

      for (const searchPath of searchPaths) {
        try {
          await fs.access(searchPath);
          await this.searchInDirectory(searchPath, component, references);
        } catch (error) {
          // Directory doesn't exist, skip
        }
      }

    } catch (error) {
      console.warn(`Direct reference search failed: ${error.message}`);
    }

    return references;
  }

  /**
   * Search for component references in a directory
   */
  async searchInDirectory(dirPath, component, references) {
    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);

        if (entry.isDirectory()) {
          // Skip excluded directories
          if (this.isExcludedDirectory(entry.name)) continue;
          await this.searchInDirectory(fullPath, component, references);
        } else if (entry.isFile() && this.isSearchableFile(entry.name)) {
          await this.searchInFile(fullPath, component, references);
        }
      }
    } catch (error) {
      // Directory not accessible, skip
    }
  }

  /**
   * Search for component references in a file
   */
  async searchInFile(filePath, component, references) {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const relativePath = path.relative(this.rootPath, filePath);
      let foundReferences = false;

      // Search based on component type
      switch (component.type) {
        case 'agent':
          foundReferences = this.searchAgentReferences(content, component);
          break;
        case 'task':
          foundReferences = this.searchTaskReferences(content, component);
          break;
        case 'workflow':
          foundReferences = this.searchWorkflowReferences(content, component);
          break;
        case 'utility':
          foundReferences = this.searchUtilityReferences(content, component);
          break;
        default:
          foundReferences = this.searchGenericReferences(content, component);
      }

      if (foundReferences.count > 0) {
        references.count += foundReferences.count;
        if (!references.files.includes(relativePath)) {
          references.files.push(relativePath);
        }
        
        foundReferences.locations.forEach(loc => {
          references.locations.push({
            file: relativePath,
            line: loc.line,
            context: loc.context,
            type: loc.type,
          });
        });
      }

    } catch (error) {
      // File not readable, skip
    }
  }

  /**
   * Search for agent references
   */
  searchAgentReferences(content, component) {
    const results = { count: 0, locations: [] };
    const lines = content.split('\n');

    // Look for agent name mentions
    const agentPatterns = [
      new RegExp(`@agent\\s+${component.id}`, 'gi'),
      new RegExp(`agent:\\s*['"\`]${component.id}['"\`]`, 'gi'),
      new RegExp(`${component.name}`, 'gi'),
    ];

    lines.forEach((line, index) => {
      agentPatterns.forEach(pattern => {
        const matches = line.match(pattern);
        if (matches) {
          results.count += matches.length;
          results.locations.push({
            line: index + 1,
            context: line.trim(),
            type: 'agent_reference',
          });
        }
      });
    });

    return results;
  }

  /**
   * Search for task references
   */
  searchTaskReferences(content, component) {
    const results = { count: 0, locations: [] };
    const lines = content.split('\n');

    // Look for task calls
    const taskPatterns = [
      new RegExp(`\\*${component.id}`, 'gi'),
      new RegExp(`executeTask\\(['"\`]${component.id}['"\`]\\)`, 'gi'),
      new RegExp(`task:\\s*['"\`]${component.id}['"\`]`, 'gi'),
    ];

    lines.forEach((line, index) => {
      taskPatterns.forEach(pattern => {
        const matches = line.match(pattern);
        if (matches) {
          results.count += matches.length;
          results.locations.push({
            line: index + 1,
            context: line.trim(),
            type: 'task_call',
          });
        }
      });
    });

    return results;
  }

  /**
   * Search for workflow references
   */
  searchWorkflowReferences(content, component) {
    const results = { count: 0, locations: [] };
    const lines = content.split('\n');

    // Look for workflow references
    const workflowPatterns = [
      new RegExp(`workflow:\\s*['"\`]${component.id}['"\`]`, 'gi'),
      new RegExp(`${component.id}\\.yaml`, 'gi'),
      new RegExp(`${component.name}`, 'gi'),
    ];

    lines.forEach((line, index) => {
      workflowPatterns.forEach(pattern => {
        const matches = line.match(pattern);
        if (matches) {
          results.count += matches.length;
          results.locations.push({
            line: index + 1,
            context: line.trim(),
            type: 'workflow_reference',
          });
        }
      });
    });

    return results;
  }

  /**
   * Search for utility references
   */
  searchUtilityReferences(content, component) {
    const results = { count: 0, locations: [] };
    const lines = content.split('\n');

    // Look for utility imports and calls
    const utilPatterns = [
      new RegExp(`require\\(['"\`][^'"\`]*${component.id}['"\`]\\)`, 'gi'),
      new RegExp(`from ['"\`][^'"\`]*${component.id}['"\`]`, 'gi'),
      new RegExp(`import.*${component.id}`, 'gi'),
    ];

    lines.forEach((line, index) => {
      utilPatterns.forEach(pattern => {
        const matches = line.match(pattern);
        if (matches) {
          results.count += matches.length;
          results.locations.push({
            line: index + 1,
            context: line.trim(),
            type: 'utility_import',
          });
        }
      });
    });

    return results;
  }

  /**
   * Search for generic references
   */
  searchGenericReferences(content, component) {
    const results = { count: 0, locations: [] };
    const lines = content.split('\n');

    // Look for generic mentions
    const namePattern = new RegExp(component.name || component.id, 'gi');

    lines.forEach((line, index) => {
      const matches = line.match(namePattern);
      if (matches) {
        results.count += matches.length;
        results.locations.push({
          line: index + 1,
          context: line.trim(),
          type: 'generic_mention',
        });
      }
    });

    return results;
  }

  /**
   * Find indirect references through dependency chains
   */
  async findIndirectReferences(component) {
    const indirectRefs = { count: 0, files: [] };
    
    // This would analyze dependency chains to find indirect usage
    // For now, return basic implementation
    return indirectRefs;
  }

  /**
   * Analyze usage contexts for a component
   */
  async analyzeUsageContexts(component, referencingFiles) {
    const contexts = [];

    for (const file of referencingFiles.slice(0, 10)) { // Limit analysis
      try {
        const fullPath = path.join(this.rootPath, file);
        const content = await fs.readFile(fullPath, 'utf-8');
        
        const context = this.extractUsageContext(content, component, file);
        if (context) {
          contexts.push(context);
        }
      } catch (error) {
        // File not accessible, skip
      }
    }

    return contexts;
  }

  /**
   * Extract usage context from file content
   */
  extractUsageContext(content, component, filePath) {
    return {
      file: filePath,
      context_type: this.determineContextType(filePath),
      usage_pattern: this.identifyUsagePattern(content, component),
      complexity: this.calculateUsageComplexity(content, component),
    };
  }

  /**
   * Calculate popularity score for a component
   */
  calculatePopularityScore(usage) {
    const directWeight = 1.0;
    const indirectWeight = 0.3;
    const fileWeight = 0.1;
    
    return Math.round(
      (usage.direct_references * directWeight +
       usage.indirect_references * indirectWeight +
       usage.referencing_files.length * fileWeight) * 10,
    ) / 10;
  }

  /**
   * Find last usage date for a component
   */
  async findLastUsageDate(component) {
    // This would analyze git history or file modification dates
    // For now, return null
    return null;
  }

  /**
   * Calculate usage frequency
   */
  calculateUsageFrequency(usage) {
    if (usage.direct_references === 0) return 'never';
    if (usage.direct_references < 3) return 'rare';
    if (usage.direct_references < 10) return 'occasional';
    if (usage.direct_references < 25) return 'frequent';
    return 'very_frequent';
  }

  /**
   * Calculate dependency depth
   */
  async calculateDependencyDepth(component) {
    // This would analyze how deep in the dependency tree the component is
    return 0;
  }

  /**
   * Find integration points
   */
  async findIntegrationPoints(component) {
    // This would identify key integration points
    return [];
  }

  /**
   * Identify usage hotspots
   */
  identifyHotspots(componentUsage) {
    return Object.entries(componentUsage)
      .filter(([_, usage]) => usage.popularity_score > 15)
      .map(([id, usage]) => ({
        component_id: id,
        popularity_score: usage.popularity_score,
        direct_references: usage.direct_references,
        referencing_files: usage.referencing_files.length,
      }))
      .sort((a, b) => b.popularity_score - a.popularity_score);
  }

  /**
   * Find unused components
   */
  findUnusedComponents(componentUsage) {
    return Object.entries(componentUsage)
      .filter(([_, usage]) => usage.direct_references === 0 && usage.indirect_references === 0)
      .map(([id, usage]) => ({
        component_id: id,
        type: usage.type,
        last_modified: usage.last_used,
      }));
  }

  /**
   * Find popular components
   */
  findPopularComponents(componentUsage) {
    return Object.entries(componentUsage)
      .filter(([_, usage]) => usage.popularity_score > 10)
      .map(([id, usage]) => ({
        component_id: id,
        type: usage.type,
        popularity_score: usage.popularity_score,
        usage_frequency: usage.usage_frequency,
      }))
      .sort((a, b) => b.popularity_score - a.popularity_score)
      .slice(0, 10);
  }

  /**
   * Analyze cross-references between components
   */
  async analyzeCrossReferences(components) {
    const crossRefs = {};
    
    // This would analyze how components reference each other
    // For now, return basic structure
    return crossRefs;
  }

  /**
   * Calculate overall efficiency score
   */
  calculateEfficiencyScore(usage) {
    const totalComponents = Object.keys(usage.component_usage).length;
    const usedComponents = totalComponents - usage.unused_components.length;
    const utilizationRate = usedComponents / totalComponents;
    
    return Math.round(utilizationRate * 100);
  }

  /**
   * Generate usage recommendations
   */
  generateUsageRecommendations(usage) {
    const recommendations = [];

    // Unused components
    if (usage.unused_components.length > 0) {
      recommendations.push({
        type: 'cleanup',
        priority: 'medium',
        message: `Consider reviewing ${usage.unused_components.length} unused components for potential removal`,
        components: usage.unused_components.map(c => c.component_id),
      });
    }

    // Hotspots
    if (usage.hotspots.length > 0) {
      const topHotspot = usage.hotspots[0];
      if (topHotspot.popularity_score > 50) {
        recommendations.push({
          type: 'optimization',
          priority: 'high',
          message: `Component '${topHotspot.component_id}' is heavily used - consider optimization or caching`,
          component: topHotspot.component_id,
        });
      }
    }

    // Low efficiency
    if (usage.efficiency_score < 70) {
      recommendations.push({
        type: 'architecture',
        priority: 'medium',
        message: `Framework efficiency is ${usage.efficiency_score}% - consider component consolidation`,
        score: usage.efficiency_score,
      });
    }

    return recommendations;
  }

  // Helper methods
  isExcludedDirectory(name) {
    const excludes = ['node_modules', '.git', '.aiox', 'dist', 'build', 'coverage'];
    return excludes.includes(name) || name.startsWith('.');
  }

  isSearchableFile(name) {
    const extensions = ['.js', '.mjs', '.ts', '.md', '.yaml', '.yml', '.json'];
    return extensions.some(ext => name.endsWith(ext));
  }

  determineContextType(filePath) {
    if (filePath.includes('/tests/')) return 'test';
    if (filePath.includes('/docs/')) return 'documentation';
    if (filePath.includes('/utils/')) return 'utility';
    if (filePath.includes('/tasks/')) return 'task';
    if (filePath.includes('/agents/')) return 'agent';
    return 'general';
  }

  identifyUsagePattern(content, component) {
    // Analyze how the component is used
    if (content.includes('require(')) return 'import';
    if (content.includes('*' + component.id)) return 'task_call';
    if (content.includes('@agent')) return 'agent_reference';
    return 'mention';
  }

  calculateUsageComplexity(content, component) {
    // Simple complexity based on usage patterns
    const lines = content.split('\n').length;
    const mentions = (content.match(new RegExp(component.id, 'g')) || []).length;
    return Math.min(5, Math.round(mentions / lines * 100));
  }
}

module.exports = UsageAnalytics;
