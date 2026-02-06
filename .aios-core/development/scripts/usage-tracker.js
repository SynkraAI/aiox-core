const fs = require('fs').promises;
const path = require('path');
const chalk = require('chalk');

/**
 * Usage tracker for AIOS-FULLSTACK framework components
 * Tracks component usage patterns for deprecation warnings and impact analysis
 */
class UsageTracker {
  constructor(options = {}) {
    this.rootPath = options.rootPath || process.cwd();
    this.usageDir = path.join(this.rootPath, '.aios', 'usage');
    this.usageCache = new Map();
    this.scanPatterns = this.initializeScanPatterns();
  }

  /**
   * Initialize usage tracker
   */
  async initialize() {
    try {
      // Create usage directory
      await fs.mkdir(this.usageDir, { recursive: true });

      console.log(chalk.green('✅ Usage tracker initialized'));
      return true;

    } catch (_error) {
      console.error(chalk.red(`Failed to initialize usage tracker: ${error.message}`));
      throw error;
    }
  }

  /**
   * Analyze component usage across the codebase
   */
  async analyzeComponentUsage(componentId, options = {}) {
    const analysis = {
      component_id: componentId,
      analysis_timestamp: new Date().toISOString(),
      total_references: 0,
      usage_locations: [],
      dependent_components: [],
      external_references: [],
      usage_patterns: {},
      risk_assessment: {
        impact_level: 'low',
        affected_areas: [],
        migration_complexity: 'simple'
      }
    };

    try {
      console.log(chalk.blue(`🔍 Analyzing usage for component: ${componentId}`));

      // Get component information
      const component = await this.getComponentInfo(componentId);
      if (!component) {
        throw new Error(`Component not found: ${componentId}`);
      }

      // Scan for direct references
      const directReferences = await this.scanForDirectReferences(component, options);
      analysis.usage_locations = directReferences;
      analysis.total_references = directReferences.length;

      // Analyze dependency relationships
      const dependencies = await this.analyzeDependencyRelationships(component, options);
      analysis.dependent_components = dependencies;

      // Check for external references (imports, configurations, etc.)
      const externalRefs = await this.scanForExternalReferences(component, options);
      analysis.external_references = externalRefs;

      // Analyze usage patterns
      analysis.usage_patterns = await this.analyzeUsagePatterns(component, directReferences);

      // Assess migration risk
      analysis.risk_assessment = this.assessMigrationRisk(analysis);

      // Cache results
      this.usageCache.set(componentId, analysis);

      // Save detailed analysis
      await this.saveUsageAnalysis(analysis);

      console.log(chalk.green(`✅ Usage analysis completed for ${componentId}`));
      console.log(chalk.gray(`   Total references: ${analysis.total_references}`));
      console.log(chalk.gray(`   Dependent components: ${analysis.dependent_components.length}`));
      console.log(chalk.gray(`   Impact level: ${analysis.risk_assessment.impact_level}`));

      return analysis;

    } catch (_error) {
      console.error(chalk.red(`Usage analysis failed for ${componentId}: ${error.message}`));
      throw error;
    }
  }

  /**
   * Track usage changes over time for deprecated components
   */
  async trackUsageChanges(componentId, baselineAnalysis) {
    const currentAnalysis = await this.analyzeComponentUsage(componentId);
    
    const changes = {
      component_id: componentId,
      comparison_timestamp: new Date().toISOString(),
      baseline_timestamp: baselineAnalysis.analysis_timestamp,
      changes: {
        total_references: {
          before: baselineAnalysis.total_references,
          after: currentAnalysis.total_references,
          change: currentAnalysis.total_references - baselineAnalysis.total_references
        },
        dependent_components: {
          before: baselineAnalysis.dependent_components.length,
          after: currentAnalysis.dependent_components.length,
          change: currentAnalysis.dependent_components.length - baselineAnalysis.dependent_components.length
        },
        new_usages: this.findNewUsages(baselineAnalysis.usage_locations, currentAnalysis.usage_locations),
        removed_usages: this.findRemovedUsages(baselineAnalysis.usage_locations, currentAnalysis.usage_locations)
      },
      trend: this.calculateUsageTrend(baselineAnalysis, currentAnalysis),
      migration_progress: this.calculateMigrationProgress(baselineAnalysis, currentAnalysis)
    };

    // Save change tracking
    await this.saveUsageChanges(changes);

    return changes;
  }

