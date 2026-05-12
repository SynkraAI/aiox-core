/**
 * Parallel Executor
 * Story GEMINI-INT.17 - Multi-Agent Parallel Execution
 *
 * Executes Claude and Gemini in parallel for improved quality and reliability.
 */

const EventEmitter = require('events');

/**
 * Parallel execution modes
 */
const ParallelMode = {
  RACE: 'race', // First successful response wins
  CONSENSUS: 'consensus', // Both must agree
  BEST_OF: 'best-of', // Score and pick best
  MERGE: 'merge', // Combine outputs
  FALLBACK: 'fallback', // Primary with backup
};

class ParallelExecutor extends EventEmitter {
  constructor(config = {}) {
    super();

    this.mode = config.mode || ParallelMode.FALLBACK;
    this.consensusSimilarity = config.consensusSimilarity || 0.85;
    this.timeout = config.timeout || 300000;

    // Track executions
    this.stats = {
      executions: 0,
      consensusAgreements: 0,
      fallbacksUsed: 0,
    };
  }

  /**
   * Execute with both providers in parallel
   * @param {Function} claudeExecutor - Claude execution function
   * @param {Function} geminiExecutor - Gemini execution function
   * @param {Object} options - Execution options
   * @returns {Promise<Object>} Best result based on mode
   */
  async execute(claudeExecutor, geminiExecutor, options = {}) {
    const mode = options.mode || this.mode;
    const startTime = Date.now();

    this.stats.executions++;
    this.emit('parallel_started', { mode });

    // Execute both in parallel
    const results = await Promise.allSettled([
      this._wrapExecution('claude', claudeExecutor),
      this._wrapExecution('gemini', geminiExecutor),
    ]);

    const claudeResult = results[0].status === 'fulfilled' ? results[0].value : null;
    const geminiResult = results[1].status === 'fulfilled' ? results[1].value : null;

    const duration = Date.now() - startTime;

    this.emit('parallel_completed', {
      mode,
      duration,
      claudeSuccess: !!claudeResult?.success,
      geminiSuccess: !!geminiResult?.success,
    });

    // Select result based on mode
    return this._selectResult(mode, claudeResult, geminiResult);
  }

  /**
   * Select result based on execution mode
   */
  _selectResult(mode, claudeResult, geminiResult) {
    switch (mode) {
      case ParallelMode.RACE:
        return this._raceMode(claudeResult, geminiResult);

      case ParallelMode.CONSENSUS:
        return this._consensusMode(claudeResult, geminiResult);

      case ParallelMode.BEST_OF:
        return this._bestOfMode(claudeResult, geminiResult);

      case ParallelMode.MERGE:
        return this._mergeMode(claudeResult, geminiResult);

      case ParallelMode.FALLBACK:
      default:
        return this._fallbackMode(claudeResult, geminiResult);
    }
  }

  /**
   * Race mode - first successful wins
   */
  _raceMode(claude, gemini) {
    // Return first successful
    if (claude?.success) return { ...claude, mode: 'race', selectedProvider: 'claude' };
    if (gemini?.success) return { ...gemini, mode: 'race', selectedProvider: 'gemini' };
    return this._handleBothFailed(claude, gemini);
  }

  /**
   * Consensus mode - both must succeed and agree
   */
  _consensusMode(claude, gemini) {
    if (!claude?.success || !gemini?.success) {
      // Fall back to whichever succeeded
      return this._fallbackMode(claude, gemini);
    }

    // Check similarity
    const similarity = this._calculateSimilarity(claude.output, gemini.output);

    if (similarity >= this.consensusSimilarity) {
      this.stats.consensusAgreements++;
      return {
        ...claude,
        mode: 'consensus',
        consensus: true,
        similarity,
        providers: ['claude', 'gemini'],
      };
    }

    // No consensus - return Claude with warning
    return {
      ...claude,
      mode: 'consensus',
      consensus: false,
      similarity,
      warning: 'Providers did not reach consensus',
    };
  }

