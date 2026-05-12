const fs = require('fs').promises;
const path = require('path');
const chalk = require('chalk');
const crypto = require('crypto');
const SecurityChecker = require('./security-checker');
const DependencyManager = require('./dependency-manager');

/**
 * Validates self-improvement requests and plans with comprehensive safety checks
 */
class ImprovementValidator {
  constructor(options = {}) {
    this.rootPath = options.rootPath || process.cwd();
    this.security = new SecurityChecker();
    this.dependencies = new DependencyManager();
    
    // Protected files and patterns
    this.protectedFiles = [
      'bootstrap.js',
      'index.js',
      'security-checker.js',
      'improvement-validator.js',
      'rollback-handler.js',
      'backup-manager.js',
    ];
    
    this.protectedPatterns = [
      /^\.git/,
      /node_modules/,
      /\.env/,
      /config\/security/,
      /backup\//,
    ];
    
    // Improvement history for recursive detection
    this.improvementHistoryFile = path.join(
      this.rootPath,
      '.aiox',
      'improvement-history.json',
    );
    
    // Safety thresholds
    this.thresholds = {
      maxFilesPerImprovement: options.maxFiles || 20,
      maxImprovementDepth: options.maxDepth || 1,
      maxRiskScore: options.maxRisk || 7,
      minTestCoverage: options.minCoverage || 80,
      maxComplexityIncrease: options.maxComplexity || 10,
    };
  }

  /**
   * Validate improvement request
   * @param {Object} params - Request parameters
   * @returns {Promise<Object>} Validation result
   */
  async validateRequest(params) {
    const { request, scope, constraints = {} } = params;
    
    console.log(chalk.blue('🔍 Validating improvement request...'));
    
    const validation = {
      valid: true,
      reason: null,
      suggestions: [],
      warnings: [],
      risk_assessment: {},
    };

    try {
      // Check request format
      if (!request || typeof request !== 'string' || request.length < 10) {
        validation.valid = false;
        validation.reason = 'Invalid request format';
        validation.suggestions.push('Provide a clear description of the desired improvement');
        return validation;
      }

      // Check for recursive improvements
      const recursiveCheck = await this.detectRecursiveImprovement(request);
      if (recursiveCheck.isRecursive) {
        validation.valid = false;
        validation.reason = 'Recursive improvement detected';
        validation.warnings.push(recursiveCheck.message);
        return validation;
      }

      // Validate scope
      if (scope === 'general' && !constraints.explicit_approval) {
        validation.warnings.push('General improvements require explicit approval');
      }

      // Check improvement patterns
      const patterns = this.analyzeRequestPatterns(request);
      if (patterns.suspicious) {
        validation.valid = false;
        validation.reason = 'Suspicious improvement pattern detected';
        validation.warnings.push(...patterns.warnings);
        return validation;
      }

      // Validate constraints
      const constraintValidation = this.validateConstraints(constraints);
      if (!constraintValidation.valid) {
        validation.valid = false;
        validation.reason = constraintValidation.reason;
        return validation;
      }

      // Risk assessment
      validation.risk_assessment = this.assessRequestRisk(request, scope);
      if (validation.risk_assessment.score > this.thresholds.maxRiskScore) {
        validation.valid = false;
        validation.reason = 'Risk score exceeds threshold';
        validation.warnings.push(`Risk score: ${validation.risk_assessment.score}/10`);
      }

    } catch (error) {
      validation.valid = false;
      validation.reason = `Validation error: ${error.message}`;
    }

    return validation;
  }