  /**
   * Generate usage warnings for deprecated components
   */
  async generateUsageWarnings(componentId, deprecationInfo) {
    const analysis = await this.analyzeComponentUsage(componentId);
    const warnings = [];

    for (const _usage of analysis.usage_locations) {
      const warning = {
        type: 'deprecation_warning',
        component_id: componentId,
        usage_location: {
          file: usage.file,
          line: usage.line,
          context: usage.context
        },
        message: this.generateWarningMessage(componentId, deprecationInfo, usage),
        severity: this.calculateWarningSeverity(deprecationInfo, usage),
        suggested_actions: this.generateSuggestedActions(componentId, deprecationInfo, usage)
      };

      warnings.push(warning);
    }

    // Save warnings for later processing
    await this.saveUsageWarnings(componentId, warnings);

    return warnings;
  }

  /**
   * Get usage statistics for reporting
   */
  async getUsageStatistics(componentIds = null) {
    const stats = {
      generated_at: new Date().toISOString(),
      total_components_analyzed: 0,
      high_usage_components: [],
      zero_usage_components: [],
      usage_distribution: {},
      dependency_graph: {}
    };

    const componentsToAnalyze = componentIds || await this.getAllTrackedComponents();
    
    for (const componentId of componentsToAnalyze) {
      try {
        const analysis = await this.getOrAnalyzeUsage(componentId);
        stats.total_components_analyzed++;

        // Categorize by usage level
        if (analysis.total_references === 0) {
          stats.zero_usage_components.push(componentId);
        } else if (analysis.total_references >= 10) {
          stats.high_usage_components.push({
            component_id: componentId,
            reference_count: analysis.total_references,
            impact_level: analysis.risk_assessment.impact_level
          });
        }

        // Add to usage distribution
        const usageRange = this.categorizeUsageLevel(analysis.total_references);
        stats.usage_distribution[usageRange] = (stats.usage_distribution[usageRange] || 0) + 1;

        // Add to dependency graph
        stats.dependency_graph[componentId] = analysis.dependent_components.map(dep => dep.component_id);

      } catch (_error) {
        console.warn(chalk.yellow(`Failed to analyze usage for ${componentId}: ${error.message}`));
      }
    }

    return stats;
  }

  /**
   * Scan for direct references to a component
   */
  async scanForDirectReferences(component, options = {}) {
    const references = [];
    const scanPaths = await this.getScanPaths(_options);

    for (const scanPath of scanPaths) {
      try {
        const pathReferences = await this.scanPath(scanPath, component);
        references.push(...pathReferences);
      } catch (_error) {
        console.warn(chalk.yellow(`Failed to scan path ${scanPath}: ${error.message}`));
      }
    }

    return references;
  }

  /**
   * Scan a specific path for component references
   */
  async scanPath(scanPath, component) {
    const references = [];
    const files = await this.getFilesToScan(scanPath);

    for (const file of files) {
      try {
        const fileReferences = await this.scanFile(file, component);
        references.push(...fileReferences);
      } catch (_error) {
        // Skip files that can't be read
        continue;
      }
    }

    return references;
  }

