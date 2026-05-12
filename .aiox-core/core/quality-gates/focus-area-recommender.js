/**
 * Focus Area Recommender
 *
 * Generates strategic focus area recommendations for human review:
 * - Architecture decisions
 * - Business logic
 * - Security considerations
 * - UX/UI implications
 *
 * @module core/quality-gates/focus-area-recommender
 * @version 1.0.0
 * @story 3.5 - Human Review Orchestration (Layer 3)
 */

/**
 * Focus Area Recommender
 * Generates intelligent focus areas based on code changes and context
 */
class FocusAreaRecommender {
  /**
   * Create a new recommender
   * @param {Object} config - Recommender configuration
   */
  constructor(config = {}) {
    this.config = config;
    this.strategicAreas = config.strategicAreas || [
      'architecture',
      'business-logic',
      'security',
      'ux',
      'performance',
      'data-integrity',
    ];
    this.skipAreas = config.skipAreas || [
      'syntax',
      'formatting',
      'simple-logic',
      'naming-conventions',
      'import-order',
    ];
  }

  /**
   * Generate focus area recommendations
   * @param {Object} context - Recommendation context
   * @returns {Promise<Object>} Focus area recommendations
   */
  async recommend(context = {}) {
    const { prContext = {}, layer1Result: _layer1Result = {}, layer2Result = {} } = context;

    const recommendations = {
      primary: [],
      secondary: [],
      skip: this.skipAreas,
      summary: '',
      highlightedAspects: [],
    };

    // Analyze changed files
    const fileAnalysis = this.analyzeChangedFiles(prContext.changedFiles || []);
    recommendations.highlightedAspects.push(...fileAnalysis.highlights);

    // Add primary focus areas
    recommendations.primary = this.determinePrimaryAreas(fileAnalysis, layer2Result);

    // Add secondary focus areas
    recommendations.secondary = this.determineSecondaryAreas(fileAnalysis, layer2Result);

    // Generate summary
    recommendations.summary = this.generateSummary(recommendations);

    return recommendations;
  }

  /**
   * Analyze changed files to determine focus areas
   * @param {Array} changedFiles - List of changed file paths
   * @returns {Object} File analysis results
   */
  analyzeChangedFiles(changedFiles = []) {
    const analysis = {
      categories: {},
      patterns: [],
      highlights: [],
      riskLevel: 'low',
    };

    const categoryPatterns = [
      {
        pattern: /\.(api|routes|endpoints)\./i,
        category: 'api',
        highlight: 'API endpoint changes detected',
        risk: 'high',
      },
      {
        pattern: /auth|login|password|token|jwt|session/i,
        category: 'security',
        highlight: 'Security-sensitive code changes',
        risk: 'critical',
      },
      {
        pattern: /database|migration|schema|model/i,
        category: 'data-integrity',
        highlight: 'Database/data model changes',
        risk: 'high',
      },
      {
        pattern: /component|page|view|ui|layout/i,
        category: 'ux',
        highlight: 'UI/UX component changes',
        risk: 'medium',
      },
      {
        pattern: /service|handler|controller|manager/i,
        category: 'business-logic',
        highlight: 'Business logic changes',
        risk: 'high',
      },
      {
        pattern: /config|settings|env|yaml|json/i,
        category: 'configuration',
        highlight: 'Configuration changes',
        risk: 'medium',
      },
      {
        pattern: /core|base|abstract|interface/i,
        category: 'architecture',
        highlight: 'Core architecture changes',
        risk: 'critical',
      },
      {
        pattern: /agent|workflow|task|orchestrat/i,
        category: 'aiox-core',
        highlight: 'AIOX framework changes',
        risk: 'high',
      },
      {
        pattern: /cache|performance|optimi/i,
        category: 'performance',
        highlight: 'Performance-related changes',
        risk: 'medium',
      },
    ];

    // Analyze each file
    changedFiles.forEach((file) => {
      categoryPatterns.forEach(({ pattern, category, highlight, risk }) => {
        if (pattern.test(file)) {
          if (!analysis.categories[category]) {
            analysis.categories[category] = [];
            analysis.highlights.push(highlight);
          }
          analysis.categories[category].push(file);

          // Update risk level
          if (risk === 'critical') analysis.riskLevel = 'critical';
          else if (risk === 'high' && analysis.riskLevel !== 'critical') {
            analysis.riskLevel = 'high';
          } else if (risk === 'medium' && analysis.riskLevel === 'low') {
            analysis.riskLevel = 'medium';
          }
        }
      });
    });

    return analysis;
  }