  /**
   * Best-of mode - score and pick best
   */
  _bestOfMode(claude, gemini) {
    if (!claude?.success && !gemini?.success) {
      return this._handleBothFailed(claude, gemini);
    }

    if (!claude?.success) return { ...gemini, mode: 'best-of', selectedProvider: 'gemini' };
    if (!gemini?.success) return { ...claude, mode: 'best-of', selectedProvider: 'claude' };

    // Score based on output quality heuristics
    const claudeScore = this._scoreOutput(claude.output);
    const geminiScore = this._scoreOutput(gemini.output);

    const selected = claudeScore >= geminiScore ? claude : gemini;
    const selectedProvider = claudeScore >= geminiScore ? 'claude' : 'gemini';

    return {
      ...selected,
      mode: 'best-of',
      selectedProvider,
      scores: { claude: claudeScore, gemini: geminiScore },
    };
  }

  /**
   * Merge mode - combine outputs
   */
  _mergeMode(claude, gemini) {
    if (!claude?.success && !gemini?.success) {
      return this._handleBothFailed(claude, gemini);
    }

    if (!claude?.success) return { ...gemini, mode: 'merge' };
    if (!gemini?.success) return { ...claude, mode: 'merge' };

    // Simple merge - could be enhanced with semantic merging
    const merged = this._mergeOutputs(claude.output, gemini.output);

    return {
      success: true,
      output: merged,
      mode: 'merge',
      providers: ['claude', 'gemini'],
    };
  }

  /**
   * Fallback mode - primary with backup
   */
  _fallbackMode(claude, gemini) {
    if (claude?.success) {
      return { ...claude, mode: 'fallback', selectedProvider: 'claude' };
    }

    this.stats.fallbacksUsed++;

    if (gemini?.success) {
      return { ...gemini, mode: 'fallback', selectedProvider: 'gemini', usedFallback: true };
    }

    return this._handleBothFailed(claude, gemini);
  }

  /**
   * Handle case where both providers failed
   */
  _handleBothFailed(claude, gemini) {
    return {
      success: false,
      error: 'Both providers failed',
      claudeError: claude?.error,
      geminiError: gemini?.error,
    };
  }

  /**
   * Wrap execution with timeout and error handling
   */
  async _wrapExecution(provider, executor) {
    try {
      const result = await Promise.race([
        executor(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Timeout')), this.timeout),
        ),
      ]);
      return { ...result, provider };
    } catch (error) {
      return { success: false, error: error.message, provider };
    }
  }

  /**
   * Calculate similarity between two outputs (simple)
   */
  _calculateSimilarity(output1, output2) {
    if (!output1 || !output2) return 0;

    const words1 = new Set(output1.toLowerCase().split(/\s+/));
    const words2 = new Set(output2.toLowerCase().split(/\s+/));

    const intersection = new Set([...words1].filter((x) => words2.has(x)));
    const union = new Set([...words1, ...words2]);

    return intersection.size / union.size;
  }

  /**
   * Score output quality (simple heuristics)
   */
  _scoreOutput(output) {
    if (!output) return 0;

    let score = 0;

    // Length (reasonable responses get points)
    if (output.length > 100) score += 1;
    if (output.length > 500) score += 1;

    // Structure (code blocks, lists)
    if (output.includes('```')) score += 2;
    if (output.includes('- ') || output.includes('* ')) score += 1;

    // Completeness indicators
    if (output.includes('done') || output.includes('complete')) score += 1;

    return score;
  }

  /**
   * Merge two outputs (simple concatenation with dedup)
   */
  _mergeOutputs(output1, output2) {
    // Simple merge - in production would use semantic merging
    return `## Claude Response:\n${output1}\n\n## Gemini Response:\n${output2}`;
  }

  /**
   * Get execution statistics
   */
  getStats() {
    return {
      ...this.stats,
      consensusRate:
        this.stats.executions > 0 ? this.stats.consensusAgreements / this.stats.executions : 0,
      fallbackRate:
        this.stats.executions > 0 ? this.stats.fallbacksUsed / this.stats.executions : 0,
    };
  }
}

module.exports = { ParallelExecutor, ParallelMode };
