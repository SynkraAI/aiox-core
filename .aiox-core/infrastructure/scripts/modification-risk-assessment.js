const fs = require('fs').promises;
const path = require('path');
const chalk = require('chalk');

/**
 * Modification risk assessment for Synkra AIOX framework
 * Evaluates modification risks across multiple dimensions
 */
class ModificationRiskAssessment {
  constructor(options = {}) {
    this.rootPath = options.rootPath || process.cwd();
    this.riskFactors = new Map();
    this.riskProfiles = new Map();
    this.assessmentHistory = [];
    this.riskThresholds = {
      low: { min: 0, max: 3 },
      medium: { min: 3, max: 6 },
      high: { min: 6, max: 8 },
      critical: { min: 8, max: 10 },
    };
  }

  /**
   * Assess risks for a component modification
   */
  async assessRisks(targetComponent, analysisData, options = {}) {
    const assessmentId = `risk-${Date.now()}`;
    
    try {
      console.log(chalk.blue(`⚠️ Assessing modification risks for: ${targetComponent.path}`));
      
      const config = {
        riskThreshold: options.riskThreshold || 'medium',
        includeMitigations: options.includeMitigations !== false,
        assessmentDepth: options.assessmentDepth || 'comprehensive', 
        modificationType: options.modificationType || 'modify',
        ...options,
      };

      // Analyze risk factors across multiple dimensions
      const riskDimensions = await this.analyzeRiskDimensions(targetComponent, analysisData, config);
      
      // Calculate overall risk score
      const overallRisk = this.calculateOverallRisk(riskDimensions);
      
      // Identify critical issues
      const criticalIssues = this.identifyCriticalIssues(riskDimensions, analysisData);
      
      // Generate risk factors list
      const riskFactors = this.generateRiskFactors(riskDimensions, analysisData);
      
      // Create risk mitigation recommendations
      const recommendations = await this.generateRiskRecommendations(
        targetComponent,
        riskDimensions,
        criticalIssues,
        config,
      );
      
      // Generate risk timeline and impact projection
      const riskProjection = await this.generateRiskProjection(
        targetComponent,
        riskDimensions,
        analysisData,
        config,
      );

      const assessment = {
        assessmentId: assessmentId,
        targetComponent: {
          path: targetComponent.path,
          type: targetComponent.type,
        },
        modificationType: config.modificationType,
        overallRisk: overallRisk.level,
        riskScore: overallRisk.score,
        riskDimensions: riskDimensions,
        criticalIssues: criticalIssues,
        riskFactors: riskFactors,
        recommendations: recommendations,
        riskProjection: riskProjection,
        assessmentMetadata: {
          threshold: config.riskThreshold,
          depth: config.assessmentDepth,
          timestamp: new Date().toISOString(),
        },
      };

      // Store assessment for tracking
      this.assessmentHistory.push({
        assessmentId: assessmentId,
        componentPath: targetComponent.path,
        riskLevel: overallRisk.level,
        riskScore: overallRisk.score,
        timestamp: assessment.assessmentMetadata.timestamp,
      });

      console.log(chalk.green('✅ Risk assessment completed'));
      console.log(chalk.gray(`   Overall risk: ${this.formatRiskLevel(overallRisk.level)}`));
      console.log(chalk.gray(`   Critical issues: ${criticalIssues.length}`));
      console.log(chalk.gray(`   Recommendations: ${recommendations.length}`));

      return assessment;

    } catch (error) {
      console.error(chalk.red(`Risk assessment failed: ${error.message}`));
      throw error;
    }
  }

  /**
   * Analyze risk across multiple dimensions
   */
  async analyzeRiskDimensions(targetComponent, analysisData, config) {
    const dimensions = {
      dependency_risk: await this.assessDependencyRisk(targetComponent, analysisData.dependencyImpact),
      propagation_risk: await this.assessPropagationRisk(targetComponent, analysisData.propagationAnalysis),
      structural_risk: await this.assessStructuralRisk(targetComponent, config),
      operational_risk: await this.assessOperationalRisk(targetComponent, analysisData, config),
      security_risk: await this.assessSecurityRisk(targetComponent, config),
      compatibility_risk: await this.assessCompatibilityRisk(targetComponent, analysisData, config),
      rollback_risk: await this.assessRollbackRisk(targetComponent, config),
      testing_risk: await this.assessTestingRisk(targetComponent, analysisData),
    };

    return dimensions;
  }