  /**
   * Determine primary focus areas
   * @param {Object} fileAnalysis - File analysis results
   * @param {Object} layer2Result - Layer 2 results
   * @returns {Array} Primary focus areas
   */
  determinePrimaryAreas(fileAnalysis, layer2Result) {
    const primary = [];

    // Priority order for categories
    const priorityOrder = [
      'security',
      'architecture',
      'data-integrity',
      'business-logic',
      'api',
    ];

    // Add categories based on file analysis
    priorityOrder.forEach((cat) => {
      if (fileAnalysis.categories[cat]?.length > 0) {
        primary.push({
          area: cat,
          reason: `${fileAnalysis.categories[cat].length} file(s) in ${cat} area modified`,
          files: fileAnalysis.categories[cat].slice(0, 5),
          questions: this.getReviewQuestions(cat),
        });
      }
    });

    // Add areas based on CodeRabbit issues
    const coderabbitResult = layer2Result?.results?.find((r) => r.check === 'coderabbit');
    if (coderabbitResult?.issues) {
      if (coderabbitResult.issues.high > 0) {
        const existingBusinessLogic = primary.find((p) => p.area === 'business-logic');
        if (!existingBusinessLogic) {
          primary.push({
            area: 'code-quality',
            reason: `${coderabbitResult.issues.high} HIGH severity issues from CodeRabbit`,
            questions: [
              'Are the HIGH severity issues acceptable tradeoffs?',
              'Do these issues indicate deeper architectural problems?',
            ],
          });
        }
      }
    }

    // Limit to top 3 primary areas
    return primary.slice(0, 3);
  }

  /**
   * Determine secondary focus areas
   * @param {Object} fileAnalysis - File analysis results
   * @param {Object} layer2Result - Layer 2 results
   * @returns {Array} Secondary focus areas
   */
  determineSecondaryAreas(fileAnalysis, _layer2Result) {
    const secondary = [];

    // Lower priority categories
    const secondaryCategories = ['ux', 'configuration', 'performance', 'aiox-core'];

    secondaryCategories.forEach((cat) => {
      if (fileAnalysis.categories[cat]?.length > 0) {
        secondary.push({
          area: cat,
          reason: `${fileAnalysis.categories[cat].length} file(s) modified`,
          files: fileAnalysis.categories[cat].slice(0, 3),
        });
      }
    });

    // Limit to top 2 secondary areas
    return secondary.slice(0, 2);
  }

  /**
   * Get review questions for a category
   * @param {string} category - Category name
   * @returns {Array} Review questions
   */
  getReviewQuestions(category) {
    const questionBank = {
      security: [
        'Are authentication and authorization properly implemented?',
        'Is sensitive data properly encrypted/protected?',
        'Are there any potential injection vulnerabilities?',
        'Is input validation comprehensive?',
      ],
      architecture: [
        'Does this align with our architectural principles?',
        'Are dependencies properly managed?',
        'Is the separation of concerns maintained?',
        'Will this scale appropriately?',
      ],
      'data-integrity': [
        'Are database migrations reversible?',
        'Is data validation comprehensive?',
        'Are there potential data consistency issues?',
        'Is the schema design appropriate?',
      ],
      'business-logic': [
        'Does this correctly implement the business requirements?',
        'Are edge cases handled appropriately?',
        'Is the logic testable and maintainable?',
        'Are business rules properly enforced?',
      ],
      api: [
        'Is the API design consistent with existing endpoints?',
        'Are breaking changes properly documented?',
        'Is error handling comprehensive?',
        'Is the API versioned appropriately?',
      ],
      ux: [
        'Is the user experience consistent?',
        'Are accessibility requirements met?',
        'Is the interface responsive?',
        'Are error states handled gracefully?',
      ],
      performance: [
        'Are there potential performance bottlenecks?',
        'Is caching used appropriately?',
        'Are expensive operations optimized?',
        'Is the memory footprint acceptable?',
      ],
      'aiox-core': [
        'Does this follow AIOX framework patterns?',
        'Is backward compatibility maintained?',
        'Are agent/task contracts preserved?',
        'Is the change properly documented?',
      ],
    };

    return questionBank[category] || [
      'Is this change necessary and well-implemented?',
      'Are there any potential issues or risks?',
    ];
  }

  /**
   * Generate summary of focus recommendations
   * @param {Object} recommendations - Focus recommendations
   * @returns {string} Summary text
   */
  generateSummary(recommendations) {
    const parts = [];

    if (recommendations.primary.length > 0) {
      parts.push(`Focus on ${recommendations.primary.length} strategic area(s):`);
      recommendations.primary.forEach((p) => {
        parts.push(`  • ${p.area}: ${p.reason}`);
      });
    }

    if (recommendations.highlightedAspects.length > 0) {
      parts.push('\nKey aspects:');
      recommendations.highlightedAspects.forEach((h) => {
        parts.push(`  ⚡ ${h}`);
      });
    }

    parts.push(`\nSkip automated-covered areas: ${recommendations.skip.join(', ')}`);

    return parts.join('\n');
  }

  /**
   * Calculate strategic review priority
   * @param {Object} recommendations - Focus recommendations
   * @returns {string} Priority level (P0, P1, P2)
   */
  calculatePriority(recommendations) {
    const criticalAreas = ['security', 'architecture', 'data-integrity'];
    const highAreas = ['business-logic', 'api'];

    const hasCritical = recommendations.primary.some((p) =>
      criticalAreas.includes(p.area),
    );
    const hasHigh = recommendations.primary.some((p) =>
      highAreas.includes(p.area),
    );

    if (hasCritical) return 'P0';
    if (hasHigh) return 'P1';
    return 'P2';
  }
}

module.exports = { FocusAreaRecommender };