  /**
   * Detect recursive improvement attempts
   * @private
   */
  async detectRecursiveImprovement(request) {
    try {
      // Load improvement history
      const history = await this.loadImprovementHistory();
      
      // Check current improvement depth
      const currentDepth = this.getCurrentImprovementDepth();
      if (currentDepth >= this.thresholds.maxImprovementDepth) {
        return {
          isRecursive: true,
          message: `Maximum improvement depth (${this.thresholds.maxImprovementDepth}) reached`,
          depth: currentDepth,
        };
      }

      // Generate request fingerprint
      const fingerprint = this.generateRequestFingerprint(request);
      
      // Check for similar recent improvements
      const recentImprovements = history.improvements.filter(imp => {
        const ageInHours = (Date.now() - new Date(imp.timestamp)) / (1000 * 60 * 60);
        return ageInHours < 24;
      });

      for (const improvement of recentImprovements) {
        const similarity = this.calculateSimilarity(fingerprint, improvement.fingerprint);
        if (similarity > 0.8) {
          return {
            isRecursive: true,
            message: `Similar improvement attempted ${improvement.timestamp}`,
            similarity,
            previousId: improvement.id,
          };
        }
      }

      // Check for self-referential improvements
      if (this.isSelfReferential(request)) {
        return {
          isRecursive: true,
          message: 'Self-referential improvement detected',
          pattern: 'self-modification of improvement system',
        };
      }

      // Record this improvement attempt
      await this.recordImprovementAttempt({
        fingerprint,
        request,
        timestamp: new Date().toISOString(),
      });

      return { isRecursive: false };

    } catch (error) {
      console.error(chalk.red(`Recursive detection error: ${error.message}`));
      // Fail safe - prevent improvement if detection fails
      return {
        isRecursive: true,
        message: 'Could not verify non-recursive nature',
        error: error.message,
      };
    }
  }

  /**
   * Validate safety of improvement plan
   * @param {Object} plan - Improvement plan
   * @returns {Promise<Object>} Safety validation result
   */
  async validateSafety(plan) {
    console.log(chalk.blue('🛡️ Validating improvement safety...'));
    
    const safety = {
      safe: true,
      risk_level: 'low',
      risks: [],
      mitigations: [],
      interface_preserved: true,
      breaking_changes: [],
    };

    try {
      // Check protected files
      for (const file of plan.affectedFiles) {
        if (this.isProtectedFile(file)) {
          safety.safe = false;
          safety.risks.push({
            type: 'protected_file',
            file,
            severity: 'critical',
            message: `Cannot modify protected file: ${file}`,
          });
        }
      }

      // Validate each change
      for (const change of plan.changes) {
        const changeValidation = await this.validateChange(change);
        if (!changeValidation.safe) {
          safety.safe = false;
          safety.risks.push(...changeValidation.risks);
        }
        
        if (changeValidation.breaking_changes.length > 0) {
          safety.interface_preserved = false;
          safety.breaking_changes.push(...changeValidation.breaking_changes);
        }
      }

      // Check dependency impacts
      const depImpact = await this.assessDependencyImpact(plan);
      if (depImpact.hasIssues) {
        safety.risks.push({
          type: 'dependency_impact',
          severity: 'medium',
          message: 'Changes may affect dependent components',
          details: depImpact.issues,
        });
      }

      // Security validation
      const securityCheck = await this.performSecurityCheck(plan);
      if (!securityCheck.safe) {
        safety.safe = false;
        safety.risks.push(...securityCheck.risks);
      }

      // Calculate overall risk level
      safety.risk_level = this.calculateRiskLevel(safety.risks);
      
      // Generate mitigations
      if (safety.risks.length > 0) {
        safety.mitigations = this.generateMitigations(safety.risks);
      }

    } catch (error) {
      safety.safe = false;
      safety.risks.push({
        type: 'validation_error',
        severity: 'high',
        message: error.message,
      });
    }

    return safety;
  }

  /**
   * Validate individual change
   * @private
   */
  async validateChange(change) {
    const validation = {
      safe: true,
      risks: [],
      breaking_changes: [],
    };

    // Check modification types
    for (const mod of change.modifications) {
      switch (mod.type) {
        case 'api_change':
          validation.breaking_changes.push({
            type: 'api_change',
            description: mod.description,
            impact: 'Existing integrations may break',
          });
          break;
          
        case 'signature_change':
          validation.breaking_changes.push({
            type: 'signature_change',
            function: mod.function,
            impact: 'Callers must be updated',
          });
          break;
          
        case 'config_format_change':
          validation.risks.push({
            type: 'config_change',
            severity: 'medium',
            message: 'Configuration format changes require migration',
          });
          break;
      }
    }

    // Validate test coverage
    if (!change.tests || change.tests.length === 0) {
      validation.risks.push({
        type: 'missing_tests',
        severity: 'medium',
        message: 'No tests specified for changes',
      });
    }

    return validation;
  }

