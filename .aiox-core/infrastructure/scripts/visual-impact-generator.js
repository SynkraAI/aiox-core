const fs = require('fs').promises;
const path = require('path');
const chalk = require('chalk');

/**
 * Visual impact generator for Synkra AIOX framework
 * Creates visual representations of impact analysis results
 */
class VisualImpactGenerator {
  constructor(options = {}) {
    this.rootPath = options.rootPath || process.cwd();
    this.visualCache = new Map();
    this.generationHistory = [];
    this.visualTemplates = new Map();
    this.initializeTemplates();
  }

  /**
   * Initialize visual templates
   */
  initializeTemplates() {
    // ASCII graph templates for different visualization types
    this.visualTemplates.set('impact_tree', {
      root: '📦',
      branch: '├──',
      lastBranch: '└──',
      vertical: '│',
      horizontal: '─',
      riskLevels: {
        critical: '🔴',
        high: '🟠', 
        medium: '🟡',
        low: '🟢',
      },
    });

    this.visualTemplates.set('dependency_graph', {
      target: '🎯',
      component: '📄',
      agent: '🤖',
      workflow: '🔄',
      task: '⚡',
      util: '🔧',
      connection: '→',
      impact: {
        critical: '‼️',
        high: '❗',
        medium: '⚠️',
        low: 'ℹ️',
      },
    });
  }

  /**
   * Generate comprehensive impact visualization
   */
  async generateImpactVisualization(impactReport, options = {}) {
    const visualId = `visual-${Date.now()}`;
    
    try {
      console.log(chalk.blue('🎨 Generating visual impact representation...'));
      
      const config = {
        format: options.format || 'visual',
        includeInteractive: options.includeInteractive || false,
        maxNodes: options.maxNodes || 50,
        showDetails: options.showDetails !== false,
        colorScheme: options.colorScheme || 'default',
        ...options,
      };

      const visualization = {
        visualId: visualId,
        format: config.format,
        timestamp: new Date().toISOString(),
      };

      // Generate different visualization types based on format
      switch (config.format) {
        case 'visual':
        case 'ascii':
          visualization.asciiGraph = await this.generateAsciiVisualization(impactReport, config);
          break;
        case 'html':
          visualization.htmlContent = await this.generateHtmlVisualization(impactReport, config);
          visualization.asciiGraph = await this.generateAsciiVisualization(impactReport, config);
          break;
        case 'json':
          visualization.jsonData = await this.generateJsonVisualization(impactReport, config);
          break;
        default:
          visualization.asciiGraph = await this.generateAsciiVisualization(impactReport, config);
      }

      // Generate impact summary
      visualization.impactSummary = this.generateImpactSummary(impactReport);
      
      // Generate component relationship map
      visualization.relationshipMap = await this.generateRelationshipMap(impactReport, config);
      
      // Generate risk heatmap
      visualization.riskHeatmap = this.generateRiskHeatmap(impactReport, config);

      // Cache the visualization
      this.visualCache.set(visualId, visualization);
      
      // Add to generation history
      this.generationHistory.push({
        visualId: visualId,
        targetComponent: impactReport.targetComponent.path,
        format: config.format,
        componentsVisualized: impactReport.dependencyAnalysis.affectedComponents.length,
        timestamp: visualization.timestamp,
      });

      console.log(chalk.green('✅ Visual impact representation generated'));
      console.log(chalk.gray(`   Format: ${config.format}`));
      console.log(chalk.gray(`   Components visualized: ${impactReport.dependencyAnalysis.affectedComponents.length}`));

      return visualization;

    } catch (error) {
      console.error(chalk.red(`Visual generation failed: ${error.message}`));
      throw error;
    }
  }