  /**
   * Assess dependency-related risks
   */
  async assessDependencyRisk(targetComponent, dependencyImpact) {
    const risk = {
      score: 0,
      factors: [],
      severity: 'low',
      description: 'Risk from component dependencies and dependents',
    };

    if (!dependencyImpact) {
      risk.score = 2;
      risk.factors.push('Dependency analysis not available');
      return risk;
    }

    // High number of affected components increases risk
    const affectedCount = dependencyImpact.affectedComponents.length;
    if (affectedCount > 20) {
      risk.score += 3;
      risk.factors.push(`High number of affected components (${affectedCount})`);
    } else if (affectedCount > 10) {
      risk.score += 2;
      risk.factors.push(`Moderate number of affected components (${affectedCount})`);
    } else if (affectedCount > 5) {
      risk.score += 1;
      risk.factors.push(`Some affected components (${affectedCount})`);
    }

    // Critical and high impact components increase risk
    const criticalComponents = dependencyImpact.impactCategories?.critical?.length || 0;
    const highImpactComponents = dependencyImpact.impactCategories?.high?.length || 0;

    if (criticalComponents > 0) {
      risk.score += 3;
      risk.factors.push(`${criticalComponents} critical impact components`);
    }

    if (highImpactComponents > 0) {
      risk.score += 2;
      risk.factors.push(`${highImpactComponents} high impact components`);
    }

    // Framework core dependencies are high risk
    const frameworkCoreComponents = dependencyImpact.affectedComponents.filter(comp => 
      comp.path.includes('aiox-core') && comp.impactScore >= 7,
    ).length;

    if (frameworkCoreComponents > 0) {
      risk.score += 2;
      risk.factors.push(`${frameworkCoreComponents} framework core dependencies affected`);
    }

    risk.score = Math.min(10, risk.score);
    risk.severity = this.scoresToSeverity(risk.score);

    return risk;
  }

  /**
   * Assess change propagation risks
   */
  async assessPropagationRisk(targetComponent, propagationAnalysis) {
    const risk = {
      score: 0,
      factors: [],
      severity: 'low',
      description: 'Risk from change propagation through system',
    };

    if (!propagationAnalysis) {
      risk.score = 2;
      risk.factors.push('Propagation analysis not available');
      return risk;
    }

    // Deep propagation increases risk
    const maxDepth = propagationAnalysis.statistics?.maxDepth || 0;
    if (maxDepth >= 5) {
      risk.score += 3;
      risk.factors.push(`Very deep propagation (depth: ${maxDepth})`);
    } else if (maxDepth >= 3) {
      risk.score += 2;
      risk.factors.push(`Deep propagation (depth: ${maxDepth})`);
    } else if (maxDepth >= 2) {
      risk.score += 1;
      risk.factors.push(`Moderate propagation (depth: ${maxDepth})`);
    }

    // Many cascading effects increase risk
    const cascadingCount = propagationAnalysis.cascadingEffects?.length || 0;
    if (cascadingCount > 10) {
      risk.score += 2;
      risk.factors.push(`Many cascading effects (${cascadingCount})`);
    } else if (cascadingCount > 5) {
      risk.score += 1;
      risk.factors.push(`Some cascading effects (${cascadingCount})`);
    }

    // Breaking changes in propagation
    const breakingChanges = [...(propagationAnalysis.directEffects || []), ...(propagationAnalysis.cascadingEffects || [])]
      .filter(effect => effect.changeType?.severity === 'breaking').length;
    
    if (breakingChanges > 0) {
      risk.score += 3;
      risk.factors.push(`${breakingChanges} breaking changes in propagation`);
    }

    // Critical propagation paths
    const criticalPaths = propagationAnalysis.criticalPaths?.length || 0;
    if (criticalPaths > 0) {
      risk.score += 2;
      risk.factors.push(`${criticalPaths} critical propagation paths identified`);
    }

    risk.score = Math.min(10, risk.score);
    risk.severity = this.scoresToSeverity(risk.score);

    return risk;
  }

