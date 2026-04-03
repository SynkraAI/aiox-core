/**
 * @module diversity-tracker
 * @description Anti-Echo-Chamber system for HYDRA (Story 3.3).
 * Tracks source diversity, flags content concentration, and applies contrarian bonuses.
 */

/**
 * @typedef {Object} DiversityReport
 * @property {boolean} healthy - Whether source diversity is acceptable
 * @property {string[]} warnings - Diversity warnings
 * @property {Record<string, number>} sourceDistribution - Items per source
 * @property {number} distinctSources - Number of distinct sources
 * @property {string|null} dominantSource - Source exceeding max_source_share
 */

export class DiversityTracker {
  /**
   * @param {Object} [config] - Anti-echo-chamber config from thresholds.yaml
   */
  constructor(config = {}) {
    this.maxSourceShare = config.max_source_share || 0.30;
    this.contrarianBonus = config.contrarian_bonus || 0.5;
    this.checkInterval = config.diversity_check_interval || 50;
    this.minSourcesPerDay = config.min_sources_per_day || 3;
    this.enabled = config.enabled !== false;

    /** @type {Record<string, number>} */
    this.sourceCounts = {};
    this.totalItems = 0;
  }

  /**
   * Record a processed item's source.
   * @param {string} sourceName - Name of the source (feed name, channel, etc.)
   */
  recordSource(sourceName) {
    this.sourceCounts[sourceName] = (this.sourceCounts[sourceName] || 0) + 1;
    this.totalItems++;
  }

  /**
   * Check if diversity is still acceptable.
   * @returns {DiversityReport}
   */
  checkDiversity() {
    if (!this.enabled || this.totalItems < 10) {
      return {
        healthy: true,
        warnings: [],
        sourceDistribution: { ...this.sourceCounts },
        distinctSources: Object.keys(this.sourceCounts).length,
        dominantSource: null,
      };
    }

    const warnings = [];
    let dominantSource = null;

    // Check for source concentration
    for (const [source, count] of Object.entries(this.sourceCounts)) {
      const share = count / this.totalItems;
      if (share > this.maxSourceShare) {
        dominantSource = source;
        warnings.push(
          `Source "${source}" represents ${(share * 100).toFixed(0)}% of content (max: ${(this.maxSourceShare * 100).toFixed(0)}%)`
        );
      }
    }

    // Check minimum source diversity
    const distinctSources = Object.keys(this.sourceCounts).length;
    if (distinctSources < this.minSourcesPerDay) {
      warnings.push(
        `Only ${distinctSources} distinct sources (minimum: ${this.minSourcesPerDay})`
      );
    }

    return {
      healthy: warnings.length === 0,
      warnings,
      sourceDistribution: { ...this.sourceCounts },
      distinctSources,
      dominantSource,
    };
  }

  /**
   * Should a diversity check be triggered now?
   * @returns {boolean}
   */
  shouldCheck() {
    return this.enabled && this.totalItems > 0 && this.totalItems % this.checkInterval === 0;
  }

  /**
   * Apply contrarian bonus to scoring.
   * Content that contradicts or challenges existing KB knowledge gets a bonus.
   * Detection is keyword-based (lightweight heuristic).
   *
   * @param {string} text - Content text
   * @param {number} currentScore - Current weighted score
   * @returns {{ adjustedScore: number, isContrarian: boolean }}
   */
  applyContrarianBonus(text, currentScore) {
    if (!this.enabled || !text) {
      return { adjustedScore: currentScore, isContrarian: false };
    }

    const lower = text.toLowerCase();

    // Contrarian signals
    const contrarianPatterns = [
      /\b(contrary to|despite|however|but actually|myth|misconception|wrong|overrated|overhyped)\b/i,
      /\b(rethink|reconsider|challenge|debunk|unpopular opinion)\b/i,
      /\b(not (what|as|really)|isn't (what|as)|aren't (what|as))\b/i,
      /\b(alternative|counterpoint|dissent|disagree|pushback)\b/i,
    ];

    const contrarianCount = contrarianPatterns.reduce((count, pattern) => {
      const matches = lower.match(new RegExp(pattern.source, 'gi'));
      return count + (matches ? matches.length : 0);
    }, 0);

    // Need at least 2 contrarian signals to qualify
    if (contrarianCount >= 2) {
      return {
        adjustedScore: Math.min(5, currentScore + this.contrarianBonus),
        isContrarian: true,
      };
    }

    return { adjustedScore: currentScore, isContrarian: false };
  }

  /**
   * Get summary for daily digest.
   * @returns {string}
   */
  getSummary() {
    const report = this.checkDiversity();
    const lines = [
      `Sources: ${report.distinctSources} distinct (${this.totalItems} total items)`,
    ];

    if (report.warnings.length > 0) {
      lines.push(`Warnings: ${report.warnings.join('; ')}`);
    }

    // Top 5 sources
    const sorted = Object.entries(this.sourceCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);

    if (sorted.length > 0) {
      lines.push('Top sources: ' + sorted.map(([s, c]) => `${s} (${c})`).join(', '));
    }

    return lines.join('\n');
  }
}