  /**
   * Scan a single file for component references
   */
  async scanFile(filePath, component) {
    const references = [];
    
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const lines = content.split('\n');

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const lineNumber = i + 1;

        // Check for various reference patterns
        const matches = this.findReferencesInLine(line, component);
        
        for (const match of matches) {
          references.push({
            file: filePath,
            line: lineNumber,
            column: match.column,
            context: line.trim(),
            reference_type: match.type,
            match_text: match.text
          });
        }
      }
    } catch (_error) {
      // File couldn't be read, skip
    }

    return references;
  }

  /**
   * Find references in a single line of code
   */
  findReferencesInLine(line, component) {
    const matches = [];
    const patterns = this.scanPatterns[component.type] || this.scanPatterns.default;

    for (const pattern of patterns) {
      const regex = new RegExp(pattern.pattern.replace('{component_name}', component.name), pattern.flags || 'gi');
      let match;

      while ((match = regex.exec(line)) !== null) {
        matches.push({
          type: pattern.type,
          text: match[0],
          column: match.index,
          confidence: pattern.confidence || 0.8
        });
      }
    }

    return matches;
  }

  /**
   * Analyze dependency relationships
   */
  async analyzeDependencyRelationships(component, options = {}) {
    const dependencies = [];
    
    // This would analyze manifest files, import statements, etc.
    // For now, return empty array as placeholder
    
    return dependencies;
  }

  /**
   * Scan for external references (config files, documentation, etc.)
   */
  async scanForExternalReferences(component, options = {}) {
    const externalRefs = [];
    
    // Check configuration files
    const configRefs = await this.scanConfigurationFiles(component);
    externalRefs.push(...configRefs);

    // Check documentation
    const docRefs = await this.scanDocumentationFiles(component);
    externalRefs.push(...docRefs);

    return externalRefs;
  }

  /**
   * Analyze usage patterns
   */
  async analyzeUsagePatterns(component, references) {
    const patterns = {
      by_file_type: {},
      by_usage_type: {},
      temporal_distribution: {},
      complexity_indicators: {}
    };

    for (const ref of references) {
      // Group by file extension
      const ext = path.extname(ref.file);
      patterns.by_file_type[ext] = (patterns.by_file_type[ext] || 0) + 1;

      // Group by reference type
      patterns.by_usage_type[ref.reference_type] = (patterns.by_usage_type[ref.reference_type] || 0) + 1;
    }

    return patterns;
  }

  /**
   * Assess migration risk based on usage analysis
   */
  assessMigrationRisk(analysis) {
    let impactLevel = 'low';
    let migrationComplexity = 'simple';
    const affectedAreas = [];

    // Assess based on total references
    if (analysis.total_references > 20) {
      impactLevel = 'high';
      migrationComplexity = 'complex';
    } else if (analysis.total_references > 10) {
      impactLevel = 'medium';
      migrationComplexity = 'moderate';
    }

    // Check for complex usage patterns
    if (analysis.dependent_components.length > 5) {
      migrationComplexity = 'complex';
      affectedAreas.push('component_dependencies');
    }

    if (analysis.external_references.length > 0) {
      affectedAreas.push('external_configuration');
    }

    return {
      impact_level: impactLevel,
      affected_areas: affectedAreas,
      migration_complexity: migrationComplexity
    };
  }

  // Helper methods

  async getComponentInfo(componentId) {
    // This would typically integrate with the component registry
    // For now, return a basic component structure
    const [type, name] = componentId.split('/');
    
    return {
      id: componentId,
      type: type,
      name: name,
      file_path: `aios-core/${type}s/${name}.md`
    };
  }

  async getScanPaths(_options) {
    const defaultPaths = [
      path.join(this.rootPath, 'aios-core'),
      path.join(this.rootPath, 'src'),
      path.join(this.rootPath, 'lib')
    ];

    if (options.scanPaths) {
      return options.scanPaths;
    }

    // Filter paths that exist
    const existingPaths = [];
    for (const scanPath of defaultPaths) {
      try {
        await fs.access(scanPath);
        existingPaths.push(scanPath);
      } catch (_error) {
        // Path doesn't exist, skip
      }
    }

    return existingPaths;
  }

  async getFilesToScan(scanPath) {
    const files = [];
    
    try {
      const entries = await fs.readdir(scanPath, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(scanPath, entry.name);
        
        if (entry.isDirectory()) {
          // Recursively scan subdirectories
          const subFiles = await this.getFilesToScan(fullPath);
          files.push(...subFiles);
        } else if (this.shouldScanFile(entry.name)) {
          files.push(fullPath);
        }
      }
    } catch (_error) {
      // Can't read directory, skip
    }

    return files;
  }

  shouldScanFile(filename) {
    const scanExtensions = ['.js', '.ts', '.md', '.yaml', '.yml', '.json'];
    const ext = path.extname(filename);
    return scanExtensions.includes(ext);
  }

  async scanConfigurationFiles(component) {
    const configRefs = [];
    const configFiles = [
      'package.json',
      '.aiosrc',
      'aios.config.js',
      'manifest.yaml'
    ];

    for (const configFile of configFiles) {
      const configPath = path.join(this.rootPath, configFile);
      
      try {
        const refs = await this.scanFile(configPath, component);
        configRefs.push(...refs.map(ref => ({ ...ref, source: 'configuration' })));
      } catch (_error) {
        // Config file doesn't exist or can't be read
      }
    }

    return configRefs;
  }

  async scanDocumentationFiles(component) {
    const docRefs = [];
    const docsPath = path.join(this.rootPath, 'docs');
    
    try {
      const files = await this.getFilesToScan(docsPath);
      
      for (const file of files) {
        const refs = await this.scanFile(file, component);
        docRefs.push(...refs.map(ref => ({ ...ref, source: 'documentation' })));
      }
    } catch (_error) {
      // Docs directory doesn't exist
    }

    return docRefs;
  }

  findNewUsages(oldUsages, newUsages) {
    return newUsages.filter(newUsage => 
      !oldUsages.some(oldUsage => 
        oldUsage.file === newUsage.file && oldUsage.line === newUsage.line
      )
    );
  }

  findRemovedUsages(oldUsages, newUsages) {
    return oldUsages.filter(oldUsage => 
      !newUsages.some(newUsage => 
        newUsage.file === oldUsage.file && newUsage.line === oldUsage.line
      )
    );
  }

  calculateUsageTrend(baseline, current) {
    const referenceChange = current.total_references - baseline.total_references;
    
    if (referenceChange > 0) return 'increasing';
    if (referenceChange < 0) return 'decreasing';
    return 'stable';
  }

  calculateMigrationProgress(baseline, current) {
    if (baseline.total_references === 0) return 1.0;
    
    const remainingUsages = current.total_references;
    const originalUsages = baseline.total_references;
    
    return Math.max(0, (originalUsages - remainingUsages) / originalUsages);
  }

  generateWarningMessage(componentId, deprecationInfo, usage) {
    let message = `DEPRECATED: ${componentId} is deprecated`;
    
    if (deprecationInfo.replacement) {
      message += ` - use ${deprecationInfo.replacement} instead`;
    }
    
    if (deprecationInfo.removalVersion) {
      message += ` (will be removed in ${deprecationInfo.removalVersion})`;
    }
    
    return message;
  }

  calculateWarningSeverity(deprecationInfo, usage) {
    if (deprecationInfo.severity === 'critical') return 'error';
    if (deprecationInfo.severity === 'high') return 'warning';
    return 'info';
  }

  generateSuggestedActions(componentId, deprecationInfo, usage) {
    const actions = [];
    
    if (deprecationInfo.replacement) {
      actions.push(`Replace with ${deprecationInfo.replacement}`);
    }
    
    if (deprecationInfo.migrationGuide) {
      actions.push(`See migration guide: ${deprecationInfo.migrationGuide}`);
    }
    
    actions.push('Update imports and references');
    actions.push('Test functionality after replacement');
    
    return actions;
  }

  categorizeUsageLevel(referenceCount) {
    if (referenceCount === 0) return 'zero';
    if (referenceCount <= 5) return 'low';
    if (referenceCount <= 15) return 'medium';
    if (referenceCount <= 30) return 'high';
    return 'very_high';
  }

  async getOrAnalyzeUsage(componentId) {
    if (this.usageCache.has(componentId)) {
      return this.usageCache.get(componentId);
    }
    
    return await this.analyzeComponentUsage(componentId);
  }

  async getAllTrackedComponents() {
    // This would typically come from a component registry
    // For now, return empty array
    return [];
  }

  async saveUsageAnalysis(analysis) {
    const filename = `usage-${analysis.component_id.replace('/', '-')}-${Date.now()}.json`;
    const filePath = path.join(this.usageDir, filename);
    
    await fs.writeFile(filePath, JSON.stringify(analysis, null, 2));
  }

  async saveUsageChanges(changes) {
    const filename = `changes-${changes.component_id.replace('/', '-')}-${Date.now()}.json`;
    const filePath = path.join(this.usageDir, filename);
    
    await fs.writeFile(filePath, JSON.stringify(changes, null, 2));
  }

  async saveUsageWarnings(componentId, warnings) {
    const filename = `warnings-${componentId.replace('/', '-')}-${Date.now()}.json`;
    const filePath = path.join(this.usageDir, filename);
    
    await fs.writeFile(filePath, JSON.stringify(warnings, null, 2));
  }

  initializeScanPatterns() {
    return {
      agent: [
        {
          pattern: 'agent:\\s*{component_name}',
          type: 'yaml_reference',
          confidence: 0.9
        },
        {
          pattern: 'use\\s+{component_name}',
          type: 'usage_statement',
          confidence: 0.8
        }
      ],
      task: [
        {
          pattern: '\\*{component_name}',
          type: 'task_invocation',
          confidence: 0.9
        },
        {
          pattern: 'require\\(.*{component_name}.*\\)',
          type: 'import_statement',
          confidence: 0.8
        }
      ],
      workflow: [
        {
          pattern: 'workflow:\\s*{component_name}',
          type: 'workflow_reference',
          confidence: 0.9
        }
      ],
      util: [
        {
          pattern: 'require\\(.*{component_name}.*\\)',
          type: 'import_statement',
          confidence: 0.9
        },
        {
          pattern: 'import.*{component_name}',
          type: 'import_statement',
          confidence: 0.9
        }
      ],
      default: [
        {
          pattern: '{component_name}',
          type: 'general_reference',
          confidence: 0.6
        }
      ]
    };
  }
}

module.exports = UsageTracker;