  /**
   * Assess structural risks
   */
  async assessStructuralRisk(targetComponent, config) {
    const risk = {
      score: 0,
      factors: [],
      severity: 'low',
      description: 'Risk from structural component changes',
    };

    // Component type risk
    switch (targetComponent.type) {
      case 'agent':
        risk.score += 2;
        risk.factors.push('Agent modification affects system behavior');
        break;
      case 'workflow':
        risk.score += 2;
        risk.factors.push('Workflow modification affects process flow');
        break;
      case 'util':
        if (targetComponent.path.includes('core') || targetComponent.path.includes('utils')) {
          risk.score += 3;
          risk.factors.push('Core utility modification affects multiple components');
        } else {
          risk.score += 1;
          risk.factors.push('Utility modification has moderate impact');
        }
        break;
      case 'task':
        risk.score += 1;
        risk.factors.push('Task modification has localized impact');
        break;
    }

    // Modification type risk
    switch (config.modificationType) {
      case 'remove':
        risk.score += 4;
        risk.factors.push('Component removal is high-risk');
        break;
      case 'deprecate':
        risk.score += 2;
        risk.factors.push('Component deprecation requires migration planning');
        break;
      case 'refactor':
        risk.score += 2;
        risk.factors.push('Refactoring may introduce breaking changes');
        break;
      case 'modify':
        risk.score += 1;
        risk.factors.push('Modification may affect component behavior');
        break;
    }

    // File size and complexity risk
    try {
      const stats = await fs.stat(targetComponent.fullPath || targetComponent.path);
      if (stats.size > 50000) { // Large files are riskier to modify
        risk.score += 1;
        risk.factors.push('Large file size increases modification risk');
      }
    } catch (error) {
      // File stats not available
    }

    risk.score = Math.min(10, risk.score);
    risk.severity = this.scoresToSeverity(risk.score);

    return risk;
  }

  /**
   * Assess operational risks
   */
  async assessOperationalRisk(targetComponent, analysisData, config) {
    const risk = {
      score: 0,
      factors: [],
      severity: 'low',
      description: 'Risk to operational stability and performance',
    };

    // Production usage risk
    if (targetComponent.path.includes('agent') || targetComponent.path.includes('workflow')) {
      risk.score += 2;
      risk.factors.push('Component likely used in production workflows');
    }

    // Performance impact risk
    if (targetComponent.type === 'util' && targetComponent.path.includes('core')) {
      risk.score += 2;
      risk.factors.push('Core utility changes may impact performance');
    }

    // Memory and resource usage changes
    if (config.modificationType === 'refactor' || config.modificationType === 'modify') {
      risk.score += 1;
      risk.factors.push('Changes may affect resource usage patterns');
    }

    // Error handling and recovery
    const hasErrorHandling = targetComponent.content && 
      (targetComponent.content.includes('try') || targetComponent.content.includes('catch'));
    
    if (!hasErrorHandling && targetComponent.type !== 'task') {
      risk.score += 1;
      risk.factors.push('Component lacks comprehensive error handling');
    }

    // Monitoring and observability
    const hasLogging = targetComponent.content && 
      (targetComponent.content.includes('console.log') || targetComponent.content.includes('logger'));
    
    if (!hasLogging && (targetComponent.type === 'agent' || targetComponent.type === 'workflow')) {
      risk.score += 1;
      risk.factors.push('Limited observability for operational monitoring');
    }

    risk.score = Math.min(10, risk.score);
    risk.severity = this.scoresToSeverity(risk.score);

    return risk;
  }

  /**
   * Assess security risks
   */
  async assessSecurityRisk(targetComponent, config) {
    const risk = {
      score: 0,
      factors: [],
      severity: 'low',
      description: 'Security-related modification risks',
    };

    // File system access
    if (targetComponent.content && targetComponent.content.includes('fs.')) {
      risk.score += 2;
      risk.factors.push('Component has file system access');
    }

    // External network access
    if (targetComponent.content && 
        (targetComponent.content.includes('http') || targetComponent.content.includes('fetch') || 
         targetComponent.content.includes('axios'))) {
      risk.score += 2;
      risk.factors.push('Component makes external network requests');
    }

    // Process execution
    if (targetComponent.content && 
        (targetComponent.content.includes('exec') || targetComponent.content.includes('spawn'))) {
      risk.score += 3;
      risk.factors.push('Component executes external processes');
    }

    // User input handling
    if (targetComponent.content && 
        (targetComponent.content.includes('input') || targetComponent.content.includes('prompt'))) {
      risk.score += 1;
      risk.factors.push('Component handles user input');
    }

    // Removal of security components
    if (config.modificationType === 'remove' && 
        (targetComponent.path.includes('security') || targetComponent.path.includes('validation'))) {
      risk.score += 4;
      risk.factors.push('Removing security-related component');
    }

    risk.score = Math.min(10, risk.score);
    risk.severity = this.scoresToSeverity(risk.score);

    return risk;
  }