  /**
   * Load improvement history
   * @private
   */
  async loadImprovementHistory() {
    try {
      const content = await fs.readFile(this.improvementHistoryFile, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      // Initialize if doesn't exist
      const initialHistory = {
        version: '1.0.0',
        improvements: [],
        statistics: {
          total_attempts: 0,
          successful: 0,
          failed: 0,
          rolled_back: 0,
        },
      };
      
      await this.saveImprovementHistory(initialHistory);
      return initialHistory;
    }
  }

  /**
   * Save improvement history
   * @private
   */
  async saveImprovementHistory(history) {
    const dir = path.dirname(this.improvementHistoryFile);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(
      this.improvementHistoryFile,
      JSON.stringify(history, null, 2),
    );
  }

  /**
   * Record improvement attempt
   * @private
   */
  async recordImprovementAttempt(attempt) {
    const history = await this.loadImprovementHistory();
    
    history.improvements.push({
      id: `imp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      ...attempt,
      depth: this.getCurrentImprovementDepth(),
    });
    
    history.statistics.total_attempts++;
    
    // Keep only last 100 improvements
    if (history.improvements.length > 100) {
      history.improvements = history.improvements.slice(-100);
    }
    
    await this.saveImprovementHistory(history);
  }

  /**
   * Get current improvement depth
   * @private
   */
  getCurrentImprovementDepth() {
    // Check if we're running within an improvement context
    const depth = process.env.AIOX_IMPROVEMENT_DEPTH || '0';
    return parseInt(depth, 10);
  }

  /**
   * Generate request fingerprint
   * @private
   */
  generateRequestFingerprint(request) {
    const normalized = request.toLowerCase()
      .replace(/\s+/g, ' ')
      .trim();
    
    const hash = crypto.createHash('sha256')
      .update(normalized)
      .digest('hex');
    
    // Extract key features
    const features = {
      hash,
      length: request.length,
      keywords: this.extractKeywords(normalized),
      patterns: this.extractPatterns(normalized),
    };
    
    return features;
  }

  /**
   * Calculate similarity between fingerprints
   * @private
   */
  calculateSimilarity(fp1, fp2) {
    // Hash similarity
    if (fp1.hash === fp2.hash) return 1.0;
    
    // Keyword overlap
    const keywords1 = new Set(fp1.keywords);
    const keywords2 = new Set(fp2.keywords);
    const intersection = [...keywords1].filter(k => keywords2.has(k));
    const union = new Set([...keywords1, ...keywords2]);
    
    const keywordSimilarity = union.size > 0 
      ? intersection.length / union.size 
      : 0;
    
    // Length similarity
    const lengthSimilarity = 1 - Math.abs(fp1.length - fp2.length) / Math.max(fp1.length, fp2.length);
    
    // Weighted combination
    return (keywordSimilarity * 0.7) + (lengthSimilarity * 0.3);
  }

  /**
   * Check if request is self-referential
   * @private
   */
  isSelfReferential(request) {
    const selfPatterns = [
      /improve.*improvement.*system/i,
      /modify.*validator/i,
      /change.*safety.*check/i,
      /update.*recursive.*detection/i,
      /enhance.*self.*modification/i,
    ];
    
    return selfPatterns.some(pattern => pattern.test(request));
  }

  /**
   * Analyze request patterns
   * @private
   */
  analyzeRequestPatterns(request) {
    const analysis = {
      suspicious: false,
      warnings: [],
    };
    
    // Check for dangerous patterns
    const dangerous = [
      { pattern: /disable.*safety/i, message: 'Attempting to disable safety features' },
      { pattern: /bypass.*validation/i, message: 'Attempting to bypass validation' },
      { pattern: /remove.*check/i, message: 'Attempting to remove checks' },
      { pattern: /unlimited|infinite|no.*limit/i, message: 'Attempting to remove limits' },
    ];
    
    for (const check of dangerous) {
      if (check.pattern.test(request)) {
        analysis.suspicious = true;
        analysis.warnings.push(check.message);
      }
    }
    
    return analysis;
  }

  /**
   * Validate constraints
   * @private
   */
  validateConstraints(constraints) {
    const validation = { valid: true };
    
    if (constraints.max_files && constraints.max_files > this.thresholds.maxFilesPerImprovement) {
      validation.valid = false;
      validation.reason = `Max files exceeds limit (${this.thresholds.maxFilesPerImprovement})`;
    }
    
    if (constraints.preserve_interfaces === false) {
      validation.valid = false;
      validation.reason = 'Interface preservation is mandatory';
    }
    
    return validation;
  }

  /**
   * Assess request risk
   * @private
   */
  assessRequestRisk(request, scope) {
    let score = 0;
    const factors = [];
    
    // Scope risk
    if (scope === 'general') {
      score += 3;
      factors.push({ factor: 'general_scope', points: 3 });
    }
    
    // Pattern risk
    const riskPatterns = [
      { pattern: /core|critical|system/i, points: 2 },
      { pattern: /all|every|entire/i, points: 2 },
      { pattern: /refactor|rewrite|redesign/i, points: 3 },
      { pattern: /performance|optimize/i, points: 1 },
      { pattern: /security|auth/i, points: 2 },
    ];
    
    for (const risk of riskPatterns) {
      if (risk.pattern.test(request)) {
        score += risk.points;
        factors.push({ 
          factor: risk.pattern.source, 
          points: risk.points, 
        });
      }
    }
    
    return { score, factors };
  }

  /**
   * Check if file is protected
   * @private
   */
  isProtectedFile(file) {
    const filename = path.basename(file);
    
    // Check exact matches
    if (this.protectedFiles.includes(filename)) {
      return true;
    }
    
    // Check patterns
    return this.protectedPatterns.some(pattern => pattern.test(file));
  }

  /**
   * Assess dependency impact
   * @private
   */
  async assessDependencyImpact(plan) {
    const impact = {
      hasIssues: false,
      issues: [],
    };
    
    try {
      for (const file of plan.affectedFiles) {
        const deps = await this.dependencies.getDependents(file);
        if (deps.length > 0) {
          impact.hasIssues = true;
          impact.issues.push({
            file,
            dependents: deps.length,
            samples: deps.slice(0, 3),
          });
        }
      }
    } catch (error) {
      console.warn(`Dependency check failed: ${error.message}`);
    }
    
    return impact;
  }

  /**
   * Perform security check
   * @private
   */
  async performSecurityCheck(plan) {
    const check = {
      safe: true,
      risks: [],
    };
    
    // Check for security-sensitive modifications
    for (const change of plan.changes) {
      for (const mod of change.modifications) {
        if (mod.type === 'auth_change' || mod.type === 'permission_change') {
          check.safe = false;
          check.risks.push({
            type: 'security_modification',
            severity: 'critical',
            message: 'Changes affect security components',
            detail: mod.description,
          });
        }
      }
    }
    
    return check;
  }

  /**
   * Calculate overall risk level
   * @private
   */
  calculateRiskLevel(risks) {
    if (risks.some(r => r.severity === 'critical')) return 'critical';
    if (risks.filter(r => r.severity === 'high').length > 1) return 'high';
    if (risks.some(r => r.severity === 'high')) return 'medium';
    if (risks.length > 3) return 'medium';
    return 'low';
  }

  /**
   * Generate risk mitigations
   * @private
   */
  generateMitigations(risks) {
    const mitigations = [];
    
    for (const risk of risks) {
      switch (risk.type) {
        case 'protected_file':
          mitigations.push({
            risk: risk.type,
            mitigation: 'Create a copy of the protected file for modifications',
            action: 'copy_and_modify',
          });
          break;
          
        case 'missing_tests':
          mitigations.push({
            risk: risk.type,
            mitigation: 'Generate comprehensive test suite before applying changes',
            action: 'generate_tests',
          });
          break;
          
        case 'dependency_impact':
          mitigations.push({
            risk: risk.type,
            mitigation: 'Update dependent components to handle changes',
            action: 'update_dependents',
          });
          break;
          
        default:
          mitigations.push({
            risk: risk.type,
            mitigation: 'Manual review required',
            action: 'manual_review',
          });
      }
    }
    
    return mitigations;
  }

  /**
   * Extract keywords from text
   * @private
   */
  extractKeywords(text) {
    const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for']);
    const words = text.split(/\s+/)
      .filter(w => w.length > 3 && !stopWords.has(w));
    
    return [...new Set(words)];
  }

  /**
   * Extract patterns from text
   * @private
   */
  extractPatterns(text) {
    const patterns = [];
    
    // Action patterns
    if (/improve|enhance|optimize/.test(text)) patterns.push('improvement');
    if (/fix|repair|correct/.test(text)) patterns.push('bugfix');
    if (/add|create|implement/.test(text)) patterns.push('feature');
    if (/refactor|reorganize|restructure/.test(text)) patterns.push('refactor');
    
    return patterns;
  }
}

module.exports = ImprovementValidator;