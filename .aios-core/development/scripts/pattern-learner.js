const fs = require('fs').promises;
const path = require('path');
const chalk = require('chalk');
const EventEmitter = require('events');

/**
 * Pattern learning system for successful modifications
 * Learns from successful modifications to suggest improvements and automate common patterns
 */
class PatternLearner extends EventEmitter {
  constructor(options = {}) {
    super();
    this.rootPath = options.rootPath || process.cwd();
    this.patternsDir = path.join(this.rootPath, '.aios', 'patterns');
    this.historyFile = path.join(this.patternsDir, 'modification_history.json');
    this.patternsFile = path.join(this.patternsDir, 'learned_patterns.json');
    this.patterns = new Map();
    this.modificationHistory = [];
    this.learningThreshold = options.learningThreshold || 3; // Minimum occurrences to learn pattern
    this.similarityThreshold = options.similarityThreshold || 0.8; // 80% similarity
  }

  /**
   * Initialize pattern learner
   */
  async initialize() {
    await fs.mkdir(this.patternsDir, { recursive: true });
    await this.loadHistory();
    await this.loadPatterns();
    console.log(chalk.green('✅ Pattern learner initialized'));
  }

  /**
   * Record successful modification for learning
   */
  async recordSuccessfulModification(modification) {
    const record = {
      id: `mod-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      timestamp: new Date().toISOString(),
      componentType: modification.componentType,
      modificationType: modification.modificationType,
      patterns: await this.extractPatterns(modification),
      outcomes: {
        success: true,
        metrics: modification.metrics || {},
        improvements: modification.improvements || []
      },
      metadata: {
        author: modification.author || process.env.USER || 'unknown',
        duration: modification.duration,
        complexity: modification.complexity
      }
    };

    // Add to history
    this.modificationHistory.push(record);
    
    // Learn from this modification
    await this.learnFromModification(record);
    
    // Save updated history
    await this.saveHistory();
    
    // Emit event for real-time learning
    this.emit('modification_recorded', record);
    
    console.log(chalk.green(`✅ Recorded successful modification: ${record.id}`));
    
    return {
      recordId: record.id,
      patternsExtracted: record.patterns.length,
      learningTriggered: await this.checkLearningThreshold(record.patterns)
    };
  }

  /**
   * Extract patterns from modification
   */
  async extractPatterns(modification) {
    const patterns = [];

    // Code change patterns
    if (modification.codeChanges) {
      patterns.push(...this.extractCodePatterns(modification.codeChanges));
    }

    // Structural patterns
    if (modification.structuralChanges) {
      patterns.push(...this.extractStructuralPatterns(modification.structuralChanges));
    }

    // Refactoring patterns
    if (modification.refactoringType) {
      patterns.push(...this.extractRefactoringPatterns(modification));
    }

    // Dependency patterns
    if (modification.dependencyChanges) {
      patterns.push(...this.extractDependencyPatterns(modification.dependencyChanges));
    }

    // Performance patterns
    if (modification.performanceImprovements) {
      patterns.push(...this.extractPerformancePatterns(modification.performanceImprovements));
    }

    return patterns;
  }

  /**
   * Extract code change patterns
   */
  extractCodePatterns(codeChanges) {
    const patterns = [];

    for (const change of codeChanges) {
      // Function transformation patterns
      if (change.type === 'function_transformation') {
        patterns.push({
          type: 'code_transformation',
          subtype: 'function',
          from: this.normalizeCode(change.before),
          to: this.normalizeCode(change.after),
          context: change.context,
          benefits: change.benefits || []
        });
      }

      // Error handling patterns
      if (change.type === 'error_handling') {
        patterns.push({
          type: 'error_handling',
          subtype: change.handlingType,
          pattern: change.pattern,
          improvement: change.improvement
        });
      }

      // Async/await patterns
      if (change.type === 'async_transformation') {
        patterns.push({
          type: 'async_pattern',
          from: change.callbackPattern,
          to: change.asyncPattern,
          complexity_reduction: change.complexityReduction
        });
      }

      // API usage patterns
      if (change.type === 'api_improvement') {
        patterns.push({
          type: 'api_usage',
          oldPattern: change.oldUsage,
          newPattern: change.newUsage,
          benefits: change.benefits
        });
      }
    }

    return patterns;
  }

  /**
   * Extract structural patterns
   */
  extractStructuralPatterns(structuralChanges) {
    const patterns = [];

    for (const change of structuralChanges) {
      patterns.push({
        type: 'structural',
        changeType: change.type,
        pattern: {
          before: change.beforeStructure,
          after: change.afterStructure
        },
        benefits: {
          modularity: change.modularityImprovement || 0,
          maintainability: change.maintainabilityImprovement || 0,
          testability: change.testabilityImprovement || 0
        }
      });
    }

    return patterns;
  }

  /**
   * Extract refactoring patterns
   */
  extractRefactoringPatterns(modification) {
    const patterns = [];

    patterns.push({
      type: 'refactoring',
      refactoringType: modification.refactoringType,
      triggers: modification.triggers || [],
      steps: modification.steps || [],
      validation: modification.validation || {},
      benefits: modification.measuredBenefits || {}
    });

    return patterns;
  }

  /**
   * Extract dependency patterns
   */
  extractDependencyPatterns(dependencyChanges) {
    const patterns = [];

    for (const change of dependencyChanges) {
      if (change.type === 'consolidation') {
        patterns.push({
          type: 'dependency_consolidation',
          from: change.originalDependencies,
          to: change.consolidatedDependency,
          reduction: change.dependencyReduction
        });
      }

      if (change.type === 'upgrade') {
        patterns.push({
          type: 'dependency_upgrade',
          dependency: change.dependency,
          fromVersion: change.fromVersion,
          toVersion: change.toVersion,
          migrationSteps: change.migrationSteps
        });
      }
    }

    return patterns;
  }

  /**
   * Extract performance patterns
   */
  extractPerformancePatterns(performanceImprovements) {
    const patterns = [];

    for (const improvement of performanceImprovements) {
      patterns.push({
        type: 'performance',
        optimizationType: improvement.type,
        technique: improvement.technique,
        metrics: {
          before: improvement.metricsBefore,
          after: improvement.metricsAfter,
          improvement: improvement.percentageImprovement
        },
        applicableContexts: improvement.contexts || []
      });
    }

    return patterns;
  }

  /**
   * Learn from modification
   */
  async learnFromModification(record) {
    for (const pattern of record.patterns) {
      const patternKey = this.generatePatternKey(pattern);
      
      // Check if similar pattern exists
      const similarPattern = await this.findSimilarPattern(pattern);
      
      if (similarPattern) {
        // Update existing pattern
        await this.updatePattern(similarPattern, pattern, record);
      } else {
        // Create new pattern entry
        await this.createPattern(patternKey, pattern, record);
      }
    }

    // Analyze cross-pattern relationships
    await this.analyzePatternRelationships(record.patterns);
    
    // Update pattern rankings
    await this.updatePatternRankings();
  }

  /**
   * Find similar pattern
   */
  async findSimilarPattern(pattern) {
    for (const [key, existingPattern] of this.patterns) {
      const similarity = await this.calculatePatternSimilarity(pattern, existingPattern);
      
      if (similarity >= this.similarityThreshold) {
        return { key, pattern: existingPattern, similarity };
      }
    }
    
    return null;
  }

  /**
   * Calculate pattern similarity
   */
  async calculatePatternSimilarity(pattern1, pattern2) {
    // Type must match
    if (pattern1.type !== pattern2.type) return 0;

    let similarity = 0;
    let factors = 0;

    // Type-specific similarity calculation
    switch (pattern1.type) {
      case 'code_transformation':
        similarity += this.calculateCodeSimilarity(pattern1, pattern2) * 0.7;
        similarity += this.calculateContextSimilarity(pattern1.context, pattern2.context) * 0.3;
        factors = 1;
        break;

      case 'structural':
        similarity += this.calculateStructuralSimilarity(pattern1.pattern, pattern2.pattern) * 0.6;
        similarity += this.calculateBenefitSimilarity(pattern1.benefits, pattern2.benefits) * 0.4;
        factors = 1;
        break;

      case 'refactoring':
        similarity += this.calculateRefactoringSimilarity(pattern1, pattern2);
        factors = 1;
        break;

      case 'performance':
        similarity += this.calculatePerformanceSimilarity(pattern1, pattern2);
        factors = 1;
        break;

      default:
        // Generic similarity based on pattern structure
        similarity = this.calculateGenericSimilarity(pattern1, pattern2);
        factors = 1;
    }

    return factors > 0 ? similarity / factors : 0;
  }

  /**
   * Calculate code similarity
   */
  calculateCodeSimilarity(pattern1, pattern2) {
    const from1 = this.tokenizeCode(pattern1.from);
    const from2 = this.tokenizeCode(pattern2.from);
    const to1 = this.tokenizeCode(pattern1.to);
    const to2 = this.tokenizeCode(pattern2.to);

    const fromSimilarity = this.calculateTokenSimilarity(from1, from2);
    const toSimilarity = this.calculateTokenSimilarity(to1, to2);

    return (fromSimilarity + toSimilarity) / 2;
  }

  /**
   * Tokenize code for comparison
   */
  tokenizeCode(code) {
    if (!code) return [];
    
    // Simple tokenization - can be enhanced with proper AST parsing
    return code
      .replace(/\s+/g, ' ')
      .replace(/[{}();,]/g, ' $& ')
      .split(/\s+/)
      .filter(token => token.length > 0);
  }

  /**
   * Calculate token similarity
   */
  calculateTokenSimilarity(tokens1, tokens2) {
    const set1 = new Set(tokens1);
    const set2 = new Set(tokens2);
    
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);
    
    return union.size > 0 ? intersection.size / union.size : 0;
  }

  /**
   * Update existing pattern
   */
  async updatePattern(similarPattern, newPattern, record) {
    const existingPattern = similarPattern.pattern;
    
    // Update occurrence count
    existingPattern.occurrences = (existingPattern.occurrences || 0) + 1;
    
    // Update success rate
    existingPattern.successCount = (existingPattern.successCount || 0) + 1;
    existingPattern.successRate = existingPattern.successCount / existingPattern.occurrences;
    
    // Merge benefits/improvements
    if (newPattern.benefits) {
      existingPattern.aggregatedBenefits = this.aggregateBenefits(
        existingPattern.aggregatedBenefits || {},
        newPattern.benefits
      );
    }
    
    // Add to usage history
    if (!existingPattern.usageHistory) {
      existingPattern.usageHistory = [];
    }
    existingPattern.usageHistory.push({
      recordId: record.id,
      timestamp: record.timestamp,
      author: record.metadata.author,
      outcomes: record.outcomes
    });
    
    // Update confidence score
    existingPattern.confidence = this.calculatePatternConfidence(existingPattern);
    
    // Check if pattern should be promoted
    if (existingPattern.occurrences >= this.learningThreshold && existingPattern.confidence > 0.8) {
      existingPattern.status = 'learned';
      existingPattern.learnedAt = new Date().toISOString();
      
      console.log(chalk.green(`✅ Pattern promoted to learned: ${similarPattern.key}`));
      this.emit('pattern_learned', existingPattern);
    }
  }

  /**
   * Create new pattern
   */
  async createPattern(key, pattern, record) {
    const newPattern = {
      ...pattern,
      key: key,
      occurrences: 1,
      successCount: 1,
      successRate: 1.0,
      firstSeen: record.timestamp,
      lastSeen: record.timestamp,
      status: 'candidate',
      confidence: 0.3, // Initial low confidence
      usageHistory: [{
        recordId: record.id,
        timestamp: record.timestamp,
        author: record.metadata.author,
        outcomes: record.outcomes
      }]
    };
    
    this.patterns.set(key, newPattern);
    
    console.log(chalk.gray(`New pattern candidate created: ${key}`));
  }

  /**
   * Calculate pattern confidence
   */
  calculatePatternConfidence(pattern) {
    let confidence = 0;
    
    // Occurrence factor (up to 0.3)
    const occurrenceFactor = Math.min(pattern.occurrences / 10, 0.3);
    confidence += occurrenceFactor;
    
    // Success rate factor (up to 0.4)
    confidence += pattern.successRate * 0.4;
    
    // Consistency factor (up to 0.2)
    const consistencyFactor = this.calculateConsistencyFactor(pattern.usageHistory);
    confidence += consistencyFactor * 0.2;
    
    // Recency factor (up to 0.1)
    const recencyFactor = this.calculateRecencyFactor(pattern.lastSeen);
    confidence += recencyFactor * 0.1;
    
    return Math.min(confidence, 1.0);
  }

  /**
   * Get pattern suggestions for modification
   */
  async getPatternSuggestions(_context) {
    const suggestions = [];
    
    // Filter applicable patterns
    const applicablePatterns = Array.from(this.patterns.values()).filter(pattern => {
      return pattern.status === 'learned' && 
             this.isPatternApplicable(pattern, context) &&
             pattern.confidence > 0.7;
    });
    
    // Sort by relevance and confidence
    applicablePatterns.sort((a, b) => {
      const relevanceA = this.calculateRelevance(a, context);
      const relevanceB = this.calculateRelevance(b, context);
      return (relevanceB * b.confidence) - (relevanceA * a.confidence);
    });
    
    // Create suggestions
    for (const pattern of applicablePatterns.slice(0, 5)) {
      suggestions.push({
        pattern: pattern,
        relevance: this.calculateRelevance(pattern, context),
        confidence: pattern.confidence,
        expectedBenefits: pattern.aggregatedBenefits || {},
        applicationGuide: await this.generateApplicationGuide(pattern, context),
        examples: this.getPatternExamples(pattern)
      });
    }
    
    return suggestions;
  }

  /**
   * Check if pattern is applicable
   */
  isPatternApplicable(pattern, context) {
    // Check component type compatibility
    if (pattern.componentType && context.componentType) {
      if (pattern.componentType !== context.componentType && pattern.componentType !== 'any') {
        return false;
      }
    }
    
    // Check context requirements
    if (pattern.requiredContext) {
      for (const requirement of pattern.requiredContext) {
        if (!this.meetsContextRequirement(_context, requirement)) {
          return false;
        }
      }
    }
    
    // Check applicability conditions
    if (pattern.applicableContexts) {
      return pattern.applicableContexts.some(ctx => 
        this.matchesContext(_context, ctx)
      );
    }
    
    return true;
  }

  /**
   * Generate application guide
   */
  async generateApplicationGuide(pattern, context) {
    const guide = {
      steps: [],
      preconditions: [],
      expectedOutcome: {},
      risks: [],
      alternatives: []
    };
    
    // Generate steps based on pattern type
    switch (pattern.type) {
      case 'code_transformation':
        guide.steps = this.generateCodeTransformationSteps(pattern, context);
        break;
      case 'refactoring':
        guide.steps = pattern.steps || [];
        guide.preconditions = pattern.triggers || [];
        break;
      case 'performance':
        guide.steps = this.generatePerformanceOptimizationSteps(pattern, context);
        guide.expectedOutcome = pattern.metrics;
        break;
    }
    
    // Add general guidance
    guide.confidence = `${Math.round(pattern.confidence * 100)}%`;
    guide.successRate = `${Math.round(pattern.successRate * 100)}%`;
    guide.usageCount = pattern.occurrences;
    
    return guide;
  }

  /**
   * Analyze pattern relationships
   */
  async analyzePatternRelationships(patterns) {
    // Find patterns that commonly occur together
    const coOccurrences = new Map();
    
    for (let i = 0; i < patterns.length; i++) {
      for (let j = i + 1; j < patterns.length; j++) {
        const key = this.generateRelationshipKey(patterns[i], patterns[j]);
        const existing = coOccurrences.get(key) || { count: 0, patterns: [] };
        existing.count++;
        existing.patterns = [patterns[i], patterns[j]];
        coOccurrences.set(key, existing);
      }
    }
    
    // Store significant relationships
    for (const [key, relationship] of coOccurrences) {
      if (relationship.count >= 2) {
        await this.storePatternRelationship(key, relationship);
      }
    }
  }

  /**
   * Get pattern analytics
   */
  async getPatternAnalytics() {
    const analytics = {
      totalPatterns: this.patterns.size,
      learnedPatterns: 0,
      candidatePatterns: 0,
      patternsByType: {},
      topPatterns: [],
      recentTrends: [],
      effectivenessMetrics: {}
    };
    
    // Count patterns by status and type
    for (const pattern of this.patterns.values()) {
      if (pattern.status === 'learned') {
        analytics.learnedPatterns++;
      } else {
        analytics.candidatePatterns++;
      }
      
      analytics.patternsByType[pattern.type] = 
        (analytics.patternsByType[pattern.type] || 0) + 1;
    }
    
    // Get top patterns by usage
    const sortedPatterns = Array.from(this.patterns.values())
      .sort((a, b) => b.occurrences - a.occurrences);
    
    analytics.topPatterns = sortedPatterns.slice(0, 10).map(p => ({
      key: p.key,
      type: p.type,
      occurrences: p.occurrences,
      successRate: p.successRate,
      confidence: p.confidence
    }));
    
    // Calculate effectiveness metrics
    analytics.effectivenessMetrics = await this.calculateEffectivenessMetrics();
    
    // Get recent trends
    analytics.recentTrends = await this.analyzeRecentTrends();
    
    return analytics;
  }

  /**
   * Calculate effectiveness metrics
   */
  async calculateEffectivenessMetrics() {
    const metrics = {
      averageSuccessRate: 0,
      averageConfidence: 0,
      patternCoverage: 0,
      learningRate: 0
    };
    
    const learnedPatterns = Array.from(this.patterns.values())
      .filter(p => p.status === 'learned');
    
    if (learnedPatterns.length > 0) {
      metrics.averageSuccessRate = learnedPatterns.reduce((sum, p) => 
        sum + p.successRate, 0) / learnedPatterns.length;
      
      metrics.averageConfidence = learnedPatterns.reduce((sum, p) => 
        sum + p.confidence, 0) / learnedPatterns.length;
    }
    
    // Calculate pattern coverage
    const modificationTypes = new Set(this.modificationHistory.map(m => m.modificationType));
    const coveredTypes = new Set(learnedPatterns.map(p => p.type));
    metrics.patternCoverage = modificationTypes.size > 0 ? 
      coveredTypes.size / modificationTypes.size : 0;
    
    // Calculate learning rate
    const recentHistory = this.modificationHistory.slice(-20);
    const recentLearned = recentHistory.filter(m => 
      m.patterns.some(p => this.patterns.get(this.generatePatternKey(p))?.status === 'learned')
    );
    metrics.learningRate = recentHistory.length > 0 ? 
      recentLearned.length / recentHistory.length : 0;
    
    return metrics;
  }

  /**
   * Helper methods
   */

  normalizeCode(code) {
    if (!code) return '';
    return code.trim().replace(/\s+/g, ' ');
  }

  generatePatternKey(pattern) {
    return `${pattern.type}:${pattern.subtype || 'default'}:${
      crypto.createHash('md5').update(JSON.stringify(pattern)).digest('hex').substr(0, 8)
    }`;
  }

  aggregateBenefits(existing, newBenefits) {
    const aggregated = { ...existing };
    
    for (const [key, value] of Object.entries(newBenefits)) {
      if (typeof value === 'number') {
        aggregated[key] = (aggregated[key] || 0) + value;
        aggregated[`${key}_avg`] = aggregated[key] / ((aggregated[`${key}_count`] || 0) + 1);
        aggregated[`${key}_count`] = (aggregated[`${key}_count`] || 0) + 1;
      }
    }
    
    return aggregated;
  }

  calculateConsistencyFactor(usageHistory) {
    if (usageHistory.length < 2) return 1.0;
    
    // Check time intervals between uses
    const intervals = [];
    for (let i = 1; i < usageHistory.length; i++) {
      const interval = new Date(usageHistory[i].timestamp) - new Date(usageHistory[i-1].timestamp);
      intervals.push(interval);
    }
    
    // Calculate variance
    const avgInterval = intervals.reduce((sum, i) => sum + i, 0) / intervals.length;
    const variance = intervals.reduce((sum, i) => sum + Math.pow(i - avgInterval, 2), 0) / intervals.length;
    const stdDev = Math.sqrt(variance);
    
    // Lower variance = higher consistency
    return 1 / (1 + stdDev / avgInterval);
  }

  calculateRecencyFactor(lastSeen) {
    const daysSinceLastSeen = (Date.now() - new Date(lastSeen).getTime()) / (1000 * 60 * 60 * 24);
    return Math.max(0, 1 - daysSinceLastSeen / 30); // Decay over 30 days
  }

  calculateRelevance(pattern, context) {
    let relevance = 0;
    
    // Type match
    if (pattern.type === context.modificationType) {
      relevance += 0.3;
    }
    
    // Component type match
    if (pattern.componentType === context.componentType) {
      relevance += 0.2;
    }
    
    // Context similarity
    if (pattern.context && context.currentContext) {
      relevance += this.calculateContextSimilarity(pattern.context, context.currentContext) * 0.3;
    }
    
    // Goal alignment
    if (pattern.benefits && context.goals) {
      relevance += this.calculateGoalAlignment(pattern.benefits, context.goals) * 0.2;
    }
    
    return relevance;
  }

  getPatternExamples(pattern) {
    return pattern.usageHistory
      .slice(-3)
      .map(usage => ({
        recordId: usage.recordId,
        timestamp: usage.timestamp,
        author: usage.author,
        outcomes: usage.outcomes
      }));
  }

  /**
   * Save and load methods
   */

  async saveHistory() {
    await fs.writeFile(
      this.historyFile, 
      JSON.stringify(this.modificationHistory, null, 2)
    );
  }

  async loadHistory() {
    try {
      const content = await fs.readFile(this.historyFile, 'utf-8');
      this.modificationHistory = JSON.parse(content);
    } catch (_error) {
      // No history file yet
      this.modificationHistory = [];
    }
  }

  async savePatterns() {
    const patternsArray = Array.from(this.patterns.entries()).map(([key, pattern]) => ({
      key,
      ...pattern
    }));
    
    await fs.writeFile(
      this.patternsFile,
      JSON.stringify(patternsArray, null, 2)
    );
  }

  async loadPatterns() {
    try {
      const content = await fs.readFile(this.patternsFile, 'utf-8');
      const patternsArray = JSON.parse(content);
      
      this.patterns.clear();
      for (const pattern of patternsArray) {
        this.patterns.set(pattern.key, pattern);
      }
    } catch (_error) {
      // No patterns file yet
    }
  }

  /**
   * Check learning threshold
   */
  async checkLearningThreshold(patterns) {
    let learnedCount = 0;
    
    for (const pattern of patterns) {
      const key = this.generatePatternKey(pattern);
      const existing = this.patterns.get(key);
      
      if (existing && existing.occurrences >= this.learningThreshold) {
        learnedCount++;
      }
    }
    
    return learnedCount > 0;
  }

  calculateContextSimilarity(context1, context2) {
    // Simple context similarity - can be enhanced
    if (!context1 || !context2) return 0;
    
    const keys1 = Object.keys(context1);
    const keys2 = Object.keys(context2);
    const commonKeys = keys1.filter(k => keys2.includes(k));
    
    if (commonKeys.length === 0) return 0;
    
    let similarity = commonKeys.length / Math.max(keys1.length, keys2.length);
    
    // Check value similarity for common keys
    for (const key of commonKeys) {
      if (context1[key] === context2[key]) {
        similarity += 0.1;
      }
    }
    
    return Math.min(similarity, 1.0);
  }

  calculateStructuralSimilarity(struct1, struct2) {
    // Compare structural patterns
    if (!struct1 || !struct2) return 0;
    
    const before1 = JSON.stringify(struct1.before);
    const before2 = JSON.stringify(struct2.before);
    const after1 = JSON.stringify(struct1.after);
    const after2 = JSON.stringify(struct2.after);
    
    const beforeSim = before1 === before2 ? 1 : 0.5;
    const afterSim = after1 === after2 ? 1 : 0.5;
    
    return (beforeSim + afterSim) / 2;
  }

  calculateBenefitSimilarity(benefits1, benefits2) {
    if (!benefits1 || !benefits2) return 0;
    
    const keys1 = Object.keys(benefits1);
    const keys2 = Object.keys(benefits2);
    const allKeys = new Set([...keys1, ...keys2]);
    
    let similarity = 0;
    for (const key of allKeys) {
      if (benefits1[key] && benefits2[key]) {
        // Both have the benefit
        similarity += 1;
      }
    }
    
    return allKeys.size > 0 ? similarity / allKeys.size : 0;
  }

  calculateRefactoringSimilarity(refactor1, refactor2) {
    if (refactor1.refactoringType !== refactor2.refactoringType) return 0;
    
    let similarity = 0.5; // Base similarity for same type
    
    // Compare triggers
    if (refactor1.triggers && refactor2.triggers) {
      const commonTriggers = refactor1.triggers.filter(t => 
        refactor2.triggers.includes(t)
      );
      similarity += commonTriggers.length / Math.max(refactor1.triggers.length, refactor2.triggers.length) * 0.3;
    }
    
    // Compare steps
    if (refactor1.steps && refactor2.steps) {
      const stepSimilarity = Math.min(refactor1.steps.length, refactor2.steps.length) / 
                           Math.max(refactor1.steps.length, refactor2.steps.length);
      similarity += stepSimilarity * 0.2;
    }
    
    return similarity;
  }

  calculatePerformanceSimilarity(perf1, perf2) {
    if (perf1.optimizationType !== perf2.optimizationType) return 0;
    
    let similarity = 0.4; // Base similarity for same type
    
    if (perf1.technique === perf2.technique) {
      similarity += 0.3;
    }
    
    // Compare applicable contexts
    if (perf1.applicableContexts && perf2.applicableContexts) {
      const commonContexts = perf1.applicableContexts.filter(c => 
        perf2.applicableContexts.includes(c)
      );
      similarity += commonContexts.length / Math.max(perf1.applicableContexts.length, perf2.applicableContexts.length) * 0.3;
    }
    
    return similarity;
  }

  calculateGenericSimilarity(pattern1, pattern2) {
    // Generic JSON similarity
    const json1 = JSON.stringify(pattern1);
    const json2 = JSON.stringify(pattern2);
    
    if (json1 === json2) return 1.0;
    
    // Calculate Levenshtein distance ratio
    const distance = this.levenshteinDistance(json1, json2);
    const maxLength = Math.max(json1.length, json2.length);
    
    return 1 - (distance / maxLength);
  }

  levenshteinDistance(str1, str2) {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  meetsContextRequirement(_context, requirement) {
    // Check if context meets specific requirement
    if (requirement.type === 'has_property') {
      return context[requirement.property] !== undefined;
    }
    
    if (requirement.type === 'property_value') {
      return context[requirement.property] === requirement.value;
    }
    
    if (requirement.type === 'property_range') {
      const value = context[requirement.property];
      return value >= requirement.min && value <= requirement.max;
    }
    
    return true;
  }

  matchesContext(_context, patternContext) {
    // Check if contexts match
    for (const [key, value] of Object.entries(patternContext)) {
      if (context[key] !== value) {
        return false;
      }
    }
    return true;
  }

  generateCodeTransformationSteps(pattern, context) {
    const steps = [];
    
    steps.push({
      step: 1,
      action: 'Identify target code pattern',
      description: `Look for code matching: ${pattern.from}`,
      validation: 'Ensure code structure matches the pattern'
    });
    
    steps.push({
      step: 2,
      action: 'Apply transformation',
      description: `Transform to: ${pattern.to}`,
      validation: 'Verify transformation preserves functionality'
    });
    
    if (pattern.context) {
      steps.push({
        step: 3,
        action: 'Validate context',
        description: 'Ensure transformation is appropriate for context',
        validation: pattern.context
      });
    }
    
    steps.push({
      step: 4,
      action: 'Test changes',
      description: 'Run tests to ensure no regression',
      validation: 'All tests pass'
    });
    
    return steps;
  }

  generatePerformanceOptimizationSteps(pattern, context) {
    const steps = [];
    
    steps.push({
      step: 1,
      action: 'Measure baseline performance',
      description: 'Capture current performance metrics',
      validation: 'Baseline metrics recorded'
    });
    
    steps.push({
      step: 2,
      action: `Apply ${pattern.technique} optimization`,
      description: pattern.description || 'Apply performance optimization technique',
      validation: 'Optimization applied correctly'
    });
    
    steps.push({
      step: 3,
      action: 'Measure improved performance',
      description: 'Capture post-optimization metrics',
      validation: `Expected improvement: ${pattern.metrics.improvement}%`
    });
    
    steps.push({
      step: 4,
      action: 'Validate functionality',
      description: 'Ensure optimization didn\'t break functionality',
      validation: 'All tests pass'
    });
    
    return steps;
  }

  generateRelationshipKey(pattern1, pattern2) {
    const types = [pattern1.type, pattern2.type].sort();
    return `rel:${types.join(':')}`;
  }

  async storePatternRelationship(key, relationship) {
    // Store pattern relationships for future analysis
    const relationshipsFile = path.join(this.patternsDir, 'relationships.json');
    
    let relationships = {};
    try {
      const content = await fs.readFile(relationshipsFile, 'utf-8');
      relationships = JSON.parse(content);
    } catch (_error) {
      // No relationships file yet
    }
    
    relationships[key] = relationship;
    
    await fs.writeFile(relationshipsFile, JSON.stringify(relationships, null, 2));
  }

  async analyzeRecentTrends() {
    const recentModifications = this.modificationHistory.slice(-30);
    const trends = {
      emergingPatterns: [],
      decliningPatterns: [],
      stablePatterns: []
    };
    
    // Analyze pattern usage over time
    const patternUsage = new Map();
    
    for (const mod of recentModifications) {
      for (const pattern of mod.patterns) {
        const key = this.generatePatternKey(pattern);
        const usage = patternUsage.get(key) || { count: 0, recent: 0 };
        usage.count++;
        
        // Check if in last 10 modifications
        const modIndex = recentModifications.indexOf(mod);
        if (modIndex >= recentModifications.length - 10) {
          usage.recent++;
        }
        
        patternUsage.set(key, usage);
      }
    }
    
    // Classify patterns
    for (const [key, usage] of patternUsage) {
      const pattern = this.patterns.get(key);
      if (!pattern) continue;
      
      const recentRatio = usage.recent / usage.count;
      
      if (recentRatio > 0.6) {
        trends.emergingPatterns.push({
          key: key,
          type: pattern.type,
          trend: 'emerging',
          usage: usage
        });
      } else if (recentRatio < 0.2) {
        trends.decliningPatterns.push({
          key: key,
          type: pattern.type,
          trend: 'declining',
          usage: usage
        });
      } else {
        trends.stablePatterns.push({
          key: key,
          type: pattern.type,
          trend: 'stable',
          usage: usage
        });
      }
    }
    
    return trends;
  }

  calculateGoalAlignment(benefits, goals) {
    if (!benefits || !goals) return 0;
    
    let alignment = 0;
    let _matchedGoals = 0;
    
    for (const goal of goals) {
      if (goal.type === 'performance' && benefits.performanceImprovement) {
        alignment += benefits.performanceImprovement > goal.target ? 1 : 0.5;
        matchedGoals++;
      }
      
      if (goal.type === 'maintainability' && benefits.maintainability) {
        alignment += benefits.maintainability > goal.target ? 1 : 0.5;
        matchedGoals++;
      }
      
      if (goal.type === 'testability' && benefits.testability) {
        alignment += benefits.testability > goal.target ? 1 : 0.5;
        matchedGoals++;
      }
    }
    
    return goals.length > 0 ? alignment / goals.length : 0;
  }

  async updatePatternRankings() {
    // Update pattern rankings based on multiple factors
    for (const pattern of this.patterns.values()) {
      pattern.ranking = this.calculatePatternRanking(pattern);
    }
    
    // Save updated patterns
    await this.savePatterns();
  }

  calculatePatternRanking(pattern) {
    let ranking = 0;
    
    // Success rate (40%)
    ranking += pattern.successRate * 40;
    
    // Usage frequency (30%)
    const usageScore = Math.min(pattern.occurrences / 20, 1);
    ranking += usageScore * 30;
    
    // Confidence (20%)
    ranking += pattern.confidence * 20;
    
    // Recency (10%)
    const recencyScore = this.calculateRecencyFactor(pattern.lastSeen);
    ranking += recencyScore * 10;
    
    return ranking;
  }
}

module.exports = PatternLearner;