  /**
   * Assess compatibility risks
   */
  async assessCompatibilityRisk(targetComponent, analysisData, config) {
    const risk = {
      score: 0,
      factors: [],
      severity: 'low',
      description: 'Risk to backward and forward compatibility',
    };

    // API changes
    if (targetComponent.content && 
        (targetComponent.content.includes('module.exports') || targetComponent.content.includes('export'))) {
      if (config.modificationType === 'refactor' || config.modificationType === 'modify') {
        risk.score += 2;
        risk.factors.push('Modification may change public API');
      }
    }

    // Configuration changes
    if (targetComponent.type === 'agent' || targetComponent.type === 'workflow') {
      if (config.modificationType !== 'remove') {
        risk.score += 1;
        risk.factors.push('Configuration changes may break existing setups');
      }
    }

    // Version compatibility
    if (config.modificationType === 'remove' || config.modificationType === 'deprecate') {
      risk.score += 3;
      risk.factors.push('Change affects version compatibility');
    }

    // Framework evolution compatibility
    if (targetComponent.path.includes('core') || targetComponent.path.includes('utils')) {
      risk.score += 2;
      risk.factors.push('Core component changes affect framework evolution');
    }

    risk.score = Math.min(10, risk.score);
    risk.severity = this.scoresToSeverity(risk.score);

    return risk;
  }

