/**
 * Task Complexity Classifier
 * Story GEMINI-INT.16 - Dynamic Model Switching
 *
 * Classifies task complexity for model selection.
 */

/**
 * Complexity indicators
 */
const COMPLEXITY_INDICATORS = {
  simple: {
    keywords: ['format', 'fix typo', 'rename', 'simple', 'quick', 'minor', 'lint'],
    patterns: [/add\s+console\.log/i, /fix\s+import/i, /update\s+version/i],
    maxLines: 50,
  },
  medium: {
    keywords: ['implement', 'add feature', 'create', 'update', 'modify', 'refactor'],
    patterns: [/add\s+function/i, /create\s+component/i, /implement\s+\w+/i],
    maxLines: 200,
  },
  complex: {
    keywords: [
      'architecture',
      'design',
      'security',
      'optimize',
      'performance',
      'complex',
      'system',
      'integration',
      'migrate',
    ],
    patterns: [/design\s+system/i, /security\s+review/i, /architect/i, /optimize/i],
    minLines: 200,
  },
};

class TaskComplexityClassifier {
  constructor(config = {}) {
    this.thresholds = {
      simple: config.simpleThreshold || 0.3,
      complex: config.complexThreshold || 0.7,
    };
  }

  /**
   * Classify task complexity
   * @param {Object} task - Task to classify
   * @returns {Object} Classification result
   */
  classify(task) {
    const description = (task.description || '').toLowerCase();
    const files = task.files || [];
    const criteria = task.acceptanceCriteria || [];

    const scores = {
      simple: this._scoreLevel('simple', description, files, criteria),
      medium: this._scoreLevel('medium', description, files, criteria),
      complex: this._scoreLevel('complex', description, files, criteria),
    };

    // Calculate weighted score (0-1, higher = more complex)
    const weightedScore = scores.simple * 0 + scores.medium * 0.5 + scores.complex * 1;

    const totalScore = scores.simple + scores.medium + scores.complex;
    const normalizedScore = totalScore > 0 ? weightedScore / totalScore : 0.5;

    // Determine level
    let level = 'medium';
    if (normalizedScore < this.thresholds.simple) {
      level = 'simple';
    } else if (normalizedScore > this.thresholds.complex) {
      level = 'complex';
    }

    return {
      level,
      score: normalizedScore,
      scores,
      confidence: this._calculateConfidence(scores),
    };
  }

  _scoreLevel(level, description, files, criteria) {
    const indicators = COMPLEXITY_INDICATORS[level];
    let score = 0;

    // Check keywords
    for (const keyword of indicators.keywords) {
      if (description.includes(keyword)) {
        score += 1;
      }
    }

    // Check patterns
    for (const pattern of indicators.patterns) {
      if (pattern.test(description)) {
        score += 2;
      }
    }

    // Check file count
    if (level === 'simple' && files.length <= 2) score += 1;
    if (level === 'complex' && files.length >= 5) score += 2;

    // Check criteria count
    if (level === 'simple' && criteria.length <= 3) score += 1;
    if (level === 'complex' && criteria.length >= 7) score += 2;

    return score;
  }

  _calculateConfidence(scores) {
    const total = scores.simple + scores.medium + scores.complex;
    if (total === 0) return 0;

    const max = Math.max(scores.simple, scores.medium, scores.complex);
    return max / total;
  }
}

module.exports = { TaskComplexityClassifier, COMPLEXITY_INDICATORS };