  /**
   * Generate ASCII-based visualization
   */
  async generateAsciiVisualization(impactReport, config) {
    const lines = [];
    const template = this.visualTemplates.get('impact_tree');
    
    // Header
    lines.push('');
    lines.push('📊 IMPACT ANALYSIS VISUALIZATION');
    lines.push('═'.repeat(50));
    lines.push('');

    // Target component
    const targetIcon = this.getComponentIcon(impactReport.targetComponent.type);
    const riskIcon = template.riskLevels[impactReport.riskAssessment.overallRisk] || '⚪';
    
    lines.push(`${targetIcon} Target Component: ${impactReport.targetComponent.path}`);
    lines.push(`${riskIcon} Risk Level: ${impactReport.riskAssessment.overallRisk.toUpperCase()}`);
    lines.push(`🔄 Modification: ${impactReport.modificationType}`);
    lines.push('');

    // Impact summary
    lines.push('📈 IMPACT SUMMARY');
    lines.push('─'.repeat(30));
    const summary = impactReport.summary;
    lines.push(`Affected Components: ${summary.affectedComponents}`);
    lines.push(`Propagation Depth: ${summary.propagationDepth}`);
    lines.push(`Critical Issues: ${summary.criticalIssues}`);
    lines.push('');

    // Dependency tree
    if (impactReport.dependencyAnalysis.affectedComponents.length > 0) {
      lines.push('🌳 DEPENDENCY IMPACT TREE');
      lines.push('─'.repeat(30));
      
      const dependencyTree = this.buildDependencyTree(impactReport.dependencyAnalysis.affectedComponents);
      const treeLines = this.renderDependencyTree(dependencyTree, config);
      lines.push(...treeLines);
      lines.push('');
    }

    // Risk breakdown
    if (impactReport.riskAssessment.riskFactors.length > 0) {
      lines.push('⚠️  RISK BREAKDOWN');
      lines.push('─'.repeat(30));
      
      impactReport.riskAssessment.riskFactors.slice(0, 8).forEach(factor => {
        const riskIcon = this.getRiskIcon(factor.severity);
        lines.push(`${riskIcon} ${factor.category}: ${factor.description}`);
        if (factor.factors.length > 0) {
          factor.factors.slice(0, 2).forEach(f => {
            lines.push(`   • ${f}`);
          });
        }
      });
      lines.push('');
    }

    // Propagation paths
    if (impactReport.propagationAnalysis.criticalPaths?.length > 0) {
      lines.push('🛤️  CRITICAL PROPAGATION PATHS');
      lines.push('─'.repeat(30));
      
      impactReport.propagationAnalysis.criticalPaths.slice(0, 3).forEach((path, index) => {
        lines.push(`Path ${index + 1}: Impact ${path.totalImpact}/10, Depth ${path.maxDepth}`);
        if (path.effects && path.effects.length > 0) {
          path.effects.slice(0, 3).forEach(effect => {
            const componentIcon = this.getComponentIcon(effect.affectedComponentType);
            lines.push(`  ${componentIcon} ${effect.affectedComponent}`);
          });
        }
        lines.push('');
      });
    }

    // Recommendations
    if (impactReport.riskAssessment.recommendations.length > 0) {
      lines.push('💡 KEY RECOMMENDATIONS');
      lines.push('─'.repeat(30));
      
      impactReport.riskAssessment.recommendations.slice(0, 5).forEach((rec, index) => {
        const priorityIcon = this.getPriorityIcon(rec.priority);
        lines.push(`${priorityIcon} ${index + 1}. ${rec.title}`);
        lines.push(`   ${rec.description}`);
        lines.push('');
      });
    }

    // Footer
    lines.push('═'.repeat(50));
    lines.push(`Generated: ${new Date().toLocaleString()}`);
    lines.push('');

    return lines.join('\n');
  }