  /**
   * Assess rollback risks
   */
  async assessRollbackRisk(targetComponent, config) {
    const risk = {
      score: 0,
      factors: [],
      severity: 'low',
      description: 'Risk and difficulty of rolling back changes',
    };

    // Complex changes are harder to rollback
    if (config.modificationType === 'refactor') {
      risk.score += 2;
      risk.factors.push('Refactoring changes are complex to rollback');
    }

    // Removal is difficult to rollback
    if (config.modificationType === 'remove') {
      risk.score += 4;
      risk.factors.push('Component removal difficult to rollback');
    }

    // Multiple file dependencies
    const hasMultipleDependencies = targetComponent.content && 
      (targetComponent.content.match(/require\s*\(/g) || []).length > 5;
    
    if (hasMultipleDependencies) {
      risk.score += 1;
      risk.factors.push('Multiple dependencies complicate rollback');
    }

    // State changes
    if (targetComponent.type === 'workflow' || targetComponent.type === 'agent') {
      risk.score += 1;
      risk.factors.push('State changes may persist after rollback');
    }

    // Database or persistent storage
    if (targetComponent.content && 
        (targetComponent.content.includes('database') || targetComponent.content.includes('storage'))) {
      risk.score += 2;
      risk.factors.push('Persistent storage changes complicate rollback');
    }

    risk.score = Math.min(10, risk.score);
    risk.severity = this.scoresToSeverity(risk.score);

    return risk;
  }

  /**
   * Assess testing-related risks
   */
  async assessTestingRisk(targetComponent, analysisData) {
    const risk = {
      score: 0,
      factors: [],
      severity: 'low',
      description: 'Risk from insufficient or outdated testing',
    };

    // Check if component has tests
    const testFiles = await this.findComponentTestFiles(targetComponent);
    
    if (testFiles.length === 0) {
      risk.score += 3;
      risk.factors.push('No existing tests found for component');
    } else if (testFiles.length < 2) {
      risk.score += 1;
      risk.factors.push('Limited test coverage');
    }

    // Complex components without comprehensive tests
    if (targetComponent.content) {
      const functionCount = (targetComponent.content.match(/function\s+\w+/g) || []).length;
      const methodCount = (targetComponent.content.match(/\w+\s*\([^)]*\)\s*{/g) || []).length;
      
      if ((functionCount + methodCount) > 5 && testFiles.length < 2) {
        risk.score += 2;
        risk.factors.push('Complex component with insufficient tests');
      }
    }

    // Integration testing gap
    const hasIntegrationTests = testFiles.some(test => test.includes('integration'));
    if (!hasIntegrationTests && (targetComponent.type === 'agent' || targetComponent.type === 'workflow')) {
      risk.score += 2;
      risk.factors.push('Missing integration tests for critical component');
    }

    risk.score = Math.min(10, risk.score);
    risk.severity = this.scoresToSeverity(risk.score);

    return risk;
  }

  /**
   * Calculate overall risk from all dimensions
   */
  calculateOverallRisk(riskDimensions) {
    const dimensionWeights = {
      dependency_risk: 0.2,
      propagation_risk: 0.18,
      structural_risk: 0.15,
      operational_risk: 0.12,
      security_risk: 0.15,
      compatibility_risk: 0.1,
      rollback_risk: 0.05,
      testing_risk: 0.05,
    };

    let weightedScore = 0;
    let totalWeight = 0;

    for (const [dimension, weight] of Object.entries(dimensionWeights)) {
      if (riskDimensions[dimension]) {
        weightedScore += riskDimensions[dimension].score * weight;
        totalWeight += weight;
      }
    }

    const overallScore = totalWeight > 0 ? weightedScore / totalWeight : 0;
    const roundedScore = Math.round(overallScore * 10) / 10;
    
    return {
      score: roundedScore,
      level: this.scoresToRiskLevel(roundedScore),
    };
  }

  /**
   * Identify critical issues requiring immediate attention
   */
  identifyCriticalIssues(riskDimensions, analysisData) {
    const criticalIssues = [];

    // Check each dimension for critical severity
    for (const [dimension, riskData] of Object.entries(riskDimensions)) {
      if (riskData.severity === 'critical' || riskData.score >= 8) {
        criticalIssues.push({
          dimension: dimension,
          severity: 'critical',
          score: riskData.score,
          description: riskData.description,
          factors: riskData.factors,
        });
      }
    }

    // Special critical conditions
    if (analysisData.dependencyImpact?.impactCategories?.critical?.length > 0) {
      criticalIssues.push({
        dimension: 'dependency_critical',
        severity: 'critical',
        score: 9,
        description: 'Critical components affected by modification',
        factors: [`${analysisData.dependencyImpact.impactCategories.critical.length} critical dependencies`],
      });
    }

    if (analysisData.propagationAnalysis?.criticalPaths?.length > 2) {
      criticalIssues.push({
        dimension: 'propagation_critical',
        severity: 'critical',  
        score: 8,
        description: 'Multiple critical propagation paths detected',
        factors: [`${analysisData.propagationAnalysis.criticalPaths.length} critical paths`],
      });
    }

    return criticalIssues;
  }

  /**
   * Generate comprehensive risk factors list
   */
  generateRiskFactors(riskDimensions, analysisData) {
    const riskFactors = [];

    for (const [dimension, riskData] of Object.entries(riskDimensions)) {
      if (riskData.score > 0) {
        riskFactors.push({
          category: dimension.replace('_risk', ''),
          severity: riskData.severity,
          score: riskData.score,
          description: riskData.description,
          factors: riskData.factors,
        });
      }
    }

    return riskFactors.sort((a, b) => b.score - a.score);
  }

  /**
   * Generate risk mitigation recommendations
   */
  async generateRiskRecommendations(targetComponent, riskDimensions, criticalIssues, config) {
    const recommendations = [];

    // Critical issue recommendations
    if (criticalIssues.length > 0) {
      recommendations.push({
        priority: 'critical',
        title: 'Address Critical Risk Issues',
        description: `${criticalIssues.length} critical issues identified that require immediate attention`,
        actions: [
          'Review all critical issues before proceeding',
          'Implement additional safeguards for high-risk areas',
          'Consider staged rollout or additional testing',
          'Ensure comprehensive rollback plan is in place',
        ],
        risk_reduction: 'high',
      });
    }

    // Dependency risk recommendations
    if (riskDimensions.dependency_risk?.score >= 6) {
      recommendations.push({
        priority: 'high',
        title: 'Mitigate Dependency Risks',
        description: 'High dependency risk requires careful coordination',
        actions: [
          'Review all affected components before modification',
          'Implement gradual rollout to minimize impact',
          'Ensure dependent components have adequate tests',
          'Create communication plan for affected teams',
        ],
        risk_reduction: 'medium',
      });
    }

    // Propagation risk recommendations
    if (riskDimensions.propagation_risk?.score >= 6) {
      recommendations.push({
        priority: 'high',
        title: 'Control Change Propagation',
        description: 'Deep change propagation requires careful management',
        actions: [
          'Implement change in phases to limit propagation',
          'Add circuit breakers for cascading effects',
          'Monitor propagation paths during rollout',
          'Prepare targeted rollback for each propagation level',
        ],
        risk_reduction: 'medium',
      });
    }

    // Security risk recommendations
    if (riskDimensions.security_risk?.score >= 5) {
      recommendations.push({
        priority: 'high',
        title: 'Review Security Implications',
        description: 'Security-sensitive component requires additional review',
        actions: [
          'Conduct security review of modifications',
          'Validate input handling and sanitization',
          'Review access controls and permissions',
          'Test security boundaries and edge cases',
        ],
        risk_reduction: 'high',
      });
    }

    // Testing risk recommendations
    if (riskDimensions.testing_risk?.score >= 5) {
      recommendations.push({
        priority: 'medium',
        title: 'Improve Test Coverage',
        description: 'Insufficient testing increases modification risk',
        actions: [
          'Add comprehensive unit tests before modification',
          'Implement integration tests for component interactions',
          'Add end-to-end tests for critical workflows',
          'Set up monitoring and alerting for post-modification validation',
        ],
        risk_reduction: 'medium',
      });
    }

    // Rollback risk recommendations
    if (riskDimensions.rollback_risk?.score >= 6) {
      recommendations.push({
        priority: 'medium',
        title: 'Prepare Comprehensive Rollback Plan',
        description: 'Complex changes require detailed rollback preparation',
        actions: [
          'Create step-by-step rollback procedures',
          'Test rollback process in staging environment',
          'Prepare data backup and restoration procedures',
          'Document rollback decision criteria and triggers',
        ],
        risk_reduction: 'medium',
      });
    }

    // General recommendations based on modification type
    if (config.modificationType === 'remove') {
      recommendations.push({
        priority: 'high',
        title: 'Component Removal Strategy',
        description: 'Component removal requires careful migration planning',
        actions: [
          'Provide migration guide for dependent components',
          'Implement deprecation warnings in advance',
          'Offer alternative component recommendations',
          'Establish sunset timeline with clear milestones',
        ],
        risk_reduction: 'high',
      });
    }

    return recommendations;
  }

  /**
   * Generate risk projection and timeline
   */
  async generateRiskProjection(targetComponent, riskDimensions, analysisData, config) {
    const projection = {
      immediate_risks: [],
      short_term_risks: [],
      long_term_risks: [],
      risk_timeline: [],
      risk_evolution: {},
    };

    // Immediate risks (0-24 hours)
    if (riskDimensions.operational_risk?.score >= 6) {
      projection.immediate_risks.push({
        risk: 'operational_disruption',
        probability: 'medium',
        impact: 'high',
        description: 'Immediate operational impact from component changes',
      });
    }

    if (riskDimensions.security_risk?.score >= 7) {
      projection.immediate_risks.push({
        risk: 'security_vulnerability',
        probability: 'low',
        impact: 'critical',
        description: 'Potential security vulnerabilities from modification',
      });
    }

    // Short-term risks (1-7 days)
    if (riskDimensions.dependency_risk?.score >= 6) {
      projection.short_term_risks.push({
        risk: 'dependency_failures',
        probability: 'medium',
        impact: 'high',
        description: 'Dependent components may fail after modification',
      });
    }

    if (riskDimensions.propagation_risk?.score >= 6) {
      projection.short_term_risks.push({
        risk: 'cascading_effects',
        probability: 'medium',
        impact: 'medium',
        description: 'Cascading effects may emerge in dependent systems',
      });
    }

    // Long-term risks (1+ weeks)
    if (riskDimensions.compatibility_risk?.score >= 5) {
      projection.long_term_risks.push({
        risk: 'compatibility_degradation',
        probability: 'low',
        impact: 'medium',
        description: 'Long-term compatibility issues may emerge',
      });
    }

    // Risk timeline
    const riskEvents = [
      { time: 'T+0h', event: 'Modification applied', risk_level: riskDimensions.structural_risk?.score || 0 },
      { time: 'T+1h', event: 'Immediate effects manifest', risk_level: riskDimensions.operational_risk?.score || 0 },
      { time: 'T+24h', event: 'Dependency effects emerge', risk_level: riskDimensions.dependency_risk?.score || 0 },
      { time: 'T+1w', event: 'Propagation effects stabilize', risk_level: riskDimensions.propagation_risk?.score || 0 },
      { time: 'T+1m', event: 'Long-term stability assessment', risk_level: Math.max(riskDimensions.compatibility_risk?.score || 0, 2) },
    ];

    projection.risk_timeline = riskEvents;

    // Risk evolution patterns
    projection.risk_evolution = {
      peak_risk_period: 'T+1h to T+24h',
      stabilization_period: 'T+1w',
      risk_decay_rate: this.calculateRiskDecayRate(riskDimensions),
      monitoring_period: this.calculateMonitoringPeriod(riskDimensions),
    };

    return projection;
  }

  // Helper methods

  async findComponentTestFiles(component) {
    const testFiles = [];
    const possibleTestPaths = [
      path.join(this.rootPath, 'tests', 'unit', component.type, `${component.name}.test.js`),
      path.join(this.rootPath, 'tests', 'integration', component.type, `${component.name}.integration.test.js`),
      path.join(this.rootPath, 'test', `${component.name}.test.js`),
    ];

    for (const testPath of possibleTestPaths) {
      try {
        await fs.access(testPath);
        testFiles.push(testPath);
      } catch (error) {
        // File doesn't exist
      }
    }

    return testFiles;
  }

  scoresToSeverity(score) {
    if (score >= 8) return 'critical';
    if (score >= 6) return 'high';
    if (score >= 3) return 'medium';
    return 'low';
  }

  scoresToRiskLevel(score) {
    if (score >= 8) return 'critical';
    if (score >= 6) return 'high';
    if (score >= 3) return 'medium';
    return 'low';
  }

  formatRiskLevel(riskLevel) {
    const colors = {
      low: chalk.green,
      medium: chalk.yellow,
      high: chalk.red,
      critical: chalk.red.bold,
    };
    return colors[riskLevel] ? colors[riskLevel](riskLevel.toUpperCase()) : riskLevel;
  }

  calculateRiskDecayRate(riskDimensions) {
    // Higher structural and operational risks decay slower
    const structuralWeight = riskDimensions.structural_risk?.score || 0;
    const operationalWeight = riskDimensions.operational_risk?.score || 0;
    
    const avgWeight = (structuralWeight + operationalWeight) / 2;
    
    if (avgWeight >= 7) return 'slow';
    if (avgWeight >= 4) return 'medium';
    return 'fast';
  }

  calculateMonitoringPeriod(riskDimensions) {
    const maxRisk = Math.max(...Object.values(riskDimensions).map(risk => risk.score));
    
    if (maxRisk >= 8) return '1 month';
    if (maxRisk >= 6) return '2 weeks';
    if (maxRisk >= 4) return '1 week';
    return '3 days';
  }

  /**
   * Get assessment history
   */
  getAssessmentHistory() {
    return {
      total_assessments: this.assessmentHistory.length,
      risk_distribution: this.calculateRiskDistribution(),
      recent_assessments: this.assessmentHistory.slice(-10),
      average_risk_score: this.calculateAverageRiskScore(),
    };
  }

  calculateRiskDistribution() {
    const distribution = { low: 0, medium: 0, high: 0, critical: 0 };
    
    this.assessmentHistory.forEach(assessment => {
      distribution[assessment.riskLevel]++;
    });
    
    return distribution;
  }

  calculateAverageRiskScore() {
    if (this.assessmentHistory.length === 0) return 0;
    
    const totalScore = this.assessmentHistory.reduce((sum, assessment) => sum + assessment.riskScore, 0);
    return Math.round((totalScore / this.assessmentHistory.length) * 10) / 10;
  }
}

module.exports = ModificationRiskAssessment;