  /**
   * Generate HTML visualization
   */
  async generateHtmlVisualization(impactReport, config) {
    const htmlTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Impact Analysis - ${impactReport.targetComponent.path}</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f5f7fa;
            color: #333;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 2.5em;
            font-weight: 300;
        }
        .header .subtitle {
            margin: 10px 0 0 0;
            opacity: 0.9;
            font-size: 1.1em;
        }
        .risk-badge {
            display: inline-block;
            padding: 8px 16px;
            border-radius: 20px;
            font-weight: bold;
            margin: 10px 5px 0 5px;
            font-size: 0.9em;
        }
        .risk-low { background-color: #d4edda; color: #155724; }
        .risk-medium { background-color: #fff3cd; color: #856404; }
        .risk-high { background-color: #f8d7da; color: #721c24; }
        .risk-critical { background-color: #721c24; color: white; }
        .content {
            padding: 30px;
        }
        .section {
            margin-bottom: 40px;
        }
        .section h2 {
            color: #4a5568;
            border-bottom: 2px solid #e2e8f0;
            padding-bottom: 10px;
            margin-bottom: 20px;
        }
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        .stat-card {
            background: #f7fafc;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
            border-left: 4px solid #667eea;
        }
        .stat-card .number {
            font-size: 2em;
            font-weight: bold;
            color: #667eea;
            margin-bottom: 5px;
        }
        .stat-card .label {
            color: #718096;
            font-size: 0.9em;
        }
        .component-list {
            max-height: 400px;
            overflow-y: auto;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
        }
        .component-item {
            padding: 15px;
            border-bottom: 1px solid #e2e8f0;
            display: flex;
            align-items: center;
            justify-content: space-between;
            transition: background-color 0.2s;
        }
        .component-item:hover {
            background-color: #f7fafc;
        }
        .component-item:last-child {
            border-bottom: none;
        }
        .component-info {
            flex: 1;
        }
        .component-name {
            font-weight: 600;
            color: #2d3748;
            margin-bottom: 5px;
        }
        .component-description {
            color: #718096;
            font-size: 0.9em;
        }
        .impact-score {
            background: #667eea;
            color: white;
            padding: 4px 12px;
            border-radius: 20px;
            font-weight: bold;
            font-size: 0.8em;
        }
        .recommendations {
            background: #f0fff4;
            border-left: 4px solid #38a169;
            padding: 20px;
            border-radius: 0 8px 8px 0;
        }
        .recommendation {
            margin-bottom: 15px;
            padding-bottom: 15px;
            border-bottom: 1px solid #c6f6d5;
        }
        .recommendation:last-child {
            margin-bottom: 0;
            padding-bottom: 0;
            border-bottom: none;
        }
        .recommendation-title {
            font-weight: 600;
            color: #2f855a;
            margin-bottom: 5px;
        }
        .recommendation-desc {
            color: #276749;
            font-size: 0.95em;
        }
        .risk-factors {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 15px;
        }
        .risk-factor {
            background: white;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 15px;
        }
        .risk-factor-header {
            display: flex;
            align-items: center;
            justify-content: between;
            margin-bottom: 10px;
        }
        .risk-factor-name {
            font-weight: 600;
            color: #2d3748;
        }
        .risk-factor-score {
            background: #fed7d7;
            color: #c53030;
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 0.8em;
            font-weight: bold;
            margin-left: auto;
        }
        .risk-factor-desc {
            color: #718096;
            font-size: 0.9em;
            margin-bottom: 10px;
        }
        .risk-factor-list {
            list-style: none;
            padding: 0;
            margin: 0;
        }
        .risk-factor-list li {
            color: #4a5568;
            font-size: 0.85em;
            margin-bottom: 5px;
            padding-left: 15px;
            position: relative;
        }
        .risk-factor-list li:before {
            content: "•";
            color: #e53e3e;
            position: absolute;
            left: 0;
        }
        .footer {
            background: #f7fafc;
            padding: 20px 30px;
            text-align: center;
            color: #718096;
            font-size: 0.9em;
        }
        ${config.includeInteractive ? this.getInteractiveStyles() : ''}
    </style>
    ${config.includeInteractive ? this.getInteractiveScripts() : ''}
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Impact Analysis Report</h1>
            <div class="subtitle">${impactReport.targetComponent.path}</div>
            <div class="risk-badge risk-${impactReport.riskAssessment.overallRisk}">
                ${impactReport.riskAssessment.overallRisk.toUpperCase()} RISK
            </div>
            <div class="risk-badge" style="background-color: #4299e1; color: white;">
                ${impactReport.modificationType.toUpperCase()}
            </div>
        </div>

        <div class="content">
            <div class="section">
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="number">${impactReport.summary.affectedComponents}</div>
                        <div class="label">Affected Components</div>
                    </div>
                    <div class="stat-card">
                        <div class="number">${impactReport.summary.propagationDepth}</div>
                        <div class="label">Propagation Depth</div>
                    </div>
                    <div class="stat-card">
                        <div class="number">${impactReport.summary.criticalIssues}</div>
                        <div class="label">Critical Issues</div>
                    </div>
                    <div class="stat-card">
                        <div class="number">${impactReport.riskAssessment.riskScore.toFixed(1)}</div>
                        <div class="label">Risk Score</div>
                    </div>
                </div>
            </div>

            <div class="section">
                <h2>🔗 Affected Components</h2>
                <div class="component-list">
                    ${this.generateComponentListHtml(impactReport.dependencyAnalysis.affectedComponents)}
                </div>
            </div>

            <div class="section">
                <h2>⚠️ Risk Factors</h2>
                <div class="risk-factors">
                    ${this.generateRiskFactorsHtml(impactReport.riskAssessment.riskFactors)}
                </div>
            </div>

            <div class="section">
                <h2>💡 Recommendations</h2>
                <div class="recommendations">
                    ${this.generateRecommendationsHtml(impactReport.riskAssessment.recommendations)}
                </div>
            </div>
        </div>

        <div class="footer">
            Generated on ${new Date().toLocaleString()} | Synkra AIOX Impact Analysis
        </div>
    </div>
</body>
</html>`;

    return htmlTemplate;
  }

  /**
   * Generate JSON visualization data
   */
  async generateJsonVisualization(impactReport, config) {
    return {
      metadata: {
        visualizationType: 'impact_analysis',
        targetComponent: impactReport.targetComponent,
        generatedAt: new Date().toISOString(),
        riskLevel: impactReport.riskAssessment.overallRisk,
      },
      nodes: this.generateNodes(impactReport),
      edges: this.generateEdges(impactReport), 
      clusters: this.generateClusters(impactReport),
      riskHeatmap: this.generateRiskHeatmap(impactReport, config),
      timeline: this.generateTimelineData(impactReport),
    };
  }

  /**
   * Generate impact summary visualization
   */
  generateImpactSummary(impactReport) {
    return {
      target: {
        name: impactReport.targetComponent.path,
        type: impactReport.targetComponent.type,
        modification: impactReport.modificationType,
      },
      metrics: {
        overall_risk: impactReport.riskAssessment.overallRisk,
        risk_score: impactReport.riskAssessment.riskScore,
        affected_components: impactReport.summary.affectedComponents,
        propagation_depth: impactReport.summary.propagationDepth,
        critical_issues: impactReport.summary.criticalIssues,
      },
      distribution: {
        risk_levels: this.calculateRiskDistribution(impactReport),
        component_types: this.calculateComponentTypeDistribution(impactReport),
        impact_categories: this.calculateImpactCategoryDistribution(impactReport),
      },
    };
  }

  /**
   * Generate component relationship map
   */
  async generateRelationshipMap(impactReport, config) {
    const map = {
      target: impactReport.targetComponent.path,
      relationships: [],
      clusters: [],
    };

    // Direct relationships
    impactReport.dependencyAnalysis.affectedComponents.forEach(component => {
      map.relationships.push({
        source: impactReport.targetComponent.path,
        target: component.path,
        type: component.dependencyType || 'dependency',
        impact: component.impactScore,
        risk: component.severity,
      });
    });

    // Propagation relationships
    if (impactReport.propagationAnalysis.directEffects) {
      impactReport.propagationAnalysis.directEffects.forEach(effect => {
        map.relationships.push({
          source: effect.targetComponent,
          target: effect.affectedComponent,
          type: 'propagation',
          impact: effect.impact,
          confidence: effect.confidence,
        });
      });
    }

    // Component type clusters
    const typeGroups = {};
    impactReport.dependencyAnalysis.affectedComponents.forEach(component => {
      if (!typeGroups[component.type]) {
        typeGroups[component.type] = [];
      }
      typeGroups[component.type].push(component.path);
    });

    Object.entries(typeGroups).forEach(([type, components]) => {
      map.clusters.push({
        id: `cluster_${type}`,
        type: type,
        components: components,
        size: components.length,
      });
    });

    return map;
  }

  /**
   * Generate risk heatmap
   */
  generateRiskHeatmap(impactReport, config) {
    const heatmap = {
      dimensions: [],
      components: [],
      riskMatrix: [],
    };

    // Risk dimensions from risk assessment
    if (impactReport.riskAssessment.riskDimensions) {
      Object.entries(impactReport.riskAssessment.riskDimensions).forEach(([dimension, data]) => {
        heatmap.dimensions.push({
          name: dimension,
          score: data.score,
          severity: data.severity,
          description: data.description,
        });
      });
    }

    // Component risk scores
    impactReport.dependencyAnalysis.affectedComponents.slice(0, 20).forEach(component => {
      heatmap.components.push({
        name: component.path,
        type: component.type,
        impactScore: component.impactScore,
        severity: component.severity,
        riskLevel: this.scoresToRiskLevel(component.impactScore),
      });
    });

    // Risk matrix (dimensions vs components)
    heatmap.riskMatrix = this.calculateRiskMatrix(impactReport);

    return heatmap;
  }

  // Helper methods for visualization generation

  buildDependencyTree(affectedComponents) {
    const tree = { name: 'Impact Tree', children: [] };
    
    // Group by impact level
    const byImpact = {
      critical: affectedComponents.filter(c => c.impactScore >= 9),
      high: affectedComponents.filter(c => c.impactScore >= 7 && c.impactScore < 9),
      medium: affectedComponents.filter(c => c.impactScore >= 4 && c.impactScore < 7),
      low: affectedComponents.filter(c => c.impactScore < 4),
    };

    Object.entries(byImpact).forEach(([level, components]) => {
      if (components.length > 0) {
        const levelNode = {
          name: `${level.toUpperCase()} Impact (${components.length})`,
          level: level,
          children: components.slice(0, 10).map(c => ({
            name: c.path,
            type: c.type,
            score: c.impactScore,
            reason: c.reason,
          })),
        };
        tree.children.push(levelNode);
      }
    });

    return tree;
  }

  renderDependencyTree(tree, config, depth = 0, isLast = true) {
    const lines = [];
    const template = this.visualTemplates.get('impact_tree');
    const indent = '  '.repeat(depth);
    const connector = isLast ? template.lastBranch : template.branch;
    
    if (depth === 0) {
      lines.push(`${template.root} ${tree.name}`);
    } else {
      const icon = tree.level ? this.getRiskIcon(tree.level) : this.getComponentIcon(tree.type);
      const scoreText = tree.score ? ` (${tree.score}/10)` : '';
      lines.push(`${indent}${connector} ${icon} ${tree.name}${scoreText}`);
    }

    if (tree.children) {
      tree.children.forEach((child, index) => {
        const childIsLast = index === tree.children.length - 1;
        const childLines = this.renderDependencyTree(child, config, depth + 1, childIsLast);
        lines.push(...childLines);
      });
    }

    return lines;
  }

  generateComponentListHtml(components) {
    return components.slice(0, 20).map(component => `
      <div class="component-item">
        <div class="component-info">
          <div class="component-name">${this.getComponentIcon(component.type)} ${component.path}</div>
          <div class="component-description">${component.reason || 'Dependency impact'}</div>
        </div>
        <div class="impact-score">${component.impactScore}/10</div>
      </div>
    `).join('');
  }

  generateRiskFactorsHtml(riskFactors) {
    return riskFactors.slice(0, 8).map(factor => `
      <div class="risk-factor">
        <div class="risk-factor-header">
          <div class="risk-factor-name">${factor.category}</div>
          <div class="risk-factor-score">${factor.score}/10</div>
        </div>
        <div class="risk-factor-desc">${factor.description}</div>
        <ul class="risk-factor-list">
          ${factor.factors.slice(0, 3).map(f => `<li>${f}</li>`).join('')}
        </ul>
      </div>
    `).join('');
  }

  generateRecommendationsHtml(recommendations) {
    return recommendations.slice(0, 6).map(rec => `
      <div class="recommendation">
        <div class="recommendation-title">${this.getPriorityIcon(rec.priority)} ${rec.title}</div>
        <div class="recommendation-desc">${rec.description}</div>
      </div>
    `).join('');
  }

  generateNodes(impactReport) {
    const nodes = [];
    
    // Target node
    nodes.push({
      id: impactReport.targetComponent.path,
      type: 'target',
      componentType: impactReport.targetComponent.type,
      label: impactReport.targetComponent.path,
      risk: impactReport.riskAssessment.overallRisk,
      modification: impactReport.modificationType,
    });

    // Affected component nodes
    impactReport.dependencyAnalysis.affectedComponents.forEach(component => {
      nodes.push({
        id: component.path,
        type: 'affected',
        componentType: component.type,
        label: component.path,
        impact: component.impactScore,
        severity: component.severity,
        reason: component.reason,
      });
    });

    return nodes;
  }

  generateEdges(impactReport) {
    const edges = [];
    
    // Dependency edges
    impactReport.dependencyAnalysis.affectedComponents.forEach(component => {
      edges.push({
        source: impactReport.targetComponent.path,
        target: component.path,
        type: 'dependency',
        impact: component.impactScore,
        dependencyType: component.dependencyType,
      });
    });

    // Propagation edges
    if (impactReport.propagationAnalysis.directEffects) {
      impactReport.propagationAnalysis.directEffects.forEach(effect => {
        edges.push({
          source: effect.targetComponent,
          target: effect.affectedComponent,
          type: 'propagation',
          impact: effect.impact,
          confidence: effect.confidence,
        });
      });
    }

    return edges;
  }

  generateClusters(impactReport) {
    const clusters = [];
    
    // Group by component type
    const typeGroups = {};
    impactReport.dependencyAnalysis.affectedComponents.forEach(component => {
      if (!typeGroups[component.type]) {
        typeGroups[component.type] = [];
      }
      typeGroups[component.type].push(component.path);
    });

    Object.entries(typeGroups).forEach(([type, components]) => {
      clusters.push({
        id: type,
        label: `${type} components`,
        nodes: components,
        color: this.getTypeColor(type),
      });
    });

    return clusters;
  }

  generateTimelineData(impactReport) {
    const timeline = [];
    
    if (impactReport.riskAssessment.riskProjection?.risk_timeline) {
      impactReport.riskAssessment.riskProjection.risk_timeline.forEach(event => {
        timeline.push({
          time: event.time,
          event: event.event,
          riskLevel: event.risk_level,
          description: `Risk level: ${event.risk_level}/10`,
        });
      });
    }

    return timeline;
  }

  // Icon and color helper methods

  getComponentIcon(type) {
    const icons = {
      agent: '🤖',
      workflow: '🔄',
      task: '⚡',
      util: '🔧',
      unknown: '📄',
    };
    return icons[type] || icons.unknown;
  }

  getRiskIcon(severity) {
    const icons = {
      critical: '🔴',
      high: '🟠',
      medium: '🟡',
      low: '🟢',
    };
    return icons[severity] || '⚪';
  }

  getPriorityIcon(priority) {
    const icons = {
      critical: '🚨',
      high: '⚠️',
      medium: '📋',
      low: 'ℹ️',
    };
    return icons[priority] || '📋';
  }

  getTypeColor(type) {
    const colors = {
      agent: '#4299e1',
      workflow: '#48bb78',
      task: '#ed8936',
      util: '#9f7aea',
      unknown: '#718096',
    };
    return colors[type] || colors.unknown;
  }

  scoresToRiskLevel(score) {
    if (score >= 9) return 'critical';
    if (score >= 7) return 'high';
    if (score >= 4) return 'medium';
    return 'low';
  }

  // Distribution calculation helpers

  calculateRiskDistribution(impactReport) {
    const distribution = { low: 0, medium: 0, high: 0, critical: 0 };
    
    impactReport.dependencyAnalysis.affectedComponents.forEach(component => {
      const riskLevel = this.scoresToRiskLevel(component.impactScore);
      distribution[riskLevel]++;
    });

    return distribution;
  }

  calculateComponentTypeDistribution(impactReport) {
    const distribution = {};
    
    impactReport.dependencyAnalysis.affectedComponents.forEach(component => {
      distribution[component.type] = (distribution[component.type] || 0) + 1;
    });

    return distribution;
  }

  calculateImpactCategoryDistribution(impactReport) {
    const categories = impactReport.dependencyAnalysis.impactCategories || {};
    return {
      critical: categories.critical?.length || 0,
      high: categories.high?.length || 0,
      medium: categories.medium?.length || 0,
      low: categories.low?.length || 0,
    };
  }

  calculateRiskMatrix(impactReport) {
    // Simple risk matrix implementation
    const matrix = [];
    const dimensions = Object.keys(impactReport.riskAssessment.riskDimensions || {});
    const components = impactReport.dependencyAnalysis.affectedComponents.slice(0, 10);

    components.forEach(component => {
      const row = {
        component: component.path,
        scores: {},
      };
      
      dimensions.forEach(dimension => {
        // Simplified calculation - in practice would be more sophisticated
        row.scores[dimension] = Math.min(10, component.impactScore + Math.random() * 2);
      });
      
      matrix.push(row);
    });

    return matrix;
  }

  getInteractiveStyles() {
    return `
      .interactive-controls {
        background: #f7fafc;
        padding: 20px;
        margin: 20px 0;
        border-radius: 8px;
        border: 1px solid #e2e8f0;
      }
      .filter-button {
        background: #667eea;
        color: white;
        border: none;
        padding: 8px 16px;
        border-radius: 4px;
        margin: 5px;
        cursor: pointer;
        transition: background-color 0.2s;
      }
      .filter-button:hover {
        background: #5a67d8;
      }
      .filter-button.active {
        background: #4c51bf;
      }
    `;
  }

  getInteractiveScripts() {
    return `
      <script>
        // Interactive filtering and visualization controls
        function filterComponents(riskLevel) {
          const components = document.querySelectorAll('.component-item');
          components.forEach(item => {
            const score = parseInt(item.querySelector('.impact-score').textContent);
            const shouldShow = riskLevel === 'all' || 
              (riskLevel === 'critical' && score >= 9) ||
              (riskLevel === 'high' && score >= 7 && score < 9) ||
              (riskLevel === 'medium' && score >= 4 && score < 7) ||
              (riskLevel === 'low' && score < 4);
            
            item.style.display = shouldShow ? 'flex' : 'none';
          });
          
          // Update filter button states
          document.querySelectorAll('.filter-button').forEach(btn => {
            btn.classList.remove('active');
          });
          document.querySelector(\`[data-filter="\${riskLevel}"]\`).classList.add('active');
        }
        
        // Add filter controls
        document.addEventListener('DOMContentLoaded', function() {
          const componentSection = document.querySelector('.component-list').parentNode;
          const controls = document.createElement('div');
          controls.className = 'interactive-controls';
          controls.innerHTML = \`
            <strong>Filter by Risk Level:</strong>
            <button class="filter-button active" data-filter="all" onclick="filterComponents('all')">All</button>
            <button class="filter-button" data-filter="critical" onclick="filterComponents('critical')">Critical</button>
            <button class="filter-button" data-filter="high" onclick="filterComponents('high')">High</button>
            <button class="filter-button" data-filter="medium" onclick="filterComponents('medium')">Medium</button>
            <button class="filter-button" data-filter="low" onclick="filterComponents('low')">Low</button>
          \`;
          componentSection.insertBefore(controls, document.querySelector('.component-list'));
        });
      </script>
    `;
  }

  /**
   * Get cached visualization
   */
  getCachedVisualization(visualId) {
    return this.visualCache.get(visualId);
  }

  /**
   * Clear visualization cache
   */
  clearCache() {
    this.visualCache.clear();
    console.log(chalk.gray('Visual impact generator cache cleared'));
  }

  /**
   * Get generation statistics
   */
  getGenerationStats() {
    return {
      total_visualizations: this.generationHistory.length,
      cached_visualizations: this.visualCache.size,
      format_distribution: this.calculateFormatDistribution(),
      recent_generations: this.generationHistory.slice(-10),
    };
  }

  calculateFormatDistribution() {
    const distribution = {};
    this.generationHistory.forEach(gen => {
      distribution[gen.format] = (distribution[gen.format] || 0) + 1;
    });
    return distribution;
  }
}

module.exports = VisualImpactGenerator;